import('./runtime/audio-ui.js').catch(error=>console.warn('Optional audio unavailable:',error.message));
import {performanceSummary} from './runtime/telemetry.js';
import {warmup} from '/Experiment/runtime/model.js';
import {localApi} from './runtime/local-api.js';
import {get,put} from './runtime/store.js';
import {learningCheckpoint,authorForm} from './runtime/learning.js';
import {challengeForm,challengeBrief} from './runtime/challenge.js';
import {createScenarioFlow,thinkingEvidenceRows,briefingFacts,givenObservationsInspection} from './runtime/scenario-flow.js';
import {reasoningToolkit} from './runtime/reasoning-support.js';
import {canonicalExpressionKey} from './runtime/argument-interchange.js';
import {graphTools} from './runtime/graph-tools.js';
import {renderReferences} from './runtime/scenario-references.js';
import './runtime/pwa.js';
import {cancel as cancelInterpretation} from './runtime/model.js';
/* All inference, verification and saved work live on this device. */
'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const state = {
  session: null, scenario: null, claims: [], transcript: [], candidate: null,
  busy: false, solved: false, guidance: 'gentle', runtime: null,
  timer: { remaining: 0, enabled: false, announced: false, lastTick: Date.now() },
  paused: false, started: new Date().toISOString(), library: [], editorScenario: null, followConversation: true
};

window.addEventListener('model-progress',event=>{if(state.busy)state.busyDescription=event.detail;});

function node(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined && content !== null) element.textContent = String(content);
  if (tag === 'pre') { element.tabIndex = 0; element.setAttribute('role','region'); element.setAttribute('aria-label','Scrollable code or data'); }
  return element;
}

function readable(value) {
  if (value === null || value === undefined) return '';
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

function downloadText(name, text) {
  const url = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'}));
  const link = node('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const CUSTOM_TEMPLATE = `theory My_Case
  imports Main
begin
(* thread:title The sealed archive *)
(* thread:description I am checking whether I may enter an archive. I must connect my credentials to its access rule. *)
(* thread:goal may_enter *)
(* thread:label has_pass = I have an archive pass *)
(* thread:label pass_valid = My archive pass is valid *)
(* thread:label may_enter = I may enter the archive *)
locale Archive_Case =
  fixes has_pass pass_valid may_enter :: "bool"
  assumes pass: "has_pass"
  and valid: "pass_valid"
  and access: "has_pass & pass_valid ==> may_enter"
begin
end
end
`;

async function resetWorkspace(scenario, continuation=null) {
  if (state.busy) return;
  const previous = state.session;
  setBusy(true, 'Opening a fresh reasoning trail…');
  try {
    const opened=await startSession(scenario,continuation,true);
    state.transcript = [];
    $('#conversation').replaceChildren();
    $('#review-ready').hidden = true;
    $('#thought').value = ''; $('#reflection').value = '';
    $('#onboarding').hidden = !!state.scenario.tutorial || !$('#show-introduction').checked;
    if(continuation&&(opened.history?.length||opened.pending||opened.progress?.solved)){
      renderSavedAttempt(opened);
      const savedDraft=await get('workspace:'+state.session);if(savedDraft){$('#thought').value=savedDraft.draft||'';$('#reflection').value=savedDraft.reflection||'';}
      if(!opened.progress.solved)await flow.open({resume:true});
    }else message('companion', state.scenario?.hints?.[0] || 'What can I work out from the given facts?');
    startTimer();
    if (previous) {
      $('#previous-attempt').href = `/Experiment/?resume=${Date.now()}#session=${encodeURIComponent(previous)}`;
      $('#previous-attempt').hidden = false;
    }
    if(flow.phase==='thinking')$('#thought').focus();
  } catch (error) { toast(error.message); throw error; }
  finally { setBusy(false); }
}

async function openLibrary() {
  if (state.busy) return;
  const list = $('#scenario-library');
  $('#library-error').hidden = true;
  $('#library-dialog').showModal();
  list.replaceChildren(node('p', '', 'Reading the scenario library…'));
  try {
    const result = await api('/api/scenarios'); state.library = result.scenarios;
    list.replaceChildren();
    const filters=node('section','library-filters'),searchLabel=node('label','','Find a scenario'),search=node('input');search.id='library-search';search.type='search';search.maxLength=120;searchLabel.htmlFor=search.id;
    const familyLabel=node('label','','Scenario family'),family=node('select');family.id='library-family';familyLabel.htmlFor=family.id;const all=node('option','','All families');all.value='';family.append(all);for(const value of [...new Set(state.library.map(s=>s.family||'Original scenarios'))]){const option=node('option','',value);option.value=value;family.append(option);}
    const count=node('p','candidate-note');count.setAttribute('role','status');filters.append(searchLabel,search,familyLabel,family,count);list.append(filters);const cards=[];
    const filter=()=>{let shown=0;for(const {scenario,card}of cards){const selected=!family.value||(scenario.family||'Original scenarios')===family.value,found=(scenario.title+' '+scenario.description).toLocaleLowerCase().includes(search.value.toLocaleLowerCase().trim());card.hidden=!(selected&&found);if(!card.hidden)shown++;}count.textContent=shown+' of '+cards.length+' scenarios shown.';};search.oninput=family.onchange=filter;
    state.library.forEach(scenario => {
      const card = node('section', 'library-card');
      card.append(node('span', 'eyebrow', scenario.difficulty), node('h3', '', scenario.title), node('p', '', scenario.description));
      if(scenario.family)card.append(node('p','candidate-note',scenario.family));
      if(scenario.verification_scope){const scope=node('details');scope.append(node('summary','','Verification scope'),node('p','candidate-note',scenario.verification_scope));card.append(scope);}
      if(scenario.content_sensitive)card.append(node('p','candidate-note','Content choice required · '+scenario.content_note));
      if(scenario.references?.length)card.append(renderReferences(scenario));
      const actions = node('div', 'library-actions');
      const start = node('button', 'secondary-button', 'Start scenario ↗');
      start.addEventListener('click', async () => { if (state.busy) return; start.disabled = true; try { await resetWorkspace(scenario); $('#library-dialog').close(); } catch {} finally { start.disabled = false; } });
      const example = node('button', 'text-button', 'Import this THY example');
      example.addEventListener('click', async () => {
        if (state.busy) return;
        example.disabled = true;
        try {
          const imported = await api('/api/import-theory', {source:scenario.source_text});
          $('#library-dialog').close(); openCustomise(imported.scenario);
        } catch (error) { $('#library-error').textContent = error.message; $('#library-error').hidden = false; }
        finally { example.disabled = false; }
      });
      start.setAttribute('aria-label','Start scenario: '+scenario.title);example.setAttribute('aria-label','Import this THY example: '+scenario.title);
      actions.append(start, example); card.append(actions);
      const source = node('details', 'source-code'); source.append(node('summary', '', scenario.source_name), node('pre', '', scenario.source_text));
      const download = node('button', 'text-button', 'Download this THY'); download.addEventListener('click', () => downloadText(scenario.source_name,scenario.source_text)); download.setAttribute('aria-label','Download this THY: '+scenario.title);source.append(download);
      card.append(source); list.append(card);cards.push({scenario,card});
    });
    filter();
  } catch(error) { list.replaceChildren(node('p','form-error',error.message)); }
}

