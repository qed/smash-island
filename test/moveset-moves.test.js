import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';
import { SETUP_SRC } from './helpers/match-setup.js';

// The move runner behind every converted fighter's tilts, aerials and side special, and the movetech that goes with it
// (the owner, 2026-10-14). A throwaway moveset is put on Coiny's kit so the test measures the SYSTEM, not any fighter's numbers
// (each fighter's own moves are measured in its own test).

let W;
beforeAll(async () => {
  W = bootMonolith(); await W.eval('profileReady');
  W.eval(`MOVESETS.slap = {
    ft:{n:'T',pose:'punch',st:3,act:2,end:8,boxes:[{s:MvC(10,0,60,0,14),dmg:5,kb:[5,-2],stun:16}]},
    ut:{n:'U',pose:'chop',st:3,act:3,end:9,boxes:[{s:MvF(10,60,-1.8,-0.3,0),dmg:4,kb:[1,-7],stun:18}]},
    dt:{n:'D',pose:'kick',st:2,act:2,end:7,boxes:[{s:MvC(10,20,60,20,12),dmg:4,kb:[2,-4],stun:20}]},
    na:{n:'N',pose:'spin',st:3,act:6,end:8,land:6,ac:14,boxes:[{s:MvO(0,0,50),dmg:4,kb:[3,-3],stun:14}]},
    fa:{n:'F',pose:'punch',st:5,act:3,end:10,land:9,ac:16,boxes:[{s:MvC(10,0,60,0,14),dmg:7,kb:[6,-3],stun:16}]},
    ba:{n:'B',pose:'kickback',st:4,act:3,end:10,land:8,ac:15,boxes:[{s:MvC(-10,0,-60,0,14),dmg:8,kb:[-8,-4],stun:14}]},
    ua:{n:'UA',pose:'kickup',st:3,act:3,end:9,land:6,ac:14,boxes:[{s:MvC(0,-10,10,-62,14),dmg:5,kb:[0.5,-7],stun:20}]},
    da:{n:'DA',pose:'stompdn',st:6,act:5,end:12,land:12,ac:20,boxes:[{s:MvC(0,10,6,60,14),dmg:7,kb:[0.5,8],stun:16}]},
    side:{n:'S',pose:'dash',st:2,act:6,end:12,cd:60,boxes:[{s:MvO(24,0,30),dmg:6,kb:[6,-4],stun:14}],mv:[{t0:0,t1:7,mode:'set',vx:12}]},
  };`);
});

