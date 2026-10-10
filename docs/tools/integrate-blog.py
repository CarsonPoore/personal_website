#!/usr/bin/env python3
"""Sitewide blog integration (idempotent): Resources nav dropdown, mobile menu Articles link,
footer Articles column -> picks + All articles, article breadcrumbs -> /articles, #tools anchor."""
import glob, os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
os.chdir(ROOT)
files = [f for f in glob.glob('**/*.html', recursive=True)
         if not f.startswith(('node_modules', 'motion', 'dist', 'docs', 'screenshots', 'src', 'uploads'))]

NAV_OLD = '      <a href="/resources">Resources</a>\n      <a href="/about">About</a>'
NAV_NEW = ('      <div class="nav__item has-drop">\n'
           '        <a href="/resources" class="nav__top">Resources</a>\n'
           '        <div class="nav__drop" aria-label="Resources">\n'
           '          <a href="/articles">Articles</a>\n'
           '          <a href="/resources#tools">Free tools</a>\n'
           '        </div>\n'
           '      </div>\n'
           '      <a href="/about">About</a>')
MOB_OLD = '  <a href="/resources">Resources</a>\n  <a href="/about">About</a>'
MOB_NEW = '  <a href="/resources">Resources</a>\n  <a class="mobile-menu__sub" href="/articles">Articles</a>\n  <a href="/about">About</a>'
FOOT_NEW = '''<h4>Articles</h4>
        <ul>
          <li><a href="/articles/small-business-website-cost">What a website costs</a></li>
          <li><a href="/articles/get-recommended-by-chatgpt">Getting found in ChatGPT</a></li>
          <li><a href="/articles/small-business-marketing-budget">What marketing should cost</a></li>
          <li><a href="/articles/fractional-cmo-cost">Fractional CMO cost</a></li>
          <li><a href="/articles/how-to-get-more-google-reviews">Getting more Google reviews</a></li>
          <li><a href="/articles">All articles &rarr;</a></li>
        </ul>'''
changed = 0
for f in files:
    s = open(f, encoding='utf-8').read(); o = s
    s = s.replace(NAV_OLD, NAV_NEW).replace(MOB_OLD, MOB_NEW)
    s = re.sub(r'<h4>Articles</h4>\s*<ul>.*?</ul>', FOOT_NEW, s, count=1, flags=re.S)
    if f.startswith('articles/') and not f.endswith('index.html'):
        s = s.replace('<li><a href="/resources">Resources</a></li>', '<li><a href="/articles">Articles</a></li>')
        s = re.sub(r'("name":\s*"Resources",\s*"item":\s*"https://carsonpoore\.com/resources")',
                   '"name": "Articles", "item": "https://carsonpoore.com/articles"', s)
        s = re.sub(r'("item":\s*"https://carsonpoore\.com/resources",\s*"name":\s*"Resources")',
                   '"item": "https://carsonpoore.com/articles", "name": "Articles"', s)
    if f == 'resources.html':
        s = s.replace('  <!-- TOOLS -->\n  <section class="section">', '  <!-- TOOLS -->\n  <section class="section" id="tools">')
    if s != o:
        open(f, 'w', encoding='utf-8').write(s); changed += 1
print(f'{changed} files updated of {len(files)}')
