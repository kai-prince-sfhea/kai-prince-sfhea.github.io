import {validateOutput,dependencyIds} from './schema.js';
import {collectModelOutput} from './model-stream.js';
import {Engine,loadLiteRtLm} from '/Experiment/vendor/litert/dist/index.js';
let engine;
// Numeric runtime diagnostics are safe to retain even when generated JSON fails.
// Never include model output, messages, or arbitrary SDK fields in failure reports.
async function benchmarkMetrics(conversation){
 let benchmark=null;try{benchmark=await conversation?.getBenchmarkInfo?.()??null;}catch{}
 const number=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;
 const promptTokens=number(benchmark?.lastPrefillTokenCount),outputTokens=number(benchmark?.lastDecodeTokenCount),prefillTokensPerSecond=number(benchmark?.lastPrefillTokensPerSecond),decodeTokensPerSecond=number(benchmark?.lastDecodeTokensPerSecond);
 return {promptTokens,outputTokens,prefillTokensPerSecond,decodeTokensPerSecond,timeToFirstTokenSeconds:number(benchmark?.timeToFirstTokenInSecond),prefillSeconds:promptTokens!==null&&prefillTokensPerSecond>0?promptTokens/prefillTokensPerSecond:null,decodeSeconds:outputTokens!==null&&decodeTokensPerSecond>0?outputTokens/decodeTokensPerSecond:null,timingNote:'Prefill/decode seconds derived from runtime token counts and rates; null means unavailable'};
}
self.onmessage=async({data:{id,request}})=>{
 let conversation,result,failure,diagnostics;const started=performance.now(),cold=!engine;let loadSeconds=0,sendSeconds=0;const interpretationMetrics={};
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
  const roleIds=Object.fromEntries(['conclusions','assumptions'].map(role=>[role,request.format?.properties?.[role]?.items?.properties?.id?.enum]));
  const distinctRoles=Array.isArray(roleIds.conclusions)&&Array.isArray(roleIds.assumptions)&&request.format?.properties?.assumptions?.maxItems!==0&&roleIds.conclusions.length>0&&roleIds.assumptions.length>0&&!roleIds.conclusions.some(id=>roleIds.assumptions.includes(id));
  for(const role of distinctRoles?['conclusions','assumptions']:[]){
   const ids=request.format?.properties?.[role]?.items?.properties?.id?.enum;
   if(Array.isArray(ids)&&ids.length<=12)messages[0].content+='\nAllowed '+role+' IDs: '+JSON.stringify(ids)+'. Do not swap these roles or generate a different identifier.';
  }
  if(request.correction)messages[0].content+='\nPrevious output failed validation at '+request.correction.field+': '+request.correction.reason+'. Return every required field in the specified format. Preserve the original thought; do not invent or correct reasoning.';
  if(request.correction?.field==='$.action'&&Array.isArray(request.format?.properties?.action?.enum)){
   const actions=request.format.properties.action.enum;
   messages[0].content+='\nThe action field is a routing choice, never a proposition ID. Its value must be exactly one of '+JSON.stringify(actions)+'.';
   if(actions.includes('claim')&&actions.includes('clarify'))messages[0].content+=' Use claim for a representable assertion, including a false assertion; use clarify when the whole thought cannot be represented.';
   messages[0].content+=' Return the complete object with every required field.';
  }
  const last=messages.pop();postMessage({id,progress:'Interpreting this case…'});
  if(request.correction){
   const fields=Object.keys(request.format?.properties||{}),actions=request.format?.properties?.action?.enum;
   last.content+='\n\nOutput-format reminder: return the complete JSON object with keys '+JSON.stringify(fields)+'.';
   if(Array.isArray(actions))last.content+=' The action field must be one of '+JSON.stringify(actions)+', never a proposition ID. Preserve the thought above without adding deductions.';
   if(request.format?.properties?.assumptions?.maxItems===0)last.content+=' The assumptions array must be empty: [].';
   if(request.correction.allowedValues)last.content+=' The field '+request.correction.field+' must use one of these schema values: '+JSON.stringify(request.correction.allowedValues)+'. This is a format restriction, not permission to change the thought.';
  }
  interpretationMetrics.promptCharacters=messages.reduce((n,m)=>n+m.content.length,0)+last.content.length;
  conversation=await engine.createConversation({preface:{messages,extra_context:{enable_thinking:false}},sessionConfig:{samplerParams:{type:3,temperature:0,k:1,p:1},maxOutputTokens:request.options?.num_predict||900}});
  const sendStarted=performance.now();const response=await collectModelOutput(conversation,last,progress=>postMessage({id,progress}));sendSeconds=(performance.now()-sendStarted)/1000;
  let content=response.content;
  content=content.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
  diagnostics={characters:content.length,channels:response.channels};
  Object.assign(interpretationMetrics,response.metrics,{outputCharacters:content.length});
  try{JSON.parse(content);}
  catch{throw Object.assign(Error('Gemma could not finish a complete interpretation. My draft is kept; no claim has been added.'),{code:'incomplete_json',validation:{field:'$',reason:'Return one complete JSON object with double-quoted keys/strings, escaped inner quotes, no trailing commas or additional text.'}});}
  const issue=validateOutput(JSON.parse(content),request.format,dependencyIds(request));
  if(issue)throw Object.assign(Error('Gemma returned an invalid interpretation field.'),{code:'schema_error',validation:issue});
  result={content,seconds:(performance.now()-started)/1000,metrics:{...interpretationMetrics,...await benchmarkMetrics(conversation),cold,loadSeconds,sendSeconds}};
 }catch(e){failure={error:e.message,code:e.code||(e instanceof SyntaxError?'incomplete_json':undefined),diagnostics,validation:e.validation,metrics:{...interpretationMetrics,...await benchmarkMetrics(conversation),cold,loadSeconds,sendSeconds,seconds:(performance.now()-started)/1000}};}
 finally{try{await conversation?.delete();}catch(e){failure={...failure,error:'Gemma could not release this interpretation. My draft is kept; I can retry. '+e.message,code:'cleanup_error',metrics:failure?.metrics||{cold,loadSeconds,sendSeconds,seconds:(performance.now()-started)/1000}};}}
 postMessage({id,...(failure||{result})});
};