const stage = (dx, dy = 0, air = false) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
  var A = mk('Coiny', 400, 0), D = mk('Pen', 400 + ${dx}, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='local'; A.you=true; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; for (var k in down) delete down[k];
  step(); step();
  fighters.forEach(function(f){ f.invuln=0; f.hitstun=0; f.atkCd=0; f.spCd=0; f.pct=0; f.vx=0; f.vy=0; });
  ${air ? 'A.y = groundY()-24-90; A.onground=false; D.y = A.y + ' + dy + '; D.onground=false; D.vy=-0.01;' : ''}
})()`);
const hold = (keys, n = 4) => W.eval(`(function(){ ${JSON.stringify(keys)}.forEach(function(k){ down[KEYS[k]]=true; }); for(var i=0;i<${n};i++) step(); ${JSON.stringify(keys)}.forEach(function(k){ down[KEYS[k]]=false; }); })()`);
const steps = (n) => W.eval(`for(var i=0;i<${n};i++) step();`);
const J = (code) => W.eval(`(function(){ return ${code}; })()`);
const key = () => J('fighters[0]._mv ? fighters[0]._mv.key : (fighters[0]._lastKey || null)');

describe('ground: the arrows pick the move', () => {
  // (restated 2026-10-18 -- the owner, 2026-10-18, "side attacks should be merged into neutral attacks (the same thing as specials)"; asked, "Ground only" and "Keep them": side with X on the ground is the jab, aimed that way; up and down stay the tilts)
  it('X is the jab; side with X is the jab too; up and down with X are the up- and down-tilt', () => {
    const out = {};
    for (const [name, keys] of [['jab', ['attack']], ['side', ['attack', 'right']], ['ut', ['attack', 'jump']], ['dt', ['attack', 'down']]]) {
      stage(45); hold(keys, 4); out[name] = J('fighters[0]._mv ? fighters[0]._mv.key : "-"');
    }
    expect(out).toEqual({ jab: '-', side: '-', ut: 'ut', dt: 'dt' });
  });
  // (It was "and cannot be walked out of": a ground tilt rooted you. The owner, 2026-10-20: "attacks are weird, you should be able to move
  // while doing them" -- a ground move walks with the arrows now; test/move-while-attacking.test.js measures it in full.)
  it('a tilt hits its own foe, leaves it in the stun the move names, and walks with the arrow held', () => {
    stage(45); hold(['attack', 'down', 'right'], 4); steps(1);   // (the down-tilt, with → held to walk: the side-tilt is off on the ground -- the owner, 2026-10-18, "side attacks should be merged into neutral attacks (the same thing as specials)")
    expect(J('fighters[1].pct')).toBeCloseTo(4, 1);
    expect(J('fighters[1].hitstun')).toBeGreaterThan(10);
    expect(J('fighters[0].x - 400')).toBeGreaterThan(8);   // walked on (a rooted tilt slid about 3 px)
  });
  it('the up-tilt comes out when up and X go down together on the ground, not a hop with a swing in it', () => {
    stage(45); hold(['attack', 'jump'], 4);
    expect(J('fighters[0].onground || fighters[0].y > groundY()-24-12')).toBe(true);
  });
});

describe('air: X is an aerial, and the arrows pick which', () => {
  it('neutral, forward, up and down', () => {
    const out = {};
    for (const [name, keys] of [['na', ['attack']], ['fa', ['attack', 'right']], ['ua', ['attack', 'jump']], ['da', ['attack', 'down']]]) {
      stage(400, 0, true); hold(keys, 4); out[name] = J('fighters[0]._mv ? fighters[0]._mv.key : "-"');
    }
    expect(out).toEqual({ na: 'na', fa: 'fa', ua: 'ua', da: 'da' });
  });
  it('a back-air is X just after turning round: it hits behind and keeps her facing', () => {
    stage(-45, 0, true); W.eval('fighters[1].face = 1;'); hold(['attack', 'left'], 5); steps(4);
    expect(J('fighters[0]._atkKind')).toBe('kickback');
    expect(J('fighters[0].face')).toBe(1);
    expect(J('fighters[1].pct')).toBeCloseTo(8, 1);
    expect(J('fighters[1].vx')).toBeLessThan(0);
  });
  it('lands with lag if it lands early, free after its auto-cancel frame', () => {
    stage(400); W.eval('fighters[0].y = groundY()-24-26; fighters[0].onground = false; fighters[0].vy = 0;'); hold(['attack'], 3);
    for (let i = 0; i < 30 && !J('fighters[0].onground'); i++) steps(1);
    steps(1);
    expect(J('fighters[0].onground')).toBe(true);
    expect(J('fighters[0]._lag || 0')).toBeGreaterThan(0);
    stage(400); W.eval('fighters[0].y = groundY()-24-400; fighters[0].onground = false; fighters[0].vy = 0;'); hold(['attack'], 3); steps(30);   // the move is over long before it lands
    W.eval('fighters[0].y = groundY()-24-2; fighters[0].vy = 4;'); steps(3);
    expect(J('fighters[0]._lag || 0')).toBe(0);
  });
});

describe('no side special (the owner, 2026-10-16: "side specials should be neutral specials ... so basically just remove side specials")', () => {
  it('←/→ + C is the neutral special, aimed that way, and it fires at once (C alone waits a few frames for a direction); no side move starts', () => {
    stage(400); hold(['special', 'right'], 2);
    expect(J('fighters[0].spCd'), 'the special went off inside two frames').toBeGreaterThan(0);
    expect(J('fighters[0]._mv ? fighters[0]._mv.key : "-"')).not.toBe('side');
    stage(400); hold(['special'], 2);
    expect(J('fighters[0].spCd'), 'C alone still waits for a direction').toBe(0);
    stage(400); hold(['special'], 8);
    expect(J('fighters[0].spCd')).toBeGreaterThan(0);
    expect(J('SIDE_SPECIALS')).toBe(false);
    expect(J('sideSpecialOf(fighters[0], { right:true })')).toBe(null);
  });
});

describe('no side-tilt on the ground (the owner, 2026-10-18: "side attacks should be merged into neutral attacks (the same thing as specials)"; asked, "Ground only" and "Keep them")', () => {
  it('on the ground ←/→ + X is the jab, facing the pressed side, at once; ↑ + X and ↓ + X stay the tilts; in the air → + X stays the forward-air; the CPU never starts a side-tilt', () => {
    // a real converted fighter (Pencil, whose side-tilt was Lead Jab), played by a person
    const as = (dx, face, air = false) => W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
      var A = mk('Pencil', 400, 0), D = mk('Pen', 400 + ${dx}, 1);
      A.team=0; D.team=1; A.controller='local'; A.you=true; D.controller='still'; A.stocks=9; D.stocks=9;
      fighters=[A,D]; for (var k in down) delete down[k];
      step(); step();
      fighters.forEach(function(f){ f.invuln=0; f.hitstun=0; f.atkCd=0; f.spCd=0; f.pct=0; f.vx=0; f.vy=0; });
      A.face=${face}; D.face=${-face}; A._used = {}; A._atkMove = null;
      ${air ? 'A.y = groundY()-24-90; A.onground=false; D.y = A.y; D.onground=false; D.vy=-0.01;' : ''}
    })()`);
    const now = () => JSON.parse(J(`JSON.stringify({ mv: fighters[0]._mv ? fighters[0]._mv.key : '-', move: fighters[0]._atkMove, face: fighters[0].face, ft: (fighters[0]._used || {}).ft || 0, foe: fighters[1].pct })`));
    expect(J('SIDE_TILTS')).toBe(false);
    // → + X facing left: she turns right and jabs, on the second frame (the grab pair's short wait; a plain X waits longer for C)
    as(45, -1); hold(['attack', 'right'], 2);
    let r = now();
    expect(r, 'right + X on the ground').toMatchObject({ mv: '-', move: 'van.jab', face: 1, ft: 0 });
    steps(4); expect(now().foe, 'the jab lands on the foe on the side pressed').toBeGreaterThan(0);
    // ← + X facing right: she turns left and jabs
    as(-45, 1); hold(['attack', 'left'], 2);
    expect(now(), 'left + X on the ground').toMatchObject({ mv: '-', move: 'van.jab', face: -1, ft: 0 });
    // ↑ + X and ↓ + X are still the up-tilt and the down-tilt
    as(45, 1); hold(['attack', 'jump'], 4); expect(now().mv, 'up + X').toBe('ut');
    as(45, 1); hold(['attack', 'down'], 4); expect(now().mv, 'down + X').toBe('dt');
    // in the air → + X is still the forward-air
    as(400, 1, true); hold(['attack', 'right'], 4); expect(now().mv, 'right + X in the air').toBe('fa');
    // the CPU: four converted fighters kept close for 600 frames start tilts and aerials, and never a side-tilt
    W.eval(SETUP_SRC);
    const R0 = W.Math.random;
    W.Math.random = ((a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; })(77);
    const cpu = JSON.parse(W.eval(`(function(){
      __setupCustomMatch(['Snowball', 'Pencil', 'Leafy', 'Bow'], 3, 2, 0);
      fighters.forEach(function(f){ f._used = {}; });
      for (var i = 0; i < 600; i++) {
        if (i % 60 === 0) fighters.forEach(function(f, j){ if (!f.dead) { f.x = 380 + j * 40; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; } });
        step();
      }
      var o = { ft: 0, moves: 0 };
      fighters.forEach(function(f){ var U = f._used || {}; o.ft += U.ft || 0; ['ut','dt','na','fa','ba','ua','da'].forEach(function(k){ o.moves += U[k] || 0; }); });
      return JSON.stringify(o);
    })()`));
    W.Math.random = R0;
    expect(cpu.moves, 'the CPUs did use their moveset').toBeGreaterThan(0);
    expect(cpu.ft, 'a CPU started a side-tilt').toBe(0);
  });
});

