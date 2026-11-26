/* Lisanura lab - storybook shared helpers: teacher figure, level-up celebration, auto-advance */
(function(){
"use strict";
var TEACHER_FULL='assets/teacher-full.png';
var TEACHER_POINT='assets/teacher-point.png';
var CHEER='../assets/cheer.mp3';
function teacher(which,cls){
  var im=document.createElement('img');
  im.src=which==='point'?TEACHER_POINT:TEACHER_FULL;
  im.alt='';im.className='sb-teacher'+(cls?' '+cls:'');
  document.body.appendChild(im);return im;
}
function cheer(){try{var a=new Audio(CHEER);a.play().catch(function(){});}catch(e){}}
function confetti(host,n){
  var cols=['#f191b3','#ffd964','#6cc884','#7fb3e8','#e05b5b','#f0a92e'];
  for(var i=0;i<(n||26);i++){
    var c=document.createElement('div');c.className='sb-confetti';
    c.style.right=(Math.random()*100)+'%';
    c.style.background=cols[i%cols.length];
    c.style.animationDuration=(2.2+Math.random()*1.8)+'s';
    c.style.animationDelay=(Math.random()*0.7)+'s';
    host.appendChild(c);
  }
}
/* levelUp({stars:0-3, text, next, delay}) - celebration then auto-advance like the reference flow */
function levelUp(o){
  o=o||{};
  var stars=o.stars==null?3:o.stars;
  var ov=document.createElement('div');ov.className='sb-lv';
  var ribbon=document.createElement('div');ribbon.className='sb-lv-ribbon';ribbon.textContent=o.title||'برافو!';ribbon.setAttribute('dir',/[\u0600-\u06FF]/.test(ribbon.textContent)?'rtl':'ltr');
  var st=document.createElement('div');st.className='sb-lv-stars';
  for(var i=0;i<3;i++){var s=document.createElement('div');s.className='sb-star'+(i<stars?' on':'');st.appendChild(s);}
  var t=document.createElement('img');t.src=TEACHER_FULL;t.alt='';t.className='sb-lv-teacher';
  var pod=document.createElement('div');pod.className='sb-lv-podium';
  var tx=document.createElement('div');tx.className='sb-lv-text';tx.textContent=o.text||'';tx.setAttribute('dir',/[\u0600-\u06FF]/.test(tx.textContent)?'rtl':'ltr');
  var nx=document.createElement('div');nx.className='sb-lv-next';nx.textContent=o.nextText||(o.next?'بنروح اللعبة اللي بعدها':'بنرجع لقائمة العينات');
  ov.appendChild(ribbon);ov.appendChild(st);ov.appendChild(t);ov.appendChild(pod);
  if(o.text)ov.appendChild(tx);
  if(o.next!==null)ov.appendChild(nx);
  document.body.appendChild(ov);
  confetti(ov,o.confetti||26);
  cheer();
  if(o.next)setTimeout(function(){location.href=o.next;},o.delay||3000);
  return ov;
}
window.SB={teacher:teacher,cheer:cheer,levelUp:levelUp,confetti:confetti};
/* profile + stars (lab): gender, running star tally, games played */
var KEY='lab:profile.v1';
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{};}catch(e){return {};}}
function save(p){try{localStorage.setItem(KEY,JSON.stringify(p));}catch(e){}}
var profile={
  get:function(){var p=load();p.stars=p.stars||0;p.games=p.games||0;p.log=p.log||[];return p;},
  setGender:function(g){var p=load();p.gender=g;save(p);},
  gender:function(){return load().gender||null;},
  addStars:function(n,why){var p=profile.get();p.stars+=n;p.log.push({t:Date.now(),n:n,why:why||''});if(p.log.length>200)p.log.shift();save(p);return p.stars;},
  gamePlayed:function(game,stars){var p=profile.get();p.games+=1;p.stars+=stars||0;p.log.push({t:Date.now(),n:stars||0,why:'game:'+(game||'')});if(p.log.length>200)p.log.shift();save(p);return p;}
};
window.SB.profile=profile;

})();
