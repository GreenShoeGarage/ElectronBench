importScripts('./network-core.js','./core.js');
self.onmessage=({data})=>{try{const p=EB.importProject(data.project);postMessage({result:EB.runScenario(p,data.scenario)});}catch(e){postMessage({error:e.message});}};
