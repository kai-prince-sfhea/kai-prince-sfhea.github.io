// Optional encoder assets are separate from the required reasoning tools.
// Only the explicit installer fetches weights; inference reads verified local data.
export const EMBEDDING_CACHE='thread-embedding-v1-cdc6a147cc';
export const EMBEDDING_BASE=new URL('../',import.meta.url);
const revision='5090578d9565bb06545b4552f76e6bc2c93e4a66';
const upstream='https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX/resolve/'+revision+'/';
const records=[
 ['onnx/model_q4.onnx',519322,'ad1dfee81a70f7944b9b9d1cc6e48075b832881cf33fab2f2b248be78f3f0043'],
 ['onnx/model_q4.onnx_data',196725760,'599962c3143b040de2dd05e5975be3e9091dd067cacc6a8f7186e3203bab9e02'],
 ['tokenizer.json',20323312,'4dda02faaf32bc91031dc8c88457ac272b00c1016cc679757d1c441b248b9c47'],
 ['tokenizer_config.json',1156830,'3ca953eea6c3c9fcda9cf3df22949ff18b216f7c74bd6459230f3f1013953f3a'],
 ['config.json',1765,'6e1f06404b7163e0325ed2ea3e6781cde50f4a50b31780a95ad0d30e8404d77b'],
 ['generation_config.json',133,'1fb1efd221c1ca88a736d1b36cb47d754c177677e222acb3b1e5424c5d664870'],
 ['special_tokens_map.json',662,'2f7b0adf4fb469770bb1490e3e35df87b1dc578246c5e7e6fc76ecf33213a397'],
];
const runtime=[
 ['transformers.min.js',888173,'aa5002b70e789798da263f5f99c62bd3e8fcd0c119258a493c40c180648365fa'],
 ['ort-wasm-simd-threaded.jsep.mjs',44484,'08fb86ec433c78bfb032c5d84a68b8e8e5a8d81268fa39e24314179a5767a5b9'],
 ['ort-wasm-simd-threaded.jsep.wasm',21596019,'c46655e8a94afc45338d4cb2b840475f88e5012d524509916e505079c00bfa39'],
];
export const EMBEDDING_FILES=Object.freeze([
 ...records.map(([name,bytes,sha256])=>({name,bytes,sha256,url:upstream+name,local:new URL('embedding-model/embeddinggemma/'+name,EMBEDDING_BASE).href})),
 ...runtime.map(([name,bytes,sha256])=>({name,bytes,sha256,url:new URL('vendor/transformers/'+name,EMBEDDING_BASE).href,local:new URL('vendor/transformers/'+name,EMBEDDING_BASE).href})),
].map(Object.freeze));
export const EMBEDDING_MODEL=Object.freeze({id:'embeddinggemma',name:'EmbeddingGemma 300M · Q4 · CPU',revision,dimensions:256,nativeDimensions:768,maxTokens:128,contextTokens:2048,bytes:EMBEDDING_FILES.reduce((n,f)=>n+f.bytes,0),license:'Gemma',licenseUrl:'https://ai.google.dev/gemma/terms',runtime:'Transformers.js 3.8.1 / ONNX Runtime Web 1.22.0-dev.20250409-89f8206ba4'});
const receiptKey=new URL('__embedding-installation',EMBEDDING_BASE).href;
const fingerprint=EMBEDDING_FILES.map(f=>f.sha256).join(':');
let installing=false;
export async function embeddingStatus(){
 const base={ready:false,bytes:0,totalBytes:EMBEDDING_MODEL.bytes,model:EMBEDDING_MODEL.name,revision};
 if(typeof caches==='undefined')return base;
 try{
  const cache=await caches.open(EMBEDDING_CACHE),receipt=await(await cache.match(receiptKey))?.json();let complete=true;
  for(const f of EMBEDDING_FILES){const response=await cache.match(f.local);if(response?.headers.get('X-Thread-SHA256')===f.sha256&&Number(response.headers.get('Content-Length'))===f.bytes)base.bytes+=f.bytes;else complete=false;}
  return {...base,ready:complete&&receipt?.complete===true&&receipt.fingerprint===fingerprint};
 }catch{return base;}
}
async function allowDownload(){
 const controller=navigator.serviceWorker?.controller;if(!controller)return;
 const channel=new MessageChannel();await new Promise((resolve,reject)=>{
  const done=error=>{clearTimeout(timer);channel.port1.close();error?reject(error):resolve();};
  const timer=setTimeout(()=>done(Error('Reload this page to enable the optional embedding download.')),5000);
  channel.port1.onmessage=event=>done(event.data?.ok===true?null:Error('The optional model download was not allowed.'));
  controller.postMessage({type:'allow-embedding-download',revision},[channel.port2]);
 });
}
async function checkStream(response,file,createSHA256,signal){
 if(!response?.ok||!response.body)throw Error('Embedding download failed: '+file.name);
 const hash=await createSHA256();hash.init();const reader=response.body.getReader();let count=0;
 try{while(true){signal?.throwIfAborted();const {done,value}=await reader.read();if(done)break;count+=value.byteLength;if(count>file.bytes)throw Error('Embedding file exceeds its expected size.');hash.update(value);}if(count!==file.bytes||hash.digest('hex')!==file.sha256)throw Error('Embedding integrity check failed: '+file.name);}
 catch(e){await reader.cancel().catch(()=>{});throw e;}finally{reader.releaseLock();}
}
// Stream into a private staging cache so a large model is not duplicated in a
// JavaScript ArrayBuffer. Publish the cache entry only after size + SHA256 pass.
async function downloadFile(file,cache,staging,createSHA256,signal,onBytes){
 const response=await fetch(file.url,{signal,credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok||!response.body)throw Error('Embedding download failed: '+file.name+' ('+response.status+').');
 const hash=await createSHA256();hash.init();const reader=response.body.getReader();let count=0,verified=false;
 const stream=new ReadableStream({
  async pull(controller){try{
   signal?.throwIfAborted();const {done,value}=await reader.read();
   if(done){if(count!==file.bytes||hash.digest('hex')!==file.sha256)throw Error('Embedding integrity check failed: '+file.name);verified=true;controller.close();return;}
   count+=value.byteLength;if(count>file.bytes)throw Error('Embedding file exceeds its expected size.');hash.update(value);onBytes(count);controller.enqueue(value);
  }catch(error){await reader.cancel().catch(()=>{});controller.error(error);}},
  cancel:reason=>reader.cancel(reason),
 });
 const mime=file.name.endsWith('.wasm')?'application/wasm':/\.m?js$/.test(file.name)?'text/javascript':file.name.endsWith('.json')?'application/json':'application/octet-stream';
 try{
  await staging.put(file.local,new Response(stream,{headers:{'Content-Type':mime,'Content-Length':String(file.bytes),'X-Thread-SHA256':file.sha256}}));
  if(!verified)throw Error('Embedding download was not completely verified.');
  signal?.throwIfAborted();await cache.put(file.local,await staging.match(file.local));
 }finally{await reader.cancel().catch(()=>{});reader.releaseLock();await staging.delete(file.local);}
}
export async function installEmbeddings({consent=false,signal,onProgress=()=>{}}={}){
 if(consent!==true)throw Error('Consent is required before downloading the optional embedding model.');
 if(installing)throw Error('An embedding tools download is already running.');
 installing=true;
 const run=async()=>{
  signal?.throwIfAborted();if(typeof caches==='undefined'||typeof WebAssembly==='undefined')throw Error('Offline storage and WebAssembly are required for embeddings.');
  await allowDownload();await navigator.storage?.persist?.();
  const stagePrefix='thread-embedding-stage:'+EMBEDDING_BASE.pathname+':';
  // An interrupted tab can leave a completed staging response behind. The
  // per-app install lock makes it safe to reclaim only this app's staging data.
  for(const name of await caches.keys())if(name.startsWith(stagePrefix))await caches.delete(name);
  const status=await embeddingStatus(),estimate=await navigator.storage?.estimate?.();
  // Cache publication can coexist with a complete staging response. Reserve
  // one largest file as well as remaining assets and working headroom.
  const needed=EMBEDDING_MODEL.bytes-status.bytes+Math.max(...EMBEDDING_FILES.map(f=>f.bytes))+50000000;
  if(Number.isFinite(estimate?.quota)&&Number.isFinite(estimate?.usage)&&estimate.quota-estimate.usage<needed)throw Error('More browser storage is needed for the optional embedding model.');
  const cache=await caches.open(EMBEDDING_CACHE),stageName=stagePrefix+crypto.randomUUID(),staging=await caches.open(stageName);
  let completed=0;
  try{
   await cache.put(receiptKey,new Response(JSON.stringify({complete:false,revision})));
   const {createSHA256}=await import(new URL('../vendor/hash-wasm/dist/index.esm.js',import.meta.url).href);
   for(const file of EMBEDDING_FILES){
    signal?.throwIfAborted();let valid=false;const stored=await cache.match(file.local);
    if(stored){try{await checkStream(stored,file,createSHA256,signal);valid=true;}catch{signal?.throwIfAborted();}}
    if(!valid)await downloadFile(file,cache,staging,createSHA256,signal,done=>onProgress({phase:'Optional embedding tools',file:file.name,done:completed+done,total:EMBEDDING_MODEL.bytes}));
    completed+=file.bytes;onProgress({phase:'Optional embedding tools',file:file.name,done:completed,total:EMBEDDING_MODEL.bytes});
   }
   await cache.put(receiptKey,new Response(JSON.stringify({complete:true,revision,fingerprint,at:new Date().toISOString()})));
   return embeddingStatus();
  }finally{await caches.delete(stageName);}
 };
 try{
  if(navigator.locks?.request)return await navigator.locks.request('thread-embedding-install-cdc6a147cc:'+EMBEDDING_BASE.pathname,{ifAvailable:true},lock=>{if(!lock)throw Error('An embedding download is running in another tab.');return run();});
  throw Error('Web Locks are required to coordinate optional encoder installation across tabs.');
 }finally{installing=false;}
}
