/* Small dependency-free ZIP writer, stored entries, UTF-8 names. GPL-3.0-only. */
(function(root){
const table=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc(bytes){let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function pack(files){const enc=new TextEncoder(),locals=[],centrals=[];let offset=0,centralSize=0;
 for(const [name,content]of Object.entries(files)){if(name.startsWith('/')||name.includes('..')||name.includes('\\'))throw Error('Invalid ZIP entry name.');const filename=enc.encode(name),bytes=content instanceof Uint8Array?content:enc.encode(content),checksum=crc(bytes),local=new Uint8Array(30+filename.length+bytes.length),l=new DataView(local.buffer);l.setUint32(0,0x04034b50,true);l.setUint16(4,20,true);l.setUint16(6,0x800,true);l.setUint32(14,checksum,true);l.setUint32(18,bytes.length,true);l.setUint32(22,bytes.length,true);l.setUint16(26,filename.length,true);local.set(filename,30);local.set(bytes,30+filename.length);
 const central=new Uint8Array(46+filename.length),c=new DataView(central.buffer);c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x800,true);c.setUint32(16,checksum,true);c.setUint32(20,bytes.length,true);c.setUint32(24,bytes.length,true);c.setUint16(28,filename.length,true);c.setUint32(42,offset,true);central.set(filename,46);locals.push(local);centrals.push(central);offset+=local.length;centralSize+=central.length;
 }
 const result=new Uint8Array(offset+centralSize+22);let pos=0;for(const bytes of [...locals,...centrals]){result.set(bytes,pos);pos+=bytes.length;}const end=new DataView(result.buffer,pos,22);end.setUint32(0,0x06054b50,true);end.setUint16(8,locals.length,true);end.setUint16(10,locals.length,true);end.setUint32(12,centralSize,true);end.setUint32(16,offset,true);return result;
}root.EBZip={pack};
})(typeof window!=='undefined'?window:globalThis);
