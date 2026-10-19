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

// ---- phase 2: finishers and pops, counters and reflects, traps and shots, Final Smash rings, assist trophies (audit A4-A6) ----

// Slide the foe along x (it keeps its height) until its outline is `want` px from (cx, cy), by bisection on the real hurtGap.
const PLACE = `function place(cx, cy, want){ var lo = cx, hi = cx + 900; for (var k=0;k<60;k++){ var mid = (lo+hi)/2; D.x = mid; if(hurtGap(D, cx, cy) < want) lo = mid; else hi = mid; } D.x = (lo+hi)/2; D.vx = 0; D.vy = 0; return hurtGap(D, cx, cy); }`;

describe('finishers and pops: the impact is the disc that hits', () => {
  it('the shared finisher draws the disc it tests on the press frame, and it lingers as an impact', () => {
    const r = page('Coiny', 400, 0, `
      var who = ROSTER.find(function(q){ return q.play && q.kit && !ATKSPECIALS[q.kit.special]; });
      A.kit = who.kit; A.name = who.name;
      var e = null;
      var fr = frames(10, function(){ doAttackSpecial(A); e = HIT_ART.find(function(q){ return q.o === A.idx && q.m === 'l'; }) || null; });
      return { who:who.name, bad:fr.filter(function(f){ return f.dbg > 0 ? !(f.every && f.live === f.dbg) : f.live !== 0; }).map(function(f){ return f.i; }),
        lit:fr.filter(function(f){ return f.dbg > 0; }).map(function(f){ return f.i; }), fd: e ? e.fd : null, want: FIN_ART_FADE, r0: fr[0].sh.length ? fr[0].sh[0].sh.r : null, rr: A.r + 26 };`);
    expect(r.lit, `${r.who}: the finisher is one frame`).toEqual([0]);
    expect(r.bad).toEqual([]);
    expect(r.r0).toBe(r.rr);
    expect(r.fd, 'it fades as an impact').toBe(r.want);
  });

  it("Silver Spoon's Glowing Gold: the pop's ring is drawn at its reach on the frame it pops; a foe 1.5 px inside is popped, 1.5 px outside is not", () => {
    const probe = (gap) => page('Silver Spoon', 300, 0, `${PLACE}
      var R = A.r + 56; place(A.x, A.y, R + ${gap}); var p0 = D.pct;
      doSpecial(A);
      var e = HIT_ART.find(function(q){ return q.k === A.idx + ':pop'; });
      return { r: e ? e.sh.r : null, t: e ? e.t : null, now: hazardT, R: R, popped: D.pct > p0 };`);
    const inside = probe(-1.5), outside = probe(1.5);
    expect(inside.r).toBe(inside.R);
    expect(inside.t).toBe(inside.now);
    expect(inside.popped).toBe(true);
    expect(outside.popped).toBe(false);
  });

  it("Loser's Stay Cool tells the cold blast at its reach, filling in, and the pop lands exactly there", () => {
    const r = page('Loser', 400, 0, `
      doSpecial(A); var tells = [], pop = null;
      for (var i=0;i<LOSER_COOL_FRAMES + 2 && !pop;i++){ step();
        var t = HIT_ART.find(function(q){ return q.k === A.idx + ':cool' && q.t === hazardT; }); if(t) tells.push({ r:t.sh.r, p:t.p, m:t.m });
        var e = HIT_ART.find(function(q){ return q.k === A.idx + ':pop' && q.t === hazardT; }); if(e) pop = { r:e.sh.r }; }
      return { tells:tells, pop:pop, want:A.r + 60 };`);
    expect(r.tells.length).toBeGreaterThan(15);
    for (const t of r.tells) { expect(t.m).toBe('t'); expect(t.r).toBe(r.want); }
    for (let i = 1; i < r.tells.length; i++) expect(r.tells[i].p).toBeGreaterThan(r.tells[i - 1].p);
    expect(r.pop).toEqual({ r: r.want });
  });
});

