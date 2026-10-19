import { describe, it, expect, beforeAll, vi } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';

// STEVE COBS'S TOXIC CANNON!, THE LASER WALLS. THE OWNER, 2026-10-18: "cobs should have the ships laser be a set of lasers that travel down the line, and have gaps you have
// to jump through." (with a picture: a bar down from the top and a bar up from the floor, an open gap between them). The ship appears near you as before; its cannon fires a
// volley of walls, one after another, that travel down the line toward you and past you; each wall has one gap, at a height that changes wall to wall, and its gap is shown
// before it fires. What is pinned here is what the owner asked for and what makes it fair; nothing here is a bar for difficulty.

vi.setConfig({ testTimeout: 60000 });

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// His story fight, him parked (no turns of his own, the arena's maze off), `you` still on the floor at x 3000 (open floor: no platform over it for 500 px).
const fight = (body, lineup = ['Knife']) => { W.Math.random = mulberry32(5); return W.eval(`(function(){
  SETTINGS.itemRate=0; SETTINGS.stocks=3; LOCAL_PLAYERS=1;
  startCobsFight(${JSON.stringify(lineup)}, { story:${lineup[0] === 'Knife'}, onEnd:function(){ return true; } });
  var s = summons.find(function(o){ return o._cobsFight; }); s._hop = null; s._introT = 0;
  var you = fighters[0]; you.controller = 'still';
  var MZ = cobsMazeStep; cobsMazeStep = function(){};
  var X = 3000;
  var park = function(){ s._atkTimer = 1e9; s._holdT = 1e9; s.x = X - 1400; s.y = groundY() - 900; s.vx = 0; s.vy = 0; };
  var floorAt = function(f, x){ f.x = x; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.pct = 0; f.invuln = 0; park(); step(); f.pct = 0; f.invuln = 0; };
  var atTier = function(t){ s._marks = t - 1; };
  try { ${body} } finally { cobsMazeStep = MZ; }
})()`); };

