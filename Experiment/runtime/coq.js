// Real Coq 8.17 kernel via jsCoq 0.17.1. A completed Qed is required.
export async function certify(sentences, timeout=90000) {
  const started=performance.now(), worker=new Worker('/Experiment/vendor/jscoq/backend/jsoo/jscoq_worker.bc.js');
  let waiters=[],log=[];
  const wait=(predicate)=>new Promise((resolve,reject)=>waiters.push({predicate,resolve,reject}));
  const error=e=>{for(const w of waiters)w.reject(new Error(e));waiters=[];};
  const timer=setTimeout(()=>error('Coq proof timed out'),timeout);
  worker.onerror=e=>error(e.message);
  worker.onmessage=({data:m})=>{
    log.push(m); if(log.length>30)log.shift();
    if(m[0]==='CoqExn'||m[0]==='JsonExn'||(m[0]==='Feedback'&&m[1]?.contents?.[0]==='Message'&&JSON.stringify(m[1].contents[1]).includes('Error')))error(JSON.stringify(m));
    for(const w of [...waiters])if(w.predicate(m)){waiters.splice(waiters.indexOf(w),1);w.resolve(m);}
  };
  try {
    const manifest=await (await fetch('/Experiment/data/coq-files.json')).json();
    // Transfer every compiled library before Init; no CDN or remote prover.
    await Promise.all(manifest.files.map(async path=>{
      const r=await fetch(path);if(!r.ok)throw Error('Missing Coq library '+path);
      const bytes=await r.arrayBuffer();worker.postMessage(['Put','/lib/'+path.split('/unpacked/')[1],bytes],[bytes]);
    }));
    const ready=wait(m=>m[0]==='Ready');
    worker.postMessage(['Init',{implicit_libs:true,coq_options:[],debug:{coq:false,stm:false},lib_path:manifest.paths}]);
    worker.postMessage(['NewDoc',{lib_init:['Coq.Init.Prelude']}]);
    let sid=(await ready)[1];
    for(const sentence of sentences){
      const next=sid+1;
      const added=wait(m=>m[0]==='Added'&&m[1]===next);
      worker.postMessage(['Add',sid,next,sentence,false]);await added;
      const processed=wait(m=>m[0]==='Feedback'&&m[1].span_id===next&&m[1].contents[0]==='Processed');
      worker.postMessage(['Exec',next]);await processed;sid=next;
    }
    if(!sentences.some(s=>s.trim()==='Qed.'))throw Error('No closed theorem');
    return {status:'verified',detail:'Coq 8.17.1 kernel accepted the closed proof.',seconds:(performance.now()-started)/1000};
  } catch(e){return {status:'error',detail:e.message,log:JSON.stringify(log).slice(-6000),seconds:(performance.now()-started)/1000};}
  finally{clearTimeout(timer);worker.terminate();}
}