describe('counters and reflects: the window is the outline, and the answer is a path to the attacker', () => {
  it('a countered jab draws the strike back from the counterer to the attacker; Needle sends a needle', () => {
    const r = page('Coiny', 40, 0, `
      var out = {};
      D.countering = 20; D._riposte = false; A.atkCd = 0; var a0 = A.pct, d0 = D.pct; doAttack(A);
      var e = HIT_ART.find(function(q){ return q.k === D.idx + ':riposte'; });
      out.gen = e ? { s:e.s, x1:e.sh.x1, x2:e.sh.x2, w:e.w } : null; out.ax = A.x; out.dx = D.x; out.hurtA = A.pct > a0; out.hurtD = D.pct > d0;
      return out;`);
    expect(r.hurtD, 'the counter took the jab').toBe(false);
    expect(r.hurtA, 'and answered it').toBe(true);
    expect(r.gen).toEqual({ s: 'strike', x1: r.dx, x2: r.ax, w: 1 });
    const n = page('Coiny', 40, 0, `
      D.countering = 20; D._riposte = true; A.atkCd = 0; doAttack(A);
      var e = HIT_ART.find(function(q){ return q.k === D.idx + ':riposte'; }); return e ? e.s : null;`, 'Needle');
    expect(n).toBe('needle');
  });

  it("a turned shot leaves a glint where it turned, and the stances ride the net's own flags", () => {
    const r = page('Ruby', 120, 0, `
      D.reflecting = 30; spawnProj(A, { vx:8, vy:0, grav:false, dmg:5, kb:4, r:9, color:'#e0384b', life:60 });
      var g = null; for (var i=0;i<30 && !g;i++){ step(); g = HIT_ART.find(function(q){ return q.k === D.idx + ':turn'; }) || null; }
      return { s: g && g.s, w: g && g.w, flags: ['countering','reflecting'].every(function(k){ return NET_FIGHTER_FLAGS.indexOf(k) >= 0; }) };`);
    expect(r.s).toBe('glint');
    expect(r.w).toBe(1);
    expect(r.flags).toBe(true);
  });
});

describe('traps, shots and lingering zones: a disc of exactly pr.r', () => {
  it("Bomby's mine: dashed while it falls and arms (filling in), solid once armed -- and the drawn edge is where it goes off", () => {
    const probe = (gap) => page('Bomby', 600, 0, `${PLACE}
      DOWNSPECIALS.bomb(A); var pr = projectiles[projectiles.length-1], seen = [];
      for (var i=0;i<200 && haShotState(pr) !== 2;i++){ seen.push({ st:haShotState(pr), p:haShotArm(pr) }); step(); }
      var armedAt = i; place(pr.x, pr.y, pr.r + ${gap}); var p0 = D.pct; D.invuln = 0;
      step();
      return { seen:seen, armedAt:armedAt, hit: D.pct > p0 || pr.life <= 0 };`);
    const inside = probe(-1.5), outside = probe(1.5);
    expect(inside.armedAt).toBeLessThan(200);
    expect(inside.seen.every((x) => x.st === 3)).toBe(true);
    const ps = inside.seen.map((x) => x.p);
    for (let i = 1; i < ps.length; i++) expect(ps[i]).toBeGreaterThanOrEqual(ps[i - 1]);
    expect(ps[ps.length - 1]).toBeGreaterThan(0.9);
    expect(inside.hit, 'a foe 1.5 px inside the armed disc sets it off').toBe(true);
    expect(outside.hit, 'a foe 1.5 px outside does not').toBe(false);
  });

  it('what each shot shows: in flight, armed, a zone and what it does, a trap that never arms, a boss shot, an assist mine -- and the snapshot carries it', () => {
    const r = page('Rocky', 900, 0, `
      var out = {};
      spawnProj(A, { vx:8, vy:0, grav:false, dmg:5, kb:4, r:9, color:'#fff', life:60 }); out.flight = haShotState(projectiles[projectiles.length-1]);
      projectiles = []; DOWNSPECIALS.barf(A); var pz = projectiles[0]; for (var i=0;i<80 && pz.falling;i++) step();
      out.zone = [haShotState(pz), haShotZone(pz)];
      var zs = {}; [['Pen','cap'],['Firey','ember'],['Marker','ink']].forEach(function(q){ projectiles = []; DOWNSPECIALS[q[1]](A); zs[q[0]] = haShotZone(projectiles[0]); }); out.zs = zs;
      projectiles = []; addProj({ owner:A.idx, ownerObj:A, x:500, y:groundY()-20, vx:0, vy:0, grav:false, dmg:0, kb:0, r:16, color:'#fff', life:100, trap:true, arm:1e9, noFall:true }); out.never = haShotState(projectiles[0]);
      projectiles = []; addProj({ owner:-2, ownerObj:{ team:-1, idx:-2 }, x:500, y:300, vx:4, vy:0, grav:false, dmg:5, kb:3, r:12, color:'#f00', life:60 }); out.boss = haShotState(projectiles[0]);
      projectiles = []; addProj({ owner:-2, ownerObj:{ team:0, idx:-2 }, x:500, y:groundY()-8, vx:0, vy:0, grav:false, dmg:12, kb:11, r:12, color:'#4a9c6a', life:480, trap:true, arm:30, assist:true, noFall:true }); out.assist = haShotState(projectiles[0]);
      projectiles = [pz]; var s = serializeState(false); var row = s.pj.a[0]; out.net = row[8] && row[8].hz;
      return out;`);
    expect(r.flight).toBe(1);
    expect(r.zone).toEqual([2, 'poison']);
    expect(r.zs).toEqual({ Pen: 'slick', Firey: 'burn', Marker: 'slow' });
    expect(r.never, 'a prop that never arms draws no reach').toBe(0);
    expect(r.boss, "a boss's flying shot carries its true disc too (audit C: its art was up to 3x what hits)").toBe(1);
    expect(r.assist).toBe(3);
    expect(r.net).toEqual([2, 0, 'poison']);
  });
});