describe('OWNER: TOXIC CANNON! -- "a set of lasers that travel down the line, and have gaps you have to jump through."', () => {
  it('A VOLLEY MAKES THE WALLS: the tier\'s number of walls, one every `every` frames, each from the cannon toward the fighter and past them at the tier\'s speed, each with one gap -- never at the same height twice running -- and its own id', () => {
    for (const t of [1, 2, 3, 4, 5]) {
      const r = fight(`
        park(); atTier(${t}); floorAt(you, X); you.invuln = 1e9;
        cobsFightTelegraph(s, 'cannon', you); s._tel = 0; COBS_MOVES.cannon(s, you, ++BOSS_ATK_ID);
        var S = s._ship, T = cobsT(s, 'cannon'), walls = {}, born = {}, toward = Math.sign(you.x - S.x), x0 = S.x;
        for (var i=0;i<900 && s._ship;i++){ park(); you.invuln = 1e9; you.x = X; step();
          if (s._ship) s._ship.walls.forEach(function(w){ if (!walls[w.k]){ walls[w.k] = { lv:w.lv, size:w.bot - w.top, dir:w.dir, spd:w.spd, id:w.id, x:w.x }; born[w.k] = i; } }); }
        var ks = Object.keys(walls).sort(function(a, b){ return a - b; });
        return { n:ks.length, want:T.n, every:T.every, spd:T.spd, toward:toward, gone:!s._ship, gap:COBS_LASER.gap,
          walls:ks.map(function(k){ return walls[k]; }), born:ks.map(function(k){ return born[k]; }) };`);
      expect(r.n, `tier ${t}: the tier's walls`).toBe(r.want);
      expect(r.want, 'four to six of them').toBeGreaterThanOrEqual(4);
      expect(r.want).toBeLessThanOrEqual(6);
      expect(r.gone, 'then the ship goes').toBe(true);
      expect(r.born.slice(1).map((b, i) => b - r.born[i]), `tier ${t}: one every ${r.every} frames (about a second)`).toEqual(r.born.slice(1).map(() => r.every));
      for (const w of r.walls) {
        expect(w.dir, 'down the line, toward the fighter').toBe(r.toward);
        expect(w.spd).toBe(r.spd);
        expect(w.size, 'one gap, COBS_LASER.gap tall').toBe(r.gap);
        expect([0, 1, 2]).toContain(w.lv);
      }
      r.walls.slice(1).forEach((w, i) => expect(w.lv, 'never the same height twice running: you have to move').not.toBe(r.walls[i].lv));
      expect(new Set(r.walls.map((w) => w.id)).size, 'a new id each wall: one mistake, one hit').toBe(r.n);
      // a person reads it: crossing a screen (W/zoom px) takes 1.2 to 2 seconds
      const screen = W.eval('W/CAM_ZOOM') || 1422;
      expect(screen / r.spd / 60, `tier ${t}: seconds to cross a screen`).toBeGreaterThanOrEqual(1.2);
      expect(screen / r.spd / 60).toBeLessThanOrEqual(2.0);
    }
  });

  it('THE TELL: every wall\'s gap is drawn at least half a second before it fires -- the first from the wind-up\'s lock -- exactly where it will be', () => {
    const r = fight(`
      park(); atTier(4); floorAt(you, X); you.invuln = 1e9;
      var shown = {}, fired = {}, DT = drawCobsLaserTell, cur = null, k = 0;
      drawCobsLaserTell = function(x, dir, g){ var key = Math.round(g.top) + ':' + Math.round(g.bot); if (cur !== key){ cur = key; shown[k] = { at:i, top:g.top, bot:g.bot }; } return DT.apply(this, arguments); };
      var i = 0;
      try {
        cobsFightTelegraph(s, 'cannon', you);
        for (i=0;i<900;i++){ park(); you.invuln = 1e9; you.x = X; step(); var S = s._ship; if (S){ var n = S.n - S.left; while (k < n){ fired[k] = { at:i, w:S.walls.filter(function(w){ return w.k === k; })[0] }; k++; cur = null; } }
          drawCobsFx(); if (s._tel <= 0 && !s._ship && i > 60) break; }
      } finally { drawCobsLaserTell = DT; }
      return Object.keys(fired).map(function(q){ var a = shown[q], b = fired[q]; return { ahead: a ? b.at - a.at : -1, same: !!(a && b.w && Math.abs(a.top - b.w.top) < 1e-6 && Math.abs(a.bot - b.w.bot) < 1e-6) }; });`);
    expect(r.length, 'the whole volley').toBeGreaterThanOrEqual(4);
    r.forEach((q, i) => {
      expect(q.ahead, `wall ${i}: its gap shown before it fires (frames)`).toBeGreaterThanOrEqual(30);
      expect(q.same, `wall ${i}: shown where it comes`).toBe(true);
    });
    expect(r[0].ahead, 'the first from the lock of the wind-up: the lock (12), the charge (24), its frame').toBeGreaterThanOrEqual(36);
  });

  it('IN THE GAP, NOTHING; OUT OF IT, ONE HIT: standing in a low gap, or held up in a high one, a wall passes by; standing under a high gap it hits once, however long it takes to pass', () => {
    const run = (lv, lift) => fight(`
      park(); atTier(3); floorAt(you, X);
      cobsFightTelegraph(s, 'cannon', you); s._tel = 0; COBS_MOVES.cannon(s, you, ++BOSS_ATK_ID); var S = s._ship; S.gaps = S.gaps.map(function(){ return ${lv}; }); S.n = S.left = 1; S.gaps.length = 1;
      var calls = 0, CH = cobsHit; cobsHit = function(f, d, kx, ky, id){ calls++; return CH.apply(this, arguments); };
      var P = bodyPts(you), ft = feetY(you), up = 0, dn = 0; for (var j=1;j<P.length;j+=2){ up = Math.max(up, ft - P[j]); dn = Math.max(dn, P[j] - ft); }
      var g = cobsLaserGap(S.line, ${lv}), feet = ${lift} ? (g.top + up + g.bot - dn)/2 : groundY(), dmg = 0, passed = false, slow = 0;
      try {
        for (var i=0;i<200;i++){ park(); you.x = X; you.y = feet - you.r; you.vx = 0; you.vy = 0; you.onground = !${lift}; you.invuln = 0; you.hitstun = 0; var p0 = you.pct; step(); if (you.pct > p0) dmg++;
          var w = S.walls[0]; if (w && Math.abs(w.x - X) < 60 && slow < 30){ w.x -= w.dir*w.spd*0.75; slow++; }   // (held in its path a good while: a slow pass)
          if (w && w.dir*(w.x - X) > 80){ passed = true; break; } }
      } finally { cobsHit = CH; }
      return { calls: calls, passed: passed, top: g.top, bot: g.bot, feet: feet, up: up, dn: dn };`);
    const low = run(0, false), mid = run(1, true), high = run(2, true), under = run(2, false);
    for (const [name, q] of [['low, standing', low], ['mid, held up in it', mid], ['high, held up in it', high]]) {
      expect(q.passed, `${name}: it passed`).toBe(true);
      expect(q.calls, `${name}: not hit`).toBe(0);
    }
    expect(under.passed).toBe(true);
    expect(under.calls, 'standing under a high gap: hit, and only once for the whole pass').toBe(1);
  });

  it('EVERY GAP IS IN REACH, FOR EVERY FIGHTER: from the floor, at a jump of 0.88 (the lowest a fighter\'s stats go) and at 1, one jump or a double puts each fighter\'s whole outline in each gap for longer than the fastest wall takes to pass them', () => {
    const r = fight(`
      park(); floorAt(you, X); you.controller = 'local'; you.invuln = 1e9;
      var gy = groundY(), out = { lv: COBS_LASER.lv.slice(), gap: COBS_LASER.gap, w: COBS_LASER.w, spd: Math.max.apply(null, COBS_TIERS.cannon.map(function(T){ return T.spd; })), jumps: {} };
      [0.88, 1].forEach(function(jk){
        var trajs = [];
        [-1].concat([3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]).forEach(function(a){
          for (var k in down) down[k] = false; floorAt(you, X); you.st.jump = jk; you.jumps = 2; var hs = [];
          for (var t=0;t<90;t++){ for (var k2 in down) down[k2] = false; down[KEYS.jump] = a < 0 ? true : t !== a - 1; park(); you.x = X; step(); hs.push(gy - feetY(you)); if (t > 2 && you.onground) break; }
          trajs.push({ a: a, hs: hs }); });
        out.jumps[jk] = trajs; });
      for (var k in down) down[k] = false; you.st.jump = 1;
      out.bodies = ROSTER.filter(function(q){ return q.play; }).map(function(q){ var f = makeFighter(q, 500, 500, 0), P = bodyPts(f), ft = feetY(f), up = 0, dn = 0, half = 0;
        for (var i=0;i<P.length;i+=2){ up = Math.max(up, ft - P[i+1]); dn = Math.max(dn, P[i+1] - ft); half = Math.max(half, Math.abs(P[i] - f.x)); } return { name: q.name, up: up, dn: dn, half: half }; });
      return out;`);
    expect(r.bodies.length, 'every playable fighter').toBeGreaterThan(50);
    for (const jk of ['0.88', '1']) {
      for (let lv = 0; lv < r.lv.length; lv++) {
        const lo = r.lv[lv];
        for (const b of r.bodies) {
          const wl = lo + b.dn, wh = lo + r.gap - b.up;   // where its feet must be (over the floor) for its outline to be inside the gap
          const need = Math.ceil((r.w + 2 * b.half) / r.spd) + 1;   // frames the fastest wall takes to pass its outline
          if (lo < 0 && wl <= 0 && wh >= 0) continue;   // the low gap: standing is inside it
          let best = 0;
          for (const tr of r.jumps[jk]) { let run = 0; for (const h of tr.hs) { if (h >= wl && h <= wh) { run++; best = Math.max(best, run); } else run = 0; } }
          expect(best, `jump ${jk}, gap ${lv} (${lo} to ${lo + r.gap} px up), ${b.name}: frames inside it, need ${need}`).toBeGreaterThanOrEqual(need);
        }
      }
    }
  });
});

