import {get,put} from './store.js';
import {embedTexts} from './embedding.js';
import {embeddingStatus,EMBEDDING_MODEL} from './embedding-assets.js';
import {retrievalMode} from './example-retrieval.js';
const pending=new Map();
export const EXTRACTION_SCHEMAS=[
 {id:'schema:reason',type:'schema',text:'I conclude C because A and B. Extract conclusion C, supporting reasons A and B, and supports relationships; do not infer intermediate facts.',schema:{records:['claim:conclusion,premise,cue'],relations:['supports'],preserve:['source offsets','polarity','all reasons']}},
 {id:'schema:conditional',type:'schema',text:'If A then B; assuming A would imply B. Hypothetical condition A is not an observed fact. Extract conditions_for, conclusion and hypothetical scope.',schema:{records:['conditional:condition,consequence,cue'],relations:['conditions_for'],preserve:['hypothetical scope','one-way implication']}},
 {id:'schema:negation',type:'schema',text:'Not A, no A, never A; a negated proposition or negation of a whole conditional. Extract explicit negation and its exact scope; no simplification from confidence.',schema:{records:['denial:claim,negation cue'],relations:['negates'],preserve:['negation scope','double negation']}},
 {id:'schema:reference',type:'schema',text:'Using Fact F1, Rule 2 or my previous step c1, I establish C. Extract exact references; a rule is not an extra fact. Resolve only declared identifiers.',schema:{records:['citation:reference,role'],relations:['references'],preserve:['exact citation','role','unresolved identity']}},
 {id:'schema:guard',type:'schema',text:'The asked guard answers a question about what the other guard would say about this tested door. Keep both guards and both doors distinct; a prediction is not a door-choice action.',schema:{records:['question:asked guard,nested guard,door,prediction','strategy:yes choice,no choice'],relations:['asks_about','chooses'],preserve:['nested question','each answer branch']}}
];
export function graphDocuments(s){const core=s.domain==='guards'?[
 {id:'safe',type:'proposition',text:'The indicated door leads to safety; the other door is unsafe.'},
 {id:'truthful',type:'proposition',text:'The guard I ask tells the truth; the other guard lies.'},
 {id:'entity:tested_door',type:'entity',text:'this door, tested door, indicated door: the door selected as the subject of my question',binding:{role:'tested',proposition:'safe'}},
 {id:'entity:other_door',type:'entity',text:'the other door: the door distinct from this tested door',binding:{role:'other',proposition:'safe',negated:true}},
 {id:'entity:asked_guard',type:'entity',text:'the guard I ask, asked guard: the respondent, whose truthfulness is not given',binding:{role:'asked',proposition:'truthful'}},
 {id:'entity:other_guard',type:'entity',text:'the other guard: the guard distinct from the respondent',binding:{role:'other',proposition:'truthful',negated:true}}
 ]:[...Object.entries(s.nodes||{}).map(([id,n])=>({id,type:n.fact?'fact':'proposition',text:n.label})),...(s.rules||[]).map(r=>({id:r.id,type:'rule',text:r.premises.map(p=>s.nodes[p].label).join(' AND ')+' implies '+s.nodes[r.conclusion].label}))];
 return [...core,...EXTRACTION_SCHEMAS];
}
export function validGraphIndex(index,documents){return !!index&&index.revision===EMBEDDING_MODEL.revision&&index.dimensions===EMBEDDING_MODEL.dimensions&&JSON.stringify(index.documents)===JSON.stringify(documents)&&index.vectors?.length===documents.length&&index.vectors.every(v=>Array.isArray(v)&&v.length===EMBEDDING_MODEL.dimensions&&v.every(Number.isFinite)&&Math.abs(Math.hypot(...v)-1)<0.001);}
export async function prepareGraphIndex(s){
 if((await retrievalMode())!=='semantic'||!(await embeddingStatus()).ready)return null;
 const documents=graphDocuments(s);if(!documents.length||documents.length>256)return null;
 const key='graph-vectors:v1:'+s.source_hash+':'+EMBEDDING_MODEL.revision,existing=await get(key);
 if(validGraphIndex(existing,documents))return existing;
 if(!pending.has(key))pending.set(key,(async()=>{const vectors=[];for(let i=0;i<documents.length;i+=8){const r=await embedTexts(documents.slice(i,i+8).map(d=>d.text),{role:'document'});if(r.truncated.some(Boolean))return null;vectors.push(...r.embeddings);}const index={documents,vectors,revision:EMBEDDING_MODEL.revision,dimensions:EMBEDDING_MODEL.dimensions,provenance:'local encoder; reference suggestions only'};await put(key,index);return index;})().catch(()=>null).finally(()=>pending.delete(key)));
 return pending.get(key);
}
export async function graphSuggestions(s,text){
 if((await retrievalMode())!=='semantic')return [];
 const index=await get('graph-vectors:v1:'+s.source_hash+':'+EMBEDDING_MODEL.revision);if(!validGraphIndex(index,graphDocuments(s)))return [];
 try{const r=await embedTexts([text],{role:'query'});if(r.truncated[0])return [];const scored=index.documents.map((d,i)=>({...d,similarity:index.vectors[i].reduce((n,v,j)=>n+v*r.embeddings[0][j],0)})).sort((a,b)=>b.similarity-a.similarity);return [...scored.filter(d=>d.type!=='schema').slice(0,4),...scored.filter(d=>d.type==='schema').slice(0,2)];}catch{return [];}
}
export async function graphVectorAnnotations(s){const index=await get('graph-vectors:v1:'+s.source_hash+':'+EMBEDDING_MODEL.revision);return validGraphIndex(index,graphDocuments(s))?index.documents.map((d,i)=>({...d,embedding:index.vectors[i],model:index.revision,provenance:index.provenance})):[];}
