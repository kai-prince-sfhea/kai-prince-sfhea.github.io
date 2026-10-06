import {get,put} from './store.js';
import {audioPreferences,narrationChunks,downsample,appendTranscript} from './speech-core.js';
import {speechTask,cancelSpeech,speechStatus} from './speech.js';

const $=id=>document.getElementById(id);
let synthesisDone,silent;
const savedAudio=await get('audio-preferences').catch(()=>null);
let prefs=audioPreferences(savedAudio?.consentVersion===2?savedAudio:{...savedAudio,enabled:false}),context,unlocked=false,sequence=0,current='',playing,stream,capture,source,recordTimer,recordEpoch=0,recording=false,frames=[],frameCount=0,musicTimer;
const tones=new Set();
function status(text){$('audio-status').textContent=text;}
function update(){
 $('audio-mute').textContent=prefs.enabled?'Mute audio':'Enable audio';$('audio-mute').removeAttribute('aria-pressed');
 for(const key of ['enabled','narration','music','cues'])$('audio-'+key).checked=prefs[key];
 $('audio-volume').value=prefs.volume;$('audio-rate').value=prefs.rate;
}
function save(){put('audio-preferences',{...prefs,consentVersion:2}).catch(()=>status('Audio settings could not be saved.'));update();}
async function unlock(){
 if(!context)context=new AudioContext();
 await context.resume();unlocked=true;
}
function stopNarration(){sequence++;synthesisDone?.();synthesisDone=null;cancelSpeech();globalThis.speechSynthesis?.cancel();if(playing){playing.onended?.();try{playing.stop();}catch{}playing=null;}}
function stopMusic(){clearInterval(musicTimer);musicTimer=null;for(const tone of tones)try{tone.stop();}catch{}tones.clear();}
function note(frequency,duration=3,level=0.008){
 if(!context||!unlocked||!prefs.enabled||recording||document.hidden)return;
 const oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime;
 oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(level*prefs.volume,now+0.08);gain.gain.exponentialRampToValueAtTime(0.00001,now+duration);
 oscillator.connect(gain).connect(context.destination);tones.add(oscillator);oscillator.onended=()=>{tones.delete(oscillator);oscillator.disconnect();gain.disconnect();};oscillator.start();oscillator.stop(now+duration);
}
function music(){stopMusic();if(!prefs.enabled||!prefs.music||!unlocked||recording||document.hidden)return;let i=0;const notes=[130.81,164.81,196,164.81,146.83,196];musicTimer=setInterval(()=>{if(!playing&&!globalThis.speechSynthesis?.speaking)note(notes[i++%notes.length],6,0.006);},6500);}
async function play(samples,rate){
 await unlock();const buffer=context.createBuffer(1,samples.length,rate);buffer.copyToChannel(samples,0);
 await new Promise(resolve=>{const node=context.createBufferSource(),gain=context.createGain();gain.gain.value=prefs.volume;node.buffer=buffer;node.connect(gain).connect(context.destination);playing=node;node.onended=()=>{node.disconnect();gain.disconnect();if(playing===node)playing=null;resolve();};node.start();});
}
async function narrate(){
 stopNarration();const token=sequence;if(!prefs.enabled||!prefs.narration||!unlocked||recording||!current||document.hidden)return;
 try{
  // Local OS voices avoid loading another neural model while Gemma is resident.
  const voice=globalThis.globalThis.speechSynthesis?.getVoices().find(v=>v.localService&&/^en\b/i.test(v.lang));
  if(voice){
   status('Reading this briefing with an on-device voice.');
   for(const text of narrationChunks(current)){
    if(token!==sequence)return;
    await new Promise(resolve=>{const utterance=new SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.rate=prefs.rate;utterance.volume=prefs.volume;synthesisDone=resolve;utterance.onend=utterance.onerror=()=>{synthesisDone=null;resolve();};speechSynthesis.speak(utterance);});
   }
  }else{
   if(!(await speechStatus()).ready){status('No on-device voice is available. Install optional speech tools in Device setup for Kokoro narration.');return;}
   for(const text of narrationChunks(current)){
    if(token!==sequence)return;status('Preparing this sentence locally with Kokoro…');
    const result=await speechTask('narrate',{text,rate:prefs.rate});
    if(token!==sequence)return;status('Reading this briefing with Kokoro.');await play(result.samples,result.rate);
   }
  }
  if(token===sequence)status('Narration finished.');
 }catch(e){if(e.name!=='AbortError')status('Narration unavailable: '+e.message);}
}
const nav=document.querySelector('.top-actions');
const mute=document.createElement('button');mute.id='audio-mute';mute.className='text-button';nav.append(mute);
const settings=document.createElement('details');settings.innerHTML=`<summary>Sound & narration</summary><p>Audio starts after an interaction. All spoken information remains available as text. Local device voices are preferred; Kokoro is used if none is available.</p><label><input id="audio-enabled" type="checkbox"> Enable audio</label><label><input id="audio-narration" type="checkbox"> Narrate briefing pages</label><label><input id="audio-cues" type="checkbox"> Subtle page cues</label><label><input id="audio-music" type="checkbox"> Quiet ambient music</label><label for="audio-volume">Audio volume</label><input id="audio-volume" type="range" min="0" max="1" step="0.05"><label for="audio-rate">Narration speed</label><input id="audio-rate" type="range" min="0.75" max="1.25" step="0.05"><p>Switch narration off when using a screen reader if speech overlaps. Audio is optional and does not affect verification.</p>`;
settings.className='audio-settings setting';$('preferences-status').before(settings);
const controls=document.createElement('div');controls.className='audio-controls';controls.innerHTML='<button class="text-button" id="audio-read">Read current briefing</button><button class="text-button" id="audio-stop">Stop narration</button><span id="audio-status" role="status"></span>';document.querySelector('.topbar').after(controls);
$('audio-read').disabled=true;
update();
mute.onclick=async()=>{prefs.enabled=!prefs.enabled;save();if(!prefs.enabled){stopNarration();stopMusic();}else{await unlock().catch(e=>status(e.message));music();}};
for(const key of ['enabled','narration','cues','music','volume','rate'])$('audio-'+key).onchange=async()=>{const wasReading=!!playing||!!globalThis.speechSynthesis?.speaking;prefs[key]=['volume','rate'].includes(key)?Number($('audio-'+key).value):$('audio-'+key).checked;save();stopNarration();if(prefs.enabled)await unlock().catch(e=>status(e.message));music();if(wasReading&&prefs.enabled&&prefs.narration)await narrate();else if(key==='rate')status('Narration speed: '+prefs.rate+'×. Applied to the next reading.');};
$('audio-read').onclick=async()=>{await unlock();music();if(!prefs.enabled||!prefs.narration){status('Enable audio and narration in Accessibility preferences to read this briefing.');return;}await narrate();};
$('audio-stop').onclick=()=>{stopNarration();status('Narration stopped.');};
$('reset-preferences').addEventListener('click',()=>{prefs=audioPreferences();save();stopNarration();music();});
document.addEventListener('click',()=>{if(!unlocked&&prefs.enabled)unlock().then(music).catch(()=>{});},{capture:true});
document.addEventListener('thread-exposition',event=>{stopNarration();current=event.detail?.text||'';$('audio-read').disabled=!current;if(current&&prefs.cues)note(440,0.25,0.10);if(current)setTimeout(()=>narrate(),0);});
document.addEventListener('thread-verification',event=>{if(prefs.cues)note(event.detail?.status==='verified'?523.25:392,0.25,0.10);});
$('preferences-button').addEventListener('click',stopNarration);
document.addEventListener('thread-busy',()=>{stopNarration();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelRecording();stopNarration();stopMusic();context?.suspend().catch(()=>{});}else if(context&&unlocked)context.resume().then(music).catch(()=>{});});
window.addEventListener('pagehide',()=>{cancelRecording();stopNarration();stopMusic();context?.close().catch(()=>{});context=null;unlocked=false;});

