(() => {
'use strict';
const $ = (id)=>document.getElementById(id);
const base=globalThis.NMP_DATASETS_13, supplemental=globalThis.NMP_SUPPLEMENT;
const data=base && Array.isArray(base.rows) && Array.isArray(base.datasets)
 ? {datasets:[...base.datasets,...(supplemental?.datasets||[])],rows:[...base.rows,...(supplemental?.rows||[])]}
 : null;
if (!data || !Array.isArray(data.rows)) { $('landing-status').textContent='The catalogue could not be loaded. Please check that its files are available.'; return; }
const n=(a)=>Number(a).toLocaleString('en-US');
const {localize,hasJapanese}=globalThis.NMP_CATALOGUE_EN;
const sourceUnits={"mutopia": "editions", "candombe": "recordings", "gmd": "performance IDs", "oneill": "entry numbers", "billboard": "annotation IDs", "weimar": "solos", "jsmel": "metadata IDs", "brid": "recordings", "guitarset": "performance recordings", "greek-folk": "transcriptions", "tabla": "recordings", "mpb": "work records", "varnam": "performance recordings", "rod-vocal": "recordings", "japan-historical": "pieces", "non-four-performances": "candidate recordings"};
function field(name,raw,cls){
 const text=localize(raw),e=el(name,text,cls);
 if(hasJapanese(text)){e.lang='ja';e.title='Original Japanese catalogue text';}
 return e;
}


const rows=data.rows;

function el(name,txt,cls){const x=document.createElement(name);if(txt!=null)x.textContent=txt;if(cls)x.className=cls;return x;}
function safe(raw){try{const u=new URL(raw);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
function link(title,raw){const url=safe(raw);if(!url)return null;const a=el('a',title,'subtle');a.href=url;a.rel='noopener noreferrer';return a;}
function add(parent,child){if(child)parent.append(child);}
$('source-count').textContent=n(data.datasets.length);
$('local-count').textContent=n(rows.filter(x=>x.mode==='audio').length);
$('reference-count').textContent=n(rows.filter(x=>x.releaseKind==='source_only').length);
const totals=new Map(data.datasets.map(d=>[d.id,d.playbackCoverage]));
const catalogueIntroductions={"mutopia": "Editions of classical works with synthesized excerpts from specified passages. Each entry identifies the edition, voice or part, and source.", "candombe": "Uruguayan candombe ensemble recordings, presented as short excerpts aligned with beat annotations.", "gmd": "Recordings and MIDI data from electronic drum performances. Playable excerpts have been matched to the official electronic drum output.", "oneill": "Search the 1903 collection of Irish music by entry number, and follow references to the original edition, digital transcriptions or alternative performances.", "billboard": "Harmonic annotations for popular music. Annotation terms are distinguished from rights in the recordings themselves.", "weimar": "A database of jazz solo transcriptions. This site provides an overview and links to the official source.", "jsmel": "Research data representing melodies of songs widely known in Japan as pitches, durations and other symbolic information. This site provides an overview and official links.", "brid": "Brazilian percussion recordings, with short ensemble excerpts and references to recordings and beat annotations.", "guitarset": "Guitar performance recordings and annotations. Task scores are distinguished from what has been checked in the recorded sound.", "greek-folk": "A catalogue of Greek folk music transcriptions, with links to original materials and reference performances.", "tabla": "A tabla stroke-classification dataset. Recording IDs and categories are listed; no audio is hosted here.", "mpb": "Harmonic annotations for Brazilian popular music, with work information and candidate recordings supplied by the source.", "varnam": "Carnatic varnam materials, with links to recordings and annotations at the source.", "rod-vocal": "South Asian vocal exercises, organized by rāga, with links to the provider.", "japan-historical": "Historical scores including Japanese school songs and traditional music, with original-source links and selected synthesized melodies or pitch collections.", "non-four-performances": "Reference recordings described by Freesound uploaders as non-4/4. These descriptions are not independent determinations of meter from the audio."};
const publicationLimits={"mutopia": "The audio is based on the public-domain designation and attribution of the referenced edition. This does not grant blanket permission for other editions, recordings or lyrics.", "oneill": "Synthesis from digital transcriptions is not published. Comparison with the original score and GPL-compliant source, notices and change records remain necessary.", "weimar": "Individual solo data and recordings are not published. Compliance with ODbL/DbCL for derived data and the provider’s terms remains to be resolved.", "jsmel": "Individual metadata and synthesized audio are not published. Whether this publication purpose meets CC BY-NC remains to be confirmed.", "tabla": "No audio is published. Upstream terms for training recordings remain unconfirmed, so the repository license label alone is not treated as redistribution permission."};
const counts=new Map();
for(const r of rows)counts.set(r.dataset,(counts.get(r.dataset)||0)+1);
for(const d of data.datasets){
 const c=el('article',null,'dataset');c.dataset.id=d.id;
 const indexed=counts.get(d.id)||0;
 const indexedLabel=(d.id==='weimar'||d.id==='jsmel')&&indexed===1?'1 overview entry':n(indexed)+' catalogue entries';
 const extent=d.id==='mutopia'?'Referenced editions: ':'Source collection size: ';
 c.append(el('span','Included source','tag'),field('h3',d.title),el('p','On this site: '+indexedLabel,'d-count'),el('p',extent+n(d.total)+' '+sourceUnits[d.id]),el('p',catalogueIntroductions[d.id]||d.summary),field('p',d.license,'license'));
 const note=el('details'),heading=el('summary','Coverage and unresolved issues');
 note.append(heading,field('p',publicationLimits[d.id]||d.summary));c.append(note);
 const totalsText=totals.get(d.id);if(totalsText)c.append(el('p',totalsText.replace('サイト内音源 ','On-site audio: ').replace(' ／ 参照のみ ',' / reference only: '),'playback-coverage'));
 const a=el('div',null,'actions'),b=el('a','Browse this source','nmp-btn');const target=new URL('../explore/',location.href);target.searchParams.set('dataset',d.id);target.searchParams.set('mode','all');target.hash='results';b.href=target.href;
 a.append(b);add(a,link('Official source ↗',d.source));c.append(a);$('datasets').append(c);
}
})();
