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
import {prepareGraphIndex,graphSuggestions,graphVectorAnnotations,EXTRACTION_SCHEMAS} from './graph-retrieval.js';
import {extractProposal,compactProposal} from './extraction.js';
import {scaffoldResponse} from './scaffolding.js';
import {tracedDependencies} from './graph-trace.js';
import {resolveSessionScenario} from './session-scenario.js';
let catalogue,active=false;const proofCache=new Map(),inFlight=new Map();let predictionTimer;
const stagePreviews=new Map(),stageTransitions=new Map();
async function stagePreview(s,choice){
 const j=s.scenario.journey;if(!j||!j.available.some(c=>c.id===choice))throw Error('This evidence choice is unavailable or exceeds the remaining budget.');
 const key=s.scenario.source_hash+':'+choice;
 if(!stagePreviews.has(key)){
  const task=compile({op:'generate_journey',spec:{version:j.version,config:j.config,task_config:j.task_config,choices:[...j.choices,choice]}}).catch(e=>{stagePreviews.delete(key);throw e;});
  stagePreviews.set(key,task);if(stagePreviews.size>12)stagePreviews.delete(stagePreviews.keys().next().value);
 }
 return copy(await stagePreviews.get(key));
}
export function resetVerificationCache(){if(active||inFlight.size)throw Error('Verification is busy');clearTimeout(predictionTimer);proofCache.clear();}
const copy=x=>structuredClone(x);
const save=s=>put('session:'+s.id,s);
export async function scenarios(){return catalogue??=await(await fetch('/Experiment/data/scenarios.json')).json();}
export async function requireTools(){if(!(await assetsReady()))throw Error('Open Device setup and consent to install the offline tools. My draft is saved on this device.');}
async function session(id){const s=await get('session:'+id);if(!s)throw Error('This attempt is not stored on this device. Start a scenario or import a saved attempt.');if(s.scenario.revision!=='problem-only-v1')throw Error('This saved attempt uses the earlier scenario rules. Choose a scenario to start a fresh attempt with problem-only facts. The old record remains stored on this device.');if(s.reasoning_contract!=='grounded-v2'){if(s.solution)s.previous_solution=s.solution;s.solved=false;s.solution=null;s.reasoning_contract='grounded-v2';s.contract_notice='This attempt predates the current grounding and rule-citation checks. Its trail is preserved; completion must be checked again.';await save(s);}return s;}
async function view(c,s){return compile({op:'view',claim:c,scenario:s});}
export async function verifyFormal(claim,accepted,scenario,{cache=true,anticipated=false}={}){
 const compiled=await compile({op:'compile',claim,accepted,scenario});
 const key=await compile({op:'key',claim:compiled.claim,accepted,scenario});
 let evidence=cache?proofCache.get(key):null;
 const reused=!!evidence,joined=!evidence&&inFlight.has(key),started=performance.now();
 if(!evidence){
  if(!inFlight.has(key))inFlight.set(key,(async()=>{
  let p=await prolog(compiled.prolog),world=null;
  if(compiled.world_prolog){world=await prolog(compiled.world_prolog);if(p.status==='unsupported'&&world.status==='refuted')p={...p,status:'refuted',detail:'The scenario derives the opposite of my assertion.',world};}
  let sentences=compiled.coq;
  if(p.status==='verified'&&scenario.domain==='theory')sentences=await compile({op:'named_certificate',claim:compiled.claim,accepted,scenario,result:p});
  if(p.status==='verified'){const health=await ensureKernel();if(health.state!=='ready')throw Object.assign(Error('My proof verifier is unavailable. My draft is kept. '+health.detail),{code:'kernel_unavailable'});}
  const c=p.status==='verified'?await certify(sentences,90000,{anticipated}):{status:'not_requested',detail:'No positive Prolog derivation to certify.'};
  const built={status:p.status==='verified'?c.status==='verified'?'verified':'error':p.status,anticipated,visited:!anticipated,engines:{prolog:{...p,detail:'Iterated depth-first search in SWI-Prolog.'},...(world?{world_prolog:world}:{}),coq:c},sentences,trace:p.trace};
  built.scopes=[];
  if(['theory','guards'].includes(scenario.domain)){
   for(const scope of await compile({op:'scopes',claim:compiled.claim,accepted,scenario})){
    if(scope.inconsistent){built.scopes.push({id:scope.id,label:scope.label,status:'inconsistent',hypothetical:scope.hypothetical,detail:'Conflicting roots; no certificate or completion credit.'});continue;}
    if(scope.id==='explicit'){built.scopes.push({id:scope.id,label:scope.label,status:built.status,engines:{prolog:p,coq:c},sources:{prolog:compiled.prolog,coq:sentences.join('\n')},hypothetical:scope.hypothetical});continue;}
    try{const sp=await prolog(scope.prolog);let ss=[],sc={status:'not_requested',detail:'No positive derivation to certify.'};const positive=sp.status==='verified'||scope.kind==='goal'&&sp.status==='discovered';if(positive){ss=await compile({op:'scope_certificate',scope_id:scope.id,claim:compiled.claim,accepted,scenario,result:sp});sc=await certify(ss);}built.scopes.push({id:scope.id,label:scope.label,status:positive?sc.status:sp.status,engines:{prolog:sp,coq:sc},sources:{prolog:scope.prolog,coq:ss.join('\n'),isabelle:scope.isabelle},inferred_dependencies:tracedDependencies(scope,sp,accepted),hypothetical:scope.hypothetical,missing:scope.missing});}catch(e){built.scopes.push({id:scope.id,label:scope.label,status:'error',detail:e.message});}
   }
  }
  if(built.status==='verified'){proofCache.set(key,copy(built));if(proofCache.size>64)proofCache.delete(proofCache.keys().next().value);}
  return built;
  })().finally(()=>inFlight.delete(key)));
  evidence=await inFlight.get(key);
 }
 measure('verification_cache',{outcome:'success',seconds:(performance.now()-started)/1000,hit:reused,joined,anticipated,sourceAnticipated:!!evidence.anticipated});
 if(!anticipated&&proofCache.has(key))proofCache.get(key).visited=true;
 return {status:evidence.status,engines:copy(evidence.engines),verification_scopes:copy(evidence.scopes||[]),sources:{prolog:compiled.prolog,...(compiled.world_prolog?{world_prolog:compiled.world_prolog}:{}),coq:evidence.sentences.join('\n'),isabelle:compiled.isabelle,imported_theory:scenario.source_text},scope:compiled.scope,graph:{...compiled.graph,...(evidence.trace?{trace:evidence.trace}:{} )},timing:{cache_hit:reused,in_flight_joined:joined},counterexample:evidence.status==='refuted'?{detail:'My claim fails in a scenario case. '+JSON.stringify(evidence.engines.prolog)}:null};
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
 const responses=[];let data;const suggestions=await graphSuggestions(s.scenario,text);
 const factReferences=Object.entries(s.scenario.nodes||{}).filter(([,n])=>n.fact).map(([id,n],i)=>({id,aliases:['Fact F'+(i+1),n.label]}));
 const ruleReferences=(s.scenario.rules||[]).map((r,i)=>({id:r.id,aliases:['Rule '+(i+1)]}));
 const selectedSchemas=suggestions.filter(x=>x.type==='schema');
 const schemas=selectedSchemas.length?selectedSchemas:EXTRACTION_SCHEMAS.filter(x=>x.id==='schema:reason'||x.id==='schema:conditional');
 const schemaExamples=schemas.map(({id,text,schema})=>({id,text,schema}));
 const proposal=await extractProposal(text,{schemaExamples,references:[...factReferences,...ruleReferences]});
 // Strict extraction diagnostics have not established argument fidelity.
 // Record proposals for inspection; compact refinement is an explicit lab mode.
 const architecture=b.architecture??'baseline';
 if(!['baseline','compact','encoder-refine'].includes(architecture))throw Error('Unsupported response architecture.');
 // Production keeps the original translation and full meaning audits.
 // Experimental modes remain explicit and recorded for controlled comparison.
 const mode=architecture;
 for(let i=0;i<=6;i++){
  data=await compile({op:'interpret',text,accepted:s.claims,scenario:s.scenario,case_review:!!queue,responses,architecture:mode,encoder_proposal:compactProposal(proposal)});
  if(version!==cancellationVersion())throw Error('Interpretation cancelled; my draft is kept.');
  if(data.result)break;
  if(i===6)throw Error('Interpretation reached its six-call limit. My draft is unchanged; I can retry or clarify one reference.');
  if(suggestions.length){try{const last=data.request.messages.at(-1),context=JSON.parse(last.content);last.content=JSON.stringify({...context,reference_suggestions:suggestions});data.request.messages[0].content+=' Retrieval hints may be wrong; preserve meanings actually expressed in the original thought, using the full supplied vocabulary.';}catch{}}
  let r;try{r=await infer(data.request,version);}catch(e){if(!['schema_error','incomplete_json'].includes(e.code))throw e;const result={clarification:'Gemma could not format this interpretation reliably. My original thought is unchanged. I can retry it or review the wording; this is a tool error, not a failed argument.',original:text,case_review:queue?{index:queue.index+1,total:queue.cases.length}:null,diagnostic:{code:e.code,field:e.validation?.field??null,reason:e.validation?.reason??null}};s.last_clarification=result;await save(s);return result;}responses.push(r.content);
 }
 if(!data?.result)throw Error('Gemma did not finish its interpretation.');const t=data.result;
 const case_review=queue?{index:queue.index+1,total:queue.cases.length}:null;
 if(t.action==='clarify'){const result={clarification:(queue?'Let’s focus on one step at a time. ':'')+t.message,original:text,case_review,...(s.benchmark&&t.diagnostic?{diagnostic:t.diagnostic}:{})};s.last_clarification=result;await save(s);return result;}
 const raw={id:'c'+(s.claims.length+1),kind:t.kind||'step',text,assumptions:t.assumptions,depends_on:t.depends_on,...(s.scenario.domain==='theory'?{conclusions:t.conclusions}:{conclusion:t.conclusion,strategy:t.strategy})};
 const claim=await compile({op:'parse',claim:raw,accepted:s.claims,scenario:s.scenario});
 const result={candidate_id:crypto.randomUUID(),original:text,case_review,interpretation:{...await view(claim,s.scenario),text:t.message}};
 s.pending={claim,result,encoder_proposal:compactProposal(proposal),architecture:mode};await save(s);anticipate(s,claim);return result;
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
async function exportSession(s){return {session_id:s.id,scenario:s.scenario,claims:await Promise.all(s.claims.map(async c=>({...await view(c,s.scenario),epistemic:s.history.find(h=>h.interpretation?.id===c.id&&h.result?.status==='verified')?.result?.graph?.epistemic}))),graph:s.claims,history:s.history,reasoning_contract:s.reasoning_contract,contract_notice:s.contract_notice,previous_solution:s.previous_solution,progress:{accepted:s.claims.length,solved:s.solved},solution:s.solution,solution_checks:s.goal_checks,pending:s.pending?.result,case_review:s.case_review,stage_decision:s.stage_decision||null,previous_stage:s.previous_stage||null,entry_decision:s.entry_decision||null,next_stage:s.next_stage||null,model:MODEL};}
export async function localApi(path,b){
 const version=cancellationVersion();
 const url=new URL(path,location.href),route=url.pathname;
 if(route==='/api/narrative'){
  await requireTools();const bounded=(v,n)=>String(v||'').slice(0,n);
  const data={context:bounded(b.context,80),subject:bounded(b.subject,120),task:bounded(b.task,30),interest:bounded(b.interest,160),character:bounded(b.character,60),place:bounded(b.place,80),mood:bounded(b.mood,80),exposition:bounded(b.exposition,420),answers:(Array.isArray(b.answers)?b.answers:[]).slice(0,3).map(a=>({question:bounded(a.question,140),answer:bounded(a.answer,240)}))};
  const format={type:'object',properties:{character:{type:'string',maxLength:60},place:{type:'string',maxLength:80},questions:{type:'array',maxItems:3,items:{type:'string',maxLength:140}},exposition:{type:'string',maxLength:420}},required:['character','place','questions','exposition'],additionalProperties:false};
  const r=await infer({messages:[{role:'system',content:'Personalise a fictional learning setting using these preferences as data. Preserve the selected discipline and context. Suggest at most three brief optional questions about atmosphere or interests and a short first-person exposition. Use answered preferences; do not repeat answered questions. No facts, rules, allegations about real people, solutions, violence or claims of verified truth. Return only the requested JSON.'},{role:'user',content:JSON.stringify(data)}],format,options:{num_predict:650}});const result=JSON.parse(r.content);
  if(!Array.isArray(result.questions)||result.questions.length>3||Object.entries({character:60,place:80,exposition:420}).some(([k,n])=>typeof result[k]!=='string'||result[k].length>n)||[result.character,result.place,result.exposition,...result.questions].some(v=>typeof v!=='string'||/[\r\n]|\(\*|\*\)/.test(v))||result.questions.some(q=>q.length>140))throw Error('The narrative suggestion needs manual editing.');return result;
 }
 if(route==='/api/context-research'){
  if(b.consent!==true||typeof b.topic!=='string'||b.topic.length>240)throw Error('Explicit contextual research consent is required.');
  if(!navigator.serviceWorker?.controller)throw Error('Reload to enable consented research.');
  const lease=new MessageChannel();await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Reload to enable consented research.')),5000);lease.port1.onmessage=e=>{clearTimeout(timer);lease.port1.close();e.data?.ok?resolve():reject(Error('Research permission unavailable.'));};navigator.serviceWorker.controller.postMessage({type:'allow-context-research'},[lease.port2]);});
  const endpoint='https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=1&srsearch='+encodeURIComponent(b.topic);
  try{const r=await fetch(endpoint,{signal:AbortSignal.timeout(15000),credentials:'omit',referrerPolicy:'no-referrer'});if(!r.ok)throw Error('Source search failed.');const text=await r.text();if(text.length>100000)throw Error('Source response too large.');const entry=JSON.parse(text).query?.search?.[0];if(!entry)throw Error('No matching source.');return {title:String(entry.title).slice(0,150),url:'https://en.wikipedia.org/wiki/'+encodeURIComponent(entry.title),notes:String(entry.snippet).replace(/<[^>]*>/g,'').slice(0,450)+' [Context only; not a verified premise.]'};}finally{navigator.serviceWorker.controller?.postMessage({type:'end-context-research'});}
 }
 if(route==='/api/status'){const ready=await assetsReady();return {model:{ready:ready&&!!navigator.gpu,detail:MODEL.name+'. '+MODEL.qat},prolog:{ready,detail:'SWI-Prolog 10.1.15 · WebAssembly · iterative deepening DFS'},coq:{installed:ready,health:kernelHealth().state,ready:ready&&kernelHealth().state==='ready',detail:kernelHealth().state==='unavailable'?kernelHealth().detail:kernelHealth().state==='ready'?'Coq 8.20.1 kernel self-check passed.':'Proof kernel self-check runs before verification.'}};}
 if(route==='/api/scenarios')return {scenarios:await scenarios()};
 if(route==='/api/scenario'&&!b)return (await scenarios())[0];
 if(route==='/api/import-theory'){await requireTools();return {scenario:await compile({op:'import',source:b.source})};}
 if(route==='/api/generate-challenge'){await requireTools();return {scenario:await compile({op:'generate_challenge',config:b.config})};}
 if(route==='/api/generate-task'){await requireTools();return {scenario:await compile({op:'generate_task',config:b.config})};}
 if(route==='/api/tutorial')return {scenario:await(await fetch('/Experiment/data/tutorial.json')).json()};
 if(route==='/api/generate-journey'){await requireTools();return {scenario:await compile({op:'generate_journey',spec:{config:b.config,choices:[]}})};}
 if(route==='/api/scenario'&&b){const list=await scenarios();const v=b.scenario;const base=v.source_text?await compile({op:'import',source:v.source_text}):list.find(s=>s.id===v.id);if(!base)throw Error('Unknown scenario');for(const k of ['title','description','goal'])if(typeof v[k]==='string'&&v[k].trim()&&v[k].length<2000)base[k]=v[k];return {scenario:base};}
 if(route==='/api/session'){
  if(!b)return exportSession(await session(url.searchParams.get('id')));
  const scenario=await resolveSessionScenario(b.scenario,await scenarios(),{
   loadTutorial:async()=>await(await fetch('/Experiment/data/tutorial.json')).json(),
   importTheory:source=>compile({op:'import',source})
  });
  const s={id:crypto.randomUUID(),reasoning_contract:'grounded-v2',scenario,guidance:b.guidance||'gentle',claims:[],history:[],solved:false,solution:null,goal_checks:0,hints:0,case_review:null,pending:null};await save(s);return {session_id:s.id,scenario,claims:[]};
 }
 const s=await session(b.session_id);
 if(route==='/api/prepare-graph'){await requireTools();return {ready:!!await prepareGraphIndex(s.scenario)};}
 if(route==='/api/graph-annotations')return {annotations:await graphVectorAnnotations(s.scenario),worlds:await compile({op:'world_state',scenario:s.scenario,accepted:s.claims})};
 if(route==='/api/modal-query')return compile({op:'modal_query',scenario:s.scenario,accepted:s.claims,expression:b.expression,scope:b.scope||'scenario'});
 if(route==='/api/temporal-inspect')return compile({op:'temporal-inspect',scenario:s.scenario,query_id:b.query_id});
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
   const claim=s.pending.claim,extraction=s.pending.encoder_proposal,architecture=s.pending.architecture;const started=performance.now();let checked;
   try{checked=await verifyFormal(claim,s.claims,s.scenario);}catch(e){checked={status:'error',engines:{},sources:{},detail:e.message};}
   if(checked.graph&&extraction)checked.graph.extraction_review={architecture,proposal:extraction,authority:'Unverified wording proposal; this proof certifies only the player-confirmed formal claim.'};
   if(checked.status==='verified'){s.claims.push(claim);s.pending=null;}
   const goal=await checkGoal(s); // Every attempt, including errors and rejections.
   const epistemic=checked.graph?.epistemic;
   const feedback=goal.status==='discovered'?'I have established my goal.':goal.status==='awaiting_strategy'?'I can identify both doors; my door-choice strategy still needs to be established.':checked.status==='verified'&&epistemic&&!epistemic.grounded?'My conditional connection holds, but it has not established these states. I can connect the premises to given facts or established earlier steps.':checked.status==='verified'?(s.scenario.challenge&&goal.graph?.missing?.length?'My connection follows from my stated premises. One remaining part is: '+goal.graph.missing[0]+'. I can choose this or another open part of my review.':'That connection holds.'):checked.status==='error'?'I could not finish checking this thought. '+(checked.detail||'I can inspect the engine output and retry.'):checked.status==='unsupported'?'My stated premises do not establish this claim. That is not proof that it is false.':'My thought does not follow in this form.';
   const rendered=await scaffoldResponse(checked,goal,feedback,s.guidance,{scenario:s.scenario,claim,claims:s.claims});
   const result={...checked,response_category:rendered.category,response_renderer:rendered.renderer,feedback:rendered.message+(!s.solved&&checked.status==='verified'&&s.guidance==='more'?' '+coachingPrompt(s,checked.status):''),claim:checked.status==='verified'?await view(claim,s.scenario):null,progress:{accepted:s.claims.length,solved:s.solved},solution_check:goal,solution:s.solution,timing:{...checked.timing,verification_seconds:(performance.now()-started)/1000}};
   if(result.claim)result.claim.epistemic=epistemic;
   if(result.verification_scopes?.length){result.verification_scopes=result.verification_scopes.filter(v=>v.id!=='completion');result.verification_scopes.push({id:'completion',label:'Grounded goal coverage after this attempt',status:goal.status,engines:goal.engines,sources:goal.sources,missing:goal.graph?.missing});}
   s.history.push({student:claim.text,interpretation:await view(claim,s.scenario),result});
   if(checked.status==='verified'&&s.case_review){const q=s.case_review;q.index++;q.ready=q.index<q.cases.length;result.next_case_available=q.ready&&!s.solved;if(!q.ready)s.case_review=null;}
   if(s.solved){s.solution.argumentation=await compile({op:'review',session:s});result.solution=copy(s.solution);}
   await save(s);anticipate(s);turnOutcome=checked.status==='verified'?'success':checked.status;return result;
  }
  if(route==='/api/check-solution'){const goal=await checkGoal(s);if(s.solved)s.solution.argumentation=await compile({op:'review',session:s});await save(s);return {solution_check:goal,solution:s.solution,progress:{accepted:s.claims.length,solved:s.solved}};}
  throw Error('Unknown local operation');
 }finally{measure(route==='/api/interpret'?'interpretation_turn':'verification_turn',{outcome:turnOutcome,seconds:(performance.now()-turnStarted)/1000});active=false;}
}
