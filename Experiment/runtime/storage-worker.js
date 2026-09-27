// FileSystemSyncAccessHandle is only available inside a dedicated worker.
let handle,position=0,queue=Promise.resolve();
async function dispatch(data){
 if(data.op==='open'){
  const root=await navigator.storage.getDirectory(),file=await root.getFileHandle(data.name,{create:true});
  if(typeof file.createSyncAccessHandle!=='function')throw Error('This browser cannot write offline files. Update the browser/OS and use a regular browsing window.');
  handle=await file.createSyncAccessHandle();
  if(!data.keepExistingData)await handle.truncate(0);
  position=0;return;
 }
 if(!handle)throw Error('Device storage handle is not open.');
 if(data.op==='seek'){
  if(!Number.isSafeInteger(data.position)||data.position<0)throw Error('Invalid storage position.');
  position=data.position;return;
 }
 if(data.op==='write'){
  const bytes=data.bytes;let done=0;
  while(done<bytes.byteLength){const n=await handle.write(bytes.subarray(done),{at:position});if(!Number.isInteger(n)||n<=0||n>bytes.byteLength-done)throw Error('The device could not finish writing this download chunk.');done+=n;position+=n;}
  return;
 }
 if(data.op==='close'){try{await handle.flush();}finally{await handle.close();handle=null;}return;}
 throw Error('Unknown storage operation.');
}
self.onmessage=({data})=>{queue=queue.then(async()=>{
 try{const result=await dispatch(data);postMessage({id:data.id,result});}
 catch(e){try{await handle?.flush();}catch{}try{await handle?.close();}catch{}handle=null;postMessage({id:data.id,error:e.message});}
});};
