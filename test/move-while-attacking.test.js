import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';
import { makeRoom } from './helpers/net-room.js';

// MOVING WHILE ATTACKING (the owner, 2026-10-20: "attacks are weird, you should be able to move while doing them"). His picks:
//   * "While a ground attack is out, how should moving work?" -- "Full speed, can turn": a ground move walks and runs at the fighter's own
//     speed, and pressing the other way turns them round with the move -- its boxes, its hit art and its sprite face the new way from then on.
//   * "Which attacks should let you move?" -- "Jabs and tilts (X)" and "Specials (C)", except specials built around standing still (roots,
//     counters, stances). Smashes and finishers stay exactly as they were.
// What it was: mvTick set the arrows aside for the whole of every ground tilt, and the movement block kept the facing, so a jab or a tilt rooted
// you to the spot and could not turn. A move's own push (an `mv` step that sets or adds speed) still wins on the frames it acts, and an aerial
// still drifts and keeps the facing it began with.
// His answers to the review (2026-10-20):
//   1) "Walking off cancels the tilt": a fighter who leaves the ground during a ground jab or tilt (walked or carried off a ledge or a platform's edge,
//      the move's own push included) ends the move at once -- no box of it in the air, no facing kept -- and can jump, double-jump or up-special at once.
//   2) "Hold them still": while a counter, reflect or armour stance is up (its countering / reflecting / armour flag, per kit) the fighter cannot walk,
//      run or turn; free again the frame it ends. Timing, damage and what the stances do are unchanged.
//   3) The three lasting slowdowns (Grasstree, Battery Swap, the cork) stay as they are.
//   4) The turn frame: the sprite, the box, the hit art and the knockback all turn on the same frame (the box used to turn a frame after the sprite).
// His answers to the second review (2026-10-20):
//   1) "Only pure stances": counters, reflects and armour BRACES hold you still; attacks and buffs that merely have armour let you walk (a brace is a
//      move whose point is to stand and take it). Freed by name: Money's Payday, Bracelety's sign, Dora's rant, Bell's ring, TV's static, Saw's Defensive
//      Spin, Liy's switch-on, Fern's regen, Pillow's guard. By the same rule (each card checked): Loser's Stay Cool (a buff with armour), and the
//      reflects that ride on an attack, Gaty's Swing Open and Blueberry's Palanquin Catch (his own root still plants him, as it always did).
//   2) "Free once it answers": a counter that answers frees the fighter at once, even with armour left (Golf Ball's Crusher stop, Needle's Riposte).
//   3) "No turning in a stance": a smash pressed while a stance is up fires the way the fighter already faces (smashAim does not turn them).
// The reviewer's other findings: a CPU in a stance that asks for a move keeps its arrows (they choose the move); Fanny's gust (onground=false, no lift)
// no longer cancels a tilt on flat ground -- only really leaving the ground does ("walking off cancels the tilt").
// ON THE MERGE WITH MAIN (2026-10-20): main had turned the ground side-tilt off (SIDE_TILTS, the owner, 2026-10-18: on the ground ←/→ + X is the jab,
// aimed that way -- it never rooted anyone) and given every fighter its own run, air and fall (FIGHTER_STATS). So the tilts measured here are the
// up- and down-tilt (the long throwaway side-tilt became the down-tilt, frame for frame), ←/→ + X is pinned as the jab that walks, every walk is
// held to the fighter's own run, and 'what does not change' is pinned to main's own frames (recorded on main, fc0b69d, with the stats in).

let W;
beforeAll(async () => {
  W = bootMonolith(); await W.eval('profileReady');
  // throwaway moves on two kits, so the SYSTEM is measured, not a fighter's numbers: Coiny's ('slap') have no push of their own; Snowball's
  // ('tackle') down-tilt pushes him forward on frames 2-5. Coiny's down-tilt is the long poke this file first measured as a side-tilt (a box
  // straight out in front, live six frames); his `ft` row is kept as data, and never fires (SIDE_TILTS is off: ←/→ + X on the ground is the jab)
  W.eval(`MOVESETS.slap = {
    ft:{n:'T',pose:'punch',st:6,act:6,end:8,boxes:[{s:MvC(10,0,60,0,14),dmg:5,kb:[5,-2],stun:16}]},
    ut:{n:'U',pose:'uppercut',st:4,act:4,end:9,boxes:[{s:MvF(10,60,-1.8,-0.3,0),dmg:4,kb:[1,-7],stun:18}]},
    dt:{n:'D',pose:'kick',st:6,act:6,end:8,boxes:[{s:MvC(10,0,60,0,14),dmg:5,kb:[5,-2],stun:16}]},
    fa:{n:'F',pose:'punch',st:5,act:6,end:10,land:9,ac:16,boxes:[{s:MvC(10,0,60,0,14),dmg:7,kb:[6,-3],stun:16}]},
  };
  MOVESETS.tackle = Object.assign({}, MOVESETS.tackle, {
    dt:{n:'P',pose:'kick',st:7,act:3,end:8,boxes:[{s:MvC(10,0,60,0,14),dmg:5,kb:[5,-2],stun:16}],mv:[{t0:2,t1:5,mode:'set',vx:6}]},
  });`);
});

