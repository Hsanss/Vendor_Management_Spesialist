/* Native SIAP NIKAH UI in its existing in-memory demo mode. */
window.addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='portfolio-view'&&['dashboard','budget','tasks','admin','gifts','guests','vendors'].includes(e.data.view)){go(e.data.view);}});
const demoOriginal=demo;
demo=function(){const d=demoOriginal();d.gifts.push({id:'demo-mahar',version:1,name:'Mahar contoh',type:'Mahar',itemGroup:'Mahar',quantity:1,amount:2500000,status:'Direncanakan',paymentStatus:'Belum dibayar',owner:'Ardi',notes:'Data simulasi',files:[]});return d;};
rpc=async(name,payload)=>{if(name==='exportBackup')return{demo:true,data:db};throw new Error('Demo lokal: layanan akun, unggah cloud, dan QR publik tersedia di aplikasi operasional.');};
reload();
