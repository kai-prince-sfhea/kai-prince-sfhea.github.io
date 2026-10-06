// Encoder output is a proposal about wording, never a proof or a known fact.
export const PROPOSAL_LABELS=Object.freeze(['conclusion','supporting reason','condition','negation','question','door choice','rule reference','person','place','entity','counterexample']);
export const PROPOSAL_INTENTS=Object.freeze(['reasoning step','question','door choice strategy','multiple cases','unresolved']);
export const PROPOSAL_RELATIONS=Object.freeze({
 supports:{head:['supporting reason'],tail:['conclusion'],description:'The supporting reason is explicitly offered as evidence for this conclusion.'},
 conditions_for:{head:['condition'],tail:['conclusion','door choice'],description:'This condition governs when the conclusion or door choice applies.'},
 negates:{head:['negation'],tail:['conclusion','condition','supporting reason'],description:'The negation cue has scope over this proposition.'},
 references:{head:['rule reference'],tail:['conclusion','supporting reason'],description:'The player cites this reference for this proposition.'},
 challenges:{head:['counterexample'],tail:['conclusion'],description:'The counterexample challenges this conclusion.'},
});
const relationLabels=new Set(Object.keys(PROPOSAL_RELATIONS)),labelSet=new Set(PROPOSAL_LABELS);
const provenance='unverified encoder proposal';
export function validateSpans(text,spans){
 if(typeof text!=='string'||!Array.isArray(spans))return [];
 const seen=new Set();return spans.slice(0,128).filter(s=>{
  if(!s||typeof s!=='object')return false;
  const surface=s.spanText??s.text,key=`${s.label}:${s.start}:${s.end}`;
  if(!Number.isSafeInteger(s.start)||!Number.isSafeInteger(s.end)||s.start<0||s.end<=s.start||s.end>text.length||surface!==text.slice(s.start,s.end)||!labelSet.has(s.label)||!Number.isFinite(s.score)||s.score<0||s.score>1||seen.has(key))return false;
  // A UTF-16 index must not split a supplementary code point.
  const splits=i=>i>0&&i<text.length&&/[\uD800-\uDBFF]/.test(text[i-1])&&/[\uDC00-\uDFFF]/.test(text[i]);
  if(splits(s.start)||splits(s.end))return false;seen.add(key);return true;
 }).slice(0,64).map(s=>({text:s.spanText??s.text,start:s.start,end:s.end,label:s.label,score:s.score,provenance}));
}
export const PROPOSAL_ATTRIBUTES=Object.freeze(['asserted','hypothetical','negated']);
export function emptyProposal(text,issues=[]){return {version:2,sourceText:text,mentions:[],relationships:[],records:[],attributes:[],citations:[],classification:null,issues,requiresRefinement:true,provenance};}
// Host validation checks offsets, labels, endpoints and exact reference IDs.
// It deliberately does not certify scope, entailment or the player's meaning.
export function validateProposal(text,raw={},references=[]){
 const out={...emptyProposal(text),model:raw.model??null,revision:raw.revision??null,capabilities:raw.capabilities??{},windows:Array.isArray(raw.windows)?raw.windows.slice(0,24):[],schemaExamples:Array.isArray(raw.schemaExamples)?raw.schemaExamples.filter(v=>typeof v==='string'&&v.length<=64).slice(0,2):[],timing:{}};
 for(const key of ['loadSeconds','encoderSeconds','relationSeconds','recordSeconds','attributeSeconds','windows'])if(Number.isFinite(raw.timing?.[key])&&raw.timing[key]>=0)out.timing[key]=raw.timing[key];
 out.mentions=validateSpans(text,raw.mentions??raw.spans).map((s,i)=>({...s,id:`m${i+1}`}));
 const bySpan=new Map(out.mentions.map(s=>[`${s.label}:${s.start}:${s.end}`,s]));
 const mention=v=>typeof v==='string'?out.mentions.find(s=>s.id===v):v&&bySpan.get(`${v.label}:${v.start}:${v.end}`);
 for(const edge of (Array.isArray(raw.relationships)?raw.relationships:[]).slice(0,128)){
  const head=mention(edge.head),tail=mention(edge.tail),spec=PROPOSAL_RELATIONS[edge.type];
  if(!relationLabels.has(edge.type)||!head||!tail||head.id===tail.id||!spec.head.includes(head.label)||!spec.tail.includes(tail.label)||!Number.isFinite(edge.score)||edge.score<0||edge.score>1)continue;
  if(out.relationships.some(e=>e.type===edge.type&&e.head===head.id&&e.tail===tail.id))continue;
  out.relationships.push({type:edge.type,head:head.id,tail:tail.id,score:edge.score,provenance});
 }
 for(const record of (Array.isArray(raw.records)?raw.records:[]).slice(0,16)){
  const fields={};for(const label of PROPOSAL_LABELS){const value=record.fields?.[label]??record[label],values=Array.isArray(value)?value:value?[value]:[];const ids=values.map(mention).filter(Boolean).filter(m=>m.label===label).map(m=>m.id);if(ids.length)fields[label]=[...new Set(ids)];}
  if(fields.conclusion?.length)out.records.push({fields,assignment:'learned record-head proposal',provenance});
 }
 for(const attr of (Array.isArray(raw.attributes)?raw.attributes:[]).slice(0,64)){const node=mention(attr.mention);if(!node||!PROPOSAL_ATTRIBUTES.includes(attr.label)||!Number.isFinite(attr.score)||attr.score<0||attr.score>1)continue;out.attributes.push({mention:node.id,label:attr.label,score:attr.score,provenance});}
 const referenceMap=new Map();for(const ref of references.slice(0,256)){const id=String(ref.id??ref.referenceId??'');if(!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(id))continue;for(const alias of [id,...(Array.isArray(ref.aliases)?ref.aliases:[])])if(typeof alias==='string'&&alias.length<=100){const previous=referenceMap.get(alias);referenceMap.set(alias,previous===undefined?id:previous===id?id:null);}}
 for(const span of out.mentions.filter(m=>m.label==='rule reference')){const id=referenceMap.get(span.text.trim());out.citations.push({span:span.id,referenceId:id??null,exact:typeof id==='string',provenance:id?'exact supplied reference match':'unresolved reference proposal'});}
 const cls=raw.classification;if(cls&&PROPOSAL_INTENTS.includes(cls.label)&&Number.isFinite(cls.score)&&cls.score>=0&&cls.score<=1)out.classification={label:cls.label,score:cls.score,provenance};
 out.issues=[...new Set((Array.isArray(raw.issues)?raw.issues:[]).filter(s=>typeof s==='string').map(s=>s.slice(0,240)))].slice(0,12);
 if((raw.mentions??raw.spans??[]).length>128||out.mentions.length>=64)out.issues.push('Bounded extraction reached its span limit; full-source refinement is required.');
 if((raw.relationships??[]).length>128||(raw.records??[]).length>16)out.issues.push('Bounded extraction reached its relation or record limit; full-source refinement is required.');
 if(out.mentions.some(m=>m.label==='negation'&&!out.relationships.some(e=>e.type==='negates'&&e.head===m.id)))out.issues.push('Negation scope is unresolved; retain full source for interpretation review.');
 if(out.mentions.some(m=>m.label==='condition'&&!out.relationships.some(e=>e.type==='conditions_for'&&e.head===m.id)))out.issues.push('Conditional scope is unresolved; retain full source for interpretation review.');
 if(out.citations.some(c=>!c.exact))out.issues.push('An extracted citation does not exactly identify a supplied reference.');
 out.requiresRefinement=true;return out;
}
export function compactProposal(proposal){
 const uncertainIntent=proposal.classification&&proposal.classification.score<.5;
 return {version:2,mentions:proposal.mentions.map(({id,label,text,start,end})=>({id,label,text,start,end})),relationships:proposal.relationships.map(({type,head,tail})=>({type,head,tail})),records:proposal.records.map(r=>r.fields),attributes:(proposal.attributes??[]).map(({mention,label})=>({mention,label})),citations:proposal.citations.map(({span,referenceId,exact})=>({span,referenceId,exact})),intent:uncertainIntent?'unresolved':proposal.classification?.label??'unresolved',issues:uncertainIntent?[...proposal.issues,'Encoder intent is below the 0.5 abstention threshold; retain the full source.']:proposal.issues,authority:'unverified extraction; player review and proof checks required'};
}
