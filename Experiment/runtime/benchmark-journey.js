// Feature fixtures, not simulated learner journeys or evidence of learning gains.
import {compile} from './compiler.js';
import {localApi,verifyFormal} from './local-api.js';
import {get,put,remove} from './store.js';
import {challengeClaim,challengeClosure,challengeStructure} from './benchmark-challenge.js';
import {restoreAttempt} from './restore-session.js';
const check=(value,message)=>{if(!value)throw Error(message);};
const config={subject:'researcher',context:'exhibition',difficulty:'challenge',seed:'onboarding-2026'};
export async function benchmarkJourney({test,tools,includeModel}){
 let tutorial,journey,records=[];
 await test('Tutorial · canonical import, two connected goals and real certificates',async()=>{
  tools();tutorial=await compile({op:'tutorial'});const imported=await compile({op:'import',source:tutorial.source_text});
  check(imported.tutorial?.version==='archive-v1','Tutorial identity was lost');check(!tutorial.nodes.ready.fact&&!tutorial.nodes.enter.fact,'Tutorial gives away its goals as facts');
  const first=challengeClaim(['ready'],{premises:['pass','booked']}),second=challengeClaim(['enter'],{id:'c2',premises:['ready','open']});
  check((await verifyFormal(first,[],tutorial,{cache:false})).status==='verified','First tutorial step failed');
  check((await compile({op:'goal',accepted:[first],scenario:tutorial})).status==='not_discovered','Tutorial ended after the first connection');
  check((await verifyFormal(second,[first],tutorial,{cache:false})).status==='verified','Second tutorial step failed');
  check((await compile({op:'goal',accepted:[first,second],scenario:tutorial})).status==='candidate','Tutorial goal coverage failed');
  return 'Two connected claims certified; first connection alone cannot complete the tutorial.';
 });
 await test('Staged review · reproducibility, branch facts, budget and canonical import',async()=>{
  tools();journey=await compile({op:'generate_journey',spec:{config,choices:[]}});
  check(challengeStructure(journey)===challengeStructure(await compile({op:'generate_journey',spec:{config,choices:[]}})),'Seed replay changed');
  let paths=0;for(const a of journey.journey.available){const middle=await compile({op:'generate_journey',spec:{config,choices:[a.id]}});for(const b of middle.journey.available){
   const s=await compile({op:'generate_journey',spec:{config,choices:[a.id,b.id]}}),known=challengeClosure(s);paths++;
   check(s.journey.stage===3&&s.journey.remaining>=0&&!s.journey.available.length,'Final stage or budget invalid');
   check(['wait','close','review'].filter(id=>known.has(id)).length===1,'Conflicting disposition');
   check(s.challenge.requirements.every(r=>r.any_of.some(id=>known.has(id))),'Unreachable stage obligation');
   check((await compile({op:'import',source:s.source_text})).source_hash===s.source_hash,'Canonical reimport changed');
  }}
  for(const choices of [['independent','independent'],['origin','origin'],['defer','defer','defer']]){let rejected=false;try{await compile({op:'generate_journey',spec:{config,choices}});}catch{rejected=true;}check(rejected,'Invalid path accepted');}
  const independent=await compile({op:'generate_journey',spec:{config,choices:['independent']}}),defer=await compile({op:'generate_journey',spec:{config,choices:['defer']}});
  check(independent.nodes.independent.fact&&independent.nodes.fits.fact&&!defer.nodes.independent.fact,'Choice did not change collected facts');
  return {paths,seed:config.seed,scope:'Deterministic feature fixtures; no procedural player simulation.'};
 });
 await test('Staged review · goal gates, private preparation, fresh stages and repeat-safe choice',async()=>{
  tools();check(journey,'Generator prerequisite failed');let made=await localApi('/api/session',{scenario:journey});
  const preparationPreference=await get('background-preparation');
  try{await put('background-preparation',false);check((await localApi('/api/prepare-next-stage',{session_id:made.session_id})).prepared===0,'Background opt-out still generated future stages');}
  finally{if(preparationPreference===undefined)await remove('background-preparation');else await put('background-preparation',preparationPreference);}
  await localApi('/api/prepare-next-stage',{session_id:made.session_id});let saved=await localApi('/api/session?id='+made.session_id);
  check(!saved.graph.length&&!saved.next_stage&&!JSON.stringify(saved).includes('stagePreviews'),'Prepared evidence entered the player record');
  let refused=false;try{await localApi('/api/next-stage',{session_id:made.session_id,choice:'independent',rationale:''});}catch{refused=true;}check(refused,'Unsolved stage advanced');
  records=[];
  for(let stage=1;stage<=3;stage++){
   const s=await get('session:'+made.session_id),known=challengeClosure(s.scenario),claim=challengeClaim(s.scenario.challenge.requirements.map(r=>r.any_of.find(id=>known.has(id))));
   const result=await verifyFormal(claim,[],s.scenario,{cache:false});check(result.status==='verified','Stage certificate failed');s.claims=[claim];await put('session:'+s.id,s);
   const goal=await localApi('/api/check-solution',{session_id:s.id});check(goal.progress.solved,'Complete stage did not meet its goal');
   await put('learning:'+s.id,{why:'I connected evidence to a bounded action.',plan:'Check a source independently next time.'});
   if(stage<3){const choice=stage===1?'independent':'explanation',next=await localApi('/api/next-stage',{session_id:s.id,choice,rationale:'This check distinguishes the remaining conditions.'});
    const repeated=await localApi('/api/next-stage',{session_id:s.id,choice,rationale:''});check(next.session_id===repeated.session_id,'Repeat choice duplicated the next stage');
    check(next.previous_stage===s.id&&!next.graph.length&&!next.progress.solved,'Earlier claims or completion leaked into next stage');made=next;
   }
   records.push({session:await localApi('/api/session?id='+s.id),reflection:await get('learning:'+s.id)});
  }
  return {stages:3,remaining:records.at(-1).session.scenario.journey.remaining,scope:'Prolog and Coq verification of feature fixtures; no natural-language player simulation.'};
 });
 await test('Staged review · portable restore rechecks certificates and preserves reflections',async()=>{
  tools();check(records.length===3,'Completed stage fixtures unavailable');const id=await restoreAttempt({server_session:records.at(-1).session,stage_history:records});
  const final=await localApi('/api/session?id='+id),learning=await get('learning:'+id);check(final.progress.solved&&final.previous_stage&&learning.plan,'Restore lost certified completion, stage link or reflection');
  check(final.history.length===1&&final.history[0].result.sources.coq,'Restored proof inspection missing');return 'All three stages rechecked; new session IDs, decisions, proof inspection and reflection fields retained.';
 });
 await test('Learning flow UI · tutorial draft, saved briefing, stage choices and final debrief',async()=>{
  tools();check(tutorial&&records.length===3,'Flow fixtures unavailable');const frame=document.createElement('iframe');frame.title='Isolated learning-flow benchmark';frame.style.cssText='position:absolute;left:-2000px;width:1000px;height:900px';document.body.append(frame);
  const collapse=await get('scenario-collapsed'),preferences=await get('preferences'),background=await get('background-preparation');
  const wait=async(fn,label)=>{const end=performance.now()+30000;while(performance.now()<end){if(fn())return;await new Promise(r=>setTimeout(r,50));}throw Error('Learning-flow UI timeout: '+label+' · '+(frame.contentDocument?.body?.innerText||'Page body unavailable').slice(-2000));};
  const button=(d,label)=>[...d.querySelectorAll('button')].find(b=>b.textContent===label);
  try{
   const made=await localApi('/api/session',{scenario:tutorial});await put('flow:'+made.session_id,{phase:'brief',page:1});frame.src='/Experiment/#session='+made.session_id;
   await wait(()=>frame.contentDocument?.body?.dataset.flow==='brief'&&frame.contentDocument.querySelector('#busy-status')?.hidden,'saved tutorial briefing');let d=frame.contentDocument;
   check(d.querySelector('main').hidden&&d.querySelector('#scenario-flow').textContent.includes('How I will practise'),'Briefing was not restored');
   button(d,'Continue to thinking').click();check(d.body.dataset.flow==='thinking'&&!d.querySelector('main').hidden,'Thinking transition failed');
   d.querySelectorAll('.tutorial-coach details').forEach(x=>x.open=true);button(d,'Use this as an editable draft').click();check(d.querySelector('#thought').value.includes('archive visit is ready'),'Example did not populate editable draft');
   check(!(await localApi('/api/session?id='+made.session_id)).graph.length,'Tutorial example was accepted without confirmation');
   button(d,'Hide scenario information').click();check(d.body.classList.contains('scenario-collapsed'),'Scenario information did not collapse');button(d,'Show scenario information').click();
   const dialog=d.querySelector('#preferences-dialog');dialog.showModal();dialog.querySelectorAll('details').forEach(n=>n.open=true);
   const size=d.querySelector('#text-size');size.value='largest';size.dispatchEvent(new frame.contentWindow.Event('change',{bubbles:true}));
   const spacing=d.querySelector('#reading-spacing');if(!spacing.checked)spacing.click();
   check(d.documentElement.dataset.textSize==='largest'&&d.body.classList.contains('reading-space'),'Reading preferences did not apply');
   const preparation=d.querySelector('#anticipation-enabled');if(preparation.checked)preparation.click();
   await wait(()=>d.querySelector('#preferences-status').textContent.includes('saved'),'reading preference save');
   await new Promise(r=>setTimeout(r,150));check((await get('background-preparation'))===false,'Background preference not saved');
   frame.style.width='320px';await new Promise(r=>setTimeout(r,100));check(d.documentElement.scrollWidth<=d.documentElement.clientWidth+2&&dialog.scrollWidth<=dialog.clientWidth+2,'Reading controls overflow at 320px / 150% size');
   dialog.close();frame.style.width='1000px';
   frame.src=`/Experiment/?resume=${Date.now()}#session=${records[0].session.session_id}`;await wait(()=>frame.contentDocument?.body?.dataset.flow==='debrief'&&frame.contentDocument.querySelector('#busy-status')?.hidden,'stage one debrief');
   for(const [i,choice]of ['independent','explanation'].entries()){
    d=frame.contentDocument;const select=d.querySelector('#next-evidence-choice');check(select,'Missing next-stage choice');select.value=choice;select.dispatchEvent(new frame.contentWindow.Event('change',{bubbles:true}));
    button(d,'Choose evidence and read the next stage').click();await wait(()=>frame.contentWindow.location.hash==='#session='+records[i+1].session.session_id&&frame.contentDocument.body.dataset.flow==='debrief'&&frame.contentDocument.querySelector('#busy-status')?.hidden,'existing stage '+(i+2));
   }
   d=frame.contentDocument;check(d.querySelector('#scenario-flow').textContent.includes('Across my three stages'),'Final debrief has no cumulative history');
   const learning=d.querySelector('.learning-checkpoint');check(learning.querySelectorAll('textarea').length===6,'Comprehensive reflection prompts missing');check(learning.querySelector('.peer-discussion')?.textContent.includes('private reflections')&&learning.querySelector('.peer-discussion')?.textContent.includes('on my own'),'Voluntary peer/solo and selective-sharing guidance missing');
   check([...learning.querySelectorAll('textarea')].filter(n=>!n.closest('section[hidden]')).length===2,'Reflection is not divided into small groups');
   frame.style.width='320px';await new Promise(r=>setTimeout(r,100));check(d.documentElement.scrollWidth<=d.documentElement.clientWidth+2,'Learning flow overflows at 320 CSS pixels');
   return 'Actual briefing, editable tutorial draft, collapse control, existing stage navigation, six prompts in three groups, reading/spacing controls, background opt-out and 320 CSS pixel reflow at 150% text exercised. Assistive-technology usability remains a separate evaluation.';
  }finally{frame.remove();for(const [key,value]of [['scenario-collapsed',collapse],['preferences',preferences],['background-preparation',background]])if(value!==undefined)await put(key,value);else await remove(key);}
 });
 await test('Audio UI · preferences, reviewed transcript and cancellation without microphone capture',async()=>{
  tools();check(tutorial,'Tutorial prerequisite failed');
  const previous=await get('audio-preferences'),frame=document.createElement('iframe');
  frame.title='Isolated audio controls benchmark';frame.style.cssText='position:absolute;left:-2000px;width:1000px;height:900px';
  const wait=async fn=>{const end=performance.now()+30000;while(performance.now()<end){if(fn())return;await new Promise(r=>setTimeout(r,50));}throw Error('Audio UI did not become ready');};
  try{
   await put('audio-preferences',{enabled:false,narration:false,music:false,cues:false,volume:0.2,rate:1});
   const made=await localApi('/api/session',{scenario:tutorial});await put('flow:'+made.session_id,{phase:'thinking',page:0});
   document.body.append(frame);frame.src='/Experiment/#session='+made.session_id;
   await wait(()=>frame.contentDocument?.querySelector('#speech-use')&&frame.contentDocument.querySelector('#busy-status')?.hidden);
   const d=frame.contentDocument,w=frame.contentWindow,thought=d.querySelector('#thought');
   check(d.querySelector('#audio-mute').textContent==='Enable audio','Saved mute was not applied');
   const prefs=d.querySelector('#preferences-dialog');prefs.showModal();
   const volume=d.querySelector('#audio-volume');volume.value='0.35';volume.dispatchEvent(new w.Event('change'));
   await wait(()=>d.querySelector('#audio-volume').value==='0.35');prefs.close();
   d.querySelector('#dictation-button').click();check(d.querySelector('#dictation-dialog').open,'Dictation did not open');
   check(d.querySelector('#speech-use').disabled,'Empty transcript can be submitted');
   thought.value='My existing thought.';const transcript=d.querySelector('#speech-transcript');transcript.value='I will inspect this evidence.';transcript.dispatchEvent(new w.Event('input'));
   d.querySelector('#speech-use').click();check(thought.value.includes('My existing thought.')&&thought.value.includes('inspect this evidence'),'Reviewed text did not append to the draft');
   await wait(()=>!d.querySelector('#dictation-dialog').open&&!transcript.value);
   check(!(await localApi('/api/session?id='+made.session_id)).graph.length,'Transcript submitted an argument without review');
   d.querySelector('#dictation-button').click();d.querySelector('#speech-cancel').click();check(d.querySelector('#speech-status').textContent.includes('cancelled'),'Cancellation feedback missing');d.querySelector('#dictation-dialog').close();
   return 'Real audio controls and editable-draft flow exercised with typed synthetic transcript. No Record click, microphone permission, captured audio or audible output; the separate speech benchmark tests the models.';
  }finally{frame.remove();if(previous===undefined)await remove('audio-preferences');else await put('audio-preferences',previous);}
 });
 if(includeModel)await test('Gemma · tutorial interpretation review and two-step completion',async()=>{
  tools();check(tutorial,'Tutorial prerequisite failed');const made=await localApi('/api/session',{scenario:tutorial});
  for(const [index,text]of ['My archive visit is ready because my archive pass is valid and my archive visit is booked.','I may enter the archive because my archive visit is ready and the archive is open.'].entries()){
   const r=await localApi('/api/interpret',{session_id:made.session_id,text});check(r.candidate_id,'Tutorial needs clarification: '+r.clarification);
   const graph=r.interpretation.graph,expected=index?'enter':'ready';check(graph.conclusions.length===1&&graph.conclusions[0].id===expected&&graph.conclusions[0].positive,'Tutorial interpretation changed conclusion: '+JSON.stringify({text,expected,graph}));const reasons=index?['ready','open']:['pass','booked'];check(graph.assumptions.length===2&&reasons.every(id=>graph.assumptions.some(p=>p.id===id&&p.positive)),'Tutorial interpretation lost a stated reason: '+JSON.stringify({text,reasons,graph}));
   const confirmed=await localApi('/api/verify',{session_id:made.session_id,candidate_id:r.candidate_id});check(confirmed.status==='verified','Tutorial verification failed');check(confirmed.progress.solved===(index===1),'Tutorial completed at the wrong step');
  }
  return 'Both natural-language example drafts interpreted by Gemma, confirmed and verified; completion only after the second step.';
 });
}