function graphInspector(graph) {
  const panel = node('details', 'graph-inspector');
  panel.append(node('summary', '', 'Intermediary graph representation'));
  panel.append(node('p', 'candidate-note', 'This is the representation submitted to this check. The check result determines whether it holds. Arrows connect premises to conclusions; the JSON preserves the complete structure.'));
  const visual = node('details', 'node-visualisation');
  visual.append(node('summary', '', 'View as connected nodes'));
  visual.addEventListener('toggle', () => { if (visual.open && !visual.dataset.drawn) { visual.dataset.drawn = 'true'; visual.append(drawGraph(graph)); } });
  panel.append(visual);
  const tree = node('div', 'logic-graph');
  const candidate = graph.candidate;
  const labelFor = id => (graph.nodes || []).find(n => n.id === id)?.label || id;
  function expression(expr) {
    const li = node('li');
    const label = expr.op === 'atom' ? expr.name : expr.op === 'const' ? String(expr.value) : expr.op === 'answer' ? `${expr.guard} guard answers yes` : expr.op;
    li.append(node('span', 'graph-node', label));
    const children = [expr.arg,expr.proposition,expr.left,expr.right].filter(Boolean);
    if (children.length) { const ul=node('ul'); children.forEach(c=>ul.append(expression(c))); li.append(ul); }
    return li;
  }
  if (candidate) {
    tree.append(node('p', '', `Candidate ${candidate.id}: ${candidate.text}`));
    if (candidate.depends_on?.length) tree.append(node('p', '', `Earlier steps ${candidate.depends_on.join(', ')} → ${candidate.id}`));
    if (graph.effective_theorem) { const ul=node('ul'); ul.append(expression(graph.effective_theorem)); tree.append(ul); }
    if (candidate.conclusions) {
      const ul=node('ul');
      candidate.conclusions.forEach(p=>ul.append(node('li','graph-node',(p.positive?'':'NOT: ')+labelFor(p.id)))); tree.append(ul);
    }
  }
  if (graph.trace?.length) {
    tree.append(node('h5','','Prolog derivation tree'));
    let count=0;
    function branch(t) {
      const li=node('li');
      if (++count>350) { li.textContent='Further branches are available in the complete JSON below.'; return li; }
      const key=t.atom?.match(/(?:pos|neg)\((a\d+)\)/)?.[1];
      const text=key ? labelFor(graph.prolog_atom_map?.[key] || key) : t.atom;
      li.append(node('span','graph-node',`${t.kind==='fact'?'Given':'Derived'}: ${t.atom?.startsWith('neg(')?'NOT: ':''}${text}`));
      if (t.premises?.length) { const ul=node('ul'); t.premises.forEach(p=>ul.append(branch(p))); li.append(ul); }
      return li;
    }
    const ul=node('ul'); graph.trace.forEach(t=>ul.append(branch(t))); tree.append(ul);
  }
  if (graph.rules?.length) {
    const rules=node('details'); rules.append(node('summary','',`Scenario dependency graph · ${graph.nodes.length} propositions, ${graph.rules.length} rules`));
    const ul=node('ul'); graph.rules.forEach(r=>ul.append(node('li','',`${r.premises.map(labelFor).join(' + ') || 'Definition'} → ${labelFor(r.conclusion)}`))); rules.append(ul); tree.append(rules);
  }
  if (graph.requires) tree.append(node('p','',graph.requires.join(' + ')+' → complete solution'));
  if (graph.missing) tree.append(node('p','',`Goal nodes: ${graph.targets.join(', ')}. Still to establish: ${graph.missing.join(', ') || 'none'}.`));
  panel.append(tree);
  const raw=node('details','source-code'); raw.append(node('summary','','Complete graph JSON'),node('pre','',JSON.stringify(graph,null,2))); panel.append(raw);
  return panel;
}

function drawGraph(graph) {
  const wrap = node('div', 'node-view');
  const description = node('p', 'candidate-note', 'Read-only view. Select a node to read its full text. Arrows point from a supporting node to the expression or claim it supports. Scroll to explore larger graphs.');
  const canvas = node('div', 'node-canvas');
  canvas.tabIndex=0;canvas.setAttribute('role','region');canvas.setAttribute('aria-label','Argument graph · scroll to explore; individual nodes are keyboard accessible');
  const selection = node('p', 'node-selection', 'Select a node to inspect it.'); selection.setAttribute('aria-live', 'polite');
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('role', 'group'); svg.setAttribute('aria-label', 'Argumentation graph');
  const nodes = [], edges = [], ids = new Map();
  function add(id, label, level = 0) {
    if (!ids.has(id)) { const item={id, label: String(label), level}; ids.set(id,item); nodes.push(item); }
    return id;
  }
  function ast(e, path, level) {
    const label=e.op==='atom'?e.name:e.op==='const'?String(e.value):e.op==='answer'?`${e.guard} guard answers yes`:e.op;
    path=canonicalExpressionKey(e);add(path,label,level);
    [e.arg,e.proposition,e.left,e.right].filter(Boolean).forEach((c,i)=>{ const child=ast(c,`${path}.${i}`,level+1); edges.push([child,path]); });
    return path;
  }
  const labelFor = id => (graph.nodes || []).find(n => n.id === id)?.label || id;
  if (graph.candidate) {
    const c=graph.candidate; add(c.id,`Step ${c.id}: ${c.text}`);
    (c.depends_on||[]).forEach(id=>{add(id,`Earlier step ${id}`,1);edges.push([id,c.id]);});
    if (graph.effective_theorem) edges.push([ast(graph.effective_theorem,'expression',1),c.id]);
    (c.conclusions||[]).forEach((p,i)=>{const id=add(`proposition-${p.id}-${p.positive}`,`${p.positive?'':'NOT: '}${labelFor(p.id)}`,1);edges.push([id,c.id]);});
  }
  let traceCount=0;
  function trace(t, parent, level) {
    if (++traceCount>180) return;
    const atom=t.atom||'', key=atom.match(/(?:pos|neg)\((a\d+)\)/)?.[1];
    const id=add(key?`proposition-${graph.prolog_atom_map?.[key]||key}-${!atom.startsWith('neg(')}`:`trace-${traceCount}`,`${t.kind==='fact'?'Given':'Derived'}: ${atom.startsWith('neg(')?'NOT: ':''}${labelFor(graph.prolog_atom_map?.[key]||key||atom)}`,level);
    if(parent) edges.push([id,parent]);
    (t.premises||[]).forEach(p=>trace(p,id,level+1));
  }
  (graph.trace||[]).forEach(t=>trace(t,graph.candidate?.id,1));
  if (!nodes.length) {
    add('goal','Scenario goal');
    (graph.requires||graph.targets||[]).forEach((text,i)=>{add(`require-${i}`,labelFor(text),1);edges.push([`require-${i}`,'goal']);});
  }
  const levels=new Map(); nodes.forEach(n=>{const row=levels.get(n.level)||[];row.push(n);levels.set(n.level,row);});
  const width=Math.max(640,...[...levels.values()].map(row=>row.length*210+30)), height=Math.max(200,levels.size*115+30);
  svg.setAttribute('width',width); svg.setAttribute('height',height); svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  const markerId=`arrow-${drawGraph.count=(drawGraph.count||0)+1}`;
  const defs=document.createElementNS(ns,'defs'), marker=document.createElementNS(ns,'marker'), arrow=document.createElementNS(ns,'path');
  for(const [k,v] of Object.entries({id:markerId,viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto-start-reverse'}))marker.setAttribute(k,v);
  arrow.setAttribute('d','M 0 0 L 10 5 L 0 10 z');arrow.setAttribute('fill','#667c69');marker.append(arrow);defs.append(marker);svg.append(defs);
  levels.forEach((row,level)=>row.forEach((n,i)=>{n.x=(width-row.length*210)/2+i*210+10;n.y=height-105-level*115;}));
  edges.forEach(([from,to])=>{const a=ids.get(from),b=ids.get(to);if(!a||!b)return;const line=document.createElementNS(ns,'path');line.setAttribute('d',`M ${a.x+95} ${a.y+70} L ${b.x+95} ${b.y}`);line.setAttribute('stroke','#667c69');line.setAttribute('fill','none');line.setAttribute('marker-end',`url(#${markerId})`);svg.append(line);});
  nodes.forEach((n,index)=>{
    const relation=edges.filter(([,to])=>to===n.id).map(([from])=>ids.get(from)?.label).filter(Boolean);
    const description=n.label+(relation.length?'. Supported by: '+relation.join('; '):'. No incoming support edge in this view.');
    const group=document.createElementNS(ns,'g');group.setAttribute('tabindex',index===0?'0':'-1');group.setAttribute('role','button');group.setAttribute('aria-label',description);group.setAttribute('aria-pressed','false');group.setAttribute('class','visual-graph-node');
    const rect=document.createElementNS(ns,'rect');for(const [k,v] of Object.entries({x:n.x,y:n.y,width:190,height:70,rx:10}))rect.setAttribute(k,v);group.append(rect);
    const title=document.createElementNS(ns,'title');title.textContent=n.label;group.append(title);
    const text=document.createElementNS(ns,'text');text.setAttribute('x',n.x+12);text.setAttribute('y',n.y+27);
    const words=n.label.match(/.{1,25}(?:\s|$)|.{1,25}/g)||['']; words.slice(0,2).forEach((s,i)=>{const span=document.createElementNS(ns,'tspan');span.setAttribute('x',n.x+12);span.setAttribute('dy',i?'19':'0');span.textContent=s.trim()+(i===1&&words.length>2?'…':'');text.append(span);});group.append(text);
    const select=()=>{selection.textContent=description;svg.querySelectorAll('[role=button]').forEach(g=>{g.tabIndex=g===group?0:-1;g.setAttribute('aria-pressed',String(g===group));});};group.addEventListener('click',select);group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}else if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const all=[...svg.querySelectorAll('[role=button]')];const next=e.key==='Home'?0:e.key==='End'?all.length-1:(index+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+all.length)%all.length;all.forEach((g,i)=>g.tabIndex=i===next?0:-1);all[next].focus();}});svg.append(group);
  });
  const fit = node('button','text-button','Fit graph to width');
  let fitted = false;
  fit.addEventListener('click',()=>{fitted=!fitted;svg.style.width=fitted?'100%':'';svg.style.height=fitted?'auto':'';fit.textContent=fitted?'Show full-size nodes':'Fit graph to width';});
  canvas.append(svg);wrap.append(description,fit,canvas,selection);
  description.textContent+=' Use arrow keys to move between nodes, Home/End for first/last, and Enter to inspect. Tab leaves the graph.';
  if(traceCount>180)wrap.append(node('p','candidate-note','The node view shows the first 180 derivation nodes. The complete graph remains available as text and JSON.'));
  return wrap;
}

