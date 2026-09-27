// The schema subset used by the compiler, with bounded recursion and no coercion.
export function validateOutput(value,schema,dependencies=[]){
 const root=schema;let nodes=0;
 function check(value,s,path,depth=0){
  const fail=reason=>({field:path,reason});
  if(depth>64||++nodes>8192)return fail('output exceeds structural limit');
  if(s.$ref){if(!s.$ref.startsWith('#/'))return fail('unsupported schema reference');let target=root;for(const part of s.$ref.slice(2).split('/'))target=target?.[part];return target?check(value,target,path,depth+1):fail('unknown schema reference');}
  if(s.oneOf){const branches=s.oneOf.filter(x=>!check(value,x,path,depth+1));return branches.length===1?null:fail('expected exactly one allowed shape');}
  if('const'in s&&value!==s.const)return fail('unexpected literal');
  if(s.enum&&!s.enum.includes(value))return fail('not an allowed value');
  const kind=value===null?'null':Array.isArray(value)?'array':typeof value;
  if(s.type&&kind!==s.type)return fail('expected '+s.type);
  if(kind==='object'){
   for(const key of s.required||[])if(!Object.hasOwn(value,key))return {field:path+'.'+key,reason:'required field missing'};
   for(const [key,v]of Object.entries(value)){if(!s.properties?.[key]){if(s.additionalProperties===false)return {field:path,reason:'unknown field'};}else{const error=check(v,s.properties[key],path+'.'+key,depth+1);if(error)return error;}}
  }
  if(kind==='array'){if(value.length>(s.maxItems??128))return fail('too many items');if(value.length<(s.minItems??0))return fail('too few items');if(s.items)for(let i=0;i<value.length;i++){const e=check(value[i],s.items,path+'['+i+']',depth+1);if(e)return e;}}
  if(kind==='string'&&value.length>(s.maxLength??4000))return fail('text too long');
  return null;
 }
 const error=check(value,schema,'$');if(error)return error;
 if(value?.depends_on?.some(id=>!dependencies.includes(id)))return {field:'$.depends_on',reason:'reference is not a confirmed prior claim'};
 if(value?.depends_on&&(value.depends_on.length>32||new Set(value.depends_on).size!==value.depends_on.length))return {field:'$.depends_on',reason:'use at most 32 distinct confirmed references'};
 if((value?.conclusion||value?.proposition)&&value.assumptions?.length>12)return {field:'$.assumptions',reason:'explain at most 12 assumptions in one step'};
 const roots=[['$.conclusion',value?.conclusion],['$.proposition',value?.proposition],['$.strategy.question',value?.strategy?.question],...(value?.assumptions||[]).map((x,i)=>['$.assumptions['+i+']',x])];
 for(const [field,expr]of roots){if(!expr?.op)continue;let budget=128;const bounded=(x,depth=0)=>{if(depth>12||--budget<0)return false;return ['arg','left','right','proposition'].every(k=>!x[k]||bounded(x[k],depth+1));};if(!bounded(expr))return {field,reason:'expression exceeds 12 levels or 128 nodes; explain one smaller step'};}
 if(typeof value?.message==='string'&&(!value.message.trim()||value.message.length>1500))return {field:'$.message',reason:'expected a nonempty message of at most 1500 characters'};
 if(value?.action==='claim'&&Array.isArray(value.conclusions)&&!value.conclusions.length)return {field:'$.conclusions',reason:'a claim needs at least one stated conclusion'};
 return null;
}
export function dependencyIds(request){const text=request.messages?.filter(m=>m.role==='user').at(-1)?.content;try{const context=JSON.parse(text);return (context.confirmed_prior_claims||context.previous_claims||context.prior_claims||[]).map(c=>c.id);}catch{return [];}}
