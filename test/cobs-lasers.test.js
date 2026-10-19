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
          if (s._ship) s._ship.walls.forEach(function(w){ if (!walls[w.k]){ walls[w.k] = { lv:w.lv, size:w.bot - w.top, dir:w.dir, spd:w.spd, id:w.id, x:w.x, reach:i + w.dir*(X - w.x)/w.spd }; born[w.k] = i; } }); }
        var ks = Object.keys(walls).sort(function(a, b){ return a - b; });
        return { n:ks.length, want:T.n, every:T.every, spd:T.spd, rock:T.rock, toward:toward, gone:!s._ship, gap:COBS_LASER.gap,
          walls:ks.map(function(k){ return walls[k]; }), born:ks.map(function(k){ return born[k]; }) };`);
      expect(r.n, `tier ${t}: the tier's walls`).toBe(r.want);
      expect(r.want, 'four to six of them').toBeGreaterThanOrEqual(4);
      expect(r.want).toBeLessThanOrEqual(6);
      expect(r.gone, 'then the ship goes').toBe(true);
      // one every `every` frames (about a second) WHERE THEY REACH THE FIGHTER: the boat rocks (tier 2 up), so each leaves its cannon when that puts it on the beat (cobsLaserBeat)
      expect(r.every / 60, 'about a second apart').toBeGreaterThanOrEqual(0.85);
      expect(r.every / 60).toBeLessThanOrEqual(1.1);
      r.walls.slice(1).forEach((w, i) => expect(Math.abs(w.reach - r.walls[0].reach - (i + 1)*r.every), `tier ${t}, wall ${i + 1}: reaches the fighter on the beat, ${r.every} frames a wall after the first (to the frame)`).toBeLessThanOrEqual(1));
      if (r.rock) r.born.slice(1).forEach((b, i) => expect(b - r.born[i], `tier ${t}: and leaves the cannon after the one before has gone and the next tell has run`).toBeGreaterThan(36));
      for (const w of r.walls) {
        expect(w.dir, 'down the line, toward the fighter').toBe(r.toward);
        expect(w.spd).toBe(r.spd);
        expect(w.size, 'one gap, COBS_LASER.gap[its height] tall').toBe(r.gap[w.lv]);
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

  it('THE TELL: every wall\'s gap is drawn at least half a second before it fires -- the first from the wind-up\'s lock -- exactly where it will be, standing still where the wall will leave the rocking boat\'s cannon', () => {
    const r = fight(`
      park(); atTier(4); floorAt(you, X); you.invuln = 1e9;
      var shown = {}, fired = {}, DT = drawCobsLaserTell, cur = null, k = 0;
      drawCobsLaserTell = function(x, dir, g){ var key = Math.round(g.top) + ':' + Math.round(g.bot); if (cur !== key){ cur = key; shown[k] = { at:i, top:g.top, bot:g.bot, x0:x, x:x }; } else if (shown[k]){ shown[k].x = x; shown[k].moved = Math.max(shown[k].moved || 0, Math.abs(x - shown[k].x0)); } return DT.apply(this, arguments); };
      var i = 0;
      try {
        cobsFightTelegraph(s, 'cannon', you);
        for (i=0;i<900;i++){ park(); you.invuln = 1e9; you.x = X; step(); var S = s._ship; if (S){ var n = S.n - S.left; while (k < n){ var wk = S.walls.filter(function(w){ return w.k === k; })[0]; fired[k] = { at:i, w:wk, from: wk ? wk.x - wk.dir*wk.spd : null }; k++; cur = null; } }
          drawCobsFx(); if (s._tel <= 0 && !s._ship && i > 60) break; }
      } finally { drawCobsLaserTell = DT; }
      return Object.keys(fired).map(function(q){ var a = shown[q], b = fired[q]; return { ahead: a ? b.at - a.at : -1, same: !!(a && b.w && Math.abs(a.top - b.w.top) < 1e-6 && Math.abs(a.bot - b.w.bot) < 1e-6), off: a && b.from != null ? Math.abs(a.x - b.from) : 1e9, moved: a ? (a.moved || 0) : 1e9 }; });`);
    expect(r.length, 'the whole volley').toBeGreaterThanOrEqual(4);
    r.forEach((q, i) => {
      expect(q.ahead, `wall ${i}: its gap shown before it fires (frames)`).toBeGreaterThanOrEqual(30);
      expect(q.same, `wall ${i}: shown where it comes`).toBe(true);
      expect(q.off, `wall ${i}: its ghost stands where it leaves the cannon (the boat rocks: tier 4)`).toBeLessThanOrEqual(1);
      expect(q.moved, `wall ${i}: and stands still while it is shown`).toBeLessThanOrEqual(1);
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

  it('EVERY GAP IS IN REACH, FOR EVERY FIGHTER: from the floor, at a jump of 0.88 (the lowest a fighter\'s stats go) and at 1 (every fighter today), with a fall of 1 or 1.12, one jump or a double puts each fighter\'s whole outline in each gap for longer than the fastest wall takes to pass them -- and the high gap holds the plain double jump (the second press at the top of the first) at its peak, at 0.88 and at 1 alike', () => {
    const r = fight(`
      park(); floorAt(you, X); you.controller = 'local'; you.invuln = 1e9;
      var gy = groundY(), out = { lv: COBS_LASER.lv.slice(), gap: COBS_LASER.gap, w: COBS_LASER.w, spd: Math.max.apply(null, COBS_TIERS.cannon.map(function(T){ return T.spd; })), jumps: {} };
      [[0.88, 1], [0.88, 1.12], [1, 1], [1, 1.12]].forEach(function(jf){
        var jk = jf[0], trajs = [];
        [-1].concat([3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]).forEach(function(a){
          for (var k in down) down[k] = false; floorAt(you, X); you.st.jump = jk; you.st.fall = jf[1]; you.jumps = 2; var hs = [];
          for (var t=0;t<90;t++){ for (var k2 in down) down[k2] = false; down[KEYS.jump] = a < 0 ? true : t !== a - 1; park(); you.x = X; step(); hs.push(gy - feetY(you)); if (t > 2 && you.onground) break; }
          trajs.push({ a: a, hs: hs }); });
        out.jumps[jf.join('/')] = trajs; });
      for (var k in down) down[k] = false; you.st.jump = 1; you.st.fall = 1;
      out.bodies = ROSTER.filter(function(q){ return q.play; }).map(function(q){ var f = makeFighter(q, 500, 500, 0), P = bodyPts(f), ft = feetY(f), up = 0, dn = 0, half = 0;
        for (var i=0;i<P.length;i+=2){ up = Math.max(up, ft - P[i+1]); dn = Math.max(dn, P[i+1] - ft); half = Math.max(half, Math.abs(P[i] - f.x)); } return { name: q.name, up: up, dn: dn, half: half }; });
      return out;`);
    expect(r.bodies.length, 'every playable fighter').toBeGreaterThan(50);
    for (const jk of ['0.88/1', '0.88/1.12', '1/1', '1/1.12']) {
      // the plain double jump: the second press the frame after the first jump tops out
      const single = r.jumps[jk].find((tr) => tr.a < 0).hs, top = single.indexOf(Math.max(...single)), plain = r.jumps[jk].find((tr) => tr.a === top + 1) || r.jumps[jk].find((tr) => tr.a === top);
      expect(plain, `jump ${jk}: the plain double jump was measured`).toBeTruthy();
      for (const b of r.bodies) {
        const peak = Math.max(...plain.hs);
        expect(peak, `jump ${jk}, ${b.name}: a plain double jump tops out with its whole outline in the high gap (not into the bar over it)`).toBeLessThanOrEqual(r.lv[2] + r.gap[2] - b.up - 4);
        expect(peak).toBeGreaterThanOrEqual(r.lv[2] + b.dn + 4);
      }
      for (let lv = 0; lv < r.lv.length; lv++) {
        const lo = r.lv[lv];
        for (const b of r.bodies) {
          const wl = lo + b.dn, wh = lo + r.gap[lv] - b.up;   // where its feet must be (over the floor) for its outline to be inside the gap
          const need = Math.ceil((r.w + 2 * b.half) / r.spd) + 1;   // frames the fastest wall takes to pass its outline
          if (lo < 0 && wl <= 0 && wh >= 0) continue;   // the low gap: standing is inside it
          let best = 0;
          for (const tr of r.jumps[jk]) { let run = 0; for (const h of tr.hs) { if (h >= wl && h <= wh) { run++; best = Math.max(best, run); } else run = 0; } }
          expect(best, `jump/fall ${jk}, gap ${lv} (${lo} to ${lo + r.gap[lv]} px up), ${b.name}: frames inside it, need ${need}`).toBeGreaterThanOrEqual(need);
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

describe('A WALL STANDS ON ITS LINE: from its foot (16 px under the line) up to its roof, and that is what is drawn', () => {
  it('with two fighters, the one on the floor under the ledge the walls are aimed at is out of their path -- and the walls still hit the one on the ledge who stands under their gaps', () => {
    W.Math.random = mulberry32(9);
    const r = W.eval(`(function(){
      SETTINGS.itemRate=0; SETTINGS.stocks=3; LOCAL_PLAYERS=1;
      startCobsFight(['Knife', 'Pencil'], { story:false, onEnd:function(){ return true; } });
      var s = summons.find(function(o){ return o._cobsFight; }); s._hop = null; s._introT = 0;
      var MZ = cobsMazeStep; cobsMazeStep = function(){};
      var A = fighters[0], B = fighters[1], gy = groundY(), X = 3000, PY = gy - 300; A.controller = 'still'; B.controller = 'still';
      worldPlats.push({ x:X - 150, y:PY, w:300, h:12 });
      var park = function(){ s._atkTimer = 1e9; s._holdT = 1e9; s.x = X - 1400; s.y = gy - 900; s.vx = 0; s.vy = 0; };
      var put = function(){ A.x = X; A.y = PY - A.r; A.vx = 0; A.vy = 0; B.x = X + 60; B.y = gy - B.r; B.vx = 0; B.vy = 0; [A, B].forEach(function(f){ f.pct = 0; f.hitstun = 0; f.invuln = 0; }); };
      var out = { walls:0, hitA:0, hitB:0, offA:0, lines:[] };
      try {
        for (var v=0; v<3; v++){
          s._marks = 2; s._ship = null; put(); park(); step(); put();
          cobsFightTelegraph(s, 'cannon', A); s._tel = 0; COBS_MOVES.cannon(s, A, ++BOSS_ATK_ID);
          var S = s._ship, seen = {};
          for (var i=0;i<800 && s._ship;i++){ park(); put(); step();
            S.walls.forEach(function(w){ if (seen[w.k] || w.dir*(w.x - (X + 60)) < 60) return; seen[w.k] = 1; out.walls++; out.lines.push(Math.round(gy - w.line));
              if (w.hit[A.idx]) out.hitA++; if (w.hit[B.idx]) out.hitB++; if (w.lv) out.offA++; }); }
        }
      } finally { cobsMazeStep = MZ; }
      return out;
    })()`);
    expect(r.walls, 'three volleys').toBeGreaterThanOrEqual(12);
    r.lines.forEach((y) => expect(y, 'every wall stands on the ledge the fighter it was aimed at stood on').toBe(300));
    expect(r.hitB, 'the fighter on the floor under it: out of its path, never hit').toBe(0);
    expect(r.hitA, 'the one on the ledge, never jumping: hit by every wall whose gap is off the ledge').toBe(r.offA);
  });

  it('a LOW gap has no bar under it: measured from a 14 px pane, it does not hit a fighter who steps off the pane onto the floor beside it -- and the wall is drawn where it hits', () => {
    const r = fight(`
      var gy = groundY(), out = {};
      worldPlats = worldPlats.filter(function(p){ return !p._cobsPane; }); cobsPlacePane(X, gy, 100000);
      you.x = X; you.y = gy - COBS_PANE_H - you.r; you.vx = 0; you.vy = 0; park(); step(); step();
      atTier(3); cobsFightTelegraph(s, 'cannon', you); s._tel = 0; COBS_MOVES.cannon(s, you, ++BOSS_ATK_ID);
      var S = s._ship; S.gaps = S.gaps.map(function(){ return 0; });
      var hits = 0; out.line = Math.round(gy - S.lines[0]);
      for (var i=0;i<700 && s._ship;i++){ park(); you.x = X + 150; you.y = gy - you.r; you.vx = 0; you.vy = 0; you.hitstun = 0; you.invuln = 0; var p0 = you.pct; step(); if (you.pct > p0) hits++; }
      out.hits = hits;
      // what is drawn (cobsLaserBars, which drawCobsLaserWall and its tell draw with): a mid wall on a ledge 300 px up, a low one there, a mid one on the floor
      var g = cobsLaserGap(gy - 300, 1);
      out.g = g; out.B = cobsLaserBars(g, gy); out.low = cobsLaserBars(cobsLaserGap(gy - 300, 0), gy); out.fl = cobsLaserBars(cobsLaserGap(gy, 1), gy); out.flg = cobsLaserGap(gy, 1); out.sky = cobsTopY() - 40; out.gy = gy;
      return out;`);
    expect(r.line, 'the first wall was measured from the pane').toBe(14);
    expect(r.hits, 'standing on the floor beside the pane: every low gap passes them by').toBe(0);
    expect(r.B.over, 'the bar over the gap: from its roof (or just over the top of the screen) to the gap').toEqual([Math.max(r.sky, r.g.roof), r.g.top]);
    expect(r.B.under, 'the bar under it: from the gap down to its foot, 16 px under the ledge -- not to the floor').toEqual([r.g.bot, r.g.foot]);
    expect(r.g.foot, 'its foot').toBe(r.gy - 300 + 16);
    expect(r.low.under, 'a low gap: no bar under it').toBe(null);
    expect(r.fl.under, 'on the floor: down to the floor').toEqual([r.flg.bot, r.gy]);
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

describe('OWNER: THE INTENDED ATTACK -- "reduce attack speed during the ship. if attacks are firing at the same time, increase cooldowns for his attacks while the \'intended\' attack fires."', () => {
  it('while the walls are in flight his clock and his countdown run COBS_INTENDED_SLOW times slower and no other big attack starts (a big one is held, not lost); the moment the volley is over his pace is his own', () => {
    const r = fight(`
      atTier(3); floorAt(you, X); you.invuln = 1e9;
      s._holdT = 0; s._atkTimer = 1e9; s._turnLive = null;
      var keep = function(){ you.invuln = 1e9; you.pct = 0; you.x = X; you.vx = 0; };
      cobsFightTelegraph(s, 'cannon', you); s._tel = 0; s._telKind = null; COBS_MOVES.cannon(s, you, ++BOSS_ATK_ID);
      var S = s._ship, n = 0;
      while (S.arm > 0 && n++ < 100){ keep(); step(); }
      // (a) his clock and the TICK, TOCK! countdown, 30 frames into the volley
      s._atkTimer = 60; s._tick = { t:100, T:100 };
      for (var i=0;i<30;i++){ keep(); step(); }
      var during = { atk:60 - s._atkTimer, tick:100 - s._tick.t, live:cobsIntendedLive(s), walls:S.walls.length, left:S.left };
      s._tick = null;
      // (b) what starts while it runs: a special is due (MePhone X's deletion, a big one) and the bag's next cards are big ones; every turn is let start at once
      s._moveN = 2; s._spN = COBS_SPECIALS.indexOf('deletion'); s._bag = ['van', 'device', 'meknife', 'boomerangs', 'springs'];
      var started = [], k = 0;
      for (k=0; k<900 && cobsIntendedLive(s); k++){ keep(); if (!s._turnLive && !(s._tel > 0)) s._atkTimer = Math.min(s._atkTimer, 1); var was = s._tel > 0; step(); if (!was && s._tel > 0) started.push(s._telKind); }
      var over = !cobsIntendedLive(s);
      // (c) after it: the held special comes first, and his clock runs at his own pace
      var next = null;
      for (var j=0; j<600 && !next; j++){ keep(); if (!s._turnLive && !(s._tel > 0)) s._atkTimer = Math.min(s._atkTimer, 1); var was2 = s._tel > 0; step(); if (!was2 && s._tel > 0) next = s._telKind; }
      s._tel = 0; s._telKind = null; s._xs = []; s._redT = 0; s._turnLive = null; s._atkTimer = 60;
      for (var q=0;q<30;q++){ keep(); step(); }
      return { slow:COBS_INTENDED_SLOW, during:during, started:started, big:COBS_BIG, over:over, next:next, after:60 - s._atkTimer, pace:cobsPace(s) };`);
    expect(r.slow, 'x1.75 to x2').toBeGreaterThanOrEqual(1.75);
    expect(r.slow).toBeLessThanOrEqual(2);
    expect(r.during.live, 'the walls are in flight').toBe('cannon');
    expect(r.during.atk, 'his clock, 30 frames into the volley').toBeCloseTo(30 / r.slow, 5);
    expect(r.during.tick, 'the countdown too').toBeCloseTo(30 / r.slow, 5);
    expect(r.over, 'the volley ends').toBe(true);
    expect(r.started.length, 'quick ones still come').toBeGreaterThan(0);
    for (const k of r.started) expect(r.big, `${k} started during the volley`).not.toContain(k);
    expect(r.next, 'the big special held during the volley is the first after it').toBe('deletion');
    expect(r.pace).toBe(1);
    expect(r.after, 'after the volley: his own pace, a frame a frame').toBe(30);
  });
});
