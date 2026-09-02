// ============================================================================
//  apply-smash-id.mjs — write the per-character smash identity table into the monolith
// ============================================================================
//   node scripts/apply-smash-id.mjs <entries.json>
//
// The mechanics of all 59 smashes were already per-character. What was shared was everything the
// player perceives: SFX.smash() was never called (so every smash was silent), the move names lived
// only in source comments, and the charge ring was '#ffd23f' for the whole roster. This writes the
// SMASH_ID table that supplies a name, a sound and a colour for each kit.special.
//
// It REPLACES the table wholesale, so it is safe to re-run after regenerating the data.
import { readFileSync, writeFileSync } from 'node:fs';

const MONO = 'artifacts/V1/index.html';
const src = process.argv[2];
if (!src) { console.error('usage: node scripts/apply-smash-id.mjs <entries.json>'); process.exit(1); }

const entries = JSON.parse(readFileSync(src, 'utf8'));
const html = readFileSync(MONO, 'utf8');

// Every playable fighter's kit.special — the table must cover all of them and invent none.
const keys = [...html.matchAll(/\{name:"([^"]+)",\s*w:(\d+),[^}]*?play:true[\s\S]{0,220}?special:"([a-zA-Z0-9_]+)"/g)]
  .map((m) => ({ fighter: m[1], key: m[3] }));
const known = new Set(keys.map((k) => k.key));

const seen = new Set();
const rows = [];
for (const e of entries) {
  if (!known.has(e.key)) { console.error(`  ! unknown kit key, skipped: ${e.key} (${e.fighter})`); continue; }
  if (seen.has(e.key)) { console.error(`  ! duplicate entry, skipped: ${e.key}`); continue; }
  seen.add(e.key);
  const tones = (e.tones || []).map((t) =>
    `{f:${+t.freq},d:${+t.dur},w:'${t.type}',g:${+t.gain},t:${+t.delay},to:${+t.freqTo}}`).join(',');
  const n = e.noise;
  const noise = n ? `{d:${+n.dur},g:${+n.gain},hz:${+n.filterFreq},t:${+n.delay},to:${+n.filterTo}}` : 'null';
  rows.push(`  ${/^[a-zA-Z_$][\w$]*$/.test(e.key) ? e.key : JSON.stringify(e.key)}:` +
    ` {name:${JSON.stringify(e.moveName)}, color:${JSON.stringify(e.color)},` +
    ` tones:[${tones}], noise:${noise}},   // ${e.fighter}`);
}

const missing = keys.filter((k) => !seen.has(k.key));
if (missing.length) console.error(`  ! ${missing.length} fighters have no entry: ${missing.map((m) => m.fighter).join(', ')}`);

const table = `const SMASH_ID = {\n${rows.join('\n')}\n};`;
const re = /const SMASH_ID = \{[\s\S]*?\n\};/;
if (!re.test(html)) { console.error('SMASH_ID table not found in the monolith'); process.exit(1); }
writeFileSync(MONO, html.replace(re, table));
console.log(`wrote ${rows.length}/${keys.length} smash identities`);
