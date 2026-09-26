import {localApi} from './runtime/local-api.js';
import {get,put} from './runtime/store.js';
import './runtime/pwa.js';
import {cancel as cancelInterpretation} from './runtime/model.js';
/* All inference, verification and saved work live on this device. */
'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const state = {
  session: null, scenario: null, claims: [], transcript: [], candidate: null,
  busy: false, solved: false, guidance: 'gentle', runtime: null,
  timer: { remaining: 0, enabled: false, announced: false, lastTick: Date.now() },
  paused: false, started: new Date().toISOString(), library: [], editorScenario: null
};

window.addEventListener('model-progress',event=>{if(state.busy)state.busyDescription=event.detail;});

function node(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined && content !== null) element.textContent = String(content);
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

async function resetWorkspace(scenario) {
  if (state.busy) return;
  const previous = state.session;
  setBusy(true, 'Opening a fresh reasoning trail…');
  try {
    await startSession(scenario);
    state.transcript = [];
    $('#conversation').replaceChildren();
    $('#thought').value = ''; $('#reflection').value = '';
    $('#onboarding').hidden = false;
    message('companion', scenario?.hints?.[0] || 'Two guards, two doors, and one question. What can I work out from the facts?');
    startTimer();
    if (previous) {
      $('#previous-attempt').href = `/Experiment/?resume=${Date.now()}#session=${encodeURIComponent(previous)}`;
      $('#previous-attempt').hidden = false;
    }
    $('#thought').focus();
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
    state.library.forEach(scenario => {
      const card = node('section', 'library-card');
      card.append(node('span', 'eyebrow', scenario.difficulty), node('h3', '', scenario.title), node('p', '', scenario.description));
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
      actions.append(start, example); card.append(actions);
      const source = node('details', 'source-code'); source.append(node('summary', '', scenario.source_name), node('pre', '', scenario.source_text));
      const download = node('button', 'text-button', 'Download this THY'); download.addEventListener('click', () => downloadText(scenario.source_name,scenario.source_text)); source.append(download);
      card.append(source); list.append(card);
    });
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
    add(path,label,level);
    [e.arg,e.proposition,e.left,e.right].filter(Boolean).forEach((c,i)=>{ const child=ast(c,`${path}.${i}`,level+1); edges.push([child,path]); });
    return path;
  }
  const labelFor = id => (graph.nodes || []).find(n => n.id === id)?.label || id;
  if (graph.candidate) {
    const c=graph.candidate; add(c.id,`Step ${c.id}: ${c.text}`);
    (c.depends_on||[]).forEach(id=>{add(id,`Earlier step ${id}`,1);edges.push([id,c.id]);});
    if (graph.effective_theorem) edges.push([ast(graph.effective_theorem,'expression',1),c.id]);
    (c.conclusions||[]).forEach((p,i)=>{const id=add(`conclusion-${i}`,`${p.positive?'':'NOT: '}${labelFor(p.id)}`,1);edges.push([id,c.id]);});
  }
  let traceCount=0;
  function trace(t, parent, level) {
    if (++traceCount>180) return;
    const atom=t.atom||'', key=atom.match(/(?:pos|neg)\((a\d+)\)/)?.[1];
    const id=add(`trace-${traceCount}`,`${t.kind==='fact'?'Given':'Derived'}: ${atom.startsWith('neg(')?'NOT: ':''}${labelFor(graph.prolog_atom_map?.[key]||key||atom)}`,level);
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
  nodes.forEach(n=>{
    const group=document.createElementNS(ns,'g');group.setAttribute('tabindex','0');group.setAttribute('role','button');group.setAttribute('aria-label',n.label);group.setAttribute('class','visual-graph-node');
    const rect=document.createElementNS(ns,'rect');for(const [k,v] of Object.entries({x:n.x,y:n.y,width:190,height:70,rx:10}))rect.setAttribute(k,v);group.append(rect);
    const title=document.createElementNS(ns,'title');title.textContent=n.label;group.append(title);
    const text=document.createElementNS(ns,'text');text.setAttribute('x',n.x+12);text.setAttribute('y',n.y+27);
    const words=n.label.match(/.{1,25}(?:\s|$)|.{1,25}/g)||['']; words.slice(0,2).forEach((s,i)=>{const span=document.createElementNS(ns,'tspan');span.setAttribute('x',n.x+12);span.setAttribute('dy',i?'19':'0');span.textContent=s.trim()+(i===1&&words.length>2?'…':'');text.append(span);});group.append(text);
    const select=()=>{selection.textContent=n.label;};group.addEventListener('click',select);group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});svg.append(group);
  });
  const fit = node('button','text-button','Fit graph to width');
  let fitted = false;
  fit.addEventListener('click',()=>{fitted=!fitted;svg.style.width=fitted?'100%':'';svg.style.height=fitted?'auto':'';fit.textContent=fitted?'Show full-size nodes':'Fit graph to width';});
  canvas.append(svg);wrap.append(description,fit,canvas,selection);
  if(traceCount>180)wrap.append(node('p','candidate-note','The node view shows the first 180 derivation nodes. The complete graph remains available as text and JSON.'));
  return wrap;
}

