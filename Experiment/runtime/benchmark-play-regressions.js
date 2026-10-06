import {resetProlog} from './proofs.js';
// Previously observed natural-language failures remain held out of prompts.
import {localApi,scenarios,verifyFormal,resetVerificationCache} from './local-api.js';
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
 const report={schema:3,suite:'play-regressions-v5',runId:crypto.randomUUID(),device:label,powerCondition:power,startState,includeModel:true,model:MODEL,pageVisibility:document.visibilityState,started:new Date().toISOString(),userAgent:navigator.userAgent,cacheOnly:!!await offlineState(),build:await(await fetch('/Experiment/data/build.json')).json(),results:[],manual:[],resetPolicy:'Proof cache cleared before each fixture; cold mode resets model, compiler and kernel before each fixture. Static assets remain cached.'};
 const stop=()=>cancel();signal?.addEventListener('abort',stop,{once:true});
 report.exampleSelection=await retrievalMode();
 const tests=[];
 const tutorial=await compile({op:'tutorial'});
 tests.push({name:'Tutorial · original because wording',scenario:tutorial,text:'My archive visit is ready because my archive pass is valid and my archive visit is booked.',conclusions:['ready'],assumptions:['pass','booked'],solved:false});
 tests.push({name:'Tutorial · asserted as/then wording from the human review',scenario:tutorial,text:'As My archive pass is valid and My archive visit is booked, then My archive visit is ready.',conclusions:['ready'],assumptions:['pass','booked'],solved:false});
 tests.push({name:'Tutorial · earlier direct-play wording',scenario:tutorial,text:'My pass is valid and I have booked the visit, so my archive visit is ready.',conclusions:['ready'],assumptions:['pass','booked'],solved:false});
 tests.push({name:'Tutorial · exact fact references and the correct cited rule',scenario:tutorial,text:'As Fact F1 and Fact F2, then My archive visit is ready, by Rule 1.',conclusions:['ready'],assumptions:['pass','booked'],rules_used:[tutorial.rules[0].id],solved:false});
 tests.push({name:'Tutorial · a wrong cited rule cannot borrow the right rule',scenario:tutorial,text:'As Fact F1 and Fact F2, then My archive visit is ready, by Rule 2.',conclusions:['ready'],assumptions:['pass','booked'],rules_used:[tutorial.rules[1].id],solved:false,status:'unsupported'});
 const legal=library.find(s=>s.id==='legal'),math=library.find(s=>s.id==='sqrt-two');
 const temporal=library.find(s=>s.id==='murder-temporal'),alternatives=Object.keys(temporal.nodes).find(p=>temporal.nodes[p].label==='All relevant alternatives are excluded under the case rules'),alternativeRule=temporal.rules.find(r=>r.conclusion===alternatives);
 tests.push({name:'Investigation · earlier handling is a fact label, not a player-step reference',scenario:temporal,text:temporal.nodes[alternatives].label+' because '+alternativeRule.premises.map(p=>temporal.nodes[p].label).join('; and that ')+'.',conclusions:[alternatives],assumptions:alternativeRule.premises,solved:false,prehistory:true});
 const id=(scenario,name)=>Object.entries(scenario.nodes).find(([,v])=>v.name===name)?.[0];
 tests.push({name:'Delivery permit · preserve the commercial condition',scenario:legal,text:'SkyDrop violates the ordinance because it makes commercial deliveries without a permit.',conclusions:[id(legal,'skydrop_violates_ordinance')],assumptions:['skydrop_commercial','skydrop_deliveries','skydrop_no_permit'].map(n=>id(legal,n)),solved:true});
 tests.push({name:'Fraction · no invented supporting reasons',scenario:math,text:'Under the given expert assumptions, no fraction can satisfy all the candidate conditions.',conclusions:[id(math,'no_candidate')],assumptions:[],solved:false,status:'unsupported'});
 const fuzzy=library.find(s=>s.id==='murder-fuzzy'),unsure=Object.keys(fuzzy.nodes).find(p=>fuzzy.nodes[p].label==="The case rules do not establish legal sureness of Morgan's guilt"),offence=Object.keys(fuzzy.nodes).find(p=>fuzzy.nodes[p].label==="Morgan's offence elements are not established");
 tests.push({name:'Investigation · preserve the exact negative-meaning IDs',scenario:fuzzy,text:`Given that ${fuzzy.nodes[offence].label}, I conclude that ${fuzzy.nodes[unsure].label}.`,conclusions:[unsure],assumptions:[offence],solved:false,status:'verified'});
 const generated=await compile({op:'generate_challenge',config:{subject:'researcher',context:'garden',difficulty:'challenge',seed:'direct-play-embedding-20260927'}});
 const labelOf=id=>generated.nodes[id]?.label;
 // A newly phrased related regression, not a claim that an unrecorded original
 // utterance has been recovered. Exact meanings supply the independent oracle.
 tests.push({name:'Generated review · retain two explicit observations',scenario:generated,text:labelOf('d1_independent')+'. '+labelOf('d1_scope_gap')+'.',conclusions:['d1_independent','d1_scope_gap'],assumptions:[],solved:false});
 const options=await(await fetch('/Experiment/data/challenge-options.json')).json(),paraphrase=await compile({op:'generate_challenge',config:{version:options.version,subject:'researcher',context:'exhibition',difficulty:'challenge',seed:'benchmark-evidence-2026'}}),name=paraphrase.challenge.dossiers[0].name;
 tests.push({name:'Generated review · paraphrase and spelling variation retain both reasons',scenario:paraphrase,text:`The discrepancy in ${name} has a traceable comparision record, because I know the source and version of its original record and the source and reported output were compared item by item.`,conclusions:['d1_usable'],assumptions:['d1_trace','d1_comparison'],solved:false});
 try{for(const fixture of tests){
  if(signal?.aborted)break;const t=performance.now();onStatus(fixture.name);let detail={input:fixture.text,expected:{conclusions:fixture.conclusions,assumptions:fixture.assumptions}},status='fail';
  try{
   resetVerificationCache();if(startState==='cold'){cancel();resetCompiler();resetKernel();resetProlog();}
   if(fixture.conclusions.some(id=>!id||!fixture.scenario.nodes[id])||fixture.text.includes('undefined'))throw Error('Invalid benchmark fixture');
   const made=await localApi('/api/session',{scenario:fixture.scenario});detail.session=made.session_id;const session=await get('session:'+made.session_id);session.benchmark=true;await put('session:'+made.session_id,session);
   if(fixture.prehistory){const id=Object.keys(fixture.scenario.nodes).find(p=>fixture.scenario.nodes[p].fact&&!fixture.assumptions.includes(p)),prior={id:'c1',kind:'step',domain:'theory',text:fixture.scenario.nodes[id].label,conclusions:[{id,positive:true}],assumptions:[],depends_on:[],mode:'assertion'};if((await verifyFormal(prior,[],fixture.scenario,{cache:false})).status!=='verified')throw Error('Unrelated prior fixture was not certified');session.claims=[prior];await put('session:'+made.session_id,session);detail.prehistory='One unrelated given was certified before this input.';}
   const result=await localApi('/api/interpret',{session_id:made.session_id,text:fixture.text});detail.interpretation=result;
   if(!result.candidate_id||!named(result.interpretation?.graph,fixture.conclusions,fixture.assumptions))throw Error('Interpretation did not preserve the recorded meaning; it was not confirmed.');
   if(fixture.rules_used&&JSON.stringify(result.interpretation.graph.rules_used)!==JSON.stringify(fixture.rules_used))throw Error('The explicit rule citation was changed or omitted.');
   if(signal?.aborted)throw Error('Stopped before confirmation');
   const verified=await localApi('/api/verify',{session_id:made.session_id,candidate_id:result.candidate_id});detail.verification=verified;
   if(verified.status!==(fixture.status||'verified')||verified.progress.solved!==fixture.solved||verified.solution_check.check_number!==1)throw Error('Verification or completion differed from expectation');status='pass';
  }catch(e){detail.error=e.message;if(signal?.aborted)status='blocked';}
  const row={name:fixture.name,status,seconds:(performance.now()-t)/1000,detail};report.results.push(row);onResult(row);await put('benchmark:latest',report);
 }}finally{signal?.removeEventListener('abort',stop);}
 report.measurements=measurementsSince(cursor);report.measurementSummary=summarizeMeasurements(report.measurements);report.summary={pass:report.results.filter(r=>r.status==='pass').length,fail:report.results.filter(r=>r.status==='fail').length,blocked:report.results.filter(r=>r.status==='blocked').length,totalElapsedSeconds:(performance.now()-started)/1000};report.notRun=tests.length-report.results.length;report.finished=new Date().toISOString();report.toolSummary=summarizeReport(report);await put('benchmark:latest',report);const history=await get('benchmark:runs')||[];history.push(report);await put('benchmark:runs',history.slice(-12));return report;
}
