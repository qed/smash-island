import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// TEAM ZONES — the safe column above each team's base, in teams mode.
//
// Purpose is spawn protection: a respawning fighter used to drop straight back into whatever was
// already happening, so a team that lost the middle could be pinned on its own bluff. The
// no-attacking half is what stops it becoming a fort — it is a place to recover, not a position
// to hold.

function teams(w) {
  w.eval(`
    SETTINGS.mode='teams'; SETTINGS.teamKey='2v2'; SETTINGS.count=4; SETTINGS.itemRate=0;
    beginMatchNow();
  `);
}
// Put a fighter at the centre of their own team's zone.
const intoOwnZone = (w, idx) => w.eval(`
  (function(){
    var f = fighters[${idx}];
    var z = teamZoneOf(f.team);
    f.x = z.x + z.w/2; f.y = z.y + z.h/2;
    return !!z;
  })()`);

describe('team zones exist only in teams mode', () => {
  it('has a zone per base in teams mode', () => {
    const { window: w } = loadMonolith();
    teams(w);
    const n = w.eval(`bases.filter(function(b){ return !!teamZoneOf(b.team); }).length`);
    expect(n, 'every base projects a zone').toBe(w.eval('bases.length'));
    expect(n).toBeGreaterThan(1);
  });

  it('has none in FFA', () => {
    const { window: w } = loadMonolith();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=3; beginMatchNow();`);
    expect(w.eval(`teamZoneOf(0)`)).toBe(null);
    expect(w.eval(`inOwnTeamZone(fighters[0])`)).toBe(false);
  });

  it('stretches to the very top of the arena', () => {
    const { window: w } = loadMonolith();
    teams(w);
    const z = w.eval(`JSON.stringify(teamZoneOf(bases[0].team))`);
    const zone = JSON.parse(z);
    expect(zone.y, 'starts at the top edge').toBe(0);
    expect(zone.h, 'and reaches down to the base').toBeGreaterThan(100);
  });
});

describe('inside your own zone you cannot be hurt', () => {
  it('takes no damage at all', () => {
    const { window: w } = loadMonolith();
    teams(w);
    expect(intoOwnZone(w, 0)).toBe(true);
    const out = w.eval(`
      (function(){
        var t = fighters[0];
        var enemy = fighters.find(function(f){ return f.team !== t.team; });
        t.pct = 0; t.vx = 0; t.vy = 0;
        applyHit(t, 40, 12, -9, enemy);
        return [t.pct, t.vx, t.vy];
      })()`);
    expect(out[0], 'no damage').toBe(0);
    expect(out[1], 'no knockback x').toBe(0);
    expect(out[2], 'no knockback y').toBe(0);
  });

  it('but is hurt normally once outside it', () => {
    // Guards the test above from passing because damage is broken everywhere.
    const { window: w } = loadMonolith();
    teams(w);
    const pct = w.eval(`
      (function(){
        var t = fighters[0];
        var z = teamZoneOf(t.team);
        t.x = z.x + z.w + 400; t.y = z.y + z.h + 50;   // well clear of the zone
        t.pct = 0;
        var enemy = fighters.find(function(f){ return f.team !== t.team; });
        var ez = teamZoneOf(enemy.team);            // the attacker must be out of THEIRS too,
        enemy.x = ez.x + ez.w + 500; enemy.y = t.y; // or the no-attacking rule blocks the hit
        applyHit(t, 40, 12, -9, enemy);
        return t.pct;
      })()`);
    expect(pct, 'damage still works outside the zone').toBeGreaterThan(0);
  });

  it('protects only your OWN zone, not an enemy one', () => {
    // Chasing someone home is still allowed; it just cannot land while they are inside theirs.
    const { window: w } = loadMonolith();
    teams(w);
    const pct = w.eval(`
      (function(){
        var t = fighters[0];
        var enemy = fighters.find(function(f){ return f.team !== t.team; });
        var z = teamZoneOf(enemy.team);
        t.x = z.x + z.w/2; t.y = z.y + z.h/2;   // standing in the ENEMY zone
        t.pct = 0;
        var ez = teamZoneOf(enemy.team);
        enemy.x = ez.x + ez.w + 500; enemy.y = t.y;   // attacker out of its own zone
        applyHit(t, 40, 12, -9, enemy);
        return t.pct;
      })()`);
    expect(pct, 'an enemy zone protects nobody').toBeGreaterThan(0);
  });
});

describe('you cannot attack out of your own zone', () => {
  it('an attack thrown from inside deals no damage', () => {
    const { window: w } = loadMonolith();
    teams(w);
    const pct = w.eval(`
      (function(){
        var a = fighters[0];
        var z = teamZoneOf(a.team);
        a.x = z.x + z.w/2; a.y = z.y + z.h/2;
        var victim = fighters.find(function(f){ return f.team !== a.team; });
        var vz = teamZoneOf(victim.team);
        victim.x = vz.x + vz.w + 500; victim.y = vz.y + vz.h + 50;   // victim out in the open
        victim.pct = 0;
        applyHit(victim, 40, 12, -9, a);
        return victim.pct;
      })()`);
    expect(pct, 'a swing from inside the safe zone must not land').toBe(0);
  });

  it('the attack does not even start', () => {
    // Blocking only the damage would leave projectiles flying out of the zone, which reads as
    // broken rather than as a rule.
    const { window: w } = loadMonolith();
    teams(w);
    intoOwnZone(w, 0);
    const started = w.eval(`
      (function(){
        var f = fighters[0];
        f.atkCd = 0; f.spCd = 0; f._atkAnim = 0;
        projectiles.length = 0;
        doAttack(f); doSpecial(f); doSmash(f, 40);
        return [f._atkAnim, projectiles.length];
      })()`);
    expect(started[0], 'no swing animation began').toBe(0);
    expect(started[1], 'no projectile was fired').toBe(0);
  });

  it('attacks work normally outside the zone', () => {
    const { window: w } = loadMonolith();
    teams(w);
    const started = w.eval(`
      (function(){
        var f = fighters[0];
        var z = teamZoneOf(f.team);
        f.x = z.x + z.w + 400; f.y = z.y + z.h + 50;
        f.atkCd = 0; f._atkAnim = 0;
        doAttack(f);
        return f._atkAnim;
      })()`);
    expect(started, 'the guard is not disabling attacks everywhere').toBeGreaterThan(0);
  });
});

describe('it is where the team spawns', () => {
  it('every fighter starts inside their own zone', () => {
    const { window: w } = loadMonolith();
    teams(w);
    const outside = w.eval(`
      fighters.filter(function(f){ return !inOwnTeamZone(f); })
              .map(function(f){ return f.name + '@' + Math.round(f.x) + ',' + Math.round(f.y); })`);
    expect(outside, 'a spawn outside the safe zone defeats the point').toEqual([]);
  });

  it('a full teams match still resolves', () => {
    // The zone must not make a match unwinnable by letting a losing team hide forever — they
    // cannot attack from inside, so holding it cannot win.
    const { window: w } = loadMonolith();
    w.eval(`
      SETTINGS.mode='teams'; SETTINGS.teamKey='2v2'; SETTINGS.count=4;
      SETTINGS.stocks=1; SETTINGS.itemRate=0;
      beginMatchNow();
      fighters.forEach(function(f){ f.controller='ai'; f.you=false; });
      for (var i=0;i<20000 && running;i++) step();
    `);
    expect(w.eval('running'), 'the match ended').toBe(false);
  }, 180000);
});
