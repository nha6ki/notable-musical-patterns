# Contributing

Small, reviewable changes are welcome. Include the affected page or clip ID, expected and actual behavior, and verification steps. For a musical claim, identify the edition, interval or bars and the supporting source. Preserve separate descriptions for source labels, independent musical checks and rights.

## Local workflow

From the repository root, with Python 3.9 or later:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory docs
```

Open `http://127.0.0.1:8000/` for Japanese or `http://127.0.0.1:8000/en/` for English. Use a local web server rather than opening the HTML as a file. Before opening a pull request, run:

```sh
python3 tools/check_release.py --root .
python3 -m unittest discover -s tests -v
```

The public catalogue, audio files and pages are in `docs/`. Existing root-level archive files are not the current site. See the [architecture and data boundaries](ARCHITECTURE.md) for details.

## Review checklist

- Preserve IDs, deep links, query parameters and language switching. Check both languages for changes to navigation, captions, evidence or terms.
- For a new or revised excerpt, record the source and edition, the selected passage, attribution, terms and any processing. Do not add original datasets, recordings or unpublished material without the necessary rights and project approval.
- Keep existing legal and evidence caveats. A passing test does not establish copyright clearance or validate a musicological claim.
- Follow [RELEASE-CHECKS.md](RELEASE-CHECKS.md) for browser and production verification. Automated Python and GitHub checks do not replace listening, device checks or release review.
