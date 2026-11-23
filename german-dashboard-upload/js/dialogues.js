// Dialogues: four connected beginner stories. LingoDeer-style: listen → speak line by line → hear your whole dialogue.
// Audio for the story lines is spoken by a German voice from the exact text on screen, so text and audio always match.
// A recording is always marked against the line it was made for: the line object is passed straight to the scorer.
(function(){
const root=document.getElementById('dlgApp');
const ST=window.STORIES||[],W=window.WORDS||[];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
const player=new Audio();
const WMAP=new Map(W.map(w=>[w[0],w]));

/* ---------- styles ---------- */
const css=document.createElement('style');css.textContent=`
#dlgApp .dgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
#dlgApp .story{display:flex;flex-direction:column;gap:6px;text-align:left;border:1px solid var(--rule);border-radius:8px;background:var(--paper);padding:16px 18px;cursor:pointer;font:inherit;color:inherit}
#dlgApp .story:hover{background:var(--chip)}#dlgApp .story.locked{opacity:.75}
#dlgApp .story .ep{font-size:13px;color:var(--mute)}#dlgApp .story h3{font-size:21px}
#dlgApp .lock{font-size:14px;color:var(--claret)}
#dlgApp .pbar{height:18px;border:2px solid var(--green2);border-radius:5px;padding:3px;margin-top:6px}#dlgApp .pbar i{display:block;height:100%;background:var(--green2)}
#dlgApp .sess{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--rule)}
#dlgApp .pills{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0 18px}
#dlgApp .pill{border:0;background:var(--chip);border-radius:999px;padding:6px 14px;font:15px Georgia,serif;cursor:pointer;color:var(--ink);min-height:38px}
#dlgApp .pill[aria-pressed=true]{background:var(--green2);color:light-dark(#fff,#1c1a18)}
#dlgApp .chat{display:grid;gap:12px;max-width:760px}
#dlgApp .msg{display:grid;grid-template-columns:44px minmax(0,1fr);gap:10px;align-items:start;text-align:left;font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
#dlgApp .msg.m{grid-template-columns:minmax(0,1fr) 44px}#dlgApp .msg.m .av{order:2}
#dlgApp .av{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-weight:700;color:light-dark(#fff,#1c1a18)}
#dlgApp .av.f{background:#a7826d}#dlgApp .av.m{background:#5c4033}
#dlgApp .bub{border:1px solid var(--rule);border-radius:12px;padding:10px 14px;background:var(--paper)}
#dlgApp .msg.m .bub{background:var(--chip)}
#dlgApp .msg.now .bub{border-color:var(--green2);box-shadow:0 0 0 1px var(--green2)}
#dlgApp .bub .sp{font-size:13px;color:var(--mute)}#dlgApp .bub .en{color:var(--mute);font-size:15px}
#dlgApp .dl{font-size:19px;line-height:1.6}
#dlgApp .wd{cursor:help}
#dlgApp .nw{text-decoration:underline;text-decoration-color:var(--claret);text-decoration-thickness:2px;text-underline-offset:4px}
#dlgApp .gloss{position:sticky;bottom:10px;margin-top:14px;border:1px solid var(--rule);background:var(--paper);border-radius:8px;padding:10px 14px;min-height:46px;font-size:15px;box-shadow:0 6px 20px -12px rgba(0,0,0,.4)}
#dlgApp .ctrls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
#dlgApp .dprog{display:flex;gap:4px}#dlgApp .dprog i{flex:1;height:6px;border-radius:3px;background:var(--chip);padding:0}
#dlgApp .dprog i.pd{background:var(--lnt)}#dlgApp .dprog i.pc{background:var(--green2)}
#dlgApp select{max-width:min(100%,260px)}
#dlgApp .dstage{display:grid;gap:14px;max-width:760px}
#dlgApp .bigline{font-size:clamp(22px,2.8vw,28px);line-height:1.5}
#dlgApp .w{border-radius:3px;padding:0 1px}
#dlgApp .ok{background:light-dark(#e1ead9,#2f3d2a)}#dlgApp .close{background:light-dark(#f3e6cf,#4a3c22)}#dlgApp .miss{background:light-dark(#f1dad5,#4a2a25);text-decoration:underline wavy #9b3b30}
#dlgApp .btn.rec{border-color:var(--green2);color:var(--green2)}#dlgApp .btn.rec.on{background:#9b3b30;border-color:#9b3b30;color:#fff}
#dlgApp .meter{height:8px;border-radius:4px;background:var(--chip);overflow:hidden}#dlgApp .meter i{display:block;height:100%;width:0;background:var(--green2);transition:width .08s}
#dlgApp .scores{display:grid;grid-template-columns:auto repeat(3,minmax(0,1fr));gap:14px;align-items:center}
#dlgApp .ring{width:84px;height:84px;border-radius:50%;display:grid;place-items:center;font:700 26px Georgia,serif;border:5px solid var(--chip)}
#dlgApp .sc b{display:block;font-size:20px}#dlgApp .sc span{font-size:13px;color:var(--mute)}
#dlgApp .note{font-size:14px;color:var(--mute);margin:6px 0}
#dlgApp .banner{border:1px solid var(--rule);border-left:3px solid var(--green2);border-radius:6px;padding:10px 14px;background:var(--chip);font-size:15px}
#dlgApp .heard{font-size:15px;color:var(--mute)}#dlgApp .heard b{color:var(--ink);font-weight:400}
#dlgApp .total{display:flex;gap:22px;align-items:center;flex-wrap:wrap}
#dlgApp .total .ring{width:120px;height:120px;font-size:38px;border-width:7px}
#dlgApp .rl{display:grid;grid-template-columns:110px minmax(0,1fr) 64px auto;gap:12px;align-items:center;padding:10px 8px;border-bottom:1px solid var(--rule);border-radius:6px}
#dlgApp .rl.now{background:var(--chip)}#dlgApp .rl .sp{font-size:14px;color:var(--mute)}#dlgApp .rl .s{font-weight:700;text-align:right}
#dlgApp .iconb{border:1px solid var(--rule);background:var(--paper);border-radius:6px;min-width:42px;min-height:38px;padding:4px 8px;font:14px Georgia,serif;color:var(--ink);cursor:pointer}
#dlgApp .link{background:none;border:0;padding:0;color:var(--ink);border-bottom:1px solid var(--rule);font:inherit;cursor:pointer}
#dlgApp select{font:15px Georgia,serif;padding:6px 8px;border:1px solid var(--rule);border-radius:6px;background:var(--paper);color:var(--ink);max-width:260px}
#dlgApp details{border:1px solid var(--rule);border-radius:8px;padding:10px 14px;margin:14px 0;max-width:760px}#dlgApp summary{cursor:pointer}
@media(max-width:900px){#dlgApp .dgrid{grid-template-columns:repeat(2,minmax(0,1fr))}#dlgApp .scores{grid-template-columns:auto repeat(2,minmax(0,1fr))}#dlgApp .rl{grid-template-columns:minmax(0,1fr) 54px auto}#dlgApp .rl .sp{grid-column:1/-1}}
@media(max-width:520px){#dlgApp .dgrid{grid-template-columns:minmax(0,1fr)}}`;
document.head.appendChild(css);

/* ---------- words ---------- */
function lineHTML(l,s,st,acc){ // st: optional per-word marking statuses from a scored take; acc: optional per-word Azure scores
 let i=0,k=0;const toks=l.tok;
 return esc(l.de).replace(/[\p{L}\p{N}ß]+/gu,t=>{const tk=toks[i++]||{};const a=acc?acc[k]:null;const mark=st?st[k++]:'';
  const inBlock=tk.r&&tk.r>=s.words[0]&&tk.r<=s.words[1];
  const mean=tk.r?(WMAP.get(tk.r)||[])[2]:tk.g;const tip=tk.name?'name':mean||'';
  return `<span class="wd ${inBlock?'nw':''} ${mark?'w '+mark:''}" data-tip="${esc(t+': '+tip+(tk.r?' · word no. '+tk.r:'')+(a!=null?' · your pronunciation: '+a+'/100':''))}">${t}</span>`});
}
function bindGloss(){const g=q('#gloss');if(!g)return;qa('.wd').forEach(w=>{w.onmouseenter=w.onclick=e=>{e.stopPropagation();g.textContent=w.dataset.tip}})}

/* ---------- voices ---------- */
let VO={};try{VO=JSON.parse(localStorage.getItem('gd-voices')||'{}')}catch(e){}
const voices=()=>speechSynthesis.getVoices().filter(v=>/^de/i.test(v.lang));
const FEM=/anna|petra|helena|marlene|vicki|katja|sandy|shelley|flo|eddy?f|google deutsch/i,MAL=/markus|yannick|viktor|hans|martin|stefan|conrad|reed|rocko|grandpa/i;
const quality=v=>(/premium/i.test(v.name)?100:/enhanced|erweitert|verbessert/i.test(v.name)?70:/google/i.test(v.name)?60:/siri/i.test(v.name)?80:0)+(v.localService?0:5);
function pick(gender){const vs=voices();if(!vs.length)return null;const want=VO[gender];const named=vs.find(v=>v.name===want);if(named)return named;
 const re=gender==='f'?FEM:MAL;const pool=vs.filter(v=>re.test(v.name));return (pool.length?pool:vs).slice().sort((a,b)=>quality(b)-quality(a))[0]}
speechSynthesis.onvoiceschanged=()=>{if(view.name==='home')home()};
let rate=+(localStorage.getItem('gd-rate')||1);const RATES={slow:.75,normal:1};
const durCache={};
function sayBrowser(l,s,r=rate){return new Promise(res=>{try{speechSynthesis.cancel();const g=s.cast[l.spk]||'f';const v=pick(g);
 const u=new SpeechSynthesisUtterance(l.de);u.lang='de-DE';if(v)u.voice=v;u.rate=r*0.95;
 const same=v&&pick('f')&&pick('m')&&pick('f').name===pick('m').name;u.pitch=g==='m'&&same?0.8:1;
 const t0=performance.now();let done=false;const fin=()=>{if(done)return;done=true;const d=(performance.now()-t0)/1000;if(d>0.3)durCache[l.id]=d*r;res(d)};
 u.onend=fin;u.onerror=fin;speechSynthesis.speak(u);setTimeout(fin,(l.de.length/8+3)*1000/r)}catch(e){res(0)}})}

/* ---------- Google Cloud Text-to-Speech (natural voices; each line is fetched once, then kept on this Mac) ---------- */
const LS=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const GC={sttModel:LS('gd-gstt',''),key:LS('gd-gkey',''),voices:LS('gd-gvoices',[]),pick:LS('gd-gpick',{}),enabled:LS('gd-gon',true),provider:'gemini',model:LS('gd-gmodel',''),err:''};
const saveGC=()=>{try{localStorage.setItem('gd-gprov',JSON.stringify(GC.provider));localStorage.setItem('gd-gmodel',JSON.stringify(GC.model));localStorage.setItem('gd-gkey',JSON.stringify(GC.key));localStorage.setItem('gd-gvoices',JSON.stringify(GC.voices));localStorage.setItem('gd-gpick',JSON.stringify(GC.pick));localStorage.setItem('gd-gon',JSON.stringify(GC.enabled))}catch(e){}};
const gRank=n=>/Chirp3-HD/i.test(n)?5:/Chirp-HD/i.test(n)?4:/Studio/i.test(n)?3:/Neural2/i.test(n)?2:/Wavenet/i.test(n)?1:0;
const gAll=()=>GC.provider==='gemini'?GEM_VOICES:GC.voices;
const gList=g=>gAll().filter(v=>v.ssmlGender===(g==='f'?'FEMALE':'MALE')).sort((a,b)=>gRank(b.name)-gRank(a.name)||a.name.localeCompare(b.name));
function gVoice(g){const w=(GC.pick[GC.provider]||{})[g];if(w&&gAll().some(v=>v.name===w))return w;if(GC.provider==='gemini')return g==='f'?'Kore':'Charon';const l=gList(g);return l.length?l[0].name:(GC.voices[0]||{}).name}
const gOn=()=>!!(GC.enabled&&GC.key&&(GC.provider==='gemini'?GC.model:GC.voices.length));
/* ---------- ElevenLabs: the story voices (each line fetched once, then kept on this device) ---------- */
const EL={key:LS('gd-elkey',''),voices:LS('gd-elvoices',[]),pick:LS('gd-elpick',{}),err:''};
const saveEL=()=>{try{localStorage.setItem('gd-elkey',JSON.stringify(EL.key));localStorage.setItem('gd-elvoices',JSON.stringify(EL.voices));localStorage.setItem('gd-elpick',JSON.stringify(EL.pick))}catch(e){}};
const ELAPI='https://api.elevenlabs.io/v1/';
const elOn=()=>!!EL.key;
async function elJSON(r){const j=await r.json().catch(()=>({}));if(!r.ok){const d=j.detail;throw new Error((d&&typeof d==='object'&&(d.message||d.status))||(typeof d==='string'?d:'')||('ElevenLabs answered '+r.status))}return j}
async function elFetchVoices(key){const j=await elJSON(await fetch(ELAPI+'voices',{headers:{'xi-api-key':key}}));
 const rank=c=>c==='generated'?0:c==='cloned'||c==='professional'?1:2;
 return (j.voices||[]).map(v=>({id:v.voice_id,name:v.name,g:String((v.labels||{}).gender||'').toLowerCase(),cat:v.category||''})).sort((a,b)=>rank(a.cat)-rank(b.cat)||a.name.localeCompare(b.name))}
function elVoice(g){const p=EL.pick[g];if(p&&p.id)return p;const want=g==='f'?'female':'male';const v=EL.voices.find(x=>x.g===want)||EL.voices[g==='f'?0:1]||EL.voices[0];return v?{id:v.id,name:v.name}:null}
async function elAudio(text,g){const v=elVoice(g);if(!v)throw new Error('choose voices for Sophie and Moritz in the Voices panel');const k='el:'+v.id+'|'+text;const c=await cacheGet(k);if(c)return c;
 const r=await fetch(ELAPI+'text-to-speech/'+encodeURIComponent(v.id)+'?output_format=mp3_44100_128',{method:'POST',headers:{'xi-api-key':EL.key,'Content-Type':'application/json','Accept':'audio/mpeg'},body:JSON.stringify({text,model_id:'eleven_multilingual_v2'})});
 if(!r.ok)await elJSON(r);const b=new Blob([await r.arrayBuffer()],{type:'audio/mpeg'});if(!b.size)throw new Error('ElevenLabs sent no audio');await cachePut(k,b);return b}
async function elUsage(){try{const j=await elJSON(await fetch(ELAPI+'user/subscription',{headers:{'xi-api-key':EL.key}}));return j.character_limit?{used:j.character_count||0,limit:j.character_limit}:null}catch(e){return null}}
const ttsOn=()=>elOn()||gOn();
const ttsName=()=>elOn()?'ElevenLabs':'Gemini';
const voiceLabel=g=>elOn()?((elVoice(g)||{}).name||'?'):gVoice(g);
async function lineBlob(text,g,onWait){if(elOn()){try{const b=await elAudio(text,g);EL.err='';return b}catch(e){EL.err=e.message||String(e);if(!gOn())throw e}}return gAudio(text,gVoice(g),onWait)}

/* ---------- Azure pronunciation assessment: scores each recording against the exact line it was made for ---------- */
const AZ={key:LS('gd-azkey',''),region:LS('gd-azregion','')};
const saveAZ=()=>{try{localStorage.setItem('gd-azkey',JSON.stringify(AZ.key));localStorage.setItem('gd-azregion',JSON.stringify(AZ.region))}catch(e){}};
const azOn=()=>!!(AZ.key&&AZ.region);
async function azPost(wav,ref,key,region){
 const params=btoa(unescape(encodeURIComponent(JSON.stringify({ReferenceText:ref,GradingSystem:'HundredMark',Granularity:'Phoneme',Dimension:'Comprehensive',EnableMiscue:true}))));
 const r=await fetch(`https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=de-DE&format=detailed`,{method:'POST',
  headers:{'Ocp-Apim-Subscription-Key':key,'Content-Type':'audio/wav; codecs=audio/pcm; samplerate=16000','Accept':'application/json','Pronunciation-Assessment':params},body:wav});
 const t=await r.text();let j={};try{j=JSON.parse(t)}catch(e){}
 if(!r.ok)throw new Error(r.status===401?'Azure rejected the key (check the key and the region)':(j.error&&j.error.message)||j.Message||('Azure answered '+r.status));return j}
async function azAssess(blob,line){return azPost(await toWav16k(blob),line.de,AZ.key,AZ.region)}
const anyKey=()=>elOn()||azOn()||(GC.provider==='gemini'&&!!GC.key);

const GAPI='https://texttospeech.googleapis.com/v1/';
async function gJSON(r){const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&j.error.message)||('Google answered '+r.status));return j}
async function gFetchVoices(key){const j=await gJSON(await fetch(GAPI+'voices?languageCode=de-DE&key='+encodeURIComponent(key)));
 return (j.voices||[]).filter(v=>(v.languageCodes||[]).includes('de-DE')).map(v=>({name:v.name,ssmlGender:v.ssmlGender}))}