describe('Final Smash rings and assist trophies', () => {
  it("a pin lock's ring is its catch edge: a standard body touching it is caught, 1.5 px off it is not", () => {
    const probe = (gap) => page('Golf Ball', 200, 0, `
      var S = FINAL_SMASHES['Golf Ball'], st = { hit:new Set(), caught:[] }, w = S.wind, R = 80;
      D.hurt = null; D.r = HURT_R0; D.invuln = 0;
      S.start(A, st); for (var t=0;t<=w - 18;t++) S.tick(A, st, t);
      D.x = A.fsAx + fsPinEdge(R) + HURT_R0 + ${gap}; D.y = A.fsAy;
      for (var t2=w - 17;t2<=w;t2++) S.tick(A, st, t2);
      return { caught: st.caught.indexOf(D.idx) >= 0, edge: fsPinEdge(R) };`);
    expect(probe(-1.5).caught).toBe(true);
    expect(probe(1.5).caught).toBe(false);
  });

  it("a second ring is told from the start and drawn full size on the frame it lands; the first, too", () => {
    const r = page('Gelatin', 900, 0, `
      var S = FINAL_SMASHES['Gelatin'], w = S.wind, calls = [], L0 = fsLandRing, T0 = fsTellRing, A0 = fsArchTell;
      fsLandRing = function(c, x, y, R, col, u){ calls.push({ t:A.fsT, k:'land', R:R, u:u }); };
      fsTellRing = function(c, x, y, R, col, p){ calls.push({ t:A.fsT, k:'tell', R:R }); };
      fsArchTell = function(){};
      try { A.fsWind = w; for (var t=0;t<w + 40;t++){ A.fsT = t; S.draw(A, ctx); } } finally { fsLandRing = L0; fsTellRing = T0; fsArchTell = A0; }
      return { w:w, calls:calls };`);
    const tells = r.calls.filter((c) => c.k === 'tell'), lands = r.calls.filter((c) => c.k === 'land');
    expect(tells.length).toBe(r.w + 12);
    for (const t of tells) expect(t.R).toBe(320);
    expect(lands.find((c) => c.t === r.w)).toEqual({ t: r.w, k: 'land', R: 230, u: 0 });
    expect(lands.find((c) => c.t === r.w + 12 && c.R === 320)).toEqual({ t: r.w + 12, k: 'land', R: 320, u: 0 });
  });

  it("assists: Black Hole's pull and the Blender's blades at their reach (flashing as they land), the 8-Ball's band, the Selfie Stick's flash and rays", () => {
    const r = page('Coiny', 100, 0, `
      var out = {}; function stage(act){ summons = []; HIT_ART.length = 0; var s = summonAssistNamed(A, ASSIST_ROSTER.find(function(x){ return x.act === act; })); return s; }
      var s = stage('pull'); D.x = s.x + 200; D.y = s.y; for (var i=0;i<12;i++){ step(); D.x = s.x + 200; }
      var e = HIT_ART.find(function(q){ return q.s === 'pull' && q.t === hazardT; }); out.pull = e ? e.sh.r : null;
      s = stage('vortex'); var ticks = 0, hits = 0, frames2 = 0;
      for (var i=0;i<40;i++){ D.x = s.x + 60; D.y = s.y; D.invuln = 0; var p0 = D.pct; step();
        var v = HIT_ART.find(function(q){ return q.s === 'zone' && q.t === hazardT && q.sh.r === 120; }); if(v) frames2++;
        var hit = D.pct > p0, tick = !!(v && v.n === hazardT); if(tick) ticks++; if(hit && !tick) hits = -999; if(hit) hits++; }
      out.vortex = { frames:frames2, ticks:ticks, hits:hits };
      s = stage('rush'); D.x = s.x + 300; D.y = s.y; step();
      var b = HIT_ART.find(function(q){ return q.sh.kind === 'box' && q.t === hazardT; }); out.rush = b ? { w:b.sh.w, h:b.sh.h, cx:b.sh.x + b.sh.w/2 - b.ox, cy:b.sh.y + b.sh.h/2 - b.oy } : null; out.sr = s.r;
      s = stage('flash'); D.x = s.x + 120; D.y = s.y; D.face = -1; D.hitstun = 0; updateSummons();
      out.flash = HIT_ART.filter(function(q){ return q.t === hazardT; }).map(function(q){ return q.sh.kind === 'circle' ? 'c' + q.sh.r : q.s; }).sort();
      return out;`);
    expect(r.pull).toBe(320);
    expect(r.vortex.frames).toBe(40);
    expect(r.vortex.ticks).toBeGreaterThan(2);
    expect(r.vortex.hits, 'every blade hit lands on a frame the ring flashes').toBe(r.vortex.ticks);
    expect(r.rush).toEqual({ w: 2 * (r.sr + 34), h: 2 * (r.sr + 30), cx: 0, cy: 0 });
    expect(r.flash).toEqual(['c260', 'ray']);
  });
});

