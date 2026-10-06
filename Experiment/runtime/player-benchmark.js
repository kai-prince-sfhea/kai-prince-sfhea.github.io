import {resetProlog} from './proofs.js';
import {localApi,scenarios,resetVerificationCache} from './local-api.js';
import {retrievalMode} from './example-retrieval.js';
import {get,put} from './store.js';
import {cancel} from './model.js';
import {resetKernel} from './coq.js';
import {resetCompiler} from './compiler.js';
import {assetsReady,MODEL} from './assets.js';
import {offlineState} from './pwa.js';
import {measurementCursor,measurementCoverage,measurementsSince,distribution,summarizeMeasurements} from './telemetry.js';
import {summarizeReport} from './benchmark-summary.js';
import {groundedSteps} from './grounded-fixtures.js';

const S={op:'atom',name:'safe'},T={op:'atom',name:'truthful'},N=arg=>({op:'not',arg}),A=(guard,proposition)=>({op:'answer',guard,proposition}),Q=A('asked',A('other',S));
export const SCRIPTED_SCENARIOS=['two-guards','murder-basic','murder-temporal','murder-fuzzy','legal','sqrt-two'];
const knowledge='If I ask whether the other guard would say this door is safe, the answer is opposite to the safety of this door, whichever guard I ask.';
const choice='I ask either guard whether the other guard would say this door is safe, and I go through the other door if and only if they answer yes.';
const partial='I ask what the other guard would say about whether this door is safe. If they answer yes I go through the other door.';
const wrong='If the asked guard is a liar, their direct answer about this door matches its safety.';
const stable=x=>x&&typeof x==='object'?Array.isArray(x)?x.map(stable):Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const key=x=>JSON.stringify(stable(x));
const equals=(a,b)=>key(a)===key(b);
function assert(v,message){if(!v)throw Error(message);}
// Question identity is checked structurally. Logical expressions are compared
// over independent atoms/answers, without applying guard truth/lie semantics.
function equivalent(a,b){const vars=new Set();const collect=e=>{if(e.op==='atom'||e.op==='answer')vars.add(key(e));else for(const k of ['arg','left','right'])if(e[k])collect(e[k]);};collect(a);collect(b);const names=[...vars];if(names.length>10)return false;const evaluate=(e,bits)=>{if(e.op==='atom'||e.op==='answer')return !!(bits&(1<<names.indexOf(key(e))));if(e.op==='const')return e.value;if(e.op==='not')return !evaluate(e.arg,bits);const l=evaluate(e.left,bits),r=evaluate(e.right,bits);return e.op==='and'?l&&r:e.op==='or'?l||r:e.op==='implies'?!l||r:e.op==='iff'?l===r:false;};for(let i=0;i<2**names.length;i++)if(evaluate(a,i)!==evaluate(b,i))return false;return true;}
export function matchesMeaning(c,expected){
 if(!c||c.depends_on?.length)return false;
 if(expected.type==='named')return equals((c.conclusions||[]).map(x=>`${x.id}:${x.positive}`).sort(),expected.literals.map(x=>`${x.id}:${x.positive}`).sort())&&equals((c.assumptions||[]).map(x=>`${x.id}:${x.positive}`).sort(),(expected.premises||[]).map(x=>`${x.id}:${x.positive}`).sort());
 if(expected.type==='wrong')return !c.strategy&&(c.assumptions||[]).length===1&&equivalent(c.assumptions[0],N(T))&&equivalent(c.conclusion,{op:'iff',left:A('asked',S),right:S});
 if((c.assumptions||[]).length)return false;
 if(expected.type==='knowledge')return !c.strategy&&equivalent(c.conclusion,{op:'iff',left:Q,right:N(S)});
 return !!c.strategy&&equals(c.strategy.question,Q)&&c.strategy.on_yes==='other'&&c.strategy.on_no===(expected.type==='partial'?null:'tested')&&(equivalent(c.conclusion,{op:'const',value:true})||equivalent(c.conclusion,{op:'iff',left:Q,right:N(S)}));
}

