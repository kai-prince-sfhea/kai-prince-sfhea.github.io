import {validateOutput,dependencyIds} from './schema.js';
import {Engine,loadLiteRtLm} from '/Experiment/vendor/litert/dist/index.js';
let engine;
self.onmessage=async({data:{id,request}})=>{
 let conversation,result,failure,diagnostics;const started=performance.now(),cold=!engine;let loadSeconds=0,sendSeconds=0;
 try{
  if(!navigator.gpu||!(await navigator.gpu.requestAdapter()))throw Error('No WebGPU adapter is available. Close other model apps and restart the browser; my draft is kept.');
  if(!engine){
   postMessage({id,progress:'Loading Gemma on this device…'});
   self.Module={locateFile:path=>new URL('/Experiment/vendor/litert/wasm/'+path,self.location.origin).href};
   await loadLiteRtLm('/Experiment/vendor/litert/wasm/');
   const root=await navigator.storage.getDirectory();const file=await(await root.getFileHandle('gemma-e2b-web.litertlm')).getFile();
   engine=await Engine.create({model:file.stream(),mainExecutorSettings:{maxNumTokens:6144},benchmarkEnabled:true});
  }
  loadSeconds=(performance.now()-started)/1000;
  if(request.warmup){postMessage({id,result:{warmup:true,seconds:loadSeconds,metrics:{cold,loadSeconds}}});return;}
  const messages=structuredClone(request.messages);
  messages[0].content+='\nReturn a JSON object only, without markdown. Use exactly this schema:\n'+JSON.stringify(request.format);
  if(request.correction)messages[0].content+='\nPrevious output failed validation at '+request.correction.field+': '+request.correction.reason+'. Return every required field in the specified format. Preserve the original thought; do not invent or correct reasoning.';
  const last=messages.pop();postMessage({id,progress:'Interpreting this case…'});
  conversation=await engine.createConversation({preface:{messages,extra_context:{enable_thinking:false}},sessionConfig:{samplerParams:{type:3,temperature:0,k:1,p:1},maxOutputTokens:request.options?.num_predict||900}});
  const sendStarted=performance.now();const response=await conversation.sendMessage(last);sendSeconds=(performance.now()-sendStarted)/1000;
  let content=typeof response.content==='string'?response.content:(response.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('');
  content=content.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
  diagnostics={characters:content.length,channels:Object.fromEntries(Object.entries(response.channels||{}).map(([k,v])=>[k,String(v).length]))};
  try{JSON.parse(content);}
  catch{throw Object.assign(Error('Gemma could not finish a complete interpretation. My draft is kept; no claim has been added.'),{code:'incomplete_json'});}
  const issue=validateOutput(JSON.parse(content),request.format,dependencyIds(request));
  if(issue)throw Object.assign(Error('Gemma returned an invalid interpretation field.'),{code:'schema_error',validation:issue});
  let benchmark=null;try{benchmark=await conversation.getBenchmarkInfo?.()??null;}catch{}
  result={content,seconds:(performance.now()-started)/1000,metrics:{cold,loadSeconds,sendSeconds,promptCharacters:messages.reduce((n,m)=>n+m.content.length,0)+last.content.length,outputCharacters:content.length,promptTokens:benchmark?.lastPrefillTokenCount??null,outputTokens:benchmark?.lastDecodeTokenCount??null,prefillTokensPerSecond:benchmark?.lastPrefillTokensPerSecond??null,decodeTokensPerSecond:benchmark?.lastDecodeTokensPerSecond??null,timeToFirstTokenSeconds:benchmark?.timeToFirstTokenInSecond??null,prefillSeconds:benchmark?.lastPrefillTokensPerSecond>0?benchmark.lastPrefillTokenCount/benchmark.lastPrefillTokensPerSecond:null,decodeSeconds:benchmark?.lastDecodeTokensPerSecond>0?benchmark.lastDecodeTokenCount/benchmark.lastDecodeTokensPerSecond:null,timingNote:'Prefill/decode seconds derived from runtime token counts and rates; null means unavailable'}};
 }catch(e){failure={error:e.message,code:e.code||(e instanceof SyntaxError?'incomplete_json':undefined),diagnostics,validation:e.validation,metrics:{cold,loadSeconds,sendSeconds,seconds:(performance.now()-started)/1000}};}
 finally{try{await conversation?.delete();}catch(e){failure??={error:e.message};}}
 postMessage({id,...(failure||{result})});
};
