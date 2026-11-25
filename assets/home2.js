/* ============================================================
   Lisanura Home tab + bottom tab bar.
   Home: logo, teacher greeting, continue card (real progress),
   dhikr of the day (14-pool, rotates daily, Africa/Cairo),
   game of the day. Tab bar: student 3 tabs, teacher 5.
   Loads after supa.js/gate.js/adhkar.js. Renders only after
   login (gate.js sets data-ln-role on <html>).
   ============================================================ */
(function(){
var d=document;
var onBoard=location.pathname.indexOf('/board/')>-1;
var AB=onBoard?'../assets/':'assets/'; /* asset base */

function lang(){try{var v=localStorage.getItem('letters-city:lang.v1');return (v===null?'ar':JSON.parse(v))==='en'?'en':'ar';}catch(e){return 'ar';}}
function isEn(){return lang()==='en';}
function gender(){try{return JSON.parse(localStorage.getItem('letters-city:gender.v1')||'"girl"')==='boy'?'boy':'girl';}catch(e){return 'girl';}}
function role(){var r=d.documentElement.getAttribute('data-ln-role');return r==='teacher'?'teacher':(r==='student'?'student':'');}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

/* day index in Africa/Cairo, mod n */
function dayIdx(n){
  try{
    var p={},parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    parts.forEach(function(x){p[x.type]=x.value;});
    var days=Math.floor(Date.UTC(+p.year,(+p.month)-1,+p.day)/86400000);
    return ((days%n)+n)%n;
  }catch(e){return Math.floor(Date.now()/86400000)%n;}
}

/* ---------- theme ---------- */
var TILES={girl:['tile-neut-BA34HDQK','arch-neut-TQCGQA43','#faf5f0'],boy:['tile-neut-BA34HDQK','arch-neut-TQCGQA43','#faf5f0']};
var ACC={girl:['#c16a7e','#7e4150','#eed3cd','#9e4f62'],boy:['#c16a7e','#7e4150','#eed3cd','#7e4150']};

/* ---------- styles ---------- */
var GEAR_SVG=function(c){return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23"+c+"' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'/%3E%3C/svg%3E\")";};

var css=''
/* home overlay */
+'.hn-ov{position:fixed;inset:0;z-index:60;overflow:auto;-webkit-overflow-scrolling:touch;padding:14px 14px 100px;box-sizing:border-box}'
+'.hn-bg{position:fixed;inset:0;z-index:-1;pointer-events:none}'
+'.hn-wrap{max-width:430px;margin:0 auto}'
+'.hn-logo{text-align:center;margin:0 0 8px}'
+'.hn-logo img{height:86px;width:auto;max-width:78%}'
+'.hn-hello{display:flex;align-items:flex-end;gap:6px;margin:0 0 14px}'
+'.hn-ov[dir=rtl] .hn-hello{flex-direction:row-reverse}'
+'.hn-bub{flex:1;background:#fff;border-radius:18px;padding:10px 14px;box-shadow:0 3px 12px #7e415018}'
+'.hn-girl .hn-bub{border:2px solid #eed3cd}'
+'.hn-boy .hn-bub{border:2px solid #eed3cd}'
+'.hn-hi{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:21px;font-weight:700;margin:0}'
+'.hn-girl .hn-hi{color:#7e4150}.hn-boy .hn-hi{color:#7e4150}'
+'.hn-sub{font-size:13.5px;color:#a98b7f;margin:2px 0 0}'
+'.hn-boy .hn-sub{color:#a98b7f}'
+'.hn-teach{width:96px;height:auto;flex:none}'
+'.hn-card{background:#fff;border-radius:20px;padding:14px 16px;margin:0 0 14px;box-shadow:0 4px 12px #7e415012}'
+'.hn-girl .hn-card{border:2px solid #eed3cd}'
+'.hn-boy .hn-card{border:2px solid #eed3cd}'
+'.hn-label{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:13.5px;font-weight:700;margin:0 0 6px}'
+'.hn-girl .hn-label{color:#c16a7e}.hn-boy .hn-label{color:#c16a7e}'
+'.hn-dhikr{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:21px;line-height:2;color:#3d2b33;text-align:center;margin:2px 0 8px}'
+'.hn-cond{font-size:12.5px;color:#b8860b;text-align:center;margin:-4px 0 6px}'
+'.hn-virtue{font-size:12.5px;line-height:1.9;color:#a98b7f;margin:8px 0 0}'
+'.hn-src{font-size:12px;color:#bd9f92;margin:2px 0 0}'
+'.hn-listen{display:flex;align-items:center;justify-content:center;gap:6px;margin:4px auto 2px;color:#fff;border:0;border-radius:999px;padding:8px 24px;font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:15.5px;min-height:40px;cursor:pointer;box-shadow:0 3px 8px #7e415026}'
+'.hn-girl .hn-listen{background:#c16a7e}.hn-boy .hn-listen{background:#c16a7e}'
+'.hn-listen svg{width:16px;height:16px;fill:currentColor}'
+'.hn-cont{border-radius:20px;padding:16px;color:#fff;margin:0 0 14px}'
+'.hn-girl .hn-cont{background:linear-gradient(135deg,#c16a7e,#9e4f62);box-shadow:0 6px 16px #c16a7e40}'
+'.hn-boy .hn-cont{background:linear-gradient(135deg,#c16a7e,#7e4150);box-shadow:0 6px 16px #c16a7e40}'
+'.hn-cont-t{font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:19px;margin:0}'
+'.hn-cont-l{font-size:14.5px;opacity:.95;margin:5px 0 10px;line-height:1.7}'
+'.hn-cont-bar{height:8px;border-radius:99px;background:#ffffff4d;overflow:hidden;margin-bottom:12px}'
+'.hn-cont-f{height:100%;background:#f5c15c;border-radius:99px}'
+'.hn-cont-btn{background:#fff;border:0;border-radius:999px;padding:8px 24px;font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:16px;min-height:40px;cursor:pointer;box-shadow:0 2px 6px #3d122030}'
+'.hn-girl .hn-cont-btn{color:#a04d63}.hn-boy .hn-cont-btn{color:#7e4150}'
+'.hn-game-t{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:20px;font-weight:700;margin:0 0 10px}'
+'.hn-girl .hn-game-t{color:#7e4150}.hn-boy .hn-game-t{color:#7e4150}'
+'.hn-play{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:999px;padding:8px 24px;color:#fff;font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:15.5px;min-height:40px;cursor:pointer;box-shadow:0 3px 8px #7e415026}'
+'.hn-girl .hn-play{background:#c16a7e}.hn-boy .hn-play{background:#c16a7e}'
+'.hn-card-click{cursor:pointer}'
+'.hn-gear{position:fixed;top:10px;right:10px;z-index:5;width:46px;height:46px;min-height:46px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}'
+'.hn-girl .hn-gear{border:2.5px solid #c16a7e;box-shadow:0 2px 8px #7e415026}'
+'.hn-boy .hn-gear{border:2.5px solid #c16a7e;box-shadow:0 2px 8px #7e415026}'
+'.hn-gear i{width:24px;height:24px;display:block;background:no-repeat center/contain}'
+'.hn-girl .hn-gear i{background-image:'+GEAR_SVG('c16a7e')+'}'
+'.hn-boy .hn-gear i{background-image:'+GEAR_SVG('c16a7e')+'}'
+'.hn-set{position:fixed;inset:0;z-index:85;background:#3d122066;display:flex;align-items:center;justify-content:center}'
+'.hn-set-card{width:calc(100% - 40px);max-width:360px;background:#faf5f0;border-radius:22px;padding:20px 18px;box-sizing:border-box;box-shadow:0 14px 44px #3d12204d;animation:hnPop .22s ease-out}'
+'.hn-set-t{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:20px;font-weight:700;color:#7e4150;margin:0 0 12px;text-align:center}'
+'.hn-set-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}'
+'.hn-set-l{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:16px;font-weight:700;color:#7e4150}'
+'.hn-set-opts{display:flex;gap:6px}'
+'.hn-opt{border:2px solid #e8cfc0;background:#fff;color:#7e4150;border-radius:999px;padding:7px 18px;font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:14.5px;cursor:pointer;min-height:38px}'
+'.hn-opt.on{background:#c16a7e;border-color:#c16a7e;color:#fff}'
+'.hn-set-close{display:block;width:100%;border:2px solid #e8cfc0;background:#fff;color:#7e4150;border-radius:14px;padding:12px;font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:800;font-size:16px;cursor:pointer;min-height:46px;margin-top:4px}'
/* restyle the app's own settings gears to the same look (theme-aware) */
+'.lc-gear{width:46px;height:46px;min-height:46px;border-radius:50%;background:#fff;border:2.5px solid #c16a7e;font-size:0;padding:0;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #7e415026;cursor:pointer}'
+'.lc-gear::after{content:"";width:24px;height:24px;background:no-repeat center/contain '+GEAR_SVG('c16a7e')+'}'
+'body.hb-bg-boy .lc-gear{border-color:#c16a7e;box-shadow:0 2px 8px #7e415026}'
+'body.hb-bg-boy .lc-gear::after{background-image:'+GEAR_SVG('c16a7e')+'}'
/* tab bar (exact approved look) */
+'.tb-bar{position:fixed;left:0;right:0;bottom:0;z-index:70;background:#7e4150;padding:6px 8px calc(6px + env(safe-area-inset-bottom,0px));display:flex;justify-content:center;box-shadow:0 -3px 14px #3d1220a0}'
+'body.hb-bg-boy .tb-bar{background:#7e4150}'
+'.tb-in{display:flex;width:100%;max-width:520px;justify-content:space-around;gap:2px}'
+'.tb-tab{flex:1;border:0;background:transparent;color:#eec9c0;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px 4px;min-height:52px;border-radius:14px;cursor:pointer;font-family:inherit}'
+'body.hb-bg-boy .tb-tab{color:#eed3cd}'
+'.tb-tab svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'
+'.tb-tab span{font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:13px;line-height:1.2}'
+'.tb-tab.tb-en span{font-family:inherit;font-size:11.5px;font-weight:700}'
+'.tb-tab.tb-on{color:#f5c15c;background:#ffffff14}'
+'.tb-tab:active{transform:scale(.96)}'
+'.tb-acc{position:fixed;inset:0;z-index:75;background:#3d122066;display:flex;align-items:center;justify-content:center}'
+'.tb-acc-card{width:calc(100% - 40px);max-width:360px;background:#faf5f0;border-radius:22px;padding:20px 18px;box-sizing:border-box;text-align:center;box-shadow:0 14px 44px #3d12204d;animation:hnPop .22s ease-out}'
+'.tb-acc-name{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:22px;font-weight:700;color:#7e4150;margin:0 0 2px}'
+'.tb-acc-role{font-size:14.5px;color:#a98b7f;margin:0 0 14px}'
+'.tb-acc-btn{display:block;width:100%;border:0;border-radius:14px;padding:13px;min-height:48px;font-family:inherit;font-size:16.5px;font-weight:800;cursor:pointer;margin-top:8px}'
+'.tb-acc-out{background:#c16a7e;color:#fff}'
+'.tb-acc-close{background:#fff;color:#7e4150;border:2px solid #e8cfc0}'
+'body.hb-bg-boy .tb-acc-card{background:#faf5f0}'
+'body.hb-bg-boy .tb-acc-name{color:#7e4150}'
+'body.hb-bg-boy .tb-acc-role{color:#a98b7f}'
+'body.hb-bg-boy .tb-acc-l{color:#bd9f92}'
+'body.hb-bg-boy .tb-acc-out{background:#c16a7e}'
+'body.hb-bg-boy .tb-acc-close{color:#7e4150;border-color:#eed3cd}'
+'body.hb-bg-boy .hn-set-card{background:#faf5f0}'
+'body.hb-bg-boy .hn-set-t{color:#7e4150}'
+'body.hb-bg-boy .hn-set-l{color:#7e4150}'
+'body.hb-bg-boy .hn-opt{border-color:#eed3cd;color:#7e4150}'
+'body.hb-bg-boy .hn-opt.on{background:#c16a7e;border-color:#c16a7e;color:#fff}'
+'body.hb-bg-boy .hn-set-close{border-color:#eed3cd;color:#7e4150}'
+'#homeAuth{display:none!important}'
+'.tb-acc-l{font-size:12.5px;color:#bd9f92;margin:8px 0 2px}'
+'.tb-acc-mail{font-size:14.5px;color:#7e4150;margin:0 0 4px;direction:ltr;font-weight:600}'
+'body.hb-bg-boy .tb-acc-mail{color:#7e4150}'
+'.tb-code-l{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:14.5px;font-weight:700;color:#7e4150;margin:12px 0 6px}'
+'body.hb-bg-boy .tb-code-l{color:#7e4150}'
+'.tb-code{direction:ltr;font-size:13px;word-break:break-all;background:#fff;border:2px solid #eed3cd;border-radius:12px;padding:10px;color:#7e4150;text-align:center;font-family:ui-monospace,monospace}'
+'body.hb-bg-boy .tb-code{border-color:#eed3cd;color:#7e4150}'
+'.tb-copy{display:block;width:100%;margin-top:8px;border:0;border-radius:14px;padding:11px;min-height:46px;background:#c16a7e;color:#fff;font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:15.5px;cursor:pointer}'
+'body.hb-bg-boy .tb-copy{background:#c16a7e}'
+'.tb-st{position:fixed;inset:0;z-index:76;overflow:auto;-webkit-overflow-scrolling:touch;padding:14px 14px 100px;box-sizing:border-box}'
+'.tb-st-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;background-color:#faf5f0;background-image:url('+AB+TILES.girl[0]+'.svg),url('+AB+TILES.girl[1]+'.svg);background-repeat:repeat,no-repeat;background-size:96px 96px,340px auto;background-position:0 0,center 118px}'
+'body.hb-bg-boy .tb-st-bg{background-color:#faf5f0;background-image:url('+AB+TILES.boy[0]+'.svg),url('+AB+TILES.boy[1]+'.svg)}'
+'.tb-st-wrap{max-width:430px;margin:0 auto}'
+'.tb-st-top{display:flex;align-items:center;gap:10px;margin:4px 0 12px}'
+'.tb-st-back{display:inline-flex;align-items:center;gap:6px;border:2px solid #c16a7e;background:#fff;color:#7e4150;font-weight:700;font-size:15.5px;border-radius:999px;padding:6px 14px;min-height:44px;cursor:pointer;font-family:inherit}'
+'body.hb-bg-boy .tb-st-back{border-color:#c16a7e;color:#7e4150}'
+'.tb-st-back svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}'
+'.tb-st-h{font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:26px;color:#7e4150;margin:0;flex:1;text-align:center}'
+'body.hb-bg-boy .tb-st-h{color:#7e4150}'
+'.tb-st-msg{text-align:center;color:#a98b7f;font-size:15.5px;line-height:2;margin:26px 0 10px}'
+'.tb-st-card{background:#fff;border-radius:20px;padding:14px 16px;margin:0 0 14px;box-shadow:0 4px 12px #7e415012;border:2px solid #eed3cd}'
+'body.hb-bg-boy .tb-st-card{border-color:#eed3cd;box-shadow:0 4px 12px #7e415012}'
+'.tb-st-name{display:flex;align-items:center;gap:8px;font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:17px;color:#7e4150}'
+'body.hb-bg-boy .tb-st-name{color:#7e4150}'
+'.tb-st-name svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.8}'
+'.tb-st-sub{font-size:12.5px;color:#a98b7f;margin:2px 0 6px}'
+'.tb-st-row{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-top:1px dashed #f0d9e2;font-size:14px;color:#9e4f62}'
+'body.hb-bg-boy .tb-st-row{color:#7e4150;border-top-color:#f0ded6}'
+'.tb-st-row span:last-child{color:#a98b7f;white-space:nowrap}'
+'.tb-st-none{font-size:13.5px;color:#a98b7f}'
+'body{padding-bottom:76px}';

var IC={
home:'<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M10 20v-5h4v5"/></svg>',
lessons:'<svg viewBox="0 0 24 24"><path d="M12 6.5C10.5 5 8.4 4.5 4.5 4.5v14c3.9 0 6 .5 7.5 2 1.5-1.5 3.6-2 7.5-2v-14c-3.9 0-6 .5-7.5 2z"/><path d="M12 6.5v14"/></svg>',
board:'<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="12" rx="1.5"/><path d="M12 16.5v2.5M8 21l4-2 4 2"/><path d="M7 12.5c1.5-2 3-3.5 4.5-3.5s2 1.5 3.5 3.5"/></svg>',
students:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M15.5 14.6c2.3.2 4.2 1.9 4.9 4.4"/></svg>',
account:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1-4 4-6 7.5-6s6.5 2 7.5 6"/></svg>'};
var PLAY_SVG='<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
var STOP_SVG='<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';

function tabs(){
  var en=isEn(),t=role();
  var L={home:en?'Home':'الرئيسية',lessons:en?'Lessons':'الدروس',board:en?'Board':'السبورة',students:en?'My students':'طلابي',account:en?'Account':'حسابي'};
  var ids=t==='teacher'?['home','lessons','board','students','account']:['home','lessons','account'];
  return ids.map(function(id){return {id:id,label:L[id]};});
}

/* ---------- state ---------- */
var ov=null,bar=null,tab='home',pool=null,poolP=null,aud=null,playing=false;

function stopAudio(){if(aud){try{aud.pause();}catch(e){} aud=null;} playing=false;}

function loadPool(){
  if(poolP)return poolP;
  poolP=fetch(AB+'dhikr-pool.json').then(function(r){return r.json();}).then(function(j){pool=j;return j;}).catch(function(){pool=[];return[];});
  return poolP;
}

/* ---------- progress (real, from progress.js recorder) ---------- */
function lastPlayed(){
  try{
    var u=window.LN&&LN.user&&LN.user.id;if(!u)return null;
    var q=JSON.parse(localStorage.getItem('lc:prog:'+u)||'{}');
    var best=0,bk=null;
    Object.keys(q).forEach(function(k){var it=q[k];if(it&&it.last&&it.last>best){best=it.last;bk=k;}});
    if(!bk)return null;
    var t=(window.LN&&LN.GAME_TITLES||{})[bk];
    return {key:bk,title:t?(isEn()?t[1]:t[0]):bk,plays:q[bk].plays||0};
  }catch(e){return null;}
}
/* real fraction only for Letters City (its own done-list, 8 stops) */
function lettersFraction(){
  try{
    var done=JSON.parse(localStorage.getItem('hb-done.v1')||'[]');
    if(!done.length)return 0;
    return Math.min(1,done.length/8);
  }catch(e){return 0;}
}
var DOOR_OF={letters:0,gender:0,prep:0,words:0,reading:0,noon:1,noonv:1,ghunna:1,shadda:1,meem:1,meemv:1,islamic:2};
function openDoorFor(gameKey){
  showTab('lessons');
  var di=DOOR_OF[gameKey];
  if(di===undefined)return;
  setTimeout(function(){
    var doors=d.querySelectorAll('.hb-doors .hb-door');
    if(doors[di])doors[di].click();
  },400);
}

/* ---------- home overlay ---------- */
function buildOv(){
  ov=d.createElement('div');
  ov.className='hn-ov hn-'+gender();
  ov.setAttribute('dir',isEn()?'ltr':'rtl');
  var bg=d.createElement('div');bg.className='hn-bg';ov.appendChild(bg);
  var t=TILES[gender()];
  bg.style.backgroundColor=t[2];
  bg.style.backgroundImage='url('+AB+t[0]+'.svg),url('+AB+t[1]+'.svg)';
  bg.style.backgroundRepeat='repeat,no-repeat';
  bg.style.backgroundSize='96px 96px,340px auto';
  bg.style.backgroundPosition='0 0,center 118px';

  var en=isEn(),rl=role(),p=window.LN&&LN.profile;
  var name=(p&&p.display_name)||'';
  var h='<div class="hn-wrap">';
  h+='<div class="hn-logo"><img src="'+AB+(en?'logo-en.png?v=4':'logo-ar.png?v=4')+'" alt=""></div>';
  /* greeting */
  h+='<div class="hn-hello"><div class="hn-bub"><p class="hn-hi">'
    +(rl==='teacher'?(en?'Welcome, Teacher!':'أَهْلًا بِكِ يَا مُعَلِّمَةُ!'):(en?('Welcome'+(name?', '+esc(name):'')+'!'):('أَهْلًا يَا '+esc(name||'صَدِيقَتِي')+'!')))
    +'</p><p class="hn-sub">'
    +(rl==='teacher'?(en?'A happy day with your students.':'يَوْمٌ سَعِيدٌ مَعَ طَالِبَاتِكِ'):(en?'Let’s learn together today.':'هَيَّا نَتَعَلَّمْ مَعًا الْيَوْمَ'))
    +'</p></div>'
    +'<img class="hn-teach" src="'+AB+'teacher-full-6VQNEAGQ.png" alt=""></div>';
  /* continue card */
  var lp=lastPlayed();
  h+='<div class="hn-cont"><p class="hn-cont-t">'+(en?'Continue where you left off':(gender()==='boy'?'أَكْمِلْ مِنْ حَيْثُ وَقَفْتَ':'أَكْمِلِي مِنْ حَيْثُ وَقَفْتِ'))+'</p>';
  if(lp){
    h+='<p class="hn-cont-l">'+esc(lp.title)+(lp.plays>1?' · '+(en?lp.plays+' plays':lp.plays+' مَرَّاتٍ'):'')+'</p>';
    if(lp.key==='letters'){var f=lettersFraction();if(f>0)h+='<div class="hn-cont-bar"><div class="hn-cont-f" style="width:'+Math.round(f*100)+'%"></div></div>';}
  }else{
    h+='<p class="hn-cont-l">'+(en?'Start your first lesson from the lessons tab.':'اِبْدَئِي أَوَّلَ دَرْسٍ مِنْ تَبْوِيبِ الدُّرُوسِ.')+'</p>';
  }
  h+='<button type="button" class="hn-cont-btn" data-hn="cont">'+(en?'Continue':'تَابِعِي')+'</button></div>';
  /* dhikr card (filled by loadPool) */
  h+='<div class="hn-card hn-card-click" data-hn="adhkar"><p class="hn-label">'+(en?'Dhikr of the day':'ذِكْرُ الْيَوْمِ')+'</p><div class="hn-dhikr-slot"></div></div>';
  /* game card */
  var GAMES=['letters','words','gender','prep','reading','noon','ghunna','shadda','meem','noonv'];
  var gk=GAMES[dayIdx(GAMES.length)];
  var gt=(window.LN&&LN.GAME_TITLES||{})[gk];
  h+='<div class="hn-card"><p class="hn-label">'+(en?'Game of the day':'لُعْبَةُ الْيَوْمِ')+'</p>'
    +'<p class="hn-game-t">'+esc(gt?(en?gt[1]:gt[0]):gk)+'</p>'
    +'<button type="button" class="hn-play" data-hn="play" data-g="'+gk+'">'+PLAY_SVG.replace('<svg','<svg style="width:15px;height:15px;fill:currentColor"')+'<span>'+(en?'Play':'اِلْعَبِي')+'</span></button></div>';
  h+='</div>';
  ov.innerHTML+= '<button type="button" class="hn-gear" data-hn="gear" aria-label="'+(en?'Settings':'الإعدادات')+'"><i></i></button>';
  var wrap=d.createElement('div');wrap.innerHTML=h;while(wrap.firstChild)ov.appendChild(wrap.firstChild);

  ov.addEventListener('click',function(e){
    var b=e.target.closest('[data-hn]');if(!b)return;
    var k=b.getAttribute('data-hn');
    if(k==='cont'){var l=lastPlayed();if(l)openDoorFor(l.key);else showTab('lessons');}
    else if(k==='play'){openDoorFor(b.getAttribute('data-g'));}
    else if(k==='adhkar'){if(e.target.closest('[data-hn-listen]'))return;if(window.LisanAdhkar)LisanAdhkar.open();}
    else if(k==='gear'){openSettings();}
  });
  d.body.appendChild(ov);
  fillDhikr();
}

function fillDhikr(){
  var slot=ov&&ov.querySelector('.hn-dhikr-slot');if(!slot)return;
  loadPool().then(function(j){
    if(!ov||!slot.isConnected)return;
    if(!j||!j.length){slot.innerHTML='';return;}
    var it=j[dayIdx(j.length)];
    var h='<p class="hn-dhikr" dir="rtl">'+esc(it.text)+'</p>';
    if(it.condition)h+='<p class="hn-cond" dir="rtl">'+esc(it.condition)+'</p>';
    h+='<button type="button" class="hn-listen" data-hn-listen="1">'+PLAY_SVG+'<span>'+(isEn()?'Listen':'اِسْتِمَاع')+'</span></button>';
    if(it.virtue)h+='<p class="hn-virtue" dir="rtl">'+esc(it.virtue)+'</p>';
    if(it.source)h+='<p class="hn-src" dir="rtl">'+esc(it.source)+'</p>';
    slot.innerHTML=h;
    var btn=slot.querySelector('[data-hn-listen]');
    btn.onclick=function(){
      if(aud){stopAudio();btn.innerHTML=PLAY_SVG+'<span>'+(isEn()?'Listen':'اِسْتِمَاع')+'</span>';return;}
      aud=new Audio(AB+it.audio);
      aud.onended=function(){stopAudio();btn.innerHTML=PLAY_SVG+'<span>'+(isEn()?'Listen':'اِسْتِمَاع')+'</span>';};
      aud.onerror=aud.onended;
      var pr=aud.play();if(pr&&pr.then)pr.catch(function(){});
      btn.innerHTML=STOP_SVG+'<span>'+(isEn()?'Stop':'إِيقَاف')+'</span>';
    };
  });
}

/* ---------- settings sheet ---------- */
function setKey(k,v){
  try{localStorage.setItem('letters-city:'+k,JSON.stringify(v));}catch(e){}
  try{window.dispatchEvent(new CustomEvent('ls-sync',{detail:{key:k,value:v}}));}catch(e){}
}
function openSettings(){
  var en=isEn(),g=gender();
  var ov2=d.createElement('div');ov2.className='hn-set';
  ov2.innerHTML='<div class="hn-set-card"><p class="hn-set-t">'+(en?'Settings':'الإعدادات')+'</p>'
    +'<div class="hn-set-row"><span class="hn-set-l">'+(en?'Language':'اللغة')+'</span><span class="hn-set-opts">'
    +'<button type="button" class="hn-opt'+(!en?' on':'')+'" data-lang="ar">العربية</button>'
    +'<button type="button" class="hn-opt'+(en?' on':'')+'" data-lang="en">English</button></span></div>'
    +'<div class="hn-set-row"><span class="hn-set-l">'+(en?'Character':'الشخصية')+'</span><span class="hn-set-opts">'
    +'<button type="button" class="hn-opt'+(g==='girl'?' on':'')+'" data-g="girl">'+(en?'Girl':'بنت')+'</button>'
    +'<button type="button" class="hn-opt'+(g==='boy'?' on':'')+'" data-g="boy">'+(en?'Boy':'ولد')+'</button></span></div>'
    +'<button type="button" class="hn-set-close">'+(en?'Close':'إغلاق')+'</button></div>';
  ov2.addEventListener('click',function(e){
    var b=e.target.closest('[data-lang],[data-g],.hn-set-close');
    if(e.target===ov2|| (b&&b.classList.contains('hn-set-close'))){ov2.remove();return;}
    if(!b)return;
    if(b.hasAttribute('data-lang'))setKey('lang.v1',b.getAttribute('data-lang'));
    if(b.hasAttribute('data-g'))setKey('gender.v1',b.getAttribute('data-g'));
    ov2.remove();
  });
  d.body.appendChild(ov2);
}

/* ---------- account sheet ---------- */
var STUD_DOM='lisanura-students.app';
function arNum(n){return String(n).replace(/\d/g,function(c){return '٠١٢٣٤٥٦٧٨٩'[+c];});}
function backSvg(en){return '<svg viewBox="0 0 24 24"><path d="'+(en?'M15 6l-6 6 6 6':'M9 6l6 6-6 6')+'"/></svg>';}
function copyCode(btn,en){
  var code=(window.LN&&LN.teacherCode&&LN.teacherCode())||'';
  if(!code)return;
  function done(){btn.textContent=en?'Copied ✓':'تم النسخ ✓';setTimeout(function(){btn.textContent=en?'Copy code':'نسخ الكود';},1600);}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(code).then(done,done);return;}
  var ta=d.createElement('textarea');ta.value=code;ta.style.position='fixed';ta.style.opacity='0';d.body.appendChild(ta);ta.select();
  try{d.execCommand('copy');}catch(e){}
  ta.remove();done();
}
function codeBlock(en){
  return '<p class="tb-code-l">'+(en?'Your teacher code (share it with your students):':'كود المعلمة (شاركيه مع طالباتك عند تسجيلهن):')+'</p>'
    +'<div class="tb-code"></div><button type="button" class="tb-copy"></button>';
}
function wireCode(root,en){
  var code=(window.LN&&LN.teacherCode&&LN.teacherCode())||'';
  var ce=root.querySelector('.tb-code');if(ce)ce.textContent=code;
  var cp=root.querySelector('.tb-copy');
  if(cp){cp.textContent=en?'Copy code':'نسخ الكود';cp.onclick=function(){copyCode(cp,en);};}
}
function openAccount(){
  var en=isEn();
  var ov3=d.createElement('div');ov3.className='tb-acc';
  var p=window.LN&&LN.profile;
  var u=window.LN&&LN.user;
  var name=(p&&p.display_name)||(en?'User':'المستخدمة');
  var isT=((p&&p.role)||role())==='teacher';
  var rl=isT?(en?'Teacher':'معلمة'):(en?'Student':(gender()==='boy'?'طالب':'طالبة'));
  var mail='';
  if(u&&u.email){mail=u.email.indexOf('@'+STUD_DOM)>-1?u.email.split('@')[0]:u.email;}
  ov3.innerHTML='<div class="tb-acc-card"><p class="tb-acc-name"></p><p class="tb-acc-role"></p>'
    +(mail?'<p class="tb-acc-l">'+(isT?(en?'Email':'البريد الإلكتروني'):(en?'Username':'اسم المستخدم'))+'</p><p class="tb-acc-mail"></p>':'')
    +(isT?codeBlock(en):'')
    +'<button class="tb-acc-btn tb-acc-out"></button><button class="tb-acc-btn tb-acc-close"></button></div>';
  ov3.querySelector('.tb-acc-name').textContent=name;
  ov3.querySelector('.tb-acc-role').textContent=rl;
  if(mail)ov3.querySelector('.tb-acc-mail').textContent=mail;
  if(isT)wireCode(ov3,en);
  var out=ov3.querySelector('.tb-acc-out');out.textContent=en?'Sign out':'تسجيل الخروج';
  var cl=ov3.querySelector('.tb-acc-close');cl.textContent=en?'Close':'إغلاق';
  cl.onclick=function(){ov3.remove();};
  ov3.addEventListener('click',function(e){if(e.target===ov3)ov3.remove();});
  out.onclick=function(){out.disabled=true;out.textContent=en?'Signing out...':'جارٍ تسجيل الخروج...';
    if(window.LN&&LN.signOut)LN.signOut().then(function(){location.reload();},function(){location.reload();});
    else location.reload();};
  d.body.appendChild(ov3);
}

/* ---------- my students overlay (teacher; never redirects) ---------- */
function openStudents(){
  var en=isEn();
  var ov4=d.createElement('div');ov4.className='tb-st';ov4.setAttribute('dir',en?'ltr':'rtl');
  ov4.innerHTML='<div class="tb-st-bg"></div><div class="tb-st-wrap">'
    +'<div class="tb-st-top"><button type="button" class="tb-st-back">'+backSvg(en)+'<span>'+(en?'Back':'رُجُوعٌ')+'</span></button><h2 class="tb-st-h">'+(en?'My students':'طُلَابِي')+'</h2></div>'
    +'<div class="tb-st-body"><div class="tb-st-msg">…</div></div></div>';
  var body=ov4.querySelector('.tb-st-body');
  function closeSt(){ov4.remove();ovTab=null;paintTabs();}
  ov4.querySelector('.tb-st-back').onclick=closeSt;
  d.body.appendChild(ov4);ovTab='students';paintTabs();
  if(!window.LN||!LN.configured||!LN.configured()){body.innerHTML='<div class="tb-st-msg">'+(en?'Accounts are not enabled yet':'الْحِسَابَاتُ غَيْرُ مُفَعَّلَةٍ بَعْدُ')+'</div>';return;}
  LN.init().then(function(){
    var isT=(LN.profile&&LN.profile.role==='teacher')||role()==='teacher';
    if(!isT){body.innerHTML='<div class="tb-st-msg">'+(en?'For teachers only':'لِلْمُعَلِّمَةِ فَقَطْ')+'</div>';return;}
    return (LN.listStudentsProgress?LN.listStudentsProgress():Promise.resolve([])).then(function(ss){
      ss=ss||[];
      if(!ss.length){
        body.innerHTML='<div class="tb-st-msg">'+(en?'You have no students yet':'لَيْسَ لَدَيْكِ طُلَابٌ بَعْدُ')+'<br>'+(en?'Share your teacher code with your students and they will appear here.':'شَارِكِي كُودَ الْمُعَلِّمَةِ مَعَ طَالِبَاتِكِ لِيَظْهَرْنَ هُنَا.')+'</div>'+codeBlock(en);
        wireCode(body,en);
        return;
      }
      body.innerHTML='';
      ss.forEach(function(st){
        var rows=(st.progress||[]).filter(function(r){return r.game&&r.game.indexOf('lc:')===0;});
        rows.sort(function(a,b){return String(b.updated_at||'').localeCompare(String(a.updated_at||''));});
        var h='<div class="tb-st-name">'+IC.account+'<span></span></div>'
          +'<div class="tb-st-sub">'+(en?'Joined':'انْضَمَّتْ')+' '+(st.created_at?new Date(st.created_at).toLocaleDateString(en?'en-GB':'ar-EG',{day:'numeric',month:'long'}):'')+'</div>';
        if(!rows.length)h+='<div class="tb-st-none">'+(en?'No games yet':'لَمْ تَلْعَبْ بَعْدُ')+'</div>';
        rows.forEach(function(r){
          var key=r.game.slice(3),g=(LN.GAME_TITLES||{})[key]||[key,key];
          var n=(r.data&&r.data.plays)||1;
          var last=r.data&&r.data.last?new Date(r.data.last):(r.updated_at?new Date(r.updated_at):null);
          var plays=en?('×'+n):(n===2?'مَرَّتَيْنِ':arNum(n)+' '+(n===1?'مَرَّة':'مَرَّات'));
          h+='<div class="tb-st-row"><span>'+esc(en?(g[1]||g[0]):g[0])+'</span><span>'+esc(plays+(last?' · '+last.toLocaleDateString(en?'en-GB':'ar-EG',{day:'numeric',month:'short'}):''))+'</span></div>';
        });
        var card=d.createElement('div');card.className='tb-st-card';card.innerHTML=h;
        card.querySelector('.tb-st-name span').textContent=st.display_name||(en?'Student':'طَالِبَة');
        body.appendChild(card);
      });
    });
  }).catch(function(){});
}

/* ---------- tab bar ---------- */
function showTab(t){
  tab=t;
  if(!onBoard&&ov)ov.style.display=(t==='home')?'block':'none';
  paintTabs();
}
var ovTab=null;
function paintTabs(){
  if(!bar)return;
  var act=ovTab||(onBoard?'board':(tab==='home'?'home':'lessons'));
  var all=bar.querySelectorAll('.tb-tab');
  for(var i=0;i<all.length;i++)all[i].classList.toggle('tb-on',all[i].getAttribute('data-tb')===act);
}
function buildBar(){
  bar=d.createElement('nav');bar.className='tb-bar';bar.setAttribute('dir',isEn()?'ltr':'rtl');
  var inn=d.createElement('div');inn.className='tb-in';bar.appendChild(inn);
  var en=isEn();
  tabs().forEach(function(t){
    var b=d.createElement('button');b.type='button';
    b.className='tb-tab'+(en?' tb-en':'');
    b.setAttribute('data-tb',t.id);
    b.innerHTML=IC[t.id]+'<span></span>';
    b.querySelector('span').textContent=t.label;
    b.setAttribute('aria-label',t.label);
    b.onclick=function(){
      stopAudio();
      if(t.id==='home'){if(onBoard)location.href='../';else showTab('home');}
      else if(t.id==='lessons'){if(onBoard){try{sessionStorage.setItem('ln:tb-scroll','1');}catch(e){} location.href='../';}else{showTab('lessons');scrollTo({top:0,behavior:'smooth'});}}
      else if(t.id==='board'){if(!onBoard)location.href='board/';}
      else if(t.id==='students'){openStudents();}
      else if(t.id==='account')openAccount();
    };
    inn.appendChild(b);
  });
  d.body.appendChild(bar);
  paintTabs();
}

/* ---------- render lifecycle ---------- */
function render(){
  var r=role();
  if(!r){if(ov){ov.remove();ov=null;} if(bar){bar.remove();bar=null;} return;}
  if(!onBoard&&!ov)buildOv();
  if(ov){ /* refresh dynamic bits on language/theme change */
    ov.remove();ov=null;buildOv();
  }
  if(bar){bar.remove();bar=null;}
  buildBar();
  showTab('home');
}

css+="body.hb-bg-girl,body.hb-bg-boy{background-color:#faf5f0!important;background-image:url("+AB+"assets/tile-neut-BA34HDQK.svg),url("+AB+"assets/arch-neut-TQCGQA43.svg)!important}"+".lc-backbtn,.lc-theme-boy .lc-backbtn{border-color:#c16a7e!important;color:#7e4150!important}"+".hn-set-card,.tb-acc-card{background:#fffaf3!important}";css+="@keyframes hnPop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}";var st=d.createElement('style');st.textContent=css;d.head.appendChild(st);

/* role becomes available after gate.js */
var mo=new MutationObserver(function(muts){
  for(var i=0;i<muts.length;i++){if(muts[i].attributeName==='data-ln-role'){render();break;}}
});
mo.observe(d.documentElement,{attributes:true,attributeFilter:['data-ln-role']});
window.addEventListener('ls-sync',function(){if(role())render();});
d.addEventListener('ln-auth',function(){if(role())render();});
/* board return intents (from the old tab bar) */
try{
  if(!onBoard&&sessionStorage.getItem('ln:tb-scroll')){sessionStorage.removeItem('ln:tb-scroll');}
}catch(e){}

render();
})();
