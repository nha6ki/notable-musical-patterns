# Notable Musical Patterns: release verification

This procedure covers the website in `docs/`, not the archived eight-example v0.1.0 ZIP.

## Before publishing

1. Confirm the intended baseline and use a clean worktree. Review the diff for this candidate. Do not include private checkpoints, original source media, unrelated source files, or old archive changes.
2. Run `python3 tools/check_release.py --root .`. To verify a staged overlay without copying audio, run `python3 tools/check_release.py --root . --overlay /path/to/overlay`. Current expectations are 16 sources, 6,729 catalogue rows, 2,983 catalogue audio files and 105 labels/cards. The guide-only Chopin demonstration is a separately checked asset.
3. Run `python3 -m unittest discover -s tests -v` on the candidate. The tests cover previous credit omissions and misdirected evidence links; they do not validate rights. The repository workflow runs both Python commands without a Pages deployment step.
4. Serve `docs/` on loopback (for example `python3 -m http.server 8000 --bind 127.0.0.1 --directory docs`) and check in desktop Chrome; record browser version and test environment:
   - Home → Guide, Explore and Datasets; headings readable at desktop widths 1024 and 1440. Check a narrow viewport for horizontal overflow. Record physical devices and Safari separately from desktop viewport emulation.
   - Language switching: check all six page pairs. From a non-default catalogue or Explore query and a guide detail anchor, switch language and confirm the destination still uses the same filter or section. On English guide cards, verify the edition credit paragraph and evidence link render correctly.
   - Guide: open the bottom player from an example, play a different example and verify playback switches, then filter the active card out and verify playback stops; nonmatching category links are hidden. Open the optional grouped pattern jump, select a hidden card, and confirm it is shown and focused after navigation. Open a label's Explore link and return to the same guide card through the Explore result.
   - Explore: old `?label=...` links work. Filter, clear, reload, use Back/Forward, paginate with Enter, and verify displayed states, result order, page and URL agree. Verify focus after pagination and player close. Activate a result’s listening button with Enter and verify focus moves to the native audio controls without a second player button. A representative must remain first without dropping the other matches.
   - Datasets: filter by record ID, change display mode and page, verify shared URL/reload/back and forward. Play and stop an existing clip, use Enter on its listening button to focus the player, and verify focus remains useful if the source result has been filtered out. Check the source and credits, headings and links. Mutopia credits lead to the dataset filter and clearly identify their subset.
5. Record the release scope, final commit, validation outcome and limitations. Release and production changes require approval. Do not retag or replace the historical v0.1.0 archive.

## After publishing

Verify the deployment reports success at the exact commit and the public pages match that commit. Smoke-test the same navigation and playback on the actual URL. Automated playback checks advance the player even when muted; they are not a listening or rights review.