function cacheGet(k){return idb.then(d=>d&&d.objectStoreNames.contains('tts')?new Promise(res=>{const g=d.transaction('tts','readonly').objectStore('tts').get(k);g.onsuccess=()=>res(g.result||null);g.onerror=()=>res(null)}):null).catch(()=>null)}
function cachePut(k,b){return idb.then(d=>d&&d.objectStoreNames.contains('tts')?new Promise(res=>{const t=d.transaction('tts','readwrite');t.objectStore('tts').put(b,k);t.oncomplete=()=>res();t.onerror=()=>res()}):null).catch(()=>null)}
async function gAudio(text,voice,onWait){const k=(GC.provider==='gemini'?'gem:':'')+voice+'|'+text;const c=await cacheGet(k);if(c)return c;
 if(GC.provider==='gemini'){const b=await gemSynth(text,voice,onWait);await cachePut(k,b);return b}
 const b=await cloudSynth(text,voice);await cachePut(k,b);return b}
async function cloudSynth(text,voice){
 const j=await gJSON(await fetch(GAPI+'text:synthesize?key='+encodeURIComponent(GC.key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:{text},voice:{languageCode:'de-DE',name:voice},audioConfig:{audioEncoding:'MP3'}})}));
 if(!j.audioContent)throw new Error('Google sent no audio.');const bin=atob(j.audioContent),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
 return new Blob([u],{type:'audio/mpeg'})}