describe('EACH WALL\'S GAP IS MEASURED FROM WHERE THE FIGHTER STANDS AS ITS TELL BEGINS', () => {
  it('a fighter who climbs onto a platform mid-volley gets the next walls\' gaps over that platform, not over the floor it left (and the one already shown keeps its line)', () => {
    const r = fight(`
      park(); atTier(3); floorAt(you, X); you.invuln = 1e9; var gy = groundY(), PY = gy - 150;
      worldPlats.push({ x:X - 150, y:PY, w:300, h:12 });
      cobsFightTelegraph(s, 'cannon', you); s._tel = 0; COBS_MOVES.cannon(s, you, ++BOSS_ATK_ID); var S = s._ship, moved = false, at = {};
      for (var i=0;i<700 && s._ship;i++){ park(); you.invuln = 1e9; you.x = X;
        if (!moved && S.n - S.left >= 1){ moved = true; you.y = PY - you.r; you.vy = 0; you.onground = true; at.k = S.n - S.left; at.tellBegun = S.lines[at.k] != null; }
        if (moved){ you.y = PY - you.r; you.vy = 0; }
        step(); }
      var L = S.lines.map(function(y){ return Math.round(gy - y); });
      return { L: L, k: at.k, tellBegun: at.tellBegun };`);
    expect(r.k, 'they climbed once the first wall was out').toBe(1);
    expect(r.L.length, 'every wall of the volley had its line').toBe(5);
    expect(r.L[0], 'the first wall: over the floor they stood on').toBe(0);
    if (r.tellBegun) expect(r.L[r.k], 'the wall already shown when they climbed keeps the floor').toBe(0);
    for (let i = r.k + 1; i < r.L.length; i++) expect(r.L[i], `wall ${i}: over the platform they stand on now`).toBe(150);
  });
});

