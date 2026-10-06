import {extractionStatus,EXTRACTION_MODEL} from './extraction-assets.js';
import {get} from './store.js';
import {measure} from './telemetry.js';
import {validateSpans,validateProposal,emptyProposal,compactProposal} from './extraction-proposal.js';
export {validateSpans,validateProposal,compactProposal};
export const extractionMetadata=()=>({...EXTRACTION_MODEL});
const idleMs=90000,maxRequests=32,maxQueued=4;let worker=null,pending=null,idleTimer=null,serial=Promise.resolve(),requestCounter=0,requestId=0,queued=0,generation=0;
// Explicit release lets a device/lab bound model residency and measure cold loads.
export function releaseExtraction(reason='Encoder released to free device memory.'){
 generation++;clearTimeout(idleTimer);idleTimer=null;worker?.terminate();worker=null;requestCounter=0;
 if(pending){const job=pending;pending=null;clearTimeout(job.timer);job.reject(Error(reason));}
}
export const resetExtraction=releaseExtraction;
function request(text,options){
 clearTimeout(idleTimer);if(!worker){worker=new Worker(new URL('./extraction-worker.js',import.meta.url),{type:'module'});requestCounter=0;
  worker.onerror=e=>releaseExtraction(e.message||'Local encoder failed.');
  worker.onmessage=({data})=>{if(!pending||data.id!==pending.id)return;if(data.phase){pending.progress(data.phase);return;}
   const job=pending;pending=null;clearTimeout(job.timer);requestCounter++;data.error?job.reject(Error(data.error)):job.resolve(data.report??data.proposal);
   if(requestCounter>=maxRequests)releaseExtraction();else idleTimer=setTimeout(()=>releaseExtraction(),idleMs);
  };
 }
 return new Promise((resolve,reject)=>{const id=++requestId;pending={id,resolve,reject,progress:options.onProgress,timer:setTimeout(()=>releaseExtraction('Local encoder timed out; use Gemma without extraction.'),180000)};worker.postMessage({id,text,mode:options.mode,schemaExamples:options.schemaExamples,references:options.references});});
}
// Diagnostic control uses native task schemas. Its output never enters gameplay.
export async function runExtractionAdapterControl({onProgress=()=>{}}={}){
 if(queued)throw Error('Wait for the current extraction request before running adapter controls.');
 if(!(await extractionStatus()).ready)throw Error('Install the GLiNER 2.5 Multi pack first.');
 releaseExtraction();queued++;
 const task=async()=>{try{return await request('adapter diagnostic',{onProgress,mode:'adapter-control'});}finally{queued--;releaseExtraction();}};
 const result=serial.then(task,task);serial=result.catch(()=>{});return result;
}
export async function extractProposal(text,{force=false,onProgress=()=>{},schemaExamples=[],references=[]}={}){
 if(typeof text!=='string'||text.length>2500)return emptyProposal(typeof text==='string'?text:'',['Input exceeds the encoder contract; use the full interpreter.']);
 if(!force&&await get('extraction-enabled')!==true)return emptyProposal(text,['Optional multilingual encoder is disabled.']);
 if(!(await extractionStatus()).ready)return emptyProposal(text,['Install the GLiNER 2.5 Multi pack to use structured extraction.']);
 if(queued>=maxQueued){if(force)throw Error('The bounded extraction queue is full.');return emptyProposal(text,['The bounded extraction queue is full; use Gemma directly.']);}
 const version=generation;queued++;
 const task=async()=>{const started=performance.now();let outcome='fallback';try{if(version!==generation)throw Error('Extraction was released before this queued request.');const raw=await request(text,{onProgress,schemaExamples,references}),proposal=validateProposal(text,raw,references);outcome='success';return proposal;}catch(e){releaseExtraction();if(force)throw e;return emptyProposal(text,[String(e.message).slice(0,240)]);}finally{queued--;measure('extraction',{outcome,seconds:(performance.now()-started)/1000,model:EXTRACTION_MODEL.model,revision:EXTRACTION_MODEL.revision});}};
 const result=serial.then(task,task);serial=result.catch(()=>{});return result;
}
// Compatibility with existing span inspection checks; gameplay uses records.
export async function extractSpans(text,options={}){return (await extractProposal(text,options)).mentions;}
