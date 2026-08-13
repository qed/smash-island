import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// MULTI-FRAME ATTACK ANIMATION — the three-beat swing timeline.
//
// `_atkAnim` used to drive one sine: a lunge that swelled and fell away. It is now sliced into
// windup / release / recover, and every animation reads its beat off that split. These tests pin
// the three properties that make the feature what it is:
//
//   1. the split is a real partition of the swing — three ordered beats, no gap, no overlap
//   2. the anticipation genuinely goes BACKWARD before the strike goes forward
//   3. NONE of it touches the sim — same spawn frame, same position, same snapshot
//
// (3) is the load-bearing one. The whole feature is a visual wrap-around: the hitbox and the
// projectile still resolve on the exact frame they always did, and the anticipation is drawn on
// that same frame rather than delaying it.

const BATCH_1 = ['Firey', 'Teardrop', 'Bubble', 'Pen', 'Pencil', 'Match',
  'Ice Cube', 'Bomby', 'Blocky', 'Rocky'];

// A context that records what an animation pass DID, so a beat can be measured headlessly.
const RECORDER = `
  (function(){
    window.__mkCtx = function(){
      var ops = [];
      var c = { ops: ops,
        translate:function(x,y){ ops.push(['translate',x,y]); },
        rotate:function(a){ ops.push(['rotate',a]); },
        scale:function(x,y){ ops.push(['scale',x,y]); },
        transform:function(a,b,c,d,e,g){ ops.push(['transform',a,b,c,d,e,g]); },
        save:function(){}, restore:function(){},
        beginPath:function(){ ops.push(['beginPath']); },
        moveTo:function(x,y){ ops.push(['moveTo',x,y]); },
        lineTo:function(x,y){ ops.push(['lineTo',x,y]); },
        quadraticCurveTo:function(a,b,c,d){ ops.push(['quadraticCurveTo',a,b,c,d]); },
        bezierCurveTo:function(){ ops.push(['bezierCurveTo']); },
        closePath:function(){ ops.push(['closePath']); },
        rect:function(x,y,w,h){ ops.push(['rect',x,y,w,h]); },
        fillRect:function(x,y,w,h){ ops.push(['fillRect',x,y,w,h]); },
        stroke:function(){ ops.push(['stroke']); },
        fill:function(){ ops.push(['fill']); },
        arc:function(x,y,r){ ops.push(['arc',x,y,r]); },
        ellipse:function(x,y,a,b){ ops.push(['ellipse',x,y,a,b]); },
        globalAlpha:1, strokeStyle:'', fillStyle:'', lineWidth:1, lineCap:'' };
      return c;
    };
    // Run both animation passes for a fighter at a given point in its swing.
    window.__beat = function(name, atkAnim){
      var f = makeFighter(ROSTER.find(function(r){ return r.name===name; }), 300, 300, 0);
      f.face = 1; f.smashHold = 0; f.onground = true; f.vx = 0; f.vy = 0;
      f._atkAnim = atkAnim; f._atkLen = ATK_ANIM;
      var ctx2 = window.__mkCtx();
      var a = FIGHTER_ANIM[name];
      if (a && a.deform) a.deform(f, ctx2, f.r);
      if (a && a.over) a.over(f, ctx2);
      return ctx2.ops;
    };
    // A frame number that lands inside a named beat.
    window.__frameIn = function(beat){
      for (var t = ATK_ANIM; t >= 1; t--){
        if (atkPhase({_atkAnim:t, _atkLen:ATK_ANIM}) === beat) return t;
      }
      return -1;
    };
    return true;
  })()`;

