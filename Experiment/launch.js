// Classic script so a file:// entry can explain setup before module loading fails.
(() => {
 const entry=document.currentScript.dataset.module;
 if(location.protocol!=='file:'&&window.isSecureContext){
  const start=()=>{const script=document.createElement('script');script.type='module';script.src=entry;document.head.append(script);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();return;
 }
 document.documentElement.style.visibility='hidden';
 document.addEventListener('DOMContentLoaded',()=>{
  const file=location.protocol==='file:';
  document.title='Open Thread';
  document.body.innerHTML='<main style="max-width:650px;margin:10vh auto;padding:28px;font:18px/1.6 system-ui;color:#24382e;background:#f6f5f0;border-radius:18px"><p>THREAD · GETTING STARTED</p><h1>'+ (file?'Launch Thread through its local server':'Use HTTPS on this device')+'</h1><p>'+(file?'This app uses browser workers and offline storage, so opening index.html directly cannot start gameplay.':'This network address uses ordinary HTTP. Gemma, offline installation and storage require a secure browser context.')+'</p>'+(file?'<ol><li>Extract the whole distribution folder.</li><li>Open <strong>Thread.exe</strong> in the folder beside <strong>web</strong>.</li><li>In Opera GX or your preferred browser, open the address below.</li></ol><p><a href="http://127.0.0.1:8765/">Open Thread at http://127.0.0.1:8765/</a></p>':'<p>Ask the host to serve Thread over HTTPS using a certificate trusted by this device. Use the HTTPS hostname or IP address listed in that certificate.</p><p>For this computer only, <a href="http://127.0.0.1:8765/">localhost</a> also works.</p>')+'<p>Once installed through Device setup, the app can run offline. See START-HERE.md in the distribution for setup and network instructions.</p></main>';
  document.documentElement.style.visibility='visible';
 });
})();
