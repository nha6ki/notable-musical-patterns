/* Shared, presentation-only catalogue index. No network requests or status changes.
 * create({datasets, rows, features, localize?, featureText?}) returns:
 * entries [{row, feature|null, searchText}], byId Map, datasets, counts,
 * search(query, predicate?) -> entries in original catalogue order.
 * Callers provide locale strings; row and feature references remain unchanged.
 * Invalid joins throw rather than silently dropping or mislabelling material.
 */
(() => {
  'use strict';
  const normalize = value => String(value ?? '').normalize('NFKD')
    .toLowerCase().replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/\s+/gu, ' ').trim();
  const assetName = value => {
    const path = String(value ?? '').split(/[?#]/, 1)[0];
    return path.slice(path.lastIndexOf('/') + 1);
  };
  function create({datasets, rows, features, localize = String, featureText = () => []}) {
    if (![datasets, rows, features].every(Array.isArray)) throw new TypeError('Catalogue inputs must be arrays');
    const sourceMap = new Map(), rowMap = new Map(), featureMap = new Map();
    for (const d of datasets) {
      if (!d || !d.id || sourceMap.has(d.id)) throw new Error('Duplicate or missing dataset ID');
      sourceMap.set(d.id, d);
    }
    for (const row of rows) {
      if (!row || !row.id || rowMap.has(row.id)) throw new Error('Duplicate or missing catalogue ID: ' + row?.id);
      if (!sourceMap.has(row.dataset)) throw new Error('Unknown dataset: ' + row.id);
      rowMap.set(row.id, row);
    }
    for (const feature of features) {
      if (!Array.isArray(feature) || !feature[0] || featureMap.has(feature[0])) throw new Error('Duplicate or missing feature ID: ' + feature?.[0]);
      const row = rowMap.get(feature[0]);
      if (!row || row.mode !== 'audio') throw new Error('Feature has no audio catalogue row: ' + feature[0]);
      for (const [field, index] of [['title',2],['location',5],['source',7]]) {
        if (String(row[field] ?? '') !== String(feature[index] ?? '')) throw new Error('Feature mismatch ' + field + ': ' + row.id);
      }
      if (!assetName(row.file) || assetName(row.file) !== assetName(feature[6])) throw new Error('Feature mismatch asset: ' + row.id);
      featureMap.set(feature[0], feature);
    }
    const flatten = value => Array.isArray(value) ? value.flat(Infinity) : [value];
    const entries = rows.map(row => {
      const feature = featureMap.get(row.id) || null, source = sourceMap.get(row.dataset);
      if (row.mode === 'audio' && !feature) throw new Error('Missing audio feature: ' + row.id);
      const values = [row.id,row.dataset,row.title,row.category,row.detail,row.location,row.kind,
        source.title,...(source.aliases || [])];
      if (feature) values.push(...feature.slice(0,6),feature[8],feature[9],...flatten(feature[10]),...flatten(featureText(feature)));
      const text = values.filter(v => v != null).map(String);
      return {row, feature, searchText: normalize([...text,...text.map(value => localize(value))].join(' '))};
    });
    const byId = new Map(entries.map(entry => [entry.row.id, entry]));
    const counts = Object.freeze({total: rows.length, audio: features.length,
      withoutAudio: rows.filter(row => row.mode !== 'audio').length,
      externalWithoutAudio: rows.filter(row => row.mode !== 'audio' && row.listeningUrl).length});
    return {entries, byId, datasets, counts,
      search(query, predicate = () => true) {
        const words = normalize(query).split(' ').filter(Boolean);
        return entries.filter(entry => predicate(entry) && words.every(word => entry.searchText.includes(word)));
      }
    };
  }
  window.nmpCatalogue = Object.freeze({normalize, create});
})();
