import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// HIT ART. The owner, 2026-10-19: "give shockwaves and other things like that sprites. its too hard to know whats in or out of hitboxes
// without having hitboxes on, which is banned in competitions." Every attack draws its real hit area: the same shape, size and frames.
// These hold the shared toolkit to the hits themselves. The hitbox view's own record (DEBUG_HITS) is every shape a hit TESTED, frame by
// frame; what HIT_ART draws live on a frame must be exactly those shapes, and nothing on a frame where nothing is tested.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const page = (name, dx, dy, body, foe = 'Blocky') => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; HIT_ART.length=0;
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(foe)}; }), 400 + ${dx}, groundY()-24 + ${dy}, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step(); [A,D].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; f.pct=30; f.y = groundY()-24; f.vx=0; f.vy=0; }); D.y += ${dy};
  function geo(s){ return s.kind==='fan' ? [s.cx,s.cy,s.r0,s.r1,s.a0,s.a1,s.face<0?-1:1] : s.kind==='capsule' ? [s.x1,s.y1,s.x2,s.y2,s.r] : [s.x,s.y,s.r]; }
  function same(a, b){ if(a.kind!==b.kind) return false; var p=geo(a), q=geo(b); for(var i=0;i<p.length;i++) if(Math.abs(p[i]-q[i])>1e-6) return false; return true; }
  // act(), then n steps; for each frame: the shapes the hits tested, and the live shapes drawn for A this frame
  function frames(n, act){
    SHOW_HITBOXES = true; DEBUG_HITS.length = 0; HIT_ART.length = 0;
    var out = [];
    function take(i){
      var dbg = DEBUG_HITS.map(function(h){ return h.shape ? h.shape : { kind:'circle', x:h.x, y:h.y, r:h.r }; }).filter(function(s){ return s.kind!=='body'; });
      var live = HIT_ART.filter(function(e){ return e.o===A.idx && e.t===hazardT && e.m==='l'; });
      out.push({ i:i, dbg:dbg.length, live:live.length, every:dbg.every(function(s){ return live.some(function(e){ return same(e.sh, s); }); }), sh:live.map(function(e){ return { sh:e.sh, ox:e.ox, oy:e.oy, w:e.w, k:e.k, n:e.n, t:e.t }; }) });
      DEBUG_HITS.length = 0;
    }
    act(); take(0);
    for (var i=1;i<=n;i++){ step(); take(i); }
    SHOW_HITBOXES = false; DEBUG_HITS.length = 0;
    return out;
  }
  ${body}
})()`);

// frames where a hit was tested must draw exactly those shapes; frames where none was tested draw nothing live
const exact = (fr) => fr.filter((f) => f.dbg > 0 ? !(f.every && f.live === f.dbg) : f.live !== 0).map((f) => f.i);

describe('melee: each swing draws the shapes it tests, on the frames it tests them', () => {
  it('every moveset tilt and aerial of five fighters (back-airs behind, down-airs under)', () => {
    const r = page('Puffball', 400, 0, `
      var rows = [];
      ['Puffball','Pencil','Tree','Bow','Leafy'].forEach(function(nm){
        var kit = ROSTER.find(function(q){ return q.name===nm; }).kit; A.kit = kit; A.name = nm;
        var ms = msOf(A);
        ['ft','ut','dt','na','fa','ba','ua','da'].forEach(function(k){
          var S = ms && ms[k]; if(!S) return;
          A._mv = null; A.atkCd = 0; A.x = 400; A.y = groundY()-24; A.vx = 0; A.vy = 0; A.onground = true; A.face = 1;
          var fr = frames(mvTotal(S) + 2, function(){ mvStart(A, S, k); });
          var lit = fr.filter(function(f){ return f.dbg > 0; }).length;
          var behind = true, under = true;
          fr.forEach(function(f){ f.sh.forEach(function(e){ var s = e.sh;
            var maxX = s.kind==='capsule' ? Math.max(s.x1, s.x2) + s.r : s.kind==='fan' ? s.cx + s.r1 : s.x + s.r;
            if(k==='ba' && maxX > e.ox + 12 + (s.r||0)) behind = false;
            if(k==='da' && s.kind==='capsule' && Math.max(s.y1, s.y2) < e.oy + 30) under = false; }); });
          rows.push({ who:nm, k:k, bad:fr.filter(function(f){ return f.dbg > 0 ? !(f.every && f.live === f.dbg) : f.live !== 0; }).map(function(f){ return f.i; }), lit:lit, behind:behind, under:under });
        });
      });
      return rows;`);
    expect(r.length).toBeGreaterThan(30);
    for (const row of r) {
      expect(row.bad, `${row.who} ${row.k}: frames where the drawn shapes are not the tested ones`).toEqual([]);
      expect(row.lit, `${row.who} ${row.k} tests a box`).toBeGreaterThan(0);
      if (row.k === 'ba') expect(row.behind, `${row.who}'s back-air is drawn behind`).toBe(true);
      if (row.k === 'da') expect(row.under, `${row.who}'s down-air is drawn under`).toBe(true);
    }
  });

  it('a rehitting neutral air flashes once per hit', () => {
    const r = page('Bow', 400, 0, `
      var S = msOf(A).na; var b = S.boxes[0];
      var fr = frames(mvTotal(S) + 2, function(){ mvStart(A, S, 'na'); });
      return { rehit: b.rehit || 0, t0: b.t0 == null ? S.st : b.t0, ticks: fr.filter(function(f){ return f.sh.some(function(e){ return e.n === e.t; }); }).map(function(f){ return f.i; }) };`);
    expect(r.rehit).toBeGreaterThan(0);
    expect(r.ticks.length).toBeGreaterThan(1);
    for (let i = 1; i < r.ticks.length; i++) expect(r.ticks[i] - r.ticks[i - 1]).toBe(r.rehit);
  });

  it('the jab draws its fan on the press frame only, and the grab comes out as a tell, then closes', () => {
    const jab = page('Coiny', 400, 0, `return frames(6, function(){ A.atkCd = 0; doAttack(A); });`);
    expect(exact(jab)).toEqual([]);
    expect(jab[0].dbg).toBe(1);
    expect(jab[0].sh[0].sh.kind).toBe('fan');
    const grab = page('Coiny', 400, 0, `
      var G = grabOf(A), tells = [];
      var fr = frames(G.whiff, function(){ mvGrabStart(A); });
      return { st:G.st, bad:fr.filter(function(f){ return f.dbg > 0 ? !(f.every && f.live === f.dbg) : f.live !== 0; }).map(function(f){ return f.i; }),
        lit:fr.filter(function(f){ return f.dbg > 0; }).map(function(f){ return f.i; }) };`);
    expect(grab.bad).toEqual([]);
    expect(grab.lit.length).toBe(1);
  });
});

