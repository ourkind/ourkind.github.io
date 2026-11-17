/* Dash Companion built-in tutor. Keyword matching on this phone: no internet, no account, no paid service.
   Reads settings for display and never changes them, so offer checks work exactly as before. */
(function(){
'use strict';
function S(){try{return window.__dash&&window.__dash.getS?window.__dash.getS().settings:null;}catch(e){return null;}}
function m2(n){return '$'+(+n).toFixed(2);}
function yourFloors(){var s=S();if(!s)return '';return ' Your floors right now: '+m2(s.minPay)+' minimum, '+m2(s.minMile)+' per mile, '+m2(s.minHour)+' per hour, '+s.overhead+' min of wait and handoff, Maybe band '+s.maybePct+' percent.';}
function yourSpeed(){var s=S();if(!s)return '';return ' Your settings now: car '+s.carMph+' mph and '+m2(s.carCost)+' per mile, bike '+s.bikeMph+' mph and '+m2(s.bikeCost)+' per mile, '+s.overhead+' min of wait and handoff, '+s.shopMins+' min of shopping.';}
var T=[
 {tab:'drive',t:'Check an offer by typing',k:'type typed check offer enter box pay miles numbers how use start begin first example',a:function(){return 'On the Drive tab, under Check one offer, type the pay and the miles in the two boxes, or type both in the long box, pay first, then miles. Example: 8.50 3.2. The verdict shows right away. Tap Hear it, or press Enter, to have it read out loud. Pay can be 1 to 99.99 dollars and miles 0.1 to 40.';}},
 {tab:'drive',t:'Check an offer by voice (Say it)',k:'say voice speak mic microphone talk spoken hands hear aloud read out dollars',a:function(){return 'Tap Say it and say the pay with the word dollars, then the miles. Example: eight dollars, three miles. Eight and a half dollars also works. The app reads the verdict back. If it is not sure what it heard, it asks you to say it again instead of guessing. Distances must be in miles. The Say it button shows up when your browser supports voice input; on phones where it does not, type the offer instead. Never use the app while driving.';}},
 {tab:'drive',t:'What ACCEPT, MAYBE and DECLINE mean',k:'accept decline maybe verdict mean meaning result red gold word',a:function(){return 'The app checks the offer against three floors: your minimum pay, your minimum per mile times the miles, and your minimum per hour over the estimated trip time. ACCEPT means the pay meets all three. MAYBE means exactly one floor is missed by your Maybe band or less. DECLINE is anything else. Tap Hear it on a Decline and it also tells you how much pay it takes to move up. The verdict is advice; you decide in the Dasher app.'+yourFloors();}},
 {tab:'drive',t:'Per mile and per hour math',k:'per mile hour hourly math calculate calculation dollar rate minutes time estimate fuel upkeep net cost speed mph',a:function(){return 'Per mile is pay divided by miles. Per hour uses an estimated trip time: miles divided by your speed, times 60, plus your wait and handoff minutes (and shopping minutes in Shop and Deliver). Pay divided by that time in hours is the per hour number. If you set a cost per mile, the result also shows pay minus miles times that cost. Example: 8.50 for 3.2 miles is 8.50 divided by 3.2, or $2.66 per mile.'+yourSpeed();}},
 {tab:'setup',t:'Your pay floors',k:'floor floors minimum min setup change set threshold limit band maybe percent',a:function(){return 'Open Setup, then Your pay floors. Minimum pay, Minimum per mile and Minimum per hour are the three floors every offer is checked against. Wait and handoff minutes and Shopping time feed the per hour estimate. The Maybe band sets how close a missed floor can be and still show MAYBE. Changes apply right away to the ladder and to the next check.'+yourFloors();}},
 {tab:'drive',t:'The ladder on the Drive tab',k:'ladder table chart rows list amounts quick glance miles column',a:function(){return 'The ladder lists common distances with the lowest pay that reaches Maybe and Accept at your floors, rounded up to the next 5 cents. Pay under the Maybe amount is a Decline. It changes with Bike or Car, Delivery or Shop and Deliver, and Protect tier. For stacked orders, look up the total miles.';}},
 {tab:'setup',t:'Zones',k:'zone zones area areas region where neighborhood best add remove',a:function(){return 'Zones are the areas you dash in. Add or remove them in Setup, under Zones. Pick a zone when you start a shift or save one, and the Stats tab ranks your Best zones by dollars per hour. Zones do not change the offer verdict; the check uses pay, miles and your floors.';}},
 {tab:'drive',t:'Protect tier',k:'protect tier take maybes acceptance points platinum gold silver',a:function(){return 'Turn on Protect tier on the Drive tab when you want to keep your acceptance up. While it is on, a MAYBE counts as ACCEPT and the result notes it was taken because Protect tier is on. If your Acceptance points in Setup are already full, the app tells you taking Maybes will not add tier points.';}},
 {tab:'drive',t:'Bike, car and Shop and Deliver',k:'bike bicycle car mode shop deliver shopping grocery switch',a:function(){return 'Use the buttons at the top of the Drive tab. Bike and Car use their own speed and cost per mile from Setup. Shop and Deliver adds your shopping minutes to the trip time, so the per hour floor asks for more pay.'+yourSpeed();}},
 {tab:'',t:'Put it on your home screen',k:'install home screen icon app add iphone android safari chrome shortcut',a:function(){return 'On iPhone, open this page in Safari, tap Share, then Add to Home Screen. On Android, open it in Chrome, tap the menu, then Install app or Add to Home screen. It then opens like an app.';}},
 {tab:'',t:'Using it offline',k:'offline signal internet connection wifi data no service without network work',a:function(){return 'Open the app once with a connection and it is saved on this phone. After that it opens and checks offers with no signal, and this tutor works offline too. Your shifts and settings stay on this phone.';}},
 {tab:'setup',t:'Back up your data',k:'backup back up restore save lose lost new phone copy erase data',a:function(){return 'Your data lives in this browser on this phone. Open Setup, then Backup, and tap Show backup to copy it, or Share backup file if you see that button. Keep it somewhere safe. To restore, paste a backup and tap Restore from text, then tap again to confirm.';}},
 {tab:'drive',t:'Reading an offer',k:'read reading offer screen card shows guaranteed what look numbers pay total distance',a:function(){return 'From the offer in the Dasher app, take the pay and the total miles and check them here. For a stacked order, use the total pay and the total miles for all stops. What the offer screen shows can change over time and by market, so check the Dasher app for the details on your screen.';}},
 {tab:'drive',t:'When a low offer can still make sense',k:'low small cheap bad still worth sense short quick stacked stack double near close home zone direction',a:function(){return 'A low offer can still be worth it when the trip is short and fast, so the per hour number holds up; when it is stacked, so you judge the total pay against the total miles; or when it ends near your zone or your way home, so the drive back costs less. The app does not know where an offer ends, so that part is your call. Protect tier lets you take close calls on purpose.';}},
 {tab:'setup',t:'Why acceptance rate matters',k:'acceptance rate matter matters why decline hurt points tier rating ratings deactivate',a:function(){return 'Acceptance is one of the factors on your Ratings screen and it feeds your tier points, which this app tracks under Tier marks in Setup. How much it counts, the tier marks and the rewards differ by market and can change, so check the Dasher app. Declining low offers can lower acceptance, which is why Protect tier exists for the days you want to keep it up.';}},
 {tab:'setup',t:'Tier marks and your Overall',k:'tier marks overall silver gold platinum pass streak factor points ratings screen',a:function(){return 'Copy the Silver, Gold and Platinum marks and your Overall from your Dasher Ratings screen into Setup, under Tier marks. The Drive tab then shows your tier, the points to the next mark and your biggest gap. The app trusts the Overall you type. The marks can differ by market, so check the Dasher app.';}},
 {tab:'shift',t:'Shifts and stats',k:'shift timer start end log stats earned goal hours history csv export summary',a:function(){return 'On the Shift tab, start the timer or just type your hours at the end. Save the total earned, miles and hours, and the Log and Stats tabs fill in: per hour, per mile, Best zones, Best hours and Best days. Log can export a CSV.';}},
 {tab:'',t:'Safety',k:'drive driving safe safety road phone stopped parked',a:function(){return 'Never use the app while driving. Set your floors before the shift, and glance at a verdict when you are parked or stopped. Say it and Hear it help you keep your eyes up, but pull over first.';}}
];
var STOP={};'a an the and or to of in on for my i do how can what is it with where when does this that me you your be get should if are am'.split(' ').forEach(function(w){STOP[w]=1;});
function words(t){return String(t).toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(function(w){return w&&!STOP[w];});}
function best(q){
  var ws=words(q);if(!ws.length)return null;var b=null,bs=0;
  T.forEach(function(t){var ks=words(t.k+' '+t.t),s=0;ws.forEach(function(w){ks.forEach(function(k){if(k===w)s+=2;else if(w.length>3&&(k.indexOf(w)===0||w.indexOf(k)===0))s+=1;});});if(s>bs){bs=s;b=t;}});
  return bs>=2?b:null;
}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var NAMES={drive:'Drive',shift:'Shift',setup:'Setup'};
function build(){
  if(document.getElementById('tutBtn'))return;
  var css=document.createElement('style');
  css.textContent='#tutBtn{float:right;margin:2px 0 0 8px;min-height:40px;min-width:64px;border-radius:999px;border:1px solid var(--gold);background:transparent;color:var(--gold);font-size:15px;font-weight:700;padding:6px 12px}'+
  '#tutWrap{position:fixed;inset:0;z-index:30;background:rgba(0,0,0,.72);display:none;padding:calc(env(safe-area-inset-top) + 10px) 10px calc(10px + env(safe-area-inset-bottom))}#tutWrap.on{display:block}'+
  '#tutBox{max-width:520px;height:100%;margin:0 auto;background:var(--c1);border:1px solid var(--line);border-radius:14px;display:flex;flex-direction:column;padding:12px}'+
  '#tutHead{display:flex;justify-content:space-between;align-items:center;gap:8px}#tutHead h2{margin:0}'+
  '#tutLog{flex:1;overflow:auto;margin:8px 0;-webkit-overflow-scrolling:touch}'+
  '.tq{margin:10px 0 4px auto;max-width:85%;width:fit-content;background:var(--gold);color:#000;border-radius:12px;padding:8px 10px;font-weight:600}'+
  '.ta{background:var(--c2);border-left:3px solid var(--gold);border-radius:10px;padding:10px 12px;margin:4px 0;font-size:15px}.ta b{display:block;margin-bottom:4px}'+
  '.ta button{margin-top:8px}#tutChips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}#tutChips button{min-height:36px;font-size:13px;padding:4px 10px;border-radius:999px;border:1px solid var(--line);background:var(--c2);color:var(--w)}'+
  '#tutForm{display:grid;grid-template-columns:1fr auto;gap:8px}';
  document.head.appendChild(css);
  var btn=document.createElement('button');btn.id='tutBtn';btn.type='button';btn.textContent='? Ask';btn.setAttribute('aria-label','Ask the tutor');btn.setAttribute('aria-haspopup','dialog');
  var h1=document.querySelector('h1');if(!h1)return;h1.parentNode.insertBefore(btn,h1);
  var w=document.createElement('div');w.id='tutWrap';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label','Ask the tutor');
  w.innerHTML='<div id="tutBox"><div id="tutHead"><h2>Ask the tutor</h2><button class="btn sm alt" id="tutClose" type="button">Close</button></div>'+
   '<p class="hint" style="margin:4px 0 0">Ask in your own words. Works on this phone with no signal. For DoorDash rules, check the Dasher app.</p>'+
   '<div id="tutChips"><button type="button">How do I check an offer?</button><button type="button">What does Maybe mean?</button><button type="button">How is per hour figured?</button><button type="button">Why does acceptance matter?</button></div>'+
   '<div id="tutLog" aria-live="polite"></div>'+
   '<form id="tutForm" autocomplete="off"><input id="tutQ" type="text" maxlength="200" placeholder="Type your question" aria-label="Your question"><button class="btn gold" type="submit">Ask</button></form></div>';
  document.body.appendChild(w);
  var log=w.querySelector('#tutLog'),inp=w.querySelector('#tutQ');
  function ask(q){
    q=String(q||'').trim();if(!q)return;var t=best(q),r;
    if(t){r='<b>'+esc(t.t)+'</b>'+esc(t.a())+(t.tab&&NAMES[t.tab]?'<br><button class="btn sm alt" type="button" data-tt="'+t.tab+'">Open '+NAMES[t.tab]+'</button>':'');}
    else r='I don\'t have an answer for that yet. Try asking about checking an offer, Say it, Accept and Decline, per mile and per hour, floors, zones, Protect tier, installing, offline use or backups. For DoorDash rules, check the Dasher app.';
    log.insertAdjacentHTML('beforeend','<div class="tq">'+esc(q)+'</div><div class="ta">'+r+'</div>');
    log.scrollTop=log.scrollHeight;
  }
  function open(){w.classList.add('on');document.documentElement.style.overflow='hidden';setTimeout(function(){try{inp.focus({preventScroll:true});}catch(e){}},50);}
  function close(){w.classList.remove('on');document.documentElement.style.overflow='';btn.focus();}
  btn.addEventListener('click',open);
  w.querySelector('#tutClose').addEventListener('click',close);
  w.addEventListener('click',function(e){if(e.target===w)close();var g=e.target.closest('[data-tt]');if(g){var tb=document.querySelector('#tabs [data-tab="'+g.getAttribute('data-tt')+'"]');close();if(tb)tb.click();}});
  w.querySelector('#tutChips').addEventListener('click',function(e){var b=e.target.closest('button');if(b)ask(b.textContent);});
  w.querySelector('#tutForm').addEventListener('submit',function(e){e.preventDefault();ask(inp.value);inp.value='';});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&w.classList.contains('on'))close();});
  window.__dashTutor={ask:function(q){var t=best(q);return t?{title:t.t,answer:t.a()}:null;}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
