// Synthetic wording fixtures, authored before the diagnostic model runs.
// These are not independent learner or multilingual gameplay evaluations.
export const extractionFixtures=Object.freeze([
 {id:'reason-en',language:'English',text:'The archive is accessible because my permit is valid.',reason:'permit is valid',conclusion:'archive is accessible',relationship:'supports'},
 {id:'reason-es',language:'Spanish',text:'El archivo es accesible porque mi permiso es válido.',reason:'permiso es válido',conclusion:'archivo es accesible',relationship:'supports'},
 {id:'reason-fr',language:'French',text:'Les archives sont accessibles parce que mon permis est valide.',reason:'permis est valide',conclusion:'archives sont accessibles',relationship:'supports'},
 {id:'conditional-en',language:'English',text:'If my permit is valid, the archive is accessible.',condition:'permit is valid',conclusion:'archive is accessible',relationship:'conditions_for'},
 {id:'reference-en',language:'English',text:'Using F1 and R1, the archive is accessible because my permit is valid.',reason:'permit is valid',conclusion:'archive is accessible',relationship:'supports',references:[{id:'F1'},{id:'R1'}]},
 {id:'negation-es',language:'Spanish',text:'No afirmo que la puerta es segura.',negation:'No',scope:'negation remains an unverified proposal'},
]);
const contains=(surface,wanted)=>surface.toLocaleLowerCase().includes(wanted.toLocaleLowerCase());
export function evaluateExtractionFixture(fixture,proposal){
 const mentions=proposal.mentions??[],has=(label,value)=>mentions.some(m=>m.label===label&&contains(m.text,value));
 const findings={exactSource:mentions.every(m=>fixture.text.slice(m.start,m.end)===m.text),reviewRequired:proposal.requiresRefinement===true,hasConclusion:fixture.conclusion?has('conclusion',fixture.conclusion):true,hasReason:fixture.reason?has('supporting reason',fixture.reason):true,hasCondition:fixture.condition?has('condition',fixture.condition):true,hasNegation:fixture.negation?has('negation',fixture.negation):true};
 if(fixture.relationship){const byId=new Map(mentions.map(m=>[m.id,m]));findings.hasDirectedRelationship=(proposal.relationships??[]).some(e=>e.type===fixture.relationship&&contains(byId.get(e.head)?.text??'',fixture.reason??fixture.condition)&&contains(byId.get(e.tail)?.text??'',fixture.conclusion));findings.hasLinkedRecord=(proposal.records??[]).some(r=>r.fields.conclusion?.some(id=>contains(byId.get(id)?.text??'',fixture.conclusion))&&r.fields[fixture.reason?'supporting reason':'condition']?.some(id=>contains(byId.get(id)?.text??'',fixture.reason??fixture.condition)));}
 if(fixture.references)findings.exactCitations=fixture.references.every(ref=>(proposal.citations??[]).some(c=>c.referenceId===ref.id&&c.exact));
 return {passed:Object.values(findings).every(Boolean),findings};
}
export async function runExtractionDiagnostics({onProgress=()=>{},signal}={}){
 const {extractProposal,releaseExtraction,extractionMetadata}=await import('./extraction.js');
 releaseExtraction();const began=performance.now(),cases=[];
 try{for(const fixture of extractionFixtures){if(signal?.aborted)break;const started=performance.now();let row;try{const proposal=await extractProposal(fixture.text,{force:true,references:fixture.references??[],onProgress:phase=>onProgress(`${fixture.language} · ${fixture.id} · ${phase}`)});row={...fixture,seconds:(performance.now()-started)/1000,proposal,...evaluateExtractionFixture(fixture,proposal)};}catch(e){row={...fixture,seconds:(performance.now()-started)/1000,passed:false,error:e.message};}cases.push(row);onProgress(`${cases.length} of ${extractionFixtures.length} checks completed`);}}
 finally{releaseExtraction();}
 return {at:new Date().toISOString(),model:extractionMetadata(),seconds:(performance.now()-began)/1000,passed:cases.filter(c=>c.passed).length,failed:cases.filter(c=>!c.passed).length,cancelled:signal?.aborted===true,cases,scope:'Real local encoder on synthetic multilingual causal, conditional, citation and negation fixtures. Includes strict linked-record checks; no learning, mobile or overall architecture benefit established.'};
}
