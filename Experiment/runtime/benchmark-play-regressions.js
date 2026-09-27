// Previously observed natural-language failures remain held out of prompts.
import {localApi,scenarios,resetVerificationCache} from './local-api.js';
import {compile,resetCompiler} from './compiler.js';
import {resetKernel} from './coq.js';
import {MODEL} from './assets.js';
import {retrievalMode} from './example-retrieval.js';
import {get,put} from './store.js';
import {cancel} from './model.js';
import {measurementCursor,measurementsSince,summarizeMeasurements} from './telemetry.js';
import {summarizeReport} from './benchmark-summary.js';
import {offlineState} from './pwa.js';
const literals=items=>JSON.stringify(items.map(p=>p.id+':'+p.positive).sort());
const named=(g,c,a=[])=>!!g&&literals(g.conclusions||[])===literals(c.map(id=>({id,positive:true})))&&literals(g.assumptions||[])===literals(a.map(id=>({id,positive:true})))&&!(g.depends_on||[]).length;
export async function runPlayRegressions({label,power='unspecified',startState='cold',signal,onStatus=()=>{},onResult=()=>{}}){
 const started=performance.now(),cursor=measurementCursor(),library=await scenarios();
 const report={schema:3,suite:'play-regressions-v2',runId:crypto.randomUUID(),device:label,powerCondition:power,startState,includeModel:true,model:MODEL,pageVisibility:document.visibilityState,started:new Date().toISOString(),userAgent:navigator.userAgent,cacheOnly:!!await offlineState(),build:await(await fetch('/Experiment/data/build.json')).json(),results:[],manual:[],resetPolicy:'Proof cache cleared before each fixture; cold mode resets model, compiler and kernel before each fixture. Static assets remain cached.'};
 const stop=()=>cancel();signal?.addEventListener('abort',stop,{once:true});
 report.exampleSelection=await retrievalMode();
 const tests=[];
 const tutorial=await compile({op:'tutorial'});
 tests.push({name:'Tutorial · original because wording',scenario:tutorial,text:'My archive visit is ready because my archive pass is valid and my archive visit is booked.',conclusions:['ready'],assumptions:['pass','booked'],solved:false});
 tests.push({name:'Tutorial · earlier direct-play wording',scenario:tutorial,text:'My pass is valid and I have booked the visit, so my archive visit is ready.',conclusions:['ready'],assumptions:['pass','booked'],solved:false});
 const legal=library.find(s=>s.id==='legal'),math=library.find(s=>s.id==='sqrt-two');
 const id=(scenario,name)=>Object.entries(scenario.nodes).find(([,v])=>v.name===name)?.[0];
 tests.push({name:'Delivery permit · preserve the commercial condition',scenario:legal,text:'SkyDrop violates the ordinance because it makes commercial deliveries without a permit.',conclusions:[id(legal,'skydrop_violates_ordinance')],assumptions:['skydrop_commercial','skydrop_deliveries','skydrop_no_permit'].map(n=>id(legal,n)),solved:true});
 tests.push({name:'Fraction · no invented supporting reasons',scenario:math,text:'Under the given expert assumptions, no fraction can satisfy all the candidate conditions.',conclusions:[id(math,'no_candidate')],assumptions:[],solved:true});
 const generated=await compile({op:'generate_challenge',config:{subject:'researcher',context:'garden',difficulty:'challenge',seed:'direct-play-embedding-20260927'}});
 const labelOf=id=>generated.nodes[id]?.label;
 // A newly phrased related regression, not a claim that an unrecorded original
 // utterance has been recovered. Exact meanings supply the independent oracle.
 tests.push({name:'Generated review · retain two explicit observations',scenario:generated,text:labelOf('d1_independent')+'. '+labelOf('d1_scope_gap')+'.',conclusions:['d1_independent','d1_scope_gap'],assumptions:[],solved:false});
 try{for(const fixture of tests){
  if(signal?.aborted)break;const t=performance.now();onStatus(fixture.name);let detail={input:fixture.text,expected:{conclusions:fixture.conclusions,assumptions:fixture.assumptions}},status='fail';
  try{
   resetVerificationCache();if(startState==='cold'){cancel();resetCompiler();resetKernel();}
   if(fixture.conclusions.some(id=>!id||!fixture.scenario.nodes[id])||fixture.text.includes('undefined'))throw Error('Invalid benchmark fixture');
   const made=await localApi('/api/session',{scenario:fixture.scenario});detail.session=made.session_id;const session=await get('session:'+made.session_id);session.benchmark=true;await put('session:'+made.session_id,session);
   const result=await localApi('/api/interpret',{session_id:made.session_id,text:fixture.text});detail.interpretation=result;
   if(!result.candidate_id||!named(result.interpretation?.graph,fixture.conclusions,fixture.assumptions))throw Error('Interpretation did not preserve the recorded meaning; it was not confirmed.');
   if(signal?.aborted)throw Error('Stopped before confirmation');
   const verified=await localApi('/api/verify',{session_id:made.session_id,candidate_id:result.candidate_id});detail.verification=verified;
   if(verified.status!=='verified'||verified.progress.solved!==fixture.solved||verified.solution_check.check_number!==1)throw Error('Verification or completion differed from expectation');status='pass';
  }catch(e){detail.error=e.message;if(signal?.aborted)status='blocked';}
  const row={name:fixture.name,status,seconds:(performance.now()-t)/1000,detail};report.results.push(row);onResult(row);await put('benchmark:latest',report);
 }}finally{signal?.removeEventListener('abort',stop);}
 report.measurements=measurementsSince(cursor);report.measurementSummary=summarizeMeasurements(report.measurements);report.summary={pass:report.results.filter(r=>r.status==='pass').length,fail:report.results.filter(r=>r.status==='fail').length,blocked:report.results.filter(r=>r.status==='blocked').length,totalElapsedSeconds:(performance.now()-started)/1000};report.notRun=tests.length-report.results.length;report.finished=new Date().toISOString();report.toolSummary=summarizeReport(report);await put('benchmark:latest',report);const history=await get('benchmark:runs')||[];history.push(report);await put('benchmark:runs',history.slice(-12));return report;
}