// `name` at x 400 facing right on a flat floor; `foes` are still dummies at those offsets (in the air with A when `air`).
const stage = (name, foes = [700], air = false) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=${1 + foes.length}; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; HIT_ART.length=0;
  var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
  var A = mk(${JSON.stringify(name)}, 400, 0); A.team=0; A.controller='local'; A.you=true; A.stocks=9;
  fighters=[A].concat(${JSON.stringify(foes)}.map(function(dx, i){ var D = mk('Pen', 400 + dx, i + 1); D.team=i + 1; D.controller='still'; D.stocks=9; D.face=-1; return D; }));
  for (var k in down) delete down[k];
  step(); step();
  fighters.forEach(function(f, i){ f.invuln=0; f.hitstun=0; f.atkCd=0; f.spCd=0; f.smCd=0; f.fnCd=0; f.pct=0; f.vx=0; f.vy=0; f.x = i ? 400 + ${JSON.stringify(foes)}[i - 1] : 400; });
  A.face=1;
  ${air ? 'fighters.forEach(function(f){ f.y = groundY()-24-120; f.onground=false; f.vy=0; });' : ''}
})()`);
// one frame with exactly these keys down (and nothing else)
const press = (keys, n = 1) => W.eval(`(function(){ for (var i = 0; i < ${n}; i++){ for (var k in down) delete down[k]; ${JSON.stringify(keys)}.forEach(function(k){ down[KEYS[k]] = true; }); step(); } for (var k in down) delete down[k]; })()`);
const J = (code) => W.eval(`(function(){ return ${code}; })()`);
const A = (field) => J('fighters[0].' + field);
const hold = (keys) => W.eval(`(function(){ for (var k in down) delete down[k]; ${JSON.stringify(keys)}.forEach(function(k){ down[KEYS[k]] = true; }); step(); for (var k in down) delete down[k]; })()`);
// the frames hold `dir` for, after the press: a timeline that starts with `pre` (held `preN` frames, `dir` with it) and holds `dir` after.
// key: the first moveset move seen out; move: the attack label the press left (a moveset move's or the jab's: _atkMove), with atkCd after it
function walkWith(name, pre, preN, n, dir = 'right') {
  stage(name);
  const keys = [];
  let move = null, cd = 0, face0 = null;
  for (let i = 0; i < preN + n; i++) {
    hold(i < preN ? pre.concat([dir]) : [dir]);
    if (A('_mv')) keys.push(A('_mv.key'));
    if (i === preN - 1) { move = A('_atkMove'); cd = A('atkCd'); face0 = A('face'); }
  }
  return { dx: A('x') - 400, key: keys[0] || null, face: A('face'), move, cd, face0, ft: J('(fighters[0]._used || {}).ft || 0') };
}
const walkOnly = (name, n, dir) => walkWith(name, [], 0, n, dir).dx;
const TILT_KEYS = { ut: ['attack', 'jump'], dt: ['attack', 'down'] };   // (up is the jump key)

describe('a ground jab or tilt walks at full speed', () => {
  // RESTATED (the merge with main: no side-tilt on the ground, SIDE_TILTS): this held right through a side-tilt too. On the ground ←/→ + X is the jab
  // now, aimed that way: it is pinned here as the jab (not a moveset move, though Coiny's throwaway kit still has an `ft` row) and as walking too.
  it('holding right through an up-tilt and a down-tilt covers what walking does over the same frames; ←/→ + X on the ground is the jab, aimed that way, and walks too', () => {
    const N = 28, walk = walkOnly('Coiny', N + 2);
    expect(walk).toBeGreaterThan(120);
    for (const k of ['ut', 'dt']) {
      const r = walkWith('Coiny', TILT_KEYS[k], 2, N);
      expect(r.key, k + ' came out').toBe(k);
      expect(r.move, k + ': the move the press started').toBe('slap.' + k);
      expect(Math.abs(r.dx - walk), `${k}: walked ${r.dx.toFixed(1)} px against ${walk.toFixed(1)}`).toBeLessThan(2);
    }
    expect(J('SIDE_TILTS')).toBe(false);
    for (const [dir, face] of [['right', 1], ['left', -1]]) {
      const w = walkOnly('Coiny', N + 2, dir), r = walkWith('Coiny', ['attack'], 2, N, dir);
      expect(r.move, `${dir} + X: the jab`).toBe('slap.jab');
      expect(r.cd, `${dir} + X: it went off`).toBeGreaterThan(0);
      expect(r.key, `${dir} + X: no moveset move came out`).toBeNull();
      expect(r.ft, `${dir} + X: never the side-tilt`).toBe(0);
      expect(r.face0, `${dir} + X: aimed the side pressed`).toBe(face);
      expect(Math.abs(r.dx - w), `${dir} + X: walked ${r.dx.toFixed(1)} px against ${w.toFixed(1)}`).toBeLessThan(2);
    }
  });
  it('the jab (X with no arrow) does not stop a walk either', () => {
    stage('Coiny');
    press(['attack'], 6);                      // a plain X on the ground waits for C a few frames (the grab), then jabs
    expect(A('atkCd')).toBeGreaterThan(0);
    const x0 = A('x');
    for (let i = 0; i < 20; i++) hold(['right']);
    const jabbed = A('x') - x0;
    stage('Coiny'); press([], 6); const x1 = A('x'); for (let i = 0; i < 20; i++) hold(['right']);
    expect(Math.abs(jabbed - (A('x') - x1))).toBeLessThan(1);
  });
  // RESTATED (the merge with main): this walked every fighter's side-tilt too, which no longer fires on the ground (SIDE_TILTS), and measured each
  // walk against the fighter's own with every run and drift the same. Now each fighter has its own run and air (FIGHTER_STATS): the walk each tilt
  // is held to is first pinned to that fighter's own run -- its run stat times a run-1 fighter's walk -- so "full speed" is the fighter's own speed.
  // A tilt that lifts its fighter itself (an `mv` step sending them up: Pin's Hop and Point, Bomby's Pop Up) has them in the air for a few frames,
  // where the arrows drift them at their own air stat, as any hop does: for those the walk may run between the run's and the air's speed.
  it('every fighter\'s own up- and down-tilt walk at that fighter\'s own speed, its run stat (a tilt with a push of its own only slows on the push frames; one that lifts them drifts at their air stat while up)', () => {
    const rows = J(`ROSTER.filter(function(r){ var ms = MOVESETS[r.kit && r.kit.special]; return ms && r.kit.special !== 'slap' && r.kit.special !== 'tackle'; })
      .map(function(r){ var ms = MOVESETS[r.kit.special], S = statsFor(r.name); return [r.name, S.run, S.air, ['ut','dt'].filter(function(k){ return ms[k]; }).map(function(k){
        return [k, !!(ms[k].mv && ms[k].mv.some(function(m){ return m.vx != null; })), !!(ms[k].mv && ms[k].mv.some(function(m){ return m.vy != null && m.vy < 0; }))]; })]; })`);
    expect(rows.length).toBeGreaterThan(60);
    expect(rows.filter((r) => r[1] !== 1).length, 'fighters whose run is their own').toBeGreaterThan(40);
    expect(rows.reduce((n, r) => n + r[3].length, 0), 'tilts walked').toBeGreaterThan(120);
    expect(J('statsFor("Pen").run')).toBe(1);
    const base = walkOnly('Pen', 24), bad = [];
    for (const [name, run, air, moves] of rows) {
      const walk = walkOnly(name, 24);
      if (Math.abs(walk / (base * run) - 1) > 0.01) bad.push(`${name} walks ${(walk / base).toFixed(3)} of a run-1 walk, its run is ${run}`);
      for (const [k, pushes, lifts] of moves) {
        const r = walkWith(name, TILT_KEYS[k], 2, 22);
        const ratio = r.dx / walk, ak = lifts ? air / run : 1;
        if (r.key !== k || ratio < (pushes ? 0.8 : 0.97) * Math.min(1, ak) || ratio > 1.03 * Math.max(1, ak)) bad.push(`${name} ${k} ${r.key} ${ratio.toFixed(2)}`);
      }
    }
    expect(bad).toEqual([]);
  });
  it('the move\'s own push still wins on the frames it acts: holding back, the slide carries him forward, then he turns and walks', () => {
    stage('Snowball');
    press(['attack', 'down', 'right'], 2);
    expect(A('_mv.key')).toBe('dt');
    while (A('_mv.t') < 2) hold([]);           // up to the push's first frame
    const xs = [], faces = [];
    for (let i = 0; i < 20; i++){ hold(['left']); xs.push(A('x')); faces.push(A('face')); }
    // frames 2-5: the push (vx 6 forward) wins, the arrows are set aside -- no turn, still going right at the push's speed
    for (let i = 1; i < 4; i++) expect(xs[i] - xs[i - 1], 'push frame ' + i).toBeGreaterThan(4);
    expect(faces.slice(0, 4)).toEqual([1, 1, 1, 1]);
    // after it: he turns round at once, and walks back the other way once the slide's speed has worn off
    expect(faces[4]).toBe(-1);
    expect(xs[19]).toBeLessThan(xs[9]);
  });
});

describe('turning round mid-tilt turns the move', () => {
  it('pressing the other way during the start-up: the box comes out behind, on the new side, and never on the old', () => {
    stage('Coiny', [45, -45]);
    press(['attack', 'down', 'right'], 2);
    expect(A('_mv.key')).toBe('dt');
    for (let i = 0; i < 12; i++) hold(['left']);
    expect(A('face')).toBe(-1);
    expect(J('fighters[2].pct'), 'the foe on the new side').toBeCloseTo(5, 1);
    expect(J('fighters[2].vx'), '...knocked the new way').toBeLessThan(0);
    expect(J('fighters[1].pct'), 'the foe on the old side').toBe(0);
  });
  // RESTATED (the owner, 2026-10-20, answer 4: the reviewer saw the sprite turn a frame before the box -- "make all of them turn on the same frame"):
  // this pinned that the turn frame's box was still out the old way and the foe behind was hit only on the frame after. Now the turn frame hits it.
  it('pressing the other way while it is live: that very frame the box hits the foe on the new side as the sprite turns, and its hit art and knockback turn with it', () => {
    stage('Coiny', [40, -40]);
    press(['attack', 'down', 'right'], 2);
    expect(A('_mv.key')).toBe('dt');
    let n = 0; while (J('fighters[1].pct') === 0 && n++ < 12) hold(['right']);
    expect(J('fighters[1].pct'), 'the first live frame hit the foe in front').toBeCloseTo(5, 1);
    expect(A('_mv') && A('_mv.t') < A('_mv.s.st') + A('_mv.s.act')).toBeTruthy();   // still live
    hold(['left']);                              // the turn frame: the sprite and this frame's box both face the new way
    expect(A('face')).toBe(-1);
    expect(J('fighters[2].pct'), 'the foe on the new side, on the turn frame').toBeCloseTo(5, 1);
    expect(J('fighters[2].vx'), '...knocked the new way').toBeLessThan(0);
    const art = J(`(function(){ var A = fighters[0], e = HIT_ART.find(function(q){ return q.k === A.idx + ':mv0'; }); return e ? [e.sh.x1, e.sh.x2, A.x] : null; })()`);
    expect(art, 'the move\'s hit art').not.toBeNull();
    expect(art[1]).toBeLessThan(art[2] - 30);   // drawn out the new way (behind where it began)
    expect(J('fighters[1].pct'), 'the old side is not hit again').toBeCloseTo(5, 1);
  });
  it('the turn frame\'s box is the sprite\'s: flipping the arrows every frame of a live tilt, the box drawn each frame faces the way the fighter does', () => {
    stage('Coiny', [600]);
    press(['attack', 'down', 'right'], 2);
    expect(A('_mv.key')).toBe('dt');
    const rows = [];
    for (let i = 0; i < 16 && A('_mv'); i++) {
      W.eval('HIT_ART.length = 0');
      hold([i % 2 ? 'right' : 'left']);
      const r = J(`(function(){ var A = fighters[0], e = HIT_ART.find(function(q){ return q.k === A.idx + ':mv0'; }); return e ? [Math.sign(e.sh.x2 - e.ox), A.face] : null; })()`);
      if (r) rows.push(r);
    }
    expect(rows.length, 'live frames seen').toBeGreaterThan(4);
    expect(new Set(rows.map((r) => r[1])).size, 'it turned both ways').toBe(2);
    rows.forEach((r, i) => expect(r[0], 'live frame ' + i + ': the box faces the sprite').toBe(r[1]));
  });
});

describe('walking off cancels the tilt (the owner, 2026-10-20: "Walking off cancels the tilt")', () => {
  // `name` standing on a platform 160 px up whose right edge is `edge` px ahead of them, facing it
  const ledge = (name, edge) => {
    stage(name, [600]);
    W.eval(`(function(){ var gy = groundY(), A = fighters[0]; worldPlats = [{ x:150, y:gy - 160, w:250 + ${edge}, h:16 }];
      A.x = 400; A.y = gy - 160 - A.r; A.vx = 0; A.vy = 0; step(); A.x = 400; A.vx = 0; A.face = 1; A.atkCd = 0; A.spCd = 0; })()`);
    expect(A('onground'), 'standing on the platform').toBe(true);
  };
  // walk right through a down-tilt until the fighter leaves the platform; returns the frames the move still had to run
  const walkOff = (name, edge, keys = ['right']) => {
    ledge(name, edge);
    press(['attack', 'down', 'right'], 2);
    expect(A('_mv.key')).toBe('dt');
    let n = 0; while (A('onground') && n++ < 24) hold(keys);
    expect(A('onground'), 'off the edge').toBe(false);
    return J('fighters[0]._mv ? mvTotal(fighters[0]._mv.s) - fighters[0]._mv.t : 0');
  };
  it('walking off a ledge mid-tilt: the move ends, and jump works on the very next frame (it used to wait out the move)', () => {
    const left = walkOff('Coiny', 24);
    expect(left, 'the tilt still had frames to run').toBeGreaterThan(3);
    const jumps = A('jumps');
    hold(['jump', 'right']);
    expect(A('_mv'), 'the move is over').toBeNull();
    expect(A('vy'), 'he jumped').toBeLessThan(-5);
    expect(A('jumps')).toBe(jumps - 1);
    for (let i = 0; i < 3; i++) hold([]);
    hold(['jump']);                              // and the double jump after it
    expect(A('jumps')).toBe(jumps - 2);
  });
  it('...and the up-special is free on that frame too, with nothing of the tilt left in the air and the air turn back', () => {
    walkOff('Coiny', 24);
    W.eval('HIT_ART.length = 0');
    hold(['special', 'jump']);                   // (up is the jump key)
    expect(A('_mv')).toBeNull();
    expect(A('_usedAirSpecial'), 'the up-special went off').toBe(true);
    expect(J(`HIT_ART.some(function(q){ return q.k === fighters[0].idx + ':mv0'; })`), 'no box of the tilt in the air').toBe(false);
    walkOff('Coiny', 24);
    hold(['left']);
    expect(A('face'), 'he turns in the air as a fighter with no move out does').toBe(-1);
    expect(A('_mv')).toBeNull();
  });
  it('a move whose own push carries him off works the same way: Snowball\'s slide takes him over the edge, and he can jump the next frame', () => {
    ledge('Snowball', 14);
    press(['attack', 'down', 'right'], 2);       // (two frames of the arrow walk him a step; the slide takes him the rest of the way over)
    expect(A('_mv.key')).toBe('dt');
    let n = 0; while (A('onground') && n++ < 12) hold([]);
    expect(A('onground'), 'the slide carried him off').toBe(false);
    expect(A('_mv'), 'the move was still out as he left').toBeTruthy();
    hold(['jump']);
    expect(A('_mv')).toBeNull();
    expect(A('vy')).toBeLessThan(-5);
  });
  it('a push that only marks him airborne does not: Fanny\'s gust on flat ground leaves the tilt running, and it runs out on the floor (the reviewer, 2026-10-20)', () => {
    const runOut = (gust) => {
      stage('Coiny', [-100]);
      press(['attack', 'down', 'right'], 2);
      expect(A('_mv.key')).toBe('dt');
      if (gust) {
        W.eval('DOWNSPECIALS.gust(fighters[1])');  // the dummy behind him blows him away: t.onground = false, with no lift and the floor still under him
        expect(A('vx'), 'the gust pushed him').toBeGreaterThan(5);
        expect(A('onground'), 'the gust marked him airborne').toBe(false);
        hold([]);
        expect(A('_mv'), 'the tilt is still out').toBeTruthy();
        expect(A('onground'), 'back on the floor after his own step').toBe(true);
      } else hold([]);
      let n = 1; while (A('_mv') && n++ < 30) hold([]);
      return n;
    };
    expect(runOut(true), 'the move ran all its frames out, as with no gust').toBe(runOut(false));
  });
  it('on the ground nothing changes: the same tilt run out on the platform keeps its frames', () => {
    ledge('Coiny', 300);
    press(['attack', 'down', 'right'], 2);
    expect(A('_mv.key')).toBe('dt');
    let n = 0; while (A('_mv') && n++ < 30) hold(['right']);
    expect(A('onground')).toBe(true);
    expect(n + 2, 'the whole move, start-up to recovery').toBeGreaterThanOrEqual(J('mvTotal(MOVESETS.slap.dt)'));
  });
});

describe('what does not change', () => {
  it('an aerial still keeps the facing it began with (it drifts, it does not turn)', () => {
    stage('Coiny', [45, -45], true);
    press(['attack', 'right'], 2);
    expect(A('_mv.key')).toBe('fa');
    const x0 = A('x');
    for (let i = 0; i < 10; i++) hold(['left']);
    expect(A('face')).toBe(1);
    expect(A('x')).toBeLessThan(x0);                                   // drifting back is allowed, as it always was
    expect(J('fighters[1].pct'), 'the foe in front').toBeCloseTo(7, 1);
    expect(J('fighters[2].pct'), 'the foe behind').toBe(0);
  });
  // Recorded on MAIN (fc0b69d: the game without moving-while-attacking, with the per-fighter stats in -- Bomby runs 0.94, Snowball 0.91), in a
  // scratch checkout of it: where the fighter is, frame by frame, holding an arrow through the move ('L' = facing left). A Root & blast smash
  // (Bomby's: it charges as he walks, then roots him) and a finisher that drives its own speed (Snowball's tackle). This branch has to match main
  // frame for frame: moving while attacking changes no smash and no finisher -- except, on purpose, Needle's smash (Riposte), a counter stance
  // that now holds him still while it is up (the owner, 2026-10-20: "Hold them still"; pinned in STANCES).
  // RESTATED (the merge with main): these were recorded on cfa6dea, before the stats (every run 1); main's own frames are the claim now.
  const run = (name, keys, keysN, holdKey, n) => W.eval(`(function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
    worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
    var mk=function(nm,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===nm;}), x, groundY()-24, i); };
    var A = mk(${JSON.stringify(name)}, 400, 0), D = mk('Pen', 1000, 1);
    A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='local'; A.you=true; D.controller='still'; A.stocks=9; D.stocks=9;
    fighters=[A,D]; for (var k in down) delete down[k];
    step(); step();
    fighters.forEach(function(f){ f.invuln=0; f.hitstun=0; f.atkCd=0; f.spCd=0; f.smCd=0; f.fnCd=0; f.pct=0; f.vx=0; f.vy=0; });
    A.x = 400; A.face = 1;
    var xs = [];
    for (var i = 0; i < ${n}; i++){
      for (var kk in down) delete down[kk];
      (i < ${keysN} ? ${JSON.stringify(keys)} : []).concat(i >= ${keysN} ? [${JSON.stringify(holdKey)}] : []).forEach(function(k){ down[KEYS[k]] = true; });
      step();
      xs.push(Math.round((A.x - 400) * 100) / 100 + (A.face < 0 ? 'L' : ''));
    }
    for (var kk in down) delete down[kk];
    return xs.join(' ');
  })()`);
  it('a smash still roots as before (Bomby\'s Root & blast), whichever way is held', () => {
    expect(run('Bomby', ['smash'], 2, 'right', 50)).toBe('0 0 0.85 2.54 5.08 8.46 12.69 17.77 23.69 29.7 35.72 41.74 47.75 53.77 59.78 65.8 71.82 77.83 83.85 89.86 95.88 101.9 107.91 113.93 119.94 125.96 131.98 137.99 144.01 150.02 150.87 151.72 152.56 153.41 154.25 155.1 155.95 156.79 157.64 158.48 159.33 160.18 161.02 161.87 162.71 163.56 164.41 165.25 166.1 166.94');
    expect(run('Bomby', ['smash'], 2, 'left', 50)).toBe('0 0 -0.85L -2.54L -5.08L -8.46L -12.69L -17.77L -23.69L -29.7L -35.72L -41.74L -47.75L -53.77L -59.78L -65.8L -71.82L -77.83L -83.85L -89.86L -95.88L -101.9L -107.91L -113.93L -119.94L -125.96L -131.98L -137.99L -144.01L -150.02L -150.87L -151.72L -152.56L -153.41L -154.25L -155.1L -155.95L -156.79L -157.64L -158.48L -159.33L -160.18L -161.02L -161.87L -162.71L -163.56L -164.41L -165.25L -166.1L -166.94L');
  });
  it('a finisher moves exactly as before (Snowball\'s tackle carries him; holding back turns him only as it always did)', () => {
    expect(run('Snowball', ['smash', 'special'], 1, 'left', 30)).toBe('17 22.82L 27.83L 32.01L 35.38L 37.93L 39.66L 40.57L 40.66L 39.93L 38.38L 36.02L 32.83L 28.83L 24.01L 18.37L 12.54L 6.72L 0.89L -4.93L -10.76L -16.58L -22.4L -28.23L -34.05L -39.88L -45.7L -51.52L -57.35L -63.17L');
    expect(run('Snowball', ['smash', 'special'], 1, 'right', 30)).toBe('17 22.82 28.65 34.47 40.3 46.12 51.94 57.77 63.59 69.42 75.24 81.06 86.89 92.71 98.54 104.36 110.18 116.01 121.83 127.66 133.48 139.3 145.13 150.95 156.78 162.6 168.42 174.25 180.07 185.9');
  });
});

describe('specials: you walk and turn through them, except the ones built around standing still', () => {
  // walk right for n frames after pressing C (with `dir`), against the same frames with no C pressed (a frame standing, then right)
  const spWalk = (name, dir, n = 30) => {
    const go = (keys) => { stage(name); hold(keys); for (let i = 0; i < n; i++) hold(['right']); return A('x') - 400; };
    return go(['special'].concat(dir ? [dir] : [])) / go([]);
  };
  // RESTATED (the owner, 2026-10-20, answer 2: "Hold them still"): Gaty's down-special, a reflect that does not plant, was the third row here; a
  // reflect stance now holds you still while it is up (see 'hold them still' below).
  it('a shot, a wind-up and a held charge do not slow a walk', () => {
    expect(spWalk('Firey', null)).toBeGreaterThan(0.97);      // Fireball: a shot
    expect(spWalk('Pillow', null)).toBeGreaterThan(0.97);     // Fluff Bounce: a ring's wind-up
  });
  it('turning during a wind-up turns what it fires: Lifering\'s sprint goes the way he faces when the whistle ends', () => {
    stage('Lifering');
    hold(['special']);                                        // the whistle (a 10-frame wind-up), facing right
    for (let i = 0; i < 4; i++) hold(['left']);
    expect(A('face')).toBe(-1);
    let n = 0; while (!(A('_dashing') > 0) && n++ < 20) hold(['left']);
    expect(A('_dashing')).toBeGreaterThan(0);
    expect(A('vx')).toBeLessThan(-8);                         // sprinting left
  });
  it('the ones built around standing still still hold you: Too Heavy (he plants), Ghost Vacuum (rooted), Palanquin Catch (arms up), Knuckles (he stands there)', () => {
    expect(spWalk('Baseball', null, 20)).toBeLessThan(0.5);
    expect(spWalk('Poppy', null, 30)).toBeLessThan(0.3);
    expect(spWalk('Blueberry', null, 16)).toBeLessThan(0.4);
    expect(spWalk('Jack', 'down', 14)).toBeLessThan(0.4);
  });
  // RESTATED (the owner, 2026-10-20, answer 2: "Hold them still"): this pinned that a counter never held you still. It does now, while it is up;
  // holding an arrow still does not take its stance down.
  it('a counter holds you still and unturned while it is up, and holding an arrow does not take its stance down', () => {
    stage('Needle');
    hold(['special', 'down']);
    expect(A('countering')).toBeGreaterThan(0);
    const x0 = A('x');
    for (let i = 0; i < 10; i++) hold(['left']);
    expect(A('countering')).toBeGreaterThan(0);
    expect(A('x')).toBeCloseTo(x0, 1);
    expect(A('face')).toBe(1);
  });
});

describe('hold them still (the owner, 2026-10-20: "Hold them still", then "Only pure stances"): every counter, reflect and armour brace', () => {
  // Every stance in the game, II and the prize fighters included (found by firing every fighter's neutral, down and up special, smash and finisher and
  // reading countering, reflecting and armour; an armour stance is the armour a brace puts up -- braceUp -- not a dash's, a lift's or a move's).
  // [fighter, how it is fired ('D' special+down, 'N' special alone, 'S' smash), its flag, the frames it is up]. Held = frames - 1: the stance goes
  // up after the press frame's step has moved them, and the step on which its flag runs out moves them again.
  // RESTATED (the owner, 2026-10-20, second review, answer 1: "Only pure stances"): this list held every armour and reflect stance; the ones whose
  // armour or reflect rides on an attack or a buff walk again and are in FREED below.
  const STANCES = [
    ['Leafy', 'D', 'countering', 26], ['Needle', 'N', 'countering', 26], ['Needle', 'D', 'countering', 32], ['Needle', 'S', 'countering', 60],
    ['Teardrop', 'D', 'countering', 24], ['Coiny', 'D', 'countering', 24], ['Golf Ball', 'D', 'countering', 28], ['Rose', 'D', 'countering', 28],
    ['Ruler', 'D', 'countering', 22], ['Ice Cube', 'D', 'countering', 26], ['Pickle', 'D', 'countering', 28], ['Fan', 'D', 'countering', 38],
    ['Clover', 'D', 'countering', 30],
    ['Gaty', 'D', 'reflecting', 44],
    ['Pin', 'D', 'armor', 40], ['Snowball', 'D', 'armor', 50], ['Pencil', 'D', 'armor', 36], ['Book', 'D', 'armor', 24], ['Nickel', 'D', 'armor', 44],
    ['Grassy', 'D', 'armor', 36], ['Loser', 'D', 'armor', 50], ['David', 'D', 'armor', 44], ['Sidewalky', 'D', 'armor', 50], ['Roboty', 'D', 'armor', 44],
    ['Tree', 'D', 'armor', 50], ['Baseball', 'N', 'armor', 26], ['Box', 'D', 'armor', 36],
  ];
  // the armour on an attack or a buff, and the reflect on an attack: they walk and turn while it is up, as before the stances held anyone
  // [fighter, how, its flag, the frames it is up]
  const FREED = [
    ['Money', 'D', 'armor', 24], ['Bracelety', 'D', 'armor', 28], ['Dora', 'D', 'armor', 20], ['Bell', 'D', 'armor', 30], ['TV', 'D', 'armor', 30],
    ['Saw', 'D', 'armor', 30], ['Liy', 'D', 'armor', 16], ['Fern', 'D', 'armor', 20], ['Pillow', 'D', 'armor', 40], ['Loser', 'N', 'armor', 22],
    ['Gaty', 'N', 'reflecting', 36], ['Blueberry', 'N', 'reflecting', 24],
  ];
  const upExpr = (kind) => kind === 'armor' ? 'fighters[0]._braceT > 0 && fighters[0].armor > 0' : `fighters[0].${kind} > 0`;
  const fire = (name, how) => {
    stage(name, [700]);
    if (name === 'Nickel') W.eval('var _r = Math.random; Math.random = function(){ return 0; }');   // heads: the armour (tails is a stumble, no stance)
    hold(how === 'D' ? ['special', 'down'] : how === 'N' ? ['special'] : ['smash']);
    if (name === 'Nickel') W.eval('Math.random = _r');
  };
  // fire it standing still, then hold the arrow AWAY from the way they face every frame: held, they neither move nor turn; the frame the flag is down they do
  const run = (name, how, kind) => {
    fire(name, how);
    let n = 0; while (!J(upExpr(kind)) && n++ < 80) hold([]);
    const up0 = J(kind === 'armor' ? 'fighters[0]._braceT' : 'fighters[0].' + kind), x0 = A('x');
    let held = 0, bad = null, free = null, px = x0;
    for (let i = 0; i < 90; i++) {
      hold(['left']);
      if (J(upExpr(kind))) { held++; if (!bad && (A('face') !== 1 || Math.abs(A('x') - x0) > 0.5)) bad = `frame ${i}: face ${A('face')} x ${(A('x') - x0).toFixed(2)}`; px = A('x'); }
      else { free = { face: A('face'), dx: A('x') - px, stun: A('hitstun') }; break; }
    }
    return { up0, held, bad, free };
  };
  it('each holds its fighter still and unturned for exactly the frames it is up, and frees them the frame it ends', () => {
    const wrong = [];
    for (const [name, how, kind, frames] of STANCES) {
      const r = run(name, how, kind), id = `${name} ${how}`;
      if (r.up0 !== frames) wrong.push(`${id}: up ${r.up0} frames, listed ${frames}`);
      if (r.bad) wrong.push(`${id}: moved or turned while up (${r.bad})`);
      // Fan Theory takes itself down when its read breaks (34 frames in) and leaves him stunned: held until then, and the stun is the move's own
      const heldWant = name === 'Fan' ? 33 : frames - 1;
      if (r.held !== heldWant) wrong.push(`${id}: held ${r.held} steps, want ${heldWant}`);
      if (!r.free) wrong.push(`${id}: never came down`);
      else if (name === 'Fan') { if (!(r.free.stun > 0)) wrong.push(`${id}: the broken read should stun him`); }
      else if (r.free.face !== -1 || !(r.free.dx < 0)) wrong.push(`${id}: not freed the frame it ended (face ${r.free.face}, dx ${r.free.dx.toFixed(2)})`);
    }
    expect(wrong).toEqual([]);
  });
  it('the armour on an attack or a buff, and the reflect on an attack, hold no one: they walk and turn while it is up (answer 1, "Only pure stances")', () => {
    const wrong = [];
    for (const [name, how, kind, frames] of FREED) {
      fire(name, how);
      const up = kind === 'armor' ? 'fighters[0].armor > 0' : 'fighters[0].reflecting > 0', id = `${name} ${how}`;
      let w = 0; while (!J(up) && w++ < 80) hold([]);
      const up0 = J('fighters[0].' + kind), x0 = A('x');
      if (up0 !== frames) wrong.push(`${id}: up ${up0} frames, listed ${frames}`);
      if (J('fighters[0]._braceT > 0')) wrong.push(`${id}: still puts up a brace`);
      let walked = false, still = false, n = 0;
      while (J(up) && n++ < frames) {
        hold(['left']);
        if (J('stanceStill(fighters[0])')) still = true;
        if (J(up) && A('face') === -1 && A('x') < x0 - 1) walked = true;
      }
      if (still) wrong.push(`${id}: held still`);
      if (!walked) wrong.push(`${id}: did not walk and turn while it was up`);
    }
    expect(wrong).toEqual([]);
  });
  it('a counter that answers a hit comes down at once, and frees them that frame', () => {
    stage('Coiny', [60]);
    hold(['special', 'down']);
    expect(A('countering')).toBeGreaterThan(0);
    W.eval('applyHit(fighters[0], 8, -4, -3, fighters[1])');   // the foe's hit lands in the stance: the counter answers it
    expect(A('countering')).toBe(0);
    const x0 = A('x');
    hold(['left']);
    expect(A('face')).toBe(-1);
    expect(A('x')).toBeLessThan(x0);
  });
  it('a counter that answers frees them at once even with armour left: Golf Ball\'s Crusher stop, Needle\'s Riposte (answer 2, "Free once it answers")', () => {
    for (const [name, keys] of [['Golf Ball', ['special', 'down']], ['Needle', ['smash']]]) {
      stage(name, [60]);
      hold(keys);
      let n = 0; while (!(A('countering') > 0) && n++ < 60) hold([]);
      expect(A('countering'), name + ': the stance is up').toBeGreaterThan(0);
      W.eval('applyHit(fighters[0], 8, -4, -3, fighters[1])');   // the foe's hit lands in it: the counter answers
      expect(A('countering'), name).toBe(0);
      expect(A('armor'), name + ': armour left').toBeGreaterThan(1);
      expect(J('stanceStill(fighters[0])'), name).toBe(false);
      const x0 = A('x');
      hold(['left']);
      expect(A('face'), name + ': turns at once').toBe(-1);
      expect(A('x'), name + ': walks at once').toBeLessThan(x0);
      expect(A('armor'), name + ': with the armour still on').toBeGreaterThan(0);
    }
  });
  // RESTATED (the owner, 2026-10-20, second review, answer 1: "Only pure stances"): this used Pillow's guard, whose hop now drifts and turns again (it
  // is in FREED); a pure counter fired in the air is the stance that holds the drift now.
  it('in the air no drift changes: Coiny\'s counter fired in the air, the arrows neither move nor turn him until it ends', () => {
    stage('Coiny', [700], true);
    hold(['special', 'down']);
    expect(A('countering')).toBeGreaterThan(0);
    for (let i = 0; i < 3; i++) hold(['left']);
    expect(A('onground'), 'in the air').toBe(false);
    expect(A('vx')).toBe(0);
    expect(A('face')).toBe(1);
  });
  it('no turning in a stance: a smash pressed while one is up fires the way the fighter already faces, never turned toward a foe behind (answer 3)', () => {
    const smashBehind = (stance) => {
      stage('Snowball', [-150]);
      if (stance) { hold(['special', 'down']); expect(J('stanceStill(fighters[0])'), 'Dig In is up').toBe(true); }
      press(['smash']);
      let n = 0; while (!J('fighters[0]._lastSmashAt > 0') && n++ < 60) hold([]);   // it charges, then goes off by itself
      return { face: A('face'), still: J('stanceStill(fighters[0])'), fired: J('fighters[0]._lastSmashAt > 0') };
    };
    const free = smashBehind(false);
    expect(free.fired).toBe(true);
    expect(free.face, 'out of a stance the smash aims round at the foe behind, as always').toBe(-1);
    const held = smashBehind(true);
    expect(held.fired).toBe(true);
    expect(held.still, 'it fired inside Dig In').toBe(true);
    expect(held.face, 'in the stance it fires the way he faced').toBe(1);
  });
  it('armour from anything that is not a stance does not hold anyone: a dash, an up-special\'s lift, Grassy\'s Grasstree (a lasting slowdown, kept as it was)', () => {
    stage('Snowball', [700]);
    hold(['special']); for (let i = 0; i < 5; i++) hold([]);   // Rage Tackle: an armoured charge
    expect(A('armor'), 'the armour of Rage Tackle').toBeGreaterThan(0);
    expect(J('stanceStill(fighters[0])')).toBe(false);
    stage('Grassy', [700]);
    hold(['special']); for (let i = 0; i < 6; i++) hold([]);   // Grasstree: up the tree, armoured every frame, slower
    expect(A('_grasstree'), 'up the tree').toBeGreaterThan(0);
    const x0 = A('x');
    for (let i = 0; i < 10; i++) hold(['left']);
    expect(A('face')).toBe(-1);
    expect(A('x')).toBeLessThan(x0 - 10);
    stage('Ruby', [700]);
    hold(['special', 'jump']); hold([]);                        // Gem-Hard: an up-special with armour on the way up (up is the jump key)
    expect(A('armor'), 'the armour of Gem-Hard').toBeGreaterThan(0);
    expect(J('stanceStill(fighters[0])')).toBe(false);
  });
  it('the CPU waits in its stance: with one up on the ground it lets go of the arrows (they could not walk it anywhere)', () => {
    stage('Coiny', [300]);
    const r = J(`(function(){ var f = fighters[0]; f._lvlCache = 2; f.countering = 12; f.onground = true;
      var a = finishAI(f, { left:true }, 'slap').left; f.countering = 0; var b = finishAI(f, { left:true }, 'slap').left; return [a, b]; })()`);
    expect(r).toEqual([false, true]);
  });
  it('...but a CPU that asks for a move in its stance keeps its arrows: they choose the move, so a side move stays a side move, not a jab (the reviewer, 2026-10-20)', () => {
    stage('Coiny', [300]);
    const r = J(`(function(){ var f = fighters[0]; f._lvlCache = 2; f.countering = 12; f.onground = true;
      var a = finishAI(f, { right:true, attack:true }, 'slap'), b = finishAI(f, { right:true, smash:true }, 'slap'); f.countering = 0;
      return [a.right, a.attack, b.right]; })()`);
    expect(r).toEqual([true, true, true]);
  });
});

describe('online: the host runs it, and a client sees the turned attack', () => {
  let room, H, C;
  beforeAll(async () => { room = await makeRoom(['H', 'A']); ({ H, A: C } = room.pages); }, 180000);
  const click = (w, selector) => w.eval(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const key = (w, code, isDown) => w.dispatchEvent(new w.KeyboardEvent(isDown ? 'keydown' : 'keyup', { code, bubbles: true }));
  it("p2 (on the friend's screen) turns round mid-tilt: the host's box hits the foe behind, and the friend sees the fighter and the hit art turn", () => {
    room.reset();
    const code = room.host('H', 'Pen');
    room.join('A', code, 'Coiny');
    click(H, '#lobbyCount button[data-v="2"]');
    room.flush();
    click(H, '#lobbyControls button');
    room.flush();
    expect(H.eval('running') && C.eval('running')).toBe(true);
    for (let i = 0; i < 30; i++) room.frame();
    // the host's world: p2 (Coiny, the friend's) on the floor facing right, the host's own fighter 45 px BEHIND p2; a long down-tilt on Coiny's kit
    H.eval(`MOVESETS.slap = Object.assign({}, MOVESETS.slap, { dt:{n:'T',pose:'kick',st:10,act:6,end:8,boxes:[{s:MvC(10,0,60,0,14),dmg:5,kb:[5,-2],stun:16}]} });
      (function(){ var P = fighters[1], O = fighters[0]; P.x = 600; P.face = 1; P.vx = 0; P.atkCd = 0; P.invuln = 0; O.x = 555; O.vx = 0; O.invuln = 0; O.pct = 0; O.controller = 'still'; })();`);
    room.frame();
    const me = C.eval('NET.myIdx');
    expect(me).toBe(1);
    const K = C.eval('({ x: KEYS.attack, r: KEYS.right, l: KEYS.left, d: KEYS.down })');
    key(C, K.x, true); key(C, K.d, true); key(C, K.r, true);
    for (let i = 0; i < 3; i++) room.frame();
    key(C, K.x, false); key(C, K.d, false); key(C, K.r, false); key(C, K.l, true);
    let seenTurned = false, seenArtBehind = false;
    for (let i = 0; i < 16; i++) {
      room.frame();
      // (a client's hit art is the host's, unpacked: its owner and where the owner stood when it was drawn come with it)
      const v = C.eval(`(function(){ var P = fighters.find(function(f){ return f.idx === NET.myIdx; }), e = HIT_ART.find(function(q){ return q.o === P.idx && q.m === 'l' && q.sh && q.sh.kind === 'capsule'; });
        return { face: P.face, art: e ? [e.sh.x1, e.sh.x2, e.ox] : null }; })()`);
      if (v.face === -1) seenTurned = true;
      if (v.art && v.art[1] < v.art[2] - 30 && v.art[0] < v.art[2]) seenArtBehind = true;
    }
    key(C, K.l, false);
    expect(H.eval('fighters[1]._lastKey'), 'the host ran p2\'s down-tilt').toBe('dt');
    expect(H.eval('fighters[0].pct'), 'the foe behind p2 was hit, on the host').toBeGreaterThan(0);
    expect(H.eval('fighters[0].vx < 0 || fighters[0].x < 555'), '...knocked the new way').toBe(true);
    expect(seenTurned, 'the friend sees p2 face the other way').toBe(true);
    expect(seenArtBehind, "the friend sees the move's hit area out the new way").toBe(true);
  }, 120000);
});
