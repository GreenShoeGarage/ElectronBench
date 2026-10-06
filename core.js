/* ELECTRONBENCH — GPL-3.0-only */
(function(root){
'use strict';
const N=root.EBNetCore||(typeof require==='function'?require('./network-core.js'):null);
const VERSION='1.3.1-rc.1', SCHEMA=2;
const param=(label,value,min,max,step=1)=>({label,value,min,max,step,kind:'number'});
const pin=(label,value,options)=>({label,value,options,kind:'select'});
const digital=Array.from({length:12},(_,i)=>String(i+2)), analog=['A0','A1','A2','A3','A4','A5'];
const bool=(label,value)=>({label,value,kind:'checkbox'});
const text=(label,value,maxLength=120)=>({label,value,maxLength,kind:'text'});
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>String(a+i));
const boards={
 'uno-r3':{name:'Arduino Uno R3',fqbn:'arduino:avr:uno',platform:'arduino:avr',core:'1.8.6',voltage:5,adcMax:1023,digital:range(2,13),analog:analog,pwm:['3','5','6','9','10','11'],i2c:['A4','A5'],spi:['11','12','13'],description:'ATmega328P / 16 MHz / 2 KB SRAM',ram:2048,servoLimit:12,servoConflict:['9','10'],uart:[]},
 'nano-classic':{name:'Arduino Nano (classic)',fqbn:'arduino:avr:nano:cpu=atmega328',platform:'arduino:avr',core:'1.8.6',voltage:5,adcMax:1023,digital:range(2,13),analog:[...analog,'A6','A7'],pwm:['3','5','6','9','10','11'],i2c:['A4','A5'],spi:['11','12','13'],description:'ATmega328P / new bootloader / 2 KB SRAM',ram:2048,servoLimit:12,servoConflict:['9','10'],uart:[]},
 'mega-2560':{name:'Arduino Mega 2560',fqbn:'arduino:avr:mega:cpu=atmega2560',platform:'arduino:avr',core:'1.8.6',voltage:5,adcMax:1023,digital:range(2,53),analog:range(0,15).map(n=>'A'+n),pwm:[...range(2,13),'44','45','46'],i2c:['20','21'],spi:['50','51','52'],description:'ATmega2560 / 16 MHz / 8 KB SRAM',ram:8192,servoLimit:48,servoConflict:['44','45','46'],uart:['1','2','3']},
 'esp32-devkitc':{name:'ESP32 DevKitC · WROOM-32',fqbn:'esp32:esp32:esp32',platform:'esp32:esp32',core:'3.3.2',index:'https://espressif.github.io/arduino-esp32/package_esp32_index.json',voltage:3.3,adcMax:4095,digital:['16','17','18','19','21','22','23','25','26','27','32','33'],analog:['32','33','34','35','36','39'],pwm:['16','17','18','19','21','22','23','25','26','27','32','33'],i2c:['21','22'],spi:['18','19','23'],description:'Classic ESP32 / 3.3 V / ADC1 pins only',ram:327680,servoLimit:8,servoConflict:[],uart:['2']}
};
const board=p=>boards[typeof p==='string'?p:p.board]||boards['uno-r3'];
const isESP=p=>board(p).platform==='esp32:esp32';
boards['esp32-s3-devkitc']={...boards['esp32-devkitc'],name:'ESP32-S3 DevKitC-1 · N8/N8R8',fqbn:'esp32:esp32:esp32s3:FlashSize=8M,PSRAM=disabled,CDCOnBoot=default',digital:range(4,18),analog:['1','2','4','5','6','7','8','9','10'],pwm:range(4,18),i2c:['8','9'],spi:['12','13','11'],description:'ESP32-S3 / 8 MB QSPI flash / PSRAM disabled / USB-to-UART port',ram:327680};

const defs={
 clock:{name:'Clock',group:'Inputs',symbol:'◷',color:'green',out:'boolean',help:'A repeating HIGH / LOW signal. Period is a complete cycle; duty is the HIGH portion.',params:{period:param('Period · ms',1000,20,3600000),duty:param('Duty · %',50,1,99)}},
 button:{name:'Button',group:'Inputs',symbol:'↥',color:'green',out:'boolean',help:'Connect a normally open button between the selected pin and GND. Uses the internal pull-up: pressed = true.',params:{pin:pin('Digital pin','2',digital)}},
 analog:{name:'Analog input',group:'Inputs',symbol:'∿',color:'amber',out:'number',help:'Read the target ADC range: 0–1023 on AVR, 0–4095 on classic ESP32. A potentiometer connects between the board logic supply and GND, with its wiper at this pin. Use 3.3 V maximum on ESP32 inputs.',params:{pin:pin('Analog pin','A0',analog)}},
 constant:{name:'Constant',group:'Inputs',symbol:'#',color:'amber',out:'number',help:'A fixed numeric value.',params:{value:param('Value',90,-1000000,1000000,.1)}},
 map:{name:'Map range',group:'Processing',symbol:'↔',color:'amber',inputs:{in:'number'},out:'number',help:'Translate one numeric range into another. Reversed ranges are supported; the input bounds must differ.',params:{inMin:param('Input minimum',0,-1000000,1000000,.1),inMax:param('Input maximum',1023,-1000000,1000000,.1),outMin:param('Output minimum',0,-1000000,1000000,.1),outMax:param('Output maximum',180,-1000000,1000000,.1),clamp:bool('Clamp to output range',true)}},
 threshold:{name:'Threshold',group:'Processing',symbol:'≥',color:'green',inputs:{in:'number'},out:'boolean',help:'True when the input is greater than or equal to the threshold.',params:{value:param('Threshold',512,-1000000,1000000,.1)}},
 debounce:{name:'Debounce',group:'Processing',symbol:'⌁',color:'green',inputs:{in:'boolean'},out:'boolean',help:'Accept a change only after the input has stayed stable for this interval. Initial output is false.',params:{delay:param('Stable interval · ms',35,1,60000)}},
 not:{name:'NOT',group:'Logic',symbol:'¬',color:'green',inputs:{in:'boolean'},out:'boolean',help:'Invert a true / false signal.',params:{}},
 and:{name:'AND',group:'Logic',symbol:'&',color:'green',inputs:{a:'boolean',b:'boolean'},out:'boolean',help:'True only when both inputs are true.',params:{}},
 or:{name:'OR',group:'Logic',symbol:'∨',color:'green',inputs:{a:'boolean',b:'boolean'},out:'boolean',help:'True when either input is true.',params:{}},
 pulse:{name:'Timed pulse',group:'Logic',symbol:'▔',color:'green',inputs:{in:'boolean'},out:'boolean',help:'A rising edge starts a pulse. Another rising edge restarts the duration. Holding an input does not retrigger it.',params:{duration:param('Duration · ms',1500,1,3600000)}},
 toggle:{name:'Toggle',group:'Logic',symbol:'⇄',color:'green',inputs:{in:'boolean'},out:'boolean',help:'Change between false and true on each rising edge. Initial output is false.',params:{}},
 number:{name:'Boolean → number',group:'Processing',symbol:'01',color:'amber',inputs:{in:'boolean'},out:'number',help:'Convert false to 0 and true to 1.',params:{}},
 led:{name:'Digital output',group:'Outputs',symbol:'◉',color:'green',inputs:{in:'boolean'},help:'Drive a digital output. For the built-in Uno LED choose D13. External LEDs need a current-limiting resistor.',params:{pin:pin('Digital pin','13',digital),activeLow:bool('Active LOW',false)}},
 pwm:{name:'PWM output',group:'Outputs',symbol:'▥',color:'amber',inputs:{in:'number'},help:'Set duty from 0 to 255. Values are clamped and rounded. PWM is a pulse train, not a true analog voltage.',params:{pin:pin('PWM pin','3',['3','5','6','9','10','11'])}},
 servo:{name:'Servo',group:'Outputs',symbol:'◴',color:'amber',inputs:{in:'number'},help:'Command 0–180 degrees. Values are clamped and rounded. Use a suitable servo supply with common GND; preview shows commanded angle, not measured position.',params:{pin:pin('Signal pin','9',digital)}},
 probe:{name:'Serial value',group:'Outputs',symbol:'⌁',color:'amber',inputs:{in:'number'},help:'Print a numeric reading in JSON frames at 115200 baud. The target settings control the interval (100 ms by default). Live instruments can chart these readings.',params:{}}
};
Object.assign(defs,{
 boolean:{name:'Boolean constant',group:'Inputs',symbol:'TF',color:'green',out:'boolean',help:'A fixed true or false signal; useful for reset inputs or enabling a behavior.',params:{value:bool('Value',false)}},
 math:{name:'Arithmetic',group:'Processing',symbol:'±',color:'amber',inputs:{a:'number',b:'number'},out:'number',help:'Add, subtract, multiply, divide, or take min/max. Division by zero produces NaN; use Is valid to guard an actuator.',params:{operation:pin('Operation','add',['add','subtract','multiply','divide','min','max'])}},
 clamp:{name:'Clamp',group:'Processing',symbol:'⌈⌉',color:'amber',inputs:{in:'number'},out:'number',help:'Limit a numeric signal to lower and upper bounds.',params:{low:param('Minimum',0,-1e6,1e6,.1),high:param('Maximum',255,-1e6,1e6,.1)}},
 smooth:{name:'Smooth',group:'Processing',symbol:'≈',color:'amber',inputs:{in:'number'},out:'number',help:'Time-based first-order low-pass filter. Initializes to the first valid reading; invalid readings clear the filter.',params:{tau:param('Time constant · ms',200,1,60000)}},
 hysteresis:{name:'Hysteresis',group:'Processing',symbol:'⇵',color:'green',inputs:{in:'number'},out:'boolean',help:'Switch on at the upper threshold and off at the lower threshold. Starts off. Invalid input switches off.',params:{low:param('Switch off below',400,-1e6,1e6,.1),high:param('Switch on above',600,-1e6,1e6,.1)}},
 valid:{name:'Is valid',group:'Processing',symbol:'✓',color:'green',inputs:{in:'number'},out:'boolean',help:'True only when the numeric input is finite. Use to guard outputs when a sensor is unavailable.',params:{}},
 select:{name:'Select value',group:'Processing',symbol:'?',color:'amber',inputs:{condition:'boolean',a:'number',b:'number'},out:'number',help:'Output A when the condition is true; otherwise output B.',params:{}},
 rising:{name:'Rising edge',group:'Logic',symbol:'↗',color:'green',inputs:{in:'boolean'},out:'boolean',help:'True for one evaluation when the input changes from false to true.',params:{}},
 falling:{name:'Falling edge',group:'Logic',symbol:'↘',color:'green',inputs:{in:'boolean'},out:'boolean',help:'True for one evaluation when the input changes from true to false.',params:{}},
 counter:{name:'Counter',group:'Logic',symbol:'123',color:'amber',inputs:{in:'boolean',reset:'boolean'},out:'number',help:'Count rising edges. Reset takes precedence; the counter stops at its limit.',params:{limit:param('Maximum count',1000,1,1000000)}},
 latch:{name:'Set / reset',group:'Logic',symbol:'SR',color:'green',inputs:{set:'boolean',reset:'boolean'},out:'boolean',help:'Latch the set signal. Reset wins when both inputs are true. Starts false.',params:{}},
 memory:{name:'Sample delay',group:'Logic',symbol:'z⁻¹',color:'amber',inputs:{in:'number'},out:'number',deferred:true,advanced:true,help:'Output the previous 10 ms program tick. Breaks numeric feedback loops. Projects using a sample delay evaluate every 10 ms.',params:{initial:param('Initial value',0,-1e6,1e6,.1)}},
 boolMemory:{name:'Boolean delay',group:'Logic',symbol:'z⁻¹',color:'green',inputs:{in:'boolean'},out:'boolean',deferred:true,advanced:true,help:'Output the previous 10 ms program tick. Breaks Boolean feedback loops. Projects using this block evaluate every 10 ms.',params:{initial:bool('Initial state',false)}},
 sequence:{name:'Stage sequence',group:'Logic',symbol:'1→2',color:'amber',inputs:{in:'boolean',reset:'boolean'},out:'number',help:'A rising edge starts numbered stages, each with its own duration. Output is -1 while idle; reset wins. A new edge restarts the sequence.',params:{durations:text('Stage durations · ms, comma-separated','500,1000,500',500),repeat:bool('Repeat until reset',false)}},
 mcp9808:{name:'MCP9808 temperature',group:'Sensors & buses',symbol:'°C',color:'amber',out:'number',virtual:{min:-40,max:125,step:.1,value:22},i2c:true,help:'Read temperature in °C over I²C. Preview uses a virtual sensor. Failed reads produce NaN. Address 24–31 (0x18–0x1F).',params:{address:param('I²C address · decimal',24,24,31),interval:param('Read interval · ms',250,250,60000)}},
 bh1750:{name:'BH1750 light',group:'Sensors & buses',symbol:'☼',color:'amber',out:'number',virtual:{min:0,max:65000,step:1,value:500},i2c:true,help:'Read illuminance in lux over I²C. Addresses: 35 (0x23) or 92 (0x5C). Preview uses a virtual sensor.',params:{address:pin('I²C address','35',['35','92']),interval:param('Read interval · ms',200,180,60000)}},
 max31855:{name:'MAX31855 thermocouple',group:'Sensors & buses',symbol:'T',color:'amber',out:'number',virtual:{min:-200,max:1350,step:1,value:25},spi:true,help:'Read a MAX31855 thermocouple interface using the hardware SPI bus and a separate chip-select pin. Failed reads produce NaN.',params:{pin:pin('Chip-select pin','10',digital),interval:param('Read interval · ms',250,100,60000)}},
 oled:{name:'OLED numeric display',group:'Sensors & buses',symbol:'▣',color:'amber',inputs:{in:'number'},i2c:true,help:'Display a labeled value on an SSD1306 128×32 I²C OLED. Uses a 512-byte framebuffer. Invalid input displays ERR. Preview shows the commanded value.',params:{address:param('I²C address · decimal',60,60,61),label:text('Display label','Reading',20),interval:param('Refresh interval · ms',200,100,60000)}},
 uart:{name:'UART number input',group:'Sensors & buses',symbol:'RX',color:'amber',out:'number',virtual:{min:-1000,max:1000,step:.1,value:0},advanced:true,help:'Read newline-terminated numbers from a secondary hardware UART. Mega: Serial1/2/3. ESP32: Serial2 RX16/TX17. Invalid lines yield NaN.',params:{port:pin('UART channel','1',['1','2','3']),baud:pin('Baud rate','9600',['9600','19200','38400','57600','115200'])}},
 custom:{name:'Custom C++',group:'Processing',symbol:'</>',color:'amber',inputs:{in:'number'},out:'number',advanced:true,help:'Target-only C++ function body. Use input and now; return a number. Preview uses the explicit preview value and is marked as a stub. Custom code requires review before local compilation.',params:{body:{...text('C++ body','return input;',12000),kind:'code'},preview:param('Preview stub value',0,-1e6,1e6,.1)}}
});

Object.assign(defs,{
 bme280:{name:'BME280 environment',group:'Sensors & buses',symbol:'RH',color:'amber',out:'number',virtual:{min:-40,max:1200,step:.1,value:22},i2c:true,shared:true,help:'BME280 at 0x76 or 0x77. Select temperature (°C), relative humidity (%), or pressure (hPa). Nodes with the same address share one device. Not compatible with BMP280-only modules.',params:{address:pin('I²C address','118',['118','119']),measurement:pin('Measurement','temperature',['temperature','humidity','pressure']),interval:param('Read interval · ms',1000,250,60000)}},
 ina219:{name:'INA219 power monitor',group:'Sensors & buses',symbol:'V·A',color:'amber',out:'number',virtual:{min:-3200,max:26000,step:.1,value:5},i2c:true,shared:true,help:'INA219 with the Adafruit 32 V / 2 A calibration and a 0.1 Ω shunt. Select bus voltage (V), current (mA), or power (mW). Actual board input limit is 26 V. Match the shunt rating; this is not an isolated mains instrument.',params:{address:param('I²C address · decimal',64,64,79),measurement:pin('Measurement','voltage',['voltage','current','power']),interval:param('Read interval · ms',500,100,60000)}}
});
Object.assign(defs,N.definitions({param,pin,bool,text}));
for(const d of Object.values(defs))d.basic=d.basic??!d.advanced;
function virtual(n){const d=defs[n.type];if(n.type==='bme280')return{temperature:{min:-40,max:85,step:.1,value:22},humidity:{min:0,max:100,step:.1,value:50},pressure:{min:300,max:1100,step:.1,value:1013}}[n.props.measurement];if(n.type==='ina219')return{voltage:{min:0,max:26,step:.01,value:5},current:{min:-2000,max:2000,step:1,value:100},power:{min:0,max:52000,step:1,value:500}}[n.props.measurement];return d.virtual;}
function paramOptions(type,key,p){const b=board(p);if(key==='pin')return type==='analog'?b.analog:type==='pwm'?b.pwm:b.digital;if(type==='uart'&&key==='port')return b.uart;return defs[type].params[key]?.options||[];}
function durations(n){return String(n.props.durations).split(',').map(x=>Number(x.trim()));}
const clone=x=>JSON.parse(JSON.stringify(x));
function makeNode(type,id,x=80,y=100,target='uno-r3'){const d=defs[type];if(!Object.hasOwn(defs,type))throw Error('Unknown component');const n={id,type,label:d.name,x,y,props:Object.fromEntries(Object.entries(d.params).map(([k,p])=>[k,p.value]))};for(const [k,f]of Object.entries(d.params)){if(f.kind==='select'){const options=paramOptions(type,k,target);if(options.length&&!options.includes(n.props[k]))n.props[k]=options[0];}}if(type==='analog'&&isESP(target))n.props.pin=board(target).analog[0];return n;}
function blank(){return{format:'electronbench',schema:SCHEMA,version:VERSION,name:'Untitled instrument',board:'uno-r3',nodes:[],edges:[],view:{x:0,y:0,zoom:1},notes:'',network:N.defaults(),settings:{i2cClock:100000,telemetry:false,telemetryInterval:100,nanoOldBootloader:false},scenarios:[],modules:[],revisions:[],evidence:[],assumptions:[]};}
function sample(which='blink'){
 const p=blank();let types;
 if(which==='servo'){p.name='Follow the dial';p.notes='Potentiometer: ends to 5 V and GND; wiper to A0. Servo signal to D9. Use a suitable servo supply and common GND.';types=['analog','map','servo'];}
 else if(which==='button'){p.name='One press, one pulse';p.notes='Button between D2 and GND (internal pull-up). Pressing produces a 1.5-second pulse on the built-in LED.';types=['button','debounce','pulse','led'];}
 else if(which==='sensor'){p.name='Temperature on the bench';p.notes='MCP9808 address 0x18 and SSD1306 128×32 OLED address 0x3C share SDA/SCL. Check voltage compatibility of your specific modules.';types=['mcp9808','oled'];p.settings.telemetry=true;}
 else {p.name='A little heartbeat';p.notes='Clock controls the built-in LED on D13. No external components required.';types=['clock','led'];}
 p.nodes=types.map((t,i)=>makeNode(t,'n'+(i+1),65+i*260,140));
 for(let i=1;i<p.nodes.length;i++)p.edges.push({id:'e'+i,from:p.nodes[i-1].id,to:p.nodes[i].id,port:'in'});
 return p;
}
function importProject(data,depth=0){
 if(!data||data.format!=='electronbench'||![1,SCHEMA].includes(data.schema))throw Error('Unsupported ELECTRONBENCH project schema. Supported: 1 and 2.');
 if(!Object.hasOwn(boards,data.board))throw Error('Unknown target board.');
 if(!Array.isArray(data.nodes)||!Array.isArray(data.edges)||data.nodes.length>500||data.edges.length>1000)throw Error('Invalid or oversized project.');
 const p=blank();p.board=data.board;p.name=String(data.name||'Untitled instrument').slice(0,120);p.notes=String(data.notes||'').slice(0,20000);
 p.network=N.normalize(data.network);
 const ids=new Set();
 p.nodes=data.nodes.map(n=>{
  if(!n||!Object.hasOwn(defs,n.type)||!/^n[a-zA-Z0-9_-]{1,60}$/.test(n.id)||ids.has(n.id))throw Error('Unknown component or duplicate/invalid node ID.');
  ids.add(n.id);const v=makeNode(n.type,n.id,80,100,p.board);v.label=String(n.label||defs[n.type].name).slice(0,80);
  for(const k of ['x','y']){if(!Number.isFinite(n[k])||Math.abs(n[k])>20000)throw Error('Invalid component position.');v[k]=n[k];}
  if(n.group)v.group=String(n.group).slice(0,80);
  for(const [k,f]of Object.entries(defs[n.type].params)){
   const a=n.props?.[k];
   if(f.kind==='number'&&(!Number.isFinite(a)||a<f.min||a>f.max||(f.step===1&&!Number.isInteger(a))))throw Error('Invalid '+f.label+' on '+v.label);
   if(f.kind==='select'&&(k==='pin'?!/^(?:[0-9]{1,2}|A[0-9]{1,2})$/.test(a):!f.options.includes(a)))throw Error('Invalid '+f.label+' on '+v.label);
   if(f.kind==='checkbox'&&typeof a!=='boolean')throw Error('Invalid switch on '+v.label);
   if(['text','code'].includes(f.kind)&&(typeof a!=='string'||a.length>f.maxLength))throw Error('Invalid text on '+v.label);
   v.props[k]=a;
  }return v;
 });
 const edgeIds=new Set();
 p.edges=data.edges.map(e=>{
  if(!e||!/^e[a-zA-Z0-9_-]{1,60}$/.test(e.id)||edgeIds.has(e.id)||!ids.has(e.from)||!ids.has(e.to)||typeof e.port!=='string')throw Error('Invalid connection.');
  const source=p.nodes.find(n=>n.id===e.from),target=p.nodes.find(n=>n.id===e.to);
  if(!defs[source.type].out||!Object.hasOwn(defs[target.type].inputs||{},e.port))throw Error('Unknown connection port.');
  edgeIds.add(e.id);return{id:e.id,from:e.from,to:e.to,port:e.port};
 });
 if(data.view&&['x','y','zoom'].every(k=>Number.isFinite(data.view[k])))p.view={x:Math.max(-20000,Math.min(20000,data.view.x)),y:Math.max(-20000,Math.min(20000,data.view.y)),zoom:Math.max(.25,Math.min(2,data.view.zoom))};
 if(data.settings){p.settings.nanoOldBootloader=data.settings.nanoOldBootloader===true;p.settings.i2cClock=data.settings.i2cClock===400000?400000:100000;p.settings.telemetry=data.settings.telemetry===true;p.settings.telemetryInterval=Number.isInteger(data.settings.telemetryInterval)&&data.settings.telemetryInterval>=100&&data.settings.telemetryInterval<=60000?data.settings.telemetryInterval:100;}
 if(data.scenarios){if(!Array.isArray(data.scenarios)||data.scenarios.length>30)throw Error('Invalid scenario list.');p.scenarios=data.scenarios.map(t=>normalizeScenario(t,p));}
 if(data.evidence){if(!Array.isArray(data.evidence)||data.evidence.length>100)throw Error('Invalid evidence list.');p.evidence=data.evidence.map(e=>({date:String(e.date||'').slice(0,40),kind:String(e.kind||'Manual note').slice(0,60),note:String(e.note||'').slice(0,5000)}));}
 if(data.assumptions){if(!Array.isArray(data.assumptions)||data.assumptions.length>100)throw Error('Invalid assumptions list.');p.assumptions=data.assumptions.map(e=>({date:String(e.date||'').slice(0,40),note:String(e.note||'').slice(0,5000)}));}
 for(const e of p.evidence.filter(e=>e.kind==='Assumption'))p.assumptions.push({date:e.date,note:e.note});p.evidence=p.evidence.filter(e=>e.kind!=='Assumption');if(p.assumptions.length>100)throw Error('Too many assumptions.');
 if(!depth){for(const field of ['modules','revisions']){if(data[field]){if(!Array.isArray(data[field])||data[field].length>(field==='modules'?20:10))throw Error('Too many '+field);p[field]=data[field].map(m=>({name:String(m.name||'Untitled').slice(0,100),date:String(m.date||'').slice(0,40),project:importProject(m.project,1)}));}}}
 return p;
}
function validate(p){
 const issues=N.issues(p,isESP(p)),byId=new Map(p.nodes.map(n=>[n.id,n])),used=new Map(),occupied=new Set(),addresses=new Map(),b=board(p);
 const issue=(severity,node,message,confidence='High')=>issues.push({severity,node,message,confidence});
 const reserve=(pin,n,role)=>{if(used.has(pin))issue('error',n.id,`${n.label}: pin ${pin} conflicts with ${used.get(pin)}.`);else used.set(pin,role||n.label);};
 const hasI2C=p.nodes.some(n=>defs[n.type].i2c),hasSPI=p.nodes.some(n=>defs[n.type].spi);
 if(hasI2C)b.i2c.forEach(pin=>used.set(pin,'I²C bus'));if(hasSPI)b.spi.forEach(pin=>used.set(pin,'SPI bus'));
 for(const n of p.nodes){const d=defs[n.type];
  for(const key of Object.keys(d.inputs||{}))if(!p.edges.some(e=>e.to===n.id&&e.port===key))issue('error',n.id,`${n.label}: connect the ${key} input.`);
  if(n.type==='map'&&n.props.inMin===n.props.inMax)issue('error',n.id,`${n.label}: input range cannot be zero.`);
  if(['clamp','hysteresis'].includes(n.type)&&n.props.low>=n.props.high)issue('error',n.id,`${n.label}: lower bound must be below upper bound.`);
  if(n.type==='sequence'){const ds=durations(n);if(ds.length>32||!ds.length||ds.some(x=>!Number.isInteger(x)||x<10||x>3600000))issue('error',n.id,'Sequence needs 1–32 integer durations between 10 and 3600000 ms.');}
  if(n.props.pin){if(!paramOptions(n.type,'pin',p).includes(n.props.pin))issue('error',n.id,`${n.label}: ${n.props.pin} is not a supported ${n.type==='analog'?'ADC':n.type==='pwm'?'PWM':'digital'} pin on ${b.name}.`);reserve(n.props.pin,n);}
  if(d.i2c){const addr=Number(n.props.address);const old=addresses.get(addr);if(old&&!(d.shared&&old.type===n.type))issue('error',n.id,`${n.label}: I²C address 0x${addr.toString(16)} is already used by ${old.label}.`);addresses.set(addr,n);}
  if(n.type==='uart'){if(!b.uart.includes(n.props.port))issue('error',n.id,'Select a supported secondary UART (Mega or ESP32).');else{const pins=isESP(p)?['16','17']:{'1':['19','18'],'2':['17','16'],'3':['15','14']}[n.props.port];pins.forEach(pin=>reserve(pin,n,'UART '+n.props.port));}}
  if(n.type==='custom')issue('warning',n.id,'Custom C++ executes on the target board. Preview uses a stub value; review code before compiling.');
 }
 for(const e of p.edges){const a=byId.get(e.from),d=byId.get(e.to);if(!a||!d){issue('error',null,'A connection points to a missing component.');continue;}if(defs[a.type].out!==defs[d.type].inputs?.[e.port])issue('error',d.id,`${d.label}: incompatible signal types.`);const k=e.to+':'+e.port;if(occupied.has(k))issue('error',d.id,`${d.label}: an input has more than one source.`);occupied.add(k);}
 const dependencyEdges=p.edges.filter(e=>!defs[byId.get(e.to)?.type]?.deferred);
 const deg=new Map(p.nodes.map(n=>[n.id,0]));for(const e of dependencyEdges)if(deg.has(e.to))deg.set(e.to,deg.get(e.to)+1);
 const q=p.nodes.filter(n=>deg.get(n.id)===0),order=[];
 while(q.length){const n=q.shift();order.push(n);for(const e of dependencyEdges.filter(e=>e.from===n.id)){deg.set(e.to,deg.get(e.to)-1);if(deg.get(e.to)===0)q.push(byId.get(e.to));}}
 if(order.length!==p.nodes.length)issue('error',null,'Feedback loops require a Sample delay or Boolean delay. Break the instantaneous cycle.');
 const servos=p.nodes.filter(n=>n.type==='servo'),pwms=p.nodes.filter(n=>n.type==='pwm');
 if(servos.length){let conflict=[...b.servoConflict];if(p.board==='mega-2560'){if(servos.length>12)conflict.push('11','12');if(servos.length>24)conflict.push('2','3','5');if(servos.length>36)conflict.push('6','7','8');}for(const n of pwms)if(conflict.includes(n.props.pin))issue('error',n.id,`Servo reserves a timer used by PWM pin ${n.props.pin} on this board.`);if(servos.length>b.servoLimit)issue('error',null,`This profile supports at most ${b.servoLimit} servos.`);}
 if(isESP(p)&&servos.length+pwms.length>8)issue('error',null,'This ESP32 profile conservatively limits combined servo/PWM allocation to 8 channels.');
 const estimated=p.nodes.length*24+p.nodes.filter(n=>n.type==='oled').length*512+p.nodes.filter(n=>n.type==='uart').length*40;
 if(estimated>b.ram*.65)issue('warning',null,`Estimated application state is ${estimated} bytes before libraries and stack. Check the compiler memory report.`,'Medium');
 if(!p.nodes.length)issue('info',null,'Add a component or open a starter project.');
 if(p.nodes.length&&!p.nodes.some(n=>!defs[n.type].out||defs[n.type].effect))issue('warning',null,'This project has no output. Add a digital output, PWM, servo, or serial value.');
 return{issues,order,valid:!issues.some(x=>x.severity==='error'),estimatedStateBytes:estimated};
}
function createSimulation(p){
 const v=validate(p);if(!v.valid)throw Error('Fix the project errors before previewing.');
 const state={},values={},input=N.inputs(),links=new Map(p.edges.map(e=>[e.to+':'+e.port,e.from])),memories=p.nodes.filter(n=>defs[n.type].deferred);let last=-1;
 for(const n of memories){state[n.id]={value:n.props.initial};values[n.id]=n.props.initial;}
 return{values,input,state,tick(now){
 if(memories.length&&last>=0&&now-last<10)return values;const dt=last<0?0:now-last;last=now;
 for(const n of memories)values[n.id]=state[n.id].value;
 for(const n of v.order){const pr=n.props,d=defs[n.type],st=state[n.id]||(state[n.id]={raw:false,stable:false,since:0,previous:false,active:false,value:false,initialized:false});const read=k=>values[links.get(n.id+':'+k)];const a=read('in');let out;
 switch(n.type){
 case'clock':out=now%pr.period<pr.period*pr.duty/100;break;
 case'button':out=!!input[n.id];break;
 case'analog':out=Math.round(Math.max(0,Math.min(board(p).adcMax,input[n.id]??Math.round(board(p).adcMax/2))));break;
 case'constant':out=pr.value;break;
 case'boolean':out=pr.value;break;
 case'map':out=pr.outMin+(a-pr.inMin)*(pr.outMax-pr.outMin)/(pr.inMax-pr.inMin);if(pr.clamp)out=Math.max(Math.min(pr.outMin,pr.outMax),Math.min(Math.max(pr.outMin,pr.outMax),out));break;
 case'threshold':out=a>=pr.value;break;
 case'debounce':if(a!==st.raw){st.raw=a;st.since=now;}if(now-st.since>=pr.delay)st.stable=st.raw;out=st.stable;break;
 case'not':out=!a;break;
 case'and':out=!!read('a')&&!!read('b');break;
 case'or':out=!!read('a')||!!read('b');break;
 case'pulse':if(a&&!st.previous){st.since=now;st.active=true;}st.previous=a;if(st.active&&now-st.since>=pr.duration)st.active=false;out=st.active;break;
 case'toggle':if(a&&!st.previous)st.value=!st.value;st.previous=a;out=st.value;break;
 case'number':out=a?1:0;break;
 case'led':out=!!a;break;
 case'pwm':out=Number.isFinite(a)?Math.round(Math.max(0,Math.min(255,a))):0;break;
 case'servo':out=Number.isFinite(a)?Math.round(Math.max(0,Math.min(180,a))):(values[n.id]??90);break;
 case'probe':case'oled':out=a;break;
 case'math':{const x=read('a'),y=read('b');if(!Number.isFinite(x)||!Number.isFinite(y)){out=NaN;break;}out={add:()=>x+y,subtract:()=>x-y,multiply:()=>x*y,divide:()=>y===0?NaN:x/y,min:()=>Math.min(x,y),max:()=>Math.max(x,y)}[pr.operation]();break;}
 case'clamp':out=Math.max(pr.low,Math.min(pr.high,a));break;
 case'smooth':if(!Number.isFinite(a)){out=NaN;st.initialized=false;}else{out=st.initialized?st.value+(a-st.value)*(dt/(pr.tau+dt)):a;st.initialized=true;st.value=out;}break;
 case'hysteresis':if(!Number.isFinite(a))st.value=false;else if(a>=pr.high)st.value=true;else if(a<=pr.low)st.value=false;out=st.value;break;
 case'valid':out=Number.isFinite(a);break;
 case'select':out=read('condition')?read('a'):read('b');break;
 case'rising':out=!!a&&!st.previous;st.previous=!!a;break;
 case'falling':out=!a&&st.previous;st.previous=!!a;break;
 case'counter':if(read('reset'))st.value=0;else if(a&&!st.previous)st.value=Math.min(pr.limit,Number(st.value)+1);st.previous=!!a;out=Number(st.value);break;
 case'latch':if(read('reset'))st.value=false;else if(read('set'))st.value=true;out=!!st.value;break;
 case'memory':case'boolMemory':out=values[n.id];break;
 case'sequence':{if(read('reset'))st.active=false;else if(a&&!st.previous){st.active=true;st.since=now;}st.previous=!!a;out=-1;if(st.active){const ds=durations(n),total=ds.reduce((a,b)=>a+b,0);let elapsed=now-st.since;if(!pr.repeat&&elapsed>=total)st.active=false;else{elapsed%=total;let stage=0;while(stage<ds.length-1&&elapsed>=ds[stage])elapsed-=ds[stage++];out=stage;}}break;}
 case'custom':out=pr.preview;break;
 case'bme280':case'ina219':case'mcp9808':case'bh1750':case'max31855':if(!st.initialized||now-st.since>=pr.interval){st.value=input[n.id]===null?NaN:(input[n.id]??virtual(n).value);st.since=now;st.initialized=true;}out=st.value;break;
 case'uart':out=input[n.id]===null?NaN:(input[n.id]??virtual(n).value);break;
 default:if(N.types.has(n.type))out=N.simulate(p,n,st,read,now,input);else throw Error('No preview implementation for '+n.type);
 }values[n.id]=typeof out==='number'?Math.fround(out):out;
 }
 for(const n of memories)state[n.id].value=values[links.get(n.id+':in')];
 return values;
 }};
}
function dependencies(p){
 const names=new Set(p.nodes.map(n=>n.type)),deps=new Map();const add=(n,v)=>deps.set(n,v);
 if(N.usesMQTT(p))add('PubSubClient','2.8.0');
 if(names.has('servo')&&!isESP(p))add('Servo','1.2.2');
 if(names.has('bme280')){add('Adafruit BME280 Library','2.3.0');add('Adafruit Unified Sensor','1.1.15');add('Adafruit BusIO','1.17.4');}
 if(names.has('ina219')){add('Adafruit INA219','1.2.3');add('Adafruit BusIO','1.17.4');add('Adafruit NeoPixel','1.15.5');add('Adafruit GFX Library','1.12.6');add('Adafruit SSD1306','2.5.17');}
 if(names.has('bh1750'))add('BH1750','1.3.0');
 if(names.has('mcp9808')){add('Adafruit MCP9808 Library','2.0.2');add('Adafruit Unified Sensor','1.1.15');add('Adafruit SH110X','2.1.15');}
 if(names.has('max31855')){add('Adafruit MAX31855 library','1.4.2');add('LiquidCrystal','1.0.7');}
 if(names.has('oled')||names.has('mcp9808')){if(names.has('oled'))add('Adafruit SSD1306','2.5.17');add('Adafruit GFX Library','1.12.6');}
 if(['mcp9808','oled','max31855'].some(t=>names.has(t)))add('Adafruit BusIO','1.17.4');
 return [...deps].map(([name,version])=>({name,version}));
}
function fqbn(p){return p.board==='nano-classic'&&p.settings?.nanoOldBootloader?'arduino:avr:nano:cpu=atmega328old':board(p).fqbn;}
function buildProfile(p){const b=board(p),libs=dependencies(p);return 'profiles:\n  electronbench:\n    fqbn: '+fqbn(p)+'\n    platforms:\n      - platform: '+b.platform+' ('+b.core+')\n'+(b.index?'        platform_index_url: '+b.index+'\n':'')+(libs.length?'    libraries:\n'+libs.map(l=>'      - '+l.name+' ('+l.version+')').join('\n')+'\n':'')+'default_profile: electronbench\n';}
function generate(p){
 const check=validate(p);if(!p.nodes.length||!check.valid)throw Error('Complete the program and resolve its errors before exporting firmware.');
 const b=board(p),esp=isESP(p),ix=new Map(p.nodes.map((n,i)=>[n.id,i+1]));
 const read=(n,port='in')=>'v'+ix.get(p.edges.find(e=>e.to===n.id&&e.port===port)?.from),f=x=>Number.isInteger(x)?`${x}.0f`:`${x}f`;
 const network=N.generate(p,ix);
 const has=type=>p.nodes.some(n=>n.type===type),memories=p.nodes.filter(n=>defs[n.type].deferred),i2c=p.nodes.some(n=>defs[n.type].i2c),spi=p.nodes.some(n=>defs[n.type].spi);
 const serialNodes=p.settings?.telemetry?p.nodes:p.nodes.filter(n=>n.type==='probe');
 const lines=[`// ELECTRONBENCH ${VERSION} | ${b.name}`,`// FQBN: ${fqbn(p)} | schema ${SCHEMA}`,'// Canvas connections carry program signals; see the project pin map.','#include <Arduino.h>','#include <math.h>'];
 if(has('bme280'))lines.push('#include <Adafruit_BME280.h>');if(has('ina219'))lines.push('#include <Adafruit_INA219.h>');
 if(has('servo')&&!esp)lines.push('#include <Servo.h>');if(i2c)lines.push('#include <Wire.h>');if(spi)lines.push('#include <SPI.h>');
 if(has('mcp9808'))lines.push('#include <Adafruit_MCP9808.h>');if(has('bh1750'))lines.push('#include <BH1750.h>');if(has('max31855'))lines.push('#include <Adafruit_MAX31855.h>');if(has('oled'))lines.push('#include <Adafruit_GFX.h>','#include <Adafruit_SSD1306.h>');if(has('uart'))lines.push('#include <stdlib.h>');
 lines.push(...network.includes);
 const decl=['uint32_t startedAt;',...network.globals],setup=[],loop=[],after=[];if(serialNodes.length)decl.push('uint32_t lastReport = 0;');
 if(has('smooth'))decl.push('uint32_t previousTime = 0;');if(memories.length)decl.push('uint32_t lastTick = 0; bool firstTick = true;');
 if(i2c){setup.push(esp?`Wire.begin(${b.i2c[0]}, ${b.i2c[1]});`:'Wire.begin();',`Wire.setClock(${p.settings?.i2cClock||100000}UL);`);if(!esp)setup.push('#ifdef WIRE_HAS_TIMEOUT','Wire.setWireTimeout(25000, true);','#endif');}
 if(spi)setup.push(esp?`SPI.begin(${b.spi[0]},${b.spi[1]},${b.spi[2]});`:'SPI.begin();');
 const sensorOwner=n=>p.nodes.find(x=>x.type===n.type&&Number(x.props.address)===Number(n.props.address));
 for(const n of p.nodes){const i=ix.get(n.id),d=defs[n.type],pr=n.props,type=d.out||Object.values(d.inputs||{})[0],initial=n.type==='servo'?'90.0f':d.virtual?'NAN':d.deferred?(typeof pr.initial==='boolean'?String(pr.initial):f(pr.initial)):'0';decl.push(`${type==='boolean'?'bool':'float'} v${i} = ${initial};`);
  if(['debounce','pulse','toggle','rising','falling','counter','latch','hysteresis','sequence'].includes(n.type))decl.push(`bool raw${i}=false, stable${i}=false, prev${i}=false, active${i}=false; uint32_t since${i}=0;`);
  if(d.deferred)decl.push(`${type==='boolean'?'bool':'float'} memory${i} = ${initial};`);
  if(n.type==='smooth')decl.push(`bool initialized${i}=false;`);
  if(n.type==='button')setup.push(`pinMode(${pr.pin}, INPUT_PULLUP);`);
  if(n.type==='led')setup.push(`pinMode(${pr.pin}, OUTPUT); digitalWrite(${pr.pin}, ${pr.activeLow?'HIGH':'LOW'});`);
  if(n.type==='pwm')setup.push(esp?`ledcAttach(${pr.pin}, 1000, 8); ledcWrite(${pr.pin}, 0);`:`pinMode(${pr.pin}, OUTPUT); analogWrite(${pr.pin}, 0);`);
  if(n.type==='servo'){if(esp)setup.push(`ledcAttach(${pr.pin}, 50, 16);`);else{decl.push(`Servo servo${i};`);setup.push(`servo${i}.attach(${pr.pin});`);}}
  if(['bme280','ina219','mcp9808','bh1750','max31855','oled'].includes(n.type)){decl.push(`uint32_t sampleAt${i}=0; bool sampleFirst${i}=true, ready${i}=false;`);}
  if(['bme280','ina219'].includes(n.type)){const owner=sensorOwner(n);if(owner.id===n.id){decl.push(n.type==='bme280'?`Adafruit_BME280 sensor${i};`:`Adafruit_INA219 sensor${i}(${pr.address});`);setup.push(n.type==='bme280'?`ready${i}=sensor${i}.begin(${pr.address});`:`ready${i}=sensor${i}.begin();`);}}
  if(n.type==='mcp9808'){decl.push(`Adafruit_MCP9808 sensor${i};`);setup.push(`ready${i}=sensor${i}.begin(${pr.address});`);}
  if(n.type==='bh1750'){decl.push(`BH1750 sensor${i}(${pr.address});`);setup.push(`ready${i}=sensor${i}.begin(BH1750::CONTINUOUS_HIGH_RES_MODE);`);}
  if(n.type==='max31855'){decl.push(`Adafruit_MAX31855 sensor${i}(${pr.pin});`);setup.push(`ready${i}=sensor${i}.begin();`);}
  if(n.type==='oled'){decl.push(`Adafruit_SSD1306 display${i}(128,32,&Wire,-1);`);setup.push(`ready${i}=display${i}.begin(SSD1306_SWITCHCAPVCC,${pr.address});`,`if(ready${i}) { display${i}.clearDisplay(); display${i}.setTextSize(1); display${i}.setTextColor(SSD1306_WHITE); display${i}.display(); }`);}
  if(n.type==='uart'){decl.push(`char uartBuffer${i}[32]; uint8_t uartLength${i}=0; bool uartOverflow${i}=false;`);setup.push(esp?`Serial2.begin(${pr.baud}, SERIAL_8N1, 16, 17);`:`Serial${pr.port}.begin(${pr.baud});`);}
  if(n.type==='custom')decl.push(`#line 1 "eb_${n.id}"`,`float custom${i}(float input, uint32_t now) { (void)input; (void)now;`,pr.body,'}', '#line 1 "electronbench_project.ino"');
 }
 for(const n of memories)loop.push(`v${ix.get(n.id)}=memory${ix.get(n.id)};`);
 for(const n of check.order){const i=ix.get(n.id),pr=n.props,a=read(n),d=defs[n.type];loop.push(`#line 1 "eb_${n.id}"`,`// ${defs[n.type].name}`);
 switch(n.type){
 case'clock':loop.push(`v${i} = (now % ${pr.period}UL) < ${Math.ceil(pr.period*pr.duty/100)}UL;`);break;
 case'button':loop.push(`v${i} = digitalRead(${pr.pin}) == LOW;`);break;
 case'analog':loop.push(`v${i} = analogRead(${pr.pin});`);break;
 case'constant':loop.push(`v${i} = ${f(pr.value)};`);break;
 case'boolean':loop.push(`v${i} = ${pr.value};`);break;
 case'map':loop.push(`v${i} = ${f(pr.outMin)} + (${a} - ${f(pr.inMin)}) * (${f(pr.outMax)} - ${f(pr.outMin)}) / (${f(pr.inMax)} - ${f(pr.inMin)});`);if(pr.clamp)loop.push(`v${i} = constrain(v${i}, ${f(Math.min(pr.outMin,pr.outMax))}, ${f(Math.max(pr.outMin,pr.outMax))});`);break;
 case'threshold':loop.push(`v${i} = ${a} >= ${f(pr.value)};`);break;
 case'debounce':loop.push(`if (${a} != raw${i}) { raw${i} = ${a}; since${i} = now; }`,`if (uint32_t(now - since${i}) >= ${pr.delay}UL) stable${i} = raw${i};`,`v${i} = stable${i};`);break;
 case'not':loop.push(`v${i} = !${a};`);break;
 case'and':loop.push(`v${i} = ${read(n,'a')} && ${read(n,'b')};`);break;
 case'or':loop.push(`v${i} = ${read(n,'a')} || ${read(n,'b')};`);break;
 case'pulse':loop.push(`if (${a} && !prev${i}) { since${i} = now; active${i} = true; }`,`prev${i} = ${a};`,`if (active${i} && uint32_t(now - since${i}) >= ${pr.duration}UL) active${i} = false;`,`v${i} = active${i};`);break;
 case'toggle':loop.push(`if (${a} && !prev${i}) stable${i} = !stable${i};`,`prev${i} = ${a}; v${i} = stable${i};`);break;
 case'number':loop.push(`v${i} = ${a} ? 1.0f : 0.0f;`);break;
 case'led':loop.push(`v${i} = ${a}; digitalWrite(${pr.pin}, ${pr.activeLow?'!':''}v${i} ? HIGH : LOW);`);break;
 case'pwm':loop.push(`v${i} = isfinite(${a}) ? int(constrain(${a}, 0.0f, 255.0f) + 0.5f) : 0;`,esp?`ledcWrite(${pr.pin}, uint32_t(v${i}));`:`analogWrite(${pr.pin}, int(v${i}));`);break;
 case'servo':loop.push(`if(isfinite(${a})) v${i} = int(constrain(${a}, 0.0f, 180.0f) + 0.5f);`,esp?`ledcWrite(${pr.pin}, uint32_t((544.0f+v${i}*(1856.0f/180.0f))*65535.0f/20000.0f));`:`servo${i}.write(int(v${i}));`);break;
 case'probe':loop.push(`v${i} = ${a};`);break;
 case'math':{const x=read(n,'a'),y=read(n,'b'),ops={add:`${x}+${y}`,subtract:`${x}-${y}`,multiply:`${x}*${y}`,divide:`${y}==0.0f ? NAN : ${x}/${y}`,min:`min(${x},${y})`,max:`max(${x},${y})`};loop.push(`v${i}=isfinite(${x})&&isfinite(${y}) ? (${ops[pr.operation]}) : NAN;`);break;}
 case'clamp':loop.push(`v${i}=constrain(${a},${f(pr.low)},${f(pr.high)});`);break;
 case'smooth':loop.push(`if(!isfinite(${a})) { v${i}=NAN; initialized${i}=false; } else { v${i}=initialized${i} ? v${i}+(${a}-v${i})*(deltaTime/(${f(pr.tau)}+deltaTime)) : ${a}; initialized${i}=true; }`);break;
 case'hysteresis':loop.push(`if(!isfinite(${a})) stable${i}=false; else if(${a}>=${f(pr.high)}) stable${i}=true; else if(${a}<=${f(pr.low)}) stable${i}=false; v${i}=stable${i};`);break;
 case'valid':loop.push(`v${i}=isfinite(${a});`);break;
 case'select':loop.push(`v${i}=${read(n,'condition')} ? ${read(n,'a')} : ${read(n,'b')};`);break;
 case'rising':loop.push(`v${i}=${a}&&!prev${i}; prev${i}=${a};`);break;
 case'falling':loop.push(`v${i}=!${a}&&prev${i}; prev${i}=${a};`);break;
 case'counter':loop.push(`if(${read(n,'reset')}) v${i}=0; else if(${a}&&!prev${i}&&v${i}<${f(pr.limit)}) v${i}+=1; prev${i}=${a};`);break;
 case'latch':loop.push(`if(${read(n,'reset')}) stable${i}=false; else if(${read(n,'set')}) stable${i}=true; v${i}=stable${i};`);break;
 case'memory':case'boolMemory':after.push(`memory${i}=${a};`);break;
 case'sequence':{const ds=durations(n),total=ds.reduce((a,b)=>a+b,0);loop.push(`if(${read(n,'reset')}) active${i}=false; else if(${a}&&!prev${i}) { active${i}=true; since${i}=now; } prev${i}=${a}; v${i}=-1;`,`if(active${i}) { uint32_t elapsed=uint32_t(now-since${i});`,pr.repeat?'':`if(elapsed>=${total}UL) active${i}=false;`,`if(active${i}) { elapsed%= ${total}UL; const uint32_t stages[]={${ds.map(x=>x+'UL').join(',')}}; uint8_t stage=0; while(stage<${ds.length-1}&&elapsed>=stages[stage]) elapsed-=stages[stage++]; v${i}=stage; } }`);break;}
 case'bme280':case'ina219':{const owner=ix.get(sensorOwner(n).id),method=n.type==='bme280'?{temperature:'readTemperature()',humidity:'readHumidity()',pressure:'readPressure()/100.0f'}[pr.measurement]:{voltage:'getBusVoltage_V()',current:'getCurrent_mA()',power:'getPower_mW()'}[pr.measurement];loop.push(`if(sampleFirst${i}||uint32_t(now-sampleAt${i})>=${pr.interval}UL) { sampleFirst${i}=false; sampleAt${i}=now; Wire.beginTransmission(${pr.address}); bool available=Wire.endTransmission()==0; v${i}=ready${owner}&&available?sensor${owner}.${method}:NAN; ${n.type==='ina219'?`if(!sensor${owner}.success()) v${i}=NAN;`:''} }`);break;}
 case'mcp9808':case'bh1750':case'max31855':{const method={mcp9808:'readTempC()',bh1750:'readLightLevel()',max31855:'readCelsius()'}[n.type];loop.push(`if(sampleFirst${i}||uint32_t(now-sampleAt${i})>=${pr.interval}UL) { sampleFirst${i}=false; sampleAt${i}=now; v${i}=ready${i}?sensor${i}.${method}:NAN;${n.type==='bh1750'?` if(v${i}<0) v${i}=NAN;`:''} }`);break;}
 case'oled':loop.push(`v${i}=${a};`,`if(ready${i}&&(sampleFirst${i}||uint32_t(now-sampleAt${i})>=${pr.interval}UL)) { sampleFirst${i}=false; sampleAt${i}=now; display${i}.clearDisplay(); display${i}.setCursor(0,0); display${i}.println(F(${JSON.stringify(pr.label)})); if(isfinite(v${i})) display${i}.println(v${i}); else display${i}.println(F("ERR")); display${i}.display(); }`);break;
 case'uart':{const stream=esp?'Serial2':'Serial'+pr.port;loop.push(`for(uint8_t budget=0;budget<32&&${stream}.available();budget++) { char c=char(${stream}.read()); if(c=='\\n') { uartBuffer${i}[uartLength${i}]=0; char *end; float value=float(strtod(uartBuffer${i},&end)); v${i}=!uartOverflow${i}&&uartLength${i}&&*end==0&&isfinite(value)?value:NAN; uartLength${i}=0; uartOverflow${i}=false; } else if(c!='\\r') { if(uartLength${i}<31) uartBuffer${i}[uartLength${i}++]=c; else uartOverflow${i}=true; } }`);break;}
 case'custom':loop.push(`v${i}=custom${i}(${a},now);`);break;
 default:if(N.types.has(n.type))loop.push(network.node(n,read));else throw Error('No firmware implementation for '+n.type);
 }
 }
 if(serialNodes.length){setup.push('Serial.begin(115200);');loop.push('#line 1 "electronbench_project.ino"',`if(uint32_t(now-lastReport)>=${p.settings?.telemetryInterval||100}UL) { lastReport=now; Serial.print(F("{\\"ms\\":")); Serial.print(now);`);for(const n of serialNodes)loop.push(`Serial.print(F(",\\"${n.id}\\":")); if(isfinite(float(v${ix.get(n.id)}))) Serial.print(float(v${ix.get(n.id)})); else Serial.print(F("null"));`);loop.push('Serial.println(F("}")); }');}
 loop.unshift(...(network.beforeLoop||[]));if(N.used(p)&&!serialNodes.length)setup.push('Serial.begin(115200);');setup.push(...network.setup);
 let pre='const uint32_t now=uint32_t(millis()-startedAt); (void)now;';if(memories.length)pre+='\n  if(!firstTick && uint32_t(now-lastTick)<10UL) { return; } firstTick=false; lastTick=now;';if(has('smooth'))pre+='\n  const float deltaTime=float(uint32_t(now-previousTime)); previousTime=now;';
 return lines.join('\n')+'\n\n'+decl.join('\n')+'\n\nvoid setup() {\n  '+setup.concat('startedAt=millis();').join('\n  ')+'\n}\n\nvoid loop() {\n  '+pre+'\n  '+loop.concat(after).join('\n  ')+'\n}\n';
}

function normalizeScenario(t,p){
 if(!t||typeof t!=='object')throw Error('Invalid test scenario.');
 const duration=Number(t.duration??2000);if(!Number.isInteger(duration)||duration<10||duration>600000||duration%10)throw Error('Scenario duration must be 10–600000 ms in 10 ms increments.');
 const rows=(list,expect)=>{if(!Array.isArray(list)||list.length>1000)throw Error('Invalid scenario rows.');return list.map(e=>{if(!Number.isInteger(e.time)||e.time<0||e.time>duration||e.time%10||!/^n[a-zA-Z0-9_-]{1,60}$/.test(e.node)||!(e.value===null||typeof e.value==='boolean'||Number.isFinite(e.value)))throw Error('Scenario rows need valid node IDs, 10 ms timestamps, and Boolean/numeric values.');return{time:e.time,node:e.node,value:e.value,...(expect?{tolerance:Number.isFinite(e.tolerance)&&e.tolerance>=0?e.tolerance:0.01}:{})};}).sort((a,b)=>a.time-b.time);};
 return{name:String(t.name||'Scenario').slice(0,100),duration,events:rows(t.events||[],false),assertions:rows(t.assertions||[],true)};
}
function runScenario(p,t){
 const scenario=normalizeScenario(t,p),sim=createSimulation(p),results=[];let inputIndex=0,assertIndex=0;
 for(const e of scenario.events){const n=p.nodes.find(n=>n.id===e.node);if(!n||!(['button','analog'].includes(n.type)||defs[n.type].virtual))throw Error('Scenario input '+e.node+' is missing or is not a virtual input.');if(n.type==='button'&&typeof e.value!=='boolean')throw Error('Button scenario values must be Boolean.');if(defs[n.type].virtual&&e.value!==null&&!Number.isFinite(e.value))throw Error('Sensor and UART scenario values must be numbers or null.');if(n.type==='analog'&&(!Number.isFinite(e.value)||e.value<0||e.value>board(p).adcMax))throw Error('Analog scenario value is outside the board ADC range.');}
 for(const e of scenario.assertions){const n=p.nodes.find(n=>n.id===e.node);if(!n)throw Error('Scenario assertion node '+e.node+' is missing.');const type=defs[n.type].out||Object.values(defs[n.type].inputs||{})[0];if(type==='boolean'&&typeof e.value!=='boolean')throw Error('Boolean expectations must be true or false.');if(type==='number'&&e.value!==null&&!Number.isFinite(e.value))throw Error('Numeric expectations must be numbers or null.');}
 for(let time=0;time<=scenario.duration;time+=10){while(inputIndex<scenario.events.length&&scenario.events[inputIndex].time===time){const e=scenario.events[inputIndex++];sim.input[e.node]=e.value;}sim.tick(time);while(assertIndex<scenario.assertions.length&&scenario.assertions[assertIndex].time===time){const e=scenario.assertions[assertIndex++],actual=sim.values[e.node];const pass=e.value===null?!Number.isFinite(actual):typeof e.value==='boolean'?actual===e.value:Number.isFinite(actual)&&Math.abs(actual-e.value)<=e.tolerance;results.push({...e,actual:Number.isFinite(actual)||typeof actual==='boolean'?actual:null,pass});}}
 return{name:scenario.name,duration:scenario.duration,pass:results.length>0&&results.every(r=>r.pass),assertions:results,warning:p.nodes.some(n=>n.type==='custom')?'Custom-code outputs are preview stubs.':results.length?'Behavioral model only; hardware timing is not verified.':'No assertions were supplied. Add expected outputs to create a pass/fail test.',finalValues:sim.values};
}
function makeModule(p,ids,name){const keep=new Set(ids),m=blank();m.name=String(name||'Module');m.board=p.board;m.nodes=clone(p.nodes.filter(n=>keep.has(n.id)));m.edges=clone(p.edges.filter(e=>keep.has(e.from)&&keep.has(e.to)));if(!m.nodes.length)throw Error('Select at least one component.');return{name:m.name,date:new Date().toISOString(),project:m};}
function insertModule(p,module,idFactory){const source=importProject(module.project,1),map=new Map(),name=module.name+' '+(1+new Set(p.nodes.map(n=>n.group).filter(Boolean)).size),minX=Math.min(...source.nodes.map(n=>n.x)),minY=Math.min(...source.nodes.map(n=>n.y));if(!source.nodes.length)throw Error('This module has no components.');if(p.nodes.length+source.nodes.length>500)throw Error('Project would exceed 500 components.');const nodes=source.nodes.map(n=>{const next=clone(n);next.id=idFactory('n');map.set(n.id,next.id);next.group=name;next.x=n.x-minX+100;next.y=n.y-minY+100;return next;});const edges=source.edges.map(e=>({...e,id:idFactory('e'),from:map.get(e.from),to:map.get(e.to)}));p.nodes.push(...nodes);p.edges.push(...edges);return nodes.map(n=>n.id);}
function diffProjects(before,after){const changes=[];if(before.board!==after.board)changes.push({kind:'Target',item:before.board+' → '+after.board});const a=new Map(before.nodes.map(n=>[n.id,n])),b=new Map(after.nodes.map(n=>[n.id,n]));for(const [id,n]of b){const old=a.get(id);if(!old)changes.push({kind:'Added',item:n.label});else if(JSON.stringify([old.type,old.props,old.label,old.group])!==JSON.stringify([n.type,n.props,n.label,n.group]))changes.push({kind:'Changed',item:n.label});}for(const [id,n]of a)if(!b.has(id))changes.push({kind:'Removed',item:n.label});const edgeKey=e=>e.from+':'+e.to+':'+e.port,ae=new Set(before.edges.map(edgeKey)),be=new Set(after.edges.map(edgeKey));for(const e of be)if(!ae.has(e))changes.push({kind:'Connected',item:e});for(const e of ae)if(!be.has(e))changes.push({kind:'Disconnected',item:e});if(before.notes!==after.notes)changes.push({kind:'Notes',item:'Project notes changed'});if(JSON.stringify(before.network)!==JSON.stringify(after.network))changes.push({kind:'Network',item:'Network configuration changed'});if(JSON.stringify(before.settings)!==JSON.stringify(after.settings))changes.push({kind:'Settings',item:'Build/instrument settings changed'});return changes;}
root.EB={VERSION,SCHEMA,defs,boards,board,isESP,virtual,network:N,fqbn,paramOptions,dependencies,buildProfile,clone,makeNode,blank,sample,importProject,validate,createSimulation,generate,normalizeScenario,runScenario,makeModule,insertModule,diffProjects};
})(typeof window!=='undefined'?window:globalThis);
