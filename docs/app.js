'use strict';
const fold = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase('ja').trim();
const fields = ['id','concept_id','concept_ja','work','creator','aliases','edition','location','display_name_ja','finding_ja'];
const audioPath = value => typeof value === 'string' && /^\.\/assets\/[a-zA-Z0-9_.-]+\.wav$/.test(value) && !value.includes('..');
const playable = card => Boolean(card.preview && audioPath(card.preview.file));
const matches = (card,query,audioOnly=false) => (!audioOnly || playable(card)) && fold(query).split(/\s+/u).every(term => fold(fields.map(key=>card[key] ?? '').join(' ')).includes(term));
const pageSlice = (cards,page,size) => cards.slice((page-1)*size,page*size);
const externalURL = value => {try {const url=new URL(value);return ['https:','http:'].includes(url.protocol) ? url.href : null;} catch {return null;}};
if(typeof module !== 'undefined') module.exports={fold,matches,pageSlice,playable,audioPath,externalURL};
if(typeof document !== 'undefined') {
  const $=id=>document.getElementById(id);
  const make=(tag,text,parent,className)=>{const node=document.createElement(tag);if(text != null)node.textContent=text;if(className)node.className=className;if(parent)parent.append(node);return node;};
  const link=(text,url,parent)=>{const safe=externalURL(url);if(!safe)return;const node=make('a',text,parent);node.href=safe;node.target='_blank';node.rel='noopener noreferrer';node.setAttribute('aria-label',text+'（新しいタブ）');};
  let all=[],filtered=[],page=1,size=30,audio=null,lastPlayButton=null,loadSequence=0;
  function play(card,button){
    const sequence=++loadSequence;
    if(!playable(card))return;
    if(!audio){audio=document.createElement('audio');audio.controls=true;audio.preload='none';audio.setAttribute('aria-label','選択した例の合成音を試聴');$('audio-host').append(audio);audio.addEventListener('error',()=>{$('player-status').textContent='音源を読み込めませんでした。各カードのWAVリンクも確認してください。';});}
    audio.pause();lastPlayButton=button;audio.src=card.preview.file;$('player-panel').hidden=false;
    $('now-playing').textContent=(card.display_name_ja||card.work||card.id)+' · '+(card.preview.bars||card.location||'');
    $('player-status').textContent='合成音を読み込んでいます…';
    const result=audio.play();if(result)result.then(()=>{if(sequence===loadSequence)$('player-status').textContent='MIDIからの合成音。人の演奏・歌声ではありません。';}).catch(()=>{if(sequence===loadSequence)$('player-status').textContent='再生できない場合はプレーヤーの再生ボタン、またはWAVリンクをお試しください。';});
  }
  function render(){
    const pages=Math.max(1,Math.ceil(filtered.length/size));page=Math.min(page,pages);$('cards').replaceChildren();
    for(const [offset,card] of pageSlice(filtered,page,size).entries()){
      const node=make('article',null,$('cards'),'card');
      make('p',[card.id,card.concept_ja].filter(Boolean).join(' / '),node,'tag');
      const title=make('h3',card.display_name_ja||card.work||card.id,node);title.id='result-'+((page-1)*size+offset);node.setAttribute('aria-labelledby',title.id);
      if(card.work && card.work!==card.display_name_ja)make('p',card.work,node,'original');
      make('p',card.creator||'作曲者の情報は出典を参照',node);
      make('p',card.edition||'',node,'edition');
      make('p',card.finding_ja||card.finding||'詳細は出典の楽譜・MIDIを参照してください。',node,'finding');
      make('p','該当箇所：'+(card.location||'出典を参照'),node,'location');
      const action=make('div',null,node,'action');
      if(playable(card)){
        const button=make('button','▶ 合成音を聴く',action,'play');button.type='button';button.setAttribute('aria-label',(card.display_name_ja||card.work||card.id)+'の合成音を聴く');button.addEventListener('click',()=>play(card,button));
        const seconds=Number(card.preview.seconds);make('p',[card.preview.bars,Number.isFinite(seconds)?'約'+seconds.toFixed(1)+'秒':null,'MIDI合成・歌声なし'].filter(Boolean).join(' · '),action,'credit');
      }else make('p','試聴なし · 楽譜と出典を確認',action,'credit');
      const details=make('details',null,node);make('summary','出典・検証範囲・利用条件',details);
      make('p',card.scope_display_ja||card.scope_note_ja||'',details);
      make('p',card.credit_display_ja||card.source_credit||'',details);
      link('公式の楽譜・MIDI版ページ ↗',card.source_url,make('p',null,details));
      if(playable(card)){
        make('p',card.preview.source_license||'',details);
        const wav=make('a','WAVを直接開く',make('p',null,details));wav.href=card.preview.file;wav.target='_blank';wav.rel='noopener';
      }
      for(const url of card.additional_source_urls||[])link('関連資料 ↗',url,make('p',null,details));
    }
    const start=filtered.length?(page-1)*size+1:0,end=Math.min(page*size,filtered.length);
    $('count').textContent=filtered.length.toLocaleString('ja')+'例に一致（うち試聴 '+filtered.filter(playable).length.toLocaleString('ja')+'例） · '+start+'–'+end+'例を表示';
    $('empty').hidden=filtered.length>0;$('page-label').textContent=page+' / '+pages+'ページ';$('previous').disabled=page<=1;$('next').disabled=page>=pages;
  }
  function refresh(){filtered=all.filter(card=>matches(card,$('query').value,$('audio-only').checked));page=1;render();}
  $('query').addEventListener('input',refresh);$('audio-only').addEventListener('change',refresh);
  $('page-size').addEventListener('change',()=>{size=Number($('page-size').value);refresh();});
  $('reset').addEventListener('click',()=>{$('query').value='';$('audio-only').checked=false;refresh();$('query').focus();});
  function changePage(delta){page+=delta;render();$('count').setAttribute('tabindex','-1');$('count').focus();$('catalogue').scrollIntoView({block:'start'});}
  $('previous').addEventListener('click',()=>changePage(-1));$('next').addEventListener('click',()=>changePage(1));
  $('close-player').addEventListener('click',()=>{++loadSequence;if(audio){audio.pause();audio.removeAttribute('src');audio.load();}$('player-panel').hidden=true;if(lastPlayButton?.isConnected)lastPlayButton.focus();else $('query').focus();});
  fetch('./catalogue.json').then(response=>{if(!response.ok)throw new Error('HTTP '+response.status);return response.json();}).then(data=>{
    if(!Array.isArray(data.cards)||!data.counts||!Number.isInteger(data.counts.editions)||!Number.isInteger(data.counts.previews))throw new Error('Invalid catalogue');
    all=data.cards;$('edition-total').textContent=data.counts.editions.toLocaleString('ja');$('preview-total').textContent=data.counts.previews.toLocaleString('ja');refresh();
  }).catch(()=>{$('count').textContent='読み込み未完了';$('error').hidden=false;$('error').textContent='カタログを読み込めませんでした。ページを再読み込みしてください。ローカルではHTTPサーバー経由で開き、catalogue.jsonが同じ場所にあることを確認してください。';});
}
