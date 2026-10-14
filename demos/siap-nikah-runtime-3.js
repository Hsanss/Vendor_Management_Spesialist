
/* Feature expansion v0.2. Preview remains session-only; live access is checked server-side. */
const KUA_SOURCE='https://kebumen.kemenag.go.id/mau-menikah-ini-syarat-dan-tahapan-pendaftaran-nikah-di-kua-sesuai-pma-30-tahun-2024/';
const KUA_PHOTO_SOURCE='https://purbalingga.kemenag.go.id/mau-nikah-pahami-dulu-persyaratan-pendaftaran-nikahnya/';
const KUA_REQUIREMENTS=[
  ['Surat pengantar nikah desa / kelurahan','Umum','Dari tempat tinggal calon pengantin.'],
  ['Fotokopi akta kelahiran','Umum','Siapkan untuk kedua calon pengantin.'],
  ['Fotokopi KTP','Umum','Identitas kedua calon pengantin.'],
  ['Fotokopi Kartu Keluarga','Umum','Pastikan identitas sesuai dokumen lain.'],
  ['Surat keterangan sehat','Umum','Dari Puskesmas atau fasilitas kesehatan.'],
  ['Persetujuan kedua calon pengantin','Umum','Siapkan formulir sesuai petunjuk KUA.'],
  ['Pas foto calon pengantin','Umum','Rujukan Purbalingga: latar biru, 4×6 dan 2×3 masing-masing 2 lembar. Konfirmasi ukuran/jumlah ke KUA tujuan.'],
  ['Rekomendasi nikah KUA asal','Bersyarat','Jika menikah di luar kecamatan domisili.'],
  ['Izin tertulis orang tua / wali','Bersyarat','Untuk calon pengantin di bawah 21 tahun.'],
  ['Dispensasi kawin pengadilan','Bersyarat','Untuk calon pengantin di bawah 19 tahun saat akad.'],
  ['Izin atasan / kesatuan','Bersyarat','Untuk anggota TNI atau Polri.'],
  ['Akta cerai','Bersyarat','Untuk duda / janda karena perceraian.'],
  ['Akta kematian pasangan','Bersyarat','Untuk duda / janda karena pasangan meninggal.'],
  ['Dokumen keterlambatan pendaftaran','Bersyarat','Jika kurang dari 10 hari kerja: dispensasi camat atau pernyataan bermeterai beserta alasan. Konfirmasi ke KUA.'],
  ['Pendaftaran kehendak nikah','Tahapan','Rencanakan paling lambat 10 hari kerja sebelum akad.'],
  ['Bimbingan perkawinan','Tahapan','Ikuti jadwal dan simpan bukti / sertifikat.'],
  ['Pemeriksaan nikah di KUA','Tahapan','Hadir bersama calon pasangan dan wali sesuai jadwal.']
];
const PAYMENT_STATES=['Belum dibayar','Proses pembayaran','DP / sebagian','Lunas','Hadiah / tanpa biaya'];
const GROUPS=['Perlengkapan ibadah','Busana & sepatu','Perawatan & kosmetik','Perhiasan','Tas & aksesori','Makanan & buah','Mahar','Lainnya'];
const ROLE_DEFAULTS={
  Pasangan:{profile:'read',budget:'write',savings:'write',gifts:'write',vendors:'write',admin:'write',guests:'write',tasks:'write',rundown:'write'},
  Koordinator:{vendors:'read',guests:'write',tasks:'write',rundown:'write'},
  Panitia:{tasks:'write',rundown:'read'},
  Pembaca:{tasks:'read',rundown:'read'}
};
const localFiles=new Map();let giftsType='Semua',adminType='Semua';
ICONS.users=ICONS.profile;
Object.assign(labels,{itemGroup:'Kelompok / subjudul',paymentStatus:'Status pembayaran',shopUrl:'Link belanja e-commerce',requirementType:'Jenis persyaratan',available:'Dokumen sudah tersedia',deliveryStatus:'Status pengiriman',address:'Alamat',email:'Email akun Google',role:'Peran',permissions:'Akses modul',invitationUrl:'URL web undangan (HTTPS)'});
const baseDemo=demo;
demo=function(){
  const data=baseDemo();
  data.gifts=[
    {id:'demo-gift',version:1,name:'Perlengkapan salat',type:'Seserahan',itemGroup:'Perlengkapan ibadah',quantity:1,amount:850000,paymentStatus:'Lunas',status:'Disiapkan',shopUrl:'https://www.tokopedia.com/search?q=perlengkapan%20salat',owner:'Ardi'},
    {id:'demo-gift2',version:1,name:'Sepatu pilihan',type:'Seserahan',itemGroup:'Busana & sepatu',quantity:1,amount:700000,paymentStatus:'Proses pembayaran',status:'Direncanakan',shopUrl:'https://shopee.co.id/search?keyword=sepatu',owner:'Nadia'},
    {id:'demo-gift3',version:1,name:'Mahar emas 5 gram',type:'Mahar',itemGroup:'Mahar',quantity:1,amount:0,paymentStatus:'Belum dibayar',status:'Direncanakan',owner:'Ardi',notes:'Isi nominal sesuai harga pembelian; ini bukan informasi harga emas.'}
  ];
  data.admin=KUA_REQUIREMENTS.map((item,i)=>({id:'kua-template-'+i,version:1,name:item[0],requirementType:item[1],available:i<2,owner:'Kedua mempelai',status:i<2?'Disiapkan':'Belum disiapkan',source:i===6?KUA_PHOTO_SOURCE:KUA_SOURCE,notes:item[2],date:''}));
  data.users=[{id:'demo-user-one',version:1,name:'Koordinator acara',email:'koordinator@contoh.test',role:'Koordinator',status:'Aktif',permissions:JSON.stringify(ROLE_DEFAULTS.Koordinator)},{id:'demo-user-two',version:1,name:'Panitia penerima tamu',email:'panitia@contoh.test',role:'Panitia',status:'Aktif',permissions:JSON.stringify(ROLE_DEFAULTS.Panitia)}];
  data.guests.forEach(x=>{x.deliveryStatus='Belum dikirim';x.address='';});
  return data;
};
const baseSave=save;
save=async function(req){if(!C.can(principal,req.collection,true))throw new Error('Hanya pengguna yang memiliki izin ubah boleh menyimpan.');return baseSave(req);};
const baseRender=render;
render=function(){
  if(route!=='dashboard'&&route!=='more'&&!C.can(principal,route,false))route='dashboard';
  if(route==='more'){route='dashboard';baseRender();route='more';}else baseRender();
  $('nav').querySelectorAll('[data-route]').forEach(b=>{if(b.dataset.route!=='dashboard'&&!C.can(principal,b.dataset.route,false))b.remove();});
  if(!live){
    const banner=$('mode-banner').querySelector('.banner');if(banner){
      const wrap=document.createElement('label');wrap.className='preview-switch';wrap.innerHTML='Simulasi akun <select id="preview-role" aria-label="Simulasi akses akun"><option value="owner">Akun utama</option>'+db.users.filter(u=>u.status==='Aktif').map(u=>'<option value="'+esc(u.id)+'" '+(principal.email===u.email?'selected':'')+'>'+esc(u.name)+'</option>').join('')+'</select>';banner.appendChild(wrap);
      $('preview-role').onchange=e=>{const u=db.users.find(x=>x.id===e.target.value);principal=u?{owner:false,email:u.email,role:u.role,permissions:JSON.parse(u.permissions)}:{owner:true,email:'utama@contoh.test',role:'Akun utama'};go('dashboard');};
    }
  }
  if(!principal.owner&&ready&&route==='dashboard')operationalDashboard();
  if(ready&&route==='more')moreMenu();
  if(ready&&!C.can(principal,route,true)&&!['dashboard','more'].includes(route)){
    $('view').querySelectorAll('#add-record,#add-task,#empty-add,button[type="submit"]').forEach(b=>b.remove());
    if(route==='profile')$('profile-form')?.querySelectorAll('input,textarea').forEach(e=>e.disabled=true);
  }
  if(!C.can(principal,'profile',false))$('avatar').textContent=principal.role==='Panitia'?'PN':'KO';
  mobileNav();
};
function mobileNav(){
  let nav=$('bottom-nav');if(!nav){nav=document.createElement('nav');nav.id='bottom-nav';nav.className='bottom-nav';nav.setAttribute('aria-label','Navigasi ponsel');document.body.appendChild(nav);}
  const keys=[['dashboard','Ringkasan'],['tasks','Tugas'],['budget','Budget'],['guests','Undangan'],['more','Menu']];
  nav.innerHTML=keys.map(([k,label])=>'<button data-bottom="'+k+'" class="'+(route===k?'active':'')+'" '+(route===k?'aria-current="page"':'')+'>'+icon(k==='more'?'menu':k)+'<span>'+label+'</span></button>').join('');
  nav.querySelectorAll('button').forEach(b=>{const k=b.dataset.bottom;if(k!=='more'&&k!=='dashboard'&&!C.can(principal,k,false)){b.disabled=true;b.style.opacity='.35';}b.onclick=()=>go(k);});
}
function moreMenu(){
  $('crumb').textContent='Semua menu';$('view').innerHTML='<div class="page-head"><div><h1>Semua menu</h1><p class="subtitle">'+esc(principal.role)+' · '+esc(principal.email||email)+'</p></div></div><div class="menu-grid">'+Object.entries(C.modules).filter(([k])=>C.can(principal,k,false)).map(([k,v])=>'<button data-menu="'+k+'">'+icon(k)+'<span>'+esc(v.title)+'</span></button>').join('')+'</div>';
  $('view').querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>go(b.dataset.menu));
}
function operationalDashboard(){
  const keys=Object.keys(C.modules).filter(k=>k!=='users'&&C.can(principal,k,false));
  $('view').innerHTML='<div class="page-head"><div><h1>Ruang panitia</h1><p class="subtitle">'+esc(principal.role)+' · '+esc(principal.email)+'</p></div></div><div class="role-alert">Menu yang tersedia mengikuti izin dari akun utama.</div><div class="menu-grid">'+keys.map(k=>'<button data-menu="'+k+'">'+icon(k)+esc(C.modules[k].title)+'</button>').join('')+'</div>';
  $('view').querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>go(b.dataset.menu));
}
const baseListing=listing;
listing=function(){if(route==='gifts')giftsPage();else if(route==='admin')adminPage();else if(route==='users')usersPage();else{baseListing();if(route==='guests')enhanceGuests();if(route==='budget')enhanceBudget();}};
fields=function(key,record={}){
  return C.modules[key].fields.filter(f=>!['permissions','attendanceLedger'].includes(f)).map(f=>{
    let vals=f==='status'?C.statuses[key]:choices[f];if(f==='type')vals=key==='savings'?['Setoran','Penarikan']:['Seserahan','Mahar'];if(f==='paymentStatus')vals=PAYMENT_STATES;if(f==='requirementType')vals=['Umum','Bersyarat','Tahapan'];if(f==='deliveryStatus')vals=['Belum dikirim','Dikirim','Dibuka'];if(f==='role')vals=Object.keys(ROLE_DEFAULTS);
    const v=record[f]??(['quota','quantity'].includes(f)?1:undefined),required=f==='name'||(key==='users'&&f==='email')||(key==='rundown'&&['start','end'].includes(f));
    const type=['amount','budget','target','quota','attending','capacity','quantity'].includes(f)?'number':f==='date'?'date':['start','end'].includes(f)?'datetime-local':f==='email'?'email':f.endsWith('Url')||f==='source'?'url':'text';
    if(f==='available')return '<div class="field full"><label class="checkbox-label"><input type="checkbox" name="available" '+(record.available?'checked':'')+'>Dokumen / langkah ini sudah tersedia atau selesai disiapkan</label></div>';
    return '<div class="field '+(f==='notes'?'full':'')+'"><label for="field-'+f+'">'+esc(labels[f])+(required?' *':'')+'</label>'+(vals?'<select id="field-'+f+'" name="'+f+'">'+vals.map(o=>'<option '+(v===o?'selected':'')+'>'+esc(o)+'</option>').join('')+'</select>':(f==='notes'?'<textarea id="field-notes" name="notes" maxlength="3000">'+esc(v)+'</textarea>':'<input id="field-'+f+'" name="'+f+'" type="'+type+'" value="'+esc(v)+'" '+(required?'required':'')+(type==='number'?' min="0" max="1000000000000" step="1"':' maxlength="'+(type==='url'?1000:250)+'"')+(f==='itemGroup'?' list="group-suggestions"':'')+'>'))+(f==='itemGroup'?'<datalist id="group-suggestions">'+GROUPS.map(g=>'<option>'+g+'</option>').join('')+'</datalist>':'')+'</div>';
  }).join('');
};
function pageHead(title,subtitle,actions){document.querySelector('.topbar>.page-head')?.remove();return '<div class="page-head"><div><h1>'+title+'</h1><p class="subtitle">'+subtitle+'</p></div>'+actions+'</div>';}
function basicToolbar(){return '<div class="toolbar"><div class="search">'+icon('search')+'<input id="search" placeholder="Cari catatan…" aria-label="Cari catatan" value="'+esc(search)+'"></div><button class="button secondary" id="export">'+icon('download')+'Ekspor CSV</button></div>';}
function wireToolbar(draw){$('search').oninput=e=>{search=e.target.value;draw();};$('export').onclick=()=>download(route+'.csv',C.csv(db[route]),'text/csv;charset=utf-8');}
function giftsPage(){
  const rows=db.gifts,t=rows.reduce((s,r)=>s+r.amount,0),done=rows.filter(x=>['Lunas','Hadiah / tanpa biaya'].includes(x.paymentStatus)).length;
  $('view').innerHTML=pageHead('Seserahan & Mahar','Pisahkan kelompok barang, progres persiapan, dan status pembayarannya.','<button class="button" id="add-record">'+icon('plus')+'Tambah barang</button>')+'<div class="metrics">'+metric('Barang',numberFormat(rows.length),'Dalam '+new Set(rows.map(r=>r.itemGroup||'Lainnya')).size+' kelompok','gifts')+metric('Estimasi barang',money(t),'Tidak dihitung otomatis sebagai pengeluaran','budget')+metric('Pembayaran selesai',numberFormat(done)+' / '+numberFormat(rows.length),'Lunas atau hadiah tanpa biaya','check')+'</div><div class="segmented" id="gift-tabs">'+['Semua','Seserahan','Mahar'].map(x=>'<button data-type="'+x+'" class="'+(giftsType===x?'selected':'')+'">'+x+'</button>').join('')+'</div>'+basicToolbar()+'<div id="gift-groups"></div>';
  $('add-record').onclick=()=>edit('gifts');$('gift-tabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{giftsType=b.dataset.type;giftsPage();});wireToolbar(drawGifts);drawGifts();
}
function drawGifts(){
  const rows=db.gifts.filter(x=>(giftsType==='Semua'||x.type===giftsType)&&(!search||[x.name,x.itemGroup,x.owner].join(' ').toLowerCase().includes(search.toLowerCase())));
  const groups=[...new Set(rows.map(x=>x.itemGroup||'Lainnya'))];
  $('gift-groups').innerHTML=groups.map(g=>{const items=rows.filter(x=>(x.itemGroup||'Lainnya')===g);return '<div class="group-header"><h2>'+esc(g)+'</h2><p>'+numberFormat(items.length)+' barang · '+money(items.reduce((s,x)=>s+x.amount,0))+'</p></div><div class="item-grid">'+items.map(x=>'<article class="card gift-card"><div class="gift-title"><div><h3>'+esc(x.name)+'</h3>'+badge(x.type)+'</div><span class="attachment-counter">'+(x.files||[]).length+' lampiran</span></div><div class="gift-price">'+money(x.amount)+'</div><p class="gift-meta">'+numberFormat(x.quantity)+' item · '+esc(x.owner||'Belum ada PIC')+'</p><div class="gift-controls"><div><label for="pay-'+x.id+'">Pembayaran</label><select id="pay-'+x.id+'" data-gift="'+esc(x.id)+'" data-field="paymentStatus" '+(!C.can(principal,'gifts',true)?'disabled':'')+'>'+PAYMENT_STATES.map(s=>'<option '+((x.paymentStatus||'Belum dibayar')===s?'selected':'')+'>'+s+'</option>').join('')+'</select></div><div><label for="prep-'+x.id+'">Persiapan</label><select id="prep-'+x.id+'" data-gift="'+esc(x.id)+'" data-field="status" '+(!C.can(principal,'gifts',true)?'disabled':'')+'>'+C.statuses.gifts.map(s=>'<option '+(x.status===s?'selected':'')+'>'+s+'</option>').join('')+'</select></div></div><div class="card-buttons"><button class="button secondary" data-edit-gift="'+esc(x.id)+'">Detail & lampiran</button>'+(x.shopUrl?'<a class="button subtle" href="'+esc(x.shopUrl)+'" target="_blank" rel="noopener noreferrer">Buka link belanja</a>':'')+'</div></article>').join('')+'</div>';}).join('')||'<div class="card empty"><h3>Belum ada barang</h3><p>Tambahkan kelompok dan barang untuk seserahan atau mahar.</p></div>';
  document.querySelectorAll('[data-edit-gift]').forEach(b=>b.onclick=()=>edit('gifts',db.gifts.find(r=>r.id===b.dataset.editGift)));
  document.querySelectorAll('[data-gift]').forEach(s=>s.onchange=async()=>{const x=db.gifts.find(r=>r.id===s.dataset.gift);s.disabled=true;try{await save({collection:'gifts',id:x.id,version:x.version,requestId:uuid(),action:'save',data:{...x,[s.dataset.field]:s.value}});}catch(e){toast(e.message);drawGifts();}});
}
function adminPage(){
  const applicable=db.admin.filter(x=>x.status!=='Tidak berlaku'),done=applicable.filter(x=>x.available).length;
  $('view').innerHTML=pageHead('Peta Persiapan','Checklist dokumen dan tahapan pendaftaran nikah.','<button class="button" id="add-record">'+icon('plus')+'Tambah</button>')+'<div class="metrics">'+metric('Kesiapan dokumen',numberFormat(done)+' / '+numberFormat(applicable.length),'Tidak berlaku dikecualikan dari hitungan','admin',applicable.length?done/applicable.length*100:0)+metric('Lampiran',db.admin.reduce((s,x)=>s+(x.files||[]).length,0),'Berkas privat di Google Drive saat aktif','download')+'</div><div class="notice">Persyaratan bersyarat dipakai hanya jika sesuai kondisi kalian. Checklist “tersedia” tidak berarti dokumen telah disetujui KUA. Konfirmasi persyaratan dan format berkas ke KUA tujuan.</div><div class="segmented" id="admin-tabs">'+['Semua','Umum','Bersyarat','Tahapan'].map(x=>'<button data-admin-type="'+x+'" class="'+(adminType===x?'selected':'')+'">'+x+'</button>').join('')+'<button id="load-kua-template">Tambah dari daftar persyaratan</button></div>'+basicToolbar()+'<div class="doc-list" id="docs"></div><div class="sources">Rujukan: <a href="'+KUA_SOURCE+'" target="_blank" rel="noopener">Kemenag Kebumen — PMA 30/2024</a> · <a href="'+KUA_PHOTO_SOURCE+'" target="_blank" rel="noopener">Kemenag Purbalingga — dokumen & pas foto</a><br>Diperiksa 9 Oktober 2026. Ukuran pas foto perlu dikonfirmasi ke KUA tujuan.</div>';
  $('add-record').onclick=()=>edit('admin');$('admin-tabs').querySelectorAll('[data-admin-type]').forEach(b=>b.onclick=()=>{adminType=b.dataset.adminType;adminPage();});$('load-kua-template').onclick=templateModal;if(!C.can(principal,'admin',true))$('load-kua-template').remove();wireToolbar(drawDocs);drawDocs();
}
function drawDocs(){const rows=db.admin.filter(x=>(typeof prepVisibleDoc!=='function'||prepVisibleDoc(x))&&(adminType==='Semua'||(x.requirementType||'Umum')===adminType)&&(!search||[x.name,x.notes,x.owner].join(' ').toLowerCase().includes(search.toLowerCase())));
  $('docs').innerHTML=rows.map(x=>'<article class="card doc-row"><button class="check '+(x.available?'done':'')+'" data-doc-check="'+esc(x.id)+'" aria-label="Tandai '+esc(x.name)+' tersedia" aria-pressed="'+!!x.available+'" '+(!C.can(principal,'admin',true)?'disabled':'')+'>'+(x.available?icon('check'):'')+'</button><div class="doc-description"><h3>'+esc(x.name)+'</h3><p>'+esc(x.notes)+'</p><div class="doc-tags">'+badge(x.requirementType||'Umum')+badge(x.status)+'<span class="attachment-counter">'+(x.available?'✓ Sudah tersedia':'Belum tersedia')+' · '+(x.files||[]).length+' berkas</span></div><p>'+esc(x.owner||'Belum ada PIC')+(x.date?' · '+esc(prettyDate(x.date)):'')+'</p><div class="doc-attachments">'+(x.files||[]).map(f=>'<button class="doc-attachment" data-doc-file="'+esc(f.id)+'" data-doc-record="'+esc(x.id)+'" title="Lihat lampiran: '+esc(f.name)+'">'+icon('attach')+'<span>'+esc(f.name)+'</span></button>').join('')+'</div></div><div class="doc-actions"><button class="doc-edit-icon" data-doc-edit="'+esc(x.id)+'" aria-label="'+(C.can(principal,'admin',true)?'Edit ':'Lihat ')+esc(x.name)+'" title="'+(C.can(principal,'admin',true)?'Edit dokumen':'Lihat dokumen')+'">'+icon(C.can(principal,'admin',true)?'edit':'admin')+'</button></div></article>').join('')||'<div class="card empty"><h3>Belum ada persyaratan</h3><p>Tambahkan daftar persyaratan resmi melalui tombol di atas.</p></div>';
  document.querySelectorAll('[data-doc-edit]').forEach(b=>b.onclick=()=>edit('admin',db.admin.find(x=>x.id===b.dataset.docEdit)));
  document.querySelectorAll('[data-doc-file]').forEach(b=>b.onclick=()=>{const x=db.admin.find(r=>r.id===b.dataset.docRecord);if(x)openFile('admin',x,b.dataset.docFile,false);});
  document.querySelectorAll('[data-doc-check]').forEach(b=>b.onclick=async()=>{const x=db.admin.find(r=>r.id===b.dataset.docCheck);try{await save({collection:'admin',id:x.id,version:x.version,requestId:uuid(),action:'save',data:{...x,available:!x.available,status:!x.available&&x.status==='Belum disiapkan'?'Disiapkan':x.status}});}catch(e){toast(e.message);}});
}
function templateModal(){if(!C.can(principal,'admin',true))return;
  const missing=KUA_REQUIREMENTS.map((x,i)=>({x,i})).filter(({x})=>!db.admin.some(r=>r.name===x[0]));
  openModal('Pilih persyaratan yang berlaku','<p class="muted" style="font-size:14px">Dokumen yang sudah ada tidak ditambahkan lagi. Pilih persyaratan bersyarat sesuai kebutuhan.</p><div class="template-list">'+missing.map(({x,i})=>'<label><input type="checkbox" data-template="'+i+'" '+(x[1]!=='Bersyarat'?'checked':'')+'><span>'+esc(x[0])+'<small>'+esc(x[1])+' · '+esc(x[2])+'</small></span></label>').join('')+'</div><div id="template-error" role="alert"></div><button class="button" id="add-template" '+(!missing.length?'disabled':'')+'>Tambahkan yang dipilih</button>');
  $('add-template').onclick=async()=>{const selected=[...document.querySelectorAll('[data-template]:checked')].map(x=>Number(x.dataset.template));const b=$('add-template');b.disabled=true;try{for(const i of selected){const x=KUA_REQUIREMENTS[i];await save({collection:'admin',id:'kua-template-'+i,version:0,action:'save',requestId:uuid(),data:{name:x[0],requirementType:x[1],available:false,status:'Belum disiapkan',owner:'Kedua mempelai',source:i===6?KUA_PHOTO_SOURCE:KUA_SOURCE,notes:x[2]}});}$('modal').close();}catch(e){$('template-error').innerHTML='<div class="error">'+esc(e.message)+'</div>';b.disabled=false;}};
}
function userPermissions(record){let permissions;try{permissions=JSON.parse(record.permissions||'{}');}catch(e){permissions={};}return permissions;}
function usersPage(){
  $('view').innerHTML=pageHead('Manajemen Pengguna','Hanya akun utama yang dapat mengatur anggota dan akses modul.','<button class="button" id="add-record">'+icon('plus')+'Tambah pengguna</button>')+'<div class="notice">Izin dibagi menjadi Tanpa akses, Lihat, dan Ubah. Modul keuangan serta dokumen KUA tertutup secara default untuk panitia.</div><div class="item-grid"><article class="card user-card"><span class="role-chip">Akun utama</span><h3>Pemilik ruang pernikahan</h3><p>'+esc(principal.email||email)+'</p><div class="user-access"><span>Seluruh modul</span><span>Kelola pengguna</span></div><p>Akun utama ditetapkan pada konfigurasi server dan tidak dapat diganti oleh panitia.</p></article>'+db.users.map(x=>{const perms=userPermissions(x);return '<article class="card user-card"><div class="gift-title"><span class="role-chip">'+esc(x.role)+'</span>'+badge(x.status)+'</div><h3>'+esc(x.name)+'</h3><p>'+esc(x.email)+'</p><div class="user-access">'+Object.entries(perms).filter(([,v])=>v!=='none').map(([k,v])=>'<span>'+esc(C.modules[k]?.title||k)+' · '+(v==='write'?'ubah':'lihat')+'</span>').join('')+'</div><button class="button secondary" data-user="'+esc(x.id)+'">Atur akses</button></article>';}).join('')+'</div>';
  $('add-record').onclick=()=>edit('users');document.querySelectorAll('[data-user]').forEach(b=>b.onclick=()=>edit('users',db.users.find(x=>x.id===b.dataset.user)));
}
function permissionFields(record){const p=userPermissions(record);return '<div class="field full"><h3>Akses per modul</h3><div class="permission-table">'+Object.entries(C.modules).filter(([k])=>k!=='users').map(([k,v])=>'<label class="permission-row"><span>'+esc(v.title)+'</span><select name="perm-'+k+'" data-permission="'+k+'">'+[['none','Tanpa akses'],['read','Lihat'],['write','Ubah']].map(([value,label])=>'<option value="'+value+'" '+((p[k]||'none')===value?'selected':'')+'>'+label+'</option>').join('')+'</select></label>').join('')+'</div></div>';}
function enhanceGuests(){document.querySelector('#view>.metrics')?.classList.add('guest-three-metrics');}

const baseDrawRows=drawRows;
drawRows=function(){baseDrawRows();if(route==='guests'&&$('invitation-base')){const existing=$('view').querySelector('.invitation-config');existing?.remove();enhanceGuests();}};
function invitationLink(x){const base=db.profile[0]?.invitationUrl;if(!base)return '';try{const url=new URL(base);if(url.protocol!=='https:')return '';url.searchParams.set('guest',x.id);url.searchParams.set('to',x.name);url.searchParams.set('event',x.event);return url.href;}catch(e){return '';}}
function invitationModal(x){const link=invitationLink(x),message='Yth. '+x.name+'\n\nKami mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan '+(db.profile[0]?.name||'kami')+' & '+(db.profile[0]?.partner||'pasangan')+'.\nAcara: '+x.event+'\n'+(link?'Informasi dan konfirmasi kehadiran:\n'+link:'Tautan undangan akan menyusul.')+'\n\nTerima kasih.';
  let phone=String(x.contact||'').replace(/\D/g,'');if(phone.startsWith('0'))phone='62'+phone.slice(1);
  openModal('Undangan · '+x.name,'<div class="invitation-preview"><p>'+esc(message)+'</p></div><div class="field"><label>Tautan khusus tamu</label><input readonly class="link-input" value="'+esc(link)+'" placeholder="Atur URL web undangan terlebih dahulu"></div><div class="card-buttons" style="margin:16px 0"><button class="button secondary" id="copy-invite">Salin pesan</button>'+((phone.length>=8&&link)?'<a class="button" href="https://wa.me/'+phone+'?text='+encodeURIComponent(message)+'" target="_blank" rel="noopener noreferrer">Buka WhatsApp</a>':'')+'</div><p class="muted" style="font-size:13px">WhatsApp membuka draf; pesan dikirim oleh Anda. ID tamu bukan token autentikasi. Endpoint RSVP publik belum aktif.</p>'+(C.can(principal,'guests',true)?'<div class="form-actions"><button class="button subtle" id="mark-delivered">Tandai sudah dikirim</button><button class="button secondary" id="edit-guest">Edit & RSVP</button></div>':''));
  $('copy-invite').onclick=()=>copyText(message);if($('edit-guest'))$('edit-guest').onclick=()=>edit('guests',x);if($('mark-delivered'))$('mark-delivered').onclick=async()=>{try{await save({requestId:uuid(),collection:'guests',id:x.id,version:x.version,action:'save',data:{...x,deliveryStatus:'Dikirim'}});$('modal').close();}catch(e){toast(e.message);}};
}
async function copyText(text){try{await navigator.clipboard.writeText(text);toast('Pesan disalin.');}catch(e){openModal('Salin pesan','<textarea style="min-height:240px" readonly>'+esc(text)+'</textarea><p class="subtitle">Pilih teks dan salin; browser tidak mengizinkan penyalinan otomatis.</p>');}}
function enhanceBudget(){const table=$('records').querySelector('table');if(!table)return;const th=document.createElement('th');th.textContent='Invoice / nota';const head=table.querySelector('thead tr');head.insertBefore(th,head.lastElementChild);table.querySelectorAll('tbody tr').forEach((tr,i)=>{const x=visibleRows()[i];const td=document.createElement('td');td.innerHTML='<button class="edit" data-nota="'+esc(x.id)+'">'+(x.files||[]).length+' lampiran · '+(C.can(principal,'budget',true)?'Upload':'Lihat')+'</button>';tr.insertBefore(td,tr.lastElementChild);});table.querySelectorAll('[data-nota]').forEach(b=>b.onclick=()=>edit('budget',db.budget.find(x=>x.id===b.dataset.nota)));}
const drawRowsWithGuests=drawRows;
drawRows=function(){drawRowsWithGuests();if(route==='budget')enhanceBudget();};
// Use a single expansion per redraw; base listing has already drawn its rows.
listing=function(){if(route==='gifts')giftsPage();else if(route==='admin')adminPage();else if(route==='users')usersPage();else{baseListing();if(route==='guests'&&!$('invitation-base'))enhanceGuests();}};
edit=function(key,record){
  if(!C.can(principal,key,false)){toast('Anda tidak memiliki akses.');return;}
  const x=record||{},id=x.id||uuid(),writable=C.can(principal,key,true),ledgerReadonly=key==='savings'&&!!record;const requestId=uuid();
  if(!record&&!writable){toast('Akses Anda hanya untuk melihat.');return;}
  const defaults=key==='users'&&!record?{role:'Panitia',status:'Aktif',permissions:JSON.stringify(ROLE_DEFAULTS.Panitia)}:{};
  openModal((record?'Detail':'Tambah')+' · '+C.modules[key].title,'<form id="edit-form"><fieldset style="padding:0;border:0;margin:0" '+(!writable||ledgerReadonly?'disabled':'')+'><div class="form-grid">'+fields(key,{...defaults,...x})+(key==='users'?permissionFields({...defaults,...x}):'')+'</div></fieldset>'+(ledgerReadonly?'<div class="notice">Gunakan transaksi koreksi untuk memperbaiki tabungan; catatan sebelumnya dipertahankan.</div>':'')+'<div id="form-error" role="alert"></div><div class="modal-foot"><div>'+(record&&writable&&!['savings','profile'].includes(key)&&!(key==='budget'&&/^linked-(gifts|tasks|vendors)-/.test(x.id))?'<button type="button" class="button danger" id="delete-record">'+(key==='users'?'Hapus akses':'Hapus')+'</button>':'')+'</div><div class="card-buttons">'+(key==='budget'&&record&&writable?'<button type="button" id="payment" class="button secondary">Catat pembayaran</button>':'')+(writable&&!ledgerReadonly?'<button class="button" type="submit">Simpan</button>':'')+'</div></div></form>'+(key==='budget'&&record?'<div class="history"><h3>Riwayat pembayaran</h3>'+((x.payments||[]).map(p=>'<div class="line-stat"><span>'+esc(prettyDate(p.date))+' · '+esc(p.source)+'<br>'+esc(p.type==='refund'?'Refund':'Pembayaran')+'</span><strong>'+money(p.amount)+'</strong></div>').join('')||'<p class="subtitle">Belum ada pembayaran.</p>')+'</div>':'')+(record&&key!=='users'?'<section class="attachments" id="attachments"></section>':'')+(!record&&key!=='users'?'<p class="subtitle">Simpan catatan dahulu, lalu tambahkan dokumen atau nota pada Detail.</p>':''));
  const form=$('edit-form');form.dataset.recordId=id;form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;const data=Object.fromEntries(new FormData(form));if(key==='users'){const p={};form.querySelectorAll('[data-permission]').forEach(s=>p[s.dataset.permission]=s.value);data.permissions=JSON.stringify(p);for(const k of Object.keys(data))if(k.startsWith('perm-'))delete data[k];}if(key==='admin')data.available=!!form.querySelector('[name=available]').checked;
    try{await save({collection:key,id,version:x.version||0,requestId,action:'save',data:{...x,...data},...(key==='budget'&&!record&&form.querySelector('[name=paidNow]')?.checked?{initialPayment:{amount:data.amount,source:form.querySelector('[name=initialSource]').value,date:data.date||localToday()}}:{})});$('modal').close();}catch(err){$('form-error').innerHTML='<div class="error">'+esc(err.message)+'</div>';}finally{button.disabled=false;}};
  if(key==='users')$('field-role').onchange=e=>{const p=ROLE_DEFAULTS[e.target.value];form.querySelectorAll('[data-permission]').forEach(s=>s.value=p[s.dataset.permission]||'none');};
  if($('delete-record'))$('delete-record').onclick=async()=>{if(!confirm(key==='users'?'Cabut akses pengguna ini?':key==='budget'?'Hapus pengeluaran beserta riwayat pembayarannya? Total pengeluaran dan saldo tabungan akan dihitung ulang. Berkas lampiran tetap disimpan.':'Hapus catatan? Berkas di Drive tetap disimpan.'))return;try{await save({collection:key,id,version:x.version,requestId:uuid(),action:'delete'});$('modal').close();}catch(e){$('form-error').innerHTML='<div class="error">'+esc(e.message)+'</div>';}};
  if($('payment'))$('payment').onclick=()=>payment(x);
  if($('attachments'))attachmentPanel(key,x,writable);
};
function attachmentPanel(key,x,writable){
  const title=key==='budget'?'Invoice, nota & bukti pembayaran':key==='admin'?'Dokumen persyaratan':'Lampiran';
  $('attachments').innerHTML='<h3>'+title+'</h3>'+(x.files||[]).map(f=>'<div class="file-row"><div><strong>'+esc(f.name)+'</strong><small>'+(f.previewOnly?'Berkas contoh di sesi ini':'Google Drive')+'</small></div><div class="file-actions"><button class="button secondary" data-file-view="'+esc(f.id)+'">View</button>'+(writable?'<button class="button secondary" data-file-edit="'+esc(f.id)+'">Edit nama</button><button class="button secondary" data-file-replace="'+esc(f.id)+'">Ganti file</button>':'')+'</div></div>').join('')+(!(x.files||[]).length?'<p class="subtitle">Belum ada berkas. '+(key==='admin'?'Checkbox tersedia juga dapat digunakan untuk dokumen fisik.':'')+'</p>':'')+(writable?'<div class="upload-area"><label for="attachment">'+(key==='budget'?'Upload invoice / nota':'Upload dokumen')+'</label><p class="subtitle">'+(key==='budget'?'PDF, JPG, PNG':'PDF, Word, JPG, PNG')+' · maksimal 5 MB.'+(!live?' Pratinjau: berkas hanya tersedia selama sesi ini.':'')+'</p><input id="attachment" type="file" accept="'+(key==='budget'?'.pdf,.jpg,.jpeg,.png':'.pdf,.doc,.docx,.jpg,.jpeg,.png')+'"><div id="upload-error" role="alert"></div></div>':'');
  let replacement=null,uploadRequestId=uuid();
  document.querySelectorAll('[data-file-view]').forEach(b=>b.onclick=()=>openFile(key,x,b.dataset.fileView,false));
  document.querySelectorAll('[data-file-edit]').forEach(b=>b.onclick=async()=>{const f=x.files.find(f=>f.id===b.dataset.fileEdit),name=prompt('Nama dokumen yang ditampilkan',f.name);if(!name)return;try{await save({collection:key,id:x.id,version:x.version,action:'fileEdit',fileId:f.id,fileName:name,requestId:uuid()});edit(key,db[key].find(r=>r.id===x.id));}catch(e){toast(e.message);}});
  document.querySelectorAll('[data-file-replace]').forEach(b=>b.onclick=()=>{replacement=b.dataset.fileReplace;uploadRequestId=uuid();$('attachment').click();});
  if($('attachment'))$('attachment').onchange=async e=>{
    const file=e.target.files[0];if(!file)return;if(key==='budget'&&!/\.(pdf|jpe?g|png)$/i.test(file.name)){toast('Pilih PDF, JPG atau PNG untuk invoice / nota.');return;}if(file.size>5*1024*1024){$('upload-error').innerHTML='<div class="error">Berkas maksimal 5 MB.</div>';return;}
    const types={'pdf':'application/pdf','doc':'application/msword','docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','jpg':'image/jpeg','jpeg':'image/jpeg','png':'image/png'};const mime=types[file.name.split('.').pop().toLowerCase()];if(!mime){toast('Format tidak didukung.');return;}
    const input=e.target;input.disabled=true;const form=$('edit-form');form.querySelectorAll('button').forEach(b=>b.disabled=true);busy=true;status('Mengunggah…');$('upload-error').innerHTML='<div class="file-upload-status" role="status" aria-live="polite"><span class="file-upload-spinner" aria-hidden="true"></span><span>File sedang diunggah…</span></div>';form.setAttribute('aria-busy','true');
    try{
      if(live){const base64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(new Error('Berkas tidak terbaca.'));r.readAsDataURL(file);});const result=await rpc('uploadAttachment',{collection:key,id:x.id,version:x.version,requestId:uploadRequestId,name:file.name,mime,base64,replaceFileId:replacement});db=result.data;}
      else{if((x.files||[]).length>=10&&!replacement)throw new Error('Maksimal 10 lampiran.');const id=uuid();localFiles.set(id,file);const row=db[key].find(r=>r.id===x.id);row.files=[...(row.files||[]).filter(f=>f.id!==replacement),{id,name:file.name,mime,previewOnly:true,uploaded_at:new Date().toISOString()}];row.version++;if(key==='admin')row.available=true;}
      status(live?'Tersimpan di Drive':'Lampiran contoh');render();edit(key,db[key].find(r=>r.id===x.id));toast(live?'Lampiran berhasil disimpan.':'Lampiran ditambahkan ke pratinjau.');
    }catch(err){$('upload-error').innerHTML='<div class="error">'+esc(err.message)+'\nMuat ulang untuk memeriksa hasil sebelum mengganti berkas lain.</div>';input.disabled=false;form.querySelectorAll('button').forEach(b=>b.disabled=false);status('Upload belum terkonfirmasi');}finally{busy=false;input.value='';form.removeAttribute('aria-busy');}
  };
}
let attachmentViewSequence=0,attachmentPdfLoader=null;
function loadAttachmentPdf(){
 if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
 if(!attachmentPdfLoader)attachmentPdfLoader=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';script.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';resolve(window.pdfjsLib);};script.onerror=()=>{attachmentPdfLoader=null;reject(new Error('Pembaca PDF belum dapat dimuat.'));};document.head.append(script);});
 return attachmentPdfLoader;
}
async function openFile(key,x,fileId){
 const f=(x.files||[]).find(f=>f.id===fileId);
 if(!f){toast('Lampiran tidak tersedia.');return;}
 const returnToEdit=!!$('edit-form'),sequence=++attachmentViewSequence;let objectUrl=null;
 const modal=$('modal');
 const cleanup=()=>{if(objectUrl){const old=objectUrl;objectUrl=null;setTimeout(()=>URL.revokeObjectURL(old),60000);}};
 const back=()=>{attachmentViewSequence++;cleanup();if(returnToEdit&&db[key]?.find(r=>r.id===x.id))edit(key,db[key].find(r=>r.id===x.id));else modal.close();};
 openModal('Lampiran · '+f.name,'<div class="attachment-preview"><div id="attachment-content" class="attachment-content" role="status">Memuat lampiran…</div><div class="attachment-footer"><a class="button secondary" id="download-doc" role="button" aria-disabled="true">Download</a><button class="button" id="back-doc">Kembali</button></div></div>');
 $('back-doc').onclick=back;modal.addEventListener('close',cleanup,{once:true});
 try{
  let blob,downloadUrl;
  if(live&&!f.previewOnly){const r=await rpc('getAttachment',{collection:key,id:x.id,fileId});const binary=atob(r.base64),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);blob=new Blob([bytes],{type:r.mime||f.mime||'application/octet-stream'});downloadUrl='data:'+blob.type+';base64,'+r.base64;}
  else{blob=localFiles.get(fileId);if(!blob)throw new Error('Berkas belum tersedia di sesi ini.');}
  if(sequence!==attachmentViewSequence||!modal.open||!$('attachment-content'))return;
  objectUrl=URL.createObjectURL(blob);
  if(!downloadUrl)downloadUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
  const isImage=/^image\/(png|jpeg|gif|webp)$/i.test(blob.type),isPdf=blob.type==='application/pdf';
  $('attachment-content').removeAttribute('role');
  $('attachment-content').innerHTML=isImage?'<img class="viewer attachment-image" alt="'+esc(f.name)+'" src="'+objectUrl+'">':isPdf?'<div id="attachment-pdf-pages" class="attachment-pdf-pages" role="status">Menampilkan PDF…</div>':'<div class="notice">Pratinjau format ini belum tersedia. Gunakan Download untuk menyimpan berkas.</div>';
  $('download-doc').setAttribute('aria-disabled','false');
  $('download-doc').href=downloadUrl;$('download-doc').download=f.name;
  if(isPdf){
   const pdfjs=await loadAttachmentPdf(),pdf=await pdfjs.getDocument({data:new Uint8Array(await blob.arrayBuffer()),isEvalSupported:false}).promise;
   if(sequence!==attachmentViewSequence||!modal.open){pdf.destroy();return;}
   const pages=$('attachment-pdf-pages');pages.textContent='';pages.removeAttribute('role');
   try{for(let n=1;n<=pdf.numPages;n++){
    if(sequence!==attachmentViewSequence||!modal.open)break;
    const page=await pdf.getPage(n),base=page.getViewport({scale:1}),width=Math.max(240,pages.clientWidth-16),scale=width/base.width,ratio=Math.min(window.devicePixelRatio||1,2),viewport=page.getViewport({scale:scale*ratio});
    const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);canvas.style.width='100%';canvas.setAttribute('aria-label','Halaman '+n+' dari '+pdf.numPages);pages.append(canvas);
    await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;page.cleanup();
   }}finally{pdf.destroy();}
  }
 }catch(e){if(sequence!==attachmentViewSequence||!modal.open||!$('attachment-content'))return;$('attachment-content').textContent='Lampiran belum dapat dimuat. '+e.message;}
}

