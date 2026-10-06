importScripts('/Experiment/vendor/swipl/dist/swipl/swipl-web.js');
let runtime,loading,busy=false,output=[];
self.onmessage=async({data})=>{
  const {id,source}=data;if(busy){postMessage({id,error:'The Prolog worker is busy'});return;}busy=true;output=[];
  const started=performance.now(),runtimeCold=!runtime;
  try {
    if(typeof source!=='string'||source.length>1000000)throw Error('Invalid generated Prolog program');
    runtime??=await(loading??=SWIPL({arguments:['-q'],locateFile:f=>'/Experiment/vendor/swipl/dist/swipl/'+f,print:t=>{if(output.length<100)output.push(t);},printErr:t=>{if(output.length<100)output.push(t);}}));
    const runtimeLoadSeconds=(performance.now()-started)/1000,p=runtime.prolog,searchStarted=performance.now();
    // Unload this source between checks; keep only the shared runtime/libraries.
    p.query("unload_file('/check.pl').").once();
    runtime.FS.writeFile('/check.pl',source.replace(':- initialization(main, main).',''));
    p.query("consult('/check.pl').").once();
    const r=p.query('with_output_to(string(S),main).').once(),result=JSON.parse(r.S);
    const version=p.query('current_prolog_flag(version_data,V),term_string(V,S).').once().S;
    p.query("unload_file('/check.pl').").once();runtime.FS.unlink('/check.pl');
    postMessage({id,result:{...result,version,seconds:(performance.now()-started)/1000,runtimeCold,runtimeLoadSeconds,searchSeconds:(performance.now()-searchStarted)/1000}});
  }catch(e){postMessage({id,error:e.message,log:output.join('\n')});}
  finally{busy=false;}
};
