// Accounts ("Sign in") with progress synced across devices, plus phone setup links. Loaded before everything else.
// With a database configured (data/config.js › window.GD_DB) each person signs in with a username and password,
// and their progress follows them to every device. Without one, it falls back to simple per-device profiles.
(function(){
const PER=['de100-srs','de25','gd-opened2','gd-best2','gd-rate','gd-quiz','gd-chunks'],PERS=new Set(PER);
// voice / marking settings shared by everyone with an account (so a new phone is ready as soon as you sign in)
const SH=['gd-elkey','gd-elpick','gd-elvoices','gd-azkey','gd-azregion','gd-gkey','gd-gmodel','gd-gpick','gd-gon','gd-ckey'],SHS=new Set(SH);
const S=Storage.prototype,raw={get:S.getItem,set:S.setItem,rem:S.removeItem};
const L={get:k=>{try{return raw.get.call(localStorage,k)}catch(e){return null}},set:(k,v)=>{try{raw.set.call(localStorage,k,v)}catch(e){}},rem:k=>{try{raw.rem.call(localStorage,k)}catch(e){}}};
const J=(s,d)=>{try{const v=JSON.parse(s);return v==null?d:v}catch(e){return d}};
const DB=window.GD_DB&&window.GD_DB.url&&window.GD_DB.key?window.GD_DB:null;
let list=J(L.get('gd-profiles'),[]);
let sess=DB?J(L.get('gd-session'),null):null;
let cur=DB?(sess&&sess.user)||null:L.get('gd-profile');if(!DB&&(!cur||!list.includes(cur)))cur=null;

/* ---- setup link: #setup=<base64url JSON> carries the ElevenLabs / Azure / Gemini keys ---- */
let toast='';
if(location.hash.startsWith('#setup=')){
 try{const b=location.hash.slice(7).replace(/-/g,'+').replace(/_/g,'/');const j=JSON.parse(decodeURIComponent(escape(atob(b))));const now=Date.now(),st=J(L.get('gd-synct-shared'),{});
  const put=(k,v)=>{L.set(k,v);st[k]=now};
  if(j.k){put('gd-gkey',JSON.stringify(j.k));L.set('gd-gprov',JSON.stringify(j.p||'gemini'));put('gd-gon','true');if(j.m)put('gd-gmodel',JSON.stringify(j.m));L.rem('gd-gstt');
   if(j.v){const pk=J(L.get('gd-gpick'),{});pk[j.p||'gemini']=j.v;put('gd-gpick',JSON.stringify(pk))}}
  if(j.e&&j.e.k){put('gd-elkey',JSON.stringify(j.e.k));if(j.e.v)put('gd-elpick',JSON.stringify(j.e.v))}
  if(j.a&&j.a.k){put('gd-azkey',JSON.stringify(j.a.k));put('gd-azregion',JSON.stringify(j.a.r||''))}
  if(j.c)put('gd-ckey',JSON.stringify(j.c));
  L.set('gd-synct-shared',JSON.stringify(st));
  if(!DB&&j.n&&j.s){if(!list.includes(j.n)){list.push(j.n);L.set('gd-profiles',JSON.stringify(list))}L.set('de100-srs@'+j.n,JSON.stringify(j.s));if(j.o)L.set('gd-opened2@'+j.n,JSON.stringify(j.o));cur=j.n;L.set('gd-profile',cur)}
  const svc=[j.e&&'ElevenLabs voices',j.a&&'Azure marking',j.c&&'Claude explanations',j.k&&'Gemini'].filter(Boolean).join(', ').replace(/, ([^,]*)$/,' and $1')||'nothing';
  toast=!DB&&j.n&&j.s?`Set up for ${j.n}: connected to ${svc}, and your progress has been brought over.`:`This device is now connected to ${svc}.`;
 }catch(e){toast='That setup link could not be read. Please create a new one.'}
 history.replaceState(null,'',location.pathname+location.search);
}

/* ---- each person's progress lives under their own name on this device ---- */
window.PROFILE=cur;
const key=k=>PERS.has(k)&&cur?k+'@'+cur:k;
const TS=()=>'gd-synct@'+cur;
const stampP=k=>{const s=J(L.get(TS()),{});s[k]=Date.now();L.set(TS(),JSON.stringify(s))};
const stampS=k=>{const s=J(L.get('gd-synct-shared'),{});s[k]=Date.now();L.set('gd-synct-shared',JSON.stringify(s))};
let localWrites=0;
function touched(k){if(!DB||!sess)return;if(PERS.has(k)){stampP(k);localWrites++;later()}else if(SHS.has(k)){stampS(k);later()}}
S.getItem=function(k){return raw.get.call(this,this===localStorage?key(k):k)};
S.setItem=function(k,v){const r=raw.set.call(this,this===localStorage?key(k):k,v);if(this===localStorage)touched(k);return r};
S.removeItem=function(k){const r=raw.rem.call(this,this===localStorage?key(k):k);if(this===localStorage)touched(k);return r};

/* ---- merging: nothing studied on any device is lost ---- */
function mergeSRS(x,y){x=J(x,null);y=J(y,null);if(!x)return y;if(!y)return x;
 const o={...(x.updated>=y.updated?x:y)},cards={};const ids=new Set([...Object.keys(x.cards||{}),...Object.keys(y.cards||{})]);
 const when=c=>c?(c.last||0):-1;
 ids.forEach(id=>{const a=(x.cards||{})[id],b=(y.cards||{})[id];cards[id]=when(a)>=when(b)?a:b});o.cards=cards;
 const dx=x.day||{d:'',n:0},dy=y.day||{d:'',n:0};o.day=dx.d===dy.d?{d:dx.d,n:Math.max(dx.n||0,dy.n||0)}:(dx.d>dy.d?dx:dy);
 o.updated=Math.max(x.updated||0,y.updated||0);if(x.lvl2||y.lvl2)o.lvl2=true;return o}
function mergeQuiz(x,y){x=J(x,null);y=J(y,null);if(!x)return y;if(!y)return x;const r={...x.r};
 Object.keys(y.r||{}).forEach(k=>{const a=r[k],b=y.r[k];r[k]=!a?b:{ok:!!(a.ok||b.ok),n:Math.max(a.n||0,b.n||0),last:(a.t||0)>=(b.t||0)?a.last:b.last,t:Math.max(a.t||0,b.t||0)}});
 return {r,early:!!(x.early||y.early),t:Math.max(x.t||0,y.t||0)}}
function merge(a,b,special){a=a&&a.v?a:{v:{},t:{}};b=b&&b.v?b:{v:{},t:{}};const out={v:{},t:{}};
 new Set([...Object.keys(a.v),...Object.keys(b.v),...Object.keys(a.t||{}),...Object.keys(b.t||{})]).forEach(k=>{
  const av=a.v[k],bv=b.v[k];let v;
  if(special&&(k==='de100-srs'||k==='gd-chunks')&&av!=null&&bv!=null)v=JSON.stringify(mergeSRS(av,bv));
  else if(special&&k==='gd-quiz'&&av!=null&&bv!=null)v=JSON.stringify(mergeQuiz(av,bv));
  else if(special&&k==='gd-opened2'&&av!=null&&bv!=null)v=JSON.stringify(Object.assign({},J(bv,{}),J(av,{})));
  else{const ta=(a.t||{})[k]||0,tb=(b.t||{})[k]||0;v=ta===tb?(av!==undefined?av:bv):ta>tb?av:bv}
  if(v!==undefined)out.v[k]=v;out.t[k]=Math.max((a.t||{})[k]||0,(b.t||{})[k]||0)});
 return out}
const snapP=()=>{const v={};PER.forEach(k=>{const x=L.get(k+'@'+cur);if(x!=null)v[k]=x});return {v,t:J(L.get(TS()),{})}};
const snapS=()=>{const v={};SH.forEach(k=>{const x=L.get(k);if(x!=null)v[k]=x});return {v,t:J(L.get('gd-synct-shared'),{})}};
function applyP(m){let ch=false;PER.forEach(k=>{const v=m.v[k];if(v!=null&&L.get(k+'@'+cur)!==v){L.set(k+'@'+cur,v);ch=true}});L.set(TS(),JSON.stringify(m.t));return ch}
function applyS(m){let ch=false;SH.forEach(k=>{const v=m.v[k],has=k in m.v;if(has&&v!=null&&L.get(k)!==v){L.set(k,v);ch=true}else if(!has&&(m.t[k]||0)>0&&L.get(k)!=null){L.rem(k);ch=true}});L.set('gd-synct-shared',JSON.stringify(m.t));return ch}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b&&b.v?b:{v:{},t:{}});

/* ---- talking to the database ---- */
async function rpc(fn,body){
 const r=await fetch(DB.url.replace(/\/+$/,'')+'/rest/v1/rpc/'+fn,{method:'POST',headers:{'apikey':DB.key,'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body)});
 const t=await r.text();const j=J(t,null);if(!r.ok){const e=new Error((j&&(j.message||j.hint||j.error))||('The server answered '+r.status));e.status=r.status;throw e}return j}
let busy=false,again=false,timer=null,state='';
function setState(t){state=t;const e=document.getElementById('whostate');if(e)e.textContent=t}
function later(){clearTimeout(timer);timer=setTimeout(()=>sync('push'),1500);setState('Saving…')}
async function sync(why){
 if(!DB||!sess)return;if(busy){again=true;return}busy=true;
 try{const j=await rpc('gd_load',{p_token:sess.token});
  const mp=merge(snapP(),j.data,true),chP=applyP(mp);if(!same(mp,j.data))await rpc('gd_save',{p_token:sess.token,p_data:mp});
  const ms=merge(snapS(),j.shared,false),chS=applyS(ms);if(!same(ms,j.shared))await rpc('gd_share',{p_token:sess.token,p_data:ms});
  setState('Synced ✓');if((chP||chS)&&why!=='first')remoteChanged();
 }catch(e){if(/signed out/i.test(e.message||'')){L.rem('gd-session');location.reload();return}setState(navigator.onLine===false?'Offline · will sync later':'Not synced yet · will retry')}
 busy=false;if(again){again=false;sync('push')}}
function remoteChanged(){
 // newer progress arrived from another device: refresh straight away if nothing has been done here yet
 const last=+sessionStorage.getItem('gd-sync-reload')||0;
 if(!localWrites&&Date.now()-last>15000){sessionStorage.setItem('gd-sync-reload',String(Date.now()));location.reload();return}
 note('Progress from your other device has arrived.','Refresh',()=>location.reload())}
function note(text,btn,fn){const t=document.createElement('div');t.className='toast';t.textContent=text+' ';if(btn){const b=document.createElement('button');b.className='link';b.textContent=btn;b.onclick=fn;t.appendChild(b)}document.body.appendChild(t);setTimeout(()=>t.remove(),btn?20000:7000)}

/* ---- signing in ---- */
function adopt(user){ // first sign-in on this device: bring along progress made here before accounts existed
 if(PER.some(k=>L.get(k+'@'+user)!=null))return;
 const name=list.find(n=>n.toLowerCase()===user)||(list.length===1?list[0]:null);
 PER.forEach(k=>{const v=name?L.get(k+'@'+name):L.get(k);if(v!=null)L.set(k+'@'+user,v)});
 const st={};PER.forEach(k=>{if(L.get(k+'@'+user)!=null)st[k]=1});L.set('gd-synct@'+user,JSON.stringify(st))}
async function signIn(mode,u,p,code){
 const j=mode==='new'?await rpc('gd_signup',{p_user:u,p_pass:p,p_code:code}):await rpc('gd_login',{p_user:u,p_pass:p});
 sess={user:j.user,token:j.token};cur=j.user;adopt(cur);
 const mp=merge(snapP(),j.data,true);applyP(mp);if(!same(mp,j.data))await rpc('gd_save',{p_token:sess.token,p_data:mp}).catch(()=>{});
 const ms=merge(snapS(),j.shared,false);applyS(ms);if(!same(ms,j.shared))await rpc('gd_share',{p_token:sess.token,p_data:ms}).catch(()=>{});
 L.set('gd-session',JSON.stringify(sess));location.reload()}
function choose(name){name=String(name||'').trim().slice(0,30);if(!name)return;
 if(!list.includes(name)){if(!list.length)PER.forEach(k=>{const v=L.get(k);if(v!=null&&L.get(k+'@'+name)==null)L.set(k+'@'+name,v)});list.push(name);L.set('gd-profiles',JSON.stringify(list))}
 L.set('gd-profile',name);location.reload()}
function signOut(){if(DB){clearTimeout(timer);L.rem('gd-session')}else L.rem('gd-profile');location.reload()}
window.Profiles={list:()=>list.slice(),current:()=>cur,choose,signOut,sync:()=>sync('manual'),accounts:!!DB,token:()=>sess&&sess.token,rpc:(fn,b)=>rpc(fn,b)};

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function gate(){
 const d=document.createElement('div');d.id='whogate';
 if(DB){
  d.innerHTML=`<div class="whobox"><h1>Sign in</h1><p>Use the same username and password on your phone, your Mac or any computer, and your progress follows you.</p>
  <form id="whoform" autocomplete="on"><input id="whouser" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Username" maxlength="30" required>
   <input id="whopass" name="password" type="password" autocomplete="current-password" placeholder="Password" required>
   <input id="whocode" autocapitalize="none" spellcheck="false" placeholder="Family code (from Rae)" hidden>
   <button class="btn pri" id="whogo">Sign in</button><p class="whoerr" id="whoerr" role="alert"></p></form>
  <p class="whoalt"><button class="link" id="whomode">New here? Create an account</button></p></div>`;
  document.body.appendChild(d);let mode='in';const $=s=>d.querySelector(s);
  $('#whomode').onclick=()=>{mode=mode==='in'?'new':'in';$('#whocode').hidden=mode==='in';$('#whocode').required=mode==='new';
   $('#whopass').autocomplete=mode==='new'?'new-password':'current-password';$('#whopass').placeholder=mode==='new'?'Password (8 or more characters)':'Password';
   $('#whogo').textContent=mode==='new'?'Create account':'Sign in';$('h1').textContent=mode==='new'?'Create an account':'Sign in';
   $('#whomode').textContent=mode==='new'?'Already have an account? Sign in':'New here? Create an account';$('#whoerr').textContent=''};
  $('#whoform').onsubmit=async e=>{e.preventDefault();const b=$('#whogo');b.disabled=true;$('#whoerr').textContent=mode==='new'?'Creating your account…':'Signing in…';
   try{await signIn(mode,$('#whouser').value,$('#whopass').value,$('#whocode').value)}
   catch(err){b.disabled=false;$('#whoerr').textContent=/fetch|network|load failed/i.test(err.message||'')?'Could not reach the server. Check your internet connection and try again.':(err.message||String(err))}};
  setTimeout(()=>$('#whouser').focus(),50);return}
 d.innerHTML=`<div class="whobox"><h1>Who's learning?</h1><p>Each person has their own progress, scores and saved dialogues.</p>
  <div class="wholist">${list.map(n=>`<button class="btn whob" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div>
  <form id="whonew"><input id="whoname" maxlength="30" placeholder="${list.length?'Add another person':'Your name'}" autocomplete="off"><button class="btn pri">${list.length?'Add':'Start'}</button></form></div>`;
 document.body.appendChild(d);
 d.querySelectorAll('.whob').forEach(b=>b.onclick=()=>choose(b.dataset.n));
 d.querySelector('#whonew').onsubmit=e=>{e.preventDefault();choose(d.querySelector('#whoname').value)};
 setTimeout(()=>{const i=d.querySelector('#whoname');if(i&&!list.length)i.focus()},50);
}
function badge(){const s=document.getElementById('sync');if(!s||!cur)return;if(DB)s.hidden=true;const b=document.createElement('span');b.className='who-badge';
 b.innerHTML=`<b></b>${DB?' · <span id="whostate"></span>':''} · <button class="link" id="whosw">${DB?'Sign out':'Switch'}</button>`;b.querySelector('b').textContent=cur;s.parentNode.insertBefore(b,s);
 if(DB)setState(state||'Syncing…');
 b.querySelector('#whosw').onclick=()=>{const x=b.querySelector('#whosw');if(DB&&!x.dataset.c){x.dataset.c=1;x.textContent='Sign out? Tap again';setTimeout(()=>{x.dataset.c='';x.textContent='Sign out'},4000);return}signOut()}}
function showToast(){if(toast)note(toast)}
document.addEventListener('DOMContentLoaded',()=>{if(!cur)gate();else badge();showToast();if(DB&&sess)sync('load')});
if(DB){document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sync('focus');else if(timer){clearTimeout(timer);sync('push')}});
 addEventListener('online',()=>sync('online'));setInterval(()=>{if(document.visibilityState==='visible')sync('tick')},60000)}
})();
