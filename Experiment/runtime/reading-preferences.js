// Auxiliary pages inherit reading preferences without loading any reasoning tools.
import {get} from './store.js';
try{
 const p=await get('preferences')||{};
 document.documentElement.dataset.textSize=['standard','large','largest'].includes(p.textSize)?p.textSize:'standard';
 document.body.classList.toggle('reading-space',!!p.spacing);
 document.body.classList.toggle('reduced-motion',typeof p.motion==='boolean'?p.motion:matchMedia('(prefers-reduced-motion: reduce)').matches);
}catch{/* These documents remain readable if local storage is unavailable. */}