describe('up-specials: the rising swing is a ring at the cast point', () => {
  it("Knife's rising stab: the full ring it tests, left where he cast it as he rises", () => {
    const r = page('Knife', 400, 0, `
      var fr = frames(4, function(){ doUpSpecial(A); });
      var e = HIT_ART.find(function(q){ return q.k === A.idx + ':up'; });
      return { bad:fr.filter(function(f){ return f.dbg > 0 && !(f.every && f.live === f.dbg); }).map(function(f){ return f.i; }), first:fr[0].dbg,
        span: e ? e.sh.a1 - e.sh.a0 : 0, world: e ? e.w : 0, castY: e ? e.oy : 0, nowY: A.y, cy: e ? e.sh.cy : 0 };`);
    expect(r.first).toBe(1);
    expect(r.bad).toEqual([]);
    expect(r.span, 'upFan reaches all round the caster').toBeCloseTo(Math.PI * 2, 5);
    expect(r.world).toBe(1);
    expect(r.nowY, 'he has risen').toBeLessThan(r.castY - 10);
    expect(r.cy, 'the ring stayed at the cast point').toBeCloseTo(r.castY, 5);
  });

  it("a spin up-special's aura is drawn at its reach, flashing on its 6-frame ticks", () => {
    const r = page('Firey', 400, 0, `
      doUpSpecial(A); var out = [];
      for (var i=0;i<14;i++){ step(); var e = HIT_ART.find(function(q){ return q.k === A.idx + ':spin' && q.t === hazardT; }); if(e) out.push({ r:e.sh.r, tick:e.n === hazardT, saw:A._sawing }); }
      return { want: A.r + (A._spinR||30) - HURT_R0, out:out };`);
    expect(r.out.length).toBeGreaterThan(5);
    for (const o of r.out) { expect(o.r).toBeCloseTo(r.want, 6); expect(o.tick).toBe(o.saw % 6 === 0); }
  });
});

