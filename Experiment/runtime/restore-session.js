import {localApi,scenarios,verifyFormal} from './local-api.js';
import {compile} from './compiler.js';
import {get,put,remove} from './store.js';

const text=x=>typeof x==='string'?x.slice(0,2500):'';
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const identifier=x=>typeof x==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(x);
export function validateRestoreEnvelope(raw){
 if(!object(raw)||JSON.stringify(raw).length>20000000)throw Error('Use an attempt export of at most 20 MB.');
 const current=raw.server_session||raw;
 if(!object(current)||typeof current.session_id!=='string'||!current.session_id||current.session_id.length>128)throw Error('The export has no valid current attempt.');
 if(raw.stage_history!==undefined&&!Array.isArray(raw.stage_history))throw Error('The exported stage history is invalid.');
 const records=raw.stage_history?.length?raw.stage_history:[{session:current,reflection:raw.learning}];
 if(records.length>3||!records.at(-1)?.session||records.at(-1).session.session_id!==current.session_id)throw Error('Use an export containing the current attempt and at most three ordered stages.');
 const sessions=new Set();
 for(const record of records){
  const saved=record?.session;
  if(!object(saved)||typeof saved.session_id!=='string'||!saved.session_id||saved.session_id.length>128||sessions.has(saved.session_id)||!object(saved.scenario))throw Error('Each exported stage needs a distinct attempt and a scenario.');
  sessions.add(saved.session_id);
  if(!Array.isArray(saved.graph)||saved.graph.length>128)throw Error('Use an export with at most 128 claims per stage.');
  const seen=new Set();
  for(const claim of saved.graph){
   if(!object(claim)||!identifier(claim.id)||seen.has(claim.id)||typeof claim.text!=='string'||claim.text.length>8000||!Array.isArray(claim.depends_on)||claim.depends_on.length>32||new Set(claim.depends_on).size!==claim.depends_on.length||claim.depends_on.some(id=>!seen.has(id)))throw Error('Exported claims need distinct IDs and references to earlier claims in their stage.');
   seen.add(claim.id);
  }
 }
 return {current,records};
}
export async function restoreAttempt(raw,onStatus=()=>{}){
 const {records}=validateRestoreEnvelope(raw);
 const library=await scenarios(),prepared=[];
 for(const record of records){
  const saved=record.session;
  if(saved.scenario?.revision!=='problem-only-v1')throw Error('This export uses earlier scenario rules. Keep it as an archive and start a fresh attempt.');
  const known=library.find(s=>s.id===saved.scenario.id);
  if(known&&((saved.scenario.source_hash&&known.source_hash!==saved.scenario.source_hash)||(typeof saved.scenario.source_text==='string'&&saved.scenario.source_text.replace(/\r\n/g,'\n').trim()!==known.source_text.replace(/\r\n/g,'\n').trim())))throw Error('The bundled scenario rules have changed. Keep this export as an archive and start a fresh attempt.');
  const scenario=known||(await localApi('/api/import-theory',{source:saved.scenario.source_text})).scenario;
  const claims=[];for(const claim of saved.graph)claims.push(await compile({op:'parse',claim,accepted:claims,scenario}));
  const previous=prepared.at(-1);
  if(previous){
   const a=previous.scenario.journey,b=scenario.journey;
   if(!a||!b||b.stage!==a.stage+1||JSON.stringify(a.config)!==JSON.stringify(b.config)||JSON.stringify(b.choices.slice(0,-1))!==JSON.stringify(a.choices))throw Error('The exported stages do not form one consistent evidence path.');
  }
  prepared.push({saved,scenario,claims,reflection:record.reflection,workspace:record.workspace});
 }
 const created=[];
 try{
  for(const [i,record]of prepared.entries()){
   const {saved,scenario}=record,made=await localApi('/api/session',{scenario,guidance:saved.guidance});created.push(made.session_id);
   for(const claim of record.claims){
    onStatus(`Rechecking stage ${i+1}, ${claim.id}`);
    const session=await get('session:'+made.session_id),checked=await verifyFormal(claim,session.claims,scenario,{cache:false});
    if(checked.status!=='verified')throw Error('Could not certify '+claim.id+'. The original export is unchanged.');
    session.claims.push(claim);await put('session:'+session.id,session);
    const result=await localApi('/api/check-solution',{session_id:session.id});
    if(result.solution_check.status==='error')throw Error(result.solution_check.detail);
    const fresh=await get('session:'+session.id),view=await compile({op:'view',claim,scenario});
    fresh.history.push({student:claim.text,interpretation:view,result:{...checked,...result,claim:view,feedback:'This exported step was rechecked locally.'}});await put('session:'+fresh.id,fresh);
   }
   const session=await get('session:'+made.session_id);session.importedHistory=Array.isArray(saved.history)?saved.history.slice(0,200):[];
   if(i){
    const previous=await get('session:'+created[i-1]);if(!previous.solved)throw Error('An earlier stage does not meet its goal after rechecking.');
    const choice=scenario.journey.choices.at(-1),decision={choice,rationale:text(prepared[i-1].saved.stage_decision?.rationale),assessment:'restored personal decision rationale; not graded',from_stage:previous.scenario.journey.stage};
    previous.next_stage=session.id;previous.stage_decision=decision;session.previous_stage=previous.id;session.entry_decision=decision;await put('session:'+previous.id,previous);
   }
   await put('session:'+session.id,session);
   const workspace=i===prepared.length-1?raw:record.workspace||{};
   await put('workspace:'+session.id,{draft:text(workspace.draft),reflection:text(workspace.reflection)});
   if(record.reflection)await put('learning:'+session.id,{scenario:scenario.id,...Object.fromEntries(['why','alternative','revision','influence','transfer','plan'].map(k=>[k,text(record.reflection[k])])),assessment:'self-reflection; not independently assessed'});
  }
  return created.at(-1);
 }catch(e){for(const id of created)for(const prefix of ['session:','workspace:','learning:'])await remove(prefix+id);throw e;}
}
