importScripts('/Experiment/vendor/swipl/dist/swipl/swipl-web.js');
self.onmessage=async({data})=>{
  const started=performance.now();let output=[];
  try {
    const m=await SWIPL({arguments:['-q'],locateFile:f=>'/Experiment/vendor/swipl/dist/swipl/'+f,print:t=>output.push(t),printErr:t=>output.push(t)});
    m.FS.writeFile('/check.pl',data.source.replace(':- initialization(main, main).',''));
    const p=m.prolog;
    p.query("consult('/check.pl').").once();
    // Capture Prolog output as a bound variable, not application log parsing.
    const r=p.query('with_output_to(string(S),main).').once();
    const result=JSON.parse(r.S);
    const version=p.query('current_prolog_flag(version_data,V),term_string(V,S).').once().S;
    postMessage({result:{...result,version,seconds:(performance.now()-started)/1000}});
  }catch(e){postMessage({error:e.message,log:output.join('\n')});}
};
