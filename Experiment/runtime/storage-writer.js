// Stream OPFS writes with backpressure. Older WebKit needs a dedicated worker.
export async function openFileWriter(name,{keepExistingData=false,forceSync=false}={}){
 const root=await navigator.storage.getDirectory();
 const handle=await root.getFileHandle(name,{create:true});
 if(!forceSync&&typeof handle.createWritable==='function'){
  const writer=await handle.createWritable({keepExistingData});
  return {backend:'writable-stream',seek:position=>writer.seek(position),write:bytes=>writer.write(bytes),close:()=>writer.close()};
 }
 const worker=new Worker('/Experiment/runtime/storage-worker.js',{type:'module'});
 let sequence=0,closed=false;const pending=new Map();
 const fail=error=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(error);}pending.clear();worker.terminate();closed=true;};
 worker.onerror=e=>fail(Error(e.message||'Device storage worker failed.'));
 worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;pending.delete(data.id);clearTimeout(p.timer);data.error?p.reject(Error(data.error)):p.resolve(data.result);};
 const call=(op,args={},transfer=[])=>new Promise((resolve,reject)=>{
  if(closed)return reject(Error('Device storage writer is closed.'));
  const id=++sequence,timer=setTimeout(()=>fail(Error('Device storage operation timed out. Retry the download.')),30000);
  pending.set(id,{resolve,reject,timer});worker.postMessage({id,op,...args},transfer);
 });
 try{await call('open',{name,keepExistingData});}catch(e){fail(e);throw e;}
 return {backend:'sync-access-worker',seek:position=>call('seek',{position}),write:bytes=>{
  // Transfer a single copied chunk; callers may still hash their original view.
  const copy=new Uint8Array(bytes).slice();return call('write',{bytes:copy},[copy.buffer]);
 },close:async()=>{if(closed)return;try{await call('close');}finally{closed=true;worker.terminate();}}};
}

export async function probeStorage({forceSync=false}={}){
 const name='thread-storage-probe-'+crypto.randomUUID(),root=await navigator.storage.getDirectory();let writer;
 try{
  writer=await openFileWriter(name,{forceSync});const backend=writer.backend;
  await writer.write(new TextEncoder().encode('local storage'));
  await writer.close();writer=null;
  const file=await(await root.getFileHandle(name)).getFile();
  if(await file.text()!=='local storage')throw Error('The device could not preserve the storage probe.');
  return {backend};
 }finally{await writer?.close().catch(()=>{});await root.removeEntry(name).catch(()=>{});}
}

export async function probeResume(){
 const name='thread-resume-probe-'+crypto.randomUUID(),root=await navigator.storage.getDirectory();let writer;
 try{
  // Several chunks, a closed/reopened handle and a resumed offset, without a
  // model-sized allocation. This is an API-path test, not iOS emulation.
  const original=new Uint8Array(65536).fill(41);
  writer=await openFileWriter(name,{forceSync:true});
  for(let i=0;i<8;i++)await writer.write(original);
  if(original.byteLength!==65536||original[0]!==41)throw Error('Writing detached or changed the hashing buffer');
  await writer.close();writer=await openFileWriter(name,{forceSync:true,keepExistingData:true});
  await writer.seek(8*original.length);await writer.write(new Uint8Array([42,43]));await writer.close();writer=null;
  const bytes=new Uint8Array(await(await(await root.getFileHandle(name)).getFile()).arrayBuffer());
  if(bytes.length!==524290||bytes.slice(0,524288).some(b=>b!==41)||bytes[524288]!==42||bytes[524289]!==43)throw Error('Resumed file differs from expected bytes');
  return {backend:'sync-access-worker',bytes:bytes.length,resumeOffset:524288,hashingBufferPreserved:true};
 }finally{await writer?.close().catch(()=>{});await root.removeEntry(name).catch(()=>{});}
}
