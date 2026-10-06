const CACHE='electronbench-v1.3.1-rc.1';
const FILES=['./','./index.html','./style.css','./polish.css','./polish.js','./network-core.js','./core.js','./app.js','./studio.js','./project-tools.js','./editor.js','./network-ui.js','./zip.js','./scenario-worker.js','./icon.svg','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('electronbench-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.includes('/api/'))return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));});
