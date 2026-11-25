/* ============================================================
   ليسانورا — السحابة: حسابات، حفظ تلقائي، كتب، تقدّم، بث مباشر
   Lisanura cloud SDK over Supabase. Needs assets/supa-config.js first.
   Exposes window.LN. No build step; loads supabase-js from CDN on init.
   ============================================================ */
window.LN=(()=>{
  const STUDENT_DOMAIN='lisanura-students.app';
  const LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  let sb=null,user=null,profile=null,readyPromise=null,liveChan=null,liveJoinChan=null;
  function lang(){try{const v=localStorage.getItem('letters-city:lang.v1');const p=v===null?'ar':JSON.parse(v);return p==='en'?'en':'ar';}catch(e){return 'ar';}}
  function L(ar,en){return lang()==='en'?en:ar;}

  function configured(){const c=window.LN_CONFIG||{};return !!(c.url&&c.anon&&c.url.indexOf('https://')===0);}
  function loadLib(){if(window.supabase)return Promise.resolve();
    return new Promise((res,rej)=>{const s=document.createElement('script');s.src=LIB;
      s.onload=res;s.onerror=()=>rej(new Error(L('تعذر تحميل مكتبة الاتصال','Could not load the connection library')));document.head.appendChild(s);});}

  async function init(){
    if(readyPromise)return readyPromise;
    readyPromise=(async()=>{
      if(!configured())return null;
      await loadLib();
      sb=window.supabase.createClient(window.LN_CONFIG.url,window.LN_CONFIG.anon);
      try{const {data}=await sb.auth.getSession();
        if(data&&data.session){user=data.session.user;await loadProfile();}}catch(e){}
      sb.auth.onAuthStateChange(async(ev,sess)=>{
        user=sess?sess.user:null;profile=null;
        if(user)await loadProfile();
        document.dispatchEvent(new CustomEvent('ln-auth',{detail:{user,profile}}));});
      return sb;})();
    return readyPromise;}

  async function loadProfile(){
    if(!user||!sb)return null;
    try{const {data}=await sb.from('profiles').select('*').eq('id',user.id).maybeSingle();
      profile=data||null;}catch(e){profile=null;}
    return profile;}

  /* ---------------- auth ---------------- */
  function studentEmail(username){return username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g,'')+'@'+STUDENT_DOMAIN;}

  async function signUpTeacher(email,password,name){
    await init();
    const {data,error}=await sb.auth.signUp({email:email.trim(),password,
      options:{data:{role:'teacher',display_name:name.trim()}}});
    if(error)throw new Error(arErr(error));
    if(!data.session)return {needsConfirm:true}; /* she confirms once from her inbox */
    user=data.session.user;await loadProfile();return {user,profile};}

  async function signUpStudent(username,pin,name,teacherCode){
    await init();
    if(!/^[a-zA-Z0-9_.-]{3,20}$/.test(username.trim()))throw new Error(L('الاسم المستعار: ٣-٢٠ حرف إنجليزي أو أرقام بدون مسافات','Username: 3-20 English letters or numbers, no spaces'));
    if(!/^\d{6}$/.test(pin))throw new Error(L('الرقم السري: ٦ أرقام','PIN: 6 digits'));
    let teacherId=null;
    if(teacherCode&&teacherCode.trim()){
      /* validate after signup (a signed-in user may read teacher rows) */}
    const {data,error}=await sb.auth.signUp({email:studentEmail(username),password:pin,
      options:{data:{role:'student',display_name:(name||'').trim()||L('طالبة','Student')}}});
    if(error)throw new Error(arErr(error));
    if(!data.session)throw new Error(L('التسجيل يحتاج تأكيد بريد — أطلبي من الدعم إيقاف تأكيد البريد','Signup needs email confirmation. Ask support to turn off email confirmation'));
    user=data.session.user;await loadProfile();
    if(teacherCode&&teacherCode.trim()){
      const {data:t}=await sb.from('profiles').select('id,display_name').eq('id',teacherCode.trim()).eq('role','teacher').maybeSingle();
      if(!t)throw new Error(L('كود المعلمة غير صحيح','Teacher code is incorrect'));
      await sb.from('profiles').update({teacher_id:t.id}).eq('id',user.id);
      await loadProfile();}
    return {user,profile};}

  async function signIn(idOrEmail,password){
    await init();
    const email=idOrEmail.includes('@')?idOrEmail.trim():studentEmail(idOrEmail);
    const {data,error}=await sb.auth.signInWithPassword({email,password});
    if(error){const m=error.message||'';
      if(/not confirmed/i.test(m))throw new Error(L('افتحي بريدك ودوسي رابط التأكيد الأول، وبعدين سجلي دخول','Open your email and tap the confirmation link first, then log in'));
      throw new Error(L('بيانات الدخول غير صحيحة','Incorrect login details'));}
    user=data.session.user;await loadProfile();return {user,profile};}

  async function signOut(){await init();await sb.auth.signOut();user=null;profile=null;
    document.dispatchEvent(new CustomEvent('ln-auth',{detail:{user:null,profile:null}}));}

  function arErr(e){const m=(e&&e.message)||'';
    if(/already registered|already been registered/i.test(m))return L('هذا الحساب موجود بالفعل، جربي تسجيل الدخول','This account already exists. Try logging in');
    if(/at least 6/i.test(m))return L('كلمة السر يجب أن تكون ٦ أحرف على الأقل','Password must be at least 6 characters');
    if(/invalid email/i.test(m))return L('البريد الإلكتروني غير صحيح','Invalid email address');
    if(/rate limit/i.test(m))return L('محاولات كثيرة، انتظري قليلاً','Too many attempts. Wait a little');
    return L('حدث خطأ: ','Error: ')+m;}

  /* ---------------- board autosave ---------------- */
  let boardTimer=null;
  function saveBoard(state,onStatus){ /* debounced cloud autosave (teacher) */
    if(!sb||!user||!profile||profile.role!=='teacher')return;
    clearTimeout(boardTimer);
    if(onStatus)onStatus('saving');
    boardTimer=setTimeout(async()=>{
      try{await sb.from('board_states').upsert({teacher_id:user.id,state,updated_at:new Date().toISOString()});if(onStatus)onStatus('saved');}
      catch(e){if(onStatus)onStatus('error');}},800);}
  async function saveBoardNow(state){ /* immediate save (seeding / merging at login) */
    await init();if(!user||!profile||profile.role!=='teacher')return false;
    try{await sb.from('board_states').upsert({teacher_id:user.id,state,updated_at:new Date().toISOString()});return true;}
    catch(e){return false;}}
  async function loadBoard(){
    await init();if(!user)return null;
    try{const {data}=await sb.from('board_states').select('state,updated_at').eq('teacher_id',user.id).maybeSingle();
      return data||null;}catch(e){return null;}}

  /* ---------------- books (PDF) in storage ---------------- */
  async function uploadBook(name,buf){
    await init();
    /* storage keys must be ASCII: encode the Arabic display name as base64url in the filename */
    const enc=s=>{try{return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}catch(e){return 'book';}};
    const path=user.id+'/'+Date.now()+'-'+enc((name||L('كتاب','Book')).slice(0,60))+'.pdf';
    const {error}=await sb.storage.from('books').upload(path,buf,{contentType:'application/pdf'});
    if(error)throw new Error(L('تعذر رفع الكتاب','Could not upload the book'));
    return path;}
  async function listBooks(){
    await init();if(!user)return[];
    const dec=s=>{try{return decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))));}catch(e){return s.replace(/_/g,' ');}};
    const {data}=await sb.storage.from('books').list(user.id+'/',{limit:100,sortBy:{column:'created_at',order:'desc'}});
    return (data||[]).filter(f=>f.name.endsWith('.pdf')).map(f=>({path:user.id+'/'+f.name,name:dec(f.name.replace(/^\d+-/,'').replace(/\.pdf$/,''))}));}
  async function downloadBook(path){
    await init();
    const {data,error}=await sb.storage.from('books').download(path);
    if(error)throw new Error(L('تعذر فتح الكتاب','Could not open the book'));
    return data.arrayBuffer();}
  async function deleteBook(path){await init();await sb.storage.from('books').remove([path]);}

  /* ---------------- student game progress ---------------- */
  async function saveProgress(game,data){
    await init();if(!user)return;
    try{await sb.from('progress').upsert({student_id:user.id,game,data,updated_at:new Date().toISOString()});}catch(e){}}
  async function loadProgress(game){
    await init();if(!user)return null;
    try{let q=sb.from('progress').select('*').eq('student_id',user.id);
      if(game)q=q.eq('game',game);
      const {data}=await q;return data||[];}catch(e){return[];}}

  /* game/route titles (extracted from the home app bundle) for progress display */
  const GAME_TITLES={"arabic":["اللُّغَةُ الْعَرَبِيَّةُ","Arabic language"],"quran":["الْقُرْآنُ وَالتَّجْوِيدُ","Quran and Tajweed"],"islamic":["الْإِسْلَامِيَّاتُ","Islamic studies"],"letters":["مَدِينَةُ الْحُرُوفِ","Letters City"],"gender":["مُذَكَّرٌ أَمْ مُؤَنَّثٌ؟","Masculine or feminine?"],"prep":["حُرُوفُ الْجَرِّ","Prepositions"],"words":["تَكْوِينُ الْكَلِمَاتِ وَالْجُمَلِ","Building words and sentences"],"reading":["الْقِرَاءَةُ (نُورُ بَيَانٍ)","Reading"],"noon":["حُرُوفُ النُّونِ السَّاكِنَةِ","Noon sakinah: the letters"],"noonv":["أَمْثِلَةٌ مِنَ الْقُرْآنِ","Examples from the Quran"],"ghunna":["الْإِدْغَامُ: بِغُنَّةٍ أَمْ بِغَيْرِ غُنَّةٍ؟","Idgham: with or without ghunna?"],"shadda":["غُنَّةُ النُّونِ وَالْمِيمِ الْمُشَدَّدَتَيْنِ","Ghunna of doubled noon and meem"],"meem":["حُرُوفُ الْمِيمِ السَّاكِنَةِ","Meem sakinah: the letters"],"meemv":["أَمْثِلَةٌ مِنَ الْقُرْآنِ","Examples from the Quran"],"lam":["الْحُرُوفُ الْقَمَرِيَّةُ وَالشَّمْسِيَّةُ","Moon and sun letters"],"lamv":["أَمْثِلَةٌ مِنَ الْقُرْآنِ","Examples from the Quran"],"lamverb":["لَامُ الْفِعْلِ","Laam of the verb"],"mith":["نَوْعُ الْحَرْفَيْنِ","The kind of the two letters"],"mithv":["أَمْثِلَةٌ مِنَ الْقُرْآنِ","Examples from the Quran"],"madd":["كَمْ حَرَكَةً نَمُدُّ؟","How long do we hold it?"],"maddv":["أَمْثِلَةٌ مِنَ الْقُرْآنِ","Examples from the Quran"],"pillars":["أَرْكَانُ الْإِسْلَامِ وَالْإِيمَانِ","Pillars of Islam and faith"],"tf":["صَحٌّ أَمْ غَلَطٌ؟","True or false?"],"seerah":["تَرْتِيبُ أَحْدَاثِ السِّيرَةِ","Seerah timeline"],"hadith":["قِصَصُ الْأَحَادِيثِ","Hadith stories"],"adhkar":["الْأَذْكَارُ","Adhkar (daily supplications)"],"dots":["بَيْتُ النُّقَاطِ","The Dot House"],"elevator":["مِصْعَدُ الْحَرَكَاتِ","The Vowel Elevator"],"rain":["مَطَرُ الْحُرُوفِ","Letter Rain"],"shadow":["الظِّلُّ الصَّحِيحُ","The Right Shadow"],"sound":["صَائِدُ الْأَصْوَاتِ","The Sound Hunter"],"scale":["مِيزَانُ النُّقَاطِ","The Dot Scale"],"hidden":["الْحُرُوفُ الْخَفِيَّةُ","The Hidden Letters"],"train":["قِطَارُ الْأَبْجَدِيَّةِ","The Alphabet Train"]};

  async function listStudentsProgress(){ /* teacher: linked students + their game progress rows */
    await init();if(!user||!profile||profile.role!=='teacher')return[];
    const {data:students}=await sb.from('profiles').select('id,display_name,created_at').eq('teacher_id',user.id);
    if(!students||!students.length)return[];
    const ids=students.map(s=>s.id);
    const {data:rows}=await sb.from('progress').select('student_id,game,data,updated_at').in('student_id',ids);
    return students.map(s=>({id:s.id,display_name:s.display_name,created_at:s.created_at,
      progress:(rows||[]).filter(r=>r.student_id===s.id)}));}

  async function listStudents(){ /* teacher: her linked students + their progress */
    await init();if(!user||!profile||profile.role!=='teacher')return[];
    const {data:students}=await sb.from('profiles').select('id,display_name,created_at').eq('teacher_id',user.id);
    return students||[];}
  async function myTeacher(){
    await init();if(!profile||!profile.teacher_id)return null;
    const {data}=await sb.from('profiles').select('id,display_name').eq('id',profile.teacher_id).maybeSingle();
    return data||null;}

  /* ---------------- live rooms (Realtime broadcast) ---------------- */
  async function liveStart(onViewers){
    await init();if(!user)throw new Error(L('سجلي الدخول أولاً','Log in first'));
    await sb.from('live_rooms').upsert({teacher_id:user.id,live:true,updated_at:new Date().toISOString()});
    liveChan=sb.channel('live:'+user.id);
    liveChan.on('broadcast',{event:'hello'},()=>{ /* a student joined */});
    if(onViewers)liveChan.on('presence',{event:'sync'},()=>{
      const n=Object.keys(liveChan.presenceState()).length;onViewers(Math.max(0,n-1));});
    await new Promise((res,rej)=>liveChan.subscribe(st=>st==='SUBSCRIBED'?res():st==='CHANNEL_ERROR'?rej(new Error(L('تعذر بدء البث','Could not start the broadcast'))):null));
    await liveChan.track({role:'teacher'});
    return user.id;}
  function livePush(state){ /* host: broadcast full board (caller debounces) */
    if(!liveChan)return;
    liveChan.send({type:'broadcast',event:'state',payload:{data:state}});}
  async function liveJoin(teacherId,onState,onStatus){
    await init();
    try{const {data:room}=await sb.from('live_rooms').select('live').eq('teacher_id',teacherId).maybeSingle();
      if(!room||!room.live){onStatus&&onStatus('offline');return false;}}catch(e){}
    liveJoinChan=sb.channel('live:'+teacherId);
    liveJoinChan.on('broadcast',{event:'state'},m=>onState&&onState(m.payload&&m.payload.data));
    await new Promise(res=>liveJoinChan.subscribe(st=>{if(st==='SUBSCRIBED'){onStatus&&onStatus('live');res();}if(st==='CHANNEL_ERROR'){onStatus&&onStatus('error');res();}}));
    await liveJoinChan.track({role:'student'});
    liveJoinChan.send({type:'broadcast',event:'hello',payload:{}});
    return true;}
  async function liveStop(){
    if(liveChan){await liveChan.unsubscribe();liveChan=null;}
    if(sb&&user)try{await sb.from('live_rooms').upsert({teacher_id:user.id,live:false,updated_at:new Date().toISOString()});}catch(e){}}
  function liveLeave(){if(liveJoinChan){liveJoinChan.unsubscribe();liveJoinChan=null;}}

  /* ---------------- auth UI (Arabic, lisanura style) ---------------- */
  function renderAuth(container,opts){
    opts=opts||{};
    const en=lang()==='en';
    const lbase=location.pathname.indexOf('/board/')>-1?'../assets/':'assets/';
    container.innerHTML=
    '<div dir="'+(en?'ltr':'rtl')+'" style="font-family:Naskh,serif;max-width:340px;margin:0 auto;background:#fffdf6;border:2px solid #e9b7c9;border-radius:18px;padding:22px;box-shadow:0 8px 24px rgba(124,45,73,.15)">'
    +'<div style="text-align:center;margin-bottom:6px"><img src="'+lbase+(en?'logo-en.png':'logo-ar.png')+'" alt="ليسانورا" style="height:64px;width:auto;max-width:100%"></div>'
    +'<div id="lnTabs" style="display:flex;gap:6px;margin:12px 0">'
    +'<button data-t="in" style="flex:1;padding:8px;border-radius:12px;border:2px solid #d16a92;background:#d16a92;color:#fff;font-weight:700;font-family:Naskh">'+L('تسجيل دخول','Log in')+'</button>'
    +'<button data-t="up" style="flex:1;padding:8px;border-radius:12px;border:2px solid #d16a92;background:#fff;color:#7c2d49;font-weight:700;font-family:Naskh">'+L('حساب جديد','New account')+'</button></div>'
    +'<div id="lnRole" style="display:none;gap:6px;margin-bottom:10px">'
    +'<button data-r="teacher" style="flex:1;padding:8px;border-radius:12px;border:2px solid #d9a44f;background:#d9a44f;color:#fff;font-weight:700;font-family:Naskh">'+L('أنا معلمة','I am a teacher')+'</button>'
    +'<button data-r="student" style="flex:1;padding:8px;border-radius:12px;border:2px solid #d9a44f;background:#fff;color:#7c2d49;font-weight:700;font-family:Naskh">'+L('أنا طالبة','I am a student')+'</button></div>'
    +'<input id="lnName" placeholder="'+L('الاسم','Name')+'" style="display:none;width:100%;box-sizing:border-box;margin-bottom:8px;padding:9px;border-radius:10px;border:2px solid #e9b7c9;font-family:Naskh;font-size:15px">'
    +'<input id="lnId" placeholder="'+L('البريد الإلكتروني','Email')+'" style="width:100%;box-sizing:border-box;margin-bottom:8px;padding:9px;border-radius:10px;border:2px solid #e9b7c9;font-family:Naskh;font-size:15px;direction:ltr;text-align:right">'
    +'<input id="lnPass" type="password" placeholder="'+L('كلمة السر','Password')+'" style="width:100%;box-sizing:border-box;margin-bottom:8px;padding:9px;border-radius:10px;border:2px solid #e9b7c9;font-family:Naskh;font-size:15px;direction:ltr;text-align:right">'
    +'<input id="lnCode" placeholder="'+L('كود المعلمة (اختياري)','Teacher code (optional)')+'" style="display:none;width:100%;box-sizing:border-box;margin-bottom:8px;padding:9px;border-radius:10px;border:2px solid #e9b7c9;font-family:Naskh;font-size:13px;direction:ltr;text-align:right">'
    +'<button id="lnGo" style="width:100%;padding:11px;border-radius:12px;border:none;background:#7c2d49;color:#fff;font-weight:700;font-family:Naskh;font-size:16px">'+L('دخول','Log in')+'</button>'
    +'<div id="lnMsg" style="margin-top:10px;text-align:center;font-size:14px;color:#a4748a;min-height:20px"></div></div>';
    let mode='in',role='student';
    const $=id=>container.querySelector(id);
    const nameEl=$('#lnName'),idEl=$('#lnId'),passEl=$('#lnPass'),codeEl=$('#lnCode'),goEl=$('#lnGo'),msgEl=$('#lnMsg');
    function refresh(){
      container.querySelectorAll('#lnTabs button').forEach(b=>{const on=b.dataset.t===mode;b.style.background=on?'#d16a92':'#fff';b.style.color=on?'#fff':'#7c2d49';});
      container.querySelectorAll('#lnRole button').forEach(b=>{const on=b.dataset.r===role;b.style.background=on?'#d9a44f':'#fff';b.style.color=on?'#fff':'#7c2d49';});
      $('#lnRole').style.display=mode==='up'?'flex':'none';
      nameEl.style.display=mode==='up'?'block':'none';
      codeEl.style.display=(mode==='up'&&role==='student')?'block':'none';
      idEl.placeholder=(mode==='up'&&role==='student')?L('اسم مستعار بالإنجليزية','Username (English letters)'):(mode==='in'?L('البريد أو الاسم المستعار','Email or username'):L('البريد الإلكتروني','Email'));
      passEl.placeholder=(role==='student'&&mode==='up')?L('رقم سري (٦ أرقام)','PIN (6 digits)'):L('كلمة السر (٦ أحرف على الأقل)','Password (at least 6 characters)');
      goEl.textContent=mode==='in'?L('دخول','Log in'):L('إنشاء الحساب','Create account');
      msgEl.textContent='';}
    container.querySelectorAll('#lnTabs button').forEach(b=>b.onclick=()=>{mode=b.dataset.t;refresh();});
    container.querySelectorAll('#lnRole button').forEach(b=>b.onclick=()=>{role=b.dataset.r;refresh();});
    goEl.onclick=async()=>{
      msgEl.style.color='#a4748a';msgEl.textContent=L('لحظات...','One moment...');goEl.disabled=true;
      try{
        if(mode==='in'){await signIn(idEl.value,passEl.value);
          msgEl.textContent='';opts.onAuth&&opts.onAuth({user,profile});}
        else if(role==='teacher'){const r=await signUpTeacher(idEl.value,passEl.value,nameEl.value||L('المعلمة','Teacher'));
          if(r&&r.needsConfirm){msgEl.style.color='#2e7d4f';msgEl.textContent=L('بعثنالك رابط تأكيد على بريدك، افتحيه وبعدين ارجعي سجلي دخول','We sent a confirmation link to your email. Open it, then come back and log in');}
          else{msgEl.textContent='';opts.onAuth&&opts.onAuth({user,profile});}}
        else{await signUpStudent(idEl.value,passEl.value,nameEl.value,codeEl.value);
          msgEl.textContent='';opts.onAuth&&opts.onAuth({user,profile});}
      }catch(e){msgEl.style.color='#c0392b';msgEl.textContent=e.message;}
      goEl.disabled=false;};
    refresh();}

  /* ---------------- short share links (shared snapshots) ---------------- */
  function makeShareId(){const abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const a=new Uint8Array(8);
    if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(a);else for(let i=0;i<8;i++)a[i]=Math.floor(Math.random()*256);
    let s='';for(let i=0;i<8;i++)s+=abc[a[i]%62];return s;}
  async function shareBoard(state){ /* teacher: store snapshot, return short id */
    await init();if(!user)throw new Error(L('سجلي الدخول الأول','Log in first'));
    const id=makeShareId();
    const {error}=await sb.from('shared_boards').insert({id,state});
    if(error)throw new Error(L('تعذر حفظ المشاركة','Could not save the share'));
    return id;}
  async function loadShared(id){ /* anyone with the link may read */
    await init();
    try{const {data}=await sb.from('shared_boards').select('state').eq('id',id).maybeSingle();
      return data?data.state:null;}catch(e){return null;}}

  return {init,configured,renderAuth,
    signUpTeacher,signUpStudent,signIn,signOut,
    saveBoard,saveBoardNow,loadBoard,shareBoard,loadShared,
    uploadBook,listBooks,downloadBook,deleteBook,
    saveProgress,loadProgress,listStudents,listStudentsProgress,myTeacher,GAME_TITLES,
    liveStart,livePush,liveJoin,liveStop,liveLeave,
    get user(){return user;},get profile(){return profile;},
    teacherCode(){return user?user.id:null;}};})();
