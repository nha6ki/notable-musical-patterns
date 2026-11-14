# Notable Musical Patterns

実作品の音楽パターンを、作品・版・箇所から探せる検索ガイドです。バージョン0.1.0の**8例**は、対象箇所を楽譜と同じ版のMIDIで確認しています。曲全体を検証したわけではなく、楽譜から生成したMIDIは独立した演奏資料ではありません。

## 検索

フォルダを展開し、Python 3で次のように実行します。追加ライブラリやネット接続は不要です。

```sh
python3 search.py
python3 search.py バッハ --json
python3 search.py ハバネラ
python3 search.py --concept deceptive_cadence
```

検索語が複数ならAND検索、`--concept` は概念IDまたは日本語概念名の完全一致です。作品・版・箇所・確認範囲・出典と帰属を表示します。

`SOURCES.md` は出典一覧、`LICENSE` と `LICENSE-DATA.md` は、検索コードと独自メタデータ・文書の利用条件です。`MANIFEST.sha256` は、対応環境で `sha256sum -c MANIFEST.sha256` を実行すると検査できます。

楽譜、MIDI、録音、出典の図、既存データセットの抜粋は同梱していません。リンクを掲載しても、参照先素材の利用を許可することにはなりません。
