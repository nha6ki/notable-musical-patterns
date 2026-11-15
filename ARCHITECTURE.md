# Architecture and data boundaries

Notable Musical Patterns is a static, bilingual listening catalogue. There is no server-side API, package installation or build step. GitHub Pages serves the contents of `docs/`. The browser loads the catalogue, applies filters and starts the native audio player on demand.

| Path | Role |
| --- | --- |
| `docs/index.html`, `docs/en/index.html` | Japanese and English entry pages |
| `docs/guide/`, `docs/en/guide/` | Explanations, listening cues, evidence and source-specific terms |
| `docs/explore/`, `docs/en/explore/` | Search over playable clips and their concept associations |
| `docs/datasets/`, `docs/en/datasets/` | Source catalogue, including records without in-site audio |
| `docs/datasets/data.js`, `docs/datasets/supplement.js` | Public records and source metadata used by both catalogues |
| `docs/datasets/assets/` | Shared audio excerpts, not original datasets or complete recordings |
| `docs/pattern-taxonomy.js`, `docs/i18n.js` | Shared classification keys and language-switch behavior |
| `tools/`, `tests/`, `RELEASE-CHECKS.md` | Offline integrity checks, regression tests and release procedure |
| `catalogue.json`, `search.py`, `SOURCES.md`, `MANIFEST.sha256` | Historical eight-example release material; not input to the current website |

## How a record connects across pages

- **Catalogue records** use a stable ID and source-collection key. They distinguish in-site audio from reference-only entries. A reference-only entry may link to an external listening page; that link does not turn it into an in-site recording or guarantee a match to the exact performance.
- **Explore** uses the playable subset, with a many-to-many relationship between clips and labels. Verified representative links are scoped to a clip–label pair. Ranking does not remove other matching clips. Japanese filter keys remain canonical in both languages so that saved URLs continue to work.
- **The field guide** uses stable card anchors and backlinks to exact concept filters. A card can discuss more than one clip. The separately credited Chopin demonstration is in the guide, not the 2,983-clip catalogue.
- **Language switching** preserves the query and fragment. English display text is maintained separately from original IDs, rights fields and search keys. The two Explore pages embed equivalent public clip and credit payloads. A source update must preserve that parity.
- **Evidence is scoped.** A structural description can be based on a score or MIDI. A source annotation is not independent confirmation of the performance. Neither label is a claim that an entire piece, recording or category was verified.

## What can be reproduced here

The public checkout runs as a local website and can be checked offline with the Python standard library. It contains the public metadata and excerpts used by that website. Guide and Datasets playback use the checked-out assets; Explore uses the canonical published audio URLs, including in a local preview. It is not a reproducible pipeline for regenerating every excerpt from upstream sources: original source packages, private research records and some prior preparation artifacts are not part of this repository.

Keep editorial, data and asset updates distinct where possible. See [CONTRIBUTING.md](CONTRIBUTING.md) for the local workflow and [RELEASE-CHECKS.md](RELEASE-CHECKS.md) for the publication checks. See the [source-specific coverage and terms](docs/en/datasets/release-notes.html) before reusing an excerpt.
