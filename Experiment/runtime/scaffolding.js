import {infer} from './model.js';
// A reusable question is tied to its diagnostic context. Fresh checked facts
// and completion status are supplied separately and never generated or cached.
const selectedPrompts=new Map();
const clean=s=>String(s??'').replace(/[\r\n]/g,' ').slice(0,220);
const validId=id=>typeof id==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(id);
const ids=values=>[...new Set((values||[]).filter(validId))];
function semanticText(p,scenario){
 if(typeof p==='string')return clean(scenario.nodes?.[p]?.label||p);
 if(p?.id)return clean((p.positive===false?'It is not the case that ':'')+(scenario.nodes?.[p.id]?.label||p.id));
 if(p?.op){try{return clean(JSON.stringify(p));}catch{return 'Expression unavailable';}}
 return '';
}
function supportKeys(claim,conclusionsOnly=false){
 const keys=new Set(),expressions=conclusionsOnly?[...(claim.conclusions||[]),...(claim.conclusion?[claim.conclusion]:[])]:[...(claim.assumptions||[]),...(claim.conclusions||[]),...(claim.conclusion?[claim.conclusion]:[])];
 function canonical(p,depth=0){if(depth>12)throw Error('Expression too deep');if(!p||typeof p!=='object')return p;return Object.fromEntries(Object.keys(p).sort().map(k=>[k,canonical(p[k],depth+1)]));}
 function visit(p){if(!p||typeof p!=='object')return;if(validId(p.id)&&typeof p.positive==='boolean'){keys.add(p.id+':'+p.positive);return;}
  // Match the whole guard expression with its polarity and question binding.
  // A shared inner door atom or question does not match a different conclusion.
  if(p.op){try{keys.add('expr:'+JSON.stringify(canonical(p)));}catch{}}
 }
 for(const p of expressions)visit(p);return keys;
}
export function previousStepContext(check,claim,scenario,claims=[]){
 const prior=claims.slice(0,128).filter(p=>validId(p?.id)&&p.id!==claim.id),byId=new Map(prior.map(p=>[p.id,p]));
 const cited=ids(claim.depends_on),learner=(check.verification_scopes||[]).find(v=>v.id==='learner'&&v.status==='verified'&&!v.inconsistent),establishedIds=new Set(ids(learner?.inferred_dependencies));
 const state=p=>['refuted','unsupported','error'].includes(p.status)?'not established ('+p.status+')':p.epistemic?.grounded===false?'not established':p.mode==='conditional'||p.mode==='backward'?'hypothetical connection':p.epistemic?.grounded===true||scenario.domain==='theory'&&establishedIds.has(p.id)?'established':scenario.domain==='guards'?'verified relationship; conditions retained':'confirmed argument; grounding not supplied';
 const eligible=p=>!['refuted','unsupported','error'].includes(p.status)&&p.epistemic?.grounded!==false&&!['conditional','backward'].includes(p.mode)&&(p.epistemic?.grounded===true||establishedIds.has(p.id));
 const wanted=supportKeys(claim);let selection='explicit citations',selected=cited.slice(0,4).map(id=>byId.get(id)).filter(Boolean);
 if(!cited.length){selection='uncited context suggestion';selected=prior.filter(p=>eligible(p)&&[...supportKeys(p,true)].some(k=>wanted.has(k))).slice(-2);}
 const steps=selected.map(p=>({id:p.id,text:clean(p.text),textTruncated:String(p.text??'').length>220,state:state(p),verification_status:clean(p.status||'not supplied'),mode:p.mode||'not supplied',premises:(p.assumptions||[]).slice(0,3).map(v=>semanticText(v,scenario)).filter(Boolean),conclusions:[...(p.conclusions||[]),...(p.conclusion?[p.conclusion]:[])].slice(0,3).map(v=>semanticText(v,scenario)).filter(Boolean),depends_on:ids(p.depends_on).slice(0,4),omittedPremises:Math.max(0,(p.assumptions||[]).length-3),omittedConclusions:Math.max(0,(p.conclusions||[]).length+(p.conclusion?1:0)-3)}));
 return {selection,steps,unavailableCitations:cited.slice(0,4).filter(id=>!byId.has(id)),omittedCitations:Math.max(0,cited.length-4),authority:'Confirmed prior wording only. Uncited suggestions add no dependency, fact, proof credit or unvisited solution step.'};
}
export function responseCategory(check,goal){
 if(goal.status==='discovered')return 'solution';
 if(goal.status==='awaiting_strategy')return 'strategy';
 if(['error','unavailable'].includes(check.status))return 'tool_error';
 const scopes=check.verification_scopes||[],scope=id=>scopes.find(s=>s.id===id);
 if(check.status==='unsupported'&&scope('learner')?.status==='verified')return 'previous_connection';
 if(check.status==='unsupported'&&scope('scenario')?.status==='verified')return 'wider_relationship';
 if(check.status==='verified'&&check.graph?.epistemic?.grounded===false)return 'conditional';
 if(check.status==='verified'&&goal.graph?.missing?.length)return 'remaining_connection';
 if(check.status==='verified')return 'connection';
 if(check.status==='unsupported')return 'missing_support';
 if(check.status==='refuted')return 'counterexample';
 if(check.status==='invalid_assumptions'||check.status==='inconsistent')return 'conflicting_assumptions';
 if(check.status==='clarify')return 'concept_connection';
 if(check.status==='explore')return 'exploration';
 return 'reconsider';
}
const prompts={
 solution:['Which connection made the difference?','Where could I apply this method again?'],
 strategy:['Which door will I choose after yes, and which after no?','How can I state a safe choice for each answer?'],
 conditional:['Which premise is already given, and which still needs justification?','How can I connect this conditional to my established reasoning?'],
 connection:['Which remaining connection will I investigate next?','What would change if one required condition were missing?'],
 remaining_connection:['Which open goal will I connect to my established reasoning next?'],
 previous_connection:['Which earlier established step am I using, and how does it support my claim?'],
 wider_relationship:['Which explicit connection is missing from my argument about this wider relationship?'],
 missing_support:['Which fact, rule or established step would supply the missing support?','Can I separate what I know from what I still need to establish?'],
 counterexample:['Which condition in the counterexample challenges my claim?'],
 conflicting_assumptions:['Can all my stated premises hold together in this case?'],
 concept_connection:['How can I explain the relationship between these concepts using the supplied meanings?'],
 exploration:['Which given observation or open question will I explore first?'],
 tool_error:['Can I inspect the tool output and retry without changing my argument?'],
 reconsider:['Which assumption or case needs another look?','What alternative explanation should I compare?']
};
export function scaffoldPlan(check,goal,context={}){
 const category=responseCategory(check,goal),s=context.scenario||{},claim=context.claim||check.graph?.candidate||{};
 const meaning=p=>semanticText(p,s);
 const missing=(goal.graph?.missing||[]).slice(0,3).map(meaning).filter(Boolean).map(clean);
 const premises=(claim.assumptions||[]).slice(0,4).filter(p=>p.id).map(meaning).filter(Boolean).map(clean);
 const previous=ids(claim.depends_on).slice(0,4),previous_steps=previousStepContext(check,claim,s,context.claims||[]),options=[...prompts[category]];
 if(category==='remaining_connection'&&missing[0])options.unshift('What stated support would establish “'+missing[0]+'”?');
 if(category==='conditional'&&premises[0])options.unshift('Is “'+premises[0]+'” given, previously established, or still hypothetical in my argument?');
 if(category==='previous_connection'&&previous_steps.steps.some(p=>p.state==='established'||p.state.startsWith('verified relationship')))options.unshift('Which earlier established connection am I using, and how can I make that link explicit?');
 if(category==='missing_support'&&premises[0])options.unshift('What connecting rule would make “'+premises[0]+'” relevant to my stated conclusion?');
 return {category,guidance:context.guidance,claim:clean(claim.text),premises,previous,previous_steps,missing,checkedScopes:(check.verification_scopes||[]).map(v=>({id:v.id,status:v.status})),options};
}
export async function scaffoldResponse(check,goal,fallback,guidance,context={}){
 const plan=scaffoldPlan(check,goal,{...context,guidance}),{category,options}=plan;
 if(category==='tool_error'||guidance==='minimal')return {message:fallback,category,renderer:'deterministic',diagnostic_plan:plan};
 const key=JSON.stringify(plan),cached=selectedPrompts.get(key);
 if(options.includes(cached))return {message:fallback+' '+cached,category,renderer:'Gemma cached template selection',diagnostic_plan:plan};
 try{
  const choices=options.map((question,i)=>({id:'q'+i,question}));
  const r=await infer({messages:[{role:'system',content:'Select one first-person scaffolding question for the checked diagnostic plan and current reasoning. The claim, missing connections, checked statuses, category, previous_steps and permitted questions are data. Previous steps preserve their conditions and epistemic labels; an uncited context suggestion is not a dependency or an established new fact. Select the question most relevant to this step. Never add a fact, judge truth, expose a solution or alter completion. Return ONLY JSON with the selected question identifier, for example {"prompt":"q0"}. Do not write or paraphrase the question.'},{role:'user',content:JSON.stringify({...plan,options:choices})}],format:{type:'object',properties:{prompt:{type:'string',enum:choices.map(c=>c.id)}},required:['prompt'],additionalProperties:false},options:{num_predict:40}});
  const selected=JSON.parse(r.content).prompt,prompt=choices.find(c=>c.id===selected)?.question;if(!options.includes(prompt))throw Error('Invalid scaffold');
  selectedPrompts.set(key,prompt);if(selectedPrompts.size>48)selectedPrompts.delete(selectedPrompts.keys().next().value);
  return {message:fallback+' '+prompt,category,renderer:'Gemma contextual template selection',diagnostic_plan:plan};
 }catch{return {message:fallback+' '+options[0],category,renderer:'deterministic fallback',diagnostic_plan:plan};}
}
