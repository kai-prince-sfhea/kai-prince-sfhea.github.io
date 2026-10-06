// Attribution is background, never a proof premise or a completed learner step.
export function referenceItems(scenario={}){
 return (Array.isArray(scenario.references)?scenario.references:[]).slice(0,20).flatMap(r=>{
  if(!r||typeof r.title!=='string'||typeof r.url!=='string')return [];
  try{const url=new URL(r.url);if(url.protocol!=='https:'||url.username||url.password)return [];
   return [{title:r.title.slice(0,220),url:url.href,authors:typeof r.authors==='string'?r.authors.slice(0,180):'',year:String(r.year||'').slice(0,80),scope:typeof r.scope==='string'?r.scope.slice(0,500):''}];
  }catch{return [];}
 });
}
export function renderReferences(scenario){
 const items=referenceItems(scenario);if(!items.length)return null;
 const root=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Sources and attribution';root.append(summary);
 const intro=document.createElement('p');intro.textContent='These sources credit the problem, method or historical case. External links need a connection. Background reading does not add a verified step or establish every fictional premise.';root.append(intro);
 const list=document.createElement('ol');
 for(const r of items){const li=document.createElement('li'),a=document.createElement('a');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=r.title;li.append(a);
  if(r.authors||r.year)li.append(document.createTextNode(' · '+[r.authors,r.year].filter(Boolean).join(', ')));
  if(r.scope){const p=document.createElement('p');p.textContent=r.scope;li.append(p);}list.append(li);
 }root.append(list);return root;
}
