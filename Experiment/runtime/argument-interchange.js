// AIF information nodes, scheme applications and conflicts; epistemic data is
// retained as namespaced metadata rather than pretending AIF defines truth.
export function toAIF(scenario,claims=[]){
 const nodes=[],edges=[];let serial=0;
 const known=new Set();
 const add=node=>{if(!known.has(node.nodeID)){known.add(node.nodeID);nodes.push(node);}return node.nodeID;};
 const edgeKeys=new Set();const edge=(from,to)=>{const key=JSON.stringify([from,to]);if(!edgeKeys.has(key)){edgeKeys.add(key);edges.push({edgeID:String(++serial),fromID:from,toID:to});}};
 for(const [id,n]of Object.entries(scenario.nodes||{}))add({nodeID:'p:'+id,text:n.label,type:'I',thread:{provenance:n.fact?'given':'proposition',hol:n.hol}});
 function literal(p){const positive='p:'+p.id;if(p.positive!==false)return positive;const negative=add({nodeID:'n:'+p.id,text:'It is false that '+(scenario.nodes?.[p.id]?.label||p.id),type:'I',thread:{provenance:'negative proposition',polarity:false,proposition:p.id}});const ca='conflict:'+p.id;if(!known.has(ca)){add({nodeID:ca,text:'Contradictory propositions',type:'CA'});edge(positive,ca);edge(ca,negative);}return negative;}
 function expression(e){const id='expr:'+canonicalExpressionKey(e);add({nodeID:id,text:JSON.stringify(e),type:'I',thread:{provenance:'Boolean expression',expression:e}});return id;}
 for(const r of scenario.rules||[]){const id='r:'+r.id;add({nodeID:id,text:'Connecting rule '+r.id,type:'RA',thread:{provenance:'scenario rule'}});for(const p of r.premises)edge('p:'+p,id);edge(id,'p:'+r.conclusion);}
 for(const c of claims){const raw=c.graph||c,id='c:'+c.id;add({nodeID:id,text:c.text||raw.text,type:'RA',thread:{provenance:'learner',status:c.epistemic?.state||'reviewed',grounded:c.epistemic?.grounded===true,mode:raw.mode||'assertion',trace:raw.trace,strategy:raw.strategy,dependencies:raw.depends_on||[]}});for(const p of raw.assumptions||[])edge(p.op?expression(p):literal(p),id);for(const p of raw.conclusions||[])edge(id,literal(p));if(raw.conclusion)edge(id,expression(raw.conclusion));for(const dep of raw.depends_on||[]){const prior=claims.find(p=>p.id===dep),p=prior?.graph||prior;if(p){for(const conclusion of p.conclusions||[])edge(literal(conclusion),id);if(p.conclusion)edge(expression(p.conclusion),id);}}}
 return {nodes,edges,schemefulfillments:[],descriptorfulfillments:[],participants:[],locutions:[],thread:{version:1,scenario:scenario.source_hash,scope:'AIF interchange; finite proof metadata remains in Thread’s JSON export'}};
}
export function toXAIF(scenario,claims=[]){return {AIF:toAIF(scenario,claims),dialog:false,OVA:{firstname:'',surname:'',url:'',nodes:[],edges:[]},text:claims.map(c=>c.text||c.graph?.text||'').join('\n')};}
export function canonicalExpressionKey(e){
 if(e.op==='atom')return 'atom:'+e.name;
 if(e.op==='const')return 'const:'+e.value;
 if(e.op==='answer')return 'answer:'+e.guard+':'+canonicalExpressionKey(e.proposition);
 return e.op+':'+[e.arg,e.left,e.right].filter(Boolean).map(canonicalExpressionKey).join('|');
}
