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
var TILES={girl:['tile-girl-WL56SBA2','arch-girl-7KTCN4ZP','#fdf3f7'],boy:['tile-boy-7ICPIOXA','arch-boy-6WFI7RY5','#f2f8fd']};
var ACC={girl:['#d16a92','#7c2d49','#f3cfdd','#b14a74'],boy:['#4f7fd9','#274a86','#bcd6f5','#274a86']};

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
+'.hn-bub{flex:1;background:#fff;border-radius:18px;padding:10px 14px;box-shadow:0 3px 12px #7c2d4918}'
+'.hn-girl .hn-bub{border:2px solid #f3cfdd}'
+'.hn-boy .hn-bub{border:2px solid #bcd6f5}'
+'.hn-hi{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:21px;font-weight:700;margin:0}'
+'.hn-girl .hn-hi{color:#7c2d49}.hn-boy .hn-hi{color:#274a86}'
+'.hn-sub{font-size:13.5px;color:#9a7b88;margin:2px 0 0}'
+'.hn-boy .hn-sub{color:#7a93b8}'
+'.hn-teach{width:96px;height:auto;flex:none}'
+'.hn-card{background:#fff;border-radius:20px;padding:14px 16px;margin:0 0 14px;box-shadow:0 4px 12px #7c2d4912}'
+'.hn-girl .hn-card{border:2px solid #f3cfdd}'
+'.hn-boy .hn-card{border:2px solid #bcd6f5}'
+'.hn-label{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:13.5px;font-weight:700;margin:0 0 6px}'
+'.hn-girl .hn-label{color:#d16a92}.hn-boy .hn-label{color:#4f7fd9}'
+'.hn-dhikr{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:21px;line-height:2;color:#3d2b33;text-align:center;margin:2px 0 8px}'
+'.hn-cond{font-size:12.5px;color:#b8860b;text-align:center;margin:-4px 0 6px}'
+'.hn-virtue{font-size:12.5px;line-height:1.9;color:#9a7b88;margin:8px 0 0}'
+'.hn-src{font-size:12px;color:#b39aa6;margin:2px 0 0}'
+'.hn-listen{display:flex;align-items:center;justify-content:center;gap:6px;margin:4px auto 2px;color:#fff;border:0;border-radius:999px;padding:8px 24px;font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:15.5px;min-height:40px;cursor:pointer;box-shadow:0 3px 8px #7c2d4926}'
+'.hn-girl .hn-listen{background:#d16a92}.hn-boy .hn-listen{background:#4f7fd9}'
+'.hn-listen svg{width:16px;height:16px;fill:currentColor}'
+'.hn-cont{border-radius:20px;padding:16px;color:#fff;margin:0 0 14px}'
+'.hn-girl .hn-cont{background:linear-gradient(135deg,#d16a92,#b14a74);box-shadow:0 6px 16px #d16a9240}'
+'.hn-boy .hn-cont{background:linear-gradient(135deg,#4f7fd9,#274a86);box-shadow:0 6px 16px #4f7fd940}'
+'.hn-cont-t{font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:19px;margin:0}'
+'.hn-cont-l{font-size:14.5px;opacity:.95;margin:5px 0 10px;line-height:1.7}'
+'.hn-cont-bar{height:8px;border-radius:99px;background:#ffffff4d;overflow:hidden;margin-bottom:12px}'
+'.hn-cont-f{height:100%;background:#f5c15c;border-radius:99px}'
+'.hn-cont-btn{background:#fff;border:0;border-radius:999px;padding:8px 24px;font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:16px;min-height:40px;cursor:pointer;box-shadow:0 2px 6px #3d122030}'
+'.hn-girl .hn-cont-btn{color:#c14f7d}.hn-boy .hn-cont-btn{color:#274a86}'
+'.hn-game-t{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:20px;font-weight:700;margin:0 0 10px}'
+'.hn-girl .hn-game-t{color:#7c2d49}.hn-boy .hn-game-t{color:#274a86}'
+'.hn-play{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:999px;padding:8px 24px;color:#fff;font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:15.5px;min-height:40px;cursor:pointer;box-shadow:0 3px 8px #7c2d4926}'
+'.hn-girl .hn-play{background:#d16a92}.hn-boy .hn-play{background:#4f7fd9}'
+'.hn-card-click{cursor:pointer}'
+'.hn-gear{position:fixed;top:10px;right:10px;z-index:5;width:46px;height:46px;min-height:46px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}'
+'.hn-girl .hn-gear{border:2.5px solid #d16a92;box-shadow:0 2px 8px #7c2d4926}'
+'.hn-boy .hn-gear{border:2.5px solid #4f7fd9;box-shadow:0 2px 8px #274a8626}'
+'.hn-gear i{width:24px;height:24px;display:block;background:no-repeat center/contain}'
+'.hn-girl .hn-gear i{background-image:'+GEAR_SVG('d16a92')+'}'
+'.hn-boy .hn-gear i{background-image:'+GEAR_SVG('4f7fd9')+'}'
+'.hn-set{position:fixed;inset:0;z-index:85;background:#3d122066;display:flex;align-items:flex-end;justify-content:center}'
+'.hn-set-card{width:100%;max-width:520px;background:#fdf3f7;border-radius:22px 22px 0 0;padding:20px 18px calc(20px + env(safe-area-inset-bottom,0px));box-sizing:border-box}'
+'.hn-set-t{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:20px;font-weight:700;color:#7c2d49;margin:0 0 12px;text-align:center}'
+'.hn-set-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}'
+'.hn-set-l{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:16px;font-weight:700;color:#7c2d49}'
+'.hn-set-opts{display:flex;gap:6px}'
+'.hn-opt{border:2px solid #e8b9ca;background:#fff;color:#7c2d49;border-radius:999px;padding:7px 18px;font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:14.5px;cursor:pointer;min-height:38px}'
+'.hn-opt.on{background:#d16a92;border-color:#d16a92;color:#fff}'
+'.hn-set-close{display:block;width:100%;border:2px solid #e8b9ca;background:#fff;color:#7c2d49;border-radius:14px;padding:12px;font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:800;font-size:16px;cursor:pointer;min-height:46px;margin-top:4px}'
/* restyle the app's own settings gears to the same look (theme-aware) */
+'.lc-gear{width:46px;height:46px;min-height:46px;border-radius:50%;background:#fff;border:2.5px solid #d16a92;font-size:0;padding:0;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #7c2d4926;cursor:pointer}'
+'.lc-gear::after{content:"";width:24px;height:24px;background:no-repeat center/contain '+GEAR_SVG('d16a92')+'}'
+'body.hb-bg-boy .lc-gear{border-color:#4f7fd9;box-shadow:0 2px 8px #274a8626}'
+'body.hb-bg-boy .lc-gear::after{background-image:'+GEAR_SVG('4f7fd9')+'}'
/* tab bar (exact approved look) */
+'.tb-bar{position:fixed;left:0;right:0;bottom:0;z-index:70;background:#7c2d49;padding:6px 8px calc(6px + env(safe-area-inset-bottom,0px));display:flex;justify-content:center;box-shadow:0 -3px 14px #3d1220a0}'
+'body.hb-bg-boy .tb-bar{background:#274a86}'
+'.tb-in{display:flex;width:100%;max-width:520px;justify-content:space-around;gap:2px}'
+'.tb-tab{flex:1;border:0;background:transparent;color:#f0c3d4;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px 4px;min-height:52px;border-radius:14px;cursor:pointer;font-family:inherit}'
+'body.hb-bg-boy .tb-tab{color:#bcd6f5}'
+'.tb-tab svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'
+'.tb-tab span{font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:13px;line-height:1.2}'
+'.tb-tab.tb-en span{font-family:inherit;font-size:11.5px;font-weight:700}'
+'.tb-tab.tb-on{color:#f5c15c;background:#ffffff14}'
+'.tb-tab:active{transform:scale(.96)}'
+'.tb-acc{position:fixed;inset:0;z-index:75;background:#3d122066;display:flex;align-items:flex-end;justify-content:center}'
+'.tb-acc-card{width:100%;max-width:520px;background:#fdf3f7;border-radius:22px 22px 0 0;padding:20px 18px calc(20px + env(safe-area-inset-bottom,0px));box-sizing:border-box;text-align:center}'
+'.tb-acc-name{font-family:Naskh,"Noto Naskh Arabic",serif;font-size:22px;font-weight:700;color:#7c2d49;margin:0 0 2px}'
+'.tb-acc-role{font-size:14.5px;color:#9a7b88;margin:0 0 14px}'
+'.tb-acc-btn{display:block;width:100%;border:0;border-radius:14px;padding:13px;min-height:48px;font-family:inherit;font-size:16.5px;font-weight:800;cursor:pointer;margin-top:8px}'
+'.tb-acc-out{background:#d16a92;color:#fff}'
+'.tb-acc-close{background:#fff;color:#7c2d49;border:2px solid #e8b9ca}'
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
  h+='<div class="hn-cont"><p class="hn-cont-t">'+(en?'Continue where you left off':'كَمِّلِي مِنْ حَيْثُ وَقَفْتِ')+'</p>';
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
  ov.innerHTML+= '<button type="button" class="hn-gear" data-hn="gear" aria-label="'+(en?'Settings':'الْإِعْدَادَاتُ')+'"><i></i></button>';
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
  ov2.innerHTML='<div class="hn-set-card"><p class="hn-set-t">'+(en?'Settings':'الْإِعْدَادَاتُ')+'</p>'
    +'<div class="hn-set-row"><span class="hn-set-l">'+(en?'Language':'اللُّغَةُ')+'</span><span class="hn-set-opts">'
    +'<button type="button" class="hn-opt'+(!en?' on':'')+'" data-lang="ar">العربية</button>'
    +'<button type="button" class="hn-opt'+(en?' on':'')+'" data-lang="en">English</button></span></div>'
    +'<div class="hn-set-row"><span class="hn-set-l">'+(en?'Character':'الشَّخْصِيَّةُ')+'</span><span class="hn-set-opts">'
    +'<button type="button" class="hn-opt'+(g==='girl'?' on':'')+'" data-g="girl">'+(en?'Girl':'بِنْت')+'</button>'
    +'<button type="button" class="hn-opt'+(g==='boy'?' on':'')+'" data-g="boy">'+(en?'Boy':'وَلَد')+'</button></span></div>'
    +'<button type="button" class="hn-set-close">'+(en?'Close':'إِغْلَاق')+'</button></div>';
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

