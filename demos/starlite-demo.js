/* Portfolio demo adapter. Original views and filters; fictional records only. */
const demoNote=()=>showToast('Demo portofolio: jelajahi menu, filter, dan rincian. Pengiriman dan perubahan data produksi tidak tersedia.','info',4500);
const demoUsers=[{id:'demo-owner',name:'Pengunjung Demo',username:'demo',role:'owner',active:true,createdAt:'2026-10-01',createdBy:'Demo',lastLogin:''},{id:'demo-finance',name:'Tim Finance',username:'finance.demo',role:'operator',active:true},{id:'demo-legal',name:'Tim Legal',username:'legal.demo',role:'viewer',active:true}];
restoreSession=()=>null;warmBackend=()=>{};prefetchSheetMeta=()=>Promise.resolve({});preloadSnapshot=()=>Promise.resolve(false);saveSnapshot=()=>{};can=()=>true;
autoSyncGoogleSheets=async()=>{STATE.lastSync=Date.now();updateSyncLabels();};syncNow=()=>{refreshAll();demoNote();};
apiPost=apiPostOnce=callApi=async(action)=>{
 if(action==='users.list')return {ok:true,users:demoUsers,rolePerms:DEFAULT_ROLE_PERMS};
 if(action==='logs.list')return {ok:true,logs:[{at:'2026-10-13T09:00:00Z',user:'Tim Legal',aksi:'Review dokumen',ref:'BA-DEMO-001',file:'Dokumen contoh'}]};
 if(action==='me')return {ok:true,...demoUsers[0],perms:Object.fromEntries(PERMS.map(p=>[p.key,true]))};
 if(action==='sign.list')return {ok:true,docs:SG.docs,people:SG.people};
 if(action==='req.list')return {ok:true,items:REQ.items,rev:1};
 if(action==='surat.list')return {ok:true,types:SURAT.types,data:SURAT.data};
 if(action==='sign.people.save')return {ok:true,people:SG.people};
 if(action==='changes.since')return {ok:true,changes:[],cursor:1};
 if(action==='log'||action==='ping')return {ok:true};
 demoNote();throw new Error('Aksi ini memerlukan aplikasi operasional. Demo tidak mengirim data.');
};
sgLoad=async()=>sgRender();sgAutoFinal=()=>{};sgSignersLoad=async()=>SG.signers||[];sgTplLoad=async()=>[];
reqLoad=async()=>{REQ.loaded=true;reqRender();};reqPoll=()=>{};qPoll=async()=>{};qStart=()=>{};livePoll=async()=>{};
loadSpkData=async()=>({headers:STATE.headers.spk,items:STATE.spk});loadPoCancelData=async()=>({headers:STATE.headers.pocancel,items:STATE.pocancel});
loadExtSheet=async()=>({headers:[],items:[]});trkFetch=trkSync=async()=>{TRK.ready=true;trkFill();trkApply();};
rnLoad=async()=>true;rnAuto=()=>{};rnSync=async()=>rnRender();
suratLoad=async()=>{SURAT.loaded=true;suratRender();};
const demoBase=()=>{demoNote();};
[ 'submitUpload','submitGenerate','wzSubmit','saveRecEdit','saveRecAdd','confirmRecDelete','suratSave','suratDoDelete','sgCreate','sgFinalize','sgCancel','sgDelete','sgRemind','sgCopy','sgWa','sgQr','sgSignAllGo','reqSend','reqSetStatus','reqDelete','spIssue','spEditSave','sgPeopleManage','sgTplManage','umDevicesOpen','umAccessOpen','submitPwChange','saveUserModal','deleteUser','toggleUserActive','saveRolePerms'].forEach(n=>{try{window[n]=demoBase;}catch{}});
function seedPortfolioDemo(){
 CONFIG.GOOGLE_API_KEY='';CONFIG.USE_CACHE=false;BACKEND.URL='';BACKEND.SURAT_URL='';
 currentUser={...demoUsers[0],perms:Object.fromEntries(PERMS.map(p=>[p.key,true])),remember:false};
 const rows=[];const regions=['JABAR','JABODEBEK-BANTEN','JATENG','JATIM'];const pics=['Tim Operasional A','Tim Operasional B','Tim Operasional C'];
 for(let i=0;i<16;i++){const row=Array(37).fill('');Object.entries({0:'PO-DEMO-'+String(i+1).padStart(3,'0'),1:'BAP-DEMO-'+(i+1),2:'Site Contoh '+String(i+1).padStart(2,'0'),4:'PT Mitra Lama '+(i%3+1),5:'PT Mitra Pengganti '+(i%4+1),6:regions[i%4],7:pics[i%3],9:i%4===0?'Selesai':'Sedang Proses',10:i%4===0?'Done':'Proses',11:i%3===0?'Done':'Proses',12:i%4===0?'Done':'Proses',13:'Data simulasi untuk demonstrasi portofolio',16:'SPK-DEMO-'+(i+1),17:(i%12+1)+'/10/2026',25:200+i*20,26:120+i*12,27:50+i*3,31:10000000+i*500000,32:5000000,33:1000000,34:5000000,35:0,36:'Aktif'}).forEach(([k,v])=>row[k]=String(v));rows.push([i+2,row]);}
 STATE.takeover=buildTakeover(rows);STATE.takeover.forEach((r,i)=>{r.st=['selesai','proses','belum','proses'][i%4];});
 STATE.perseroan=buildPerseroan(Array.from({length:7},(_,i)=>[i+2,['Mitra '+(i+1),i<3?'PT Mitra Lama '+(i+1):'PT Mitra Pengganti '+(i-2),'Badan Usaha','Alamat simulasi','Direksi Contoh','','','Data contoh',i<3?'Tidak Aktif':'Aktif']]));
 STATE.sp=buildSp(Array.from({length:5},(_,i)=>[i+2,['SP1-DEMO-'+(i+1),i>1?'SP2-DEMO-'+(i+1):'',i>3?'SP3-DEMO-'+(i+1):'','PO-DEMO-'+String(i+1).padStart(3,'0'),'PT Mitra Lama '+(i%3+1),'Site Contoh '+(i+1),regions[i%4],pics[i%3],'','','Kinerja belum memenuhi target','01/10/2026',String(5+i*7),'Tindak lanjut contoh','']]));
 STATE.spk=buildSpk(STATE.takeover.map((r,i)=>{const a=Array(19).fill('');Object.entries({1:r.att_spk,3:'Starlite',4:['Takeover','Expand','New'][i%3],5:r.after,6:r.region,7:r.stasiun,9:r.before,10:r.po,15:r.spk_raw,18:'Data contoh'}).forEach(([k,v])=>a[k]=v);return[i+3,a];}));
 STATE.pocancel=buildPoCancel(STATE.takeover.slice(0,4).map((r,i)=>{const a=Array(17).fill('');Object.entries({4:r.before,5:r.region,6:r.stasiun,7:r.po,9:r.hp_po_raw,11:r.hp_act_raw,12:r.hc_raw,13:'Takeover',14:'BA-CANCEL-DEMO-'+(i+1),16:'01/10/2026'}).forEach(([k,v])=>a[k]=v);return[i+3,a];}));
 TRK.rows=STATE.takeover.map((r,i)=>({...r,item:'FTTH',stasiun:r.stasiun,status:['Selesai','Proses','Belum mulai'][i%3],hp:r.hp_act,don:0,admin:'Admin Demo'}));TRK.at=Date.now();TRK.ready=true;
 STATE.refund=rnBuild('refund',STATE.takeover.slice(0,5).map((r,i)=>{const a=Array(20).fill('');Object.entries({0:r.po,1:'SURAT-DEMO-'+i,2:r.before,3:r.stasiun,4:r.region,5:r.pic,7:'PRF-DEMO',8:'INV-DEMO',12:3000000+i*1500000,13:'FTTH',15:i%2?'Proses':'Selesai',16:'Simulasi refund',19:'Sudah diberitahukan'}).forEach(([k,v])=>a[k]=String(v));return[i+2,a];}));
 STATE.hibank=rnBuild('hibank',STATE.takeover.slice(0,4).map((r,i)=>{const a=Array(15).fill('');Object.entries({0:r.po,1:r.stasiun,2:r.after,3:'01/10/2026',5:50+i*10,7:5000000+i*1000000,9:i%2?'05/10/2026':'',11:r.po,13:'Data contoh'}).forEach(([k,v])=>a[k]=String(v));return[i+2,a];}));RN.have={hibank:true,refund:true};RN.at={hibank:Date.now(),refund:Date.now()};rnIndex();
 SG.docs=Array.from({length:5},(_,i)=>({id:'DEMO-SIGN-'+(i+1),v:2,name:['BA Serah Terima Material — Site Contoh 01','BA Cancel — Site Contoh 02','Persetujuan Internal — Finance','SPK Mitra Pengganti — Site Contoh 03','Berita Acara Penutupan PO'][i],status:i===3?'selesai':'proses',createdBy:['Vendor Management','Tim Legal','Tim Finance','Tim Operasional','Tim Procurement'][i],createdAt:Date.parse('2026-10-12T09:00:00Z'),doneAt:i===3?Date.parse('2026-10-13T09:00:00Z'):null,link:'#demo',pages:2,fields:[],signers:[{id:'s1',name:'Perwakilan Operasional',jabatan:'Operasional',status:i===0?'menunggu':'selesai',color:'#0891b2',signedAt:i>0?Date.now():null},{id:'s2',name:'Perwakilan Legal',jabatan:'Legal',status:i===3?'selesai':'menunggu',color:'#8b5cf6'}],note:'Contoh alur e-signing lintas divisi',integrations:[]}));SG.loaded=true;SG.loading=false;SG.err='';SG.people=[];SG.signers=[];SG.tpls=[];
 REQ.items=[];REQ.loaded=true;REQ.err='';SURAT.loaded=true;SURAT.errors={};SURAT.data={};
 STATE.lastSync=Date.now();STATE.linksLoaded=true;STATE.fromCache=true;
 $('login-screen').classList.add('hidden');$('app-container').classList.remove('hidden');$('user-display-name').textContent='Pengunjung Demo';
 renderUserChip();applyPermissions();sidebarStage=window.innerWidth<768?2:(window.innerWidth<1100?1:0);applySidebarStage();refreshAll();
 document.querySelectorAll('[data-logo]').forEach(el=>el.src=LOGO_SRC);
 switchTab('sirkulir');
 const banner=document.createElement('div');banner.id='portfolio-demo-label';banner.textContent='DEMO INTERAKTIF • Data contoh • E-signing digunakan seluruh divisi pada aplikasi operasional';banner.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:10000;padding:7px 12px;background:#0f172a;color:#e2e8f0;font:11px system-ui;text-align:center;pointer-events:none';document.body.append(banner);
}
window.addEventListener('DOMContentLoaded',()=>{try{seedPortfolioDemo();}catch(e){console.error('Demo initialization:',e);const b=document.createElement('p');b.textContent='Demo belum termuat: '+e.message;document.body.prepend(b);}});
window.addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='portfolio-view'&&['dashboard','sirkulir','takeover','refund','sp','docs'].includes(e.data.view)){switchTab(e.data.view);}});

