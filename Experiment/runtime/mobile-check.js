import {probeStorage,probeResume} from './storage-writer.js';
import {certify,KERNEL} from './coq.js';
const out=document.querySelector('#results'),report={at:new Date().toISOString(),userAgent:navigator.userAgent,kernel:KERNEL,checks:[],scope:'Storage and proof checks only; not full model, mobile emulation or airplane-mode evidence.'};
const run=async(name,fn)=>{const status=document.querySelector('#check-status');status.textContent=name+' is running.';const t=performance.now();try{const result=await fn();report.checks.push({name,status:'pass',seconds:(performance.now()-t)/1000,result});}catch(e){report.checks.push({name,status:'fail',detail:e.message});}out.textContent=JSON.stringify(report,null,2);status.textContent=name+': '+report.checks.at(-1).status+'. '+report.checks.length+' checks completed; '+report.checks.filter(c=>c.status==='fail').length+' failed.';document.querySelector('#export-check').disabled=false;};
document.querySelector('#capabilities').textContent=`Secure origin: ${isSecureContext?'yes':'no'}. WebGPU API: ${navigator.gpu?'present (GPU and memory checks still required)':'unavailable — Gemma cannot run here'}. OPFS: ${navigator.storage?.getDirectory?'present':'unavailable'}.`;
document.querySelector('#storage-check').onclick=async e=>{e.target.disabled=true;try{await run('Normal storage API selection',()=>probeStorage());await run('Worker fallback',()=>probeStorage({forceSync:true}));await run('Interrupted/resumed streaming path',()=>probeResume());}finally{e.target.disabled=false;}};
document.querySelector('#proof-check').onclick=async e=>{e.target.disabled=true;try{
 for(const [name,sentences,expected] of [
  ['True theorem',['Theorem t : forall b:bool, b=b.','Proof.','intro b; reflexivity.','Qed.'],'verified'],
  ['False theorem',['Theorem f : true=false.','Proof.','reflexivity.','Qed.'],'rejected'],
  ['Unfinished theorem',['Theorem unfinished : True.','Proof.','Qed.'],'rejected']
 ])await run(name,async()=>{const r=await certify(sentences);if(r.status!==expected)throw Error('Expected '+expected+', got '+JSON.stringify(r));return r;});
}finally{e.target.disabled=false;}};
document.querySelector('#export-check').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='thread-mobile-compatibility.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);};
