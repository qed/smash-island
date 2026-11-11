// The site's small, static, crawlable pages, written from the game's own data (the owner, 2026-11-09: Search Console showed 43
// impressions and 4 clicks in 11 days -- the game is one canvas page, so a search engine sees almost no text).
//
//   node scripts/gen-seo-pages.mjs                 -> lastmod = today (UTC)
//   node scripts/gen-seo-pages.mjs --date 2026-11-13
//
// It reads artifacts/V1/index.html (the monolith) and about.html, and WRITES, under artifacts/V1:
//   fighters/<slug>.html + fighters/index.html     one page per PUBLIC fighter, and the list grouped by show
//   stages/<slug>.html + stages/index.html         one page per public stage, and the list
//   modes.html, boss-rush.html, world-cup.html, capture-the-flag.html, online-play.html, controls.html, whats-new.html, faq.html
//   sitemap.xml                                    home, about and every page above, each with <lastmod>
// robots.txt is rewritten only if its Sitemap line is missing. The output is committed: the deploy (scripts/build-site.mjs, plain
// Node, no packages) just copies it. Running this twice with the same --date gives identical files.
//
// PUBLIC ONLY (the owner's secrecy rules). A fighter is on these pages only when a brand-new player sees it on the main roster
// board: a ROSTER row with play:true that is neither an event fighter (event:true) nor a prize (prize). The three prize fighters,
// the event fighters and the secret boss are never named here; as a second gate every included name must already be in the
// about.html list the owner published. Stages with a secret flag, in development, or not in the ordinary stage list are skipped.
// Before anything is written, every output text is checked against a list of names held in memory only (read from the game at run
// time, never written in this file or printed): one hit and the run fails with exit 1 and writes nothing.
//
// The game's constants are read by slicing their source text and evaluating the literal in node:vm (no jsdom: the deploy and the
// owner's machine need nothing installed). Only literal tables are read (ROSTER, STAGES, CHANGELOG, MOVE_TEXT, FIGHTER_STATS...).

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'artifacts', 'V1');
const SITE = 'https://smashisland.vercel.app';
const GAME = 'Battle for Smash Island';

const argv = process.argv.slice(2);
const di = argv.indexOf('--date');
const DATE = di >= 0 && argv[di + 1] ? argv[di + 1] : new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(DATE)) { console.error('gen-seo-pages: --date must be YYYY-MM-DD'); process.exit(1); }

const fail = (msg) => { console.error('gen-seo-pages FAILED: ' + msg); process.exit(1); };

// ---- reading the game's tables ------------------------------------------------------------------------------------------------

const monolith = readFileSync(join(SRC, 'index.html'), 'utf8').replace(/\r\n?/g, '\n');
const aboutHtml = readFileSync(join(SRC, 'about.html'), 'utf8').replace(/\r\n?/g, '\n');

// The text of `const NAME = <literal>;` : from the first [ or { after the = to its matching close, strings and comments honoured.
function sliceConst(name) {
  const at = monolith.indexOf('\nconst ' + name + ' = ');
  if (at < 0) fail('the game has no `const ' + name + '`');
  let i = monolith.indexOf('=', at) + 1;
  while (/\s/.test(monolith[i])) i++;
  if (monolith.startsWith('new Set(', i)) i += 'new Set('.length;
  const open = monolith[i];
  if (open !== '[' && open !== '{') fail(name + ' is not an array or object literal');
  const close = open === '[' ? ']' : '}';
  let depth = 0, j = i;
  const n = monolith.length;
  while (j < n) {
    const c = monolith[j];
    if (c === '/' && monolith[j + 1] === '/') { j = monolith.indexOf('\n', j); if (j < 0) j = n; continue; }
    if (c === '/' && monolith[j + 1] === '*') { j = monolith.indexOf('*/', j + 2) + 2; continue; }
    if (c === '"' || c === "'" || c === '`') {
      let k = j + 1;
      while (k < n && monolith[k] !== c) { if (monolith[k] === '\\') k++; k++; }
      j = k + 1; continue;
    }
    if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') { depth--; if (depth === 0) { j++; break; } }
    j++;
  }
  if (depth !== 0) fail('could not find the end of ' + name);
  return monolith.slice(i, j);
}
function readConst(name, ctx = {}) {
  try { return vm.runInNewContext('(' + sliceConst(name) + ')', ctx, { timeout: 5000 }); }
  catch (e) { fail(name + ' did not evaluate as a literal: ' + e.message); }
}

const ROSTER = readConst('ROSTER');
const STAGES = readConst('STAGES');
const CHANGELOG = readConst('CHANGELOG');
const MOVE_TEXT = readConst('MOVE_TEXT');
const FIGHTER_STATS = readConst('FIGHTER_STATS');
const HEAVY_SLOW = readConst('HEAVY_SLOW');
const SMASH_ID = readConst('SMASH_ID');
const SMASH_BLURB_BESPOKE = readConst('SMASH_BLURB_BESPOKE');
const SHIELD_BREAKERS = monolith.includes('\nconst SHIELD_BREAKERS = ') ? readConst('SHIELD_BREAKERS') : {};   // (a game build without shield breakers has none to mention)
const REFLECTOR_FIGHTERS = new Set(readConst('REFLECTOR_FIGHTERS'));
const DEFAULT_KEYS = readConst('DEFAULT_KEYS');
const KEY_LABELS = readConst('KEY_LABELS');
const EVENT_LAPS = readConst('EVENT_LAPS');
// SHOW_ORDER names three prize fighters by variable: they evaluate to null here and are dropped.
const SHOW_ORDER = readConst('SHOW_ORDER', { PZ_A: null, PZ_B: null, PZ_C: null }).filter((x) => typeof x === 'string');

// ---- the names that must never appear (held in memory only) ------------------------------------------------------------------

