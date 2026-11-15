/* Presentation only: leave the review data, taxonomy and search associations intact. */
window.nmpEvidence = (record, localize, related) => {
  const tidy = value => String(value ?? '').replace(/\s+/gu, ' ').trim();
  const show = value => tidy(localize(value ?? ''));
  const rawMethod = tidy(record[9]);
  const rawOverview = show(record[9]);
  const leadSheet = rawMethod === '配布JAMSの指示譜による全体の進行。公開されている冒頭試聴が全構造を含むとは限らず、実音の和音同定ではない。';
  const concise = new Map([
    ['配布JAMSの指示譜による全体の進行。公開されている冒頭試聴が全構造を含むとは限らず、実音の和音同定ではない。', '配布JAMSの指示譜による全体の進行。冒頭試聴に全構造が含まれるとは限らず、実音の和音は未同定。']
  ]);
  const midiTable = rawMethod.match(/^公開抜粋と配布MIDIイベント表を区間照合。MIDI tick 0基準の4\/4完全小節([12])。約±0\.145四分拍以内の発音を数え、独立実聴と強弱の判断はしない。$/u);
  const initialEdition = rawMethod === '初期版の楽譜・MIDIに由来する抜粋の構造記述を正規化。今回は全例の原譜再読・実聴をしたものではない。';
  const overview = initialEdition
    ? rawOverview === rawMethod
      ? '初期版の楽譜・MIDIに基づく抜粋の構造記述。'
      : 'Structural description of the excerpt based on the score and MIDI from the initial edition.'
    : midiTable
    ? rawOverview === rawMethod
      ? `公開抜粋の4/4・${midiTable[1]}小節を配布MIDIと照合（tick 0基準、発音位置の許容差は四分音符1拍の約±0.145）。実聴・強弱の評価は未実施。`
      : `The excerpt spans ${midiTable[1]} complete 4/4 ${midiTable[1] === '1' ? 'bar' : 'bars'} from MIDI tick 0. Onsets were checked against the distributed MIDI (tolerance: about ±0.145 quarter-note beats). Independent listening and dynamics were not assessed.`
    : concise.get(rawOverview) || rawOverview;
  const features = record[10].map(relation => {
    const scope = show(relation[3]);
    // Common method and limitations are stated once above the per-feature list.
    const note = show(relation[4]);
    const repeatsCymbalLabel = midiTable && relation[0] === 'ドラムの8分シンバル刻み' &&
      relation[4] === 'MIDI上の8分シンバル刻み。' + rawMethod;
    const remaining = repeatsCymbalLabel ? '' : rawOverview ? tidy(note.replace(rawOverview, '')) : note;
    const generic = ['公開試聴区間', 'Published listening excerpt', 'Published excerpt'];
    const repeatsJamsScope = leadSheet &&
      relation[3] === '指示譜の全体。試聴内での出現は保証しない';
    const fields = [generic.includes(scope) || repeatsJamsScope ? '' : scope, remaining, show(related(relation))].filter(v =>
      v && !rawOverview.includes(v)
    );
    return {label: show(relation[0]), kind: show(relation[2]), details: [...new Set(fields)].map(s =>
      /[.!?。！？]$/u.test(s) ? s : s + (/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(s) ? '。' : '.')
    )};
  });
  // Only drop these three tags when the shared lead-sheet note already states all three cautions.
  const repeatedJamsTags = new Set(['指示譜の全体構造','実音和音は独立未検証','冒頭試聴は進行全体ではない']);
  const tags = leadSheet ? tidy(record[8]).split('|').map(tidy).filter(value => value && !repeatedJamsTags.has(value)).join(' | ') : record[8];
  const summary = features.length ? overview : overview.replace(/^(?:今回も保留。|今回の点検後も定型は保留。)\s*/u, '');
  return {overview: summary, features, tags: show(tags)};
};
