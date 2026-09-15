import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { loadMonolith } from './helpers/load-monolith.js';

// The FIGHTER_WINRATE table seeds the World Cup and is what MY STATS shows beside the player's own
// rate. On 2026-09-14 it still said Puffball 45% and Pencil 14% -- the reverse of every run that
// session -- because nothing checked that the bake kept up with the measurements. This does: the
// table must be traceable to a ranking file that exists, agree with it, and that file must be the
// newest dated measurement on disk. Regenerate with:
//     node scripts/merge-rankings.mjs --out scripts/balance-ranking-<date>-<tag>.json run1.json ...
//     node scripts/bake-ratings.mjs scripts/balance-ranking-<date>-<tag>.json

const SRC = readFileSync('artifacts/V1/index.html', 'utf8');
const block = SRC.slice(SRC.indexOf('/* BAKED-RATINGS-START */'), SRC.indexOf('/* BAKED-RATINGS-END */'));
const source = (block.match(/Source: (\S+)/) || [])[1];
const dateOf = (f) => (f.match(/(\d{4}-\d{2}-\d{2})/) || [, '0000-00-00'])[1];

describe('the baked rating table', () => {
  it('names a ranking file that exists', () => {
    expect(source, 'no Source: line in the baked block').toBeTruthy();
    expect(existsSync(source), `${source} is gone`).toBe(true);
  });

  it('agrees with that file for every fighter', () => {
    const { window: w } = loadMonolith();
    const table = w.eval('FIGHTER_WINRATE');
    const ranking = JSON.parse(readFileSync(source, 'utf8')).ranking;
    const off = [];
    for (const r of ranking) {
      if (table[r.name] === undefined) { off.push(`${r.name}: not in the table`); continue; }
      if (Math.abs(table[r.name] - Math.round(r.winRate * 1000) / 1000) > 0.0005) off.push(`${r.name}: table ${table[r.name]} vs file ${r.winRate.toFixed(3)}`);
    }
    expect(off).toEqual([]);
    expect(Object.keys(table).length).toBe(ranking.length);
  });

  it('is baked from the newest dated measurement on disk, so it cannot go stale in silence', () => {
    const files = readdirSync('scripts').filter((f) => /^balance-ranking-.*\.json$/.test(f)).map((f) => 'scripts/' + f);
    // by the date in the name, and on a same-date tie by modification time (readdir order is alphabetical, not recency)
    const newer = (a, b) => dateOf(b) > dateOf(a) || (dateOf(b) === dateOf(a) && statSync(b).mtimeMs > statSync(a).mtimeMs);
    const newest = files.reduce((a, b) => (newer(a, b) ? b : a), files[0]);
    expect(source.replace(/\\/g, '/'), `baked from ${source}, but ${newest} is newer -- re-bake`).toBe(newest);
  });
});
