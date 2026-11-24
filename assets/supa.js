/* ============================================================
   ليسانورا — السحابة: حسابات، حفظ تلقائي، كتب، تقدّم، بث مباشر
   Lisanura cloud SDK over Supabase. Needs assets/supa-config.js first.
   Exposes window.LN. No build step; loads supabase-js from CDN on init.
   ============================================================ */
window.LN=(()=>{
  const STUDENT_DOMAIN='lisanura-students.app';
  const LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  let sb=null,user=null,profile=null,readyPromise=null,liveChan=null,liveJoinChan=null;

  function configured(){const c=window.LN_CONFIG||{};return !!(c.url&&c.anon&&c.url.indexOf('https://')===0);}
  function loadLib(){if(window.supabase)return Promise.resolve();
    return new Promise((res,rej)=>{const s=document.createElement('script');s.src=LIB;
      s.onload=res;s.onerror=()=>rej(new Error('تعذر تحميل مكتبة الاتصال'));document.head.appendChild(s);});}

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
    if(!/^[a-zA-Z0-9_.-]{3,20}$/.test(username.trim()))throw new Error('الاسم المستعار: ٣-٢٠ حرف إنجليزي أو أرقام بدون مسافات');
    if(!/^\d{6}$/.test(pin))throw new Error('الرقم السري: ٦ أرقام');
    let teacherId=null;
    if(teacherCode&&teacherCode.trim()){
      /* validate after signup (a signed-in user may read teacher rows) */}
    const {data,error}=await sb.auth.signUp({email:studentEmail(username),password:pin,
      options:{data:{role:'student',display_name:(name||'').trim()||'طالبة'}}});
    if(error)throw new Error(arErr(error));
    if(!data.session)throw new Error('التسجيل يحتاج تأكيد بريد — أطلبي من الدعم إيقاف تأكيد البريد');
    user=data.session.user;await loadProfile();
    if(teacherCode&&teacherCode.trim()){
      const {data:t}=await sb.from('profiles').select('id,display_name').eq('id',teacherCode.trim()).eq('role','teacher').maybeSingle();
      if(!t)throw new Error('كود المعلمة غير صحيح');
      await sb.from('profiles').update({teacher_id:t.id}).eq('id',user.id);
      await loadProfile();}
    return {user,profile};}

  async function signIn(idOrEmail,password){
    await init();
    const email=idOrEmail.includes('@')?idOrEmail.trim():studentEmail(idOrEmail);
    const {data,error}=await sb.auth.signInWithPassword({email,password});
    if(error){const m=error.message||'';
      if(/not confirmed/i.test(m))throw new Error('افتحي بريدك ودوسي رابط التأكيد الأول، وبعدين سجلي دخول');
      throw new Error('بيانات الدخول غير صحيحة');}
    user=data.session.user;await loadProfile();return {user,profile};}

  async function signOut(){await init();await sb.auth.signOut();user=null;profile=null;
    document.dispatchEvent(new CustomEvent('ln-auth',{detail:{user:null,profile:null}}));}

  function arErr(e){const m=(e&&e.message)||'';
    if(/already registered|already been registered/i.test(m))return 'هذا الحساب موجود بالفعل، جربي تسجيل الدخول';
    if(/at least 6/i.test(m))return 'كلمة السر يجب أن تكون ٦ أحرف على الأقل';
    if(/invalid email/i.test(m))return 'البريد الإلكتروني غير صحيح';
    if(/rate limit/i.test(m))return 'محاولات كثيرة، انتظري قليلاً';
    return 'حدث خطأ: '+m;}

  /* ---------------- board autosave ---------------- */
  let boardTimer=null;
  function saveBoard(state){ /* debounced cloud autosave (teacher) */
    if(!sb||!user||!profile||profile.role!=='teacher')return;
    clearTimeout(boardTimer);
    boardTimer=setTimeout(async()=>{
      try{await sb.from('board_states').upsert({teacher_id:user.id,state,updated_at:new Date().toISOString()});}catch(e){}},800);}
  async function loadBoard(){
    await init();if(!user)return null;
    try{const {data}=await sb.from('board_states').select('state,updated_at').eq('teacher_id',user.id).maybeSingle();
      return data||null;}catch(e){return null;}}

  /* ---------------- books (PDF) in storage ---------------- */
  async function uploadBook(name,buf){
    await init();
    /* storage keys must be ASCII: encode the Arabic display name as base64url in the filename */
    const enc=s=>{try{return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}catch(e){return 'book';}};
    const path=user.id+'/'+Date.now()+'-'+enc((name||'كتاب').slice(0,60))+'.pdf';
    const {error}=await sb.storage.from('books').upload(path,buf,{contentType:'application/pdf'});
    if(error)throw new Error('تعذر رفع الكتاب');
    return path;}
  async function listBooks(){
    await init();if(!user)return[];
    const dec=s=>{try{return decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))));}catch(e){return s.replace(/_/g,' ');}};
    const {data}=await sb.storage.from('books').list(user.id+'/',{limit:100,sortBy:{column:'created_at',order:'desc'}});
    return (data||[]).filter(f=>f.name.endsWith('.pdf')).map(f=>({path:user.id+'/'+f.name,name:dec(f.name.replace(/^\d+-/,'').replace(/\.pdf$/,''))}));}
  async function downloadBook(path){
    await init();
    const {data,error}=await sb.storage.from('books').download(path);
    if(error)throw new Error('تعذر فتح الكتاب');
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
    await init();if(!user)throw new Error('سجلي الدخول أولاً');
    await sb.from('live_rooms').upsert({teacher_id:user.id,live:true,updated_at:new Date().toISOString()});
    liveChan=sb.channel('live:'+user.id);
    liveChan.on('broadcast',{event:'hello'},()=>{ /* a student joined */});
    if(onViewers)liveChan.on('presence',{event:'sync'},()=>{
      const n=Object.keys(liveChan.presenceState()).length;onViewers(Math.max(0,n-1));});
    await new Promise((res,rej)=>liveChan.subscribe(st=>st==='SUBSCRIBED'?res():st==='CHANNEL_ERROR'?rej(new Error('تعذر بدء البث')):null));
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
    container.innerHTML=
    '<div dir="rtl" style="font-family:Naskh,serif;max-width:340px;margin:0 auto;background:#fffdf6;border:2px solid #e9b7c9;border-radius:18px;padding:22px;box-shadow:0 8px 24px rgba(124,45,73,.15)">'
    +'<h2 style="margin:0 0 4px;color:#7c2d49;text-align:center;font-size:22px">ليسانورا</h2>'
    +'<div id="lnTabs" style="display:flex;gap:6px;margin:12px 0">'
    +'<button data-t="in" style="flex:1;padding:8px;border-radius:12px;border:2px solid #d16a92;background:#d16a92;color:#fff;font-weight:700;font-family:Naskh">تسجيل دخول</button>'
    +'<button data-t="up" style="flex:1;padding:8px;border-radius:12px;border:2px solid #d16a92;background:#fff;color:#7c2d49;font-weight:700;font-family:Naskh">حساب جديد</button></div>'
    +'<div id="lnRole" style="display:none;gap:6px;margin-bottom:10px">'
    +'<button data-r="teacher" style="flex:1;padding:8px;border-radius:12px;border:2px solid #d9a44f;background:#d9a44f;color:#fff;font-weight:700;font-family:Naskh">أنا معلمة</button>'
    +'<button data-r="student" style="flex:1;padding:8px;border-radius:12px;border:2px solid #d9a44f;background:#fff;color:#7c2d49;font-weight:700;font-family:Naskh">أنا طالبة</button></div>'
    +'<input id="lnName" placeholder="الاسم" style="display:none;width:100%;box-sizing:border-box;margin-bottom:8px;padding:9px;border-radius:10px;border:2px solid #e9b7c9;font-family:Naskh;font-size:15px">'
    +'<input id="lnId" placeholder="البريد الإلكتروني" style="width:100%;box-sizing:border-box;margin-bottom:8px;padding:9px;border-radius:10px;border:2px solid #e9b7c9;font-family:Naskh;font-size:15px;direction:ltr;text-align:right">'
    +'<input id="lnPass" type="password" placeholder="كلمة السر" style="width:100%;box-sizing:border-box;margin-bottom:8px;padding:9px;border-radius:10px;border:2px solid #e9b7c9;font-family:Naskh;font-size:15px;direction:ltr;text-align:right">'
    +'<input id="lnCode" placeholder="كود المعلمة (اختياري)" style="display:none;width:100%;box-sizing:border-box;margin-bottom:8px;padding:9px;border-radius:10px;border:2px solid #e9b7c9;font-family:Naskh;font-size:13px;direction:ltr;text-align:right">'
    +'<button id="lnGo" style="width:100%;padding:11px;border-radius:12px;border:none;background:#7c2d49;color:#fff;font-weight:700;font-family:Naskh;font-size:16px">دخول</button>'
    +'<div id="lnMsg" style="margin-top:10px;text-align:center;font-size:14px;color:#a4748a;min-height:20px"></div></div>';
    let mode='in',role='teacher';
    const $=id=>container.querySelector(id);
    const nameEl=$('#lnName'),idEl=$('#lnId'),passEl=$('#lnPass'),codeEl=$('#lnCode'),goEl=$('#lnGo'),msgEl=$('#lnMsg');
    function refresh(){
      container.querySelectorAll('#lnTabs button').forEach(b=>{const on=b.dataset.t===mode;b.style.background=on?'#d16a92':'#fff';b.style.color=on?'#fff':'#7c2d49';});
      container.querySelectorAll('#lnRole button').forEach(b=>{const on=b.dataset.r===role;b.style.background=on?'#d9a44f':'#fff';b.style.color=on?'#fff':'#7c2d49';});
      $('#lnRole').style.display=mode==='up'?'flex':'none';
      nameEl.style.display=mode==='up'?'block':'none';
      codeEl.style.display=(mode==='up'&&role==='student')?'block':'none';
      idEl.placeholder=(mode==='up'&&role==='student')?'اسم مستعار بالإنجليزية':(mode==='in'?'البريد أو الاسم المستعار':'البريد الإلكتروني');
      passEl.placeholder=(role==='student'&&mode==='up')?'رقم سري (٦ أرقام)':'كلمة السر (٦ أحرف على الأقل)';
      goEl.textContent=mode==='in'?'دخول':'إنشاء الحساب';
      msgEl.textContent='';}
    container.querySelectorAll('#lnTabs button').forEach(b=>b.onclick=()=>{mode=b.dataset.t;refresh();});
    container.querySelectorAll('#lnRole button').forEach(b=>b.onclick=()=>{role=b.dataset.r;refresh();});
    goEl.onclick=async()=>{
      msgEl.style.color='#a4748a';msgEl.textContent='لحظات...';goEl.disabled=true;
      try{
        if(mode==='in'){await signIn(idEl.value,passEl.value);
          msgEl.textContent='';opts.onAuth&&opts.onAuth({user,profile});}
        else if(role==='teacher'){const r=await signUpTeacher(idEl.value,passEl.value,nameEl.value||'المعلمة');
          if(r&&r.needsConfirm){msgEl.style.color='#2e7d4f';msgEl.textContent='بعثنالك رابط تأكيد على بريدك، افتحيه وبعدين ارجعي سجلي دخول';}
          else{msgEl.textContent='';opts.onAuth&&opts.onAuth({user,profile});}}
        else{await signUpStudent(idEl.value,passEl.value,nameEl.value,codeEl.value);
          msgEl.textContent='';opts.onAuth&&opts.onAuth({user,profile});}
      }catch(e){msgEl.style.color='#c0392b';msgEl.textContent=e.message;}
      goEl.disabled=false;};
    refresh();}

  return {init,configured,renderAuth,
    signUpTeacher,signUpStudent,signIn,signOut,
    saveBoard,loadBoard,
    uploadBook,listBooks,downloadBook,deleteBook,
    saveProgress,loadProgress,listStudents,myTeacher,
    liveStart,livePush,liveJoin,liveStop,liveLeave,
    get user(){return user;},get profile(){return profile;},
    teacherCode(){return user?user.id:null;}};})();
