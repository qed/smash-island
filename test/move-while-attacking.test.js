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

let W;
beforeAll(async () => {
  W = bootMonolith(); await W.eval('profileReady');
  // throwaway moves on two kits, so the SYSTEM is measured, not a fighter's numbers: Coiny's ('slap') have no push of their own; Snowball's
  // ('tackle') side-tilt pushes him forward on frames 2-5
  W.eval(`MOVESETS.slap = {
    ft:{n:'T',pose:'punch',st:6,act:6,end:8,boxes:[{s:MvC(10,0,60,0,14),dmg:5,kb:[5,-2],stun:16}]},
    ut:{n:'U',pose:'uppercut',st:4,act:4,end:9,boxes:[{s:MvF(10,60,-1.8,-0.3,0),dmg:4,kb:[1,-7],stun:18}]},
    dt:{n:'D',pose:'kick',st:4,act:3,end:8,boxes:[{s:MvC(10,20,60,20,12),dmg:4,kb:[2,-4],stun:20}]},
    fa:{n:'F',pose:'punch',st:5,act:6,end:10,land:9,ac:16,boxes:[{s:MvC(10,0,60,0,14),dmg:7,kb:[6,-3],stun:16}]},
  };
  MOVESETS.tackle = Object.assign({}, MOVESETS.tackle, {
    ft:{n:'P',pose:'punch',st:7,act:3,end:8,boxes:[{s:MvC(10,0,60,0,14),dmg:5,kb:[5,-2],stun:16}],mv:[{t0:2,t1:5,mode:'set',vx:6}]},
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
// the frames hold right for, after the press: a timeline that starts with `pre` (held `preN` frames, right with it) and holds right after
function walkWith(name, pre, preN, n) {
  stage(name);
  const keys = [];
  for (let i = 0; i < preN + n; i++) {
    hold(i < preN ? pre.concat(['right']) : ['right']);
    if (A('_mv')) keys.push(A('_mv.key'));
  }
  return { dx: A('x') - 400, key: keys[0] || null, face: A('face') };
}
const walkOnly = (name, n) => walkWith(name, [], 0, n).dx;

describe('a ground jab or tilt walks at full speed', () => {
  it('holding right through a side-tilt, an up-tilt and a down-tilt covers what walking does over the same frames', () => {
    const N = 28, walk = walkOnly('Coiny', N + 2);
    expect(walk).toBeGreaterThan(120);
    for (const [k, pre] of [['ft', ['attack']], ['ut', ['attack', 'jump']], ['dt', ['attack', 'down']]]) {
      const r = walkWith('Coiny', pre, 2, N);
      expect(r.key, k + ' came out').toBe(k);
      expect(Math.abs(r.dx - walk), `${k}: walked ${r.dx.toFixed(1)} px against ${walk.toFixed(1)}`).toBeLessThan(2);
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
  it('every fighter\'s own tilts walk (a tilt with a push of its own only slows on the push frames)', () => {
    const rows = J(`ROSTER.filter(function(r){ var ms = MOVESETS[r.kit && r.kit.special]; return ms && r.kit.special !== 'slap' && r.kit.special !== 'tackle'; })
      .map(function(r){ var ms = MOVESETS[r.kit.special]; return [r.name, ['ft','ut','dt'].filter(function(k){ return ms[k]; }).map(function(k){ return [k, !!(ms[k].mv && ms[k].mv.some(function(m){ return m.vx != null; }))]; })]; })`);
    expect(rows.length).toBeGreaterThan(60);
    const bad = [];
    for (const [name, moves] of rows) {
      const walk = walkOnly(name, 24);
      for (const [k, pushes] of moves) {
        const r = walkWith(name, k === 'ft' ? ['attack'] : k === 'ut' ? ['attack', 'jump'] : ['attack', 'down'], 2, 22);
        const ratio = r.dx / walk;
        if (r.key !== k || ratio < (pushes ? 0.8 : 0.97) || ratio > 1.03) bad.push(`${name} ${k} ${r.key} ${ratio.toFixed(2)}`);
      }
    }
    expect(bad).toEqual([]);
  });
  it('the move\'s own push still wins on the frames it acts: holding back, the slide carries him forward, then he turns and walks', () => {
    stage('Snowball');
    press(['attack', 'right'], 2);
    expect(A('_mv.key')).toBe('ft');
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
    press(['attack', 'right'], 2);
    expect(A('_mv.key')).toBe('ft');
    for (let i = 0; i < 12; i++) hold(['left']);
    expect(A('face')).toBe(-1);
    expect(J('fighters[2].pct'), 'the foe on the new side').toBeCloseTo(5, 1);
    expect(J('fighters[2].vx'), '...knocked the new way').toBeLessThan(0);
    expect(J('fighters[1].pct'), 'the foe on the old side').toBe(0);
  });
  it('pressing the other way while it is live: the very next live frame hits the foe on the new side, and its hit art turns with it', () => {
    stage('Coiny', [40, -40]);
    press(['attack', 'right'], 2);
    let n = 0; while (J('fighters[1].pct') === 0 && n++ < 12) hold(['right']);
    expect(J('fighters[1].pct'), 'the first live frame hit the foe in front').toBeCloseTo(5, 1);
    expect(A('_mv') && A('_mv.t') < A('_mv.s.st') + A('_mv.s.act')).toBeTruthy();   // still live
    hold(['left']);                              // this frame's box was already out the old way; the turn happens after it
    expect(A('face')).toBe(-1);
    expect(J('fighters[2].pct')).toBe(0);
    hold(['left']);                              // the next live frame: the box is out the new way
    expect(J('fighters[2].pct'), 'the foe on the new side').toBeCloseTo(5, 1);
    const art = J(`(function(){ var A = fighters[0], e = HIT_ART.find(function(q){ return q.k === A.idx + ':mv0'; }); return e ? [e.sh.x1, e.sh.x2, A.x] : null; })()`);
    expect(art, 'the move\'s hit art').not.toBeNull();
    expect(art[1]).toBeLessThan(art[2] - 30);   // drawn out the new way (behind where it began)
    expect(J('fighters[1].pct'), 'the old side is not hit again').toBeCloseTo(5, 1);
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
  // Recorded on the build before this change (cfa6dea): where the fighter is, frame by frame, holding an arrow through the move ('L' = facing
  // left). A Root & blast smash (Bomby's: it charges as he walks, then roots him) and a finisher that drives its own speed (Snowball's tackle).
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
    expect(run('Bomby', ['smash'], 2, 'right', 50)).toBe('0 0 0.9 2.7 5.4 9 13.5 18.9 25.2 31.6 38 44.4 50.8 57.2 63.6 70 76.4 82.8 89.2 95.6 102 108.4 114.8 121.2 127.6 134 140.4 146.8 153.2 159.6 160.5 161.4 162.3 163.2 164.1 165 165.9 166.8 167.7 168.6 169.5 170.4 171.3 172.2 173.1 174 174.9 175.8 176.7 177.6');
    expect(run('Bomby', ['smash'], 2, 'left', 50)).toBe('0 0 -0.9L -2.7L -5.4L -9L -13.5L -18.9L -25.2L -31.6L -38L -44.4L -50.8L -57.2L -63.6L -70L -76.4L -82.8L -89.2L -95.6L -102L -108.4L -114.8L -121.2L -127.6L -134L -140.4L -146.8L -153.2L -159.6L -160.5L -161.4L -162.3L -163.2L -164.1L -165L -165.9L -166.8L -167.7L -168.6L -169.5L -170.4L -171.3L -172.2L -173.1L -174L -174.9L -175.8L -176.7L -177.6L');
  });
  it('a finisher moves exactly as before (Snowball\'s tackle carries him; holding back turns him only as it always did)', () => {
    expect(run('Snowball', ['smash', 'special'], 1, 'left', 30)).toBe('17 23.4L 28.9L 33.5L 37.2L 40L 41.9L 42.9L 43L 42.2L 40.5L 37.9L 34.4L 30L 24.7L 18.5L 12.1L 5.7L -0.7L -7.1L -13.5L -19.9L -26.3L -32.7L -39.1L -45.5L -51.9L -58.3L -64.7L -71.1L');
    expect(run('Snowball', ['smash', 'special'], 1, 'right', 30)).toBe('17 23.4 29.8 36.2 42.6 49 55.4 61.8 68.2 74.6 81 87.4 93.8 100.2 106.6 113 119.4 125.8 132.2 138.6 145 151.4 157.8 164.2 170.6 177 183.4 189.8 196.2 202.6');
  });
});

describe('specials: you walk and turn through them, except the ones built around standing still', () => {
  // walk right for n frames after pressing C (with `dir`), against the same frames with no C pressed (a frame standing, then right)
  const spWalk = (name, dir, n = 30) => {
    const go = (keys) => { stage(name); hold(keys); for (let i = 0; i < n; i++) hold(['right']); return A('x') - 400; };
    return go(['special'].concat(dir ? [dir] : [])) / go([]);
  };
  it('a shot, a wind-up and a held charge do not slow a walk', () => {
    expect(spWalk('Firey', null)).toBeGreaterThan(0.97);      // Fireball: a shot
    expect(spWalk('Pillow', null)).toBeGreaterThan(0.97);     // Fluff Bounce: a ring's wind-up
    expect(spWalk('Gaty', 'down')).toBeGreaterThan(0.97);     // a reflect that does not plant
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
  it('a counter is left as it was: it never held you still, and walking does not take its stance down', () => {
    stage('Needle');
    hold(['special', 'down']);
    expect(A('countering')).toBeGreaterThan(0);
    for (let i = 0; i < 10; i++) hold(['right']);
    expect(A('countering')).toBeGreaterThan(0);
    expect(spWalk('Needle', 'down')).toBeGreaterThan(0.97);
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
    // the host's world: p2 (Coiny, the friend's) on the floor facing right, the host's own fighter 45 px BEHIND p2; a long side-tilt on Coiny's kit
    H.eval(`MOVESETS.slap = Object.assign({}, MOVESETS.slap, { ft:{n:'T',pose:'punch',st:10,act:6,end:8,boxes:[{s:MvC(10,0,60,0,14),dmg:5,kb:[5,-2],stun:16}]} });
      (function(){ var P = fighters[1], O = fighters[0]; P.x = 600; P.face = 1; P.vx = 0; P.atkCd = 0; P.invuln = 0; O.x = 555; O.vx = 0; O.invuln = 0; O.pct = 0; O.controller = 'still'; })();`);
    room.frame();
    const me = C.eval('NET.myIdx');
    expect(me).toBe(1);
    const K = C.eval('({ x: KEYS.attack, r: KEYS.right, l: KEYS.left })');
    key(C, K.x, true); key(C, K.r, true);
    for (let i = 0; i < 3; i++) room.frame();
    key(C, K.x, false); key(C, K.r, false); key(C, K.l, true);
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
    expect(H.eval('fighters[1]._lastKey'), 'the host ran p2\'s side-tilt').toBe('ft');
    expect(H.eval('fighters[0].pct'), 'the foe behind p2 was hit, on the host').toBeGreaterThan(0);
    expect(H.eval('fighters[0].vx < 0 || fighters[0].x < 555'), '...knocked the new way').toBe(true);
    expect(seenTurned, 'the friend sees p2 face the other way').toBe(true);
    expect(seenArtBehind, "the friend sees the move's hit area out the new way").toBe(true);
  }, 120000);
});
