import {certify} from './coq.js';
import {measure} from './telemetry.js';
export async function prolog(source){const started=performance.now();let outcome='error';try{const result=await new Promise((resolve,reject)=>{
 const w=new Worker('/Experiment/runtime/prolog-worker.js');const t=setTimeout(()=>{w.terminate();reject(Error('Prolog search timed out'));},60000);
 w.onmessage=({data})=>{clearTimeout(t);w.terminate();data.error?reject(Error(data.error)):resolve(data.result);};
 w.onerror=e=>{clearTimeout(t);w.terminate();reject(Error(e.message));};w.postMessage({source});
});outcome=result.status||'success';return result;}finally{measure('prolog',{outcome,seconds:(performance.now()-started)/1000});}}
export {certify};
