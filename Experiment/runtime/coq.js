import {measure} from './telemetry.js';
// jsCoq 1.99.2 / Coq 8.20.1. Only generated, closed certificates are accepted.
export const KERNEL='Coq 8.20.1 / jsCoq 1.99.2';
let libraryCache=null,activeCertificate=false,resident,version='',uses=0,idleTimer,serial=Promise.resolve(),healthPromise,health={state:'unchecked'};
export const kernelHealth=()=>structuredClone(health);
export function resetKernel(){if(activeCertificate)throw Error('A proof is running. Wait for it to finish before resetting the kernel.');clearTimeout(idleTimer);resident?.terminate();resident=null;uses=0;version='';healthPromise=null;health={state:'unchecked'};libraryCache=null;}
export function certify(sentences,timeout=90000,{anticipated=false}={}){const result=serial.then(()=>runCertificate(sentences,timeout,anticipated));serial=result.catch(()=>{});return result;}
export async function ensureKernel(){
 if(health.state==='ready'||health.state==='unavailable')return kernelHealth();
 return healthPromise??=(async()=>{
  const accepted=await certify(['Theorem kernel_health : True.','Proof.','exact I.','Qed.']);
  if(accepted.status!=='verified'){health={state:'unavailable',detail:accepted.detail,evidence:accepted};return kernelHealth();}
  const rejected=await certify(['Theorem kernel_false : true=false.','Proof.','reflexivity.','Qed.']);
  health=rejected.status==='rejected'&&rejected.kind==='proof'?{state:'ready',detail:KERNEL+' self-check passed.',accepted,rejected}:{state:'unavailable',detail:'The kernel did not explicitly reject a false theorem.',evidence:rejected};
  return kernelHealth();
 })();
}
async function runCertificate(sentences,timeout=90000,anticipated=false){
 activeCertificate=true;clearTimeout(idleTimer);const started=performance.now(),controller=new AbortController(),warm=!!resident;let worker,timer,fatal,waiters=[],log=[],info=version,phase='startup',phaseStarted=started;const phases={};
 const enter=name=>{phases[phase]=(phases[phase]||0)+(performance.now()-phaseStarted)/1000;phase=name;phaseStarted=performance.now();};
 const finish=(result)=>{enter('complete');measure('proof',{outcome:result.status==='verified'?'success':result.status==='rejected'?'proof_rejected':result.kind||result.status,seconds:result.seconds,warm,anticipated,phases});return {...result,warm,phases};};
 const failure=(message,kind='runtime')=>{if(!fatal){if(kind!=='proof'){health={state:'unavailable',detail:message};if(resident===worker){resident?.terminate();resident=null;version='';uses=0;}}fatal=Object.assign(Error(message),{kind});controller.abort();}for(const w of waiters)w.reject(fatal);waiters=[];};
 const wait=predicate=>{const p=fatal?Promise.reject(fatal):new Promise((resolve,reject)=>waiters.push({predicate,resolve,reject}));p.catch(()=>{});return p;};
 const send=message=>{if(fatal)throw fatal;worker.postMessage(message);};
 try{
  if(!Array.isArray(sentences)||!sentences.some(s=>s.trim()==='Qed.')||/\b(?:Admitted|admit|Axiom|Axioms|Parameter|Parameters|Abort)\b/.test(sentences.join('\n')))throw Error('A closed certificate without admitted assumptions is required.');
  timer=setTimeout(()=>failure('Proof kernel timed out; this is not a logical rejection.','timeout'),timeout);
  worker=resident??new Worker('/Experiment/vendor/rocq820/backend/jsoo/jscoq_worker.bc.js');resident=worker;
  worker.onerror=e=>{failure(e.message||'Proof worker failed');Object.assign(fatal,{filename:e.filename||null,line:e.lineno||null,column:e.colno||null,stack:e.error?.stack||null});};
  worker.onmessageerror=()=>failure('Unreadable proof worker response');
  worker.onmessage=({data:m})=>{
   log.push(m);if(log.length>30)log.shift();
   if(m[0]==='CoqInfo')info=m[1];
   if(m[0]==='JsonExn')failure(JSON.stringify(m));
   if(m[0]==='Notification')for(const d of m[1]?.diagnostic||[])if(d.severity===1){
    const detail=JSON.stringify(d);failure(detail,/FailedRequire|bad magic number|internal error|Cannot find library|Cannot load library|Unable to locate library/i.test(detail)?'runtime':'proof');
   }
   if(m[0]==='Log'&&m[1]?.[0]==='Error')failure(JSON.stringify(m));
   for(const w of [...waiters])if(w.predicate(m)){waiters.splice(waiters.indexOf(w),1);w.resolve(m);}
  };
  if(!warm){enter('libraries');
  if(!libraryCache){
   const response=await fetch('/Experiment/data/rocq-files.json',{signal:controller.signal});if(!response.ok)throw Error('Missing proof library manifest');
   const manifest=await response.json(),buffers=new Array(manifest.files.length);let index=0;
   await Promise.all(Array.from({length:6},async()=>{while(index<manifest.files.length){
    const i=index++,path=manifest.files[i],r=await fetch(path,{signal:controller.signal});if(!r.ok)throw Error('Missing proof library '+path);
    buffers[i]=await r.arrayBuffer();if(fatal)throw fatal;
   }}));
   if(buffers.reduce((sum,b)=>sum+b.byteLength,0)>40000000)throw Error('Proof library cache exceeds the 40 MB device budget.');
   libraryCache={manifest,buffers};
  }
  const {manifest,buffers}=libraryCache;
  for(let i=0;i<manifest.files.length;i++){const bytes=buffers[i].slice(0);if(fatal)throw fatal;worker.postMessage(['Put','/lib/'+manifest.files[i].split('/unpacked/')[1],bytes],[bytes]);}
  enter('initialize');const ready=wait(m=>m[0]==='Ready');
  send(['Init',{implicit_libs:true,coq_options:[],debug:false,lib_path:manifest.paths,lib_init:['Coq.Init.Prelude']}]);await ready;
  version=info;}
  if(!info.includes('Coq 8.20.1/'))throw Error('Unexpected proof kernel version: '+info);
  enter('checking');const uri='file:///lib/ThreadCertificate'+(++uses)+'.v',text=sentences.join('\n')+'\n';
  send(['OpenDoc',{uri,languageId:'rocq',version:1,text}]);
  // SaveVo acknowledges the whole checked document, unlike empty diagnostics.
  const saved=wait(m=>m[0]==='Log'&&m[1]?.[0]==='Notice'&&m[2]?.[0]==='Pp_string'&&m[2][1]==='Saved .vo file for '+uri);
  send(['Request',{id:1,method:{uri,loc:text.length,v:['SaveVo']}}]);await saved;
  send(['CloseDoc',{uri}]);return finish({status:'verified',detail:KERNEL+' accepted and saved the closed proof.',version:info,seconds:(performance.now()-started)/1000});
 }catch(e){const error=fatal||e;fatal=error;if(error.kind!=='proof')health={state:'unavailable',detail:error.message};return finish({status:error.kind==='proof'?'rejected':'error',kind:error.kind||'runtime',phase,detail:error.message,filename:error.filename??null,line:error.line??null,column:error.column??null,stack:error.stack??null,log:JSON.stringify(log).slice(-6000),seconds:(performance.now()-started)/1000});}
 finally{activeCertificate=false;clearTimeout(timer);controller.abort();if(fatal||uses>=20){worker?.terminate();resident=null;uses=0;version='';}else if(resident){idleTimer=setTimeout(()=>{resident?.terminate();resident=null;uses=0;version='';libraryCache=null;},60000);idleTimer.unref?.();}}
}
