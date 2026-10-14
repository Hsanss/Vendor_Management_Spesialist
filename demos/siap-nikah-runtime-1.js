
/* Shared business rules for the Apps Script runtime, browser preview and tests. */
var WeddingCore = (function () {
  'use strict';
  const modules = {
    admin: {title:'Peta Persiapan',sheet:'SN_Administrasi',fields:['name','requirementType','available','owner','date','status','source','notes']},
    profile: {title:'Data Mempelai',sheet:'SN_Mempelai',fields:['name','partner','date','location','budget','target','invitationUrl','notes']},
    budget: {title:'Budget & Pengeluaran',sheet:'SN_Anggaran',fields:['name','category','amount','date','owner','notes']},
    savings: {title:'Tabungan',sheet:'SN_Tabungan',fields:['name','type','amount','date','owner','notes']},
    gifts: {title:'Seserahan & Mahar',sheet:'SN_Seserahan',fields:['name','type','itemGroup','quantity','amount','paymentStatus','status','shopUrl','owner','notes']},
    vendors: {title:'Vendor & Venue',sheet:'SN_Vendor',fields:['name','category','contact','location','amount','capacity','status','notes']},
    guests: {title:'Daftar Undangan',sheet:'SN_Undangan',fields:['name','group','contact','event','quota','attending','status','deliveryStatus','address','attendanceLedger','notes']},
    tasks: {title:'Timeline Checklist',sheet:'SN_Checklist',fields:['name','owner','date','priority','status','notes']},
    rundown: {title:'Rundown & Panitia',sheet:'SN_Rundown',fields:['name','event','start','end','owner','location','contact','status','notes']},
    users: {title:'Manajemen Pengguna',sheet:'SN_Pengguna',fields:['name','username','email','role','status','permissions','notes']}
  };
  const statuses = {
    gifts:['Direncanakan','Disiapkan','Dikemas','Diserahkan'],
    vendors:['Kandidat','Dihubungi','Negosiasi','Dipilih','Selesai','Dibatalkan'],
    admin:['Belum disiapkan','Disiapkan','Perlu perbaikan','Diajukan','Selesai','Tidak berlaku'],
    guests:['Belum dikirim','Dikirim','Hadir','Tidak hadir','Belum pasti'],
    tasks:['Belum mulai','Berlangsung','Terhambat','Selesai','Tidak berlaku'],
    rundown:['Draf','Final'],
    users:['Aktif','Nonaktif']
  };
  function blank(){return Object.fromEntries(Object.keys(modules).map(k=>[k,[]]));}
  function money(n){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n||0);}
  function requireThat(ok,msg){if(!ok)throw new Error(msg);}
  function amount(v,label){const n=Number(v||0);requireThat(Number.isSafeInteger(n)&&n>=0&&n<=1000000000000,(label||'Nominal')+' harus berupa bilangan bulat 0–1 triliun.');return n;}
  function validate(key,input){
    requireThat(Object.hasOwn(modules,key),'Modul tidak dikenal.');
    const out={};
    for(const field of modules[key].fields){
      const value=input[field];
      if(field==='available')out[field]=value===true||value==='true'||value==='on';
      else if(['amount','budget','target','quota','attending','capacity','quantity'].includes(field))out[field]=amount(value,field);
      else {requireThat(value==null||typeof value==='string','Format kolom tidak valid.');out[field]=String(value||'').trim();requireThat(out[field].length<=(field==='attendanceLedger'?30000:field==='notes'?3000:field==='permissions'?3000:field.endsWith('Url')?1000:250),'Teks terlalu panjang.');}
    }
    requireThat(out.name.length>0,'Nama atau judul wajib diisi.');
    if(out.date)requireThat(/^\d{4}-\d{2}-\d{2}$/.test(out.date)&&!isNaN(Date.parse(out.date)),'Tanggal tidak valid.');
    if(statuses[key])requireThat(statuses[key].includes(out.status),'Status tidak valid.');
    if(key==='savings')requireThat(['Setoran','Penarikan'].includes(out.type),'Jenis transaksi tidak valid.');
    if(key==='gifts'){
      requireThat(['Seserahan','Mahar'].includes(out.type)&&out.quantity>0,'Jenis dan jumlah barang wajib diisi.');
      out.paymentStatus=out.paymentStatus||'Belum dibayar';
      requireThat(['Belum dibayar','Proses pembayaran','DP / sebagian','Lunas','Hadiah / tanpa biaya'].includes(out.paymentStatus),'Status pembayaran tidak valid.');
      out.itemGroup=out.itemGroup||'Lainnya';
    }
    if(key==='admin'){out.requirementType=out.requirementType||'Umum';requireThat(['Umum','Bersyarat','Tahapan'].includes(out.requirementType),'Jenis persyaratan tidak valid.');}
    if(key==='guests'){out.deliveryStatus=out.deliveryStatus||'Belum dikirim';requireThat(['Belum dikirim','Dikirim','Dibuka'].includes(out.deliveryStatus),'Status pengiriman tidak valid.');}
    if(key==='users'){
      out.username=out.username.toLowerCase();requireThat(!out.username||/^[a-z0-9._-]{3,30}$/.test(out.username),'Username harus 3–30 karakter.');out.email=out.email.toLowerCase();requireThat(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email),'Email pengguna tidak valid.');
      requireThat(['Pasangan','Koordinator','Panitia','Pembaca'].includes(out.role),'Peran tidak valid.');
      let perms;try{perms=JSON.parse(out.permissions||'{}');}catch(e){throw new Error('Pengaturan akses tidak valid.');}
      requireThat(perms&&typeof perms==='object'&&!Array.isArray(perms),'Pengaturan akses tidak valid.');
      Object.entries(perms).forEach(([k,v])=>requireThat(Object.hasOwn(modules,k)&&k!=='users'&&['none','read','write'].includes(v),'Izin modul tidak valid.'));
      out.permissions=JSON.stringify(perms);
    }
    if(key==='tasks')requireThat(['Normal','Tinggi'].includes(out.priority),'Prioritas tidak valid.');
    if(key==='guests'){
      requireThat(out.quota>0&&out.quota<=100,'Kuota undangan harus 1–100 orang.');
      requireThat(out.attending<=out.quota,'Jumlah hadir melebihi kuota.');
      requireThat(out.status==='Hadir'||out.attending===0,'Isi jumlah hadir hanya untuk status Hadir.');
      requireThat(out.event.length>0,'Nama acara wajib diisi.');
      let ledger;try{ledger=JSON.parse(out.attendanceLedger||'[]');}catch(e){throw new Error('Catatan kehadiran tidak valid.');}
      requireThat(Array.isArray(ledger)&&ledger.length<=out.quota,'Jumlah tamu yang tercatat hadir melebihi kuota.');
      const ids=new Set();
      ledger=ledger.map(person=>{
        requireThat(person&&typeof person==='object','Catatan tamu tidak valid.');
        const id=String(person.id||''),name=String(person.name||'').trim(),kind=String(person.kind||''),goods=String(person.goods||'').trim(),cash=amount(person.cash,'Uang tamu');
        requireThat(/^[\w-]{5,80}$/.test(id)&&!ids.has(id),'ID tamu hadir tidak valid atau duplikat.');ids.add(id);
        requireThat(name.length>0&&name.length<=250,'Nama setiap tamu yang hadir wajib diisi.');
        requireThat(['Uang','Barang','Uang & barang','Tidak memberi','Belum dicatat'].includes(kind),'Jenis pemberian setiap tamu wajib dipilih.');
        requireThat(goods.length<=3000,'Catatan barang terlalu panjang.');
        requireThat((kind==='Uang'||kind==='Uang & barang')?cash>0:cash===0,'Nominal uang harus sesuai jenis pemberian.');
        requireThat((kind==='Barang'||kind==='Uang & barang')?goods.length>0:goods.length===0,'Rincian barang harus sesuai jenis pemberian.');
        return {id,name,kind,cash,goods};
      });
      out.attendanceLedger=JSON.stringify(ledger);
    }
    if(key==='rundown')requireThat(out.start&&out.end&&Number.isFinite(Date.parse(out.start))&&Number.isFinite(Date.parse(out.end))&&out.end>out.start,'Waktu selesai harus setelah waktu mulai.');
    for(const f of ['source','shopUrl','invitationUrl'])if(out[f])requireThat(/^https:\/\/[^\s]+$/.test(out[f]),'Tautan harus berupa HTTPS yang valid.');
    return out;
  }
  function netPaid(item){return(item.payments||[]).reduce((s,p)=>s+(p.type==='refund'?-p.amount:p.amount),0);}
  function attendance(guest){try{const rows=JSON.parse(guest.attendanceLedger||'[]');return Array.isArray(rows)?rows:[];}catch(e){return [];}}
  function preparationCost(record){const raw=(record?.source||'').match(/[#&]biaya=(\d+)(?:&|$)/)?.[1];if(raw===undefined)return null;const value=Number(raw);return Number.isSafeInteger(value)&&value>=0&&value<=1000000000000?value:null;}
  function taskCost(record){let m;try{m=JSON.parse(record.notes||'');}catch{return null;}const cost=m?.schema==='timeline-v1'?m.cost:null;return Number.isSafeInteger(cost)&&cost>=0&&cost<=1000000000000?cost:null;}
  function checkTask(record,rows){
    let meta;try{meta=JSON.parse(record.notes||'');}catch{return;}
    if(meta?.schema!=='timeline-v1')return;
    requireThat(Array.isArray(meta.dependencies)&&meta.dependencies.length<=100&&Array.isArray(meta.subtasks)&&meta.subtasks.length<=20,'Subtugas atau ketergantungan tidak valid.');
    requireThat(meta.subtasks.every(x=>x&&typeof x.name==='string'&&x.name.trim()&&x.name.length<=100&&typeof x.done==='boolean'),'Subtugas tidak valid.');
    requireThat(meta.cost==null||(Number.isSafeInteger(meta.cost)&&meta.cost>=0&&meta.cost<=1000000000000),'Biaya tugas tidak valid.');
    const visit=(id,seen)=>{requireThat(typeof id==='string'&&id!==record.id,'Ketergantungan tugas membentuk lingkaran.');if(seen.has(id))return;seen.add(id);const row=rows.find(x=>x.id===id);requireThat(row,'Tugas pendahulu tidak ditemukan.');let next;try{next=JSON.parse(row.notes||'');}catch{}if(next?.schema==='timeline-v1'&&Array.isArray(next.dependencies))next.dependencies.forEach(v=>visit(v,seen));};
    meta.dependencies.forEach(id=>visit(id,new Set()));
    if(record.status==='Selesai'){
      requireThat(meta.subtasks.every(x=>x.done),'Selesaikan seluruh subtugas terlebih dahulu.');
      requireThat(meta.dependencies.every(id=>rows.some(x=>x.id===id&&['Selesai','Tidak berlaku'].includes(x.status))),'Selesaikan tugas pendahulu terlebih dahulu.');
    }
  }
  function financeRows(db){
    const gifts=db.gifts||[],tasks=db.tasks||[],vendors=db.vendors||[],budget=db.budget||[],result=budget.map(record=>{
      const gift=gifts.find(item=>'linked-gifts-'+item.id===record.id);
      const task=tasks.find(item=>'linked-tasks-'+item.id===record.id);
      const vendor=vendors.find(item=>'linked-vendors-'+item.id===record.id);
      if(vendor)return {...record,name:vendor.name,amount:vendor.amount,category:vendor.category,sourceKey:'vendors',sourceId:vendor.id,ledgerId:record.id};
      if(task)return {...record,name:task.name,amount:taskCost(task)??record.amount,owner:task.owner||record.owner,sourceKey:'tasks',sourceId:task.id,ledgerId:record.id};
      return {...record,...(gift?{name:gift.name,amount:gift.amount,category:gift.type}:{}),sourceKey:gift?'gifts':'budget',sourceId:gift?gift.id:record.id,ledgerId:record.id};
    });
    gifts.forEach(gift=>{if(!budget.some(record=>record.id==='linked-gifts-'+gift.id))result.push({id:'linked-gifts-'+gift.id,name:gift.name,category:gift.type,amount:gift.amount||0,date:'',owner:gift.owner||'',payments:[],files:[],sourceKey:'gifts',sourceId:gift.id,ledgerId:null});});
    tasks.forEach(task=>{const cost=taskCost(task);if(cost>0&&!budget.some(record=>record.id==='linked-tasks-'+task.id))result.push({id:'linked-tasks-'+task.id,name:task.name,category:'Lainnya',amount:cost,date:task.date||'',owner:task.owner||'',payments:[],files:[],sourceKey:'tasks',sourceId:task.id,ledgerId:null});});
    (db.admin||[]).forEach(record=>{const cost=preparationCost(record);if(cost!==null)result.push({id:'preparation-'+record.id,name:record.name,category:'Administrasi',amount:cost,date:record.date||'',owner:record.owner||'',payments:[],files:[],sourceKey:'admin',sourceId:record.id,ledgerId:null});});
    return result;
  }
  function financePaid(record){return record.sourceKey==='admin'?record.amount:netPaid(record);}
  function paidFinanceRows(db){return financeRows(db).filter(record=>financePaid(record)>0);}
  function totals(db){
    const p=db.profile[0]||{};const costs=financeRows(db);
    const preparationPaid=costs.filter(record=>record.sourceKey==='admin').reduce((sum,record)=>sum+financePaid(record),0);
    const spent=costs.reduce((s,x)=>s+financePaid(x),0);
    const fromSavings=costs.reduce((s,x)=>s+(x.payments||[]).reduce((a,p)=>a+(p.source==='Tabungan'?(p.type==='refund'?-p.amount:p.amount):0),0),0);
    const deposits=db.savings.reduce((s,x)=>s+(x.type==='Setoran'?x.amount:-x.amount),0);
    const tasks=db.tasks.filter(x=>x.status!=='Tidak berlaku');
    const visitors=(db.guests||[]).flatMap(attendance);
    const guestCash=(db.guests||[]).reduce((sum,guest)=>sum+attendance(guest).reduce((cash,person)=>cash+(guest.qrTransfer&&guest.qrTransfer.personId===person.id&&guest.qrTransfer.status!=='verified'?0:Number(person.cash||0)),0),0),guestGoods=visitors.filter(x=>x.goods).length;
    return {checkedIn:visitors.length,guestCash,guestGoods,netEventCash:guestCash-spent,budget:p.budget||0,committed:costs.reduce((s,x)=>s+x.amount,0),preparationPaid,paid:spent,due:costs.reduce((s,x)=>s+Math.max(0,x.amount-financePaid(x)),0),credit:costs.reduce((s,x)=>s+Math.max(0,financePaid(x)-x.amount),0),savings:deposits-fromSavings,target:p.target||0,invites:db.guests.length,quota:db.guests.reduce((s,x)=>s+x.quota,0),attending:db.guests.reduce((s,x)=>s+x.attending,0),tasks:tasks.length,done:tasks.filter(x=>x.status==='Selesai').length};
  }
  function mutate(db,req,now){
    requireThat(req&&typeof req==='object','Permintaan tidak valid.');
    requireThat(Object.hasOwn(modules,req.collection),'Modul tidak dikenal.');
    requireThat(typeof req.id==='string'&&/^[\w-]{5,80}$/.test(req.id),'ID tidak valid.');
    const rows=db[req.collection];const index=rows.findIndex(x=>x.id===req.id);const old=rows[index];
    requireThat((old?old.version:0)===req.version,'Data telah berubah. Muat ulang sebelum menyimpan kembali.');
    let record;
    if(req.action==='delete'){
      requireThat(old,'Catatan tidak ditemukan.');
      requireThat(req.collection!=='profile','Profil tidak dapat dihapus.');
      requireThat(req.collection!=='savings','Catatan tabungan tidak dapat dihapus.');
      if(req.collection==='budget')requireThat(!/^linked-(gifts|tasks|vendors)-/.test(old.id),'Pengeluaran terintegrasi harus dikoreksi melalui data asal.');
      rows.splice(index,1);return {deleted:true,old};
    }
    if(req.action==='confirmTransfer'){
      requireThat(req.collection==='guests'&&old?.qrTransfer?.status==='pending','Transfer tidak menunggu verifikasi.');
      const value=amount(old.qrTransfer.amount,'Nominal transfer');requireThat(value>0,'Nominal transfer tidak valid.');
      const ledger=attendance(old),person=ledger.find(x=>x.id===old.qrTransfer.personId);
      requireThat(person&&((person.kind==='Belum dicatat'&&person.cash===0)||(['Uang','Uang & barang'].includes(person.kind)&&person.cash===value)),'Pemberian telah diubah. Periksa catatan agar tidak menggandakan uang.');
      if(person.kind!=='Uang & barang')person.kind='Uang';person.cash=value;
      record={...old,...validate('guests',{...old,attendanceLedger:JSON.stringify(ledger)}),qrTransfer:{...old.qrTransfer,status:'verified',verifiedAt:now}};
      record.notes=record.notes.replace('Menunggu verifikasi panitia.','Diverifikasi panitia.');
    }else if(['fileEdit','fileUnlink'].includes(req.action)){
      requireThat(old,'Catatan tidak ditemukan.');
      const files=[...(old.files||[])];const pos=files.findIndex(f=>f.id===req.fileId);
      requireThat(pos>=0,'Lampiran tidak ditemukan.');
      if(req.action==='fileUnlink')files.splice(pos,1);
      else {const name=String(req.fileName||'').trim();requireThat(name.length>0&&name.length<=120,'Nama lampiran harus 1–120 karakter.');files[pos]={...files[pos],name};}
      record={...old,files};
    }else if(req.action==='payment'){
      requireThat(req.collection==='budget'&&old,'Item biaya tidak ditemukan.');
      const p=req.payment||{};const value=amount(p.amount);
      requireThat(value>0,'Nominal pembayaran harus lebih dari nol.');
      requireThat(['payment','refund'].includes(p.type)&&['Tabungan','Dana lain'].includes(p.source),'Jenis/sumber pembayaran tidak valid.');
      requireThat(/^\d{4}-\d{2}-\d{2}$/.test(p.date)&&!isNaN(Date.parse(p.date)),'Tanggal pembayaran wajib diisi.');
      if(p.type==='refund'){
        const available=(old.payments||[]).filter(x=>x.source===p.source).reduce((s,x)=>s+(x.type==='refund'?-x.amount:x.amount),0);
        requireThat(value<=available,'Refund melebihi pembayaran dari sumber dana ini.');
      }
      if(p.type==='payment'&&p.source==='Tabungan')requireThat(value<=totals(db).savings,'Saldo tabungan belum cukup.');
      if(p.type==='payment'&&netPaid(old)+value>old.amount)requireThat(p.allowOverpay===true,'Pembayaran melebihi komitmen. Konfirmasikan kelebihan bayar.');
      record={...old,payments:[...(old.payments||[]),{id:req.requestId,type:p.type,source:p.source,amount:value,date:p.date,note:String(p.note||'').slice(0,500)}]};
    }else{
      requireThat(req.action==='save','Tindakan tidak dikenal.');
      requireThat(!(req.collection==='savings'&&old),'Transaksi tabungan tidak diubah; tambahkan transaksi koreksi.');
      requireThat(req.collection!=='profile'||rows.length===0||!!old,'Hanya satu profil pasangan per spreadsheet.');
      record={...old,...validate(req.collection,req.collection==='guests'?{...old,...req.data}:req.data||{}),id:req.id};
      if(req.collection==='budget'&&req.initialPayment){
        requireThat(!old,'Pembayaran awal hanya untuk item biaya baru.');
        const pay=req.initialPayment,value=amount(pay.amount,'Pembayaran awal');
        requireThat(value>0&&value<=record.amount,'Pembayaran awal harus positif dan tidak melebihi biaya.');
        requireThat(['Tabungan','Dana lain'].includes(pay.source),'Sumber dana tidak valid.');
        requireThat(/^\d{4}-\d{2}-\d{2}$/.test(pay.date)&&!isNaN(Date.parse(pay.date)),'Tanggal pembayaran wajib diisi.');
        if(pay.source==='Tabungan')requireThat(value<=totals(db).savings,'Saldo tabungan belum cukup.');
        record.payments=[{id:req.requestId,type:'payment',source:pay.source,amount:value,date:pay.date,note:'Pembayaran awal'}];
      }
      if(req.collection==='users')requireThat(!rows.some(u=>u.id!==req.id&&u.email===record.email),'Email ini sudah terdaftar.');
      if(req.collection==='savings'&&record.type==='Penarikan')requireThat(record.amount<=totals(db).savings,'Saldo tabungan belum cukup.');
    }
    if(req.collection==='tasks'&&req.action==='save')checkTask(record,rows);
    record.version=(old?.version||0)+1;record.updated_at=now;
    requireThat(JSON.stringify(record).length<40000,'Catatan melebihi kapasitas. Pisahkan item biaya.');
    if(index<0)rows.push(record);else rows[index]=record;
    return {record};
  }
  function csv(rows){const keys=[...new Set(rows.flatMap(x=>Object.keys(x).filter(k=>!['payments','files'].includes(k))))];const cell=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')+'"';return '\uFEFF'+[keys,...rows.map(r=>keys.map(k=>r[k]))].map(r=>r.map(cell).join(',')).join('\r\n');}
  function can(actor,key,write){if(actor?.owner)return true;if(key==='users')return false;return actor?.permissions?.[key]==='write'||(!write&&actor?.permissions?.[key]==='read');}
  function visible(db,actor){const copy=blank();for(const key of Object.keys(modules))copy[key]=can(actor,key,false)?db[key]:[];return copy;}
  return {modules,statuses,blank,money,amount,validate,netPaid,attendance,preparationCost,financeRows,financePaid,paidFinanceRows,totals,mutate,csv,can,visible};
})();
if(typeof module!=='undefined')module.exports=WeddingCore;

