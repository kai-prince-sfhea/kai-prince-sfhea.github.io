import {validateManifest} from './assets.js';
import {validateRestoreEnvelope} from './restore-session.js';
import {collectModelOutput} from './model-stream.js';
import {backgroundPreparationEnabled} from './preparation.js';
import {get,put,remove} from './store.js';
const check=(v,m)=>{if(!v)throw Error(m);};
export async function benchmarkSafety({test}){
 await test('Runtime manifest · reject remote paths, duplicate assets and excess sizes',async()=>{
  const original=await(await fetch('/Experiment/data/assets.json')).json();validateManifest(original);
  const variants=[m=>m.files[0].url='https://example.invalid/tool.js',m=>m.files.push(m.files[0]),m=>m.files[0].bytes=536870913,m=>m.bytes++];
  for(const mutate of variants){const value=structuredClone(original);mutate(value);let rejected=false;try{validateManifest(value);}catch{rejected=true;}check(rejected,'Unsafe manifest accepted');}
  return 'Current same-origin manifest accepted; four malformed manifests refused before downloading.';
 });
 await test('Restore boundary · reject duplicate claims, future dependencies and malformed stages',async()=>{
  const valid={session_id:'fixture',scenario:{},graph:[{id:'c1',text:'A fixture',depends_on:[]}]};validateRestoreEnvelope(valid);
  const variants=[v=>v.graph.push(v.graph[0]),v=>v.graph[0].depends_on=['c2'],v=>v.graph={},v=>v.stage_history={untrusted:true}];
  for(const mutate of variants){const value=structuredClone(valid);mutate(value);let rejected=false;try{validateRestoreEnvelope(value);}catch{rejected=true;}check(rejected,'Malformed attempt accepted');}
  return 'Envelope validation only; actual restored proof checking is covered in the staged restore fixture.';
 });
 await test('Progressive output · bounded chunks with no partial claim or private text in progress',async()=>{
  const notices=[],conversation={sendMessageStreaming:()=>new ReadableStream({start(c){c.enqueue({content:'{"action":',channels:{analysis:'private'}});c.enqueue({content:'"claim"}'});c.close();}})};
  const result=await collectModelOutput(conversation,'fixture',v=>notices.push(v));check(result.content==='{"action":"claim"}'&&result.metrics.chunkCount===2,'Streaming collector lost text');check(notices.every(x=>!x.includes('claim')&&!x.includes('private')),'Partial/private output exposed');
  let bounded=false;try{await collectModelOutput({sendMessageStreaming:()=>new ReadableStream({start(c){c.enqueue({content:'x'.repeat(32769)});c.close();}})},'fixture');}catch(e){bounded=e.code==='output_limit';}check(bounded,'Oversized model stream accepted');
  return 'Synthetic transport fixture. Real Gemma streaming is exercised by the selected Gemma checks; full JSON/schema and learner review still gate every claim.';
 });
 await test('Background preparation · opt out is respected and reversible',async()=>{
  const previous=await get('background-preparation');try{await put('background-preparation',false);check(!(await backgroundPreparationEnabled()),'Background opt-out ignored');await put('background-preparation',true);check(await backgroundPreparationEnabled(),'Background preparation could not be restored');}
  finally{if(previous===undefined)await remove('background-preparation');else await put('background-preparation',previous);}
  return 'Preference boundary checked; staged fixture separately ensures preview facts never enter the player record.';
 });
}