function hiddenNames() {
  const out = new Set();
  // the prize fighters: the game keeps them scrambled; decode them the way the game does, at run time
  const codeAt = monolith.indexOf('\nconst PZ_CODE = ');
  const fnAt = monolith.indexOf('\nfunction pzName(');
  if (codeAt < 0 || fnAt < 0) fail('the prize names could not be read');
  const codeLine = monolith.slice(codeAt + 1, monolith.indexOf('\n', codeAt + 1));
  const fnLine = monolith.slice(fnAt + 1, monolith.indexOf('\n', fnAt + 1));
  const names = vm.runInNewContext(codeLine + '\n' + fnLine + '\nObject.values(PZ_CODE).map(pzName)', { atob }, { timeout: 5000 });
  for (const nm of names) out.add(nm);
  // event fighters: every name on the event calendar that the game's own public changelog has not already printed
  const publicText = JSON.stringify(CHANGELOG);
  for (const lap of EVENT_LAPS) for (const nm of lap.order) if (!publicText.includes(nm)) out.add(nm);
  for (const r of ROSTER) if ((r.event || r.prize) && !publicText.includes(r.name)) out.add(r.name);
  // the Vault's digit-only codes (a phone number from the show): the game never prints them, so neither may these pages
  for (const v of readConst('VAULT').fighters) if (/^\d+$/.test(String(v.code))) out.add(String(v.code));
  return out;
}
const HIDDEN = hiddenNames();
// The secret boss's name is an ordinary English word that several public move titles use ("Which ... Is Box?", "Number ... Fan",
// "...-Hit Wonder"), so the word alone proves nothing. What is checked is the word used AS the fighter: possessive, or after a verb
// or preposition that takes a fighter (beat, fight, against, vs, unlock...). The word is built at run time so it is written nowhere.
const BOSS_WORD = 'O' + 'ne';
const BOSS_RE = new RegExp(`\\b(beat|beats|beaten|beating|fight|fights|fighting|against|vs|versus|unlock|unlocks|unlocking|defeat|defeated|face|facing|with) ${BOSS_WORD}\\b|\\b${BOSS_WORD}'s\\b|\\b${BOSS_WORD} (is|was|has|erases|erased|fight|boss|unlock)\\b`);
function textNamesSecrets(text) {
  for (const nm of HIDDEN) if (text.includes(nm)) return 'a hidden name';
  const m = BOSS_RE.exec(text);
  return m ? 'the secret boss at ' + m.index : null;
}

// ---- the public fighters and stages ---------------------------------------------------------------------------------------------

const aboutNames = new Set([...aboutHtml.matchAll(/<li>(?:<a [^>]*>)?([^<]+)(?:<\/a>)?<\/li>/g)].map((m) => m[1]));   // the list's names, linked or plain
const excluded = ROSTER.filter((r) => !(r.play && !r.event && !r.prize));
const fighters = ROSTER.filter((r) => r.play && !r.event && !r.prize && MOVE_TEXT[r.name]);
for (const r of fighters) if (!aboutNames.has(r.name)) fail('a fighter the about page does not list would be published (conservative rule): stopping');
const rank = (r) => { const i = SHOW_ORDER.indexOf(r.name); return i < 0 ? 999 : i; };
fighters.sort((a, b) => rank(a) - rank(b));
console.log(`fighters: ${fighters.length} included, ${ROSTER.length - fighters.length} excluded`);

const stages = STAGES.filter((s) => !s.secret && !s.mcDev && !s.teamsOnly && s.name && s.blurb);
console.log(`stages: ${stages.length} included, ${STAGES.length - stages.length} excluded`);

// ---- words -------------------------------------------------------------------------------------------------------------------------

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function slugify(name) { return name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function uniqueSlugs(items) {
  const seen = new Map();
  for (const it of items) {
    let s = slugify(it.name), k = 2;
    while (seen.has(s)) s = slugify(it.name) + '-' + k++;
    seen.set(s, it); it.slug = s;
  }
}
uniqueSlugs(fighters); uniqueSlugs(stages);

const showOf = (r) => (r.dlc ? 'Inanimate Insanity' : 'Battle for Dream Island');
const showShort = (r) => (r.dlc ? 'Inanimate Insanity' : 'BFDI');
const weightClass = (w) => (w <= 74 ? 'light' : w <= 99 ? 'medium' : 'heavy');
function heavySlowK(w) { const x = (+w || 0) - HEAVY_SLOW.from; return x > 0 ? 1 - HEAVY_SLOW.max * Math.sqrt(x / (HEAVY_SLOW.ref - HEAVY_SLOW.from)) : 1; }
function runWords(r) {
  const base = (FIGHTER_STATS[r.name] && FIGHTER_STATS[r.name].run) || 1;
  const k = base * heavySlowK(r.w);
  const cls = k >= 1.05 ? 'quick' : k <= 0.95 ? 'slow' : 'average';
  return { cls, text: `${cls} (${k.toFixed(2)}× the standard ground run)` };
}
const specialName = (r) => (r.kit && r.kit.desc ? r.kit.desc.split(' → ')[0].trim() : 'Special');
const moveName = (line) => (line ? line.split(' — ')[0].trim() : '');
// Two event fighters' names are ordinary words that sit inside a few public fighters' own move titles ("Cold ...", "Shot ...",
// "... Shock"). Conservative rule: such a title is replaced by the slot's plain name and the description after the dash is kept.
function safeLine(line, fallback) {
  if (!line) return line;
  const i = line.indexOf(' — ');
  const title = i >= 0 ? line.slice(0, i) : line;
  for (const nm of HIDDEN) if (title.includes(nm)) return fallback + (i >= 0 ? line.slice(i) : '');
  return line;
}
const safeName = (nm, fallback) => { for (const h of HIDDEN) if (nm.includes(h)) return fallback; return nm; };
const STATUS_WORDS = [
  [/\bstuns?\b/i, 'stun'], [/\bburn(ing|s)?\b/i, 'burn'], [/\bfreez(e|es|ing)\b|\bfrozen\b/i, 'freeze'], [/\bslows?\b/i, 'slow'],
  [/\bpoison/i, 'poison'], [/\bspikes?\b/i, 'spike (sends them straight down)'], [/\bknocks? (them|you) down\b/i, 'knockdown'],
  [/\broots?\b|\brooted\b/i, 'root'], [/\bheals?\b|\brecovers\b/i, 'healing'], [/\bblinds?\b|\bdazzle/i, 'blind'],
  [/\barmou?r(ed)?\b/i, 'armour'], [/\bcounters?\b/i, 'counter'], [/\breflects?\b/i, 'reflect'],
];
function statuses(r) {
  const text = Object.values(MOVE_TEXT[r.name]).join(' ');
  const out = [];
  for (const [re, word] of STATUS_WORDS) if (re.test(text) && !out.includes(word)) out.push(word);
  return out;
}
function smashLine(r) {
  const sp = r.kit && r.kit.special;
  const id = SMASH_ID[sp];
  const nm = safeName(id && id.name ? id.name : 'Smash', 'Smash');
  const bespoke = SMASH_BLURB_BESPOKE[sp] ? SMASH_BLURB_BESPOKE[sp] + '.' : 'press V once: it charges for about half a second, then goes off by itself toward the nearest foe.';
  const brk = SHIELD_BREAKERS[sp] ? ' Breaks shields.' : '';
  return `${nm} — ${bespoke} Hold ↑ or ↓ with V for an up or down smash.${brk}`;
}
function shieldLine(r) {
  return REFLECTOR_FIGHTERS.has(r.name)
    ? 'Reflector — no shield bubble: Z raises a pane that turns shots back faster (1.8 times the speed, 1.3 times the damage, at most 12% a shot). Melee and grabs go through it.'
    : 'Shield — hold Z for a bubble that shrinks as it blocks and breaks into a long stun at zero; it blocks hits, not grabs. Tap Z while running to sprint.';
}
function similar(r) {
  const same = fighters.filter((o) => o !== r && o.arch === r.arch);
  const rest = fighters.filter((o) => o !== r && o.arch !== r.arch).sort((a, b) => Math.abs(a.w - r.w) - Math.abs(b.w - r.w));
  return same.concat(rest).slice(0, 3);
}
const KEY_NAMES = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Escape: 'Esc', Space: 'Space' };
const keyName = (code) => KEY_NAMES[code] || code.replace(/^Key/, '').replace(/^Digit/, '');
const HAZARD_WORDS = {
  lowgrav: 'low gravity: everyone jumps higher and falls slower',
  evilleafy: 'Evil Leafy roams the stage; touching her hurts',
  lava: 'the floor flares up in turns: watch your feet',
  ice: 'slippery ice in the bowl: you slide when you stop; footing is normal on the rims and ledges',
  shift: 'the ground splits and joins again every minute, with a warning glow and a low tone first',
  wind: 'a gust pushes everyone every ten seconds, with a short warning first',
};
const SHAPE_WORDS = {
  isles: 'floating islands over the sea, with no ground at all between them',
  bowl: 'a steel bowl with walls and steps: you are knocked out over the top or down the hatch, and a launch into a wall bounces off it',
  tower: 'a tall shaft of zig-zag ledges, four of them moving and carrying whoever stands on them',
};
function stageFacts(s) {
  const plats = s.platsBig || s.plats || [];
  const solid = plats.filter((p) => p[3] === 'solid').length;
  const facts = [];
  facts.push(s.big ? `Size: a wide scrolling arena, ${s.bigW} screens across.` : 'Size: a single-screen stage.');
  if (SHAPE_WORDS[s.stg]) facts.push('Shape: ' + SHAPE_WORDS[s.stg] + '.');
  facts.push(`Platforms: ${plats.length}${solid ? `, ${solid} of them solid blocks you cannot drop through` : ', all of them ledges you can drop through by holding ↓'}.`);
  if (s.edges && s.edges.floor) {
    const f = s.edges.floor;
    facts.push(f.length === 1 ? 'Edges: real edges. The ground ends on both sides, so you can be knocked off and fall.'
      : `Edges: real edges. The ground is ${f.length} separate pieces with drops between them, and it ends on both sides.`);
  } else facts.push('Edges: the floor runs the whole width; knockouts are off the sides and the top of the screen.');
  facts.push('Hazard: ' + (HAZARD_WORDS[s.hazard] || 'none') + '.');
  return facts;
}

