// Pinned optional speech pack. Downloads require explicit per-device consent.
export const SPEECH_CACHE='thread-speech-v1-cdc6a147cc';
export const SPEECH_BASE=new URL('../',import.meta.url);
const manifest=await(await fetch(new URL('data/speech-assets.json',SPEECH_BASE))).json();
export const SPEECH_FILES=Object.freeze(manifest.files.map(f=>Object.freeze({...f,url:f.url||new URL(f.path,SPEECH_BASE).href,local:new URL(f.path,SPEECH_BASE).href})));
const revision='speech-1';
export const SPEECH_MODEL={name:'Whisper Tiny + Kokoro · Q8 · CPU',bytes:manifest.bytes};
const receiptKey=new URL('__speech-installation',SPEECH_BASE).href;
const fingerprint=SPEECH_FILES.map(f=>f.sha256).join(':');
let installing=false;
export async function speechStatus(){
 const base={ready:false,bytes:0,totalBytes:SPEECH_MODEL.bytes,model:SPEECH_MODEL.name,revision};
 if(typeof caches==='undefined')return base;
 try{
  const cache=await caches.open(SPEECH_CACHE),receipt=await(await cache.match(receiptKey))?.json();let complete=true;
  for(const f of SPEECH_FILES){const response=await cache.match(f.local);if(response?.headers.get('X-Thread-SHA256')===f.sha256&&Number(response.headers.get('Content-Length'))===f.bytes)base.bytes+=f.bytes;else complete=false;}
  return {...base,ready:complete&&receipt?.complete===true&&receipt.fingerprint===fingerprint};
 }catch{return base;}
}
async function allowDownload(){
 const controller=navigator.serviceWorker?.controller;if(!controller)return;
 const channel=new MessageChannel();await new Promise((resolve,reject)=>{
  const done=error=>{clearTimeout(timer);channel.port1.close();error?reject(error):resolve();};
  const timer=setTimeout(()=>done(Error('Reload this page to enable the optional speech download.')),5000);
  channel.port1.onmessage=event=>done(event.data?.ok===true?null:Error('The optional model download was not allowed.'));
  controller.postMessage({type:'allow-speech-download',revision},[channel.port2]);
 });
}
async function checkStream(response,file,createSHA256,signal){
 if(!response?.ok||!response.body)throw Error('Speech download failed: '+file.name);
 const hash=await createSHA256();hash.init();const reader=response.body.getReader();let count=0;
 try{while(true){signal?.throwIfAborted();const {done,value}=await reader.read();if(done)break;count+=value.byteLength;if(count>file.bytes)throw Error('Speech file exceeds its expected size.');hash.update(value);}if(count!==file.bytes||hash.digest('hex')!==file.sha256)throw Error('Speech integrity check failed: '+file.name);}
 catch(e){await reader.cancel().catch(()=>{});throw e;}finally{reader.releaseLock();}
}
// Stream into a private staging cache so a large model is not duplicated in a
// JavaScript ArrayBuffer. Publish the cache entry only after size + SHA256 pass.
async function downloadFile(file,cache,staging,createSHA256,signal,onBytes){
 const response=await fetch(file.url,{signal,credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok||!response.body)throw Error('Speech download failed: '+file.name+' ('+response.status+').');
 const hash=await createSHA256();hash.init();const reader=response.body.getReader();let count=0,verified=false;
 const stream=new ReadableStream({
  async pull(controller){try{
   signal?.throwIfAborted();const {done,value}=await reader.read();
   if(done){if(count!==file.bytes||hash.digest('hex')!==file.sha256)throw Error('Speech integrity check failed: '+file.name);verified=true;controller.close();return;}
   count+=value.byteLength;if(count>file.bytes)throw Error('Speech file exceeds its expected size.');hash.update(value);onBytes(count);controller.enqueue(value);
  }catch(error){await reader.cancel().catch(()=>{});controller.error(error);}},
  cancel:reason=>reader.cancel(reason),
 });
 const mime=file.name.endsWith('.wasm')?'application/wasm':/\.m?js$/.test(file.name)?'text/javascript':file.name.endsWith('.json')?'application/json':'application/octet-stream';
 try{
  await staging.put(file.local,new Response(stream,{headers:{'Content-Type':mime,'Content-Length':String(file.bytes),'X-Thread-SHA256':file.sha256}}));
  if(!verified)throw Error('Speech download was not completely verified.');
  signal?.throwIfAborted();await cache.put(file.local,await staging.match(file.local));
 }finally{await reader.cancel().catch(()=>{});reader.releaseLock();await staging.delete(file.local);}
}
export async function installSpeech({consent=false,signal,onProgress=()=>{}}={}){
 if(consent!==true)throw Error('Consent is required before downloading the optional speech model.');
 if(installing)throw Error('An speech tools download is already running.');
 installing=true;
 const run=async()=>{
  signal?.throwIfAborted();if(typeof caches==='undefined'||typeof WebAssembly==='undefined')throw Error('Offline storage and WebAssembly are required for speechs.');
  await allowDownload();await navigator.storage?.persist?.();
  const stagePrefix='thread-speech-stage:'+SPEECH_BASE.pathname+':';
  // An interrupted tab can leave a completed staging response behind. The
  // per-app install lock makes it safe to reclaim only this app's staging data.
  for(const name of await caches.keys())if(name.startsWith(stagePrefix))await caches.delete(name);
  const status=await speechStatus(),estimate=await navigator.storage?.estimate?.();
  // Cache publication can coexist with a complete staging response. Reserve
  // one largest file as well as remaining assets and working headroom.
  const needed=SPEECH_MODEL.bytes-status.bytes+Math.max(...SPEECH_FILES.map(f=>f.bytes))+50000000;
  if(Number.isFinite(estimate?.quota)&&Number.isFinite(estimate?.usage)&&estimate.quota-estimate.usage<needed)throw Error('More browser storage is needed for the optional speech model.');
  const cache=await caches.open(SPEECH_CACHE),stageName=stagePrefix+crypto.randomUUID(),staging=await caches.open(stageName);
  let completed=0;
  try{
   await cache.put(receiptKey,new Response(JSON.stringify({complete:false,revision})));
   const {createSHA256}=await import(new URL('../vendor/hash-wasm/dist/index.esm.js',import.meta.url).href);
   for(const file of SPEECH_FILES){
    signal?.throwIfAborted();let valid=false;const stored=await cache.match(file.local);
    if(stored){try{await checkStream(stored,file,createSHA256,signal);valid=true;}catch{signal?.throwIfAborted();}}
    if(!valid)await downloadFile(file,cache,staging,createSHA256,signal,done=>onProgress({phase:'Optional speech tools',file:file.name,done:completed+done,total:SPEECH_MODEL.bytes}));
    completed+=file.bytes;onProgress({phase:'Optional speech tools',file:file.name,done:completed,total:SPEECH_MODEL.bytes});
   }
   await cache.put(receiptKey,new Response(JSON.stringify({complete:true,revision,fingerprint,at:new Date().toISOString()})));
   return speechStatus();
  }finally{await caches.delete(stageName);}
 };
 try{
  if(navigator.locks?.request)return await navigator.locks.request('thread-speech-install-cdc6a147cc:'+SPEECH_BASE.pathname,{ifAvailable:true},lock=>{if(!lock)throw Error('An speech download is running in another tab.');return run();});
  throw Error('Web Locks are required to coordinate optional speech installation across tabs.');
 }finally{navigator.serviceWorker?.controller?.postMessage({type:'end-optional-download',kind:'speech'});installing=false;}
}
