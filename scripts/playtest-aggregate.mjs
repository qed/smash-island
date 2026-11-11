#!/usr/bin/env node
// Aggregates the per-process playtest JSON of a big run into summary.md and one log per persona.
//   node scripts/playtest-aggregate.mjs --in playtest-out/big [--report-dir DIR] [--partial]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PERSONA_LIST, PERSONA_BY_TAG } from './helpers/personas.mjs';
import { THRESH } from './helpers/jank.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = process.argv.slice(2);
let IN = 'playtest-out/big', REP = 'C:/Users/carad/Aardvark/smash-island/smash-bal/reports/playtest-v2', PARTIAL = false;
for (let i = 0; i < A.length; i++) { if (A[i] === '--in') IN = A[++i]; else if (A[i] === '--report-dir') REP = A[++i]; else if (A[i] === '--partial') PARTIAL = true; }
const runsDir = path.resolve(ROOT, IN, 'runs');
const files = [];
if (existsSync(runsDir)) for (const d of readdirSync(runsDir)) { const dd = path.join(runsDir, d); if (!statSync(dd).isDirectory()) continue; for (const f of readdirSync(dd)) if (f.endsWith('.json') && f !== 'coverage.json') files.push(path.join(dd, f)); }
const R = []; for (const f of files) { try { R.push(JSON.parse(readFileSync(f, 'utf8'))); } catch (e) { /* being written */ } }
const N = PERSONA_LIST.length;
const med = (a) => { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y); return b[b.length >> 1]; };
const q = (a, p) => { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(b.length * p))]; };
const pct = (x, n) => n ? Math.round(100 * x / n) + '%' : '-';

// ---- merge findings by root cause
const F = new Map();
const cantRe = /^([^:]+): "([^"]+)" was pressed on a ready fighter and nothing happened for 14 frames$/;
for (const r of R) for (const f0 of r.findings || []) {
  let f = f0, who = null;
  { const m = f0.kind === 'cant' && cantRe.exec(f0.msg); if (m) { who = m[1]; f = { ...f0, rc: 'cant|' + m[2], msg: `${m[2]} was pressed on a ready fighter and nothing happened for 14 frames (fighters listed below)` }; } }
  const key = f.sev + '|' + f.kind + '|' + (f.rc || f.msg);
  let e = F.get(key); if (!e) { e = { sev: f.sev, kind: f.kind, rc: f.rc, msg: f.msg, group: f.group, count: 0, personas: {}, scenes: {}, repros: [] }; F.set(key, e); }
  e.count += f.count; if (who) { e.fighters = e.fighters || {}; e.fighters[who] = (e.fighters[who] || 0) + f.count; }
  for (const [k, v] of Object.entries(f.personas || {})) e.personas[k] = (e.personas[k] || 0) + v;
  for (const [k, v] of Object.entries(f.scenes || {})) e.scenes[k] = (e.scenes[k] || 0) + v;
  for (const rp of f.repros || []) if (e.repros.length < 3 && !e.repros.some((x) => x.cmd === rp.cmd)) e.repros.push(rp);
}
// ---- synthetic findings from the run-wide tables (thresholds are THRESH's, fixed before the run)
const early = {}; for (const r of R) for (const [k, v] of Object.entries(r.early || {})) { const a = early[k] || (early[k] = { buffered: 0, held: 0, eaten: 0, heldNo: 0 }); for (const x of Object.keys(a)) a[x] += v[x] || 0; }
{ const tot = Object.values(early).reduce((a, v) => ({ b: a.b + v.buffered, e: a.e + v.eaten }), { b: 0, e: 0 });
  if (tot.b + tot.e >= THRESH.EAT_MIN_SAMPLES && tot.e / (tot.b + tot.e) >= THRESH.EAT_RATE_FLAG) F.set('FEEL|jank-input-eaten|all', { sev: 'FEEL', kind: 'jank-input-eaten', rc: 'all', group: 'JANK', msg: `${Math.round(100 * tot.e / (tot.b + tot.e))}% of attack presses made up to ${THRESH.EARLY_WINDOW} frames (${Math.round(THRESH.EARLY_WINDOW * 16.7)} ms) before the last move's end-lag was over, and released before it ended, were lost (${tot.e} lost, ${tot.b} buffered): the game has little or no input buffer`, count: tot.e, personas: {}, scenes: {}, repros: [] });
  for (const [n, v] of Object.entries(early)) if (v.buffered + v.eaten >= THRESH.EAT_MIN_SAMPLES && v.eaten / (v.buffered + v.eaten) >= THRESH.EAT_RATE_FLAG) F.set('FEEL|jank-input-eaten|' + n, { sev: 'FEEL', kind: 'jank-input-eaten-fighter', rc: n, group: 'JANK', msg: `${n}: ${v.eaten} of ${v.buffered + v.eaten} early attack presses lost`, count: v.eaten, personas: {}, scenes: {}, repros: [] }); }
