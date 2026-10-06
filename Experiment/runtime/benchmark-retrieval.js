import {resetProlog} from './proofs.js';
import {localApi,resetVerificationCache} from './local-api.js';
import {compile,resetCompiler} from './compiler.js';
import {resetKernel} from './coq.js';
import {cancel} from './model.js';
import {get,put,remove} from './store.js';
import {assetsReady,MODEL} from './assets.js';
import {offlineState} from './pwa.js';
import {embeddingStatus,EMBEDDING_MODEL} from './embedding-assets.js';
import {embedTexts,disposeEmbeddings} from './embedding.js';
import {exampleCorpus,augmentRequest,setRetrievalMode} from './example-retrieval.js';
import {validateCorpus,coverage,cosine,eligibleRequest} from './example-selection.js';
import {measurementCursor,measurementsSince,distribution,summarizeMeasurements} from './telemetry.js';
import {summarizeReport} from './benchmark-summary.js';

// This isolated case and its oracles are benchmark material, never demonstrations.
export const RETRIEVAL_CASE=`theory Calibration_Crate_Review imports Main begin
(* thread:title The calibration crate · retrieval evaluation *)
(* thread:description I review a fictional dispatch record. I distinguish an intact seal, a recorded entry and the direction of a receipt handover. *)
(* thread:goal ready *)
(* thread:label sealed = The calibration crate has an unbroken seal *)
(* thread:label logged = The calibration crate has an entry in the dispatch log *)
(* thread:label ready = The calibration crate is ready for dispatch *)
(* thread:label forward = Neri handed the receipt to Oswin *)
(* thread:label reverse = Oswin handed the receipt to Neri *)
locale Crate_Review = fixes sealed logged ready forward reverse :: "bool"
assumes seal: "sealed" and entry: "logged" and handover: "forward"
and dispatch: "sealed & logged ==> ready"
begin end end`;
const lit=(id,positive=true)=>({id,positive});
export function retrievalFixtures(){return [
 {id:'assertion',input:'I assert that the seal on the calibration crate is unbroken.',conclusions:[lit('sealed')],assumptions:[],verification:'verified',solved:false},
 {id:'negation',input:'I assert that the calibration crate does not have an unbroken seal.',conclusions:[lit('sealed',false)],assumptions:[],verification:'refuted',solved:false},
 {id:'reason',input:'I conclude the calibration crate is ready to go out, because its seal is unbroken and its dispatch log entry is present.',conclusions:[lit('ready')],assumptions:[lit('sealed'),lit('logged')],verification:'verified',solved:true},
 {id:'unsupported',input:'The calibration crate floated through a portal to the lighthouse.',clarify:true},
 {id:'question',input:'Is the calibration crate ready to be dispatched?',clarify:true},
 {id:'role-swap',input:'It was Oswin who passed the receipt to Neri.',conclusions:[lit('reverse')],assumptions:[],verification:'unsupported',solved:false}
 ];}
