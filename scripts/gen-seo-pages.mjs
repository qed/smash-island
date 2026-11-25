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
//
// THE FIGHTER PAGES ARE THE WIKI (the owner, 2026-11-19: "update the 'wiki'"; the in-game Moves list is short "bcs the wiki that we
// have will have those details"). Each shows every move in full and a frame-data table per move. Those are NOT literal tables in
// the game: at boot it rescales MOVE_TEXT by each fighter's damage stat, rewrites the tilts and the movesets' lines, writes the
// smash, up/down smash, shield and Final Smash lines from code, and adds frame-data rows after the FB_FRAME_DATA literal. So they
// come from scripts/wiki-moves.json, which scripts/dump-wiki-moves.mjs reads from the RUNNING game (jsdom, dev only): the game's own
// moveRowsFor(r) words, its MV_SLOT -> FB_FRAME_DATA frames (what frameData returns), ZS / RF for the shield, statsFor for speeds.
// The file names the game build it came from; when index.html has changed since, this run re-reads it first (and fails if it cannot).
// A move with no frame row says "not measured"; no number on these pages is made up here.
//
// HITBOX PICTURES (the owner, 2026-11-19: "frame data is pictures of hitboxes, frame by frame"). Under each move's frame table is a strip,
// one panel per frame, of the fighter's hurtbox and every hit area live on that frame. The strips are SVG files in fighters/hitbox/,
// recorded from the RUNNING game by scripts/dump-hitboxes.mjs (jsdom, dev only; drawn by scripts/hitbox-svg.mjs), indexed in
// scripts/wiki-hitboxes.json with the game build they came from. When index.html has changed since, this run re-records them first
// (about half a minute); --skip-hitboxes keeps the old pictures instead and says so. Each picture this page uses must exist and pass
// the same secrecy check as the pages.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

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
const SHIELD_BREAKERS = monolith.includes('\nconst SHIELD_BREAKERS = ') ? readConst('SHIELD_BREAKERS') : {};   // (a game build without shield breakers has none to mention)
const REFLECTOR_FIGHTERS = new Set(readConst('REFLECTOR_FIGHTERS'));
const DEFAULT_KEYS = readConst('DEFAULT_KEYS');
const KEY_LABELS = readConst('KEY_LABELS');
const EVENT_LAPS = readConst('EVENT_LAPS');
// SHOW_ORDER names three prize fighters by variable: they evaluate to null here and are dropped.
const SHOW_ORDER = readConst('SHOW_ORDER', { PZ_A: null, PZ_B: null, PZ_C: null }).filter((x) => typeof x === 'string');

// ---- the moves, frame data and speeds, from the running game (see the header) -------------------------------------------------

const WIKI_FILE = join(ROOT, 'scripts', 'wiki-moves.json');
const gameSha = createHash('sha256').update(monolith).digest('hex');   // (the game's text with LF line endings, as dump-wiki-moves hashes it)
const readWiki = () => { try { return JSON.parse(readFileSync(WIKI_FILE, 'utf8')); } catch (e) { return null; } };
let WIKI = readWiki();
if (!WIKI || WIKI.gameSha256 !== gameSha) {
  console.log('scripts/wiki-moves.json is missing or older than the game: re-reading the moves (scripts/dump-wiki-moves.mjs)');
  try { execFileSync(process.execPath, [join(ROOT, 'scripts', 'dump-wiki-moves.mjs')], { stdio: 'inherit' }); }
  catch (e) { fail('could not re-read the moves from the game (scripts/dump-wiki-moves.mjs needs jsdom): ' + e.message); }
  WIKI = readWiki();
  if (!WIKI || WIKI.gameSha256 !== gameSha) fail('scripts/wiki-moves.json still does not match the game');
}
const MOVES = WIKI.fighters;

