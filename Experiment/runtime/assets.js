import {allowModelDownload} from './pwa.js';
import {get,put} from './store.js';
import {openFileWriter,probeStorage} from './storage-writer.js';
export const MODEL={name:'Gemma 4 E2B IT · browser export',qat:'Web artifact QAT provenance unconfirmed; approved E2B fallback',bytes:2008432640,sha256:'3a08e8d94e23b814ae5414469c370c503813949acb8ceaa17e4ebf8a35af35b5',url:'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/b3ca0d2f076785a8f4b2219ddbd2bdb99954eae1/gemma-4-E2B-it-web.litertlm',revision:'b3ca0d2f076785a8f4b2219ddbd2bdb99954eae1'};
export const CACHE='thread-runtime-v1-cdc6a147cc';
export async function modelFile(){const root=await navigator.storage.getDirectory();const h=await root.getFileHandle('gemma-e2b-web.litertlm');return h.getFile();}
export function validateManifest(manifest){
 if(!manifest||!Array.isArray(manifest.files)||!manifest.files.length||manifest.files.length>1024||!/^[a-f0-9]{64}$/.test(manifest.digest||''))throw Error('The runtime manifest is invalid.');
 const root=new URL('/Experiment/vendor/',location.href),seen=new Set();let bytes=0;
 for(const file of manifest.files){
  if(!file||typeof file.url!=='string')throw Error('The runtime manifest contains an invalid asset.');
  const url=new URL(file.url,location.href);
  if(url.origin!==root.origin||!url.pathname.startsWith(root.pathname)||url.pathname!==file.url||url.search||url.hash||/%|\\/.test(file.url)||seen.has(file.url)||!Number.isSafeInteger(file.bytes)||file.bytes<1||file.bytes>134217728||!/^[a-f0-9]{64}$/.test(file.sha256||''))throw Error('The runtime manifest contains an invalid asset.');
  seen.add(file.url);bytes+=file.bytes;
 }
 if(bytes!==manifest.bytes||bytes>536870912)throw Error('The runtime manifest has an invalid download size.');
 return manifest;
}
// Bound decoded response bytes before caching, even when Content-Length is absent
// or compressed. A broken host must not create an unbounded allocation/download.
export async function boundedAssetBytes(response,expected,signal){
 if(!response.body)throw Error('The asset download has no body.');
 const reader=response.body.getReader(),bytes=new Uint8Array(expected);let offset=0;
 try{while(true){signal?.throwIfAborted();const {done,value}=await reader.read();if(done)break;if(offset+value.byteLength>expected)throw Error('Asset download exceeds its declared size.');bytes.set(value,offset);offset+=value.byteLength;}if(offset!==expected)throw Error('Asset download is incomplete.');return bytes;}
 catch(e){await reader.cancel().catch(()=>{});throw e;}
 finally{reader.releaseLock();}
}
export async function assetsReady(){const receipt=await get('installation');if(!receipt?.complete||receipt.modelHash!==MODEL.sha256)return false;try{if((await modelFile()).size!==MODEL.bytes)return false;const cached=new Set((await(await caches.open(CACHE)).keys()).map(r=>new URL(r.url).pathname));const manifest=validateManifest(await(await fetch('/Experiment/data/assets.json')).json());return receipt.manifestHash===manifest.digest&&manifest.files.every(f=>cached.has(f.url));}catch{return false;}}
let installing=false;
export async function installAssets(options={}){
 if(options.consent!==true)throw Error('Consent is required before downloading model and runtimes.');
 if(installing)throw Error('A tools download is already running in this tab.');
 installing=true;
 try{
  if(navigator.locks?.request)return await navigator.locks.request('thread-install:'+new URL('/Experiment/data/assets.json',location.href).pathname,{ifAvailable:true},lock=>{if(!lock)throw Error('A tools download is already running in another tab. Return to that tab to pause or finish it.');return installUnlocked(options);});
  return await installUnlocked(options);
 }finally{installing=false;}
}
async function installUnlocked({consent=false,signal,onProgress=()=>{}}={}){
 if(consent!==true)throw Error('Consent is required before downloading model and runtimes.');
 await allowModelDownload();
 await put('download-consent',{at:new Date().toISOString(),model:MODEL});
 onProgress({phase:'Checking device storage',done:0,total:1});
 await probeStorage();
 if(!navigator.gpu||!await navigator.gpu.requestAdapter())throw Error('This browser has no usable WebGPU adapter for Gemma. On iPhone/iPad, Safari 26 or later is required; device support and available memory must also be checked. No model download has started.');
 await navigator.storage.persist?.();
 const estimate=await navigator.storage.estimate();
 const manifest=validateManifest(await(await fetch('/Experiment/data/assets.json',{signal})).json());const cache=await caches.open(CACHE);
 const existing=await modelFile().then(f=>Math.min(f.size,MODEL.bytes)).catch(()=>0);
 const needed=MODEL.bytes-existing+manifest.bytes+100000000;
 if(estimate.quota-estimate.usage<needed)throw Error(`About ${(needed/1e9).toFixed(2)} GB additional browser storage is needed to finish installation.`);
 await put('installation',{complete:false});
 for(let i=0;i<manifest.files.length;i++){
  const file=manifest.files[i];onProgress({phase:'Browser runtimes',done:i,total:manifest.files.length});
  const stored=await cache.match(file.url);
  if(stored){try{if(hex(await crypto.subtle.digest('SHA-256',await boundedAssetBytes(stored,file.bytes,signal)))===file.sha256)continue;}catch(e){signal?.throwIfAborted();}}
  if(stored)await cache.delete(file.url);
  const r=await fetch(file.url,{signal,cache:'reload'});if(!r.ok)throw Error('Download failed: '+file.url);
  const bytes=await boundedAssetBytes(r,file.bytes,signal);const digest=hex(await crypto.subtle.digest('SHA-256',bytes));
  if(digest!==file.sha256)throw Error('Integrity check failed: '+file.url);
  await cache.put(file.url,new Response(bytes,{headers:r.headers}));
 }
 const {createSHA256}=await import('/Experiment/vendor/hash-wasm/dist/index.esm.js');
 const root=await navigator.storage.getDirectory();const handle=await root.getFileHandle('gemma-e2b-web.litertlm',{create:true});
 let file=await handle.getFile();let offset=file.size;if(offset>MODEL.bytes)offset=0;
 const hash=await createSHA256();hash.init();
 if(offset){const reader=file.slice(0,offset).stream().getReader();while(true){const {done,value}=await reader.read();if(done)break;signal?.throwIfAborted();hash.update(value);}}
 if(offset<MODEL.bytes){
  const response=await fetch(MODEL.url,{headers:offset?{Range:`bytes=${offset}-`}:{},signal});
  if(!response.ok)throw Error('Model download failed ('+response.status+').');
  if(response.status===206){const range=/^bytes (\d+)-(\d+)\/(\d+)$/.exec(response.headers.get('Content-Range')||'');if(!range||Number(range[1])!==offset||Number(range[2])!==MODEL.bytes-1||Number(range[3])!==MODEL.bytes){await response.body?.cancel();throw Error('Model host returned an invalid resume range. Try the download again.');}}
  if(offset&&response.status!==206){offset=0;hash.init();}
  const writer=await openFileWriter('gemma-e2b-web.litertlm',{keepExistingData:offset>0});await writer.seek(offset);
  if(!response.body){await writer.close();throw Error('The model download has no body.');}
  const reader=response.body.getReader();
  try{while(true){signal?.throwIfAborted();const {done,value}=await reader.read();if(done)break;if(offset+value.byteLength>MODEL.bytes)throw Error('Model download exceeds its expected size.');await writer.write(value);hash.update(value);offset+=value.length;onProgress({phase:'Gemma model',done:offset,total:MODEL.bytes});}await writer.close();}
  catch(e){await reader.cancel().catch(()=>{});await writer.close();throw e;}
 }
 if(offset!==MODEL.bytes){await put('installation',{complete:false});throw Error('The model download is incomplete. Choose Download tools again to resume it.');}
 if(hash.digest('hex')!==MODEL.sha256){await put('installation',{complete:false});const invalid=await openFileWriter('gemma-e2b-web.litertlm');await invalid.close();throw Error('Model integrity check failed. The unverified model file was reset. Choose Download tools again to retry; my saved attempts are unchanged.');}
 const receipt={complete:true,at:new Date().toISOString(),modelHash:MODEL.sha256,manifestHash:manifest.digest,model:MODEL};await put('installation',receipt);
 onProgress({phase:'Ready for offline use',done:1,total:1});return receipt;
}
function hex(b){return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}