const literalKey=values=>JSON.stringify((values||[]).map(v=>`${v.id}:${v.positive}`).sort());
export function retrievalMeaningMatches(response,fixture){
 if(fixture.clarify)return !response.candidate_id&&typeof response.clarification==='string'&&!!response.clarification.trim()&&!response.diagnostic;
 const graph=response.interpretation?.graph;
 return !!response.candidate_id&&!!graph&&literalKey(graph.conclusions)===literalKey(fixture.conclusions)&&literalKey(graph.assumptions)===literalKey(fixture.assumptions)&&Array.isArray(graph.depends_on)&&!graph.depends_on.length;
}
function assert(value,message){if(!value)throw Error(message);}
class Blocked extends Error{}
const promptSize=request=>({messageCharacters:request.messages.reduce((n,m)=>n+m.content.length,0),schemaCharacters:JSON.stringify(request.format).length});
export function retrievalSelectionDiagnostics(turn,measurements){
 const events=measurements.filter(e=>e.category==='example_selection'),selected=events.filter(e=>e.outcome==='selected'),fallback=events.filter(e=>e.outcome==='fallback');
 const hasWorkerPrompt=measurements.some(e=>['model_cold','model_warm','model_attempt'].includes(e.category)&&Number.isFinite(e.promptCharacters)&&e.promptCharacters>0);
 // No telemetry can mean that setup/inference failed before selection. It must
 // not inflate the number of measured baseline fallbacks.
 const requestObserved=turn.inferenceAttempted&&(hasWorkerPrompt||!!turn.interpretation);
 const state=selected.length?'selected':fallback.length?'fallback':requestObserved?(turn.mode==='fixed'?'fixed':'fallback'):'unmeasured';
 return {requestedMode:turn.mode,state,selectedIds:selected.map(e=>e.exampleId),fallbacks:fallback.map(e=>e.reason),events,baselineUsed:state==='unmeasured'?null:state==='fixed'||state==='fallback',reason:state==='unmeasured'?'No completed interpretation, worker prompt or selection event was observed.':state==='fallback'&&!fallback.length?'The request completed without a selected example; the fixed prompt was retained.':null};
}
export function summarizeRetrievalConditions(turns){
 return Object.fromEntries(['fixed','lexical','semantic'].map(mode=>{
  const rows=turns.filter(t=>t.mode===mode),attempted=rows.filter(t=>t.inferenceAttempted);
  return [mode,{planned:6,pass:rows.filter(t=>t.status==='pass').length,fail:rows.filter(t=>t.status==='fail').length,blocked:rows.filter(t=>t.status==='blocked').length,inferenceNotRun:rows.filter(t=>!t.inferenceAttempted).length,meaningAttempted:attempted.length,meaningMatched:attempted.filter(t=>t.meaningMatches===true).length,meaningMismatched:attempted.filter(t=>t.meaningMatches===false).length,meaningUnavailable:attempted.filter(t=>typeof t.meaningMatches!=='boolean').length,selected:rows.filter(t=>t.selection?.state==='selected').length,baselineFallbacks:rows.filter(t=>mode!=='fixed'&&t.inferenceAttempted&&t.selection?.state==='fallback').length,selectionUnmeasured:rows.filter(t=>t.selection?.state==='unmeasured'||!t.selection).length,wholeTurn:distribution(rows.map(t=>t.wholeTurnSeconds)),interpretation:distribution(rows.map(t=>t.interpretationSeconds)),actualPromptCharacters:rows.flatMap(t=>t.prompt?.actualWorkerCharacters||[])}];
 }));
}