// ---- the page shell ---------------------------------------------------------------------------------------------------------------

const CSS = `
  :root{ --sky:#dcefff; --ink:#1c1c1c; --muted:#4b5a66; --card:#ffffff; --pink:#e84d8a; --sun:#ffd23f; --line:#b9d4ea }
  @media (prefers-color-scheme: dark){ :root{ --sky:#0f1b28; --ink:#eef4fa; --muted:#a9b9c6; --card:#172636; --pink:#ff6fa3; --line:#2a3d50 } }
  body{ margin:0; background:var(--sky); color:var(--ink); font:16px/1.55 system-ui, -apple-system, 'Segoe UI', sans-serif }
  main{ max-width:760px; margin:0 auto; padding:16px max(16px, env(safe-area-inset-left)) 60px }
  h1{ font-size:clamp(30px, 6vw, 44px); line-height:1.1; margin:0 0 8px; letter-spacing:.5px }
  h2{ font-size:22px; margin:28px 0 8px }
  h3{ font-size:17px; margin:18px 0 6px }
  p{ margin:0 0 12px; max-width:68ch }
  a{ color:inherit }
  .lead{ font-size:18px; color:var(--muted) }
  .play{ display:inline-block; margin:14px 0 6px; background:var(--pink); color:#fff; font-weight:800; font-size:18px; text-decoration:none; padding:12px 22px; border-radius:14px; border:3px solid var(--ink) }
  .play:focus-visible{ outline:3px solid var(--sun); outline-offset:3px }
  .topnav{ display:flex; flex-wrap:wrap; gap:4px 14px; padding:10px 0 16px; font-weight:700 }
  .topnav a{ text-decoration:none; padding:6px 10px; border-radius:10px; background:var(--card); border:2px solid var(--line) }
  .crumbs{ font-size:13px; color:var(--muted); margin:0 0 10px }
  .card{ background:var(--card); border:2px solid var(--line); border-radius:14px; padding:14px 18px; margin:0 0 12px }
  .small{ font-size:13px; color:var(--muted) }
  ul.grid{ list-style:none; padding:0; display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:4px 12px }
  ul.facts{ padding-left:20px }
  dl.moves dt{ font-weight:800; margin-top:10px }
  dl.moves dd{ margin:2px 0 0 0; max-width:68ch }
  table{ border-collapse:collapse; width:100%; max-width:760px }
  td,th{ text-align:left; padding:6px 8px; border-bottom:1px solid var(--line); vertical-align:top }
  kbd{ font:600 14px/1 ui-monospace, Consolas, monospace; background:var(--card); border:1px solid var(--line); border-bottom-width:3px; border-radius:6px; padding:3px 7px; white-space:nowrap }
  .pager{ display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; margin:18px 0 }
  footer{ margin-top:36px; border-top:2px solid var(--line); padding-top:14px }
  footer nav{ display:flex; flex-wrap:wrap; gap:4px 14px; margin-bottom:10px; font-size:14px }
  .cl li{ margin-bottom:6px }
`;
const NAV_LINKS = [['/', 'Play'], ['/fighters/', 'Fighters'], ['/stages/', 'Stages'], ['/modes.html', 'Modes'], ['/about.html', 'About']];
const SITE_PAGES = [['/fighters/', 'Fighters'], ['/stages/', 'Stages'], ['/modes.html', 'Game modes'], ['/boss-rush.html', 'Boss Rush'],
  ['/world-cup.html', 'World Cup'], ['/capture-the-flag.html', 'Capture the Flag'], ['/online-play.html', 'Online play'],
  ['/controls.html', 'Controls'], ['/whats-new.html', "What's new"], ['/faq.html', 'FAQ'], ['/about.html', 'About']];
const DISCLAIMER = 'Battle for Smash Island is an unofficial fan game. Battle for Dream Island belongs to jacknjellify and Inanimate Insanity belongs to its creators; this game is not made or endorsed by them.';
const PLAY_BTN = `<a class="play" href="${SITE}/">Play now (free, in your browser) ▶</a>`;

