import {runBenchmark} from './benchmark.js';
import {runPlayerBenchmark} from './player-benchmark.js';
import {runPlayRegressions} from './benchmark-play-regressions.js';
import {runRetrievalBenchmark} from './benchmark-retrieval.js';
import {summarizeMeasurements,distribution} from './telemetry.js';
import {summarizeReport} from './benchmark-summary.js';
import {get,put} from './store.js';
export async function runFullBenchmark(options){
 const start=performance.now(),children=[],results=[];
 for(const [name,run] of [['Features',runBenchmark],['Journeys',runPlayerBenchmark],['Wording',runPlayRegressions],['Retrieval',runRetrievalBenchmark]]){
  if(options.signal?.aborted)break;
  const report=await run({...options,scenarioId:'all',includeModel:true,onResult:r=>{const row={...r,name:name+' · '+r.name};results.push(row);options.onResult?.(row);},onStatus:text=>options.onStatus?.(name+' · '+text)});children.push(report);
 }
 const report={...children[0],runId:crypto.randomUUID(),suite:'full-v1',children,results,measurements:children.flatMap(c=>c.measurements||[]),manual:children.flatMap(c=>c.manual||[]),finished:new Date().toISOString(),aborted:!!options.signal?.aborted,scope:'Sequential feature, fixed-scenario journey, wording and retrieval suites. Optional neural speech has its separate benchmark; physical microphone, audibility, accessibility and airplane-mode checks remain manual.',summary:{pass:results.filter(r=>r.status==='pass').length,fail:results.filter(r=>r.status==='fail').length,blocked:results.filter(r=>r.status==='blocked').length,totalElapsedSeconds:(performance.now()-start)/1000}};
 report.notRunSuites=4-children.length;report.complete=children.length===4&&!report.aborted;report.measurementSummary=summarizeMeasurements(report.measurements);report.phaseTimings={modelLoad:distribution(report.measurements.map(e=>e.loadSeconds).filter(x=>x>0)),prefill:distribution(report.measurements.map(e=>e.prefillSeconds)),decode:distribution(report.measurements.map(e=>e.decodeSeconds))};report.toolSummary=summarizeReport(report);await put('benchmark:latest',report);const history=await get('benchmark:runs')||[];history.push(report);await put('benchmark:runs',history.slice(-12));return report;
}