/* Presentation helpers preserve all existing handlers and data. */
function polishTables(){
  document.querySelectorAll('.table').forEach(table=>{
    const headers=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());
    table.querySelectorAll('tbody tr').forEach(row=>[...row.children].forEach((cell,i)=>cell.setAttribute('data-label',headers[i]||'Tindakan')));
  });
}
const renderBeforePolish=render;
render=function(){renderBeforePolish();polishTables();};
const drawRowsBeforePolish=drawRows;
drawRows=function(){drawRowsBeforePolish();polishTables();};
// Navigation starts at the top of each page, including long KUA lists.
const goBeforePolish=go;
go=function(key){goBeforePolish(key);window.scrollTo({top:0,behavior:'instant'});};

/* Compact accounting presentation. Dates, times, phone numbers and links stay intact. */
function accountingInputs(){
  document.querySelectorAll('input[type="number"]').forEach(input=>{
    input.dataset.accountingInput='true';
    input.dataset.minimum=input.min;input.dataset.maximum=input.max;
    input.type='text';input.inputMode='numeric';
    const raw=()=>input.value.replace(/\./g,'').trim();
    const validate=()=>{const v=raw(),n=Number(v);input.setCustomValidity(v&&(!/^\d+$/.test(v)||!Number.isSafeInteger(n)||(input.dataset.minimum!==''&&n<Number(input.dataset.minimum))||(input.dataset.maximum!==''&&n>Number(input.dataset.maximum)))?'Masukkan angka bulat sesuai batas yang diizinkan.':'');};
    input.addEventListener('input',()=>{
      const cursor=input.selectionStart??input.value.length;
      const digitsBefore=input.value.slice(0,cursor).replace(/\D/g,'').length;
      validate();
      if(input.value&&input.validity.valid){
        input.value=numberFormat(Number(raw()));
        let position=0,digits=0;
        while(position<input.value.length&&digits<digitsBefore){if(/\d/.test(input.value[position]))digits++;position++;}
        input.setSelectionRange(position,position);
      }
    });
    input.addEventListener('blur',()=>{validate();if(input.value&&input.validity.valid)input.value=numberFormat(Number(raw()));});
    if(input.value)input.value=numberFormat(Number(input.value));
    validate();
  });
  document.querySelectorAll('.table td').forEach(cell=>{if(cell.querySelector('.accounting'))cell.classList.add('numeric-cell');});
}
document.addEventListener('submit',event=>{
  const inputs=[...event.target.querySelectorAll('[data-accounting-input]')];
  inputs.forEach(input=>input.value=input.value.replace(/\./g,''));
  // Restore presentation only after all submit handlers have captured raw integers.
  setTimeout(()=>inputs.forEach(input=>{if(input.isConnected&&input.value)input.value=numberFormat(Number(input.value.replace(/\./g,'')));}),0);
},true);
new MutationObserver(()=>accountingInputs()).observe(document.body,{childList:true,subtree:true});
accountingInputs();

/* Reception ledger, receipts and compact paginated lists. */
const pageSettings={};
function paginate(){
  const root=$('view');if(!root)return;
  const selectors={gifts:'.gift-card',admin:'.doc-row',users:'.user-card',dashboard:'.expense-row'};
  const items=[...root.querySelectorAll(selectors[route]||'#records tbody tr')];
  root.querySelector('.list-pagination')?.remove();
  if(!items.length)return;
  const settings=pageSettings[route]||(pageSettings[route]={size:10,page:1});
  const signature=items.map(x=>x.dataset.rowId||x.querySelector('[data-edit],[data-doc-edit],[data-edit-gift],[data-user]')?.outerHTML||x.textContent.slice(0,100)).join('|');
  if(settings.signature!==signature){settings.page=1;settings.signature=signature;}
  const size=settings.size===0?items.length:settings.size,pages=Math.max(1,Math.ceil(items.length/size));settings.page=Math.min(settings.page,pages);
  const start=(settings.page-1)*size,end=Math.min(start+size,items.length);
  items.forEach((item,i)=>item.hidden=i<start||i>=end);
  if(route==='gifts')root.querySelectorAll('.group-header').forEach(header=>header.hidden=![...header.nextElementSibling.querySelectorAll('.gift-card')].some(x=>!x.hidden));
  const bar=document.createElement('div');bar.className='list-pagination';
  bar.innerHTML='<label>Tampilkan <select aria-label="Jumlah baris">'+[[10,'10'],[25,'25'],[50,'50'],[100,'100'],[0,'Semua']].map(([value,label])=>'<option value="'+value+'" '+(value===settings.size?'selected':'')+'>'+label+'</option>').join('')+'</select> baris</label><span>'+numberFormat(start+1)+'–'+numberFormat(end)+' dari '+numberFormat(items.length)+'</span><div><button class="button secondary" data-page-prev '+(settings.page===1?'disabled':'')+' aria-label="Halaman sebelumnya">‹</button><span>'+settings.page+' / '+pages+'</span><button class="button secondary" data-page-next '+(settings.page===pages?'disabled':'')+' aria-label="Halaman berikutnya">›</button></div>';
  const host=route==='dashboard'?root.querySelector('#expense-list'):route==='gifts'?$('gift-groups'):route==='admin'?$('docs'):route==='users'?root.querySelector('.item-grid'):$('records');host.after(bar);
  bar.querySelector('select').onchange=e=>{settings.size=Number(e.target.value);settings.page=1;paginate();};
  bar.querySelector('[data-page-prev]').onclick=()=>{settings.page--;paginate();};bar.querySelector('[data-page-next]').onclick=()=>{settings.page++;paginate();};
}
function guestLedgerSummary(){
  if(route!=='guests'||!$('records'))return;
  const rows=visibleRows();
  $('records').querySelectorAll('tbody tr').forEach((tr,i)=>{
    const guest=rows[i],people=C.attendance(guest),cash=people.reduce((s,p)=>s+p.cash,0),goods=people.filter(p=>p.goods).length;
    if(!guest||tr.querySelector('[data-reception]'))return;
    tr.children[3].insertAdjacentHTML('beforeend','<small>'+numberFormat(people.length)+' hadir tercatat</small>'+(cash?'<small>'+money(cash)+'</small>':'')+(goods?'<small>'+numberFormat(goods)+' pemberi barang</small>':''));
    tr.lastElementChild.insertAdjacentHTML('beforeend','<button class="edit" data-reception="'+esc(guest.id)+'">Kehadiran & pemberian</button>');
  });
  $('records').querySelectorAll('[data-reception]').forEach(b=>b.onclick=()=>receptionModal(db.guests.find(x=>x.id===b.dataset.reception)));
  if(!$('guest-receipt-summary')){
    const t=C.totals(db),section=document.createElement('div');section.id='guest-receipt-summary';section.className='metrics reception-metrics';section.innerHTML=metric('Hadir tercatat',numberFormat(t.checkedIn),'Nama per orang tercatat','guests')+metric('Uang diterima',money(t.guestCash),'Seluruh pemberian uang','savings')+metric('Pemberi barang',numberFormat(t.guestGoods),'Rincian tersimpan per orang','gifts');$('records').before(section);
  }
}
function receptionModal(guest){
  const writable=C.can(principal,'guests',true);let people=C.attendance(guest).map(p=>({...p}));
  if(!people.length&&writable)people.push({id:uuid(),name:guest.name,kind:'',cash:0,goods:''});
  function collect(){
    people=[...$('reception-form').querySelectorAll('.attendee-row')].map(row=>({id:row.dataset.personId,name:row.querySelector('[data-person-name]').value.trim(),kind:row.querySelector('[data-person-kind]').value,cash:Number(row.querySelector('[data-person-cash]').value.replace(/\./g,'')||0),goods:row.querySelector('[data-person-goods]').value.trim()}));
  }
  function paint(){
    openModal('Kehadiran & pemberian · '+guest.name,'<p class="subtitle">Kuota '+numberFormat(guest.quota)+' orang. Catat nama setiap orang yang benar-benar hadir dan seluruh pemberiannya. Pilih “Tidak memberi” bila tidak ada pemberian.</p>'+guestTransferPanel(guest)+'<form id="reception-form"><fieldset '+(!writable?'disabled':'')+' class="reception-fieldset"><div id="attendees">'+people.map((person,i)=>'<article class="attendee-row" data-person-id="'+esc(person.id)+'"><div class="attendee-heading"><strong>Tamu '+(i+1)+'</strong>'+(writable?'<button type="button" class="text-button" data-remove-person="'+i+'">Hapus</button>':'')+'</div><div class="form-grid"><div class="field"><label>Nama tamu *</label><input aria-label="Nama tamu '+(i+1)+'" data-person-name value="'+esc(person.name)+'" maxlength="250" required></div><div class="field"><label>Pemberian *</label><select aria-label="Pemberian tamu '+(i+1)+'" data-person-kind required>'+['','Uang','Barang','Uang & barang','Tidak memberi','Belum dicatat'].map(kind=>'<option value="'+kind+'" '+(kind===person.kind?'selected':'')+'>'+(kind||'Pilih pemberian')+'</option>').join('')+'</select></div><div class="field cash-field"><label>Nominal uang (Rp) *</label><input aria-label="Nominal uang tamu '+(i+1)+'" data-person-cash type="number" min="1" max="1000000000000" step="1" value="'+(person.cash||'')+'"></div><div class="field goods-field"><label>Semua barang & jumlahnya *</label><textarea aria-label="Barang dan jumlah tamu '+(i+1)+'" data-person-goods maxlength="3000" placeholder="Contoh: 1 rice cooker; 2 set gelas">'+esc(person.goods)+'</textarea></div></div></article>').join('')+'</div>'+(writable?'<button type="button" class="button secondary" id="add-attendee">'+icon('plus')+'Tambah tamu hadir</button>':'')+'</fieldset><div id="reception-error" role="alert"></div>'+(writable?'<div class="form-actions"><button type="submit" class="button">Simpan kehadiran & pemberian</button></div>':'')+'</form>');
    $('reception-form').querySelectorAll('.attendee-row').forEach(row=>{
      const select=row.querySelector('[data-person-kind]');function toggle(){const cash=['Uang','Uang & barang'].includes(select.value),goods=['Barang','Uang & barang'].includes(select.value);row.querySelector('.cash-field').hidden=!cash;row.querySelector('.goods-field').hidden=!goods;const ci=row.querySelector('[data-person-cash]'),gi=row.querySelector('[data-person-goods]');ci.required=cash;gi.required=goods;if(!cash){ci.value='';ci.setCustomValidity('');}if(!goods)gi.value='';}select.onchange=toggle;toggle();
    });
    $('reception-form').querySelectorAll('[data-remove-person]').forEach(b=>b.onclick=()=>{collect();if(!confirm('Hapus catatan tamu dan pemberiannya?'))return;people.splice(Number(b.dataset.removePerson),1);paint();});
    if($('add-attendee'))$('add-attendee').onclick=()=>{collect();if(people.length>=guest.quota){toast('Kuota tercapai. Ubah kuota pada detail undangan terlebih dahulu.');return;}people.push({id:uuid(),name:'',kind:'',cash:0,goods:''});paint();};
    $('reception-form').onsubmit=async e=>{e.preventDefault();collect();const button=e.currentTarget.querySelector('[type=submit]');button.disabled=true;try{await save({collection:'guests',id:guest.id,version:guest.version,requestId:uuid(),action:'save',data:{...guest,attending:people.length,status:people.length?'Hadir':'Belum dikirim',quota:Math.max(guest.quota||1,people.length),attendanceLedger:JSON.stringify(people)}});$('modal').close();}catch(error){$('reception-error').innerHTML='<div class="error">'+esc(error.message)+'</div>';button.disabled=false;}};
    accountingInputs();
  }paint();
}
function dashboardReception(){
  if(route!=='dashboard'||!principal.owner||!ready)return;
  const t=C.totals(db),section=document.createElement('section');section.className='card reception-dashboard';
  section.innerHTML='<div class="card-head"><div><h2>Keuangan & penerimaan acara</h2><p class="subtitle">Pengeluaran dari pembayaran tercatat · penerimaan dari tamu hadir</p></div><button class="text-button" id="open-reception">Buku tamu</button></div><div class="card-body"><div class="metrics">'+metric('Pengeluaran aktual',money(t.paid),'Invoice melengkapi bukti transaksi','budget')+metric('Uang diterima',money(t.guestCash),numberFormat(t.checkedIn)+' orang tercatat hadir','savings')+metric('Pemberi barang',numberFormat(t.guestGoods),'Nama & rincian di daftar undangan','gifts')+metric('Selisih kas acara',money(t.netEventCash),'Pemberian uang − pengeluaran','budget')+'</div><div class="line-stat"><span>Invoice / nota terlampir</span><strong>'+numberFormat(db.budget.reduce((s,x)=>s+(x.files||[]).length,0))+' berkas</strong></div></div><div id="expense-list">'+db.budget.map(x=>'<div class="expense-row" data-row-id="'+esc(x.id)+'"><div><strong>'+esc(x.name)+'</strong><small>'+esc(prettyDate(x.date))+' · '+(x.files||[]).length+' lampiran</small></div><div>'+money(C.netPaid(x))+'</div><button class="text-button" data-expense-detail="'+esc(x.id)+'">Detail</button></div>').join('')+(!db.budget.length?'<p class="subtitle empty">Belum ada pengeluaran.</p>':'')+'</div>';
  $('view').querySelector('.quick-actions').before(section);$('open-reception').onclick=()=>go('guests');section.querySelectorAll('[data-expense-detail]').forEach(b=>b.onclick=()=>edit('budget',db.budget.find(x=>x.id===b.dataset.expenseDetail)));
}
const editBeforeExperience=edit;
edit=function(key,record){
  editBeforeExperience(key,record);const form=$('edit-form');if(!form)return;
  if(key==='guests'&&record){const button=document.createElement('button');button.type='button';button.className='button secondary';button.textContent='Catat kehadiran & pemberian';button.onclick=()=>receptionModal(record);form.querySelector('.modal-foot').before(button);}
  if(key==='admin'&&!record&&C.can(principal,key,true)){
    const box=document.createElement('section');box.className='new-budget-proof';box.innerHTML='<div class="field"><label for="new-admin-file">Upload dokumen KUA (opsional)</label><input id="new-admin-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"><small>PDF, Word, JPG atau PNG · maksimal 5 MB. Berkas diunggah setelah persyaratan tersimpan.</small></div>';form.querySelector('.modal-foot').before(box);
    const submit=form.onsubmit;form.onsubmit=async event=>{const file=$('new-admin-file').files[0];if(file&&(file.size>5*1024*1024||! /\.(pdf|docx?|jpe?g|png)$/i.test(file.name))){event.preventDefault();$('form-error').innerHTML='<div class="error">Pilih PDF, Word, JPG atau PNG maksimal 5 MB.</div>';return;}await submit(event);if($('modal').open)return;const saved=db.admin.find(x=>x.id===form.dataset.recordId);if(!saved)return;edit('admin',saved);if(file){const input=$('attachment'),transfer=new DataTransfer();transfer.items.add(file);input.files=transfer.files;await input.onchange({target:input});}};
  }
  if(key!=='budget'||record||!C.can(principal,key,true))return;
  const box=document.createElement('section');box.className='new-budget-proof';box.innerHTML='<label class="paid-now"><input type="checkbox" name="paidNow" checked> Sudah dibayar lunas — catat sebagai pengeluaran</label><div class="field"><label>Sumber pembayaran</label><select name="initialSource"><option>Dana lain</option><option>Tabungan</option></select></div><div class="field"><label for="new-budget-file">Invoice / nota (opsional)</label><input id="new-budget-file" type="file" accept=".pdf,.jpg,.jpeg,.png"><small>PDF, JPG atau PNG · maksimal 5 MB. Berkas diunggah setelah item biaya tersimpan.</small></div>';
  form.querySelector('.modal-foot').before(box);
  form.querySelector('[name=initialSource]').disabled=!form.querySelector('[name=paidNow]').checked;form.querySelector('[name=paidNow]').onchange=e=>form.querySelector('[name=initialSource]').disabled=!e.target.checked;
  const submit=form.onsubmit;
  form.onsubmit=async event=>{
    const file=$('new-budget-file').files[0];
    if(file&&(file.size>5*1024*1024||! /\.(pdf|jpe?g|png)$/i.test(file.name))){event.preventDefault();$('form-error').innerHTML='<div class="error">Pilih PDF, JPG atau PNG maksimal 5 MB.</div>';return;}
    await submit(event);
    if($('modal').open)return;
    const saved=db.budget.find(x=>x.id===form.dataset.recordId);if(!saved)return;
    edit('budget',saved);
    if(file){const input=$('attachment');const transfer=new DataTransfer();transfer.items.add(file);input.files=transfer.files;await input.onchange({target:input});}
  };
};
function visibleUploadActions(){
  if(route!=='budget'||!C.can(principal,route,true))return;
  const root=$('view');root.querySelectorAll(route==='budget'?'[data-edit]':'[data-doc-edit]').forEach(detail=>{
    const id=route==='budget'?detail.dataset.edit:detail.dataset.docEdit,record=db[route].find(x=>x.id===id);if(!record||detail.parentElement.querySelector('[data-upload-record]'))return;
    const button=document.createElement('button');button.type='button';button.className='button secondary';button.dataset.uploadRecord=id;button.textContent=route==='budget'?'Upload invoice / nota':'Upload dokumen';button.onclick=()=>{edit(route,record);$('attachments')?.scrollIntoView({block:'nearest',behavior:'smooth'});$('attachment')?.focus();};detail.after(button);
  });
}
const renderBeforeExperience=render;render=function(){renderBeforeExperience();if(ready){guestLedgerSummary();dashboardReception();visibleUploadActions();paginate();polishTables();accountingInputs();}};
const drawRowsBeforeExperience=drawRows;drawRows=function(){drawRowsBeforeExperience();guestLedgerSummary();visibleUploadActions();paginate();polishTables();accountingInputs();};
const drawGiftsBeforeExperience=drawGifts;drawGifts=function(){drawGiftsBeforeExperience();paginate();};
const drawDocsBeforeExperience=drawDocs;drawDocs=function(){drawDocsBeforeExperience();visibleUploadActions();paginate();};

