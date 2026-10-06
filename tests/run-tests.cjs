/* Run: node tests/run-tests.cjs. Needs Node and g++ for generated-code checks. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const appDir=fs.existsSync(path.join(__dirname,'../dist/core.js'))?path.join(__dirname,'../dist'):path.join(__dirname,'..');
require(path.join(appDir,'core.js'));const E=globalThis.EB;
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'electronbench-test-'));
let count=0;const results=[];
function test(name,fn){try{fn();count++;results.push('PASS '+name);}catch(e){console.error('FAIL '+name);throw e;}}
function make(types,connections){const p=E.blank();p.nodes=types.map((t,i)=>E.makeNode(t,'n'+(i+1),i*250,100));p.edges=connections.map(([a,b,port='in'],i)=>({id:'e'+(i+1),from:'n'+a,to:'n'+b,port}));return p;}
function buildAndCompare(name,p,steps){
 const sim=E.createSimulation(p),lines=['#include <iostream>','#include <iomanip>',E.generate(p),'int main(){ setup(); std::cout << std::setprecision(9);'];
 const expected=[];
 for(const step of steps){for(const [id,v]of Object.entries(step.inputs||{})){sim.input[id]=v;const n=p.nodes.find(n=>n.id===id);if(n.type==='analog')lines.push(`analogInputs[${n.props.pin}] = ${v};`);else if(n.type==='button')lines.push(`digitalInputs[${n.props.pin}] = ${v?'LOW':'HIGH'};`);}
  sim.tick(step.t);lines.push(`testMillis=${step.t}UL; loop();`);for(const [i,n]of p.nodes.entries()){lines.push(`std::cout << v${i+1} << " ";`);expected.push(Number(sim.values[n.id]));
   const buffer={led:'digitalOutputs',pwm:'pwmOutputs',servo:'servoOutputs'}[n.type];if(buffer){lines.push(`std::cout << ${buffer}[${n.props.pin}] << " ";`);expected.push(n.type==='led'&&n.props.activeLow?Number(!sim.values[n.id]):Number(sim.values[n.id]));}
  }lines.push('std::cout << "\\n";');
 }
 lines.push('}');const source=path.join(temp,name+'.cpp'),binary=path.join(temp,name);fs.writeFileSync(source,lines.join('\n'));
 const compiled=spawnSync('g++',['-std=c++17','-Wall','-Wextra','-Werror','-I',__dirname,source,'-o',binary],{encoding:'utf8'});assert.equal(compiled.status,0,compiled.stderr||compiled.error?.message);
 const executed=spawnSync(binary,[],{encoding:'utf8'});assert.equal(executed.status,0,executed.stderr);const actual=executed.stdout.trim().split(/\s+/).map(Number);assert.equal(actual.length,expected.length);
 actual.forEach((n,i)=>assert.ok(Math.abs(n-expected[i])<=Math.max(.0001,Math.abs(expected[i])*.000001),`${name}: value ${i} is ${n}, expected ${expected[i]}`));
 return {source,expected};
}
test('all three starters survive JSON round trip and validate',()=>{for(const key of ['blink','servo','button']){const p=E.sample(key),back=E.importProject(JSON.parse(JSON.stringify(p)));assert.deepEqual(back,p);assert.equal(E.validate(p).valid,true);}});
test('blink boundary timing agrees with compiled C++',()=>buildAndCompare('blink',E.sample('blink'),[0,499,500,999,1000,1499,1500,100000].map(t=>({t}))));
test('ADC-to-servo endpoints and midpoint agree with compiled C++',()=>buildAndCompare('servo',E.sample('servo'),[0,1,127,511,512,1000,1023].map((v,i)=>({t:i*10,inputs:{n1:v}}))));
test('debounce, pulse expiration and held input agree with compiled C++',()=>{
 const p=E.sample('button');const steps=[{t:0},{t:10,inputs:{n1:true}},{t:20,inputs:{n1:false}},{t:25,inputs:{n1:true}},{t:59},{t:60},{t:1559},{t:1560},{t:2000},{t:2010,inputs:{n1:false}},{t:2045},{t:2050,inputs:{n1:true}},{t:2085}];
 buildAndCompare('button',p,steps);const s=E.createSimulation(p);for(const st of steps){Object.assign(s.input,st.inputs);s.tick(st.t);if(st.t===59)assert.equal(s.values.n4,false);if(st.t===60)assert.equal(s.values.n4,true);if(st.t===1560||st.t===2000)assert.equal(s.values.n4,false);if(st.t===2085)assert.equal(s.values.n4,true);}
});
test('logic and toggle nodes compile and match their preview',()=>{
 const p=make(['button','not','and','or','toggle','number','probe'],[[1,2],[1,3,'a'],[2,3,'b'],[1,4,'a'],[2,4,'b'],[1,5],[5,6],[6,7]]);
 buildAndCompare('logic',p,[{t:0},{t:100,inputs:{n1:true}},{t:200},{t:300,inputs:{n1:false}},{t:400,inputs:{n1:true}}]);
 const s=E.createSimulation(p);s.tick(0);assert.equal(s.values.n3,false);assert.equal(s.values.n4,true);s.input.n1=true;s.tick(100);assert.equal(s.values.n5,true);s.tick(200);assert.equal(s.values.n5,true);s.input.n1=false;s.tick(300);s.input.n1=true;s.tick(400);assert.equal(s.values.n5,false);
});
test('constant, reversed range, threshold, active-low and PWM compile',()=>{
 const p=make(['constant','map','threshold','led','pwm'],[[1,2],[2,3],[3,4],[2,5]]);p.nodes[0].props.value=512;p.nodes[1].props.outMin=255;p.nodes[1].props.outMax=0;p.nodes[2].props.value=100;p.nodes[3].props.activeLow=true;
 buildAndCompare('processing',p,[{t:0},{t:100}]);
});
test('PWM clamps and rounds its numeric input',()=>{const p=make(['analog','pwm'],[[1,2]]);buildAndCompare('pwm',p,[0,100,255,300,1023].map((v,i)=>({t:i*10,inputs:{n1:v}})));});
test('multiple independent devices compile in one project',()=>{const p=make(['clock','led','clock','led'],[[1,2],[3,4]]);p.nodes[3].props.pin='12';p.nodes[2].props.period=120;buildAndCompare('multi',p,[0,59,60,120,499,500].map(t=>({t})));});
test('type mismatch, missing input and cycles are blocked',()=>{
 let p=make(['constant','led'],[[1,2]]);assert.equal(E.validate(p).valid,false);assert.throws(()=>E.generate(p));
 p=make(['servo'],[]);assert.equal(E.validate(p).valid,false);
 p=make(['not','not'],[[1,2],[2,1]]);assert.equal(E.validate(p).valid,false);
});
test('pin duplication and Uno Servo/PWM Timer1 conflict are blocked',()=>{
 let p=make(['clock','led','led'],[[1,2],[1,3]]);assert.equal(E.validate(p).valid,false);
 p=make(['constant','servo','pwm'],[[1,2],[1,3]]);p.nodes[2].props.pin='10';assert.equal(E.validate(p).valid,false);p.nodes[2].props.pin='3';assert.equal(E.validate(p).valid,true);
});
test('multiple sources to one input and zero map range are blocked',()=>{
 let p=make(['clock','clock','led'],[[1,3],[2,3]]);assert.equal(E.validate(p).valid,false);
 p=E.sample('servo');p.nodes[1].props.inMin=p.nodes[1].props.inMax;assert.equal(E.validate(p).valid,false);
});
test('hostile imports cannot inject identifiers or numeric code',()=>{
 for(const modify of [p=>p.nodes[0].id='n1);system(0)',p=>p.nodes[0].props.period='system(0)',p=>p.nodes[0].props.period=Infinity,p=>p.nodes[0].props.period=1.5,p=>p.nodes[0].type='__proto__',p=>p.edges[0].from='missing',p=>p.schema=100]){const p=E.sample();modify(p);assert.throws(()=>E.importProject(p));}
 const p=E.sample();p.name='*/ void hack() {} /*';p.nodes[0].label='*/ #include <bad> /*';assert.ok(!E.generate(E.importProject(p)).includes('hack'));
});
test('invalid graphs remain recoverable through project export',()=>{const p=make(['servo'],[]);const restored=E.importProject(JSON.parse(JSON.stringify(p)));assert.equal(restored.nodes.length,1);assert.equal(E.validate(restored).valid,false);});
test('all original component types remain available',()=>{const types=new Set(['clock','led','analog','map','servo','button','debounce','pulse','not','and','or','toggle','number','probe','constant','threshold','pwm']);assert.ok([...types].every(t=>Object.hasOwn(E.defs,t)));});
test('local app files exist; HTML script and stylesheet links resolve',()=>{const html=fs.readFileSync(path.join(appDir,'index.html'),'utf8');for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const url=match[1];if(!url.includes(':'))assert.ok(fs.existsSync(path.join(appDir,url)),url);}assert.ok(!html.includes('https://'));});
const {graph,behaviors,feedback,uart}=require('./fixtures.cjs');
test('extended arithmetic and state blocks agree with compiled C++',()=>buildAndCompare('behaviors',behaviors(),[0,10,500,1000,1500,2000,2500].map(t=>({t}))));
test('explicit feedback memory agrees with compiled C++ across tick boundaries',()=>{const p=feedback();buildAndCompare('feedback',p,[0,5,10,19,20,30,100].map(t=>({t})));const s=E.createSimulation(p);s.tick(0);assert.equal(s.values.n1,0);s.tick(5);assert.equal(s.values.n1,0);s.tick(10);assert.equal(s.values.n1,1);});
test('Boolean feedback has one-tick delay and remains deterministic',()=>{const g=graph(),m=g.add('boolMemory'),invert=g.add('not');g.link(m,invert);g.link(invert,m);buildAndCompare('boolFeedback',g.p,[0,5,10,20,30].map(t=>({t})));const s=E.createSimulation(g.p);s.tick(0);assert.equal(s.values[m.id],false);s.tick(10);assert.equal(s.values[m.id],true);s.tick(20);assert.equal(s.values[m.id],false);});
test('state blocks respond to input transitions and reset precedence',()=>{const g=graph(),button=g.add('button'),reset=g.add('button',{pin:'3'}),adc=g.add('analog'),hy=g.add('hysteresis'),smooth=g.add('smooth'),rise=g.add('rising'),fall=g.add('falling'),count=g.add('counter',{limit:2}),latch=g.add('latch'),seq=g.add('sequence',{durations:'20,30',repeat:false});g.link(adc,hy);g.link(adc,smooth);for(const n of [rise,fall,count,seq])g.link(button,n);g.link(button,latch,'set');for(const n of [count,latch,seq])g.link(reset,n,'reset');buildAndCompare('stateTransitions',g.p,[{t:0,inputs:{n3:400}},{t:10,inputs:{n1:true,n3:600}},{t:20,inputs:{n1:false,n3:500}},{t:30},{t:40,inputs:{n3:400}},{t:60},{t:70,inputs:{n1:true,n2:true}},{t:80,inputs:{n1:false,n2:false}},{t:90,inputs:{n1:true}}]);});
test('failed sensors are visible and PWM fails low in preview',()=>{const g=graph(),sensor=g.add('mcp9808'),valid=g.add('valid'),pwm=g.add('pwm');g.link(sensor,valid);g.link(sensor,pwm);const s=E.createSimulation(g.p);s.input[sensor.id]=null;s.tick(0);assert.ok(Number.isNaN(s.values[sensor.id]));assert.equal(s.values[valid.id],false);assert.equal(s.values[pwm.id],0);s.input[sensor.id]=25;s.tick(250);assert.equal(s.values[valid.id],true);assert.equal(s.values[pwm.id],25);});
test('scenarios distinguish success, assertion failure, missing inputs, and empty tests',()=>{const p=E.sample(),t={name:'Clock boundaries',duration:1000,events:[],assertions:[{time:0,node:'n2',value:true},{time:500,node:'n2',value:false},{time:1000,node:'n2',value:true}]};assert.equal(E.runScenario(p,t).pass,true);assert.throws(()=>E.runScenario(p,{...t,assertions:[{time:0,node:'n2',value:null}]}));t.assertions[0].value=false;assert.equal(E.runScenario(p,t).pass,false);assert.equal(E.runScenario(p,{...t,assertions:[]}).pass,false);assert.throws(()=>E.runScenario(p,{...t,events:[{time:0,node:'n999',value:3}]}));});
test('schema 1 migrates and separates previous assumption notes from evidence',()=>{const p=E.sample();p.schema=1;delete p.settings;delete p.assumptions;p.evidence=[{kind:'Assumption',note:'5 V input',date:''},{kind:'Physical board test',note:'observed LED',date:''}];const back=E.importProject(p);assert.equal(back.schema,2);assert.equal(back.assumptions.length,1);assert.equal(back.evidence.length,1);assert.equal(back.settings.telemetry,false);});
test('board bus, timer, and unsupported-pin conflicts block builds',()=>{let g=graph();g.add('mcp9808');g.add('analog',{pin:'A4'});assert.equal(E.validate(g.p).valid,false);g=graph();g.add('mcp9808');g.add('mcp9808');assert.equal(E.validate(g.p).valid,false);g=graph('esp32-devkitc');g.add('uart');g.add('button',{pin:'16'});assert.equal(E.validate(g.p).valid,false);const p=E.sample('servo');p.board='esp32-devkitc';assert.equal(E.validate(p).valid,false);});
test('ZIP bundle decodes with an independent archive reader',()=>{require(path.join(appDir,'zip.js'));const file=path.join(temp,'bundle.zip');fs.writeFileSync(file,globalThis.EBZip.pack({'project.json':'{"name":"°C sensor"}','sketch/sketch.ino':'void setup() {}'}));const result=spawnSync('python3',['-c','import sys,zipfile; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; assert len(z.namelist())==2; assert "°C sensor" in z.read("project.json").decode()',file],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);});
test('UART parser accepts CRLF and rejects malformed or oversized readings',()=>{const source=path.join(temp,'uart.cpp'),binary=path.join(temp,'uart');fs.writeFileSync(source,'#include <cassert>\n'+E.generate(uart())+'\nint main(){setup();Serial1.incoming="12.5\\r\\n";loop();assert(v1==12.5f);Serial1.incoming="bad\\n";loop();assert(isnan(v1));Serial1.incoming=std::string(40,char(49))+"\\n";loop();loop();assert(isnan(v1));Serial1.incoming="-8\\n";loop();assert(v1==-8.0f);}');const c=spawnSync('g++',['-std=c++17','-Wall','-Wextra','-Werror','-I',__dirname,source,'-o',binary],{encoding:'utf8'});assert.equal(c.status,0,c.stderr);assert.equal(spawnSync(binary).status,0);});
console.log(results.join('\n'));console.log(`\n${count} test groups passed. Generated code compiled and executed against host API doubles, not an AVR toolchain or real hardware.`);
fs.rmSync(temp,{recursive:true,force:true});
