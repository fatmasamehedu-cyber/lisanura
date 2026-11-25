/* لِسانورا — تسجيل تقدم الطالبات في الألعاب
   Lisanura game progress recorder: logs which games a signed-in STUDENT opens.
   Loaded on the home site after supa.js. The teacher reads the rows from the
   board's "طلابي" screen (one row per student per game: plays + last played). */
(function(){
  var cur=null,queue={},timer=null,uid=null;
  function titles(){return (window.LN&&LN.GAME_TITLES)||{};}
  function store(){try{localStorage.setItem('lc:prog:'+uid,JSON.stringify(queue));}catch(e){}}
  function load(){try{return JSON.parse(localStorage.getItem('lc:prog:'+uid)||'{}');}catch(e){return{};}}
  function flush(){
    if(!uid||!window.LN)return;
    Object.keys(queue).forEach(function(k){
      var q=queue[k];if(!q||!q.dirty)return;
      LN.saveProgress('lc:'+k,{plays:q.plays,last:q.last})
        .then(function(){if(queue[k]){queue[k].dirty=false;store();}})
        .catch(function(){});
    });}
  function hit(key){
    if(!uid||!titles()[key]||key===cur)return;
    cur=key;
    var q=queue[key]||(queue[key]={plays:0,last:0,dirty:false});
    q.plays++;q.last=Date.now();q.dirty=true;store();
    clearTimeout(timer);timer=setTimeout(flush,3000);}
  function wrap(){
    var op=history.pushState;
    history.pushState=function(st){
      try{if(st&&typeof st.lcw==='string')hit(st.lcw);}catch(e){}
      return op.apply(this,arguments);};
    window.addEventListener('popstate',function(){cur=null;});
    /* going back to a door list then re-entering the same game counts as a new play */
  }
  function start(){
    if(!window.LN||!LN.configured())return;
    LN.init().then(function(){
      if(!LN.user||!LN.profile||LN.profile.role!=='student')return; /* teachers are not logged */
      uid=LN.user.id;queue=load();wrap();})
    .catch(function(){});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();
