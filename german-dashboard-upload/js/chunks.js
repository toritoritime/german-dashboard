// Phrases: ready-made German chunks ("Lego blocks"). Learn them with spaced repetition, build sentences from blocks,
// slot in your own words (then hear it and say it), and hear the chunks used in the documentary.
(function(){
const CH=window.CHUNKS||[],CL={};(window.CLIPS||[]).forEach(r=>{CL[r[0]]={id:r[0],a:r[2],b:r[3],spk:r[4],de:r[5],en:r[6]}});
const root=document.getElementById('chunkApp');if(!root)return;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='gd-chunks',DAY=864e5,MIN=6e4;
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
let S={v:1,cards:{},day:{d:'',n:0},perDay:4,updated:0};try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&x.cards)S=Object.assign(S,x)}catch(e){}
const save=()=>{S.updated=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
let mode='learn',cur=CH[0],shown=false,bi=0,placed=[],tray=[],checked=null,mine='',rec=null,take=null;

/* ---------- scheduling (same idea as the word cards) ---------- */
const st=id=>S.cards[id];
function status(id){const c=st(id);if(!c)return 'new';if(c.s==='learning')return 'learning';return c.ivl>=21?'mastered':'learnt'}
function ownSchedule(c,g,now){c=c?{...c}:{s:'learning',step:0,ivl:0,ease:2.5,reps:0,lapses:0};c.reps++;c.last=now;
 if(c.s==='learning'){if(g===1){c.step=0;c.due=now+MIN}else if(g===4){c.s='review';c.ivl=4;c.due=now+4*DAY}else if(g===2){c.due=now+5*MIN}
  else if(c.step>=1){c.s='review';c.ivl=1;c.due=now+DAY}else{c.step=1;c.due=now+10*MIN}return c}
 if(g===1){c.lapses++;c.ease=Math.max(1.3,c.ease-.2);c.s='learning';c.step=0;c.due=now+10*MIN;return c}
 if(g===2){c.ease=Math.max(1.3,c.ease-.15);c.ivl=Math.max(1,Math.round(c.ivl*1.2))}
 else if(g===3)c.ivl=Math.max(c.ivl+1,Math.round(c.ivl*c.ease));else{c.ease+=.15;c.ivl=Math.max(c.ivl+2,Math.round(c.ivl*c.ease*1.3))}
 c.due=now+c.ivl*DAY;return c}
function nextCard(){const now=Date.now();if(S.day.d!==today())S.day={d:today(),n:0};
 const due=CH.filter(k=>{const c=st(k.id);return c&&c.due<=now}).sort((a,b)=>st(a.id).due-st(b.id).due);if(due.length)return due[0];
 if(S.day.n<S.perDay){const n=CH.find(k=>!st(k.id));if(n)return n}
 const soon=CH.filter(k=>{const c=st(k.id);return c&&c.s==='learning'&&c.due-now<20*MIN}).sort((a,b)=>st(a.id).due-st(b.id).due);return soon[0]||null}
const sched=(c,g,now)=>window.SRS&&window.SRS.schedule?window.SRS.schedule(c,g,now):ownSchedule(c,g+1,now);
const fmt=ms=>window.SRS&&window.SRS.fmt?window.SRS.fmt(ms):Math.round(ms/6e4)+' min';
const counts=()=>{const n={new:0,learning:0,learnt:0,mastered:0};CH.forEach(k=>n[status(k.id)]++);return n};

/* ---------- small helpers ---------- */
const DLG=()=>window.DLG;
const hear=(t,g)=>{const d=DLG();if(d&&d.say)d.say(t,g||'f').catch(()=>{});else try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='de-DE';speechSynthesis.speak(u)}catch(e){}};
const play=t=>`<button class="iconb" data-say="${esc(t)}" aria-label="Hear it">▶</button>`;
const blk=(t,cls='')=>{const ch=t.startsWith('*');return `<span class="blk ${ch?'ch':''} ${cls}">${esc(ch?t.slice(1):t)}</span>`};
const plain=t=>t.replace(/^\*/,'');
const sentence=bl=>bl.map(plain).join(' ').replace(/\s+([?!.,])/g,'$1');
const normS=s=>s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function hl(de,note){ // highlight the quoted German from the note inside the subtitle
 let h=esc(de);const q=(note.match(/"([^"]+)"/)||[])[1];if(!q)return h;
 q.split('…').map(x=>x.trim().replace(/[.:]$/,'')).filter(x=>x.length>2).forEach(p=>{const e=esc(p);const i=h.indexOf(e);if(i>=0)h=h.slice(0,i)+'<mark class="chm">'+e+'</mark>'+h.slice(i+e.length)});return h}

