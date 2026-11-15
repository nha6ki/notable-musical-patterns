(() => {
'use strict';
const catalogueBase = new URL('.',document.currentScript.src);
const $ = (id)=>document.getElementById(id), ds=$('dataset'), mode=$('mode'), q=$('query');
const base=globalThis.NMP_DATASETS_13, supplemental=globalThis.NMP_SUPPLEMENT;
const data=base && Array.isArray(base.rows) && Array.isArray(base.datasets)
 ? {datasets:[...base.datasets,...(supplemental?.datasets||[])],rows:[...base.rows,...(supplemental?.rows||[])]}
 : null;
if (!data || !Array.isArray(data.rows)) { $('results-status').textContent='データを読み込めませんでした。展開先を確認してください。'; return; }
const n=(a)=>Number(a).toLocaleString('ja-JP');
const map=new Map(data.datasets.map(d=>[d.id,d]));
const norm=(s)=>String(s??'').normalize('NFKD').toLocaleLowerCase('ja').replace(/[\u0300-\u036f]/g,'');
const rows=data.rows.map(r=>({...r,search:norm([r.title,r.category,r.detail,r.id,r.location,map.get(r.dataset)?.title,...(map.get(r.dataset)?.aliases||[])].join(' '))}));
const modeNames={audio:'試聴',external:'外部試聴',reference:'出典参照',analysis:'メタデータ・分析'};
let p=0,lastButton=null,activeId=null,typing=false;
const size=18;
function el(name,txt,cls){const x=document.createElement(name);if(txt!=null)x.textContent=txt;if(cls)x.className=cls;return x;}
function safe(raw){try{const u=new URL(raw);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
function link(title,raw){const url=safe(raw);if(!url)return null;const a=el('a',title,'subtle');a.href=url;a.rel='noopener noreferrer';return a;}
function add(parent,child){if(child)parent.append(child);}
$('source-count').textContent=n(data.datasets.length);
$('local-count').textContent=n(rows.filter(x=>x.mode==='audio').length);
$('reference-count').textContent=n(rows.filter(x=>x.releaseKind==='source_only').length);
const totals=new Map(data.datasets.map(d=>[d.id,d.playbackCoverage]));
const catalogueIntroductions={"mutopia": "クラシック作品の掲載版と、対象箇所を指定した合成試聴。版・声部・出典を各項目で確認できます。", "candombe": "ウルグアイのカンドンベ合奏録音。拍注釈に対応する短い抜粋を掲載しています。", "gmd": "電子ドラム演奏の録音・MIDI資料。試聴は公式電子ドラム出力の照合済み抜粋です。", "oneill": "1903年のアイルランド音楽集を掲載番号から検索。原典・電子採譜や別演奏の参照先を案内します。", "billboard": "ポピュラー音楽の和声注釈資料。録音そのものと注釈の利用条件を区別して参照できます。", "weimar": "ジャズ・ソロの採譜データベース。ここでは資料概要と公式提供元を案内します。", "jsmel": "日本で広く知られる歌の旋律を、音高・音価などの記号データで示す研究資料です。ここでは概要と公式提供元を案内します。", "brid": "ブラジルの打楽器録音資料。短い合奏試聴と、録音・拍注釈の出典をたどれます。", "guitarset": "ギター演奏と注釈の研究資料。演奏課題の指示譜と、実音の確認範囲を分けて紹介します。", "greek-folk": "ギリシャ民俗音楽の採譜目録。原資料と参考演奏への外部リンクを案内します。", "tabla": "タブラの打撃分類資料。録音IDと区分を紹介し、音声はこのサイトに掲載していません。", "mpb": "ブラジルのポピュラー音楽の和声注釈資料。作品情報と提供元が示す録音候補を参照できます。", "varnam": "カルナータカ音楽のヴァルナム資料。提供元の録音・注釈へのリンクを案内します。", "rod-vocal":"南アジアの歌唱練習の資料。ラーガ別の項目と配布元を参照できます。", "japan-historical":"唱歌や邦楽などの歴史的な楽譜。原譜の参照先と、一部の旋律・構成音の合成試聴を掲載しています。", "non-four-performances":"Freesound投稿者が4/4以外の拍子などを示した参考音源です。拍子の独立した実音判定とは区別します。"};
const publicationLimits={"mutopia": "掲載音源は参照版のPublic Domain表示と版別の帰属に基づきます。他の版・録音・歌詞を一括して許諾するものではありません。", "oneill": "電子採譜からの合成音は未掲載です。原譜との照合と、GPLに対応するソース・通知・変更記録の整備が必要です。", "weimar": "個別ソロデータと録音は未掲載です。派生データのODbL/DbCLへの対応と提供条件の確認を残しています。", "jsmel": "個別メタデータと合成音は未掲載です。CC BY-NCの条件に公開目的が適合するか確認を残しています。", "tabla": "音声は未掲載です。学習音源の上流の利用条件を確認できていないため、デポジットの表示だけで再配布可能とは判断していません。"};
const counts=new Map();
for(const r of rows)counts.set(r.dataset,(counts.get(r.dataset)||0)+1);
for(const d of data.datasets){
 const option=el('option',d.title);option.value=d.id;ds.append(option);
 const c=el('article',null,'dataset');c.dataset.id=d.id;
 const indexed=counts.get(d.id)||0;
 const indexedLabel=(d.id==='weimar'||d.id==='jsmel')&&indexed===1?'概要1項目':n(indexed)+'検索項目';
 const extent=d.id==='mutopia'?'参照する掲載版：':'提供資料の規模：';
 c.append(el('span','掲載資料','tag'),el('h3',d.title),el('p','本サイト：'+indexedLabel,'d-count'),el('p',extent+n(d.total)+d.unit),el('p',catalogueIntroductions[d.id]||d.summary),el('p',d.license,'license'));
 const note=el('details'),heading=el('summary','掲載範囲・保留理由');
 note.append(heading,el('p',publicationLimits[d.id]||d.summary));c.append(note);
 const totalsText=totals.get(d.id);if(totalsText)c.append(el('p',totalsText,'playback-coverage'));
 const a=el('div',null,'actions'),b=el('button','この資料を探す');b.type='button';b.addEventListener('click',()=>{ds.value=d.id;mode.value='';q.value='';refresh();$('explore').scrollIntoView({block:'start'});q.focus({preventScroll:true});});
 a.append(b);add(a,link('公式出典 ↗',d.source));c.append(a);$('datasets').append(c);
}
let request=0;
function canPlay(r){return r.mode==='audio';}
function play(r,btn,keyboard){
 if(!canPlay(r)||!/^assets\/[a-z0-9._-]+\.(wav|m4a)$/i.test(r.file))return;
 const audio=$('audio'), id=++request;
 if(activeId===r.id&&!$('player').hidden&&!audio.paused){audio.pause();syncPlayer();return;}
 if(activeId===r.id&&!$('player').hidden&&!audio.error){
  lastButton=btn;
  if(audio.ended)audio.currentTime=0;
  if(keyboard)audio.focus({preventScroll:true});
  beginPlayback(id);
  return;
 }
 audio.pause();audio.removeAttribute('src');audio.load();
 lastButton=btn;activeId=r.id;$('playing').textContent=r.title;$('player').hidden=false;
 $('player-note').textContent='読み込み中…';
 const uri=new URL(r.file,catalogueBase).href;
 $('player-note').textContent=(r.kind||'試聴')+(r.location?' · '+r.location:'');
 audio.src=uri;syncPlayer();
 if(keyboard)audio.focus({preventScroll:true});
 beginPlayback(id);
}
function beginPlayback(id){
 const audio=$('audio');
 audio.play().catch(()=>{if(id!==request)return;$('player-note').textContent=audio.error?'音源を読み込めませんでした。':'再生ボタンを押してください。';});
}
function syncPlayer(){
 const playing=!$('player').hidden&&!$('audio').paused&&!$('audio').ended;
 for(const b of $('records').querySelectorAll('button[data-play-id]')){
  const on=playing&&b.dataset.playId===activeId;
  b.textContent=on?'一時停止':'▶ 視聴する';
  b.setAttribute('aria-pressed',String(on));
  b.setAttribute('aria-label',(on?'一時停止: ':'視聴する: ')+b.dataset.title+' ('+b.dataset.duration+')');
 }
}
for(const event of ['playing','pause','ended','error'])$('audio').addEventListener(event,syncPlayer);
$('stop').addEventListener('click',()=>{
 request++;activeId=null;
 const a=$('audio');a.pause();a.removeAttribute('src');a.load();$('player').hidden=true;
 syncPlayer();(lastButton?.isConnected?lastButton:q).focus();
});
 $('audio').addEventListener('error',()=>{if(activeId)$('player-note').textContent='音源を読み込めませんでした。';});
function record(r){
 const d=map.get(r.dataset), x=el('li',null,'record');x.dataset.recordId=r.id;
 x.append(el('span',modeNames[r.mode]+' · '+(r.kind||r.category||d.title),'tag tag-'+r.mode),el('h3',r.title),el('p',d.title+(r.category?' / '+r.category:'')),el('p',r.detail));
 if(r.location)x.append(el('p',r.location));
 const a=el('div',null,'actions');
 if(canPlay(r)){
  const b=el('button','▶ 視聴する','play nmp-btn nmp-btn--primary');
  b.type='button';b.dataset.playId=r.id;b.dataset.title=r.title;
  b.dataset.duration=(Math.round(r.seconds*10)/10)+'秒';
  b.setAttribute('aria-controls','audio');
  b.addEventListener('click',event=>play(r,b,event.detail===0));a.append(b);
 }
 if(r.listeningUrl) add(a,link(r.listeningLabel||'外部で聴く ↗',r.listeningUrl));
 const sourceLink=link(r.linkLabel||'出典 ↗',r.source||d.source);add(a,link(r.externalLabel||'関連資料 ↗',r.externalUrl));
 x.append(a);if(r.listeningNote)x.append(el('p',r.listeningNote));
 if(sourceLink||r.credit||r.license){const det=el('details');det.append(el('summary','出典・帰属・利用条件'));add(det,sourceLink);if(r.credit)det.append(el('p',r.credit,'cred'));if(r.license)det.append(el('p',r.license,'cred'));add(det,link('利用条件 ↗',r.licenseUrl||d.licenseUrl));x.append(det);}
 return x;
}
function render(){
 const words=norm(q.value).trim().split(/\s+/).filter(Boolean);
 const f=rows.filter(r=>(!ds.value||ds.value===r.dataset)&&(!mode.value||(mode.value==='without'?r.releaseKind==='source_only':mode.value==='audio'?canPlay(r):mode.value==='external'?!!r.listeningUrl:mode.value===r.mode))&&words.every(w=>r.search.includes(w)));
 const pages=Math.max(1,Math.ceil(f.length/size));p=Math.min(p,pages-1);
 $('scope').textContent=ds.value?(catalogueIntroductions[ds.value]||map.get(ds.value).summary):'外部候補は同じ演奏版や該当秒を保証しません。試聴リンクのない項目も検索できます。';
 $('results-status').textContent=n(f.length)+'項目に一致（このページで試聴 '+n(f.filter(canPlay).length)+'件 ／ 参照のみ '+n(f.filter(r=>r.releaseKind==='source_only').length)+'件）';
 $('records').replaceChildren(...f.slice(p*size,p*size+size).map(record));syncPlayer();
 $('empty').hidden=!!f.length;$('pagination').hidden=pages<=1;
 $('page-number').textContent=(p+1)+' / '+pages;$('prev').disabled=p===0;$('next').disabled=p+1>=pages;
 for(const x of $('datasets').children)x.setAttribute('aria-current',x.dataset.id===ds.value?'true':'false');
}
function writeURL(method){
 const u=new URL(location.href);
 for(const [k,v] of [['q',q.value.trim()],['dataset',ds.value],['mode',mode.value],['page',p?String(p+1):'']]){
  if(v)u.searchParams.set(k,v);else u.searchParams.delete(k);
 }
 if(u.href!==location.href)history[method==='push'?'pushState':'replaceState'](null,'',u);
}
function refresh(method='push'){
 if(method==='push')typing=false;
 p=0;render();writeURL(method);
}
function restoreURL(){
 typing=false;
 const params=new URLSearchParams(location.search);
 q.value=params.get('q')||'';
 const dataset=params.get('dataset')||'', display=params.get('mode')||'';
 ds.value=map.has(dataset)?dataset:'';
 mode.value=Array.from(mode.options).some(o=>o.value===display)?display:'';
 const page=params.get('page')||'';
 p=/^[1-9]\d{0,8}$/.test(page)?Number(page)-1:0;
 render();writeURL('replace');
}
q.addEventListener('input',()=>{refresh(typing?'replace':'push');typing=true;});
q.addEventListener('blur',()=>{typing=false;});
mode.addEventListener('change',()=>refresh());ds.addEventListener('change',()=>refresh());
$('clear').addEventListener('click',()=>{ds.value=mode.value=q.value='';refresh();q.focus();});
for(const [id,delta] of [['prev',-1],['next',1]])$(id).addEventListener('click',()=>{typing=false;p+=delta;render();writeURL('push');$('results-status').focus();});
addEventListener('popstate',restoreURL);
restoreURL();
})();
