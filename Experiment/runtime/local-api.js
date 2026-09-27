import {ensureKernel,kernelHealth} from './coq.js';
import {measure} from './telemetry.js';
import {get,put} from './store.js';
import {backgroundPreparationEnabled} from './preparation.js';
import {compile} from './compiler.js';
import {prolog,certify} from './proofs.js';
import {infer,cancellationVersion} from './model.js';
import {assetsReady,MODEL} from './assets.js';
import {hintFor} from './learning.js';
import {coachingPrompt} from './reasoning-support.js';
let catalogue,active=false;const proofCache=new Map(),inFlight=new Map();let predictionTimer;
const stagePreviews=new Map(),stageTransitions=new Map();
async function stagePreview(s,choice){
 const j=s.scenario.journey;if(!j||!j.available.some(c=>c.id===choice))throw Error('This evidence choice is unavailable or exceeds the remaining budget.');
 const key=s.scenario.source_hash+':'+choice;
 if(!stagePreviews.has(key)){
  const task=compile({op:'generate_journey',spec:{version:j.version,config:j.config,choices:[...j.choices,choice]}}).catch(e=>{stagePreviews.delete(key);throw e;});
  stagePreviews.set(key,task);if(stagePreviews.size>12)stagePreviews.delete(stagePreviews.keys().next().value);
 }
 return copy(await stagePreviews.get(key));
}
export function resetVerificationCache(){if(active||inFlight.size)throw Error('Verification is busy');clearTimeout(predictionTimer);proofCache.clear();}
const copy=x=>structuredClone(x);
const save=s=>put('session:'+s.id,s);
export async function scenarios(){return catalogue??=await(await fetch('/Experiment/data/scenarios.json')).json();}
export async function requireTools(){if(!(await assetsReady()))throw Error('Open Device setup and consent to install the offline tools. My draft is saved on this device.');}
async function session(id){const s=await get('session:'+id);if(!s)throw Error('This attempt is not stored on this device. Start a scenario or import a saved attempt.');if(s.scenario.revision!=='problem-only-v1')throw Error('This saved attempt uses the earlier scenario rules. Choose a scenario to start a fresh attempt with problem-only facts. The old record remains stored on this device.');return s;}
async function view(c,s){return compile({op:'view',claim:c,scenario:s});}
export async function verifyFormal(claim,accepted,scenario,{cache=true,anticipated=false}={}){
 const compiled=await compile({op:'compile',claim,accepted,scenario});
 const key=await compile({op:'key',claim:compiled.claim,accepted,scenario});
 let evidence=cache?proofCache.get(key):null;
 const reused=!!evidence,joined=!evidence&&inFlight.has(key),started=performance.now();
 if(!evidence){
  if(!inFlight.has(key))inFlight.set(key,(async()=>{
  const p=await prolog(compiled.prolog);
  let sentences=compiled.coq;
  if(p.status==='verified'&&scenario.domain==='theory')sentences=await compile({op:'named_certificate',claim:compiled.claim,scenario,result:p});
  if(p.status==='verified'){const health=await ensureKernel();if(health.state!=='ready')throw Object.assign(Error('My proof verifier is unavailable. My draft is kept. '+health.detail),{code:'kernel_unavailable'});}
  const c=p.status==='verified'?await certify(sentences,90000,{anticipated}):{status:'not_requested',detail:'No positive Prolog derivation to certify.'};
  const built={status:p.status==='verified'?c.status==='verified'?'verified':'error':p.status,anticipated,visited:!anticipated,engines:{prolog:{...p,detail:'Iterated depth-first search in SWI-Prolog.'},coq:c},sentences,trace:p.trace};
  if(built.status==='verified'){proofCache.set(key,copy(built));if(proofCache.size>64)proofCache.delete(proofCache.keys().next().value);}
  return built;
  })().finally(()=>inFlight.delete(key)));
  evidence=await inFlight.get(key);
 }
 measure('verification_cache',{outcome:'success',seconds:(performance.now()-started)/1000,hit:reused,joined,anticipated,sourceAnticipated:!!evidence.anticipated});
 if(!anticipated&&proofCache.has(key))proofCache.get(key).visited=true;
 return {status:evidence.status,engines:copy(evidence.engines),sources:{prolog:compiled.prolog,coq:evidence.sentences.join('\n'),isabelle:compiled.isabelle,imported_theory:scenario.source_text},scope:compiled.scope,graph:{...compiled.graph,...(evidence.trace?{trace:evidence.trace}:{} )},timing:{cache_hit:reused,in_flight_joined:joined},counterexample:evidence.status==='refuted'?{detail:'My claim fails in a scenario case. '+JSON.stringify(evidence.engines.prolog)}:null};
}
async function checkGoal(s){
 s.goal_checks++;
 try{
  const prepared=await compile({op:'goal',accepted:s.claims,scenario:s.scenario});let goal;
  if(prepared.status==='not_discovered')goal=prepared;
  else if(prepared.status==='candidate'){
   const checked=await verifyFormal(prepared.compiled.claim,s.claims,s.scenario);
   goal={...checked,status:checked.status==='verified'?'discovered':'error',theorem:s.scenario.goal,witness:prepared.witness};
  }else{
   const p=await prolog(prepared.prolog);
   const built=await compile({op:'goal_finish',accepted:s.claims,result:p});
   goal={...built,engines:{prolog:p},sources:{prolog:prepared.prolog}};
   if(built.status==='candidate'){
    const health=await ensureKernel();if(health.state!=='ready')throw Error('My proof verifier is unavailable. '+health.detail);
    const c=await certify(built.coq);goal.status=c.status==='verified'?'discovered':'error';goal.engines.coq=c;goal.sources.coq=built.coq.join('\n');goal.sources.isabelle=built.isabelle;
   }
  }
  goal.check_number=s.goal_checks;goal.detail??=goal.status==='discovered'?(s.scenario.domain==='theory'?'My stated conclusions meet the scenario obligations and are certified under the supplied rules.':'My question and my explicit strategy are certified.'):'My goal still needs certification.';
  s.solved=goal.status==='discovered';s.solution=s.solved?goal:null;return goal;
 }catch(e){return {status:'error',detail:e.message,check_number:s.goal_checks,engines:{},sources:{}};}
}
async function interpret(s,b,version){
 let queue=s.case_review,text=b.text;
 if(b.next_case){if(!queue?.ready)throw Error('I need to validate this case before reviewing the next.');text=queue.cases[queue.index];}
 if(typeof text!=='string'||text.trim().length<3||text.length>2500)throw Error('Explain one step in 3–2,500 characters.');
 if(s.claims.length>=128||s.history.length>=200)throw Error('Export this attempt and restart for a new trail.');
 if(b.case_revision&&queue){queue.cases[queue.index]=text;queue.ready=false;}
 else if(!b.next_case){const cases=await compile({op:'split',text,grouping:b.grouping||'auto'});queue=s.case_review=cases.length>1?{cases,index:0,ready:false,original:text}:null;text=cases[0];}
 s.pending=null;await save(s);
 const responses=[];let data;
 for(let i=0;i<4;i++){
  data=await compile({op:'interpret',text,accepted:s.claims,scenario:s.scenario,case_review:!!queue,responses});
  if(version!==cancellationVersion())throw Error('Interpretation cancelled; my draft is kept.');
  if(data.result)break;
  let r;try{r=await infer(data.request,version);}catch(e){if(!['schema_error','incomplete_json'].includes(e.code))throw e;const result={clarification:'Gemma could not format this interpretation reliably. My original thought is unchanged. I can retry it or review the wording; this is a tool error, not a failed argument.',original:text,case_review:queue?{index:queue.index+1,total:queue.cases.length}:null,diagnostic:{code:e.code,field:e.validation?.field??null,reason:e.validation?.reason??null}};s.last_clarification=result;await save(s);return result;}responses.push(r.content);
 }
 if(!data?.result)throw Error('Gemma did not finish its interpretation.');const t=data.result;
 const case_review=queue?{index:queue.index+1,total:queue.cases.length}:null;
 if(t.action==='clarify'){const result={clarification:(queue?'Let’s focus on one step at a time. ':'')+t.message,original:text,case_review};s.last_clarification=result;await save(s);return result;}
 const raw={id:'c'+(s.claims.length+1),kind:t.kind||'step',text,assumptions:t.assumptions,depends_on:t.depends_on,...(s.scenario.domain==='theory'?{conclusions:t.conclusions}:{conclusion:t.conclusion,strategy:t.strategy})};
 const claim=await compile({op:'parse',claim:raw,accepted:s.claims,scenario:s.scenario});
 const result={candidate_id:crypto.randomUUID(),original:text,case_review,interpretation:{...await view(claim,s.scenario),text:t.message}};
 s.pending={claim,result};await save(s);anticipate(s,claim);return result;
}
function anticipate(s,proposed){
 clearTimeout(predictionTimer);
 predictionTimer=setTimeout(async()=>{
  if(!(await backgroundPreparationEnabled())||active||s.benchmark||document.visibilityState!=='visible'||kernelHealth().state!=='ready'||!(await assetsReady()))return;
  try{
   const candidates=proposed?[proposed]:await compile({op:'predict',accepted:s.claims,scenario:s.scenario});
   // Bounded cache is private memory. No prediction enters a saved/public trail.
   for(const claim of candidates.slice(0,1)){if(active||!(await backgroundPreparationEnabled()))return;await verifyFormal(claim,s.claims,s.scenario,{anticipated:true});}
  }catch{/* Speculation cannot affect learner-visible results. */}
 },800);
}
async function exportSession(s){return {session_id:s.id,scenario:s.scenario,claims:await Promise.all(s.claims.map(c=>view(c,s.scenario))),graph:s.claims,history:s.history,progress:{accepted:s.claims.length,solved:s.solved},solution:s.solution,solution_checks:s.goal_checks,pending:s.pending?.result,case_review:s.case_review,stage_decision:s.stage_decision||null,previous_stage:s.previous_stage||null,entry_decision:s.entry_decision||null,next_stage:s.next_stage||null,model:MODEL};}
export async function localApi(path,b){
 const version=cancellationVersion();
 const url=new URL(path,location.href),route=url.pathname;
 if(route==='/api/status'){const ready=await assetsReady();return {model:{ready:ready&&!!navigator.gpu,detail:MODEL.name+'. '+MODEL.qat},prolog:{ready,detail:'SWI-Prolog 10.1.15 · WebAssembly · iterative deepening DFS'},coq:{installed:ready,health:kernelHealth().state,ready:ready&&kernelHealth().state==='ready',detail:kernelHealth().state==='unavailable'?kernelHealth().detail:kernelHealth().state==='ready'?'Coq 8.20.1 kernel self-check passed.':'Proof kernel self-check runs before verification.'}};}
 if(route==='/api/scenarios')return {scenarios:await scenarios()};
 if(route==='/api/scenario'&&!b)return (await scenarios())[0];
 if(route==='/api/import-theory'){await requireTools();return {scenario:await compile({op:'import',source:b.source})};}
 if(route==='/api/generate-challenge'){await requireTools();return {scenario:await compile({op:'generate_challenge',config:b.config})};}
 if(route==='/api/tutorial'){await requireTools();return {scenario:await compile({op:'tutorial'})};}
 if(route==='/api/generate-journey'){await requireTools();return {scenario:await compile({op:'generate_journey',spec:{config:b.config,choices:[]}})};}
 if(route==='/api/scenario'&&b){const list=await scenarios();const v=b.scenario;const base=v.source_text?await compile({op:'import',source:v.source_text}):list.find(s=>s.id===v.id);if(!base)throw Error('Unknown scenario');for(const k of ['title','description','goal'])if(typeof v[k]==='string'&&v[k].trim()&&v[k].length<2000)base[k]=v[k];return {scenario:base};}
 if(route==='/api/session'){
  if(!b)return exportSession(await session(url.searchParams.get('id')));
  const list=await scenarios();let scenario=b.scenario?copy(b.scenario):copy(list[0]);
  if(b.scenario){const known=list.find(x=>x.id===scenario.id);if(known)scenario={...copy(known),title:scenario.title,description:scenario.description,goal:scenario.goal};else scenario=await compile({op:'import',source:scenario.source_text});}
  const s={id:crypto.randomUUID(),scenario,guidance:b.guidance||'gentle',claims:[],history:[],solved:false,solution:null,goal_checks:0,hints:0,case_review:null,pending:null};await save(s);return {session_id:s.id,scenario,claims:[]};
 }
 const s=await session(b.session_id);
 if(route==='/api/prepare-next-stage'){
  await requireTools();if(!s.scenario.journey||!(await backgroundPreparationEnabled()))return {prepared:0};
  // Preparation is private, deterministic compilation. It creates no accepted
  // reasoning, no new session and no exported future evidence.
  let prepared=0;for(const choice of s.scenario.journey.available){if(!(await backgroundPreparationEnabled())||document.visibilityState!=='visible')break;await stagePreview(s,choice.id);prepared++;}
  return {prepared};
 }
 if(route==='/api/next-stage'){
  await requireTools();if(!s.solved)throw Error('Establish the current stage goal before choosing the next evidence.');
  if(typeof b.rationale!=='string'||b.rationale.length>2500)throw Error('Use at most 2,500 characters for the optional decision note.');
  if(stageTransitions.has(s.id)){const pending=stageTransitions.get(s.id);if(pending.choice!==b.choice)throw Error('Another evidence choice is already being prepared.');return pending.task;}
  const task=(async()=>{
   const current=await session(s.id);
   if(current.next_stage){if(current.stage_decision?.choice!==b.choice)throw Error('This stage already has a chosen continuation. Restart to explore another path.');return exportSession(await session(current.next_stage));}
   const scenario=await stagePreview(current,b.choice);
   const decision={choice:b.choice,rationale:b.rationale,assessment:'personal decision rationale; not graded',from_stage:current.scenario.journey.stage,when:new Date().toISOString()};
   const child={id:crypto.randomUUID(),scenario,guidance:current.guidance,claims:[],history:[],solved:false,solution:null,goal_checks:0,hints:0,case_review:null,pending:null,previous_stage:current.id,entry_decision:decision};
   await save(child);current.next_stage=child.id;current.stage_decision=decision;await save(current);return exportSession(child);
  })();stageTransitions.set(s.id,{choice:b.choice,task});try{return await task;}finally{stageTransitions.delete(s.id);}
 }
 if(['gentle','more','minimal'].includes(b.guidance))s.guidance=b.guidance;
 if(route==='/api/hint'){const level=b.level??0;if(!Number.isInteger(level)||level<0||level>3)throw Error('Choose a support level from 0 to 3.');if(['gentle','more','minimal'].includes(b.guidance))s.guidance=b.guidance;const feedback=hintFor(s,level);s.hints++;await save(s);return {feedback,level,source:'instructional support; not a claim'};}
 await requireTools();
 if(active)throw Error('A local step is still running.');const turnStarted=performance.now();let turnOutcome='error';active=true;clearTimeout(predictionTimer);
 try{
  if(route==='/api/interpret'){const result=await interpret(s,b,version);turnOutcome=result.candidate_id?'success':result.diagnostic?.code||'clarification';return result;}
  if(route==='/api/verify'){
   if(s.pending?.result.candidate_id!==b.candidate_id)throw Error('This interpretation is no longer current.');
   const claim=s.pending.claim;const started=performance.now();let checked;
   try{checked=await verifyFormal(claim,s.claims,s.scenario);}catch(e){checked={status:'error',engines:{},sources:{},detail:e.message};}
   if(checked.status==='verified'){s.claims.push(claim);s.pending=null;}
   const goal=await checkGoal(s); // Every attempt, including errors and rejections.
   const feedback=goal.status==='discovered'?'I have established my goal. Which connection made the difference?':goal.status==='awaiting_strategy'?'I can identify both doors. Which door will I go through after yes, and which after no?':checked.status==='verified'?(s.scenario.challenge&&goal.graph?.missing?.length?'My statements follow from the supplied rules. One remaining part is: '+goal.graph.missing[0]+'. I can choose this or another open part of my review.':'That thought holds. What can I work out next?'):checked.status==='error'?'I could not finish checking this thought. '+(checked.detail||'I can inspect the engine output and retry.'):checked.status==='unsupported'?'The supplied rules do not establish this claim. That is not proof that it is false. What additional evidence or rule would I need?':'My thought does not follow in this form. Which assumption or case needs another look?';
   const result={...checked,feedback:feedback+(!s.solved&&checked.status==='verified'&&s.guidance==='more'?' '+coachingPrompt(s,checked.status):''),claim:checked.status==='verified'?await view(claim,s.scenario):null,progress:{accepted:s.claims.length,solved:s.solved},solution_check:goal,solution:s.solution,timing:{...checked.timing,verification_seconds:(performance.now()-started)/1000}};
   s.history.push({student:claim.text,interpretation:await view(claim,s.scenario),result});
   if(checked.status==='verified'&&s.case_review){const q=s.case_review;q.index++;q.ready=q.index<q.cases.length;result.next_case_available=q.ready&&!s.solved;if(!q.ready)s.case_review=null;}
   if(s.solved){s.solution.argumentation=await compile({op:'review',session:s});result.solution=copy(s.solution);}
   await save(s);anticipate(s);turnOutcome=checked.status==='verified'?'success':checked.status;return result;
  }
  if(route==='/api/check-solution'){const goal=await checkGoal(s);if(s.solved)s.solution.argumentation=await compile({op:'review',session:s});await save(s);return {solution_check:goal,solution:s.solution,progress:{accepted:s.claims.length,solved:s.solved}};}
  throw Error('Unknown local operation');
 }finally{measure(route==='/api/interpret'?'interpretation_turn':'verification_turn',{outcome:turnOutcome,seconds:(performance.now()-turnStarted)/1000});active=false;}
}
