import {measure} from './telemetry.js';
import {assetsReady} from './assets.js';
let worker,seq=0,pending,epoch=0,busy=false,releaseLease,retrievalController;
export const cancellationVersion=()=>epoch;
const coordination=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('thread-model-ownership-cdc6a147cc'):null;
function dispose(){worker?.terminate();worker=null;releaseLease?.();releaseLease=null;}
coordination?.addEventListener('message',event=>{if(event.data==='release-idle-model'&&!busy)dispose();});
function checkVersion(version){if(version!==epoch)throw Error('Interpretation cancelled; my draft is kept.');}
async function acquire(version){
 if(worker)return;
 coordination?.postMessage('release-idle-model');
 await new Promise(resolve=>setTimeout(resolve,150));checkVersion(version);
 if(!navigator.locks)throw Error('This browser needs Web Locks to coordinate Gemma safely. Use an up-to-date supported browser.');
 const granted=await new Promise((resolve,reject)=>{
  navigator.locks.request('thread-gemma-gpu-cdc6a147cc',{ifAvailable:true},async lock=>{
   if(!lock){resolve(false);return;}
   const held=new Promise(done=>releaseLease=done);resolve(true);await held;
  }).catch(reject);
 });
 if(!granted)throw Error('Gemma is running in another Thread tab. Finish or cancel that interpretation, then retry here.');
 try{checkVersion(version);worker=new Worker('/Experiment/runtime/model-loader.js');}catch(e){dispose();throw e;}
}
function run(request){return new Promise((resolve,reject)=>{
 const id=++seq;
 const finish=(error,result)=>{if(pending?.id!==id)return;clearTimeout(pending.timer);pending=null;if(error){if(!['schema_error','incomplete_json'].includes(error.code))dispose();reject(error);}else resolve(result);};
 const timer=setTimeout(()=>finish(Error('Gemma exceeded the five-minute device limit. My draft is kept; I can retry.')),300000);
 pending={id,reject,timer};
 worker.onmessage=({data})=>{
  if(data.id!==id)return;
  if(data.progress){window.dispatchEvent(new CustomEvent('model-progress',{detail:data.progress}));return;}
  finish(data.error?Object.assign(Error(data.error),{code:data.code,diagnostics:data.diagnostics,validation:data.validation,metrics:data.metrics}):null,data.result);
 };
 worker.onerror=e=>finish(Error(e.message));worker.postMessage({id,request});
});}
export async function infer(request,version=epoch){
 const started=performance.now(),fixedRequest=request;let retries=0,outcome='error';
 if(busy)throw Error('Gemma is already interpreting a thought.');busy=true;
 try{
  if(!(await assetsReady()))throw Error('Install the on-device tools first using Device setup.');checkVersion(version);
  if(request.example_selection?.replace_pair===5){
   retrievalController=new AbortController();
   try{const {augmentRequest}=await import('./example-retrieval.js');request=await augmentRequest(request,{signal:retrievalController.signal});}
   catch{/* The fixed demonstrations remain available if optional retrieval cannot load. */}
   finally{retrievalController=null;}checkVersion(version);
  }
  let correction;
  for(let attempt=0;attempt<2;attempt++){
   await acquire(version);checkVersion(version);
   try{const result=await run(attempt?{...request,correction,options:{...request.options,num_predict:Math.max(1800,request.options?.num_predict||900)}}:request);measure(request.warmup?'model_warmup':result.metrics?.cold?'model_cold':'model_warm',{outcome:'success',seconds:(performance.now()-started)/1000,retries,...result.metrics});outcome='success';return result;}
   catch(e){
    checkVersion(version);
    measure('model_attempt',{outcome:e.code||'runtime_error',seconds:e.metrics?.seconds??(performance.now()-started)/1000,attempt:attempt+1,field:e.validation?.field??null,outputCharacters:e.diagnostics?.characters??null,channelCharacters:e.diagnostics?.channels??null,...e.metrics});
    if(!['incomplete_json','schema_error'].includes(e.code)||attempt)throw e;
    retries++;correction=e.validation;
    if(request.retrieval){measure('example_selection',{outcome:'fallback',mode:request.retrieval.mode,seconds:0,reason:'format-retry-fixed',selector:request.retrieval.selector});request=fixedRequest;}
    window.dispatchEvent(new CustomEvent('model-progress',{detail:'Retrying the interpretation format once; my thought stays unchanged…'}));
   }
  }
 }catch(e){outcome=e.code||'runtime_error';throw e;}finally{measure('model_call',{outcome,seconds:(performance.now()-started)/1000,retries,warmup:!!request.warmup});busy=false;}
}
export function cancel(){epoch++;retrievalController?.abort();if(pending){clearTimeout(pending.timer);pending.reject(Error('Interpretation cancelled; my draft is kept.'));pending=null;}dispose();}
export const warmup=()=>infer({warmup:true});
