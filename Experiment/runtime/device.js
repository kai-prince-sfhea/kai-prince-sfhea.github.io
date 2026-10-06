import {runFullBenchmark} from './full-benchmark.js';
import {installGuidance} from './install-guidance.js';
import {probeStorage,probeResume} from './storage-writer.js';
import {runPlayRegressions} from './benchmark-play-regressions.js';
import('./audio-setup.js').then(()=>import('./extraction-setup.js')).catch(error=>console.warn('Optional audio / extraction setup unavailable:',error.message));
import {EMBEDDING_MODEL,embeddingStatus,installEmbeddings} from './embedding-assets.js';
import {retrievalMode,setRetrievalMode,prepareExampleIndex} from './example-retrieval.js';
import {runPlayerBenchmark} from './player-benchmark.js';
import {runRetrievalBenchmark} from './benchmark-retrieval.js';
import {scenarios} from './local-api.js';
import {renderReportSummary,renderComparisons,timingCsv} from './benchmark-summary.js';
import {resetKernel,ensureKernel} from './coq.js';
import {installAssets,assetsReady,MODEL} from './assets.js';
import {get,put} from './store.js';
import {swReady,setOffline,offlineState} from './pwa.js';
import {runBenchmark} from './benchmark.js';
import {cancel,warmup} from './model.js';
import {restoreAttempt} from './restore-session.js';
const $=s=>document.querySelector(s);let controller,report,installPrompt,benchmarkController;
const download=(name,content,type='application/json')=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
const currentInstallGuidance=()=>installGuidance(navigator.userAgent,matchMedia('(display-mode: standalone)').matches||navigator.standalone===true);
$('#install-app').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;}else $('#install-help').textContent=currentInstallGuidance();};
$('#install').onclick=async()=>{
 const withEmbeddings=$('#include-embeddings').checked;controller=new AbortController();
 $('#install').disabled=true;$('#include-embeddings').disabled=true;$('#cancel-download').disabled=false;$('#install-embeddings').disabled=true;
 try{
  await swReady;await installAssets({consent:true,signal:controller.signal,onProgress:p=>{const fraction=p.done/p.total;$('#download-progress').value=fraction;$('#download-status').textContent=p.phase+' · '+Math.round(fraction*100)+'%';}});
  if(withEmbeddings){
   await installEmbeddings({consent:true,signal:controller.signal,onProgress:p=>{$('#download-progress').value=p.done/p.total;$('#download-status').textContent='EmbeddingGemma · '+p.phase+' · '+Math.round(100*p.done/p.total)+'%';}});
   await prepareExampleIndex({signal:controller.signal,onProgress:p=>{$('#download-progress').value=p.done/p.total;$('#download-status').textContent=`Preparing prompt examples · ${p.done}/${p.total}`;}});
   if(await get('example-selection-mode')===undefined)await setRetrievalMode('semantic');
   await refreshEmbeddingStatus();
  }
  $('#download-status').textContent=withEmbeddings?'Tools and recommended encoder installed. I can choose the prompt-selection mode below.':'Tools installed. Fixed and words-only prompt selection are available.';
 }catch(e){$('#download-status').textContent=e.name==='AbortError'?'Download paused. Press Download to resume.':'Setup stopped: '+e.message+'. Completed packs remain installed; retry to finish.';}
 finally{$('#install').disabled=false;$('#include-embeddings').disabled=false;$('#cancel-download').disabled=true;$('#install-embeddings').disabled=false;}
};
$('#cancel-download').onclick=()=>controller?.abort();
$('#cancel-inference').onclick=()=>cancel();
$('#offline-mode').onchange=async e=>{try{await setOffline(e.target.checked);$('#offline-status').textContent=e.target.checked?'Cache-only mode enabled. Only a separately consented optional-pack download can temporarily fetch its listed assets.':'Downloads and static updates enabled.';}catch(x){$('#offline-status').textContent=x.message;e.target.checked=false;}};
function addResult(r){const row=document.createElement('tr');for(const text of [r.name,r.status,r.seconds.toFixed(2)+' s']){const td=document.createElement('td');td.textContent=text;row.append(td);}row.className=r.status;const detail=document.createElement('td'),d=document.createElement('details'),s=document.createElement('summary'),pre=document.createElement('pre');s.textContent='Evidence';pre.textContent=typeof r.detail==='string'?r.detail:JSON.stringify(r.detail,null,2);d.append(s,pre);detail.append(d);row.append(detail);$('#benchmark-body').append(row);}
$('#benchmark').onclick=async()=>{report=null;$('#benchmark-summary').replaceChildren();$('#export-benchmark').disabled=true;$('#export-csv').disabled=true;$('#benchmark-status').textContent='Preparing benchmark…';$('#warmup-model').disabled=true;$('#retry-kernel').disabled=true;$('#benchmark').disabled=true;$('#benchmark-results').innerHTML='<table><thead><tr><th>Feature</th><th>Result</th><th>Time</th><th>Evidence</th></tr></thead><tbody id="benchmark-body"></tbody></table>';try{await put('device-label',$('#device-label').value);const player=$('#benchmark-type').value==='players',retrieval=$('#benchmark-type').value==='retrieval';$('#install-embeddings').disabled=true;$('#example-mode').disabled=true;benchmarkController=new AbortController();$('#stop-benchmark').disabled=false;report=await ($('#benchmark-type').value==='full'?runFullBenchmark:$('#benchmark-type').value==='regressions'?runPlayRegressions:retrieval?runRetrievalBenchmark:player?runPlayerBenchmark:runBenchmark)({signal:benchmarkController.signal,scenarioId:$('#player-scenario').value,label:$('#device-label').value,power:$('#power-condition').value,startState:$('#start-state').value,group:['interface','families','guard-regressions'].includes($('#benchmark-type').value)?$('#benchmark-type').value:'all',includeModel:$('#include-model').checked,onResult:addResult,onStatus:n=>$('#benchmark-status').textContent='Running: '+n});$('#benchmark-status').textContent=`Finished: ${report.summary.pass} passed · ${report.summary.fail} failed · ${report.summary.blocked} blocked. Physical-device checks remain separate.`;renderReportSummary($('#benchmark-summary'),report);$('#export-benchmark').disabled=false;$('#export-csv').disabled=false;}catch(e){$('#benchmark-status').textContent=e.message;}finally{$('#install-embeddings').disabled=false;$('#example-mode').disabled=false;$('#stop-benchmark').disabled=true;$('#benchmark').disabled=false;$('#warmup-model').disabled=false;$('#retry-kernel').disabled=false;}};
$('#export-benchmark').onclick=()=>download('thread-device-evidence.json',JSON.stringify(report,null,2));
$('#export-csv').onclick=()=>download('thread-device-timings.csv',timingCsv(report),'text/csv');
$('#manual-offline').onclick=async()=>{const record={at:new Date().toISOString(),device:$('#device-label').value,declaredByUser:true,cacheOnly:await offlineState(),statement:'I completed airplane-mode cold reopen, new interpretation and proof on this physical device.'};await put('manual:offline',record);$('#manual-status').textContent='Saved as a user-declared check, separate from automated evidence.';if(report){report.manual.push(record);await put('benchmark:latest',report);}};
$('#restore-session').onchange=async e=>{const file=e.target.files[0];if(!file)return;const status=$('#restore-status');try{if(file.size>20000000)throw Error('Export exceeds 20 MB');const id=await restoreAttempt(JSON.parse(await file.text()),message=>status.textContent=message);const link=document.createElement('a');link.href='/Experiment/#session='+id;link.textContent='Open restored attempt';status.replaceChildren(link);}catch(err){status.textContent=err.message;}};
(async()=>{try{$('#device-label').value=await get('device-label')||'';const prior=await get('benchmark:latest');if(prior?.finished){report=prior;renderReportSummary($('#benchmark-summary'),report);$('#benchmark-status').textContent='Previous run: '+prior.summary.pass+' passed · '+prior.summary.fail+' failed · '+prior.summary.blocked+' blocked.';$('#export-benchmark').disabled=false;$('#export-csv').disabled=false;}const estimate=await navigator.storage.estimate();const manifest=await(await fetch('/Experiment/data/assets.json')).json();$('#storage').textContent=`Browser runtimes: ${(manifest.bytes/1e6).toFixed(1)} MB. Available quota: ${((estimate.quota-estimate.usage)/1e9).toFixed(2)} GB. ${await navigator.storage.persisted()?'Persistent storage granted.':'Browser may evict unprotected storage; keep a JSON backup.'}`;if(await assetsReady())$('#download-status').textContent='Tools installed on this device. Model SHA-256 verified during installation.';$('#offline-mode').checked=!!await offlineState();}catch(e){$('#storage').textContent=e.message;}finally{$('#benchmark').disabled=false;}})();