// ---- phase 3: per-fighter specials, down-specials, finishers and older smashes, and the bosses (audit B1-B3, C) ----

// The moves that test their own circle or box (no hitCircle, so the hitbox view never saw them): the shape each draws on the press frame
// is where it lands. The foe is a standard body (HURT_R0 round, no traced outline), level with the shape, slid until its outline is 1.5 px
// inside, then 1.5 px outside, the drawn edge straight ahead (a cut disc's round front, a box's far side). Centre-judged moves are drawn at
// a standard body's edge, so the same probe holds for them.
const P3_HIT = 'D.pct !== 30 || D.hitstun > 0 || D._stunFx > 0 || D.weakened > 0 || D.slowed > 0 || D.ctrlRev > 0 || Math.abs(D.vx) > 0.5 || D._blackmailBy != null';
const P3 = [
  ['Coiny', 'doSpecial(A)', 'slap'], ['Yellow Face', 'doSpecial(A)', 'buynow'], ['Marker', 'doSpecial(A)', 'ink'], ['Teardrop', 'doSpecial(A)', 'kick'],
  ['Bomby', 'doSpecial(A)', 'bomb'], ['Marshmallow', 'doSpecial(A)', 'scream'], ['Nickel (II)', 'doSpecial(A)', 'snark'], ['Paper', 'A._evil = 100; doSpecial(A)', 'rip'],
  ['Baseball', 'doSpecial(A)', 'heavy'], ['Fern', 'doSpecial(A)', 'vine'], ['Sidewalky', 'doSpecial(A)', 'slam'], ['Balloony', 'doSpecial(A)', 'airleak'],
  ['Liy', 'doSpecial(A)', 'switch'], ['Blueberry', 'doSpecial(A)', 'catch'], ['Trophy', 'doSpecial(A)', 'photo'], ['Goo', 'doSpecial(A)', 'engulf'],
  ['Balloon', 'doDownSpecial(A)', 'airrel'], ['Lightbulb', 'doDownSpecial(A)', 'flash'], ['Salt', 'doDownSpecial(A)', 'stamp'], ['Dora', 'doDownSpecial(A)', 'rantStun'],
  ['Jack', 'doDownSpecial(A)', 'glare'], ['Candle', 'doDownSpecial(A)', 'chime'], ['Bomb', 'doDownSpecial(A)', 'shout'], ['Marshmallow', 'doDownSpecial(A)', 'dropout'],
  ['Bonesaw', 'doDownSpecial(A)', 'monster'], ['Apple', 'var mr = Math.random; Math.random = function(){ return 0.5; }; try { doDownSpecial(A); } finally { Math.random = mr; }', 'split'],
  ['Teardrop', 'doAttackSpecial(A)', 'kick'], ['Bomby', 'doAttackSpecial(A)', 'blast'],
  ['Firey', 'doAttackSpecial(A)', 'burn', 'D.burn > 0'], ['Book', 'doAttackSpecial(A)', 'define', 'D.defineStacks > 0'], ['Golf Ball', 'doAttackSpecial(A)', 'curse', 'D.curseStacks > 2'],
];
const p3Shape = (who, cast, key) => page(who, 300, 0, `
  ${cast}; var e = HIT_ART.find(function(q){ return q.k === A.idx + ':' + ${JSON.stringify(key)}; });
  return e ? { sh:e.sh, live:e.m === 'l' && e.t === hazardT, ax:A.x, ay:A.y } : null;`);
