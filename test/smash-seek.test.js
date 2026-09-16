import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// HOMING, AS A FLAG RATHER THAN A BESPOKE BODY.
//
// Blocky's anvil always found you: the hand-written body scanned for the nearest fighter and
// dropped on their x. Moving him onto the shared `rain` pattern lost that, because `rain` placed
// its drop at a fixed `face * at` offset and the vocabulary had no way to say "aim this".
//
// `seek: <px>` says it. A row without it is unchanged. Since "Smashes still feel ... hard to use, especially
// against enemies with movetech", every rain row in the table seeks: a drop at a fixed spot ahead of you
// landed on nobody who was moving. The fixed offset is still what a row without `seek` does.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

/** Smash with `name` while a dummy stands `dist` px away; report where the drop actually landed. */
function dropX(w, name, dist, row) {
  return w.eval(`
    (function(){
      var ROW = ${JSON.stringify(row || null)};
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 400+${dist}, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still';
      A.stocks=9; D.stocks=9; fighters=[A,D];
      step(); A.invuln=0; A.atkCd=0;
      projectiles.length = 0;
      if (ROW){ SMASH_SPEC.__probe = ROW; A.kit = Object.assign({}, A.kit, { special:'__probe' }); }
      try { doSmash(A, 1); } finally { delete SMASH_SPEC.__probe; }
      var xs = projectiles.map(function(p){ return Math.round(p.x); });
      return { selfX: A.x, targetX: D.x, drops: xs };
    })()`);
}

describe('rain can be told to aim', () => {
  it("puts Blocky's anvil on the target, not at a fixed offset", () => {
    const r = dropX(W, 'Blocky', 160);
    expect(r.drops.length, 'the anvil should exist').toBeGreaterThan(0);
    // `at` is 90, so a fixed-offset drop would land ~490. Homing puts it on the dummy at 560.
    expect(Math.abs(r.drops[0] - r.targetX), 'should land on the target').toBeLessThan(12);
    expect(Math.abs(r.drops[0] - (r.selfX + 90)), 'should NOT be the fallback offset').toBeGreaterThan(40);
  });

  it('follows the target rather than repeating one distance', () => {
    const near = dropX(W, 'Blocky', 60), far = dropX(W, 'Blocky', 190);
    expect(far.drops[0] - near.drops[0], 'the drop should move with the target').toBeGreaterThan(100);
  });

  it('falls back to the fixed offset when nobody is in seek range', () => {
    // seek is 220px; at 400 away the dummy is out of range and the offset takes over.
    const r = dropX(W, 'Blocky', 400);
    expect(Math.abs(r.drops[0] - (r.selfX + 90)), 'should be the plain offset').toBeLessThan(12);
  });

  it('a rain row without seek still drops at its fixed offset', () => {
    // No row in the table omits seek any more, so the property is checked on a probe row shaped like Yellow
    // Face's crate was before it learned to look.
    const row = { pat:'rain', at:100, count:1, r:18, dmg:16, kb:11, effect:'stun', n:30, cost:{cd:70}, color:'#f2e04b' };
    const r = dropX(W, 'Yellow Face', 150, row);
    expect(Math.abs(r.drops[0] - (r.selfX + 100)), 'unchanged by the flag').toBeLessThan(12);
  });

  it('every falling smash in the table looks for someone', () => {
    const blind = W.eval("Object.entries(SMASH_SPEC).filter(function(e){ return e[1].pat==='rain' && !(e[1].seek > 0); }).map(function(e){ return e[0]; })");
    expect(blind).toEqual([]);
  });

  it("a volley that found someone starts on their head: Ice Cube's four shards", () => {
    const r = dropX(W, 'Ice Cube', 120);
    expect(r.drops.length).toBe(4);
    expect(Math.min(...r.drops.map((x) => Math.abs(x - r.targetX))), 'one shard on the target').toBeLessThan(4);
    expect(r.drops.some((x) => x < r.targetX - 20) && r.drops.some((x) => x > r.targetX + 20), 'and the rest either side of them').toBe(true);
  });
});