const BW = {}; const TL = { 1: [], 2: [], 3: [] };
for (const r of R) { for (const w of r.bossWarn || []) { const k = w.boss + ' / ' + w.kind; (BW[k] = BW[k] || []).push(w); } for (const w of r.tlc || []) (TL[w.ph] = TL[w.ph] || []).push(w); }
const bossRows = Object.entries(BW).map(([k, a]) => { const ws = a.map((x) => x.warn); const short = a.filter((x) => x.warn < THRESH.BOSS_WARN_FRAMES).length, belowRt = a.filter((x) => x.rtF != null && x.warn < x.rtF).length; return { k, n: a.length, med: med(ws), p10: q(ws, 0.1), short, shortShare: short / a.length, belowRt, tel: med(a.map((x) => x.tel).filter((x) => x != null)) }; }).sort((a, b) => b.shortShare - a.shortShare);
for (const b of bossRows) if (b.n >= THRESH.BOSS_MIN_HITS && b.shortShare >= THRESH.BOSS_SHORT_SHARE && !/ tlc$/.test(b.k)) F.set('FEEL|jank-boss-short-warning|' + b.k, { sev: 'FEEL', kind: 'jank-boss-short-warning', rc: b.k, group: 'JANK', msg: `${b.k}: ${b.short} of ${b.n} hits on the player (${Math.round(100 * b.shortShare)}%) landed less than ${THRESH.BOSS_WARN_FRAMES} frames (${Math.round(THRESH.BOSS_WARN_FRAMES * 16.7)} ms) after the telegraph began (median ${b.med} frames)`, count: b.n, personas: {}, scenes: { boss: b.n }, repros: [] });
const tlcRows = Object.entries(TL).filter(([, a]) => a.length).map(([ph, a]) => { const sl = a.map((x) => x.slack), d = a.map((x) => x.dist); const under = a.filter((x) => x.slack < THRESH.TLC_SLACK_FRAMES).length; return { ph, n: a.length, medDist: med(d), onTop: a.filter((x) => x.dist < 140).length, medSlack: med(sl), under, underShare: under / a.length, medHop: med(a.map((x) => x.hopT)) }; });
for (const t of tlcRows) if (t.n >= THRESH.BOSS_MIN_HITS && t.underShare >= THRESH.BOSS_SHORT_SHARE) F.set('FEEL|jank-tlc-ring-slack|' + t.ph, { sev: 'FEEL', kind: 'jank-tlc-ring-slack', rc: 'phase ' + t.ph, group: 'JANK', msg: `Firey Speaker Box THE TLC NEEDS TO BE FIXED!, phase ${t.ph}: ${t.under} of ${t.n} landings (${Math.round(100 * t.underShare)}%) put the fire ring closer to the nearest fighter than ${THRESH.TLC_SLACK_FRAMES} frames of travel (median slack ${t.medSlack} frames; the landing is a median ${t.medDist} px from the nearest fighter)`, count: t.n, personas: {}, scenes: { boss: t.n }, repros: [] });
const tlcHits = (BW['Firey Speaker Box / tlc'] || []);

// ---- the notice model (an ESTIMATE: documented in the README)
const SENS = { 'first-time': 0.25, casual: 0.45, veteran: 0.75, competitive: 0.95 };
const CLASS = (k) => /^(scene-crash|step-throws|draw-throws|jank-no-path|cant|loop-error|click-throws|menu|no-exit|tutorial|ctf-practice)$/.test(k) || /never-ends|stuck|trap/.test(k) ? 'blocking'
  : /teleport|snag|camera|air-hang|embedded|overlap|offscreen|flow|bad-text|hud-text|nan|out-of-bounds/.test(k) ? 'visible'
  : /latency|hitstop|audio|spike|stutter|slow|eaten|boss-short|tlc-ring/.test(k) ? 'feel'
  : /two-clicks|dead-button|esc|many-clicks|slow-path|key-hint|stray-banner|empty-screen|phone/.test(k) ? 'menu' : 'design';
