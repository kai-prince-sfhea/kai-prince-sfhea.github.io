import {get,put} from './store.js';
import {reasoningToolkit} from './reasoning-support.js';
import {renderScenarioLearning} from './scenario-learning.js';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const button=(text,fn,primary=false)=>{const b=el('button',text,primary?'primary-button':'secondary-button');b.type='button';b.onclick=fn;return b;};
const REVIEWED_BRIEFINGS=new Set(['murder-basic','murder-temporal','murder-fuzzy','legal','sqrt-two']);

export function briefingFacts(scenario={}){
 const observations=scenario.nodes?Object.values(scenario.nodes).filter(node=>node.fact).map(node=>node.label):scenario.facts||[];
 const reviewedSummary=scenario.domain==='theory'&&REVIEWED_BRIEFINGS.has(scenario.id)&&!!scenario.nodes&&!scenario.custom&&!scenario.challenge&&!scenario.journey&&!scenario.tutorial&&Array.isArray(scenario.facts)&&scenario.facts.length>0&&scenario.facts.every(text=>typeof text==='string'&&text.trim());
 return {reviewedSummary,facts:reviewedSummary?[...scenario.facts]:[...observations],observations:[...observations]};
}

export function givenObservationsInspection(observations){
 const details=el('details',undefined,'given-observations-inspection');
 details.append(el('summary','Inspect all given observations'),el('p',`${observations.length} exact given observations from this scenario. Opening this list adds no verified step.`));
 const list=el('ul');for(const observation of observations)list.append(el('li',observation));details.append(list);return details;
}