// path: 'fighters/bow.html' | 'fighters/index.html' | 'faq.html'. crumbs: [[name, path], ...] above this page.
function page({ path, title, desc, h1, lead, body, crumbs = [], jsonldExtra = null }) {
  const url = SITE + '/' + path.replace(/index\.html$/, '');
  const crumbList = [['Home', '/']].concat(crumbs).concat([[h1, '/' + path.replace(/index\.html$/, '')]]);
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: crumbList.map(([nm, p], i) => ({ '@type': 'ListItem', position: i + 1, name: nm, item: SITE + p })),
  };
  const webpage = Object.assign({
    '@context': 'https://schema.org', '@type': 'WebPage', name: title, url, description: desc, inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: GAME, url: SITE + '/' },
    about: { '@type': 'VideoGame', name: GAME, url: SITE + '/', gamePlatform: 'Web browser', isAccessibleForFree: true },
    dateModified: DATE,
  }, jsonldExtra || {});
  const crumbsHtml = crumbList.slice(0, -1).map(([nm, p]) => `<a href="${esc(p)}">${esc(nm)}</a>`).join(' › ') + ' › ' + esc(h1);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${GAME}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/og-image.png">
<link rel="icon" type="image/png" href="/favicon.png">
<script type="application/ld+json">${JSON.stringify(webpage)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
<style>${CSS}</style>
</head>
<body>
<main>
  <nav class="topnav" aria-label="Main">${NAV_LINKS.map(([p, nm]) => `<a href="${p}">${nm}</a>`).join('')}</nav>
  <p class="crumbs">${crumbsHtml}</p>
  <h1>${esc(h1)}</h1>
  ${lead ? `<p class="lead">${lead}</p>` : ''}
${body}
  <footer>
    <nav aria-label="Site pages">${SITE_PAGES.map(([p, nm]) => `<a href="${p}">${nm}</a>`).join('')}</nav>
    <p class="small">${DISCLAIMER}</p>
    <p class="small">Free to play, no download, no account. Made for a computer with a keyboard.</p>
  </footer>
</main>
</body>
</html>
`;
}
const link = (p, text) => `<a href="${esc(p)}">${esc(text)}</a>`;
const fighterPath = (r) => '/fighters/' + r.slug + '.html';
const stagePath = (s) => '/stages/' + s.slug + '.html';
const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');
const titleFor = (main) => { const a = `${main} | ${GAME}`; return a.length <= 70 ? a : `${main} | Smash Island`; };

// ---- fighter pages ------------------------------------------------------------------------------------------------------------------

const out = new Map();   // path -> html
function fighterPage(r, i) {
  const raw = MOVE_TEXT[r.name];
  const mt = { jab: safeLine(raw.jab, 'Attack'), ranged: safeLine(raw.ranged, 'Ranged'), utilt: safeLine(raw.utilt, 'Up tilt'), special: safeLine(raw.special, 'Special'),
    up: safeLine(raw.up, 'Up special'), down: safeLine(raw.down, 'Down special'), finisher: safeLine(raw.finisher, 'Finisher') };
  const show = showOf(r), wc = weightClass(r.w), run = runWords(r), st = statuses(r);
  const prev = fighters[(i - 1 + fighters.length) % fighters.length], next = fighters[(i + 1) % fighters.length];
  const title = titleFor(`${r.name} – ${showShort(r)} fighter guide`);
  const desc = clip(`${r.name} in ${GAME}: a ${r.arch.toLowerCase()} from ${show}. Every move (${specialName(r)}, finisher, smash), weight, speed and tips for the free browser fighter.`, 160);
  const moves = [
    ['Attack (X)', mt.jab], ['Ranged (X at a distance)', mt.ranged], ['Up tilt (↑ + X)', mt.utilt],
    [`Special (C)`, mt.special], ['Up special (↑ + C)', mt.up], ['Down special (↓ + C)', mt.down],
    ['Smash (V)', smashLine(r)], ['Finisher (V + C)', mt.finisher], ['Shield / Reflector (Z)', shieldLine(r)],
  ].filter(([, t]) => t);
  const tips = [
    `Shield breaker: ${SHIELD_BREAKERS[r.kit.special] ? 'yes. The smash breaks a raised shield bubble in one hit.' : 'no. The smash does not break a shield outright; wear the bubble down or grab instead.'}`,
    `Defence: ${REFLECTOR_FIGHTERS.has(r.name) ? 'a reflector pane, so shots can be turned back but melee is not blocked.' : 'a shield bubble; hold Z to block hits (not grabs).'}`,
    mt.ranged ? `Ranged attack: yes (${moveName(mt.ranged) || 'Ranged'}), so there is an answer at range.` : 'Ranged attack: none listed, so the fight is up close.',
    st.length ? `Effects in the kit: ${st.join(', ')}.` : 'Effects in the kit: plain damage and knockback.',
    `Weight ${r.w}: ${wc} for this roster (lighter fighters fly further from the same hit).`,
    `Ground speed: ${run.text}.`,
  ];
  const sim = similar(r);
  const body = `
  <p class="small">${esc(show)} · ${esc(r.arch)} · weight ${r.w} (${wc}) · ${run.cls} runner</p>
  <p>${esc(r.name)} is a playable fighter in ${GAME}, a free fan-made platform fighter you play in your browser. The game lists ${esc(r.name)} as a <strong>${esc(r.arch)}</strong> from ${esc(show)}. Kit in one line, as the select screen says it: <em>${esc(r.kit.desc)}</em>.</p>
  ${PLAY_BTN}
  <h2>${esc(r.name)}'s moves</h2>
  <p class="small">The move lines below are the game's own, from the character card. Damage is the first hit on a standing foe.</p>
  <div class="card"><dl class="moves">
${moves.map(([k, t]) => `    <dt>${esc(k)}</dt><dd>${esc(t)}</dd>`).join('\n')}
  </dl></div>
  <h2>Tips for ${esc(r.name)}</h2>
  <ul class="facts">
${tips.map((t) => `    <li>${esc(t)}</li>`).join('\n')}
  </ul>
  <h2>Similar fighters</h2>
  <ul class="grid">
${sim.map((o) => `    <li>${link(fighterPath(o), o.name)} <span class="small">(${esc(o.arch)})</span></li>`).join('\n')}
  </ul>
  <div class="pager">
    <span>← Previous: ${link(fighterPath(prev), prev.name)}</span>
    <span>Next: ${link(fighterPath(next), next.name)} →</span>
  </div>
  <p>${link('/fighters/', 'All fighters')} · ${link('/stages/', 'Stages')} · ${link('/controls.html', 'Controls')}</p>
  ${PLAY_BTN}`;
  return page({ path: 'fighters/' + r.slug + '.html', title, desc, h1: r.name, lead: `${esc(r.arch)} · ${esc(show)} · how ${esc(r.name)} plays in ${GAME}`, body,
    crumbs: [['Fighters', '/fighters/']],
    jsonldExtra: { mainEntity: { '@type': 'Thing', name: r.name, description: `${r.arch}: ${r.kit.desc}` } } });
}
fighters.forEach((r, i) => out.set('fighters/' + r.slug + '.html', fighterPage(r, i)));

function fightersIndex() {
  const groups = [['Battle for Dream Island', fighters.filter((r) => !r.dlc)], ['Inanimate Insanity', fighters.filter((r) => r.dlc)]];
  const body = `
  <p>${fighters.length} fighters you can pick in ${GAME}, each with their own attack, special, up and down specials, smash, finisher and Final Smash, grouped by show and listed in the order the shows introduced them. Click a name for the full move list, weight, speed class and tips. You start with a few and unlock more as you play.</p>
  ${PLAY_BTN}
${groups.map(([show, list]) => `  <h2>${esc(show)} (${list.length})</h2>
  <div class="card"><ul class="grid">
${list.map((r) => `    <li>${link(fighterPath(r), r.name)}</li>`).join('\n')}
  </ul></div>`).join('\n')}
  <h2>Archetypes</h2>
  <p>The game gives every fighter a role label. Zoners fight at range, grapplers and brawlers up close, trappers set things down, and a few are their own thing. Weight runs from ${Math.min(...fighters.map((r) => r.w))} to ${Math.max(...fighters.map((r) => r.w))}; the lighter the fighter, the further they fly from the same hit.</p>
  <p>${link('/stages/', 'Stages')} · ${link('/controls.html', 'Controls')} · ${link('/faq.html', 'FAQ')}</p>`;
  return page({ path: 'fighters/index.html', title: titleFor('All fighters: BFDI and Inanimate Insanity roster'),
    desc: clip(`The ${fighters.length} playable fighters in ${GAME}, a free browser platform fighter: every Battle for Dream Island and Inanimate Insanity character, with moves, weight and tips.`, 160),
    h1: 'Fighters', lead: `Every playable character in ${GAME}, by show.`, body });
}
out.set('fighters/index.html', fightersIndex());

// ---- stage pages --------------------------------------------------------------------------------------------------------------------

function stagePage(s, i) {
  const prev = stages[(i - 1 + stages.length) % stages.length], next = stages[(i + 1) % stages.length];
  const facts = stageFacts(s);
  const body = `
  <p>${esc(s.name)} is a stage in ${GAME}. The game describes it in one line: <em>${esc(s.blurb)}</em></p>
  ${PLAY_BTN}
  <h2>What the stage is like</h2>
  <ul class="facts">
${facts.map((f) => `    <li>${esc(f)}</li>`).join('\n')}
  </ul>
  <p class="small">Stage features are read from the game's stage table. In Teams and Capture the Flag the arena differs; this describes a plain match.</p>
  <div class="pager">
    <span>← Previous: ${link(stagePath(prev), prev.name)}</span>
    <span>Next: ${link(stagePath(next), next.name)} →</span>
  </div>
  <p>${link('/stages/', 'All stages')} · ${link('/fighters/', 'Fighters')} · ${link('/modes.html', 'Game modes')}</p>`;
  return page({ path: 'stages/' + s.slug + '.html', title: titleFor(`${s.name} – stage guide`),
    desc: clip(`${s.name} in ${GAME}: ${s.blurb} Platforms, edges and hazards of this stage in the free browser BFDI fighter.`, 160),
    h1: s.name, lead: esc(s.blurb), body, crumbs: [['Stages', '/stages/']] });
}
stages.forEach((s, i) => out.set('stages/' + s.slug + '.html', stagePage(s, i)));

function stagesIndex() {
  const small = stages.filter((s) => !s.big), big = stages.filter((s) => s.big);
  const row = (s) => `    <li>${link(stagePath(s), s.name)} <span class="small">— ${esc(s.blurb)}</span></li>`;
  const body = `
  <p>${stages.length} stages to fight on in ${GAME}. Some have real edges to fall from, some have hazards (low gravity, lava, ice, wind, a roaming Evil Leafy), and the big maps scroll across several screens for team modes and the World Cup.</p>
  ${PLAY_BTN}
  <h2>Single-screen stages (${small.length})</h2>
  <div class="card"><ul class="facts" style="list-style:none;padding:0">
${small.map(row).join('\n')}
  </ul></div>
  <h2>Big maps (${big.length})</h2>
  <div class="card"><ul class="facts" style="list-style:none;padding:0">
${big.map(row).join('\n')}
  </ul></div>
  <p>Capture the Flag plays on its own huge maps, and the Level Creator in the game lets you build and test a stage of your own.</p>
  <p>${link('/fighters/', 'Fighters')} · ${link('/capture-the-flag.html', 'Capture the Flag')} · ${link('/world-cup.html', 'World Cup')}</p>`;
  return page({ path: 'stages/index.html', title: titleFor('All stages'),
    desc: clip(`The ${stages.length} stages of ${GAME}, a free browser BFDI fighting game: single-screen stages with edges and hazards, and big scrolling maps.`, 160),
    h1: 'Stages', lead: `Where the fights happen in ${GAME}.`, body });
}
out.set('stages/index.html', stagesIndex());

// ---- mode and info pages (text written from the game's How to Play, menus and changelog) -------------------------------------

function infoPage(path, title, desc, h1, lead, body) { out.set(path, page({ path, title, desc: clip(desc, 160), h1, lead, body })); }

infoPage('modes.html', titleFor('Game modes'),
  `Every mode in ${GAME}: free-for-all, teams, Capture the Flag, Boss Rush, World Cup, the Daily match, online rooms, training and a level creator.`,
  'Game modes', `Everything you can do in ${GAME}, a free browser platform fighter.`, `
  <p>${GAME} is a platform fighter: knock your opponents off the stage, and the higher their percentage, the further they fly. These are the modes on the select screen and the title menu.</p>
  ${PLAY_BTN}
  <h2>Free-for-all and Teams</h2>
  <p>The standard matches. Pick a fighter, a stage and the number of contestants, and fight CPUs of four skill levels or your friends online. Teams puts a team ring and a shape under every fighter so sides never depend on colour alone. Items can be turned off, low, normal or high.</p>
  <h2>${link('/capture-the-flag.html', 'Capture the Flag')}</h2>
  <p>Two teams, each hiding five flags on a huge map, then raiding the other side's. Jail and rescue, keys and doors, boosts, a planning menu, and a Flag Cup tournament of CPU teams.</p>
  <h2>${link('/boss-rush.html', 'Boss Rush')}</h2>
  <p>A co-op gauntlet: you and CPU allies against the shows' villains, each in an arena of their own.</p>
  <h2>${link('/world-cup.html', 'World Cup')}</h2>
  <p>A tournament of 16, 32 or 48 teams with a group stage and knockouts. Play it or watch it; solo, 2v2 or 3v3.</p>
  <h2>Daily match</h2>
  <p>A new challenge match every day, the same for everyone, with a Share button for the result.</p>
  <h2>${link('/online-play.html', 'Play with friends online')}</h2>
  <p>Create a room, share the four-letter code or the link, and your friends drop straight in. Multiplayer is online only: one keyboard per computer.</p>
  <h2>Learn: How to Play and Training</h2>
  <p>How to Play walks through the keys with a short practice; Training is a room with a dummy, a hitbox view and any damage you like. Every fighter card has an All moves tab, and the pause menu has a Move list.</p>
  <h2>Level Creator</h2>
  <p>Build your own stage and test how it feels.</p>
  <h2>Quests, Win Tokens and looks</h2>
  <p>Three quests a day and three a week pay Win Tokens, which buy looks in the Store. Looks never change how a fight plays. You unlock more fighters as you play.</p>
  <p>${link('/controls.html', 'Controls')} · ${link('/fighters/', 'Fighters')} · ${link('/stages/', 'Stages')}</p>`);

infoPage('boss-rush.html', titleFor('Boss Rush: fight the BFDI villains'),
  `Boss Rush in ${GAME}: team up with CPU allies against the object shows' villains, from the Announcer to Four, each in its own arena.`,
  'Boss Rush', 'Team up against the shows’ villains in a co-op gauntlet.', `
  <p>Boss Rush is the co-op mode of ${GAME}. Pick it on the select screen, choose your fighter, and you go into a gauntlet of boss fights with CPU teammates at your side. Each boss has a lot of health, a big body, and an arena of its own, so it plays nothing like an ordinary match.</p>
  ${PLAY_BTN}
  <h2>Who you fight</h2>
  <p>The bosses are the villains and hosts of Battle for Dream Island and Inanimate Insanity. The game's own notes name the Announcer, Four, Evil Leafy, MePhone4, Purple Face and the Purple Dragon, and a Speaker Box boss with a phase-three sonic blast. Every boss was rebuilt with clearer attacks and warnings, so each big move telegraphs before it lands.</p>
  <h2>How it plays</h2>
  <ul class="facts">
    <li>It is the one mode where you can play with a single human contestant: your allies are CPUs.</li>
    <li>Bosses keep their health across phases; read the warning, step aside, then punish.</li>
    <li>Your fighter's whole kit works: tilts, aerials, grabs, the smash, the finisher (V + C) and the Final Smash.</li>
    <li>After a clear, the result screen's Share button carries a brag line you can paste anywhere.</li>
    <li>Quitting to the title mid-gauntlet asks you to confirm, so a stray Escape does not throw the run away.</li>
  </ul>
  <h2>Tips</h2>
  <ul class="facts">
    <li>Heavier fighters survive longer against a boss's big hits; lighter ones get to the warning zones faster.</li>
    <li>Fighters with ranged attacks can keep chipping while a boss winds up (see each ${link('/fighters/', 'fighter guide')} for who has one).</li>
    <li>Hold Z to shield a telegraphed hit; the nine reflector fighters turn a boss's shots back instead.</li>
  </ul>
  <p>${link('/modes.html', 'All game modes')} · ${link('/world-cup.html', 'World Cup')} · ${link('/controls.html', 'Controls')}</p>`);