describe('A CPU FIGHTER READS THE WALLS (they are not shots, so nothing it read saw them)', () => {
  it('a CPU fighter jumps for the gap: of the walls that reach it, it is in the gap for most; one that never presses a key is hit by every wall whose gap is off the floor', () => {
    const run = (ctrl) => fight(`
      park(); atTier(3); floorAt(you, X); you.controller = '${ctrl}';
      var hit = 0, met = 0, offFloor = 0;
      for (var v=0; v<4; v++){
        floorAt(you, X); s._ship = null; cobsFightTelegraph(s, 'cannon', you); s._tel = 0; COBS_MOVES.cannon(s, you, ++BOSS_ATK_ID); var S = s._ship, seen = {};
        for (var i=0;i<700 && s._ship;i++){ park(); you.x = X; you.vx = 0; you.pct = 0; you.invuln = 0; if (you.hitstun > 0){ you.hitstun = 0; } step();
          S.walls.forEach(function(w){ if (seen[w.k]) return; if (w.hit[you.idx]){ seen[w.k] = 1; hit++; met++; if (w.lv) offFloor++; } else if (w.dir*(w.x - X) > 80){ seen[w.k] = 1; met++; if (w.lv) offFloor++; } }); }
      }
      return { hit: hit, met: met, offFloor: offFloor };`);
    const cpu = run('ai'), still = run('still');
    expect(still.met).toBeGreaterThan(12);
    expect(still.hit, 'never pressing a key: every wall whose gap is off the floor').toBe(still.offFloor);
    expect(cpu.met).toBeGreaterThan(12);
    expect(cpu.hit / cpu.met, 'a CPU fighter: in the gap for most of them').toBeLessThan(0.34);
  });
});
