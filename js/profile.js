// Profiles ("Who's learning?") and phone setup links. Loaded before everything else.
// Each person's progress lives under their own name; settings like the Gemini key are shared by the device.
(function(){
const PER=new Set(['de100-srs','de25','gd-opened2','gd-best2','gd-rate']);
const S=Storage.prototype,raw={get:S.getItem,set:S.setItem,rem:S.removeItem};
const L={get:k=>{try{return raw.get.call(localStorage,k)}catch(e){return null}},set:(k,v)=>{try{raw.set.call(localStorage,k,v)}catch(e){}},rem:k=>{try{raw.rem.call(localStorage,k)}catch(e){}}};
let list=[];try{list=JSON.parse(L.get('gd-profiles')||'[]')}catch(e){}
let cur=L.get('gd-profile');if(!cur||!list.includes(cur))cur=null;

/* ---- setup link: #setup=<base64url JSON> carries the Gemini key and, optionally, a person's progress ---- */
let toast='';
if(location.hash.startsWith('#setup=')){
 try{const b=location.hash.slice(7).replace(/-/g,'+').replace(/_/g,'/');const j=JSON.parse(decodeURIComponent(escape(atob(b))));
  if(j.k){L.set('gd-gkey',JSON.stringify(j.k));L.set('gd-gprov',JSON.stringify(j.p||'gemini'));L.set('gd-gon','true');if(j.m)L.set('gd-gmodel',JSON.stringify(j.m));L.rem('gd-gstt');
   if(j.v){let pk={};try{pk=JSON.parse(L.get('gd-gpick')||'{}')}catch(e){}pk[j.p||'gemini']=j.v;L.set('gd-gpick',JSON.stringify(pk))}}
  if(j.n&&j.s){if(!list.includes(j.n)){list.push(j.n);L.set('gd-profiles',JSON.stringify(list))}L.set('de100-srs@'+j.n,JSON.stringify(j.s));if(j.o)L.set('gd-opened2@'+j.n,JSON.stringify(j.o));cur=j.n;L.set('gd-profile',cur)}
  toast=j.n&&j.s?`Set up for ${j.n}: Gemini is connected and your progress has been brought over.`:'This device is now connected to Gemini.';
 }catch(e){toast='That setup link could not be read. Please create a new one.'}
 history.replaceState(null,'',location.pathname+location.search);
}

window.PROFILE=cur;
const key=k=>PER.has(k)&&cur?k+'@'+cur:k;
S.getItem=function(k){return raw.get.call(this,this===localStorage?key(k):k)};
S.setItem=function(k,v){return raw.set.call(this,this===localStorage?key(k):k,v)};
S.removeItem=function(k){return raw.rem.call(this,this===localStorage?key(k):k)};

function choose(name){name=String(name||'').trim().slice(0,30);if(!name)return;
 if(!list.includes(name)){
  // the first person to sign in on a device keeps any progress made before profiles existed
  if(!list.length)PER.forEach(k=>{const v=L.get(k);if(v!=null&&L.get(k+'@'+name)==null)L.set(k+'@'+name,v)});
  list.push(name);L.set('gd-profiles',JSON.stringify(list))}
 L.set('gd-profile',name);location.reload()}
window.Profiles={list:()=>list.slice(),current:()=>cur,choose,signOut(){L.rem('gd-profile');location.reload()}};

function gate(){
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const d=document.createElement('div');d.id='whogate';
 d.innerHTML=`<div class="whobox"><h1>Who's learning?</h1><p>Each person has their own progress, scores and saved dialogues.</p>
  <div class="wholist">${list.map(n=>`<button class="btn whob" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div>
  <form id="whonew"><input id="whoname" maxlength="30" placeholder="${list.length?'Add another person':'Your name'}" autocomplete="off"><button class="btn pri">${list.length?'Add':'Start'}</button></form></div>`;
 document.body.appendChild(d);
 d.querySelectorAll('.whob').forEach(b=>b.onclick=()=>choose(b.dataset.n));
 d.querySelector('#whonew').onsubmit=e=>{e.preventDefault();choose(d.querySelector('#whoname').value)};
 setTimeout(()=>{const i=d.querySelector('#whoname');if(i&&!list.length)i.focus()},50);
}
function badge(){const s=document.getElementById('sync');if(!s||!cur)return;const b=document.createElement('span');b.className='who-badge';
 b.innerHTML=`<b></b> · <button class="link" id="whosw">Switch</button>`;b.querySelector('b').textContent=cur;s.parentNode.insertBefore(b,s);
 b.querySelector('#whosw').onclick=()=>window.Profiles.signOut()}
function showToast(){if(!toast)return;const t=document.createElement('div');t.className='toast';t.textContent=toast;document.body.appendChild(t);setTimeout(()=>t.remove(),7000)}
document.addEventListener('DOMContentLoaded',()=>{if(!cur)gate();else badge();showToast()});
})();
