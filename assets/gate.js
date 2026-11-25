/* Lisanura access gate: login required everywhere; whiteboard is teacher-only.
   Loaded after supa-config.js and supa.js on the home page and on board/. */
(function(){
  var onBoard=location.pathname.indexOf('/board/')>-1;
  var d=document;
  if(onBoard){var hs=d.createElement('style');hs.id='lnHide';hs.textContent='html{visibility:hidden!important}';d.documentElement.appendChild(hs);}
  var dlg=null,box=null,tick=null;
  function isTeacher(){var p=window.LN&&LN.profile;return !!(p&&p.role==='teacher');}
  function showGate(){
    if(onBoard){location.replace('../');return;}
    if(!dlg){
      dlg=d.createElement('dialog');dlg.id='lnGate';dlg.setAttribute('dir','rtl');
      dlg.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:24px 14px;border:0;background:#fdeef3;overflow:auto;display:flex;align-items:center;justify-content:center;box-sizing:border-box';
      dlg.addEventListener('cancel',function(e){e.preventDefault();});
      box=d.createElement('div');box.style.cssText='width:100%;max-width:360px';
      var h=d.createElement('div');h.style.cssText='text-align:center;font-family:Naskh,serif;color:#7c2d49;font-size:20px;margin-bottom:14px';
      h.textContent='سَجِّلِي الدُّخُولَ أَوْ أَنْشِئِي حِسَابًا لِتَبْدَئِي';
      var c=d.createElement('div');box.appendChild(h);box.appendChild(c);dlg.appendChild(box);d.body.appendChild(dlg);
      if(window.LN&&LN.configured())LN.renderAuth(c,{onAuth:function(){evaluate();}});
      else c.textContent='تَعَذَّرَ الِاتِّصَالُ. أَعِيدِي فَتْحَ الصَّفْحَةِ.';
    }
    if(!dlg.open)dlg.showModal();
    if(!tick)tick=setInterval(function(){
      var other=[].slice.call(d.querySelectorAll('dialog[open]')).some(function(x){return x!==dlg;});
      if(other){dlg.close();dlg.showModal();}
    },300);
  }
  function hideGate(){
    if(tick){clearInterval(tick);tick=null;}
    if(dlg){dlg.close();dlg.remove();dlg=null;}
  }
  function hideBoardDoor(){
    [].forEach.call(d.querySelectorAll('button.hb-door'),function(b){
      var t=b.innerText||'';
      if(t.indexOf('سَبُّورَةُ')>-1||/whiteboard/i.test(t))b.style.display='none';
    });
  }
  var mo=null;
  function evaluate(){
    var u=window.LN&&LN.user;
    if(!u){showGate();return;}
    hideGate();
    var teacher=isTeacher();
    d.documentElement.setAttribute('data-ln-role',teacher?'teacher':'student');
    if(onBoard){
      if(teacher){var s=d.getElementById('lnHide');if(s)s.remove();}
      else location.replace('../');
      return;
    }
    if(mo){mo.disconnect();mo=null;}
    if(teacher)[].forEach.call(d.querySelectorAll('button.hb-door'),function(b){b.style.display='';});
    if(!teacher){
      hideBoardDoor();
      mo=new MutationObserver(hideBoardDoor);mo.observe(d.body,{childList:true,subtree:true});
    }
  }
  function start(){
    if(!window.LN||!LN.configured()){showGate();return;}
    if(!onBoard)showGate(); /* cover instantly, no flash of content */
    LN.init().then(evaluate,evaluate);
    d.addEventListener('ln-auth',evaluate);
  }
  if(d.body)start();else d.addEventListener('DOMContentLoaded',start);
})();