/* ---------- account sheet (from the old tab bar) ---------- */
function openAccount(){
  var en=isEn();
  var ov3=d.createElement('div');ov3.className='tb-acc';
  var p=window.LN&&LN.profile;
  var name=(p&&p.display_name)||(en?'User':'المستخدمة');
  var rl=role()==='teacher'?(en?'Teacher':'مُعَلِّمة'):(en?'Student':'طالبة');
  ov3.innerHTML='<div class="tb-acc-card"><p class="tb-acc-name"></p><p class="tb-acc-role"></p>'
    +'<button class="tb-acc-btn tb-acc-out"></button><button class="tb-acc-btn tb-acc-close"></button></div>';
  ov3.querySelector('.tb-acc-name').textContent=name;
  ov3.querySelector('.tb-acc-role').textContent=rl;
  var out=ov3.querySelector('.tb-acc-out');out.textContent=en?'Sign out':'تسجيل الخروج';
  var cl=ov3.querySelector('.tb-acc-close');cl.textContent=en?'Close':'إغلاق';
  cl.onclick=function(){ov3.remove();};
  ov3.addEventListener('click',function(e){if(e.target===ov3)ov3.remove();});
  out.onclick=function(){out.disabled=true;out.textContent=en?'Signing out...':'جارٍ تسجيل الخروج...';
    if(window.LN&&LN.signOut)LN.signOut().then(function(){location.reload();},function(){location.reload();});
    else location.reload();};
  d.body.appendChild(ov3);
}

/* ---------- tab bar ---------- */
function showTab(t){
  tab=t;
  if(!onBoard&&ov)ov.style.display=(t==='home')?'block':'none';
  paintTabs();
}
function paintTabs(){
  if(!bar)return;
  var act=onBoard?'board':(tab==='home'?'home':'lessons');
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
      else if(t.id==='students'){try{sessionStorage.setItem('ln:tb-students','1');}catch(e){} if(!onBoard)location.href='board/';else{var bb=d.querySelector('[data-w="students"]')||[].slice.call(d.querySelectorAll('button')).filter(function(x){return (x.textContent||'').indexOf('طلابي')>-1;})[0];if(bb)bb.click();}}
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

var st=d.createElement('style');st.textContent=css;d.head.appendChild(st);

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
  if(onBoard&&sessionStorage.getItem('ln:tb-students')){sessionStorage.removeItem('ln:tb-students');
    setTimeout(function(){var bb=d.querySelector('[data-w="students"]')||[].slice.call(d.querySelectorAll('button')).filter(function(x){return (x.textContent||'').indexOf('طلابي')>-1;})[0];if(bb)bb.click();},900);}
}catch(e){}

render();
})();
