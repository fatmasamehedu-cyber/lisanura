/* One shared boy/girl choice for the whole site and the games.
   The choice lives in localStorage "letters-city:gender.v1" (read by the app, adhkar and the game).
   This file also saves it to the signed-in student's account (progress row "pref-gender")
   and applies the saved choice on a new device or after login. Loaded on the site and in game/. */
(function(){
  var K='letters-city:gender.v1',sp=Storage.prototype.setItem,gp=Storage.prototype.getItem;
  function ok(g){return g==='boy'||g==='girl';}
  function local(){try{var g=JSON.parse(gp.call(localStorage,K));return ok(g)?g:'';}catch(e){return '';}}
  function save(g){
    if(!window.LN||!LN.configured())return;
    LN.init().then(function(){
      if(!LN.user)return;
      return LN.saveProgress('pref-gender',{gender:g,completed:false,last_played:new Date().toISOString()});
    }).catch(function(){});
  }
  Storage.prototype.setItem=function(k,v){
    sp.apply(this,arguments);
    if(k===K&&this===localStorage){try{var g=JSON.parse(v);if(ok(g))save(g);}catch(e){}}
  };
  function sync(){
    if(!window.LN||!LN.configured())return;
    LN.init().then(function(){
      if(!LN.user)return;
      return LN.loadProgress('pref-gender').then(function(rows){
        var r=rows&&rows[0],sg=r&&r.data&&r.data.gender,lg=local();
        if(ok(sg)&&sg!==lg){sp.call(localStorage,K,JSON.stringify(sg));location.reload();}
        else if(!ok(sg)&&lg)save(lg);
      });
    }).catch(function(){});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(sync,300);});
  else setTimeout(sync,300);
})();