const css=document.createElement('style');css.textContent=`
#chunkApp .chtabs{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 14px}
#chunkApp .chtabs button{font:16px Georgia,serif;padding:8px 16px;border-radius:99px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);cursor:pointer}
#chunkApp .chtabs button[aria-pressed=true]{background:var(--ink);color:var(--paper)}
#chunkApp .chcard{border:1px solid var(--rule);border-radius:12px;padding:18px;background:var(--paper);display:grid;gap:12px;max-width:820px}
#chunkApp .big{font-size:28px;line-height:1.25}
#chunkApp .note{color:var(--mute);font-size:15px;margin:0}
#chunkApp .ctrls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
#chunkApp .blk{display:inline-flex;align-items:center;font:18px Georgia,serif;padding:9px 13px 8px;margin:4px 3px;border-radius:6px;position:relative;
 background:light-dark(#efe8dc,#3a332c);color:var(--ink);border:1px solid light-dark(#d6cab6,#5b5046);box-shadow:0 3px 0 light-dark(#d6cab6,#211c18);cursor:pointer;user-select:none}
#chunkApp .blk::before{content:"";position:absolute;top:-5px;left:10px;width:22px;height:5px;border-radius:3px 3px 0 0;background:inherit;border:1px solid light-dark(#d6cab6,#5b5046);border-bottom:0}
#chunkApp .blk.ch{background:light-dark(#8b4a3c,#b0685a);color:#fff;border-color:light-dark(#6f3a2f,#8b4a3c);box-shadow:0 3px 0 light-dark(#6f3a2f,#5a2e25)}
#chunkApp .blk.mine{background:light-dark(#e3ecf4,#24323e);border-color:light-dark(#b8cbdc,#3b5266);box-shadow:0 3px 0 light-dark(#b8cbdc,#1a242d)}
#chunkApp .blk.used{opacity:.25;pointer-events:none}
#chunkApp .blk.bad{outline:3px solid #c0533f}#chunkApp .blk.good{outline:3px solid #6d8f5e}
#chunkApp .line{min-height:62px;border:2px dashed var(--rule);border-radius:10px;padding:8px;display:flex;flex-wrap:wrap;align-items:center}
#chunkApp .line:empty::after{content:"Tap the blocks in order";color:var(--mute);font-size:15px;padding:6px}
#chunkApp .fb{border-radius:10px;padding:12px 14px;font-size:16px;line-height:1.45;display:grid;gap:6px}
#chunkApp .fb.ok{background:light-dark(#eef5ea,#1f2a1c);border:1px solid light-dark(#b9d3ad,#3d5636)}
#chunkApp .fb.no{background:light-dark(#fbeeea,#2e1f1c);border:1px solid light-dark(#e3bfb4,#5a3a33)}
#chunkApp .exl{display:flex;gap:8px;align-items:baseline}#chunkApp .exl .en2{color:var(--mute);font-size:15px}
#chunkApp .card{max-width:820px}#chunkApp .card .big{font-size:clamp(32px,5.5vw,54px);line-height:1.12}#chunkApp .card .note{color:var(--mute);font-size:16px;margin:.3em 0 .7em}#chunkApp .card .ex b{color:var(--claret)}#chunkApp .pdl{margin:12px 2px 0;font-size:15px;color:var(--mute)}
#chunkApp .list{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#chunkApp .list button{font:14px Georgia,serif;padding:6px 10px;border-radius:99px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);cursor:pointer;text-align:left}
#chunkApp .list button[aria-current=true]{outline:2px solid var(--ink)}
#chunkApp .dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:var(--rule)}
#chunkApp .dot.learning{background:#c99a3a}#chunkApp .dot.learnt{background:#6d8f5e}#chunkApp .dot.mastered{background:#3e6b4f}
#chunkApp video{width:100%;max-height:46vh;background:#000;border-radius:8px}
#chunkApp mark.chm{background:light-dark(#8b4a3c,#b0685a);color:#fff;border-radius:3px;padding:0 3px}
#chunkApp .sub{border-left:3px solid var(--rule);padding:4px 0 4px 12px}#chunkApp .sub .en{color:var(--mute);font-size:15px;margin-top:4px}
#chunkApp input.slot{font:18px Georgia,serif;padding:9px 11px;border:2px solid light-dark(#b8cbdc,#3b5266);border-radius:8px;background:var(--paper);color:var(--ink);min-width:200px;flex:1}
#chunkApp .wd.ok{color:light-dark(#3e6b2f,#9ccf86)}#chunkApp .wd.close{color:light-dark(#9a6a12,#e0b45a)}#chunkApp .wd.miss{color:light-dark(#a8402e,#f08a77);text-decoration:underline wavy}
#chunkApp .ring{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;font:700 24px Georgia,serif;border:5px solid var(--chip)}
#chunkApp .scores{display:flex;flex-wrap:wrap;gap:14px;align-items:center}#chunkApp .sc{display:grid}#chunkApp .sc b{font-size:22px}#chunkApp .sc span{font-size:13px;color:var(--mute)}
#chunkApp .lvl{height:6px;background:var(--rule);border-radius:9px;overflow:hidden;max-width:260px}#chunkApp .lvl i{display:block;height:100%;width:0;background:light-dark(#8b4a3c,#b0685a)}
@media(max-width:600px){#chunkApp .big{font-size:23px}#chunkApp .blk{font-size:17px}}`;document.head.appendChild(css);