$('#warmup-model').onclick=async e=>{e.target.disabled=true;$('#preflight-status').textContent='Loading Gemma before my next thought…';try{const r=await warmup();$('#preflight-status').textContent='Gemma ready in '+r.seconds.toFixed(2)+' s. Keep this tab open.';}catch(err){$('#preflight-status').textContent=err.message;}finally{e.target.disabled=false;}};
$('#retry-kernel').onclick=async e=>{e.target.disabled=true;try{resetKernel();const h=await ensureKernel();$('#preflight-status').textContent=h.detail;}catch(err){$('#preflight-status').textContent=err.message;}finally{e.target.disabled=false;}};

$('#export-history').onclick=async()=>download('thread-benchmark-runs.json',JSON.stringify(await get('benchmark:runs')||[],null,2));

$('#stop-benchmark').onclick=()=>{benchmarkController?.abort();$('#benchmark-status').textContent='Stopping after the current operation; completed evidence will be kept.';};
$('#benchmark-type').onchange=()=>{$('#include-model').disabled=!['features','full'].includes($('#benchmark-type').value);$('#player-scenario').disabled=$('#benchmark-type').value!=='players';};
(async()=>{for(const s of await scenarios()){const option=document.createElement('option');option.value=s.id;option.textContent=s.title;option.disabled=!['two-guards','murder-basic','murder-temporal','murder-fuzzy','legal','sqrt-two'].includes(s.id);if(option.disabled)option.textContent+=' · feature benchmark only';$('#player-scenario').append(option);}})();
$('#compare-recent').onclick=async()=>{renderComparisons($('#benchmark-comparison'),await get('benchmark:runs')||[]);};
$('#compare-reports').onchange=async e=>{try{const reports=[];for(const file of e.target.files){if(file.size>20000000)throw Error('Use reports smaller than 20 MB');const value=JSON.parse(await file.text());for(const r of Array.isArray(value)?value:[value]){if(!r?.summary||!Array.isArray(r.results)||typeof r.device!=='string')throw Error('Not a Thread benchmark report');reports.push(r);}}renderComparisons($('#benchmark-comparison'),reports);$('#comparison-status').textContent=reports.length+' local reports loaded. Nothing was uploaded.';}catch(err){$('#comparison-status').textContent=err.message;}finally{e.target.value='';}};

