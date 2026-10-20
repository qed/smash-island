import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { KNOBS, verify, census, patch } from '../scripts/balance-knobs.mjs';

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

  // "Fix the tool" (the owner, 2026-10-18): cd.attack's clamp floor is 6, and the grab code sets `f.atkCd = 0`. A 0 (or anything not
  // positive) is an "off", not a quantity: no scale, 1.0 or any other, may rewrite it.
  it('leave a literal of 0 exactly as written, at any scale', () => {
    const src = 'if(g) f.atkCd = 0; f.atkCd = f._confirm ? JAB_HIT_CD : 22;';
    for (const f of [0.5, 1, 1.5, 2]) expect(patch('cd.attack', f)(src), `cd.attack x${f}`).toContain('if(g) f.atkCd = 0;');
    expect(patch('cd.attack', 2)(src), 'the whiff cooldown still scales').toContain(': 44;');
    for (const name of Object.keys(KNOBS)) {
      const k = KNOBS[name], re = () => new RegExp(k.find.source, k.find.flags);
      const zeros = (s) => [...s.matchAll(re())].filter((m) => !(k.read(m) > 0)).length;
      const n = zeros(SRC); if (!n) continue;
      for (const f of [0.5, 2]) expect(zeros(patch(name, f)(SRC)), `${name} x${f}: its ${n} zeros kept`).toBeGreaterThanOrEqual(n);
    }
  });

  it('each still reaches something in the game', () => {
    const empty = Object.keys(KNOBS).filter((k) => census(SRC, k).count === 0);
    expect(empty, 'knobs whose pattern no longer matches any literal').toEqual([]);
  });
});
