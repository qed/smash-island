import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// Golf Ball, from the wiki's three abilities. SPECIAL: Zap Shooter (TPOT "I SAID CAREFUL!!!") -- a
// sharpshooter's bolt that leaves at the height of the nearest foe ahead of her. DOWN-SPECIAL: the
// Announcer Crusher stop -- she braces, the next hit is stopped dead and its attacker shoved off.
// SMASH: Presence -- the curse aura, felt through walls. Key `debuff` became `zapshooter` everywhere.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const setup = (dist = 300, dy = 0) => `
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var G = makeFighter(ROSTER.find(function(r){ return r.name==='Golf Ball'; }), 300, groundY()-24, 0);
  var E = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 300+${dist}, groundY()-24-${dy}, 1);
  G.team=0; E.team=1; G.face=1; E.face=-1;
  [G,E].forEach(function(f){ f.controller='still'; f.invuln=0; f.spCd=0; f.atkCd=0; f.stocks=9; });
  fighters=[G,E]; step(); G.invuln=0; E.invuln=0; E.hurt=null; E.pct=0; G.pct=0;
  var ex=E.x, ey=E.y; var pin=function(){ E.x=ex; E.y=ey; E.vx=0; E.vy=0; };`;

describe("Golf Ball's Zap Shooter", () => {
  it('fires a fast, long-lived bolt that hits a foe 300px away and stuns', () => {
    const r = W.eval(`(function(){ ${setup(300)}
      doSpecial(G);
      var b = projectiles.filter(function(p){ return p.shape==='zapshooter'; })[0];
      var out = { shot: !!b, life: b && b.life, vx: b && b.vx, hitAt: -1, stun: 0 };
      for (var i=0;i<60;i++){ pin(); step(); if (out.hitAt<0 && E.pct>0){ out.hitAt=i; out.stun=E.hitstun; } }
      out.cd = G.spCd; out.zapLife = ZAP_LIFE;
      return out;
    })()`);
    expect(r.shot).toBe(true);
    expect(r.life, 'long-lived (addProj applies PROJ_LIFE on top)').toBeGreaterThanOrEqual(r.zapLife);
    expect(r.vx, 'a sharpshooter\'s bolt is fast').toBeGreaterThanOrEqual(15);
    expect(r.hitAt, 'it reached a target 300px out').toBeGreaterThanOrEqual(0);
    expect(r.stun, 'and zapped it').toBeGreaterThanOrEqual(12);
    expect(r.cd).toBeGreaterThan(0);
  });

  it('leaves at the height of the target: a foe 80px up is hit too', () => {
    const r = W.eval(`(function(){ ${setup(240, 80)}
      E.onground=false;
      doSpecial(G);
      var b = projectiles.filter(function(p){ return p.shape==='zapshooter'; })[0];
      var out = { vy: b && b.vy, hitAt: -1 };
      for (var i=0;i<60;i++){ pin(); E.onground=false; step(); if (out.hitAt<0 && E.pct>0){ out.hitAt=i; } }
      return out;
    })()`);
    expect(r.vy, 'aimed upward').toBeLessThan(0);
    expect(r.hitAt, 'and it connected up there').toBeGreaterThanOrEqual(0);
  });
});

describe("Golf Ball's Announcer Crusher stop", () => {
  it('braces, stops the next hit dead and shoves the attacker off her', () => {
    const r = W.eval(`(function(){ ${setup(40)}
      doDownSpecial(G);
      var stance = G.countering;
      E.atkCd = 0; doAttack(E);
      var out = { stance: stance, frames: CRUSHER_FRAMES, gPct: 0, ePct: 0, eVx: 0 };
      for (var i=0;i<12;i++){ G.x=300; G.vx=0; step(); if (E.pct>0 && !out.ePct){ out.ePct=E.pct; out.eVx=E.vx; } }
      out.gPct = G.pct;
      return out;
    })()`);
    expect(r.stance).toBe(r.frames);
    expect(r.gPct, 'the hit was stopped dead').toBe(0);
    expect(r.ePct, 'the attacker was hurt by the wall').toBeGreaterThan(0);
    expect(r.eVx, 'and shoved away from her').toBeGreaterThan(0);
  });
});

describe("Golf Ball's Presence", () => {
  it('is her smash: five seconds in which every hit she lands curses', () => {
    const r = W.eval(`(function(){ ${setup(40)}
      doSmash(G);
      var curse = G.curse, name = SMASH_ID.zapshooter.name;
      G.atkCd = 0; doAttack(G);
      for (var i=0;i<10;i++){ pin(); step(); }
      return { curse: curse, name: name, stacks: E.curseStacks||0 };
    })()`);
    expect(r.name).toBe('Presence');
    expect(r.curse).toBeGreaterThanOrEqual(180);
    expect(r.stacks, 'the jab under Presence cursed the target').toBeGreaterThan(0);
  });
});

describe('the rename', () => {
  it('no table still knows debuff, and every table knows zapshooter', () => {
    const r = W.eval(`(function(){
      var tables = { RANGE_PROFILE: RANGE_PROFILE, SMASH_ID: SMASH_ID, SMASHES: SMASHES, LEGACY_SMASH_COST: LEGACY_SMASH_COST,
                     UPSPEC: UPSPEC, DOWNSPECIALS: DOWNSPECIALS, ATKSPECIALS: ATKSPECIALS, PROJ_SHAPE: PROJ_SHAPE };
      var out = {};
      Object.keys(tables).forEach(function(n){ out[n] = [!!tables[n].debuff, !!tables[n].zapshooter]; });
      out.kit = ROSTER.find(function(f){ return f.name==='Golf Ball'; }).kit.special;
      out.stale = ROSTER.filter(function(f){ return f.kit && f.kit.special==='debuff'; }).map(function(f){ return f.name; });
      return out;
    })()`);
    expect(r.kit).toBe('zapshooter');
    expect(r.stale).toEqual([]);
    for (const n of ['RANGE_PROFILE', 'SMASH_ID', 'SMASHES', 'LEGACY_SMASH_COST', 'UPSPEC', 'DOWNSPECIALS', 'ATKSPECIALS', 'PROJ_SHAPE']) {
      expect(r[n], n).toEqual([false, true]);
    }
  });
});