const HB_FILE = join(ROOT, 'scripts', 'wiki-hitboxes.json');
const HB_RENDER = (await import('./hitbox-svg.mjs')).RENDER_VERSION;
const readHb = () => { try { return JSON.parse(readFileSync(HB_FILE, 'utf8')); } catch (e) { return null; } };
let HB = readHb();
if (!HB || HB.gameSha256 !== gameSha || HB.render !== HB_RENDER) {
  if (argv.includes('--skip-hitboxes')) console.log('hitbox pictures are ' + (HB ? 'older than the game: KEPT AS THEY ARE (--skip-hitboxes)' : 'missing (--skip-hitboxes): pages get none'));
  else {
    console.log('the hitbox pictures are missing or older than the game: re-recording them (scripts/dump-hitboxes.mjs)');
    try { execFileSync(process.execPath, [join(ROOT, 'scripts', 'dump-hitboxes.mjs')], { stdio: 'inherit' }); }
    catch (e) { fail('could not record the hitbox pictures (scripts/dump-hitboxes.mjs needs jsdom; --skip-hitboxes keeps the old ones): ' + e.message); }
    HB = readHb();
    if (!HB || HB.gameSha256 !== gameSha) fail('scripts/wiki-hitboxes.json still does not match the game');
  }
}
const HB_MOVES = (HB && HB.moves) || {};

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
for (const r of fighters) if (!MOVES[r.name]) fail('scripts/wiki-moves.json has no moves for a public fighter: re-run scripts/dump-wiki-moves.mjs');
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
// the game's statsFor(name, weight): the fighter's own stat with the weight's effect, as a match uses it
function speedWords(k, what) {
  const cls = k >= 1.05 ? 'quick' : k <= 0.95 ? 'slow' : 'average';
  return { cls, text: `${cls} (${(+k).toFixed(2)}× the base ${what})` };
}
const runWords = (r) => speedWords(MOVES[r.name].stats.run, 'ground run');
const airWords = (r) => speedWords(MOVES[r.name].stats.air, 'air speed');
const specialName = (r) => (r.kit && r.kit.desc ? r.kit.desc.split(' → ')[0].trim() : 'Special');
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
  const text = MOVES[r.name].rows.filter((x) => x.key !== 'Z' && x.key !== 'Movetech').map((x) => x.text).join(' ');
  const out = [];
  for (const [re, word] of STATUS_WORDS) if (re.test(text) && !out.includes(word)) out.push(word);
  return out;
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
  .move{ margin:0 0 6px; padding-top:4px }
  .move h3{ margin:14px 0 4px }
  .move h3 kbd{ margin-left:6px; font-size:13px }
  table.fd{ width:auto; margin:2px 0 12px; font-size:14px }
  table.fd th{ color:var(--muted); font-weight:700 }
  table.fd td,table.fd th{ padding:3px 12px 3px 0 }
  .hb{ margin:0 0 14px }
  .hb img{ display:block; max-width:100%; height:auto; border-radius:8px; background:#0e131c }
  .hb p{ margin:4px 0 0 }
  .key{ display:inline-block; width:12px; height:12px; border-radius:3px; vertical-align:-1px; margin:0 4px 0 10px }
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
const aAn = (w) => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
// the game's move inputs (moveRowsFor's keys) -> plain names
const MOVE_NAMES = { 'X': 'Jab', '←/→ + X': 'Side tilt', '↑ + X': 'Up tilt', '↓ + X': 'Down tilt', 'X in the air': 'Neutral air',
  '→ + X in the air': 'Forward air', 'turn round + X in the air': 'Back air', '↑ + X in the air': 'Up air', '↓ + X in the air': 'Down air',
  'X + C': 'Grab', 'X, holding': 'Pummel', '→, holding': 'Forward throw', '←, holding': 'Back throw', '↑, holding': 'Up throw', '↓, holding': 'Down throw',
  'C': 'Neutral special', '←/→ + C': 'Side special', '↑ + C': 'Up special', '↓ + C': 'Down special',
  'V': 'Smash', '↑ + V': 'Up smash', '↓ + V': 'Down smash', 'V + C': 'Finisher', 'Final Smash': 'Final Smash', 'Movetech': 'Movement tech' };
const NO_KEY = new Set(['Final Smash', 'Movetech']);
const MOVE_GROUPS = [
  ['Ground attacks', (k) => k === 'X' || / \+ X$/.test(k)],
  ['Air attacks', (k) => / in the air$/.test(k)],
  ['Grab and throws', (k) => k === 'X + C' || /, holding$/.test(k)],
  ['Specials', (k) => k === 'C' || (/ \+ C$/.test(k) && k !== 'V + C')],
  ['Smashes and finisher', (k) => /V/.test(k)],
  ['Shield, Final Smash and movement', () => true],
];
const fdTable = (head, cells) => `<table class="fd"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody><tr>${cells.map((c) => `<td>${esc(c)}</td>`).join('')}</tr></tbody></table>`;
const FD_HEAD = ['Startup', 'Active', 'End lag (miss)', 'End lag (hit)'];
// a row's frames, as the game's table has them ([startup, active, endLagWhiff, endLagHit]; -1 = not measured), with the startup COUNTED FROM
// THE PRESS (row.pressStartup, the game's frameDataPress: frame 1 = the frame after the press). A move that never connects: row.act, from the press.
function frameHtml(row, m) {
  if (row.key === 'Z') {
    const z = m.z;
    return z.kind === 'reflector'
      ? fdTable(['Comes up', 'Lasts', 'End lag', 'Again after'], [z.start, `up to ${z.active}, while Z is held`, z.endLag, `${z.cd} more`])
      : fdTable(['Comes up', 'Lasts', 'End lag (dropping it)'], [z.start, 'while Z is held', z.endLag]);
  }
  if (/^The neutral (attack|special), aimed that way/.test(row.text)) return `<p class="small">The same move as ${row.key.includes('X') ? 'X' : 'C'}, aimed${row.aimStartup != null ? `: its hit comes ${row.aimStartup} frames after the press` : row.aimAct != null ? `: you can act ${row.aimAct} frames after the press` : ''}.</p>`;
  const f = row.frames;
  if (row.pummel) return `<p class="small">The first pummel lands ${row.pummel.startup + 1} frame${row.pummel.startup ? 's' : ''} after the press, then one every ${row.pummel.every} frames while X is held.</p>`;
  if ((!f || !(f[0] >= 0)) && row.act != null) return `<p class="small">No hit: you can act again ${row.act} frames after the press.</p>`;
  if (!f || !(f[0] >= 0)) return '<p class="small">Frame data: not measured.</p>';   // (every row in the table is measured; a 0 startup is a real frame-0 hit)
  const cell = (v) => (v < 0 ? 'not measured' : String(v));
  return /throw$/.test(row.slot || '')
    ? fdTable(FD_HEAD, ['from the hold', '–', 'a throw cannot miss', cell(f[3])])
    : fdTable(FD_HEAD, [cell(row.pressStartup != null ? row.pressStartup : f[0]), cell(f[1]), cell(f[2]), cell(f[3])]);
}
// The hitbox strip under a move (scripts/dump-hitboxes.mjs). Numbers in its caption come from the same recording as the picture.
const SMASH_SLOTS = new Set(['smash', 'usmash', 'dsmash']);
function hitboxHtml(r, row) {
  const h = HB_MOVES[r.name + '|' + row.key];
  if (!h || !h.file || !existsSync(join(SRC, 'fighters', 'hitbox', h.file))) return '';
  const nm = MOVE_NAMES[row.key] || row.key;
  const parts = [];
  if (h.firstBox == null) parts.push('No hit area shows on a miss: this move only puts one out near a foe, or tests its hit in a way the picture cannot show.');
  else {
    parts.push(h.firstBox === 0 ? 'Hit area out from frame 0.' : `Startup frames 0–${h.firstBox - 1}, hit area out on frame ${h.firstBox}${h.lastBox > h.firstBox ? `–${h.lastBox}` : ''}.`);
    if (h.freeAt != null && h.freeAt > h.lastBox) parts.push(`End lag to frame ${h.freeAt - 1}; free on frame ${h.freeAt}.`);
    else if (h.freeAt != null && h.firstBox < h.freeAt) parts.push(`Free to act on frame ${h.freeAt} while its hit area is still out; the strip stops there.`);
    else if (h.freeAt != null) parts.push(`Free to act on frame ${h.freeAt}, before its hit comes out (dimmed panels).`);
  }
  if (h.roll) parts.push('A chance move: this is a roll where it hits (its miss roll puts out no hit area).');
  if (h.inset > 0) parts.push(`Its body hit lands only ${h.inset} px inside the red outline.`);
  if (h.every > 1) parts.push(`End lag shown every ${h.every} frames.`);
  if (SMASH_SLOTS.has(row.slot)) parts.push('Frame 0 here is the release: the charge before it is not shown (the table’s startup counts the full charge).');
  return `<div class="hb"><img src="/fighters/hitbox/${esc(h.file)}" width="${h.w}" height="${h.h}" loading="lazy" decoding="async" alt="${esc(`${r.name}'s ${nm}: hurtbox and hit areas frame by frame`)}">
    <p class="small">${esc(parts.join(' '))}</p></div>`;
}
const HB_LEGEND = [['#3f7d5a', 'startup'], ['#b8332b', 'hit area out'], ['#46557a', 'end lag'], ['#ffd23f', 'hurtbox'], ['#ff4d3d', 'hit'], ['#3b9cff', 'grab'],
  ['#ffa630', 'shot or trap (dashed: trap)'], ['#c49bff', 'pull (dashed)'], ['#4ade80', 'invincible'], ['#e879f9', 'armour'], ['#22d3ee', 'counter or reflect']]
  .map(([c, t]) => `<span class="key" style="background:${c}"></span>${esc(t)}`).join(' ');
function fighterPage(r, i) {
  const m = MOVES[r.name];
  const show = showOf(r), wc = weightClass(r.w), run = runWords(r), air = airWords(r), st = statuses(r);
  const prev = fighters[(i - 1 + fighters.length) % fighters.length], next = fighters[(i + 1) % fighters.length];
  const title = titleFor(`${r.name} – ${showShort(r)} fighter guide`);
  const desc = clip(`${r.name} in ${GAME}: ${aAn(r.arch.toLowerCase())} from ${show}. Every move in full with frame data (${specialName(r)}, smashes, finisher), weight and speed.`, 160);
  const nameOf = (row) => (row.key === 'Z' ? (m.z.kind === 'reflector' ? 'Reflector' : 'Shield') : MOVE_NAMES[row.key] || row.key);
  const groups = MOVE_GROUPS.map(([g]) => [g, []]);
  for (const row of m.rows) { const gi = MOVE_GROUPS.findIndex(([, t]) => t(row.key)); groups[gi][1].push(row); }
  const moveHtml = (row) => {
    const nm = nameOf(row);
    return `    <div class="move"><h3>${esc(nm)}${NO_KEY.has(row.key) ? '' : `<kbd>${esc(row.key)}</kbd>`}</h3>
    <p>${esc(safeLine(row.text, nm))}</p>
    ${frameHtml(row, m)}${hitboxHtml(r, row)}</div>`;
  };
  const tips = [
    SHIELD_BREAKERS[r.kit.special] ? 'The smash breaks a raised shield in one hit.' : 'The smash does not break shields: wear the bubble down or grab.',
    st.length ? `Effects: ${st.join(', ')}.` : 'Effects: plain damage and knockback.',
  ];
  const sim = similar(r);
  const body = `
  <p>${esc(r.name)} is ${esc(aAn(r.arch))} from ${esc(show)}. In one line: <em>${esc(r.kit.desc)}</em></p>
  ${PLAY_BTN}
  <h2>Stats</h2>
  <div class="card"><table>
    <tbody>
    <tr><th>Weight</th><td>${esc(r.w)} (${esc(wc)}; lighter fighters fly further from the same hit)</td></tr>
    <tr><th>Ground speed</th><td>${esc(run.text)}</td></tr>
    <tr><th>Air speed</th><td>${esc(air.text)}</td></tr>
    </tbody>
  </table></div>
  <h2>${esc(r.name)}'s moves</h2>
  <p class="small">Every move in full, in the game's own words. Damage is the first hit on a standing foe. Frames are 1/60 of a second, counted from the press: startup is the frames from the key press to the hit (1 = the frame right after it), active is how long it can hit, end lag is how long you cannot act after. "Not measured" means the game has no frame numbers for that move yet. In the game, the fighter card and the pause menu have a short Moves list.</p>
  ${Object.keys(HB_MOVES).some((k) => k.startsWith(r.name + '|')) ? `<p class="small"><strong>Hitboxes frame by frame.</strong> Under each move: one panel per frame, from frame 0 (the frame the move starts; the press can wait a few frames before that, which the table counts) to the end of its end lag, recorded from the game itself on a miss (a still foe far away), with the camera on the fighter and the ground as a grey line. The number on each panel is its frame; … means frames were skipped. Throws, the pummel, the shield and the Final Smash have no strip. Colours:</p>
  <p class="small">${HB_LEGEND}</p>` : ''}
${groups.filter(([, rows]) => rows.length).map(([g, rows]) => `  <h2>${esc(g)}</h2>
  <div class="card">
${rows.map(moveHtml).join('\n')}
  </div>`).join('\n')}
  <h2>Tips</h2>
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
  <p>${link('/fighters/', 'All fighters')} · ${link('/stages/', 'Stages')} · ${link('/controls.html', 'Controls')}</p>`;
  return page({ path: 'fighters/' + r.slug + '.html', title, desc, h1: r.name, lead: `${esc(r.arch)} · ${esc(show)}`, body,
    crumbs: [['Fighters', '/fighters/']],
    jsonldExtra: { mainEntity: { '@type': 'Thing', name: r.name, description: `${r.arch}: ${r.kit.desc}` } } });
}
fighters.forEach((r, i) => out.set('fighters/' + r.slug + '.html', fighterPage(r, i)));

function fightersIndex() {
  const groups = [['Battle for Dream Island', fighters.filter((r) => !r.dlc)], ['Inanimate Insanity', fighters.filter((r) => r.dlc)]];
  const body = `
  <p>${fighters.length} fighters, by show. Click a name for every move in full, frame data, weight and speed. You start with a few and unlock more as you play, and you can make your own characters (OCs) in the game.</p>
  ${PLAY_BTN}
${groups.map(([show, list]) => `  <h2>${esc(show)} (${list.length})</h2>
  <div class="card"><ul class="grid">
${list.map((r) => `    <li>${link(fighterPath(r), r.name)}</li>`).join('\n')}
  </ul></div>`).join('\n')}
  <p>Every fighter has a role (zoner, brawler, grappler, trapper and more). Weight runs from ${Math.min(...fighters.map((r) => r.w))} to ${Math.max(...fighters.map((r) => r.w))}: lighter fighters fly further from the same hit.</p>
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
  ${PLAY_BTN}
  <h2>What it is like</h2>
  <ul class="facts">
${facts.map((f) => `    <li>${esc(f)}</li>`).join('\n')}
  </ul>
  <p class="small">This is a plain match; in Teams and Capture the Flag the arena can differ.</p>
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

const HAZARD_SHORT = { lowgrav: 'low gravity', evilleafy: 'a roaming Evil Leafy', lava: 'lava', ice: 'ice', shift: 'shifting ground', wind: 'wind' };
function stagesIndex() {
  const small = stages.filter((s) => !s.big), big = stages.filter((s) => s.big);
  const hz = [...new Set(stages.map((s) => HAZARD_SHORT[s.hazard]).filter(Boolean))];
  const row = (s) => `    <li>${link(stagePath(s), s.name)} <span class="small">— ${esc(s.blurb)}</span></li>`;
  const body = `
  <p>${stages.length} stages. Some have edges to fall from${hz.length ? ` or hazards (${hz.join(', ')})` : ''}; the big maps scroll across several screens.</p>
  ${PLAY_BTN}
  <h2>Single-screen stages (${small.length})</h2>
  <div class="card"><ul class="facts" style="list-style:none;padding:0">
${small.map(row).join('\n')}
  </ul></div>
  <h2>Big maps (${big.length})</h2>
  <div class="card"><ul class="facts" style="list-style:none;padding:0">
${big.map(row).join('\n')}
  </ul></div>
  <p>Capture the Flag has its own huge maps, and the Level Creator lets you build a stage of your own.</p>
  <p>${link('/fighters/', 'Fighters')} · ${link('/capture-the-flag.html', 'Capture the Flag')} · ${link('/world-cup.html', 'World Cup')}</p>`;
  return page({ path: 'stages/index.html', title: titleFor('All stages'),
    desc: clip(`The ${stages.length} stages of ${GAME}, a free browser BFDI fighting game: single-screen stages with edges and hazards, and big scrolling maps.`, 160),
    h1: 'Stages', lead: `Where the fights happen in ${GAME}.`, body });
}
out.set('stages/index.html', stagesIndex());

// ---- mode and info pages (short, plain; checked against the game's menus, How to Play and changelog, 2026-11-18) ---------------

function infoPage(path, title, desc, h1, lead, body) { out.set(path, page({ path, title, desc: clip(desc, 160), h1, lead, body })); }
const BOSS_NAMES = readConst('BOSS_ROSTER').map((b) => b.name);
const CTF_MAP_NAMES = [...monolith.matchAll(/\nCTF_MAPS\.\w+ = \{\n\s*name:'([^']+)'([^\n]*)/g)].filter((m) => !/wip:\s*true/.test(m[2])).map((m) => m[1]);
const listWords = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
const nReflect = REFLECTOR_FIGHTERS.size;

infoPage('modes.html', titleFor('Game modes'),
  `Every mode in ${GAME}: free-for-all, teams, Capture the Flag, Boss Rush, World Cup, weekly events, the Daily match, online rooms, your own OCs and training.`,
  'Game modes', `Everything you can do in ${GAME}.`, `
  <p>Knock your opponents off the stage: the higher their %, the further they fly.</p>
  ${PLAY_BTN}
  <h2>Free-for-all and Teams</h2>
  <p>Pick a fighter and a stage, and fight CPUs (Easy to Expert) or friends online. Some stages have big Teams maps of their own.</p>
  <h2>${link('/capture-the-flag.html', 'Capture the Flag')}</h2>
  <p>Two teams hide five flags each on a huge map, then raid the other side.</p>
  <h2>${link('/boss-rush.html', 'Boss Rush')}</h2>
  <p>You and CPU allies against ${BOSS_NAMES.length} bosses from the shows, one after another.</p>
  <h2>${link('/world-cup.html', 'World Cup')}</h2>
  <p>A tournament of teams: groups, then knockouts. Play your team's matches or watch.</p>
  <h2>Weekly events</h2>
  <p>Each week has an event fighter. Its event matches end in a contest with its own map and goal, and earn event tokens toward unlocking that fighter.</p>
  <h2>Daily match</h2>
  <p>One new challenge match a day, the same for everyone.</p>
  <h2>${link('/online-play.html', 'Online')}</h2>
  <p>Make a room and share the four-letter code. Each player uses their own computer.</p>
  <h2>Your own characters (OCs)</h2>
  <p>Make up to eight in the editor and play them in Free-for-all and Teams, against CPUs or online.</p>
  <h2>How to Play and Training</h2>
  <p>Learn on the title screen opens How to Play: your keys and a short Try it, with Training (a dummy, hitboxes, any damage) and a Capture the Flag practice. Each fighter card, and the pause menu, has one short Moves list with frame data.</p>
  <h2>Level Creator</h2>
  <p>Build a stage and test it.</p>
  <h2>Quests, looks and stats</h2>
  <p>Daily and weekly quests pay Win Tokens, spent on looks in the Store. Looks never change a fight. The Stats screen shows your most-played fighters, wins and best World Cup run.</p>
  <p>${link('/controls.html', 'Controls')} · ${link('/fighters/', 'Fighters')} · ${link('/stages/', 'Stages')}</p>`);

infoPage('boss-rush.html', titleFor('Boss Rush: fight the BFDI villains'),
  `Boss Rush in ${GAME}: team up with CPU allies against ${BOSS_NAMES.length} bosses from the object shows, from the ${BOSS_NAMES[0]} to ${BOSS_NAMES[BOSS_NAMES.length - 1]}, each in its own arena.`,
  'Boss Rush', 'A co-op gauntlet against the shows’ villains.', `
  <p>Pick Boss Rush on the select screen. You and CPU allies fight the bosses one after another; each has lots of health and an arena of its own.</p>
  ${PLAY_BTN}
  <h2>The bosses</h2>
  <p>${BOSS_NAMES.length}, in order: ${esc(listWords(BOSS_NAMES))}.</p>
  <h2>Tips</h2>
  <ul class="facts">
    <li>Big attacks warn you first: step aside, then hit back. The biggest ones leave you room or time to dodge.</li>
    <li>Your whole kit works, Final Smash included.</li>
    <li>Hold Z to shield; the ${nReflect} reflector fighters send a boss's shots back instead.</li>
  </ul>
  <p>${link('/modes.html', 'All game modes')} · ${link('/fighters/', 'Fighter guides')} · ${link('/controls.html', 'Controls')}</p>`);

infoPage('world-cup.html', titleFor('World Cup tournaments'),
  `The World Cup in ${GAME}: 16, 32 or 48 teams, groups then knockouts, solo, 2v2 or 3v3. Play your team's matches or watch the whole cup.`,
  'World Cup', 'A tournament of teams, with you in it or watching.', `
  <p>Press World Cup on the title screen, set up the cup and kick it off. Play your own team's matches, or watch.</p>
  ${PLAY_BTN}
  <h2>Setup</h2>
  <p>Three choices: <strong>Mode</strong> (Spectator, or Normal where you play), <strong>Team size</strong> (Solo, 2v2 or 3v3) and <strong>CPU skill</strong> (Easy to Expert). <strong>More options</strong> has the rest: 16, 32 or 48 teams, your teammates, stages, stocks, time limits, items and the Plays Camera.</p>
  <p>Groups come first, then knockouts, shown on a bracket.</p>
  <h2>The Flag Cup</h2>
  <p>From the same screen: a cup of Capture the Flag matches between CPU teams you build. Watch a match or skip it and it is played out for you.</p>
  <p>${link('/capture-the-flag.html', 'Capture the Flag')} · ${link('/stages/', 'Stages')} · ${link('/modes.html', 'All game modes')}</p>`);

infoPage('capture-the-flag.html', titleFor('Capture the Flag'),
  `Capture the Flag in ${GAME}: two teams hide five flags each on a huge map, then raid, jail and rescue. Play with CPUs or online with friends.`,
  'Capture the Flag', 'Hide your flags, then raid the other team’s.', `
  <p>Each side hides five flags, then tries to carry the other side's flags home. There are no stocks: a knockout sends you home, or to the enemy jail.</p>
  ${PLAY_BTN}
  <h2>How it plays</h2>
  <ul class="facts">
    <li>Hiding: <kbd>Space</kbd> puts your flag down or picks it up; <kbd>P</kbd> opens the team plan. Doors lock when hiding ends.</li>
    <li>Jail: a teammate who holds the jail door for two seconds frees you; otherwise you walk out after 90 seconds.</li>
    <li>Keys open locked doors; boost pads give a super jump. Flag carriers are slower and jump less.</li>
    <li>Radar: after three minutes with no capture, and every minute after, every flag still out shows for five seconds.</li>
  </ul>
  <h2>Maps</h2>
  <ul class="facts">
${CTF_MAP_NAMES.map((m) => `    <li>${esc(m)}</li>`).join('\n')}
  </ul>
  <p>Play with CPUs or online, and practise first from How to Play.</p>
  <p>${link('/online-play.html', 'Online play')} · ${link('/world-cup.html', 'World Cup and Flag Cup')} · ${link('/controls.html', 'Controls')}</p>`);

infoPage('online-play.html', titleFor('Play online with friends'),
  `Online play in ${GAME}: create a room, share the 4-letter code or link, pick fighters in the lobby and fight. No account, no setup.`,
  'Play online with friends', 'A four-letter room code is all your friends need.', `
  <p>Press <strong>Play with Friends</strong> on the title screen and create a room. Share the four-letter code or the link; friends type the code or open the link to join. No account, no setup.</p>
  ${PLAY_BTN}
  <h2>In the room</h2>
  <ul class="facts">
    <li>Everyone picks a fighter in the lobby; the host sets the mode, stage and rules and starts.</li>
    <li>Free-for-all, Teams and Capture the Flag all work online, and so do your OCs in Free-for-all and Teams.</li>
    <li>Each player uses their own computer and keyboard; there is no same-computer mode.</li>
  </ul>
  <p>${link('/capture-the-flag.html', 'Capture the Flag')} · ${link('/faq.html', 'FAQ')} · ${link('/controls.html', 'Controls')}</p>`);

function controlsPage() {
  const order = ['left', 'right', 'jump', 'down', 'attack', 'special', 'smash', 'shield', 'pause', 'flag', 'plan', 'edit'];
  const rows = order.filter((k) => DEFAULT_KEYS[k]).map((k) => `    <tr><td><kbd>${esc(keyName(DEFAULT_KEYS[k]))}</kbd></td><td>${esc(KEY_LABELS[k] || k)}</td></tr>`).join('\n');
  const body = `
  <p>The default keys, from the game's own key table. Every key can be changed on the Controls screen; changes are saved on your computer.</p>
  ${PLAY_BTN}
  <h2>Default keys</h2>
  <div class="card"><table>
    <thead><tr><th>Key</th><th>What it does</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table></div>
  <h2>Combinations</h2>
  <ul class="facts">
    <li><kbd>↑</kbd> jumps; press it again in the air to double jump. A quick tap is a short hop.</li>
    <li><kbd>↑</kbd> or <kbd>↓</kbd> with <kbd>X</kbd>: tilts. In the air, an arrow with <kbd>X</kbd>: aerials. <kbd>↑</kbd> or <kbd>↓</kbd> with <kbd>C</kbd>: up or down special.</li>
    <li><kbd>X</kbd> + <kbd>C</kbd> near a foe: grab. <kbd>V</kbd>: smash (with <kbd>↑</kbd> or <kbd>↓</kbd>: up or down smash). <kbd>V</kbd> + <kbd>C</kbd>: finisher.</li>
    <li>Hold <kbd>Z</kbd>: shield (blocks hits, not grabs). Tap <kbd>Z</kbd> while running: sprint. ${nReflect} strong fighters get a reflector instead.</li>
    <li><kbd>↓</kbd> in the air after the top of a jump: fall faster. Hold <kbd>↓</kbd> on a platform: drop through it.</li>
  </ul>
  <p>Each fighter's moves are on the fighter card's Moves list and the pause menu's Move list, and in full, with frame data, on its ${link('/fighters/', 'fighter page')}.</p>
  <p>${link('/fighters/', 'Fighters')} · ${link('/modes.html', 'Game modes')} · ${link('/faq.html', 'FAQ')}</p>`;
  infoPage('controls.html', titleFor('Controls and keyboard keys'),
    `Keyboard controls for ${GAME}: arrows move and jump, X attack, C special, V smash, Z shield and sprint, X + C grab, V + C finisher.`,
    'Controls', 'The default keys, and what they do together.', body);
}
controlsPage();

function whatsNewPage() {
  const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dateWords = (d) => { const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(d)); return m ? (m[3] ? String(+m[3]) + ' ' : '') + M[+m[2] - 1] + ' ' + m[1] : String(d); };
  // the numbered Updates only (Update 1, 3 November 2026, onward), word for word as the game's What's new screen prints them; the older notes stay in the game
  const ups = CHANGELOG.filter((e) => /^Update \d+$/.test(e.version || ''));
  const entries = ups.map((e) => `  <h2>${esc(e.version)} <span class="small">${esc(dateWords(e.date))}</span></h2>
  <ul class="cl">
${e.items.map((t) => `    <li>${esc(t)}</li>`).join('\n')}
  </ul>`).join('\n');
  const latest = CHANGELOG[0];
  infoPage('whats-new.html', titleFor("What's new: updates and patch notes"),
    clip(`Every update to ${GAME}, newest first. Latest: ${latest.version}, ${dateWords(latest.date)}. New stages, fighters, modes and balance notes for the free browser BFDI fighter.`, 160),
    "What's new", 'The game’s own update notes, newest first.', `
  ${PLAY_BTN}
${entries}
  <p class="small">Older notes, from before Update 1, are on the game's Changelog screen.</p>
  <p>${link('/modes.html', 'Game modes')} · ${link('/fighters/', 'Fighter guides')} · ${link('/faq.html', 'FAQ')}</p>`);
}
whatsNewPage();

infoPage('faq.html', titleFor('FAQ: free BFDI fighting game questions'),
  `Answers about ${GAME}: is it free, download or account needed, phones, is it official, how to play online, how to report a bug.`,
  'Frequently asked questions', `Short answers about ${GAME}.`, `
  ${PLAY_BTN}
  <h2>Is it free?</h2>
  <p>Yes: free in your browser, with no download, no account and no ads.</p>
  <h2>Do I need to install anything or make an account?</h2>
  <p>No. Open ${link(SITE + '/', 'smashisland.vercel.app')} on a computer and press Play. Your progress is saved on that computer by the browser. Online play needs only a room code.</p>
  <h2>Does it work on a phone or tablet?</h2>
  <p>No. It is made for a computer with a keyboard.</p>
  <h2>Is it an official BFDI or Inanimate Insanity game?</h2>
  <p>No. It is an unofficial fan game, not made or endorsed by the shows' creators.</p>
  <h2>How do I play online?</h2>
  <p>Press Play with Friends, create a room and share the four-letter code. See ${link('/online-play.html', 'online play')}.</p>
  <h2>How many fighters and stages are there?</h2>
  <p>${fighters.length} fighters and ${stages.length} stages, plus the Capture the Flag maps, your own OCs and the Level Creator. You unlock more fighters as you play. See the ${link('/fighters/', 'fighters')} and ${link('/stages/', 'stages')}.</p>
  <h2>Can I support the game?</h2>
  <p>The game is free and sells nothing. The maker's tip jar is a small Support the dev link at the foot of the title screen; it shows once the maker has set it up. A tip is optional and changes nothing in the game. Supporters who agree can be thanked by name in the Thanks list in Settings.</p>
  <h2>How do I report a bug?</h2>
  <p>Tell the maker where you found the game. Say the fighter, the stage, the mode and what happened.</p>
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

// every hitbox picture a page uses exists, and says nothing the pages may not
for (const [p, html] of out) for (const m of html.matchAll(/<img src="\/(fighters\/hitbox\/[^"]+)"/g)) {
  const f = join(SRC, m[1]);
  if (!existsSync(f)) fail(`${p}: picture ${m[1]} is missing`);
  const secret = textNamesSecrets(readFileSync(f, 'utf8'));
  if (secret) fail(`${m[1]} names ${secret}`);
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

// fully generated folders: a stale page (a renamed fighter) must not linger. Only pages this run does NOT write are removed, and
// only with --prune; without it they are listed and kept (pages this run writes are simply overwritten).
const PRUNE = argv.includes('--prune');
for (const dir of ['fighters', 'stages']) {
  const d = join(SRC, dir);
  if (existsSync(d)) for (const f of readdirSync(d)) if (f.endsWith('.html') && !out.has(dir + '/' + f)) {
    if (PRUNE) rmSync(join(d, f)); else console.log('stale page kept (run with --prune to remove): ' + dir + '/' + f);
  }
  mkdirSync(d, { recursive: true });
}
for (const [p, html] of out) writeFileSync(join(SRC, p), html, 'utf8');
writeFileSync(join(SRC, 'sitemap.xml'), sitemap, 'utf8');
const robotsPath = join(SRC, 'robots.txt');
const robots = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf8') : '';
if (!/^Sitemap:\s*\S+/m.test(robots)) writeFileSync(robotsPath, (robots.trim() ? robots.replace(/\s*$/, '\n\n') : 'User-agent: *\nAllow: /\n\n') + `Sitemap: ${SITE}/sitemap.xml\n`, 'utf8');

const nFighters = fighters.length, nStages = stages.length, nInfo = out.size - nFighters - nStages - 2;
console.log(`wrote ${out.size} pages: ${nFighters} fighter pages + list, ${nStages} stage pages + list, ${nInfo} mode/info pages; sitemap ${urls.length} URLs; lastmod ${DATE}`);
