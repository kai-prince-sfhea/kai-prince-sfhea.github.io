// Template for build-pages.py: the worker controls only the prototype directory.
const SHELL='thread-shell-v1-cdc6a147cc', RUNTIME='thread-runtime-v1-cdc6a147cc', SETTINGS='thread-settings-cdc6a147cc';
const BASE='/Experiment/', MODEL='https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/b3ca0d2f076785a8f4b2219ddbd2bdb99954eae1/gemma-4-E2B-it-web.litertlm';
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const list=await(await fetch('/Experiment/data/shell.json',{cache:'reload'})).json();
 const c=await caches.open(SHELL);await c.addAll(list);await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>event.waitUntil((async()=>{
 const c=await caches.open(SETTINGS);
 if(event.data?.type==='offline')await c.put('/Experiment/__offline',new Response(event.data.value?'1':'0'));
 else if(event.data?.type==='allow-model-download')await c.put(BASE+'__model-consent',new Response('1'));
 else return;
 event.ports[0]?.postMessage({ok:true});
})()));
self.addEventListener('fetch',event=>event.respondWith((async()=>{
 const url=new URL(event.request.url), settings=await caches.open(SETTINGS);
 const flag=await settings.match('/Experiment/__offline'), offline=flag&&(await flag.text())==='1';
 if(event.request.method!=='GET')return new Response('Network operation disabled',{status:403});
 if(url.origin!==location.origin){
  if(!offline&&url.href===MODEL&&await settings.match(BASE+'__model-consent'))return fetch(event.request);
  return new Response('External request disabled',{status:403});
 }
 if(!url.pathname.startsWith(BASE))return new Response('Outside prototype scope',{status:403});
 const runtime=await caches.open(RUNTIME), local=await runtime.match(event.request,{ignoreSearch:true});
 if(local)return local;
 const shell=await caches.open(SHELL), saved=await shell.match(event.request,{ignoreSearch:true});
 if(offline)return saved||new Response('Not installed for offline use',{status:503});
 // Never send virtual gameplay API calls or learner data to a static server.
 if(url.pathname.startsWith(BASE+'api/'))return new Response('Local API only',{status:403});
 try{const response=await fetch(event.request);if(response.ok&&saved)await shell.put(event.request,response.clone());return response;}
 catch{return saved||new Response('Offline asset unavailable',{status:503});}
})()));

// build:39d87c67b8b3d192c1dba111fdab330b0b566d862daa06d2ac5d6dad8abafbb0