// Mic permission is requested only from Record; transcripts are editable drafts.
const dialog=$('dictation-dialog');
dialog.querySelector('.dictation-list')?.remove();
for(const p of dialog.querySelectorAll(':scope > p'))p.remove();
const content=document.createElement('div');content.innerHTML=`<p>Record up to 30 seconds. Whisper transcribes on this device. No audio is saved or uploaded. Review names, negations and punctuation before adding the transcript to your thought.</p><p><a href="./device.html#speech-tools">Install optional speech tools</a></p><button id="speech-record" class="primary-button">Record</button><button id="speech-finish" class="secondary-button" disabled>Stop & transcribe</button><button id="speech-cancel" class="secondary-button">Cancel recording / processing</button><p id="speech-status" role="status"></p><label for="speech-transcript">Review my transcript</label><textarea id="speech-transcript" rows="4" maxlength="2500"></textarea><button id="speech-use" class="secondary-button" disabled>Add transcript to my thought</button>`;
$('dictation-done').before(content);
const say=text=>{$('speech-status').textContent=text;};
function releaseMic(){clearTimeout(recordTimer);stream?.getTracks().forEach(track=>track.stop());stream=null;capture?.disconnect();if(capture)capture.port.onmessage=null;capture=null;source?.disconnect();source=null;silent?.disconnect();silent=null;recording=false;$('speech-record').disabled=false;$('speech-finish').disabled=true;}
function cancelRecording(){recordEpoch++;releaseMic();frames=[];frameCount=0;cancelSpeech();}
async function finish(){
 if(!recording)return;const token=recordEpoch;const rate=context.sampleRate;releaseMic();
 const merged=new Float32Array(frameCount);let offset=0;for(const part of frames){merged.set(part,offset);offset+=part.length;}frames=[];frameCount=0;
 say('Transcribing locally. The microphone is off.');$('speech-record').disabled=true;
 try{const result=await speechTask('transcribe',{samples:downsample(merged,rate)});if(token!==recordEpoch)return;$('speech-transcript').value=result.text.trim();$('speech-use').disabled=!result.text.trim();say('Check this transcript before adding it to your thought.');}
 catch(e){if(token===recordEpoch)say(e.name==='AbortError'?'Transcription cancelled.':e.message);}
 finally{merged.fill(0);if(token===recordEpoch)$('speech-record').disabled=false;}
}
$('speech-record').onclick=async()=>{
 cancelRecording();stopNarration();stopMusic();const token=recordEpoch;
 $('speech-record').disabled=true;$('speech-use').disabled=true;$('speech-transcript').value='';say('Checking local speech tools…');
 try{
  if(!(await speechStatus()).ready)throw Error('Install the optional speech tools in Device setup first.');
  await unlock();await context.audioWorklet.addModule(new URL('./microphone-worklet.js',import.meta.url));
  if(token!==recordEpoch)return;
  const mic=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true},video:false});
  if(token!==recordEpoch||document.hidden||!dialog.open){mic.getTracks().forEach(t=>t.stop());return;}
  stream=mic;source=context.createMediaStreamSource(stream);capture=new AudioWorkletNode(context,'thread-capture');
  capture.port.onmessage=({data})=>{if(!recording)return;if(frameCount+data.length>context.sampleRate*30){void finish();return;}frames.push(data);frameCount+=data.length;};
  source.connect(capture);silent=context.createGain();silent.gain.value=0;capture.connect(silent).connect(context.destination);capture.addEventListener('processorerror',()=>{cancelRecording();say('Recording stopped because the microphone processor failed.');},{once:true});
  recording=true;$('speech-finish').disabled=false;say('Recording · maximum 30 seconds.');recordTimer=setTimeout(finish,30000);
 }catch(e){if(token===recordEpoch){releaseMic();say('Could not record: '+e.message);}}
};
$('speech-finish').onclick=finish;$('speech-cancel').onclick=()=>{cancelRecording();say('Recording and processing cancelled.');};
$('speech-transcript').oninput=()=>{$('speech-use').disabled=!$('speech-transcript').value.trim();};
$('speech-use').onclick=()=>{try{const thought=$('thought');if(thought.disabled)throw Error('Wait for the current thought to finish processing.');thought.value=appendTranscript(thought.value,$('speech-transcript').value);thought.dispatchEvent(new Event('input',{bubbles:true}));dialog.close();thought.focus();}catch(e){say(e.message);}};
dialog.addEventListener('close',()=>{cancelRecording();$('speech-transcript').value='';$('speech-use').disabled=true;music();});
