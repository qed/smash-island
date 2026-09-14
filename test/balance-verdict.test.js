import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// balance-verdict, three rules added on 2026-09-14. A verdict needs three runs a side before it may
// read anything but "add runs": a bootstrap over two items is dice. The measured floors print with
// every verdict. And --player takes the text MY STATS copies and prints the owner's own record beside
// the bot's pooled rate, marking a fighter with 30+ human games as measured by the player -- whose
// bracket number is the bot's, not the fighter's.

const NAMES = ['Puffball', 'Pencil', 'Needle', 'Leafy'];
const run = (seed) => ({
  ranking: NAMES.map((name, i) => {
    const games = 8, wins = Math.max(0, Math.min(8, ((seed * 7 + i * 3) % 9)));
    return { name, games, wins, kos: wins * 2, winRate: wins / games, rank: i + 1 };
  }),
});

function verdict(nBefore, nAfter, player) {
  const dir = mkdtempSync(join(tmpdir(), 'bfsi-verdict-'));
  const files = (n, tag) => Array.from({ length: n }, (_, i) => { const p = join(dir, `${tag}-${i}.json`); writeFileSync(p, JSON.stringify(run(i + (tag === 'a' ? 10 : 1)))); return p; });
  const args = ['scripts/balance-verdict.mjs', '--before', ...files(nBefore, 'b'), '--after', ...files(nAfter, 'a')];
  if (player) { const p = join(dir, 'mystats.txt'); writeFileSync(p, player); args.push('--player', p); }
  return execFileSync('node', args, { encoding: 'utf8' });
}

describe('the three-run rule', () => {
  it('refuses to conclude from two runs a side, and says what it would have read', () => {
    const out = verdict(2, 2);
    expect(out).toMatch(/VERDICT: not conclusive — 2\/2 runs a side, 3 needed/);
    expect(out).toMatch(/it would have read "/);
  });

  it('lets three a side speak', () => {
    const out = verdict(3, 3);
    expect(out).not.toMatch(/3 needed/);
    expect(out).toMatch(/VERDICT: /);
  });

  it('prints the measured floors with every verdict', () => {
    expect(verdict(2, 2)).toMatch(/floors: .*24-match A\/B spread.*7\.5pp median/);
  });
});

describe("the player's record", () => {
  const copied = [
    'Battle for Smash Island — my stats (2026-09-14)',
    'fighter | games | my win% | AI bracket win% (rank)',
    'Puffball | 108 | 81% | 45% (#2 of 59)',
    'json: {"Puffball":{"games":108,"wins":87,"kos":300},"Needle":{"games":4,"wins":1,"kos":2}}',
  ].join('\n');

  it('reads the copied text, prints you beside the bot, and marks a large human sample as the measurement', () => {
    const out = verdict(3, 3, copied);
    expect(out).toMatch(/Puffball\s+87\/108\s+80\.6%\s+[\d.]+%\s+measured by the player/);
    expect(out).toMatch(/Needle\s+1\/4\s+25\.0%\s+[\d.]+%\s*\n/);
    expect(out).not.toMatch(/Needle.*measured by the player/);
  });

  it('accepts a bare json object too', () => {
    const out = verdict(3, 3, '{"Leafy":{"games":40,"wins":30}}');
    expect(out).toMatch(/Leafy\s+30\/40\s+75\.0%.*measured by the player/);
  });
});
