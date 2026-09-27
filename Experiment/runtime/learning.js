import {get,put} from './store.js';

const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export const TRANSFER_CASE=`theory Transfer_Archive imports Main begin
(* thread:title The archive visit *)
(* thread:description I need both a valid pass and a booked visit to enter the archive. I will explain which conditions support my conclusion, and what changes if one is missing. *)
(* thread:goal may_enter *)
(* thread:label pass = I have a valid archive pass *)
(* thread:label booked = I have booked my visit *)
(* thread:label may_enter = I may enter the archive *)
locale Archive = fixes pass booked may_enter :: "bool"
assumes pass_fact: "pass" and booking_fact: "booked" and entry_rule: "pass & booked ==> may_enter"
begin end end`;

// Keep the existing archive exercise compatible with saved/custom cases. The
// archive tutorial needs a different setting for its optional transfer practice.
export const EXHIBITION_TRANSFER_CASE=`theory Transfer_Exhibition imports Main begin
(* thread:title The exhibition display *)
(* thread:description I am preparing a fictional exhibition. I will explain how separate conditions combine to make a display ready, then connect readiness to opening it. I can compare this structure with my earlier reasoning. *)
(* thread:goal ready,may_open *)
(* thread:label checked = The exhibition labels have been checked *)
(* thread:label arranged = The exhibition objects have been arranged *)
(* thread:label room = The exhibition room is available *)
(* thread:label ready = The exhibition display is ready *)
(* thread:label may_open = I may open the exhibition display *)
locale Exhibition = fixes checked arranged room ready may_open :: "bool"
assumes checked_fact: "checked" and arranged_fact: "arranged" and room_fact: "room"
and ready_rule: "checked & arranged ==> ready" and opening_rule: "ready & room ==> may_open"
begin end end`;

export function transferPractice(scenario){
 return scenario.tutorial?{source:EXHIBITION_TRANSFER_CASE,label:'Try a new context: an exhibition'}:{source:TRANSFER_CASE,label:'Try a new context: the archive'};
}

export function hintFor(session,level=0){
 const last=session.history?.at(-1)?.result,status=last?.status;
 const target=session.scenario;
 const difficulty=status==='error'?'My tools did not finish. I can keep my thought and retry; this says nothing about whether my reasoning is correct.':status==='unsupported'?'The supplied rules do not establish this claim. That is not proof that it is false. Which evidence or connecting rule is missing?':status==='refuted'?'The check found a case or derivation that conflicts with my claim. Which observation or condition needs another look?':status==='invalid_assumptions'?'Can all my assumptions hold together? I can inspect the pair that conflicts.':null;
 if(difficulty)return [difficulty,'I can compare my original thought with the interpretation first. If they match, I can inspect one relevant observation and rule before revising.','I can distinguish: “The observation is [fact]. My proposed connection is [reason]. The point I still need to establish is [claim].”','A separate example: hearing the same announcement twice does not give two independent sources. That limits the evidence; it does not by itself show the announcement is false. This example adds no fact to my review.'][level];
 if(target.tutorial){const ready=session.claims?.some(c=>c.conclusions?.some(p=>p.id==='ready'&&p.positive));return [ready?'My visit is ready. What further condition connects it to entering?':'Which two facts make my visit ready?',ready?'I can compare the ready-visit statement with the rule about entering. Is its other condition established?':'I can inspect the pass and booking observations. The ready-visit rule needs both.','I use [facts]. The rule requires [conditions]. Therefore [conclusion]. I can explain this in my own words.','In a separate library, a valid pass AND an available book permit borrowing. One condition alone is insufficient. This example adds no archive fact.'][level];}
 if(target.challenge){
  const learned=new Set((session.claims||[]).flatMap(c=>(c.conclusions||[]).filter(p=>p.positive).map(p=>p.id)));
  for(const r of target.challenge.requirements)for(const route of r.support_routes||[])if((session.claims||[]).some(c=>c.conclusions.some(p=>p.positive&&p.id===route.decision)&&route.premises.every(id=>c.assumptions.some(p=>p.positive&&p.id===id))))learned.add(route.warrant);
  const next=target.challenge.requirements.find(r=>!r.any_of.some(id=>learned.has(id)));
  const current=next?.label||'Explain why my completed recommendation is warranted';
  const cue=next?.cue||'What evidence would change my decision?';
  return [
   `My next open obligation is: ${current}. ${target.journey?'I can choose which connection in this record to explain first.':'I can choose another record first.'}`,
   session.guidance==='minimal'?cue:session.guidance==='more'?`${cue} First I locate the observations for one record. Then I check each premise of one review rule. Finally I explain the connection in my own words. A repeated report may share an evidence origin.`:`${cue} I can compare the given observations with one review rule.`,
   'I can explain: “The observation is [fact]. It supports [claim] because [rule], within [scope]. An alternative is [explanation]; [further evidence] would distinguish it.” I distinguish the report, reason and decision; I may explain connected parts together.',
   'A separate example: two library notices copied from one catalogue are one evidence origin. A separately checked edition may corroborate them, but only for the passage it actually checks. This analogy is not a fact in my review.'
  ][level];
 }
 const cue=status==='error'?'My tools did not finish. I can keep my thought and retry; this says nothing about whether my reasoning is correct.':status==='refuted'?'Which condition in the counterexample differs from my assumption? I can compare one case before changing my conclusion.':status==='invalid_assumptions'?'Can all my assumptions hold together? I can inspect the pair that conflicts.':last?.solution_check?.status==='awaiting_strategy'?'I have information about both doors. What will I do after yes, and what will I do after no?':target.hints?.[0]||'Which given rule connects my evidence to the goal?';
 return [
  `My current goal is: ${target.goal} I can choose one given fact or one uncertainty to start with.`,
  cue,
  'I can complete this in my own words: “I use [given fact]. The rule says [connection]. So [claim], provided [condition].” I only cite an earlier step if I actually use it.',
  'A separate example: a library lends a book only when my pass is valid and the book is available. A valid pass alone is insufficient. I need to establish both conditions. This example is practice, not a fact in my current scenario.'
 ][level];
}