/* Illustrative reception entries belong to the session-only demo. */
const demoBeforeExperience=demo;
demo=function(){const data=demoBeforeExperience();const family=data.guests[0];if(family)family.attendanceLedger=JSON.stringify([{id:'demo-person-one',name:'Siti (contoh)',kind:'Uang',cash:250000,goods:''},{id:'demo-person-two',name:'Budi (contoh)',kind:'Barang',cash:0,goods:'1 set gelas'},{id:'demo-person-three',name:'Rina (contoh)',kind:'Uang & barang',cash:150000,goods:'1 selimut'},{id:'demo-person-four',name:'Dimas (contoh)',kind:'Tidak memberi',cash:0,goods:''}]);return data;};

/* Three desktop sidebar modes and compact record actions. */
let sidebarMode=0;
function compactNavigation(){
  let toggle=document.getElementById('sidebar-mode');
  if(!toggle){toggle=document.createElement('button');toggle.id='sidebar-mode';toggle.className='sidebar-mode';toggle.innerHTML=icon('menu');document.querySelector('.brand').append(toggle);toggle.onclick=()=>{sidebarMode=(sidebarMode+1)%3;compactNavigation();};}
  document.body.dataset.sidebarMode=String(sidebarMode);toggle.title=['Sidebar: ikon dan nama. Klik untuk ikon saja.','Sidebar: ikon saja. Klik untuk sembunyikan.','Sidebar tersembunyi. Klik untuk tampilkan.'][sidebarMode];toggle.setAttribute('aria-label',toggle.title);
  document.querySelectorAll('#nav button').forEach(b=>{const label=b.querySelector('span')?.textContent||b.textContent;b.title=label;b.setAttribute('aria-label',label);});
  document.querySelectorAll('#view [data-edit],#view [data-edit-gift],#view [data-edit-user]').forEach(b=>{const label=b.getAttribute('aria-label')||b.title||b.textContent.trim()||'Edit catatan';b.title=label;b.setAttribute('aria-label',label);b.innerHTML=icon('edit');b.classList.add('compact-edit');});
}
const renderBeforeCompact=render;render=function(){renderBeforeCompact();compactNavigation();};
const rowsBeforeCompact=drawRows;drawRows=function(){rowsBeforeCompact();compactNavigation();};
const giftsBeforeCompact=drawGifts;drawGifts=function(){giftsBeforeCompact();compactNavigation();};
compactNavigation();

function singleHeader(){const top=document.querySelector('.topbar'),head=document.querySelector('#view .page-head');if(!top||!head)return;top.querySelector('.page-head')?.remove();top.prepend(head);}
const renderBeforeSingleHeader=render;render=function(){document.querySelector('.topbar>.page-head')?.remove();renderBeforeSingleHeader();singleHeader();};
// Tabs and filters may redraw a feature directly rather than through render().
new MutationObserver(()=>singleHeader()).observe($('view'),{childList:true,subtree:true});

const editBeforeSimpleGuest=edit;edit=function(key,record){editBeforeSimpleGuest(key,record);if(key!=='guests'||record||!C.can(principal,key,true))return;const form=$('edit-form');if(!form)return;form.querySelector('.form-grid').innerHTML='<div class="field"><label for="field-name">Nama *</label><input id="field-name" name="name" required maxlength="200" autocomplete="name"></div><div class="field"><label for="field-group">Kelompok *</label><input id="field-group" name="group" required maxlength="200" placeholder="Keluarga, teman, rekan kerja…"></div><div class="field full"><label for="field-address">Alamat *</label><textarea id="field-address" name="address" required maxlength="2000" rows="2" autocomplete="street-address"></textarea></div><div class="field full"><label for="field-notes">Catatan <span class="muted">(opsional)</span></label><textarea id="field-notes" name="notes" maxlength="2000" rows="2"></textarea></div><input type="hidden" name="event" value="Resepsi"><input type="hidden" name="quota" value="1"><input type="hidden" name="attending" value="0"><input type="hidden" name="status" value="Belum dikirim"><input type="hidden" name="deliveryStatus" value="Belum dikirim">';document.querySelector('#modal-body>p.subtitle')?.remove();const submit=form.onsubmit;form.onsubmit=async e=>{for(const name of ['name','group','address']){const input=form.elements.namedItem(name);input.value=input.value.trim();}if(!form.reportValidity()){e.preventDefault();return;}await submit(e);};};

const usersPageBeforeHistory=usersPage;usersPage=function(){usersPageBeforeHistory();if(!principal.owner)return;const ownerCard=document.querySelector('#view .user-card'),ownerButton=document.createElement('button');ownerButton.className='button secondary compact-edit';ownerButton.innerHTML=icon('edit');ownerButton.title='Edit nama akun utama';ownerButton.setAttribute('aria-label',ownerButton.title);ownerButton.onclick=async()=>{try{const result=await rpc('getUserHistory');openModal('Edit akun utama','<form id="owner-name-form"><div class="field"><label for="owner-name">Nama akun utama</label><input id="owner-name" name="name" required maxlength="100" value="'+esc(result.ownerProfile.name)+'"></div><p class="subtitle">Email login: '+esc(principal.email)+'</p><div class="form-error" id="owner-error"></div><div class="form-actions"><button class="button">Simpan</button></div></form>');$('owner-name-form').onsubmit=async e=>{e.preventDefault();const button=e.currentTarget.querySelector('button');button.disabled=true;try{await rpc('saveOwnerProfile',{name:$('owner-name').value,requestId:uuid()});$('modal').close();render();}catch(error){$('owner-error').textContent=error.message;}finally{button.disabled=false;}};}catch(error){toast(error.message);}};ownerCard.append(ownerButton);rpc('getUserHistory').then(r=>{if(ownerCard.isConnected)ownerCard.querySelector('h3').textContent=r.ownerProfile.name;}).catch(()=>{});const historyButton=document.createElement('button');historyButton.className='button secondary';historyButton.textContent='Riwayat login & aktivitas';historyButton.onclick=()=>userHistoryModal();document.querySelector('#view .notice').after(historyButton);document.querySelectorAll('[data-user]').forEach(b=>{b.title='Edit pengguna & akses';b.setAttribute('aria-label',b.title);b.innerHTML=icon('edit');b.classList.add('compact-edit');});};
async function userHistoryModal(filter='Semua',page=0){try{const result=await rpc('getUserHistory'),all=result.history.filter(x=>filter==='Semua'||x.type===filter).reverse(),rows=all.slice(page*10,page*10+10);openModal('Riwayat pengguna','<p class="subtitle">Riwayat mulai dicatat setelah fitur ini aktif. Catatan riwayat bisa diedit; penghapusan menyembunyikan entri dari daftar. Jejak audit penyimpanan tetap tersimpan.</p><div class="segmented">'+['Semua','Login','Aktivitas'].map(x=>'<button type="button" data-history-filter="'+x+'" class="'+(filter===x?'selected':'')+'">'+x+'</button>').join('')+'</div><div class="history-records">'+rows.map(x=>'<article class="history-user-row"><div><strong>'+esc(x.action)+'</strong><small>'+esc(x.email)+' · '+esc(new Date(x.timestamp).toLocaleString('id-ID'))+'</small>'+(x.notes?'<p>'+esc(x.notes)+'</p>':'')+'</div><button class="doc-edit-icon" data-history-edit="'+esc(x.id)+'" aria-label="Edit catatan riwayat">'+icon('edit')+'</button><button class="doc-edit-icon" data-history-delete="'+esc(x.id)+'" aria-label="Hapus riwayat dari daftar">×</button></article>').join('')+(rows.length?'':'<p class="subtitle">Belum ada riwayat.</p>')+'</div><div class="form-actions"><button class="button secondary" id="history-prev" '+(page===0?'disabled':'')+'>Sebelumnya</button><span>'+numberFormat(all.length)+' entri</span><button class="button secondary" id="history-next" '+((page+1)*10>=all.length?'disabled':'')+'>Berikutnya</button></div>');document.querySelectorAll('[data-history-filter]').forEach(b=>b.onclick=()=>userHistoryModal(b.dataset.historyFilter));$('history-prev').onclick=()=>userHistoryModal(filter,page-1);$('history-next').onclick=()=>userHistoryModal(filter,page+1);document.querySelectorAll('[data-history-edit]').forEach(b=>b.onclick=()=>{const item=rows.find(x=>x.id===b.dataset.historyEdit);openModal('Edit catatan riwayat','<form id="history-edit-form"><p>'+esc(item.action)+'</p><div class="field"><label for="history-notes">Catatan</label><textarea id="history-notes" maxlength="1000">'+esc(item.notes)+'</textarea></div><div id="history-error"></div><div class="form-actions"><button class="button">Simpan</button></div></form>');$('history-edit-form').onsubmit=async e=>{e.preventDefault();const button=e.currentTarget.querySelector('button');button.disabled=true;try{await rpc('changeUserHistory',{id:item.id,version:item.version,action:'edit',notes:$('history-notes').value,requestId:uuid()});await userHistoryModal(filter,page);}catch(error){$('history-error').textContent=error.message;button.disabled=false;}};});document.querySelectorAll('[data-history-delete]').forEach(b=>b.onclick=async()=>{const item=rows.find(x=>x.id===b.dataset.historyDelete);b.disabled=true;try{await rpc('changeUserHistory',{id:item.id,version:item.version,action:'delete',requestId:uuid()});await userHistoryModal(filter,0);}catch(error){toast(error.message);b.disabled=false;}});}catch(error){toast(error.message);}}

