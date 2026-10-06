// Bounded, local diagnostic measurements; never store prompts or model output.
let sequence=0;const events=[];
export function measure(category,data){const event={id:++sequence,at:new Date().toISOString(),category,...data};events.push(event);if(events.length>10000)events.shift();return event;}
export const measurementCursor=()=>sequence;
export const measurementCoverage=id=>({afterId:id,firstRetainedId:events.find(e=>e.id>id)?.id??null,droppedEvents:Math.max(0,(events.find(e=>e.id>id)?.id??(sequence+1))-id-1)});
export const measurementsSince=id=>events.filter(e=>e.id>id).map(e=>structuredClone(e));
if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>measure('visibility',{outcome:document.visibilityState,seconds:0}));
export function distribution(values){const x=values.filter(Number.isFinite).sort((a,b)=>a-b);return {count:x.length,totalSeconds:x.reduce((a,b)=>a+b,0),medianSeconds:x.length?x[Math.floor((x.length-1)*.5)]:null,p95Seconds:x.length?x[Math.ceil(x.length*.95)-1]:null};}
export function summarizeMeasurements(events){const result={};for(const group of new Set(events.map(e=>e.category))){const rows=events.filter(e=>e.category===group);result[group]={all:distribution(rows.map(e=>e.seconds)),successful:distribution(rows.filter(e=>e.outcome==='success').map(e=>e.seconds)),outcomes:rows.reduce((a,e)=>(a[e.outcome]=(a[e.outcome]||0)+1,a),{})};}return result;}

export function performanceSummary(){
 const rows=measurementsSince(0),foreground=rows.filter(e=>e.category==='verification_cache'&&!e.anticipated),reused=foreground.filter(e=>e.hit||e.joined);
 return {scope:'Bounded measurements since this workspace page opened; may include multiple attempts. No anticipated claim content.',categories:summarizeMeasurements(rows),cache:{foregroundChecks:foreground.length,reusedChecks:reused.length,reuseRate:foreground.length?reused.length/foreground.length:null,anticipatedReuses:reused.filter(e=>e.sourceAnticipated).length},speculativeProofs:distribution(rows.filter(e=>e.category==='proof'&&e.anticipated).map(e=>e.seconds))};
}
