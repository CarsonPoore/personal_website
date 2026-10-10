#!/usr/bin/env python3
"""Build /articles/index.html (the blog hub) from the article files.

Run from anywhere:  python3 docs/tools/build-blog-index.py
Topics and order live in TOPICS below. Articles that don't exist yet are skipped,
so the hub can be rebuilt as new articles land. Nav/footer chrome is copied from
resources.html so the hub never drifts from the rest of the site.
"""
import html, json, math, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SITE = 'https://carsonpoore.com'

TOPICS = [
    ('local', 'Local search &amp; Google', 'Getting found on Google, in Maps, and in AI answers when someone nearby needs what you sell.',
     ('/services/local-seo', 'Local SEO'),
     ['not-showing-up-on-google', 'google-business-profile-optimization', 'how-to-get-more-google-reviews',
      'local-seo-indianapolis', 'get-recommended-by-chatgpt']),
    ('websites', 'Websites', 'What a site should cost, when to rebuild it, and why a pretty one still might not ring the phone.',
     ('/services/websites', 'Web design &amp; development'),
     ['small-business-website-cost', 'website-not-getting-leads', 'website-redesign-or-refresh']),
    ('ads', 'Ads &amp; analytics', 'Paid search, social ads, and knowing which dollars actually came back.',
     ('/services/google-ads', 'Google Ads'),
     ['google-ads-cost-small-business', 'google-ads-vs-facebook-ads', 'ga4-for-small-business', 'measure-marketing-roi']),
    ('content', 'Content, email &amp; social', 'How often to post, what to send, and whether writing articles still pays off.',
     ('/services/content-marketing', 'Content marketing'),
     ['small-business-email-marketing', 'how-often-to-post-on-social-media', 'does-blogging-still-work']),
    ('crm-ai', 'CRM, AI &amp; automation', 'The systems behind the marketing: where leads live, who follows up, and what a machine can safely handle.',
     ('/services/ai-automation', 'AI &amp; automation'),
     ['best-crm-for-small-business', 'gohighlevel-vs-hubspot', 'is-gohighlevel-worth-it',
      'automate-lead-follow-up', 'ai-agents-for-small-business', 'ai-chatbot-for-website']),
    ('strategy', 'Strategy &amp; budget', 'What to spend, what to do first, and how to plan when you&rsquo;re the whole marketing department.',
     ('/services/strategy', 'Strategy &amp; planning'),
     ['small-business-marketing-budget', 'one-page-marketing-plan', 'diy-marketing-vs-hiring', 'startup-go-to-market-no-budget']),
    ('hiring', 'Hiring marketing help', 'Fractional CMOs, consultants, and agencies: what each costs and when you&rsquo;re ready for one.',
     ('/services/coaching', 'Coaching &amp; growth'),
     ['fractional-cmo-cost', 'when-to-hire-fractional-cmo', 'fractional-cmo-vs-marketing-agency', 'marketing-consultant-cost']),
    ('nonprofits', 'Nonprofits', 'Donors, volunteers, and the free money most small nonprofits leave on the table.',
     ('/for/nonprofits', 'For nonprofits'),
     ['nonprofit-marketing-small-budget', 'nonprofit-google-ad-grant']),
]
FEATURED = ['small-business-website-cost', 'get-recommended-by-chatgpt', 'small-business-marketing-budget']


def read(p):
    with open(os.path.join(ROOT, p), encoding='utf-8') as f:
        return f.read()


def meta(slug):
    path = f'articles/{slug}.html'
    if not os.path.isfile(os.path.join(ROOT, path)):
        return None
    s = read(path)
    title = re.search(r'<title>(.*?)</title>', s, re.S).group(1).strip()
    title = re.split(r'\s+\|\s+', title)[0]
    desc = re.search(r'<meta name="description" content="(.*?)"', s).group(1)
    art = re.search(r'<article.*?</article>', s, re.S)
    body = re.sub(r'<script.*?</script>|<style.*?</style>|<[^>]+>', ' ', art.group(0) if art else s, flags=re.S)
    words = len(html.unescape(body).split())
    return {'slug': slug, 'title': title, 'desc': desc, 'mins': max(3, math.ceil(words / 230))}


def card(a, topic_label, delay, big=False):
    cls = 'blog-card blog-card--big' if big else 'blog-card'
    search = html.escape(html.unescape(f"{a['title']} {a['desc']} {topic_label}").lower(), quote=True)
    return (f'<a class="{cls} reveal" data-delay="{delay}" href="/articles/{a["slug"]}" data-search="{search}">'
            f'<span class="blog-card__tag">{topic_label}</span>'
            f'<h3 class="blog-card__t">{a["title"]}</h3>'
            f'<p class="blog-card__d">{a["desc"]}</p>'
            f'<span class="blog-card__meta">{a["mins"]} min read <span class="arr">&rarr;</span></span></a>')