export async function runRetrievalBenchmark({label,power='unspecified',startState='cold',signal,onResult=()=>{},onStatus=()=>{}}={}){
 assert(label?.trim(),'Describe the device and browser before running the benchmark.');
 assert(['charging','battery','unspecified'].includes(power),'Invalid power condition');assert(['cold','warm'].includes(startState),'Invalid worker start state');
 const started=performance.now(),cursor=measurementCursor(),originalMode=await get('example-selection-mode'),fixtures=retrievalFixtures();
 const report={schema:3,suite:'example-retrieval-v2',runId:crypto.randomUUID(),device:label,powerCondition:power,startState,includeModel:true,scenarioSelection:'held-out-calibration-crate',started:new Date().toISOString(),pageVisibility:document.visibilityState,userAgent:navigator.userAgent,platform:navigator.userAgentData?.platform||navigator.platform,hardwareConcurrency:navigator.hardwareConcurrency,memoryGB:navigator.deviceMemory??null,secureContext:isSecureContext,crossOriginIsolated,online:navigator.onLine,cacheOnly:!!await offlineState(),model:MODEL,embeddingModel:EMBEDDING_MODEL,build:await(await fetch('/Experiment/data/build.json')).json(),results:[],turns:[],manual:[],accuracy:{attempted:0,matched:0},plannedTurns:18,engines:{prolog:'SWI 10.1.15 / npm 8.1.4',kernel:'Coq 8.20.1 / jsCoq 1.99.2',litert:'0.17.1',compiler:'Pyodide 0.29.1'},scope:'Six authored held-out thoughts in a separate fictional imported case × fixed, lexical and semantic example selection. Real localApi interpretation; an exact meaning oracle reviews before ordinary confirmation and formal verification. This is a developer regression, not human review, gameplay UI testing or evidence of learning. Corpus membership checks do not prove linguistic independence.',resetPolicy:'Proof cache cleared for every isolated turn. Cold resets Gemma, compiler, kernel and encoder before every turn; stored assets/index remain. Warm retains available engines. Auxiliary corpus/vector checks precede the turn comparisons. Condition order rotates by fixture to reduce a fixed order advantage.',retrievalPolicy:'No downloads are started. Missing optional encoder assets block semantic conditions. A supported fallback is recorded as baseline use, never a semantic speed/accuracy success. Failed calls remain in per-mode meaning denominators; unobserved selection is distinct from fallback.'};
 const stop=()=>{if(signal?.aborted)throw new Blocked('Stopped by user; this check was not completed.');};
 const stopWorkers=()=>{cancel();disposeEmbeddings();};signal?.addEventListener('abort',stopWorkers,{once:true});
 let ready=false,encoderReady=false,corpusRecord,scenario,setupError;
 const test=async(name,fn)=>{
  onStatus(name);const t=performance.now();let row;
  try{stop();const detail=await fn();row={name,status:'pass',seconds:(performance.now()-t)/1000,detail:detail??''};}
  catch(error){row={name,status:error instanceof Blocked||signal?.aborted?'blocked':'fail',seconds:(performance.now()-t)/1000,detail:error.evidence?{...error.evidence,error:error.message}:error.message,outcome:error.code||(error instanceof Blocked?'dependency_blocked':'test_error')};}
  report.results.push(row);onResult(row);await put('benchmark:latest',report);return row;
 };
 const requireTools=()=>{if(!ready)throw new Blocked('Install the local reasoning tools first.');if(!navigator.gpu)throw new Blocked('WebGPU is unavailable.');if(!scenario)throw new Blocked('The isolated benchmark case was not imported: '+(setupError||'unavailable'));};
 try{
  ready=await assetsReady();report.embeddingInstallation=await embeddingStatus();encoderReady=report.embeddingInstallation.ready;
  await test('Example library · 28 approaches × three English profiles',async()=>{
   corpusRecord=await exampleCorpus();const corpus=validateCorpus(corpusRecord.corpus),matrix=coverage(corpus),declared=new Set((corpus.approaches||[]).map(a=>a.id));
   assert(matrix.examples===84&&matrix.approaches===28&&matrix.profiles===3&&!matrix.missing.length,'The complete 28 × 3 example matrix is missing');
   assert(JSON.stringify(matrix.languages)===JSON.stringify(['en'])&&declared.size===28,'Unexpected approach/language declaration');
   assert(corpus.examples.every(e=>declared.has(e.approach)),'Example uses an undeclared approach');
   assert(fixtures.every(f=>!corpus.examples.some(e=>e.input.trim().toLowerCase()===f.input.trim().toLowerCase())),'A held-out input was included in the demonstration library');
   assert(!JSON.stringify(corpus).includes('Calibration_Crate_Review'),'The held-out case was included in the library');
   report.corpus={hash:corpusRecord.hash,version:corpus.version,coverage:matrix};return report.corpus;
  });
  await test('Held-out case · ordinary THY import',async()=>{
   if(!ready)throw new Blocked('Install the local reasoning tools first.');
   try{scenario=(await localApi('/api/import-theory',{source:RETRIEVAL_CASE})).scenario;assert(scenario.custom&&scenario.nodes.ready&&!scenario.nodes.ready.fact&&scenario.targets.length===1&&scenario.targets[0]==='ready','Benchmark import changed the case or supplied its answer');return {sourceHash:scenario.source_hash,nodes:Object.keys(scenario.nodes).length,rules:scenario.rules.length};}
   catch(e){setupError=e.message;throw e;}
  });
  await test('Selection fallback · fixed prompt preserved without an eligible match',async()=>{
   if(!scenario)throw new Blocked('The benchmark case is unavailable.');
   const request=(await compile({op:'interpret',text:'Zyxqv plmnb rqstv.',accepted:[],scenario,responses:[]})).request;
   assert(eligibleRequest(request),'The no-match fixture did not use a retrievable named prompt');const before=JSON.stringify(request),fixed=await augmentRequest(request,{mode:'fixed',signal}),fallback=await augmentRequest(request,{mode:'lexical',signal});
   assert(JSON.stringify(fixed)===before&&JSON.stringify(fallback)===before,'No-match selection modified the baseline/schema/vocabulary');return {unchanged:true,...promptSize(request),scope:'Pure no-match selection; no model install or learner claim.'};
  });
  await test('Live local encoder · 768 to 256 dimensions, finite vectors and similarity',async()=>{
   if(!encoderReady)throw new Blocked('Optional encoder is not installed. This benchmark never starts a download.');
   assert(EMBEDDING_MODEL.nativeDimensions===768&&EMBEDDING_MODEL.dimensions===256,'Encoder dimensionality changed; update this benchmark');
   const sentence='An unbroken seal protects the calibration crate.',result=await embedTexts([sentence,sentence,'The calibration crate is protected by an intact seal.','A violinist rehearses a melody.'],{signal});
   assert(result.dimensions===256&&result.embeddings.length===4&&result.embeddings.every(v=>v.length===256&&v.every(Number.isFinite)),'Invalid vector dimensions or values');
   assert(result.truncated.every(x=>x===false),'Short similarity fixture was truncated');
   const norms=result.embeddings.map(v=>Math.sqrt(v.reduce((n,x)=>n+x*x,0))),identical=cosine(result.embeddings[0],result.embeddings[1]),similar=cosine(result.embeddings[0],result.embeddings[2]),unrelated=cosine(result.embeddings[0],result.embeddings[3]);
   assert(norms.every(n=>Math.abs(n-1)<1e-4)&&Number.isFinite(identical)&&identical>0.999,'Normalization or identical-text cosine failed');assert(Number.isFinite(similar)&&Number.isFinite(unrelated)&&similar>unrelated,'The chosen paraphrase was not ranked above the unrelated sentence');
   return {nativeDimensions:768,retainedDimensions:result.dimensions,model:result.model,revision:result.revision,inputTokens:result.inputTokens,maxTokens:result.maxTokens,truncated:result.truncated,roles:result.roles,norms,identical,similar,unrelated,metrics:result.metrics,scope:'A live projection/similarity smoke check, not a general semantic-fidelity score. The worker validates the native tensor shape before truncation; this report inspects returned 256-dimensional vectors.'};
  });
  for(let index=0;index<fixtures.length;index++){
   const fixture=fixtures[index],modes=['fixed','lexical','semantic'];for(const mode of [...modes.slice(index%3),...modes.slice(0,index%3)]){
    const turn={fixture:fixture.id,mode,input:fixture.input,expected:fixture,status:'not_run',inferenceAttempted:false},turnCursor=measurementCursor(),turnStart=performance.now();let thoughtStarted=null;
    const row=await test(`Gemma retrieval · ${mode} · ${fixture.id}`,async()=>{
     try{
      requireTools();if(mode==='semantic'&&!encoderReady)throw new Blocked('Optional encoder is not installed; semantic comparison not run.');
      await setRetrievalMode(mode);resetVerificationCache();if(startState==='cold'){cancel();resetCompiler();resetKernel();resetProlog();disposeEmbeddings();}
      const made=await localApi('/api/session',{scenario});turn.session=made.session_id;const saved=await get('session:'+turn.session);saved.benchmark=true;await put('session:'+turn.session,saved);
      const draft=await compile({op:'interpret',text:fixture.input,accepted:[],scenario,responses:[]});assert(draft.request,'Fixture unexpectedly bypassed model interpretation');turn.prompt={eligible:eligibleRequest(draft.request),baseline:promptSize(draft.request)};
      // This ablation must exercise the retrieval seam, not an exact-match shortcut.
      assert(turn.prompt.eligible,'Held-out thought used a narrowed prompt and cannot compare retrieval modes');
      stop();thoughtStarted=performance.now();turn.inferenceAttempted=true;report.accuracy.attempted++;turn.interpretation=await localApi('/api/interpret',{session_id:turn.session,text:fixture.input,grouping:'together'});turn.interpretationSeconds=(performance.now()-thoughtStarted)/1000;
      turn.meaningMatches=retrievalMeaningMatches(turn.interpretation,fixture);assert(turn.meaningMatches,'Interpretation changed the held-out meaning. It was NOT confirmed.');report.accuracy.matched++;
      const unconfirmed=await localApi('/api/session?id='+turn.session);assert(unconfirmed.graph.length===0&&!unconfirmed.progress.solved,'Unconfirmed thought changed accepted reasoning');
      if(!fixture.clarify){
       stop();const checked=await localApi('/api/verify',{session_id:turn.session,candidate_id:turn.interpretation.candidate_id});turn.verification={status:checked.status,solved:checked.progress.solved,goalCheck:checked.solution_check.check_number,goalStatus:checked.solution_check.status,engines:checked.engines};
       assert(checked.status===fixture.verification&&checked.progress.solved===fixture.solved,'Formal result or completion differs from the fixture');assert(checked.solution_check.check_number===1,'Verification skipped its goal check');
       if(fixture.solved){const completed=await localApi('/api/session?id='+turn.session);assert(completed.solution?.argumentation?.concepts?.length,'Completed case lacks its debrief');}
      }else{assert(unconfirmed.solution_checks===0,'Clarification triggered a proof/goal attempt');turn.verification={status:'not_applicable',reason:'No assertion was proposed; nothing was confirmed.'};}
      turn.wholeTurnSeconds=(performance.now()-thoughtStarted)/1000;turn.status='pass';return turn;
     }catch(error){turn.status=error instanceof Blocked||signal?.aborted?'blocked':'fail';error.evidence=turn;throw error;}
     finally{
      turn.measurements=measurementsSince(turnCursor);const modelRows=turn.measurements.filter(e=>['model_cold','model_warm','model_attempt'].includes(e.category));
      turn.selection=retrievalSelectionDiagnostics(turn,turn.measurements);
      if(turn.prompt)turn.prompt.actualWorkerCharacters=modelRows.map(e=>e.promptCharacters).filter(Number.isFinite);
      if(thoughtStarted!==null&&turn.wholeTurnSeconds===undefined)turn.wholeTurnSeconds=(performance.now()-thoughtStarted)/1000;
      turn.seconds=(performance.now()-turnStart)/1000;
     }
    });
    turn.status=row.status;if(row.status!=='pass')turn.error=typeof row.detail==='string'?row.detail:row.detail.error;report.turns.push(turn);
   }
  }
 }finally{
  signal?.removeEventListener('abort',stopWorkers);disposeEmbeddings();
  // Restore even an absent or legacy setting, without requiring an encoder to
  // remain installed. This does not start inference or change a learner session.
  if(originalMode===undefined||originalMode===null)await remove('example-selection-mode');else await put('example-selection-mode',originalMode);
  report.restoredMode=originalMode??'fixed (default)';
 }
 report.aborted=!!signal?.aborted;report.notRunTurns=report.turns.filter(t=>!t.inferenceAttempted).length;
 report.measurements=measurementsSince(cursor);report.measurementSummary=summarizeMeasurements(report.measurements);report.phaseTimings={firstTextAfterSend:distribution(report.measurements.map(e=>e.firstTextSeconds)),modelLoad:distribution(report.measurements.map(e=>e.loadSeconds).filter(x=>x>0)),prefill:distribution(report.measurements.map(e=>e.prefillSeconds)),decode:distribution(report.measurements.map(e=>e.decodeSeconds)),exampleSelection:distribution(report.measurements.filter(e=>e.category==='example_selection').map(e=>e.seconds))};
 report.conditions=summarizeRetrievalConditions(report.turns);
 report.summary={pass:report.results.filter(r=>r.status==='pass').length,fail:report.results.filter(r=>r.status==='fail').length,blocked:report.results.filter(r=>r.status==='blocked').length,totalElapsedSeconds:(performance.now()-started)/1000};report.finished=new Date().toISOString();report.finalVisibility=document.visibilityState;report.toolSummary=summarizeReport(report);
 report.manual.push({name:'Repeated controlled physical-device runs and human adjudication of unseen language',status:'not_run'});
 await put('benchmark:latest',report);const history=await get('benchmark:runs')||[];history.push(report);await put('benchmark:runs',history.slice(-12));return report;
}
