import {compile} from './compiler.js';
import {verifyFormal,localApi} from './local-api.js';
import {groundedSteps} from './grounded-fixtures.js';
const check=(ok,msg)=>{if(!ok)throw Error(msg);};
export async function benchmarkGrounding({test,tools}){
 await test('Learner scope · hypothetical, backward and bare answers cannot complete',async()=>{
  tools();const s=await compile({op:'tutorial'}),route=groundedSteps(s),accepted=[];
  for(const [i,c]of route.entries()){
   const conditional={...c,id:'h'+i,mode:'conditional',text:'Assuming these premises, my conclusion follows.'},r=await verifyFormal(conditional,accepted,s);
   check(r.status==='verified'&&!r.graph.epistemic.grounded,'Hypothesis became established');accepted.push(conditional);
  }
  check((await compile({op:'goal',accepted,scenario:s})).status==='not_discovered','Hypotheses completed');
  const bare={...route.at(-1),id:'bare',assumptions:[],depends_on:[],text:'My final answer'};
  check((await verifyFormal(bare,[],s)).status==='unsupported','Bare answer acquired unstated support');
  const backward={...route.at(-1),mode:'backward',text:'Working backwards, I need to establish these premises.'};
  check(!(await verifyFormal(backward,[],s)).graph.epistemic.grounded,'Subgoal became knowledge');
  const grounded=[];for(const c of route){const r=await verifyFormal(c,grounded,s);check(r.status==='verified'&&r.graph.epistemic.grounded,'Grounded argument rejected');grounded.push(c);}
  const goal=await compile({op:'goal',accepted:grounded,scenario:s});check(goal.status==='candidate','Grounded argument did not cover goal');check((await verifyFormal(goal.compiled.claim,grounded,s)).status==='verified','Goal certificate rejected');
  return {hypotheticalSteps:accepted.length,groundedSteps:grounded.length,goal:'certified'};
 });
 await test('Learner scope · self-support and conflicting premises',async()=>{
  tools();const s=await compile({op:'tutorial'}),c=groundedSteps(s)[0],self={...c,assumptions:c.conclusions};check(!(await verifyFormal(self,[],s)).graph.epistemic.grounded,'Self-support grounded');
  let rejected=false;try{await verifyFormal({...c,assumptions:[c.assumptions[0],{...c.assumptions[0],positive:false}]},[],s);}catch{rejected=true;}check(rejected,'Contradictory premises accepted');
 });
 await test('Guard wording · three human-review cases preserve scope and polarity',async()=>{
  tools();const s=(await localApi('/api/scenarios')).scenarios.find(s=>s.id==='two-guards'),session=await localApi('/api/session',{scenario:s}),outputs=[];
  const inputs=['If I ask the truthteller "Would the other guard say this door is safe?", they would respond "Yes" if the door is unsafe.','If I ask the truthteller "Is this door safe?", they would respond "Yes" if and only if the door is safe.','If the asked guard tells the truth and their door is safe, they would answer "No" to "Would the other guard say this door is safe?"'];
  for(const [i,text] of inputs.entries()){
   const interpreted=await localApi('/api/interpret',{session_id:session.session_id,text,grouping:'together'}),c=interpreted.interpretation?.graph;check(c&&interpreted.candidate_id,'Input did not reach review');check(c.assumptions.length===(i===1?1:2),'Scope changed');check(c.conclusion.op===(i===1?'iff':i===2?'not':'answer'),'Polarity changed');
   const r=await localApi('/api/verify',{session_id:session.session_id,candidate_id:interpreted.candidate_id});check(r.status==='verified'&&!r.progress.solved,'Case rejected or completed without strategy');outputs.push(c);
  }return outputs;
 });
 await test('Learning tasks · eight solvable formats, reproducible imports and answer-only boundary',async()=>{
  tools();const modes=await(await fetch('/Experiment/data/task-options.json')).json(),subjects=await(await fetch('/Experiment/data/subject-options.json')).json(),summaries=[];check(Object.keys(subjects.subjects).length===79,'Subject snapshot missing');
  for(const task of Object.keys(modes)){
   const s=await compile({op:'generate_task',config:{seed:'task-contract-2026',task,subject:'researcher',context:'exhibition',difficulty:'guided'}}),imported=await compile({op:'import',source:s.source_text});check(JSON.stringify(imported.nodes)===JSON.stringify(s.nodes),'Import changed facts');check(s.targets.every(id=>!s.nodes[id].fact),'Answer leaked');
   const route=groundedSteps(s),bare={id:'bare',text:'My answer',conclusions:[{id:s.targets.at(-1),positive:true}],assumptions:[],depends_on:[]},r=await verifyFormal(bare,[],s);check((r.status==='verified'&&r.graph.epistemic.grounded)===(task==='identify_solution'),'Answer-only contract leaked');
   const accepted=[];for(const c of route){const result=await verifyFormal(c,accepted,s);check(result.status==='verified'&&result.graph.epistemic.grounded,'Route failed: '+task);accepted.push(c);}
   const goal=await compile({op:'goal',accepted,scenario:s});check(goal.status==='candidate','Unsolvable: '+task);check((await verifyFormal(goal.compiled.claim,accepted,s)).status==='verified','Goal certificate rejected');summaries.push({task,steps:route.length,stages:s.journey?3:1});
  }return {formats:summaries,subjectLabels:79};
 });
}