/* Gemini speech: a key from Google AI Studio is enough (no billing account). Its voices speak natural standard German. */
const GEM_F=['Kore','Aoede','Leda','Zephyr','Callirrhoe','Autonoe','Despina','Erinome','Laomedeia','Pulcherrima','Vindemiatrix','Sulafat','Achernar','Gacrux'];
const GEM_M=['Charon','Puck','Orus','Fenrir','Enceladus','Iapetus','Umbriel','Algieba','Algenib','Rasalgethi','Alnilam','Schedar','Achird','Zubenelgenubi','Sadachbia','Sadaltager'];
const GEM_VOICES=GEM_F.map(n=>({name:n,ssmlGender:'FEMALE'})).concat(GEM_M.map(n=>({name:n,ssmlGender:'MALE'})));
const GEMAPI='https://generativelanguage.googleapis.com/v1beta/';
async function gemFindModel(key){const j=await gJSON(await fetch(GEMAPI+'models?pageSize=200&key='+encodeURIComponent(key)));
 const tts=(j.models||[]).filter(m=>/tts/i.test(m.name)&&(m.supportedGenerationMethods||['generateContent']).includes('generateContent')).map(m=>m.name.replace(/^models\//,''));
 if(!tts.length)throw new Error('This key has no access to a Gemini speech (TTS) model.');
 return tts.sort((a,b)=>(/flash/.test(b)-/flash/.test(a))||(/preview/.test(a)-/preview/.test(b))||b.localeCompare(a))[0]}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function pcmToWav(u8,rate){const len=u8.length,buf=new ArrayBuffer(44+len),dv=new DataView(buf),ws=(p,t)=>[...t].forEach((c,k)=>dv.setUint8(p+k,c.charCodeAt(0)));
 ws(0,'RIFF');dv.setUint32(4,36+len,true);ws(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,rate,true);dv.setUint32(28,rate*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,len,true);new Uint8Array(buf,44).set(u8);return new Blob([buf],{type:'audio/wav'})}
async function gemSynth(text,voice,onWait){
 for(let attempt=0;attempt<4;attempt++){
  const r=await fetch(GEMAPI+'models/'+GC.model+':generateContent?key='+encodeURIComponent(GC.key),{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({contents:[{parts:[{text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:voice}}}}})});
  if(r.status===429||r.status===503){const j=await r.json().catch(()=>({}));const d=((j.error&&j.error.details)||[]).find(x=>x.retryDelay);const wait=d?parseFloat(d.retryDelay)*1000+500:(attempt+1)*15000;
   if(wait>60000)break;
   if(onWait)onWait(Math.round(wait/1000));await sleep(wait);continue}
  const j=await gJSON(r);const part=(((j.candidates||[])[0]||{}).content||{}).parts||[];const ad=part.find(x=>x.inlineData);
  if(!ad)throw new Error('Gemini sent no audio for this line.');const bin=atob(ad.inlineData.data),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  const m=/rate=(\d+)/.exec(ad.inlineData.mimeType||'');return /wav|mpeg|mp3|ogg/.test(ad.inlineData.mimeType||'')?new Blob([u],{type:ad.inlineData.mimeType}):pcmToWav(u,m?+m[1]:24000)}
 throw new Error("Gemini's free daily allowance for speech is used up (it resets at 8–9am UK time). Lines already fetched still play in the Gemini voice; the rest use the browser voice until then.")}

/* ---------- export: every line's audio as files in one .zip ---------- */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=u=>{let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0};
function makeZip(files){ // files: [{name, data:Uint8Array}] — stored (no compression), which suits audio
 const enc=new TextEncoder(),parts=[],cen=[];let off=0;
 for(const f of files){const nm=enc.encode(f.name),c=crc32(f.data),h=new DataView(new ArrayBuffer(30));
  h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint32(14,c,true);h.setUint32(18,f.data.length,true);h.setUint32(22,f.data.length,true);h.setUint16(26,nm.length,true);
  parts.push(new Uint8Array(h.buffer),nm,f.data);
  const d=new DataView(new ArrayBuffer(46));d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint32(16,c,true);d.setUint32(20,f.data.length,true);d.setUint32(24,f.data.length,true);d.setUint16(28,nm.length,true);d.setUint32(42,off,true);
  cen.push(new Uint8Array(d.buffer),nm);off+=30+nm.length+f.data.length}
 const csize=cen.reduce((a,x)=>a+x.length,0),e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,csize,true);e.setUint32(16,off,true);
 return new Blob([...parts,...cen,new Uint8Array(e.buffer)],{type:'application/zip'})}
const slug=t=>t.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ß/g,'ss').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'');
async function exportAudio(progress){
 const files=[],enc=new TextEncoder();let n=0;const total=ST.reduce((a,s)=>a+s.lines.length,0);let txt='';
 for(const [si,s] of ST.entries()){const dir=`Story-${si+1}-${slug(s.title)}`;txt+=`Story ${si+1}: ${s.title} (${s.en_title})\n`;
  for(const [li,l] of s.lines.entries()){const b=recOn()&&AUD.files[l.id]?await (await fetch(AUD.files[l.id])).blob():await lineBlob(l.de,s.cast[l.spk],sec=>progress(`Fetched ${n} of ${total}. Google asked to wait ${sec} s…`));
   const ext=/wav/.test(b.type)?'wav':/ogg/.test(b.type)?'ogg':'mp3';const name=`${dir}/${String(li+1).padStart(2,'0')}-${l.spk}.${ext}`;
   files.push({name,data:new Uint8Array(await b.arrayBuffer())});txt+=`  ${String(li+1).padStart(2,'0')}  ${l.spk}: ${l.de}\n      ${l.en}\n`;n++;progress(`Collected ${n} of ${total} lines…`)}
  txt+='\n'}
 files.push({name:'transcript.txt',data:enc.encode(`German Dashboard: story audio (${ttsName()} voices: Sophie = ${voiceLabel('f')}, Moritz = ${voiceLabel('m')})\n\n`+txt)});
 const a=document.createElement('a');a.href=URL.createObjectURL(makeZip(files));a.download='German stories – audio.zip';document.body.appendChild(a);a.click();a.remove();
 return n}
const gPlayer=new Audio();gPlayer.preservesPitch=true;let gPending=null;
function sayGoogle(l,s,r){return new Promise(async(res,rej)=>{try{gStop();const g=s.cast[l.spk]||'f';const b=await lineBlob(l.de,g);const url=URL.createObjectURL(b);
 let done=false;const fin=()=>{if(done)return;done=true;gPending=null;URL.revokeObjectURL(url);res(gPlayer.duration||0)};gPending=fin;
 gPlayer.src=url;gPlayer.playbackRate=r;gPlayer.preservesPitch=true;gPlayer.onloadedmetadata=()=>{if(isFinite(gPlayer.duration))durCache[l.id]=gPlayer.duration};
 gPlayer.onended=fin;gPlayer.onerror=fin;await gPlayer.play().catch(fin)}catch(e){rej(e)}})}
function gStop(){try{gPlayer.pause()}catch(e){}if(gPending)gPending()}
const AUD=window.AUDIO||{files:{}};let useRec=LS('gd-userec',true);
const recOn=()=>useRec&&Object.keys(AUD.files||{}).length>0;
function sayFile(l,r){return new Promise(async res=>{gStop();let done=false;const fin=()=>{if(done)return;done=true;gPending=null;res(gPlayer.duration||0)};gPending=fin;
 gPlayer.src=AUD.files[l.id];gPlayer.playbackRate=r;gPlayer.preservesPitch=true;gPlayer.onloadedmetadata=()=>{if(isFinite(gPlayer.duration))durCache[l.id]=gPlayer.duration};gPlayer.onended=fin;gPlayer.onerror=fin;await gPlayer.play().catch(fin)})}
async function say(l,s,r=rate){if(recOn()&&AUD.files[l.id])return sayFile(l,r);if(ttsOn()){try{const d=await sayGoogle(l,s,r);GC.err='';showGErr();return d}catch(e){GC.err=e.message||String(e);showGErr()}}return sayBrowser(l,s,r)}
function showGErr(){const b=q('#gerr');if(b){const m=EL.err||GC.err;b.hidden=!m;b.textContent='Voice problem: '+m+(EL.err&&gOn()?' Using the Gemini voice instead for now.':' Using the browser voice instead for now.')}}
const estDur=l=>durCache[l.id]||Math.max(1,l.de.split(/\s+/).length*0.42);

/* ---------- unlocking ---------- */
let opened={};try{opened=JSON.parse(localStorage.getItem('gd-opened2')||'{}')}catch(e){}
function started(s){const S=window.SRS;if(!S)return 0;let n=0;for(let r=s.words[0];r<=s.words[1];r++)if(S.status(r)!=='new')n++;return n}
const unlocked=s=>opened[s.id]||started(s)>=25||best[s.id]!=null;

/* ---------- storage ---------- */
const idb=new Promise(res=>{try{const r=indexedDB.open('german-dialogues',2);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('sessions'))d.createObjectStore('sessions',{keyPath:'id'});if(!d.objectStoreNames.contains('tts'))d.createObjectStore('tts')};r.onsuccess=()=>res(r.result);r.onerror=()=>res(null)}catch(e){res(null)}});
const tx=(mode,fn)=>idb.then(d=>d?new Promise((res,rej)=>{const t=d.transaction('sessions',mode);const out=fn(t.objectStore('sessions'));t.oncomplete=()=>res(out&&out.result);t.onerror=()=>rej(t.error)}):Promise.reject('no-db'));
const allSessions=()=>tx('readonly',s=>s.getAll()).then(r=>(r||[]).filter(x=>ST.some(s=>s.id===x.storyId)&&(!x.profile||String(x.profile).toLowerCase()===String(window.PROFILE||'').toLowerCase())).sort((a,b)=>b.date-a.date)).catch(()=>[]);
let best={};try{best=JSON.parse(localStorage.getItem('gd-best2')||'{}')}catch(e){}
/* ---------- saved dialogues follow your account (recordings included) ---------- */
const acct=()=>window.Profiles&&window.Profiles.accounts&&window.Profiles.token&&window.Profiles.token();
const b64Blob=(d,type)=>{const bin=atob(d),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Blob([u],{type})};
const metaOf=x=>({id:x.id,storyId:x.storyId,title:x.title,role:x.role,date:x.date,total:x.total,lines:x.lines.map(l=>({id:l.id,sc:l.sc}))});
async function pushSession(x){const T=acct();if(!T)return false;const audio={};
 for(const l of x.lines)if(l.blob)audio[l.id]={type:l.blob.type||'audio/webm',d:await b64(l.blob)};
 await window.Profiles.rpc('gd_sess_put',{p_token:T,p_id:x.id,p_meta:metaOf(x),p_audio:audio});
 x.synced=true;await tx('readwrite',st=>st.put(x)).catch(()=>{});return true}
function bestFrom(list){let ch=false;list.forEach(x=>{if(x.total!=null&&(best[x.storyId]==null||x.total>best[x.storyId])){best[x.storyId]=x.total;ch=true}});
 if(ch)try{localStorage.setItem('gd-best2',JSON.stringify(best))}catch(e){}return ch}
let sessSyncing=null;
function syncSessions(){if(sessSyncing)return sessSyncing;sessSyncing=(async()=>{let changed=false;const T=acct();
 const local=await allSessions();if(bestFrom(local))changed=true;if(!T)return changed;
 const remote=await window.Profiles.rpc('gd_sess_list',{p_token:T});const rid=new Set((remote||[]).map(m=>m.id));
 for(const x of local){if(rid.has(x.id))continue;
  if(x.synced){await tx('readwrite',st=>st.delete(x.id)).catch(()=>{});changed=true}   // deleted on another device
  else{await pushSession(x).catch(e=>console.warn('upload failed',e))}}
 const have=new Set(local.map(x=>x.id));
 for(const m of remote||[]){if(have.has(m.id))continue;
  const full=await window.Profiles.rpc('gd_sess_get',{p_token:T,p_id:m.id});if(!full||!full.meta)continue;const A=full.audio||{};
  const rec={...full.meta,profile:window.PROFILE||null,synced:true,lines:full.meta.lines.map(l=>({id:l.id,sc:l.sc,blob:A[l.id]?b64Blob(A[l.id].d,A[l.id].type):null}))};
  await tx('readwrite',st=>st.put(rec)).catch(()=>{});changed=true}
 if(bestFrom(await allSessions()))changed=true;
 return changed})().catch(e=>{console.warn('saved dialogues not synced:',e);return false}).finally(()=>{sessSyncing=null});return sessSyncing}


