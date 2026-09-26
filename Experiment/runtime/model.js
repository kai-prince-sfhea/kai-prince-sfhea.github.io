import {assetsReady} from './assets.js';
let worker,seq=0,pending,epoch=0,busy=false,releaseLease;
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
 const finish=(error,result)=>{if(pending?.id!==id)return;clearTimeout(pending.timer);pending=null;if(error){dispose();reject(error);}else resolve(result);};
 const timer=setTimeout(()=>finish(Error('Gemma exceeded the five-minute device limit. My draft is kept; I can retry.')),300000);
 pending={id,reject,timer};
 worker.onmessage=({data})=>{
  if(data.id!==id)return;
  if(data.progress){window.dispatchEvent(new CustomEvent('model-progress',{detail:data.progress}));return;}
  finish(data.error?Object.assign(Error(data.error),{code:data.code,diagnostics:data.diagnostics}):null,data.result);
 };
 worker.onerror=e=>finish(Error(e.message));worker.postMessage({id,request});
});}
export async function infer(request,version=epoch){
 if(busy)throw Error('Gemma is already interpreting a thought.');busy=true;
 try{
  if(!(await assetsReady()))throw Error('Install the on-device tools first using Device setup.');checkVersion(version);
  for(let attempt=0;attempt<2;attempt++){
   await acquire(version);checkVersion(version);
   try{return await run(attempt?{...request,options:{...request.options,num_predict:Math.max(1800,request.options?.num_predict||900)}}:request);}
   catch(e){
    checkVersion(version);
    if(e.code!=='incomplete_json'||attempt)throw e;
    window.dispatchEvent(new CustomEvent('model-progress',{detail:'Restarting Gemma after an incomplete response…'}));
   }
  }
 }finally{busy=false;}
}
export function cancel(){epoch++;if(pending){clearTimeout(pending.timer);pending.reject(Error('Interpretation cancelled; my draft is kept.'));pending=null;}dispose();}