async function api(path, data) { return localApi(path, data); }

function toast(text) {
  const element = $('#toast');
  element.textContent = text;
  element.hidden = false;
  clearTimeout(toast.timeout);
  const dismiss = node('button','text-button','Dismiss');
  dismiss.onclick=()=>{element.hidden=true;};element.append(dismiss);
}

function setBusy(busy, description = '') {
  if(busy)document.dispatchEvent(new Event('thread-busy'));
  if(!busy)$('#cancel-processing').hidden=true;
  state.busy = busy;
  state.busySince = busy ? Date.now() : null;
  state.busyDescription = description;
  $('#busy-status').hidden = !busy;
  $('#busy-status').textContent = description;
  $('#busy-elapsed').textContent = '';
  $('#submit-button').disabled = busy || !!state.candidate || !state.session;
  $('#hint-button').disabled = busy || !state.session;
  $('#thought').readOnly = false;
  $('#customise-button').disabled = busy;
  $('#restart-button').disabled = busy || !state.session;
  $('#choose-scenario').disabled = busy;
  $('#submit-button').firstChild.textContent = state.candidate ? 'Review your thought first ' : 'Share a thought ';
  document.querySelectorAll('[data-candidate-action]').forEach(button => { button.disabled = busy; });
  $('#conversation').setAttribute('aria-busy', String(busy));
}