infoPage('world-cup.html', titleFor('World Cup tournaments'),
  `The World Cup in ${GAME}: 16, 32 or 48 teams, groups then knockouts, solo, 2v2 or 3v3, play it or watch it, with the stocks and CPU skill you set.`,
  'World Cup', 'A full tournament of CPU teams, with you in it or watching.', `
  <p>The World Cup is the tournament mode of ${GAME}. From the title screen you set up a cup, build or draw the teams, and kick it off. Every match of the cup is played out: you can play your own team's matches or watch any fixture with the camera following the action.</p>
  ${PLAY_BTN}
  <h2>The settings (from the Tournament Setup screen)</h2>
  <ul class="facts">
    <li><strong>Mode:</strong> Spectator (watch the whole cup) or Normal (you play).</li>
    <li><strong>Cup size:</strong> 16, 32 or 48 teams. The 48-team cup is 12 groups of 4, then knockouts.</li>
    <li><strong>Team size:</strong> Solo, 2v2 or 3v3; pick your teammates yourself or take a random draw.</li>
    <li><strong>CPU skill:</strong> Easy, Normal, Hard or Expert.</li>
    <li><strong>Stages:</strong> all, small only, big only, or pick the ones the cup may use.</li>
    <li><strong>Stocks:</strong> 1 to 3 in the groups, 1 to 5 in the knockouts; separate time limits for each, or none.</li>
    <li><strong>Items:</strong> off, low, normal or high.</li>
    <li><strong>Plays Camera:</strong> watching a match also plays the round's other matches, and the camera cuts to the best plays (K switches it).</li>
  </ul>
  <h2>The Flag Cup</h2>
  <p>From the same hub you can run a Flag Cup: a tournament of Capture the Flag matches between CPU teams you build. Each team has a strategist that settles on the plan most likely to beat its opponent on that map and learns as the cup goes on. Watch a fixture live or skip it and the cup simulates it.</p>
  <p>${link('/capture-the-flag.html', 'Capture the Flag')} · ${link('/stages/', 'Stages')} · ${link('/modes.html', 'All game modes')}</p>`);

