// Session creation may reuse only trusted bundled scenario graphs. A submitted
// tutorial flag or copied tutorial identifier never grants a compiler bypass.
export async function resolveSessionScenario(submitted,catalogue,{loadTutorial,importTheory}) {
 if(!submitted)return structuredClone(catalogue[0]);
 const known=catalogue.find(s=>s.id===submitted.id);
 if(known)return {...structuredClone(known),title:submitted.title,description:submitted.description,goal:submitted.goal};
 const tutorial=await loadTutorial();
 if(typeof tutorial?.source_text==='string'&&typeof tutorial?.source_hash==='string'&&
    submitted.id===tutorial.id&&submitted.source_hash===tutorial.source_hash&&submitted.source_text===tutorial.source_text)
  return structuredClone(tutorial);
 return importTheory(submitted.source_text);
}
