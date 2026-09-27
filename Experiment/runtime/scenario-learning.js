// Display-only learning support. Never derive truth, targets or accepted claims here.
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};

export function deriveScenarioLearning(scenario={}){
 const nodes=scenario.nodes||{};
 const statement=id=>{const node=nodes[id];return node&&typeof node.label==='string'?{text:node.label,given:node.fact===true}:null;};
 const rules=(Array.isArray(scenario.rules)?scenario.rules:[]).flatMap(rule=>{
  if(!Array.isArray(rule.premises))return [];
  const conditions=rule.premises.map(statement),conclusion=statement(rule.conclusion);
  if(!conclusion||conditions.some(item=>!item))return [];
  return [{conditions,conclusion}];
 });
 return freeze({
  objective:typeof scenario.goal==='string'?scenario.goal:'Explain a connection and check its limits.',
  prerequisites:[
   {term:'Observation',meaning:'A statement supplied in this exercise. It is a starting assumption, not a discovery I made.'},
   {term:'Connecting rule',meaning:'A stated relationship that lets me move from its conditions to a conclusion. If it requires several conditions, I must account for all of them.'},
   {term:'Conclusion and limit',meaning:'What follows under those conditions, and what the exercise does not establish.'}
  ],
  rules,
  recall:'After reading one connection, I can hide it and explain in my own words: what must hold, why the rule connects it to a conclusion, and what would change if a condition were missing.'
 });
}

export function renderScenarioLearning(scenario,{view='prose',ruleIndex=0,onView=()=>{},onRule=()=>{}}={}){
 const data=deriveScenarioLearning(scenario),root=el('section');root.className='scenario-learning';root.setAttribute('aria-label','Optional reasoning support');
 const basics=el('details');basics.append(el('summary','Ideas I can draw on · optional'));
 basics.append(el('p','I can revisit these ideas at any difficulty. They are supports, not an entry test.'));
 const definitions=el('dl');for(const item of data.prerequisites)definitions.append(el('dt',item.term),el('dd',item.meaning));basics.append(definitions);root.append(basics);
 if(data.rules.length){
  const panel=el('details');panel.append(el('summary',`Connecting rules · ${data.rules.length} · choose a view`),el('p','These are the supplied relationships, not a completed argument. Looking at them adds no verified step.'));
  const ruleLabel=el('label','Choose one connection'),ruleSelect=el('select');ruleSelect.id='learning-rule';ruleLabel.htmlFor=ruleSelect.id;ruleLabel.className='field-label';
  data.rules.forEach((rule,index)=>{const label=rule.conclusion.text;const option=el('option',`Rule ${index+1} · ${label.length>85?label.slice(0,82)+'…':label}`);option.value=String(index);ruleSelect.append(option);});
  ruleSelect.value=String(Math.max(0,Math.min(Number.isInteger(ruleIndex)?ruleIndex:0,data.rules.length-1)));
  const viewLabel=el('label','How I view this connection'),viewSelect=el('select');viewSelect.id='learning-representation';viewLabel.htmlFor=viewSelect.id;viewLabel.className='field-label';
  for(const [value,label]of [['prose','Prose'],['structured','Structured argument map']]){const option=el('option',label);option.value=value;viewSelect.append(option);}viewSelect.value=view==='structured'?'structured':'prose';
  const content=el('section');content.id='learning-connection';viewSelect.setAttribute('aria-controls',content.id);ruleSelect.setAttribute('aria-controls',content.id);
  const status=el('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  function render(announce=false){
   const index=Number(ruleSelect.value),rule=data.rules[index];content.replaceChildren(el('h3',`Rule ${index+1}`));
   if(viewSelect.value==='prose'){
    content.append(el('p','If all of these statements hold — '+rule.conditions.map(condition=>'“'+condition.text+'”').join('; ')+' — then “'+rule.conclusion.text+'”.'));
   }else{
    content.append(el('h4','Conditions · all required'));const conditions=el('ol');
    for(const condition of rule.conditions){const item=el('li');item.append(el('p',condition.text),el('p',condition.given?'Given observation in this stage':'A connection to justify; not a given observation'));conditions.append(item);}content.append(conditions,el('h4','Connecting rule'),el('p','The supplied rule connects all the conditions above to the conclusion below.'),el('h4','Conclusion'),el('p',rule.conclusion.text));
   }
   if(announce)status.textContent=`Rule ${index+1} shown as ${viewSelect.value==='structured'?'a structured argument map':'prose'}.`;
  }
  ruleSelect.onchange=()=>{onRule(Number(ruleSelect.value));render(true);};viewSelect.onchange=()=>{onView(viewSelect.value);render(true);};
  render();panel.append(ruleLabel,ruleSelect,viewLabel,viewSelect,content,status);root.append(panel);
 }
 const recall=el('details');recall.append(el('summary','Try explaining a connection · optional'),el('p',data.recall),el('p','I can close the connecting-rule panel, think or speak privately, then reopen it to compare. When ready, I can use my own explanation as a thought. This practice is ungraded and adds no evidence.'));root.append(recall);
 return root;
}