def main():
    res = read('resources.html')
    chrome_top = res[res.index('<body'):res.index('<main>')]
    chrome_bottom = res[res.index('</main>') + len('</main>'):]
    css_v = re.search(r'/styles\.css\?v=([\w-]+)', res).group(1)
    js_v = re.search(r'/site\.js\?v=([\w-]+)', res).group(1)

    topics, all_items, topic_of = [], [], {}
    for key, label, intro, svc, slugs in TOPICS:
        items = [m for m in (meta(s) for s in slugs) if m]
        if not items:
            continue
        topics.append((key, label, intro, svc, items))
        for m in items:
            topic_of[m['slug']] = label
            all_items.append(m)
    total = len(all_items)

    chips = [f'<button type="button" class="topic-chip is-active" data-topic="all" aria-pressed="true">All <span>{total}</span></button>']
    chips += [f'<button type="button" class="topic-chip" data-topic="{k}" aria-pressed="false">{l} <span>{len(i)}</span></button>'
              for k, l, _, _, i in topics]

    feat = [m for m in (meta(s) for s in FEATURED) if m]
    feat_html = ''.join(card(m, topic_of.get(m['slug'], ''), i, big=True) for i, m in enumerate(feat))

    sections = []
    for key, label, intro, (svc_href, svc_label), items in topics:
        cards = ''.join(card(m, label, i % 3) for i, m in enumerate(items))
        sections.append(f'''
      <section class="topic-sec" id="{key}" data-topic="{key}" aria-labelledby="h-{key}">
        <div class="topic-sec__head reveal">
          <h2 id="h-{key}">{label}</h2>
          <p>{intro}</p>
          <a class="tlink" href="{svc_href}">How we help: {svc_label}</a>
        </div>
        <div class="blog-grid">{cards}</div>
      </section>''')

    item_list = [{'@type': 'ListItem', 'position': i + 1, 'url': f"{SITE}/articles/{m['slug']}",
                  'name': html.unescape(m['title'])} for i, m in enumerate(all_items)]
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'CollectionPage', '@id': f'{SITE}/articles#page', 'url': f'{SITE}/articles',
         'name': 'Articles | Carson Poore Consulting',
         'description': f'{total} plain-English answers to small business marketing questions, sorted by topic.',
         'isPartOf': {'@id': f'{SITE}/#website'}, 'publisher': {'@id': f'{SITE}/#org'},
         'mainEntity': {'@type': 'ItemList', 'numberOfItems': total, 'itemListElement': item_list}},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': f'{SITE}/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': f'{SITE}/resources'},
            {'@type': 'ListItem', 'position': 3, 'name': 'Articles', 'item': f'{SITE}/articles'}]}]}

    desc = (f'{total} straight answers to small business marketing questions, sorted by topic: Google, '
            'websites, ads, email, CRM and AI, budgets, and hiring help.')
    title = 'Marketing Articles for Small Business | Carson Poore'

    page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content="{desc}" />
