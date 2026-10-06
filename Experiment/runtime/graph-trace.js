// A scope may make many established roots available. Show only prior claims
// whose conclusions actually occur as leaves of its returned derivation.
export function tracedDependencies(scope,result,accepted){
 if(!scope.atom_map)return scope.inferred_dependencies||[];
 const used=new Set(),queue=[...(result.trace||[])];
 while(queue.length){const node=queue.pop();if(node.kind==='fact'){const m=/^(pos|neg)\((a\d+)\)$/.exec(node.atom);if(m&&scope.atom_map[m[2]])used.add(scope.atom_map[m[2]]+':'+(m[1]==='pos'));}else queue.push(...(node.premises||[]));}
 const available=new Set(scope.inferred_dependencies||[]);
 return accepted.filter(c=>available.has(c.id)&&c.conclusions?.some(p=>used.has(p.id+':'+p.positive))).map(c=>c.id);
}