export function playerScript(scenario,profile){
 if(scenario.domain==='guards'){
  const k={text:knowledge,meaning:{type:'knowledge'},status:'verified',solved:false},c={text:choice,meaning:{type:'choice'},status:'verified',solved:true};
  return profile==='beginner'?[{text:wrong,meaning:{type:'wrong'},status:'refuted',solved:false},k,{text:partial,meaning:{type:'partial'},status:'verified',solved:false},c]:[k,c];
 }
 const step=(ids,text,positive=true,solved=false)=>({text,meaning:{type:'named',literals:ids.map(id=>({id,positive}))},status:positive?'verified':'refuted',solved});
 const selected={'murder-basic':'clara_fingerprints','murder-temporal':'morgan_present_during_window','murder-fuzzy':'morgan_score',legal:'skydrop_commercial','sqrt-two':'both_even'};
 const initial=Object.values(scenario.nodes).find(n=>n.name===selected[scenario.id]);assert(initial,'No preset for scenario '+scenario.id);
 const targets=scenario.targets,route=groundedSteps(scenario),finish=route.map((c,i)=>({text:profile==='experienced'?'Given that '+c.assumptions.map(p=>scenario.nodes[p.id].label).join('; and that ')+', I conclude that '+scenario.nodes[c.conclusions[0].id].label+'.':c.text,meaning:{type:'named',literals:c.conclusions,premises:c.assumptions},status:'verified',solved:i===route.length-1}));
 if(profile==='beginner')return [step([targets[0]],'It is not the case that '+scenario.nodes[targets[0]].label,false),...finish];
 return finish;
}

