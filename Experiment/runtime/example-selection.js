// Ranking only: neither similarity nor a demonstration is a proof or a meaning check.
export const SELECTOR_VERSION='named-hybrid-v1';
const words=text=>new Set(String(text).toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]);
export function features(text){text=String(text).replaceAll('’',"'");return {
 question:/\?\s*$|^(?:why|how|what|could|would|does|is|are)\b/i.test(text.trim()),
 reason:/\b(?:because|given that|since)\b/i.test(text),
 negative:/\b(?:not|never|no|neither|nor|cannot|can't|won't|isn't|aren't|wasn't|weren't|doesn't|don't|didn't|hasn't|haven't|hadn't|wouldn't|couldn't|shouldn't)\b/i.test(text),
 hypothetical:/\b(?:suppose|assuming|imagine|what if)\b/i.test(text),
 conditional:/\b(?:if|unless|only when|whenever)\b/i.test(text)
};}
export function validateCorpus(corpus){
 if(!Array.isArray(corpus?.examples)||!corpus.examples.length||corpus.examples.length>500)throw Error('Invalid example corpus');
 const ids=new Set(),profiles=new Set(['beginner','experienced','expert']);
 for(const e of corpus.examples){
  if(!/^[a-z0-9_-]{1,100}$/.test(e.id)||ids.has(e.id)||e.language!=='en'||!profiles.has(e.expertise)||typeof e.approach!=='string'||typeof e.input!=='string'||e.input.length>2000||!Array.isArray(e.vocabulary)||!e.vocabulary.length||e.vocabulary.length>20)throw Error('Invalid demonstration metadata');
  ids.add(e.id);const vocabulary=new Set(e.vocabulary.map(v=>v.id));
  if(vocabulary.size!==e.vocabulary.length||e.vocabulary.some(v=>typeof v.id!=='string'||typeof v.meaning!=='string'||v.meaning.length>1000))throw Error('Invalid demonstration vocabulary');
  const o=e.output;if(!o||!['claim','clarify'].includes(o.action)||typeof o.message!=='string'||o.message.length>1500||!Array.isArray(o.depends_on)||o.depends_on.length)throw Error('Invalid demonstration output');
  for(const k of ['conclusions','assumptions'])if(!Array.isArray(o[k])||o[k].some(v=>!vocabulary.has(v.id)||typeof v.positive!=='boolean'||Object.keys(v).sort().join(',')!=='id,positive'))throw Error('Invalid demonstration literal');
  if(o.action==='claim'&&!o.conclusions.length||o.action==='clarify'&&(o.conclusions.length||o.assumptions.length))throw Error('Invalid demonstration action');
 }
 return corpus;
}
export function coverage(corpus){
 const approaches=[...new Set(corpus.examples.map(e=>e.approach))].sort(),missing=[];
 for(const a of approaches)for(const p of ['beginner','experienced','expert'])for(const l of corpus.languages||['en'])if(!corpus.examples.some(e=>e.approach===a&&e.expertise===p&&e.language===l))missing.push([a,p,l].join('/'));
 return {examples:corpus.examples.length,approaches:approaches.length,profiles:3,languages:corpus.languages,missing};
}
export function demonstration(e,hasDependencies){
 const output=structuredClone(e.output);if(!hasDependencies)delete output.depends_on;
 return [{role:'user',content:JSON.stringify({vocabulary:e.vocabulary,previous_claims:[],current_thought:e.input})},{role:'assistant',content:JSON.stringify(output)}];
}
export const embeddingText=e=>e.input; // Do not encode the example's answer as the query target.
export function cosine(a,b){if(!Array.isArray(a)||a.length!==b?.length)return 0;let dot=0,aa=0,bb=0;for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];}return aa&&bb?dot/Math.sqrt(aa*bb):0;}
export function rankExamples(corpus,query,{mode='lexical',vectors,queryVector,hasDependencies=false,maxCharacters=1100}={}){
 const q=features(query),tokens=words(query),ranked=[];
 for(let i=0;i<corpus.examples.length;i++){
  const e=corpus.examples[i],f=features(e.input),pair=demonstration(e,hasDependencies),characters=pair.reduce((n,m)=>n+m.content.length,0);
  if(e.language!=='en'||characters>maxCharacters||q.reason!==f.reason||q.question!==f.question||q.hypothetical!==f.hypothetical||q.conditional!==f.conditional||q.negative!==f.negative)continue;
  const terms=words(e.input),intersection=[...tokens].filter(w=>terms.has(w)).length,lexical=intersection/Math.max(1,Math.sqrt(tokens.size*terms.size));
  const semantic=mode==='semantic'?cosine(queryVector,vectors?.[i]):0;
  const score=mode==='semantic'?0.75*semantic+0.25*lexical:lexical;
  ranked.push({id:e.id,approach:e.approach,expertise:e.expertise,score,lexical,semantic,characters,pair});
 }
 ranked.sort((a,b)=>b.score-a.score||a.characters-b.characters||a.id.localeCompare(b.id));
 const best=ranked[0];
 // These conservative engineering thresholds are not calibrated confidence.
 return best&&best.score>=(mode==='semantic'?0.24:0.16)?best:null;
}
export function eligibleRequest(request){
 const meta=request.example_selection,p=request.format?.properties;
 if(meta?.schema!=='named-v1'||meta.language!=='en'||meta.replace_pair!==5||request.messages?.length!==8||!p?.conclusions||!p?.assumptions||!p?.action)return false;
 try{return typeof JSON.parse(request.messages.at(-1).content).current_thought==='string';}catch{return false;}
}
