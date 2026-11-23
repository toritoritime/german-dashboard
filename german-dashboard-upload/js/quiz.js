// Clip questions: watch a clip, answer a question about it in German, get told why an answer is wrong and how to remember it.
// Unlocks once all of words 1–100 are mastered (there's also "open early"). Results are saved per person and sync with accounts.
(function(){
const QZ_DATA=window.QUIZ||[],CL={};(window.CLIPS||[]).forEach(r=>{CL[r[0]]={id:r[0],a:r[2],b:r[3],spk:r[4],de:r[5],en:r[6]}});
const root=document.getElementById('quizApp');if(!root)return;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='gd-quiz';
let Z={r:{},early:false};try{const z=JSON.parse(localStorage.getItem(KEY)||'null');if(z&&z.r)Z=z}catch(e){}
const save=()=>{Z.t=Date.now();try{localStorage.setItem(KEY,JSON.stringify(Z))}catch(e){}};
let cur=null,state=null,showSubs=false,cErr='';

const css=document.createElement('style');css.textContent=`
#quizApp .ctrls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}#quizApp .note{color:var(--mute);font-size:15px}
#quizApp .qhead{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:baseline;justify-content:space-between}
#quizApp .qcard{border:1px solid var(--rule);border-radius:12px;padding:18px;background:var(--paper);display:grid;gap:14px;max-width:820px}
#quizApp video{width:100%;max-height:52vh;background:#000;border-radius:8px}
#quizApp .qq{font-size:24px;line-height:1.3}
#quizApp .qin{display:flex;gap:8px;flex-wrap:wrap}
#quizApp .qin input{flex:1;min-width:200px;font:18px Georgia,serif;padding:10px 12px;border:1px solid var(--rule);border-radius:8px;background:var(--paper);color:var(--ink)}
#quizApp .fb{border-radius:10px;padding:14px 16px;display:grid;gap:8px;font-size:16px;line-height:1.45}
#quizApp .fb.ok{background:light-dark(#eef5ea,#1f2a1c);border:1px solid light-dark(#b9d3ad,#3d5636)}
#quizApp .fb.no{background:light-dark(#fbeeea,#2e1f1c);border:1px solid light-dark(#e3bfb4,#5a3a33)}
#quizApp .fb h3{margin:0;font-size:19px}
#quizApp .sub{border-left:3px solid var(--rule);padding:4px 0 4px 12px}
#quizApp .sub .en{color:var(--mute);margin-top:4px;font-size:15px;font-weight:normal;line-height:1.4}
#quizApp .grid{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#quizApp .grid button{width:38px;height:34px;border-radius:6px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);font:14px Georgia,serif;cursor:pointer}
#quizApp .grid button.ok{background:light-dark(#dcebd4,#2b3d26)}#quizApp .grid button.no{background:light-dark(#f3d9d1,#4a2c26)}
#quizApp .grid button[aria-current=true]{outline:2px solid var(--ink)}
#quizApp .pbar{height:8px;border-radius:99px;background:var(--rule);overflow:hidden;max-width:820px}#quizApp .pbar i{display:block;height:100%;background:light-dark(#6d8f5e,#8fb07f)}
#quizApp .why b{font-weight:bold}
@media(max-width:600px){#quizApp .qq{font-size:20px}#quizApp .qcard{padding:14px}}`;document.head.appendChild(css);

/* ---------- marking ---------- */
const norm=s=>String(s||'').toLowerCase().replace(/ß/g,'ss').replace(/ae/g,'ä').replace(/oe/g,'ö').replace(/ue/g,'ü').replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(Boolean);
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
const close=(u,t)=>u===t||(t.length>=4&&u.includes(t))||(t.length>=5&&1-lev(u,t)/Math.max(u.length,t.length)>=.8);
function localOK(ans,q){const U=norm(ans);if(!U.length)return false;
 return q.ok.some(v=>norm(v).every(t=>U.some(u=>close(u,t))))}
const EN=/\b(the|is|at|home|with|and|of|his|her|no|yes|because|by|in a|a)\b/i;

/* ---------- Claude: explains this particular answer ---------- */
const CKEY='gd-ckey',CMODEL='claude-sonnet-5-5';
const cKey=()=>{try{return JSON.parse(localStorage.getItem(CKEY)||'""')}catch(e){return ''}};
async function claude(prompt,key){key=key||cKey();if(!key)return null;
 const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true','content-type':'application/json'},
  body:JSON.stringify({model:CMODEL,max_tokens:500,messages:[{role:'user',content:prompt}]})});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&j.error.message)||('Claude answered '+r.status));
 const txt=(j.content||[]).map(b=>b.text||'').join('').trim().replace(/^```(?:json)?\s*|\s*```$/g,'');
 const m=txt.match(/\{[\s\S]*\}/);try{return JSON.parse(m?m[0]:txt)}catch(e){return null}}