const ANNOY = { blocking: 1.0, visible: 0.6, feel: 0.5, menu: 0.45, design: 0.35 }, NEED = { blocking: 0, visible: 0.3, feel: 0.6, menu: 0.25, design: 0.2 };
const MATCHLIKE = new Set(['ffa', '1v1', 'teams', 'training', 'worldcup']);
function plausible(e) {
  const cls = CLASS(e.kind), scs = Object.keys(e.scenes);
  return PERSONA_LIST.filter((p) => SENS[p.skill] >= NEED[cls] && (scs.length === 0 || scs.some((s) => p.plan.includes(s) || (s === 'boss' && p.plan.includes('boss')) || (MATCHLIKE.has(s) && p.plan.some((x) => MATCHLIKE.has(x) || x === 'boss'))))).length;
}
const rows = [...F.values()].filter((e) => !/^playtest-credit$/.test(e.kind)).map((e) => {
  const hit = Object.keys(e.personas).filter((t) => PERSONA_BY_TAG[t]).length, pl = Math.max(plausible(e), hit);
  const cls = CLASS(e.kind);
  return { ...e, hit, plausible: pl, cls, score: ANNOY[cls] * (pl / N) * (0.5 + 0.5 * Math.min(1, hit / Math.max(1, pl))) };
});
rows.sort((a, b) => b.score - a.score);

// ---- run size
let cpuMsTot = 0, sceneCount = 0, gameSecs = 0, matchCount = 0; const personaScenes = new Set(); const sceneKinds = {};
const logs = []; for (const r of R) { const sl = r.sceneLog || []; if (sl.length) cpuMsTot += Math.max(...sl.map((x) => x.cpuMs || 0)); for (const s of sl) { logs.push(s); sceneCount++; personaScenes.add(s.persona + '|' + s.scene + '|' + s.seed); sceneKinds[s.scene] = (sceneKinds[s.scene] || 0) + 1; } for (const m of r.matches || []) { matchCount++; gameSecs += m.secs || 0; } }
const personasSeen = new Set(logs.map((l) => l.persona));
const bossNames = {}; for (const r of R) for (const m of r.matches || []) if (m.boss) bossNames[m.boss] = (bossNames[m.boss] || 0) + 1;
const mapCov = {}; for (const r of R) for (const m of r.matches || []) if (m.map) mapCov[m.map] = (mapCov[m.map] || 0) + 1;
const passesByPersona = {}; for (const l of logs) { passesByPersona[l.persona] = passesByPersona[l.persona] || new Set(); passesByPersona[l.persona].add(l.seed); }

// ---- tables
const latRows = {}; for (const r of R) for (const [k, v] of Object.entries(r.lat || {})) { const a = latRows[k] || (latRows[k] = { n: 0, sum: 0, max: 0, out: 0, none: 0 }); a.n += v.n; a.sum += v.sum; a.max = Math.max(a.max, v.max); a.out += v.out; a.none += v.none || 0; }
const latByType = {}; for (const [k, v] of Object.entries(latRows)) { const t = k.split('|')[1]; const a = latByType[t] || (latByType[t] = { n: 0, sum: 0, max: 0, out: 0, none: 0 }); a.n += v.n; a.sum += v.sum; a.max = Math.max(a.max, v.max); a.out += v.out; a.none += v.none; }
const escT = {}; for (const r of R) for (const [k, v] of Object.entries(r.esc || {})) { const a = escT[k] || (escT[k] = { tried: 0, leaves: 0, hasBack: v.hasBack }); a.tried += v.tried; a.leaves += v.leaves; }
const jr = {}; for (const r of R) for (const j of r.journey || []) (jr[j.mode] = jr[j.mode] || []).push(j);
const flowT = {}; for (const r of R) for (const f of r.flow || []) { const a = flowT[f.id] || (flowT[f.id] = { ok: 0, bad: 0, msgs: new Set() }); if (f.ok) a.ok++; else { a.bad++; if (f.msg) a.msgs.add(f.msg); } }
const perf = {}; for (const r of R) for (const p of r.perf || []) { const a = perf[p.phase] || (perf[p.phase] = { frames: 0, sum: 0, p99s: [], worst: 0, o16: 0, o50: 0 }); a.frames += p.frames; a.sum += p.avgMs * p.frames; a.p99s.push(p.p99); a.worst = Math.max(a.worst, p.worstMs); a.o16 += p.over16; a.o50 += p.over50; }
const clickMs = R.map((r) => r.clickMs).filter(Boolean);
const textOver = {}; for (const r of R) for (const [k, v] of Object.entries(r.textOver || {})) textOver[k] = (textOver[k] || 0) + v;