function scrollConversation() {
  if (!state.followConversation || document.activeElement === $('#thought')) return;
  const conversation = $('#conversation');
  conversation.scrollTo({top: conversation.scrollHeight, behavior: document.body.classList.contains('reduced-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}

function message(role, text, label) {
  const article = node('article', `message ${role}`);
  if (role !== 'user') article.append(node('div', 'avatar', 't'));
  const content = node('div', 'message-content');
  content.append(node('span', 'message-label', label || (role === 'user' ? 'YOU' : 'THREAD')));
  if (text) content.append(node('p', '', text));
  article.append(content);
  $('#conversation').append(article);
  state.transcript.push({role, text: text || '', time: new Date().toISOString()});
  scrollConversation();
  return content;
}

function showNotice(text) {
  const notice = $('#connection-notice');
  notice.replaceChildren(node('span', '', text));
  const button = node('button', 'text-button', 'Open setup details ↗');
  button.addEventListener('click', () => $('#runtime-dialog').showModal());
  notice.append(button);
  notice.hidden = false;
}

function interpretationDiagnostic(content, diagnostic) {
  if (!diagnostic || typeof diagnostic !== 'object') return;
  const values = {};
  for (const key of ['code', 'field', 'reason']) {
    if (typeof diagnostic[key] === 'string') values[key] = diagnostic[key].slice(0, 1000);
  }
  if (!Object.keys(values).length) return;
  const details = node('details', 'source-code');
  details.append(node('summary', '', 'Technical details for a bug report'),
    node('p', '', 'These describe an interpretation-tool error. They are not a judgment about my argument.'),
    node('pre', '', JSON.stringify(values, null, 2)));
  content.append(details);
}

function renderScenario(scenario) {
  state.scenario = scenario;
  document.body.dataset.challengeTheme=scenario.challenge?.theme||'';
  $('#scenario-title').textContent = scenario.title || 'The two guards';
  $('#scenario-description').textContent = scenario.description || '';
  $('#scenario-goal').textContent = scenario.goal || '';
  const visibleFacts=thinkingEvidenceRows(scenario);
  const context=$('#context-content');context.replaceChildren(node('p','',scenario.goal));const contextFacts=node('ul');visibleFacts.forEach(f=>contextFacts.append(node('li','',readable(f))));context.append(contextFacts);
  const list = $('#facts-list');
  list.replaceChildren();
  visibleFacts.forEach(fact => list.append(node('li', /^(?:Fact F\d+|Rule \d+) · /.test(fact)?'labelled-evidence':'', readable(fact))));
  $('#thinking-givens')?.remove();
  if(scenario.nodes){const data=briefingFacts(scenario);if(data.reviewedSummary||scenario.challenge||scenario.journey||data.observations.length>12){const inspection=givenObservationsInspection(data.observations);inspection.id='thinking-givens';list.after(inspection);context.append(givenObservationsInspection(data.observations));}}
  $('#challenge-brief')?.remove();
  const brief=challengeBrief({scenario,onConfigure:openChallengeConfig,onNotes:openPause});if(brief)$('#conversation').before(brief);
  $('.scenario-art').hidden = scenario.domain === 'theory';
  $('.scenario-copy .eyebrow').textContent = scenario.difficulty || 'YOUR SCENARIO';
  const source = $('#scenario-source'); source.replaceChildren();
  source.append(node('summary', '', 'Case file & theory'));
  source.append(node('p', 'candidate-note', scenario.import_kind || 'Reviewed scenario model'));
  if (scenario.nodes) {
    const list = node('ul', 'case-facts');
    Object.values(scenario.nodes).filter(n => n.fact).forEach(n => {
      const li = node('li', '', n.label); li.append(node('code', '', n.hol)); list.append(li);
    });
    source.append(list);
  }
  if (scenario.source_text) {
    const details = node('details', 'source-code'); details.append(node('summary', '', scenario.source_name), node('pre', '', scenario.source_text)); source.append(details);
    const download = node('button', 'text-button', 'Download THY ↗');
    download.addEventListener('click', () => downloadText(scenario.source_name, scenario.source_text)); source.append(download);
  }
}

function renderClaims() {
  $('#challenge-brief')?.update(state.claims);
  flow.update();
  const list = $('#claims-list');
  list.replaceChildren();
  $('#claim-count').textContent = state.claims.length;
  $('#claims-empty').hidden = state.claims.length > 0;
  state.claims.forEach((claim, index) => {
    const item = node('li');
    item.append(node('strong', '', `Step ${String(index + 1).padStart(2, '0')}`));
    item.append(node('span', '', claim.summary || claim.text || readable(claim.conclusion)));
    if (claim.dependencies?.length || claim.assumptions?.length || claim.cited_rules?.length) {
      const detail = node('details');
      detail.append(node('summary', '', 'What this builds on'));
      if (claim.assumptions?.length) detail.append(node('p', '', `Assumptions: ${claim.assumptions.map(readable).join('; ')}`));
      if (claim.dependencies?.length) detail.append(node('p', '', `Connections: ${claim.dependencies.map(dependencyLabel).join('; ')}`));
      if (claim.cited_rules?.length) detail.append(node('p', '', `Cited connecting rules: ${claim.cited_rules.join('; ')}`));
      item.append(detail);
    }
    list.append(item);
  });
}

function dependencyLabel(value) {
  if (typeof value !== 'string') return readable(value);
  const claimIndex = state.claims.findIndex(claim => claim.id === value);
  if (claimIndex >= 0) return `Step ${claimIndex + 1}: ${state.claims[claimIndex].summary || state.claims[claimIndex].text}`;
  return value.replaceAll('_', ' ');
}

async function startSession(scenario,continuation=null,keepBusy=false,initial=false) {
  state.caseRevision = false;
  const result = continuation?await api('/api/next-stage',continuation):await api('/api/session', { ...(scenario ? {scenario} : {}), guidance: state.guidance });
  if (!result.session_id) throw new Error('A local attempt could not be created. Please check Device setup.');
  state.session = result.session_id;
  state.claims = result.claims || [];
  state.candidate = null;
  state.solved = false;
  state.started = new Date().toISOString();
  history.replaceState(null, '', `#session=${encodeURIComponent(state.session)}`);
  if (result.scenario) renderScenario(result.scenario);
  renderClaims();
  if(!keepBusy)setBusy(false);
  await flow.open({initial:initial||(!scenario&&!continuation)});
  return result;
}

function renderRuntime() {
  const runtime = state.runtime || {};
  const list = $('#engine-list');
  list.replaceChildren();
  const engines = [['model', 'Gemma 4 E2B · browser', 'Interprets your reasoning'], ['prolog', 'SWI-Prolog', 'Checks cases and relations'], ['coq', 'Coq 8.20.1 kernel', 'Checks the formal proof']];
  engines.forEach(([key, name, purpose]) => {
    const engine = runtime[key] || {};
    const row = node('div', 'engine-row');
    const heading = node('div', 'engine-row-header');
    heading.append(node('span', '', name));
    heading.append(node('span', `engine-state ${engine.ready ? 'ready' : ''}`, engine.ready ? '● Ready' : engine.installed ? (engine.health==='unavailable'?'○ Unavailable':'○ Check pending') : state.runtime ? '○ Setup needed' : '○ Checking'));
    row.append(heading, node('p', '', `${purpose}. ${engine.detail || engine.message || 'Checking the local connection…'}`));
    list.append(row);
  });
  if (!state.runtime) return;
  const ready = engines.filter(([key]) => runtime[key]?.ready).length;
  $('#runtime-label').textContent = ready === 3 ? 'On-device tools ready' : state.runtime?.coq?.installed ? 'Proof self-check pending' : 'Device setup needed';
  $('#runtime-dot').classList.toggle('ready', ready === 3);
  if (ready === 3) $('#connection-notice').hidden = true;
  else showNotice(runtime.coq?.installed?'My proof tools will be checked before verification. If unavailable, my draft stays saved; I can retry the tools in Device setup.':'Your workspace is open. Open Device setup to install the offline model and proof tools.');
}

async function refreshRuntime() {
  $('#refresh-runtime').disabled = true;
  $('#refresh-runtime').textContent = 'Checking local tools…';
  try { state.runtime = await api('/api/status'); renderRuntime(); }
  catch (error) {
    $('#runtime-label').textContent = 'Device tools unavailable';
    $('#runtime-dot').classList.remove('ready');
    showNotice('Device storage or tools are unavailable. Your draft stays here.');
    $('#engine-list').replaceChildren(node('p', 'form-error', error.message));
  } finally {
    $('#refresh-runtime').disabled = false;
    $('#refresh-runtime').textContent = 'Check connections again';
  }
}

function addInterpretation(result, original) {
  original = result.original || original;
  if (result.case_review) message('companion', `Let’s focus on one step at a time. I’m reviewing case ${result.case_review.index} of ${result.case_review.total}.`);
  const interpretation = result.interpretation || {};
  state.candidate = {id: result.candidate_id, original, interpretation, caseReview: result.case_review};
  const content = message('companion', $('#direct-wording')?.checked?'Gemma proposes this interpretation. Does it preserve the intended meaning?':'Is this the thought I meant to express?');
  const card = node('section', 'interpretation-card');
  card.append(node('div', 'eyebrow', 'YOUR THOUGHT, AS UNDERSTOOD BY GEMMA'));
  card.append(node('h3', '', 'Review the interpretation'));
  if (interpretation.text) card.append(node('p', '', interpretation.text));
  card.append(node('p', 'candidate-note', 'I can check that every listed assumption, conclusion and choice preserves what I meant.'));
  const details = node('dl', 'interpretation-details');
  function term(title, values) {
    if (!values || (Array.isArray(values) && !values.length)) return;
    const group = node('div');
    group.append(node('dt', '', title));
    const value = node('dd');
    if (Array.isArray(values)) {
      const list = node('ul');
      values.forEach(item => list.append(node('li', '', readable(item))));
      value.append(list);
    } else value.textContent = readable(values);
    group.append(value);
    details.append(group);
  }
  term('Assumptions', interpretation.assumptions?.length ? interpretation.assumptions : ['No additional assumptions; this claim covers every scenario case.']);
  const actionOnly=interpretation.strategy&&interpretation.graph?.conclusion?.op==='const'&&interpretation.graph.conclusion.value===true;
  term(actionOnly?'This step':'Conclusion',actionOnly?'My explicit door-choice rule is shown below.':interpretation.conclusion);
  term('Builds on', interpretation.dependencies?.map(dependencyLabel));
  if (interpretation.cited_rules?.length) term('Cited connecting rules', interpretation.cited_rules);
  if (interpretation.strategy) {
    const rule = interpretation.strategy;
    const door = value => value === 'tested' ? 'I go through the tested door.' : value === 'other' ? 'I go through the other door.' : 'I have not specified a choice yet.';
    term('My door-choice rule', [`After yes: ${door(rule.on_yes)}`, `After no: ${door(rule.on_no)}`]);
  }
  card.append(details);
  const actions = node('div', 'candidate-actions');
  const confirm = node('button', 'primary-button', 'Yes, check this step ↗');
  confirm.dataset.candidateAction = 'confirm';
  confirm.addEventListener('click', () => verifyCandidate(card, actions, result.candidate_id));
  const edit = node('button', 'text-button', 'I meant something else');
  edit.dataset.candidateAction = 'edit';
  edit.addEventListener('click', () => {
    $('#review-ready').hidden=true;
    const draft = state.candidate?.original || original;
    state.caseRevision = !!state.candidate?.caseReview;
    state.candidate = null;
    actions.replaceChildren(node('span', 'candidate-note', 'Interpretation set aside. You can explain it differently below.'));
    $('#thought').value = draft;
    setBusy(false);
    $('#thought').focus();
  });
  actions.append(confirm, edit);
  const pendingNote=node('p','candidate-note','An interpretation is a proposal. It has not been verified yet.');pendingNote.dataset.pendingInterpretation='true';card.append(actions,pendingNote);
  content.append(card);
  state.transcript.push({role: 'interpretation', candidate_id: result.candidate_id, interpretation});
  setBusy(false);
  scrollConversation();
  $('#review-ready').hidden = false;
  $('#review-ready').onclick=()=>{card.scrollIntoView({block:'nearest'});confirm.focus({preventScroll:true});};
  $('#busy-status').hidden=false;$('#busy-status').textContent='Interpretation ready for review. My draft is unchanged.';
}

async function submitThought(event) {
  event?.preventDefault();
  if (state.busy || state.candidate || !state.session) return;
  const text = $('#thought').value.trim();
  if (!text) { $('#thought').focus(); return; }
  message('user', text);
  $('#thought').value = '';
  setBusy(true, 'Gemma is interpreting this thought. You will review it before anything is checked.');
  $('#cancel-processing').hidden=false;
  try {
    const result = await api('/api/interpret', { session_id: state.session, text, guidance: state.guidance, grouping: $('#thought-grouping').value, case_revision: !!state.caseRevision });
    state.caseRevision = false;
    if (result.candidate_id && result.interpretation) addInterpretation(result, text);
    else {
      const content = message('companion', result.clarification || 'Could you explain one connection between a fact and a conclusion?');
      interpretationDiagnostic(content, result.diagnostic);
      state.caseRevision = !!result.case_review;
      if (!$('#thought').value) $('#thought').value = result.original || text;
      setBusy(false);
    }
  } catch (error) {
    message('companion', `The interpretation tool could not finish. My thought is unchanged. ${error.message}`, 'TOOL STATUS');
    if (!$('#thought').value) $('#thought').value = text;
    setBusy(false);
  }
}

async function verifyCandidate(candidateCard, actions, expectedId) {
  const candidate = state.candidate;
  if (!candidate || state.busy) return;
  if (candidate.id !== expectedId) { toast('That interpretation has been replaced. Review your most recent thought.'); return; }
  $('#review-ready').hidden=true;
  setBusy(true, 'Checking this step, then checking every part of my scenario goal.');
  try {
    const result = await api('/api/verify', {session_id: state.session, candidate_id: candidate.id});
    document.dispatchEvent(new CustomEvent('thread-verification',{detail:{status:result.status}}));
    state.transcript.push({role: 'verification', ...result, time: new Date().toISOString()});
    const accepted = result.status === 'accepted' || result.status === 'verified';
    const unavailable = ['unavailable', 'error', 'engine_unavailable', 'blocked', 'pending'].includes(result.status);
    const content = message('companion');
    const card = node('section', `result-card ${accepted ? 'accepted' : unavailable ? 'pending' : 'rejected'}`);
    card.append(node('div', 'result-label', accepted ? 'My thought holds' : unavailable ? 'Verification is waiting' : 'Something to reconsider'));
    document.dispatchEvent(new CustomEvent('thread-step-checked'));
    card.append(node('p', '', readable(result.feedback) || (accepted ? 'This follows from my assumptions. What can I explore next?' : 'What am I missing in this reasoning?')));

    if (result.counterexample) {
      const detail = node('details');
      detail.append(node('summary', '', 'Explore a case where this does not follow'));
      detail.append(node('p', '', result.counterexample.detail || readable(result.counterexample)));
      card.append(detail);
    }
    if (accepted && result.claim) {
      if (!state.claims.some(claim => claim.id === result.claim.id)) state.claims.push(result.claim);
      $('#onboarding').hidden = !!state.scenario.tutorial || !$('#show-introduction').checked;
      renderClaims();
    }
    if (unavailable) {
      const retry = node('button', 'text-button', 'Try the verification again ↗');
      retry.dataset.candidateAction = 'retry';
      retry.addEventListener('click', async () => {
        if (state.busy || !state.candidate) return;
        retry.disabled = true;
        await verifyCandidate(candidateCard, actions, candidate.id);
        retry.remove();
      });
      card.append(retry);
      actions.querySelector('[data-candidate-action="confirm"]')?.remove();
      showNotice('One or more verification tools need attention. This thought has not been added to your trail.');
    } else {
      state.candidate = null;
      actions.replaceChildren(node('span', 'candidate-note', accepted ? 'You confirmed this interpretation.' : 'You confirmed this interpretation. The reasoning can still be revised.'));
      candidateCard.querySelector('[data-pending-interpretation]')?.remove();
      if (!accepted) {
        state.caseRevision = !!candidate.caseReview;
        const revise = node('button', 'text-button', 'Revise this thought ↗');
        revise.addEventListener('click', () => { if (!state.busy && !state.candidate) { $('#thought').value = candidate.original; $('#thought').focus(); } });
        card.append(revise);
      }
    }
    addSolutionCheck(card, result);
    addVerificationDetails(card, result);
    content.append(card);
    if (result.progress?.solved) showCompleted(result.solution || result.solution_check);
    await refreshRuntime();
    setBusy(false);
    scrollConversation();
    if (accepted && result.next_case_available && !state.solved) await reviewNextCase();
  } catch (error) {
    const content = message('companion', `The verification could not finish. ${error.message}`, 'CONNECTION NOTE');
    content.append(node('p', '', 'Your interpretation is still available above. You can retry the check or revise it.'));
    setBusy(false);
  }
}

async function reviewNextCase() {
  setBusy(true, 'Interpreting my next case for review…');
  $('#cancel-processing').hidden=false;
  try {
    const next = await api('/api/interpret', {session_id: state.session, next_case: true});
    if (next.candidate_id) addInterpretation(next, next.original);
    else {
      const content = message('companion', next.clarification); interpretationDiagnostic(content, next.diagnostic); state.caseRevision = !!next.case_review;
      if (!$('#thought').value) $('#thought').value = next.original || '';
      setBusy(false);
    }
  } catch (error) {
    const content = message('companion', error.message);
    const retry = node('button', 'text-button', 'Review the next case again');
    retry.addEventListener('click', () => { if (!state.busy && !state.candidate) { retry.remove(); reviewNextCase(); } });
    content.append(retry); setBusy(false);
  }
}

function addVerificationDetails(card, result) {
  const details = node('details', 'verification-inspector');
  details.dataset.logicInspection='';
  details.append(node('summary', '', 'Inspect logic & code'));
  for(const scope of result.verification_scopes||[]){const panel=node('details','scope-inspector');panel.append(node('summary','',scope.label+' · '+scope.status));if(scope.hypothetical)panel.append(node('p','','Conditional support; this does not establish its assumptions.'));if(scope.inferred_dependencies?.length)panel.append(node('p','','Automatically recognised dependencies: '+scope.inferred_dependencies.join(', ')+'. These were not necessarily cited in my current thought.'));for(const [key,code]of Object.entries(scope.sources||{}))panel.append(node('h5','',key),node('pre','',code));details.append(panel);}
  function section(title, check) {
    if (!check) return;
    details.append(node('h4', '', title));
    if (check.scope) details.append(node('p','candidate-note',check.scope));
    if (check.theorem) details.append(node('p', '', check.theorem));
    if (check.graph) details.append(graphInspector(check.graph));
    for (const [key, name] of [['prolog', 'Prolog'], ['coq', 'Coq 8.20.1'], ['isabelle', 'Isabelle/HOL reference (not executed)']]) {
      const engine = check.engines?.[key];
      if (engine) details.append(node('p', '', `${name}: ${engine.status.replaceAll('_', ' ')}. ${engine.detail || ''}`));
      if (engine?.log) {
        const logs = node('details'); logs.append(node('summary', '', `${name} output`), node('pre', '', engine.log)); details.append(logs);
      }
      if (check.sources?.[key]) {
        const source = node('details', 'source-code');
        source.append(node('summary', '', `${name} source`));
        const pre = node('pre'); pre.append(node('code', '', check.sources[key])); source.append(pre); details.append(source);
      }
    }
    if (check.sources?.root) {
      const root = node('details', 'source-code'); root.append(node('summary', '', 'Isabelle session (ROOT)'), node('pre', '', check.sources.root)); details.append(root);
    }
    if (check.sources?.imported_theory) {
      const source = node('details', 'source-code'); source.append(node('summary', '', 'Imported scenario theory'), node('pre', '', check.sources.imported_theory)); details.append(source);
    }
    if (!Object.keys(check.sources || {}).length) details.append(node('p', 'candidate-note', 'No code was generated for this check.'));
  }
  section('This step', result);
  section('Solution goal', result.solution_check);
  card.append(details);
}

function addSolutionCheck(card, result) {
  const checked = result.solution_check;
  if (!checked) return;
  const section = node('div', 'goal-progress');
  const pending = ['error', 'unavailable'].includes(checked.status);
  const labels = {
    discovered: state.scenario?.domain === 'theory' ? 'Every part of my goal is established' : 'Safe strategy proved',
    awaiting_strategy: 'Door states known · my choice rule is still needed',
    not_discovered: state.scenario?.domain === 'theory' ? 'My case is still taking shape' : 'My route is still taking shape'
  };
  section.append(node('p', 'candidate-note', labels[checked.status] || 'The solution check is waiting'));
  if (checked.status === 'not_discovered' && state.scenario?.domain === 'theory') section.append(node('p', 'candidate-note', checked.detail));
  if (pending) {
    const retry = node('button', 'text-button', 'Retry solution check ↗');
    retry.addEventListener('click', async () => {
      if (state.busy) return;
      retry.disabled = true;
      setBusy(true, 'Checking my route using the reasoning so far…');
      try {
        const next = await api('/api/check-solution', {session_id: state.session});
        state.transcript.push({role: 'solution_check', ...next});
        section.remove();
        card.querySelector('.verification-inspector')?.remove();
        addSolutionCheck(card, next);
        addVerificationDetails(card, {...result, solution_check: next.solution_check});
        if (next.progress?.solved) showCompleted(next.solution || next.solution_check);
      } catch (error) { toast(error.message); retry.disabled = false; }
      finally { setBusy(false); }
    });
    section.append(retry);
  }
  card.append(section);
}

function showCompleted(solution) {
  if (state.solved) return;
  state.solved = true;
  const card = node('section', 'completed-banner');
  card.append(node('div', 'eyebrow', 'A THREAD THAT HOLDS'));
  const theory = state.scenario?.domain === 'theory';
  card.append(node('h3', '', theory ? "I've connected the case." : "I've found a way through."));
  card.append(node('p', '', theory ? 'My grounded argument connects the supplied facts to every goal.' : 'I know what the answer tells me, and I know which door to go through, whichever guard I ask.'));
  if (theory) card.append(node('p', 'candidate-note', 'The proof checks the connection from my stated premises and cited established steps. Hypothetical premises remain conditional; my optional reflection is a separate learning record.'));
  if(state.scenario.verification_scope)card.append(node('p','candidate-note',state.scenario.verification_scope));
  if (solution?.witness?.conclusions) {
    const list = node('ul'); solution.witness.conclusions.forEach(c => list.append(node('li', '', c))); card.append(list);
  }
  if (solution?.witness?.on_yes) {
    const witness = solution.witness;
    card.append(node('p', 'candidate-note', witness.quote_kind === 'original_thought' ? 'In my own words:' : 'My question, in my own words:'));
    card.append(node('blockquote', 'solution-question', witness.question_text));
    const table = node('table', 'solution-table');
    const head = node('tr');
    ['Answer', 'Tested door', 'Other door', 'Choose'].forEach(text => head.append(node('th', '', text)));
    const thead = node('thead'); thead.append(head); table.append(thead);
    const tbody = node('tbody');
    [['No', witness.on_no], ['Yes', witness.on_yes]].forEach(([answer, outcome]) => {
      const row = node('tr');
      [answer, outcome.tested_safe ? 'Safe' : 'Unsafe', outcome.other_safe ? 'Safe' : 'Unsafe', outcome.choose === 'tested' ? 'Tested door' : 'Other door'].forEach(text => row.append(node('td', '', text)));
      tbody.append(row);
    });
    table.append(tbody); card.append(table);
    card.append(node('p', 'candidate-note', 'My question and my choice rule work in all four possible situations.'));
  }
  if (solution?.argumentation) {
    const review = solution.argumentation;
    const overview = node('details', 'argument-review');
    overview.append(node('summary', '', 'How my argument fits together'));
    const trail = node('ol');
    review.overview.forEach(step => {
      const li = node('li'); li.append(node('strong', '', `${step.step}: `), document.createTextNode(step.conclusion));
      if (step.assumptions?.length) li.append(node('p','candidate-note','Premises: '+step.assumptions.join('; ')));
      if (step.cited_rules?.length) li.append(node('p','candidate-note','Cited connecting rules: '+step.cited_rules.join('; ')));
      if (step.state) li.append(node('p','candidate-note','Knowledge: '+step.state));
      if (step.depends_on.length) li.append(node('p', 'candidate-note', `Builds on ${step.depends_on.join(', ')}`));
      trail.append(li);
    });
    overview.append(trail); card.append(overview);
    const route=node('details','debrief-detail');route.append(node('summary','','The direct route'));card.append(route);
    route.append(node('p', '', 'Exploring other routes helps me understand the problem and eliminate approaches. Here I can distinguish that exploration from the steps needed to establish my conclusion.'));
    const improvements = node('ul'); review.inefficiencies.forEach(t => improvements.append(node('li', '', t))); route.append(improvements);
    const carry=node('details','debrief-detail');carry.append(node('summary','','Reasoning I can carry with me'));card.append(carry);
    const concepts = node('ul'); review.concepts.forEach(t => concepts.append(node('li', '', t))); carry.append(concepts);
    carry.append(node('p', '', review.transfer));
  }

  card.append(learningCheckpoint({session:state.session,scenario:state.scenario,onChallengeTransfer:()=>openChallengeConfig({...state.scenario.challenge.config,format:state.scenario.journey?'staged':'single'}),onTransfer:async source=>{try{const r=await api('/api/import-theory',{source});await resetWorkspace(r.scenario);}catch(e){toast(e.message);}}}));
  flow.complete(card);
}

async function requestHint(level=0) {
  if (state.busy || !state.session) return;
  setBusy(true, 'Thinking about my next step…');
  try {
    const result = await api('/api/hint', {session_id: state.session, guidance: state.guidance,level});
    message('companion', readable(result.feedback || result.hint), 'SUPPORT I CHOSE · NOT A NEW FACT');
  } catch (error) { message('companion', `A nudge is not available yet. ${error.message}`, 'CONNECTION NOTE'); }
  finally { setBusy(false); }
}

function setFocus(enabled) {
  document.body.classList.toggle('focus-mode', enabled);
  $('#focus-setting').checked = enabled;
  $('#focus-button').setAttribute('aria-pressed', String(enabled));
}

function updateGuidance() {
  state.guidance = $('#guidance').value;
  const descriptions = {gentle: 'A short question when you need a next step.', more: 'Prompts to make assumptions and connections easier to explain.', minimal: 'Short responses with more room for your own direction.'};
  $('#guidance-description').textContent = descriptions[state.guidance];
  const opening = $('#opening-guidance');
  if (opening) opening.textContent = {
    gentle: state.scenario?.hints?.[0] || 'What do I know about how each guard answers? What can I infer from that?',
    more: state.scenario?.hints?.[0] || 'If I pick one guard and one fact, what would that guard tell me about a safe door, and why?',
    minimal: 'Where shall I begin?'
  }[state.guidance];
}

function startTimer() {
  const seconds = Number($('#timer-setting').value);
  state.timer = {remaining: seconds, enabled: seconds > 0, announced: false, lastTick: Date.now()};
  updateTimer();
}

function updateTimer() {
  const timer = state.timer;
  const now = Date.now();
  if (state.busy && state.busySince) {
    const elapsed = Math.floor((now-state.busySince)/1000);
    if ($('#busy-status').textContent !== state.busyDescription) $('#busy-status').textContent=state.busyDescription;
    $('#busy-elapsed').textContent=elapsed>2?`${elapsed}s · My draft stays available.`:'';
  }
  if (timer.enabled && !state.paused && !state.busy && flow.phase==='thinking') timer.remaining = Math.max(0, timer.remaining - (now - timer.lastTick) / 1000);
  timer.lastTick = now;
  const label = $('#pace-label');
  if (!timer.enabled) { label.replaceChildren(node('span', 'pace-dot'), document.createTextNode('At your pace')); return; }
  if (timer.remaining <= 0) {
    label.textContent = 'Time cue reached · keep going';
    if (!timer.announced) { timer.announced = true; toast('Your time cue is here. You can keep thinking for as long as you like.'); }
  } else {
    const seconds = Math.ceil(timer.remaining);
    label.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')} ${state.paused ? '· paused' : '· your time cue'}`;
  }
}

function openPause() {
  state.paused = true;
  updateTimer();
  const summary = $('#debrief-summary');
  summary.replaceChildren(node('strong', '', `${state.claims.length} verified ${state.claims.length === 1 ? 'step' : 'steps'}. `));
  summary.append(document.createTextNode(state.solved ? 'I established every part of my goal.' : state.claims.length ? 'I can build this explanation one connection at a time.' : 'Noticing what I am unsure about gives me a starting point.'));
  $('#pause-dialog').showModal();
}

async function exportSession() {
  let serverSession;
  try { if (state.session) serverSession = await api(`/api/session?id=${encodeURIComponent(state.session)}`); }
  catch { /* The browser record still contains the learner's work if the local server has stopped. */ }
  const record = {
    format: 'thread-reasoning-session', version: 1, exported_at: new Date().toISOString(),
    started_at: state.started, scenario: state.scenario, claims: state.claims,
    transcript: state.transcript, reflection: $('#reflection').value, learning:await get('learning:'+state.session), performance:performanceSummary(),
    draft: $('#thought').value, completed: state.solved, stage_history:await stageHistory(), ...(serverSession ? {server_session: serverSession} : {})
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(record, null, 2)], {type: 'application/json'}));
  const link = node('a');
  link.href = url;
  link.download = `thread-reasoning-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Your reasoning record has been downloaded.');
}

function openCustomise(scenario = state.scenario) {
  if (!scenario) return;
  state.editorScenario = scenario;
  $('#custom-title').value = scenario.title || '';
  $('#custom-description').value = scenario.description || '';
  $('#custom-facts').value = (scenario.facts || []).join('\n');
  $('#custom-goal').value = scenario.goal || '';
  $('#import-review').textContent = scenario.import_kind || 'Reviewed scenario model';
  $('#scenario-error').hidden = true;
  $('#customise-dialog').showModal();
}

async function submitScenario(event) {
  event.preventDefault();
  const button = $('#scenario-form button[type="submit"]');
  button.disabled = true;
  $('#scenario-error').hidden = true;
  try {
    const scenario = {
      ...state.editorScenario,
      title: $('#custom-title').value.trim(), description: $('#custom-description').value.trim(),
      facts: $('#custom-facts').value.split('\n').map(fact => fact.trim()).filter(Boolean), goal: $('#custom-goal').value.trim()
    };
    const result = await api('/api/scenario', {scenario});
    await resetWorkspace(result.scenario || result);
    $('#customise-dialog').close();
    $('#scenario-flow h1')?.focus();
  } catch (error) {
    $('#scenario-error').textContent = error.message;
    $('#scenario-error').hidden = false;
  } finally { button.disabled = false; }
}

async function importScenario(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > 100000) throw new Error('Please use a THY or scenario JSON file smaller than 100 KB.');
    const text = await file.text();
    const result = file.name.toLowerCase().endsWith('.thy') ? await api('/api/import-theory', {source:text}) : await api('/api/scenario', {scenario:JSON.parse(text).scenario || JSON.parse(text)});
    $('#library-dialog').close();
    if ($('#customise-dialog').open) $('#customise-dialog').close();
    openCustomise(result.scenario);
    toast('Theory imported. Review its story, facts and goal before starting.');
  } catch (error) {
    if ($('#customise-dialog').open) { $('#scenario-error').textContent = error.message; $('#scenario-error').hidden = false; }
    else { $('#library-error').textContent = error.message; $('#library-error').hidden = false; }
  } finally { event.target.value = ''; }
}

document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
$('#runtime-button').addEventListener('click', () => $('#runtime-dialog').showModal());
$('#preferences-button').addEventListener('click', () => $('#preferences-dialog').showModal());
$('#focus-button').addEventListener('click', () => {setFocus(!document.body.classList.contains('focus-mode'));savePreferences();});
$('#focus-setting').addEventListener('change', event => setFocus(event.target.checked));
$('#motion-setting').addEventListener('change', event => document.body.classList.toggle('reduced-motion', event.target.checked));
$('#motion-setting').checked = matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#guidance').addEventListener('change', updateGuidance);
$('#timer-setting').addEventListener('change', startTimer);
$('#dismiss-onboarding').addEventListener('click', () => { $('#show-introduction').checked = false; $('#onboarding').hidden = true; savePreferences(); $('#thought').focus(); });
$('#thought-form').addEventListener('submit', submitThought);
$('#thought').addEventListener('keydown', event => { if (!event.isComposing && event.key === 'Enter' && !event.shiftKey && ($('#enter-to-send').checked || event.ctrlKey || event.metaKey)) { event.preventDefault(); submitThought(); } });
const support=node('details','support-ladder');support.id='support-ladder';support.append(node('summary','','Choose how much support I want'),node('p','','I can increase or reduce guidance whenever I choose. These prompts never add facts to my argument.'));
['Restate my goal','Give a focused cue','Offer an explanation starter','Show an analogous example'].forEach((label,i)=>{const b=node('button','text-button',label);b.type='button';b.onclick=()=>requestHint(i);support.append(b);});
$('#thought-form').after(support);$('#hint-button').addEventListener('click',()=>{support.open=!support.open;if(support.open)support.querySelector('summary').focus();});
$('#cancel-processing').addEventListener('click',cancelInterpretation);
$('#refresh-runtime').addEventListener('click', async () => { await refreshRuntime(); if (!state.session&&state.scenario) { try { await startSession(state.scenario,null,false,true); } catch (error) { toast(error.message); } } });
$('#pause-button')?.addEventListener('click', openPause); // older saved layouts only
$('#pause-dialog').addEventListener('close', () => { state.paused = false; state.timer.lastTick = Date.now(); updateTimer(); });
$('#export-button').addEventListener('click', exportSession);
$('#customise-button').addEventListener('click', () => openCustomise());
$('#scenario-form').addEventListener('submit', submitScenario);
$('#import-scenario').addEventListener('change', importScenario);
$('#dictation-button').addEventListener('click', () => $('#dictation-dialog').showModal());
$('#dictation-done').addEventListener('click', () => { $('#dictation-dialog').close(); $('#thought').focus(); });
$('#custom-facts').readOnly = true;
$('#custom-facts').removeAttribute('aria-label');
const fixedHelp=node('p','fine-print','These facts are read-only. Use the scenario builder or import to change the formal rules.');fixedHelp.id='fixed-facts-help';$('#custom-facts').after(fixedHelp);$('#custom-facts').setAttribute('aria-describedby',fixedHelp.id);
$('#custom-facts').previousElementSibling.textContent = 'Fixed facts — the logic of this scenario';
$('#choose-scenario').addEventListener('click', openLibrary);
$('#restart-button').addEventListener('click', () => resetWorkspace(state.scenario).catch(() => {}));
$('#import-theory').addEventListener('change', importScenario);
$('#download-template').addEventListener('click', () => downloadText('My_Case.thy', CUSTOM_TEMPLATE));

function renderSavedAttempt(saved){
      for (const item of saved.history || []) {
        message('user', item.student);
        const result = item.result;
        state.transcript.push({role: 'verification', ...result});
        const content = message('companion');
        const accepted = result.status === 'verified';
        const unavailable = ['error','pending'].includes(result.status);
        const card = node('section', `result-card ${accepted ? 'accepted' : unavailable ? 'pending' : 'rejected'}`);
        card.append(node('div', 'result-label', accepted ? 'My thought holds' : unavailable ? 'Verification is waiting' : 'Something to reconsider'), node('p', '', result.feedback));
        addSolutionCheck(card, result);
        addVerificationDetails(card, result);
        content.append(card);
      }
      if (saved.progress.solved) showCompleted(saved.solution);
      if (saved.pending) addInterpretation(saved.pending,saved.pending.original);
}

async function initialise() {
  renderRuntime();
  setBusy(true, 'Opening your local reasoning workspace…');
  const runtimePromise = refreshRuntime();
  let openingScenario;
  try {
    const scenario = location.hash.startsWith('#session=') ? await api('/api/scenario') : await api('/api/tutorial');
    openingScenario=scenario.scenario || scenario;
    renderScenario(openingScenario);
    const resume = location.hash.match(/^#session=([A-Za-z0-9_-]+)$/);
    if (resume) {
      const saved = await api(`/api/session?id=${encodeURIComponent(resume[1])}`);
      state.session = saved.session_id;
      state.claims = saved.claims;
      if(saved.contract_notice)showNotice(saved.contract_notice);
      renderScenario(saved.scenario);
      renderClaims();
      $('#onboarding').hidden = !!state.scenario.tutorial || !$('#show-introduction').checked;
      $('#conversation').replaceChildren();
      renderSavedAttempt(saved);
      const workspace=await get('workspace:'+state.session);
      if(workspace){$('#thought').value=workspace.draft||'';$('#reflection').value=workspace.reflection||'';}
      if(!saved.progress.solved)await flow.open({resume:true});
      setBusy(false);
      scrollConversation();
    } else await startSession(openingScenario,null,false,true);
  } catch (error) {
    showNotice(error.message);
    setBusy(false);
    if(!state.session&&openingScenario)try{await startSession(openingScenario,null,false,true);}catch(startError){showNotice(startError.message);setBusy(false);}
  }
  await runtimePromise;
}

function applyReadingPreferences(){
 document.documentElement.dataset.textSize=$('#text-size').value;
 document.body.classList.toggle('reading-space',$('#reading-spacing').checked);
}
function applyPreferences(p={}){
 const option=(id,value,fallback)=>{$(id).value=[...$(id).options].some(o=>o.value===value)?value:fallback;};
 option('#guidance',p.guidance,'gentle');option('#timer-setting',p.timer,'0');option('#workspace-view',p.view,'full');option('#text-size',p.textSize,'standard');
 $('#motion-setting').checked=typeof p.motion==='boolean'?p.motion:matchMedia('(prefers-reduced-motion: reduce)').matches;
 document.body.classList.toggle('reduced-motion',$('#motion-setting').checked);setFocus(!!p.focus);
 $('#enter-to-send').checked=p.enterToSend!==false;$('#direct-wording').checked=!!p.direct;$('#reading-spacing').checked=!!p.spacing;$('#show-introduction').checked=p.introduction!==false;
 $('#anticipation-enabled').checked=p.backgroundPreparation!==false;
 $('#onboarding').hidden=!!state.scenario?.tutorial||!$('#show-introduction').checked;
 document.body.classList.toggle('current-view',$('#workspace-view').value==='current');flow.updateLayout();applyReadingPreferences();updateGuidance();
}
async function restorePreferences(){
 try{const [p,backgroundPreparation]=await Promise.all([get('preferences'),get('background-preparation')]);applyPreferences({...p,backgroundPreparation});}catch(error){applyPreferences();$('#preferences-status').textContent='Saved preferences could not be read. Defaults are available; device storage may be unavailable.';}
}
function persistWorkspace(){if(state.session)put('workspace:'+state.session,{draft:$('#thought').value,reflection:$('#reflection').value}).catch(e=>showNotice('Device storage could not save the draft: '+e.message));}
for(const id of ['thought','reflection'])$('#'+id).addEventListener('input',persistWorkspace);
function savePreferences(){return put('preferences',{guidance:$('#guidance').value,motion:$('#motion-setting').checked,focus:$('#focus-setting').checked,timer:$('#timer-setting').value,direct:$('#direct-wording').checked,view:$('#workspace-view').value,textSize:$('#text-size').value,spacing:$('#reading-spacing').checked,enterToSend:$('#enter-to-send').checked,introduction:$('#show-introduction').checked}).then(()=>{$('#preferences-status').textContent='Preferences saved on this browser.';}).catch(error=>{$('#preferences-status').textContent='Applied for now, but preferences could not be saved: '+error.message;});}
for(const id of ['guidance','motion-setting','focus-setting','timer-setting','enter-to-send'])$('#'+id).addEventListener('change',savePreferences);
$('#conversation').addEventListener('scroll',()=>{const c=$('#conversation');state.followConversation=c.scrollHeight-c.scrollTop-c.clientHeight<80;},{passive:true});
window.addEventListener('pagehide',persistWorkspace);
setInterval(updateTimer, 1000);
async function stageHistory(){if(!state.scenario?.journey)return [];let id=state.session;const records=[],seen=new Set();while(id&&records.length<3&&!seen.has(id)){seen.add(id);const s=await api('/api/session?id='+encodeURIComponent(id));records.unshift({session:s,reflection:await get('learning:'+id),workspace:await get('workspace:'+id)});id=s.previous_stage;}return records;}
const flow=createScenarioFlow({state,onChoose:openLibrary,onTutorial:startTutorial,onPreferences:()=>$('#preferences-dialog').showModal(),onNext:(choice,rationale)=>resetWorkspace(null,{session_id:state.session,choice,rationale}),onPrepare:session_id=>api('/api/prepare-next-stage',{session_id}),onExport:exportSession,onHistory:stageHistory});
async function startTutorial(){if(state.busy)return;setBusy(true,'Preparing the tutorial…');try{const r=await api('/api/tutorial');setBusy(false);await resetWorkspace(r.scenario);$('#library-dialog').close();}catch(e){setBusy(false);toast(e.message);}}
const tutorialButton=node('button','secondary-button','Start guided tutorial · The archive visit');tutorialButton.onclick=startTutorial;$('#scenario-library').before(tutorialButton);
$('#support-ladder').append(reasoningToolkit());
$('#library-dialog').addEventListener('close',()=>{if(flow.phase!=='thinking')document.querySelector('#scenario-flow h1')?.focus();});
restorePreferences().then(initialise);

document.querySelector('#warmup-workspace').onclick=async e=>{e.target.disabled=true;const status=document.querySelector('#warmup-status');status.textContent='Loading Gemma while I read…';try{await warmup();status.textContent='Gemma is ready in this workspace.';}catch(err){status.textContent=err.message;}finally{e.target.disabled=false;}};

$('#workspace-view').addEventListener('change',()=>{document.body.classList.toggle('current-view',$('#workspace-view').value==='current');if($('#workspace-view').value==='full'){flow.setCollapsed(false);put('scenario-collapsed',false).catch(()=>{});}else flow.updateLayout();savePreferences();});
$('#direct-wording').addEventListener('change',savePreferences);
for(const id of ['text-size','reading-spacing'])$('#'+id).addEventListener('change',()=>{applyReadingPreferences();savePreferences();});
$('#show-introduction').addEventListener('change',()=>{$('#onboarding').hidden=!!state.scenario?.tutorial||!$('#show-introduction').checked;savePreferences();});
async function saveBackgroundPreparation(){const enabled=$('#anticipation-enabled').checked;window.dispatchEvent(new CustomEvent('background-preparation-change',{detail:enabled}));try{await put('background-preparation',enabled);$('#preferences-status').textContent='Preferences saved on this browser.';}catch(error){$('#preferences-status').textContent='Applied for now, but the background preference could not be saved: '+error.message;}}
$('#anticipation-enabled').addEventListener('change',saveBackgroundPreparation);
$('#reset-preferences').addEventListener('click',async()=>{applyPreferences();flow.setCollapsed(false);startTimer();await put('scenario-collapsed',false).catch(()=>{});await savePreferences();await saveBackgroundPreparation();});
const challengeMaker=challengeForm({generate:(config,format)=>api('/api/generate-task',{config}),start:async(scenario,guidance)=>{$('#guidance').value=guidance;updateGuidance();await savePreferences();await resetWorkspace(scenario);$('#library-dialog').close();}});
$('#scenario-library').before(challengeMaker);
async function openChallengeConfig(config){if(state.busy)return;await openLibrary();await challengeMaker.configure(config);}
const currentActions=node('div','current-actions');for(const [id,label]of [['choose-scenario','Choose scenario'],['restart-button','Restart scenario']]){const b=node('button','text-button',label);b.type='button';b.onclick=()=>{if(!state.busy)$('#'+id).click();};currentActions.append(b);}$('#context-content').before(currentActions);
const builder=authorForm(async source=>{const r=await api('/api/import-theory',{source});openCustomise(r.scenario);});
$('#customise-dialog').append(builder);
const createButton=node('button','secondary-button','Create a scenario from statements and rules');createButton.onclick=()=>{$('#library-dialog').close();openCustomise(state.scenario);builder.open=true;builder.querySelector('summary').focus();};$('#scenario-library').before(createButton);
const lesson=node('details','onboarding-example');lesson.append(node('summary','','Try the review loop · example and glossary'),node('p','','Example: a library lends a book when my pass is valid AND the book is available. “My pass is valid, so I can borrow it” leaves a condition open. I can ask which condition, then explain how both facts support my claim.'),node('p','','A fact is supplied by the scenario. An assumption is a condition I add. A claim is what I assert. A warrant connects evidence to a claim. A counterexample is a case where the claim fails. A proof here is conditional on the scenario model.'),node('p','','I review the interpretation first. If Gemma changed my meaning, I correct the interpretation; that does not mean my argument was wrong. English is the currently supported interface language. Other input languages have not been validated.'));
const supportDisclosure=node('details','support-panel');supportDisclosure.id='support-panel';supportDisclosure.append(node('summary','','ⓘ Reasoning support'),node('p','','Optional hints and examples. Opening these adds no accepted reasoning.'),$('#hint-button'),support,lesson);const supportColumn=node('aside','support-column');supportColumn.setAttribute('aria-label','Optional reasoning support');supportDisclosure.append(graphTools(state));supportColumn.append(supportDisclosure);$('main.workspace').append(supportColumn);
const readableExport=node('button','text-button','Export readable reasoning notes');readableExport.onclick=async()=>{const learning=await get('learning:'+state.session),history=await stageHistory();downloadText('thread-reasoning-notes.txt',[state.scenario.title,'Goal: '+state.scenario.goal,'Given facts:',...state.scenario.facts,'My reasoning trail:',...state.claims.map(c=>c.id+': '+(c.text||c.summary||'')+'\nInterpretation: '+(c.summary||readable(c.conclusion))),'Reflection: '+$('#reflection').value,...['description','feelings','evaluation','why','revision','plan'].map(k=>k+': '+(learning?.[k]||'')),...history.flatMap(r=>['Stage '+r.session.scenario.journey.stage,...r.session.graph.map(c=>c.text),'Evidence choice: '+(r.session.stage_decision?.choice||''),'Decision note: '+(r.session.stage_decision?.rationale||''),...Object.entries(r.reflection||{}).filter(([k])=>['description','feelings','evaluation','why','revision','plan'].includes(k)).map(([k,v])=>k+': '+v)])].join('\n\n'));};$('#pause-dialog').append(readableExport);
