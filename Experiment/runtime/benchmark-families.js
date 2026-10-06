import {groundedSteps} from './grounded-fixtures.js';

const check=(value,message)=>{if(!value)throw Error(message);};
export const FAMILY_IDS=Object.freeze(['proof-direct','proof-induction','proof-contradiction','proof-contrapositive','proof-cases','proof-hott','time-observatory','time-clockwork','philosophy-gettier','philosophy-theseus','forensic-pitchfork','misconduct-stapel','szemeredi-combinatorial','szemeredi-ergodic','szemeredi-gowers','szemeredi-hypergraph','szemeredi-inverse','szemeredi-density-hales-jewett']);

export function familyClosure(scenario,excluded=[]){
 const blocked=new Set(excluded),known=new Set(Object.entries(scenario.nodes).filter(([id,n])=>n.fact&&!blocked.has(id)).map(([id])=>id));
 for(let i=0;i<=Object.keys(scenario.nodes).length;i++){
  const size=known.size;for(const rule of scenario.rules)if(rule.premises.every(p=>known.has(p)))known.add(rule.conclusion);
  if(size===known.size)return known;
 }
 throw Error('Family proof closure did not converge within its finite bound.');
}

export function inspectFamily(scenario){
 check(FAMILY_IDS.includes(scenario.id),'Not an attributed family fixture');
 check(scenario.domain==='theory'&&scenario.custom,'Missing standalone Boolean locale');
 check(scenario.revision==='problem-only-v1'&&scenario.activity_revision==='attributed-routes-v1','Activity cannot use the current gameplay contract');
 check(typeof scenario.verification_scope==='string'&&scenario.verification_scope.length>20,'Missing honest verification scope');
 check(scenario.references?.length&&scenario.references.every(r=>r.title&&r.authors&&r.year&&r.scope&&/^https:\/\//.test(r.url)),'Missing attributed primary-source references');
 check(scenario.argumentation_concepts?.length>=3&&scenario.argumentation_concepts.every(s=>typeof s==='string'&&s.includes(':')),'Missing method-specific reflective concepts');
 check(Object.keys(scenario.nodes).length<=40&&scenario.rules.length<=80,'Activity exceeds custom compiler bounds');
 check(scenario.rules.every(r=>r.premises.length&&scenario.nodes[r.conclusion]&&r.premises.every(p=>scenario.nodes[p])),'Unknown or empty rule');
 const plain=scenario.source_text.replace(/\(\*[\s\S]*?\*\)/g,'');
 check(!/Draft Attempt|Attempted solution/i.test(scenario.source_text)&&!/^\s*(?:lemma|theorem|ML|axiomatization)\b/im.test(plain),'Activity exposes an author proof or executable command');
 const closure=familyClosure(scenario);
 check(scenario.targets.length>0&&scenario.targets.every(p=>scenario.nodes[p]&&!scenario.nodes[p].fact&&closure.has(p)),'Goal is given, unknown or unreachable');
 check(Object.keys(scenario.nodes).some(p=>scenario.nodes[p].fact&&scenario.targets.some(t=>!familyClosure(scenario,[p]).has(t))),'No required fact influences the conclusion');
 if(['forensic-pitchfork','misconduct-stapel'].includes(scenario.id))check(scenario.content_sensitive===true&&scenario.content_note,'Real case bypasses theme choice');
 if(scenario.id.startsWith('szemeredi-'))check(/not a complete formal proof/i.test(scenario.verification_scope)&&/no claim to enumerate every possible proof/i.test(scenario.verification_scope),'Szemerédi activity overclaims its certificate');
 if(scenario.id==='proof-hott')check(scenario.nodes.univalence_axiom.fact&&!familyClosure(scenario,['univalence_axiom']).has('type_path'),'Univalence treated as derived from path induction');
 return {id:scenario.id,nodes:Object.keys(scenario.nodes).length,rules:scenario.rules.length,targets:scenario.targets.length,references:scenario.references.length,reflectionConcepts:scenario.argumentation_concepts.length};
}

export async function benchmarkFamilies({test,tools}){
 const [{compile},{scenarios,verifyFormal}]=await Promise.all([import('./compiler.js'),import('./local-api.js')]);
 const library=await scenarios(),families=FAMILY_IDS.map(id=>library.find(s=>s.id===id));
 await test('Attributed families · catalogue, references and honest proof scopes',async()=>{
  check(families.every(Boolean),'One or more requested scenario families are missing');
  const results=families.map(inspectFamily);
  check(library.find(s=>s.id==='two-guards')?.references?.length,'Classic guard puzzle lacks attribution');
  check(library.find(s=>s.id==='sqrt-two')?.references?.length,'Classic irrationality problem lacks attribution');
  for(const s of library.filter(s=>s.id.startsWith('murder-')||s.id==='legal'))check(s.attribution&&!s.references?.length,'Provided fictional theory has invented real-case credit');
  return {activities:results,catalogue:library.length,scope:'Catalogue and independent Horn invariants; real inference is checked separately.'};
 });
 await test('Attributed families · canonical imports and author-attempt boundary',async()=>{
  tools();let imports=0;
  for(const scenario of families){
   check(scenario,'Missing family fixture');
   const imported=await compile({op:'import',source:scenario.source_text});
   check(imported.id===scenario.id&&imported.source_hash===scenario.source_hash&&JSON.stringify(imported.references)===JSON.stringify(scenario.references)&&imported.verification_scope===scenario.verification_scope&&JSON.stringify(imported.argumentation_concepts)===JSON.stringify(scenario.argumentation_concepts),'Scope, credit or reflective concepts changed on import: '+scenario.id);
   const poisoned=await compile({op:'import',source:scenario.source_text+'\n(* Draft Attempt *)\naxiomatization where leaked_answer: "False"\n'});
   check(poisoned.source_hash===scenario.source_hash&&JSON.stringify(poisoned.nodes)===JSON.stringify(scenario.nodes)&&JSON.stringify(poisoned.rules)===JSON.stringify(scenario.rules)&&!poisoned.source_text.includes('leaked_answer'),'Author attempt gained authority: '+scenario.id);
   imports+=2;
  }
  return {imports,activities:families.length,scope:'Bundled identities retain citation and scope; unexecuted draft material has no logical authority.'};
 });
 await test('Temporal puzzles · real infinite-lasso evaluator and counterexamples',async()=>{
  tools();const results=[];
  for(const scenario of families.filter(s=>s?.temporal_model))for(const query of scenario.temporal_model.queries){
   const r=await compile({op:'temporal-inspect',scenario,query_id:query.id});
   check(r.holds===query.expected&&r.id===query.id&&r.model_hash&&r.evidence.path.length,'Temporal projection disagrees with its trace: '+query.id);
   check(r.scope.includes('not a Rocq or Isabelle'),'Trace evaluator presents itself as a kernel certificate');
   results.push({scenario:scenario.id,query:query.id,holds:r.holds,evidence:r.evidence});
  }
  check(results.length===9&&results.some(r=>r.holds)&&results.some(r=>!r.holds),'Temporal positive/negative coverage is incomplete');
  const counterexample=results.find(r=>r.query==='always_signal');check(counterexample.evidence.counterexample_state===0,'Always counterexample is missing');
  const next=results.find(r=>r.query==='next_signal');check(next.evidence.witness_state===1,'Next witness is wrong');
  const repeat=results.find(r=>r.query==='infinitely_often_open'),stable=results.find(r=>r.query==='eventually_always_open');check(repeat.holds&&!stable.holds,'Recurrence and permanence were conflated');
  const altered=structuredClone(families.find(s=>s.id==='time-observatory'));altered.temporal_model.states[1].signal=false;
  let rejected=false;try{await compile({op:'temporal-inspect',scenario:altered,query_id:'next_signal'});}catch{rejected=true;}check(rejected,'Tampered trace retained a stale reviewed answer');
  return {queries:results,scope:'Real local infinite-lasso calculation. The evaluator is not a kernel proof; formal dependency certificates are separate.'};
 });
 for(const scenario of families){
  await test('Attributed family certified by both tools · '+(scenario?.title||'missing fixture'),async()=>{
   tools();check(scenario,'Family missing');const accepted=[],steps=groundedSteps(scenario);
   for(const claim of steps){
    const r=await verifyFormal(claim,accepted,scenario,{cache:false});
    check(r.status==='verified'&&r.engines.prolog.status==='verified'&&r.engines.coq.status==='verified'&&r.graph.epistemic.grounded,'Grounded family step failed: '+scenario.id+'/'+claim.id+' '+JSON.stringify(r.engines));accepted.push(claim);
   }
   const candidate=await compile({op:'goal',accepted,scenario});check(candidate.status==='candidate','Complete grounded argument did not reach the goal');
   const certified=await verifyFormal(candidate.compiled.claim,accepted,scenario,{cache:false});check(certified.status==='verified'&&certified.engines.coq.status==='verified','Family goal lacks real kernel certificate');
   const first=steps[0],missing={...first,id:'missing',assumptions:[],depends_on:[],text:'My answer without the required support'};
   const ungrounded=await verifyFormal(missing,[],scenario,{cache:false});check(ungrounded.status!=='verified'&&!ungrounded.graph.epistemic.grounded,'Unexplained answer was rescued by background scenario facts');
   check((await compile({op:'goal',accepted:[],scenario})).status==='not_discovered','Unvisited family completed');
   if(scenario.targets.length>1){const partial=accepted.filter(c=>c.conclusions.every(p=>p.id!==scenario.targets.at(-1)));check((await compile({op:'goal',accepted:partial,scenario})).status==='not_discovered','Missing final obligation completed the activity');}
   const reflection=await compile({op:'review',session:{scenario,claims:accepted,history:[],solution:null}});
   check(JSON.stringify(reflection.concepts)===JSON.stringify(scenario.argumentation_concepts)&&reflection.transfer===scenario.debrief&&reflection.overview.length===accepted.length,'Family debrief lost its route, concepts or transfer question');
   return {id:scenario.id,groundedSteps:steps.length,goal:'Prolog and Rocq certified',missingSupport:ungrounded.status,scope:scenario.verification_scope,naturalLanguageAccuracy:'Not measured by these deterministic formal fixtures.'};
  });
 }
}
