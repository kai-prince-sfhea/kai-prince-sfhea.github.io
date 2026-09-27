import {measure} from './telemetry.js';
let worker,seq=0;const requests=new Map();
export function resetCompiler(){if(requests.size)throw Error('Compiler is busy');worker?.terminate();worker=null;}
export async function compile(payload){
 const started=performance.now();let outcome='error';try{
 if(!worker){worker=new Worker('/Experiment/runtime/compiler-worker.js',{type:'module'});worker.onmessage=({data})=>{const r=requests.get(data.id);if(r){clearTimeout(r.timer);requests.delete(data.id);data.error?r.reject(Error(data.error)):r.resolve(data.result);}};worker.onerror=e=>{for(const r of requests.values()){clearTimeout(r.timer);r.reject(Error(e.message));}requests.clear();worker.terminate();worker=null;};}
 const result=await new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{requests.delete(id);reject(Error('Logic compiler timed out'));},90000);requests.set(id,{resolve,reject,timer});worker.postMessage({id,payload});});outcome='success';return result;
 }finally{measure('compiler',{operation:payload.op,outcome,seconds:(performance.now()-started)/1000});}
}
