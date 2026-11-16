# Collection and selection methodology

[日本語の方法記録](METHODOLOGY.ja.md)

Notable Musical Patterns is a listening catalogue that connects a specific musical feature to a passage and the evidence available for that passage. This document records how candidates were collected, what the site chose to publish, and what its labels mean. For the implementation, see [Architecture](ARCHITECTURE.md).

## From a musical feature to a candidate

1. **Define the feature before searching.** Consult music-theory and specialist references, determine which notes, beats or voice relationships would demonstrate the feature, and record how narrowly it applies. Named patterns, descriptions of local structures and labels supplied by a source are not equivalent. The popularity of a work or performer was not a selection requirement.
2. **Look across source types.** Candidate sources included published score collections, symbolic data such as MIDI, recordings with beat or chord annotations, and bibliographic catalogues. Collection-wide screening and the manual investigation of textbook or research examples were separate activities. A candidate could be recorded privately even when reuse terms were unresolved; that did not make it eligible for publication.
3. **Identify the edition, recording and passage.** Keep the source collection and item identifier, edition or recording, location, supporting reference and review status. Do not conflate items by title alone. Count source items, published catalogue records and clip–feature associations separately. Automated candidates are not promoted to verified examples without supporting evidence.

## What the site publishes

| Gate | Decision |
| --- | --- |
| Source and passage | Establish which edition, recording or passage is represented, and distinguish an original recording excerpt from a new synthesis or a source annotation. |
| Rights and attribution | Check commercial use, modification and redistribution as applicable to the material in question. Record source, credit, license and changes. A license for annotations or a digital edition does not automatically clear the underlying work, another edition or a recording. |
| On-site audio | Include a short clip when the relevant source and interval can be identified and the applicable publication conditions are documented. Do not host audio with unresolved rights or provenance. |
| Without on-site audio | Where appropriate, retain a description, citation, source reference or external listening link. An external link is not an embedded clip, a guarantee of playback, or proof of an exact performance match. |

For example, **1,168 Mutopia clips** refer to **1,094 listed editions** and are synthesized from checked score/MIDI passages, not recordings of performances. **Candombe** clips use excerpts from distributed ensemble recordings with beat annotations. **Groove MIDI Dataset** clips use matched excerpts from the official electronic drum output, not an independent synthesis of the MIDI. **O’Neill** provides bibliographic and original-source references, without hosted synthesis. **McGill Billboard** distinguishes its annotations from recording rights and includes some external listening links. **Weimar Jazz Database** and **JSMel** are represented by overview records, not item-level imports.

See [coverage and usage terms by collection](https://nha6ki.github.io/notable-musical-patterns/en/datasets/release-notes.html) for the complete published scope. Those counts describe this site, not the total holdings of the upstream sources. Coverage reflects availability, reuse conditions and the evidence that could be checked; this is not a representative sample for estimating how often musical patterns occur.

## What the labels mean

- **Structural description**: notes, onsets or other local features are described from a score, MIDI or comparable evidence. The site distinguishes carried-forward descriptions from fresh passage-level checks. A structural label is not an independent listening review; score-generated MIDI is not evidence of how someone performed the work.
- **Source annotation**: a supplied meter, beat marker, performance-chart instruction or other annotation is reported as such. For instance, a Freesound uploader’s meter label is not presented as an independent analysis of the performance.
- **Unclassified**: no feature is currently assigned to a playable clip under the project’s criteria. It does not mean the clip has no patterns. It is separate from an entry without on-site audio.
- **Representative example**: applies to a clip–feature pair. It can promote an example for that feature without suppressing other matches. A clip can have several labels, and 105 explanatory cards do not mean 105 independently verified named patterns.

## Reproducibility and release history

The public repository contains the deployed metadata and excerpts, bilingual pages and verification tools. The site's structural checks, local serving and release procedures can be repeated. Automated checks do not establish listening quality or legal clearance, and the public checkout does not contain the upstream source packages, private research records or a complete pipeline for regenerating all excerpts.

[v0.1.0](https://github.com/nha6ki/notable-musical-patterns/releases/tag/v0.1.0) is the historical eight-example metadata archive, without audio. [v1.0.0](https://github.com/nha6ki/notable-musical-patterns/releases/tag/v1.0.0) is the formally pinned bilingual site release. These are distinct from later editorial revisions on the live site.

[Architecture](ARCHITECTURE.md) · [Release verification](RELEASE-CHECKS.md)