describe('smash patterns draw their true size', () => {
  it("the burst's tell is its full ring, and each frame of the expansion draws the radius it tests", () => {
    const r = page('Balloon', 400, 0, `
      doSmash(A); var tell = A._windup && A._windup.sh ? A._windup.sh.r : null;
      var r1 = SMASH_SPEC.airrel.rad + SMASH_SPEC.airrel.grow;
      var fr = frames(24, function(){});
      return { tell:tell, r1:r1, bad:fr.filter(function(f){ return f.dbg > 0 && !(f.every && f.live === f.dbg); }).map(function(f){ return f.i; }), lit:fr.filter(function(f){ return f.dbg > 0; }).length };`);
    expect(r.tell).toBe(r.r1);
    expect(r.lit).toBeGreaterThan(6);
    expect(r.bad).toEqual([]);
  });

  it("a plant's tell is the circle its release tests", () => {
    const r = page('Paintbrush', 400, 0, `
      doSmash(A); var tells = [], rel = null;
      SHOW_HITBOXES = true;
      for (var i=0;i<40 && !rel;i++){ DEBUG_HITS.length = 0; step();
        var t = HIT_ART.find(function(q){ return q.k === A.idx + ':plant' && q.t === hazardT; });
        if(t && t.m === 't') tells.push({ r:t.sh.r, p:t.p });
        var d = DEBUG_HITS.find(function(h){ return !h.shape; }); if(d) rel = { r:d.r, drawn: t && t.m === 'l' ? t.sh.r : null }; }
      SHOW_HITBOXES = false;
      return { tells:tells, rel:rel };`);
    expect(r.tells.length).toBeGreaterThan(8);
    expect(r.rel).not.toBe(null);
    for (const t of r.tells) expect(t.r).toBe(r.rel.r);
    expect(r.rel.drawn).toBe(r.rel.r);
    for (let i = 1; i < r.tells.length; i++) expect(r.tells[i].p).toBeGreaterThan(r.tells[i - 1].p);
  });

  it("a hop smash's stomp is drawn live on the way down at the radius it tests, and its landing marked ahead", () => {
    const r = page('Baseball', 400, 0, `
      var m = null, down = [], marks = 0;
      doSmash(A); m = A._sm;
      for (var i=0;i<60 && A._sm;i++){ step();
        var e = HIT_ART.find(function(q){ return q.k === A.idx + ':leap' && q.t === hazardT; });
        if(e) down.push({ r:e.sh.r, dy:e.sh.y - e.oy, x:e.sh.x - e.ox });
        if(HIT_ART.some(function(q){ return q.k === A.idx + ':leapLand' && q.t === hazardT && q.m === 't'; })) marks++; }
      return { rad: m && m.rad, half: A.r*0.5, down:down, marks:marks };`);
    expect(r.down.length).toBeGreaterThan(3);
    expect(r.marks).toBeGreaterThan(3);
    for (const d of r.down) { expect(d.r).toBe(r.rad); expect(d.dy).toBeCloseTo(r.half, 6); expect(d.x).toBe(0); }
  });

  it('a beam carries its band, and the snapshot sends it', () => {
    const r = page('Ruby', 400, 0, `doSmash(A); var b = beams[beams.length-1]; var s = serializeState(false); return { w: b && b.w, sent: s.beams.length ? s.beams[s.beams.length-1].w : null, want: SMASH_SPEC.beam.wide };`);
    expect(r.w).toBe(r.want);
    expect(r.sent).toBe(r.want);
  });
});