const SEVO = { BUG: 0, STUCK: 1, SLOW: 2, FEEL: 3, UI: 4 };
const fmtRow = (e) => {
  const fl = e.fighters ? ' Fighters: ' + Object.entries(e.fighters).sort((a, b) => b[1] - a[1]).map(([n, c]) => n + ' x' + c).join(', ') + '.' : '';
  const who = Object.entries(e.personas).filter(([t]) => PERSONA_BY_TAG[t]).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t, n]) => `${t} x${n}`).join(', ');
  const rp = e.repros.slice(0, 2).map((r) => '`' + r.cmd + '`' + (r.frame ? ` (frame ${r.frame})` : '')).join('; ');
  return `- **[${e.sev}] ${e.kind}**${e.group ? ' (JANK)' : ''} x${e.count} - ${e.msg}${fl}\n  - hit by ${e.hit} personas (${who || 'run-wide statistic'}); plausibly noticed by about ${e.plausible} of ${N} (${e.cls}); severity ${e.sev}\n  - repro: ${rp || '(run-wide statistic: see the table in this report; the per-fighter repro is `node scripts/playtest.mjs --scene ffa --seed N --arg persona=<tag>` with a persona that plays that fighter)'}`;
};

const md = [];
const FAMILIES = [];
md.push(`# PLAYTEST v2 summary${PARTIAL ? ' (PARTIAL: the run is still going)' : ''}`);
md.push('');
md.push(`Generated ${new Date().toISOString()} from ${R.length} person-sessions in \`${IN}\`.`);
md.push('');
{ const cf = path.join(REP, 'commentary.md'); if (existsSync(cf)) { md.push(readFileSync(cf, 'utf8')); md.push(''); } }   // (the author's reading of the run, written by hand after it; kept next to the generated tables)
md.push('## Run size');
md.push(`- Personas that played: ${personasSeen.size} of ${N}. Person-scenes: ${sceneCount} (distinct persona/scene/seed ${personaScenes.size}); matches: ${matchCount} (${(gameSecs / 3600).toFixed(1)} hours of game time).`);
md.push(`- CPU time: ${(cpuMsTot / 3600000).toFixed(2)} CPU hours (summed over the person-sessions; Windows reports CPU time in coarse ticks).`);
md.push(`- Scenes by kind: ${Object.entries(sceneKinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}`);
md.push(`- Boss Rush runs by boss: ${Object.entries(bossNames).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'} (${Object.keys(bossNames).length} of 12 bosses)`);
md.push(`- Capture the Flag runs by map: ${Object.entries(mapCov).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}`);
md.push(`- Personas with fewer than 2 passes: ${PERSONA_LIST.filter((p) => (passesByPersona[p.tag] ? passesByPersona[p.tag].size : 0) < 2).length}`);
md.push('');
md.push('## Thresholds (fixed before the run; not changed after seeing results)');
md.push(Object.entries(THRESH).map(([k, v]) => `${k}=${v}`).join(', '));
md.push('');
md.push('## TOP 15: what a real person would complain about (auto-ranked; formula in the README, commentary below each group)');
md.push('Score = annoyance weight of the finding class (blocking 1.0, visible glitch 0.6, feel 0.5, menu friction 0.45, design 0.35) x share of the 80 personas who would plausibly meet and notice it x (0.5 + 0.5 x share of those who actually hit it in this run). The weights and the notice model are ESTIMATES made before the run.');
md.push('');
{ // one entry per kind of finding (a family): its causes are listed below; reach = union of the personas that hit any of them
  const fam = new Map(); for (const e of rows) { const k = e.sev + '|' + e.kind; let g = fam.get(k); if (!g) { g = { sev: e.sev, kind: e.kind, cls: e.cls, causes: 0, count: 0, personas: new Set(), plausible: 0, top: e }; fam.set(k, g); } g.causes++; g.count += e.count; for (const t of Object.keys(e.personas)) if (PERSONA_BY_TAG[t]) g.personas.add(t); g.plausible = Math.max(g.plausible, e.plausible); }
  const fl2 = [...fam.values()].map((g) => ({ ...g, hit: g.personas.size, score: ANNOY[g.cls] * (g.plausible / N) * (0.5 + 0.5 * Math.min(1, g.personas.size / Math.max(1, g.plausible))) })).sort((a, b) => b.score - a.score);
  FAMILIES.push(...fl2);
  fl2.slice(0, 15).forEach((g, i) => md.push(`${i + 1}. **${g.kind}** (${g.sev}, ${g.cls}, score ${g.score.toFixed(3)}): ${g.causes} root cause(s), ${g.count} occurrences; example: ${g.top.msg}  \n   hit by ${g.hit} personas, plausibly noticed by about ${g.plausible} of ${N}`)); }
