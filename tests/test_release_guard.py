"""Offline regression guards for bilingual NMP guide releases.

Run from the repository root: python3 -m unittest discover -s tests -v
To audit another checkout or a pinned revision, set NMP_REPO_ROOT and optionally
NMP_RELEASE_REF. A revision uses read-only `git show`; audio is never copied or
opened. These are structural regression checks, not musical/legal validation.
"""
import collections
import html
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import posixpath
import re
import subprocess
import types
import unittest
from urllib.parse import parse_qs, unquote, urlsplit

ROOT = Path(os.environ.get('NMP_REPO_ROOT', Path(__file__).resolve().parents[1]))
REF = os.environ.get('NMP_RELEASE_REF')


def read_release(path):
    if REF:
        return subprocess.check_output(
            ['git', '-C', str(ROOT), 'show', REF + ':' + path], text=True)
    return (ROOT / path).read_text(encoding='utf-8')


def load_checker():
    module = types.ModuleType('nmp_check_release_under_test')
    code = read_release('tools/check_release.py')
    exec(compile(code, 'tools/check_release.py', 'exec'), module.__dict__)
    return module


class Cards(HTMLParser):
    """Minimal semantic projection; no formatting-sensitive paragraph regexes."""
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.cards = []
        self.card = None
        self.cite_depth = 0
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'article' and 'pattern-card' in a.get('class', '').split():
            self.card = {'id': a.get('id'), 'credits': [], 'links': [],
                         'backlinks': [], 'audio': []}
            self.cards.append(self.card)
        if self.card is None:
            return
        if tag == 'details':
            if self.cite_depth:
                self.cite_depth += 1
            elif 'cite' in a.get('class', '').split():
                self.cite_depth = 1
        if tag == 'a' and 'href' in a:
            self.card['links'].append(a['href'])
            if 'card-explore' in a.get('class', '').split():
                self.card['backlinks'].append(a['href'])
        if tag == 'audio':
            self.card['audio'].append(a.get('src', ''))

    def handle_endtag(self, tag):
        if tag == 'details' and self.cite_depth:
            self.cite_depth -= 1
        if tag == 'article':
            self.card = None
            self.cite_depth = 0

    def handle_data(self, text):
        if self.card is not None and self.cite_depth:
            self.card['credits'].append(text)


def public_domain_credit_issues(ja_source, en_source):
    """A source edition's PD/attribution paragraph must not become location text.

    This checks retention of a displayed statement, not whether that statement
    is legally sufficient. Stable source-name probes cover the three known
    regressions; the PD-presence check covers all guide cards.
    """
    ja, en = Cards(ja_source).cards, Cards(en_source).cards
    by_en = {c['id']: c for c in en}
    issues = []
    probes = {
        'p-091': ('Allen Garvin', 'Bach-Gesellschaft', '2008/06/15-58'),
        'p-101': ('Edvard Grieg', 'Anonymous', 'Peters', '1891'),
        'p-102': ('Mozart', 'Neue Mozartausgabe', 'Erik Sandberg', 'CC0'),
    }
    for card in ja:
        other = by_en.get(card['id'])
        if other is None:
            issues.append('missing English card: ' + str(card['id']))
            continue
        source_credit = ' '.join(card['credits'])
        target_credit = ' '.join(other['credits'])
        if re.search(r'public[ -]domain', source_credit, re.I):
            if not re.search(r'public[ -]domain', target_credit, re.I):
                issues.append('missing Public Domain statement: ' + card['id'])
        for token in probes.get(card['id'], ()):
            if token in source_credit and token not in target_credit:
                issues.append('missing attribution token: ' + card['id'] + ': ' + token)
        if card['id'] == 'p-102' and 'CC0' in source_credit:
            # Preserve the qualification, not just the token "CC0".
            if not re.search(r'not\s+(?:a\s+)?CC0', target_credit, re.I):
                issues.append('missing non-CC0 qualification: p-102')
            if not re.search(r'(?:not|nor).*?(?:universal|blanket).*?legal clearance',
                             target_credit, re.I | re.S):
                issues.append('missing legal-clearance qualification: p-102')
    return issues


