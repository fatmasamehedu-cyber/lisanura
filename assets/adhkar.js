/* Lisanura "Daily adhkar" section: adds a door on the home page and a
   card-based adhkar experience (situation cards -> dua panel).
   Loaded after supa.js/gate.js on the home page. Self-contained (own CSS/JS).

   To add a new dhikr: copy one entry in DUAS below, give it a new id,
   write the Arabic text with FULL tashkeel exactly from a verified source,
   add its image as assets/adhkar-<id>.webp, and (optionally) record audio
   as assets/adhkar-<id>.mp3 then set audio to that path. */
(function(){
var d=document;

/* ---------- data ---------- */
var DUAS=[
  {
    id:'waking',
    titleAr:'الاستيقاظ من النوم',
    titleEn:'Waking up',
    img:'assets/adhkar-waking.webp',
    imgGirl:'assets/adhkar-waking-girl.webp',
    imgBoy:'assets/adhkar-waking-boy.webp',
    ar:'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    ref:'رواه البخاري',
    meaningAr:'نحمد الله أنه أعاد لنا الحياة بعد النوم، وإليه نرجع يوم القيامة.',
    meaningEn:'Praise be to Allah Who gave us life after He caused us to die, and to Him is the resurrection.',
    translit:'Alhamdu lillaahil-lathee ahyaanaa ba’da maa amaatanaa wa ilayhin-nushoor.',
    audio:'assets/adhkar-waking.mp3'
  },
  {
    id:'sleep',
    titleAr:'قبل النوم',
    titleEn:'Before sleep',
    img:'assets/adhkar-sleep.webp',
    imgGirl:'assets/adhkar-sleep-girl.webp',
    imgBoy:'assets/adhkar-sleep-boy.webp',
    ar:'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا',
    ref:'رواه البخاري',
    meaningAr:'يا الله، بذكرك واسمك أنام وأستيقظ؛ فالنوم يشبه الموت والاستيقاظ يشبه الحياة.',
    meaningEn:'O Allah, in Your name I die and I live. (Sleep is like a small death and waking up is like coming back to life.)',
    translit:'Allaahumma bismika amootu wa ahyaa.',
    audio:'assets/adhkar-sleep.mp3'
  },
  {
    id:'homeout',
    titleAr:'الخروج من المنزل',
    titleEn:'Leaving home',
    img:'assets/adhkar-homeout.webp',
    imgGirl:'assets/adhkar-homeout-girl.webp',
    imgBoy:'assets/adhkar-homeout-boy.webp',
    ar:'بِسْمِ اللهِ، تَوَكَّلْتُ عَلَى اللهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
    ref:'رواه أبو داود والترمذي',
    meaningAr:'أبدأ باسم الله وأتوكل عليه، ولا قوة لي إلا به.',
    meaningEn:'In the name of Allah, I put my trust in Allah, and there is no might nor power except with Allah.',
    translit:'Bismillaah, tawakkaltu ‘alallaah, wa laa hawla wa laa quwwata illaa billaah.',
    audio:'assets/adhkar-homeout.mp3'
  },
  {
    id:'homein',
    titleAr:'دخول المنزل',
    titleEn:'Entering home',
    img:'assets/adhkar-homein.webp',
    imgGirl:'assets/adhkar-homein-girl.webp',
    imgBoy:'assets/adhkar-homein-boy.webp',
    ar:'بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
    ref:'رواه أبو داود',
    meaningAr:'باسم الله دخلنا بيتنا، وباسمه نخرج منه، وعليه وحده نعتمد.',
    meaningEn:'In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we rely.',
    translit:'Bismillaahi walajnaa, wa bismillaahi kharajnaa, wa ‘alaa rabbinaa tawakkalnaa.',
    audio:'assets/adhkar-homein.mp3'
  },
  {
    id:'mosquein',
    titleAr:'دخول المسجد',
    titleEn:'Entering the mosque',
    img:'assets/adhkar-mosquein.webp',
    imgGirl:'assets/adhkar-mosquein-girl.webp',
    imgBoy:'assets/adhkar-mosquein-boy.webp',
    ar:'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    ref:'رواه مسلم',
    meaningAr:'يا الله، افتح لي أبواب رحمتك حين أدخل بيتك.',
    meaningEn:'O Allah, open for me the doors of Your mercy.',
    translit:'Allaahummaf-tah lee abwaaba rahmatik.',
    audio:'assets/adhkar-mosquein.mp3'
  },
  {
    id:'mosqueout',
    titleAr:'الخروج من المسجد',
    titleEn:'Leaving the mosque',
    img:'assets/adhkar-mosqueout.webp',
    imgGirl:'assets/adhkar-mosqueout-girl.webp',
    imgBoy:'assets/adhkar-mosqueout-boy.webp',
    ar:'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    ref:'رواه مسلم',
    meaningAr:'يا الله، إني أسألك من عطائك وخيرك.',
    meaningEn:'O Allah, I ask You from Your bounty.',
    translit:'Allaahumma innee as’aluka min fadlik.',
    audio:'assets/adhkar-mosqueout.mp3'
  },
  {
    id:'toiletin',
    titleAr:'دخول الخلاء',
    titleEn:'Entering the restroom',
    img:'assets/adhkar-toiletin.webp',
    imgGirl:'assets/adhkar-toiletin-girl.webp',
    imgBoy:'assets/adhkar-toiletin-boy.webp',
    ar:'بِسْمِ اللهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    ref:'متفق عليه',
    meaningAr:'باسم الله أدخل، وأستجير به من الشياطين وكل أذى.',
    meaningEn:'In the name of Allah. O Allah, I seek refuge in You from evil and all harm.',
    translit:'Bismillaah, allaahumma innee a’oothu bika minal-khubthi wal-khabaa’ith.',
    audio:'assets/adhkar-toiletin.mp3'
  },
  {
    id:'toiletout',
    titleAr:'الخروج من الخلاء',
    titleEn:'Leaving the restroom',
    img:'assets/adhkar-toiletout.webp',
    imgGirl:'assets/adhkar-toiletout-girl.webp',
    imgBoy:'assets/adhkar-toiletout-boy.webp',
    ar:'غُفْرَانَكَ',
    ref:'رواه أبو داود والترمذي',
    meaningAr:'أسألك يا الله المغفرة.',
    meaningEn:'I ask Your forgiveness, O Allah.',
    translit:'Ghufraanak.',
    audio:'assets/adhkar-toiletout.mp3'
  },
  {
    id:'eatbefore',
    titleAr:'قبل الطعام',
    titleEn:'Before eating',
    img:'assets/adhkar-eatbefore.webp',
    imgGirl:'assets/adhkar-eatbefore-girl.webp',
    imgBoy:'assets/adhkar-eatbefore-boy.webp',
    ar:'بِسْمِ اللهِ',
    ref:'متفق عليه',
    meaningAr:'نبدأ الطعام باسم الله فيبارك لنا فيه.',
    meaningEn:'We start our food with the name of Allah.',
    translit:'Bismillaah.',
    audio:'assets/adhkar-eatbefore.mp3'
  },
  {
    id:'eatafter',
    titleAr:'بعد الطعام',
    titleEn:'After eating',
    img:'assets/adhkar-eatafter.webp',
    imgGirl:'assets/adhkar-eatafter-girl.webp',
    imgBoy:'assets/adhkar-eatafter-boy.webp',
    ar:'الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ، غَيْرَ مَكْفِيٍّ وَلَا مُوَدَّعٍ وَلَا مُسْتَغْنًى عَنْهُ رَبَّنَا',
    ref:'رواه البخاري',
    meaningAr:'نحمد الله حمدا كثيرا جميلا مباركا؛ فنحن لا نستغني عن فضله أبدا.',
    meaningEn:'Praise be to Allah, abundant, good and blessed praise. We can never do without our Lord’s favor.',
    translit:'Alhamdu lillaahi hamdan katheeran tayyiban mubaarakan feeh, ghayra makfiyyin wa laa muwadda‘in wa laa mustaghnan ‘anhu rabbanaa.',
    audio:'assets/adhkar-eatafter.mp3'
  },
  {
    id:'clothes',
    titleAr:'لبس الثوب',
    titleEn:'Getting dressed',
    img:'assets/adhkar-clothes.webp',
    imgGirl:'assets/adhkar-clothes-girl.webp',
    imgBoy:'assets/adhkar-clothes-boy.webp',
    ar:'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةَ',
    ref:'رواه أبو داود والترمذي',
    meaningAr:'الحمد لله الذي أعطاني هذا اللباس، ولم أصنعه بقوتي.',
    meaningEn:'Praise be to Allah Who clothed me with this garment and provided it for me, without any might or power of my own.',
    translit:'Alhamdu lillaahil-lathee kasaanee haathath-thawba wa razaqaneehi min ghayri hawlin minnee wa laa quwwah.',
    audio:'assets/adhkar-clothes.mp3'
  },
  {
    id:'riding',
    titleAr:'الركوب والسفر',
    titleEn:'Riding and traveling',
    img:'assets/adhkar-riding.webp',
    imgGirl:'assets/adhkar-riding-girl.webp',
    imgBoy:'assets/adhkar-riding-boy.webp',
    ar:'بِسْمِ اللهِ وَالْحَمْدُ لِلَّهِ، ﴿سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ * وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ﴾',
    ref:'رواه مسلم',
    meaningAr:'سبحان الله الذي جعل لنا هذه الراحلة ولم نكن لنقدر عليها بأنفسنا، وإلى الله نعود.',
    meaningEn:'In the name of Allah, and praise be to Allah. Glory to Him Who made this ride possible for us; we could never have done it alone. And to our Lord we shall return.',
    translit:'Bismillaahi walhamdu lillaah. Subhaanal-lathee sakhkhara lanaa haathaa wa maa kunnaa lahu muqrineen, wa innaa ilaa rabbinaa lamunqaliboon.',
    audio:'assets/adhkar-riding.mp3'
  }
];

/* ---------- daily dhikr pool (14, shared with the Home card) ---------- */
var POOL=null,poolP=null;
function loadPool(){
  if(poolP)return poolP;
  poolP=fetch('assets/dhikr-pool.json?v=2').then(function(r){return r.json();}).then(function(j){
    POOL=j.map(function(it,n){return {id:'pool'+n,pool:true,titleAr:'ذكر اليوم',titleEn:'Dhikr of the day',
      ar:it.text,ref:it.source||'',virtue:it.virtue||'',condition:it.condition||'',audio:'assets/'+it.audio,
      meaningAr:it.meaningAr||'',meaningEn:it.meaningEn||'',translit:it.translit||''};});
    if(ov&&view==='list')render();
    return POOL;
  }).catch(function(){POOL=[];return POOL;});
  return poolP;
}

/* ---------- language ---------- */
function lang(){try{var v=localStorage.getItem('letters-city:lang.v1');return (v===null?'en':JSON.parse(v))==='en'?'en':'ar';}catch(e){return 'en';}}
function isEn(){return lang()==='en';}
/* gender picked on the site: "girl" | "boy" | "" (letters-city:gender.v1).
   girl -> ponytail images, boy -> boy images, unset -> the original hijab images. */
function gender(){try{var v=localStorage.getItem('letters-city:gender.v1');var g=v===null?'':JSON.parse(v);return g==='boy'?'boy':(g==='girl'?'girl':'');}catch(e){return '';}}
function imgFor(it){var g=gender();if(!g&&window.LN&&LN.profile&&LN.profile.role==='teacher')g='girl';return g==='boy'?it.imgBoy:(g==='girl'?it.imgGirl:it.img);}

/* ---------- styles ---------- */
var css=''
+'.ak-door-heart{width:30px;height:30px}'
+'.ak-ov{position:fixed;inset:0;z-index:200;overflow:auto;-webkit-overflow-scrolling:touch;padding:14px 14px 40px;box-sizing:border-box}'
+'.ak-wrap{max-width:460px;margin:0 auto}'
+'.ak-top{display:flex;align-items:center;gap:10px;margin:4px 0 12px}'
+'.ak-back{display:inline-flex;align-items:center;gap:6px;border:2px solid #c16a7e;background:#fff;color:#7e4150;font-weight:700;font-size:15.5px;border-radius:999px;padding:6px 14px;min-height:44px;cursor:pointer;font-family:inherit}'
+'.ak-back svg{width:16px;height:16px}'
+'.ak-h{font-family:"Noto Naskh Arabic",serif;font-weight:700;font-size:26px;color:#7e4150;margin:0;flex:1;text-align:center;line-height:1.5}'
+'.ak-cards{display:grid;gap:16px;margin-top:8px}'
+'.ak-card{border:0;padding:0;background:#fff;border-radius:22px;overflow:hidden;cursor:pointer;text-align:start;font-family:inherit;box-shadow:0 3px 12px #7e515022;border:2px solid #ecd5ce;display:block;width:100%}'
+'.ak-card.ak-hl{border-color:#d9a44f;box-shadow:0 0 0 3px #d9a44f55,0 3px 12px #7e515022;transition:box-shadow .3s,border-color .3s}'
+'.ak-card:active{transform:scale(.985)}'
+'.ak-card-img{display:block;width:100%;aspect-ratio:3/2;object-fit:cover;background:linear-gradient(135deg,#f9dce8,#faf5f0)}'
+'.ak-card-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px 14px}'
+'.ak-card-t{display:grid;gap:2px}'
+'.ak-card-t b{font-family:"Noto Naskh Arabic",serif;font-size:21px;color:#7e4150;line-height:1.6}'
+'.ak-card-t small{font-size:14.5px;color:#a98b7f}'
+'.ak-go{width:40px;height:40px;border-radius:12px;background:#c16a7e;color:#fff;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto}'
+'.ak-go svg{width:18px;height:18px}'
+'.ak-hero{width:100%;border-radius:20px;display:block;border:3px solid #fff;box-shadow:0 3px 12px #7e515022;margin-bottom:14px}'
+'.ak-arbox{background:#fffaf0;border:2px solid #e6d3a8;border-radius:18px;padding:16px;text-align:center}'
+'.ak-ar{font-family:"Noto Naskh Arabic",serif;font-size:27px;line-height:2.1;margin:0;color:#3a2d1d}'
+'.ak-ref{margin:8px 0 0;font-size:13.5px;color:#7a6a55;font-weight:600}'
+'.ak-listen{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;margin:16px 0;border:0;border-radius:16px;padding:14px;min-height:56px;font-family:inherit;font-size:19px;font-weight:800;color:#fff;background:linear-gradient(135deg,#e8b23e,#d1922a);box-shadow:0 4px 12px #965a1459;cursor:pointer}'
+'.ak-listen:active{transform:scale(.98)}'
+'.ak-listen svg{width:22px;height:22px}'
+'.ak-listen.ak-stop{background:linear-gradient(135deg,#c16a7e,#b3466d)}'
+'.ak-box{background:#fff;border:2px solid #f0d4de;border-radius:18px;padding:12px 16px;margin-bottom:14px}'
+'.ak-box-h{margin:0 0 4px;font-size:16px;font-weight:800;color:#c08a2e}'
+'.ak-box-h.ak-rose{color:#c16a7e}'
+'.ak-box-p{margin:0;font-size:16.5px;line-height:1.9;color:#4d3533}'
+'.ak-note{text-align:center;color:#a98b7f;font-size:14px;margin:6px 0 0}'
+'.ak-pool-h{font-family:Naskh,"Noto Naskh Arabic",serif;font-weight:700;font-size:15px;color:#a8566d;margin:14px 2px 8px}.ak-ov.lc-theme-boy .ak-pool-h{color:#7e4150}.ak-virtue{font-size:12.5px;line-height:1.9;color:#a98b7f;margin:8px 0 0}.ak-cond{font-size:12.5px;color:#b8860b;margin:6px 0 0}.ak-toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#7e4150;color:#fff;padding:10px 18px;border-radius:999px;font-size:14.5px;z-index:210;box-shadow:0 4px 14px #0003}.ak-bg{position:fixed;inset:0;z-index:-1;pointer-events:none}.ak-ov.lc-theme-girl .ak-bg{background-color:#faf5f0;background-image:url(assets/tile-neut-BA34HDQK.svg),url(assets/arch-neut-TQCGQA43.svg);background-repeat:repeat,no-repeat;background-size:96px 96px,340px auto;background-position:0 0,center 118px}.ak-ov.lc-theme-boy .ak-bg{background-color:#faf5f0;background-image:url(assets/tile-neut-BA34HDQK.svg),url(assets/arch-neut-TQCGQA43.svg);background-repeat:repeat,no-repeat;background-size:96px 96px,340px auto;background-position:0 0,center 118px}/* app theme: same ornament pattern + boy/girl palette as the rest of the app */.ak-ov.lc-theme-girl{background-color:#faf5f0;background-image:url(assets/tile-neut-BA34HDQK.svg),url(assets/arch-neut-TQCGQA43.svg);background-repeat:repeat,no-repeat;background-size:96px 96px,340px auto;background-position:0 0,center 118px}.ak-ov.lc-theme-boy{background-color:#faf5f0;background-image:url(assets/tile-neut-BA34HDQK.svg),url(assets/arch-neut-TQCGQA43.svg);background-repeat:repeat,no-repeat;background-size:96px 96px,340px auto;background-position:0 0,center 118px}.ak-ov.lc-theme-boy .ak-back{border-color:#c16a7e;color:#7e4150}.ak-ov.lc-theme-boy .ak-h{color:#7e4150}.ak-ov.lc-theme-boy .ak-card{border-color:#eed3cd;box-shadow:0 3px 12px #7e415022}.ak-ov.lc-theme-boy .ak-card-t b{color:#7e4150}.ak-ov.lc-theme-boy .ak-card-t small{color:#a98b7f}.ak-ov.lc-theme-boy .ak-go{background:#c16a7e}.ak-ov.lc-theme-boy .ak-box{border-color:#eed3cd}.ak-ov.lc-theme-boy .ak-box-h.ak-rose{color:#c16a7e}.ak-ov.lc-theme-boy .ak-listen.ak-stop{background:linear-gradient(135deg,#c16a7e,#7e4150)}.ak-ov.lc-theme-boy .ak-toast{background:#7e4150}';

/* ---------- overlay ---------- */
var ov=null,view='list',cur=null,aud=null;
function stopAudio(){
  try{if(window.speechSynthesis)speechSynthesis.cancel();}catch(e){}
  if(aud){try{aud.pause();}catch(e){} aud=null;}
}
function toast(m){
  var t=d.createElement('div');t.className='ak-toast';t.textContent=m;
  d.body.appendChild(t);setTimeout(function(){t.remove();},2400);
}
function backSvg(){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
}
function playSvg(){
  return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
}
function stopSvg(){
  return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function speak(item,btn){
  stopAudio();
  if(item.audio){
    aud=new Audio(item.audio);
    aud.onended=function(){aud=null;paintListen(btn,false);};
    aud.onerror=function(){aud=null;paintListen(btn,false);toast(isEn()?'Audio not available yet':'الصوت غير متاح بعد');};
    var pr=aud.play();
    if(pr&&pr.then)pr.catch(function(){aud=null;paintListen(btn,false);toast(isEn()?'Tap again to hear the dua':'اضغطي مرة أخرى للسماع');});
    paintListen(btn,true);
    return;
  }
  if(!window.speechSynthesis){toast(isEn()?'Audio not available on this device yet':'الصوت غير متاح على هذا الجهاز بعد');return;}
  var u=new SpeechSynthesisUtterance(item.ar);
  u.lang='ar-SA';u.rate=.72;u.pitch=1;
  var vs=speechSynthesis.getVoices(),v=null;
  for(var i=0;i<vs.length;i++){if(/^ar([_-]|$)/i.test(vs[i].lang)){v=vs[i];break;}}
  if(!v){toast(isEn()?'No Arabic voice on this device yet':'لا يوجد صوت عربي على هذا الجهاز بعد');return;}
  u.voice=v;
  u.onend=function(){paintListen(btn,false);};
  u.onerror=function(){paintListen(btn,false);};
  speechSynthesis.speak(u);
  paintListen(btn,true);
}
function paintListen(btn,playing){
  if(!btn||!btn.isConnected)return;
  btn.classList.toggle('ak-stop',!!playing);
  btn.innerHTML=(playing?stopSvg():playSvg())+'<span>'+(playing?(isEn()?'Stop':'إيقاف'):(isEn()?'Listen and repeat':'استمعي ورددي'))+'</span>';
}

function themeOf(){try{var g=JSON.parse(localStorage.getItem('letters-city:gender.v1')||'"girl"');return g==='boy'?'boy':'girl';}catch(e){return 'girl';}}
function applyTheme(){
  if(!ov)return;
  var g=themeOf();
  ov.className='ak-ov lc-theme-'+g;
  ov.style.backgroundColor=(g==='boy'?'#faf5f0':'#faf5f0');
  ov.style.backgroundImage='url(assets/tile-'+g+'-'+(g==='boy'?'7ICPIOXA':'WL56SBA2')+'.svg),url(assets/arch-'+g+'-'+(g==='boy'?'6WFI7RY5':'7KTCN4ZP')+'.svg)';
  ov.style.backgroundRepeat='repeat,no-repeat';
  ov.style.backgroundSize='96px 96px,340px auto';
  ov.style.backgroundPosition='0 0,center 118px';
}
function render(){
  if(!ov)return;
  applyTheme();
  var en=isEn();
  ov.setAttribute('dir',en?'ltr':'rtl');
  var h='';
  h+='<div class="ak-bg"></div>';
  h+='<div class="ak-top">';
  if(view==='detail'){
    h+='<button type="button" class="ak-back" data-ak="list">'+backSvg()+'<span>'+(en?'All adhkar':'كل الأذكار')+'</span></button>';
    h+='<h2 class="ak-h">'+(en?esc(cur.titleEn):esc(cur.titleAr))+'</h2>';
  }else{
    h+='<button type="button" class="ak-back" data-ak="close">'+backSvg()+'<span>'+(en?'Back':'رجوع')+'</span></button>';
    h+='<h2 class="ak-h">'+(en?'Daily adhkar':'أذكار اليوم')+'</h2>';
  }
  h+='</div>';
  if(view==='list'){
    h+='<div class="ak-cards">';
    DUAS.forEach(function(it){
      h+='<button type="button" class="ak-card" data-ak="open" data-id="'+it.id+'">'
        +'<img class="ak-card-img" src="'+imgFor(it)+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">'
        +'<span class="ak-card-row"><span class="ak-card-t"><b>'+(en?esc(it.titleEn):esc(it.titleAr))+'</b>'
        +(en?'<small>'+esc(it.titleAr)+'</small>':'')+'</span>'
        +'<span class="ak-go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="'+(en?'M9 6l6 6-6 6':'M15 6l-6 6 6 6')+'"/></svg></span>'
        +'</span></button>';
    });
    if(POOL&&POOL.length){
      h+='<div class="ak-pool-h">'+(en?'More adhkar':'أذكار متنوعة')+'</div>';
      POOL.forEach(function(it){
        h+='<button type="button" class="ak-card" data-ak="open" data-id="'+it.id+'">'
          +'<span class="ak-card-row"><span class="ak-card-t"><b dir="rtl">'+esc(it.ar)+'</b>'
          +(it.condition?'<small dir="rtl">'+esc(it.condition)+'</small>':'')
          +'</span>'
          +'<span class="ak-go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="'+(en?'M9 6l6 6-6 6':'M15 6l-6 6 6 6')+'"/></svg></span>'
          +'</span></button>';
      });
    }
    h+='</div>';
  }else{
    if(!cur.pool)h+='<img class="ak-hero" src="'+imgFor(cur)+'" alt="" onerror="this.style.display=\'none\'">';
    h+='<div class="ak-arbox"><p class="ak-ar" lang="ar" dir="rtl">'+esc(cur.ar)+'</p>'
      +(cur.condition?'<p class="ak-cond" dir="rtl">'+esc(cur.condition)+'</p>':'')
      +(cur.virtue?'<p class="ak-virtue" dir="rtl">'+esc(cur.virtue)+'</p>':'')
      +'<p class="ak-ref">'+esc(cur.ref)+'</p></div>'
      +'<button type="button" class="ak-listen" data-ak="listen"></button>'
      +(cur.meaningAr?'<div class="ak-box"><h3 class="ak-box-h">'+(en?'What it means':'ماذا يعني؟')+'</h3><p class="ak-box-p">'+esc(en?cur.meaningEn:cur.meaningAr)+'</p></div>':'')
      +(en&&cur.translit?'<div class="ak-box"><h3 class="ak-box-h ak-rose">Pronunciation</h3><p class="ak-box-p" dir="ltr">'+esc(cur.translit)+'</p></div>':'');
  }
  ov.innerHTML='<div class="ak-wrap">'+h+'</div>';
  if(view==='detail')paintListen(ov.querySelector('[data-ak=listen]'),false);
}

function open(){
  if(ov)return;
  ov=d.createElement('div');ov.className='ak-ov';
  view='list';cur=null;
  loadPool();
  d.body.appendChild(ov);render();
  ov.addEventListener('click',function(e){
    var t=e.target.closest('[data-ak]');if(!t)return;
    var k=t.getAttribute('data-ak');
    if(k==='close'){close();}
    else if(k==='list'){stopAudio();var back=cur?cur.id:null;view='list';cur=null;render();scrollToCard(back);}
    else if(k==='open'){
      stopAudio();
      var id=t.getAttribute('data-id');
      cur=DUAS.concat(POOL||[]).filter(function(x){return x.id===id;})[0]||null;
      if(cur){view='detail';render();ov.scrollTop=0;}
    }
    else if(k==='listen'){
      if(t.classList.contains('ak-stop')){stopAudio();paintListen(t,false);}
      else speak(cur,t);
    }
  });
}
function close(){stopAudio();if(ov){ov.remove();ov=null;}}
function scrollToCard(id){
  if(!ov)return;
  if(!id)return;
  var c=ov.querySelector('.ak-card[data-id="'+id+'"]');
  if(!c)return;
  c.scrollIntoView({block:'center'});
  c.classList.add('ak-hl');
  setTimeout(function(){if(c.isConnected)c.classList.remove('ak-hl');},2200);
}

/* ---------- door on the home page ---------- */
var DOOR_C='#d9a44f';
function heartIcon(){
  return '<svg class="ak-door-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>';
}
function paintDoor(b){
  var en=isEn();
  b.innerHTML='<span class="hb-door-icon">'+heartIcon()+'</span>'
    +'<span class="hb-door-txt"><b>'+(en?'Daily adhkar':'أذكار اليوم')+'</b>'
    +'<small>'+(en?'Short duas for your day':'أدعية قصيرة ليومك')+'</small></span>';
}
function ensureDoor(){
  var host=d.querySelector('.hb-doors');if(!host)return false;
  var b=d.getElementById('akDoor');
  if(!b){
    b=d.createElement('button');b.type='button';b.id='akDoor';b.className='hb-door';
    b.style.setProperty('--hb-c',DOOR_C);
    b.addEventListener('click',open);
  }
  var en=isEn();
  if(b._akLang!==en||!b.firstChild){b._akLang=en;paintDoor(b);}
  if(b.parentNode!==host)host.appendChild(b);
  return true;
}

/* ---------- boot ---------- */
function boot(){
  if(d.getElementById('akStyle'))return;
  var st=d.createElement('style');st.id='akStyle';st.textContent=css;d.head.appendChild(st);
  ensureDoor();
  var mo=new MutationObserver(function(){ensureDoor();});
  mo.observe(d.body,{childList:true,subtree:true});
  window.addEventListener('ls-sync',function(){var b=d.getElementById('akDoor');if(b)b._akLang=null;ensureDoor();if(ov)render();});
}
if(d.body)boot();else d.addEventListener('DOMContentLoaded',boot);
})();
