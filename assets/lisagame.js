/* LisaNura: adds one "game" card at the top of each door page (Arabic, Quran, Islamic).
   It only adds a link to /game/?s=a|q|i. It changes nothing else on the page. */
(function(){
var D={
 arabic:{s:'a',c:'#d16a92',ar:['لعبة اللغة العربية','حروف وكلمات وقواعد بالصوت'],en:['Arabic language game','Letters, words and grammar with voice'],
  ic:'<path d="M4 5.5C7 4.5 10 5 12 7c2-2 5-2.5 8-1.5v13c-3-1-6-.5-8 1.5-2-2-5-2.5-8-1.5z"/><path d="M12 7v13"/>'},
 quran:{s:'q',c:'#4f9a7a',ar:['لعبة القرآن والتجويد','أسئلة التجويد بالصوت'],en:['Quran and Tajweed game','Tajweed questions with voice'],
  ic:'<rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="6" y="6" width="12" height="12" rx="1.5" transform="rotate(45 12 12)"/><circle cx="12" cy="12" r="2"/>'},
 islamic:{s:'i',c:'#d9a44f',ar:['لعبة الإسلاميات','الأركان والسيرة والأحاديث بالصوت'],en:['Islamic studies game','Pillars, seerah and hadith with voice'],
  ic:'<path d="M15.5 4.5a8 8 0 1 0 4 12.5A6.5 6.5 0 0 1 15.5 4.5z"/><path d="M19 5.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>'}
};
var busy=false;
function run(){
  busy=false;
  var m=/^#\/door\/(arabic|quran|islamic)$/.exec(location.hash||'');
  var old=document.querySelectorAll('.ln-gamelink');
  for(var k=0;k<old.length;k++){if(!m||old[k].getAttribute('data-door')!==m[1])old[k].remove();}
  if(!m)return;
  var list=document.querySelector('.hb-list');if(!list||list.querySelector('.ln-gamelink'))return;
  var ref=list.querySelector('.hb-game');if(!ref)return;
  var d=D[m[1]],en=!!document.querySelector('.lc-mode-en'),t=en?d.en:d.ar;
  var a=document.createElement('a');a.className='hb-game ln-gamelink';a.setAttribute('data-door',m[1]);a.href='game/?s='+d.s;a.style.setProperty('--hb-c',d.c);a.style.textDecoration='none';
  var ic=ref.querySelector('.hb-game-icon'),svg=ic&&ic.querySelector('svg');
  var span=document.createElement('span');span.className='hb-game-icon';
  if(svg){var s2=svg.cloneNode(false);s2.innerHTML=d.ic;span.appendChild(s2);}
  var txt=document.createElement('span');txt.className='hb-game-txt';
  var b=document.createElement('b'),sm=document.createElement('small'),x=document.createElement('span'),y=document.createElement('span');
  if(en){x.setAttribute('dir','ltr');y.setAttribute('dir','ltr');}
  x.textContent=t[0];y.textContent=t[1];b.appendChild(x);sm.appendChild(y);txt.appendChild(b);txt.appendChild(sm);
  a.appendChild(span);a.appendChild(txt);
  if(m[1]==='islamic')list.insertBefore(a,ref.nextSibling);else list.insertBefore(a,list.firstChild);
}
function sched(){if(busy)return;busy=true;requestAnimationFrame(run);}
window.addEventListener('hashchange',sched);
new MutationObserver(sched).observe(document.documentElement,{childList:true,subtree:true});
sched();
})();
