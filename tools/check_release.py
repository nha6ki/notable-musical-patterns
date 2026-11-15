#!/usr/bin/env python3
"""Dependency-free static NMP release check. No network access or file writes.
Run from repository root, or use --root PATH [--overlay PATCH_DIRECTORY].
Overlay files replace corresponding repository files; missing overlay assets fall
back to the repository. This is not a listening, licensing, or browser test.
"""
import argparse
import collections
import html
from html.parser import HTMLParser
import json
from pathlib import Path, PurePosixPath
import re
import sys
from urllib.parse import unquote, urlsplit, parse_qs

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.ids=[]; self.links=[]; self.resources=[]; self.audio=[]
        self.labels=[]; self.card_ids=[]; self.capture=False; self.buf=[]
        self.cards=[]; self.current_card=None
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        if tag=='a' and 'href' in a:
            self.links.append(a['href'])
            if self.current_card is not None and 'card-explore' in a.get('class','').split():
                self.current_card['backlinks'].append(a['href'])
        if tag in ('audio','script','img','source') and a.get('src'): self.resources.append(a['src'])
        if tag=='link' and a.get('href'): self.resources.append(a['href'])
        if tag=='audio': self.audio.append(a)
        if tag=='article' and 'pattern-card' in a.get('class','').split():
            self.card_ids.append(a.get('id'))
            self.current_card={'id':a.get('id'),'labels':[],'backlinks':[]}
            self.cards.append(self.current_card)
        if tag=='h4': self.capture=True; self.buf=[]
    def handle_data(self, text):
        if self.capture:self.buf.append(text)
    def handle_endtag(self, tag):
        if tag=='h4' and self.capture:
            self.labels.append(''.join(self.buf)); self.capture=False
            if self.current_card is not None:self.current_card['labels'].append(''.join(self.buf))
        if tag=='article':self.current_card=None

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--root',type=Path,default=Path.cwd())
    ap.add_argument('--overlay',type=Path)
    args=ap.parse_args(); root=args.root.resolve(); overlay=args.overlay.resolve() if args.overlay else None
    errors=[]; checks=0
    def check(ok,msg):
        nonlocal checks
        checks+=1
        if not ok:errors.append(msg)
    def physical(rel):
        if overlay and (overlay/rel).is_file():return overlay/rel
        return root/rel
    def read(rel):return physical(rel).read_text(encoding='utf-8')
    def jsdata(rel):
        s=read(rel);return json.loads(s[s.index('{'):].rstrip(';\r\n '))
    def block(source,key):
        m=re.search(r'<script\b[^>]*\bid=["\']'+re.escape(key)+r'["\'][^>]*>(.*?)</script>',source,re.S)
        if not m:raise ValueError('missing JSON block '+key)
        return json.loads(m.group(1))
    def local_target(origin,url):
        u=urlsplit(html.unescape(url))
        if u.scheme or u.netloc:return None
        p=(root/origin).parent/unquote(u.path) if u.path else root/origin
        p=p.resolve()
        if not p.is_relative_to(root):return ('INVALID',u.fragment)
        rel=p.relative_to(root)
        if (root/rel).is_dir() or (overlay and (overlay/rel).is_dir()):rel=rel/'index.html'
        return (rel,unquote(u.fragment))
    def audio_key(url):
        path=unquote(urlsplit(url).path)
        # Stable asset identity regardless of GitHub Pages URL versus relative URL.
        marker='datasets/assets/'
        if marker in path:return 'docs/'+path[path.index(marker):]
        if path.startswith('assets/'):return 'docs/datasets/'+path
        return None
    try:
        ds=jsdata('docs/datasets/data.js');sp=jsdata('docs/datasets/supplement.js')
        datasets=ds['datasets']+sp['datasets'];rows=ds['rows']+sp['rows'];audio=[r for r in rows if r['mode']=='audio']
        check(len(datasets)==16,'dataset/source-group count must be 16')
        check(len({d['id'] for d in datasets})==16,'duplicate dataset IDs')
        check(len(rows)==6729,'search row count must be 6729')
        check(len({r['id'] for r in rows})==6729,'duplicate search IDs')
        check(all(r['dataset'] in {d['id'] for d in datasets} for r in rows),'unknown dataset references')
        check(len(audio)==2983,'audio row count must be 2983')
        keys=[audio_key(r['file']) for r in audio]
        check(None not in keys and len(set(keys))==2983,'invalid or duplicate audio asset references')
        for r,k in zip(audio,keys):
            check(bool(k) and physical(k).is_file(),'missing audio: '+r['id'])
            check(all(r.get(f) for f in ('license','credit','source')),'missing rights/source: '+r['id'])
        actual={str(p.relative_to(root)) for p in (root/'docs/datasets/assets').rglob('*') if p.is_file()}
        if overlay:actual|={str(p.relative_to(overlay)) for p in (overlay/'docs/datasets/assets').rglob('*') if p.is_file()}
        check(actual==set(keys),'audio directory has orphan or untracked assets')
        exp=read('docs/explore/index.html');erows=block(exp,'data');credits=block(exp,'credits');by={r['id']:r for r in audio}
        check(len(erows)==2983 and len({r[0] for r in erows})==2983,'Explore row count/uniqueness')
        check({r[0] for r in erows}==set(by),'Explore/audio IDs differ')
        check(set(credits)==set(by),'Explore credits IDs differ')
        for r in erows:
            base=by.get(r[0])
            if not base:continue
            check(audio_key(r[6])==audio_key(base['file']),'Explore audio mismatch: '+r[0])
            check(credits.get(r[0])==[base['license'],base['credit']],'Explore rights mismatch: '+r[0])
        taxonomy=jsdata('docs/pattern-taxonomy.js')
        check(len(taxonomy)==105,'taxonomy label count must be 105')
        labels={association[0] for r in erows for association in r[10]}
        check(labels==set(taxonomy),'Explore label set differs from taxonomy')
        guide=Page(read('docs/guide/index.html'))
        check(len(guide.card_ids)==105 and len(set(guide.card_ids))==105 and all(guide.card_ids),'guide card count/anchor uniqueness')
        check(collections.Counter(guide.labels)==collections.Counter(taxonomy.keys()),'guide exact label set differs from taxonomy')
        # Check semantics, not merely existence: an anchor swap between two
        # valid cards must fail, as must a backlink to the wrong filter label.
        anchor_match=re.search(r'\bconst\s+guideAnchors\s*=\s*',exp)
        if not anchor_match:raise ValueError('Explore guideAnchors mapping missing')
        anchor_map,_=json.JSONDecoder().raw_decode(exp[anchor_match.end():])
        check(isinstance(anchor_map,dict),'Explore guideAnchors must be an object')
        actual_map={}
        for card in guide.cards:
            check(len(card['labels'])==1,'guide card needs exactly one heading: '+str(card['id']))
            if len(card['labels'])!=1:continue
            label=card['labels'][0];actual_map[label]=card['id']
            check(len(card['backlinks'])==1,'guide card needs exactly one Explore backlink: '+label)
            for url in card['backlinks']:
                target=local_target('docs/guide/index.html',url)
                check(target is not None and str(target[0])=='docs/explore/index.html','wrong Explore backlink destination: '+label)
                query=parse_qs(urlsplit(url).query,keep_blank_values=True)
                check(query=={'label':[label]},'wrong Explore backlink filter: '+label)
        check(anchor_map==actual_map,'Explore guideAnchors must exactly map each label to its own guide card')
        check(set(actual_map)==set(taxonomy),'guide mapping must cover every taxonomy label')
        check(len(set(anchor_map.values()))==len(anchor_map),'Explore guideAnchors contains duplicate targets')
        for a in guide.audio:
            key=audio_key(a.get('src',''))
            target=local_target('docs/guide/index.html',a.get('src',''))
            # The original guide includes a separately credited Chopin #468 clip,
            # outside the 2,983-row cross-dataset catalogue. Keep it explicit.
            extra=(target is not None and str(target[0])=='docs/guide/audio/chopin-deceptive-mm20-21.wav')
            check(key in set(keys) or extra,'unregistered guide audio: '+a.get('src',''))
            check(a.get('preload')=='none','guide audio must not preload')
        paths={str(p.relative_to(root)) for p in (root/'docs').rglob('*.html')}
        if overlay:paths|={str(p.relative_to(overlay)) for p in (overlay/'docs').rglob('*.html')}
        pages={p:Page(read(p)) for p in paths}
        for origin,page in pages.items():
            check(len(page.ids)==len(set(page.ids)),'duplicate HTML ids: '+origin)
            for url in page.links+page.resources:
                target=local_target(origin,url)
                if target is None:continue
                rel,fragment=target
                check(rel!='INVALID' and physical(rel).is_file(),'missing local link/resource: '+origin+' -> '+url)
                if str(rel) in pages and fragment:
                    check(fragment in pages[str(rel)].ids,'missing local anchor: '+origin+' -> '+url)
        print('Static checks: {}; failures: {}'.format(checks,len(errors)))
        for e in errors:print('FAIL:',e)
        print('Scope: counts, catalogue/asset/credits alignment, guide labels/anchors, local HTML links/resources. No HTTP, browser, playback, musical or legal validation.')
        return 1 if errors else 0
    except (OSError,ValueError,KeyError,TypeError,IndexError) as e:
        print('ERROR: invalid or incomplete release inputs:',e,file=sys.stderr);return 2
if __name__=='__main__':sys.exit(main())
