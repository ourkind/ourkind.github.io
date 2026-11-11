const CACHE='dash-v2-3';
const ASSETS=['/','/mine/','/manifest.webmanifest','/mine/manifest.webmanifest','/icon-180.png','/icon-512.png'];
const OFFLINE='<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><body style="background:#0A0A0A;color:#fff;font:18px -apple-system,system-ui,sans-serif;padding:32px"><h2>Offline</h2><p>Your personalized Dash page is not saved on this phone yet.</p><p>Connect once and open it again. It will then work without a signal.</p>';
const offlinePage=()=>new Response(OFFLINE,{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const mine=u.pathname==='/mine'||u.pathname.startsWith('/mine/');
  const nav=e.request.mode==='navigate';
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}return r;}).catch(()=>
    caches.match(e.request,{ignoreSearch:true}).then(r=>{
      if(r)return r;
      if(mine)return nav?caches.match('/mine/').then(m=>m||offlinePage()):Response.error(); /* never fall back to the public page */
      return nav?caches.match('/').then(m=>m||Response.error()):Response.error();
    })));
});