infoPage('capture-the-flag.html', titleFor('Capture the Flag'),
  `Capture the Flag in ${GAME}: two teams hide five flags each on a huge map, then raid, jail and rescue. Play with CPUs or online with friends.`,
  'Capture the Flag', 'Hide your flags, build your base, then raid the other team’s.', `
  <p>Capture the Flag is a team mode of ${GAME} on huge maps of its own. Each side hides five flags, then the match proper begins: cross the map, find the other team's flags and carry them home while keeping yours safe. There are no stocks; a knockout is a trip home, or to the enemy's jail.</p>
  ${PLAY_BTN}
  <h2>How a match goes</h2>
  <ul class="facts">
    <li><strong>The hiding phase:</strong> every door stands open while you place your flags. <kbd>Space</kbd> puts your flag down or picks it up again, <kbd>P</kbd> opens the team planning menu, and <kbd>B</kbd> picks the next piece when you are building your side. Doors lock when the phase ends.</li>
    <li><strong>Jail and rescue:</strong> a knocked-out raider can end up in the enemy jail. A teammate who holds the jail door for two seconds frees them; after a jailbreak the door cannot be opened again for a while, and a prisoner is let out on their own after 90 seconds.</li>
    <li><strong>Keys, doors and boosts:</strong> coloured keys open matching doors, and boost pads give a super jump.</li>
    <li><strong>Carrying:</strong> everyone moves faster in this mode, but a flag carrier is slower and jumps less.</li>
    <li><strong>Radar:</strong> after three minutes with no capture, and every minute after, every flag still out is shown for five seconds.</li>
    <li><strong>Dashers:</strong> in this mode only, dash fighters such as Leafy, Liy and Woody can jump out of a dash for a hyper or a super, Celeste-style.</li>
  </ul>
  <h2>Maps and players</h2>
  <p>The game shipped two maps first, Castle Yoyleberry and Crystal Mines and Coral Deep, and matches run from 2 to 8 a side. Before your first match the game offers a short practice. You can play it online with friends from the same room code as any other match, and run a Flag Cup tournament of CPU teams from the World Cup hub.</p>
  <p>${link('/online-play.html', 'Online play')} · ${link('/world-cup.html', 'World Cup and Flag Cup')} · ${link('/controls.html', 'Controls')}</p>`);