/* ---------- views ---------- */
function head(){const n=counts();
 return `<h2 style="font-size:26px;margin:0 0 4px">Phrases</h2>
 <p style="max-width:760px;font-size:17px;margin:0 0 8px">Fluent speakers don't build every sentence word by word: they snap together ready-made chunks, like Lego blocks. Learn the chunk, then click your own words into its slot.</p>
 <p class="note">${n.new} not started · ${n.learning} learning · ${n.learnt} learnt · ${n.mastered} mastered (of ${CH.length})</p>
 <div class="chtabs" role="group" aria-label="Phrases mode">${[['learn','Learn'],['build','Build'],['context','In context']].map(([k,t])=>`<button data-mode="${k}" aria-pressed="${mode===k}">${t}</button>`).join('')}</div>`}
function chunkList(){return `<h3 style="font-size:18px;margin:22px 0 0">All ${CH.length} chunks</h3><div class="list">${CH.map((k,i)=>`<button data-k="${k.id}" aria-current="${cur&&cur.id===k.id}"><span class="dot ${status(k.id)}"></span>${i+1}. ${esc(k.chunk)}</button>`).join('')}</div>`}
function back(k){return `<div class="big" lang="de">${blk('*'+k.chunk)}</div>
 <div><b>Means:</b> ${esc(k.means)} <span class="note" style="display:inline">· literally “${esc(k.lit)}”</span></div>
 <div class="note" style="color:var(--ink)">${esc(k.note)}</div>
 <div style="display:grid;gap:6px">${k.ex.map(([de,en])=>`<div class="exl">${play(de)}<span lang="de"><b>${esc(de)}</b></span><span class="en2">${esc(en)}</span></div>`).join('')}</div>`}