/* ---------- recording + speech recognition ---------- */
let actx=null;const AC=()=>actx||(actx=new (window.AudioContext||window.webkitAudioContext)());
let stream=null;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let srProblem=SR?'':'This browser has no speech recognition. Please use Google Chrome.';
async function mic(){if(stream&&stream.active)return stream;stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});return stream}
function recorder(target,onLevel,onAutoStop,maxMs){
 let rec,chunks=[],recog=null,results=[],done=false,raf,t0,spoke=false,quiet=0,env=[],diag=[];const p={};
 p.start=async()=>{const s=await mic();
  rec=new MediaRecorder(s,MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?{mimeType:'audio/webm;codecs=opus'}:undefined);
  rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);rec.start();t0=performance.now();
  if(SR&&!srProblem){try{recog=new SR();recog.lang='de-DE';recog.continuous=true;recog.interimResults=true;recog.maxAlternatives=5;
   recog.onresult=e=>{results=[];for(let i=0;i<e.results.length;i++){results.push([...e.results[i]].map(a=>a.transcript))}};
   recog.onstart=()=>diag.push('started');recog.onaudiostart=()=>diag.push('hearing audio');recog.onspeechstart=()=>diag.push('speech detected');recog.onnomatch=()=>diag.push('no match');
   recog.onerror=e=>{diag.push('error: '+e.error);if(['not-allowed','service-not-allowed'].includes(e.error))srProblem='Chrome blocked speech recognition for this page ('+e.error+').';else if(e.error==='network')srProblem='Speech recognition needs an internet connection.';else if(e.error==='language-not-supported')srProblem='German speech recognition is not available in this Chrome.'};
   recog.start()}catch(e){recog=null;diag.push('could not start: '+(e.message||e))}}else diag.push(srProblem||'not available')
  const an=AC().createAnalyser();an.fftSize=1024;AC().createMediaStreamSource(s).connect(an);const d=new Float32Array(an.fftSize);
  const tick=()=>{if(done)return;an.getFloatTimeDomainData(d);let e=0;for(const v of d)e+=v*v;const rms=Math.sqrt(e/d.length);env.push([performance.now()-t0,rms]);onLevel(Math.min(1,rms*8));
   const t=performance.now();if(rms>.025){spoke=true;quiet=0}else if(spoke){quiet=quiet||t;if(t-quiet>1500)return onAutoStop()}
   if(t-t0>maxMs)return onAutoStop();raf=requestAnimationFrame(tick)};tick()};
 p.stop=()=>new Promise(res=>{done=true;cancelAnimationFrame(raf);onLevel(0);let left=recog?2:1;
  const fin=()=>{if(--left===0)res({blob:new Blob(chunks,{type:rec.mimeType||'audio/webm'}),alts:results,env,diag})};
  rec.onstop=fin;try{rec.stop()}catch(e){fin()}
  if(recog){let ended=false;recog.onend=()=>{if(!ended){ended=true;fin()}};try{recog.stop()}catch(e){}setTimeout(()=>{if(!ended){ended=true;fin()}},2500)}});
 return p;
}