export function createScenarioFlow({state,onChoose,onTutorial,onPreferences,onNext,onPrepare,onExport,onHistory}){
 const main=document.querySelector('main.workspace'),root=el('section',undefined,'scenario-flow');root.id='scenario-flow';root.hidden=true;root.setAttribute('aria-label','Scenario stages');main.before(root);main.hidden=true;
 const toolbar=el('nav',undefined,'flow-toolbar');toolbar.setAttribute('aria-label','Scenario views');
 const briefButton=button('Review briefing',()=>brief(0)),collapse=button('Hide scenario information',()=>{const hidden=!(document.body.classList.contains('scenario-collapsed')||document.body.classList.contains('current-view'));setCollapsed(hidden);put('scenario-collapsed',hidden).catch(()=>{});});
 const completed=button('Open debrief',()=>setPhase('debrief',true));completed.hidden=true;
 collapse.id='toggle-scenario-information';collapse.setAttribute('aria-expanded','true');collapse.setAttribute('aria-controls','scenario-information');document.querySelector('.scenario-column').id='scenario-information';toolbar.append(briefButton,collapse,completed);document.querySelector('.thinking-column').prepend(toolbar);
 const coach=el('section',undefined,'tutorial-coach');coach.hidden=true;coach.setAttribute('aria-label','Tutorial guidance');toolbar.after(coach);
 let phase='thinking',page=0,briefPages=[],briefObservations=null,card=null,epoch=0,saveQueue=Promise.resolve(),learningView='prose',learningRule=0;
 const status=el('p');status.setAttribute('role','status');
 function persist(){const id=state.session,value={phase,page};if(id)saveQueue=saveQueue.catch(()=>{}).then(()=>put('flow:'+id,value)).catch(e=>{status.textContent='Could not save this view: '+e.message;});}
 function title(text){const h=el('h1',text);h.tabIndex=-1;return h;}
 function focusHeading(){root.querySelector('h1')?.focus();}
 function updateLayout(){const hidden=document.body.classList.contains('scenario-collapsed')||document.body.classList.contains('current-view');collapse.textContent=hidden?'Show scenario information':'Hide scenario information';collapse.setAttribute('aria-expanded',String(!hidden));}
 function setCollapsed(value){if(!value&&document.body.classList.contains('current-view')){const view=document.querySelector('#workspace-view');view.value='full';view.dispatchEvent(new Event('change'));}document.body.classList.toggle('scenario-collapsed',!!value);updateLayout();}
 get('scenario-collapsed').then(value=>{if(value)setCollapsed(true);else updateLayout();}).catch(()=>{});
 function progress(){const list=el('ol',undefined,'flow-progress');list.setAttribute('aria-label','Scenario progress');for(const [key,label]of [['brief','1 · Briefing'],['thinking','2 · Thinking'],['debrief','3 · Reflection']]){const item=el('li',label);if(phase===key)item.setAttribute('aria-current','step');list.append(item);}return list;}
 function setPhase(next,focus=false){
  document.dispatchEvent(new CustomEvent('thread-exposition',{detail:{text:''}}));
  phase=next;document.body.dataset.flow=phase;main.hidden=phase!=='thinking';root.hidden=phase==='thinking';
  const skip=document.querySelector('.skip-link');skip.href=phase==='thinking'?'#thought':'#scenario-flow';skip.textContent=phase==='thinking'?'Skip to my next thought':'Skip to scenario content';root.tabIndex=-1;
  if(phase==='debrief'&&card){root.replaceChildren(el('p',state.scenario.journey?`Stage ${state.scenario.journey.stage} of 3`:'Review and reflect','eyebrow'),title(state.scenario.journey?.stage<3?'Stage debrief':'My reasoning debrief'),card);const actions=el('div',undefined,'flow-actions');actions.append(button('Return to my reasoning',()=>thinking()),button('Save my reasoning',onExport),button('Choose another scenario',onChoose));root.append(actions,status);}
  root.querySelector('.flow-progress')?.remove();toolbar.querySelector('.flow-progress')?.remove();(phase==='thinking'?toolbar:root).prepend(progress());updateLayout();
  persist();if(focus){if(phase==='thinking'){const heading=state.scenario.tutorial?coach.querySelector('h3'):document.querySelector('.workspace-heading h2');if(heading){heading.tabIndex=-1;heading.focus();}}else focusHeading();}
 }
 function thinking(){updateCoach();setPhase('thinking',true);}
 function ready(){
  root.replaceChildren(el('p','Choose my pace','eyebrow'),title('Ready to begin'),el('h2',state.scenario.title),el('p',state.scenario.description),el('p','Read a short briefing, work through the reasoning, then reflect. My place is saved. There is no time limit unless I choose a time cue.'));
  const actions=el('div',undefined,'flow-actions');actions.append(button('Start Scenario',()=>brief(0),true),button('Try the guided tutorial',onTutorial),button('Choose a different scenario',onChoose),button('Accessibility & preferences',onPreferences));root.append(actions,status);setPhase('ready',true);
 }
 function prepare(){const id=state.session,token=epoch;if(!state.scenario.journey?.available.length||document.querySelector('#anticipation-enabled')?.checked===false)return;onPrepare(id).then(result=>{if(token===epoch)status.textContent=result?.prepared>0?'Possible next-stage briefs are prepared locally. No future evidence has entered my reasoning.':'A next-stage brief will be prepared when I choose it. My current stage remains available.';}).catch(()=>{if(token===epoch)status.textContent='A next-stage brief will be prepared when I choose it. My current stage remains available.';});}
 function makeBrief(){
  const s=state.scenario,j=s.journey;
  briefPages=[{heading:j?.stage_title||'The setting',text:[s.description,s.challenge?.content_preview||'I can choose another setting whenever I need.','My goal: '+s.goal],facts:[]}];
  if(s.tutorial)briefPages.push({heading:'How I will practise',text:['I can adjust text with browser zoom, use keyboard controls or device dictation, and choose guidance in Preferences.','I write a thought, check whether Gemma kept my meaning, then confirm it for the two proof tools. A tool error is not a judgment about my reasoning.','This is solo practice. If I want to work with a peer, we can take turns explaining one connection and asking a question. Thread does not provide a peer group or send messages.'],facts:[]});
  const {facts,observations,reviewedSummary}=briefingFacts(s);briefObservations=reviewedSummary?observations:null;
  for(let i=0;i<facts.length;i+=4)briefPages.push({heading:`${reviewedSummary?'Case overview':'Given observations'}${facts.length>4?' · '+(Math.floor(i/4)+1):''}`,text:[reviewedSummary?'This overview explains the supplied setting, evidence and rules. I can inspect every exact given observation below.':'These observations are stipulated for this fictional exercise. Reports and interpretations still need evaluation.'],facts:facts.slice(i,i+4)});
  briefPages.push({heading:'My goal and connecting rules',text:[s.goal,'I may revisit this briefing while thinking. Reading or opening a hint never adds a verified claim.'],rules:s.rules||[],facts:[]});
 }
 function brief(index=0){
  page=Math.max(0,Math.min(index,briefPages.length-1));const b=briefPages[page];
  root.replaceChildren(el('p',`Briefing · ${page+1} of ${briefPages.length}${state.scenario.journey?' · stage '+state.scenario.journey.stage+' of 3':''}`,'eyebrow'),title(b.heading),el('p',state.scenario.title));
  for(const text of b.text.filter(Boolean))root.append(el('p',text));if(b.facts.length){const ul=el('ul');b.facts.forEach(t=>ul.append(el('li',t)));root.append(ul);}
  if(briefObservations)root.append(givenObservationsInspection(briefObservations));
  if(b.rules)root.append(renderScenarioLearning(state.scenario,{view:learningView,ruleIndex:learningRule,onView:value=>learningView=value,onRule:value=>learningRule=value}));
  if(page===0&&state.scenario.journey){const j=state.scenario.journey;root.append(el('p',`${j.remaining} evidence credits remain. Choices at a stage debrief determine which observations arrive next. Spending is not a score.`));if(j.acquired.length)root.append(el('p','Checks chosen so far: '+j.acquired.map(c=>c.label).join('; ')+'. Earlier certificates describe earlier evidence; they are not automatically claims in this stage.'));}
  if(state.scenario.tutorial&&page===1){const d=el('details');d.append(el('summary','A separate worked example'),el('p','In a different library, a valid pass AND an available book permit borrowing. A pass alone leaves one condition open. The complete argument checks both conditions before applying the rule. This example adds no fact to my archive visit.'));root.append(d);}
  const actions=el('div',undefined,'flow-actions');if(page>0)actions.append(button('Previous brief page',()=>brief(page-1)));if(page<briefPages.length-1)actions.append(button('Next brief page',()=>brief(page+1),true));actions.append(button('Continue to thinking',thinking,page===briefPages.length-1),button('Accessibility & preferences',onPreferences),button('Choose another scenario',onChoose));root.append(actions,status);setPhase('brief',true);document.dispatchEvent(new CustomEvent('thread-exposition',{detail:{text:[b.heading,...b.text,...b.facts].filter(Boolean).join('. ')}}));if(page===0)prepare();
 }
 function updateCoach(){
  coach.hidden=!state.scenario?.tutorial;if(coach.hidden)return;
  const ids=new Set(state.claims.flatMap(c=>(c.graph?.conclusions||c.conclusions||[]).filter(x=>x.positive).map(x=>x.id)));
  const next=ids.has('ready')?'enter':'ready';
  coach.replaceChildren(el('h3',next==='ready'?'Tutorial · my first connection':'Tutorial · connect the next step'),el('p',next==='ready'?'Which two facts make my visit ready? I can explain their connection using the supplied rule.':'How does a ready visit connect to entering? I still need to account for whether the archive is open.'));
  const steps=el('details');steps.append(el('summary','Show the gameplay steps'));const ol=el('ol');for(const t of ['Write or dictate a thought. Share it when ready.','Read Gemma’s proposed conclusion and reasons. If it changed my meaning, choose to revise.','Confirm only when the interpretation matches. Both proof tools must check the step.','Inspect the result and try a next connection. Hints stay optional.'])ol.append(el('li',t));steps.append(ol);coach.append(steps);
  const sample=el('details');sample.append(el('summary','Show an editable example thought'));
  const text=next==='ready'?'My archive visit is ready because my archive pass is valid and my archive visit is booked.':'I may enter the archive because my archive visit is ready and the archive is open.';
  sample.append(el('p',text),button('Use this as an editable draft',()=>{const input=document.querySelector('#thought');if(input.value.trim()){const notice=coach.querySelector('[role=status]')||el('p');notice.setAttribute('role','status');notice.textContent='My existing draft is kept. I can edit it or copy the example myself.';coach.append(notice);return;}input.value=text;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();}));coach.append(sample);
 }
 function stageChoices(container){
  const j=state.scenario.journey;if(!j||j.stage===j.total)return;
  const box=el('section',undefined,'stage-choice');box.append(el('h3','Choose my next evidence'),el('p',`${j.remaining} credits remain. A check can be useful even when it challenges my expectation. I can preserve the budget and acknowledge uncertainty.`));
  const label=el('label','Which check will I fund?'),select=el('select');select.id='next-evidence-choice';label.htmlFor=select.id;const blank=el('option','Choose a check');blank.value='';select.append(blank);
  j.available.forEach(c=>{const option=el('option',`${c.label} · ${c.cost} credits · ${c.remaining} left`);option.value=c.id;select.append(option);});
  const purpose=el('p');purpose.id='choice-purpose';select.setAttribute('aria-describedby',purpose.id);
  const noteLabel=el('label','Why this check? What result would change my view? · optional'),note=el('textarea');note.id='evidence-choice-reason';noteLabel.htmlFor=note.id;note.maxLength=2500;note.rows=3;note.dir='auto';
  const feedback=el('p');feedback.setAttribute('role','status');const next=button('Choose evidence and read the next stage',async()=>{next.disabled=true;select.disabled=true;try{await put('choice-note:'+state.session,{choice:select.value,rationale:note.value});await onNext(select.value,note.value);}catch(e){feedback.textContent=e.message;next.disabled=!select.value;select.disabled=false;}});next.disabled=true;
  const update=()=>{const c=j.available.find(c=>c.id===select.value);purpose.textContent=c?.purpose||'';next.disabled=!c;};select.onchange=()=>{update();put('choice-note:'+state.session,{choice:select.value,rationale:note.value}).catch(e=>feedback.textContent=e.message);};note.oninput=()=>put('choice-note:'+state.session,{choice:select.value,rationale:note.value}).catch(e=>feedback.textContent=e.message);
  const id=state.session;get('choice-note:'+id).then(saved=>{if(id!==state.session)return;if(saved){select.value=saved.choice;note.value=saved.rationale||'';update();}}).catch(()=>{});
  box.append(label,select,purpose,noteLabel,note,el('p','My rationale is a personal reflection, not a graded or formally verified claim.'),next,feedback);container.append(box);
 }
 return {
  get phase(){return phase;},
  async open({resume=false,initial=false}={}){epoch++;card=null;completed.hidden=true;status.textContent='';makeBrief();updateCoach();const id=state.session;const saved=resume?await get('flow:'+id):null;if(id!==state.session)return;if(saved?.phase==='brief')brief(saved.page||0);else if(saved?.phase==='ready')ready();else if(resume)thinking();else if(initial)ready();else brief(0);},
  update:updateCoach,
  complete(content){makeBrief();updateCoach();card=content;completed.hidden=false;stageChoices(card);card.append(reasoningToolkit());
   if(state.scenario.journey?.stage===3){const history=el('details');history.append(el('summary','Across my three stages'),el('p','Which evidence choice changed my view? Which uncertainty survived? My earlier reasoning was conditional on the evidence available then.'));card.prepend(history);onHistory().then(records=>{for(const r of records){const section=el('section');section.append(el('h3',`Stage ${r.session.scenario.journey.stage}`),el('p',`${r.session.progress.accepted} confirmed steps · ${r.session.progress.solved?'goal established':'goal not yet established'}`));if(r.session.stage_decision)section.append(el('p','Next evidence chosen: '+r.session.stage_decision.choice),el('p','My decision note: '+(r.session.stage_decision.rationale||'No note recorded.')));if(r.reflection?.why)section.append(el('p','My explanation: '+r.reflection.why));const a=el('a','Open this stage’s reasoning');a.href=`/Experiment/#session=${encodeURIComponent(r.session.session_id)}`;a.target='_blank';a.rel='noopener';section.append(a);history.append(section);}}).catch(e=>history.append(el('p','Could not load earlier local stages: '+e.message)));}
   setPhase('debrief',true);prepare();},
  thinking,brief,setCollapsed,updateLayout,
 };
}
