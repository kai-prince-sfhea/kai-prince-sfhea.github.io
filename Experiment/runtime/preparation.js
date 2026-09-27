import {get} from './store.js';
let sessionOverride;
// Honour the current page's explicit choice immediately, including while a
// preference read/write is pending or saving fails. Other pages still use IDB.
if(typeof window!=='undefined')window.addEventListener('background-preparation-change',event=>{
 if(typeof event.detail==='boolean')sessionOverride=event.detail;
});
// Failure to read preferences must not start optional battery-consuming work.
export async function backgroundPreparationEnabled(){
 if(typeof sessionOverride==='boolean')return sessionOverride;
 try{const saved=await get('background-preparation');return sessionOverride??saved!==false;}catch{return sessionOverride??false;}
}
