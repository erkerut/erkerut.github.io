// Mi Progreso Gym v2 - seguimiento POR EJERCICIO (tolera rutinas y PDFs distintos)
const LS='gymapp_v1';
// Normaliza nombres para que PDFs viejos/nuevos matcheen el mismo ejercicio
function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ')}
function canonOf(raw){
let s=' '+norm(raw)+' ';
s=s.replace(/ round 2 | ronda 2 | 2da vuelta | 2da | segunda vuelta /g,' ');
s=s.replace(/ viernes | jueves | lunes | miercoles | martes /g,' ');
s=s.trim().replace(/\s+/g,'-');
const alias={'curl-martillo-con-cuerda':'curl-martillo','curl-martillo-con-soga':'curl-martillo','predicador-de-triceps-en-maquina':'predicador-triceps-maq','curl-predicador-en-maquina':'curl-predicador-maq','curl-de-biceps-en-maquina':'curl-biceps-maq','peso-muerto-en-maquina':'peso-muerto-maq','extension-de-pantorrillas-en-banca':'pantorrilla-banca','pull-up-en-maquina':'pullup-maq','extension-de-triceps':'ext-triceps','izquiotibiales-en-maquina':'izquio-maq','hombro-lateral-en-maquina':'hombro-lat-maq','hombro-lateral-con-mancuernas':'hombro-lat-manc','antebrazo-en-prono':'ant-prono','antebrazo-en-supino':'ant-supino','remo-vertical':'remo-vert','press-en-maquina':'press-maq','press-inclinado-en-maquina':'press-inc','fondos-en-maquina':'fondos-maq','cable-fly-hacia-arriba':'cable-fly','pec-deck':'pec-deck','skull-crushers':'skull','curl-martillo':'martillo','extension-de-pantorrillas-en-banca':'pantorrilla-banca'};
return alias[s]||s;
}
const DEFAULTS={
user:'',
catalog:[
{id:'curl-biceps-maq',name:'Curl de Bíceps en máquina',unit:'lb',target:10},
{id:'peso-muerto-maq',name:'Peso muerto en máquina',unit:'kg',target:10},
{id:'izquio-maq',name:'Izquiotibiales en máquina',unit:'lb',target:10},
{id:'ext-triceps',name:'Extensión de tríceps',unit:'lb',target:10},
{id:'pantorrilla-banca',name:'Extensión de pantorrillas en banca',unit:'lb',target:20},
{id:'pullup-maq',name:'Pull up en máquina',unit:'lb',target:10},
{id:'curl-predicador-maq',name:'Curl predicador en máquina',unit:'lb',target:10},
{id:'predicador-triceps-maq',name:'Predicador de tríceps en máquina',unit:'lb',target:10},
{id:'skull',name:'Skull crushers',unit:'lb',target:10},
{id:'martillo',name:'Curl martillo',unit:'lb',target:10},
{id:'hombro-lat-manc',name:'Hombro lateral con mancuernas',unit:'lb',target:12},
{id:'hombro-lat-maq',name:'Hombro lateral en máquina',unit:'lb',target:12},
{id:'ant-prono',name:'Antebrazo en prono',unit:'lb',target:15},
{id:'ant-supino',name:'Antebrazo en supino',unit:'lb',target:15},
{id:'remo-vert',name:'Remo vertical',unit:'lb',target:15},
{id:'press-maq',name:'Press en máquina',unit:'lb',target:12},
{id:'press-inc',name:'Press inclinado en máquina',unit:'lb',target:12},
{id:'fondos-maq',name:'Fondos en máquina',unit:'lb',target:12},
{id:'cable-fly',name:'Cable Fly hacia arriba',unit:'discos',target:10},
{id:'pec-deck',name:'Pec Deck',unit:'lb',target:10}
],
routines:[
{id:'pierna',name:'PIERNA, BRAZO Y ESPALDA',warm:'',items:[
{canon:'curl-biceps-maq',sets:4,w:'90'},{canon:'peso-muerto-maq',sets:4,w:'85'},{canon:'izquio-maq',sets:2,w:'90'},{canon:'ext-triceps',sets:4,w:'120'},{canon:'pantorrilla-banca',sets:4,w:'80'},{canon:'pullup-maq',sets:2,w:'145'},{canon:'curl-predicador-maq',sets:4,w:'115'},{canon:'predicador-triceps-maq',sets:4,w:'150'},{canon:'skull',sets:3,w:'30'},{canon:'martillo',sets:3,w:'15'}]},
{id:'hombro',name:'Izquiotibiales y antebrazos / Hombro',warm:'Calentamiento: Hombro con mancuernas 20 & 20, Isquios sin peso 20 & 20',items:[
{canon:'hombro-lat-manc',sets:3,w:'25'},{canon:'hombro-lat-maq',sets:3,w:'95'},{canon:'ant-prono',sets:3,w:'20'},{canon:'ant-supino',sets:3,w:'25'},{canon:'hombro-lat-maq',sets:3,w:'80',tag:'Round 2',note:'a 15 reps'},{canon:'ant-prono',sets:3,w:'15',tag:'2da'},{canon:'ant-supino',sets:3,w:'20',tag:'2da'},{canon:'remo-vert',sets:4,w:'60',note:'Última serie Dropset'}]},
{id:'pecho',name:'PECTORALES',warm:'Calentamiento en press: Solo la barra 20 + 20',items:[
{canon:'press-maq',sets:4,w:'190'},{canon:'press-inc',sets:3,w:'140'},{canon:'fondos-maq',sets:3,w:'170',note:'Viernes'},{canon:'cable-fly',sets:6,w:'6 discos',note:'1:6 sup 2:5 sup 3:7 medio 4:6 medio 5:8 inf 6:7 inf'},{canon:'pec-deck',sets:3,w:'90',note:'90lb / 6 discos'}]}
],
sessions:[]
};
let S;
try{
const raw=JSON.parse(localStorage.getItem(LS));
if(raw&&raw.routines&&raw.routines[0]&&raw.routines[0].ex){
// migra v1 (por rutina) -> v2 (por ejercicio)
S=structuredClone(DEFAULTS);S.user=raw.user||'';
S.sessions=(raw.sessions||[]).map(s=>{
const blocks=[];
Object.entries(s.entries||{}).forEach(([oldId,en])=>{
// busca nombre original
let nm=oldId;raw.routines.forEach(r=>(r.ex||[]).forEach(e=>{if(e.id===oldId)nm=e.name}));
blocks.push({canon:canonOf(nm),nameSnap:nm,weights:en.weights,reps:en.reps,tag:''});
});
return {date:s.date,routineId:s.routineId,blocks,total:s.total||0};
});
}else{S=raw||structuredClone(DEFAULTS)}
if(!S.catalog)S.catalog=structuredClone(DEFAULTS.catalog);
}catch(e){S=structuredClone(DEFAULTS)}
function save(){localStorage.setItem(LS,JSON.stringify(S))}
function catById(id){return S.catalog.find(c=>c.id===id)}
function ensureCanon(canon,nameSnap){
if(!catById(canon)){S.catalog.push({id:canon,name:nameSnap||canon,unit:'lb',target:10,grupo:grupoAuto(canon,nameSnap)});save()}
}
// asigna grupo a ejercicios viejos sin grupo, y reubica los que quedaron en OTRO
S.catalog.forEach(c=>{if(!c.grupo)c.grupo=grupoAuto(c.id,c.name)});
S.catalog.forEach(c=>{if(c.grupo==='Otro'){const g=grupoAuto(c.id,c.name);if(g!=='Otro')c.grupo=g}});
if(!S.disp)S.disp={};
const LBKG=2.20462;
function convW(v,from,to){const n=parseFloat(String(v).replace(',','.'));if(isNaN(n))return v;if(from===to)return String(n);let r=to==='kg'?n/LBKG:n*LBKG;return String(Math.round(r*10)/10)}
function dispUnit(canon,baseU){return (S.disp&&S.disp[canon])||baseU}
// número puro del peso (ignora "lb"/"kg"/"discos" pegados); null si trae texto extra
function wNum(w){const m=String(w==null?'':w).trim().match(/^(\d+(?:[.,]\d+)?)\s*(lb|kg|discos|placas)?$/i);return m?parseFloat(m[1].replace(',','.')):null}
function r1(v){return String(Math.round(v*10)/10)}
function cleanW(raw){const n=wNum(raw);return n==null?String(raw==null?'':raw):String(n)}
const MUSCLE_IMG={'press-maq':'CHEST_GRAPHIC.png','press-inc':'CHEST_GRAPHIC.png','fondos-maq':'CHEST_GRAPHIC.png','cable-fly':'CHEST_GRAPHIC.png','pec-deck':'CHEST_GRAPHIC.png','press-declinado-maq':'CHEST_GRAPHIC.png','pushups-maq':'CHEST_GRAPHIC.png','aperturas-de-banco':'CHEST_GRAPHIC.png',
'hombro-lat-manc':'SHOULDERS_GRAPHIC.png','hombro-lat-maq':'SHOULDERS_GRAPHIC.png','hombros-laterales-con-mancuernas':'SHOULDERS_GRAPHIC.png','elevaciones-laterales-con-cable':'SHOULDERS_GRAPHIC.png','elevaciones-laterales-con-mancuernas':'SHOULDERS_GRAPHIC.png','elevaciones-laterales-con-mancuernas-2-pares-de-mancuernas':'SHOULDERS_GRAPHIC.png','elevaciones-laterales-en-maquina':'SHOULDERS_GRAPHIC.png','elevacion-de-hombros-en-maquina':'SHOULDERS_GRAPHIC.png','levantamiento-de-barras-z-para-hombros-laterales':'SHOULDERS_GRAPHIC.png','remo-vertical-con-barra-z-hombros':'SHOULDERS_GRAPHIC.png'};
const IMG_BY_GRUPO={'Pecho':'CHEST_GRAPHIC.png','Hombro':'SHOULDERS_GRAPHIC.png'};
function muscleImg(it,c){return MUSCLE_IMG[it.canon]||(c&&IMG_BY_GRUPO[c.grupo])||''}
function parseW(w,unit){const n=parseFloat(String(w).replace(',','.'));if(isNaN(n))return 0;if(unit==='kg')return n*2.20462;return n}
// grupos musculares: se asignan solos por nombre y se pueden corregir en Rutinas
const GRUPOS=['Pecho','Espalda','Pierna','Glúteos','Hombro','Bíceps','Tríceps','Antebrazo','Otro'];
function grupoAuto(canon,name){
const s=((canon||'')+' '+(name||'')).toLowerCase();
if(/press|pec-deck|pec deck|cable-fly|cable fly|fly|fondos|apertura|pullover|cristos|push-ups|pushups/.test(s))return 'Pecho';
if(/peso-muerto|peso muerto|pull-?up|pullup|pulldown|remo|jalon|jalón|dorsal|espalda/.test(s))return 'Espalda';
if(/izquio|isquio|pantorrilla|sentadilla|cuadriceps|femoral/.test(s))return 'Pierna';
if(/gluteo|cadera|\bhip\b|patada/.test(s))return 'Glúteos';
if(/hombro|deltoid|elevaci/.test(s))return 'Hombro';
if(/biceps|bíceps|predicador-maq$|curl-predicador|martillo/.test(s))return 'Bíceps';
if(/triceps|tríceps|skull|pushdown|extension de tr/.test(s))return 'Tríceps';
if(/antebrazo|prono|supino|muñeca|mancuerna.*antebrazo/.test(s))return 'Antebrazo';
return 'Otro';
}
function fmtW(w,unit){const a=String(w||'').trim(),u=String(unit||'').trim();if(!a)return '-';if(!u)return a;const na=a.toLowerCase(),nu=u.toLowerCase();if(na.includes(nu))return a;return a+u}
const $=id=>document.getElementById(id);
$('todayLine').textContent=new Date().toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'short'});
function refreshUser(){$('userName').textContent=S.user?('· '+S.user):'';$('nameInput').value=S.user||''}
refreshUser();
// temas: paleta coherente generada del color elegido (tono -> fondo, tarjeta, acento)
function hexHSL(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const r=parseInt(h.slice(0,2),16)/255,g=parseInt(h.slice(2,4),16)/255,b=parseInt(h.slice(4,6),16)/255;const M=Math.max(r,g,b),m=Math.min(r,g,b);let H=0,SS=0;const L=(M+m)/2;if(M!==m){const d=M-m;SS=L>0.5?d/(2-M-m):d/(M+m);if(M===r)H=(g-b)/d+(g<b?6:0);else if(M===g)H=(b-r)/d+2;else H=(r-g)/d+4;H*=60}return Math.round(H)}
function applyTheme(hex,quiet){try{const H=hexHSL(hex);const st=document.documentElement.style;st.setProperty('--acc',`hsl(${H},90%,65%)`);st.setProperty('--bg',`hsl(${H},35%,10%)`);st.setProperty('--card',`hsl(${H},28%,18%)`);st.setProperty('--head',`hsl(${H},45%,6%)`);st.setProperty('--accsoft',`hsl(${H},45%,24%)`);st.setProperty('--acctext',`hsl(${H},90%,80%)`);S.theme=hex;if(!quiet)save();const ci=$('themeColor');if(ci)ci.value=hex}catch(e){}}
if(S.theme)applyTheme(S.theme,true);
$('themeColor').oninput=e=>applyTheme(e.target.value);
document.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>applyTheme(b.dataset.th));
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');['tab-hoy','tab-rutinas','tab-progreso','tab-ajustes'].forEach(t=>$(t).style.display=t===b.dataset.t?'block':'none');if(b.dataset.t==='tab-progreso')renderProg()});
function fillRoutines(){$('routineSelect').innerHTML=S.routines.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');if(S.mainRoutine&&S.routines.some(r=>r.id===S.mainRoutine))$('routineSelect').value=S.mainRoutine}
fillRoutines();
function curRoutine(){return S.routines.find(r=>r.id===$('routineSelect').value)||S.routines[0]}
// historial POR EJERCICIO (junta todas las rutinas y fechas)
function histFor(canon){
const out=[];
S.sessions.forEach(s=>{
(s.blocks||[]).forEach(b=>{if(b.canon===canon)out.push({d:s.date,b})});
});
return out.sort((a,b)=>new Date(a.d)-new Date(b.d));
}
function lastFor(canon){const h=histFor(canon);return h.length?h[h.length-1]:null}
function renderHoy(){
const R=curRoutine();
$('routineInfo').textContent=(R.warm?R.warm+' · ':'')+R.items.length+' bloques (mismo ejercicio puede repetirse: Round 2)';
$('workoutList').innerHTML=R.items.map((it,idx)=>{
const c=catById(it.canon)||{name:it.canon,unit:'lb',target:10};
const H=histFor(it.canon);
const L=H.length?H[H.length-1]:null;
const lastTxt=L?L.b.reps.join(',')+' ('+new Date(L.d).toLocaleDateString()+')':'sin registro';
const baseU=c.unit||'lb';
const canLBKG=(baseU==='lb'||baseU==='kg');
const du=canLBKG?dispUnit(it.canon,baseU):baseU;
const lastW=L?L.b.weights:[];
const dispW=raw=>du===baseU?raw:convW(raw,baseU,du);
const rows=Array.from({length:it.sets},(_,i)=>{
const rawW=lastW[i]||it.w||'';
const base=wNum(rawW);
const shown=base==null?rawW:(du===baseU?cleanW(rawW):r1(du==='kg'?base/LBKG:base*LBKG));
const lr=(L&&L.b&&L.b.reps[i]!=null&&L.b.reps[i]!=='')?L.b.reps[i]:'–';
const lw=(L&&L.b&&L.b.weights[i])?L.b.weights[i]:'';
return `<div class="setrow"><label>${i+1}.</label>
<input data-b="${idx}" data-k="w${i}" value="${shown}" data-base="${base==null?'':base}" inputmode="decimal" aria-label="peso"> <span class="small" data-us="${idx}">${du.toUpperCase()}</span>
<button class="stepbtn" data-act="-" data-b="${idx}" data-i="${i}">−</button>
<input class="rep" data-b="${idx}" data-k="r${i}" type="number" min="0" max="100" placeholder="-">
<button class="stepbtn" data-act="+" data-b="${idx}" data-i="${i}">+</button>
<span class="lastbig" title="Última vez: ${lr}${lw?' ('+lw+')':''}">${lr}</span></div>`}).join('');
const ubtn=canLBKG?`<button class="ubtn" data-u="${idx}" title="Cambiar a ${du==='lb'?'kilos':'libras'}">${du.toUpperCase()} ⇄</button>`:'';
const w0n=wNum(lastW[0]||it.w||'');
const eq=(canLBKG&&w0n!=null)?`<div class="small" id="eq-${idx}">≈ ${r1(baseU==='lb'?w0n/LBKG:w0n*LBKG)} ${baseU==='lb'?'KG':'LB'}</div>`:'';
const imgFile=muscleImg(it,c);
const img=imgFile?`<img class="muscle" src="graficos/${imgFile}" alt="" loading="lazy" onerror="this.style.display='none'">`:'';
let up='';
const tgt=it.target||c.target;
if(L&&L.b.reps.length>=1&&L.b.reps.every(v=>v>0&&v>=tgt))up=`<span class="badge up">lvl UP sugerido</span>`;
const tag=it.tag?` <span class="badge">${it.tag}</span>`:'';
return `<div class="card ex"><h3>${c.name}${tag} <span class="badge">${c.grupo||''}</span> <span class="badge">meta ${tgt}</span>${up} ${ubtn}</h3>
<div class="extop"><div class="exnote">${L?'':`<div class="small">Primera vez, sin registro previo</div>`}${it.note?`<div class="small">${it.note}</div>`:''}${eq}</div>${img}</div>
<div class="exsets">${rows}<div class="small" id="diff-${idx}"></div></div></div>`
}).join('');
document.querySelectorAll('#workoutList .stepbtn').forEach(b=>b.onclick=()=>{
const inp=document.querySelector(`input[data-b="${b.dataset.b}"][data-k="r${b.dataset.i}"]`);
let v=parseInt(inp.value||'0');v+=b.dataset.act==='+'?1:-1;if(v<0)v=0;if(v>100)v=100;inp.value=v;SHOWTOT=false;liveDiff();
});
document.querySelectorAll('#workoutList input').forEach(i=>i.oninput=()=>{if(i.classList.contains('rep')&&i.value!==''&&parseInt(i.value)>100)i.value=100;SHOWTOT=false;liveDiff()});
document.querySelectorAll('#workoutList input.rep').forEach(inp=>{
inp.addEventListener('focus',()=>{inp.dataset.prev=inp.value;delete inp.dataset.ok});
inp.addEventListener('change',async()=>{
let v=parseInt(inp.value||'0');if(!v)return;
const R2=curRoutine(),it2=R2.items[parseInt(inp.dataset.b)];if(!it2)return;
const c2=catById(it2.canon);const tgt=it2.target||(c2&&c2.target)||10;
let hm=tgt;histFor(it2.canon).forEach(h=>h.b.reps.forEach(r=>{if(r>hm)hm=r}));
const base=Math.max(hm,10);
if(v>base*2){
const ok=await askYesNo(`Repeticiones anormalmente altas para ${c2?c2.name:it2.canon} (sueles ${base} o menos). ¿Dejar ${v}?`);
if(ok){inp.dataset.ok='1'}else{inp.value=inp.dataset.prev||'';liveDiff()}
}
});
});
document.querySelectorAll('#workoutList input[data-k^="w"]').forEach(inp=>inp.addEventListener('input',()=>{
const R2=curRoutine();const it2=R2.items[parseInt(inp.dataset.b)];if(!it2)return;
const c2=catById(it2.canon);const baseU2=(c2&&c2.unit)||'lb';
const du2=dispUnit(it2.canon,baseU2);
const n=wNum(inp.value);
inp.dataset.base=n==null?'':String(du2===baseU2?n:(du2==='kg'?n*LBKG:n/LBKG));
}));
document.querySelectorAll('#workoutList [data-u]').forEach(b=>b.onclick=()=>{
const R=curRoutine();const it=R.items[parseInt(b.dataset.u)];if(!it)return;
const c=catById(it.canon);const baseU=(c&&c.unit)||'lb';
const cur=dispUnit(it.canon,baseU);const nxt=cur==='lb'?'kg':'lb';
S.disp[it.canon]=nxt;save();
for(let i=0;i<it.sets;i++){
const inp=document.querySelector(`input[data-b="${b.dataset.u}"][data-k="w${i}"]`);
if(!inp)continue;
const base=parseFloat(inp.dataset.base);
if(isNaN(base))continue;
inp.value=nxt===baseU?r1(base):r1(nxt==='kg'?base/LBKG:base*LBKG);
}
document.querySelectorAll(`[data-us="${b.dataset.u}"]`).forEach(s=>s.textContent=nxt.toUpperCase());
b.textContent=nxt.toUpperCase()+' ⇄';b.title='Cambiar a '+(nxt==='lb'?'kilos':'libras');
const w0=document.querySelector(`input[data-b="${b.dataset.u}"][data-k="w0"]`);
const eq=$('eq-'+b.dataset.u);
if(eq){const bb=w0?parseFloat(w0.dataset.base):NaN;eq.textContent=(w0&&!isNaN(bb))?`≈ ${r1(nxt==='lb'?bb*LBKG:bb/LBKG)} ${nxt==='lb'?'KG':'LB'}`:''}
});
liveDiff();
}
function readForm(){
const R=curRoutine();
return R.items.map((it,idx)=>{
const c0=catById(it.canon);const baseU=(c0&&c0.unit)||'lb';
const du=dispUnit(it.canon,baseU);
const ws=[],rs=[];
for(let i=0;i<it.sets;i++){
const qi=document.querySelector(`input[data-b="${idx}"][data-k="w${i}"]`);
let w=qi.value;
if(qi.dataset.base!==''&&qi.dataset.base!=null&&!isNaN(parseFloat(qi.dataset.base)))w=qi.dataset.base;
const r=parseInt(document.querySelector(`input[data-b="${idx}"][data-k="r${i}"]`).value||'0');
ws.push(w);rs.push(r);
}
const c=catById(it.canon);
return {canon:it.canon,nameSnap:c0?c0.name:it.canon,weights:ws,reps:rs,tag:it.tag||''};
});
}
let LASTTOT=null;
let SHOWTOT=false;
function liveDiff(){
const R=curRoutine();const blocks=readForm();let tot=0;
blocks.forEach((b,idx)=>{
const H=histFor(b.canon);let d=0;
const sN=b.reps.reduce((a,x)=>a+x,0);
if(H.length){const sL=H[H.length-1].b.reps.reduce((a,x)=>a+x,0);d=sN-sL}else d=sN;
tot+=d;
const el=$('diff-'+idx);if(el)el.innerHTML=(sN>0&&d>0)?`+${d} vs última vez`:((sN>0&&d<0)?`${d} vs última vez`:'');
});
$('dayTotal').textContent=SHOWTOT?('Total +'+tot):'Total';
if(SHOWTOT&&LASTTOT!==null&&tot>LASTTOT){const el=$('dayTotal');el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}
LASTTOT=tot;
return {tot,blocks};
}
$('routineSelect').onchange=renderHoy;
$('saveBtn').onclick=()=>{
const R=curRoutine();const {tot,blocks}=liveDiff();
if(!blocks.some(b=>b.reps.some(v=>v>0))){$('saveMsg').textContent='Llena al menos 1 rep.';return}
blocks.forEach(b=>ensureCanon(b.canon,b.nameSnap));
S.sessions.push({date:new Date().toISOString(),routineId:R.id,blocks,total:tot});
save();
SHOWTOT=false;renderHoy();renderProgList();
LASTTOT=null;
$('dayTotal').textContent='Total +'+tot;
{const el=$('dayTotal');el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}
const recap=blocks.map(b=>{const s=b.reps.reduce((a,x)=>a+x,0);return `<b>${b.nameSnap}${b.tag?' ['+b.tag+']':''} ${s}</b>`}).join('<br>');
let ups=[];
R.items.forEach((it,i)=>{const c=catById(it.canon);const tgt=it.target||(c&&c.target)||10;if(blocks[i].reps.every(v=>v>=tgt&&v>0))ups.push((c?c.name:it.canon)+(it.tag?' '+it.tag:''))});
const upsHtml=ups.length?`<div style="margin:8px 0;text-align:center">${ups.map(u=>`<span class="badge bigup">Lvl up: ${u}</span>`).join(' ')}</div>`:'';
$('saveMsg').innerHTML=`${upsHtml}${recap}`;
$('saveMsg').scrollIntoView({behavior:'smooth',block:'center'});
};
renderHoy();
function slug(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)||'ejercicio'}
let OPEN=new Set();
let FUSE=null;
function renderRoutines(){
const catOpts=GRUPOS.map(g=>{const items=S.catalog.filter(c=>(c.grupo||'Otro')===g);return items.length?`<optgroup label="${g}">${items.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</optgroup>`:''}).join('');
$('routineEdit').innerHTML=S.routines.map(r=>`<div class="card" data-r="${r.id}">
<div style="display:flex;gap:8px;align-items:center"><b style="flex:1">${r.name} <span class="small">(${r.items.length})</span></b><button class="stepbtn" data-op="main" data-r="${r.id}" title="Marcar como rutina principal" style="width:auto;padding:0 12px;font-size:20px;${S.mainRoutine===r.id?'color:var(--acc);':'opacity:.45'}">★</button><button class="stepbtn" data-col="${r.id}" style="width:auto;padding:0 14px;font-size:16px">${OPEN.has(r.id)?'▲':'▼'}</button></div>
<div id="cb-${r.id}" style="display:${OPEN.has(r.id)?'block':'none'}"><label>Nombre de rutina</label>
<input data-rf="name" data-r="${r.id}" value="${r.name.replace(/"/g,'&quot;')}">
<label>Calentamiento (opcional)</label>
<input data-rf="warm" data-r="${r.id}" value="${(r.warm||'').replace(/"/g,'&quot;')}">
<hr>${r.items.map((it,i)=>{const c=catById(it.canon);return `<div id="blk-${r.id}-${i}" style="margin-bottom:10px;border-top:1px solid #334155;padding-top:8px"><b>${c?c.name:it.canon}</b> ${it.tag?`[${it.tag}]`:''}
<div class="small" style="margin-top:4px;display:flex;gap:6px"><span style="flex:1">sets</span><span style="flex:1">peso base</span><span style="flex:1">meta reps</span></div>
<div style="display:flex;gap:6px;margin-top:4px">
<input type="number" min="1" max="8" style="flex:1" data-r="${r.id}" data-i="${i}" data-f="sets" value="${it.sets}" title="sets: cuántas series">
<input style="flex:1" data-r="${r.id}" data-i="${i}" data-f="w" value="${it.w}" title="peso base: con el que empieza">
<input type="number" min="1" max="50" style="flex:1" data-r="${r.id}" data-i="${i}" data-f="target" value="${it.target||(c&&c.target)||''}" placeholder="meta" title="meta: reps para lvl UP (vacío = la del catálogo)">
</div><div class="small" style="margin-top:4px;display:flex;gap:6px"><span style="flex:1">etiqueta</span><span style="flex:1">nota</span></div>
<div style="display:flex;gap:6px;margin-top:4px">
<input style="flex:1" data-r="${r.id}" data-i="${i}" data-f="tag" value="${it.tag||''}" placeholder="etiqueta ej Round 2">
<input style="flex:1" data-r="${r.id}" data-i="${i}" data-f="note" value="${(it.note||'').replace(/"/g,'&quot;')}" placeholder="nota">
</div><div class="trow">
<button data-op="up" data-r="${r.id}" data-i="${i}">↑</button>
<button data-op="dn" data-r="${r.id}" data-i="${i}">↓</button>
<button data-op="rm" data-r="${r.id}" data-i="${i}">Quitar</button>
</div></div>`}).join('')}
<div style="display:flex;gap:6px;margin-top:6px"><select id="add-${r.id}" style="flex:2">${catOpts}</select><button class="ghost" style="flex:1;margin-top:0" data-op="add" data-r="${r.id}">+ Agregar</button></div>
<div class="trow"><button data-op="delr" data-r="${r.id}">Borrar rutina</button></div>
<div class="small">Borrar/quitar no borra tu historial, solo la plantilla.</div></div></div>`).join('')
+`<div class="card"><h3>Nueva rutina</h3><div style="display:flex;gap:6px"><input id="newRName" placeholder="Ej: Rutina suave de Ana" style="flex:2"><button class="ghost" style="flex:1;margin-top:0" id="newRBtn">Crear</button></div>
<div class="small">Ideal para empezar despacio: crea la rutina con 1-2 ejercicios y agrega más cuando esté lista.</div></div>`
+`<div class="card">
<div style="display:flex;gap:8px;align-items:center"><h3 style="flex:1;margin:0">Nuevo ejercicio + Catálogo</h3><button class="stepbtn" data-col="catalog" style="width:auto;padding:0 14px;font-size:16px">${OPEN.has('catalog')?'▲':'▼'}</button></div>
<div id="cb-catalog" style="display:${OPEN.has('catalog')?'block':'none'}">
<div class="small">Aquí se define meta, unidad y grupo.</div>
<div class="small" style="display:flex;gap:6px"><span style="flex:2">nombre</span><span style="flex:1">unidad</span><span style="flex:1">meta reps</span></div>
<div style="display:flex;gap:6px;margin-top:4px"><input id="newExName" placeholder="Nombre ej: Fondos en paralelas" style="flex:2"><select id="newExUnit" style="flex:1"><option value="lb">libras (lb)</option><option value="kg">kilos (kg)</option><option value="discos">discos</option><option value="placas">placas</option></select><input id="newExTarget" type="number" placeholder="meta" style="flex:1" value="10"></div>
<div class="small" style="margin-top:6px">grupo muscular</div>
<div style="display:flex;gap:6px;margin-top:6px"><select id="newExGrupo" style="flex:1">${GRUPOS.map(g=>`<option>${g}</option>`).join('')}</select><button class="ghost" style="flex:1;margin-top:0" id="newExBtn">Crear ejercicio</button></div><hr>`
+S.catalog.map(c=>{const nreg=S.sessions.reduce((a,s)=>a+(s.blocks||[]).filter(b=>b.canon===c.id).length,0);
const fuseBox=FUSE===c.id?`<div style="display:flex;gap:6px;margin-top:4px"><select id="fuseTarget" style="flex:2">${GRUPOS.map(g=>{const items=S.catalog.filter(x=>(x.grupo||'Otro')===g&&x.id!==c.id);return items.length?`<optgroup label="${g}">${items.map(x=>`<option value="${x.id}">${x.name}</option>`).join('')}</optgroup>`:''}).join('')}</select><button class="ghost" style="flex:1;margin-top:0" data-cop="fusego" data-c="${c.id}">Unir</button><button class="ghost" style="flex:1;margin-top:0" data-cop="fusex">X</button></div>`:'';
return `<div style="margin:6px 0"><span>${c.name}<br><span class="small">${c.id} · ${nreg} registros</span></span><div style="display:flex;gap:6px;margin-top:4px"><input type="number" style="flex:1" data-c="${c.id}" data-f="target" value="${c.target}" title="meta reps"><input style="flex:1" data-c="${c.id}" data-f="unit" value="${c.unit}" title="unidad"><select style="flex:1" data-c="${c.id}" data-f="grupo">${GRUPOS.map(g=>`<option ${g===(c.grupo||'Otro')?'selected':''}>${g}</option>`).join('')}</select></div><div class="small">meta | unidad | grupo</div>
<div class="trow"><button data-cop="ren" data-c="${c.id}">Renombrar</button><button data-cop="fuse" data-c="${c.id}">Fusionar</button><button data-cop="del" data-c="${c.id}">Borrar</button></div>${fuseBox}</div>`}).join('')+`</div><button class="primary" id="saveCat">Guardar todo</button></div>`;
$('saveCat').onclick=()=>{
// catálogo
document.querySelectorAll('#routineEdit [data-c]').forEach(inp=>{
const C=catById(inp.dataset.c);if(!C)return;
if(inp.dataset.f==='target')C.target=parseInt(inp.value)||C.target;
if(inp.dataset.f==='unit')C.unit=inp.value;
if(inp.dataset.f==='grupo')C.grupo=inp.value;
});
// rutinas: nombres, warm, valores de bloques
document.querySelectorAll('#routineEdit [data-rf]').forEach(inp=>{
const R=S.routines.find(x=>x.id===inp.dataset.r);if(!R)return;
if(inp.dataset.rf==='name'&&inp.value.trim())R.name=inp.value.trim();
if(inp.dataset.rf==='warm')R.warm=inp.value.trim();
});
document.querySelectorAll('#routineEdit [data-r][data-i][data-f]').forEach(inp=>{
const R=S.routines.find(x=>x.id===inp.dataset.r);if(!R)return;
const it=R.items[parseInt(inp.dataset.i)];if(!it)return;
if(inp.dataset.f==='sets')it.sets=Math.min(8,Math.max(1,parseInt(inp.value)||it.sets));
if(inp.dataset.f==='w')it.w=inp.value;
if(inp.dataset.f==='target')it.target=parseInt(inp.value)||undefined;
if(inp.dataset.f==='tag')it.tag=inp.value.trim();
if(inp.dataset.f==='note')it.note=inp.value.trim();
});
save();fillRoutines();renderHoy();renderRoutines();renderProgList();
alert('Rutinas y catálogo guardados.');
};
document.querySelectorAll('#routineEdit [data-col]').forEach(b=>b.onclick=()=>{
const id=b.dataset.col,body=$('cb-'+id);if(!body)return;
const hid=body.style.display==='none';
body.style.display=hid?'block':'none';b.textContent=hid?'▲':'▼';
if(hid)OPEN.add(id);else OPEN.delete(id);
});
document.querySelectorAll('#routineEdit [data-op]').forEach(b=>b.onclick=()=>{
const R=S.routines.find(x=>x.id===b.dataset.r);if(!R&&b.dataset.op!=='add')return;
const i=parseInt(b.dataset.i);
function slideMove(rid,i,dir){
const cb=$('cb-'+rid);
const oldT={};
if(cb)cb.querySelectorAll('[id^="blk-"]').forEach(el=>oldT[el.id]=el.getBoundingClientRect().top);
const R=S.routines.find(x=>x.id===rid);if(!R)return;
const j=dir<0?i-1:i+1;
if(j<0||j>=R.items.length)return;
R.items.splice(j,0,R.items.splice(i,1)[0]);
save();renderRoutines();renderHoy();
OPEN.add(rid);
[['blk-'+rid+'-'+j,oldT['blk-'+rid+'-'+i]],['blk-'+rid+'-'+i,oldT['blk-'+rid+'-'+j]]].forEach(([id,ot])=>{
const el=document.getElementById(id);if(!el||ot==null||!isFinite(ot))return;
const d=ot-el.getBoundingClientRect().top;
if(Math.abs(d)>2)el.animate([{transform:`translateY(${d}px)`},{transform:'translateY(0)'}],{duration:500,easing:'ease'});
});
const el2=document.getElementById('blk-'+rid+'-'+j);
if(el2){el2.scrollIntoView({behavior:'smooth',block:'nearest'});el2.classList.add('flash');setTimeout(()=>el2.classList.remove('flash'),1500)}
}
if(b.dataset.op==='up'&&i>0){slideMove(R.id,i,-1)}
if(b.dataset.op==='dn'&&i<R.items.length-1){slideMove(R.id,i,1)}
if(b.dataset.op==='rm'){if(confirm('¿Quitar este ejercicio de la rutina? (el historial se conserva)')){R.items.splice(i,1);save();renderRoutines();fillRoutines();renderHoy()}}
if(b.dataset.op==='add'){const sel=$('add-'+R.id);const c=catById(sel.value);if(c){const w0=prompt('Peso base ('+c.unit+'):','');R.items.push({canon:c.id,sets:2,w:w0||'',tag:'',note:''});save();renderRoutines();fillRoutines();renderHoy()}}
if(b.dataset.op==='delr'){if(confirm('Borrar "'+R.name+'"? El historial se conserva.')){if(S.mainRoutine===R.id)S.mainRoutine=null;S.routines=S.routines.filter(x=>x.id!==R.id);save();fillRoutines();renderRoutines();renderHoy()}}
if(b.dataset.op==='main'){S.mainRoutine=R.id;save();fillRoutines();renderRoutines();renderHoy()}
});
document.querySelectorAll('#routineEdit [data-cop]').forEach(b=>b.onclick=()=>{
const C=catById(b.dataset.c);if(!C)return;
const op=b.dataset.cop;
const refresh=()=>{save();fillRoutines();renderHoy();renderRoutines();renderProgList()};
if(op==='ren'){
const n=prompt('Nuevo nombre:',C.name);if(n==null)return;const nn=n.trim();if(!nn||nn===C.name)return;
const nid=slug(nn);
if(nid!==C.id&&catById(nid)){alert('Ya existe "'+catById(nid).name+'". Usa Fusionar en su lugar.');return}
S.sessions.forEach(s=>(s.blocks||[]).forEach(bl=>{if(bl.canon===C.id){bl.canon=nid;bl.nameSnap=nn}}));
S.routines.forEach(r=>r.items.forEach(it=>{if(it.canon===C.id)it.canon=nid}));
C.id=nid;C.name=nn;C.grupo=grupoAuto(nid,nn);
refresh();
}
if(op==='fuse'){FUSE=C.id;renderRoutines()}
if(op==='fusex'){FUSE=null;renderRoutines()}
if(op==='fusego'){
const t=$('fuseTarget');const T=t&&catById(t.value);if(!T){alert('Elige el destino');return}
if(!confirm('Mover todo "'+C.name+'" a "'+T.name+'"?'))return;
S.sessions.forEach(s=>(s.blocks||[]).forEach(bl=>{if(bl.canon===C.id){bl.canon=T.id;bl.nameSnap=T.name}}));
S.routines.forEach(r=>r.items.forEach(it=>{if(it.canon===C.id)it.canon=T.id}));
S.catalog=S.catalog.filter(x=>x.id!==C.id);
FUSE=null;refresh();alert('Fusionado en "'+T.name+'". Historial unido.');
}
if(op==='del'){
const n=S.sessions.reduce((a,s)=>a+(s.blocks||[]).filter(bl=>bl.canon===C.id).length,0);
if(n>0){alert('Tiene '+n+' registros. Fusiónalo con otro primero para no perderlos.');return}
if(confirm('Borrar "'+C.name+'" del catálogo?')){S.catalog=S.catalog.filter(x=>x.id!==C.id);refresh()}
}
});
$('newRBtn').onclick=()=>{
const n=$('newRName').value.trim();if(!n){alert('Ponle nombre a la rutina');return}
S.routines.push({id:'r'+Date.now(),name:n,warm:'',items:[]});
save();fillRoutines();renderRoutines();$('routineSelect').value=S.routines[S.routines.length-1].id;renderHoy();
};
$('newExBtn').onclick=()=>{
const n=$('newExName').value.trim();if(!n){alert('Ponle nombre al ejercicio');return}
const id=slug(n);if(catById(id)){alert('Ya existe un ejercicio parecido: '+catById(id).name);return}
S.catalog.push({id,name:n,unit:$('newExUnit').value.trim()||'lb',target:parseInt($('newExTarget').value)||10,grupo:$('newExGrupo').value});
save();renderRoutines();renderProgList();alert('Ejercicio creado. Ahora agrégalo a una rutina con + Agregar.');
};
}
renderRoutines();
function renderProgList(){
const counts={};S.sessions.forEach(s=>(s.blocks||[]).forEach(b=>counts[b.canon]=(counts[b.canon]||0)+1));
const byG={};S.catalog.forEach(c=>{(byG[c.grupo||'Otro']=byG[c.grupo||'Otro']||[]).push(c)});
$('progSelect').innerHTML=GRUPOS.filter(g=>byG[g]).map(g=>`<optgroup label="${g}">${byG[g].map(c=>`<option value="${c.id}">${c.name} (${counts[c.id]||0})</option>`).join('')}</optgroup>`).join('');
}
renderProgList();
$('progSelect').onchange=renderProg;
function renderProg(){
const id=$('progSelect').value||(S.catalog[0]&&S.catalog[0].id);if(!id)return;
const c=catById(id);
$('progTitle').textContent=c.name+` (${c.grupo||'Otro'})`;
const H=histFor(id);
if(!H.length){$('progStats').textContent='Sin registros aún (ni en rutinas viejas ni nuevas).';$('histList').innerHTML='';drawEmpty();return}
const tots=H.map(h=>h.b.reps.reduce((a,b)=>a+b,0));
const vols=H.map(h=>h.b.reps.reduce((a,r,i)=>a+r*parseW(h.b.weights[i],c.unit),0));
const maxs=H.map(h=>Math.max(0,...h.b.weights.map(w=>parseW(w,c.unit))));
$('progStats').textContent='';
$('progWeight').textContent=`Peso máximo levantado: ${Math.round(maxs[0]).toLocaleString('es-MX')} → ${Math.round(maxs[maxs.length-1]).toLocaleString('es-MX')} lb`;
const items=H.slice().reverse();
const fmtH=h=>{
let f=new Date(h.d).toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
f=f.charAt(0).toUpperCase()+f.slice(1);
const sets=h.b.weights.map((w,i)=>`Set ${i+1} - ${fmtW(w,c.unit)} - ${h.b.reps[i]} reps`).join('<br>');
return `<div style="margin-bottom:10px"><b>${f}${h.b.tag?' ['+h.b.tag+']':''}:</b><br><span class="small">${sets}</span></div>`;
};
const rest=items.slice(2);
$('histList').innerHTML=items.slice(0,2).map(fmtH).join('')+(rest.length?`<button class="ghost" id="histMore">Ver ${rest.length} anteriores</button><div id="histRest" style="display:none">${rest.map(fmtH).join('')}</div>`:'');
const bm=$('histMore');if(bm)bm.onclick=()=>{const r=$('histRest');const hid=r.style.display==='none';r.style.display=hid?'block':'none';bm.textContent=hid?'Ocultar historial':'Ver '+rest.length+' anteriores'};
const MODES=[['peso','Peso máx','#facc15'],['reps','Reps','#38bdf8'],['vol','Volumen','#22c55e']];
$('chartTabs').innerHTML=MODES.map(([m,l])=>`<button class="${CHMODE===m?'go':''}" data-ch="${m}">${l}</button>`).join('');
document.querySelectorAll('#chartTabs [data-ch]').forEach(b=>b.onclick=()=>{CHMODE=b.dataset.ch;renderProg()});
if(CHMODE==='reps'){drawOne(tots,'#38bdf8',v=>String(Math.round(v)));}
else if(CHMODE==='vol'){drawOne(vols,'#22c55e',v=>Math.round(v).toLocaleString('es-MX'));}
else{drawOne(maxs,'#facc15',v=>Math.round(v)+' lb');}
}
let CHMODE='peso';
function drawEmpty(){const c=$('chart');const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.fillStyle='#94a3b8';x.font='14px system-ui';x.fillText('Sin datos aún',20,40)}
function drawOne(arr,color,fmt){
const c=$('chart');const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);
let mn=Math.min(...arr),mx=Math.max(...arr);
if(!isFinite(mn)||!isFinite(mx)){mn=0;mx=10}
let lo=mn*0.9,hi=mx*1.1;
if(hi-lo<2){lo-=1;hi+=1}
if(lo<0)lo=0;
// paso "bonito" para las líneas guía (10, 20, 50...)
const rough=(hi-lo)/4,pw=Math.pow(10,Math.floor(Math.log10(rough||1)));
const nm=rough/pw,step=(nm<1.5?1:nm<3.5?2:nm<7.5?5:10)*pw;
lo=Math.floor(lo/step)*step;hi=Math.ceil(hi/step)*step;
if(hi-lo<step){hi+=step}
const L=70,T=30,B=26,W=c.width-L-12,H=c.height-T-B;
const X=i=>L+i*(W/Math.max(1,arr.length-1)),Y=v=>T+H-((v-lo)/(hi-lo))*H;
x.font='15px system-ui';x.textAlign='right';
for(let v=lo;v<=hi+step/2;v+=step){
x.strokeStyle='#334155';x.lineWidth=1;
x.beginPath();x.moveTo(L,Y(v));x.lineTo(c.width-12,Y(v));x.stroke();
x.fillStyle='#94a3b8';x.fillText(fmt(v),L-6,Y(v)+5);
}
x.strokeStyle=color;x.lineWidth=2.5;x.beginPath();
arr.forEach((v,i)=>{const px=X(i),py=Y(v);i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();
x.fillStyle=color;arr.forEach((v,i)=>{x.beginPath();x.arc(X(i),Y(v),4,0,7);x.fill()});
}
// timer descanso 3 min
let Tsec=180,Tleft=180,Tid=null;
function fmt(s){s=Math.max(0,s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function tDraw(){$('timerDisp').textContent=fmt(Tleft);$('timerDisp').classList.toggle('done',Tleft===0)}
function tBeep(){try{const A=new (window.AudioContext||window.webkitAudioContext)();[0,0.25,0.5].forEach(d=>{const o=A.createOscillator(),g=A.createGain();o.connect(g);g.connect(A.destination);o.frequency.value=880;const t=A.currentTime+d;o.start(t);g.gain.setValueAtTime(0.3,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.2);o.stop(t+0.22)});if(navigator.vibrate)navigator.vibrate([300,200,300])}catch(e){}}
function tStop(){clearInterval(Tid);Tid=null;$('tStart').textContent='Iniciar'}
$('tStart').onclick=()=>{
if(Tid){tStop();return}
if(Tleft===0)Tleft=Tsec;
$('tStart').textContent='Pausar';
Tid=setInterval(()=>{Tleft--;tDraw();if(Tleft<=0){tStop();tBeep();$('tStart').textContent='Repetir'}},1000);
};
$('t30').onclick=()=>{Tleft+=30;tDraw()};
$('tReset').onclick=()=>{tStop();Tleft=Tsec;tDraw()};
$('t1').onclick=()=>{Tsec=90;Tleft=90;tStop();tDraw()};
$('t3').onclick=()=>{Tsec=180;Tleft=180;tStop();tDraw()};
$('t5').onclick=()=>{Tsec=300;Tleft=300;tStop();tDraw()};
tDraw();
// ajustes
$('nameSave').onclick=()=>{S.user=$('nameInput').value.trim();save();refreshUser();alert('Guardado')};
$('exportBtn').onclick=()=>{
const blob=new Blob([JSON.stringify(S)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='gym-progreso.json';a.click();
};
$('importFile').onchange=e=>{
const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const j=JSON.parse(r.result);if(j.catalog&&j.routines){S=j;save();location.reload()}else alert('Ese JSON no es de la app v2')}catch(err){alert('Archivo inválido')}};r.readAsText(f);
};
$('resetBtn').onclick=()=>{if(confirm('¿Borrar todo?')){localStorage.removeItem(LS);location.reload()}};
$('loadHist').onclick=async()=>{
try{
$('histMsg').textContent='Cargando...';
const r=await fetch('sesiones-historial.json');const j=await r.json();
let add=0,upd=0;
const incomingDates=new Set(j.sessions.map(s=>s.date));
// reemplaza importados previos de esas fechas (corrige datos), respeta sesiones manuales
S.sessions=S.sessions.filter(s=>{
if((s.source||s.routineId==='importado')&&incomingDates.has(s.date)){upd++;return false}
return true;
});
const seen=new Set(S.sessions.map(s=>s.date+'|'+(s.blocks||[]).map(b=>b.canon).join(',')));
j.sessions.forEach(s=>{
const k=s.date+'|'+(s.blocks||[]).map(b=>b.canon).join(',');
if(seen.has(k))return;seen.add(k);
s.blocks.forEach(b=>ensureCanon(b.canon,b.nameSnap));
S.sessions.push({date:s.date,routineId:s.routineId||'importado',source:s.source||'importado',blocks:s.blocks.map(b=>({canon:b.canon,nameSnap:b.nameSnap,weights:b.weights,reps:b.reps,tag:b.tag||''})),total:s.total||0});
add++;
});
S.sessions.sort((a,b)=>new Date(a.date)-new Date(b.date));
save();renderHoy();renderRoutines();renderProgList();
$('histMsg').textContent=`Listo: ${add} agregadas, ${upd} actualizadas, ${S.sessions.length} en total. Tus sesiones manuales intactas.`;
}catch(e){$('histMsg').textContent='No se pudo leer sesiones-historial.json (¿abriste con el .bat/servidor?). Error: '+e}
};
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{})}
function askYesNo(msg){return new Promise(res=>{const m=$('modal');if(!m){res(confirm(msg));return}$('modalMsg').textContent=msg;m.style.display='flex';$('modalYes').onclick=()=>{m.style.display='none';res(true)};$('modalNo').onclick=()=>{m.style.display='none';res(false)}})}
