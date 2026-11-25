/* Lisanura lab - storybook shared helpers: teacher figure, level-up celebration, auto-advance */
(function(){
"use strict";
var TEACHER_FULL='../board/teacher-full.png';
var TEACHER_POINT='../board/teacher-point.png';
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
  var ribbon=document.createElement('div');ribbon.className='sb-lv-ribbon';ribbon.textContent=o.title||'برافو!';
  var st=document.createElement('div');st.className='sb-lv-stars';
  for(var i=0;i<3;i++){var s=document.createElement('div');s.className='sb-star'+(i<stars?' on':'');st.appendChild(s);}
  var t=document.createElement('img');t.src=TEACHER_FULL;t.alt='';t.className='sb-lv-teacher';
  var pod=document.createElement('div');pod.className='sb-lv-podium';
  var tx=document.createElement('div');tx.className='sb-lv-text';tx.textContent=o.text||'';
  var nx=document.createElement('div');nx.className='sb-lv-next';nx.textContent=o.next?'بنروح اللعبة اللي بعدها':'بنرجع لقائمة العينات';
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
})();