const p3Probe = (who, cast, sh, ax, ay, gap, hit) => page(who, 300, 0, `
  var dx = A.x - ${ax}, dy = A.y - ${ay}, s = ${JSON.stringify(sh)};
  D.hurt = null; D.r = HURT_R0; D.onground = true; D.invuln = 0;
  if (s.kind === 'box'){ D.x = s.x + s.w + HURT_R0 + (${gap}) + dx; D.y = s.y + s.h/2 + dy; }
  else { D.x = s.x + s.r + HURT_R0 + (${gap}) + dx; D.y = s.y + dy; }
  D.vx = 0; D.vy = 0;
  ${cast};
  return { hit: !!(${hit || P3_HIT}) };`);

describe('per-fighter moves: what each draws is where it lands', () => {
  it.each(P3)('%s %s (%s)', (who, cast, key, hit) => {
    const g = p3Shape(who, cast, key);
    expect(g, `${who} draws its '${key}'`).not.toBeNull();
    expect(g.live, 'on the frame it lands').toBe(true);
    const inside = p3Probe(who, cast, g.sh, g.ax, g.ay, -1.5, hit), outside = p3Probe(who, cast, g.sh, g.ax, g.ay, 1.5, hit);
    expect(inside.hit, `${who} ${key}: a body 1.5 px inside the drawn ${g.sh.kind} is reached`).toBe(true);
    expect(outside.hit, `${who} ${key}: 1.5 px outside it is not`).toBe(false);
  });

  it("a centre limit cuts the disc where a standard body touching it has its centre on the limit (Yellow Face's pitch: foes ahead only)", () => {
    const r = page('Yellow Face', 300, 0, `
      doSpecial(A); var e = HIT_ART.find(function(q){ return q.k === A.idx + ':buynow'; }); return { sh:e.sh, ax:A.x };`);
    expect(r.sh.kind).toBe('cut');
    expect(r.sh.x0).toBeCloseTo(r.ax + 24, 6);   // centres must be ahead of his: a body touching the cut has its centre on his
  });

  it("picks and holds: a ray or a tether to whoever was picked, following them; a miss shows how far it looked", () => {
    const r = page('Rose', 200, 0, `
      var out = {};
      doSpecial(A); var e = HIT_ART.find(function(q){ return q.k === A.idx + ':thorn'; }); out.thorn = e ? { s:e.s, to:e.to } : null;
      return out;`);
    expect(r.thorn).toEqual({ s: 'tether', to: 1 });
    const y = page('Yellow Face', 600, 0, `
      doDownSpecial(A); var e = HIT_ART.find(function(q){ return q.k === A.idx + ':weaken'; }); return e ? { kind:e.sh.kind, r:e.sh.r, s:e.s } : null;`);
    expect(y).toEqual({ kind: 'circle', r: 176, s: 'zone' });   // the nearest within 200 (centre to centre), drawn at a standard body's edge
    const z = page('Lightning', 200, 0, `
      doSpecial(A); return HIT_ART.filter(function(q){ return /:zap\\d$/.test(q.k); }).map(function(q){ return q.s; });`);
    expect(z).toEqual(['strike']);
  });

  it("Candle's hold: a tether on the held foe, the slam it may become told round them and filling in, and that ring as it releases", () => {
    const r = page('Candle', 120, 0, `
      doSpecial(A); var ps = [], tethers = 0, ring = null;
      for (var i=0;i<40;i++){ step(); if(A._windup && A._windup.sh) ps.push(A._windup.sh.p);
        if(HIT_ART.some(function(q){ return q.k === A.idx + ':grip' && q.t === hazardT && q.to === D.idx; })) tethers++;
        var s = HIT_ART.find(function(q){ return q.k === A.idx + ':slam' && q.t === hazardT; }); if(s && !ring) ring = { r:s.sh.r, want: 50 + D.r - HURT_R0 }; }
      return { ps:ps, tethers:tethers, ring:ring };`);
    expect(r.tethers).toBeGreaterThan(10);
    expect(r.ps.length).toBeGreaterThan(10);
    for (let i = 1; i < r.ps.length; i++) expect(r.ps[i]).toBeGreaterThanOrEqual(r.ps[i - 1]);
    expect(r.ring && r.ring.r).toBe(r.ring && r.ring.want);
  });

  it("Flower's stomp: a crest on her floor exactly as long as it reaches a grounded foe", () => {
    const probe = (gap) => page('Flower', 300, 0, `
      D.hurt = null; D.r = HURT_R0; D.x = A.x + 96 + HURT_R0 + (${gap}); D.onground = true; D.vx = 0;
      doDownSpecial(A); var e = HIT_ART.find(function(q){ return q.k === A.idx + ':quake0'; });
      return { box: e ? [e.sh.x - A.x, e.sh.w, e.sh.y + e.sh.h - groundY()] : null, hit: D.pct !== 30 };`);
    const inside = probe(-1.5), outside = probe(1.5);
    expect(inside.box).toEqual([-96, 192, 0]);
    expect(inside.hit).toBe(true);
    expect(outside.hit).toBe(false);
  });

  it("Bow's teleport pop is her outline grown by its reach; Puffball's dive marks where it lands; Naily's jab back is drawn behind her", () => {
    const b = page('Bow', 900, 0, `
      A.y = groundY() - 200; A._tp = { ax:0, ay:-1 }; teleportArrive(A);
      var e = HIT_ART.find(function(q){ return q.k === A.idx + ':tp'; }); if(!e) return null;
      var worst = 0; for (var i=0;i<e.sh.pts.length;i+=2) worst = Math.max(worst, Math.abs(hurtGap(A, e.sh.pts[i], e.sh.pts[i+1]) - TP.reach));
      return { n:e.sh.pts.length/2, worst:worst };`);
    expect(b.n).toBe(48);
    expect(b.worst).toBeLessThan(0.6);
    const p = page('Puffball', 900, 0, `
      A.y = groundY() - 260; A.onground = false; doSmash(A); for (var i=0;i<3;i++) step();
      var e = HIT_ART.find(function(q){ return q.k === A.idx + ':meteorLand' && q.t === hazardT; });
      return e ? { tell:e.m, y:e.sh.y - groundY(), r:e.sh.r - A.r } : null;`);
    expect(p).toEqual({ tell: 't', y: 0, r: 40 });
    const n = page('Naily', 900, 0, `
      doSmash(A); var e = null; for (var i=0;i<20 && !e;i++){ step(); e = HIT_ART.find(function(q){ return q.k === A.idx + ':nail' && q.t === hazardT; }); }
      return e ? { dx:(e.sh.x - A.x)*A.face, r:e.sh.r - A.r } : null;`);
    expect(n).toEqual({ dx: -30, r: 30 });
  });

  it('the wire: a cut disc, an outline and a tether come back the same', () => {
    const r = page('Coiny', 400, 0, `
      var a = hitArt(A, 'w1', haAhead(A, A.x + 40, A.y, 50, 0, 70), {});
      var b = hitArt(A, 'w2', { kind:'poly', pts:[1, 2, 30.5, 4, 12, 40] }, {});
      var c = hitArt(A, 'w3', { kind:'capsule', x1:1, y1:2, x2:3, y2:4, r:3 }, { style:'tether', to:D.idx });
      function back(e){ return haUnpack(JSON.parse(JSON.stringify(haPack(e)))); }
      var A2 = back(a), B2 = back(b), C2 = back(c);
      return { cut: [A2.sh.kind, A2.sh.r, A2.sh.x0 - a.sh.x0, A2.sh.y1 - a.sh.y1], poly: B2.sh.pts, to: C2.to, s: C2.s };`);
    expect(r.cut[0]).toBe('cut');
    expect(r.cut[1]).toBe(50);
    expect(Math.abs(r.cut[2])).toBeLessThan(0.06);
    expect(Math.abs(r.cut[3])).toBeLessThan(0.06);
    expect(r.poly).toEqual([1, 2, 30.5, 4, 12, 40]);
    expect(r.to).toBe(1);
    expect(r.s).toBe('tether');
  });
});

