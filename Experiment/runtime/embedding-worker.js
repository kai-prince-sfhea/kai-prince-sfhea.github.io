import {AutoTokenizer,AutoModel,env} from '../vendor/transformers/transformers.min.js';
import {EMBEDDING_BASE,EMBEDDING_CACHE,EMBEDDING_FILES,EMBEDDING_MODEL,embeddingStatus} from './embedding-assets.js';
let encoder,tokenizer,initializing,busy=false;
const prefixes=Object.freeze({similarity:'task: sentence similarity | query: ',query:'task: search result | query: ',document:'title: none | text: '});
async function initialize(){
 if(!(await embeddingStatus()).ready)throw Error('Install the optional embedding tools first.');
 const cache=await caches.open(EMBEDDING_CACHE),configFile=EMBEDDING_FILES.find(f=>f.name==='config.json');
 const config=await(await cache.match(configFile.local)).json();
 if(config.model_type!=='gemma3_text'||config.hidden_size!==768||config.vocab_size!==262144||config.use_bidirectional_attention!==true||config.max_position_embeddings!==2048||config['transformers.js_config']?.use_external_data_format?.['model_q4.onnx']!==1)throw Error('Unexpected embedding model configuration.');
 env.allowRemoteModels=false;env.allowLocalModels=true;env.useBrowserCache=false;env.useFSCache=false;env.useCustomCache=true;
 env.localModelPath=new URL('embedding-model/',EMBEDDING_BASE).href;
 const allowed=new Set(EMBEDDING_FILES.map(f=>f.local));
 env.customCache={match:async request=>{const key=typeof request==='string'?request:request.url;return allowed.has(key)?(await cache.match(key))??undefined:undefined;},put:async()=>{throw Error('Unverified embedding assets cannot be cached during inference.');}};
 env.backends.onnx.wasm.numThreads=1;
 env.backends.onnx.wasm.proxy=false;
 env.backends.onnx.wasm.wasmPaths=new URL('vendor/transformers/',EMBEDDING_BASE).href;
 // Keep model initialization sequential: the tokenizer and ONNX external weights
 // already coexist in memory; parallel loads would increase the cold-load peak.
 tokenizer=await AutoTokenizer.from_pretrained(EMBEDDING_MODEL.id,{local_files_only:true});
 encoder=await AutoModel.from_pretrained(EMBEDDING_MODEL.id,{device:'wasm',dtype:'q4',local_files_only:true});
}
function normalizedVector(values){
 if(values.length!==EMBEDDING_MODEL.nativeDimensions||values.some(n=>!Number.isFinite(n)))throw Error('The embedding model returned an invalid vector.');
 // MRL supports 768,512,256,128 dimensions. Preserve the model's dense layers
 // through sentence_embedding, then truncate to256 and normalize again.
 const vector=values.slice(0,EMBEDDING_MODEL.dimensions),norm=Math.sqrt(vector.reduce((n,v)=>n+v*v,0));
 if(!Number.isFinite(norm)||norm<1e-12)throw Error('The embedding model returned an empty vector.');
 return vector.map(v=>v/norm);
}
self.onmessage=async({data:{id,texts,roles}})=>{
 if(busy){postMessage({id,error:'The embedding worker is busy.'});return;}busy=true;
 const started=performance.now(),cold=!encoder;let loadSeconds=0;
 try{
  if(!Array.isArray(texts)||texts.length<1||texts.length>16||texts.some(t=>typeof t!=='string'||!t.trim()||t.length>8192)||texts.reduce((n,t)=>n+t.length,0)>32768)throw Error('Embedding input exceeds the bounded text batch.');
  if(!Array.isArray(roles)||roles.length!==texts.length||roles.some(role=>!Object.hasOwn(prefixes,role)))throw Error('Unknown embedding task.');
  await(initializing??=initialize());loadSeconds=(performance.now()-started)/1000;
  const embeddings=[],inputTokens=[],truncated=[],encodeStarted=performance.now();
  // One sentence at a time bounds attention tensors on mobile devices. This is
  // an encoder hint, never interpretation/proof evidence or a learner claim.
  for(let i=0;i<texts.length;i++){
   const input=prefixes[roles[i]]+texts[i];
   const untruncated=tokenizer(input,{padding:false,truncation:false,return_tensor:false});
   const count=untruncated.input_ids.length;inputTokens.push(count);truncated.push(count>EMBEDDING_MODEL.maxTokens);
   const tokens=tokenizer(input,{padding:true,truncation:true,max_length:EMBEDDING_MODEL.maxTokens});
   const output=await encoder(tokens),sentence=output.sentence_embedding;
   if(!sentence||sentence.dims.length!==2||sentence.dims[0]!==1||sentence.dims[1]!==EMBEDDING_MODEL.nativeDimensions)throw Error('The embedding model did not return its sentence projection.');
   embeddings.push(normalizedVector(Array.from(sentence.data)));
   // CPU outputs own ArrayBuffers, but dispose if a future runtime allocates a
   // native tensor. The resident model is released by manager worker termination.
   for(const tensor of Object.values(output))tensor?.dispose?.();
  }
  postMessage({id,result:{embeddings,dimensions:EMBEDDING_MODEL.dimensions,inputTokens,truncated,maxTokens:EMBEDDING_MODEL.maxTokens,roles,model:EMBEDDING_MODEL.id,revision:EMBEDDING_MODEL.revision,metrics:{cold,loadSeconds,encodeSeconds:(performance.now()-encodeStarted)/1000,seconds:(performance.now()-started)/1000,device:'wasm',threads:1}}});
 }catch{postMessage({id,error:'Local embedding could not finish. Continue with the full interpretation.',code:'embedding_unavailable',metrics:{cold,loadSeconds,seconds:(performance.now()-started)/1000}});}
 finally{busy=false;}
};
