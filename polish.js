/* ELECTRONBENCH interaction refinement. GPL-3.0-only. */
(()=>{'use strict';
const A=window.EBApp,E=window.EB,$=id=>document.getElementById(id),h=A.esc;
let mobilePanel=null,lastWidth=innerWidth;
const focusable=el=>[...el.querySelectorAll('button,input,select,textarea,a[href],summary,[tabindex="0"]')].filter(x=>!x.disabled&&!x.closest('[hidden]'));

function syncPanels(){
 const narrow=innerWidth<=900,p=A.prefs;
 if(narrow&&p.library&&p.inspector)p.library=false;
 $('library').hidden=!p.library;$('inspector').hidden=!p.inspector;$('showLibrary').hidden=p.library;
 $('inspectToggle').setAttribute('aria-expanded',String(p.inspector));$('inspectToggle').classList.toggle('active',p.inspector);
 $('showLibrary').setAttribute('aria-controls','library');$('showLibrary').setAttribute('aria-expanded',String(p.library));
 $('libraryResize').hidden=narrow||!p.library;$('inspectorResize').hidden=narrow||!p.inspector;$('dockResize').hidden=!p.dock;
 document.documentElement.style.setProperty('--library-width',Math.max(190,Math.min(330,p.libraryWidth||232))+'px');
 document.documentElement.style.setProperty('--inspector-width',Math.max(240,Math.min(380,p.inspectorWidth||280))+'px');
 const active=narrow?(p.inspector?'inspector':p.library?'library':null):null;
 $('panelShade').hidden=!active;
 for(const id of ['library','inspector']){const el=$(id);if(active===id){el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby',id+'Heading');}else{el.removeAttribute('role');el.removeAttribute('aria-modal');el.removeAttribute('aria-labelledby');}}
 for(const el of [document.querySelector('.masthead'),document.querySelector('.projectbar'),document.querySelector('.center-workspace'),document.querySelector('.statusbar')])el.inert=!!active;
 if(active!==mobilePanel&&active){focusable($(active))[0]?.focus();}
 mobilePanel=active;
 for(const [id,key,lo,hi,initial]of [['libraryResize','libraryWidth',190,330,232],['inspectorResize','inspectorWidth',240,380,280],['dockResize','dockHeight',180,450,253]]){const el=$(id);el.setAttribute('aria-valuemin',lo);el.setAttribute('aria-valuemax',hi);el.setAttribute('aria-valuenow',p[key]||initial);}
}
function closeDrawer(){if(!mobilePanel)return;const id=mobilePanel;A.togglePanel(id,false);$(id==='library'?'showLibrary':'inspectToggle').focus();}
$('panelShade').onclick=closeDrawer;
window.addEventListener('resize',()=>{if(innerWidth<=900&&lastWidth>900){A.prefs.library=false;A.prefs.inspector=false;}lastWidth=innerWidth;syncPanels();A.drawWires();});

// Keyboard and pointer use the same persisted panel dimensions.
for(const [id,key,axis,sign,lo,hi,initial]of [['libraryResize','libraryWidth','clientX',1,190,330,232],['inspectorResize','inspectorWidth','clientX',-1,240,380,280],['dockResize','dockHeight','clientY',-1,180,450,253]]){
 const el=$(id);let drag=null;
 const set=value=>{A.prefs[key]=Math.round(Math.max(lo,Math.min(hi,value)));A.applyPrefs();};
 el.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();drag={at:e[axis],value:A.prefs[key]||initial};el.setPointerCapture?.(e.pointerId);el.classList.add('resizing');};
 el.onpointermove=e=>{if(drag)set(drag.value+(e[axis]-drag.at)*sign);};
 const stop=()=>{drag=null;el.classList.remove('resizing');};el.onpointerup=stop;el.onpointercancel=stop;
 el.onkeydown=e=>{const negative=axis==='clientX'?'ArrowLeft':'ArrowUp',positive=axis==='clientX'?'ArrowRight':'ArrowDown';if(![negative,positive,'Home','End'].includes(e.key))return;e.preventDefault();set(e.key==='Home'?lo:e.key==='End'?hi:(A.prefs[key]||initial)+(e.key===positive?20:-20)*sign);};
 el.ondblclick=()=>set(initial);
}

const tabs=document.querySelector('.dock-tabs');
for(const b of tabs.querySelectorAll('[data-tab]')){const id=b.dataset.tab;b.id='tab-button-'+id;b.setAttribute('aria-controls','tab-'+id);$('tab-'+id).setAttribute('aria-labelledby',b.id);b.tabIndex=b.getAttribute('aria-selected')==='true'?0:-1;}
// Keep the established Live action ID while giving the tab a proper association.
const live=tabs.querySelector('[data-tab="live"]');live.id='liveView';$('tab-live').setAttribute('aria-labelledby','liveView');
tabs.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)||!e.target.matches('[data-tab]'))return;e.preventDefault();const list=[...tabs.querySelectorAll('[data-tab]')],i=list.indexOf(e.target),next=e.key==='Home'?0:e.key==='End'?list.length-1:(i+(e.key==='ArrowRight'?1:-1)+list.length)%list.length;A.setTab(list[next].dataset.tab);list[next].focus();});

const menu=$('projectMenu');
$('menuBundle').onclick=()=>window.EBProjectTools.bundle();$('menuReport').onclick=()=>$('printReport').click();$('menuRecover').onclick=()=>window.EBEditor.recover();
menu.addEventListener('click',e=>{if(e.target.closest('button'))menu.open=false;});
document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target))menu.open=false;});
menu.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();menu.open=false;menu.querySelector('summary').focus();}});

function syncSelection(){const n=A.selection.size;$('selectionBar').hidden=n<2;$('selectionCount').textContent=n+' selected';}
const selectedBar=document.createElement('div');selectedBar.id='selectionBar';selectedBar.className='selection-bar';selectedBar.hidden=true;selectedBar.innerHTML='<strong id="selectionCount"></strong><button id="selectionDuplicate">Duplicate</button><button id="selectionDelete">Delete</button>';document.querySelector('.canvas-toolbar').after(selectedBar);
$('selectionDuplicate').onclick=A.duplicate;$('selectionDelete').onclick=A.removeSelected;

document.addEventListener('keydown',e=>{
 if($('modal').open)return;
 if(mobilePanel){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeDrawer();return;}if(e.key==='Tab'){const list=focusable($(mobilePanel)),first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}return;}
 const context=$('contextMenu');
 if(!context.hidden&&['Escape','ArrowDown','ArrowUp','Home','End','Tab'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(e.key==='Escape'||e.key==='Tab'){context.hidden=true;A.focusNode(A.selected);return;}const list=focusable(context),i=list.indexOf(document.activeElement);list[e.key==='Home'?0:e.key==='End'?list.length-1:(i+(e.key==='ArrowDown'?1:-1)+list.length)%list.length]?.focus();return;}
 if((e.key==='ContextMenu'||e.shiftKey&&e.key==='F10')&&document.activeElement.closest('.node')){e.preventDefault();const n=document.activeElement.closest('.node'),rect=n.getBoundingClientRect();n.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:rect.left+20,clientY:rect.top+40}));}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();$('saveProject').click();}
},true);

function starter(kind,target){return E.sample(kind,target);}

window.EBPolish={syncPanels,syncSelection,starter};syncPanels();syncSelection();
})();