describe("bosses: each tell is the area that lands", () => {
  it("Two's POWER DRAIN: told round him at its true reach through the read's wind-up, white once locked, and drawn full size as it lands", () => {
    const r = page('Coiny', 400, 0, `
      var calls = [], P0 = haPaint; haPaint = function(sh, o){ calls.push({ kind:sh.kind, r:sh.r, tell:!!o.tell, col:o.col }); };
      try {
        var b = { x:600, y:300, r:60, attack:'two', _telKind:'two', _tel:20, _telPh:3, _phase:3, _hz:{ rd:[400, 300, 1, 0, 0, hazardT - 16, 0] } };
        twoDrawRead(b, b._hz); var during = calls.slice(); calls.length = 0;
        b._tel = 0; b._hz.rd[6] = hazardT; twoDrawRead(b, b._hz); var landed = calls.slice();
      } finally { haPaint = P0; }
      return { during:during, landed:landed, want: TWO.read.drain[3] - HURT_R0, lime: TWO_LIME };`);
    expect(r.during).toEqual([{ kind: 'circle', r: r.want, tell: true, col: '#ffffff' }]);
    expect(r.landed).toEqual([{ kind: 'circle', r: r.want, tell: false, col: r.lime }]);
  });

  it("the Purple Dragon's tail: the club drawn at the tip it hits with, on its live frames, inside a swath told from the touchdown", () => {
    const r = page('Coiny', 400, 0, `
      var calls = [], P0 = haPaint; haPaint = function(sh, o){ calls.push({ sh:sh, tell:!!o.tell }); };
      var out = [];
      try {
        var b = { x:600, y:groundY() - 80, r:90, face:1, _phase:1, hp:100, _hz:{ tail:[600, groundY(), 1, hazardT] } };
        for (var u=0;u<=DRAGON.tailT;u++){ b._hz.tail[3] = hazardT - u; calls.length = 0; drawDragonFx(b);
          var club = calls.find(function(c){ return c.sh.kind === 'circle'; }), sw = calls.find(function(c){ return c.sh.kind === 'poly'; });
          var tip = dragonTailTip(b._hz.tail, u, b.r);
          out.push({ u:u, club: club ? [Math.round(club.sh.x - tip.x), Math.round(club.sh.y - tip.y), club.sh.r] : null, swath: !!sw && sw.tell }); }
      } finally { haPaint = P0; }
      return { out:out, R:DRAGON.tailR, T:DRAGON.tailT };`);
    expect(r.out[0].club, 'nothing hits on the touchdown frame').toBeNull();
    for (const f of r.out.slice(1)) expect(f.club, `frame ${f.u}`).toEqual([0, 0, r.R]);
    for (const f of r.out.slice(0, r.T)) expect(f.swath).toBe(true);
  });

  it("Four's GO BYE-BYE!: the capture ring at its true reach round the mouth (told for the first 6 frames of a breath), and the pull's edge", () => {
    const r = page('Coiny', 400, 0, `
      var calls = [], P0 = haPaint; haPaint = function(sh, o){ calls.push({ r:sh.r, tell:!!o.tell }); };
      try { var b = { r:80 }; var Z = { inh:[500, 300, hazardT - 2, hazardT + 30, 600, 1] }; fourDrawInhale(Z, hazardT, groundY(), b); var early = calls.slice(); calls.length = 0;
        Z.inh[2] = hazardT - 10; fourDrawInhale(Z, hazardT, groundY(), b); var late = calls.slice(); } finally { haPaint = P0; }
      return { early:early, late:late, zr: FOUR.byeZone*80 };`);
    expect(r.early).toEqual([{ r: 600, tell: true }, { r: r.zr, tell: true }]);
    expect(r.late).toEqual([{ r: 600, tell: true }, { r: r.zr, tell: false }]);
  });
});
