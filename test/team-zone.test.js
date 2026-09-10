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

  // REPLACES 'stretches to the very top of the arena'. The zone used to be a column running from
  // the ceiling down to the base. On the cross arena it is the pocket the spawn pads sit in, and
  // the change is the point rather than a side effect: with a column per team, two teams standing
  // in their own halves were each untouchable AND unable to swing out, so they piled up and the
  // match never resolved. A zone you can be pushed out of is what makes the fight happen.
  it('is a pocket around the spawn pads, not a column to the ceiling', () => {
    const { window: w } = loadMonolith();
    teams(w);
    const { zone, WH, pads } = JSON.parse(w.eval(`JSON.stringify({
      zone: teamZoneOf(bases[0].team), WH: WH, pads: bases[0].spawns
    })`));
    expect(zone.y, 'does not start at the ceiling').toBeGreaterThan(0);
    expect(zone.h, 'is a real area, not a sliver').toBeGreaterThan(100);
    expect(zone.h, 'covers well under half the arena height').toBeLessThan(WH * 0.5);
    // Every pad has to be inside it, or a fighter could reform outside their own protection.
    for (const p of pads) {
      expect(p.x >= zone.x && p.x <= zone.x + zone.w, `pad ${p.x} within zone x`).toBe(true);
      expect(p.y >= zone.y && p.y <= zone.y + zone.h, `pad ${p.y} within zone y`).toBe(true);
    }
  });

  // The flaw that stalled the first cut of this arena: give each team a zone covering its whole
  // side and every point on the map belongs to somebody, so nobody can ever be hit anywhere.
  it('leaves most of the map contested by nobody', () => {
    const { window: w } = loadMonolith();
    teams(w);
    const covered = w.eval(`
      (function(){
        var hit = 0, total = 0;
        for (var gx = 0; gx < 24; gx++) for (var gy = 0; gy < 24; gy++) {
          var x = WW*(gx+0.5)/24, y = WH*(gy+0.5)/24;
          total++;
          for (var i = 0; i < bases.length; i++) {
            var z = teamZoneOf(bases[i].team);
            if (z && x >= z.x && x <= z.x+z.w && y >= z.y && y <= z.y+z.h) { hit++; break; }
          }
        }
        return hit/total;
      })()`);
    expect(covered, 'safe zones blanket the arena — no damage could ever land').toBeLessThan(0.5);
  });
});

describe('standing in someone ELSE\'S zone bleeds you', () => {
  // Their corner makes them untouchable by you. Without a cost for trespassing you could simply
  // walk in and wait them out, which is the camping half of the pile this arena is meant to break.
  const holdFor = (w, spot) => w.eval(`
    (function(){
      var f = fighters[0];
      // Park everyone else out of reach so nothing but the zone rule can touch him.
      for (var i=1;i<fighters.length;i++){ fighters[i].x = WW*0.5; fighters[i].y = 40; fighters[i].hitstun = 9999; }
      var at = ${spot};
      f.pct = 0; f.hitstun = 0;
      for (var k=0;k<60;k++){ f.x=at.x; f.y=at.y; f.vx=0; f.vy=0; f.invuln=0; step(); }
      return f.pct;
    })()`);

  it('takes chip damage in an enemy zone', () => {
    const { window: w } = loadMonolith();
    teams(w);
    const got = holdFor(w, `(function(){ var z=teamZoneOf(fighters[0].team===0?1:0);
                                         return {x:z.x+z.w/2, y:z.y+z.h/2}; })()`);
    expect(got, 'a second inside an enemy corner costs about 2%').toBeGreaterThan(1);
    expect(got, 'but it is chip damage, not a kill').toBeLessThan(6);
  });

  it('takes none standing in neutral ground', () => {
    const { window: w } = loadMonolith();
    teams(w);
    const got = holdFor(w, `({ x: WW*0.5, y: WH*0.30 })`);
    expect(got, 'the contested middle is free to stand in').toBe(0);
  });
});

describe('reforming scatters across the pads', () => {
  it('rolls over every pad rather than always picking one', () => {
    const { window: w } = loadMonolith();
    teams(w);
    const { hit, pads } = JSON.parse(w.eval(`
      (function(){
        var b = bases[0], seen = {};
        // Clear the pads first: teammates START on them, and an occupied pad is refused by design
        // (that is the next test), which would otherwise look like a gap in the roll's coverage.
        for (var i=0;i<fighters.length;i++){ fighters[i].x = WW*0.5; fighters[i].y = WH*0.2; }
        // Keyed on the WHOLE position: the pads sit on three rows, so several legitimately share
        // an x and counting columns alone would under-report the spread.
        for (var i=0;i<300;i++){ var p = pickSpawnPad(b, fighters[0]);
          seen[Math.round(p.x)+':'+Math.round(p.y)] = 1; }
        return JSON.stringify({ hit: Object.keys(seen).length, pads: b.spawns.length });
      })()`));
    expect(pads, 'a 2v2 team gets eight pads').toBe(8);
    expect(hit, 'every pad is reachable by the roll').toBe(pads);
  });

  it('skips a pad a living teammate is already standing on', () => {
    const { window: w } = loadMonolith();
    teams(w);
    const landedOnMate = w.eval(`
      (function(){
        var b = bases[0], me = fighters.find(function(f){ return f.team === b.team; });
        var mate = fighters.find(function(f){ return f.team === b.team && f !== me; });
        if (!mate) return -1;
        var taken = b.spawns[0];
        mate.dead = false; mate.x = taken.x; mate.y = taken.y - 40;
        var bad = 0;
        for (var i=0;i<200;i++){ var p = pickSpawnPad(b, me); if (p === taken) bad++; }
        return bad;
      })()`);
    expect(landedOnMate, 'never drops you onto an occupied pad').toBe(0);
  });
});

describe('the AI can climb the arena', () => {
  // The cross makes this map far more vertical than the one it replaced, so an AI that cannot gain
  // height cannot reach an opponent. Measured baseline before this work: ~911px average with one
  // run of 6 managing only 347. Guarded well under what it now does so ordinary noise cannot fail
  // it, but high enough to catch the two bugs that were found here — navUp aiming at ledges beyond
  // a double jump, and navUp treating a SOLID directly overhead as a step and jumping into its
  // underside on a loop.
  it('gains real height when its target is above it', () => {
    const { window: w } = loadMonolith();
    const gained = w.eval(`
      (function(){
        SETTINGS.mode='teams'; SETTINGS.teamKey='2v2'; SETTINGS.count=4;
        SETTINGS.itemRate=0; SETTINGS.stocks=99; beginMatchNow();
        var floorY = worldPlats[0].y, c = fighters[0];
        c.controller='ai'; c.you=false; c.x=WW*0.18; c.y=floorY-60; c.vx=0; c.vy=0;
        // Everyone else parked high and inert, so the only sensible move is UP.
        for (var i=1;i<fighters.length;i++){
          fighters[i].x = WW*0.22 + i*40; fighters[i].y = WH*0.12;
          fighters[i].controller='still'; fighters[i].invuln=999999;
        }
        var start = c.y, best = c.y;
        for (var k=0;k<900;k++){ step(); if (c.dead) break; if (c.y < best) best = c.y; }
        running = false;
        return Math.round(start - best);
      })()`);
    expect(gained, 'the AI barely left the floor').toBeGreaterThan(700);
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