describe('the swing timeline is three ordered beats', () => {
  it('partitions the whole countdown into windup, then release, then recover', () => {
    const { window: w } = loadMonolith();
    const seq = w.eval(`
      (function(){
        var out = [];
        for (var t = ATK_ANIM; t >= 1; t--) out.push(atkPhase({_atkAnim:t, _atkLen:ATK_ANIM}));
        return out;
      })()`);
    expect(seq.length, 'every frame of the swing is accounted for').toBe(w.eval('ATK_ANIM'));
    expect(seq.every((p) => p !== null), 'no frame falls outside all three beats').toBe(true);
    // …and they occur in order, each exactly once as a contiguous run
    const runs = seq.filter((p, i) => p !== seq[i - 1]);
    expect(runs, 'the beats run in order and never come back').toEqual(['windup', 'release', 'recover']);
    for (const beat of ['windup', 'release', 'recover']) {
      expect(seq.filter((p) => p === beat).length, `${beat} lasts at least two frames`)
        .toBeGreaterThan(1);
    }
  });

  it('is null outside a swing, so a resting fighter has no beat at all', () => {
    const { window: w } = loadMonolith();
    expect(w.eval('atkPhase({_atkAnim:0})'), 'not swinging').toBe(null);
    expect(w.eval('atkDrive({_atkAnim:0})'), 'and drives nothing').toBe(0);
    expect(w.eval('atkBeat({_atkAnim:0}, "windup")'), 'no beat is active').toBe(0);
  });

  it('gives each beat its own full 0 -> 1 progress', () => {
    const { window: w } = loadMonolith();
    const perBeat = w.eval(`
      (function(){
        var m = {windup:[], release:[], recover:[]};
        for (var t = ATK_ANIM; t >= 1; t--){
          var f = {_atkAnim:t, _atkLen:ATK_ANIM};
          m[atkPhase(f)].push(atkPhaseK(f));
        }
        return m;
      })()`);
    for (const [beat, ks] of Object.entries(perBeat)) {
      expect(ks[0], `${beat} starts at its beginning`).toBeLessThan(0.35);
      expect(ks[ks.length - 1], `${beat} runs out to its end`).toBeGreaterThan(0.6);
      const rising = ks.every((v, i) => i === 0 || v > ks[i - 1]);
      expect(rising, `${beat} advances monotonically`).toBe(true);
    }
  });

  it('scales the split with the timer, so a longer smash is not clipped', () => {
    // doSmash arms ATK_ANIM+5. If the phases were normalised on ATK_ANIM instead of the recorded
    // length, those five extra frames would all pile up in a single clamped beat.
    const { window: w } = loadMonolith();
    const counts = w.eval(`
      (function(){
        var len = ATK_ANIM + 5, m = {windup:0, release:0, recover:0};
        for (var t = len; t >= 1; t--) m[atkPhase({_atkAnim:t, _atkLen:len})]++;
        return m;
      })()`);
    for (const beat of ['windup', 'release', 'recover']) {
      expect(counts[beat], `a smash still has a real ${beat}`).toBeGreaterThan(2);
    }
    const total = counts.windup + counts.release + counts.recover;
    expect(total, 'and the whole longer swing is covered').toBe(w.eval('ATK_ANIM') + 5);
  });

  it('records the length it was armed with at every attack entry point', () => {
    const { window: w } = loadMonolith();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; startMatch();
      fighters.length = 0;
      ['Firey','Bubble'].forEach(function(n,i){
        fighters.push(makeFighter(ROSTER.find(function(r){return r.name===n;}), 300+i*160, 300, i));
      });`);
    for (const call of ['doAttack(fighters[0])', 'doSmash(fighters[0],1)',
      'doSpecial(fighters[0])', 'doAttackSpecial(fighters[0])']) {
      const got = w.eval(`fighters[0]._atkAnim=0; fighters[0]._atkLen=0; ${call};
        [fighters[0]._atkAnim, fighters[0]._atkLen, fighters[0]._atkPhase]`);
      expect(got[1], `${call} records its length`).toBe(got[0]);
      expect(got[2], `${call} starts on the anticipation`).toBe('windup');
    }
  });
});

describe('the anticipation actually anticipates', () => {
  it('winds BACK through the gather and drives FORWARD through the strike', () => {
    const { window: w } = loadMonolith();
    const drive = w.eval(`
      (function(){
        var out = {windup:[], release:[], recover:[]};
        for (var t = ATK_ANIM; t >= 1; t--){
          var f = {_atkAnim:t, _atkLen:ATK_ANIM};
          out[atkPhase(f)].push(atkDrive(f));
        }
        return out;
      })()`);
    expect(Math.max(...drive.windup), 'the gather never pushes forward').toBeLessThanOrEqual(0);
    expect(Math.min(...drive.windup), 'and reaches a real wind-back').toBeLessThan(-0.7);
    expect(Math.max(...drive.release), 'the strike reaches full extension').toBeGreaterThan(0.9);
    expect(Math.abs(drive.recover[drive.recover.length - 1]), 'the settle comes to rest')
      .toBeLessThan(0.2);
  });

  it('never jumps between beats — the body cannot teleport mid-swing', () => {
    const { window: w } = loadMonolith();
    const steps = w.eval(`
      (function(){
        var prev = null, out = [];
        for (var t = ATK_ANIM; t >= 1; t--){
          var d = atkDrive({_atkAnim:t, _atkLen:ATK_ANIM});
          if (prev !== null) out.push(Math.abs(d - prev));
          prev = d;
        }
        return out;
      })()`);
    // one frame of an 18-frame swing spans at most ~2/18 of the -1..+1 range with easing headroom
    expect(Math.max(...steps), 'the drive is continuous across the phase boundaries')
      .toBeLessThan(0.45);
  });

  it('the wind-back check would catch its own removal (mutation check)', () => {
    // The assertion above is only worth having if it REJECTS the pre-phase implementation. The old
    // timeline was a single sine that never went negative — no anticipation at all.
    const { window: w } = loadMonolith();
    const windsBack = (fn) => w.eval(`
      (function(){
        var drive = ${fn};
        for (var t = ATK_ANIM; t >= 1; t--){
          var f = {_atkAnim:t, _atkLen:ATK_ANIM};
          if (atkPhase(f) === 'windup' && drive(f) >= 0) return false;
        }
        return true;
      })()`);
    expect(windsBack('atkDrive'), 'the real drive winds back through the gather').toBe(true);
    expect(windsBack('function(f){ return Math.sin((f._atkAnim/ATK_ANIM)*Math.PI); }'),
      'the old single pulse has no anticipation, and the check must reject it').toBe(false);
  });
});

describe('every batch-1 fighter is choreographed to the beats', () => {
  it('declares a launch anchor inside its own body', () => {
    const { window: w } = loadMonolith();
    const bad = w.eval(`
      ${JSON.stringify(BATCH_1)}.filter(function(n){
        var a = FIGHTER_ANIM[n] && FIGHTER_ANIM[n].anchor;
        if (!a) return true;
        // in radius units, so anything past ~2R is not on the character any more
        return !(Math.abs(a.x) <= 2 && Math.abs(a.y) <= 2);
      })`);
    expect(bad, 'fighters with no anchor, or one off their own body').toEqual([]);
  });

  it('mirrors that anchor when the fighter turns around', () => {
    const { window: w } = loadMonolith();
    const [right, left] = w.eval(`
      (function(){
        var f = makeFighter(ROSTER.find(function(r){return r.name==='Firey';}), 500, 300, 0);
        f.face = 1;  var a = fighterAnchor(f, {x:0,y:0}); var r = [a.x - f.x, a.y - f.y];
        f.face = -1; var b = fighterAnchor(f, {x:0,y:0}); var l = [b.x - f.x, b.y - f.y];
        return [r, l];
      })()`);
    expect(right[0], 'the mouth leads the way he faces').toBeGreaterThan(0);
    expect(left[0], 'and swaps sides when he turns').toBeCloseTo(-right[0], 6);
    expect(left[1], 'without changing height').toBeCloseTo(right[1], 6);
  });

  it('draws something in all three beats, and something DIFFERENT in each', () => {
    // The point of a phased animation is that the beats do not look alike. If a fighter's gather
    // and settle produce the same ops, they have a pulse with extra names, not a timeline.
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const silent = [], samey = [];
    for (const name of BATCH_1) {
      const sigs = {};
      for (const beat of ['windup', 'release', 'recover']) {
        const t = w.eval(`window.__frameIn(${JSON.stringify(beat)})`);
        const ops = w.eval(`window.__beat(${JSON.stringify(name)}, ${t})`);
        if (!ops.length) silent.push(`${name}/${beat}`);
        sigs[beat] = JSON.stringify(ops);
      }
      const uniq = new Set(Object.values(sigs));
      if (uniq.size < 3) samey.push(name);
    }
    expect(silent, 'fighters with a beat that draws nothing at all').toEqual([]);
    expect(samey, 'fighters whose beats are indistinguishable from each other').toEqual([]);
  });

  it('is quiet when nobody is swinging', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    // Firey flickers and Bomby's fuse smoulders permanently — those are idle traits, not beats.
    // What must be true of everyone is that the swing ops STOP when the swing does.
    const busier = BATCH_1.filter((n) => {
      const rest = w.eval(`window.__beat(${JSON.stringify(n)}, 0).length`);
      const mid = w.eval(`window.__beat(${JSON.stringify(n)}, window.__frameIn('release')).length`);
      return !(mid > rest);
    });
    expect(busier, 'fighters who do no more mid-swing than at rest').toEqual([]);
  });
});

describe('the launch anchor is purely visual', () => {
  it('draws a fresh shot at the anchor, then walks it out to its real position', () => {
    const { window: w } = loadMonolith();
    const walk = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=2; startMatch();
        fighters.length = 0;
        fighters.push(makeFighter(ROSTER.find(function(r){return r.name==='Firey';}), 500, 300, 0));
        fighters.push(makeFighter(ROSTER.find(function(r){return r.name==='Needle';}), 900, 300, 1));
        var f = fighters[0]; f.face = 1; f.spCd = 0;
        projectiles.length = 0;
        var t0 = hazardT;
        doSpecial(f);
        var pr = projectiles[0];
        var out = [];
        for (var i = 0; i <= PROJ_VIS_FRAMES; i++){
          hazardT = t0 + i;
          var on = projVisLerp(pr);
          out.push({on: on, dx: on ? _pvDX : 0, dy: on ? _pvDY : 0, s: on ? _pvScale : 1});
        }
        return {out: out, anchor: pr._visOrigin, spawnX: pr.x, spawnY: pr.y};
      })()`);
    const first = walk.out[0];
    expect(first.on, 'the shot starts its life in a launch').toBe(true);
    // frame 0: it is drawn EXACTLY on the anchor
    expect(walk.spawnX + first.dx, 'drawn at the mouth').toBeCloseTo(walk.anchor.x, 6);
    expect(walk.spawnY + first.dy, 'drawn at the mouth').toBeCloseTo(walk.anchor.y, 6);
    // …and it grows and closes the gap monotonically from there
    const active = walk.out.filter((o) => o.on);
    expect(active.length, 'the launch lasts the advertised number of frames').toBe(6);
    const gaps = active.map((o) => Math.hypot(o.dx, o.dy));
    expect(gaps.every((g, i) => i === 0 || g < gaps[i - 1]), 'it closes on its real position')
      .toBe(true);
    expect(active.every((o, i) => i === 0 || o.s > active[i - 1].s), 'and scales out of the mouth')
      .toBe(true);
    expect(walk.out[6].on, 'then stops costing anything').toBe(false);
  });

  it('never moves the hitbox — the shot flies the identical path either way', () => {
    // The whole constraint of the feature. Run the same shot twice, once with the launch anchor
    // stripped off the projectile every frame, and the sim must not notice.
    const { window: w } = loadMonolith();
    const flight = (strip) => w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=2; startMatch();
        fighters.length = 0;
        fighters.push(makeFighter(ROSTER.find(function(r){return r.name==='Firey';}), 500, 300, 0));
        fighters.push(makeFighter(ROSTER.find(function(r){return r.name==='Needle';}), 900, 300, 1));
        var f = fighters[0]; f.face = 1; f.spCd = 0;
        projectiles.length = 0;
        doSpecial(f);
        var pr = projectiles[0];
        var path = [];
        for (var i = 0; i < 30; i++){
          if (${strip}) { pr._visOrigin = null; }
          path.push(Math.round(pr.x*1000)/1000 + ',' + Math.round(pr.y*1000)/1000);
          pr.x += pr.vx; if (pr.grav) pr.vy += 0.45; pr.y += pr.vy;
        }
        return path.join(' ');
      })()`);
    expect(flight('true'), 'the launch anchor changes no position the sim can see')
      .toBe(flight('false'));
  });

  it('keeps the netcode snapshot exactly as it was', () => {
    const { window: w } = loadMonolith();
    const keys = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=2; startMatch();
        fighters.length = 0;
        fighters.push(makeFighter(ROSTER.find(function(r){return r.name==='Firey';}), 500, 300, 0));
        fighters.push(makeFighter(ROSTER.find(function(r){return r.name==='Needle';}), 900, 300, 1));
        var f = fighters[0]; f.face = 1; f.spCd = 0;
        projectiles.length = 0;
        doSpecial(f);
        var s = serializeState();
        return {proj: Object.keys(s.projectiles[0]||{}), fig: Object.keys(s.fighters[0]||{})};
      })()`);
    expect(keys.proj, 'the projectile whitelist is untouched')
      .toEqual(['x', 'y', 'r', 'color', 'warn', 'warnX', 'warnY']);
    expect(keys.proj.concat(keys.fig).filter((k) => /^_/.test(k)),
      'no render-only field leaks onto the wire').toEqual([]);
  });

  it('degrades to a plain shot on a client that was never told about the anchor', () => {
    // A netcode client rebuilds projectiles from the whitelist above — no _visOrigin, no timers.
    const { window: w } = loadMonolith();
    const out = w.eval(`
      (function(){
        var pr = {x:100, y:100, r:8, color:'#fff'};
        var on = projVisLerp(pr);
        var f = {x:0, y:0, r:24, flash:9};         // …and a client fighter with no _atkAnim either
        return [on, atkPhase(f), atkDrive(f), atkBeat(f, 'release')];
      })()`);
    expect(out, 'the launch simply does not happen, and nothing throws').toEqual([false, null, 0, 0]);
  });

  it('the anchor check would catch the feature being switched off (mutation check)', () => {
    // If projVisLerp stopped anchoring, the shot would draw at its spawn point on frame one —
    // twenty-odd pixels in front of the character's belly, which is the bug this feature fixes.
    const { window: w } = loadMonolith();
    const startsAtMouth = (lerp) => w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=2; startMatch();
        fighters.length = 0;
        fighters.push(makeFighter(ROSTER.find(function(r){return r.name==='Firey';}), 500, 300, 0));
        fighters.push(makeFighter(ROSTER.find(function(r){return r.name==='Needle';}), 900, 300, 1));
        var f = fighters[0]; f.face = 1; f.spCd = 0;
        projectiles.length = 0;
        doSpecial(f);
        var pr = projectiles[0];
        var mouth = fighterAnchor(f, {x:0, y:0});
        var lerpFn = ${lerp};
        var on = lerpFn(pr);
        var dx = on ? _pvDX : 0, dy = on ? _pvDY : 0;
        return Math.hypot(pr.x + dx - mouth.x, pr.y + dy - mouth.y) < 0.001;
      })()`);
    expect(startsAtMouth('projVisLerp'), 'the ember starts at the mouth').toBe(true);
    expect(startsAtMouth('function(){ return false; }'),
      'with the launch lerp disabled it starts in mid-air, and the check must reject that')
      .toBe(false);
  });
});
