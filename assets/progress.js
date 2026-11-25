/* لِسانورا — تسجيل تقدم الطالبات في الألعاب
   Lisanura game progress recorder: logs which games a signed-in STUDENT opens.
   Loaded on the home site after supa.js. The teacher reads the rows from the
   board's "طلابي" screen (one row per student per game: plays + last played). */
(function(){
  var cur=null,queue={},timer=null,uid=null;
  function titles(){return (window.LN&&LN.GAME_TITLES)||{};}
  function store(){try{localStorage.setItem('lc:prog:'+uid,JSON.stringify(queue));}catch(e){console.warn(e)}}
  function load(){try{return JSON.parse(localStorage.getItem('lc:prog:'+uid)||'{}');}catch(e){return{};}}
  function flush(){
    if(!uid||!window.LN)return;
    Object.keys(queue).forEach(function(k){
      var q=queue[k];if(!q||!q.dirty)return;
      LN.saveProgress('lc:'+k,{plays:q.plays,last:q.last})
        .then(function(){if(queue[k]){queue[k].dirty=false;store();}})
        .catch(function(){});
    });}
  /* restore server-saved progress into the app's local state (new device /
     fresh browser): completed games -> hb-done.v1, Letters City stops ->
     letters-city:lc-worlds.v1, plays log -> lc:prog:<uid>. Union/max only,
     never overwrites newer local data. */
  function restore(){
    if(!window.LN||!LN.loadProgress)return;
    LN.loadProgress().then(function(rows){
      if(!rows||!rows.length)return;
      var done=[];try{done=JSON.parse(localStorage.getItem('hb-done.v1')||'[]');}catch(e){console.warn(e)}
      var worlds=[];try{worlds=JSON.parse(localStorage.getItem('letters-city:lc-worlds.v1')||'[]');}catch(e){console.warn(e)}
      rows.forEach(function(r){
        var g=r.game||'',d2=r.data||{};
        if(!d2.completed)return;
        if(g.indexOf('letters-world-')===0){
          var n=parseInt(g.slice(14),10)-1;
          if(n>=0&&n<8&&worlds.indexOf(n)<0)worlds.push(n);
          return;
        }
        var id=g.indexOf('lc:')===0?g.slice(3):g;
        if(done.indexOf(id)<0)done.push(id);
        if(id==='letters-city'&&done.indexOf('letters')<0)done.push('letters');
      });
      try{localStorage.setItem('hb-done.v1',JSON.stringify(done));}catch(e){console.warn(e)}
      worlds.sort(function(a,b){return a-b;});
      try{localStorage.setItem('letters-city:lc-worlds.v1',JSON.stringify(worlds));}catch(e){console.warn(e)}
      rows.forEach(function(r){
        var g=r.game||'';if(g.indexOf('lc:')!==0)return;
        var k=g.slice(3),d2=r.data||{};
        var q=queue[k]||(queue[k]={plays:0,last:0,dirty:false});
        var p=typeof d2.plays==='number'?d2.plays:0,l=typeof d2.last==='number'?d2.last:(d2.last_played?Date.parse(d2.last_played)||0:0);
        var ch=false;
        if(p>q.plays){q.plays=p;ch=true;}
        if(l>q.last){q.last=l;ch=true;}
        if(ch)store();
      });
    }).catch(function(){});
  }
  function hit(key){
    if(!uid||!titles()[key]||key===cur)return;
    cur=key;
    var q=queue[key]||(queue[key]={plays:0,last:0,dirty:false});
    q.plays++;q.last=Date.now();q.dirty=true;store();
    clearTimeout(timer);timer=setTimeout(flush,3000);}
  function wrap(){
    var op=history.pushState;
    history.pushState=function(st){
      try{if(st&&typeof st.lcw==='string')hit(st.lcw);}catch(e){console.warn(e)}
      return op.apply(this,arguments);};
    window.addEventListener('popstate',function(){cur=null;});
    /* going back to a door list then re-entering the same game counts as a new play */
  }
  function start(){
    if(!window.LN||!LN.configured())return;
    LN.init().then(function(){
      if(!LN.user||!LN.profile||LN.profile.role!=='student')return; /* teachers are not logged */
      uid=LN.user.id;queue=load();wrap();restore();})
    .catch(function(){});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();
