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
let p=0,lastButton=null;
const size=18;
function el(name,txt,cls){const x=document.createElement(name);if(txt!=null)x.textContent=txt;if(cls)x.className=cls;return x;}
function safe(raw){try{const u=new URL(raw);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
function link(title,raw){const url=safe(raw);if(!url)return null;const a=el('a',title,'subtle');a.href=url;a.rel='noopener noreferrer';return a;}
function hashDataset(){const v=ds.value,u=new URL(location.href);if(v)u.searchParams.set('dataset',v);else u.searchParams.delete('dataset');try{history.replaceState(null,'',u);}catch{}}
function add(parent,child){if(child)parent.append(child);}
const qd=new URLSearchParams(location.search).get('dataset');
$('source-count').textContent=n(data.datasets.length);
$('local-count').textContent=n(rows.filter(x=>x.mode==='audio').length);
$('reference-count').textContent=n(rows.filter(x=>x.releaseKind==='source_only').length);
const totals=new Map(data.datasets.map(d=>[d.id,d.playbackCoverage]));
for(const d of data.datasets){
 const option=el('option',d.title);option.value=d.id;ds.append(option);
 const c=el('article',null,'dataset');c.dataset.id=d.id;
 c.append(el('span',d.badge||'出典・調査記録','tag'),el('h3',d.title),el('p',n(d.total)+d.unit,'d-count'),el('p',d.summary),el('p',d.license,'license'));
 const totalsText=totals.get(d.id);if(totalsText)c.append(el('p',totalsText,'playback-coverage'));
 const a=el('div',null,'actions'),b=el('button','この資料を探す');b.type='button';b.addEventListener('click',()=>{ds.value=d.id;mode.value='';q.value='';refresh();hashDataset();$('explore').scrollIntoView({block:'start'});q.focus({preventScroll:true});});
 a.append(b);add(a,link('公式出典 ↗',d.source));c.append(a);$('datasets').append(c);
}
 if(map.has(qd))ds.value=qd;
let request=0;
function canPlay(r){return r.mode==='audio';}
function play(r,btn){
 const audio=$('audio'), id=++request;
 audio.pause();audio.removeAttribute('src');audio.load();
 lastButton=btn;$('playing').textContent=r.title;$('player').hidden=false;
 $('player-note').textContent='読み込み中…';
 if(id!==request||r.mode!=='audio'||!/^assets\/[a-z0-9._-]+\.(wav|m4a)$/i.test(r.file))return;
 const uri=new URL(r.file,catalogueBase).href;
 $('player-note').textContent=(r.kind||'試聴')+(r.location?' · '+r.location:'');
 audio.src=uri;audio.play().catch(()=>{$('player-note').textContent='再生ボタンを押してください。';});
}
 $('stop').addEventListener('click',()=>{request++;const a=$('audio');a.pause();a.removeAttribute('src');a.load();$('player').hidden=true;if(lastButton?.isConnected)lastButton.focus();});
 $('audio').addEventListener('error',()=>{$('player-note').textContent='音源を読み込めませんでした。';});
function record(r){
 const d=map.get(r.dataset), x=el('li',null,'record');x.dataset.recordId=r.id;
 x.append(el('span',modeNames[r.mode]+' · '+(r.kind||r.category||d.title),'tag tag-'+r.mode),el('h3',r.title),el('p',d.title+(r.category?' / '+r.category:'')),el('p',r.detail));
 if(r.location)x.append(el('p',r.location));
 const a=el('div',null,'actions');
 if(canPlay(r)){const b=el('button','▶ サイト内試聴（'+Math.round(r.seconds*10)/10+'秒）','play');b.type='button';b.addEventListener('click',()=>play(r,b));a.append(b);}
 if(r.listeningUrl) add(a,link(r.listeningLabel||'外部で聴く ↗',r.listeningUrl));
 add(a,link(r.linkLabel||'出典 ↗',r.source||d.source));add(a,link(r.externalLabel||'関連資料 ↗',r.externalUrl));
 x.append(a);if(r.listeningNote)x.append(el('p',r.listeningNote));
 if(r.credit||r.license){const det=el('details');det.append(el('summary','帰属・利用条件'));if(r.credit)det.append(el('p',r.credit,'cred'));if(r.license)det.append(el('p',r.license,'cred'));add(det,link('利用条件 ↗',r.licenseUrl||d.licenseUrl));x.append(det);}
 return x;
}
function render(){
 const words=norm(q.value).trim().split(/\s+/).filter(Boolean);
 const f=rows.filter(r=>(!ds.value||ds.value===r.dataset)&&(!mode.value||(mode.value==='without'?r.releaseKind==='source_only':mode.value==='audio'?canPlay(r):mode.value==='external'?!!r.listeningUrl:mode.value===r.mode))&&words.every(w=>r.search.includes(w)));
 const pages=Math.max(1,Math.ceil(f.length/size));p=Math.min(p,pages-1);
 $('scope').textContent=ds.value?map.get(ds.value).summary:'外部候補は同じ演奏版や該当秒を保証しません。試聴リンクのない項目も検索できます。';
 $('results-status').textContent=n(f.length)+'項目に一致（このページで試聴 '+n(f.filter(canPlay).length)+'件 ／ 参照のみ '+n(f.filter(r=>r.releaseKind==='source_only').length)+'件）';
 $('records').replaceChildren(...f.slice(p*size,p*size+size).map(record));
 $('empty').hidden=!!f.length;$('pagination').hidden=pages<=1;
 $('page-number').textContent=(p+1)+' / '+pages;$('prev').disabled=p===0;$('next').disabled=p+1>=pages;
 for(const x of $('datasets').children)x.setAttribute('aria-current',x.dataset.id===ds.value?'true':'false');
}
function refresh(){p=0;render();}
q.addEventListener('input',refresh);mode.addEventListener('change',refresh);ds.addEventListener('change',()=>{refresh();hashDataset();});
$('clear').addEventListener('click',()=>{ds.value=mode.value=q.value='';refresh();hashDataset();q.focus();});
for(const [id,delta] of [['prev',-1],['next',1]])$(id).addEventListener('click',()=>{p+=delta;render();$('results-status').focus();});
render();
})();