const LAB={new:'New',learning:'Learning',learnt:'Learnt',mastered:'Mastered'};
function boldChunk(de,k){ // bold the words of the chunk inside an everyday example
 const W=new Set((k.chunk.toLowerCase().match(/[\p{L}']+/gu)||[]).filter(w=>w.length>1));
 return esc(de).replace(/[\p{L}']+/gu,w=>W.has(w.toLowerCase())?`<b>${w}</b>`:w)}
function exampleOf(k){const x=k.ctx.find(c=>c.kind==='exact');
 if(x&&CL[x.c]){const c=CL[x.c];return {html:hl(c.de,x.note).replace(/<mark class="chm">/g,'<b>').replace(/<\/mark>/g,'</b>'),en:c.en,spk:c.spk,src:'Said in the documentary'}}
 const [de,en]=k.ex[0];return {html:boldChunk(de,k),en,spk:'',src:k.ctx.length?'Everyday example · the documentary has a close relative under Hear it in context':'Everyday example · this chunk isn’t spoken in the documentary'}}
const perDayCtl=()=>`<p class="pdl">New phrases per day: <input id="pd" type="number" min="1" max="28" value="${S.perDay}" style="width:60px;font:15px Georgia,serif;padding:3px 6px;border:1px solid var(--rule);border-radius:6px;background:var(--paper);color:var(--ink)"></p>`;
function learn(){const now=Date.now(),k=nextCard();if(S.day.d!==today())S.day={d:today(),n:0};
 const dueN=CH.filter(x=>{const c=st(x.id);return c&&c.due<=now}).length,newLeft=Math.max(0,Math.min(S.perDay-S.day.n,CH.filter(x=>!st(x.id)).length));
 if(!k){const nx=CH.map(x=>st(x.id)).filter(Boolean).sort((a,b)=>a.due-b.due)[0],allNew=CH.filter(x=>!st(x.id)).length;
  root.innerHTML=head()+`<div class="card"><div class="done"><h2>Gut gemacht.</h2><p style="color:var(--mute)">No phrases are due right now.${nx?` Next review in ${fmt(nx.due-now)}.`:''}</p>${allNew?`<button class="btn pri" id="more">Learn 2 more new phrases</button>`:''} <button class="btn" data-mode="build">Practise with Build</button></div></div>`+perDayCtl()+chunkList();
  bind();const m=root.querySelector('#more');if(m)m.onclick=()=>{S.day.n=Math.max(0,S.day.n-2);save();learn()};return}
 cur=k;const s=status(k.id),c=st(k.id),ex=exampleOf(k),nexts=[0,1,2,3].map(g=>fmt(sched(c,g,now).due-now));
 root.innerHTML=head()+`<div class="card">
 <div class="meta"><span>No. ${CH.indexOf(k)+1} of ${CH.length}</span><span class="tag t-${s}">${LAB[s]}</span><span>${dueN} due · ${newLeft} new left today</span></div>
 <div class="big" lang="de">${esc(k.chunk)}</div>
 <div class="reveal ${shown?'':'unrevealed'}">
  <div class="en">${esc(k.means)}</div>
  <p class="note">Literally “${esc(k.lit)}”. ${esc(k.note)}</p>
  <div class="ex"><div lang="de">${ex.html}</div><div style="color:var(--mute);margin-top:4px">${esc(ex.en)}${ex.spk?` (${esc(ex.spk)})`:''}</div></div>
  <div style="color:var(--mute);font-size:13px;margin-top:8px">${ex.src}</div>
 </div>
 ${shown?`<div class="grades">${['Again','Hard','Good','Easy'].map((t,g)=>`<button class="g${g}" data-g="${g}">${t}<small>${nexts[g]}</small></button>`).join('')}</div>`
  :`<div class="row"><button class="btn pri" id="show">Show answer</button></div>`}
 <div class="row"><button class="btn" id="bSay">Say it</button><button class="btn" id="bHear">Hear it in context</button></div>
 </div>`+perDayCtl()+chunkList();bind();
 root.querySelector('#bSay').onclick=()=>hear(k.ex[0][0]);
 root.querySelector('#bHear').onclick=()=>{mode='context';render()}}
function gradeChunk(g){const k=cur;if(!k||!shown)return;const was=!st(k.id);S.cards[k.id]=sched(st(k.id),g,Date.now());if(was)S.day.n++;save();shown=false;learn()}
document.addEventListener('keydown',e=>{const sec=document.getElementById('chunks');if(!sec||sec.hidden||mode!=='learn'||e.target.closest('input,textarea'))return;
 if(e.key===' '){e.preventDefault();if(!shown){shown=true;learn()}}else if(shown&&'1234'.includes(e.key)&&e.key.length===1)gradeChunk(+e.key-1)});

function build(){const k=cur||CH[0];if(bi>2)return yours();
 const it=k.build[bi];if(!tray.length&&!placed.length)tray=shuffle(it.blocks.concat(it.extra)).map((t,i)=>({t,i}));
 root.innerHTML=head()+`<div class="chcard">
  <div class="note">${esc(k.chunk)} · step ${bi+1} of 4</div>
  <div style="font-size:21px">Build: <b>${esc(it.en)}</b></div>
  <div class="line" id="line">${placed.map((p,j)=>blk(p.t,checked?(checked.ok?'good':(checked.bad.includes(j)?'bad':'good')):'').replace('class="blk','data-back="'+j+'" class="blk')).join('')}</div>
  <div id="tray">${tray.map(p=>blk(p.t,placed.some(x=>x.i===p.i)?'used':'').replace('class="blk','data-pick="'+p.i+'" class="blk')).join('')}</div>
  ${checked?(checked.ok?`<div class="fb ok"><b>Richtig!</b><div lang="de">${play(checked.ans)} ${esc(checked.ans)}</div></div>`
   :`<div class="fb no"><b>Not quite.</b><div>The right order is: <span lang="de">${play(checked.ans)} <b>${esc(checked.ans)}</b></span></div><div>${esc(k.note)}</div></div>`):''}
  <div class="ctrls">${checked?(checked.ok?`<button class="btn pri" id="nxt">Next →</button>`:`<button class="btn" id="again">Try again</button><button class="btn pri" id="nxt">Next →</button>`)
   :`<button class="btn pri" id="chk" ${placed.length?'':'disabled'}>Check</button><button class="btn" id="clr">Clear</button>`}<span class="note">Brown blocks are the chunk.</span></div>
 </div>`+chunkList();bind()}
function check(){const k=cur,it=k.build[bi],ans=sentence(it.blocks),got=sentence(placed.map(p=>p.t));
 const ok=normS(got)===normS(ans);const bad=[];placed.forEach((p,j)=>{if(plain(p.t)!==plain(it.blocks[j]||''))bad.push(j)});
 checked={ok,ans,bad};if(ok)hear(ans);build()}

function yours(){const k=cur,fr=k.slot.frame,parts=fr.split('{…}'),sent=mine.trim()?(parts[0]+mine.trim()+parts[1]).replace(/\s+([?!.,])/g,'$1'):'';
 root.innerHTML=head()+`<div class="chcard">
  <div class="note">${esc(k.chunk)} · step 4 of 4: your own words</div>
  <div style="font-size:21px">Click your own words into the slot</div>
  <div class="note" style="color:var(--ink)">${esc(k.slot.hint)}</div>
  <div class="ctrls" lang="de">${parts[0].trim()?blk('*'+parts[0].trim()):''}<input class="slot" id="mine" value="${esc(mine)}" placeholder="your words" autocomplete="off" spellcheck="false" lang="de">${/[\p{L}\p{N}]/u.test(parts[1])?blk('*'+parts[1].trim()):`<span style="font-size:22px">${esc(parts[1].trim())}</span>`}</div>
  <div class="note">Ideas: ${k.slot.ideas.map(x=>`<button class="link" data-idea="${esc(x)}">${esc(x)}</button>`).join(' · ')}</div>
  ${sent?`<div class="big" lang="de" id="sent">${esc(sent)}</div>
   <div class="ctrls"><button class="btn" id="hearme">▶ Hear it</button><button class="btn pri" id="sayit">● Say it</button><div class="lvl"><i id="lvl"></i></div></div>
   <div id="score">${take?take:''}</div>`:''}
  <div class="note">Reminder: ${esc(k.note)}</div>
  <div class="ctrls"><button class="btn" id="redo">↺ Build again</button><button class="btn" id="ctx">Hear it in context →</button><button class="btn" id="nextk">Next chunk →</button></div>
 </div>`+chunkList();bind();
 const m=root.querySelector('#mine');m.oninput=()=>{mine=m.value;take=null;const p=m.selectionStart;yours();const n=root.querySelector('#mine');n.focus();n.setSelectionRange(p,p)};
 if(sent){root.querySelector('#hearme').onclick=()=>hear(sent);
  const sb=root.querySelector('#sayit');sb.onclick=async()=>{const d=DLG();if(!d||!d.practise){root.querySelector('#score').innerHTML='<p class="note">Speaking practice needs the Dialogues part of the app.</p>';return}
   if(rec){sb.disabled=true;sb.textContent='Marking…';const r=rec;rec=null;try{const {sc}=await r.stop();take=scoreView(sent,sc)}catch(e){take=`<p class="note">Something went wrong (${esc(e.message||e)}). Try again.</p>`}yours();return}
   try{d.stop&&d.stop();rec=d.practise(sent,x=>{const l=root.querySelector('#lvl');if(l)l.style.width=(x*100)+'%'},()=>sb.click());await rec.start();sb.textContent='■ Stop';root.querySelector('#score').innerHTML='<p class="note">Recording… say your sentence.</p>'}
   catch(e){rec=null;root.querySelector('#score').innerHTML=`<p class="note">The microphone isn't available (${esc(e.message||e.name||e)}).</p>`}}}}
function scoreView(sent,sc){if(!sc||sc.total==null)return DLG().scoreHTML(sc||{});let i=0;const stt=sc.status||[];
 const words=esc(sent).replace(/[\p{L}\p{N}ß]+/gu,w=>`<span class="wd ${stt[i++]||''}">${w}</span>`);
 return `<div class="big" lang="de">${words}</div>`+DLG().scoreHTML(sc)}

function context(){const k=cur||CH[0];
 root.innerHTML=head()+`<div class="chcard"><div class="big" lang="de">${blk('*'+k.chunk)}</div><div class="note">${esc(k.means)}</div>
 ${k.ctx.length?k.ctx.map((x,j)=>{const c=CL[x.c]||{de:'',en:''};return `<div style="display:grid;gap:8px;border-top:1px solid var(--rule);padding-top:12px">
   <div class="note">${x.kind==='exact'?'<b style="color:var(--ink)">Used in the film</b>':'Close relative in the film'} · ${esc(c.spk||'')}</div>
   <video src="clips/${esc(x.c)}.mp4" playsinline controls preload="metadata"></video>
   <div class="sub" lang="de"><div>${hl(c.de,x.note)}</div><div class="en">${esc(c.en)}</div></div>
   <div class="note" style="color:var(--ink)">${esc(x.note)}</div></div>`}).join('')
 :`<p style="font-size:16px">This chunk isn't spoken in the documentary, so here it is in everyday sentences instead:</p>`}
 <div style="display:grid;gap:6px">${k.ex.map(([de,en])=>`<div class="exl">${play(de)}<span lang="de"><b>${esc(de)}</b></span><span class="en2">${esc(en)}</span></div>`).join('')}</div>
 <div class="ctrls"><button class="btn pri" id="tobuild">Build with it →</button></div></div>`+chunkList();bind()}

function render(){if(mode==='learn')learn();else if(mode==='build')build();else context()}
function bind(){const $=s=>root.querySelector(s),A=s=>root.querySelectorAll(s);
 A('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;shown=false;resetBuild();render()});
 A('[data-k]').forEach(b=>b.onclick=()=>{cur=CH.find(k=>k.id===b.dataset.k);shown=false;resetBuild();if(mode==='learn')mode='build';render()});
 A('[data-say]').forEach(b=>b.onclick=()=>hear(b.dataset.say));
 const sh=$('#show');if(sh)sh.onclick=()=>{shown=true;learn()};
 A('[data-g]').forEach(b=>b.onclick=()=>gradeChunk(+b.dataset.g));
 const pd=$('#pd');if(pd){pd.onkeydown=e=>e.stopPropagation();pd.onchange=()=>{S.perDay=Math.max(1,Math.min(28,Math.round(+pd.value)||4));save();learn()}}
 A('[data-pick]').forEach(b=>b.onclick=()=>{if(checked)return;const p=tray.find(x=>x.i==b.dataset.pick);if(p&&!placed.includes(p)){placed.push(p);build()}});
 A('[data-back]').forEach(b=>b.onclick=()=>{if(checked)return;placed.splice(+b.dataset.back,1);build()});
 const ck=$('#chk');if(ck)ck.onclick=check;const cl=$('#clr');if(cl)cl.onclick=()=>{placed=[];build()};
 const ag=$('#again');if(ag)ag.onclick=()=>{placed=[];checked=null;build()};
 const nx=$('#nxt');if(nx)nx.onclick=()=>{bi++;placed=[];tray=[];checked=null;build()};
 A('[data-idea]').forEach(b=>b.onclick=()=>{mine=b.dataset.idea;take=null;yours()});
 const rd=$('#redo');if(rd)rd.onclick=()=>{resetBuild();build()};
 const cx=$('#ctx');if(cx)cx.onclick=()=>{mode='context';render()};
 const nk=$('#nextk');if(nk)nk.onclick=()=>{cur=CH[(CH.indexOf(cur)+1)%CH.length];resetBuild();build()};
 const tb=$('#tobuild');if(tb)tb.onclick=()=>{mode='build';resetBuild();build()};
}
function resetBuild(){bi=0;placed=[];tray=[];checked=null;mine='';take=null;if(rec){try{rec.stop()}catch(e){}rec=null}}
window.CHK={open(){render()},leave(){root.querySelectorAll('video').forEach(v=>v.pause());if(rec){try{rec.stop()}catch(e){}rec=null}}};
})();