md.push('');
md.push('## Findings by root cause (deduped), worst first');
for (const sev of ['BUG', 'STUCK', 'SLOW', 'FEEL', 'UI']) {
  const list = rows.filter((e) => e.sev === sev).sort((a, b) => b.score - a.score);
  md.push(`### ${sev} (${list.length} root causes)`);
  if (!list.length) md.push('none');
  // kinds with very many causes are summarised: top 8 causes per kind
  const byKind = {}; for (const e of list) (byKind[e.kind] = byKind[e.kind] || []).push(e);
  for (const [k, es] of Object.entries(byKind).sort((a, b) => b[1][0].score - a[1][0].score)) {
    md.push(`#### ${k}: ${es.length} root causes, ${es.reduce((a, e) => a + e.count, 0)} occurrences`);
    for (const e of es.slice(0, 8)) md.push(fmtRow(e));
    if (es.length > 8) md.push(`- ... and ${es.length - 8} more root causes of this kind (all in the JSON files)`);
  }
  md.push('');
}
md.push('## Input latency (key press -> first change on the fighter, in frames after the step that saw the key)');
md.push('| action | samples | mean | max | outliers (>= ' + THRESH.LAT_FLAG_FRAMES + ') | never answered |'); md.push('|---|---|---|---|---|---|');
for (const [t, v] of Object.entries(latByType)) md.push(`| ${t} | ${v.n} | ${(v.sum / Math.max(1, v.n)).toFixed(2)} | ${v.max} | ${v.out} | ${v.none} |`);
md.push('');
md.push('## Early presses (within ' + THRESH.EARLY_WINDOW + ' frames of the last move ending): buffered or eaten');
{ const t = Object.values(early).reduce((a, v) => ({ b: a.b + v.buffered, e: a.e + v.eaten, h: a.h + v.held, hn: a.hn + v.heldNo }), { b: 0, e: 0, h: 0, hn: 0 }); md.push(`All fighters: buffered ${t.b}, held through ${t.h}, held and never fired ${t.hn}, eaten ${t.e}${t.b + t.e ? ' (eaten share ' + Math.round(100 * t.e / (t.b + t.e)) + '% of buffered+eaten)' : ''}.`);
  md.push('Fighters with the highest eaten share (>= 8 samples): ' + (Object.entries(early).filter(([, v]) => v.buffered + v.eaten >= 8).sort((a, b) => b[1].eaten / (b[1].buffered + b[1].eaten) - a[1].eaten / (a[1].buffered + a[1].eaten)).slice(0, 10).map(([n, v]) => `${n} ${v.eaten}/${v.buffered + v.eaten}`).join(', ') || 'none')); }
