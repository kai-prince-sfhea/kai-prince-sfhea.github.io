import {localApi,scenarios} from './local-api.js';
import {cancel} from './model.js';
import {matchesChallengeMeaning} from './benchmark-challenge.js';
const out=document.querySelector('#out'),status=document.querySelector('#status'),button=document.querySelector('#run');
window.addEventListener('model-progress',e=>status.textContent=e.detail);
let cancelling=false;document.querySelector('#cancel').onclick=()=>{cancelling=true;cancel();};
button.onclick=async()=>{cancelling=false;button.disabled=reviewButton.disabled=true;out.textContent='';const start=performance.now();try{
 const made=await localApi('/api/session',{scenario:(await scenarios())[0]});
 const text='If I ask a guard "Is this door safe?", they will answer "Yes" if:\n- they\'re a truthteller and the door is actually safe;\n- they\'re a liar and the door is not safe.';
 const result=await localApi('/api/interpret',{session_id:made.session_id,text});
 out.textContent=JSON.stringify({seconds:(performance.now()-start)/1000,result},null,2);
}catch(e){out.textContent=JSON.stringify({error:e.message,diagnostics:e.diagnostics,seconds:(performance.now()-start)/1000},null,2);}finally{status.textContent=cancelling?'Stopped':'Finished';button.disabled=reviewButton.disabled=false;}};
const reviewButton=document.querySelector('#review-run');
reviewButton.onclick=async()=>{
 cancelling=false;reviewButton.disabled=button.disabled=true;status.textContent='Preparing local test cases…';out.textContent='';const report={scope:'Focused live interpretation regression; no claim is confirmed or accepted.',started:new Date().toISOString(),results:[]};
 try{
  const generated=(await localApi('/api/generate-challenge',{config:{subject:'researcher',context:'misconduct',difficulty:'stretch',seed:'benchmark-evidence-2026'}})).scenario;
  const neutral=(await localApi('/api/generate-challenge',{config:{subject:'researcher',context:'exhibition',difficulty:'challenge',seed:'benchmark-evidence-2026'}})).scenario;
  const n=neutral.challenge.dossiers[0].name;
  const cases=[
   {name:'Named negation retains its polarity',scenario:(await scenarios()).find(s=>s.id==='murder-basic'),input:'Clara does not satisfy the fictional culprit criteria.',negative:true},
   {name:'Unsupported named concept',scenario:(await scenarios()).find(s=>s.id==='murder-basic'),input:'Clara travelled to the Moon by teleportation.',clarify:true},
   {name:'Exact reason and decision remain distinct',scenario:generated,input:'Given that '+generated.nodes.d1_explained.label+', I conclude that '+generated.nodes.d1_close.label+'.',expected:{conclusions:['d1_close'],assumptions:['d1_explained']}},
   {name:'Unsupported intentional fabrication',scenario:generated,input:'This discrepancy proves that the researcher intentionally fabricated the record.',clarify:true},
   {name:'Paraphrased evidence with spelling variation',scenario:neutral,input:`The discrepancy in ${n} has a traceable comparision record, because I know the source and version of its original record and the source and reported output were compared item by item.`,expected:{conclusions:['d1_usable'],assumptions:['d1_trace','d1_comparison']}}
  ];
  for(const c of cases){if(cancelling)break;status.textContent='Checking: '+c.name;const start=performance.now();try{const made=await localApi('/api/session',{scenario:c.scenario}),result=await localApi('/api/interpret',{session_id:made.session_id,text:c.input,grouping:'together'});const pass=c.clarify?!result.candidate_id&&!!result.clarification&&!result.diagnostic:c.negative?!!result.candidate_id&&result.interpretation?.graph?.conclusions?.length===1&&result.interpretation.graph.conclusions[0].positive===false&&c.scenario.nodes[result.interpretation.graph.conclusions[0].id].covers.includes(c.scenario.targets[0]):!!result.candidate_id&&matchesChallengeMeaning(result.interpretation?.graph,c.expected);report.results.push({name:c.name,status:pass?'pass':'fail',input:c.input,expected:c.expected??(c.negative?'negative claim':'clarification'),seconds:(performance.now()-start)/1000,result});}catch(e){report.results.push({name:c.name,status:'fail',error:e.message,seconds:(performance.now()-start)/1000});}out.textContent=JSON.stringify(report,null,2);}
 }catch(e){report.error=e.message;out.textContent=JSON.stringify(report,null,2);}finally{status.textContent=`${cancelling?'Stopped':'Finished'}: ${report.results.filter(r=>r.status==='pass').length} passed; ${report.results.filter(r=>r.status==='fail').length} failed.`;reviewButton.disabled=button.disabled=false;}
};
