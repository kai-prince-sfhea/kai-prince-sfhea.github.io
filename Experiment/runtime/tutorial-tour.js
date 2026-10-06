import {get,put} from './store.js';
let current;
export function closeTutorialTour(){current?.dispose();current=null;}
export function tutorialTour(session){
 if(current?.session===session)return current.start;
 current?.dispose();const tips=[['#current-context summary','Notice the given facts and labelled rules.'],['#thought','Explain a connection in my own words, then share it.'],['[data-candidate-action="confirm"]','Compare my original words and this interpretation. Confirm only when the meaning matches.'],['[data-logic-inspection]>summary','Open the actual check. Conditional support is different from established knowledge.'],['#thought','Connect my established step to the next goal. Reflection follows completion.']];
 let index=0,enabled=false,target;const panel=document.createElement('section');panel.className='tour-popover';panel.setAttribute('role','region');panel.setAttribute('aria-label','Optional guided walkthrough');panel.hidden=true;
 const text=document.createElement('p'),status=document.createElement('p');status.setAttribute('role','status');const close=document.createElement('button');close.type='button';close.textContent='Close walkthrough';close.onclick=()=>{enabled=false;render();};const next=document.createElement('button');next.type='button';next.textContent='Next tip';next.onclick=()=>{index=Math.min(4,index+1);put('tutorial-tip:'+session,index);render();};panel.append(text,status,next,close);document.body.append(panel);
 function render(){target?.classList.remove('tour-highlight');const selector=index===2?'[data-candidate-action="confirm"]:not(:disabled)':tips[index][0];target=[...document.querySelectorAll(selector)].at(-1);panel.hidden=!enabled;if(!enabled)return;text.textContent=`${index+1} of 5 · ${tips[index][1]}`;status.textContent=target?'The highlighted control is ready.':'This control appears after the preceding gameplay action. My draft is kept.';target?.classList.add('tour-highlight');next.disabled=index===4;}
 const observer=new MutationObserver(()=>{if(!enabled)return;if(index===1&&document.querySelector('[data-candidate-action="confirm"]:not(:disabled)')){index=2;put('tutorial-tip:'+session,index);}render();});observer.observe(document.querySelector('#conversation'),{subtree:true,childList:true});
 const check=()=>{if(enabled&&index===2){index=3;put('tutorial-tip:'+session,index);render();}};
 const toggle=event=>{if(enabled&&index===3&&event.target.matches('[data-logic-inspection]')&&event.target.open){index=4;put('tutorial-tip:'+session,index);render();}};
 document.addEventListener('thread-step-checked',check);document.addEventListener('toggle',toggle,true);
 const start=async()=>{index=Math.max(0,Math.min(4,await get('tutorial-tip:'+session)||0));enabled=true;render();target?.focus();};
 current={session,start,dispose:()=>{observer.disconnect();document.removeEventListener('thread-step-checked',check);document.removeEventListener('toggle',toggle,true);target?.classList.remove('tour-highlight');panel.remove();}};return start;
}
