import {certify} from './coq.js';
import {measure} from './telemetry.js';
// Reuse the runtime, never a consulted program. One job owns the worker at a time.
const queue=[];let worker,active,sequence=0,idleTimer,completed=0;
function releaseWorker(){clearTimeout(idleTimer);worker?.terminate();worker=null;completed=0;}
export function resetProlog(){
 releaseWorker();if(active){clearTimeout(active.timer);active.reject(Error('Prolog check cancelled'));active=null;}
 for(const job of queue.splice(0))job.reject(Error('Prolog check cancelled'));
}
function finish(error,result){
 if(!active)return;const job=active;active=null;clearTimeout(job.timer);
 if(error)releaseWorker();else if(++completed>=128)releaseWorker();
 error?job.reject(error):job.resolve(result);drain();
}
function drain(){
 if(active)return;clearTimeout(idleTimer);
 if(!queue.length){if(worker){idleTimer=setTimeout(releaseWorker,60000);idleTimer.unref?.();}return;}
 active=queue.shift();
 try{
  if(!worker){worker=new Worker('/Experiment/runtime/prolog-worker.js');const owner=worker;worker.onmessage=({data})=>{if(worker!==owner||data.id!==active?.id)return;data.error?finish(Error(data.error)):data.result&&typeof data.result.status==='string'?finish(null,data.result):finish(Error('Invalid local Prolog response'));};worker.onerror=()=>{if(worker===owner)finish(Error('Local Prolog worker failed'));};}
  active.timer=setTimeout(()=>finish(Error('Prolog search timed out')),60000);
  worker.postMessage({id:active.id,source:active.source});
 }catch(error){finish(error);}
}
export async function prolog(source){
 const started=performance.now();let outcome='error',result;
 try{
  if(typeof source!=='string'||!source.trim()||source.length>1000000)throw Error('Prolog requires a bounded generated program');
  if(queue.length>=32)throw Error('Local Prolog queue is full');
  result=await new Promise((resolve,reject)=>{queue.push({id:++sequence,source,resolve,reject});drain();});
  outcome=result.status||'success';return result;
 }finally{measure('prolog',{outcome,seconds:(performance.now()-started)/1000,cold:result?.runtimeCold??null,runtimeLoadSeconds:result?.runtimeLoadSeconds??null,searchSeconds:result?.searchSeconds??null});}
}
if(typeof window!=='undefined')window.addEventListener('pagehide',resetProlog);
export {certify};