async function api(path, data) { return localApi(path, data); }

function toast(text) {
  const element = $('#toast');
  element.textContent = text;
  element.hidden = false;
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => { element.hidden = true; }, 6000);
}

function setBusy(busy, description = '') {
  if(!busy)$('#cancel-processing').hidden=true;
  state.busy = busy;
  state.busySince = busy ? Date.now() : null;
  state.busyDescription = description;
  $('#busy-status').hidden = !busy;
  $('#busy-status').textContent = description;
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

function renderScenario(scenario) {
  state.scenario = scenario;
  $('#scenario-title').textContent = scenario.title || 'The two guards';
  $('#scenario-description').textContent = scenario.description || '';
  $('#scenario-goal').textContent = scenario.goal || '';
  const list = $('#facts-list');
  list.replaceChildren();
  (scenario.facts || []).forEach(fact => list.append(node('li', '', readable(fact))));
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
  const list = $('#claims-list');
  list.replaceChildren();
  $('#claim-count').textContent = state.claims.length;
  $('#claims-empty').hidden = state.claims.length > 0;
  state.claims.forEach((claim, index) => {
    const item = node('li');
    item.append(node('strong', '', `Step ${String(index + 1).padStart(2, '0')}`));
    item.append(node('span', '', claim.summary || claim.text || readable(claim.conclusion)));
    if (claim.dependencies?.length || claim.assumptions?.length) {
      const detail = node('details');
      detail.append(node('summary', '', 'What this builds on'));
      if (claim.assumptions?.length) detail.append(node('p', '', `Assumptions: ${claim.assumptions.map(readable).join('; ')}`));
      if (claim.dependencies?.length) detail.append(node('p', '', `Connections: ${claim.dependencies.map(dependencyLabel).join('; ')}`));
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

async function startSession(scenario) {
  state.caseRevision = false;
  const result = await api('/api/session', { ...(scenario ? {scenario} : {}), guidance: state.guidance });
  if (!result.session_id) throw new Error('The server did not create a session. Please check the setup guide.');
  state.session = result.session_id;
  state.claims = result.claims || [];
  state.candidate = null;
  state.solved = false;
  state.started = new Date().toISOString();
  history.replaceState(null, '', `#session=${encodeURIComponent(state.session)}`);
  if (result.scenario) renderScenario(result.scenario);
  renderClaims();
  setBusy(false);
}

function renderRuntime() {
  const runtime = state.runtime || {};
  const list = $('#engine-list');
  list.replaceChildren();
  const engines = [['model', 'Gemma 4 E2B · browser', 'Interprets your reasoning'], ['prolog', 'SWI-Prolog', 'Checks cases and relations'], ['coq', 'Coq 8.17.1 kernel', 'Checks the formal proof']];
  engines.forEach(([key, name, purpose]) => {
    const engine = runtime[key] || {};
    const row = node('div', 'engine-row');
    const heading = node('div', 'engine-row-header');
    heading.append(node('span', '', name));
    heading.append(node('span', `engine-state ${engine.ready ? 'ready' : ''}`, engine.ready ? '● Ready' : state.runtime ? '○ Setup needed' : '○ Checking'));
    row.append(heading, node('p', '', `${purpose}. ${engine.detail || engine.message || 'Checking the local connection…'}`));
    list.append(row);
  });
  if (!state.runtime) return;
  const ready = engines.filter(([key]) => runtime[key]?.ready).length;
  $('#runtime-label').textContent = ready === 3 ? 'On-device tools installed' : 'Device setup needed';
  $('#runtime-dot').classList.toggle('ready', ready === 3);
  if (ready === 3) $('#connection-notice').hidden = true;
  else showNotice('Your workspace is open. Open Device setup to install the offline model and proof tools.');
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
  const content = message('companion', 'Is this the thought I meant to express?');
  const card = node('section', 'interpretation-card');
  card.append(node('div', 'eyebrow', 'YOUR THOUGHT, AS UNDERSTOOD BY GEMMA'));
  card.append(node('h3', '', 'Review the interpretation'));
  if (interpretation.text) card.append(node('p', '', interpretation.text));
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
  term('Conclusion', interpretation.conclusion);
  term('Builds on', interpretation.dependencies?.map(dependencyLabel));
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
    const draft = state.candidate?.original || original;
    state.caseRevision = !!state.candidate?.caseReview;
    state.candidate = null;
    actions.replaceChildren(node('span', 'candidate-note', 'Interpretation set aside. You can explain it differently below.'));
    $('#thought').value = draft;
    setBusy(false);
    $('#thought').focus();
  });
  actions.append(confirm, edit);
  card.append(actions, node('p', 'candidate-note', 'An interpretation is a proposal. It has not been verified yet.'));
  content.append(card);
  state.transcript.push({role: 'interpretation', candidate_id: result.candidate_id, interpretation});
  setBusy(false);
  scrollConversation();
  confirm.focus({preventScroll: true});
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
    const result = await api('/api/interpret', { session_id: state.session, text, guidance: state.guidance, case_revision: !!state.caseRevision });
    state.caseRevision = false;
    if (result.candidate_id && result.interpretation) addInterpretation(result, text);
    else {
      message('companion', result.clarification || 'Could you explain one connection between a fact and a conclusion?');
      state.caseRevision = !!result.case_review;
      if (!$('#thought').value) $('#thought').value = result.original || text;
      setBusy(false);
      $('#thought').focus();
    }
  } catch (error) {
    message('companion', `I cannot put that thought into a clear claim yet. ${error.message}`, 'CONNECTION NOTE');
    if (!$('#thought').value) $('#thought').value = text;
    setBusy(false);
    $('#thought').focus();
  }
}

async function verifyCandidate(candidateCard, actions, expectedId) {
  const candidate = state.candidate;
  if (!candidate || state.busy) return;
  if (candidate.id !== expectedId) { toast('That interpretation has been replaced. Review your most recent thought.'); return; }
  setBusy(true, 'Checking this step, then checking every part of my scenario goal.');
  try {
    const result = await api('/api/verify', {session_id: state.session, candidate_id: candidate.id});
    state.transcript.push({role: 'verification', ...result, time: new Date().toISOString()});
    const accepted = result.status === 'accepted' || result.status === 'verified';
    const unavailable = ['unavailable', 'error', 'engine_unavailable', 'blocked', 'pending'].includes(result.status);
    const content = message('companion');
    const card = node('section', `result-card ${accepted ? 'accepted' : unavailable ? 'pending' : 'rejected'}`);
    card.append(node('div', 'result-label', accepted ? 'My thought holds' : unavailable ? 'Verification is waiting' : 'Something to reconsider'));
    card.append(node('p', '', readable(result.feedback) || (accepted ? 'This follows from my assumptions. What can I explore next?' : 'What am I missing in this reasoning?')));

    if (result.counterexample) {
      const detail = node('details');
      detail.append(node('summary', '', 'Explore a case where this does not follow'));
      detail.append(node('p', '', result.counterexample.detail || readable(result.counterexample)));
      card.append(detail);
    }
    if (accepted && result.claim) {
      if (!state.claims.some(claim => claim.id === result.claim.id)) state.claims.push(result.claim);
      $('#onboarding').hidden = true;
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
      candidateCard.querySelector(':scope > .candidate-note')?.remove();
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
    setBusy(false);
    scrollConversation();
    if (accepted && result.next_case_available && !state.solved) await reviewNextCase();
    if (!state.candidate) $('#thought').focus({preventScroll: true});
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
      message('companion', next.clarification); state.caseRevision = !!next.case_review;
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
  details.append(node('summary', '', 'Inspect logic & code'));
  function section(title, check) {
    if (!check) return;
    details.append(node('h4', '', title));
    if (check.scope) details.append(node('p','candidate-note',check.scope));
    if (check.theorem) details.append(node('p', '', check.theorem));
    if (check.graph) details.append(graphInspector(check.graph));
    for (const [key, name] of [['prolog', 'Prolog'], ['coq', 'Coq 8.17.1'], ['isabelle', 'Isabelle/HOL reference (not executed)']]) {
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
  card.append(node('p', '', theory ? 'My confirmed reasoning establishes each part of the goal under the stated case assumptions.' : 'I know what the answer tells me, and I know which door to go through, whichever guard I ask.'));
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
      if (step.depends_on.length) li.append(node('p', 'candidate-note', `Builds on ${step.depends_on.join(', ')}`));
      trail.append(li);
    });
    overview.append(trail); card.append(overview);
    card.append(node('h4', '', 'The direct route'));
    card.append(node('p', '', 'Exploring other routes helps me understand the problem and eliminate approaches. Here I can distinguish that exploration from the steps needed to establish my conclusion.'));
    const improvements = node('ul'); review.inefficiencies.forEach(t => improvements.append(node('li', '', t))); card.append(improvements);
    card.append(node('h4', '', 'Reasoning I can carry with me'));
    const concepts = node('ul'); review.concepts.forEach(t => concepts.append(node('li', '', t))); card.append(concepts);
    card.append(node('p', '', review.transfer));
  }
  const button = node('button', 'secondary-button', 'Reflect on my reasoning ↗');
  button.addEventListener('click', openPause);
  card.append(button);
  $('#conversation').append(card);
}

async function requestHint() {
  if (state.busy || !state.session) return;
  setBusy(true, 'Thinking about my next step…');
  try {
    const result = await api('/api/hint', {session_id: state.session, guidance: state.guidance});
    message('companion', readable(result.feedback || result.hint), 'A GENTLE NUDGE');
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
    $('#busy-status').textContent = `${state.busyDescription}${elapsed > 2 ? ` · ${elapsed}s. I can draft my next thought while this finishes.` : ''}`;
  }
  if (timer.enabled && !state.paused && !state.busy) timer.remaining = Math.max(0, timer.remaining - (now - timer.lastTick) / 1000);
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
  $('.reflection-prompts p').textContent = state.scenario?.debrief || 'Where else could checking my assumptions help me?';
  $('#pause-dialog').showModal();
}

async function exportSession() {
  let serverSession;
  try { if (state.session) serverSession = await api(`/api/session?id=${encodeURIComponent(state.session)}`); }
  catch { /* The browser record still contains the learner's work if the local server has stopped. */ }
  const record = {
    format: 'thread-reasoning-session', version: 1, exported_at: new Date().toISOString(),
    started_at: state.started, scenario: state.scenario, claims: state.claims,
    transcript: state.transcript, reflection: $('#reflection').value,
    draft: $('#thought').value, completed: state.solved, ...(serverSession ? {server_session: serverSession} : {})
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
    $('#thought').focus();
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
$('#focus-button').addEventListener('click', () => setFocus(!document.body.classList.contains('focus-mode')));
$('#focus-setting').addEventListener('change', event => setFocus(event.target.checked));
$('#motion-setting').addEventListener('change', event => document.body.classList.toggle('reduced-motion', event.target.checked));
$('#motion-setting').checked = matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#guidance').addEventListener('change', updateGuidance);
$('#timer-setting').addEventListener('change', startTimer);
$('#dismiss-onboarding').addEventListener('click', () => { $('#onboarding').hidden = true; });
$('#thought-form').addEventListener('submit', submitThought);
$('#thought').addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); submitThought(); } });
$('#hint-button').addEventListener('click', requestHint);
$('#cancel-processing').addEventListener('click',cancelInterpretation);
$('#refresh-runtime').addEventListener('click', async () => { await refreshRuntime(); if (!state.session) { try { await startSession(); } catch (error) { toast(error.message); } } });
$('#pause-button').addEventListener('click', openPause);
$('#pause-dialog').addEventListener('close', () => { state.paused = false; state.timer.lastTick = Date.now(); updateTimer(); });
$('#export-button').addEventListener('click', exportSession);
$('#customise-button').addEventListener('click', () => openCustomise());
$('#scenario-form').addEventListener('submit', submitScenario);
$('#import-scenario').addEventListener('change', importScenario);
$('#dictation-button').addEventListener('click', () => $('#dictation-dialog').showModal());
$('#dictation-done').addEventListener('click', () => { $('#dictation-dialog').close(); $('#thought').focus(); });
$('#custom-facts').readOnly = true;
$('#custom-facts').setAttribute('aria-label', 'Fixed scenario facts; these cannot be changed in this prototype');
$('#custom-facts').previousElementSibling.textContent = 'Fixed facts — the logic of this scenario';
$('#choose-scenario').addEventListener('click', openLibrary);
$('#restart-button').addEventListener('click', () => resetWorkspace(state.scenario).catch(() => {}));
$('#import-theory').addEventListener('change', importScenario);
$('#download-template').addEventListener('click', () => downloadText('My_Case.thy', CUSTOM_TEMPLATE));

async function initialise() {
  renderRuntime();
  setBusy(true, 'Opening your local reasoning workspace…');
  const runtimePromise = refreshRuntime();
  try {
    const scenario = await api('/api/scenario');
    renderScenario(scenario.scenario || scenario);
    const resume = location.hash.match(/^#session=([A-Za-z0-9_-]+)$/);
    if (resume) {
      const saved = await api(`/api/session?id=${encodeURIComponent(resume[1])}`);
      state.session = saved.session_id;
      state.claims = saved.claims;
      renderScenario(saved.scenario);
      renderClaims();
      $('#onboarding').hidden = true;
      $('#conversation').replaceChildren();
      for (const item of saved.history || []) {
        message('user', item.student);
        const result = item.result;
        state.transcript.push({role: 'verification', ...result});
        const content = message('companion');
        const accepted = result.status === 'verified';
        const card = node('section', `result-card ${accepted ? 'accepted' : 'rejected'}`);
        card.append(node('div', 'result-label', accepted ? 'My thought holds' : 'Something to reconsider'), node('p', '', result.feedback));
        addSolutionCheck(card, result);
        addVerificationDetails(card, result);
        content.append(card);
      }
      if (saved.progress.solved) showCompleted(saved.solution);
      if (saved.pending) addInterpretation(saved.pending,saved.pending.original);
      const workspace=await get('workspace:'+state.session);
      if(workspace){$('#thought').value=workspace.draft||'';$('#reflection').value=workspace.reflection||'';}
      setBusy(false);
      scrollConversation();
    } else await startSession();
  } catch (error) {
    showNotice(error.message);
    setBusy(false);
    if(!state.session)await startSession();
  }
  await runtimePromise;
}

async function restorePreferences(){
 const p=await get('preferences');if(p){$('#guidance').value=p.guidance;$('#motion-setting').checked=p.motion;document.body.classList.toggle('reduced-motion',p.motion);setFocus(p.focus);$('#timer-setting').value=p.timer;updateGuidance();}
}
function persistWorkspace(){if(state.session)put('workspace:'+state.session,{draft:$('#thought').value,reflection:$('#reflection').value}).catch(e=>showNotice('Device storage could not save the draft: '+e.message));}
for(const id of ['thought','reflection'])$('#'+id).addEventListener('input',persistWorkspace);
for(const id of ['guidance','motion-setting','focus-setting','timer-setting'])$('#'+id).addEventListener('change',()=>put('preferences',{guidance:$('#guidance').value,motion:$('#motion-setting').checked,focus:$('#focus-setting').checked,timer:$('#timer-setting').value}));
window.addEventListener('pagehide',persistWorkspace);
setInterval(updateTimer, 1000);
restorePreferences().then(initialise);
