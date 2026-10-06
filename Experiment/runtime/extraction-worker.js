import {PROPOSAL_LABELS,PROPOSAL_INTENTS,PROPOSAL_RELATIONS,PROPOSAL_ATTRIBUTES,validateProposal} from './extraction-proposal.js';
let runtime=null,loading=null,currentId=0;
const phase=message=>postMessage({id:currentId,phase:message});
async function load(){
 if(runtime)return runtime;if(loading)return loading;
 loading=(async()=>{
  phase('Checking installed multilingual encoder assets');
  const {EXTRACTION_FILES,EXTRACTION_CACHE,EXTRACTION_BASE,EXTRACTION_MODEL,extractionStatus}=await import('./extraction-assets.js');
  if(!(await extractionStatus()).ready)throw Error('Install the GLiNER 2.5 Multi pack. The legacy English pack is not compatible.');
  const cache=await caches.open(EXTRACTION_CACHE),allowed=new Set(EXTRACTION_FILES.map(f=>f.local));
  const {AutoTokenizer,env}=await import('../vendor/transformers/transformers.min.js');
  env.allowRemoteModels=false;env.allowLocalModels=true;env.useBrowserCache=false;env.useFSCache=false;env.useCustomCache=true;env.localModelPath=EXTRACTION_BASE.href;
  env.customCache={match:async request=>{const key=typeof request==='string'?request:request.url;if(!allowed.has(key))return undefined;return (await cache.match(key))??undefined;},put:async()=>{throw Error('Unverified extraction cache write');}};
  phase('Loading the local multilingual tokenizer');
  const tokenizer=await AutoTokenizer.from_pretrained('extraction-model');
  const ort=await import('../vendor/extraction/ort.wasm.bundle.min.mjs');
  ort.env.wasm.wasmPaths=new URL('../vendor/extraction/',import.meta.url).href;ort.env.wasm.numThreads=1;ort.env.wasm.proxy=false;
  const session=async file=>{const url=new URL('extraction-model/onnx/'+file,EXTRACTION_BASE).href,response=await cache.match(url),entry=EXTRACTION_FILES.find(f=>f.local===url);if(!entry||!response||response.headers.get('X-Thread-SHA256')!==entry.sha256)throw Error('A verified encoder file is missing: '+file);const bytes=await response.arrayBuffer();return ort.InferenceSession.create(bytes,{executionProviders:['wasm'],graphOptimizationLevel:'all'});};
  phase('Loading GLiNER 2.5 Multi · one CPU thread');
  const main=await session('model.onnx'),heads=await session('heads.onnx'),records=await session('records.onnx'),attrs=await session('attrs.onnx');
  const required=['pair_logits','pair_indices','pair_valid','cls_logits','text_states','query_states','candidate_states','rel_role_states'];
  if(required.some(name=>!main.outputNames.includes(name)))throw Error('The installed encoder does not expose the pinned structured-head contract.');
  const {GlinerBoundaryRuntime,decodeEntitiesV2,iterWordChunks,sigmoid}=await import('../vendor/extraction/gliner-boundary.mjs');
  const {collectLatticeMentions,proposeRelationPairs,beamSearchRelations,decodeAssignedRecords}=await import('../vendor/extraction/joint-ie.mjs');
  runtime={rt:new GlinerBoundaryRuntime({ort,session:main,headsSession:heads,recordsSession:records,attrsSession:attrs,tokenize:token=>Array.from(tokenizer.encode(token,{add_special_tokens:false}))}),decodeEntitiesV2,iterWordChunks,sigmoid,collectLatticeMentions,proposeRelationPairs,beamSearchRelations,decodeAssignedRecords,metadata:EXTRACTION_MODEL};
  return runtime;
 })();try{return await loading;}finally{loading=null;}
}
function descriptionsFrom(examples){
 const descriptions={conclusion:'The claim that the player wants to establish.', 'supporting reason':'A premise explicitly used to support the conclusion.',condition:'A hypothetical antecedent or condition, not an established fact.',negation:'A linguistic cue that negates a proposition.',question:'A question that the player proposes asking.', 'door choice':'A proposed action choosing a door.', 'rule reference':'An exact written reference to a supplied fact, rule or previous reasoning step.',counterexample:'An explicitly stated case that would contradict a general claim.'};
 // Schema retrieval is untrusted metadata. It cannot add labels or formal facts.
 for(const example of (Array.isArray(examples)?examples:[]).slice(0,5))for(const [label,value] of Object.entries(example.descriptions??(example.label?{[example.label]:example.description}:{})))if(PROPOSAL_LABELS.includes(label)&&typeof value==='string'&&value.length<=240)descriptions[label]=value;
 return descriptions;
}
async function propose(text,schemaExamples,references){
 const loaded=performance.now(),r=await load(),loadSeconds=(performance.now()-loaded)/1000,descriptions=descriptionsFrom(schemaExamples),labels=[...PROPOSAL_LABELS],packedLabels=[...labels,...PROPOSAL_ATTRIBUTES];
 const selectedSchemas=(Array.isArray(schemaExamples)?schemaExamples:[]).filter(e=>typeof e.id==='string'&&typeof e.text==='string').slice(0,2).map(e=>({id:e.id.slice(0,64),text:e.text.slice(0,240)}));
 const parent='player reasoning'+(selectedSchemas.length?' [DESCRIPTION] Relevant extraction examples: '+selectedSchemas.map(e=>e.text).join(' '):'');
 const {chunks}=r.iterWordChunks(text,{chunkSize:120,chunkOverlap:24,maxWords:4096});
 if(chunks.length>24)throw Error('Input requires too many encoder windows; use full Gemma interpretation.');
 const raw={model:r.metadata.model,revision:r.metadata.revision,mentions:[],relationships:[],records:[],attributes:[],classification:null,windows:[],issues:[],schemaExamples:selectedSchemas.map(e=>e.id),capabilities:{multilingual:true,entities:true,classification:true,relations:true,records:true,attributes:true},timing:{loadSeconds,encoderSeconds:0,relationSeconds:0,recordSeconds:0,attributeSeconds:0,windows:chunks.length}};
 if(chunks.length>1)raw.issues.push('Input is chunked. Relationships crossing window boundaries are unresolved; full-source refinement is required.');
 for(let i=0;i<chunks.length;i++){
  const chunk=chunks[i];phase(`Extracting structured proposal · window ${i+1} of ${chunks.length}`);
  let tick=performance.now();const marg=await r.rt.computeMarginals(chunk.text,packedLabels,{maxWords:128,parent,descriptions,relations:PROPOSAL_RELATIONS,classification:{task:'player intent',labels:PROPOSAL_INTENTS}});raw.timing.encoderSeconds+=(performance.now()-tick)/1000;
  if(!marg.pairLogits)throw Error('Encoder boundary outputs are unavailable.');
  const mentions=r.decodeEntitiesV2({pairIndices:marg.pairIndices,pairLogits:marg.pairLogits,pairValid:marg.pairValid,candidateCount:marg.candidateCount,labels,wordOffsets:marg.words,text:marg.normalized,threshold:.45});
  tick=performance.now();const lattice=r.collectLatticeMentions(marg,{argumentThreshold:.25}).filter(m=>labels.includes(m.label)),pairs=r.proposeRelationPairs(lattice,PROPOSAL_RELATIONS,{headsPerType:8,tailsPerType:8,pairCap:32}),relations=r.beamSearchRelations(await r.rt.scoreRelations(marg,pairs),{beamWidth:8,threshold:.55}).relations;raw.timing.relationSeconds+=(performance.now()-tick)/1000;
  // Relation endpoints may come from the broader lattice. Preserve their exact
  // span records rather than silently deleting edges absent from flat NER.
  // Preserve the decoder surface for validation. Replacing it with a slice of
  // the caller's text would conceal offset bugs or synthetic terminal periods.
  const mapSpan=m=>({...m,start:m.start+chunk.origin,end:m.end+chunk.origin,text:m.text});
  const originalScore=m=>lattice.find(v=>v.label===m.label&&v.start===m.start&&v.end===m.end)?.score??0;
  raw.mentions.push(...mentions.map(mapSpan));for(const edge of relations){const head=mapSpan({...edge.head,score:originalScore(edge.head)}),tail=mapSpan({...edge.tail,score:originalScore(edge.tail)});raw.mentions.push(head,tail);raw.relationships.push({...edge,head,tail});}
  const parsed=packedLabels.map(name=>({name,dtype:name==='conclusion'?'str':'list',anchor:name==='conclusion'}));
  tick=performance.now();const scored=await r.rt.scoreRecords(marg,parsed,{threshold:.5});raw.timing.recordSeconds+=(performance.now()-tick)/1000;
  if(scored){const toItem=m=>mapSpan(m),records=r.decodeAssignedRecords({parent:'claims',parsed,instSlots:scored.instSlots,assign:scored.assign,marg,toItem,anchor:scored.anchor}).claims??[];for(const record of records){for(const value of Object.values(record))raw.mentions.push(...(Array.isArray(value)?value:value?[value]:[]));raw.records.push(record);}}
  const scopeMentions=mentions.filter(m=>['conclusion','condition','supporting reason'].includes(m.label)).slice(0,16);
  tick=performance.now();await r.rt.scoreExplicitAttributes(chunk.text,scopeMentions,PROPOSAL_ATTRIBUTES,{marg,queryOffset:labels.length,multiLabel:true});raw.timing.attributeSeconds+=(performance.now()-tick)/1000;
  for(const m of scopeMentions)for(const [label,score] of Object.entries(m.attributeScores??{}))if(score>=.5)raw.attributes.push({mention:mapSpan(m),label,score});
  const scores=(marg.clsLogits??[]).map(r.sigmoid);let best=0;for(let j=1;j<scores.length;j++)if(scores[j]>scores[best])best=j;const cls={label:PROPOSAL_INTENTS[best],score:scores[best]??0};if(!raw.classification||cls.score>raw.classification.score)raw.classification=cls;
  raw.windows.push({start:chunk.origin,end:chunk.origin+chunk.text.length,words:chunk.wordEnd-chunk.wordStart});
 }
 return validateProposal(text,raw,references);
}
async function adapterControl(){
 const began=performance.now(),r=await load(),loaded=(performance.now()-began)/1000,cases=[];
 const run=async(id,text,task,expected)=>{phase('Native adapter control · '+id);const tick=performance.now(),output=await task(text);cases.push({id,text,seconds:(performance.now()-tick)/1000,expected,output});};
 const entities=async(text,labels)=>{const marg=await r.rt.computeMarginals(text,labels);return r.decodeEntitiesV2({pairIndices:marg.pairIndices,pairLogits:marg.pairLogits,pairValid:marg.pairValid,candidateCount:marg.candidateCount,labels,wordOffsets:marg.words,text:marg.normalized,threshold:.45});};
 await run('native-entities-en','Tim Cook leads Apple in Cupertino.',text=>entities(text,['person','organization','location']),{person:'Tim Cook',organization:'Apple',location:'Cupertino'});
 await run('native-entities-es','Ana trabaja en Madrid.',text=>entities(text,['person','location']),{person:'Ana',location:'Madrid'});
 await run('native-classification','I dislike this product. It is awful.',text=>r.rt.classify(text,'sentiment',['positive','negative','neutral']),{label:'negative'});
 await run('native-relations','Tim Cook leads Apple.',async text=>{const spec={leads:{head:['person'],tail:['organization']}},marg=await r.rt.computeMarginals(text,['person','organization'],{relations:spec}),mentions=r.collectLatticeMentions(marg,{argumentThreshold:.25}),pairs=r.proposeRelationPairs(mentions,spec,{headsPerType:8,tailsPerType:8,pairCap:32});return {mentions,relations:r.beamSearchRelations(await r.rt.scoreRelations(marg,pairs),{beamWidth:8,threshold:.55}).relations};},{head:'Tim Cook',type:'leads',tail:'Apple'});
 await run('native-records','MacBook Pro costs $1999 and has a Liquid Retina display.',async text=>{const parsed=[{name:'name',dtype:'str',anchor:true},{name:'price',dtype:'list'},{name:'features',dtype:'list'}],marg=await r.rt.computeMarginals(text,parsed.map(p=>p.name),{parent:'product'}),scored=await r.rt.scoreRecords(marg,parsed,{threshold:.5});return scored?r.decodeAssignedRecords({parent:'product',parsed,instSlots:scored.instSlots,assign:scored.assign,marg,toItem:m=>m,anchor:scored.anchor}):{product:[]};},{name:'MacBook Pro',price:'$1999',features:'Liquid Retina display'});
 await run('native-attributes','The iPhone camera is awful.',async text=>{const labels=['negative','neutral','positive','product'],marg=await r.rt.computeMarginals(text,labels),mentions=r.decodeEntitiesV2({pairIndices:marg.pairIndices,pairLogits:marg.pairLogits,pairValid:marg.pairValid,candidateCount:marg.candidateCount,labels,wordOffsets:marg.words,text:marg.normalized,threshold:.45}).filter(m=>m.label==='product');await r.rt.scoreExplicitAttributes(text,mentions,labels.slice(0,3),{marg,queryOffset:0,multiLabel:false});return mentions;},{product:'iPhone',attribute:'negative'});
 await run('reason-entity-only','The archive is accessible because my permit is valid.',async text=>{const labels=[...PROPOSAL_LABELS],marg=await r.rt.computeMarginals(text,labels,{parent:'player reasoning',descriptions:descriptionsFrom([])});return r.decodeEntitiesV2({pairIndices:marg.pairIndices,pairLogits:marg.pairLogits,pairValid:marg.pairValid,candidateCount:marg.candidateCount,labels,wordOffsets:marg.words,text:marg.normalized,threshold:.45});},{reason:'permit is valid',conclusion:'archive is accessible'});
 return {at:new Date().toISOString(),model:r.metadata,loadSeconds:loaded,seconds:(performance.now()-began)/1000,cases,scope:'Real native-task adapter controls. Expected surfaces are synthetic checks, not independent quality evaluation. Timings are operational and may overlap other processes.'};
}
self.onmessage=async({data})=>{currentId=data.id;try{if(data.mode==='adapter-control'){postMessage({id:data.id,report:await adapterControl()});return;}if(typeof data.text!=='string'||!data.text.trim()||data.text.length>2500)throw Error('Encoder input must be nonempty and at most 2500 UTF-16 characters.');postMessage({id:data.id,proposal:await propose(data.text,data.schemaExamples,data.references)});}catch(e){postMessage({id:data.id,error:String(e.message).slice(0,300)});}};
