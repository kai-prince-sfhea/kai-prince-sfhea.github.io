import {loadPyodide} from '/Experiment/vendor/pyodide/pyodide.mjs';
let initialized;
async function init(){
 const py=await loadPyodide({indexURL:'/Experiment/vendor/pyodide/'});
 const files=await (await fetch('/Experiment/data/compiler.json')).json();
 py.FS.mkdirTree('/app');
 for(const [p,source] of Object.entries(files)){const path='/app/'+p;py.FS.mkdirTree(path.slice(0,path.lastIndexOf('/')));py.FS.writeFile(path,source);}
 py.runPython("import sys; sys.path.insert(0,'/app')");
 await py.runPythonAsync(await (await fetch('/Experiment/runtime/bridge.py')).text());return py;
}
self.onmessage=async({data:{id,payload}})=>{
 try{const py=await(initialized??=init());py.globals.set('input_json',JSON.stringify(payload));const result=py.runPython('bridge(input_json)');postMessage({id,result:JSON.parse(result)});}
 catch(e){postMessage({id,error:e.message});}
};
