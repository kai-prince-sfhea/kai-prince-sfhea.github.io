import {embeddingStatus,EMBEDDING_BASE,EMBEDDING_MODEL} from './embedding-assets.js';
import {measure} from './telemetry.js';
export {EMBEDDING_MODEL,embeddingStatus,installEmbeddings} from './embedding-assets.js';
let worker,pending,sequence=0,idleTimer,releaseLease,busy=false,epoch=0;
const ownership=typeof BroadcastChannel==='undefined'?null:new BroadcastChannel('thread-embedding-ownership:'+EMBEDDING_BASE.pathname);
function clearWorker(){clearTimeout(idleTimer);worker?.terminate();worker=null;releaseLease?.();releaseLease=null;}
ownership?.addEventListener('message',event=>{if(event.data==='release-idle-encoder'&&!busy)clearWorker();});
export function disposeEmbeddings(){
 epoch++;
 if(pending){clearTimeout(pending.timer);pending.reject(Error('Embedding cancelled; use the full interpretation.'));pending=null;}
 clearWorker();
}
const checkVersion=version=>{if(version!==epoch)throw Error('Embedding cancelled; use the full interpretation.');};
async function acquire(version){
 if(worker)return;
 ownership?.postMessage('release-idle-encoder');
 // Give another page one event-loop turn to release an idle model.
 await new Promise(resolve=>setTimeout(resolve,50));
 checkVersion(version);
 if(navigator.locks?.request){
  const granted=await new Promise((resolve,reject)=>navigator.locks.request('thread-embedding-encoder:'+EMBEDDING_BASE.pathname,{ifAvailable:true},async lock=>{
   if(!lock){resolve(false);return;}const held=new Promise(done=>releaseLease=done);resolve(true);await held;
  }).catch(reject));
  if(!granted)throw Error('The embedding model is busy in another tab. Use the full interpretation.');
 }
 try{checkVersion(version);worker=new Worker(new URL('./embedding-worker.js',import.meta.url),{type:'module'});}catch(e){clearWorker();throw e;}
}
export async function embedTexts(texts,options={}){
 const started=performance.now();let result,outcome='error';
 try{result=await encodeTexts(texts,options);outcome='success';return result;}
 catch(error){if(options?.signal?.aborted)outcome='cancelled';throw error;}
 finally{measure('embedding',{outcome,seconds:(performance.now()-started)/1000,batchSize:Array.isArray(texts)&&texts.length<=16?texts.length:null,cold:typeof result?.metrics?.cold==='boolean'?result.metrics.cold:null,loadSeconds:Number.isFinite(result?.metrics?.loadSeconds)?result.metrics.loadSeconds:null,encodeSeconds:Number.isFinite(result?.metrics?.encodeSeconds)?result.metrics.encodeSeconds:null});}
}
async function encodeTexts(texts,{signal,role='similarity',roles}={}){
 if(busy)throw Error('The embedding model is busy. Use the full interpretation.');
 if(!Array.isArray(texts)||texts.length<1||texts.length>16||texts.some(t=>typeof t!=='string'||!t.trim()||t.length>8192)||texts.reduce((n,t)=>n+t.length,0)>32768)throw Error('Embedding needs1–16 bounded text strings.');
 const tasks=roles??texts.map(()=>role);
 if(!Array.isArray(tasks)||tasks.length!==texts.length||tasks.some(r=>!['similarity','query','document'].includes(r)))throw Error('Unknown embedding task.');
 busy=true;clearTimeout(idleTimer);const version=epoch;
 try{
  signal?.throwIfAborted();if(!(await embeddingStatus()).ready)throw Error('Optional embedding tools are not installed.');
  signal?.throwIfAborted();checkVersion(version);await acquire(version);signal?.throwIfAborted();checkVersion(version);
  return await new Promise((resolve,reject)=>{
   const id=++sequence;
   const finish=(error,result)=>{if(pending?.id!==id)return;clearTimeout(pending.timer);signal?.removeEventListener('abort',abort);pending=null;if(error){clearWorker();reject(error);}else resolve(result);};
   const abort=()=>finish(Error('Embedding cancelled; use the full interpretation.'));
   const timer=setTimeout(()=>finish(Error('Local embedding timed out. Use the full interpretation.')),120000);
   pending={id,reject:error=>{signal?.removeEventListener('abort',abort);reject(error);},timer};
   signal?.addEventListener('abort',abort,{once:true});
   worker.onmessage=({data})=>{if(data.id!==id)return;
    const r=data.result;
    if(data.error){finish(Object.assign(Error(data.error),{code:data.code}));return;}
    if(!r||r.dimensions!==EMBEDDING_MODEL.dimensions||r.embeddings?.length!==texts.length||r.embeddings.some(v=>!Array.isArray(v)||v.length!==EMBEDDING_MODEL.dimensions||v.some(n=>!Number.isFinite(n))||Math.abs(Math.hypot(...v)-1)>0.001)||r.truncated?.length!==texts.length||r.truncated.some(v=>typeof v!=='boolean')||r.inputTokens?.length!==texts.length||r.inputTokens.some(n=>!Number.isSafeInteger(n)||n<1)||r.maxTokens!==EMBEDDING_MODEL.maxTokens){finish(Error('Invalid local embedding response.'));return;}
    finish(null,r);
   };
   worker.onerror=()=>finish(Error('Local embedding is unavailable. Use the full interpretation.'));
   worker.postMessage({id,texts:[...texts],roles:[...tasks]});
  });
 }catch(e){if(signal?.aborted)clearWorker();throw e;}
 finally{busy=false;if(worker){idleTimer=setTimeout(clearWorker,60000);idleTimer.unref?.();}}
}
