import {Engine,loadLiteRtLm} from '/Experiment/vendor/litert/dist/index.js';
let engine;
self.onmessage=async({data:{id,request}})=>{
 let conversation,result,failure,diagnostics;
 try{
  if(!navigator.gpu||!(await navigator.gpu.requestAdapter()))throw Error('No WebGPU adapter is available. Close other model apps and restart the browser; my draft is kept.');
  const started=performance.now();
  if(!engine){
   postMessage({id,progress:'Loading Gemma on this device…'});
   self.Module={locateFile:path=>new URL('/Experiment/vendor/litert/wasm/'+path,self.location.origin).href};
   await loadLiteRtLm('/Experiment/vendor/litert/wasm/');
   const root=await navigator.storage.getDirectory();const file=await(await root.getFileHandle('gemma-e2b-web.litertlm')).getFile();
   engine=await Engine.create({model:file.stream(),mainExecutorSettings:{maxNumTokens:6144},benchmarkEnabled:true});
  }
  const messages=structuredClone(request.messages);
  messages[0].content+='\nReturn a JSON object only, without markdown. Use exactly this schema:\n'+JSON.stringify(request.format);
  const last=messages.pop();postMessage({id,progress:'Interpreting this case…'});
  conversation=await engine.createConversation({preface:{messages,extra_context:{enable_thinking:false}},sessionConfig:{samplerParams:{type:3,temperature:0,k:1,p:1},maxOutputTokens:request.options?.num_predict||900}});
  const response=await conversation.sendMessage(last);
  let content=typeof response.content==='string'?response.content:(response.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('');
  content=content.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
  diagnostics={characters:content.length,channels:Object.fromEntries(Object.entries(response.channels||{}).map(([k,v])=>[k,String(v).length]))};
  try{const parsed=JSON.parse(content);if(!parsed||Array.isArray(parsed)||typeof parsed!=='object')throw Error();}
  catch{throw Object.assign(Error('Gemma could not finish a complete interpretation. My draft is kept; no claim has been added.'),{code:'incomplete_json'});}
  result={content,seconds:(performance.now()-started)/1000};
 }catch(e){failure={error:e.message,code:e.code||(e instanceof SyntaxError?'incomplete_json':undefined),diagnostics};}
 finally{try{await conversation?.delete();}catch(e){failure??={error:e.message};}}
 postMessage({id,...(failure||{result})});
};