function judge(q,c,ans){return claude(`You are a friendly, precise German tutor for an English-speaking beginner who knows the 200 most frequent German words.
They watched a short documentary clip and answered a question about it in German.

Clip (German subtitles): "${c.de}"
Clip (English): "${c.en}"
Question: "${q.q}"
Model answer: "${q.a}"
Learner's answer: "${ans}"

Decide whether the learner's answer is correct in MEANING. Accept short answers, single words, synonyms and small spelling or grammar mistakes. The answer must be in German; an English answer is incorrect.
Reply with JSON only, no other text:
{"correct": true or false,
 "why": "1–3 sentences in English. If incorrect: say exactly why it is wrong and quote the German words from the clip that give the right answer. If correct: confirm briefly and point out any small spelling or grammar slip.",
 "tip": "One short, memorable tip in English for remembering the key word or grammar next time.",
 "better": "A natural, correct German answer, as close to the learner's own words as possible."}`)}

/* ---------- views ---------- */
const order=()=>QZ_DATA;
const res=id=>Z.r[id];
const nRight=()=>QZ_DATA.filter(q=>res(q.id)&&res(q.id).ok).length;
function unlocked(){const S=window.SRS;return Z.early||(S&&S.mastered100&&S.mastered100())}
function mastered(){const S=window.SRS;if(!S)return 0;let n=0;for(let r=1;r<=100;r++)if(S.status(r)==='mastered')n++;return n}
function nextQ(from){const L=order(),i=from==null?-1:L.findIndex(q=>q.id===from);for(let k=1;k<=L.length;k++){const q=L[(i+k)%L.length];if(!res(q.id)||!res(q.id).ok)return q}return L[(i+1)%L.length]}

function locked(){const m=mastered();
 root.innerHTML=`<h2 style="font-size:26px;margin-top:0">Clip questions</h2>
 <p style="max-width:720px;font-size:17px">Watch real clips from the documentary and answer a question about each one <b>in German</b>. If an answer is wrong, you'll see why, the right answer, and a tip to remember it next time.</p>
 <p style="font-size:17px"><b>Opens when all of words 1–100 are mastered</b> (scheduled 21 days or more ahead): ${m} of 100 so far.</p>
 <div class="pbar"><i style="width:${m}%"></i></div>
 <p class="note" style="margin-top:14px">${QZ_DATA.length} questions are waiting. <button class="link" id="early">Open early anyway</button></p>`;
 root.querySelector('#early').onclick=()=>{Z.early=true;save();render()}}