infoPage('online-play.html', titleFor('Play online with friends'),
  `Online play in ${GAME}: create a room, share the 4-letter code or link, pick fighters in the lobby and fight. No account, no setup.`,
  'Play online with friends', 'A four-letter room code is all your friends need.', `
  <p>${GAME} has online multiplayer built in. Press <strong>Play with Friends</strong> on the title screen, create a room, and you get a four-letter room code. Share the code or the link and your friends drop straight in: no setup, no IP addresses, no account.</p>
  ${PLAY_BTN}
  <h2>In the lobby</h2>
  <ul class="facts">
    <li>Every player and their fighter show in the lobby; the host sets the mode, stage and rules and presses Start.</li>
    <li>Free-for-all, Teams and Capture the Flag can all be played online. Pick your sides before the match.</li>
    <li>The results screen shows each player, and the host can call a rematch.</li>
    <li>If someone is on an older build of the game, the lobby says who needs to refresh.</li>
    <li>Guests predict their own moves through held keys, so the game stays responsive on an ordinary connection.</li>
  </ul>
  <h2>One keyboard per computer</h2>
  <p>Multiplayer is online only: each player uses their own computer and keyboard, and joins the same room. There is no same-computer two-player mode.</p>
  <h2>Joining</h2>
  <p>Got a code? Open Play with Friends, type it into the box and press Enter, or open the link your friend shared. Pick your fighter from the portrait grid and wait for the host to start.</p>
  <p>${link('/capture-the-flag.html', 'Capture the Flag online')} · ${link('/faq.html', 'FAQ')} · ${link('/controls.html', 'Controls')}</p>`);

function controlsPage() {
  const order = ['left', 'right', 'jump', 'down', 'attack', 'special', 'smash', 'shield', 'pause', 'flag', 'plan', 'edit'];
  const rows = order.filter((k) => DEFAULT_KEYS[k]).map((k) => `    <tr><td><kbd>${esc(keyName(DEFAULT_KEYS[k]))}</kbd></td><td>${esc(KEY_LABELS[k] || k)}</td></tr>`).join('\n');
  const body = `
  <p>${GAME} is played on a computer with a keyboard. These are the default keys, read from the game's own key table; every one can be remapped on the Controls screen, and the remaps are saved on your computer. Multiplayer is online, so there is one set of keys.</p>
  ${PLAY_BTN}
  <h2>Default keys</h2>
  <div class="card"><table>
    <thead><tr><th>Key</th><th>What it does</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table></div>
  <h2>Combinations (from How to Play)</h2>
  <ul class="facts">
    <li><kbd>↑</kbd> jumps; press it twice for a double jump. A quick tap is a short hop, a held press a full jump.</li>
    <li><kbd>↑</kbd> or <kbd>↓</kbd> with <kbd>X</kbd> on the ground: tilts. In the air, any arrow with <kbd>X</kbd>: aerials.</li>
    <li><kbd>↑</kbd> + <kbd>C</kbd>: up special. <kbd>↓</kbd> + <kbd>C</kbd>: down special.</li>
    <li><kbd>X</kbd> + <kbd>C</kbd> close to a foe: grab. Then <kbd>X</kbd> pummels and an arrow throws.</li>
    <li><kbd>V</kbd>: smash. A ring fills for about half a second, then it goes off by itself toward the nearest foe. <kbd>↑</kbd> + <kbd>V</kbd>: up smash; <kbd>↓</kbd> + <kbd>V</kbd>: down smash. Some smashes break shields: watch for the glow.</li>
    <li><kbd>V</kbd> + <kbd>C</kbd>: finisher.</li>
    <li>Hold <kbd>Z</kbd>: shield (it blocks hits, not grabs). Tap <kbd>Z</kbd> while running: sprint. Nine strong fighters get a shot-turning reflector instead of a bubble.</li>
    <li><kbd>↓</kbd> in the air after the top of a jump: fast fall. Hold <kbd>↓</kbd> to drop through a platform.</li>
    <li>Against a wall in the air, hold toward it and press <kbd>↑</kbd>: wall jump (once per wall).</li>
    <li>When hit, hold a direction to bend your launch a little; tap directions during the hit freeze to slip out of a multi-hit move.</li>
  </ul>
  <p>The in-game How to Play page, the Move list on the pause menu and the All moves tab on every character card show each fighter's moves with their keys.</p>
  <p>${link('/fighters/', 'Fighters')} · ${link('/modes.html', 'Game modes')} · ${link('/faq.html', 'FAQ')}</p>`;
  infoPage('controls.html', titleFor('Controls and keyboard keys'),
    `Keyboard controls for ${GAME}: arrows move and jump, X attack, C special, V smash, Z shield and sprint, X + C grab, V + C finisher.`,
    'Controls', 'The default keys, and what they do together.', body);
}
controlsPage();

