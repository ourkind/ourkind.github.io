const CACHE='dash-v2-4';
const NET_TIMEOUT=3000; /* ms to wait for the network before using the saved copy */
const ASSETS=['/','/mine/','/manifest.webmanifest','/mine/manifest.webmanifest','/icon-180.png','/icon-512.png'];
const OFFLINE='<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><body style="background:#0A0A0A;color:#fff;font:18px -apple-system,system-ui,sans-serif;padding:32px"><h2>Offline</h2><p>Your personalized Dash page is not saved on this phone yet.</p><p>Connect once and open it again. It will then work without a signal.</p>';
const offlinePage=()=>new Response(OFFLINE,{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
/* only clear this app's own old caches, never another project's on the same origin */
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('dash-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const mine=u.pathname==='/mine'||u.pathname.startsWith('/mine/');
  const nav=e.request.mode==='navigate';
  /* the network request always runs to the end so the saved copy stays fresh, even if we stop waiting for it */
  const net=fetch(e.request).then(r=>{
    if(r.ok&&!r.redirected){const cp=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{}));}
    return r;
  });
  e.waitUntil(net.catch(()=>{}));
  const timed=new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('timeout')),NET_TIMEOUT);net.then(r=>{clearTimeout(t);res(r);},x=>{clearTimeout(t);rej(x);});});
  const lastResort=()=>{
    if(mine)return nav?caches.match('/mine/').then(m=>m||offlinePage()):Response.error(); /* never fall back to the public page */
    return nav?caches.match('/').then(m=>m||Response.error()):Response.error();
  };
  e.respondWith(timed.catch(()=>caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    if(hit)return hit;                                  /* saved copy of this exact page */
    return net.then(r=>r,()=>lastResort());             /* nothing saved: wait out a slow network, give up only if it fails */
  })));
});
