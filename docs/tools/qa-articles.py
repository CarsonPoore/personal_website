import sys, re, json, os, html
from html.parser import HTMLParser
ROOT='/Users/Carson/personal_website'
def text(s): return html.unescape(re.sub(r'<[^>]+>',' ',s)).split()
def norm(s): return ' '.join(html.unescape(re.sub(r'<[^>]+>','',s)).split())
def exists(href):
    p=href.split('#')[0].split('?')[0].rstrip('/')
    if p=='' : return True
    for c in (p+'.html', p+'/index.html', p):
        if os.path.isfile(ROOT+c): return True
    return False
for f in sys.argv[1:]:
    s=open(f).read(); errs=[]; info=[]
    t=re.search(r'<title>(.*?)</title>',s,re.S); title=html.unescape(t.group(1)) if t else ''
    if not t or len(title)>60: errs.append(f'title len {len(title)}')
    m=re.search(r'<meta name="description" content="(.*?)"',s); d=html.unescape(m.group(1)) if m else ''
    if not (140<=len(d)<=160): errs.append(f'meta len {len(d)}')
    if 'rel="canonical"' not in s: errs.append('no canonical')
    if len(re.findall(r'<h1[\s>]',s))!=1: errs.append('h1 count')
    art=re.search(r'<article.*?</article>',s,re.S); body=art.group(0) if art else s
    body_nojs=re.sub(r'<script.*?</script>|<style.*?</style>|<!--.*?-->','',body,flags=re.S)
    if '—' in body_nojs or '&mdash;' in body_nojs: errs.append('em dash in body')
    wc=len(text(body_nojs)); info.append(f'{wc}w')
    if not 1300<=wc<=2400: errs.append(f'wordcount {wc}')
    ext=set(re.findall(r'href="(https?://(?!carsonpoore\.com)[^"]+)"',body)); info.append(f'{len(ext)} ext links')
    if len(ext)<4: errs.append('ext sources <4')
    if not re.search(r'Last updated: (<time[^>]*>)?Oct 9, 2026',s): errs.append('byline date wording')
    if 'styles.css?v=20261008-5' not in s: errs.append('css version')
    faqs=None
    for blk in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S):
        try: j=json.loads(blk)
        except Exception as e: errs.append(f'JSON-LD parse: {e}'); continue
        g=j.get('@graph',[j])
        types=[x.get('@type') for x in g]
        for need in ('Article','FAQPage','BreadcrumbList','ProfessionalService'):
            if need not in types: errs.append(f'missing {need}')
        for x in g:
            if x.get('@type')=='Article' and x.get('dateModified','')[:10]!='2026-10-09': errs.append('dateModified')
            if x.get('@type')=='FAQPage': faqs=x['mainEntity']
    if faqs:
        vis=norm(s)
        for q in faqs:
            if norm(q['name']) not in vis: errs.append('FAQ q not visible: '+q['name'][:40])
            if norm(q['acceptedAnswer']['text'])[:80] not in vis: errs.append('FAQ a mismatch: '+q['name'][:40])
    bad=[h for h in set(re.findall(r'href="(/[^"]*)"',s)) if not exists(h)]
    if bad: errs.append('broken internal: '+', '.join(sorted(bad)))
    print(('PASS ' if not errs else 'FAIL ')+os.path.basename(f), ' '.join(info), '| '+'; '.join(errs) if errs else '')
