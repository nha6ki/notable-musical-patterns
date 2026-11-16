(() => {
'use strict';
const $ = (id)=>document.getElementById(id);
const base=globalThis.NMP_DATASETS_13, supplemental=globalThis.NMP_SUPPLEMENT;
const data=base && Array.isArray(base.rows) && Array.isArray(base.datasets)
 ? {datasets:[...base.datasets,...(supplemental?.datasets||[])],rows:[...base.rows,...(supplemental?.rows||[])]}
 : null;
if (!data || !Array.isArray(data.rows)) { $('landing-status').textContent='データを読み込めませんでした。展開先を確認してください。'; return; }
const n=(a)=>Number(a).toLocaleString('ja-JP');
const rows=data.rows;
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
 const c=el('article',null,'dataset');c.dataset.id=d.id;
 const indexed=counts.get(d.id)||0;
 const indexedLabel=(d.id==='weimar'||d.id==='jsmel')&&indexed===1?'概要1項目':n(indexed)+'検索項目';
 const extent=d.id==='mutopia'?'参照する掲載版：':'提供資料の規模：';
 c.append(el('span','掲載資料','tag'),el('h3',d.title),el('p','本サイト：'+indexedLabel,'d-count'),el('p',extent+n(d.total)+d.unit),el('p',catalogueIntroductions[d.id]||d.summary),el('p',d.license,'license'));
 const note=el('details'),heading=el('summary','掲載範囲・保留理由');
 note.append(heading,el('p',publicationLimits[d.id]||d.summary));c.append(note);
 const totalsText=totals.get(d.id)?.replace(/^サイト内音源(?=\s)/u,'サイト内試聴').replace(' ／ 参照のみ ',' ／ サイト内音声なし ');if(totalsText)c.append(el('p',totalsText,'playback-coverage'));
 const a=el('div',null,'actions'),b=el('a','この資料を探す','nmp-btn');const target=new URL('../explore/',location.href);target.searchParams.set('dataset',d.id);target.searchParams.set('mode','all');target.hash='results';b.href=target.href;
 a.append(b);add(a,link('公式出典 ↗',d.source));c.append(a);$('datasets').append(c);
}
})();