export function learningCheckpoint({session,scenario,onTransfer,onChallengeTransfer}){
 const box=el('section');box.className='learning-checkpoint';
 const micro=!!scenario.journey&&scenario.journey.stage<scenario.journey.total;
 box.append(el('h3',micro?'A short stage reflection':'Explain, reflect and apply'),el('p','My certificate establishes translated statements under the supplied rules. My explanation is a separate learning record. I may write briefly, use dictation, skip a prompt or return later.'));
 const status=el('p','Loading my reflection…');status.setAttribute('role','status');
 const groups=micro?[[['why','What connection mattered at this stage?'],['revision','What remains uncertain, and what should my next check distinguish?']]]:[
  [['why','Which facts and rule support a key step? How does it contribute to the whole argument?'],['alternative','What serious alternative or counterexample did I consider? What evidence could distinguish it?']],
  [['revision','What did I revise or rule out, and why?'],['influence','What assumptions, task conditions or access supports influenced my reasoning? · optional']],
  [['transfer','Where could I apply this method, and which assumptions would need checking again?'],['plan','What specific action will I try next time, and how will I know it helped?']]
 ];
 const inputs={},panels=[];let selected=0,loaded=false,writing=Promise.resolve();
 const progress=el('p');progress.setAttribute('role','status');box.append(progress);
 for(const [i,fields]of groups.entries()){
  const panel=el('section');panel.hidden=i!==0;panel.append(el('h4',micro?'What I learned so far':['Explain a connection','Reflect on the process','Plan a transfer'][i]));
  for(const [key,label]of fields){const l=el('label',label),a=el('textarea');a.rows=3;a.maxLength=2500;a.id=`learning-${session}-${key}`;a.dir='auto';a.disabled=true;l.htmlFor=a.id;panel.append(l,a);inputs[key]=a;}
  panels.push(panel);box.append(panel);
 }
 const persist=()=>{if(!loaded)return;const value={scenario:scenario.id,...Object.fromEntries(Object.entries(inputs).map(([k,v])=>[k,v.value])),updated:new Date().toISOString(),assessment:'self-reflection; not independently assessed'};writing=writing.catch(()=>{}).then(()=>put('learning:'+session,value));return writing;};
 for(const a of Object.values(inputs))a.oninput=()=>persist()?.catch(e=>status.textContent='Could not save: '+e.message);
 const nav=el('div');nav.className='flow-actions';const previous=el('button','Previous reflection'),next=el('button','Next reflection');previous.type=next.type='button';
 const show=()=>{panels.forEach((p,i)=>p.hidden=i!==selected);progress.textContent=micro?'Optional stage note':`Reflection ${selected+1} of ${groups.length}`;previous.disabled=selected===0;next.disabled=selected===groups.length-1;};
 previous.onclick=()=>{selected--;show();panels[selected].querySelector('textarea')?.focus();};next.onclick=()=>{selected++;show();panels[selected].querySelector('textarea')?.focus();};if(!micro)nav.append(previous,next);show();
 const save=el('button','Save my explanation');save.type='button';save.dataset.saveReflection='';save.disabled=true;save.onclick=async()=>{try{await persist();status.textContent='My reflection is saved locally. It has not been independently assessed.';}catch(e){status.textContent='Could not save: '+e.message;}};
 box.append(nav,save,status,el('p','Reflection is optional and ungraded. Personal or emotional disclosure is never required.'));
 if(!micro){
  const peer=el('details');peer.className='peer-discussion';peer.append(el('summary','Explain one idea · with a willing peer or on my own'),el('p','I can choose one connection worth explaining: what supports it, and where might it stop applying? A willing partner can restate my meaning before asking one fair question or proposing an alternative. We can exchange roles, disagree with the claim respectfully, or stop. I can rehearse both roles on my own.'),el('p','I share only text I deliberately select. Full JSON and readable exports can contain private reflections; I review them before sharing. Thread does not send anything or provide a peer community. Popularity and agreement are not evidence that a claim is sound.'));box.append(peer);
  const challengeTransfer=!!scenario.challenge&&!!onChallengeTransfer;
  const practice=transferPractice(scenario);
  const transfer=el('button',challengeTransfer?'Compare this seed in another subject or setting':practice.label);transfer.type='button';transfer.className='secondary-button';transfer.onclick=()=>challengeTransfer?onChallengeTransfer():onTransfer(practice.source);
  const details=el('details');details.append(el('summary','Apply the method in another context'),el('p','I can compare the same seed and difficulty in a setting I choose. A changed setting can reveal a shared structure; it does not define my identity or ability. A fresh problem needs its assumptions checked again. I can explain which condition is necessary and which combination is sufficient.'),transfer);box.append(details);
 }
 get('learning:'+session).then(prior=>{for(const [k,a]of Object.entries(inputs))a.value=prior?.[k]||'';status.textContent=prior?'Saved reflection restored.':'My notes save as I write.';}).catch(e=>status.textContent='Could not load reflection: '+e.message).finally(()=>{loaded=true;save.disabled=false;Object.values(inputs).forEach(a=>a.disabled=false);});
 return box;
}