md.push('');
md.push('## Boss Rush: warning between the start of a boss attack\'s telegraph and the hit on the player');
md.push('| boss / move | hits on the player | median warning (frames) | 10th pct | under ' + THRESH.BOSS_WARN_FRAMES + ' frames | under that persona\'s own reaction time |'); md.push('|---|---|---|---|---|---|');
for (const b of bossRows.slice(0, 40)) md.push(`| ${b.k} | ${b.n} | ${b.med} | ${b.p10} | ${b.short} (${Math.round(100 * b.shortShare)}%) | ${b.belowRt} |`);
md.push('(A hit late in a multi-hit chain, e.g. the TLC hops, has a long warning measured from the first telegraph; the TLC table below measures per landing.)');
md.push('');
md.push('## Firey Speaker Box, THE TLC NEEDS TO BE FIXED! (fire-ring landings)');
md.push('The owner says he tracks you and fires with next to no delay. Per landing: how far the nearest fighter is, and the slack = frames the ring needs to reach a fighter standing still at that distance.');
md.push('| phase | landings | median distance to nearest fighter (px) | landed on top (< 140 px) | median ring slack (frames) | slack under ' + THRESH.TLC_SLACK_FRAMES + ' | median hop length (frames) |'); md.push('|---|---|---|---|---|---|---|');
for (const t of tlcRows) md.push(`| ${t.ph} | ${t.n} | ${t.medDist} | ${t.onTop} (${Math.round(100 * t.onTop / t.n)}%) | ${t.medSlack} | ${t.under} (${Math.round(100 * t.underShare)}%) | ${t.medHop} |`);
md.push(`Hits on a player by the TLC move: ${tlcHits.length}${tlcHits.length ? '; median warning from the first telegraph ' + med(tlcHits.map((x) => x.warn)) + ' frames' : ''}.`);
md.push('');
md.push('## Journeys: title -> a running match with default choices (clicks + keys, a person\'s seconds)');
md.push('| mode | runs | reached | median clicks | median keys | median seconds | max seconds |'); md.push('|---|---|---|---|---|---|---|');
for (const [m, a] of Object.entries(jr)) md.push(`| ${m} | ${a.length} | ${a.filter((x) => x.reached).length} | ${med(a.map((x) => x.clicks))} | ${med(a.map((x) => x.keys))} | ${med(a.map((x) => x.secs))} | ${Math.max(...a.map((x) => x.secs))} |`);
md.push('');
md.push('## Flow checks (pause, Esc, quit and return, result screen, Rematch)');
for (const [k, v] of Object.entries(flowT)) md.push(`- ${k}: ok ${v.ok}, not ok ${v.bad}${v.msgs.size ? ' - ' + [...v.msgs].slice(0, 2).join(' | ') : ''}`);
md.push('');
md.push('## Esc on each screen (does it leave?)');
for (const [k, v] of Object.entries(escT)) md.push(`- ${k}: Esc left ${v.leaves} of ${v.tried}${v.hasBack ? '' : ' (no back button either)'}`);
md.push('');
md.push('## HUD text overlap (estimated boxes; canvas text drawn at the identity transform)');
md.push(Object.entries(textOver).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => `"${k}" x${v}`).join('; ') || 'none seen');
md.push('');
md.push('## Frame time by phase (headless wall time; compare phases, not absolutes; shards ran 8 at a time)');
for (const [k, v] of Object.entries(perf).sort((a, b) => b[1].worst - a[1].worst).slice(0, 12)) md.push(`- ${k}: ${v.frames} frames, avg ${(v.sum / v.frames).toFixed(2)} ms, median of p99s ${med(v.p99s)}, worst ${v.worst.toFixed(0)} ms, over 16 ms ${v.o16}, over 50 ms ${v.o50}`);
if (clickMs.length) md.push(`- menu clicks: ${clickMs.reduce((a, c) => a + c.n, 0)} clicks, median of medians ${med(clickMs.map((c) => c.p50)).toFixed(1)} ms, worst ${Math.max(...clickMs.map((c) => c.max)).toFixed(0)} ms`);
md.push('');
mkdirSync(path.join(REP, 'personas'), { recursive: true });
writeFileSync(path.join(REP, 'summary.md'), md.join('\n') + '\n');

