// Pure, bounded transformations shared by the UI and worker.
export const AUDIO_DEFAULTS=Object.freeze({enabled:true,narration:true,cues:true,music:true,volume:0.35,rate:1});
export function audioPreferences(value={}){
 const result={...AUDIO_DEFAULTS};
 for(const key of ['enabled','narration','cues','music'])if(typeof value?.[key]==='boolean')result[key]=value[key];
 for(const [key,min,max] of [['volume',0,1],['rate',0.75,1.25]])if(Number.isFinite(value?.[key]))result[key]=Math.max(min,Math.min(max,value[key]));
 return result;
}
export function narrationChunks(text){
 if(typeof text!=='string'||text.length>20000)throw Error('This passage is too long to narrate at once.');
 const words=text.trim().split(/\s+/),chunks=[];let chunk='';
 for(const word of words){if(word.length>160)throw Error('This passage contains an unsupported long word.');if(chunk.length+word.length+1>180){chunks.push(chunk);chunk='';}chunk+=(chunk?' ':'')+word;if(/[.!?]$/.test(word)&&chunk.length>40){chunks.push(chunk);chunk='';}}
 if(chunk)chunks.push(chunk);return chunks;
}
export function validateRecording(samples){
 if(!(samples instanceof Float32Array)||samples.length<1600||samples.length>480000||samples.some(n=>!Number.isFinite(n)||Math.abs(n)>1.01))throw Error('Record between 0.1 and 30 seconds of audio.');
 const rms=Math.sqrt(samples.reduce((n,v)=>n+v*v,0)/samples.length);
 if(rms<0.002)throw Error('No clear audio was detected. Try again, or type your thought.');
 return samples;
}
export function downsample(samples,sourceRate){
 if(!Number.isFinite(sourceRate)||sourceRate<16000||sourceRate>192000)throw Error('Unsupported microphone sample rate.');
 const ratio=sourceRate/16000,out=new Float32Array(Math.min(480000,Math.floor(samples.length/ratio)));
 for(let i=0;i<out.length;i++){const start=Math.floor(i*ratio),end=Math.min(samples.length,Math.floor((i+1)*ratio));let sum=0;for(let j=start;j<end;j++)sum+=samples[j];out[i]=sum/Math.max(1,end-start);}
 return out;
}
export function appendTranscript(draft,transcript,max=2500){
 const text=[draft.trim(),transcript.trim()].filter(Boolean).join('\n');
 if(text.length>max)throw Error('The combined thought is too long. Shorten the transcript before adding it.');
 return text;
}
