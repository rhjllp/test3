const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const page=()=>fs.readFileSync(path.join(__dirname,'index.html'));
const srv=http.createServer((q,r)=>{r.writeHead(200,{'content-type':'text/html; charset=utf-8'});r.end(page())});
const wss=new WebSocketServer({server:srv,path:'/ws'});
const P=new Map();let n=0;
const send=(c,o)=>{if(c.readyState===1)c.send(JSON.stringify(o))};
wss.on('connection',ws=>{
  ws.id='p'+(++n);ws.alive=true;ws.on('pong',()=>ws.alive=true);
  P.forEach((d,id)=>send(ws,{t:'s',id,d}));
  ws.on('message',m=>{
    let j;try{j=JSON.parse(m)}catch(e){return}
    if(j.t!=='p'||!j.d||typeof j.d!=='object')return;
    const d={x:+j.d.x||0,z:+j.d.z||0,r:+j.d.r||0,k:j.d.k?1:0,h:j.d.h|0,n:String(j.d.n||'').slice(0,14),c:j.d.c|0,m:String(j.d.m||'').slice(0,60),mt:+j.d.mt||0,w:+j.d.w||0};
    P.set(ws.id,d);wss.clients.forEach(c=>{if(c!==ws)send(c,{t:'s',id:ws.id,d})});
  });
  ws.on('close',()=>{P.delete(ws.id);wss.clients.forEach(c=>send(c,{t:'l',id:ws.id}))});
});
setInterval(()=>wss.clients.forEach(ws=>{if(!ws.alive)return ws.terminate();ws.alive=false;ws.ping()}),25000);
srv.listen(process.env.PORT||3000,()=>console.log('Diêm Điện chạy ở cổng',process.env.PORT||3000));
