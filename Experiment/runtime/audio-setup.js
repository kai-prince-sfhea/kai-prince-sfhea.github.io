import {SPEECH_MODEL,installSpeech,speechStatus} from './speech-assets.js';
import {speechTask,cancelSpeech} from './speech.js';
import {downsample} from './speech-core.js';
import {put} from './store.js';
import {offlineState} from './pwa.js';
const section=document.createElement('section');section.id='speech-tools';
section.innerHTML=`<h2>Optional · Local speech & narration</h2><p>Whisper Tiny provides dictation; Kokoro provides narration when no local device voice is available. Gemma’s current LiteRT browser export accepts text only. Both speech models run locally on the CPU after installation.</p><p>Download: ${(SPEECH_MODEL.bytes/1e6).toFixed(1)} MB including runtimes. Installation needs about 305 MB of free browser storage for staging. Models stay on this device. Your microphone is never activated by setup or the benchmark.</p><label><input type="checkbox" id="speech-consent"> I agree to download and store the optional speech tools on this device.</label><p><button id="speech-install" class="primary-button">Install speech tools</button> <button id="speech-pause" class="secondary-button" disabled>Pause download</button></p><p id="speech-setup-status" role="status"></p><h3>Speech benchmark</h3><p>Synthesises a preset sentence with Kokoro, then transcribes it with Whisper. This measures a cold load for each tool and synthetic speech accuracy, not microphone quality, accents or real-world accessibility.</p><button id="speech-benchmark" class="secondary-button">Run local speech benchmark</button> <button id="speech-benchmark-stop" class="secondary-button" disabled>Cancel speech benchmark</button> <button id="speech-evidence" class="secondary-button" disabled>Download speech evidence</button><pre id="speech-result" tabindex="0" aria-label="Speech benchmark results"></pre>`;
document.querySelector('main').append(section);
const $=id=>document.getElementById(id);let abort,report,running=false;
const status=text=>{$('speech-setup-status').textContent=text;};
speechStatus().then(s=>status(s.ready?'Speech tools installed and ready.':'Speech tools are not installed.')).catch(e=>status(e.message));
$('speech-install').onclick=async()=>{
 if(!$('speech-consent').checked){status('Tick download consent before installing speech tools.');return;}
 abort=new AbortController();$('speech-install').disabled=true;$('speech-pause').disabled=false;$('speech-benchmark').disabled=true;
 try{await installSpeech({consent:true,signal:abort.signal,onProgress:p=>status(`${p.phase}: ${(p.done/1e6).toFixed(1)} / ${(p.total/1e6).toFixed(1)} MB`)});status('Speech tools installed and verified.');}
 catch(e){status(e.name==='AbortError'?'Download paused. Verified files are kept for resuming.':e.message);}
 finally{$('speech-install').disabled=false;$('speech-pause').disabled=true;$('speech-benchmark').disabled=false;}
};
$('speech-pause').onclick=()=>abort?.abort();
$('speech-benchmark-stop').onclick=()=>{running=false;cancelSpeech();};
$('speech-benchmark').onclick=async()=>{
 if(running)return;running=true;$('speech-benchmark').disabled=true;$('speech-benchmark-stop').disabled=false;$('speech-install').disabled=true;$('speech-evidence').disabled=true;
 const input='I will check the evidence before accepting this claim.';const started=performance.now();
 try{
  status('Running Kokoro locally…');const tts=await speechTask('narrate',{text:input,rate:1},{onProgress:status});if(!running)return;
  status('Running Whisper on the synthetic audio…');const stt=await speechTask('transcribe',{samples:downsample(tts.samples,tts.rate)},{onProgress:status});if(!running)return;
  const normalize=s=>s.toLowerCase().replace(/[^a-z ]/g,'').replace(/\s+/g,' ').trim();
  report={schema:'thread-speech-benchmark-1',at:new Date().toISOString(),userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency,deviceMemory:navigator.deviceMemory??null,cacheOnly:!!await offlineState(),powerCondition:$('power-condition')?.value||'unspecified',device:$('device-label')?.value||'Unlabelled device',packBytes:SPEECH_MODEL.bytes,whisperRevision:'ff4177021cc41f7db950912b73ea4fdf7d01d8e7',kokoroRevision:'1939ad2a8e416c0acfeecc08a694d14ef25f2231',input,transcript:stt.text,exactNormalizedMatch:normalize(input)===normalize(stt.text),kokoroSeconds:tts.seconds,whisperSeconds:stt.seconds,totalSeconds:(performance.now()-started)/1000,audioSeconds:tts.samples.length/tts.rate,scope:'Synthetic English speech, cold CPU workers; no microphone or human usability evaluation.'};
  $('speech-result').textContent=JSON.stringify(report,null,2);await put('last-speech-benchmark',report);$('speech-evidence').disabled=false;status(report.exactNormalizedMatch?'Speech benchmark completed; preset sentence preserved.':'Speech benchmark completed with a transcript difference. Inspect the results.');
 }catch(e){status(e.name==='AbortError'?'Speech benchmark cancelled.':e.message);}
 finally{running=false;$('speech-benchmark').disabled=false;$('speech-benchmark-stop').disabled=true;$('speech-install').disabled=false;}
};
$('speech-evidence').onclick=()=>{if(!report)return;const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='thread-speech-evidence.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);};
