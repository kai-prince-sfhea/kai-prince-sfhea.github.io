import {certify} from './coq.js';
export function prolog(source){return new Promise((resolve,reject)=>{
 const w=new Worker('/Experiment/runtime/prolog-worker.js');const t=setTimeout(()=>{w.terminate();reject(Error('Prolog search timed out'));},60000);
 w.onmessage=({data})=>{clearTimeout(t);w.terminate();data.error?reject(Error(data.error)):resolve(data.result);};
 w.onerror=e=>{clearTimeout(t);w.terminate();reject(Error(e.message));};w.postMessage({source});
});}
export {certify};
