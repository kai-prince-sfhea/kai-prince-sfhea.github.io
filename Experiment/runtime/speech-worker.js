import {validateRecording} from './speech-core.js';
let busy=false,pipeline,env,SPEECH_BASE,SPEECH_CACHE,SPEECH_FILES,speechStatus;
async function configure(){
 if(!(await speechStatus()).ready)throw Error('Install the optional speech tools in Device setup first.');
 const cache=await caches.open(SPEECH_CACHE),allowed=new Set(SPEECH_FILES.map(f=>f.local));
 env.allowRemoteModels=false;env.allowLocalModels=true;env.useBrowserCache=false;env.useFSCache=false;env.useCustomCache=true;
 env.localModelPath=new URL('speech-model/',SPEECH_BASE).href;
 env.customCache={match:async request=>{const key=typeof request==='string'?request:request.url;return allowed.has(key)?(await cache.match(key))??undefined:undefined;},put:async()=>{throw Error('Speech inference cannot download assets.');}};
 env.backends.onnx.wasm.numThreads=1;env.backends.onnx.wasm.proxy=false;env.backends.onnx.wasm.wasmPaths=new URL('vendor/transformers/',SPEECH_BASE).href;
 return cache;
}
// One task per disposable worker bounds memory and makes cancellation immediate.
self.onmessage=async({data})=>{
 if(busy)return;busy=true;const started=performance.now();let model;
 try{
  postMessage({progress:'Loading the speech browser runtime'});
  ({pipeline,env}=await import('../vendor/transformers/transformers.min.js'));
  postMessage({progress:'Loading the pinned speech manifest'});
  ({SPEECH_BASE,SPEECH_CACHE,SPEECH_FILES,speechStatus}=await import('./speech-assets.js'));
  postMessage({progress:'Checking verified local assets'});const cache=await configure();
  if(data.kind==='transcribe'){
   const samples=validateRecording(data.samples);
   postMessage({progress:'Loading Whisper on the CPU'});model=await pipeline('automatic-speech-recognition','whisper',{device:'wasm',dtype:'q8',local_files_only:true});
   postMessage({progress:'Transcribing with Whisper'});
   const result=await model(samples,{language:'english',task:'transcribe',max_new_tokens:128});
   postMessage({text:result.text,seconds:(performance.now()-started)/1000});
  }else if(data.kind==='narrate'){
   if(typeof data.text!=='string'||!data.text.trim()||data.text.length>180||!Number.isFinite(data.rate)||data.rate<0.75||data.rate>1.25)throw Error('Invalid narration passage.');
   const {KokoroTTS,setVoiceLoader}=await import('../vendor/speech/kokoro.js');
   setVoiceLoader(async()=>{const response=await cache.match(new URL('speech-model/kokoro/voices/af_heart.bin',SPEECH_BASE));if(!response)throw Error('Local voice missing.');return response.arrayBuffer();});
   postMessage({progress:'Loading Kokoro on the CPU'});model=await KokoroTTS.from_pretrained('kokoro',{device:'wasm',dtype:'q8'});
   postMessage({progress:'Synthesising with Kokoro'});
   const result=await model.generate(data.text,{voice:'af_heart',speed:data.rate});
   const samples=result.audio;
   if(!(samples instanceof Float32Array)||samples.length>24000*60||samples.some(n=>!Number.isFinite(n)))throw Error('Invalid narration audio.');
   postMessage({samples,rate:24000,seconds:(performance.now()-started)/1000},[samples.buffer]);
  }else throw Error('Unknown speech action.');
 }catch(e){postMessage({error:e.message});}
 finally{await model?.dispose?.();}
};