// ---- per-persona logs
for (const p of PERSONA_LIST) {
  const L = logs.filter((l) => l.persona === p.tag).sort((a, b) => (a.cpuMs || 0) - (b.cpuMs || 0));
  const o = [];
  o.push(`# ${p.tag}`); o.push('');
  o.push(`**Profile.** ${p.profile}`);
  o.push(`**Hands.** reaction ${p.motor.rtMs} ms (SD ${p.motor.rtSd}), key timing jitter ${p.motor.jitterFrames} frames, slipped presses ${Math.round(p.motor.dropRate * 100)}%, double-tap ${Math.round(p.motor.doubleTap * 100)}%, short hop ${Math.round(p.motor.shortHop * 100)}%, ${p.motor.fps} fps input, ${p.motor.clickSecs} s per menu target, ${p.motor.msPerWord} ms per word read (reads ${Math.round(p.motor.readFrac * 100)}% of a screen).`);
  o.push(`**Keys.** ${p.keys}${p.wasdFirst ? ' (tries WASD unbound first)' : ''}. **Patience.** menus ${p.patience.menuSecs} s, confused ${p.patience.confusionSecs} s on one screen, rage-quits after ${p.patience.rageLosses} losses in a row.`);
  o.push(`**Plan.** ${p.plan.join(', ')} (x passes).`); o.push('');
  if (!L.length) { o.push('Did not play in this run (yet).'); writeFileSync(path.join(REP, 'personas', p.tag + '.md'), o.join('\n') + '\n'); continue; }
  o.push('## What they did');
  for (const l of L) {
    const r = l.row; const kos = r ? r.youKoList.join(', ') || 'no KOs' : '';
    o.push(`- ${l.scene} (seed ${l.seed}): ${l.result}${r ? `; ${r.secs} s of game on ${r.stage || '?'}, dealt ${r.dmgYou}, took ${r.dmgTaken}, ${kos}${r.boss ? ', boss ' + r.boss : ''}${r.map ? ', map ' + r.map : ''}` : ''}; menus took them about ${l.human ? Math.round(l.human.first ? l.human.first.secs : l.human.secs) : '?'} s and ${l.human ? (l.human.first ? l.human.first.clicks : l.human.clicks) : '?'} clicks. Repro: \`${l.cmd}\``);
  }
  o.push('');
  const evs = []; for (const l of L) for (const e of l.events || []) evs.push(`${l.scene}: ${e}`);
  const quits = evs.filter((e) => /would have/.test(e));
  o.push('## Where they got stuck or confused');
  const st = new Map(); for (const l of L) for (const f of l.findings || []) if (f.sev === 'BUG' || f.sev === 'STUCK') { const k = f.sev + ' ' + f.kind + ': ' + f.msg; st.set(k, (st.get(k) || 0) + 1); }
  if (!st.size && !evs.length) o.push('Nothing: no blocking finding and no confusion event.');
  for (const [k, n] of st) o.push(`- ${k}${n > 1 ? ' (x' + n + ' scenes)' : ''}`);
  for (const e of [...new Set(evs)]) o.push(`- ${e}`);
  o.push('');
  o.push('## What went wrong (everything the playtester noted while they played)');
  const all = new Map(); for (const l of L) for (const f of l.findings || []) { const k = `[${f.sev}] ${f.kind}${f.group ? ' (JANK)' : ''}: ${f.msg}`; all.set(k, (all.get(k) || 0) + 1); }
  if (!all.size) o.push('Nothing noted.');
  for (const [k, n] of [...all].sort((a, b) => b[1] - a[1]).slice(0, 40)) o.push(`- ${k}${n > 1 ? ' (in ' + n + ' scenes)' : ''}`);
  o.push('');
  o.push('## When they would have quit');
  o.push(quits.length ? quits.map((e) => '- ' + e).join('\n') : 'No quit moment in this run: they would have kept playing (as far as this model goes).');
  writeFileSync(path.join(REP, 'personas', p.tag + '.md'), o.join('\n') + '\n');
}
writeFileSync(path.join(REP, 'families.json'), JSON.stringify(FAMILIES.map((g) => ({ sev: g.sev, kind: g.kind, cls: g.cls, causes: g.causes, count: g.count, hit: g.hit, plausible: g.plausible, score: +g.score.toFixed(4), example: g.top.msg, repro: g.top.repros.map((r) => r.cmd)[0] || null })), null, 1));
writeFileSync(path.join(REP, 'ranked.json'), JSON.stringify(rows.slice(0, 200).map((e) => ({ sev: e.sev, kind: e.kind, rc: e.rc, msg: e.msg, count: e.count, hit: e.hit, plausible: e.plausible, cls: e.cls, score: +e.score.toFixed(4), repros: e.repros.map((r) => r.cmd) })), null, 1));
console.log(`aggregate: ${R.length} sessions, ${sceneCount} person-scenes, ${rows.length} root causes -> ${REP}`);
