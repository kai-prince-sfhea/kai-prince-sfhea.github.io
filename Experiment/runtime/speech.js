import {SPEECH_BASE,speechStatus} from './speech-assets.js';
export {speechStatus};
let active;
export function cancelSpeech(){active?.();}
export async function speechTask(kind,payload,{signal,onProgress=()=>{}}={}){
 signal?.throwIfAborted();
 if(!navigator.locks?.request)throw Error('This browser cannot coordinate local speech processing.');
 return navigator.locks.request('thread-speech-cpu-cdc6a147cc:'+SPEECH_BASE.pathname,{ifAvailable:true},lock=>{
  signal?.throwIfAborted();
  if(!lock)throw Error('Speech is already processing in another tab.');
  return new Promise((resolve,reject)=>{
   const worker=new Worker(new URL('./speech-worker.js',import.meta.url),{type:'module'});
   let settled=false;const done=(error,result)=>{if(settled)return;settled=true;clearTimeout(timer);worker.terminate();signal?.removeEventListener('abort',cancel);if(active===cancel)active=null;error?reject(error):resolve(result);};
   const cancel=()=>done(new DOMException('Speech cancelled','AbortError'));
   active=cancel;const timer=setTimeout(()=>done(Error('Speech processing timed out. Try a shorter passage.')),180000);
   signal?.addEventListener('abort',cancel,{once:true});
   worker.onerror=e=>done(Error(e.message||'Speech worker could not start.'));
   worker.onmessage=({data})=>{if(data.progress){onProgress(data.progress);return;}done(data.error?Error(data.error):null,data);};
   worker.postMessage({kind,...payload});
  });
 });
}
