import {compile} from './compiler.js';
import {verifyFormal} from './local-api.js';
import {groundedArgument,groundedSteps} from './grounded-fixtures.js';
import {invalidatedPhases,contextResearchTopic} from './generation-workshop.js';
import {selectedDebateExchange} from './debate-exchange.js';
const assert=(value,message)=>{if(!value)throw Error(message);};
const literal=id=>({id,positive:true});
const claim=(conclusions,premises,id='v3-check')=>({id,kind:'step',domain:'theory',text:'Deterministic V3 feature fixture',mode:'assertion',conclusions:conclusions.map(literal),assumptions:premises.map(literal),depends_on:[]});
export function generationClosure(s){const known=new Set(Object.keys(s.nodes).filter(id=>s.nodes[id].fact));for(let i=0;i<=Object.keys(s.nodes).length;i++){const before=known.size;for(const r of s.rules)if(r.premises.every(p=>known.has(p)))known.add(r.conclusion);if(before===known.size)return known;}throw Error('V3 closure did not converge');}
export function inspectGeneration(s){
 const p=s.learning_task?.generation;assert(s.learning_task?.version==='learning-tasks-v3'&&p?.version==='evidence-transform-v1','V3 metadata missing');
 assert(Object.keys(s.nodes).length<=64,'V3 proposition bound exceeded');const known=generationClosure(s);assert(s.targets.every(id=>known.has(id)&&!s.nodes[id].fact),'A V3 target is unreachable or already given');
 assert(s.challenge.requirements.every(r=>r.any_of.some(id=>known.has(id))),'A V3 obligation is unreachable');
 assert(p.invariants.reachable_goals&&p.invariants.facts_unchanged&&p.invariants.drafts_excluded,'Missing transformation invariants');
 assert(JSON.stringify([...p.base_graph.facts].sort())===JSON.stringify([...p.problem_graph.facts].sort()),'Transformation changed facts');
 assert(p.base_digest!==p.transformed_digest&&p.operations.some(op=>op.kind==='split_warrant'),'Transformation did not change formal rules');
 for(const draft of p.draft_branches)assert(!s.rules.some(r=>r.conclusion===draft.conclusion&&JSON.stringify(r.premises)===JSON.stringify(draft.premises)),'Untrusted incomplete branch became a formal rule');
 return {known,plan:p};
}
export async function benchmarkGeneration({test,tools}){
 const make=config=>compile({op:'generate_task',config:{task_version:3,seed:'v3-feature-baseline',...config}});const samples=new Map();
 await test('V3 generation · canonical matrix, seeded transformations and reachable obligations',async()=>{
  tools();const modes=await(await fetch('/Experiment/data/task-options.json')).json(),options=await(await fetch('/Experiment/data/challenge-options.json')).json();let checked=0,maximumNodes=0;
  for(const task of Object.keys(modes))for(const context of Object.keys(options.contexts))for(const difficulty of Object.keys(options.difficulties)){
   const s=await make({task,context,difficulty,sensitive:['criminal','misconduct'].includes(context)});inspectGeneration(s);const again=await compile({op:'import',source:s.source_text});assert(again.source_hash===s.source_hash,'V3 canonical import changed source');maximumNodes=Math.max(maximumNodes,Object.keys(s.nodes).length);checked++;
  }return {checked,maximumNodes,scope:'Independent reachability, canonical imports and draft exclusion; not a natural-language or learning-outcome test'};
 });
 await test('V3 transfer · four correct methods and two grounded applications certified by both tools',async()=>{
  tools();for(let i=0;i<24&&samples.size<4;i++){const s=await make({task:'apply_reasoning',seed:'practice-'+i});samples.set(s.learning_task.practice,s);}assert(samples.size===4,'Practice seed coverage lacks four methods');
  const evidence=[];for(const [method,s]of samples){const t=s.learning_task.transfer;assert(t.applications.length===2&&[t.method,...t.applications,t.completion].every(id=>s.targets.includes(id)),'Method-specific endpoints absent');assert(s.learning_task.example_case.method,'Apply hides its method');const analysis=await make({...s.learning_task.config,task:'analysis'});assert(!analysis.learning_task.example_case.method&&analysis.learning_task.transfer.practice===method,'Analysis names or changes its inferred method');
   const input=groundedArgument(s,[t.method,...t.applications]);assert(input.assumptions.length<=12,'Transfer fixture exceeds ordinary player bounds');input.text='My stated example and record observations justify this method and both applications.';const certificate=await verifyFormal(input,[],s);assert(certificate.status==='verified'&&certificate.engines.coq.status==='verified','Correct method application lacks a real certificate');
   const complete=await compile({op:'goal',scenario:s,accepted:groundedSteps(s,s.targets)});assert(complete.status==='candidate','A complete grounded route does not meet V3 obligations');assert((await compile({op:'goal',scenario:s,accepted:[input]})).status==='not_discovered','Method applications alone skipped record recommendations');
   evidence.push({method,applications:t.applications,proof:certificate.status,kernel:certificate.engines.coq.status});
  }return {methods:evidence,scope:'Real Prolog and Rocq certificates for deterministic grounded structures; semantic interpretation is tested separately'};
 });
 await test('V3 transfer · wrong method and generic recommendation cannot satisfy the task',async()=>{
  tools();if(samples.size<4)for(let i=0;i<24&&samples.size<4;i++){const s=await make({task:'apply_reasoning',seed:'practice-'+i});samples.set(s.learning_task.practice,s);}assert(samples.size===4,'Negative transfer checks lack four practice samples');const evidence=[];
  for(const [method,s]of samples){const t=s.learning_task.transfer,known=generationClosure(s);assert(t.wrong_methods.every(id=>!known.has(id)),'Wrong method is derivable');const wrong=claim([t.wrong_methods[0]],['task_example'],'wrong-'+method),generic=claim([t.completion],['recommendation','task_example'],'generic-'+method);
   for(const input of [wrong,generic]){const compiled=await compile({op:'compile',scenario:s,accepted:[],claim:input});assert(compiled.graph.epistemic.grounded===false,'An incorrect/generic method claim became grounded');const proof=await verifyFormal(input,[],s);assert(proof.status==='unsupported','Formal explicit-support gate accepted an incorrect/generic method');assert((await compile({op:'goal',scenario:s,accepted:[input]})).status==='not_discovered','An incorrect/generic method completed the task');}
   const ordinary=groundedSteps(s,s.targets).filter(c=>c.conclusions.every(p=>!p.id.startsWith('task_')));assert((await compile({op:'goal',scenario:s,accepted:ordinary})).status==='not_discovered','A correct recommendation alone skipped transfer obligations');evidence.push({method,wrongMethodRejected:true,genericShortcutRejected:true,recommendationAloneIncomplete:true});
  }return evidence;
 });
 await test('V3 generation · independent graph, narrative and context phase regeneration',async()=>{
  tools();const c={task:'analysis',seed:'phase-isolation',transformation_seed:'base-transform'},a=await make(c),b=await make({...c,transformation_seed:'new-transform'}),n=await make({...c,narrative_seed:'new-story',interest:'Doctor Who',character:'Noor',place:'Quiet archive',mood:'calm',exposition:'I review a fictional archive in a quiet room.'}),notes=await make({...c,source_url:'https://example.org/context',source_notes:'Context notes must not establish claims.'});const ga=inspectGeneration(a).plan,gb=inspectGeneration(b).plan,gn=inspectGeneration(n).plan,gc=inspectGeneration(notes).plan;
  assert(ga.base_digest===gb.base_digest,'Transformation changed the base structure');assert(ga.base_digest===gn.base_digest&&ga.transformed_digest===gn.transformed_digest,'Narrative changed the graph');assert(ga.base_digest===gc.base_digest&&ga.transformed_digest===gc.transformed_digest,'Context source changed the graph');assert(a.description!==n.description,'Personalised exposition was not delivered');assert(!Object.values(notes.nodes).some(node=>node.label.includes('Context notes must')),'Source notes gained premise authority');
  const digests=new Set();for(let i=0;i<8;i++)digests.add((await make({...c,transformation_seed:'transform-'+i})).learning_task.generation.transformed_digest);assert(digests.size>1,'Transformation seed does not vary operations');
  assert(JSON.stringify(invalidatedPhases('transformation_seed'))==='[1,4]'&&JSON.stringify(invalidatedPhases('exposition'))==='[3,4]','Phase invalidation erased independent stages');const query=contextResearchTopic({subject:'Criminology',task:'Investigation',context:'Criminal investigation'});assert(query==='Criminology · Investigation · Criminal investigation','Research did not combine selected settings');return {transformations:digests.size,baseRetained:true,narrativeGraphRetained:true,contextGraphRetained:true,exactQuery:query};
 });
 await test('V3 generation · full comparison discipline catalogue and explicit adult theme consent',async()=>{
  tools();const catalogue=await(await fetch('/Experiment/data/subject-options.json')).json();let checked=0;for(const [code,item]of Object.entries(catalogue.subjects)){const s=await make({task:'analysis',second_subject:item.area,second_discipline:code});assert(s.learning_task.example_case.discipline===code&&s.learning_task.example_case.title.includes(item.label),'Comparison discipline was dropped: '+code);checked++;}
  let rejected=false;try{await make({task:'analysis',second_subject:'science',second_discipline:'CS'});}catch{rejected=true;}assert(rejected,'Comparison pathway mismatch was accepted');
  for(const c of [{context:'misconduct',content_range:'adult_professional'},{context:'exhibition',content_range:'adult_professional',sensitive:true}]){let blocked=false;try{await make(c);}catch{blocked=true;}assert(blocked,'Adult theme bypassed consent or neutral-setting boundary');}
  const adult=await make({context:'misconduct',content_range:'adult_professional',sensitive:true});assert(adult.challenge.content_preview.includes('Adult professional themes')&&adult.challenge.content_preview.includes('Allegations remain unproved'),'Adult range has no clear content notice');return {catalogueEntries:checked,mismatchRejected:true,adultConsentRequired:true,neutralPreserved:true};
 });
 await test('V3 generation · varied argument pairs and verified-objection-dependent opponent turns',async()=>{
  tools();const argumentsSeen=new Set(),testimonySeen=new Set();for(let i=0;i<16;i++){const evaluation=await make({task:'evaluate',seed:'pair-'+i});argumentsSeen.add(evaluation.learning_task.argument_variant);assert(evaluation.learning_task.arguments.length===2,'Argument pair missing');const debate=await make({task:'debate',seed:'exchange-'+i}),d=debate.learning_task.debate;testimonySeen.add(d.opponent);assert(d.exchanges.length===2,'Specific objection branches missing');assert(selectedDebateExchange(d,new Set())===null,'An unvisited objection selected an opponent response');for(const exchange of d.exchanges)assert(selectedDebateExchange(d,new Set([exchange.objection]))===exchange,'Opponent response did not match the grounded objection');}
  assert(argumentsSeen.size===4&&testimonySeen.size===2,'Seeded argument or testimony diversity missing');return {argumentPairs:argumentsSeen.size,stageOneTestimonies:testimonySeen.size,unvisitedResponsesExcluded:true};
 });
}
