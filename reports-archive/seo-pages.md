# Website pages for search (2026-11-09)

Branch `g-seo` (worktree `.worktrees/seo`, on ii-dlc bc596651). Not pushed, not merged. Nothing here touched the live site, the relay or any network.

## Why

Search Console: 43 impressions and 4 clicks in 11 days. The game is one huge canvas page, so a search engine sees almost no text on it. The fix is many small, static, honest pages with real text, all in the sitemap, linking to each other and to the game.

## What was built

| Kind | Count | Where |
|---|---|---|
| Fighter pages | 102 | `artifacts/V1/fighters/<slug>.html` (one per public fighter) |
| Fighter list | 1 | `artifacts/V1/fighters/index.html` (grouped: Battle for Dream Island 59, Inanimate Insanity 43) |
| Stage pages | 16 | `artifacts/V1/stages/<slug>.html` |
| Stage list | 1 | `artifacts/V1/stages/index.html` |
| Mode / info pages | 8 | `modes.html`, `boss-rush.html`, `world-cup.html`, `capture-the-flag.html`, `online-play.html`, `controls.html`, `whats-new.html`, `faq.html` |
| **Generated pages** | **128** | |
| Sitemap URLs | 130 | the 128 pages + `/` + `/about.html`, each with `<lastmod>` and a priority |

Excluded on purpose: 9 fighters (the roster rows that are event or prize fighters) and 2 stages (secret or in development). No excluded name appears in any page, the sitemap, the generator or this report.

Each fighter page: the game's own role label and one-line kit, every move line from the character card (attack, ranged, tilt where there is one, special, up and down special, smash name, finisher, shield or reflector), weight and run speed in words computed from the game's tables, a Tips list made only from those lines (shield breaker yes/no, defence type, ranged or not, effects, weight, speed), three similar fighters, previous/next, and the big Play button. Each stage page: the blurb and the size, shape, platforms, edges and hazard from the stage table. The mode pages are written from How to Play, the menus and the changelog; whats-new is the CHANGELOG verbatim, newest first.

Each page has: a unique `<title>` (all 70 characters or fewer), a unique meta description (160 or fewer), a canonical link, Open Graph and Twitter tags using og-image.png, two JSON-LD blocks (WebPage + BreadcrumbList), the about page's CSS inline, a header nav (Play | Fighters | Stages | Modes | About), a footer "Site pages" nav and the unofficial-fan-game line, `lang="en"`, no script, no external request.

Also changed:
- `artifacts/V1/index.html`: ONE block before `</body>`: a visually hidden (clip pattern, not display:none) `<nav aria-label="Site pages">` of plain links to the new pages. No script, no game behaviour touched. CRLF intact (bare LF 0, control bytes 0).
- `artifacts/V1/about.html`: a visible header nav, a footer nav, and its 102 fighter names now link to the fighter pages.
- `artifacts/V1/sitemap.xml`: regenerated (was 2 URLs).
- `robots.txt`: unchanged (it already had the Sitemap line).
- `scripts/indexnow-ping.mjs` and the IndexNow key file `artifacts/V1/b7f3c9e2a51d4f08b6e1c3d9a2f7e4c1.txt` (see below). NOT run.
- `docs/LEDGER.md`: one row, 2026-11-09, WEBSITE PAGES.

## Re-running the generator at each update

```
node scripts/gen-seo-pages.mjs --date 2026-11-23
```

(the date is the sitemap's `<lastmod>`; default today). It reads the game's tables straight from `artifacts/V1/index.html`, rewrites every generated page and the sitemap, and exits 1 writing nothing if a hidden name would appear or a link would not resolve. Run it in the update branch after the game changes (new fighter, stage, changelog entry), then commit the output with the update. The deploy needs nothing new: `scripts/build-site.mjs` already copies subfolders and leaves these pages byte-identical (checked: 130 of 130 identical after a build).

## Checks done (all passed)

- Generator run twice with the same date: identical output (129 files hashed).
- Sitemap well-formed; every `<loc>` maps to a file and every page is a `<loc>`; 130 URLs, one lastmod.
- 128 unique titles (max 70), 128 unique descriptions (max 160), canonical on every page, OG tags, 256 JSON-LD blocks parsed, 3966 internal links checked (pages, about.html and the index.html block), none broken.
- Hidden-name grep over the output, sitemap, generator and this report: 0 hits. The only capitalised "One" occurrences are the game's own move titles ("Which One Is Box?", "Number One Fan Won't Let Go", "The One and Only!", "One hit pops it") and a heading of mine ("One keyboard per computer"). Two public fighters' move titles that happened to contain an event fighter's ordinary-word name were replaced by the slot's plain name (the description after the dash kept); nothing else was dropped.
- `node scripts/build-site.mjs --out <temp>`: passed, 1163 files, fighters/ 103 and stages/ 17 copied.
- syncheck: 2 scripts checked, failed 0. bootcheck: ffa bad positions 0, teams bad positions 0, errors none; guards clean; kit guard ok.
- index.html and about.html: control bytes 0, bare LF 0.

Not verified: how the pages look in a browser (no browser was used; the CSS is the about page's, so they should look like it). Please open one fighter page and one stage page before the update ships.

## Owner checklist (after the pages are live)

1. **Google Search Console**: Sitemaps > add `https://smashisland.vercel.app/sitemap.xml` (the verification file is already on the site). Then, for a few key pages (home, /fighters/, /faq.html), use URL Inspection > Request indexing.
2. **Bing Webmaster Tools**: add the site (it can import from Search Console), submit the same sitemap URL.
3. **IndexNow** (Bing, Yandex and others; not Google): after each deploy, run `node scripts/indexnow-ping.mjs` once (or `--dry-run` first to see the list). It POSTs the sitemap's URLs to api.indexnow.org with the key file that is on the site. A 200/202 means accepted. Once per deploy is enough.
4. **Links from elsewhere** (the biggest lever for a young site): the ready-to-post text is in `reports/promo-drafts.md`: YouTube boss-showcase descriptions, an itch.io project page, a fan-wiki or forum post, Reddit (r/BattleForDreamIsland, r/inanimateinsanity, r/WebGames, each with its self-promotion rules), and its section 5 on what helps Google. When posting, deep-link to a fighter or mode page where it fits (for example a boss video to `/boss-rush.html`), not only the home page.
5. In two to three weeks, check Search Console > Performance for which fighter and mode pages get impressions, and Pages for any "crawled, not indexed" entries.