/* Public configuration contains only a project URL and publishable key. */
const gatewayConfig=window.WEDDING_CONFIG||{mode:'preview'};
const usingSupabaseGateway=['supabase-gateway','cloudflare-d1'].includes(gatewayConfig.mode)&&!live;
let gatewaySession=null,gatewayRefresh=null;
const gatewaySessionKey='siapnikah-session:'+gatewayConfig.supabaseUrl;
function validateGatewayConfig(){
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(gatewayConfig.supabaseUrl||''))throw new Error('URL project Supabase belum diisi dengan benar.');
  const key=gatewayConfig.supabasePublishableKey||'';
  if(!key||key.startsWith('sb_secret_'))throw new Error('Gunakan publishable / anon key untuk aplikasi.');
  if(!key.startsWith('sb_publishable_')){try{const claims=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(claims.role!=='anon')throw new Error();}catch{throw new Error('Key aplikasi harus publishable atau anon, bukan service_role.');}}
  if(!/^[a-z][a-z0-9-]*$/.test(gatewayConfig.functionName||''))throw new Error('Nama penghubung belum diisi.');
  if(gatewayConfig.mode==='cloudflare-d1'&&!/^https:\/\/[a-z0-9.-]+\.workers\.dev\/?$/.test(gatewayConfig.workerUrl||''))throw new Error('Alamat penghubung Cloudflare belum diisi.');
}
function storeGatewaySession(session){gatewaySession=session;try{if(session)sessionStorage.setItem(gatewaySessionKey,JSON.stringify(session));else sessionStorage.removeItem(gatewaySessionKey);}catch{}}
async function gatewayAuth(path,body,token){
  const response=await fetch(gatewayConfig.supabaseUrl+'/auth/v1/'+path,{method:body?'POST':'GET',headers:{apikey:gatewayConfig.supabasePublishableKey,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
  let data;try{data=await response.json();}catch{throw new Error('Layanan login belum tersedia.');}
  if(!response.ok)throw new Error(data.msg||data.error_description||data.message||'Login gagal. Periksa akun dan password.');
  return data;
}
async function gatewayAccessToken(){
  if(!gatewaySession?.access_token)throw new Error('Silakan masuk terlebih dahulu.');
  if(gatewaySession.expires_at>Date.now()/1000+60)return gatewaySession.access_token;
  if(!gatewayRefresh)gatewayRefresh=gatewayAuth('token?grant_type=refresh_token',{refresh_token:gatewaySession.refresh_token}).then(data=>{storeGatewaySession({...data,expires_at:Math.floor(Date.now()/1000)+data.expires_in});return data.access_token;}).catch(error=>{storeGatewaySession(null);throw error;}).finally(()=>gatewayRefresh=null);
  return gatewayRefresh;
}
function gatewayLoginView(message){
  ready=false;db=C.blank();principal={owner:false,email:'',role:'Belum masuk',permissions:{}};email='';status('Belum masuk');
  $('nav').innerHTML='';$('bottom-nav')?.remove();$('mode-banner').innerHTML='';$('crumb').textContent='Masuk';$('avatar').textContent='SN';
  $('view').innerHTML='<div class="login-shell"><div class="login-story"><div class="login-initials" aria-label="H dan E">H<span>&amp;</span>E</div><div class="story-line"></div><h2>Ardi &amp; Nadia</h2><p>MENUJU HARI BAHAGIA</p></div><section class="card login-card"><div class="login-mark">'+icon('heart')+'</div><h1>Ruang kita.</h1><p class="subtitle">Masuk untuk melanjutkan persiapan hari bahagia.</p>'+(message?'<div class="error">'+esc(message)+'</div>':'')+'<form id="gateway-login"><div class="field"><label for="login-email">Username / email</label><input id="login-email" name="email" type="text" autocomplete="username" required></div><div class="field"><label for="login-password">Password</label><input id="login-password" name="password" type="password" autocomplete="current-password" required></div><div id="login-error" role="alert"></div><button type="submit" class="button">Masuk ke ruang pernikahan</button></form><p class="login-footnote">Gunakan akun yang telah diaktifkan oleh pemilik aplikasi.</p></section></div>';
  $('gateway-login').onsubmit=async event=>{event.preventDefault();const form=event.currentTarget,button=form.querySelector('button');button.disabled=true;form.setAttribute('aria-busy','true');button.innerHTML='<span class="login-spinner" aria-hidden="true"></span><span role="status">Memuat…</span>';try{validateGatewayConfig();const credentials=Object.fromEntries(new FormData(form));credentials.email=credentials.email.trim().toLowerCase();const data=gatewayConfig.mode==='cloudflare-d1'?await usernameLogin(credentials):await gatewayAuth('token?grant_type=password',credentials);storeGatewaySession({...data,expires_at:Math.floor(Date.now()/1000)+data.expires_in});form.reset();if(gatewayConfig.mode==='cloudflare-d1'){try{await rpc('recordLogin',{requestId:uuid()});}catch(error){toast('Login berhasil, tetapi riwayat belum tercatat: '+error.message);}}await reload();}catch(error){if($('login-error'))$('login-error').innerHTML='<div class="error">'+esc(error.message)+'</div>';}finally{if(button.isConnected){button.disabled=false;button.textContent='Masuk ke ruang pernikahan';form.setAttribute('aria-busy','false');}}};
}
function gatewayAccountButton(){
  let button=$('gateway-signout');if(!button){button=document.createElement('button');button.id='gateway-signout';button.className='text-button';$('view').closest('main').querySelector('.topright').prepend(button);}
  button.textContent=gatewaySession?'Keluar':'Masuk';button.onclick=async()=>{if(busy){toast('Tunggu penyimpanan selesai.');return;}if(gatewaySession){if(!await gatewayConfirmLogout())return;const token=gatewaySession.access_token;storeGatewaySession(null);db=C.blank();localFiles.clear();gatewayLoginView();gatewayAccountButton();try{await gatewayAuth('logout',{},token);}catch{}}else gatewayLoginView();};
}
if(usingSupabaseGateway){
  live=true;principal={owner:false,email:'',role:'Belum masuk',permissions:{}};
  try{validateGatewayConfig();const fragment=new URLSearchParams(location.hash.slice(1));if(fragment.get('access_token')&&fragment.get('refresh_token')){storeGatewaySession({access_token:fragment.get('access_token'),refresh_token:fragment.get('refresh_token'),expires_at:Math.floor(Date.now()/1000)+Number(fragment.get('expires_in')||3600)});history.replaceState(null,'',location.pathname+location.search);}else{const stored=sessionStorage.getItem(gatewaySessionKey);if(stored)gatewaySession=JSON.parse(stored);}}catch{}
  rpc=async function(method,payload){
    validateGatewayConfig();const token=await gatewayAccessToken();
    const endpoint=gatewayConfig.mode==='cloudflare-d1'?gatewayConfig.workerUrl:gatewayConfig.supabaseUrl+'/functions/v1/'+gatewayConfig.functionName;
    const response=await fetch(endpoint,{method:'POST',headers:{apikey:gatewayConfig.supabasePublishableKey,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({method,payload}),signal:AbortSignal.timeout(65000)});
    let data;try{data=await response.json();}catch{throw new Error('Penghubung belum tersedia.');}
    if(!response.ok){if(response.status===401)storeGatewaySession(null);throw new Error(data.error||'Penyimpanan belum berhasil.');}return data;
  };
  const reloadBeforeGateway=reload;reload=async function(){try{validateGatewayConfig();if(!gatewaySession){gatewayLoginView();gatewayAccountButton();return;}await reloadBeforeGateway();gatewayAccountButton();}catch(error){gatewayLoginView(error.message);gatewayAccountButton();}};
  const renderBeforeGateway=render;render=function(){if(!gatewaySession){gatewayLoginView();gatewayAccountButton();return;}renderBeforeGateway();gatewayAccountButton();};
}

async function usernameLogin(credentials){const response=await fetch(gatewayConfig.workerUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({method:"loginAccount",payload:credentials}),signal:AbortSignal.timeout(20000)});const result=await response.json();if(!response.ok)throw new Error(result.error||"Login gagal.");return result;}

function gatewayConfirmLogout(){return new Promise(resolve=>{openModal('Keluar dari aplikasi?','<p class="subtitle">Anda bisa masuk kembali menggunakan akun Anda.</p><div class="form-actions"><button type="button" class="button secondary" id="logout-cancel">Batal</button><button type="button" class="button" id="logout-confirm">OK</button></div>');const dialog=$('modal'),closed=()=>resolve(false);dialog.addEventListener('close',closed,{once:true});const finish=answer=>{dialog.removeEventListener('close',closed);dialog.close();resolve(answer);};$('logout-cancel').onclick=()=>finish(false);$('logout-confirm').onclick=()=>finish(true);$('logout-cancel').focus();});}

(function(){
  let theme='light';try{theme=localStorage.getItem('siap-nikah-theme')||'light';}catch{}
  document.documentElement.dataset.theme=theme;
  const button=document.createElement('button');button.type='button';button.className='concept-theme';
  function update(){const dark=document.documentElement.dataset.theme==='dark';button.innerHTML=dark?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.6 14.3A9 9 0 0 1 9.7 3.4a9 9 0 1 0 10.9 10.9Z"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';button.title=dark?'Gunakan tema terang':'Gunakan tema gelap';button.setAttribute('aria-label',button.title);button.setAttribute('aria-pressed',String(dark));}
  button.onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('siap-nikah-theme',document.documentElement.dataset.theme);}catch{}update();};
  document.querySelector('.topright').prepend(button);update();
})();

// Management workspace follows the reference's accounts / permissions / history tabs.
const usersPageBeforeConcept=usersPage;
usersPage=function(){
  usersPageBeforeConcept();if(!principal.owner)return;
  const view=$('view'),cards=[...view.querySelectorAll('.user-card')],notice=view.querySelector('.notice'),history=[...view.querySelectorAll('button')].find(b=>b.textContent==='Riwayat login & aktivitas');
  notice.remove();history.remove();const grid=view.querySelector('.item-grid');grid.remove();
  const tabs=document.createElement('div');tabs.className='card user-workspace-head';tabs.innerHTML='<div class="segmented" role="tablist" aria-label="Bagian manajemen pengguna">'+[['accounts','Daftar akun'],['access','Hak akses'],['history','Riwayat aktivitas']].map(([k,t])=>'<button role="tab" data-user-tab="'+k+'" aria-selected="'+(k==='accounts')+'">'+t+'</button>').join('')+'</div>';view.append(tabs);
  const accountActions=cards.map(card=>card.querySelector('button'));const pane=document.createElement('section');pane.className='user-workspace-pane';view.append(pane);let ownerName=cards[0].querySelector('h3').textContent;
  function accounts(){pane.innerHTML='<div class="metrics user-stats">'+[['Total akun',db.users.length+1],['Aktif',db.users.filter(x=>x.status==='Aktif').length+1],['Panitia',db.users.filter(x=>x.role==='Panitia').length],['Nonaktif',db.users.filter(x=>x.status!=='Aktif').length]].map(([t,n])=>'<div class="metric"><div class="metric-top">'+t+'</div><strong>'+numberFormat(n)+'</strong></div>').join('')+'</div><div class="card"><div class="user-toolbar"><input id="user-search" aria-label="Cari pengguna" placeholder="Cari nama atau email…"><select id="user-status" aria-label="Status pengguna"><option>Semua status</option><option>Aktif</option><option>Nonaktif</option></select></div><div class="table-wrap"><table class="table user-account-table"><thead><tr><th>Pengguna</th><th>Peran</th><th>Status</th><th>Akses</th><th>Aksi</th></tr></thead><tbody id="user-account-rows"></tbody></table></div><p class="user-count"></p></div>';
    const tbody=$('user-account-rows');cards.forEach((card,i)=>{const x=i?db.users[i-1]:null,tr=document.createElement('tr');tr.dataset.userName=(x?x.name+' '+(x.username||x.email):ownerName+' '+principal.email).toLowerCase();tr.dataset.userStatus=x?x.status:'Aktif';tr.innerHTML='<td><strong class="user-row-name">'+esc(x?x.name:ownerName)+'</strong><small class="user-row-email">'+esc(x?(x.username?'@'+x.username:x.email):principal.email)+'</small></td><td>'+esc(x?x.role:'Akun utama')+'</td><td>'+badge(x?x.status:'Aktif')+'</td><td>'+(x?Object.values(userPermissions(x)).filter(v=>v!=='none').length+' modul':'Semua modul')+'</td><td class="user-actions"></td>';const action=accountActions[i];if(action)tr.querySelector('.user-actions').append(action);tbody.append(tr);});
    function filterUsers(){const query=$('user-search').value.toLowerCase(),status=$('user-status').value;let count=0;tbody.querySelectorAll('tr').forEach(tr=>{tr.hidden=!tr.dataset.userName.includes(query)||(status!=='Semua status'&&tr.dataset.userStatus!==status);if(!tr.hidden)count++;});pane.querySelector('.user-count').textContent=numberFormat(count)+' akun ditampilkan';}$('user-search').oninput=filterUsers;$('user-status').onchange=filterUsers;filterUsers();
  }
  function access(){pane.innerHTML='<div class="card"><div class="card-head"><div><h2>Hak akses pengguna</h2><p class="subtitle">Pengaturan berlaku per akun. Hanya akun utama yang dapat mengubah akses.</p></div></div><div class="table-wrap"><table class="table user-permission-matrix"><thead><tr><th>Modul</th><th>Akun utama</th>'+db.users.map(x=>'<th>'+esc(x.name)+'</th>').join('')+'</tr></thead><tbody>'+Object.entries(C.modules).filter(([k])=>k!=='users').map(([k,v])=>'<tr><td>'+esc(v.title)+'</td><td><span class="badge green">Ubah</span></td>'+db.users.map(x=>{const p=userPermissions(x)[k]||'none';return '<td><button class="text-button" data-access-user="'+esc(x.id)+'" aria-label="Atur akses '+esc(x.name)+'">'+({none:'Tanpa akses',read:'Lihat',write:'Ubah'}[p])+'</button></td>';}).join('')+'</tr>').join('')+'</tbody></table></div></div>';pane.querySelectorAll('[data-access-user]').forEach(b=>b.onclick=()=>edit('users',db.users.find(x=>x.id===b.dataset.accessUser)));}
  async function showTab(key){tabs.querySelectorAll('[data-user-tab]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.userTab===key));b.classList.toggle('selected',b.dataset.userTab===key);});if(key==='accounts')accounts();else if(key==='access')access();else{pane.innerHTML='<div class="card card-body"><p>Memuat riwayat aktivitas…</p></div>';await userHistoryModal();if($('modal').open&&tabs.isConnected){pane.innerHTML='<div class="card card-body" id="user-inline-history"></div>';const host=$('user-inline-history');while($('modal-body').firstChild)host.append($('modal-body').firstChild);$('modal').close();}}}
  tabs.querySelectorAll('[data-user-tab]').forEach(b=>b.onclick=()=>showTab(b.dataset.userTab));showTab('accounts');
  rpc('getUserHistory').then(r=>{ownerName=r.ownerProfile.name;const row=pane.querySelector('#user-account-rows tr');if(row){row.querySelector('.user-row-name').textContent=ownerName;row.dataset.userName=(ownerName+' '+principal.email).toLowerCase();}}).catch(()=>{});
};
const historyModalBeforeWorkspace=userHistoryModal;
userHistoryModal=async function(...args){await historyModalBeforeWorkspace(...args);if(route==='users'&&document.querySelector('[data-user-tab="history"][aria-selected="true"]')&&$('modal').open){const pane=document.querySelector('.user-workspace-pane');pane.innerHTML='<div class="card card-body" id="user-inline-history"></div>';const host=$('user-inline-history');while($('modal-body').firstChild)host.append($('modal-body').firstChild);$('modal').close();}};

const editBeforeSimpleAccount=edit;
edit=function(key,record){if(key!=='users'||record){editBeforeSimpleAccount(key,record);if(key==='users'&&record){const username=document.querySelector('[name="username"]');if(username)username.readOnly=true;}return;}if(!principal.owner)return;openModal('Tambah akun','<form id="create-account-form" class="account-create-form"><div class="field"><label for="account-name">Nama</label><input id="account-name" name="name" required maxlength="100" autocomplete="name"></div><div class="field"><label for="account-user">Username</label><input id="account-user" name="username" required minlength="3" maxlength="30" pattern="[A-Za-z0-9._-]{3,30}" autocomplete="off" autocapitalize="none"></div><div class="field"><label for="account-password">Password</label><input id="account-password" name="password" type="password" required minlength="8" maxlength="128" autocomplete="new-password"></div><div class="field"><label for="account-role">Peran</label><select id="account-role" name="role">'+Object.keys(ROLE_DEFAULTS).map(r=>'<option '+(r==='Panitia'?'selected':'')+'>'+esc(r)+'</option>').join('')+'</select></div>'+permissionFields({role:'Panitia',permissions:JSON.stringify(ROLE_DEFAULTS.Panitia)})+'<p class="subtitle">Pilih Tanpa akses, Lihat, atau Ubah untuk setiap fitur.</p><div id="account-create-error" role="alert"></div><div class="form-actions"><button class="button" type="submit">Buat akun</button></div></form>');$('account-role').onchange=e=>{const permissions=ROLE_DEFAULTS[e.target.value];document.querySelectorAll('#create-account-form [data-permission]').forEach(el=>el.value=permissions[el.dataset.permission]||'none');};const requestId=uuid();$('create-account-form').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('button');button.disabled=true;try{const payload=Object.fromEntries(new FormData(form));payload.requestId=requestId;const permissions={};form.querySelectorAll('[data-permission]').forEach(el=>{permissions[el.dataset.permission]=el.value;delete payload[el.name];});payload.permissions=JSON.stringify(permissions);if(!live)throw new Error('Pembuatan akun hanya tersedia pada aplikasi yang terhubung.');const result=await rpc('createUserAccount',payload);db=result.data;form.reset();$('modal').close();render();toast('Akun dan hak akses berhasil dibuat.');}catch(error){$('account-create-error').innerHTML='<div class="error">'+esc(error.message)+'</div>';}finally{button.disabled=false;}};};
const editBeforeFullAccount=edit;
edit=function(key,record){if(key==='users'&&record){accountEditModal(record,false);return;}editBeforeFullAccount(key,record);};
function accountEditModal(record,owner){if(!principal.owner)return;const x=record||{};openModal(owner?'Edit akun utama':'Edit akun pengguna','<form id="account-edit-form" class="account-create-form"><div class="field"><label for="edit-account-name">Nama</label><input id="edit-account-name" name="name" value="'+esc(x.name)+'" required maxlength="100"></div><div class="field"><label for="edit-account-username">Username</label><input id="edit-account-username" name="username" value="'+esc(x.username||'')+'" required pattern="[A-Za-z0-9._-]{3,30}" minlength="3" maxlength="30" autocapitalize="none" autocomplete="off"></div><div class="field"><label for="edit-account-password">Password baru</label><input id="edit-account-password" name="password" type="password" minlength="8" maxlength="128" autocomplete="new-password" placeholder="Kosongkan jika tidak diubah"></div>'+(owner?'<p class="subtitle">Akun utama memiliki akses penuh dan mengatur seluruh pengguna.</p>':'<div class="field"><label for="edit-account-role">Peran</label><select id="edit-account-role" name="role">'+Object.keys(ROLE_DEFAULTS).map(r=>'<option '+(x.role===r?'selected':'')+'>'+esc(r)+'</option>').join('')+'</select></div><div class="field"><label for="edit-account-status">Status</label><select id="edit-account-status" name="status">'+C.statuses.users.map(s=>'<option '+(x.status===s?'selected':'')+'>'+esc(s)+'</option>').join('')+'</select></div>'+permissionFields(x))+'<div id="account-edit-error" role="alert"></div><div class="form-actions">'+(!owner?'<button type="button" class="button danger" id="account-remove-access">Cabut akses</button>':'')+'<button class="button" type="submit">Simpan perubahan</button></div></form>');const form=$('account-edit-form');form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('[type="submit"]');button.disabled=true;try{const payload=Object.fromEntries(new FormData(form));payload.id=owner?'owner':x.id;payload.version=x.version;payload.requestId=uuid();if(!owner){const p={};form.querySelectorAll('[data-permission]').forEach(el=>{p[el.dataset.permission]=el.value;delete payload[el.name];});payload.permissions=JSON.stringify(p);}const result=await rpc('updateUserAccount',payload);db=result.data;form.reset();$('modal').close();render();toast('Akun dan akses diperbarui.');}catch(error){$('account-edit-error').innerHTML='<div class="error">'+esc(error.message)+'</div>';}finally{button.disabled=false;}};if($('account-remove-access'))$('account-remove-access').onclick=async()=>{try{await save({collection:'users',id:x.id,version:x.version,requestId:uuid(),action:'save',data:{...x,status:'Nonaktif'}});$('modal').close();}catch(error){$('account-edit-error').textContent=error.message;}};}
const usersPageBeforeFullAccount=usersPage;usersPage=function(){usersPageBeforeFullAccount();const button=document.querySelector('.user-account-table .user-actions button');if(button){button.title='Edit akun utama';button.setAttribute('aria-label','Edit akun utama');button.onclick=async()=>{try{const result=await rpc('getUserHistory');accountEditModal(result.ownerProfile,true);}catch(error){toast(error.message);}};}};

function standardFeatureRows(){
  const view=$('view');
  view.querySelectorAll('.doc-list').forEach(list=>{if(list.querySelector('table'))return;const rows=[...list.querySelectorAll('.doc-row')];if(!rows.length)return;const table=document.createElement('table');table.className='table standard-data-table document-data-table';table.innerHTML='<thead><tr><th>Tersedia</th><th>Dokumen</th><th>Status</th><th>Lampiran</th><th>Aksi</th></tr></thead><tbody></tbody>';rows.forEach(row=>{const tr=document.createElement('tr');tr.className='doc-row standard-document-row';tr.hidden=row.hidden;const check=row.querySelector('.check'),title=row.querySelector('h3'),status=row.querySelector('.doc-tags .badge:last-of-type')||(()=>{const el=document.createElement('span');el.innerHTML=badge(db.admin.find(x=>x.id===row.querySelector('[data-doc-check]')?.dataset.docCheck)?.status||'Belum disiapkan');return el.firstElementChild;})(),files=row.querySelector('.doc-attachments'),actions=row.querySelector('.doc-actions');[check,title,status,files,actions].forEach(node=>{const td=document.createElement('td');if(node)td.append(node);tr.append(td);});row.replaceChildren(table.ownerDocument.createElement('span'));table.querySelector('tbody').append(tr);});list.replaceChildren(table);});
  view.querySelectorAll('#gift-groups .item-grid').forEach(group=>{if(group.querySelector('table'))return;const rows=[...group.querySelectorAll('.gift-card')];if(!rows.length)return;const table=document.createElement('table');table.className='table standard-data-table gift-data-table';table.innerHTML='<thead><tr><th>Barang</th><th>Estimasi</th><th>Pembayaran</th><th>Persiapan</th><th>Aksi</th></tr></thead><tbody></tbody>';rows.forEach(row=>{const tr=document.createElement('tr');tr.className='gift-card';tr.hidden=row.hidden;const title=row.querySelector('.gift-title'),price=row.querySelector('.gift-price'),payment=row.querySelector('[data-field="paymentStatus"]'),prep=row.querySelector('[data-field="status"]'),actions=row.querySelector('.card-buttons');[title,price,payment,prep,actions].forEach(node=>{const td=document.createElement('td');if(node)td.append(node);tr.append(td);});table.querySelector('tbody').append(tr);});group.replaceChildren(table);});
  view.querySelectorAll('table.table').forEach(table=>{if(table.closest('#user-inline-history')||table.classList.contains('user-permission-matrix')||table.classList.contains('user-account-table'))return;table.classList.add('standard-data-table');const headers=[...table.querySelectorAll('thead th')],count=headers.length;if(!count)return;let focus=headers.findIndex(h=>/Nominal|Komitmen|Waktu|Status/.test(h.textContent));if(focus<1)focus=1;headers.forEach((th,index)=>{th.classList.toggle('compact-primary',index===0);th.classList.toggle('compact-focus',index===focus);th.classList.toggle('compact-actions',index===count-1);th.classList.toggle('compact-secondary',index!==0&&index!==focus&&index!==count-1);});table.querySelectorAll('tbody tr').forEach(tr=>{[...tr.children].forEach((td,index)=>{td.classList.toggle('compact-primary',index===0);td.classList.toggle('compact-focus',index===focus);td.classList.toggle('compact-actions',index===count-1);td.classList.toggle('compact-secondary',index!==0&&index!==focus&&index!==count-1);if(!td.title)td.title=td.textContent.trim();if(index===count-1)td.querySelectorAll('button').forEach(button=>{const text=button.textContent.trim();if(text&&!button.querySelector('svg')){button.title=text;button.setAttribute('aria-label',text);button.innerHTML=icon(/upload|lampiran/i.test(text)?'attach':'edit');button.classList.add('compact-edit');}});});});});
}
const renderBeforeStandardRows=render;render=function(){renderBeforeStandardRows();standardFeatureRows();};
const drawRowsBeforeStandardRows=drawRows;drawRows=function(){drawRowsBeforeStandardRows();standardFeatureRows();};
const drawGiftsBeforeStandardRows=drawGifts;drawGifts=function(){drawGiftsBeforeStandardRows();standardFeatureRows();};
const drawDocsBeforeStandardRows=drawDocs;drawDocs=function(){drawDocsBeforeStandardRows();standardFeatureRows();};

function kuaRowStatus(record){return record.status==='Selesai'||(record.files||[]).length?'Selesai':['Disiapkan','Diajukan','Perlu perbaikan'].includes(record.status)?'Disiapkan':'Belum disiapkan';}
const kuaStatusLabels={'Belum disiapkan':'Pending',Disiapkan:'Sedang dipersiapkan',Selesai:'Selesai'};
function refreshKuaStatuses(){if(route!=='admin')return;const view=$('view');view.querySelector(':scope>.notice')?.remove();const table=view.querySelector('.document-data-table');if(!table||table.dataset.statusReady)return;table.dataset.statusReady='true';table.querySelector('thead th').remove();const remarkHead=document.createElement('th');remarkHead.textContent='Remark';table.querySelector('thead tr').insertBefore(remarkHead,table.querySelector('thead tr').children[2]);table.querySelectorAll('tbody tr').forEach(tr=>{const checkbox=tr.querySelector('[data-doc-check]'),id=checkbox?.dataset.docCheck,record=db.admin.find(x=>x.id===id);if(!record)return;tr.firstElementChild.remove();const cell=tr.children[1],status=kuaRowStatus(record);cell.innerHTML='<span class="badge '+(status==='Selesai'?'green':status==='Disiapkan'?'pink':'')+'">'+kuaStatusLabels[status]+'</span>';cell.title=kuaStatusLabels[status];const remark=document.createElement('td');remark.className='kua-remark';remark.textContent=record.notes||'—';remark.title=record.notes||'Tidak ada remark';tr.insertBefore(remark,tr.children[2]);});const applicable=db.admin,done=applicable.filter(x=>x.files?.length).length;const hint=view.querySelector('.metric small');if(hint)hint.textContent='Done otomatis jika lampiran tersedia';const metric=view.querySelector('.metric strong');if(metric)metric.textContent=numberFormat(done)+' / '+numberFormat(applicable.length);const progress=view.querySelector('.metric .progress i');if(progress)progress.style.width=(applicable.length?done/applicable.length*100:0)+'%';}
const standardRowsBeforeKuaStatuses=standardFeatureRows;standardFeatureRows=function(){standardRowsBeforeKuaStatuses();refreshKuaStatuses();};
const editBeforeKuaStatuses=edit;edit=function(key,record){editBeforeKuaStatuses(key,record);if(key!=='admin')return;const remarkLabel=document.querySelector('label[for="field-notes"]');if(remarkLabel)remarkLabel.textContent='Remark';const form=$('edit-form'),checkbox=form?.querySelector('[name="available"]');if(checkbox){checkbox.checked=!!record?.files?.length;checkbox.closest('.field')?.setAttribute('hidden','');}const select=form?.querySelector('[name="status"]');if(select){const status=kuaRowStatus(record||{});select.innerHTML=['Belum disiapkan','Disiapkan','Selesai'].map(s=>'<option value="'+s+'" '+(s===status?'selected':'')+'>'+kuaStatusLabels[s]+'</option>').join('');if(record?.files?.length){select.setAttribute('aria-readonly','true');select.onchange=()=>select.value='Selesai';}}};
function kuaTarget(record){return ['Mempelai pria','Mempelai wanita'].includes(record?.owner)?record.owner:'Kedua mempelai';}
templateModal=function(){if(!C.can(principal,'admin',true))return;openModal('Daftar persyaratan KUA','<div class="field"><label for="kua-target">Persyaratan untuk</label><select id="kua-target"><option>Kedua mempelai</option><option>Mempelai pria</option><option>Mempelai wanita</option></select></div><p class="muted">Terceklis berarti sudah ada di daftar, bukan dokumen sudah selesai.</p><div id="kua-template-list" class="template-list"></div><div id="template-error" role="alert"></div><button class="button" id="add-template">Tambahkan yang dipilih</button>');const existing=(x,target)=>db.admin.some(r=>r.name.trim().toLowerCase()===x[0].trim().toLowerCase()&&(kuaTarget(r)===target||kuaTarget(r)==='Kedua mempelai'));const draw=()=>{const target=$('kua-target').value;$('kua-template-list').innerHTML=KUA_REQUIREMENTS.map((x,i)=>{const added=existing(x,target);return '<label><input type="checkbox" data-template="'+i+'" '+(added?'checked disabled':'')+'><span>'+esc(x[0])+'<small>'+esc(x[1])+' · '+(added?'Sudah ditambahkan':'Belum ditambahkan')+'</small></span></label>';}).join('');};$('kua-target').onchange=draw;draw();$('add-template').onclick=async()=>{const target=$('kua-target').value,selected=[...document.querySelectorAll('[data-template]:checked:not(:disabled)')].map(e=>Number(e.dataset.template));if(!selected.length){$('template-error').textContent='Pilih persyaratan yang belum ditambahkan.';return;}const button=$('add-template');button.disabled=true;$('kua-target').disabled=true;try{for(const i of selected){const x=KUA_REQUIREMENTS[i];if(existing(x,target))continue;await save({collection:'admin',id:uuid(),version:0,action:'save',requestId:uuid(),data:{name:x[0],requirementType:x[1],available:false,status:'Belum disiapkan',owner:target,source:i===6?KUA_PHOTO_SOURCE:KUA_SOURCE,notes:x[2]}});}$('modal').close();}catch(e){$('template-error').textContent=e.message;button.disabled=false;$('kua-target').disabled=false;draw();}};};
const editBeforeKuaTarget=edit;edit=function(key,record){editBeforeKuaTarget(key,record);if(key!=='admin')return;const owner=$('field-owner');if(owner){const select=document.createElement('select');select.id=owner.id;select.name=owner.name;select.innerHTML=['Kedua mempelai','Mempelai pria','Mempelai wanita'].map(t=>'<option '+(t===kuaTarget(record)?'selected':'')+'>'+t+'</option>').join('');owner.replaceWith(select);const label=document.querySelector('label[for="field-owner"]');if(label)label.textContent='Mempelai';}document.querySelectorAll('#modal-body p').forEach(p=>{if(p.textContent.includes('Checkbox tersedia'))p.textContent='Belum ada lampiran.';});};
const rowsBeforeKuaTarget=standardFeatureRows;standardFeatureRows=function(){rowsBeforeKuaTarget();if(route!=='admin')return;const table=$('view').querySelector('.document-data-table');if(!table||table.dataset.targetReady)return;table.dataset.targetReady='true';const head=document.createElement('th');head.textContent='Mempelai';table.querySelector('thead tr').insertBefore(head,table.querySelector('thead tr').children[1]);table.querySelectorAll('tbody tr').forEach(tr=>{const editButton=tr.querySelector('[data-doc-edit]'),record=db.admin.find(r=>r.id===editButton?.dataset.docEdit);const cell=document.createElement('td');cell.textContent=kuaTarget(record);cell.title=cell.textContent;tr.insertBefore(cell,tr.children[1]);});};
/* Keep existing ledgers and permissions while presenting one finance workspace. */
function integratedWorkspace(){
  if(!ready)return;
  $('view').classList.remove('finance-workspace');
  if(route==='dashboard')document.querySelector('.topbar #add-task')?.remove();
  const canBudget=C.can(principal,'budget',false),canSavings=C.can(principal,'savings',false);
  document.querySelectorAll('#nav [data-route="profile"],#view [data-menu="profile"]').forEach(b=>b.remove());
  document.querySelectorAll('#nav [data-route="savings"],#view [data-menu="savings"]').forEach(b=>{if(canBudget)b.remove();else{b.querySelector('span').textContent='Budget & Pengeluaran';b.setAttribute('aria-label','Budget & Pengeluaran');}});
  if(['budget','savings'].includes(route)){
    document.querySelector('#nav [data-route="budget"]')?.classList.add('active');
    document.querySelector('.topbar h1').textContent='Budget & Pengeluaran';
    const view=$('view'),tabs=document.createElement('div');tabs.className='segmented finance-tabs';view.classList.add('finance-workspace');
    tabs.innerHTML=[['budget','Pengeluaran'],['savings','Tabungan']].filter(([key])=>C.can(principal,key,false)).map(([key,label])=>'<button data-finance="'+key+'" class="'+(route===key?'selected':'')+'">'+label+'</button>').join('');
    tabs.setAttribute('aria-label','Menu keuangan');
    tabs.querySelectorAll('button').forEach(b=>{b.type='button';b.setAttribute('aria-pressed',String(b.dataset.finance===route));b.onclick=()=>go(b.dataset.finance);});
    const head=document.querySelector('.topbar>.page-head'),title=head?.querySelector('h1');
    if(title){title.hidden=true;title.parentElement.append(tabs);head.classList.add('finance-header');}else view.prepend(tabs);
    if(canBudget&&canSavings){const t=C.totals(db);view.querySelector('.metrics')?.remove();const metrics=document.createElement('div');metrics.className='metrics';metrics.innerHTML=metric('Anggaran',money(t.budget),'Komitmen '+money(t.committed),'budget')+metric('Pengeluaran',money(t.paid),'Sisa tagihan '+money(t.due),'budget')+metric('Saldo tabungan',money(t.savings),'Pembayaran dari tabungan terpotong otomatis','savings')+metric('Target tabungan',money(t.target),'Kekurangan '+money(Math.max(0,t.target-t.savings)),'heart');view.prepend(metrics);}
    if(C.can(principal,'profile',false)){const button=document.createElement('button');button.type='button';button.className='finance-settings-tab';button.innerHTML=icon('edit')+'Atur anggaran';button.title='Atur anggaran & target tabungan';button.setAttribute('aria-label',button.title);button.onclick=()=>go('profile');tabs.append(button);}
    const add=document.querySelector('.topbar #add-record');if(add){add.innerHTML=icon('plus')+(route==='savings'?'Catat tabungan':'Catat pengeluaran');}
  }
  if(route==='dashboard'&&C.can(principal,'profile',false)){
    const head=document.querySelector('.topbar>.page-head'),button=document.createElement('button');button.type='button';button.className='wedding-settings-icon';button.id='wedding-settings';button.title='Edit data mempelai & pengaturan pernikahan';button.setAttribute('aria-label',button.title);button.innerHTML=icon('edit');button.onclick=()=>go('profile');head?.append(button);
  }
  if(route==='profile'){const heading=document.querySelector('.topbar h1');if(heading)heading.textContent='Pengaturan pernikahan';const back=document.createElement('button');back.className='button secondary';back.textContent='Kembali ke Dashboard';back.onclick=()=>go('dashboard');$('view').prepend(back);}
}
const renderBeforeIntegratedWorkspace=render;render=function(){renderBeforeIntegratedWorkspace();integratedWorkspace();};
function giftProgress(x){return ['Dikemas','Diserahkan'].includes(x.status)?'Sudah disiapkan':x.status==='Disiapkan'||['Lunas','Hadiah / tanpa biaya'].includes(x.paymentStatus)?'Sudah dibeli':'Belum dibeli';}
const rowsBeforeGiftPolish=standardFeatureRows;standardFeatureRows=function(){rowsBeforeGiftPolish();if(route!=='gifts')return;const view=$('view');view.querySelector('.metrics')?.classList.add('gift-summary-three');view.querySelectorAll('.gift-data-table').forEach(table=>{if(table.dataset.giftPolished)return;table.dataset.giftPolished='true';table.querySelectorAll('tbody tr').forEach(tr=>{const control=tr.querySelector('[data-gift]'),record=db.gifts.find(x=>x.id===control?.dataset.gift);if(!record)return;const state=giftProgress(record);tr.children[2].innerHTML=badge(record.paymentStatus||'Belum dibayar');tr.children[3].innerHTML='<span class="badge '+(state==='Sudah disiapkan'?'green':state==='Sudah dibeli'?'pink':'')+'">'+state+'</span>';const link=tr.querySelector('a[href]');const td=document.createElement('td');if(link){link.textContent='Lihat barang';link.title='Buka halaman barang';td.append(link);}else td.textContent='—';tr.insertBefore(td,tr.lastElementChild);});const head=document.createElement('th');head.textContent='Link pembelian';table.querySelector('thead tr').insertBefore(head,table.querySelector('thead tr').lastElementChild);table.querySelector('thead tr').children[3].textContent='Status';});};
const editBeforeGiftPolish=edit;edit=function(key,record){editBeforeGiftPolish(key,record);if(key!=='gifts')return;const form=$('edit-form'),select=$('field-status');if(!form||!select)return;const current=giftProgress(record||{});select.innerHTML=[['Direncanakan','Belum dibeli'],['Disiapkan','Sudah dibeli'],['Dikemas','Sudah disiapkan']].map(([value,label])=>'<option value="'+value+'" '+(label===current?'selected':'')+'>'+label+'</option>').join('');const shopLabel=document.querySelector('label[for="field-shopUrl"]');if(shopLabel)shopLabel.textContent='Link pembelian (opsional)';const shop=$('field-shopUrl');if(shop)shop.placeholder='https://… halaman barang';const label=document.querySelector('label[for="field-status"]');if(label)label.textContent='Status barang';const submit=form.onsubmit;form.onsubmit=async e=>{if(select.value==='purchased'){select.value='Direncanakan';const payment=$('field-paymentStatus');if(payment&&!['Lunas','Hadiah / tanpa biaya'].includes(payment.value))payment.value='Lunas';}await submit(e);};};
function responsibleNames(){let saved=[];try{saved=JSON.parse(localStorage.getItem('siap-nikah-responsible-names')||'[]');}catch{}return [...new Set(['Ardi','Nadia',...saved,...Object.keys(C.modules).flatMap(key=>(db[key]||[]).map(r=>r.owner)).filter(name=>name&&!['Kedua mempelai','Mempelai pria','Mempelai wanita'].includes(name))])];}
const editBeforeResponsibleDropdown=edit;edit=function(key,record){editBeforeResponsibleDropdown(key,record);if(key==='admin')return;const field=$('field-owner'),form=$('edit-form');if(!field||!form||field.tagName!=='INPUT')return;const names=responsibleNames(),current=field.value;if(current&&!names.includes(current))names.push(current);const select=document.createElement('select');select.id=field.id;select.name=field.name;select.innerHTML='<option value="">Pilih penanggung jawab</option>'+names.map(name=>'<option value="'+esc(name)+'" '+(name===current?'selected':'')+'>'+esc(name)+'</option>').join('')+'<option value="__add_responsible__">+ Tambahkan nama</option>';const input=document.createElement('input');input.type='text';input.placeholder='Nama penanggung jawab baru';input.maxLength=200;input.hidden=true;input.setAttribute('aria-label','Nama penanggung jawab baru');field.replaceWith(select);select.after(input);select.onchange=()=>{const adding=select.value==='__add_responsible__';input.hidden=!adding;input.required=adding;if(adding){select.removeAttribute('name');input.name='owner';input.focus();}else{select.name='owner';input.removeAttribute('name');}};const submit=form.onsubmit;form.onsubmit=async e=>{if(!input.hidden){input.value=input.value.trim();if(!input.value){e.preventDefault();input.setCustomValidity('Masukkan nama penanggung jawab.');input.reportValidity();return;}input.setCustomValidity('');try{localStorage.setItem('siap-nikah-responsible-names',JSON.stringify([...new Set([...responsibleNames(),input.value])]));}catch{}}await submit(e);};input.oninput=()=>input.setCustomValidity('');};


var WeddingWorkflow=(function(){
  const plan=[
    ['Sepakati tanggal, lokasi, dan anggaran',180,'Ardi'],
    ['Susun daftar tamu bersama keluarga',150,'Nadia'],
    ['Bandingkan dan pilih venue',120,'Ardi'],
    ['Pilih katering, dekorasi, dan dokumentasi',100,'Nadia'],
    ['Siapkan dokumen dan konsultasi KUA tujuan',90,'Ardi'],
    ['Susun seserahan dan mahar',60,'Nadia'],
    ['Finalkan undangan dan konfirmasi tamu',30,'Nadia'],
    ['Susun rundown dan pembagian tugas panitia',21,'Ardi'],
    ['Konfirmasi seluruh vendor dan pembayaran',7,'Ardi'],
    ['Periksa dokumen, barang, dan kesiapan panitia',1,'Nadia']
  ];
  function before(date,days){if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return '';const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-days);return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,10);}
  function planRows(date){return plan.map(([name,days,owner],i)=>({id:'wedding-plan-'+i,name,date:before(date,days),owner,priority:i===4||i===9?'Tinggi':'Normal',status:'Belum mulai',notes:'Panduan persiapan H-'+days+'. Sesuaikan tanggal melalui ikon pensil.'}));}
  function costId(key,id){if(!['gifts','vendors'].includes(key))throw new Error('Sumber biaya tidak dikenal.');return 'linked-'+key+'-'+id;}
  function costData(key,record){return {name:record.name,category:key==='gifts'?(record.type==='Mahar'?'Mahar':'Seserahan'):record.category||'Lainnya',amount:record.amount||0,date:'',owner:key==='gifts'?record.owner||'':'Ardi',notes:'Terhubung dengan '+(key==='gifts'?'Seserahan & Mahar':'Vendor & Venue')+'. Catat pembayaran aktual melalui rincian biaya.'};}
  function taskMatch(rows,item){return rows.some(r=>r.id===item.id||r.name.trim().toLowerCase()===item.name.trim().toLowerCase());}
  function ics(records){const escape=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Siap Nikah//Persiapan//ID',...records.filter(r=>r.date).flatMap(r=>['BEGIN:VEVENT','UID:'+escape(r.id)+'@siapnikah','DTSTART;VALUE=DATE:'+r.date.replace(/-/g,''),'SUMMARY:'+escape(r.name),'DESCRIPTION:'+escape((r.owner||'')+'\n'+(r.notes||'')),'END:VEVENT']),'END:VCALENDAR'].join('\r\n')+'\r\n';}
  return {before,planRows,costId,costData,taskMatch,ics};
})();
if(typeof module!=='undefined')module.exports=WeddingWorkflow;

/* Cross-feature actions share existing records and server permission checks. */
const W=WeddingWorkflow;
function globalWeddingSearch(){openModal('Cari di ruang pernikahan','<div class="field"><label for="wedding-global-query">Cari nama, barang, vendor, tamu, atau tugas</label><input id="wedding-global-query" placeholder="Ketik untuk mencari…" maxlength="200" autocomplete="off"></div><div id="wedding-global-results" class="workflow-results"></div>');const query=$('wedding-global-query'),results=$('wedding-global-results');const draw=()=>{const term=query.value.trim().toLowerCase();if(!term){results.innerHTML='<p class="workflow-help">Hasil hanya mencakup fitur yang boleh Anda akses.</p>';return;}const matches=Object.entries(C.modules).filter(([key])=>key!=='users'&&key!=='profile'&&C.can(principal,key,false)).flatMap(([key])=>(db[key]||[]).filter(r=>[r.name,r.owner,r.notes,r.group,r.address].some(value=>String(value||'').toLowerCase().includes(term))).map(record=>({key,record}))).slice(0,30);results.innerHTML=matches.map(({key,record},i)=>'<button class="workflow-result" data-result="'+i+'"><strong>'+esc(record.name)+'</strong><small>'+esc(C.modules[key].title)+'</small>'+icon('edit')+'</button>').join('')||'<p class="workflow-help">Tidak ada hasil yang cocok.</p>';results.querySelectorAll('[data-result]').forEach(button=>button.onclick=()=>{const item=matches[Number(button.dataset.result)];$('modal').close();go(item.key);edit(item.key,item.record);});};query.oninput=draw;draw();query.focus();}
function planningModal(){
  if(!C.can(principal,'tasks',true))return;
  const rows=W.planRows(db.profile[0]?.date),missing=rows.filter(r=>!W.taskMatch(db.tasks,r));
  openModal('Panduan persiapan','<p class="workflow-help">Pilih tugas yang diperlukan. Tanggal disarankan dari tanggal pernikahan; tugas yang sudah ada tidak ditambahkan ulang.</p><div class="template-list">'+rows.map(r=>{const exists=W.taskMatch(db.tasks,r);return '<label><input type="checkbox" data-plan="'+r.id+'" '+(exists?'checked disabled':'')+'><span>'+esc(r.name)+'<small>'+esc(r.date?prettyDate(r.date):'Atur tanggal pernikahan dahulu')+' · '+(exists?'Sudah ditambahkan':esc(r.owner))+'</small></span></label>';}).join('')+'</div><div id="plan-error" role="alert"></div><button id="save-plan" class="button" '+(!missing.length?'disabled':'')+'>Tambahkan tugas terpilih</button>');
  $('save-plan').onclick=async()=>{const selected=[...document.querySelectorAll('[data-plan]:checked:not(:disabled)')].map(e=>rows.find(r=>r.id===e.dataset.plan));if(!selected.length){$('plan-error').textContent='Pilih sedikitnya satu tugas.';return;}const button=$('save-plan');button.disabled=true;try{for(const r of selected){if(W.taskMatch(db.tasks,r))continue;await save({collection:'tasks',id:r.id,version:0,action:'save',requestId:uuid(),data:r});}$('modal').close();toast('Tugas persiapan berhasil ditambahkan.');}catch(e){$('plan-error').textContent=e.message;button.disabled=false;}};
}
function workflowCost(key,record){
  const id=W.costId(key,record.id),linked=db.budget.find(r=>r.id===id);
  if(linked){edit('budget',linked);return;}
  if(!C.can(principal,'budget',true))return;
  openModal('Hubungkan ke anggaran','<p class="workflow-help">'+esc(record.name)+' akan dibuat sebagai satu item anggaran. Pembayaran dicatat terpisah setelah biaya dibuat.</p><div class="line-stat"><span>Komitmen biaya</span><strong>'+money(record.amount)+'</strong></div><div id="link-cost-error" role="alert"></div><button class="button" id="link-cost-save">Buat item anggaran</button>');
  $('link-cost-save').onclick=async()=>{const button=$('link-cost-save');button.disabled=true;try{const existing=db.budget.find(r=>r.id===id);if(!existing)await save({collection:'budget',id,version:0,action:'save',requestId:uuid(),data:W.costData(key,record)});const cost=db.budget.find(r=>r.id===id);if(cost)edit('budget',cost);else{$('modal').close();go('budget');}}catch(e){$('link-cost-error').textContent=e.message;button.disabled=false;}};
}
const editBeforeWorkflow=edit;edit=function(key,record){editBeforeWorkflow(key,record);if(!record||!['gifts','vendors','budget','tasks','admin'].includes(key))return;const body=$('modal-body');if(!body)return;
  if(['gifts','vendors'].includes(key)&&C.can(principal,'budget',false)){
    const linked=db.budget.find(r=>r.id===W.costId(key,record.id));if(!linked&&!C.can(principal,'budget',true))return;
    const panel=document.createElement('div');panel.className='workflow-link';panel.innerHTML='<span>'+(linked?'Biaya terhubung · '+money(C.netPaid(linked))+' dibayar':'Hubungkan barang atau vendor ini ke anggaran')+'</span><button class="button secondary">'+(linked?'Lihat biaya & invoice':'Hubungkan anggaran')+'</button>';panel.querySelector('button').onclick=()=>workflowCost(key,record);body.append(panel);
  }
  if(key==='budget'){for(const source of ['gifts','vendors']){const item=db[source].find(r=>W.costId(source,r.id)===record.id);if(!item||!C.can(principal,source,false))continue;const b=document.createElement('button');b.className='button secondary';b.textContent='Lihat '+(source==='gifts'?'barang sumber':'vendor sumber');b.onclick=()=>edit(source,item);body.append(b);}}
};
function workflowOverview(){
  if(route!=='dashboard')return;
  const cards=[];
  if(C.can(principal,'tasks',false)){const late=db.tasks.filter(r=>r.date&&r.date<localToday()&&!['Selesai','Tidak berlaku'].includes(r.status));const upcoming=db.tasks.filter(r=>r.date&&r.date>=localToday()&&!['Selesai','Tidak berlaku'].includes(r.status)).sort((a,b)=>a.date.localeCompare(b.date));cards.push({key:'tasks',title:late.length?late.length+' tugas lewat tenggat':'Langkah berikutnya',detail:late[0]?.name||upcoming[0]?.name||'Mulai dengan panduan persiapan',count:db.tasks.filter(r=>r.status==='Selesai').length,total:db.tasks.filter(r=>r.status!=='Tidak berlaku').length});}
  if(C.can(principal,'admin',false))cards.push({key:'admin',title:'Dokumen KUA',detail:db.admin.filter(r=>!r.files?.length).length+' dokumen tanpa lampiran',count:db.admin.filter(r=>r.files?.length).length,total:db.admin.length});
  if(C.can(principal,'gifts',false))cards.push({key:'gifts',title:'Seserahan & mahar',detail:'Pantau pembelian dan kesiapan barang',count:db.gifts.filter(r=>giftProgress(r)==='Sudah disiapkan').length,total:db.gifts.length});
  if(C.can(principal,'vendors',false))cards.push({key:'vendors',title:'Vendor & venue',detail:db.vendors.filter(r=>['Dipilih','Selesai'].includes(r.status)).length+' vendor dipilih',count:db.vendors.filter(r=>['Dipilih','Selesai'].includes(r.status)).length,total:db.vendors.filter(r=>r.status!=='Dibatalkan').length});
  const panel=document.createElement('section');panel.className='card workflow-overview';panel.innerHTML='<div class="card-head"><h2>Pusat persiapan</h2>'+(C.can(principal,'tasks',true)?'<button class="text-button" id="workflow-plan">Panduan persiapan</button>':'')+'</div><div class="workflow-grid">'+cards.map(c=>'<button class="workflow-tile" data-workflow="'+c.key+'"><strong>'+esc(c.title)+'</strong><small>'+esc(c.detail)+'</small><span>'+numberFormat(c.count)+' / '+numberFormat(c.total)+'</span><div class="progress"><i style="width:'+(c.total?c.count/c.total*100:0)+'%"></i></div></button>').join('')+'</div>';
  const settings=$('view').querySelector('.wedding-settings');if(settings)settings.after(panel);else $('view').prepend(panel);panel.querySelectorAll('[data-workflow]').forEach(b=>b.onclick=()=>go(b.dataset.workflow));if($('workflow-plan'))$('workflow-plan').onclick=planningModal;
}
function workflowPage(){if(!ready||!$('view'))return;
  const top=document.querySelector('.topright');if(top&&!$('wedding-search-button')){const searchButton=document.createElement('button');searchButton.id='wedding-search-button';searchButton.className='workflow-search-button';searchButton.innerHTML=icon('search');searchButton.setAttribute('aria-label','Cari semua fitur');searchButton.title='Cari semua fitur';searchButton.onclick=globalWeddingSearch;top.prepend(searchButton);}
  if(route==='tasks'){const toolbar=$('view').querySelector('.toolbar');if(!toolbar)return;if(C.can(principal,'tasks',true)){const b=document.createElement('button');b.className='button secondary';b.textContent='Panduan persiapan';b.onclick=planningModal;toolbar.append(b);}const calendar=document.createElement('button');calendar.className='button secondary';calendar.textContent='Ekspor kalender';calendar.title='File kalender untuk diimpor ke aplikasi kalender';calendar.onclick=()=>download('persiapan-nikah.ics',W.ics(db.tasks),'text/calendar;charset=utf-8');toolbar.append(calendar);}
  if(route==='rundown'){const collisions=db.rundown.filter(x=>db.rundown.some(y=>y.id!==x.id&&x.start<y.end&&y.start<x.end&&((x.owner&&x.owner===y.owner)||(x.location&&x.location===y.location))));if(collisions.length){const p=document.createElement('div');p.className='workflow-warning';p.textContent=collisions.length+' kegiatan berbenturan waktu dengan PIC atau lokasi yang sama. Periksa melalui ikon pensil.';$('view').prepend(p);}}
  if(route==='vendors'){const t=document.createElement('div');t.className='metrics vendor-summary';t.innerHTML=metric('Kandidat',numberFormat(db.vendors.filter(r=>!['Dipilih','Selesai','Dibatalkan'].includes(r.status)).length),'Bandingkan pilihan','vendors')+metric('Dipilih',numberFormat(db.vendors.filter(r=>['Dipilih','Selesai'].includes(r.status)).length),'Vendor yang disepakati','check')+metric('Estimasi',money(db.vendors.filter(r=>['Dipilih','Selesai'].includes(r.status)).reduce((s,r)=>s+r.amount,0)),'Hubungkan biaya melalui rincian vendor','budget');$('view').prepend(t);}
  document.querySelectorAll('input[name="owner"]:disabled,select[name="owner"]').forEach(e=>{if(!C.can(principal,route,true))e.disabled=true;});
}
const renderBeforeWorkflow=render;render=function(){renderBeforeWorkflow();workflowPage();};
const compactBeforeHiddenSidebar=compactNavigation;compactNavigation=function(){compactBeforeHiddenSidebar();let button=document.getElementById("sidebar-restore");if(!button){button=document.createElement("button");button.id="sidebar-restore";button.className="sidebar-restore";button.type="button";button.innerHTML=icon("menu");button.setAttribute("aria-label","Tampilkan sidebar");button.title="Tampilkan sidebar";button.onclick=()=>{sidebarMode=0;compactNavigation();};document.querySelector(".topbar").prepend(button);}};

var GiftSheet = (function(){
  const schema='seserahan-list-v1';
  function details(record={}){try{const value=JSON.parse(record.notes||'');if(value.schema===schema)return value;}catch{}return {schema,number:'',detail:'',vendor:'',note:record.notes||''};}
  function pack(value){const result=JSON.stringify({schema,number:String(value.number||'').trim(),detail:String(value.detail||'').trim(),vendor:String(value.vendor||'').trim(),note:String(value.note||'').trim(),...(value.limit!==undefined?{limit:Number(value.limit)}:{})});if(result.length>3000)throw Error('Detail dan catatan terlalu panjang.');if(value.limit!==undefined&&(!Number.isSafeInteger(Number(value.limit))||Number(value.limit)<0))throw Error('Batas anggaran tidak valid.');return result;}
  function state(record){return ['Dikemas','Diserahkan'].includes(record.status)?'Sudah disiapkan':record.status==='Disiapkan'?'Sudah Beli':record.paymentStatus==='Proses pembayaran'?'Dalam Proses':'Belum Beli';}
  function progress(record){return ['Dikemas','Diserahkan'].includes(record.status)?100:record.status==='Disiapkan'?75:record.paymentStatus==='Proses pembayaran'?35:0;}
  function statusFields(stateValue,paymentStatus='Belum dibayar'){return {status:stateValue==='Sudah disiapkan'?'Dikemas':stateValue==='Sudah Beli'?'Disiapkan':'Direncanakan',paymentStatus:stateValue==='Dalam Proses'?'Proses pembayaran':paymentStatus==='Proses pembayaran'?'Belum dibayar':paymentStatus};}
  function parseCSV(text){const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const char=text[i];if(char==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(char===','&&!quoted){row.push(cell);cell='';}else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}else cell+=char;}if(quoted)throw Error('Tanda kutip CSV belum ditutup.');row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;}
  function importRows(text){const table=parseCSV(text.replace(/^\uFEFF/,''));const head=table.findIndex(row=>row.includes('Item Seserahan')&&row.includes('Kategori'));if(head<0)throw Error('CSV harus memakai kolom Kategori dan Item Seserahan.');const headers=table[head],index=label=>headers.indexOf(label),read=(row,label)=>String(row[index(label)]||'').trim();let group='Lainnya';const records=[],seen=new Set();for(const row of table.slice(head+1)){const name=read(row,'Item Seserahan');if(!name)continue;group=read(row,'Kategori')||group;const amountText=read(row,'Estimasi Harga (Rp)'),amount=Number(amountText.replace(/[^\d-]/g,''));if(!Number.isSafeInteger(amount)||amount<0)throw Error('Harga tidak valid: '+name);const shop=read(row,'Vendor / Toko/Link Shoppe');if(/^https?:/i.test(shop)&&!/^https:\/\/\S+$/i.test(shop))throw Error('Link pembelian harus HTTPS: '+name);const rawState=read(row,'Status'),stateValue=/siap/i.test(rawState)?'Sudah disiapkan':/proses/i.test(rawState)?'Dalam Proses':/^sudah/i.test(rawState)?'Sudah Beli':'Belum Beli';const signature=(group+'|'+name).toLowerCase();if(seen.has(signature))throw Error('Barang duplikat dalam CSV: '+name);seen.add(signature);const id='seserahan-list-'+(read(row,'No')||String(records.length+1)).replace(/[^\w-]/g,'');records.push({id,name,type:'Seserahan',itemGroup:group,quantity:1,amount,shopUrl:/^https:\/\//i.test(shop)?shop:'',owner:'Ardi',...statusFields(stateValue),notes:pack({number:read(row,'No'),detail:read(row,'Detail / Keterangan'),vendor:/^https:\/\//i.test(shop)?'':shop,note:read(row,'Catatan')})});}if(!records.length)throw Error('Tidak ada barang dalam CSV.');if(records.length>200)throw Error('Maksimal 200 barang per impor.');return records;}
  function existing(rows,record){return rows.find(row=>row.id===record.id||(row.name.trim().toLowerCase()===record.name.trim().toLowerCase()&&(row.itemGroup||'Lainnya').trim().toLowerCase()===record.itemGroup.trim().toLowerCase()));}
  return {details,pack,state,progress,statusFields,parseCSV,importRows,existing};
})();
if(typeof module!=='undefined')module.exports=GiftSheet;

/* Spreadsheet-shaped gift planner, stored through the existing authenticated D1 API. */
function giftSheetType(){return giftsType==='Mahar'?'Mahar':'Seserahan';}
function giftSheetLimit(){return db.gifts.filter(row=>row.type===giftSheetType()).map(GiftSheet.details).find(value=>value.limit!==undefined)?.limit||0;}
giftProgress=record=>GiftSheet.state(record)==='Sudah Beli'?'Sudah dibeli':GiftSheet.state(record);
const previousGiftRows=standardFeatureRows;standardFeatureRows=function(){if(route==='gifts'&&$('gift-sheet-table'))return;previousGiftRows();};
giftsPage=function(){
  const rows=db.gifts.filter(row=>row.type===giftSheetType()),total=rows.reduce((sum,row)=>sum+row.amount,0),limit=giftSheetLimit(),purchased=rows.filter(row=>GiftSheet.state(row)==='Sudah Beli').length,percent=rows.length?Math.round(purchased/rows.length*100):0,mahar=giftSheetType()==='Mahar';
  $('view').innerHTML=pageHead(mahar?'Mahar':'Seserahan & Mahar','','<button class="button" id="add-record">'+icon('plus')+(mahar?'Tambah data mahar':'Tambah barang')+'</button>')+'<div class="gift-purchase-summary"><div class="gift-purchase-label"><strong>'+(mahar?'Mahar':'Seserahan')+'</strong><span>'+numberFormat(purchased)+' dari '+numberFormat(rows.length)+' barang · <b>'+percent+'%</b></span></div><div class="gift-purchase-track" role="progressbar" aria-label="Barang sudah dibeli" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percent+'"><i style="width:'+percent+'%"></i></div></div><div class="metrics gift-summary-two">'+metric('Estimasi harga',money(total),numberFormat(rows.length)+' barang','budget')+metric('Batas anggaran',limit?money(limit):'—',limit?'Sisa '+money(limit-total):'Atur batas anggaran '+giftSheetType().toLowerCase(),'gifts')+'</div>'+basicToolbar()+'<div id="gift-groups"></div>';
  $('add-record').dataset.giftType=mahar?'Mahar':'Seserahan';$('add-record').onclick=()=>{giftsType=mahar?'Mahar':'Seserahan';edit('gifts');};
  const toolbar=$('export').parentElement;toolbar.classList.add('gift-toolbar');$('search').parentElement.insertAdjacentHTML('afterend','<button type="button" class="button secondary gift-mahar-icon '+(giftsType==='Mahar'?'selected':'')+'" id="gift-mahar" title="Mahar" aria-label="Mahar" aria-pressed="'+(giftsType==='Mahar')+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 3 4-2 4 2-4 5-4-5Z"/><circle cx="12" cy="15" r="7"/></svg></button>');$('gift-mahar').onclick=()=>{giftsType=giftsType==='Mahar'?'Seserahan':'Mahar';search='';giftsPage();};if(C.can(principal,'gifts',true)){toolbar.insertAdjacentHTML('beforeend','<button class="button secondary" id="gift-limit" title="Atur batas anggaran" aria-label="Atur batas anggaran">'+icon('edit')+'</button>');$('gift-limit').onclick=giftLimitModal;}
  $('search').oninput=e=>{search=e.target.value;drawGifts();};$('export').onclick=()=>{const records=db.gifts.filter(row=>row.type===giftSheetType()).map(row=>{const meta=GiftSheet.details(row);return {'No':meta.number,'Kategori':row.itemGroup,[giftSheetType()==='Mahar'?'Item Mahar':'Item Seserahan']:row.name,'Detail / Keterangan':meta.detail,'Estimasi Harga (Rp)':row.amount,'Vendor / Toko/Link Shoppe':row.shopUrl||meta.vendor,'Status':GiftSheet.state(row),'Progress':GiftSheet.progress(row)+'%','Catatan':meta.note};});download(giftSheetType().toLowerCase()+'-list.csv',C.csv(records),'text/csv;charset=utf-8');};drawGifts();
};
drawGifts=function(){
  const rows=db.gifts.filter(row=>(row.type===giftSheetType())&&(!search||[row.name,row.itemGroup,...Object.values(GiftSheet.details(row))].join(' ').toLowerCase().includes(search.toLowerCase())));
  $('gift-groups').innerHTML='<div class="card gift-sheet-wrap"><table class="table gift-sheet-table" id="gift-sheet-table"><thead><tr>'+['Kategori','Estimasi harga','Status','Catatan',''].map(label=>'<th>'+label+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>{const meta=GiftSheet.details(row),stateValue=GiftSheet.state(row);return '<tr class="gift-card" data-row-id="'+esc(row.id)+'"><td><div class="gift-item-line"><span class="gift-category">'+esc(row.itemGroup)+'</span><strong>'+esc(row.name)+'</strong>'+(meta.detail?'<span class="gift-detail" title="'+esc(meta.detail)+'">'+esc(meta.detail)+'</span>':'')+'</div></td><td class="gift-price">'+numberFormat(row.amount)+'</td><td><span class="badge '+(stateValue==='Sudah disiapkan'?'green':stateValue==='Dalam Proses'?'amber':'')+'">'+esc(stateValue)+'</span></td><td title="'+esc(meta.note)+'">'+esc(meta.note||'—')+'</td><td><div class="gift-actions">'+(row.shopUrl?'<a class="gift-shop doc-edit-icon" href="'+esc(row.shopUrl)+'" target="_blank" rel="noopener noreferrer" title="'+esc(meta.vendor||'Buka toko')+' · '+esc(row.name)+'" aria-label="Buka toko '+esc(row.name)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l2-5h14l2 5M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v8h14v-8M9 20v-6h6v6"/></svg></a>':'')+(row.files?.length?'<button class="doc-edit-icon gift-file-view" data-view-gift="'+esc(row.id)+'" title="Lihat lampiran '+esc(row.name)+'" aria-label="Lihat lampiran '+esc(row.name)+'">'+'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>':'')+'<button class="doc-edit-icon" data-edit-gift="'+esc(row.id)+'" title="Edit '+esc(row.name)+'" aria-label="Edit '+esc(row.name)+'">'+icon('edit')+'</button></div></td></tr>';}).join('')+'</tbody></table>'+(!rows.length?'<div class="empty"><h3>'+(giftSheetType()==='Mahar'?'Belum ada mahar':'Belum ada barang')+'</h3><p>'+(search?'Tidak ada data yang sesuai pencarian.':giftSheetType()==='Mahar'?'Tambahkan mahar melalui tombol di atas.':'Tambahkan barang melalui tombol di atas.')+'</p></div>':'')+'</div>';
  document.querySelectorAll('[data-edit-gift]').forEach(button=>button.onclick=()=>edit('gifts',db.gifts.find(row=>row.id===button.dataset.editGift)));document.querySelectorAll('[data-view-gift]').forEach(button=>button.onclick=()=>giftViewFiles(db.gifts.find(row=>row.id===button.dataset.viewGift)));paginate();
};
const editBeforeGiftSheet=edit;edit=function(key,record){const editingGiftType=record?.type||$('add-record')?.dataset.giftType||giftSheetType();editBeforeGiftSheet(key,record);if(key!=='gifts'||!$('edit-form'))return;const meta=GiftSheet.details(record),form=$('edit-form'),grid=form.querySelector('.form-grid');
  const field=(name,label,value)=>'<div class="field"><label for="gift-'+name+'">'+label+'</label><input id="gift-'+name+'" maxlength="500" value="'+esc(value||'')+'"></div>';
  grid.insertAdjacentHTML('afterbegin',field('number','No',meta.number));grid.insertAdjacentHTML('beforeend',field('detail','Detail / Keterangan',meta.detail)+field('vendor','Vendor / Toko (opsional)',meta.vendor));
  $('field-notes').value=meta.note;document.querySelector('label[for="field-notes"]').textContent='Catatan (opsional)';document.querySelector('label[for="field-name"]').textContent=(editingGiftType==='Mahar'?'Item Mahar':'Item Seserahan')+' *';document.querySelector('label[for="field-itemGroup"]').textContent='Kategori *';$('field-itemGroup').required=true;
  const stateSelect=$('field-status');stateSelect.innerHTML=['Belum Beli','Dalam Proses','Sudah Beli','Sudah disiapkan'].map(value=>'<option '+(value===GiftSheet.state(record||{})?'selected':'')+'>'+value+'</option>').join('');
  grid.insertAdjacentHTML('beforeend','<div class="field"><label for="gift-progress-display">Progres (otomatis)</label><input id="gift-progress-display" value="'+GiftSheet.progress(record||{})+'%" readonly></div>');stateSelect.onchange=()=>{$('gift-progress-display').value=GiftSheet.progress(GiftSheet.statusFields(stateSelect.value))+'%';};
  ['gift-number','field-itemGroup','field-name','gift-detail','field-amount','gift-vendor','field-shopUrl','field-status','gift-progress-display','field-notes','field-type','field-quantity','field-paymentStatus','field-owner'].forEach(id=>{const element=$(id);if(element)grid.append(element.closest('.field'));});
  // Preserve existing metadata in the submitted form without exposing unrelated fields.
  ['gift-number','gift-vendor','field-type','field-quantity','field-paymentStatus','field-owner','gift-progress-display'].forEach(id=>{const element=$(id);if(element)element.closest('.field').hidden=true;});
  if(!record)$('field-type').value=editingGiftType;
  const editingType=editingGiftType;$('modal-title').textContent=(record?'Edit data':'Tambah data')+' '+editingType;document.querySelector('label[for="field-name"]').textContent=(editingType==='Mahar'?'Item Mahar':'Item Seserahan')+' *';
  form.querySelector('label[for="field-amount"]').textContent='Estimasi harga';
  $('modal-body').querySelector('.workflow-link')?.remove();
  form.dataset.giftEditor='true';
  const footer=form.querySelector('.modal-foot'),attachments=$('attachments');
  if(attachments)form.insertBefore(attachments,footer);
  const uploadLabel=attachments?.querySelector('label[for="attachment"]');
  if(uploadLabel){uploadLabel.classList.add('gift-upload-button');uploadLabel.innerHTML=icon('attach')+'<span>Lampiran</span>';uploadLabel.setAttribute('role','button');uploadLabel.tabIndex=0;uploadLabel.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();$('attachment').click();}};}
  $('field-notes').rows=2;
  if(uploadLabel)uploadLabel.title='Tambahkan PDF, Word, JPG atau PNG · maksimal 5 MB';
  const submitButton=form.querySelector('[type="submit"]');if(submitButton)submitButton.innerHTML=icon('check')+'Simpan';
  ['field-itemGroup','field-name','gift-detail','field-amount','field-status','field-notes','field-shopUrl'].forEach(id=>{const element=$(id);if(element)grid.append(element.closest('.field'));});
  $('field-notes').closest('.field').classList.remove('full');
  if(attachments){attachments.classList.add('gift-inline-attachments');grid.append(attachments);}
  const submit=form.onsubmit;form.onsubmit=async event=>{const chosen=stateSelect.value,notes=$('field-notes'),old=notes.value;try{const data=GiftSheet.statusFields(chosen,$('field-paymentStatus').value);stateSelect.innerHTML='<option value="'+data.status+'">'+data.status+'</option>';$('field-paymentStatus').value=data.paymentStatus;notes.value=GiftSheet.pack({...meta,number:$('gift-number').value,detail:$('gift-detail').value,vendor:$('gift-vendor').value,note:old});await submit(event);}catch(error){event.preventDefault();$('form-error').textContent=error.message;}finally{notes.value=old;stateSelect.innerHTML=['Belum Beli','Dalam Proses','Sudah Beli','Sudah disiapkan'].map(value=>'<option '+(value===chosen?'selected':'')+'>'+value+'</option>').join('');}};
};
function giftLimitModal(){const items=db.gifts.filter(row=>row.type===giftSheetType());if(!items.length){toast(giftSheetType()==='Mahar'?'Tambahkan mahar terlebih dahulu.':'Tambahkan barang terlebih dahulu.');return;}openModal('Batas anggaran '+giftSheetType().toLowerCase(),'<form id="gift-limit-form"><div class="field"><label for="gift-limit-amount">Batas anggaran (Rp)</label><input id="gift-limit-amount" type="number" min="0" max="1000000000000" step="1" value="'+giftSheetLimit()+'" required></div><div id="gift-limit-error" role="alert"></div><div class="form-actions"><button class="button" type="submit">Simpan</button></div></form>');$('gift-limit-form').onsubmit=async event=>{event.preventDefault();const button=event.currentTarget.querySelector('button');button.disabled=true;const record=items.find(row=>GiftSheet.details(row).limit!==undefined)||items[0];try{await save({collection:'gifts',id:record.id,version:record.version,action:'save',requestId:uuid(),data:{...record,notes:GiftSheet.pack({...GiftSheet.details(record),limit:Number($('gift-limit-amount').value)})}});$('modal').close();}catch(error){$('gift-limit-error').textContent=error.message;button.disabled=false;}};}
function giftViewFiles(row){if(!row?.files?.length)return;if(row.files.length===1){openFile('gifts',row,row.files[0].id,false);return;}openModal('Lampiran · '+row.name,'<div class="gift-file-list">'+row.files.map(file=>'<button class="button secondary" data-gift-file="'+esc(file.id)+'">'+icon('attach')+esc(file.name)+'</button>').join('')+'</div>');document.querySelectorAll('[data-gift-file]').forEach(button=>button.onclick=()=>openFile('gifts',row,button.dataset.giftFile,false));}

/* Institution emblems sourced from government websites; bundled to avoid external image dependencies. */
const PREP_LOGOS={"kemenag":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABXCAYAAACJKCKbAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAALiIAAC4iAari3ZIAAAaXaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICB4bWxuczp4bXBETT0iaHR0cDovL25zLmFkb2JlLmNvbS94bXAvMS4wL0R5bmFtaWNNZWRpYS8iCiAgICB4bWxuczpzdERpbT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL0RpbWVuc2lvbnMjIgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjcxOTZFODE4RDEwRkU3MTFBNThCQjU4MjJFMDg0MjhBIgogICB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjZGOTZFODE4RDEwRkU3MTFBNThCQjU4MjJFMDg0MjhBIgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NkY5NkU4MThEMTBGRTcxMUE1OEJCNTgyMkUwODQyOEEiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMTctMDMtMjRUMDA6MTI6MjkrMDc6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDE3LTAzLTI0VDAwOjEyOjI4KzA3OjAwIgogICB4bXBETTp2aWRlb1BpeGVsQXNwZWN0UmF0aW89IjEwMDAwMDAvMTAwMDAwMCIKICAgeG1wRE06dmlkZW9BbHBoYU1vZGU9InN0cmFpZ2h0IgogICB4bXBETTp2aWRlb0ZyYW1lUmF0ZT0iMC4wMDAwMDAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3MDk2RTgxOEQxMEZFNzExQTU4QkI1ODIyRTA4NDI4QSIKICAgICAgc3RFdnQ6d2hlbj0iMjAxNy0wMy0yNFQwMDoxMjoyOCswNzowMCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUHJlbWllcmUgUHJvIENTNiAoV2luZG93cykiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NzE5NkU4MThEMTBGRTcxMUE1OEJCNTgyMkUwODQyOEEiCiAgICAgIHN0RXZ0OndoZW49IjIwMTctMDMtMjRUMDA6MTI6MjkrMDc6MDAiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFByZW1pZXJlIFBybyBDUzYgKFdpbmRvd3MpIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvbWV0YWRhdGEiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8eG1wRE06dmlkZW9GcmFtZVNpemUKICAgIHN0RGltOnc9IjM2OTQiCiAgICBzdERpbTpoPSIzNTEzIgogICAgc3REaW06dW5pdD0icGl4ZWwiLz4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9InIiPz7SBCvlAAAAGXRFWHRTb2Z0d2FyZQBB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","puskesmas":"data:image/png;base64,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"};

/* Location-based map. Records remain in the existing D1 admin collection. */
const PREP_SOURCE='https://peraturan.go.id/files/permenag-no-30-tahun-2024.pdf';
const PREP_PLACES=[
 {id:'rt',title:'RT / RW',icon:'home',hint:'Jika diminta kelurahan',steps:['Tanyakan apakah pengantar RT/RW diperlukan di wilayah masing-masing.','Siapkan KTP dan KK; periksa nama serta alamat pada surat.'],docs:['Surat pengantar RT / RW'],match:/rt\s*\/\s*rw|pengantar rt|pengantar rw/i},
 {id:'desa',title:'Desa / Kelurahan',icon:'building',hint:'Berkas pria dan wanita',steps:['Urus surat pengantar nikah di desa/kelurahan domisili masing-masing.','Bawa KTP, KK, akta kelahiran dan pengantar RT/RW jika diminta.','Lengkapi persetujuan calon pengantin; foto dan formulir mengikuti layanan setempat.'],docs:['KTP','Kartu keluarga','Akta kelahiran','Surat pengantar nikah desa / kelurahan','Persetujuan calon pengantin','Pas foto'],match:/kelurahan|desa|ktp|kartu keluarga|akta kelahiran|pas foto|persetujuan calon/i},
 {id:'sehat',title:'Puskesmas / Faskes',icon:'health',hint:'Masing-masing mempelai',steps:['Hubungi Puskesmas atau fasilitas kesehatan untuk jadwal dan persyaratan.','Ikuti pemeriksaan dan konsultasi yang ditetapkan tenaga kesehatan.','Simpan surat keterangan sehat untuk pendaftaran nikah.'],docs:['Surat keterangan sehat'],match:/sehat|kesehatan|puskesmas/i},
 {id:'asal',title:'KUA Asal',icon:'building',hint:'Jika berbeda kecamatan',steps:['Jika akad di luar kecamatan domisili, urus rekomendasi di KUA asal mempelai yang bersangkutan.','Cantumkan KUA dan lokasi tujuan akad dengan benar.'],docs:['Surat rekomendasi nikah KUA asal'],match:/rekomendasi|kua asal|numpang nikah/i},
 {id:'kua',title:'KUA Tujuan',icon:'document',hint:'Daftar → Bimwin → pemeriksaan',steps:['Daftar ke KUA lokasi akad atau SIMKAH paling lambat 10 hari kerja sebelum akad.','Jika kurang dari 10 hari kerja, tanyakan dispensasi camat atau surat pertanggungjawaban bermeterai beserta alasan.','Ikuti Bimwin dan simpan sertifikatnya. Hadiri pemeriksaan bersama pasangan dan wali.','Lengkapi dokumen sesuai kondisi: izin orang tua untuk usia di bawah 21 tahun, dispensasi pengadilan untuk usia di bawah 19 tahun, izin TNI/Polri, atau bukti cerai/kematian pasangan terdahulu.','Konfirmasi penghulu, jadwal, dan pembayaran resmi. Akad di KUA pada hari/jam kerja gratis; di luar kantor atau jam kerja Rp600.000.','Periksa buku nikah setelah akad. Jika penyerahan tertunda karena alasan tertentu, batasnya 7 hari kerja sejak akad.'],docs:['Bukti pendaftaran nikah','Sertifikat Bimwin','Hasil pemeriksaan nikah','Konfirmasi jadwal penghulu','Bukti pembayaran PNBP nikah','Buku nikah suami','Buku nikah istri'],match:/bimwin|bimbingan|pendaftaran|pemeriksaan nikah|buku nikah|penghulu|pnbp|izin|dispensasi|akta cerai|kematian/i,links:[['budget','Biaya'],['tasks','Jadwal']]},
 {id:'akad',title:'Lokasi Akad',icon:'ring',hint:'Wali · saksi · mahar',steps:['Pastikan lokasi dan waktu sesuai konfirmasi KUA. Siapkan wali, dua saksi, mahar, dan dokumen asli yang diminta.','Koordinasikan penghulu dan panitia; siapkan tempat akad dan perlengkapan.','Laksanakan akad dan pencatatan; periksa data sebelum menandatangani dokumen.'],docs:['Kesiapan wali dan saksi','Konfirmasi lokasi akad','Pencatatan akad nikah'],match:/wali|saksi|akad/i,links:[['gifts','Mahar & seserahan'],['rundown','Rundown'],['vendors','Venue']]},
 {id:'resepsi',title:'Lokasi Resepsi',icon:'celebrate',hint:'Persiapan berjalan paralel',steps:['Tetapkan anggaran dan kapasitas; finalisasi venue, katering, dekorasi, busana, serta dokumentasi.','Susun undangan, pembagian tugas panitia, rundown, dan konfirmasi vendor.','Pada hari acara, catat tamu hadir beserta uang atau barang yang diberikan.','Setelah acara, cocokkan pembayaran dengan nota, selesaikan tagihan dan kembalikan barang sewaan.'],docs:['Konfirmasi kesiapan resepsi'],match:/resepsi|acara|vendor|panitia|rundown/i,links:[['budget','Keuangan'],['vendors','Vendor'],['guests','Tamu'],['rundown','Panitia']]}
];
let prepPlace='all';
function prepCatalog(placeId){const places=placeId==='kua'?['desa','sehat','asal','kua']:[placeId];return [...new Set(PREP_PLACES.filter(place=>places.includes(place.id)).flatMap(place=>place.docs))];}
function prepRequirementType(name,placeId){const origin=PREP_PLACES.find(place=>place.docs.includes(name))?.id||placeId;return ['rt','asal'].includes(origin)?'Bersyarat':['akad','resepsi'].includes(origin)?'Tahapan':'Umum';}
function prepDuplicate(rows,name,target,excludeId){const normalized=String(name||'').trim().replace(/\s+/g,' ').toLowerCase();return rows.find(row=>row.id!==excludeId&&String(row.name||'').trim().replace(/\s+/g,' ').toLowerCase()===normalized&&(kuaTarget(row)===target||kuaTarget(row)==='Kedua mempelai'||target==='Kedua mempelai'));}
function prepReusableFields(record){return {name:record.name,requirementType:record.requirementType||'Umum'};}
function prepProgress(rows){const done=rows.filter(row=>kuaRowStatus(row)==='Selesai').length;return {done,total:rows.length,percent:rows.length?Math.round(done/rows.length*100):0};}
function prepRecordPlace(row){const tag=(row.source||'').match(/[#&]peta=([a-z]+)/)?.[1];if(PREP_PLACES.some(p=>p.id===tag))return tag;return PREP_PLACES.find(p=>p.match.test(row.name||''))?.id||'kua';}
function prepMatchesPlace(row,placeId){const primary=prepRecordPlace(row);if(primary===placeId)return true;return placeId==='kua'&&['desa','sehat','asal'].includes(primary)&&prepCatalog('kua').some(name=>name.trim().toLowerCase()===(row.name||'').trim().toLowerCase());}
function prepVisibleDoc(row){return prepPlace==='all'||prepMatchesPlace(row,prepPlace);}
function prepPlaceLogo(place){const key=place.id==='sehat'?'puskesmas':['asal','kua'].includes(place.id)?'kemenag':null;return key?'<img class="prep-institution-logo" src="'+PREP_LOGOS[key]+'" alt="'+(key==='puskesmas'?'Lambang Puskesmas':'Lambang Kementerian Agama')+'" width="36" height="36">':prepSvg(place.icon);}
function prepSvg(name){const shapes={all:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',home:'<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7"/>',building:'<path d="m3 8 9-5 9 5H3ZM5 9v10m7-10v10m7-10v10M3 21h18"/>',health:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z"/>',document:'<path d="M6 3h9l4 4v14H6V3ZM14 3v5h5M9 12h7m-7 4h7"/>',ring:'<path d="m8 3 4-2 4 2-4 5-4-5Z"/><circle cx="12" cy="15" r="7"/>',celebrate:'<path d="m4 20 4-12 8 8-12 4ZM13 7l4-4m-1 8h5M9 4V2m10 4 2 2"/>'};return '<svg viewBox="0 0 24 24" aria-hidden="true">'+shapes[name]+'</svg>';}
const adminBeforePreparationMap=adminPage;
adminPage=function(){adminType='Semua';adminBeforePreparationMap();const view=$('view');view.classList.add('preparation-view');$('admin-tabs').hidden=true;view.querySelector('.sources')?.remove();view.querySelector('.metrics')?.remove();view.querySelector('.notice')?.remove();const csv=$('export');if(csv){csv.innerHTML=icon('download');csv.classList.add('prep-icon-action');csv.title='Ekspor CSV';csv.setAttribute('aria-label','Ekspor CSV');}const section=document.createElement('section');section.id='preparation-map';section.className='card preparation-map';view.prepend(section);const catalogue=document.createElement('button');catalogue.id='prep-catalogue';catalogue.className='button secondary prep-icon-action';catalogue.type='button';catalogue.title='Daftar keperluan';catalogue.setAttribute('aria-label','Daftar keperluan');catalogue.innerHTML=icon('plus');catalogue.onclick=()=>prepRequirementsModal(prepPlace==='all'?'kua':prepPlace);if(C.can(principal,'admin',true))csv?.before(catalogue);paintPreparationMap();$('add-record').innerHTML=icon('plus')+'Tambah data';$('add-record').onclick=()=>edit('admin');};
function paintPreparationMap(){const host=$('preparation-map');if(!host)return;const selected=PREP_PLACES.find(p=>p.id===prepPlace),rows=db.admin.filter(prepVisibleDoc),progress=prepProgress(rows);host.innerHTML='<nav class="prep-icons prep-roadmap" aria-label="Tempat pengurusan"><svg class="prep-winding-road" viewBox="0 0 800 150" preserveAspectRatio="none" aria-hidden="true"><path class="prep-road-edge" d="M50 58 C85 58 115 100 150 100 S215 58 250 58 S315 100 350 100 S415 58 450 58 S515 100 550 100 S615 58 650 58 S715 100 750 100"/><path class="prep-road-center" d="M50 58 C85 58 115 100 150 100 S215 58 250 58 S315 100 350 100 S415 58 450 58 S515 100 550 100 S615 58 650 58 S715 100 750 100"/></svg><svg class="prep-mobile-road" viewBox="0 0 400 148" preserveAspectRatio="none" aria-hidden="true"><path class="prep-road-edge" d="M50 16 C85 16 115 36 150 16 S215 -4 250 16 S315 36 350 16 C395 16 395 96 350 96 S285 116 250 96 S185 76 150 96 S85 116 50 96"/><path class="prep-road-center" d="M50 16 C85 16 115 36 150 16 S215 -4 250 16 S315 36 350 16 C395 16 395 96 350 96 S285 116 250 96 S185 76 150 96 S85 116 50 96"/></svg><button class="prep-node '+(prepPlace==='all'?'selected':'')+'" data-prep="all" aria-label="Semua tempat" title="Semua tempat" aria-pressed="'+(prepPlace==='all')+'">'+'<span class="prep-node-icon">'+prepSvg('all')+'</span><span class="prep-node-label">Semua</span><span class="prep-percent">'+prepProgress(db.admin).percent+'%</span></button>'+PREP_PLACES.map(p=>{const records=db.admin.filter(r=>prepMatchesPlace(r,p.id)),stageProgress=prepProgress(records);return '<button class="prep-node '+(prepPlace===p.id?'selected':'')+'" data-prep="'+p.id+'" aria-label="'+p.title+'" title="'+p.title+'" aria-pressed="'+(prepPlace===p.id)+'">'+'<span class="prep-node-icon">'+prepPlaceLogo(p)+'</span><span class="prep-node-label">'+esc(({rt:'RT / RW',desa:'Kelurahan',sehat:'Puskesmas',asal:'KUA Asal',kua:'KUA Tujuan',akad:'Akad',resepsi:'Resepsi'})[p.id])+'</span><span class="prep-percent">'+stageProgress.percent+'%</span>'+'</button>';}).join('')+'</nav>';host.querySelectorAll('[data-prep]').forEach(b=>b.onclick=()=>{prepPlace=b.dataset.prep;search='';$('search').value='';adminType='Semua';paintPreparationMap();drawDocs();});host.querySelectorAll('[data-prep-link]').forEach(b=>b.onclick=()=>go(b.dataset.prepLink));if($('prep-requirements'))$('prep-requirements').onclick=()=>prepRequirementsModal(selected.id);}
function prepRequirementsModal(placeId=prepPlace){const place=PREP_PLACES.find(p=>p.id===placeId);if(!place)return;const docs=prepCatalog(place.id),exists=(name,target)=>!!prepDuplicate(db.admin,name,target);openModal('Keperluan · '+place.title,'<div class="field"><label for="prep-target">Untuk mempelai</label><select id="prep-target"><option>Kedua mempelai</option><option>Mempelai pria</option><option>Mempelai wanita</option></select></div><div id="prep-options" class="template-list"></div><p class="subtitle">Pilih yang sesuai kebutuhan. Terceklis dan terkunci berarti sudah ada.</p><div id="prep-error" role="alert"></div><div class="modal-foot"><button class="button" id="prep-add">Tambahkan</button></div>');const draw=()=>{$('prep-options').innerHTML=docs.map((name,i)=>{const added=exists(name,$('prep-target').value);return '<label><input type="checkbox" data-prep-doc="'+i+'" '+(added?'checked disabled':'')+'><span>'+esc(name)+(added?'<small>Sudah ada</small>':'')+'</span></label>';}).join('');};draw();$('prep-target').onchange=draw;$('prep-add').onclick=async()=>{const chosen=[...document.querySelectorAll('[data-prep-doc]:checked:not(:disabled)')].map(b=>docs[Number(b.dataset.prepDoc)]),target=$('prep-target').value;if(!chosen.length){$('prep-error').textContent='Pilih keperluan yang belum ada.';return;}$('prep-add').disabled=true;$('prep-target').disabled=true;try{for(const name of chosen){if(exists(name,target))continue;await save({collection:'admin',id:uuid(),version:0,action:'save',requestId:uuid(),data:{name,requirementType:prepRequirementType(name,place.id),owner:target,available:false,status:'Belum disiapkan',source:PREP_SOURCE+'#peta='+place.id,notes:''}});}$('modal').close();}catch(e){$('prep-error').textContent=e.message;$('prep-add').disabled=false;$('prep-target').disabled=false;}};}
function prepGuidance(placeId){
 const place=PREP_PLACES.find(p=>p.id===placeId);if(!place)return '';
 return '<p class="prep-form-hint">'+esc(place.hint)+'</p><ol>'+place.steps.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol><div class="prep-form-links">'+(place.links||[]).filter(([key])=>C.can(principal,key,false)).map(([key,label])=>'<button type="button" class="button secondary" data-prep-form-link="'+key+'">'+icon(key)+esc(label)+'</button>').join('')+'<a href="'+PREP_SOURCE+'" target="_blank" rel="noopener">Rujukan</a></div>';
}
function prepCost(record){const value=(record?.source||'').match(/[#&]biaya=(\d+)(?:&|$)/)?.[1];return value===undefined?'':Number(value);}
const drawDocsBeforePreparationCost=drawDocs;
drawDocs=function(){
 drawDocsBeforePreparationCost();const table=$('docs')?.querySelector('.document-data-table');if(!table||table.dataset.prepCostReady)return;
 const entries=[...table.querySelectorAll('tbody tr')].map(row=>({row,record:db.admin.find(record=>record.id===row.querySelector('[data-doc-edit]')?.dataset.docEdit)}));
 if(!entries.some(({record})=>C.preparationCost(record)!==null))return;
 table.dataset.prepCostReady='true';const head=document.createElement('th');head.textContent='Biaya';table.querySelector('thead tr').insertBefore(head,table.querySelector('thead tr').children[3]);
 entries.forEach(({row,record})=>{const cost=C.preparationCost(record),cell=document.createElement('td');cell.className='prep-cost-cell';cell.textContent=cost===null?'—':numberFormat(cost);cell.title=cost===null?'Tidak ada biaya':money(cost);row.insertBefore(cell,row.children[3]);});standardFeatureRows();polishTables();
};
const dashboardBeforePreparationCost=dashboardReception;
dashboardReception=function(){
 dashboardBeforePreparationCost();if(route!=='dashboard'||!principal.owner||!ready)return;
 const section=$('view').querySelector('.reception-dashboard'),list=section?.querySelector('#expense-list');if(!list)return;
 const expenses=(db.admin||[]).filter(record=>C.preparationCost(record)>0);if(!expenses.length)return;
 list.querySelector('.empty')?.remove();
 list.insertAdjacentHTML('beforeend',expenses.map(record=>'<div class="expense-row" data-row-id="'+esc(record.id)+'"><div><strong>'+esc(record.name)+'</strong><small>Peta Persiapan · '+esc(PREP_PLACES.find(place=>place.id===prepRecordPlace(record))?.title||'')+(record.date?' · '+esc(prettyDate(record.date)):'')+'</small></div><div>'+money(C.preparationCost(record))+'</div><button class="text-button" data-prep-expense="'+esc(record.id)+'">Detail</button></div>').join(''));
 list.querySelectorAll('[data-prep-expense]').forEach(button=>button.onclick=()=>edit('admin',db.admin.find(record=>record.id===button.dataset.prepExpense)));
 section.querySelector('.card-head .subtitle').textContent='Pengeluaran pembayaran dan Peta Persiapan · penerimaan tamu hadir';
 const count=section.querySelector('.line-stat strong');if(count)count.textContent=numberFormat([...db.budget,...expenses].reduce((sum,record)=>sum+(record.files||[]).length,0))+' berkas';
};
function prepSourceWithCost(source,place,cost){const raw=String(cost).replace(/\./g,'').trim();if(raw&&!/^\d+$/.test(raw))throw new Error('Biaya harus berupa angka bulat.');const amount=raw===''?null:Number(raw);if(amount!==null&&(!Number.isSafeInteger(amount)||amount<0||amount>1000000000000))throw new Error('Biaya harus antara 0 dan 1 triliun.');return (source.split('#')[0]||PREP_SOURCE)+'#peta='+place+(amount===null?'':'&biaya='+amount);}
const editBeforePreparationMap=edit;
edit=function(key,record){
 const selectedPlace=document.querySelector('#preparation-map [data-prep][aria-pressed="true"]')?.dataset.prep||prepPlace;
 editBeforePreparationMap(key,record);if(key!=='admin'||!$('edit-form'))return;
 const form=$('edit-form'),source=$('field-source'),grid=form.querySelector('.form-grid');if(!source||!grid)return;
 form.dataset.giftEditor='true';form.dataset.prepEditor='true';source.value=source.value.split('#')[0];source.closest('.field').hidden=true;
 const location=record?prepRecordPlace(record):selectedPlace==='all'?'kua':selectedPlace;
 grid.insertAdjacentHTML('afterbegin','<div class="field full prep-location-field"><label for="prep-location">Tempat pengurusan</label><select id="prep-location">'+PREP_PLACES.map(p=>'<option value="'+p.id+'" '+(p.id===location?'selected':'')+'>'+esc(p.title)+'</option>').join('')+'</select><div id="prep-form-guide" class="prep-form-guide"></div></div>');
 const nameInput=$('field-name');nameInput.insertAdjacentHTML('beforebegin','<select id="prep-requirement" aria-label="Persyaratan" required></select>');nameInput.removeAttribute('list');nameInput.required=false;form.querySelector('label[for="field-name"]').htmlFor='prep-requirement';
 $('field-notes').closest('.field').insertAdjacentHTML('beforebegin','<div class="field"><label for="prep-cost">Biaya (opsional)</label><input id="prep-cost" type="number" min="0" max="1000000000000" step="1" value="'+prepCost(record)+'" placeholder="Isi jika ada biaya" aria-label="Biaya (opsional)"></div>');
 const choices=()=>{const names=prepCatalog($('prep-location').value);if(nameInput.value&&!names.includes(nameInput.value))names.push(nameInput.value);const current=nameInput.value,custom=$('prep-requirement').value==='__custom';$('prep-requirement').innerHTML='<option value="">Pilih persyaratan</option>'+names.map(name=>{const duplicate=prepDuplicate(db.admin,name,$('field-owner').value,record?.id);return '<option value="'+esc(name)+'" '+(duplicate?'disabled':'')+'>'+esc(name)+(duplicate?' · Sudah ada':'')+'</option>';}).join('')+'<option value="__custom">Lainnya / isi sendiri</option>';$('prep-requirement').value=custom?'__custom':current;nameInput.hidden=!custom;if(custom)nameInput.placeholder='Nama persyaratan';};
 const pick=()=>{const selected=$('prep-requirement').value;nameInput.hidden=selected!=='__custom';nameInput.required=selected==='__custom';if(selected!=='__custom'){nameInput.value=selected;$('field-requirementType').value=prepRequirementType(selected,$('prep-location').value);}else{nameInput.value='';nameInput.placeholder='Nama persyaratan';nameInput.focus();}};
 $('prep-requirement').onchange=pick;const ownerChange=$('field-owner').onchange;$('field-owner').onchange=e=>{ownerChange?.(e);choices();};
 const guide=()=>{const place=PREP_PLACES.find(p=>p.id===$('prep-location').value);$('prep-form-guide').innerHTML=prepGuidance(place.id);choices();$('prep-form-guide').querySelectorAll('[data-prep-form-link]').forEach(b=>b.onclick=()=>{if(!confirm('Buka fitur terkait? Perubahan yang belum disimpan akan ditinggalkan.'))return;$('modal').close();go(b.dataset.prepFormLink);});};
 guide();$('prep-location').onchange=guide;
 const reusable=db.admin.filter(item=>item.id!==record?.id);
 grid.insertAdjacentHTML('afterbegin','<div class="field full prep-reuse-field"><label for="prep-reuse">Pakai persyaratan serupa (opsional)</label><select id="prep-reuse"><option value="">Pilih dari data yang sudah ada</option>'+reusable.map(item=>'<option value="'+esc(item.id)+'">'+esc(item.name)+' · '+esc(kuaTarget(item))+'</option>').join('')+'</select><div id="prep-reuse-hint" class="prep-reuse-hint" aria-live="polite"></div></div>');
 const reuseHint=()=>{const duplicate=prepDuplicate(db.admin,nameInput.value,$('field-owner').value,record?.id),host=$('prep-reuse-hint');host.innerHTML=duplicate?'Sudah ada untuk mempelai ini. <button type="button" class="text-button" id="prep-open-original">Edit data asal</button>':'';if($('prep-open-original'))$('prep-open-original').onclick=()=>edit('admin',duplicate);};
 $('prep-reuse').onchange=()=>{const sourceRecord=reusable.find(item=>item.id===$('prep-reuse').value);if(!sourceRecord){$('prep-reuse-hint').textContent='';return;}const fields=prepReusableFields(sourceRecord);nameInput.value=fields.name;$('field-requirementType').value=fields.requirementType;choices();reuseHint();};
 const targetChanged=$('field-owner').onchange;$('field-owner').onchange=e=>{targetChanged?.(e);reuseHint();};
 const requirementChanged=$('prep-requirement').onchange;$('prep-requirement').onchange=e=>{requirementChanged?.(e);reuseHint();};
 nameInput.addEventListener('input',reuseHint);
 $('modal-title').textContent=(record?'Edit data':'Tambah data')+' persiapan';
 $('modal-body').querySelector('.workflow-link')?.remove();
 $('modal-body').querySelector(':scope > .subtitle')?.remove();
 const footer=form.querySelector('.modal-foot'),attachments=$('attachments'),newFile=$('new-admin-file');
 if(attachments){attachments.classList.add('gift-inline-attachments');grid.append(attachments);}
 if(newFile){const box=newFile.closest('.new-budget-proof');box.classList.add('gift-inline-attachments');grid.append(box);}
 const upload=attachments?.querySelector('label[for="attachment"]')||form.querySelector('label[for="new-admin-file"]');
 if(upload){upload.classList.add('gift-upload-button');upload.innerHTML=icon('attach')+'<span>Lampiran</span>';upload.title='PDF, Word, JPG atau PNG · maksimal 5 MB';upload.setAttribute('role','button');upload.tabIndex=0;upload.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$(upload.htmlFor).click();}};}
 $('field-notes')?.closest('.field').classList.remove('full');
 const saveButton=footer.querySelector('[type="submit"]');if(saveButton)saveButton.innerHTML=icon('check')+'Simpan';
 accountingInputs();
 const submit=form.onsubmit;form.onsubmit=async event=>{try{if(!nameInput.value.trim())throw new Error('Pilih atau isi nama persyaratan.');if(prepDuplicate(db.admin,nameInput.value,$('field-owner').value,record?.id))throw new Error('Persyaratan ini sudah ada untuk mempelai tersebut. Edit data yang sudah ada.');source.value=prepSourceWithCost(source.value,$('prep-location').value,$('prep-cost').value);}catch(error){event.preventDefault();$('form-error').textContent=error.message;return;}await submit(event);};
};

ICONS.link='M14 3h7v7 M21 3l-9 9 M10 5H3v16h16v-7';
/* Unified financial view projects source records without duplicating their storage. */
['Transportasi','Akomodasi','Konsumsi'].forEach(category=>{if(!choices.category.includes(category))choices.category.push(category);});
function financeSource(row){return row.sourceKey==='gifts'?row.category:row.sourceKey==='admin'?'Peta Persiapan':row.sourceKey==='tasks'?'Timeline':row.sourceKey==='vendors'?'Vendor & Venue':'Manual';}
function financeOrigin(row){return db[row.sourceKey]?.find(record=>record.id===row.sourceId);}
function financeFiles(row){const origin=financeOrigin(row),ledger=db.budget.find(record=>record.id===row.ledgerId);return [...(origin?.files||[]).map(file=>({file,key:row.sourceKey,record:origin})),...(row.sourceKey!=='budget'?(ledger?.files||[]).map(file=>({file,key:'budget',record:ledger})):[])];}
function financeOpenSource(row){const origin=financeOrigin(row);if(origin){go(row.sourceKey);edit(row.sourceKey,origin);}}
function financeViewFiles(row){const files=financeFiles(row);if(!files.length){financeOpenSource(row);return;}if(files.length===1){const item=files[0];openFile(item.key,item.record,item.file.id,false);return;}openModal('Lampiran · '+row.name,'<div class="finance-file-list">'+files.map((item,index)=>'<button type="button" class="button secondary" data-finance-file="'+index+'">'+icon('attach')+esc(item.file.name)+'</button>').join('')+'</div>');document.querySelectorAll('[data-finance-file]').forEach(button=>button.onclick=()=>{const item=files[Number(button.dataset.financeFile)];openFile(item.key,item.record,item.file.id,false);});}
async function financePayment(row){
 if(!C.can(principal,'budget',true))return;
 if(row.sourceKey==='admin'){financeOpenSource(row);return;}
 if(row.sourceKey==='budget'){payment(financeOrigin(row));return;}
 let ledger=db.budget.find(record=>record.id===row.id);
 if(!ledger||ledger.amount!==row.amount||ledger.name!==row.name||ledger.category!==row.category){
  await save({collection:'budget',id:row.id,version:ledger?.version||0,action:'save',requestId:uuid(),data:{name:row.name,category:row.category,amount:row.amount,date:ledger?.date||'',owner:row.owner||'',notes:ledger?.notes||'Terhubung dengan '+financeSource(row)+'.'}});
  ledger=db.budget.find(record=>record.id===row.id);
 }
 if(ledger)payment(ledger);
}
function drawFinanceRows(){
 const rows=C.paidFinanceRows(db).filter(row=>!search||[row.name,row.category,financeSource(row)].join(' ').toLowerCase().includes(search.toLowerCase()));
 $('records').innerHTML='<div class="table-wrap"><table class="table standard-data-table finance-table"><thead><tr>'+['Item biaya','Sumber','Penanggung jawab','Dibayar','Sisa','Lampiran',''].map(label=>'<th>'+label+'</th>').join('')+'</tr></thead><tbody>'+rows.map((row,index)=>{const paid=C.financePaid(row),files=financeFiles(row),status=paid===0&&row.amount>0?'Belum dibayar':paid<row.amount?'DP / sebagian':'Lunas';return '<tr data-finance-row="'+index+'"><td title="'+esc(row.name)+'"><strong class="finance-name" role="button" tabindex="0" aria-label="Rincian '+esc(row.name)+'">'+esc(row.name)+'</strong><small>'+esc(row.category)+(row.date?' · '+esc(prettyDate(row.date)):'')+'</small></td><td><span class="finance-source">'+esc(financeSource(row))+'</span></td><td title="'+esc(row.owner||'Belum ditentukan')+'"><span class="finance-owner">'+esc(row.owner||'—')+'</span></td><td>'+(paid?numberFormat(paid):'—')+'<small>'+status+'</small></td><td>'+(row.amount>paid?numberFormat(row.amount-paid):'—')+'</td><td><button class="doc-edit-icon" data-finance-files="'+index+'" aria-label="'+(files.length?'Lihat lampiran ':'Tambah lampiran ')+esc(row.name)+'" title="'+files.length+' lampiran">'+icon('attach')+'</button>'+(files.length?'<small>'+numberFormat(files.length)+'</small>':'')+'</td><td><div class="finance-actions">'+(row.sourceKey!=='admin'&&C.can(principal,'budget',true)?'<button class="doc-edit-icon" data-finance-pay="'+index+'" aria-label="Catat pembayaran '+esc(row.name)+'" title="Catat pembayaran">'+icon('budget')+'</button>':'')+'<button class="doc-edit-icon" data-finance-edit="'+index+'" aria-label="Edit '+esc(row.name)+'" title="'+(row.sourceKey==='budget'?'Edit biaya':'Buka data asal')+'">'+icon(row.sourceKey==='budget'?'edit':'link')+'</button></div></td></tr>';}).join('')+'</tbody></table></div>'+(!rows.length?'<div class="empty"><p>Belum ada pengeluaran yang sudah dibayar.</p></div>':'');
 document.querySelectorAll('[data-finance-row]').forEach(tr=>{const row=rows[Number(tr.dataset.financeRow)],detail=document.createElement('small');detail.className='finance-mobile-detail';detail.textContent=financeSource(row)+' · Sisa '+numberFormat(Math.max(0,row.amount-C.financePaid(row)));const metadata=document.createElement('small');metadata.className='finance-mobile-metadata';metadata.textContent=row.category+(row.date?' · '+row.date.slice(2).split('-').reverse().join('/'):'');tr.firstElementChild.append(metadata);const name=tr.querySelector('.finance-name');if(name){name.onclick=()=>financeOpenSource(row);name.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();financeOpenSource(row);}};}const file=tr.querySelector('[data-finance-files]')?.cloneNode(true);if(file){file.classList.add('finance-mobile-file');tr.querySelector('.finance-actions')?.prepend(file);}});
 const actionHeading=$('records').querySelector('.finance-table thead th:last-child');if(actionHeading)actionHeading.textContent='Aksi';
 document.querySelectorAll('[data-finance-edit]').forEach(button=>button.onclick=()=>financeOpenSource(rows[Number(button.dataset.financeEdit)]));
 document.querySelectorAll('[data-finance-files]').forEach(button=>button.onclick=()=>financeViewFiles(rows[Number(button.dataset.financeFiles)]));
 document.querySelectorAll('[data-finance-pay]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{await financePayment(rows[Number(button.dataset.financePay)]);}catch(error){toast(error.message);}finally{button.disabled=false;}});
 $('export').onclick=()=>download('keuangan-terintegrasi.csv',C.csv(rows.map(row=>({Nama:row.name,Kategori:row.category,Sumber:financeSource(row),'Rencana biaya':row.amount,Dibayar:C.financePaid(row),Sisa:Math.max(0,row.amount-C.financePaid(row)),Tanggal:row.date}))), 'text/csv;charset=utf-8');
 paginate();polishTables();
}
const drawRowsBeforeFinance=drawRows;drawRows=function(){if(route==='budget'){drawFinanceRows();return;}drawRowsBeforeFinance();};
const dashboardBeforeFinance=dashboardReception;dashboardReception=function(){
 dashboardBeforeFinance();if(route!=='dashboard'||!principal.owner||!ready)return;const section=$('view').querySelector('.reception-dashboard'),list=section?.querySelector('#expense-list');if(!list)return;
 const rows=C.financeRows(db),expenses=C.paidFinanceRows(db);
 list.innerHTML=expenses.map((row,index)=>'<div class="expense-row" data-row-id="'+esc(row.id)+'"><div><strong>'+esc(row.name)+'</strong><small>'+esc(financeSource(row))+'</small></div><div>'+money(C.financePaid(row))+'</div><button class="text-button" data-finance-expense="'+index+'">Detail</button></div>').join('')||'<p class="subtitle empty">Belum ada pengeluaran tercatat.</p>';
 list.querySelectorAll('[data-finance-expense]').forEach(button=>button.onclick=()=>financeOpenSource(expenses[Number(button.dataset.financeExpense)]));
 section.querySelector('.card-head .subtitle').textContent='Pembayaran dan biaya persiapan terintegrasi · penerimaan tamu hadir';
 const totalFiles=rows.reduce((sum,row)=>sum+financeFiles(row).length,0);section.querySelector('.line-stat strong').textContent=numberFormat(totalFiles)+' berkas';paginate();
};
const editBeforeFinance=edit;edit=function(key,record){
 editBeforeFinance(key,record);const form=$('edit-form');if(!form)return;
 if(key==='budget'){
  form.dataset.giftEditor='true';form.dataset.budgetEditor='true';$('modal-body').querySelector(':scope>.subtitle')?.remove();
  const labels={name:'Nama biaya',amount:'Nominal',owner:'Penanggung jawab',notes:'Catatan · opsional'};
  Object.entries(labels).forEach(([field,label])=>{const el=form.querySelector('label[for="field-'+field+'"]');if(el)el.textContent=label;});
  form.querySelector('#field-notes')?.closest('.field')?.classList.remove('full');
  const paidLabel=form.querySelector('.paid-now');if(paidLabel){const checkbox=paidLabel.querySelector('input');paidLabel.replaceChildren(checkbox,document.createTextNode('Sudah dibayar'));}
  const proof=form.querySelector('.new-budget-proof');if(proof){proof.querySelector('small')?.remove();proof.querySelector('[for="new-budget-file"]').textContent='Lampiran · opsional';}
  const upload=$('attachments')?.querySelector('label[for="attachment"]')||form.querySelector('label[for="new-budget-file"]');
  if(upload){upload.classList.add('budget-upload-button');upload.innerHTML=icon('attach')+'<span>Lampiran</span>';upload.setAttribute('role','button');upload.tabIndex=0;upload.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$(upload.htmlFor).click();}};}
  const history=$('modal-body').querySelector('.history');if(history){const details=document.createElement('details');details.className='budget-history';const title=document.createElement('summary');title.textContent='Riwayat pembayaran';history.querySelector('h3')?.remove();details.append(title,history);form.after(details);}
 }

 if(key==='gifts'&&record&&C.can(principal,'budget',false)){
  const row=C.financeRows(db).find(row=>row.sourceKey==='gifts'&&row.sourceId===record.id);if(!row)return;
  const panel=document.createElement('div');panel.className='finance-gift-payments';panel.innerHTML='<span>Pembayaran '+money(C.financePaid(row))+' · Sisa '+money(Math.max(0,row.amount-C.financePaid(row)))+'</span>'+(C.can(principal,'budget',true)?'<button type="button" class="button secondary">'+icon('budget')+'Catat pembayaran</button>':'');
  form.querySelector('.modal-foot').before(panel);const button=panel.querySelector('button');if(button)button.onclick=async()=>{button.disabled=true;try{await financePayment(row);}catch(error){toast(error.message);button.disabled=false;}};
 }
};


var WeddingInvitations=(function(){
 const types=['Fisik','Digital','Fisik & Digital'],sides=['Ardi','Nadia','Bersama'];
 function read(row){let meta;try{meta=JSON.parse(row.notes||'');}catch{}if(meta?.schema==='invitation-v1')return {side:sides.includes(meta.side)?meta.side:'Bersama',type:types.includes(meta.type)?meta.type:'Fisik',physical:meta.physical===true,digital:meta.digital===true,note:String(meta.note||'')};return {side:'Bersama',type:'Belum ditentukan',physical:false,digital:row.deliveryStatus==='Dikirim'||row.deliveryStatus==='Dibuka',note:row.notes||''};}
 function encode(value){if(!types.includes(value.type))throw Error('Pilih jenis undangan.');return JSON.stringify({schema:'invitation-v1',side:sides.includes(value.side)?value.side:'Bersama',type:value.type,physical:value.type!=='Digital'&&!!value.physical,digital:value.type!=='Fisik'&&!!value.digital,note:value.note||''});}
 function delivered(value){return value.type==='Fisik'?value.physical:value.type==='Digital'?value.digital:value.type==='Fisik & Digital'?value.physical&&value.digital:false;}
 function presence(row){let people;try{people=JSON.parse(row.attendanceLedger||'[]');}catch{}return Array.isArray(people)?people.length:0;}
 function rsvp(row){return presence(row)>0?'Hadir':'Belum hadir';}
 function details(row){const meta=read(row);return [['Kelompok',row.group],['Pengundang',meta.side],['Jenis',meta.type],['Alamat',row.address],['WhatsApp',row.contact],['Catatan',meta.note]].filter(([,value])=>String(value||'').trim()).map(([label,value])=>({label,value:String(value)}));}
 function groups(rows){return [...new Set(['Keluarga','Teman','Rekan kerja','Tetangga',...rows.map(row=>String(row.group||'').trim())].filter(Boolean))];}
 function savedMetadata(value){return {...value,physical:value.type!=='Digital'};}
 function channels(value){return [value.type!=='Digital'&&value.type!=='Belum ditentukan'?'Fisik: '+(value.physical?'Diserahkan':'Belum diserahkan'):'',value.type!=='Fisik'?'Digital: '+(value.digital?'Dikirim':'Belum dikirim'):''].filter(Boolean);}
 function dispatch(row){const meta=read(row);if(meta.type==='Belum ditentukan')return meta.digital?'Sudah dikirim':'Belum dikirim';if(delivered(meta))return 'Sudah dikirim';if(meta.physical||meta.digital)return 'Dikirim sebagian';return 'Belum dikirim';}
 function matches(row,filter){if(!filter)return true;if(filter.startsWith('Pihak: '))return read(row).side===filter.slice(7);if(['Belum dikirim','Dikirim sebagian','Sudah dikirim'].includes(filter))return dispatch(row)===filter;return rsvp(row)===filter;}
 function normalized(value){return String(value||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
 function duplicates(rows,draft){const name=normalized(draft.name),address=normalized(draft.address);if(!name)return [];return rows.filter(row=>row.id!==draft.id&&normalized(row.name)===name).map(row=>({row,exact:!!address&&normalized(row.address)===address}));}
 return {types,sides,read,encode,delivered,presence,rsvp,details,groups,savedMetadata,channels,dispatch,matches,duplicates};
})();
if(typeof module!=='undefined')module.exports=WeddingInvitations;

const I=WeddingInvitations;
function invitationGuestRows(){return db.guests.filter(row=>I.matches(row,filter)&&(!search||[row.name,row.group,row.address,row.contact,I.read(row).note,I.read(row).side].join(' ').toLowerCase().includes(search.toLowerCase())));}
function invitationDetails(row){
 if(!row)return;
 const meta=I.read(row),actual=C.attendance(row).length;
 const fields=[{label:'Nama',value:row.name},...I.details(row),{label:'Pengiriman',value:I.channels(meta).join(' · ')},{label:'Kehadiran',value:actual?'Hadir '+numberFormat(actual):'Belum hadir'}];
 if(row.qrTransfer){fields.push({label:'Transfer '+(row.qrTransfer.destination||'BCA'),value:numberFormat(row.qrTransfer.amount)},{label:'Verifikasi transfer',value:row.qrTransfer.status==='verified'?'Sudah diverifikasi':'Menunggu verifikasi'});}
 openModal('Rincian undangan','<dl class="invitation-detail-grid">'+fields.map(item=>'<div class="invitation-detail-field"><dt>'+esc(item.label)+'</dt><dd>'+esc(item.value)+'</dd></div>').join('')+'</dl>'+(row.files||[]).map(file=>'<button type="button" class="button secondary" data-guest-proof="'+esc(file.id)+'">'+icon('attach')+'Lihat '+esc(file.name)+'</button>').join('')+(row.qrTransfer?.status==='pending'&&C.can(principal,'guests',true)?'<div class="field"><label><input type="checkbox" id="transfer-bank-checked"> Saya sudah memeriksa uang masuk di rekening/dompet tujuan</label></div><button class="button" id="confirm-guest-transfer" disabled>Konfirmasi uang diterima</button>':'')+'<div class="modal-foot"><button id="invite-detail-back" class="btn" type="button">Kembali</button></div>');
 if(row.files?.length)document.querySelectorAll('[data-guest-proof]').forEach(button=>button.onclick=()=>openFile('guests',row,button.dataset.guestProof));
 if(row.qrTransfer?.status==='pending'&&C.can(principal,'guests',true)){$('transfer-bank-checked').onchange=()=>{$('confirm-guest-transfer').disabled=!$('transfer-bank-checked').checked;};$('confirm-guest-transfer').onclick=async()=>{const button=$('confirm-guest-transfer');button.disabled=true;try{await save({collection:'guests',id:row.id,version:row.version,action:'confirmTransfer',requestId:uuid()});invitationDetails(db.guests.find(x=>x.id===row.id));}catch(error){toast(error.message);button.disabled=false;}};}
 $('invite-detail-back').onclick=()=>$('modal').close();
}
function drawInvitationRows(){
 const rows=invitationGuestRows();
 $('records').innerHTML=rows.length?'<div class="table-wrap"><table class="table standard-data-table invitation-table compact-invitation-table invitation-summary-table"><thead><tr><th>Nama</th><th>Alamat</th><th>Undangan</th><th>Status</th><th>Aksi</th></tr></thead><tbody>'+rows.map(row=>{
 const meta=I.read(row),actual=C.attendance(row).length,presence=actual?'Hadir '+numberFormat(actual):'Belum hadir';
 const kind=meta.type==='Fisik & Digital'?'Fisik + Digital':meta.type;
 return '<tr data-row-id="'+esc(row.id)+'"><td><button class="invite-name-button" data-invite-view="'+esc(row.id)+'" title="Lihat rincian '+esc(row.name)+'">'+esc(row.name)+'</button></td><td><button class="invite-address-button" data-invite-view="'+esc(row.id)+'" title="'+esc(row.address||'Alamat belum diisi')+'">'+esc(row.address||'—')+'</button></td><td><span class="invite-kind" title="'+esc(meta.type)+'">'+esc(kind)+'</span></td><td><span class="badge '+(actual?'green':'')+'" title="'+esc(presence)+'">'+esc(presence)+'</span></td><td><div class="invitation-actions"><button class="doc-edit-icon" data-invite-view="'+esc(row.id)+'" aria-label="Lihat rincian '+esc(row.name)+'" title="Lihat rincian"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button><button class="doc-edit-icon" data-invite-edit="'+esc(row.id)+'" aria-label="Edit undangan '+esc(row.name)+'" title="Edit undangan">'+icon('edit')+'</button><button class="doc-edit-icon" data-invite-arrival="'+esc(row.id)+'" aria-label="Buku tamu '+esc(row.name)+'" title="Catat kehadiran & pemberian">'+icon('guests')+'</button></div></td></tr>';
 }).join('')+'</tbody></table></div>':'<div class="empty"><p>Belum ada undangan yang sesuai.</p></div>';
 $('records').querySelectorAll('[data-invite-view]').forEach(b=>b.onclick=()=>invitationDetails(db.guests.find(x=>x.id===b.dataset.inviteView)));
 $('records').querySelectorAll('[data-invite-edit]').forEach(b=>b.onclick=()=>edit('guests',db.guests.find(x=>x.id===b.dataset.inviteEdit)));
 $('records').querySelectorAll('[data-invite-arrival]').forEach(b=>b.onclick=()=>receptionModal(db.guests.find(x=>x.id===b.dataset.inviteArrival)));
 $('export').onclick=()=>download('daftar-undangan.csv',C.csv(rows.map(row=>({Nama:row.name,Kelompok:row.group,Alamat:row.address,WhatsApp:row.contact,Jenis:I.read(row).type,Pihak:I.read(row).side,Pengiriman:I.channels(I.read(row)).join('; '),Konfirmasi:I.rsvp(row),'Jumlah konfirmasi':C.attendance(row).length,'Hadir aktual':C.attendance(row).length,Catatan:I.read(row).note}))), 'text/csv;charset=utf-8');
 paginate();polishTables();
}
const guestSummaryBeforeChannels=guestLedgerSummary;guestLedgerSummary=function(){if(route==='guests'&&$('records')?.querySelector('.invitation-table'))return;guestSummaryBeforeChannels();};
const drawBeforeInvitation=drawRows;drawRows=function(){if(route==='guests'){drawInvitationRows();return;}drawBeforeInvitation();};
const listingBeforeInvitation=listing;listing=function(){listingBeforeInvitation();if(route!=='guests')return;const select=$('status-filter');if(select){select.innerHTML=['','Belum hadir','Hadir'].map(v=>'<option value="'+esc(v)+'" '+(v===filter?'selected':'')+'>'+esc(v||'Semua konfirmasi')+'</option>').join('');}drawInvitationRows();};
const editBeforeInvitation=edit;edit=function(key,record){editBeforeInvitation(key,record);if(key!=='guests')return;const form=$('edit-form'),x=record||{},meta=record?I.read(record):{type:'Fisik',physical:false,digital:false,note:''},writable=C.can(principal,key,true),id=x.id||uuid(),requestId=uuid();form.dataset.giftEditor='true';form.dataset.invitationEditor='true';$('modal-title').textContent=record?'Edit undangan':'Tambah undangan';
 const field=(name,label,value,type='text',required=false)=>'<div class="field"><label for="invite-'+name+'">'+label+(required?' *':'')+'</label><input id="invite-'+name+'" name="'+name+'" type="'+type+'" value="'+esc(value??'')+'" '+(required?'required':'')+' '+(type==='number'?'min="0" max="100"':'maxlength="250"')+'></div>';
 const select=(name,label,options,value)=>'<div class="field"><label for="invite-'+name+'">'+label+'</label><select id="invite-'+name+'" name="'+name+'">'+options.map(([v,l])=>'<option value="'+esc(v)+'" '+(v===value?'selected':'')+'>'+esc(l)+'</option>').join('')+'</select></div>';
 form.querySelector('.form-grid').innerHTML=field('name','Nama',x.name,'text',true)+select('group','Kelompok *',[["","Pilih kelompok"],...I.groups(db.guests).map(v=>[v,v]),["__new_group__","+ Tambah kelompok"]],x.group||'')+field('newGroup','Kelompok baru', '', 'text')+select('side','Pihak pengundang',I.sides.map(v=>[v,v]),meta.side||'Bersama')+select('invitationType','Jenis undangan',[["","Pilih jenis undangan"],...I.types.map(v=>[v,v])],meta.type)+field('contact','WhatsApp (opsional)',x.contact)+field('address','Alamat',x.address,'text',true)+field('note','Catatan (opsional)',meta.note)+select('digital','Pengiriman digital',[["0","Belum dikirim"],["1","Sudah dikirim"]],meta.digital?'1':'0');
 form.querySelector('[name="invitationType"]').required=true;
 form.elements.group.required=true;
 const sync=()=>{const t=form.elements.invitationType.value,newGroup=form.elements.group.value==='__new_group__';form.elements.digital.closest('.field').hidden=t==='Fisik'||!t;form.elements.newGroup.closest('.field').hidden=!newGroup;form.elements.newGroup.required=newGroup;form.elements.newGroup.disabled=!newGroup;form.elements.note.closest('.field').classList.toggle('guest-field-full',t==='Fisik'||!t);form.elements.newGroup.closest('.field').classList.add('guest-field-full');};form.elements.invitationType.onchange=sync;form.elements.group.onchange=()=>{sync();if(form.elements.group.value==='__new_group__')form.elements.newGroup.focus();};sync();
 const help=document.createElement('p');help.className='subtitle invitation-help';help.textContent='Undangan fisik otomatis ditandai sudah diserahkan saat disimpan. Kehadiran mengikuti catatan Buku Tamu.';form.querySelector('.form-grid').after(help);
 if(!writable){form.querySelector('fieldset').disabled=true;form.querySelector('[type="submit"]')?.remove();return;}
 form.onsubmit=async e=>{e.preventDefault();for(const k of ['name','newGroup','address'])form.elements[k].value=form.elements[k].value.trim();if(!form.reportValidity())return;const button=form.querySelector('[type="submit"]');button.disabled=true;try{const data=Object.fromEntries(new FormData(form));data.group=data.group==='__new_group__'?data.newGroup.trim():data.group;const metadata=I.savedMetadata({type:data.invitationType,side:data.side,digital:data.digital==='1',note:data.note});data.notes=I.encode(metadata);data.deliveryStatus=I.delivered(metadata)?'Dikirim':'Belum dikirim';data.attending=C.attendance(x).length;data.status=data.attending?'Hadir':'Belum dikirim';data.quota=Math.max(Number(x.quota)||1,data.attending);data.attendanceLedger=x.attendanceLedger||'[]';data.event=x.event||'Resepsi';delete data.newGroup;delete data.side;delete data.invitationType;delete data.physical;delete data.digital;delete data.note;C.validate('guests',{...x,...data});await save({collection:'guests',action:'save',id,version:x.version||0,requestId,data});$('modal').close();}catch(error){$('form-error').textContent=error.message;}finally{button.disabled=false;}};
 const warning=document.createElement('div');warning.className='invitation-duplicate-warning';warning.setAttribute('role','status');form.querySelector('.form-grid').after(warning);const warn=()=>{const matches=I.duplicates(db.guests,{id:x.id,name:form.elements.name.value,address:form.elements.address.value});warning.hidden=!matches.length;warning.textContent=matches.length?(matches.some(m=>m.exact)?'Nama dan alamat ini sudah ada. Periksa agar undangan tidak tercatat dua kali.':'Ada tamu dengan nama yang sama. Periksa alamatnya; Anda tetap bisa menyimpan jika orangnya berbeda.')+' '+matches.map(m=>m.row.name+' — '+(m.row.address||'alamat belum dicatat')).join('; '):'';};form.elements.name.addEventListener('input',warn);form.elements.address.addEventListener('input',warn);warn();
 const attachments=$('attachments');if(attachments)form.querySelector('.modal-foot').before(attachments);const footnote=form.nextElementSibling;if(footnote?.matches('p.subtitle'))footnote.remove();
 accountingInputs();
};

function guestShareMessage(guest,profile,link){const couple=[profile.name,profile.partner].filter(Boolean).join(' & ')||'kami';return 'Yth. '+guest.name+'\n\nKami mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan '+couple+'.\n'+(profile.date?'Tanggal: '+profile.date+'\n':'')+(profile.location?'Tempat: '+profile.location+'\n':'')+(link?'\nUndangan: '+link+'\n':'')+'\nMohon konfirmasi apakah berkenan hadir dan jumlah orang yang akan datang dengan membalas pesan ini.\n\nTerima kasih.';}
function guestWhatsappUrl(contact,message){let phone=String(contact||'').replace(/[\s()+.-]/g,'');if(phone.startsWith('0'))phone='62'+phone.slice(1);if(!/^\d{8,15}$/.test(phone))phone='';return 'https://wa.me/'+phone+'?text='+encodeURIComponent(message);}
if(typeof module!=='undefined')module.exports={guestShareMessage,guestWhatsappUrl};

let guestTab='invitations';
ICONS.whatsapp='M21 11.5a9 9 0 0 1-13.6 7.8L3 21l1.7-4.4A9 9 0 1 1 21 11.5Z M8 7c-2 3 2 7 5 8l2-2-3-2-1 1-2-2 1-1-2-2Z';
function shareGuestInvitation(guest){const message=guestShareMessage(guest,db.profile[0]||{},invitationLink(guest));openModal('Bagikan undangan · '+guest.name,'<div class="field"><label for="guest-share-message">Pesan undangan</label><textarea id="guest-share-message" rows="9">'+esc(message)+'</textarea></div><p class="subtitle invitation-help">WhatsApp membuka draf. Setelah Anda mengirim pesan, tandai status digital “Sudah dikirim” lewat ikon pensil. Tanpa nomor WhatsApp, pilih penerima di WhatsApp.</p><div class="form-actions"><button type="button" class="button secondary" id="guest-share-copy">Salin pesan</button><a class="button" id="guest-share-open" href="'+esc(guestWhatsappUrl(guest.contact,message))+'" target="_blank" rel="noopener noreferrer">'+icon('whatsapp')+'Buka WhatsApp</a></div>');$('guest-share-message').oninput=()=>{$('guest-share-open').href=guestWhatsappUrl(guest.contact,$('guest-share-message').value);};$('guest-share-copy').onclick=()=>copyText($('guest-share-message').value);}

function guestViewProof(guest){const files=guest?.files||[];if(!files.length)return;if(files.length===1){openFile('guests',guest,files[0].id);return;}openModal('Bukti bayar · '+guest.name,'<div class="gift-file-list">'+files.map(file=>'<button type="button" class="button secondary" data-book-proof-file="'+esc(file.id)+'">'+icon('attach')+esc(file.name)+'</button>').join('')+'</div>');document.querySelectorAll('[data-book-proof-file]').forEach(button=>button.onclick=()=>openFile('guests',guest,button.dataset.bookProofFile));}
function guestTransferPanel(guest){const transfer=guest.qrTransfer;if(!transfer)return '';return '<section class="guest-transfer-panel"><div class="guest-transfer-heading"><strong>Kiriman transfer QR</strong><span>'+ (transfer.status==='verified'?'Sudah diverifikasi':'Menunggu verifikasi')+'</span></div><div class="guest-transfer-values"><div><small>Nominal kiriman</small><strong>'+numberFormat(transfer.amount)+'</strong></div><div><small>Via</small><strong>'+esc(transfer.destination||'BCA')+'</strong></div></div></section>';}

function drawGuestBook(){
 const rows=db.guests.filter(row=>{const people=C.attendance(row);return (!filter||(filter==='Sudah hadir'?people.length>0:people.length===0))&&(!search||[row.name,row.group,row.address,...people.map(p=>p.name)].join(' ').toLowerCase().includes(search.toLowerCase()));});
 const t=C.totals(db),metrics=$('view').querySelector('.metrics');if(metrics)metrics.innerHTML=metric('Tamu hadir',numberFormat(t.checkedIn),'Orang yang datang tercatat','guests')+metric('Uang diterima',money(t.guestCash),'Pemberian yang dikonfirmasi','savings')+metric('Pemberi barang',numberFormat(t.guestGoods),'Rincian per tamu','gifts');
 $('records').innerHTML='<div class="table-wrap"><table class="table standard-data-table guestbook-table compact-guestbook-table"><thead><tr>'+['Nama','Alamat','Kelompok','Status','Pemberian','Via','Aksi'].map(v=>'<th>'+v+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>{const people=C.attendance(row),cash=people.reduce((sum,p)=>sum+p.cash,0),goods=people.map(p=>p.name+': '+p.kind+(p.cash?' '+numberFormat(p.cash):'')+(p.goods?' · '+p.goods:'')),hasGoods=people.some(p=>p.goods);return '<tr data-row-id="'+esc(row.id)+'"><td><button class="invite-name-button" data-book-view="'+esc(row.id)+'" title="Lihat rincian '+esc(row.name)+'">'+esc(row.name)+'</button></td><td><button class="invite-address-button" data-book-view="'+esc(row.id)+'" title="'+esc(row.address||'Alamat belum diisi')+'">'+esc(row.address||'—')+'</button></td><td title="'+esc(row.group||'—')+'">'+esc(row.group||'—')+'</td><td><span class="guestbook-presence '+(people.length?'is-present':'')+'">'+(people.length?'Hadir':'Belum hadir')+'</span></td><td title="'+esc(goods.join('; ')||'Belum dicatat')+'"><div class="guestbook-gift-line"><span>'+(row.qrTransfer?.status==='pending'?'<button class="invite-name-button guest-transfer-pending" data-book-view="'+esc(row.id)+'" title="Transfer '+numberFormat(row.qrTransfer.amount)+' via '+esc(row.qrTransfer.destination||'BCA')+' · Menunggu verifikasi">'+numberFormat(row.qrTransfer.amount)+'</button>':cash?numberFormat(cash):'—')+'</span>'+(hasGoods?'<span class="guestbook-goods-icon" role="img" aria-label="Pemberian barang">'+icon('gifts')+'</span>':'')+'</div></td><td class="guest-transfer-via" title="'+esc(row.qrTransfer?.destination||'')+'">'+esc(row.qrTransfer?.destination||'—')+'</td><td><div class="guestbook-row-actions">'+(row.files?.length?'<button type="button" class="doc-edit-icon guest-proof-icon" data-book-proof="'+esc(row.id)+'" aria-label="Buka bukti bayar '+esc(row.name)+'" title="Buka bukti bayar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>':'')+'<button class="doc-edit-icon" data-book-edit="'+esc(row.id)+'" aria-label="Catat buku tamu '+esc(row.name)+'" title="Catat kehadiran & pemberian">'+icon('edit')+'</button></div></td></tr>';}).join('')+'</tbody></table></div>'+(!rows.length?'<div class="empty"><p>'+(search||filter?'Tidak ada tamu yang sesuai.':'Catat tamu yang datang melalui tombol tambah buku tamu.')+'</p></div>':'');
 $('records').querySelectorAll('[data-book-view]').forEach(button=>button.onclick=()=>invitationDetails(db.guests.find(row=>row.id===button.dataset.bookView)));
 $('records').querySelectorAll('[data-book-proof]').forEach(button=>button.onclick=()=>guestViewProof(db.guests.find(row=>row.id===button.dataset.bookProof)));
 $('records').querySelectorAll('[data-book-edit]').forEach(button=>button.onclick=()=>receptionModal(db.guests.find(row=>row.id===button.dataset.bookEdit)));paginate();polishTables();
}
function guestTabControls(){document.querySelector('#view .toolbar')?.classList.add('invitation-toolbar');if(route!=='guests')return;const view=$('view');view.classList.add('compact-guests-view');view.querySelector('#guest-receipt-summary')?.remove();let tabs=$('guest-feature-tabs');if(!tabs){tabs=document.createElement('div');tabs.id='guest-feature-tabs';tabs.className='guest-feature-tabs';const before=view.querySelector('.metrics')||view.firstChild;view.insertBefore(tabs,before);}const head=view.querySelector('.page-head')||document.querySelector('.topbar>.page-head');if(head){const title=head.querySelector('h1');if(title){title.hidden=true;title.parentElement.append(tabs);head.classList.add('guest-header');}}tabs.innerHTML=[['invitations','Daftar Undangan'],['book','Buku Tamu']].map(([value,label])=>'<button type="button" data-guest-tab="'+value+'" class="'+(guestTab===value?'selected':'')+'">'+icon(value==='book'?'guests':'guests')+label+'</button>').join('');tabs.querySelectorAll('button').forEach(button=>button.onclick=()=>{guestTab=button.dataset.guestTab;search='';filter='';pageSettings.guests={size:10,page:1};listing();singleHeader();guestTabControls();});const select=$('status-filter');if(select){const options=guestTab==='book'?['','Sudah hadir','Belum hadir']:['','Belum dikirim','Dikirim sebagian','Sudah dikirim','Belum hadir','Hadir',...I.sides.map(v=>'Pihak: '+v)];select.innerHTML=options.map(value=>'<option value="'+esc(value)+'" '+(value===filter?'selected':'')+'>'+esc(value||'Semua')+'</option>').join('');select.setAttribute('aria-label',guestTab==='book'?'Filter kehadiran':'Filter undangan');}if($('export'))$('export').hidden=guestTab==='book';if($('search'))$('search').placeholder=guestTab==='book'?'Cari nama tamu yang datang…':'Cari daftar undangan…';const add=$('add-record');if(add){add.innerHTML=icon('plus')+(guestTab==='book'?'Tambah tamu':'Tambah undangan');add.onclick=()=>edit('guests');}}
const drawInvitationsBeforeTabs=drawInvitationRows;drawInvitationRows=function(){guestTabControls();if(guestTab==='book'){drawGuestBook();return;}drawInvitationsBeforeTabs();$('records').querySelectorAll('[data-invite-arrival]').forEach(button=>{const guest=db.guests.find(row=>row.id===button.dataset.inviteArrival);button.innerHTML=icon('whatsapp');button.title='Bagikan ke WhatsApp';button.setAttribute('aria-label','Bagikan undangan '+guest.name+' ke WhatsApp');button.onclick=()=>shareGuestInvitation(guest);});};
guestLedgerSummary=function(){if(route!=='guests')guestSummaryBeforeChannels();};
const listingBeforeGuestTabs=listing;listing=function(){listingBeforeGuestTabs();if(route==='guests')drawInvitationRows();};
function newGuestBookEntry(){
 if(!C.can(principal,'guests',true))return;const id=uuid(),requestId=uuid(),personId=uuid();
 openModal('Tambah tamu & pemberian','<form id="book-entry-form"><div class="form-grid"><div class="field full"><label for="book-existing">Pakai undangan yang sudah ada (opsional)</label><select id="book-existing"><option value="">Tamu baru / belum terdaftar</option>'+db.guests.map(row=>'<option value="'+esc(row.id)+'">'+esc(row.name)+' · '+esc(row.group)+'</option>').join('')+'</select></div><div class="field"><label for="book-name">Nama tamu *</label><input id="book-name" name="name" maxlength="250" required></div><div class="field"><label for="book-group">Kelompok *</label><input id="book-group" name="group" value="Tamu langsung" maxlength="250" required></div><div class="field"><label for="book-address">Alamat *</label><input id="book-address" name="address" maxlength="250" required></div><div class="field"><label for="book-kind">Pemberian *</label><select id="book-kind" name="kind" required><option value="">Pilih pemberian</option>'+['Uang','Barang','Uang & barang','Tidak memberi'].map(kind=>'<option>'+kind+'</option>').join('')+'</select></div><div class="field" id="book-cash-field" hidden><label for="book-cash">Nominal uang *</label><input id="book-cash" name="cash" type="number" min="1" max="1000000000000" step="1"></div><div class="field" id="book-goods-field" hidden><label for="book-goods">Barang & jumlah *</label><textarea id="book-goods" name="goods" maxlength="3000" rows="2" placeholder="Contoh: 1 set gelas"></textarea></div></div><p class="subtitle invitation-help">Simpan untuk mencatat tamu ini sudah datang beserta pemberiannya. Untuk tamu yang sudah ada, pilih undangannya di atas agar tidak membuat data ganda.</p><div id="book-entry-error" role="alert"></div><div class="modal-foot"><button class="button" type="submit">'+icon('check')+'Simpan</button></div></form>');
 const form=$('book-entry-form');$('book-existing').onchange=()=>{const row=db.guests.find(row=>row.id===$('book-existing').value);if(row)receptionModal(row);};$('book-kind').onchange=()=>{const cash=['Uang','Uang & barang'].includes($('book-kind').value),goods=['Barang','Uang & barang'].includes($('book-kind').value);$('book-cash-field').hidden=!cash;$('book-goods-field').hidden=!goods;$('book-cash').required=cash;$('book-goods').required=goods;if(!cash){$('book-cash').value='';$('book-cash').setCustomValidity('');}if(!goods)$('book-goods').value='';};
 form.onsubmit=async event=>{event.preventDefault();for(const key of ['name','group','address'])form.elements[key].value=form.elements[key].value.trim();if(!form.reportValidity())return;const button=form.querySelector('[type="submit"]');button.disabled=true;try{const values=Object.fromEntries(new FormData(form)),person={id:personId,name:values.name.trim(),kind:values.kind,cash:Number(String(values.cash||'0').replace(/\./g,'')),goods:String(values.goods||'').trim()};const data={name:person.name,group:values.group.trim(),address:values.address.trim(),event:'Resepsi',quota:1,attending:1,status:'Hadir',deliveryStatus:'Belum dikirim',contact:'',notes:'Tamu datang langsung; dicatat melalui Buku Tamu.',attendanceLedger:JSON.stringify([person])};C.validate('guests',data);await save({collection:'guests',action:'save',id,version:0,requestId,data});$('modal').close();}catch(error){$('book-entry-error').textContent=error.message;}finally{button.disabled=false;}};accountingInputs();
}
const editBeforeBookRoute=edit;edit=function(key,record){if(key==='guests'&&guestTab==='book'){if(record)receptionModal(record);else newGuestBookEntry();return;}editBeforeBookRoute(key,record);};


var WeddingTimeline=(function(){
 const groups=['Umum','Peta Persiapan','Seserahan & Mahar','Undangan','Vendor & Venue','Keuangan','Acara'];
 function read(row){let m;try{m=JSON.parse(row.notes||'');}catch{}return m?.schema==='timeline-v1'?{...m,subtasks:Array.isArray(m.subtasks)?m.subtasks:[],dependencies:Array.isArray(m.dependencies)?m.dependencies:[]}:{schema:'timeline-v1',group:'Umum',mode:'manual',days:0,reminder:3,source:'',subtasks:[],dependencies:[],note:row.notes||''};}
 function date(row,eventDate){const m=read(row);if(m.mode!=='relative')return row.date||'';if(!/^\d{4}-\d{2}-\d{2}$/.test(eventDate||''))return '';const d=new Date(eventDate+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-Number(m.days||0));return d.toISOString().slice(0,10);}
 function remaining(row,eventDate,today){const d=date(row,eventDate);return d?Math.round((Date.parse(d+'T12:00:00Z')-Date.parse(today+'T12:00:00Z'))/86400000):null;}
 function blocked(row,rows){return read(row).dependencies.filter(id=>!rows.some(x=>x.id===id&&['Selesai','Tidak berlaku'].includes(x.status)));}
 function encode(meta,id,rows){if(meta.cost!=null&&(!Number.isSafeInteger(meta.cost)||meta.cost<0||meta.cost>1000000000000))throw Error('Isi biaya berupa angka bulat antara 0 dan 1.000.000.000.000.');if(meta.contact&&(!/^[+\d ().-]{8,30}$/.test(meta.contact)||!/^\d{8,15}$/.test(meta.contact.replace(/\D/g,''))))throw Error('Isi nomor WhatsApp yang valid atau kosongkan.');if(!groups.includes(meta.group))throw Error('Kelompok tugas tidak valid.');if(!['manual','relative'].includes(meta.mode)||!Number.isSafeInteger(meta.days)||meta.days<0||meta.days>3650)throw Error('Isi H-hari antara 0 dan 3.650.');if(![-1,0,1,3,7,14].includes(meta.reminder))throw Error('Pengingat tidak valid.');if(meta.subtasks.length>20||meta.subtasks.some(x=>!x.name.trim()||x.name.length>100))throw Error('Maksimal 20 subtugas, masing-masing 100 karakter.');const visit=(target,seen)=>{if(target===id)throw Error('Ketergantungan tugas membentuk lingkaran.');if(seen.has(target))return;seen.add(target);const row=rows.find(x=>x.id===target);if(!row)throw Error('Tugas pendahulu tidak ditemukan.');read(row).dependencies.forEach(next=>visit(next,seen));};meta.dependencies.forEach(target=>visit(target,new Set()));const json=JSON.stringify({...meta,schema:'timeline-v1'});if(json.length>3000)throw Error('Catatan dan subtugas terlalu panjang. Ringkas isinya.');return json;}
 function checkComplete(row,rows){const m=read(row);if(blocked(row,rows).length)throw Error('Selesaikan tugas pendahulu terlebih dahulu.');if(m.subtasks.some(x=>!x.done))throw Error('Selesaikan seluruh subtugas terlebih dahulu.');}
 function reminders(rows,eventDate,today){return rows.filter(row=>{const m=read(row),n=remaining(row,eventDate,today);return !['Selesai','Tidak berlaku'].includes(row.status)&&m.reminder>=0&&n!==null&&n<=m.reminder;}).sort((a,b)=>date(a,eventDate).localeCompare(date(b,eventDate)));}
 function assignmentMessage(row,eventDate){const m=read(row),d=date(row,eventDate);return 'Halo '+(row.owner||'tim')+',\n\nMohon bantu mengerjakan tugas persiapan pernikahan berikut:\n\nTugas: '+row.name+'\nPenanggung jawab: '+(row.owner||'Belum ditentukan')+'\nBatas waktu: '+(d||'Belum ditentukan')+'\nPrioritas: '+(row.priority||'Normal')+'\nStatus: '+row.status+(m.subtasks.length?'\n\nSubtugas:\n'+m.subtasks.map(s=>(s.done?'✓ ':'• ')+s.name).join('\n'):'')+(m.note?'\n\nCatatan: '+m.note:'')+'\n\nMohon konfirmasi kesediaannya dan kabari setelah tugas selesai. Terima kasih.';}
 return {groups,read,date,remaining,blocked,encode,checkComplete,reminders,assignmentMessage};
})();
if(typeof module!=='undefined')module.exports=WeddingTimeline;

const T=WeddingTimeline;let taskScope='',taskOwner='',taskGroup='';
function taskDates(){return db.tasks.map(row=>({...row,date:T.date(row,db.profile[0]?.date),notes:T.read(row).note}));}
function timelineRows(){const today=localToday();return db.tasks.filter(row=>{const m=T.read(row),days=T.remaining(row,db.profile[0]?.date,today),active=!['Selesai','Tidak berlaku'].includes(row.status);return (!filter||row.status===filter)&&(!taskOwner||row.owner===taskOwner)&&(!taskGroup||m.group===taskGroup)&&(!taskScope||(taskScope==='today'?active&&days===0:taskScope==='week'?active&&days!==null&&days>=0&&days<=7:taskScope==='late'?active&&days!==null&&days<0:T.blocked(row,db.tasks).length>0))&&(!search||[row.name,row.owner,m.group,m.note,...m.subtasks.map(s=>s.name)].join(' ').toLowerCase().includes(search.toLowerCase()));}).sort((a,b)=>(T.date(a,db.profile[0]?.date)||'9999').localeCompare(T.date(b,db.profile[0]?.date)||'9999'));}
function timelineOpenSource(source){const [key,id]=source.split(':');if(!C.can(principal,key,false)){toast('Anda tidak memiliki akses ke data asal.');return;}const row=db[key]?.find(x=>x.id===id);if(!row){toast('Data asal sudah tidak tersedia.');return;}go(key);edit(key,row);}
function timelineDraw(){const rows=timelineRows();$('records').innerHTML='<div class="table-wrap"><table class="table standard-data-table timeline-table"><thead><tr>'+['Tugas','Tenggat','Penanggung jawab','Status','Catatan','Biaya',''].map(label=>'<th>'+label+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>{const m=T.read(row),d=T.date(row,db.profile[0]?.date),days=T.remaining(row,db.profile[0]?.date,localToday()),late=days!==null&&days<0&&!['Selesai','Tidak berlaku'].includes(row.status),blocked=T.blocked(row,db.tasks).length;return '<tr data-row-id="'+esc(row.id)+'"><td><strong>'+esc(row.name)+'</strong>'+(m.group&&m.group!=='Umum'?'<small>'+esc(m.group)+'</small>':'')+'<small class="task-mobile-owner">'+esc(row.owner||'Belum ada PIC')+'</small>'+(m.note?'<small class="task-mobile-note">'+esc(m.note)+'</small>':'')+'</td><td>'+esc(d?prettyDate(d):'Belum ditentukan')+'</td><td>'+esc(row.owner||'Belum ada PIC')+'</td><td>'+'<span title="'+esc([late?'Lewat '+(-days)+' hari':'',blocked?'Menunggu '+blocked+' tugas':''].filter(Boolean).join(' · '))+'">'+badge(row.status)+((late||blocked)?'<span class="task-warning" aria-label="'+esc(late?'Terlambat':'Menunggu tugas pendahulu')+'">!</span>':'')+'</span>'+'</td><td class="task-note-cell" title="'+esc(m.note||'')+'">'+esc(m.note||'—')+'</td><td class="task-cost-cell">'+timelineCostDisplay(row)+'</td><td><div class="timeline-actions">'+(m.source?'<button class="doc-edit-icon" data-task-source="'+esc(row.id)+'" aria-label="Buka data asal '+esc(row.name)+'">'+icon('link')+'</button>':'')+'<button class="doc-edit-icon" data-task-share="'+esc(row.id)+'" aria-label="Bagikan tugas '+esc(row.name)+' ke WhatsApp">'+icon('whatsapp')+'</button><button class="doc-edit-icon" data-task-edit="'+esc(row.id)+'" aria-label="Edit tugas '+esc(row.name)+'">'+icon('edit')+'</button></div></td></tr>';}).join('')+'</tbody></table></div>'+(!rows.length?'<div class="empty"><p>Belum ada tugas yang sesuai. Gunakan ikon panduan untuk menambahkan rencana persiapan.</p></div>':'');$('records').querySelectorAll('[data-task-edit]').forEach(b=>b.onclick=()=>edit('tasks',db.tasks.find(x=>x.id===b.dataset.taskEdit)));$('records').querySelectorAll('[data-task-source]').forEach(b=>b.onclick=()=>timelineOpenSource(T.read(db.tasks.find(x=>x.id===b.dataset.taskSource)).source));$('records').querySelectorAll('[data-task-share]').forEach(b=>b.onclick=()=>timelineShare(db.tasks.find(x=>x.id===b.dataset.taskShare)));paginate();polishTables();}
function timelinePage(){const mod=C.modules.tasks,applicable=db.tasks.filter(r=>r.status!=='Tidak berlaku'),done=applicable.filter(r=>r.status==='Selesai').length,pct=applicable.length?Math.round(done/applicable.length*100):0,late=db.tasks.filter(r=>!['Selesai','Tidak berlaku'].includes(r.status)&&T.remaining(r,db.profile[0]?.date,localToday())!==null&&T.remaining(r,db.profile[0]?.date,localToday())<0).length;
 $('view').innerHTML=pageHead(mod.title,'','<button class="button" id="add-record">'+icon('plus')+'Tambah tugas</button>')+'<section class="timeline-progress"><strong>'+pct+'%</strong><div><span>'+done+' dari '+applicable.length+' tugas selesai</span><div class="progress"><i style="width:'+pct+'%"></i></div></div><span>'+late+' terlambat</span></section><div class="toolbar timeline-toolbar"><div class="search">'+icon('search')+'<input id="search" aria-label="Cari catatan" placeholder="Cari tugas…" value="'+esc(search)+'"></div>'+timelineFilterControl()+'<button class="doc-edit-icon" id="export" aria-label="Ekspor CSV">'+icon('download')+'</button><button class="doc-edit-icon" id="task-plan" aria-label="Panduan persiapan">'+icon('tasks')+'</button></div><section class="card" id="records"></section>';
 $('add-record').onclick=()=>edit('tasks');$('search').oninput=e=>{search=e.target.value;timelineDraw();};$('task-filter').onchange=e=>{filter='';taskScope='';taskOwner='';taskGroup='';const selected=JSON.parse(e.target.value||'[]'),[kind,value]=selected;if(kind==='status')filter=value;else if(kind==='scope')taskScope=value;else if(kind==='owner')taskOwner=value;else if(kind==='group')taskGroup=value;timelineDraw();};$('task-plan').onclick=planningModal;if($('task-calendar'))$('task-calendar').onclick=()=>download('persiapan-nikah.ics',W.ics(taskDates()),'text/calendar;charset=utf-8');$('export').onclick=()=>download('timeline.csv',C.csv(timelineRows().map(row=>({Tugas:row.name,Kelompok:T.read(row).group,Tenggat:T.date(row,db.profile[0]?.date),PIC:row.owner,Status:row.status,Catatan:T.read(row).note,Biaya:timelineCostRow(row)?.amount??'',Dibayar:timelineCostRow(row)?C.financePaid(timelineCostRow(row)):0}))), 'text/csv;charset=utf-8');timelineDraw();}
const listingBeforeTimeline=listing;listing=function(){if(route==='tasks'){timelinePage();return;}listingBeforeTimeline();};const drawBeforeTimeline=drawRows;drawRows=function(){if(route==='tasks'){timelineDraw();return;}drawBeforeTimeline();};
const saveBeforeTimeline=save;save=async function(req){if(req.collection==='tasks'&&req.action==='save'&&req.data?.status==='Selesai')T.checkComplete({...db.tasks.find(x=>x.id===req.id),...req.data},db.tasks);return saveBeforeTimeline(req);};
const editBeforeTimeline=edit;edit=function(key,record){editBeforeTimeline(key,record);if(key!=='tasks')return;const form=$('edit-form'),row=record||{},m=T.read(row),id=row.id||uuid(),requestId=uuid();form.dataset.giftEditor='true';$('modal-body').querySelector(':scope>.subtitle')?.remove();$('modal-title').textContent=record?'Edit tugas':'Tambah tugas';const select=(name,label,options,value)=>'<div class="field"><label for="tl-'+name+'">'+label+'</label><select id="tl-'+name+'" name="'+name+'">'+options.map(([v,l])=>'<option value="'+esc(v)+'" '+(v===value?'selected':'')+'>'+esc(l)+'</option>').join('')+'</select></div>',input=(name,label,value,type='text')=>'<div class="field"><label for="tl-'+name+'">'+label+'</label><input id="tl-'+name+'" name="'+name+'" type="'+type+'" value="'+esc(value??'')+'" '+(type==='number'?'min="0" max="3650" step="1"':'maxlength="900"')+'></div>',sources=['admin','gifts','guests','vendors','budget','rundown'].filter(k=>C.can(principal,k,false)).flatMap(k=>db[k].map(r=>[k+':'+r.id,C.modules[k].title+' · '+r.name]));
 form.querySelector('.form-grid').innerHTML=input('name','Tugas *',row.name)+select('group','Kelompok',T.groups.map(v=>[v,v]),m.group)+select('owner','Penanggung jawab',[['','Pilih PIC'],...[...new Set(['Ardi','Nadia',row.owner,...db.users.map(r=>r.name),...db.tasks.map(r=>r.owner)].filter(Boolean))].map(v=>[v,v]),['__new','+ Tambahkan nama']],row.owner||'')+input('contact','WhatsApp PIC (opsional)',m.contact||'','tel')+select('priority','Prioritas',[['Normal','Normal'],['Tinggi','Tinggi']],row.priority||'Normal')+select('mode','Jenis tenggat',[['manual','Tanggal manual'],['relative','H-hari pernikahan']],m.mode)+input('date','Tanggal',row.date,'date')+input('days','Berapa hari sebelum acara',m.days||0,'number')+select('reminder','Pengingat dalam aplikasi',[[-1,'Tidak diingatkan'],[0,'Hari tenggat'],[1,'H-1 tenggat'],[3,'H-3 tenggat'],[7,'H-7 tenggat'],[14,'H-14 tenggat']].map(([v,l])=>[String(v),l]),String(m.reminder??3))+select('status','Status',C.statuses.tasks.map(v=>[v,v]),row.status||'Belum mulai')+'<div class="field"><label for="tl-cost">Biaya tugas (opsional)</label><input id="tl-cost" name="cost" type="number" min="0" max="1000000000000" step="1" value="'+esc(m.cost??'')+'"></div>'+select('source','Data asal (opsional)',[['','Tidak dihubungkan'],...sources],m.source||'')+'<div class="field full"><label for="tl-dependencies">Menunggu tugas (opsional)</label><select id="tl-dependencies" multiple size="2">'+db.tasks.filter(r=>r.id!==id).map(r=>'<option value="'+esc(r.id)+'" '+(m.dependencies.includes(r.id)?'selected':'')+'>'+esc(r.name)+' · '+esc(r.status)+'</option>').join('')+'</select><small>Pilih tugas pendahulu. Ketuk untuk memilih; Ctrl/Cmd untuk beberapa tugas di komputer.</small></div>'+'<div class="field full"><label for="tl-note">Catatan</label><textarea id="tl-note" name="note" maxlength="900" rows="2">'+esc(m.note||'')+'</textarea></div><div class="field full"><label>Subtugas</label><div id="tl-subtasks"></div><button class="button secondary" type="button" id="tl-add-subtask">'+icon('plus')+'Tambah subtugas</button></div><p class="subtitle field full" id="tl-hint"></p>';
 form.elements.name.required=true;form.elements.contact.maxLength=30;let subtasks=m.subtasks.map(s=>({...s}));const collect=()=>subtasks=[...$('tl-subtasks').querySelectorAll('.tl-subtask')].map(el=>({name:el.querySelector('input[type="text"]').value.trim(),done:el.querySelector('input[type="checkbox"]').checked}));const paint=()=>{$('tl-subtasks').innerHTML=subtasks.map((s,i)=>'<div class="tl-subtask"><input type="checkbox" aria-label="Subtugas '+(i+1)+' selesai" '+(s.done?'checked':'')+'><input type="text" aria-label="Nama subtugas '+(i+1)+'" value="'+esc(s.name)+'" maxlength="100" required><button type="button" data-subtask-remove="'+i+'" aria-label="Hapus subtugas '+(i+1)+'">×</button></div>').join('');$('tl-subtasks').querySelectorAll('[data-subtask-remove]').forEach(b=>b.onclick=()=>{collect();subtasks.splice(Number(b.dataset.subtaskRemove),1);paint();});};paint();$('tl-add-subtask').onclick=()=>{collect();if(subtasks.length>=20){toast('Maksimal 20 subtugas.');return;}subtasks.push({name:'',done:false});paint();};
 const hint=()=>{const relative=form.elements.mode.value==='relative';form.elements.days.closest('.field').hidden=!relative;form.elements.date.closest('.field').hidden=relative;const date=T.date({date:form.elements.date.value,notes:JSON.stringify({schema:'timeline-v1',mode:form.elements.mode.value,days:Number(form.elements.days.value.replace(/\./g,''))})},db.profile[0]?.date);$('tl-hint').textContent=(relative?'Tenggat: '+(date?prettyDate(date):'Atur tanggal pernikahan dahulu')+'. ':'')+(form.elements.source.value?'Data asal bisa dibuka dari ikon tautan pada tabel. Status tugas diselesaikan setelah pekerjaan diperiksa. Biaya tugas hanya untuk biaya tambahan; jangan isi ulang biaya yang sudah tercatat di data asal.':'');};form.elements.mode.onchange=hint;form.elements.days.oninput=hint;form.elements.source.onchange=()=>{const [key,sourceId]=form.elements.source.value.split(':');const source=db[key]?.find(r=>r.id===sourceId);if(source){const group={admin:'Peta Persiapan',gifts:'Seserahan & Mahar',guests:'Undangan',vendors:'Vendor & Venue',budget:'Keuangan',rundown:'Acara'}[key];if(group)form.elements.group.value=group;if(!form.elements.name.value.trim())form.elements.name.value=source.name;if(!form.elements.owner.value&&source.owner){if(![...form.elements.owner.options].some(o=>o.value===source.owner))form.elements.owner.add(new Option(source.owner,source.owner));form.elements.owner.value=source.owner;}}hint();};hint();form.elements.owner.onchange=()=>{if(form.elements.owner.value!=='__new')return;const name=prompt('Nama penanggung jawab baru:');if(name?.trim()){const option=new Option(name.trim(),name.trim(),true,true);form.elements.owner.add(option);}else form.elements.owner.value=row.owner||'';};
 if(record&&C.can(principal,'budget',false)){const costRow=timelineCostRow(record);if(costRow){const panel=document.createElement('div');panel.className='finance-gift-payments';panel.innerHTML='<span>Biaya '+money(costRow.amount)+' · Dibayar '+money(C.financePaid(costRow))+'</span>'+(C.can(principal,'budget',true)?'<button type="button" class="button secondary" id="tl-payment">'+icon('budget')+'Catat pembayaran</button>':'');form.querySelector('.modal-foot').before(panel);const b=panel.querySelector('button');if(b)b.onclick=async()=>{b.disabled=true;try{await financePayment(costRow);}catch(error){toast(error.message);b.disabled=false;}};}}
 if(!C.can(principal,key,true)){form.querySelector('fieldset').disabled=true;form.querySelector('[type="submit"]')?.remove();return;}
 form.onsubmit=async event=>{event.preventDefault();collect();form.elements.name.value=form.elements.name.value.trim();if(!form.reportValidity())return;const button=form.querySelector('[type="submit"]');button.disabled=true;try{const v=Object.fromEntries(new FormData(form)),meta={schema:'timeline-v1',group:v.group,mode:v.mode,days:Number(v.days.replace(/\./g,'')),reminder:Number(v.reminder),source:v.source,subtasks,dependencies:[...$('tl-dependencies').selectedOptions].map(o=>o.value),note:v.note.trim(),contact:v.contact.trim(),cost:v.cost.trim()===''?null:Number(v.cost.replace(/\./g,''))};if(meta.mode==='relative'&&!db.profile[0]?.date)throw Error('Atur tanggal pernikahan sebelum memakai H-hari.');const notes=T.encode(meta,id,db.tasks),data={name:v.name,owner:v.owner,priority:v.priority,status:v.status,date:T.date({date:v.date,notes},db.profile[0]?.date),notes};if(data.status==='Selesai')T.checkComplete({...data,id},db.tasks);C.validate('tasks',data);await save({collection:'tasks',id,version:row.version||0,action:'save',requestId,data});$('modal').close();}catch(error){$('form-error').textContent=error.message;}finally{button.disabled=false;}};accountingInputs();};
function timelineReminders(){if(!ready||!C.can(principal,'tasks',false))return;const top=document.querySelector('.topright');if(!top)return;let button=$('timeline-reminders');if(!button){button=document.createElement('button');button.id='timeline-reminders';button.className='doc-edit-icon';top.prepend(button);}const rows=T.reminders(db.tasks,db.profile[0]?.date,localToday());button.innerHTML=icon('clock')+(rows.length?'<sup>'+rows.length+'</sup>':'');button.title='Pengingat tugas';button.setAttribute('aria-label','Pengingat tugas: '+rows.length);button.onclick=()=>{openModal('Pengingat tugas','<p class="subtitle">Tugas mendekati tenggat dan terlambat. Pengingat diperbarui saat aplikasi dibuka.</p><div class="timeline-reminder-list">'+rows.map((r,i)=>'<button class="workflow-result" data-reminder="'+i+'"><strong>'+esc(r.name)+'</strong><small>'+esc(prettyDate(T.date(r,db.profile[0]?.date)))+' · '+esc(r.owner||'Belum ada PIC')+'</small></button>').join('')+(!rows.length?'<p class="subtitle">Tidak ada tugas yang perlu diingatkan saat ini.</p>':'')+'</div>');document.querySelectorAll('[data-reminder]').forEach(b=>b.onclick=()=>{const row=rows[Number(b.dataset.reminder)];go('tasks');edit('tasks',row);});};}
const renderBeforeTimeline=render;render=function(){renderBeforeTimeline();if(route==='tasks'){$('view').querySelectorAll('.toolbar>button').forEach(b=>{if(!['export','task-plan','task-calendar'].includes(b.id))b.remove();});}timelineReminders();};

const planRowsBeforeTimeline=W.planRows;W.planRows=function(date){const groups=['Umum','Undangan','Vendor & Venue','Vendor & Venue','Peta Persiapan','Seserahan & Mahar','Undangan','Acara','Keuangan','Acara'];return planRowsBeforeTimeline(date).map((row,i)=>({...row,notes:T.encode({schema:'timeline-v1',group:groups[i],mode:'relative',days:Number(row.notes.match(/H-(\d+)/)?.[1]||0),reminder:3,source:'',subtasks:[],dependencies:[],note:''},row.id,[])}));};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)timelineReminders();});setInterval(timelineReminders,60000);

function timelineShare(row){if(!row)return;const m=T.read(row),message=T.assignmentMessage(row,db.profile[0]?.date);openModal('Bagikan tugas','<div class="field"><label for="task-share-contact">WhatsApp penanggung jawab (opsional)</label><input id="task-share-contact" type="tel" maxlength="30" placeholder="08…" value="'+esc(m.contact||'')+'"></div><div class="field"><label for="task-share-message">Rincian tugas</label><textarea id="task-share-message" rows="9">'+esc(message)+'</textarea></div><p class="subtitle">Periksa pesan dan pilih penerima di WhatsApp. Pesan tidak dikirim otomatis; status tugas tetap diperbarui lewat ikon pensil.</p><div class="form-actions"><button type="button" class="button secondary" id="task-share-copy">Salin pesan</button><a class="button" id="task-share-open" href="'+esc(guestWhatsappUrl(m.contact,message))+'" target="_blank" rel="noopener noreferrer">'+icon('whatsapp')+'Buka WhatsApp</a></div>');const update=()=>$('task-share-open').href=guestWhatsappUrl($('task-share-contact').value,$('task-share-message').value);$('task-share-contact').oninput=update;$('task-share-message').oninput=update;$('task-share-copy').onclick=()=>copyText($('task-share-message').value);}

function timelineCostRow(row){return C.financeRows(db).find(r=>r.sourceKey==='tasks'&&r.sourceId===row.id);}
function timelineCostDisplay(row){const cost=timelineCostRow(row);if(!cost)return '—';const paid=C.financePaid(cost);return '<span title="'+esc('Dibayar '+money(paid)+' · Sisa '+money(Math.max(0,cost.amount-paid)))+'">'+numberFormat(cost.amount)+'</span><small>'+(paid>=cost.amount?'Lunas':paid>0?'DP / sebagian':'Belum dibayar')+'</small>';}

function timelineFilterControl(){const current=filter?['status',filter]:taskScope?['scope',taskScope]:taskOwner?['owner',taskOwner]:taskGroup?['group',taskGroup]:[];const selected=JSON.stringify(current),options=(kind,rows)=>rows.map(([value,label])=>{const encoded=JSON.stringify([kind,value]);return '<option value="'+esc(encoded)+'" '+(selected===encoded?'selected':'')+'>'+esc(label)+'</option>';}).join('');return '<select id="task-filter" aria-label="Filter tugas"><option value="[]">Semua tugas</option><optgroup label="Status">'+options('status',C.statuses.tasks.map(v=>[v,v]))+'</optgroup><optgroup label="Tenggat">'+options('scope',[['today','Hari ini'],['week','7 hari ke depan'],['late','Terlambat'],['blocked','Menunggu tugas']])+'</optgroup><optgroup label="Penanggung jawab">'+options('owner',[...new Set(['Ardi','Nadia',...db.users.map(r=>r.name),...db.tasks.map(r=>r.owner)].filter(Boolean))].map(v=>[v,v]))+'</optgroup><optgroup label="Kelompok">'+options('group',T.groups.map(v=>[v,v]))+'</optgroup></select>';}


//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (typeof define === 'function' && define.amd) {
      define([], factory);
  } else if (typeof exports === 'object') {
      module.exports = factory();
  }
}(function () {
    return qrcode;
}));

// QR is generated locally. Its public form can only register a new arrival.
async function guestQrModal(){
 try{
  const qr=await rpc('getGuestCheckin');
  openModal('QR Buku Tamu','<div class="guest-qr-panel">'+(qr.enabled?'<div id="guest-qr-image" aria-label="QR untuk mencatat kehadiran tamu"></div><p>Pindai untuk mengisi nama, alamat, dan nomor HP.</p><small>Aktif sampai dinonaktifkan oleh akun utama.</small><div class="form-actions"><button class="button secondary" id="guest-qr-copy">Salin tautan</button><a class="button secondary" href="'+esc(qr.url+'&preview=1')+'" target="_blank" rel="noopener noreferrer">Lihat form</a></div>':'<p>QR untuk tamu yang datang langsung belum aktif.</p><p class="subtitle">Form ini tidak menampilkan daftar tamu. Pemberian dicatat panitia setelah tamu mengisi kehadiran.</p>')+(principal.owner?'<button class="button '+(qr.enabled?'secondary':'')+'" id="guest-qr-toggle">'+(qr.enabled?'Nonaktifkan QR':'Aktifkan QR')+'</button>':'')+'<div id="guest-qr-error" role="alert"></div></div>');
  if(qr.enabled){const code=qrcode(0,'M');code.addData(qr.url);code.make();$('guest-qr-image').innerHTML=code.createSvgTag({cellSize:5,margin:20,scalable:true});$('guest-qr-copy').onclick=()=>copyText(qr.url);}
  if($('guest-qr-toggle'))$('guest-qr-toggle').onclick=async()=>{const button=$('guest-qr-toggle');button.disabled=true;try{await rpc('setGuestCheckin',{enabled:!qr.enabled,requestId:uuid()});await guestQrModal();}catch(error){$('guest-qr-error').textContent=error.message;button.disabled=false;}};
 }catch(error){toast(error.message||'QR belum tersedia.');}
}
const guestControlsBeforeQr=guestTabControls;
guestTabControls=function(){guestControlsBeforeQr();if(route!=='guests')return;let button=$('guest-qr-button');if(guestTab!=='book'){button?.remove();return;}if(!button){button=document.createElement('button');button.id='guest-qr-button';button.className='doc-edit-icon';button.type='button';button.setAttribute('aria-label','QR untuk tamu datang langsung');button.title='QR Buku Tamu';button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h-3zM21 14v7h-7M12 3v3M3 12h3M12 9v6M9 12h6"/></svg>';button.onclick=guestQrModal;const searchInput=$('search'),field=searchInput?.closest('.searchbox')||searchInput?.parentElement;field?.append(button);}}
;

;
// Read-only owner check. No password, key or user list is returned to the browser.
(function(){
  const before=usersPage;
  usersPage=function(){
    before();if(!principal.owner)return;
    const bar=document.querySelector('.user-workspace-head');if(!bar)return;
    const button=document.createElement('button');button.className='doc-edit-icon';button.type='button';button.title='Periksa layanan akun';button.setAttribute('aria-label',button.title);button.innerHTML=icon('check');
    button.onclick=async()=>{button.disabled=true;try{const result=await rpc('checkAccountService');toast(result.message);}catch(error){toast(error.message);}finally{button.disabled=false;}};
    const actions=document.createElement('div');actions.className='account-utility-actions';actions.setAttribute('aria-label','Alat pengelolaan akun');actions.append(button);bar.append(actions);
    const backup=document.createElement('button');backup.type='button';backup.className='doc-edit-icon';backup.title='Cadangkan seluruh data';backup.setAttribute('aria-label',backup.title);backup.innerHTML=icon('download');
    backup.onclick=async()=>{backup.disabled=true;try{const snapshot=await rpc('exportBackup'),url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='siap-nikah-cadangan-'+localToday()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Cadangan data diunduh. Lampiran tetap tersimpan di Drive.');}catch(error){toast(error.message);}finally{backup.disabled=false;}};
    actions.append(backup);
  };
})();

/* Display only. Original records, editors and action handlers stay authoritative. */
function alignFeatureRows(){
 const view=document.getElementById('view');if(!view)return;
 view.classList.toggle('dashboard-no-currency',route==='dashboard');view.classList.toggle('compact-guests-view',route==='guests');
 view.querySelectorAll('table.table:not(.user-permission-matrix)').forEach(table=>{
  const heads=[...table.querySelectorAll('thead th')];if(heads.length<2)return;
  table.classList.add('aligned-data-table');
  if(table.classList.contains('gift-sheet-table')||table.classList.contains('finance-table')||table.classList.contains('compact-invitation-table')||table.classList.contains('compact-guestbook-table'))return;
  const labels=heads.map(h=>h.textContent.trim()),last=heads.length-1;
  const actions=!labels[last]||/Aksi|Tindakan/.test(labels[last])||!!table.querySelector('tbody tr td:last-child :is(button,a)');
  if(!actions)return; if(!heads[last].textContent.trim())heads[last].textContent='Aksi';
  const status=labels.findIndex((v,i)=>i>0&&/Status|Konfirmasi|Kehadiran/.test(v));
  const amount=labels.findIndex((v,i)=>i>0&&/Biaya|Nominal|Komitmen|Uang|Estimasi|Waktu/.test(v));
  let keep=[0,...new Set([amount>0?amount:1,status>0?status:2].filter(i=>i<last&&i>0)),last];
  if(table.classList.contains('document-data-table')&&amount<0)keep=[0,status>0?status:1,last];
  const widths=keep.length===4?[40,19,19,22]:[52,26,22];
  heads.forEach((h,i)=>{h.classList.add('aligned-cell');h.classList.toggle('aligned-secondary',!keep.includes(i));h.style.setProperty('--row-width',(widths[keep.indexOf(i)]||0)+'%');});
  table.querySelectorAll('tbody tr').forEach(row=>{
   if(row.dataset.alignedRow==='true')return;
   row.dataset.alignedRow='true';const cells=[...row.children];if(cells.length!==heads.length)return;
   const primary=cells[0],tail=cells[last],details=document.createElement('div');details.className='aligned-mobile-details';
   if(table.classList.contains('document-data-table')){const title=primary.querySelector('h3');if(title)title.textContent=title.textContent.replace(/surat pengantar nikah desa\s*\/\s*kelurahan/i,'Surat pengantar nikah desa');}
   cells.forEach((cell,i)=>{
    cell.classList.add('aligned-cell');cell.classList.toggle('aligned-secondary',!keep.includes(i));cell.style.setProperty('--row-width',(widths[keep.indexOf(i)]||0)+'%');
    if(keep.includes(i))return;
    const value=cell.textContent.trim();
    if(value&&value!=='—'&&value!=='-'&&!primary.textContent.includes(value)&&!cell.querySelector('button,a')){
     const detail=document.createElement('small');detail.textContent=table.classList.contains('document-data-table')&&/Mempelai|Remark/.test(labels[i])?value:labels[i]+': '+value;details.append(detail);
    }
    cell.querySelectorAll('button,a').forEach(control=>{
     const shortcut=control.cloneNode(true);shortcut.classList.add('aligned-mobile-action');
     shortcut.removeAttribute('id');shortcut.addEventListener('click',event=>{event.preventDefault();if(control.dataset.docFile){const record=db.admin.find(x=>x.id===control.dataset.docRecord);if(record)openFile('admin',record,control.dataset.docFile,false);}else control.click();});
     (tail.querySelector('div')||tail).prepend(shortcut);
    });
   });
   if(details.childElementCount)primary.append(details);
  });
 });
}
let featureRowFrame=0;
new MutationObserver(()=>{if(featureRowFrame)return;featureRowFrame=requestAnimationFrame(()=>{featureRowFrame=0;alignFeatureRows();});}).observe(document.getElementById('view'),{childList:true,subtree:true});
alignFeatureRows();




reload();
