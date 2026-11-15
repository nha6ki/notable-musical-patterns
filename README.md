# Notable Musical Patterns

## Current website and archived release

The current [GitHub Pages website](https://nha6ki.github.io/notable-musical-patterns/) is built from `docs/`. It contains **16 datasets/source groups, 6,729 search entries, 2,983 playable entries in the cross-source catalogue, and 105 listening-guide label cards**. These are not counts of unique compositions or independently verified musical concepts. See [publication scope and source-specific terms](docs/datasets/release-notes.html), the [listening guide](docs/guide/index.html), and the credits on each item. The website includes audio excerpts; the archive described below does not.

The root-level `catalogue.json`, `search.py`, and the eight-entry references below belong to the **v0.1.0 offline archive**, not the current website catalogue. The no-audio statements in the archive section apply only to that eight-example release.

`MANIFEST.sha256` is the **v0.1.0 archive manifest only**. It does not cover `docs/`, the current website, or its audio assets. Its checksums refer to the original files in that release; after documentation updates, verify it against the original v0.1.0 archive, not the revised working tree.

## Archived v0.1.0 offline guide

A small, searchable guide to musical patterns in specific editions of real works. Version 0.1.0 contains **eight examples**. Each points to the bars examined and to the score edition used in a local comparison with its corresponding MIDI.

This is a curated guide rather than a complete corpus. It includes canon, meter change, a habanera rhythm, a descending-fifth progression, a pedal point, a deceptive cadence, and repeated chord accompaniment. The checks apply only to the listed passages. Engraving-generated MIDI is not independent performance evidence.

### Search the eight-example archive offline

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