function whatsNewPage() {
  const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dateWords = (d) => { const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(d)); return m ? (m[3] ? String(+m[3]) + ' ' : '') + M[+m[2] - 1] + ' ' + m[1] : String(d); };
  const entries = CHANGELOG.map((e) => `  <h2>${esc(dateWords(e.date))}${e.version ? ` <span class="small">${esc(e.version)}</span>` : ''}</h2>
  <ul class="cl">
${e.items.map((t) => `    <li>${esc(t)}</li>`).join('\n')}
  </ul>`).join('\n');
  const latest = CHANGELOG[0];
  infoPage('whats-new.html', titleFor("What's new: updates and patch notes"),
    clip(`Every update to ${GAME}, newest first. Latest: ${latest.version}, ${dateWords(latest.date)}. New stages, fighters, modes and balance notes for the free browser BFDI fighter.`, 160),
    "What's new", 'The game’s own change list, newest first.', `
  <p>This is the same list the game shows under What's new, newest first. Balance notes name the fighters whose moves changed; the ${link('/fighters/', 'fighter guides')} carry the current move text.</p>
  ${PLAY_BTN}
${entries}
  <p>${link('/modes.html', 'Game modes')} · ${link('/stages/', 'Stages')} · ${link('/faq.html', 'FAQ')}</p>`);
}
whatsNewPage();

infoPage('faq.html', titleFor('FAQ: free BFDI fighting game questions'),
  `Answers about ${GAME}: is it free, download or account needed, phones, is it official, how to play online, how to report a bug.`,
  'Frequently asked questions', `Short, honest answers about ${GAME}.`, `
  ${PLAY_BTN}
  <h2>Is Battle for Smash Island free?</h2>
  <p>Yes. It is free to play in your browser, with no download, no account and no ads.</p>
  <h2>Do I need to download or install anything?</h2>
  <p>No. Open ${link(SITE + '/', 'smashisland.vercel.app')} in a browser on a computer and press Play. Your progress (unlocks, looks, key remaps) is saved on that computer by the browser.</p>
  <h2>Do I need an account?</h2>
  <p>No. There are no accounts and no sign-in, including for online play: a room code is all you share.</p>
  <h2>Does it work on a phone or tablet?</h2>
  <p>No. It is made for a computer with a keyboard, and it is not set up for touch screens.</p>
  <h2>Is this an official Battle for Dream Island or Inanimate Insanity game?</h2>
  <p>No. It is an unofficial fan game made by a fan of the object shows. Battle for Dream Island belongs to jacknjellify and Inanimate Insanity belongs to its creators; this game is not made or endorsed by them.</p>
  <h2>How do I play online with friends?</h2>
  <p>Press Play with Friends on the title screen and create a room. You get a four-letter room code; share it or the link, and your friends join from their own computers. The host picks the mode and stage and starts the match. See ${link('/online-play.html', 'online play')}.</p>
  <h2>How many fighters and stages are there?</h2>
  <p>${fighters.length} playable fighters from Battle for Dream Island and Inanimate Insanity, and ${stages.length} stages, plus the Capture the Flag maps and the Level Creator. You start with a few fighters and unlock more as you play. See the ${link('/fighters/', 'fighter list')} and the ${link('/stages/', 'stage list')}.</p>
  <h2>How do I report a bug or send feedback?</h2>
  <p>The game's Options screen has a Thanks roll and a tip jar, and the title screen has a Share button. For a bug, note the fighter, the stage, the mode and what happened, and send it to the owner through the channel where you found the game (the game is posted by its maker on BFDI fan communities). Keeping the description short and exact helps it get fixed.</p>
  <p>${link('/controls.html', 'Controls')} · ${link('/modes.html', 'Game modes')} · ${link('/about.html', 'About the game')}</p>`);

// ---- checks before anything is written -----------------------------------------------------------------------------------------

const titles = new Map(), descs = new Map();
for (const [p, html] of out) {
  const secret = textNamesSecrets(html);
  if (secret) fail(`${p} names ${secret}`);
  const t = /<title>([^<]*)<\/title>/.exec(html), d = /<meta name="description" content="([^"]*)">/.exec(html);
  if (!t || !d) fail(`${p}: no title or description`);
  if (t[1].length > 70) fail(`${p}: title over 70 characters (${t[1].length}): ${t[1]}`);
  if (d[1].length > 160) fail(`${p}: description over 160 characters (${d[1].length})`);
  if (titles.has(t[1])) fail(`${p}: title also used by ${titles.get(t[1])}`);
  if (descs.has(d[1])) fail(`${p}: description also used by ${descs.get(d[1])}`);
  titles.set(t[1], p); descs.set(d[1], p);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch (e) { fail(`${p}: JSON-LD does not parse`); } }
  // every internal link resolves to a page this run writes, or to one of the site's existing files
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    let h = m[1];
    if (h.startsWith(SITE)) h = h.slice(SITE.length) || '/';
    if (/^(https?:)?\/\//.test(h) || h.startsWith('#')) continue;
    const rel = h.replace(/^\//, '').replace(/\/$/, '/index.html') || 'index.html';
    if (!out.has(rel) && !existsSync(join(SRC, rel))) fail(`${p}: link ${m[1]} resolves to nothing`);
  }
}

// ---- sitemap and robots ----------------------------------------------------------------------------------------------------------

const urls = [['/', '1.0'], ['/about.html', '0.8']];
const order = (p) => (p === 'fighters/index.html' || p === 'stages/index.html' || p === 'modes.html' ? 0 : p.includes('/') ? 2 : 1);
for (const p of [...out.keys()].sort((a, b) => order(a) - order(b) || a.localeCompare(b))) {
  urls.push(['/' + p.replace(/index\.html$/, ''), order(p) === 0 ? '0.8' : order(p) === 1 ? '0.7' : '0.6']);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, pr]) => `  <url>
    <loc>${SITE}${u}</loc>
    <lastmod>${DATE}</lastmod>
    <priority>${pr}</priority>
  </url>`).join('\n')}
</urlset>
`;

// ---- writing ----------------------------------------------------------------------------------------------------------------------

for (const dir of ['fighters', 'stages']) {   // fully generated folders: stale pages (a renamed fighter) must not linger
  const d = join(SRC, dir);
  if (existsSync(d)) for (const f of readdirSync(d)) if (f.endsWith('.html')) rmSync(join(d, f));
  mkdirSync(d, { recursive: true });
}
for (const [p, html] of out) writeFileSync(join(SRC, p), html, 'utf8');
writeFileSync(join(SRC, 'sitemap.xml'), sitemap, 'utf8');
const robotsPath = join(SRC, 'robots.txt');
const robots = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf8') : '';
if (!/^Sitemap:\s*\S+/m.test(robots)) writeFileSync(robotsPath, (robots.trim() ? robots.replace(/\s*$/, '\n\n') : 'User-agent: *\nAllow: /\n\n') + `Sitemap: ${SITE}/sitemap.xml\n`, 'utf8');

const nFighters = fighters.length, nStages = stages.length, nInfo = out.size - nFighters - nStages - 2;
console.log(`wrote ${out.size} pages: ${nFighters} fighter pages + list, ${nStages} stage pages + list, ${nInfo} mode/info pages; sitemap ${urls.length} URLs; lastmod ${DATE}`);
