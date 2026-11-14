"""Search the Notable Musical Patterns sample locally, without network access."""
import argparse
import json
from pathlib import Path
import unicodedata

def normalize(value):
    plain=[]
    for c in unicodedata.normalize('NFKD',value).casefold():
        if unicodedata.combining(c) and plain and plain[-1] in 'abcdefghijklmnopqrstuvwxyz':
            continue
        plain.append(c)
    return unicodedata.normalize('NFC',''.join(plain))

def find(cards, query, concept=None):
    terms=normalize(query).split()
    fields=('id','work','creator','concept_id','concept_ja','edition','location','aliases','finding')
    return [c for c in cards
        if (not concept or normalize(concept) in (normalize(c['concept_id']),normalize(c['concept_ja'])))
        and all(t in normalize(' '.join(c[k] for k in fields)) for t in terms)]

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('words',nargs='*')
    p.add_argument('--concept',help='Exact concept ID or Japanese concept label')
    p.add_argument('--json',action='store_true',help='Print matching records as JSON')
    args=p.parse_args(argv)
    table=json.loads(Path(__file__).with_name('catalogue.json').read_text(encoding='utf-8'))
    cards=find(table['cards'],' '.join(args.words),args.concept)
    if args.json:
        print(json.dumps({'count':len(cards),'results':cards},ensure_ascii=False,indent=2))
        return
    print(f'{len(cards)} match(es)')
    for c in cards:
        print(f"\n{c['id']} | {c['work']} | {c['concept_ja']} ({c['concept_id']})")
        print(f"  Composer: {c['creator']}")
        print(f"  Edition and location: {c['edition']} / {c['location']}")
        print(f"  Observation: {c['finding']}")
        print(f"  Scope: {c['scope_note_ja']}")
        print(f"  Source: {c['source_url']}")
        for u in c['additional_source_urls']: print(f"  Related reference: {u}")
        print(f"  Credit: {c['source_credit']}")
if __name__=='__main__':
    main()
