// Streaming is a progress signal, never a partial interpretation or a proof.
// Nothing leaves the worker until the entire JSON object passes schema checks.
export async function collectModelOutput(conversation,message,onProgress=()=>{}){
 const started=performance.now();let firstChunkSeconds=null,firstTextSeconds=null,chunkCount=0,lastNotice=0,content='',total=0;
 const channels={};
 const append=chunk=>{
  chunkCount++;firstChunkSeconds??=(performance.now()-started)/1000;
  const text=typeof chunk.content==='string'?chunk.content:(chunk.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('');
  if(text)firstTextSeconds??=(performance.now()-started)/1000;
  total+=text.length;
  for(const [name,value] of Object.entries(chunk.channels||{})){const length=String(value).length;total+=length;channels[name]=(channels[name]||0)+length;}
  if(total>32768)throw Object.assign(Error('Gemma exceeded the interpretation size limit. My draft is kept.'),{code:'output_limit'});
  content+=text;
  if(text&&performance.now()-lastNotice>1500){lastNotice=performance.now();onProgress('Receiving my interpretation… It will be checked before review.');}
 };
 const streamed=typeof conversation.sendMessageStreaming==='function';
 if(streamed){
  const reader=conversation.sendMessageStreaming(message).getReader();
  try{while(true){const {done,value}=await reader.read();if(done)break;append(value);}}
  catch(e){await reader.cancel().catch(()=>{});throw e;}
  finally{reader.releaseLock();}
 }else append(await conversation.sendMessage(message));
 return {content,channels,metrics:{streamed,chunkCount,firstChunkSeconds,firstTextSeconds}};
}
