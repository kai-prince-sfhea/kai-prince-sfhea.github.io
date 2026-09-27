import {get,put} from './store.js';
import {measure} from './telemetry.js';
import {embedTexts,disposeEmbeddings} from './embedding.js';
import {embeddingStatus,EMBEDDING_MODEL} from './embedding-assets.js';
import {SELECTOR_VERSION,validateCorpus,coverage,embeddingText,rankExamples,eligibleRequest} from './example-selection.js';
let corpusPromise,indexPromise;
const validVectors=(vectors,count)=>Array.isArray(vectors)&&vectors.length===count&&vectors.every(v=>Array.isArray(v)&&v.length===EMBEDDING_MODEL.dimensions&&v.every(Number.isFinite)&&Math.abs(Math.hypot(...v)-1)<=0.001);
const completeInputs=(value,count)=>Array.isArray(value.truncated)&&value.truncated.length===count&&value.truncated.every(x=>x===false)&&Array.isArray(value.inputTokens)&&value.inputTokens.length===count&&value.inputTokens.every(n=>Number.isSafeInteger(n)&&n>0&&n<=EMBEDDING_MODEL.maxTokens);
const compatibleRuntime=runtime=>runtime?.name===EMBEDDING_MODEL.runtime&&runtime.model===EMBEDDING_MODEL.id&&runtime.dtype==='q4'&&runtime.device==='wasm'&&runtime.threads===1&&runtime.nativeDimensions===EMBEDDING_MODEL.nativeDimensions&&runtime.output==='sentence_embedding'&&runtime.projection==='first256 MRL dimensions, then L2 normalization'&&runtime.prefix==='task: sentence similarity | query: '&&runtime.selectorVersion===SELECTOR_VERSION&&runtime.embeddingText==='example.input';
export const retrievalMode=async()=>['lexical','semantic'].includes(await get('example-selection-mode'))?await get('example-selection-mode'):'fixed';
export async function setRetrievalMode(mode){if(!['fixed','lexical','semantic'].includes(mode))throw Error('Unknown example selection mode');if(mode==='semantic'&&!(await embeddingStatus()).ready)throw Error('Download the optional encoder first.');await put('example-selection-mode',mode);if(mode!=='semantic')disposeEmbeddings();}
export async function exampleCorpus(){
 if(!corpusPromise)corpusPromise=(async()=>{const r=await fetch('/Experiment/data/reasoning-examples.json');if(!r.ok)throw Error('Example library unavailable');const text=await r.text();if(text.length>1000000)throw Error('Example library too large');const corpus=validateCorpus(JSON.parse(text));const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');return {corpus,hash,coverage:coverage(corpus)};})().catch(e=>{corpusPromise=null;throw e;});
 return corpusPromise;
}
export async function prepareExampleIndex({signal,onProgress=()=>{},prepare=true}={}){
 if(!indexPromise)indexPromise=(async()=>{
  if(!(await embeddingStatus()).ready)throw Error('Optional encoder not installed');
  const {corpus,hash}=await exampleCorpus(),key='example-vectors:v2:'+SELECTOR_VERSION+':'+EMBEDDING_MODEL.revision+':'+EMBEDDING_MODEL.dimensions+':'+EMBEDDING_MODEL.maxTokens+':'+EMBEDDING_MODEL.runtime+':'+hash,existing=await get(key);
  const valid=x=>validVectors(x,corpus.examples.length);
  if(valid(existing))return {vectors:existing,hash};
  // Public, pinned corpus vectors remove repeated corpus inference from each
  // device's setup. Learner-query vectors are always computed locally and never
  // written to the index. Stale or incompatible build artifacts are ignored.
  try{
   const response=await fetch('/Experiment/data/reasoning-example-vectors.json',{signal});
   if(response.ok){const bundle=await response.json();if(bundle.schemaVersion===1&&bundle.corpusHash===hash&&bundle.modelRevision===EMBEDDING_MODEL.revision&&bundle.dimensions===EMBEDDING_MODEL.dimensions&&bundle.maxTokens===EMBEDDING_MODEL.maxTokens&&bundle.task==='similarity'&&compatibleRuntime(bundle.runtime)&&JSON.stringify(bundle.exampleIds)===JSON.stringify(corpus.examples.map(e=>e.id))&&completeInputs(bundle,corpus.examples.length)&&valid(bundle.vectors)){await put(key,bundle.vectors);onProgress({done:bundle.vectors.length,total:bundle.vectors.length});return {vectors:bundle.vectors,hash,source:'bundled'};}}
  }catch{if(signal?.aborted)throw new DOMException('Cancelled','AbortError');}
  if(!prepare)throw Error('Prepare the example index in Device setup before using semantic selection.');
  const vectors=[];
  for(let i=0;i<corpus.examples.length;i+=8){if(signal?.aborted)throw new DOMException('Cancelled','AbortError');onProgress({done:i,total:corpus.examples.length});const batch=corpus.examples.slice(i,i+8);const result=await embedTexts(batch.map(embeddingText),{signal});if(result.dimensions!==EMBEDDING_MODEL.dimensions||result.maxTokens!==EMBEDDING_MODEL.maxTokens||result.revision!==EMBEDDING_MODEL.revision||!completeInputs(result,batch.length)||!validVectors(result.embeddings,batch.length))throw Error('Encoder returned an incomplete or incompatible example index');vectors.push(...result.embeddings);}
  if(!valid(vectors))throw Error('Encoder returned an invalid index');await put(key,vectors);onProgress({done:vectors.length,total:vectors.length});return {vectors,hash};
 })().catch(e=>{indexPromise=null;throw e;});return indexPromise;
}
export async function augmentRequest(request,{mode,signal}={}){
 if(!eligibleRequest(request))return request;
 mode??=await retrievalMode();if(mode==='fixed')return request;
 const started=performance.now();let outcome='fallback',selected=null,reason='no-compatible-example',encoderMetrics;
 try{
  const {corpus,hash}=await exampleCorpus(),query=JSON.parse(request.messages.at(-1).content).current_thought;
  const original=request.messages.slice(5,7).reduce((n,m)=>n+m.content.length,0),options={mode,hasDependencies:!!request.format.properties.depends_on,maxCharacters:Math.min(1100,original)};
  if(mode==='semantic'){
   if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('model-progress',{detail:'Selecting a local example; my thought stays unchanged…'}));
   const index=await prepareExampleIndex({signal,prepare:false}),result=await embedTexts([query],{signal});
   encoderMetrics=result.metrics;
   // A truncated thought must not be matched as if it were the complete thought.
   if(result.truncated?.[0]){reason='query-exceeds-encoder-window';return request;}
   options.vectors=index.vectors;options.queryVector=result.embeddings[0];
  }
  selected=rankExamples(corpus,query,options);if(!selected)return request;
  const messages=structuredClone(request.messages);messages.splice(5,2,...selected.pair);outcome='selected';
  return {...request,messages,retrieval:{selector:SELECTOR_VERSION,mode,corpusHash:hash,exampleIds:[selected.id],profile:selected.expertise,savedCharacters:original-selected.characters}};
 }catch(e){reason=e.name==='AbortError'?'cancelled':'encoder-or-corpus-unavailable';return request;}
 finally{measure('example_selection',{outcome,mode,seconds:(performance.now()-started)/1000,selector:SELECTOR_VERSION,exampleId:selected?.id??null,approach:selected?.approach??null,reason:outcome==='fallback'?reason:null,encoderLoadSeconds:encoderMetrics?.loadSeconds??null,encoderSeconds:encoderMetrics?.encodeSeconds??null});}
}