<link rel="canonical" href="{SITE}/articles" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{desc}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="{SITE}/articles" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap" />
<link rel="icon" type="image/svg+xml" href="/brand/cpc-mark-royalblue.svg" />
<link rel="stylesheet" href="/styles.css?v={css_v}" />
<script defer src="/site.js?v={js_v}"></script>
<!-- Generated by docs/tools/build-blog-index.py. Edit the script, not this file. -->
<style>
  /* Blog hub: search + topic filter over static, crawlable topic sections */
  .blog-search {{ margin-top: clamp(22px, 3vw, 32px); max-width: 560px; position: relative; }}
  .blog-search input {{
    width: 100%; font: inherit; font-size: 1.02rem; color: var(--ink);
    padding: 15px 18px 15px 48px; border-radius: 999px; border: 1px solid transparent;
    background: var(--bone); box-shadow: 0 1px 0 rgba(0,0,0,0.04);
  }}
  .blog-search input:focus {{ outline: 3px solid var(--cobalt-3); outline-offset: 2px; }}
  .blog-search svg {{ position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }}

  .topic-bar {{
    position: sticky; top: var(--nav-h, 72px); z-index: 20;
    background: rgba(248,247,244,0.94); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--line-soft);
  }}
  .topic-bar__row {{ display: flex; gap: 8px; overflow-x: auto; padding: 14px 0; scrollbar-width: none; -webkit-overflow-scrolling: touch; }}
  .topic-bar__row::-webkit-scrollbar {{ display: none; }}
  .topic-chip {{
    flex: none; font: inherit; font-size: 0.9rem; font-weight: 700; color: var(--ink);
    padding: 9px 16px; border-radius: 999px; border: 1px solid var(--line); background: #fff; cursor: pointer;
    transition: background .2s, color .2s, border-color .2s;
  }}
  .topic-chip span {{ font-weight: 600; color: var(--muted); margin-left: 4px; }}
  .topic-chip:hover {{ border-color: var(--cobalt); }}
  .topic-chip.is-active {{ background: var(--navy); border-color: var(--navy); color: #fff; }}
  .topic-chip.is-active span {{ color: var(--cream-2); }}
  .topic-chip:focus-visible {{ outline: 3px solid var(--cobalt-3); outline-offset: 2px; }}

  .blog-status {{ margin: 0; padding-top: clamp(20px, 3vw, 28px); font-weight: 700; color: var(--ink-2); min-height: 1.5em; }}

  .blog-feat {{ display: grid; gap: clamp(14px, 2vw, 22px); grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 18px; }}
  .blog-grid {{ display: grid; gap: clamp(14px, 2vw, 22px); grid-template-columns: repeat(3, minmax(0, 1fr)); }}
  .blog-card {{
    display: flex; flex-direction: column; gap: 10px; min-width: 0;
    padding: clamp(20px, 2.4vw, 28px); background: #fff; border: 1px solid var(--line);
    border-radius: var(--r-2, 14px); text-decoration: none; color: var(--ink);
    transition: transform .3s var(--ease), box-shadow .3s var(--ease), border-color .3s var(--ease);
  }}
  .blog-card:hover {{ transform: translateY(-3px); box-shadow: var(--shadow-2); border-color: rgba(30,79,216,0.35); }}
  .blog-card:focus-visible {{ outline: 3px solid var(--cobalt-3); outline-offset: 3px; }}
  .blog-card__tag {{ font-size: 0.68rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--cobalt); }}
  .blog-card__t {{ font-size: 1.22rem; font-weight: 800; letter-spacing: -0.012em; line-height: 1.22; margin: 0; }}
  .blog-card__d {{ font-size: 0.95rem; color: var(--ink-2); margin: 0; }}
  .blog-card__meta {{ margin-top: auto; padding-top: 6px; font-size: 0.85rem; font-weight: 700; color: var(--ink); }}
  .blog-card__meta .arr {{ color: var(--cobalt); transition: transform .25s var(--ease); display: inline-block; }}
  .blog-card:hover .blog-card__meta .arr {{ transform: translateX(4px); }}
  .blog-card--big {{ background: var(--navy); border-color: var(--navy); }}
  .blog-card--big .blog-card__tag {{ color: var(--amber); }}
  .blog-card--big .blog-card__t {{ color: #fff; font-size: 1.42rem; }}
  .blog-card--big .blog-card__d {{ color: var(--cream-2); }}
  .blog-card--big .blog-card__meta {{ color: #fff; }}
  .blog-card--big .blog-card__meta .arr {{ color: var(--amber); }}

  .topic-sec {{ padding-top: clamp(40px, 6vw, 72px); scroll-margin-top: calc(var(--nav-h, 72px) + 70px); }}
  .topic-sec__head {{ display: grid; gap: 8px; margin-bottom: clamp(18px, 2.4vw, 26px); max-width: 64ch; }}
  .topic-sec__head h2 {{ font-size: var(--step-3); margin: 0; }}
  .topic-sec__head p {{ margin: 0; color: var(--ink-2); }}
  .topic-sec__head .tlink {{ justify-self: start; font-size: 0.92rem; }}
  .blog-hub {{ padding-bottom: clamp(56px, 8vw, 104px); }}
  .blog-empty {{ display: none; padding: 40px 0 0; max-width: 56ch; }}
  .blog-empty.is-on {{ display: block; }}
  [hidden] {{ display: none !important; }}
  .visually-hidden {{ position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }}

  @media (max-width: 980px) {{ .blog-grid, .blog-feat {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }} }}
  @media (max-width: 640px) {{ .blog-grid, .blog-feat {{ grid-template-columns: 1fr; }} }}
</style>
<script type="application/ld+json">
{json.dumps(ld, indent=2, ensure_ascii=False)}
</script>
</head>
{chrome_top}<main>

  <section class="hero page-hero">
    <div class="wrap">
      <nav class="crumbs reveal" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/resources">Resources</a> <span aria-hidden="true">/</span> <span aria-current="page">Articles</span></nav>
      <h1 class="reveal" data-delay="1">The questions owners ask us, <em>answered first.</em></h1>
      <p class="hero__sub reveal mt-md" data-delay="2">{total} articles, sorted by topic. Every one opens with the answer in the first few lines, with real numbers and the sources behind them. Read the rest only if you want the reasoning.</p>
      <form class="blog-search reveal" data-delay="3" role="search" onsubmit="return false">
        <label for="blog-q" class="visually-hidden">Search articles</label>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input id="blog-q" type="search" placeholder="Search: reviews, Google Ads, CRM, budget&hellip;" autocomplete="off" />
      </form>
    </div>
  </section>

  <div class="topic-bar" role="toolbar" aria-label="Filter articles by topic">
    <div class="wrap"><div class="topic-bar__row">
      {''.join(chips)}
    </div></div>
  </div>

  <div class="blog-hub">
    <div class="wrap">
      <p class="blog-status" aria-live="polite"></p>

      <section class="topic-sec topic-sec--feat" data-feat aria-labelledby="h-start" style="padding-top: 8px;">
        <div class="topic-sec__head reveal"><h2 id="h-start">Start here</h2><p>The three people ask about most.</p></div>
        <div class="blog-feat">{feat_html}</div>
      </section>
{''.join(sections)}

      <div class="blog-empty" role="status">
        <h2>Nothing matches that yet.</h2>
        <p class="mt-sm">Try a shorter word, or ask us directly. If enough people ask, it becomes the next article.</p>
        <p class="mt-md"><a class="btn btn--primary" href="/contact">Ask your question <span class="arr">&rarr;</span></a></p>
      </div>
    </div>
  </div>

  <section class="closing">
    <div class="closing__inner">
      <div class="reveal">
        <h2>Read three of these and still stuck? <em>Ask us instead.</em></h2>
        <p>Thirty minutes, free. Bring the question the articles didn&rsquo;t answer and we&rsquo;ll tell you what we&rsquo;d do first, even if it isn&rsquo;t something we sell.</p>
      </div>
      <div class="reveal row-cta" data-delay="1">
        <a href="/contact" class="btn btn--primary">Book a free call <span class="arr">&rarr;</span></a>
        <a href="/resources" class="btn btn--ghost-light">See the free tools</a>
      </div>
    </div>
  </section>

</main>
<script>
(function () {{
  var nav = document.querySelector('.nav');
  function setNavH() {{ if (nav) document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px'); }}
  setNavH(); window.addEventListener('resize', setNavH);

  var chips = [].slice.call(document.querySelectorAll('.topic-chip'));
  var secs = [].slice.call(document.querySelectorAll('.topic-sec[data-topic]'));
  var feat = document.querySelector('[data-feat]');
  var q = document.getElementById('blog-q');
  var status = document.querySelector('.blog-status');
  var empty = document.querySelector('.blog-empty');
  var topic = 'all';

  function apply() {{
    var term = q.value.trim().toLowerCase();
    var shown = 0;
    secs.forEach(function (s) {{
      var inTopic = topic === 'all' || s.dataset.topic === topic;
      var n = 0;
      [].forEach.call(s.querySelectorAll('.blog-card'), function (c) {{
        var hit = inTopic && (!term || c.dataset.search.indexOf(term) !== -1);
        c.hidden = !hit; if (hit) {{ n++; c.classList.add('in'); }}
      }});
      s.hidden = n === 0; shown += n;
    }});
    feat.hidden = topic !== 'all' || !!term;
    empty.classList.toggle('is-on', shown === 0);
    status.textContent = term ? shown + (shown === 1 ? ' article' : ' articles') + ' match “' + q.value.trim() + '”'
      : (topic === 'all' ? '' : shown + (shown === 1 ? ' article' : ' articles') + ' in this topic');
  }}
  function setTopic(t, push) {{
    topic = chips.some(function (c) {{ return c.dataset.topic === t; }}) ? t : 'all';
    chips.forEach(function (c) {{ var on = c.dataset.topic === topic; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', on); }});
    apply();
    if (push) history.replaceState(null, '', topic === 'all' ? location.pathname : '#' + topic);
  }}
  chips.forEach(function (c) {{
    c.addEventListener('click', function () {{
      setTopic(c.dataset.topic, true);
      var top = document.querySelector('.topic-bar').getBoundingClientRect().top + scrollY - (nav ? nav.offsetHeight : 0);
      if (scrollY > top) window.scrollTo({{ top: top, behavior: 'smooth' }});
    }});
  }});
  q.addEventListener('input', apply);
  window.addEventListener('hashchange', function () {{ setTopic(location.hash.slice(1) || 'all', false); }});
  setTopic(location.hash.slice(1) || 'all', false);
}})();
</script>
{chrome_bottom}'''

    out = os.path.join(ROOT, 'articles', 'index.html')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(page)
    print(f'wrote articles/index.html: {total} articles across {len(topics)} topics')


if __name__ == '__main__':
    main()