export async function runPlayerBenchmark({label,power='unspecified',startState='cold',scenarioId='all',signal,onResult=()=>{},onStatus=()=>{}}){
 assert(label?.trim(),'Describe the device and browser before running the benchmark.');
 const started=performance.now(),library=await scenarios(),selected=scenarioId==='all'?library.filter(s=>SCRIPTED_SCENARIOS.includes(s.id)):library.filter(s=>s.id===scenarioId&&SCRIPTED_SCENARIOS.includes(s.id));assert(selected.length,'Unknown scenario');
 const report={schema:3,suite:'player-journeys-v3',runId:crypto.randomUUID(),device:label,powerCondition:power,startState,scenarioSelection:scenarioId,includeModel:true,started:new Date().toISOString(),pageVisibility:document.visibilityState,userAgent:navigator.userAgent,platform:navigator.userAgentData?.platform||navigator.platform,hardwareConcurrency:navigator.hardwareConcurrency,memoryGB:navigator.deviceMemory??null,model:MODEL,build:await(await fetch('/Experiment/data/build.json')).json(),secureContext:isSecureContext,cacheOnly:!!await offlineState(),online:navigator.onLine,results:[],journeys:[],measurements:[],accuracy:{attempted:0,matched:0},manual:[],scope:'Real Gemma interpretation, meaning-oracle review, Prolog, Coq, goal and debrief through localApi. Isolated saved sessions, speculation disabled; no injected formal claims. UI rendering, accessibility, learner expertise and educational impact are not measured.',resetPolicy:'Proof cache cleared before each journey. Cold resets model, compiler and kernel before each journey; cached assets remain. Warm retains engines.',engines:{prolog:'SWI 10.1.15 / npm 8.1.4',kernel:'Coq 8.20.1 / jsCoq 1.99.2',litert:'0.17.1',compiler:'Pyodide 0.29.1'}};
 report.exampleSelection=await retrievalMode();
 const ready=await assetsReady(),stop=()=>{if(signal?.aborted)throw Object.assign(Error('Benchmark stopped by user'),{name:'AbortError'});};
 const stopModel=()=>cancel();signal?.addEventListener('abort',stopModel,{once:true});
 try{journeysLoop:for(const scenario of selected)for(const profile of ['beginner','experienced','expert']){
  const t=performance.now(),cursor=measurementCursor(),j={scenario:scenario.id,profile,steps:[],planned:playerScript(scenario,profile),status:'fail'};
  try{
   stop();if(!ready||!navigator.gpu)throw Object.assign(Error(!ready?'Install the local tools first':'WebGPU unavailable'),{blocked:true});
   resetVerificationCache();if(startState==='cold'){cancel();resetKernel();resetProlog();resetCompiler();}
   onStatus(`${scenario.title} · ${profile}: starting`);
   const made=await localApi('/api/session',{scenario});j.session=made.session_id;const saved=await get('session:'+j.session);saved.benchmark=true;await put('session:'+j.session,saved);
   if(profile==='beginner'){j.hint=(await localApi('/api/hint',{session_id:j.session})).feedback;assert((await localApi('/api/session?id='+j.session)).graph.length===0,'Hint added a claim');}
   for(let i=0;i<j.planned.length;i++){
    stop();const fixture=j.planned[i],step={input:fixture.text,expected:fixture,status:'running'},stepStart=performance.now();j.steps.push(step);
    onStatus(`${scenario.title} · ${profile} · thought ${i+1}/${j.planned.length}`);
    try{
     report.accuracy.attempted++;const interpretation=await localApi('/api/interpret',{session_id:j.session,text:fixture.text});step.interpretation=interpretation;
     assert(interpretation.candidate_id,'No reviewable interpretation: '+(interpretation.clarification||'unknown response'));
     step.meaningMatches=matchesMeaning(interpretation.interpretation?.graph,fixture.meaning);
     assert(step.meaningMatches,'Interpretation differs from the preset meaning. It was NOT confirmed.');report.accuracy.matched++;
     stop();const result=await localApi('/api/verify',{session_id:j.session,candidate_id:interpretation.candidate_id});step.actual={status:result.status,solved:result.progress.solved,goalCheck:result.solution_check.check_number,goalStatus:result.solution_check.status,engines:result.engines};
     assert(result.status===fixture.status,`Expected ${fixture.status}, got ${result.status}`);assert(result.progress.solved===fixture.solved,'Scenario completed at the wrong step');assert(result.solution_check.check_number===i+1,'A verification attempt skipped its goal check');assert(['not_discovered','awaiting_strategy','discovered'].includes(result.solution_check.status),'Goal check failed: '+result.solution_check.status);step.status='pass';
    }catch(e){step.status=signal?.aborted?'cancelled':'fail';step.error=e.message;throw e;}finally{step.seconds=(performance.now()-stepStart)/1000;}
   }
   const final=await localApi('/api/session?id='+j.session);assert(final.progress.solved,'Journey did not reach the end');assert(final.solution?.argumentation?.concepts?.length,'Completion debrief missing');j.accepted=final.graph.length;j.goalChecks=final.solution_checks;j.completed=true;j.status='pass';
  }catch(e){j.status=e.blocked||e.name==='AbortError'||signal?.aborted?'blocked':'fail';j.error=e.message;}
  finally{j.seconds=(performance.now()-t)/1000;j.measurementCoverage=measurementCoverage(cursor);j.measurements=measurementsSince(cursor);report.measurements.push(...j.measurements);report.journeys.push(j);const row={name:`${scenario.title} · ${profile}`,status:j.status,seconds:j.seconds,detail:j};report.results.push(row);onResult(row);await put('benchmark:latest',report);}
  if(signal?.aborted)break journeysLoop;
 }}finally{signal?.removeEventListener('abort',stopModel);}
 report.aborted=!!signal?.aborted;report.plannedJourneys=selected.length*3;report.notRunJourneys=report.plannedJourneys-report.journeys.length;
 report.summary={pass:report.results.filter(r=>r.status==='pass').length,fail:report.results.filter(r=>r.status==='fail').length,blocked:report.results.filter(r=>r.status==='blocked').length,totalElapsedSeconds:(performance.now()-started)/1000};
 report.measurementCoverage={droppedEvents:report.journeys.reduce((n,j)=>n+(j.measurementCoverage?.droppedEvents||0),0)};report.measurementSummary=summarizeMeasurements(report.measurements);report.phaseTimings={firstTextAfterSend:distribution(report.measurements.map(m=>m.firstTextSeconds)),firstChunkAfterSend:distribution(report.measurements.map(m=>m.firstChunkSeconds)),modelLoad:distribution(report.measurements.map(e=>e.loadSeconds).filter(x=>x>0)),prefill:distribution(report.measurements.map(e=>e.prefillSeconds)),decode:distribution(report.measurements.map(e=>e.decodeSeconds)),proofLibraries:distribution(report.measurements.map(e=>e.phases?.libraries)),proofInitialize:distribution(report.measurements.map(e=>e.phases?.initialize)),proofCheck:distribution(report.measurements.map(e=>e.phases?.checking))};
 report.finished=new Date().toISOString();report.finalVisibility=document.visibilityState;report.toolSummary=summarizeReport(report);await put('benchmark:latest',report);const history=await get('benchmark:runs')||[];history.push(report);await put('benchmark:runs',history.slice(-12));return report;
}
