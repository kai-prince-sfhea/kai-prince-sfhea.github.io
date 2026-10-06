// Formal fixtures and independent preset meanings. Never injected into gameplay.
export function groundedSteps(scenario,targets=scenario.targets){
 const known=new Set(Object.entries(scenario.nodes).filter(([,n])=>n.fact).map(([id])=>id)),proof=new Map();
 for(let i=0;i<Object.keys(scenario.nodes).length;i++)for(const rule of scenario.rules){if(!known.has(rule.conclusion)&&rule.premises.every(p=>known.has(p))){known.add(rule.conclusion);proof.set(rule.conclusion,rule);}}
 const used=new Set(),steps=[];
 function visit(id){if(used.has(id)||scenario.nodes[id].fact)return;used.add(id);const rule=proof.get(id);if(!rule)throw Error('Unreachable fixture target '+id);rule.premises.forEach(visit);steps.push({kind:'step',domain:'theory',id:'c'+(steps.length+1),text:scenario.nodes[id].label+' because '+rule.premises.map(p=>scenario.nodes[p].label).join('; and that ')+'.',mode:'assertion',conclusions:[{id,positive:true}],assumptions:rule.premises.map(id=>({id,positive:true})),depends_on:[]});}
 targets.forEach(visit);return steps;
}

// A complete compact argument may cite the actual given leaves directly.
// Intermediate deductions are not silently credited as learner statements.
export function groundedArgument(scenario,targets=scenario.targets){
 const steps=groundedSteps(scenario,targets),given=new Set();
 for(const c of steps)for(const p of c.assumptions)if(scenario.nodes[p.id].fact)given.add(p.id);
 return {kind:'step',domain:'theory',id:'compact',mode:'assertion',text:'My compact argument',conclusions:targets.map(id=>({id,positive:true})),assumptions:[...given].map(id=>({id,positive:true})),depends_on:[]};
}
