# Notable Musical Patterns

A small, searchable guide to musical patterns in specific editions of real works. Version 0.1.0 contains **eight examples**. Each points to the bars examined and to the score edition used in a local comparison with its corresponding MIDI.

This is a curated guide rather than a complete corpus. It includes canon, meter change, a habanera rhythm, a descending-fifth progression, a pedal point, a deceptive cadence, and repeated chord accompaniment. The checks apply only to the listed passages. Engraving-generated MIDI is not independent performance evidence.

## Search offline

Unzip the archive and open a terminal in the resulting folder. Python 3 is the only requirement. No files are downloaded or uploaded.

```sh
python3 search.py
python3 search.py Bach --json
python3 search.py --concept deceptive_cadence
python3 search.py ハバネラ --json
```

Multiple words use AND matching. The concept filter uses an exact identifier or Japanese label. JSON output includes edition, location, evidence, source links and credits.

- `catalogue.json`: example metadata.
- `SOURCES.md`: edition and analysis references.
- `LICENSE` and `LICENSE-DATA.md`: terms for search code and original metadata/documentation, respectively.
- `MANIFEST.sha256`: integrity hashes (verify with `sha256sum -c MANIFEST.sha256` where available).

No score, MIDI, recording, source figure or dataset extract is included. Links are references, not grants of rights in the linked material.