describe('wind-ups: the tell is drawn at exactly the reach that lands', () => {
  // Put the foe's outline just inside, then just outside, the drawn radius: inside it is caught, outside it is not.
  const CASES = [
    ['Bell', 'doSpecial(A)', 14], ['TV', 'doSpecial(A)', 14], ['Pillow', 'doSpecial(A)', 14], ['Barf Bag', 'doSpecial(A)', 14],
    ['Gaty', 'doSpecial(A)', 14], ['Bell', 'doDownSpecial(A)', 14], ['TV', 'doDownSpecial(A)', 14], ['Magnet', 'doDownSpecial(A)', 14],
    ['Tissues', 'doDownSpecial(A)', 56], ['Cammy', 'doSpecial(A)', 18],
  ];
  const probe = (who, cast, n, gap) => page(who, 300, 0, `
    ${cast}; var wu = A._windup; if(!wu || !wu.sh) return { none:true };
    var sh = wu.sh, cx = sh.wx != null ? sh.wx : A.x + (sh.x||0)*A.face, cy = sh.wy != null ? sh.wy : A.y + (sh.y||0);
    var lo = cx, hi = cx + 600; D.y = groundY()-24;
    for (var k=0;k<60;k++){ var mid = (lo+hi)/2; D.x = mid; if(hurtGap(D, cx, cy) < sh.r + ${gap}) lo = mid; else hi = mid; }
    D.x = (lo+hi)/2; D.vx = 0; D.vy = 0; var g0 = hurtGap(D, cx, cy);
    for (var i=0;i<${n};i++){ step(); D.x = (lo+hi)/2; D.vx = 0; }
    return { r:sh.r, g0:g0, hit: D.pct !== 30 || D._infected > 0 || D._stunFx > 0 || D.hitstun > 0 || D.defineStacks > 0 };`);
  it.each(CASES)('%s %s', (who, cast, n) => {
    const inside = probe(who, cast, n, -1.5), outside = probe(who, cast, n, 1.5);
    expect(inside.none, 'the wind-up says what it will hit').toBeUndefined();
    expect(inside.g0).toBeCloseTo(inside.r - 1.5, 1);
    expect(inside.hit, `${who}: a foe 1.5 px inside the drawn ${inside.r} px is caught`).toBe(true);
    expect(outside.hit, `${who}: a foe 1.5 px outside it is not`).toBe(false);
  });
});

describe('the wire', () => {
  it('a shape packed for a client comes back the same shape', () => {
    const r = page('Coiny', 400, 0, `
      var shapes = [ { kind:'fan', cx:401.27, cy:300.5, r0:9.6, r1:71.3, a0:-0.55, a1:0.45, face:-1 }, { kind:'capsule', x1:10, y1:20, x2:90.4, y2:22, r:14 }, { kind:'circle', x:5, y:6, r:80 } ];
      return shapes.map(function(s, i){ var e = hitArt(A, 'w' + i, s, { tell: i===2, p:0.5 }); var back = haUnpack(JSON.parse(JSON.stringify(haPack(e))));
        var p = geo(s), q = geo(back.sh); var d = 0; for (var j=0;j<p.length;j++) d = Math.max(d, Math.abs(p[j]-q[j])); return { d:d, m:back.m, kind:back.sh.kind }; });`);
    for (const x of r) expect(x.d).toBeLessThan(0.06);
    expect(r[2].m).toBe('t');
  });
});
