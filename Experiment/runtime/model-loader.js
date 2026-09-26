// Keep a classic worker so the upstream WASM loader can use importScripts.
const ready=import('/Experiment/runtime/model-worker.js');
self.onmessage=async event=>{try{await ready;self.onmessage(event);}catch(e){postMessage({id:event.data.id,error:e.message});}};
