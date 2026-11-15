# Notable Musical Patterns

Explore musical patterns through short listening examples, explanations and traceable sources. Notable Musical Patterns connects a listening guide with a unified catalogue search and a directory of sources, so readers can move from a musical idea to an example and see what the evidence does, and does not, establish.

**[Open the English website](https://nha6ki.github.io/notable-musical-patterns/en/)** · [日本語サイト](https://nha6ki.github.io/notable-musical-patterns/) · [日本語 README](README.ja.md)

## Start exploring

- **[Field guide](https://nha6ki.github.io/notable-musical-patterns/en/guide/):** read explanations and listening notes for 105 labels.
- **[Search by Feature](https://nha6ki.github.io/notable-musical-patterns/en/explore/):** find listening examples by feature, work or source. Switch the availability selector to include external listening links or reference material. Supported representative examples rank ahead of other matches without replacing them.
- **[Search by Source](https://nha6ki.github.io/notable-musical-patterns/en/datasets/):** browse 16 source collections, inspect collection-level coverage and terms, and open the unified search scoped to a collection.

### Current coverage

| Measure | Count | What it counts |
| --- | ---: | --- |
| Datasets and source collections | 16 | Included source groups |
| Catalogue entries | 6,729 | Searchable records, not unique compositions |
| Entries with on-site audio | 2,983 | Playable entries in the cross-source catalogue |
| Entries without on-site audio | 3,746 | Source-only records, including external listening links |
| External listening links | 578 | A subset of the 3,746 records above |
| Guide cards | 105 | Explanatory labels, not 105 independently verified concepts |

Counts describe this website, not the complete holdings of every source. For example, 1,168 Mutopia excerpts reference 1,094 editions; Weimar and JSMel are represented by overview records rather than their individual source records. The guide also has a separately checked Chopin demonstration outside the cross-source audio count.

## Evidence and reuse

A dataset label, a local observation in an excerpt and a verified named pattern are different kinds of evidence. Score-generated MIDI is not independent performance evidence. External listening links may refer to another performance, and access can depend on region or account.

Read the [publication scope and source-specific terms](https://nha6ki.github.io/notable-musical-patterns/en/datasets/release-notes.html) and the credits on each entry before reuse. The repository’s licenses do **not** grant blanket rights to recordings, scores, underlying works or third-party datasets.

- [MIT license](LICENSE): project code.
- [Data and documentation license](LICENSE-DATA.md): project-authored material, only to the extent that the licensor holds the applicable rights.
- Audio and third-party material: the individual source and item-level terms apply. A reference link is not permission to reuse its target.

## Run locally

The current website is static HTML, CSS and JavaScript under `docs/`. It needs no application server or build step. Use Python 3.9 or later to serve it locally and run the dependency-free checks; no pip or npm installation is needed. The repository includes audio assets, so allow disk space for a full checkout.

From the repository root:

```sh
git clone https://github.com/nha6ki/notable-musical-patterns.git
cd notable-musical-patterns
python3 -m http.server 8000 --bind 127.0.0.1 --directory docs
```

Open <http://127.0.0.1:8000/en/> for English or <http://127.0.0.1:8000/> for Japanese. Use an HTTP server rather than opening the HTML files directly. Stop the server with Ctrl+C. External source and listening links still require internet access. Search by Feature plays audio from the canonical public site even on a local preview; Read the Guide uses the checked-out excerpts.

In another terminal, from the same repository root:

```sh
python3 tools/check_release.py --root .
python3 -m unittest discover -s tests -v
```

The release checker reads local files without network access or file writes; the second command runs the unit tests. It checks structural release requirements, not listening quality, legal clearance or browser behavior. Follow [RELEASE-CHECKS.md](RELEASE-CHECKS.md) for the separate browser and publication checks. Serving or editing files locally does not publish them.

## Repository map and contributions

- `docs/`: the GitHub Pages website, shared data and audio; English pages are under `docs/en/`.
- `tools/check_release.py`: static release checks.
- [ARCHITECTURE.md](ARCHITECTURE.md): site structure, data flow and maintenance boundaries.
- [CONTRIBUTING.md](CONTRIBUTING.md): contribution workflow and review expectations.
- [RELEASE-CHECKS.md](RELEASE-CHECKS.md): pre-publication and post-publication verification.
- `catalogue.json`, `search.py`, [SOURCES.md](SOURCES.md) and `MANIFEST.sha256`: the historical eight-example archive described below, **not** the current website catalogue.

Keep contributions focused, preserve source and rights information, and distinguish content corrections from publication approval. See the contribution guide before changing data or adding media.

## Historical v0.1.0 archive

The [v0.1.0 release](https://github.com/nha6ki/notable-musical-patterns/releases/tag/v0.1.0) is an **eight-example offline guide**. It is not a snapshot of the current 6,729-entry website. Its checks concern specified passages and editions, not entire works. That archive contains metadata and search code, but no scores, MIDI, recordings, source figures or dataset extracts. The current website, by contrast, includes audio excerpts.

Python 3 is sufficient to search the eight-example archive; no files are downloaded or uploaded:

```sh
python3 search.py
python3 search.py Bach --json
python3 search.py --concept deceptive_cadence
```

Multiple search words use AND matching. The concept filter accepts an exact identifier or Japanese label. JSON results include edition, location, evidence, sources and credits.

`MANIFEST.sha256` applies **only to the original v0.1.0 archive**. It does not cover `docs/`, the current website or its audio. Verify it against the original extracted release, not this revised working tree: documentation changes can legitimately differ from the historical hashes.
