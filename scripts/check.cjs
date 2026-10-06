const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),web=fs.existsSync(path.join(root,'dist'))?path.join(root,'dist'):root;
for(const folder of [web,path.join(root,'companion'),path.join(root,'tests'),path.join(root,'scripts')])for(const name of fs.readdirSync(folder)){if(!/\.(c?js|mjs)$/.test(name))continue;const p=path.join(folder,name);const result=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);}
require(path.join(web,'core.js'));const version=globalThis.EB.VERSION;
assert.equal(JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version,version);
assert.ok(fs.readFileSync(path.join(web,'index.html'),'utf8').includes('v'+version));assert.ok(fs.readFileSync(path.join(web,'sw.js'),'utf8').includes('electronbench-v'+version));
console.log('PASS JavaScript syntax, package version, visible version, and cache version:',version);