describe('movetech: short hop, fast fall, wall jump', () => {
  it('a quick press of jump rises about half as high as a held one', () => {
    const rise = (n) => { stage(400); let ymin = 1e9; W.eval('down[KEYS.jump]=true'); for (let i = 0; i < 40; i++) { if (i === n) W.eval('down[KEYS.jump]=false'); steps(1); ymin = Math.min(ymin, J('fighters[0].y')); } W.eval('down[KEYS.jump]=false'); return J('groundY()-24') - ymin; };
    const short = rise(1), full = rise(14);
    expect(short).toBeLessThan(full * 0.65); expect(short).toBeGreaterThan(30);
  });
  it('Down in the air after the peak is a fast fall; on the ground it is still just Down', () => {
    stage(400); W.eval('fighters[0].y=groundY()-24-200; fighters[0].onground=false; fighters[0].vy=2;'); hold(['down'], 2); steps(2);
    expect(J('fighters[0]._ff')).toBe(true); expect(J('fighters[0].vy')).toBeGreaterThan(12);
    stage(400); hold(['down'], 4); expect(J('!!fighters[0]._ff')).toBe(false);
  });
  it('against a solid wall, in the air, holding toward it: jump kicks off once per wall; landing refreshes it', () => {
    stage(400); W.eval('worldPlats=[{x:480,y:groundY()-400,w:60,h:400,solid:true}]; fighters[0].x=452; fighters[0].y=groundY()-24-120; fighters[0].onground=false; fighters[0].vy=0; fighters[0].vx=0;');
    W.eval('down[KEYS.right]=true;'); steps(4);
    const vy0 = J('fighters[0].vy'); W.eval('down[KEYS.jump]=true;'); steps(1); W.eval('down[KEYS.jump]=false;');
    expect(J('fighters[0].vy')).toBeLessThan(vy0 - 5); expect(J('fighters[0].vx')).toBeLessThan(0);
    W.eval('fighters[0].x=452; fighters[0].vy=3; fighters[0].jumps=0;'); steps(3); const vy1 = J('fighters[0].vy'); W.eval('down[KEYS.jump]=true;'); steps(1); W.eval('down[KEYS.jump]=false; down[KEYS.right]=false;');
    expect(J('fighters[0].vy')).toBeGreaterThan(vy1 - 3);   // the same wall in the same airtime: no second kick
  });
});
