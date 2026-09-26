let worker,seq=0;const requests=new Map();
export function compile(payload){
 if(!worker){worker=new Worker('/Experiment/runtime/compiler-worker.js',{type:'module'});worker.onmessage=({data})=>{const r=requests.get(data.id);if(r){clearTimeout(r.timer);requests.delete(data.id);data.error?r.reject(Error(data.error)):r.resolve(data.result);}};worker.onerror=e=>{for(const r of requests.values()){clearTimeout(r.timer);r.reject(Error(e.message));}requests.clear();worker.terminate();worker=null;};}
 return new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{requests.delete(id);reject(Error('Logic compiler timed out'));},90000);requests.set(id,{resolve,reject,timer});worker.postMessage({id,payload});});
}
