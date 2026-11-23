// Home: what this dashboard is for, the ideas behind it, and a roadmap for using it.
(function(){
const root=document.getElementById('homeApp');if(!root)return;
const go=t=>{const b=document.getElementById('t-'+t);if(b)b.click();window.scrollTo({top:0,behavior:'smooth'})};
const css=document.createElement('style');css.textContent=`
#homeApp{max-width:780px}
#homeApp h2{font-size:30px;margin:0 0 8px;line-height:1.2}
#homeApp h3{font-size:22px;margin:34px 0 8px}
#homeApp h4{font-size:18px;margin:22px 0 4px}
#homeApp p,#homeApp li{font-size:17px;line-height:1.6}
#homeApp .lede{font-size:19px}
#homeApp .idea{border-left:4px solid light-dark(#8b4a3c,#b0685a);padding:2px 0 2px 16px;margin:18px 0}
#homeApp .idea .tag{font-size:14px;color:var(--mute);letter-spacing:.04em;text-transform:uppercase;margin:0}
#homeApp blockquote{margin:12px 0;padding:10px 14px;border-radius:8px;background:light-dark(#f4efe7,#2a2521);font-size:16px;line-height:1.55}
#homeApp .go{display:inline-flex;margin:6px 6px 0 0}
#homeApp ol.road>li{margin:0 0 14px}
#homeApp .steps{display:grid;gap:10px;margin:12px 0}
#homeApp .step{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;border:1px solid var(--rule);border-radius:10px;padding:12px 14px;background:var(--paper)}
#homeApp .step b.n{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:light-dark(#8b4a3c,#b0685a);color:#fff;font-size:15px}
#homeApp .step p{margin:0}
#homeApp table{border-collapse:collapse;width:100%;font-size:16px;margin:8px 0}
#homeApp th,#homeApp td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--rule);vertical-align:top}
#homeApp th{font-weight:normal;color:var(--mute);font-size:14px}
@media(max-width:600px){#homeApp h2{font-size:25px}#homeApp p,#homeApp li{font-size:16px}}`;document.head.appendChild(css);

root.innerHTML=`
<h2>How to use this dashboard</h2>
<p class="lede">This page is built around the four things that have actually helped me learn languages in the past. Read this once, then follow the roadmap at the bottom. You shouldn't have to guess your way around.</p>
<p><button class="btn pri go" data-go="learn">Start studying →</button></p>

<h3>The four big ideas</h3>

<div class="idea"><p class="tag">1 · Study</p>
<h4>Learn the most common words first</h4>
<p>A surprisingly small number of words makes up most of what people say. Learning them helps almost immediately when you listen to a conversation: you won't understand all of it straight away, but you'll know what it's about.</p>
<p>It's like when someone is standing a bit too far away to hear properly, but I catch "Rae" and "SUPAs" in the same sentence. I already know they're probably talking about me playing polo at a tournament. The common words give you those anchors.</p>
<p><b>Study</b> teaches the 100 most frequent German words with spaced repetition: each word comes back just before you'd forget it, so it sticks. Words 101–200 unlock once you've learnt the first 100.</p>
<p><button class="btn go" data-go="learn">Go to Study</button></p></div>

<div class="idea"><p class="tag">2 · Hear them spoken</p>
<h4>Pronunciation and comprehension</h4>
<p><b>Hear them spoken</b> plays every word in real clips from a documentary, so you hear how it's actually said (which isn't always how it's written) and how it changes form in everyday conversation.</p>
<p>It also means that from day one you're pronouncing words almost exactly like a German would, especially if you <b>shadow</b>: play the sentence, then say it straight back, again and again, until you've got the bounce in the voice and the stress on the right words. Tedious, I know, but necessary.</p>
<p><button class="btn go" data-go="hear">Go to Hear them spoken</button></p></div>

<div class="idea"><p class="tag">3 · Dialogues</p>
<h4>Put the words into real conversations</h4>
<p>This is the <b>key</b> part. The dialogues let you use the words you've just learnt in sentences you'd actually say. You listen, speak your lines, get marked against the original audio, and play yourself back. Comprehension again!</p>
<p>There's nothing more satisfying than hearing yourself hold a full conversation in a language you've <i>just</i> started. More importantly, this is what turns "knowing a few words" into being able to follow and join in a conversation.</p>
<p>A new story opens for every 25 words, and each one builds on the last, like the gym: you add weight and reps as you get stronger.</p>
<p><button class="btn go" data-go="dlg">Go to Dialogues</button></p></div>

<div class="idea"><p class="tag">4 · Phrases</p>
<h4>The Lego blocks</h4>
<p>Languages are full of base phrases we use every day, where only the ending changes: "I was going to ___", "What do you think of ___?", "Do you wanna grab ___?", "What are you doing ___?". Master the base, and you can say a huge number of things by swapping in one word.</p>
<blockquote>Fluent German speakers don't build sentences word by word: they snap together ready-made chunks, like Lego. The video this comes from says linguists found that over half of what native speakers say is made of these pre-built pieces, and that the brain processes them faster than the same words in a new order. Its comparison: typing your phone PIN, your thumb taps one shape rather than thinking of four separate numbers.</blockquote>
<p>In <b>Phrases</b> you learn each chunk, build sentences with it from blocks, click your own words into the slot, then hear it and say it. You can also hear it used in the documentary.</p>
<p><button class="btn go" data-go="chunks">Go to Phrases</button></p></div>

<h3>The roadmap: how I'd work through it</h3>
<p>I'd start by learning at least 25 of the key words, which unlocks the first story. Alongside that, I'd repeat the sentences in <b>Hear them spoken</b> until I felt I'd properly mimicked how they sound and understood how each word is used. Then:</p>
<div class="steps">
<div class="step"><b class="n">1</b><p><b>Do your Study cards every day.</b> Reviews first, then new words (10 a day is a good start; change it under the card). Be honest with <i>Again / Hard / Good / Easy</i>: the schedule only works if you don't flatter yourself.</p></div>
<div class="step"><b class="n">2</b><p><b>Shadow every new word.</b> In Hear them spoken, play one or two clips for each word you learnt today. Use the slow speed first, then normal. Say each sentence out loud, several times, until it sounds like the clip.</p></div>
<div class="step"><b class="n">3</b><p><b>When a story opens, listen before you speak.</b> Play the whole dialogue once without reading, then again with the text and the English. Only then go to <i>Speak</i>.</p></div>
<div class="step"><b class="n">4</b><p><b>Speak each line until it's green.</b> Record, check the colours (green good, amber nearly, red missed), listen to yourself next to the original and re-record. Aim for 80% or more on every line before moving on. Do your character first, then the other one, then the whole dialogue.</p></div>
<div class="step"><b class="n">5</b><p><b>Save your best run and play it back.</b> Hearing your whole conversation in one go shows you how far you've come, and makes the gaps obvious.</p></div>
<div class="step"><b class="n">6</b><p><b>Add two to four phrases a day.</b> In Phrases: Learn the card, build the three sentences, then fill the slot with something true about <i>your</i> life (your plans, your friends, your polo) and say it out loud. Personal sentences stick far better than textbook ones.</p></div>
<div class="step"><b class="n">7</b><p><b>Repeat for every block of 25.</b> At 50 words Story 2 opens, at 75 Story 3, and at 100 Story 4. Go back to earlier stories now and then: they should feel easier each time.</p></div>
<div class="step"><b class="n">8</b><p><b>Level up.</b> When all of the first 100 words are <i>learnt</i>, words 101–200 open. When all 100 are <i>mastered</i> (each one scheduled three weeks or more ahead), <b>Clip questions</b> opens: you watch clips and answer questions about them in German, with an explanation and a memory tip whenever you get one wrong.</p></div>
</div>

<h4>A good day (about 20–30 minutes)</h4>
<table><tr><th>Time</th><th>What</th></tr>
<tr><td>10 min</td><td>Study cards: reviews, then new words</td></tr>
<tr><td>5 min</td><td>Shadow today's new words in Hear them spoken</td></tr>
<tr><td>10 min</td><td>One dialogue: listen, then speak your lines</td></tr>
<tr><td>5 min</td><td>Two or three phrases, with your own words in the slot</td></tr></table>
<p>Little and often beats one long session a week. If you're short on time, just do the Study cards: missing reviews is what sets you back most.</p>

<h3>Getting set up</h3>
<ul>
<li><b>Your own account.</b> Choose <i>Create an account</i> on the sign-in screen and use the family code (ask Rae). Sign in with the same username and password on your phone and computer and your progress, saved dialogues and recordings follow you. Your progress is completely separate from anyone else's.</li>
<li><b>On your phone:</b> open the site in Safari, tap <i>Share › Add to Home Screen</i>, and it opens like an app.</li>
<li><b>Speaking:</b> allow the microphone when asked, and record somewhere quiet. The voices and marking are already connected, so there's nothing to set up.</li>
<li><b>Mistakes are fine.</b> Red words and low scores are the point: they show you exactly what to practise next.</li>
</ul>
<p><button class="btn pri go" data-go="learn">Start studying →</button></p>`;
root.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
window.HOME={open(){}};
})();
