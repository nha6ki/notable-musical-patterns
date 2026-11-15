/* Progressive enhancement: keep every original <audio> as the no-JS fallback.
   Move the selected element, rather than copying audio or changing its source. */
(()=>{'use strict';
const sources=[...document.querySelectorAll('.pattern-card audio[controls]')];
if(!sources.length)return;
const en=document.documentElement.lang.startsWith('en');
const T=en?{listen:'Listen',pause:'Pause',playing:'Playing',paused:'Paused',ended:'Finished. You can listen again.',loading:'Loading…',error:'Unable to play. Try again or open the audio link.',blocked:'Use the playback control below to start.',close:'Close player',player:'Listening player',file:'Open audio in a new tab',credit:'Evidence, sources and terms of use'}:{listen:'視聴する',pause:'一時停止',playing:'再生中',paused:'一時停止中',ended:'再生終了。もう一度聴けます。',loading:'読み込み中…',error:'再生できませんでした。もう一度試すか、音源リンクを開いてください。',blocked:'下の再生ボタンを押してください。',close:'プレーヤーを閉じる',player:'試聴プレーヤー',file:'別タブで音源を開く',credit:'根拠・出典・利用条件'};
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
const panel=el('aside');panel.id='guide-clip-player';panel.hidden=true;panel.setAttribute('aria-label',T.player);
const bar=el('div','guide-clip-bar'),info=el('div','guide-clip-info'),status=el('p','guide-clip-status'),title=el('strong','guide-clip-title'),scope=el('p','guide-clip-scope');
status.setAttribute('role','status');status.setAttribute('aria-live','polite');
info.append(status,title,scope);
const media=el('div','guide-clip-media'),slot=el('div','guide-clip-slot'),details=el('details','guide-clip-details'),summary=el('summary','',T.credit),body=el('div','guide-clip-credit'),file=el('a','',T.file),credit=el('div');
file.target='_blank';file.rel='noopener';body.append(file,credit);details.append(summary,body);media.append(slot,details);
const close=el('button','nmp-btn guide-clip-close',T.close);close.type='button';bar.append(info,media,close);panel.append(bar);document.body.append(panel);
let active=null,epoch=0;
const items=sources.map((audio,i)=>{
 const example=audio.closest('.example')||audio.parentElement,card=audio.closest('.pattern-card');
 const button=el('button','nmp-btn nmp-btn--primary guide-listen','▶ '+T.listen);button.type='button';button.setAttribute('aria-controls',panel.id);button.setAttribute('aria-pressed','false');
 const marker=document.createComment('original guide audio position '+i);audio.before(marker,button);
 const heading=example.querySelector('h5,h3')?.textContent?.trim()||card.querySelector('h4')?.textContent?.trim()||T.player;
 button.setAttribute('aria-label',T.listen+': '+heading);
 const item={audio,example,card,button,marker,title:heading};
 button.addEventListener('click',event=>activate(item,event.detail===0));
 audio.hidden=true;audio.tabIndex=0;
 for(const [event,message] of Object.entries({playing:T.playing,pause:T.paused,ended:T.ended,waiting:T.loading,error:T.error}))audio.addEventListener(event,()=>{
  if(active!==item)return;
  if(event==='pause'&&(!audio.paused||audio.ended||audio.readyState===0))return;
  if(event==='playing'&&audio.paused)return;
  if(event==='error'&&!audio.error)return;
  status.textContent=message;reflect();
 });
 return item;
});
function reflect(){for(const item of items){const on=item===active&&!item.audio.paused;item.button.textContent=on?T.pause:'▶ '+T.listen;item.button.setAttribute('aria-pressed',String(on));item.button.setAttribute('aria-label',(on?T.pause:T.listen)+': '+item.title);}}
function reserveSpace(){const height=panel.hidden?0:Math.ceil(panel.getBoundingClientRect().height)+20;document.documentElement.style.setProperty('--guide-player-space',height+'px');}
function restore(item){item.audio.pause();try{item.audio.currentTime=0;}catch{}item.audio.hidden=true;item.marker.after(item.audio);}
function activate(item,keyboard){
 if(item.card.hidden)return;
 if(active===item&&!item.audio.paused){item.audio.pause();if(keyboard)item.audio.focus({preventScroll:true});return;}
 const token=++epoch;
 if(active!==item){
  if(active)restore(active);
  active=item;title.textContent=item.title;
  scope.textContent=item.example.querySelector('.scope')?.textContent?.trim()||item.example.querySelector('p.small')?.textContent?.trim()||'';
  file.href=item.audio.src;
  // Keep the full source evidence, licensing and limitations available. Cloned
  // attribution must not duplicate IDs from the main guide.
  const cited=item.example.querySelector('details.cite');
  credit.replaceChildren();
  if(cited){for(const node of cited.children){if(node.tagName==='SUMMARY')continue;const copy=node.cloneNode(true);copy.removeAttribute('id');for(const n of copy.querySelectorAll('[id]'))n.removeAttribute('id');credit.append(copy);}}
  details.open=false;slot.append(item.audio);item.audio.hidden=false;
 }
 panel.hidden=false;document.body.classList.add('guide-player-open');reserveSpace();
 status.textContent=T.loading;reflect();
 if(keyboard)item.audio.focus({preventScroll:true});
 try{const promise=item.audio.play();if(promise?.catch)promise.catch(error=>{if(active!==item||epoch!==token)return;status.textContent=error?.name==='NotAllowedError'?T.blocked:T.error;reflect();});}
 catch{if(active===item&&epoch===token){status.textContent=T.error;reflect();}}
}
function closePlayer(returnFocus){
 if(!active)return;
 ++epoch;const previous=active;active=null;restore(previous);
 panel.hidden=true;document.body.classList.remove('guide-player-open');reserveSpace();reflect();
 if(returnFocus){if(previous.button.isConnected&&!previous.card.hidden&&!previous.button.closest('details:not([open])'))previous.button.focus({preventScroll:true});else document.querySelector('#cardfilter')?.focus({preventScroll:true});}
}
close.addEventListener('click',()=>closePlayer(true));
panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closePlayer(true);}});
function checkVisibility(){if(active&&active.card.hidden){const focusInside=panel.contains(document.activeElement);closePlayer(focusInside);}}
document.querySelector('#cardfilter')?.addEventListener('input',checkVisibility);
const observer=new MutationObserver(checkVisibility);for(const item of items)observer.observe(item.card,{attributes:true,attributeFilter:['hidden']});
if(typeof ResizeObserver==='function')new ResizeObserver(reserveSpace).observe(panel);
else {addEventListener('resize',reserveSpace);details.addEventListener('toggle',reserveSpace);}
addEventListener('pagehide',()=>closePlayer(false));
})();
