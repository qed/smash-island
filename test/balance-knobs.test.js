import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { KNOBS, verify, census } from '../scripts/balance-knobs.mjs';

// THE BALANCE HARNESS HAS TO BE ABLE TO SEE THE GAME.
//
// Every knob in scripts/balance-knobs.mjs rewrites a family of literals by text patch, and the A/B
// harness refuses to measure anything unless a scale of 1.0 reproduces the source byte for byte.
// Nothing in the suite checked that, so when the D session wrote three decimal literals (Money's
// special, Barf Bag's splash) the two tiered knobs quietly stopped being a no-op, and every A/B run
// after it refused to start. This is that check, run on every change.

const SRC = readFileSync('artifacts/V1/index.html', 'utf8');

describe('the balance knobs', () => {
  it('reproduce the shipped game byte for byte at a scale of 1.0', () => {
    expect(verify(SRC)).toEqual([]);
  });

  it('each still reaches something in the game', () => {
    const empty = Object.keys(KNOBS).filter((k) => census(SRC, k).count === 0);
    expect(empty, 'knobs whose pattern no longer matches any literal').toEqual([]);
  });
});
