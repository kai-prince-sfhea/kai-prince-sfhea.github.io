import {localApi,scenarios} from './local-api.js';
import {cancel} from './model.js';
const out=document.querySelector('#out'),status=document.querySelector('#status'),button=document.querySelector('#run');
window.addEventListener('model-progress',e=>status.textContent=e.detail);
document.querySelector('#cancel').onclick=cancel;
button.onclick=async()=>{button.disabled=true;out.textContent='';const start=performance.now();try{
 const made=await localApi('/api/session',{scenario:(await scenarios())[0]});
 const text='If I ask a guard "Is this door safe?", they will answer "Yes" if:\n- they\'re a truthteller and the door is actually safe;\n- they\'re a liar and the door is not safe.';
 const result=await localApi('/api/interpret',{session_id:made.session_id,text});
 out.textContent=JSON.stringify({seconds:(performance.now()-start)/1000,result},null,2);
}catch(e){out.textContent=JSON.stringify({error:e.message,diagnostics:e.diagnostics,seconds:(performance.now()-start)/1000},null,2);}finally{status.textContent='Finished';button.disabled=false;}};
