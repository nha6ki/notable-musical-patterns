"use strict";
const fold = s => s.normalize("NFKC").toLowerCase().trim();
const fields = ["id","concept_id","concept_ja","work","creator","aliases","edition","location","display_name_ja","finding_ja"];
const matches = (card,q,audioOnly=false) =>
  (!audioOnly || Boolean(card.preview)) && fold(q).split(/\s+/u).every(t => fold(fields.map(k=>card[k]||"").join(" ")).includes(t));
if(typeof module!=="undefined") module.exports={fold,matches};
if(typeof document!=="undefined"){
  const el=(name,text,parent)=>{
    const n=document.createElement(name);
    if(text) n.textContent=text;
    if(parent) parent.append(n);
    return n;
  };
  const link=(text,url,parent)=>{
    const a=el("a",text,parent);a.href=url;return a;
  };
  const q=document.querySelector("#query"), only=document.querySelector("#audio-only"), deck=document.querySelector("#cards"), count=document.querySelector("#count"), empty=document.querySelector("#empty");
  const all=globalThis.NMP_LISTENING_CATALOGUE.cards;
  const listing=all.map(card=>{
    const a=el("article",null,deck);
    const tag=el("p",card.id+" · "+card.concept_ja,a);tag.className="eyebrow";
    const title=el("h3",card.display_name_ja||card.work,a);
    title.id=card.id+"-title";
    a.setAttribute("aria-labelledby",title.id);
    if(card.display_name_ja && card.display_name_ja!==card.work) el("p",card.work,a);
    el("p",card.creator+" · "+card.edition,a);
    el("p","該当箇所： "+card.location,a);
    el("p",card.finding_ja,a).className="findings";
    let player;
    if(card.preview){
      const fig=el("figure",null,a);
      const caption=el("figcaption","MIDIによる再現（合成音） · "+card.preview.bars+" · 約"+card.preview.seconds.toFixed(2)+"秒",fig);
      caption.id=card.id+"-audio-title";
      player=el("audio",null,fig);
      player.controls=true;
      player.preload="none";
      player.src=card.preview.file;
      player.setAttribute("aria-labelledby",caption.id);
      el("p",card.preview.credit,fig).className="credit";
      link("WAVを直接開く",card.preview.file,fig);
      const status=el("p","プレーヤーで音を読み込めません。WAVを直接開いてお試しください。",fig);
      status.hidden=true;
      status.setAttribute("role","status");
      player.addEventListener("error",()=>{status.hidden=false;});
      player.addEventListener("play",()=>{deck.querySelectorAll("audio").forEach(other=>{if(other!==player)other.pause();});});
    }else{
      el("p","試聴なし · 版・該当箇所・出典を掲載",a).className="off";
    }
    link("楽譜・MIDIの出典",card.source_url,el("p",null,a));
    const refs=el("details",null,a);
    el("summary","根拠・帰属",refs);
    el("p",card.scope_display_ja,refs);
    el("p",card.credit_display_ja,refs);
    for(const url of card.additional_source_urls) link("関連資料",url,el("p",null,refs));
    return {card,node:a,player};
  });
  function refresh(){
    let found=0, playable=0;
    for(const {card,node,player} of listing){
      node.hidden=!matches(card,q.value,only.checked);
      if(node.hidden){if(player&&!player.paused)player.pause();}
      else {found++; if(player)playable++;}
    }
    count.textContent=found+"件（うち試聴 "+playable+"件）";
    empty.hidden=found>0;
  }
  q.addEventListener("input",refresh);
  only.addEventListener("change",refresh);
  refresh();
}