export function authorTheory({title,description,statements,facts,rules,goal}){
 const clean=s=>{if(!s.trim()||s.length>1800||/[\r\n*]/.test(s))throw Error('Use a short single line without asterisks for each label.');return s.trim();};
 const labels=statements.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);if(labels.length<2||labels.length>12)throw Error('Provide 2–12 statements, one per line.');labels.forEach(clean);
 const id=n=>{if(!/^\d+$/.test(n.trim())||+n<1||+n>labels.length)throw Error('Use statement numbers from 1 to '+labels.length);return 'p'+(+n);};
 const given=facts.split(',').filter(s=>s.trim()).map(id);if(!given.length)throw Error('Choose at least one given fact.');
 const targets=goal.split(',').map(id);if(targets.some(p=>given.includes(p)))throw Error('Choose a goal that is not already a given fact.');
 const clauses=given.map((p,i)=>`f${i}: "${p}"`);
 const steps=rules.split(/\r?\n/).filter(s=>s.trim());if(!steps.length)throw Error('Add a connecting rule, for example 1,2 -> 3.');
 steps.forEach((r,i)=>{const sides=r.split('->');if(sides.length!==2)throw Error('Use a rule such as 1,2 -> 3.');clauses.push(`r${i}: "${sides[0].split(',').map(id).join(' & ')} ==> ${id(sides[1])}"`);});
 return `theory My_Reasoning_Case imports Main begin\n(* thread:title ${clean(title)} *)\n(* thread:description ${clean(description)} *)\n(* thread:goal ${targets.join(',')} *)\n${labels.map((l,i)=>`(* thread:label p${i+1} = ${l} *)`).join('\n')}\nlocale My_Case = fixes ${labels.map((_,i)=>'p'+(i+1)).join(' ')} :: "bool" assumes ${clauses.join(' and ')} begin end end`;
}

export function authorForm(onReview){
 const details=el('details');details.className='author-builder';details.append(el('summary','Create a scenario without writing THY'),el('p','Describe statements in your own words, then connect their line numbers. This builder supports definite facts and “if all these conditions hold, then…” rules. It does not establish that real-world assumptions are true.'));
 const spec={title:['Title','The archive visit'],description:['Story and learning purpose','I will connect two required conditions to permission to enter an archive.'],statements:['Statements · one per line, numbered from 1','I have a valid pass\nI have booked a visit\nI may enter the archive'],facts:['Given facts · comma-separated statement numbers','1,2'],rules:['Rules · for example 1,2 -> 3','1,2 -> 3'],goal:['Goal · statement number','3']},inputs={};
 for(const [k,[label,value]]of Object.entries(spec)){const l=el('label',label),a=el('textarea');a.id='author-'+k;a.rows=k==='statements'?4:2;a.value=value;a.maxLength=2000;l.htmlFor=a.id;details.append(l,a);inputs[k]=a;}
 const status=el('p');status.setAttribute('role','status');const button=el('button','Validate and preview scenario');button.type='button';
 button.onclick=async()=>{button.disabled=true;status.textContent='Preparing scenario preview…';try{const source=authorTheory(Object.fromEntries(Object.entries(inputs).map(([k,a])=>[k,a.value])));await onReview(source);status.textContent='Imported for review. Check its facts and goal before starting.';}catch(e){status.textContent=e.message;}finally{button.disabled=false;}};
 details.append(button,status,el('p','Before sharing: try a valid argument and a plausible invalid one. Author hints must remain separate from the problem facts.'));return details;
}
