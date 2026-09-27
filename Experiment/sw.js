// Template for build-pages.py: the worker controls only the prototype directory.
const SHELL='thread-shell-v1-cdc6a147cc', RUNTIME='thread-runtime-v1-cdc6a147cc', SETTINGS='thread-settings-cdc6a147cc';
const BASE='/Experiment/', MODEL='https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/b3ca0d2f076785a8f4b2219ddbd2bdb99954eae1/gemma-4-E2B-it-web.litertlm';
const EMBEDDING_REVISION='5090578d9565bb06545b4552f76e6bc2c93e4a66';
const EMBEDDING_URLS=new Set(['config.json','generation_config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','onnx/model_q4.onnx','onnx/model_q4.onnx_data'].map(file=>'https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX/resolve/'+EMBEDDING_REVISION+'/'+file));
const SPEECH_REVISION='speech-1';
const SPEECH_URLS=new Set(["https://huggingface.co/onnx-community/whisper-tiny/resolve/ff4177021cc41f7db950912b73ea4fdf7d01d8e7/config.json", "https://huggingface.co/onnx-community/whisper-tiny/resolve/ff4177021cc41f7db950912b73ea4fdf7d01d8e7/generation_config.json", "https://huggingface.co/onnx-community/whisper-tiny/resolve/ff4177021cc41f7db950912b73ea4fdf7d01d8e7/preprocessor_config.json", "https://huggingface.co/onnx-community/whisper-tiny/resolve/ff4177021cc41f7db950912b73ea4fdf7d01d8e7/tokenizer.json", "https://huggingface.co/onnx-community/whisper-tiny/resolve/ff4177021cc41f7db950912b73ea4fdf7d01d8e7/tokenizer_config.json", "https://huggingface.co/onnx-community/whisper-tiny/resolve/ff4177021cc41f7db950912b73ea4fdf7d01d8e7/special_tokens_map.json", "https://huggingface.co/onnx-community/whisper-tiny/resolve/ff4177021cc41f7db950912b73ea4fdf7d01d8e7/added_tokens.json", "https://huggingface.co/onnx-community/whisper-tiny/resolve/ff4177021cc41f7db950912b73ea4fdf7d01d8e7/normalizer.json", "https://huggingface.co/onnx-community/whisper-tiny/resolve/ff4177021cc41f7db950912b73ea4fdf7d01d8e7/merges.txt", "https://huggingface.co/onnx-community/whisper-tiny/resolve/ff4177021cc41f7db950912b73ea4fdf7d01d8e7/vocab.json", "https://huggingface.co/onnx-community/whisper-tiny/resolve/ff4177021cc41f7db950912b73ea4fdf7d01d8e7/onnx/encoder_model_quantized.onnx", "https://huggingface.co/onnx-community/whisper-tiny/resolve/ff4177021cc41f7db950912b73ea4fdf7d01d8e7/onnx/decoder_model_merged_quantized.onnx", "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/1939ad2a8e416c0acfeecc08a694d14ef25f2231/config.json", "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/1939ad2a8e416c0acfeecc08a694d14ef25f2231/tokenizer.json", "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/1939ad2a8e416c0acfeecc08a694d14ef25f2231/tokenizer_config.json", "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/1939ad2a8e416c0acfeecc08a694d14ef25f2231/onnx/model_quantized.onnx", "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/1939ad2a8e416c0acfeecc08a694d14ef25f2231/voices/af_heart.bin"]);
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const list=await(await fetch('/Experiment/data/shell.json',{cache:'reload'})).json();
 const c=await caches.open(SHELL);await c.addAll(list);await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>event.waitUntil((async()=>{
 const client=event.source?.id?await self.clients.get(event.source.id):null;
 if(!client||client.type!=='window')return;
 const sender=new URL(client.url);if(sender.origin!==location.origin||!sender.pathname.startsWith(BASE))return;
 const c=await caches.open(SETTINGS);
 if(event.data?.type==='offline'&&typeof event.data.value==='boolean')await c.put('/Experiment/__offline',new Response(event.data.value?'1':'0'));
 else if(event.data?.type==='allow-model-download')await c.put(BASE+'__model-consent',new Response('1'));
 else if(event.data?.type==='allow-embedding-download'&&event.data.revision===EMBEDDING_REVISION)await c.put('/Experiment/data/embedding-consent',new Response(EMBEDDING_REVISION));
 else if(event.data?.type==='allow-speech-download'&&event.data.revision===SPEECH_REVISION)await c.put('/Experiment/data/speech-consent',new Response(SPEECH_REVISION));
 else return;
 event.ports[0]?.postMessage({ok:true});
})()));
self.addEventListener('fetch',event=>event.respondWith((async()=>{
 const url=new URL(event.request.url), settings=await caches.open(SETTINGS);
 const flag=await settings.match('/Experiment/__offline'), offline=flag&&(await flag.text())==='1';
 if(event.request.method!=='GET')return new Response('Network operation disabled',{status:403});
 if(url.origin!==location.origin){
  if(!offline&&url.href===MODEL&&await settings.match(BASE+'__model-consent'))return fetch(event.request);
  if(!offline&&SPEECH_URLS.has(url.href)&&await settings.match('/Experiment/data/speech-consent'))return fetch(event.request);
   if(!offline&&EMBEDDING_URLS.has(url.href)&&await settings.match('/Experiment/data/embedding-consent'))return fetch(event.request);
  return new Response('External request disabled',{status:403});
 }
 if(!url.pathname.startsWith(BASE))return new Response('Outside prototype scope',{status:403});
 const speech=await(await caches.open('thread-speech-v1-cdc6a147cc')).match(event.request);if(speech)return speech;
  const optional=await(await caches.open('thread-embedding-v1-cdc6a147cc')).match(event.request);if(optional)return optional;
 const runtime=await caches.open(RUNTIME), local=await runtime.match(event.request,{ignoreSearch:true});
 if(local)return local;
 // Use the exact install-time key: old ?resume= entries must never shadow an
 // updated canonical page when disconnected. Keep original request for fetch.
 const shellKey=new URL(url.href);shellKey.search='';shellKey.hash='';
 const shell=await caches.open(SHELL), saved=await shell.match(shellKey.href);
 if(offline)return saved||new Response('Not installed for offline use',{status:503});
 // Never send virtual gameplay API calls or learner data to a static server.
 if(url.pathname.startsWith(BASE+'api/'))return new Response('Local API only',{status:403});
 try{const response=await fetch(event.request);if(response.ok&&saved)await shell.put(shellKey.href,response.clone());return response;}
 catch{return saved||new Response('Offline asset unavailable',{status:503});}
})()));

// build:557be0eb284e43413a876b67c866a0dbfaf5144b4dd7fa5299ef104571eb02ff