let embeddingController;
async function refreshEmbeddingStatus(){
 const status=await embeddingStatus();
 $('#embedding-size').textContent=`Recommended encoder download: ${(status.totalBytes/1e6).toFixed(1)} MB for EmbeddingGemma and its CPU runtime. Weights download from Hugging Face; thought text never leaves this device. Model licence: Gemma terms (see Notices).`;
 $('#embedding-status').textContent=status.ready?'Encoder assets installed and integrity checked. Select a mode below to use them.':'Encoder is not installed. Fixed and words-only examples remain available.';
 $('#example-mode').value=await retrievalMode();
}
$('#install-embeddings').onclick=async()=>{
 embeddingController=new AbortController();$('#install-embeddings').disabled=true;$('#cancel-embeddings').disabled=false;
 try{
  await swReady;await installEmbeddings({consent:true,signal:embeddingController.signal,onProgress:p=>{$('#embedding-progress').value=p.total?p.done/p.total:0;$('#embedding-status').textContent=p.phase+' · '+Math.round(100*p.done/p.total)+'%';}});
  await prepareExampleIndex({signal:embeddingController.signal,onProgress:p=>{$('#embedding-progress').value=p.done/p.total;$('#embedding-status').textContent=`Preparing local examples · ${p.done}/${p.total}`;}});
  await refreshEmbeddingStatus();$('#embedding-status').textContent='EmbeddingGemma and the example index are ready. Choose EmbeddingGemma + words below to enable it.';
 }catch(e){$('#embedding-status').textContent=e.name==='AbortError'?'Encoder setup paused. Complete files are kept for retry.':e.message;}
 finally{$('#install-embeddings').disabled=false;$('#cancel-embeddings').disabled=true;}
};
$('#cancel-embeddings').onclick=()=>embeddingController?.abort();
$('#example-mode').onchange=async e=>{try{await setRetrievalMode(e.target.value);$('#example-mode-status').textContent='Saved for this browser. Semantic selection keeps the full scenario vocabulary and all interpretation/proof checks.';}catch(err){e.target.value=await retrievalMode();$('#example-mode-status').textContent=err.message;}};
refreshEmbeddingStatus().catch(e=>$('#embedding-status').textContent=e.message);

$('#compat-check').onclick=async event=>{event.target.disabled=true;try{const lines=['Secure origin: '+isSecureContext,'WebAssembly: '+('WebAssembly' in window),'Service worker: '+('serviceWorker' in navigator)];if(navigator.gpu){const adapter=await navigator.gpu.requestAdapter();lines.push('WebGPU adapter: '+!!adapter);}else lines.push('WebGPU unavailable: Gemma cannot run in this browser.');await probeStorage();await probeResume();lines.push('Storage write and resume: passed. No model download or microphone activation.');$('#compat-status').textContent=lines.join(' · ');}catch(e){$('#compat-status').textContent='Compatibility check: '+e.message;}finally{event.target.disabled=false;}};
$('#install-help').textContent=currentInstallGuidance();
