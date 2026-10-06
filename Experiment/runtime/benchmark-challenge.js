import {groundedSteps} from './grounded-fixtures.js';
// Independent feature-test oracles. These never interpret or submit learner text.
const check=(condition,message)=>{if(!condition)throw Error(message);};
export const challengeLiteral=id=>({id,positive:true});
export const challengeClaim=(ids,{id='c1',premises=[]}={})=>({id,kind:'step',domain:'theory',text:'Deterministic benchmark fixture',conclusions:ids.map(challengeLiteral),assumptions:premises.map(challengeLiteral),depends_on:[]});

export function challengeClosure(scenario){
 const known=new Set(Object.entries(scenario.nodes).filter(([,n])=>n.fact).map(([id])=>id));
 for(let i=0;i<=Object.keys(scenario.nodes).length;i++){
  const size=known.size;for(const r of scenario.rules)if(r.premises.every(p=>known.has(p)))known.add(r.conclusion);
  if(known.size===size)return known;
 }
 throw Error('Generated rule closure did not terminate');
}

export function challengeStructure(scenario){
 return JSON.stringify({facts:Object.entries(scenario.nodes).filter(([,n])=>n.fact).map(([id])=>id),rules:scenario.rules.map(r=>({premises:r.premises,conclusion:r.conclusion})),requirements:scenario.challenge.requirements.map(r=>({id:r.id,any_of:r.any_of,support_routes:r.support_routes||[]})),observations:scenario.challenge.dossiers.map(d=>d.observations)});
}

export function inspectChallenge(scenario){
 const c=scenario.challenge;check(c&&scenario.custom&&scenario.domain==='theory','Generated scenario metadata missing');
 const known=challengeClosure(scenario),requirements=c.requirements;
 check(c.dossiers.length===2,'Expected two disputed records');
 check(requirements.length===(c.config.difficulty==='stretch'?8:6),'Missing completion obligations');
 check(Object.keys(scenario.nodes).length<=40&&scenario.rules.length<=80,'Scenario exceeds compiler bounds');
 check(scenario.rules.every(r=>scenario.nodes[r.conclusion]&&r.premises.every(id=>scenario.nodes[id])),'Rule refers to an unknown proposition');
 check(!/Draft Attempt|Attempted solution|\b(?:lemma|theorem|sorry|oops)\b/i.test(scenario.source_text),'Worked answer or proof exposed in generated source');
 check(!Object.keys(c).some(k=>/^(?:answer|solution|worked_solution|profiles?)$/i.test(k)),'Private answer key exposed in scenario metadata');
 check(scenario.targets.every(id=>!scenario.nodes[id].fact),'Final target supplied as a fact');
 for(const requirement of requirements){
  check(requirement.any_of.length&&requirement.any_of.every(id=>scenario.nodes[id]&&!scenario.nodes[id].fact),'An obligation is already given or unknown: '+requirement.id);
  check(requirement.any_of.some(id=>known.has(id)),'Unreachable obligation: '+requirement.id);
 }
 const dispositions=c.dossiers.map(d=>{
  check(d.observations.length===5&&d.observations.every(id=>scenario.nodes[id]?.fact),'Observation boundary is incorrect');
  check(!scenario.facts.includes(d.report),'Reported allegation became a given fact');
  const outcomes=d.decision_options.filter(id=>known.has(id));check(outcomes.length===1,'Record has zero or conflicting dispositions');return outcomes[0];
 });
 check((!!c.hypothetical)===(c.config.difficulty==='stretch'),'Counterfactual level boundary incorrect');
 check(scenario.nodes.boundary_rule.fact&&!scenario.nodes.limits.fact,'Limit must be reasoned from the supplied brief');
 const attention=Object.keys(scenario.nodes).filter(id=>id.startsWith('attention_'));
 check(attention.length===(c.config.difficulty==='guided'?0:2),'Distractors do not match difficulty');
 check(scenario.rules.every(r=>r.premises.every(id=>!attention.includes(id))),'Repetition counts treated as independent evidence');
 if(c.config.context==='misconduct')check(/does not establish intent or misconduct/i.test(scenario.nodes.limits.label),'Misconduct decision overstates intent');
 else {check(!/alleges possible manipulation|independent investigation/.test(c.dossiers.map(d=>d.report).join(' ')),'Personal accusation leaked into an alternative setting');check(!/misconduct|manipulat|fabricat/i.test(c.concepts.join(' ')),'Debrief reintroduced an unchosen accusation theme');}
 return {known,dispositions,requirements:requirements.length,nodes:Object.keys(scenario.nodes).length,rules:scenario.rules.length};
}

export function challengeRoutes(scenario){
 const {known,dispositions}=inspectChallenge(scenario),requirements=scenario.challenge.requirements;
 const explicit=challengeClaim(requirements.map(r=>r.any_of.find(id=>known.has(id))));
 const compact=dispositions.map((decision,i)=>{
  const requirement=requirements.find(r=>r.id===`d${i+1}_reason`),route=requirement.support_routes.find(r=>r.decision===decision&&r.premises.every(id=>known.has(id)));
  check(route,'No honest compact support route');return challengeClaim([decision],{id:'c'+(i+1),premises:route.premises});
 });
 compact.push(challengeClaim(requirements.filter(r=>!/^d[12]_/.test(r.id)).map(r=>r.any_of.find(id=>known.has(id))),{id:'c3'}));
 return {explicit,compact,dispositions,grounded:groundedSteps(scenario,requirements.map(r=>r.any_of.find(id=>known.has(id))))};
}

export function matchesChallengeMeaning(claim,expected){
 const same=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every(p=>p.positive===true&&b.includes(p.id))&&new Set(a.map(p=>p.id)).size===b.length;
 return same(claim?.conclusions,expected.conclusions)&&same(claim?.assumptions,expected.assumptions||[])&&Array.isArray(claim?.depends_on)&&claim.depends_on.length===0;
}