def english_guide_deep_link_issues(source):
    """Self-references must remain on the English guide and name a real card."""
    cards = Cards(source).cards
    ids = set(re.findall(r'\bid=[\"\']([^\"\']+)[\"\']', source))
    issues = []
    for card in cards:
        for href in card['links']:
            u = urlsplit(html.unescape(href))
            if u.netloc:
                if u.netloc != 'nha6ki.github.io':
                    continue
                if not u.path.startswith('/notable-musical-patterns/'):
                    continue
                path = u.path[len('/notable-musical-patterns/'):]
            else:
                path = posixpath.normpath(posixpath.join('en/guide', unquote(u.path))) if u.path else 'en/guide/index.html'
            path = path.rstrip('/')
            if path not in ('guide', 'guide/index.html', 'en/guide', 'en/guide/index.html'):
                continue
            if not path.startswith('en/guide'):
                issues.append('Japanese guide destination: ' + card['id'] + ': ' + href)
            if unquote(u.fragment) not in ids:
                issues.append('missing or invalid guide fragment: ' + card['id'] + ': ' + href)
    return issues


def fixture(card_id='p-091', credit='Public Domain; Allen Garvin; Bach-Gesellschaft; 2008/06/15-58', link='#p-091'):
    return ('<article class="pattern-card" id="' + card_id + '"><h4>Title</h4>'
            '<details class="cite"><summary>Evidence</summary><p>' + credit +
            '</p><a href="' + link + '">Additional evidence</a></details>'
            '<a class="card-explore" href="../explore/index.html?label=A%26B">More</a>'
            '<audio src="../../datasets/assets/example.wav" preload="none"></audio></article>')


class CheckerParserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.checker = load_checker()

    def test_real_checker_extracts_cards_and_backlinks(self):
        page = self.checker.Page(fixture())
        self.assertEqual(page.card_ids, ['p-091'])
        self.assertEqual(page.cards[0]['labels'], ['Title'])
        self.assertEqual(parse_qs(urlsplit(page.cards[0]['backlinks'][0]).query), {'label': ['A&B']})
        self.assertEqual(page.audio[0]['preload'], 'none')

    def test_checker_handles_class_tokens_entities_and_nested_heading(self):
        source = fixture().replace('class="pattern-card"', 'class="featured pattern-card"').replace('<h4>Title</h4>', '<h4>A &amp; <em>B</em></h4>')
        page = self.checker.Page(source)
        self.assertEqual(page.labels, ['A & B'])
        self.assertEqual(page.card_ids, ['p-091'])

    def test_checker_retains_duplicate_ids_for_detection(self):
        page = self.checker.Page(fixture() + fixture())
        self.assertEqual(page.ids.count('p-091'), 2)
        self.assertEqual(len(page.card_ids), 2)


class RegressionFixtureTests(unittest.TestCase):
    def test_valid_credit_passes(self):
        self.assertEqual(public_domain_credit_issues(fixture(), fixture()), [])

    def test_location_cannot_replace_credit(self):
        errors = public_domain_credit_issues(fixture(), fixture(credit='Bars 1–2, right hand only'))
        self.assertIn('missing Public Domain statement: p-091', errors)
        self.assertTrue(any('Allen Garvin' in x for x in errors))

    def test_pd_label_without_attribution_fails(self):
        errors = public_domain_credit_issues(fixture(), fixture(credit='Public Domain'))
        self.assertTrue(any('missing attribution token' in x for x in errors))

    def test_non_cc0_caveat_is_required(self):
        credit = 'Public Domain; Mozart; Neue Mozartausgabe; Erik Sandberg. Not CC0 or universal legal clearance.'
        ja = fixture('p-102', credit, '#p-102')
        self.assertEqual(public_domain_credit_issues(ja, ja), [])
        weakened = fixture('p-102', 'Public Domain; Mozart; Neue Mozartausgabe; Erik Sandberg; CC0.', '#p-102')
        self.assertTrue(any('qualification' in x for x in public_domain_credit_issues(ja, weakened)))

    def test_existing_english_fragment_passes(self):
        self.assertEqual(english_guide_deep_link_issues(fixture()), [])

    def test_guide_top_link_is_not_a_deep_link(self):
        self.assertTrue(english_guide_deep_link_issues(fixture(link='./')))

    def test_wrong_language_link_fails_even_with_valid_fragment(self):
        errors = english_guide_deep_link_issues(fixture(link='../../guide/index.html#p-091'))
        self.assertTrue(any('Japanese guide destination' in x for x in errors))

    def test_absolute_english_deep_link_passes(self):
        href = 'https://nha6ki.github.io/notable-musical-patterns/en/guide/#p-091'
        self.assertEqual(english_guide_deep_link_issues(fixture(link=href)), [])

    def test_unknown_fragment_fails(self):
        self.assertTrue(english_guide_deep_link_issues(fixture(link='#p-missing')))

    def test_external_source_is_not_mistaken_for_local_guide(self):
        self.assertEqual(english_guide_deep_link_issues(fixture(link='https://example.org/guide/')), [])


class ReleaseGuideTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ja = read_release('docs/guide/index.html')
        cls.en = read_release('docs/en/guide/index.html')
        cls.checker = load_checker()

    def test_all_bilingual_cards_audio_and_exact_filters_match(self):
        ja, en = Cards(self.ja).cards, Cards(self.en).cards
        self.assertEqual(len(ja), 105)
        self.assertEqual([c['id'] for c in ja], [c['id'] for c in en])
        self.assertEqual(len({c['id'] for c in ja}), 105)
        def media(src):
            path = urlsplit(src).path
            if 'datasets/assets/' in path:
                return path[path.index('datasets/assets/'):]
            if path.startswith('../../guide/'):
                return path[len('../../guide/'):]
            return path
        for a, b in zip(ja, en):
            with self.subTest(card=a['id']):
                self.assertEqual(len(a['backlinks']), 1)
                self.assertEqual(a['backlinks'], b['backlinks'])
                self.assertEqual(list(map(media, a['audio'])), list(map(media, b['audio'])))

    def test_credit_statements_and_known_attributions_survive_localization(self):
        self.assertEqual(public_domain_credit_issues(self.ja, self.en), [])

    def test_english_guide_evidence_links_stay_localized_and_anchored(self):
        self.assertEqual(english_guide_deep_link_issues(self.en), [])

    def test_each_prior_attribution_regression_is_rejected(self):
        for card_id in ('p-091', 'p-101', 'p-102'):
            with self.subTest(card=card_id):
                pattern = r'(<article class="pattern-card" id="' + card_id + r'".*?</article>)'
                match = re.search(pattern, self.en, re.S)
                self.assertIsNotNone(match)
                card = match.group(1)
                mutated, count = re.subn(r'<p>Public Domain.*?</p>',
                                        '<p>Bars 1–2, right hand only</p>', card,
                                        count=1, flags=re.S)
                self.assertEqual(count, 1, 'expected actual attribution paragraph')
                source = self.en[:match.start()] + mutated + self.en[match.end():]
                issues = public_domain_credit_issues(self.ja, source)
                self.assertIn('missing Public Domain statement: ' + card_id, issues)

    def test_each_prior_evidence_top_link_regression_is_rejected(self):
        for card_id in ('p-056', 'p-060', 'p-072', 'p-076', 'p-077', 'p-078', 'p-079'):
            with self.subTest(card=card_id):
                pattern = r'(<article class="pattern-card" id="' + card_id + r'".*?</article>)'
                match = re.search(pattern, self.en, re.S)
                self.assertIsNotNone(match)
                mutated, count = re.subn(r'href="#[^"]+"', 'href="../../guide/"',
                                        match.group(1), count=1)
                self.assertEqual(count, 1, 'expected a restored local evidence anchor')
                source = self.en[:match.start()] + mutated + self.en[match.end():]
                issues = english_guide_deep_link_issues(source)
                self.assertTrue(any('Japanese guide destination: ' + card_id in e for e in issues))
                self.assertTrue(any('missing or invalid guide fragment: ' + card_id in e for e in issues))

    def test_all_guide_count_labels_reconcile_with_search_data(self):
        search = read_release('docs/explore/index.html')
        match = re.search(r'<script\b[^>]*\bid="data"[^>]*>(.*?)</script>', search, re.S)
        self.assertIsNotNone(match)
        rows = json.loads(match.group(1))
        counts = collections.Counter()
        for row in rows:
            counts.update({association[0] for association in row[10]})
        for lang, source in [('ja', self.ja), ('en', self.en)]:
            links = re.findall(r'<a class="card-explore" href="([^"]+)">(.*?)</a>', source, re.S)
            self.assertEqual(len(links), 105)
            for href, text in links:
                label = parse_qs(urlsplit(html.unescape(href)).query)['label'][0]
                number = re.findall(r'[0-9][0-9,]*', text)[-1]
                with self.subTest(lang=lang, label=label):
                    self.assertEqual(int(number.replace(',', '')), counts[label])


if __name__ == '__main__':
    unittest.main()