function render(){
 if(!unlocked())return locked();
 if(!cur)cur=nextQ(null);
 const L=order(),i=L.findIndex(q=>q.id===cur.id),c=CL[cur.c]||{de:'',en:''},r=res(cur.id),right=nRight();
 root.innerHTML=`<div class="qhead"><h2 style="font-size:26px;margin:0">Clip questions</h2><span class="note" style="margin:0">${right} of ${L.length} answered correctly${Z.early&&!(window.SRS&&SRS.mastered100())?' · opened early':''}</span></div>
 <div class="pbar" style="margin:10px 0 16px"><i style="width:${right/L.length*100}%"></i></div>
 <div class="qcard">
  <div class="note" style="margin:0">Frage ${i+1} von ${L.length} · ${esc(c.spk||'')}${r?` · ${r.ok?'answered correctly':'not right yet'}`:''}</div>
  <video id="qv" src="clips/${esc(cur.c)}.mp4" playsinline controls preload="auto"></video>
  <div class="ctrls" style="margin:0"><button class="btn" id="qplay">▶ Play clip</button><button class="btn" id="qslow">▶ 0.8×</button><button class="btn" id="qsub" aria-pressed="${showSubs}">${showSubs?'Hide':'Show'} German subtitles</button></div>
  <div class="sub" id="qs" ${showSubs||state?'':'hidden'}><div>${esc(c.de)}</div>${state?`<div class="en">${esc(c.en)}</div>`:''}</div>
  <div class="qq" lang="de">${esc(cur.q)}</div>
  <form class="qin" id="qf" autocomplete="off"><input id="qa" lang="de" autocapitalize="sentences" spellcheck="false" placeholder="Antworte auf Deutsch …" value="${esc(state&&state.ans||'')}" ${state&&state.ok?'disabled':''}>
   ${state&&state.ok?'':'<button class="btn pri" id="qcheck">Check</button>'}</form>
  <div class="note" style="margin:0"><button class="link" id="qhint">Hint</button> <span id="qh" hidden>${esc(cur.hint)}</span></div>
  <div id="qfb" aria-live="polite">${state?fbHTML(state):''}</div>
  <div class="ctrls" style="margin:0">${state&&!state.ok?'<button class="btn" id="qagain">Try again</button>':''}<button class="btn ${state?'pri':''}" id="qnext">${state?'Next question →':'Skip →'}</button></div>
 </div>
 <h3 style="font-size:18px;margin:22px 0 0">All questions</h3>
 <div class="grid">${L.map((q,k)=>{const x=res(q.id);return `<button data-q="${q.id}" class="${x?(x.ok?'ok':'no'):''}" aria-current="${q.id===cur.id}" title="${esc(q.q)}">${k+1}</button>`}).join('')}</div>`;
 const v=root.querySelector('#qv'),$=s=>root.querySelector(s);
 $('#qplay').onclick=()=>{v.playbackRate=1;v.currentTime=0;v.play().catch(()=>{})};
 $('#qslow').onclick=()=>{v.playbackRate=.8;v.preservesPitch=true;v.currentTime=0;v.play().catch(()=>{})};
 $('#qsub').onclick=()=>{showSubs=!showSubs;render()};
 $('#qhint').onclick=()=>{$('#qh').hidden=false};
 $('#qnext').onclick=()=>{cur=nextQ(cur.id);state=null;showSubs=false;render();root.scrollIntoView({block:'start',behavior:'smooth'})};
 const ag=$('#qagain');if(ag)ag.onclick=()=>{state=null;render();setTimeout(()=>{const a=$('#qa');a&&a.focus()},0)};
 root.querySelectorAll('.grid button').forEach(b=>b.onclick=()=>{cur=QZ_DATA.find(q=>q.id===b.dataset.q);state=null;showSubs=false;render()});
 $('#qf').onsubmit=e=>{e.preventDefault();check($('#qa').value)};
}
function keyPanel(){const k=cKey();
 return `<h3 style="font-size:18px;margin:26px 0 6px">Explanations by Claude</h3>
 ${k?`<p class="note" style="margin:0">Connected. When an answer isn't an exact match, Claude checks it, explains your particular mistake and gives a tip. <button class="link" id="ckx">Change or remove key</button></p>${cErr?`<p class="note" style="color:#9b3b30">Last problem: ${esc(cErr)}. The written explanation was shown instead.</p>`:''}`
 :`<p class="note" style="margin:0 0 8px;max-width:720px">Optional. Without it you still get a written explanation and tip for every question. With it, Claude explains your exact answer and accepts other correct wordings. Get a key at <b>console.anthropic.com</b> (Settings › API keys › Create key; it needs a little credit, and each explanation costs a fraction of a penny). It's saved to your account, so your other devices get it too.</p>
 <div class="ctrls"><input id="ckey" type="password" autocomplete="off" spellcheck="false" placeholder="Paste your Anthropic API key (sk-ant-…)" style="font:15px Georgia,serif;padding:8px 10px;border:1px solid var(--rule);border-radius:6px;background:var(--paper);color:var(--ink);min-width:240px;max-width:100%"><button class="btn pri" id="ckgo">Connect</button><span class="note" id="ckmsg"></span></div>`}`}
function bindKey(){const $=s=>root.querySelector(s);
 const g=$('#ckgo');if(g)g.onclick=async()=>{const k=$('#ckey').value.trim();if(!k){$('#ckmsg').textContent='Paste the key first.';return}g.disabled=true;$('#ckmsg').textContent='Checking with Claude…';
  try{const r=await claude('Reply with JSON only: {"ok": true}',k);if(!r||r.ok!==true)throw new Error('unexpected reply');localStorage.setItem(CKEY,JSON.stringify(k));cErr='';render()}
  catch(e){g.disabled=false;$('#ckmsg').textContent='Could not connect: '+(e.message||e)}};
 const x=$('#ckx');if(x)x.onclick=()=>{if(x.dataset.c){localStorage.removeItem(CKEY);render()}else{x.dataset.c=1;x.textContent='Click again to remove it'}}}
function fbHTML(s){const q=cur;
 if(s.busy)return `<div class="fb"><span>Checking your answer…</span></div>`;
 if(s.ok)return `<div class="fb ok"><h3>Richtig!</h3>
  ${s.why?`<div class="why">${esc(s.why)}</div>`:`<div class="why">${esc(q.why)}</div>`}
  ${s.better&&norm(s.better).join(' ')!==norm(s.ans).join(' ')?`<div><b>A natural way to write it:</b> <span lang="de">${esc(s.better)}</span></div>`:''}
  <div><b>Tip:</b> ${esc(s.tip||q.tip)}</div></div>`;
 return `<div class="fb no"><h3>Not quite.</h3>
  <div class="why"><b>Why:</b> ${esc(s.why||((EN.test(s.ans)&&!/[äöüß]/i.test(s.ans)?'It looks like you answered in English; answer in German. ':'')+'You wrote “'+s.ans+'”. '+q.why))}</div>
  <div><b>Answer:</b> <span lang="de">${esc(q.a)}</span></div>
  <div><b>Tip to remember it:</b> ${esc(s.tip||q.tip)}</div></div>`}
async function check(ans){ans=String(ans||'').trim();if(!ans)return;const q=cur,c=CL[q.c]||{de:'',en:''};
 let ok=localOK(ans,q),why='',tip='',better='';
 if(!ok&&cKey()){state={busy:true,ans};render();
  try{const g=await judge(q,c,ans);if(g&&typeof g.correct==='boolean'){ok=g.correct;why=g.why||'';tip=g.tip||'';better=g.better||''}}catch(e){cErr=e.message||String(e)}}
 state={ok,ans,why,tip,better};
 const prev=Z.r[q.id]||{n:0};Z.r[q.id]={ok:prev.ok||ok,n:(prev.n||0)+1,last:ans,t:Date.now()};save();render()}

window.QZ={open(){render()},leave(){const v=root.querySelector('#qv');if(v)v.pause()}};
})();