/* ---------- transcription of your recording: Gemini first (reliable from a local file), Chrome's recogniser as backup ---------- */
const gemReady=()=>GC.provider==='gemini'&&!!GC.key;
async function gemSttModel(){if(GC.sttModel)return GC.sttModel;const j=await gJSON(await fetch(GEMAPI+'models?pageSize=200&key='+encodeURIComponent(GC.key)));
 const ok=(j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>m.name.replace(/^models\//,'')).filter(n=>/^gemini/.test(n)&&!/tts|image|embed|live|native|audio|thinking|aqa|learnlm|gemma|vision|exp/.test(n));
 const pref=['gemini-2.5-flash','gemini-2.5-flash-lite','gemini-2.0-flash','gemini-2.0-flash-lite'];
 GC.sttModel=pref.find(n=>ok.includes(n))||ok.find(n=>/flash/.test(n))||ok[0];if(!GC.sttModel)throw new Error('no Gemini text model available to this key');
 try{localStorage.setItem('gd-gstt',JSON.stringify(GC.sttModel))}catch(e){}return GC.sttModel}
async function toWav16k(blob){const buf=await AC().decodeAudioData(await blob.arrayBuffer());const n=Math.max(1,Math.ceil(buf.duration*16000));
 const oc=new OfflineAudioContext(1,n,16000);const src=oc.createBufferSource();src.buffer=buf;src.connect(oc.destination);src.start();const pcm=(await oc.startRendering()).getChannelData(0);
 const u=new Uint8Array(pcm.length*2),dv=new DataView(u.buffer);for(let i=0;i<pcm.length;i++)dv.setInt16(i*2,Math.max(-1,Math.min(1,pcm[i]))*32767,true);return pcmToWav(u,16000)}
async function b64(blob){const u=new Uint8Array(await blob.arrayBuffer());let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)}
async function gemTranscribe(blob){const model=await gemSttModel();const wav=await toWav16k(blob);
 const body={contents:[{parts:[{inlineData:{mimeType:'audio/wav',data:await b64(wav)}},{text:'Transcribe the German speech in this recording exactly as it is spoken, word for word. Write numbers as words. Do not correct mistakes, do not translate and do not add anything. If there is no speech, reply with nothing. Output only the transcript.'}]}],generationConfig:{temperature:0}};
 for(let a=0;a<3;a++){const r=await fetch(GEMAPI+'models/'+model+':generateContent?key='+encodeURIComponent(GC.key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(r.status===429||r.status===503){await sleep((a+1)*4000);continue}
  const j=await gJSON(r);return (((j.candidates||[])[0]||{}).content||{parts:[]}).parts.map(x=>x.text||'').join(' ').replace(/\s+/g,' ').trim()}
 throw new Error('Google is busy (rate limit); try again in a moment')}
async function transcribe(rec,line){rec.by='';
 if(azOn()&&line){try{const j=await azAssess(rec.blob,line);const nb=(j.NBest||[])[0];if(j.RecognitionStatus==='Success'&&nb){rec.az=nb;rec.alts=[[j.DisplayText||nb.Display||'']];rec.by='Azure';return}rec.aerr='Azure heard no speech ('+(j.RecognitionStatus||'no result')+')'}catch(e){rec.aerr='Azure: '+(e.message||String(e))}}
 if(gemReady()){try{const t=await gemTranscribe(rec.blob);if(t&&/[\p{L}]/u.test(t)){rec.alts=[[t]];rec.by='Gemini';return}rec.gempty=true}catch(e){rec.gerr=e.message||String(e)}}
 if(rec.alts&&rec.alts.length)rec.by='Chrome'}
/* ---------- marking: always against the line this recording was made for ---------- */
const NUM={'0':'null','1':'eins','2':'zwei','3':'drei','4':'vier','5':'fünf','6':'sechs','7':'sieben','8':'acht','9':'neun','10':'zehn','12':'zwölf','19':'neunzehn','400':'vierhundert','1200':'zwölfhundert','ok':'okay'};
const norm=s=>s.toLowerCase().replace(/ß/g,'ss').replace(/[„“"«»…–—\-]/g,' ').replace(/[^\p{L}\p{N} ]/gu,' ').split(/\s+/).filter(Boolean).map(w=>NUM[w]||w);
function lev(a,b){const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
const sim=(a,b)=>1-lev(a,b)/Math.max(a.length,b.length,1);
function align(T,H,names){const n=T.length,m=H.length;const D=Array.from({length:n+1},()=>new Array(m+1).fill(0));
 for(let i=0;i<=n;i++)D[i][0]=i;for(let j=0;j<=m;j++)D[0][j]=j*.5;
 for(let i=1;i<=n;i++)for(let j=1;j<=m;j++){const s=sim(T[i-1],H[j-1]);D[i][j]=Math.min(D[i-1][j]+1,D[i][j-1]+.5,D[i-1][j-1]+(1-s))}
 let i=n,j=m;const st=new Array(n).fill('miss');
 while(i>0&&j>0){const s=sim(T[i-1],H[j-1]);if(Math.abs(D[i][j]-(D[i-1][j-1]+1-s))<1e-9){st[i-1]=s>=.999?'ok':s>=.6?'close':'miss';i--;j--}else if(Math.abs(D[i][j]-(D[i-1][j]+1))<1e-9)i--;else j--}
 names.forEach((isName,k)=>{if(isName&&st[k]==='miss')st[k]='name'});
 const counted=st.filter(x=>x!=='name');const pts=counted.reduce((a,x)=>a+(x==='ok'?1:x==='close'?.6:0),0);
 return {score:counted.length?Math.round(100*pts/counted.length):0,status:st}}
function markWords(line,alts){
 const T=norm(line.de),names=line.tok.map(t=>!!t.name);
 if(!alts||!alts.length)return null;
 // choose, for each recognised phrase, the alternative that best fits this line (recognisers often rank a near-miss first)
 let H=[];alts.forEach(opts=>{let bestH=null,bs=-1;opts.forEach(o=>{const h=H.concat(norm(o));const r=align(T,h,names).score;if(r>bs){bs=r;bestH=h}});H=bestH||H});
 const r=align(T,H,names);r.heard=H.join(' ');return r;
}
function rhythm(env,line){ // speaking time compared with the reference reading, and long hesitations
 if(!env||env.length<10)return null;const peak=Math.max(...env.map(e=>e[1]));const th=Math.max(.02,peak*.12);
 const on=env.filter(e=>e[1]>th);if(!on.length)return null;const a=on[0][0],b=on[on.length-1][0];const dur=(b-a)/1000;
 let pauses=0,last=a;for(const [t,v] of env){if(t<a||t>b)continue;if(v>th){if(t-last>700)pauses++;last=t}}
 const ref=estDur(line),ratio=dur/ref;
 const pace=ratio<0.6?Math.round(100*ratio/0.6):ratio<=1.7?100:Math.max(0,Math.round(100-(ratio-1.7)*90));
 return {score:Math.max(0,Math.min(100,pace-pauses*10)),dur,ref,pauses}}
function azScore(line,rec){const nb=rec.az,pa=nb.PronunciationAssessment||nb;
 const AW=(nb.Words||[]).map(w=>{const p=w.PronunciationAssessment||w;return {w:norm(w.Word||'').join(' '),acc:p.AccuracyScore,err:p.ErrorType||'None'}}).filter(x=>x.err!=='Insertion'&&x.w);
 const T=norm(line.de),names=line.tok.map(t=>!!t.name);let j=0;const st=[],vals=[],accs=[];
 T.forEach((t,i)=>{let hit=-1;for(let k=j;k<Math.min(AW.length,j+4);k++){if(sim(t,AW[k].w)>=.6){hit=k;break}}
  let s='miss',v=0;if(hit>=0){const a=AW[hit];j=hit+1;if(a.err!=='Omission'){v=a.acc==null?100:a.acc;s=v>=80&&a.err!=='Mispronunciation'?'ok':v>=50?'close':'miss'}}
  if(names[i]&&s!=='ok')s='name';st.push(s);accs.push(s==='name'?null:Math.round(v));if(s!=='name')vals.push(v)});
 const words=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0,fl=pa.FluencyScore==null?null:Math.round(pa.FluencyScore);
 const total=Math.round(fl==null?words:.85*words+.15*fl);
 return {words,status:st,acc:accs,heard:(rec.alts[0]||[''])[0],rhythm:fl,rh:null,total,by:'Azure',comp:pa.CompletenessScore==null?null:Math.round(pa.CompletenessScore)}}
function scoreTake(line,rec){
 if(rec.az)return azScore(line,rec);
 const w=markWords(line,rec.alts),rh=rhythm(rec.env,line);
 const why=[rec.aerr||'',rec.gerr?'Gemini: '+rec.gerr:'',rec.gempty?'Gemini heard no speech':'','Chrome recogniser: '+((rec.diag||[]).join(', ')||'no response')].filter(Boolean).join(' · ');
 if(!w||!w.heard)return {words:null,rhythm:rh?rh.score:null,total:null,status:null,heard:'',rh,by:rec.by||'',why};
 const total=Math.round(rh?.85*w.score+.15*rh.score:w.score);
 return {words:w.score,status:w.status,heard:w.heard,rhythm:rh?rh.score:null,rh,total,by:rec.by||''};
}
const col=v=>v==null?'var(--mute)':v>=80?'#4f6b4a':v>=60?'#a9773a':'#9b3b30';
const ring=v=>`<div class="ring" style="border-color:${v==null?'var(--chip)':col(v)}">${v==null?'–':v}</div>`;

/* ---------- views ---------- */
let view={name:'home'},sess=null,seqStop=false;
function stopAll(){seqStop=true;player.pause();gStop();try{speechSynthesis.cancel()}catch(e){}}
function go(v){stopAll();view=v;render();root.scrollIntoView({block:'start'})}
function render(){({home,listen,speak,results}[view.name]||home)()}
const mine=(s,l)=>sess.role==='all'||l.spk===sess.role;
const rateSel=()=>`<span class="seg" id="rate"><button data-v="slow" aria-pressed="${rate===RATES.slow}">Slow</button><button data-v="normal" aria-pressed="${rate===1}">Normal</button></span>`;
function bindRate(){qa('#rate button').forEach(b=>b.onclick=()=>{rate=RATES[b.dataset.v];localStorage.setItem('gd-rate',rate);qa('#rate button').forEach(x=>x.setAttribute('aria-pressed',x===b))})}
function voicePanel(){const vs=voices();const f=pick('f'),m=pick('m');
 const opt=(cur)=>vs.map(v=>`<option ${cur&&v.name===cur.name?'selected':''}>${esc(v.name)}</option>`).join('');
 const gopt=g=>{const cur=gVoice(g);return gList(g).concat(gAll().filter(v=>!gList(g).includes(v))).map(v=>`<option ${v.name===cur?'selected':''} value="${esc(v.name)}">${esc(v.name.replace('de-DE-',''))}${v.ssmlGender==='FEMALE'?' (female)':v.ssmlGender==='MALE'?' (male)':''}</option>`).join('')};
 const elopt=g=>{const cur=(elVoice(g)||{}).id;return EL.voices.map(v=>`<option value="${esc(v.id)}" ${v.id===cur?'selected':''}>${esc(v.name)}${v.g?' ('+esc(v.g)+')':''}${v.cat==='generated'?' · your design':v.cat==='premade'?' · default':''}</option>`).join('')};
 const inp=(id,ph,type='password')=>`<input id="${id}" type="${type}" placeholder="${ph}" autocomplete="off" autocapitalize="off" spellcheck="false" style="font:15px Georgia,serif;padding:8px 10px;border:1px solid var(--rule);border-radius:6px;background:var(--paper);color:var(--ink);min-width:240px;max-width:100%">`;
 const nrec=Object.keys(AUD.files||{}).length;
 const gemConn=GC.key&&GC.model;
 const storyV=recOn()?`Recorded: ${esc(AUD.voices&&AUD.voices.f||'')} and ${esc(AUD.voices&&AUD.voices.m||'')}`:elOn()?`ElevenLabs: ${esc(voiceLabel('f'))} and ${esc(voiceLabel('m'))}`:gOn()?`Gemini: ${esc(gVoice('f'))} and ${esc(gVoice('m'))}`:`Browser: ${esc(f?f.name:'none')} and ${esc(m?m.name:'none')}`;
 const marker=azOn()?'Azure':gemReady()?'Gemini':'Chrome';
 const H=t=>`<h3 style="font-size:18px;margin-top:16px">${t}</h3>`;const OL=t=>`<ol class="note" style="font-size:15px;padding-left:20px;margin:6px 0">${t}</ol>`;
 return `<details ${elOn()&&azOn()?'':'open'}><summary><b>Voices &amp; marking</b> <span class="note">${storyV} · marking: ${marker}</span></summary>
 ${nrec?`${H('Recorded story voices')}<label class="tog" style="margin:6px 0"><input type="checkbox" id="userec" ${useRec?'checked':''}> Use the recorded voices for the stories (${esc(AUD.voices&&AUD.voices.f||'')} and ${esc(AUD.voices&&AUD.voices.m||'')}, ${nrec} lines). Same on every device, and uses none of your allowance.</label>`:''}
 ${H('Story voices: ElevenLabs')}
 ${elOn()?`<div class="ctrls" style="margin-top:6px"><label>Sophie <select id="ef">${elopt('f')}</select></label><button class="iconb" id="etf">▶ Test</button><label>Moritz <select id="em">${elopt('m')}</select></label><button class="iconb" id="etm">▶ Test</button></div>
  <p class="note" id="elusage"></p>
  <p class="note"><button class="link" id="elref">Refresh the voice list</button> · <button class="link" id="elx">Change or remove key</button></p>`
 :`${OL(`<li>Sign up free at <b>elevenlabs.io</b>.</li>
   <li>Free accounts can't use Voice Library voices from an app, so design your own two. Open <b>Voices</b>, choose <b>Create a voice › Voice Design</b>, and describe each one, for example:<br><i>“A young German woman in her twenties from an old aristocratic family in Munich. Refined, educated upper-class accent, crisp standard Hochdeutsch, warm and composed.”</i><br><i>“A German man in his late twenties from an aristocratic family. Cultivated upper-class accent, clear standard Hochdeutsch, calm, polite and confident.”</i><br>Write the preview text in German so you hear the accent, then <b>save</b> the ones you like as Sophie and Moritz.</li>
   <li>Go to <b>Developers › API keys</b>, create a key, and allow at least <i>Text to Speech</i> and <i>Voices (read)</i>. <i>User (read)</i> lets the app show your monthly allowance.</li>
   <li>Paste it below and click <b>Connect</b>.</li>`)}
  <div class="ctrls">${inp('elkey','Paste your ElevenLabs API key')}<button class="btn pri" id="elconnect">Connect</button><span class="note" id="elmsg"></span></div>`}
 ${ttsOn()?`<div class="ctrls" style="margin-top:8px"><button class="btn" id="gprep">Prepare all stories</button><button class="btn" id="gzip">Download all audio (.zip)</button><span class="note" id="gprog">Fetches every line once and keeps it on this device, so playback is instant, works offline and never uses your allowance twice.</span></div>`:''}
 <div class="banner" id="gerr" ${EL.err||GC.err?'':'hidden'} style="margin-top:8px">${EL.err||GC.err?'Voice problem: '+esc(EL.err||GC.err):''}</div>
 ${H('Marking your speaking: Azure')}
 ${azOn()?`<p class="note" style="font-size:15px">Connected (region <b>${esc(AZ.region)}</b>). Each recording is scored word by word against the line you were saying: pronunciation accuracy, fluency and completeness. <button class="link" id="azx">Change or remove key</button></p>`
 :`${OL(`<li>Sign in at <b>portal.azure.com</b> (a free Azure account is enough).</li>
   <li>Click <b>Create a resource</b>, search for <b>Speech</b>, and create a Speech service. Pick a region near you, such as <i>UK South</i>, and the <b>Free F0</b> pricing tier.</li>
   <li>Open the new resource, go to <b>Keys and Endpoint</b>, and copy <b>KEY 1</b> and the <b>Location/Region</b> (for example <i>uksouth</i>).</li>
   <li>Paste both below and click <b>Connect</b>.</li>`)}
  <div class="ctrls">${inp('azkey','Azure Speech key (KEY 1)')}${inp('azreg','Region, e.g. uksouth','text')}<button class="btn pri" id="azconnect">Connect</button><span class="note" id="azmsg"></span></div>`}
 ${H('Gemini (backup)')}
 ${gemConn?`<p class="note" style="font-size:15px">Connected (${esc(GC.model)}). Reads the stories only if ElevenLabs isn't connected or has a problem, and marks your speaking only if Azure isn't connected or can't hear you. <button class="link" id="gkeyx">Change or remove key</button></p>
  <label class="tog" style="margin:6px 0"><input type="checkbox" id="gon" ${GC.enabled?'checked':''}> Use Gemini voices as a backup</label>
  ${elOn()?'':`<div class="ctrls" style="margin-top:6px"><label>Sophie <select id="gf">${gopt('f')}</select></label><button class="iconb" id="gtf">▶ Test</button><label>Moritz <select id="gm">${gopt('m')}</select></label><button class="iconb" id="gtm">▶ Test</button></div>`}`
 :`<p class="note" style="font-size:15px">Optional. A free key from <b>aistudio.google.com</b> (Get API key › Create API key).</p>
  <div class="ctrls">${inp('gkey','Paste your Gemini API key')}<button class="btn pri" id="gconnect">Connect</button><span class="note" id="gmsg"></span></div>`}
 ${anyKey()&&window.SITE_URL&&location.protocol==='file:'?`${H('Your phone and the website')}
  <p class="note" style="font-size:15px">The website is the same app, always up to date, on any phone or computer: <b>${esc(window.SITE_URL)}</b></p>
  <div class="ctrls"><button class="btn" id="qrphone">Set up a phone (QR code)</button><button class="btn" id="openweb">Open the website on this Mac with my progress</button></div>
  <div id="qrbox" style="margin-top:10px"></div>`:''}
 ${anyKey()&&location.protocol!=='file:'?`<p class="note" style="margin-top:10px"><button class="link" id="qrphone">Show a QR code to set up another phone</button></p><div id="qrbox" style="margin-top:10px"></div>`:''}
 ${H('Browser voice (last resort)')}
 ${vs.length?`<div class="ctrls" style="margin-top:6px"><label>Sophie <select id="vf">${opt(f)}</select></label><button class="iconb" id="tf">▶ Test</button><label>Moritz <select id="vm">${opt(m)}</select></label><button class="iconb" id="tm">▶ Test</button></div>`:'<p class="note">No German browser voice found.</p>'}
 </details>`}
const TF={id:'t1',spk:'Sophie',de:'Guten Tag! Ich bin Sophie, von der Zeitung.'},TM={id:'t2',spk:'Moritz',de:'Guten Tag! Ich bin Moritz. Und das ist das Schloss.'},TC={cast:{Sophie:'f',Moritz:'m'}};
function bindVoices(){const sv=(g,el)=>{VO[g]=el.value;localStorage.setItem('gd-voices',JSON.stringify(VO))};
 const vf=q('#vf'),vm=q('#vm');if(vf){vf.onchange=()=>sv('f',vf);vm.onchange=()=>sv('m',vm);q('#tf').onclick=()=>{stopAll();sayBrowser(TF,TC)};q('#tm').onclick=()=>{stopAll();sayBrowser(TM,TC)}}
 const gc=q('#gconnect');if(gc)gc.onclick=async()=>{const k=q('#gkey').value.trim();if(!k){q('#gmsg').textContent='Paste the key first.';return}
  gc.disabled=true;q('#gmsg').textContent='Connecting to Google…';
  try{if(GC.provider==='gemini'){GC.model=await gemFindModel(k)}else{const v=await gFetchVoices(k);if(!v.length)throw new Error('Google returned no German voices.');GC.voices=v}GC.key=k;GC.enabled=true;GC.err='';saveGC();home()}
  catch(e){gc.disabled=false;q('#gmsg').textContent='Could not connect: '+(e.message||e)}};
 qa('[data-prov]').forEach(b=>b.onclick=()=>{if(GC.provider===b.dataset.prov)return;GC.provider=b.dataset.prov;GC.key='';GC.voices=[];GC.model='';saveGC();home()});
 const twoClick=(el,fn)=>{if(!el)return;el.onclick=()=>{if(el.dataset.c)fn();else{el.dataset.c=1;el.textContent='Click again to remove it (saved audio stays)'}}};
 const ec=q('#elconnect');if(ec)ec.onclick=async()=>{const k=q('#elkey').value.trim();if(!k){q('#elmsg').textContent='Paste the key first.';return}
  ec.disabled=true;q('#elmsg').textContent='Connecting to ElevenLabs…';
  try{const v=await elFetchVoices(k);if(!v.length)throw new Error('there are no voices on this account yet');EL.key=k;EL.voices=v;EL.err='';EL.pick={f:elVoice('f'),m:elVoice('m')};saveEL();home()}
  catch(e){ec.disabled=false;q('#elmsg').textContent='Could not connect: '+(e.message||e)}};
 const ef=q('#ef'),em=q('#em');if(ef){const setp=(g,sel)=>{const v=EL.voices.find(x=>x.id===sel.value);if(v){EL.pick[g]={id:v.id,name:v.name};saveEL()}};ef.onchange=()=>setp('f',ef);em.onchange=()=>setp('m',em);
  const tEL=async(line,g)=>{stopAll();try{const b=await elAudio(line.de,g);gPlayer.src=URL.createObjectURL(b);gPlayer.playbackRate=1;await gPlayer.play();EL.err=''}catch(e){EL.err=e.message||String(e)}showGErr()};
  q('#etf').onclick=()=>tEL(TF,'f');q('#etm').onclick=()=>tEL(TM,'m');
  elUsage().then(u=>{const e=q('#elusage');if(e&&u)e.textContent=`Allowance: ${u.used.toLocaleString()} of ${u.limit.toLocaleString()} characters used this month. All four stories together need about 2,800, and each line is only fetched once per device.`})}
 const er=q('#elref');if(er)er.onclick=async()=>{try{EL.voices=await elFetchVoices(EL.key);saveEL();home()}catch(e){EL.err=e.message||String(e);showGErr()}};
 twoClick(q('#elx'),()=>{EL.key='';EL.voices=[];EL.pick={};EL.err='';saveEL();home()});
 const ac=q('#azconnect');if(ac)ac.onclick=async()=>{const k=q('#azkey').value.trim(),reg=q('#azreg').value.trim().toLowerCase().replace(/[\s_-]+/g,'');if(!k||!reg){q('#azmsg').textContent='Paste the key and the region.';return}
  ac.disabled=true;q('#azmsg').textContent='Checking with Azure…';
  try{const j=await azPost(pcmToWav(new Uint8Array(16000),16000),'Hallo',k,reg);if(!j||!j.RecognitionStatus)throw new Error('unexpected answer from Azure');AZ.key=k;AZ.region=reg;saveAZ();home()}
  catch(e){ac.disabled=false;const msg=e.message||String(e);q('#azmsg').textContent='Could not connect: '+msg+(/fetch|network|load failed/i.test(msg)?' (check the region is spelled like uksouth or westeurope)':'')}};
 twoClick(q('#azx'),()=>{AZ.key='';AZ.region='';saveAZ();home()});
 const gon=q('#gon');if(gon)gon.onchange=()=>{GC.enabled=gon.checked;saveGC();home()};
 const gf=q('#gf'),gm=q('#gm');const P=()=>GC.pick[GC.provider]=GC.pick[GC.provider]||{};if(gf){gf.onchange=()=>{P().f=gf.value;saveGC()};gm.onchange=()=>{P().m=gm.value;saveGC()};
  q('#gtf').onclick=async()=>{stopAll();try{await sayGoogle(TF,TC,1);GC.err='';showGErr()}catch(e){GC.err=e.message;showGErr()}};
  q('#gtm').onclick=async()=>{stopAll();try{await sayGoogle(TM,TC,1);GC.err='';showGErr()}catch(e){GC.err=e.message;showGErr()}}}
 const gx=q('#gkeyx');if(gx)gx.onclick=()=>{if(gx.dataset.c){GC.key='';GC.voices=[];GC.model='';GC.sttModel='';try{localStorage.removeItem('gd-gstt')}catch(e){}saveGC();home()}else{gx.dataset.c=1;gx.textContent='Click again to remove the key (cached audio stays)'}};

 const ur=q('#userec');if(ur)ur.onchange=()=>{useRec=ur.checked;try{localStorage.setItem('gd-userec',JSON.stringify(useRec))}catch(e){}home()};
 const setupData=withProgress=>{const d={p:'gemini',k:GC.key||undefined,m:GC.model||undefined,v:GC.pick.gemini||undefined,e:EL.key?{k:EL.key,v:{f:elVoice('f'),m:elVoice('m')}}:undefined,a:azOn()?{k:AZ.key,r:AZ.region}:undefined,c:(()=>{try{return JSON.parse(localStorage.getItem('gd-ckey')||'""')||undefined}catch(e){}})()};
  if(withProgress&&window.PROFILE){try{d.n=window.PROFILE;d.s=JSON.parse(localStorage.getItem('de100-srs')||'null');d.o=JSON.parse(localStorage.getItem('gd-opened2')||'null')}catch(e){}}
  return btoa(unescape(encodeURIComponent(JSON.stringify(d)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
 const site=()=>(window.SITE_URL||location.href.split('#')[0]);
 const qp=q('#qrphone');if(qp)qp.onclick=()=>{const url=site()+'#setup='+setupData(false);const box=q('#qrbox');
  const draw=()=>{try{const qr=qrcode(0,'L');qr.addData(url);qr.make();box.innerHTML=`<div style="background:#fff;display:inline-block;padding:10px;border-radius:8px">${qr.createSvgTag({cellSize:5,margin:2})}</div><p class="note" style="font-size:15px">Scan this with the phone's camera and open the link. It connects that phone to your ElevenLabs, Azure and Gemini keys; they stay on the phone and are never put on the website. Anyone you show it to can use your keys.</p>`}catch(e){box.innerHTML='<p class="note">Could not draw the QR code.</p>'}};
  if(window.qrcode)draw();else{const sc=document.createElement('script');sc.src='https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';sc.onload=draw;sc.onerror=()=>{box.innerHTML='<p class="note">The QR code needs an internet connection.</p>'};document.head.appendChild(sc)}};
 const ow=q('#openweb');if(ow)ow.onclick=()=>{const a=document.createElement('a');a.href=site()+'#setup='+setupData(true);a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove()};
 const gz=q('#gzip');if(gz)gz.onclick=async()=>{gz.disabled=true;const msg=t=>{const e=q('#gprog');if(e)e.textContent=t};
  try{const n=await exportAudio(msg);msg(`Saved ${n} audio files and a transcript to your Downloads as “German stories – audio.zip”.`)}catch(e){msg('Download stopped: '+(e.message||e))}gz.disabled=false};
 const gp=q('#gprep');if(gp)gp.onclick=async()=>{gp.disabled=true;const all=[];ST.forEach(s=>s.lines.forEach(l=>all.push([l,s.cast[l.spk]])));let n=0;
  try{for(const [l,g] of all){await lineBlob(l.de,g,sec=>{q('#gprog').textContent=`Prepared ${n} of ${all.length} lines. Google asked to wait ${sec} s…`});n++;q('#gprog').textContent=`Prepared ${n} of ${all.length} lines…`}q('#gprog').textContent=`All ${all.length} lines are ready on this Mac.`}
  catch(e){q('#gprog').textContent=`Stopped after ${n} lines: ${e.message||e}`}gp.disabled=false};
}

let homeSynced=0;
async function home(){
 if(Date.now()-homeSynced>20000){homeSynced=Date.now();syncSessions().then(ch=>{if(ch&&view.name==='home')home()})}
 const S=await allSessions();
 root.innerHTML=`<h2 style="font-size:26px">Dialogues</h2>
 <p class="note" style="font-size:15px;max-width:72ch">Four short, connected stories. Sophie, a young journalist, visits Moritz at his family's castle. Each story opens once you've studied its 25 words, and those 25 words are underlined in it. Listen first, then speak each line yourself.</p>
 ${voicePanel()}
 <div class="dgrid" style="margin-top:6px">${ST.map((s,i)=>{const u=unlocked(s),n=started(s),b=best[s.id];
  return `<button class="story ${u?'':'locked'}" data-s="${i}"><span class="ep">Story ${i+1} · words ${s.words[0]}–${s.words[1]} · ${s.lines.length} lines</span><h3>${esc(s.title)}</h3><span class="note" style="margin:0"><i>${esc(s.en_title)}</i>: ${esc(s.sub)}</span>
  ${u?`<div class="pbar"><i style="width:${b||0}%"></i></div><span class="note" style="margin:0">${b!=null?'Best score '+b+'%':'Not practised yet'}</span>`:`<span class="lock">Locked: ${n} of 25 words studied</span>`}</button>`}).join('')}</div>
 <hr style="border:0;border-top:1px solid var(--rule);margin:26px 0">
 <h2 style="font-size:22px">Saved dialogues</h2>
 <div>${S.length?S.map(x=>`<div class="sess"><div><b>${esc(x.title)}</b> <span class="note">· ${new Date(x.date).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'})} · ${x.role==='all'?'every line':esc(x.role)+"'s part"}</span></div><b>${x.total==null?'–':x.total+'%'}</b><span class="ctrls"><button class="btn" data-open="${x.id}">Open</button><button class="iconb" data-del="${x.id}">Delete</button></span></div>`).join(''):'<p class="note">When you save a dialogue, it appears here with your recordings.</p>'}</div>`;
 bindVoices();
 qa('[data-s]').forEach(b=>b.onclick=()=>{const s=ST[+b.dataset.s];if(unlocked(s))return go({name:'listen',i:+b.dataset.s});
  const sp=b.querySelector('.lock');if(b.dataset.c){opened[s.id]=1;localStorage.setItem('gd-opened2',JSON.stringify(opened));go({name:'listen',i:+b.dataset.s})}else{b.dataset.c=1;sp.textContent='Click again to open it early'}});
 qa('[data-open]').forEach(b=>b.onclick=async()=>{const x=(await allSessions()).find(s=>s.id===b.dataset.open);if(x){sess=fromSaved(x);go({name:'results',i:ST.findIndex(s=>s.id===x.storyId)})}});
 qa('[data-del]').forEach(b=>b.onclick=async()=>{if(b.dataset.c){const id=b.dataset.del;await tx('readwrite',s=>s.delete(id)).catch(()=>{});b.closest('.sess').remove();const T=acct();if(T)window.Profiles.rpc('gd_sess_del',{p_token:T,p_id:id}).catch(()=>{})}else{b.dataset.c=1;b.textContent='Confirm delete'}});
}
function head(s,tab){const i=ST.indexOf(s);return `<button class="link" id="back">← All stories</button>
 <h2 style="margin-top:12px;font-size:28px">Story ${i+1}: ${esc(s.title)} <span class="note" style="font-size:18px"><i>${esc(s.en_title)}</i></span></h2>
 <div class="note" style="font-size:15px">${esc(s.sub)} Underlined: your new words ${s.words[0]}–${s.words[1]}. Hover over or tap any word for its meaning.</div>
 <div class="pills"><button class="pill" data-t="listen" aria-pressed="${tab==='listen'}">1 · Listen</button><button class="pill" data-t="speak" aria-pressed="${tab==='speak'}">2 · Speak</button>${sess&&sess.storyId===s.id&&sess.done?`<button class="pill" data-t="results" aria-pressed="${tab==='results'}">3 · Results</button>`:''}</div>`}
function bindHead(i){q('#back').onclick=()=>go({name:'home'});qa('[data-t]').forEach(b=>b.onclick=()=>go({name:b.dataset.t,i}))}
const avatar=(s,l)=>`<span class="av ${s.cast[l.spk]}">${l.spk[0]}</span>`;

let showEn=true;
function listen(){
 const i=view.i,s=ST[i];
 root.innerHTML=head(s,'listen')+`<div class="ctrls" style="margin-bottom:14px"><button class="btn pri" id="all">▶ Play the story</button>${rateSel()}<button class="btn" id="en">${showEn?'Hide':'Show'} English</button></div>
 <div class="chat">${s.lines.map((l,n)=>`<button class="msg ${s.cast[l.spk]}" data-n="${n}">${avatar(s,l)}<div class="bub"><div class="sp">${esc(l.spk)}</div><div class="dl">${lineHTML(l,s)}</div><div class="en" ${showEn?'':'hidden'}>${esc(l.en)}</div></div></button>`).join('')}</div>
 <div class="gloss" id="gloss">Hover over or tap a word to see what it means.</div>`;
 bindHead(i);bindRate();bindGloss();
 const show=n=>{qa('.msg').forEach(m=>m.classList.toggle('now',+m.dataset.n===n));const m=q(`.msg[data-n="${n}"]`);m&&m.scrollIntoView({block:'nearest',behavior:'smooth'})};
 qa('.msg').forEach(m=>m.onclick=e=>{seqStop=true;const n=+m.dataset.n;show(n);say(s.lines[n],s)});
 const btn=q('#all');let on=false;
 btn.onclick=async()=>{if(on){seqStop=true;speechSynthesis.cancel();on=false;btn.textContent='▶ Play the story';return}
  seqStop=false;on=true;btn.textContent='❚❚ Stop';
  for(let n=0;n<s.lines.length&&!seqStop;n++){show(n);await say(s.lines[n],s);await new Promise(r=>setTimeout(r,500))}
  on=false;btn.textContent='▶ Play the story'};
 q('#en').onclick=()=>{showEn=!showEn;q('#en').textContent=(showEn?'Hide':'Show')+' English';qa('.bub .en').forEach(e=>e.hidden=!showEn)};
}

function speak(){
 const i=view.i,s=ST[i];
 if(!sess||sess.storyId!==s.id||(sess.done&&!view.resume)){
  root.innerHTML=head(s,'speak')+`<div class="card" style="max-width:680px"><h3>How do you want to practise?</h3>
  <p class="note" style="font-size:15px">Speak every line, or take one part while the other character's lines are read to you.</p>
  <div class="ctrls"><button class="btn pri" data-r="all">Every line</button><button class="btn" data-r="Sophie">Sophie's part</button><button class="btn" data-r="Moritz">Moritz's part</button></div></div>`;
  bindHead(i);qa('[data-r]').forEach(b=>b.onclick=()=>{sess={id:'d'+Date.now(),storyId:s.id,role:b.dataset.r,cur:0,takes:{},done:false};view.resume=true;speak()});return;
 }
 const n=sess.cur,l=s.lines[n],my=mine(s,l),take=sess.takes[l.id];
 root.innerHTML=head(s,'speak')+`<div class="dstage">
  <div class="dprog">${s.lines.map((x,k)=>`<i class="${k<n?'pd':k===n?'pc':''}"></i>`).join('')}</div>
  <div class="note" style="margin:0">Line ${n+1} of ${s.lines.length} · ${my?'<b style="color:var(--green2)">Your turn: say this line</b>':esc(l.spk)+' says:'}</div>
  <div class="msg ${s.cast[l.spk]}" style="cursor:default">${avatar(s,l)}<div class="bub"><div class="sp">${esc(l.spk)}</div><div class="bigline" id="line">${lineHTML(l,s,take&&take.sc.status,take&&take.sc.acc)}</div><div class="en">${esc(l.en)}</div></div></div>
  ${my?`<div class="ctrls"><button class="btn" id="hear">▶ Listen</button>${rateSel()}<button class="btn rec" id="rec">● ${take?'Record again':'Record'}</button><button class="btn" id="me" ${take?'':'disabled'}>▶ My recording</button></div>
  <div class="meter"><i id="lvl"></i></div>
  <div id="sc">${take?scoreBlock(take.sc):'<p class="note">Listen, then press <b>Record</b> and say the line. Recording stops by itself when you pause.</p>'}</div>
  ${srProblem?`<div class="banner">${esc(srProblem)} Your recording is kept, but the words can't be marked.</div>`:''}`
  :`<div class="ctrls"><button class="btn" id="hear">▶ Listen again</button>${rateSel()}</div><p class="note">This line is read to you, then the story moves on.</p>`}
  <div class="gloss" id="gloss">Hover over or tap a word to see what it means.</div>
  <div class="ctrls" style="justify-content:space-between"><button class="btn" id="prev" ${n?'':'disabled'}>← Back</button><button class="btn pri" id="next" ${my&&!take?'disabled':''}>${n===s.lines.length-1?'Finish':'Next line →'}</button></div>
 </div>`;
 bindHead(i);bindRate();bindGloss();
 q('#hear').onclick=()=>say(l,s);
 q('#prev').onclick=()=>{stopAll();sess.cur--;speak()};
 q('#next').onclick=()=>{stopAll();if(n===s.lines.length-1){sess.done=true;view.resume=false;go({name:'results',i})}else{sess.cur++;speak()}};
 if(!my){say(l,s).then(()=>setTimeout(()=>{if(view.name==='speak'&&sess.cur===n&&q('#next'))q('#next').click()},600));return}
 if(!take)say(l,s);
 let R=null;const rb=q('#rec');
 const stop=async()=>{if(!R)return;const r=R;R=null;rb.classList.remove('on');rb.disabled=true;rb.textContent='Marking…';
  try{const rec=await r.stop();await transcribe(rec,l);const sc=scoreTake(l,rec);const old=sess.takes[l.id];if(old)URL.revokeObjectURL(old.url);
   sess.takes[l.id]={lineId:l.id,blob:rec.blob,url:URL.createObjectURL(rec.blob),sc};speak()}
  catch(e){rb.disabled=false;rb.textContent='● Record';q('#sc').innerHTML=`<div class="banner">Something went wrong (${esc(e.message||e)}). Please try again.</div>`}};
 rb.onclick=async()=>{if(R)return stop();stopAll();
  try{R=recorder(l,x=>{const m=q('#lvl');if(m)m.style.width=(x*100)+'%'},stop,Math.max(7000,estDur(l)*2500+3000));await R.start();rb.classList.add('on');rb.textContent='■ Stop';q('#sc').innerHTML='<p class="note">Recording… say the line now.</p>'}
  catch(e){R=null;q('#sc').innerHTML=`<div class="banner">The microphone isn't available (${esc(e.message||e.name||e)}). In Chrome, click the microphone icon at the right of the address bar, choose Allow, then press Record again.</div>`}};
 if(take)q('#me').onclick=()=>{stopAll();player.src=take.url;player.play()};
}
function scoreBlock(sc){
 if(sc.total==null)return `<div class="banner">No words could be recognised in that recording, so it can't be marked yet. Your recording itself is fine: press ▶ My recording to hear it.${azOn()||gemReady()?'':' Connect Azure in the Voices &amp; marking panel (Dialogues home page) to have your recordings marked.'}<br><span class="note">Details: ${esc(sc.why||'')}</span></div>`;
 const tip=sc.total>=90?'Excellent!':sc.total>=75?'Good. Look at any amber or red words, then try again if you like.':sc.total>=55?'Getting there. Listen on Slow, then try again.':'Try again: listen on Slow and say it word by word.';
 const r=sc.rh;const rnote=r?`You took ${r.dur.toFixed(1)} s; the reading takes about ${r.ref.toFixed(1)} s${r.pauses?`, with ${r.pauses} long pause${r.pauses>1?'s':''}`:''}.`:'';
 return `<div class="scores">${ring(sc.total)}<div class="sc"><b>${sc.words}%</b><span>${sc.by==='Azure'?'Pronunciation accuracy':'Words said correctly'}</span></div><div class="sc"><b>${sc.rhythm==null?'–':sc.rhythm+'%'}</b><span>${sc.by==='Azure'?'Fluency':'Pace and flow'}</span></div><div class="sc heard">Heard${sc.by?' ('+esc(sc.by)+')':''}: <b>${esc(sc.heard||'…')}</b></div></div>
 <p class="note">${tip} ${sc.by==='Azure'?'Green: well pronounced · amber: understandable but off · red: mispronounced or missed. Tap a word to see its score.':'Green: said correctly · amber: nearly · red: missed or wrong.'} ${rnote}</p>`;
}
function fromSaved(x){const takes={};x.lines.forEach(l=>{if(l.blob)takes[l.id]={lineId:l.id,blob:l.blob,url:URL.createObjectURL(l.blob),sc:l.sc}});return {id:x.id,storyId:x.storyId,role:x.role,takes,done:true,saved:true,cur:0}}
function results(){
 const i=view.i,s=ST[i];if(!sess||sess.storyId!==s.id||!sess.done)return go({name:'listen',i});
 const mineLines=s.lines.filter(l=>mine(s,l));const marked=mineLines.filter(l=>sess.takes[l.id]&&sess.takes[l.id].sc.total!=null);
 const total=marked.length?Math.round(marked.reduce((a,l)=>a+sess.takes[l.id].sc.total,0)/mineLines.length):null;
 if(!sess.saved&&total!=null&&(best[s.id]==null||total>best[s.id])){best[s.id]=total;localStorage.setItem('gd-best2',JSON.stringify(best))}
 root.innerHTML=head(s,'results')+`<div class="total">${ring(total)}<div><h2>Your dialogue</h2>
  <div class="note" style="font-size:15px">${sess.role==='all'?'Every line':esc(sess.role)+"'s part"} · average over your ${mineLines.length} lines${best[s.id]!=null?' · best '+best[s.id]+'%':''}</div>
  <div class="ctrls" style="margin-top:10px"><button class="btn pri" id="pd">▶ Play my dialogue</button><button class="btn" id="save" ${sess.saved?'disabled':''}>${sess.saved?'Saved':'Save dialogue'}</button><button class="btn" id="dl">Download (.wav)</button><button class="btn" id="again">Practise again</button></div>
  <p class="note" id="msg"></p></div></div>
 <p class="note">Your lines play in your own voice; the other character's lines are read to you. The download contains your lines${ttsOn()?' and the story voice for the other lines':''}.</p>
 <div>${s.lines.map((l,n)=>{const t=sess.takes[l.id],m=mine(s,l);return `<div class="rl" data-n="${n}"><div class="sp">${m?'You ('+esc(l.spk)+')':esc(l.spk)}</div><div><div class="dl">${lineHTML(l,s,t&&t.sc.status,t&&t.sc.acc)}</div><div class="note" style="margin:2px 0 0">${esc(l.en)}</div>${t&&t.sc.heard?`<div class="heard">Heard: <b>${esc(t.sc.heard)}</b></div>`:''}</div><div class="s" style="color:${col(t?t.sc.total:null)}">${m?(t&&t.sc.total!=null?t.sc.total+'%':'–'):''}</div><div class="ctrls">${t?`<button class="iconb" data-me="${n}">▶ Me</button>`:''}<button class="iconb" data-or="${n}">▶ Reading</button></div></div>`}).join('')}</div>
 <div class="gloss" id="gloss">Hover over or tap a word to see what it means.</div>`;
 bindHead(i);bindGloss();const rows=qa('.rl');
 const playUrl=u=>new Promise(res=>{player.src=u;player.onended=()=>res();player.onerror=()=>res();player.play().catch(()=>res())});
 qa('[data-me]').forEach(b=>b.onclick=()=>{stopAll();playUrl(sess.takes[s.lines[+b.dataset.me].id].url)});
 qa('[data-or]').forEach(b=>b.onclick=()=>{stopAll();say(s.lines[+b.dataset.or],s)});
 const pd=q('#pd');let on=false;
 pd.onclick=async()=>{if(on){stopAll();on=false;pd.textContent='▶ Play my dialogue';rows.forEach(r=>r.classList.remove('now'));return}
  seqStop=false;on=true;pd.textContent='❚❚ Stop';
  for(let n=0;n<s.lines.length&&!seqStop;n++){const l=s.lines[n],t=sess.takes[l.id];rows.forEach(r=>r.classList.toggle('now',+r.dataset.n===n));rows[n].scrollIntoView({block:'nearest',behavior:'smooth'});
   if(t&&mine(s,l))await playUrl(t.url);else await say(l,s);await new Promise(r=>setTimeout(r,350))}
  on=false;pd.textContent='▶ Play my dialogue';rows.forEach(r=>r.classList.remove('now'))};
 q('#again').onclick=()=>{sess=null;go({name:'speak',i})};
 q('#save').onclick=async()=>{const rec={id:sess.id,profile:window.PROFILE||null,storyId:s.id,title:'Story '+(i+1)+': '+s.title,role:sess.role,date:Date.now(),total,lines:s.lines.map(l=>{const t=sess.takes[l.id];return {id:l.id,blob:t?t.blob:null,sc:t?t.sc:null}})};
  try{await tx('readwrite',st=>st.put(rec));sess.saved=true;q('#save').disabled=true;q('#save').textContent='Saved';q('#msg').textContent='Saved with your recordings. Find it under Saved dialogues.';if(acct())pushSession(rec).then(()=>{const m=q('#msg');if(m)m.textContent='Saved with your recordings, on all your devices.'}).catch(()=>{const m=q('#msg');if(m)m.textContent='Saved on this device. It will copy to your other devices next time you are online.'})}
  catch(e){q('#msg').textContent='Saving was blocked here. Use Download to keep your recordings.'}};
 q('#dl').onclick=async()=>{q('#msg').textContent='Building the file…';try{
  const SRo=24000,parts=[];
  for(const l of s.lines){const t=sess.takes[l.id];let blob=null;if(t&&mine(s,l))blob=t.blob;else if(recOn()&&AUD.files[l.id]){try{blob=await (await fetch(AUD.files[l.id])).blob()}catch(e){blob=null}}else if(ttsOn()){try{blob=await lineBlob(l.de,s.cast[l.spk])}catch(e){blob=null}}if(!blob)continue;const b=await AC().decodeAudioData(await blob.arrayBuffer());
   const oc=new OfflineAudioContext(1,Math.max(1,Math.ceil(b.duration*SRo)),SRo);const src=oc.createBufferSource();src.buffer=b;src.connect(oc.destination);src.start();parts.push((await oc.startRendering()).getChannelData(0));parts.push(new Float32Array(Math.round(SRo*.4)))}
  if(!parts.length){q('#msg').textContent='No recordings yet.';return}
  const len=parts.reduce((a,p)=>a+p.length,0),pcm=new Float32Array(len);let o=0;parts.forEach(p=>{pcm.set(p,o);o+=p.length});
  const buf=new ArrayBuffer(44+len*2),dv=new DataView(buf),ws=(p,t)=>[...t].forEach((c,k)=>dv.setUint8(p+k,c.charCodeAt(0)));
  ws(0,'RIFF');dv.setUint32(4,36+len*2,true);ws(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,SRo,true);dv.setUint32(28,SRo*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,len*2,true);
  for(let k=0;k<len;k++)dv.setInt16(44+k*2,Math.max(-1,Math.min(1,pcm[k]))*32767,true);
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'audio/wav'}));a.download=`Story ${i+1} ${s.title} – my lines.wav`;document.body.appendChild(a);a.click();a.remove();q('#msg').textContent='Downloaded.'}
  catch(e){q('#msg').textContent="Couldn't build the file: "+(e.message||e)}};
}
if(EL.key&&!EL.voices.length){elFetchVoices(EL.key).then(v=>{EL.voices=v;saveEL();if(view.name==='home'&&root.innerHTML)home()}).catch(e=>{EL.err=e.message||String(e)})}
if(GC.provider==='gemini'&&GC.key&&!GC.model){gemFindModel(GC.key).then(m=>{GC.model=m;saveGC();if(view.name==='home'&&root.innerHTML)home()}).catch(e=>{GC.err=e.message||String(e)})}
window.DLG={open:()=>{if(view.name==='home')home();else render()},leave:stopAll,_test:{markWords,norm,scoreTake,rhythm},
 /* used by the Phrases tab: speak any German text in the story voices, and record + mark any sentence */
 say:(text,g='f',r=1)=>{stopAll();return say({id:'_t:'+text,de:text,spk:'X',tok:norm(text).map(t=>({t}))},{cast:{X:g}},r)},
 stop:stopAll,
 practise:(text,onLevel,onAuto)=>{const l={id:'_t:'+text,de:text,spk:'X',tok:norm(text).map(t=>({t}))};const R=recorder(l,onLevel,onAuto,Math.max(7000,estDur(l)*2500+3000));
  return {start:()=>R.start(),stop:async()=>{const rec=await R.stop();await transcribe(rec,l);return {sc:scoreTake(l,rec),blob:rec.blob}}}},
 scoreHTML:sc=>scoreBlock(sc)};
})();
