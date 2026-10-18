import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// TEAMS CPU: THE FLANKER THAT PACED, AND THE SWINGS THAT COULD NOT LAND (playtest, 2026-10-18).
//
// 1. A flanker (the odd slot of a team, see teamSlotOf) far ABOVE its target paced the cross's top arm for 100 s: the flank branch
//    walked it toward the target's x, the drop logic walked it back toward the doorway, and round again. Behind that, the drop logic
//    could not use a doorway in the arm at all: the arm's faces are solid, so a fighter has to walk off the lip, and it stopped 14 px
//    out, still standing on it, and hopped in place; in the air the far-travel branch hopped it back on toward the target. Now the
//    flank stops when the target is far below, and on the teams arena the drop walks off a solid lip and falls through.
// 2. Nothing lands on a fighter in its own safe zone, or from one (applyHit). CPUs picked foes standing at home and swung from inside
//    their own zone: three of them traded blows in one zone for 35 s and only the intruder's bleed moved a number. Now a CPU picks a
//    foe out in the open while there is one, and a CPU in its own zone walks out before it swings.
//
// The arena is the corner-pocket cross (four teams: 2v2v1v1, as in the playtest's six-fighter matches). Teams 0-3 own the upper-left,
// upper-right, lower-left and lower-right pockets. Fighters not in a scene are taken out of the match.

const SETUP = `SETTINGS.mode='teams'; SETTINGS.teamKey='2v2v1v1'; SETTINGS.count=6; SETTINGS.stocks=3; SETTINGS.itemRate=0; running=true;
  beginMatchNow();
  fighters.forEach(function(f){ f.controller='ai'; f.you=false; f.pct=0; f.invuln=0; });
  var gone = function(o){ o.controller='still'; o.dead=true; o.stocks=0; o.x=-5000; o.y=-5000; };
  var ofTeam = function(t){ return fighters.filter(function(o){ return o.team===t; }); };`;

describe('the flanker far above its target', () => {
  it('takes the doorway down instead of pacing the arm', () => {
    const { window: w } = loadMonolith(7);
    const r = JSON.parse(w.eval(`(function(){ ${SETUP}
      var f = ofTeam(1)[1], t = ofTeam(2)[0];             // team 1's flanker; a foe whose own pocket is far away (lower left)
      fighters.forEach(function(o){ if(o!==f && o!==t) gone(o); });
      // On the top face of the cross's right arm, 260 px from the target's x: past FLANK_X, so the flank branch wanted it; the nearer
      // lip of its face (the doorway it has to drop through) is on the far side from the target, which is what made it pace.
      var top = worldPlats.filter(function(p){ return p.wall && p.w > p.h && p.x < 4560 && p.x + p.w > 4560; }).sort(function(a,b){ return a.y-b.y; })[0];
      var low = worldPlats.filter(function(p){ return p.wall && p.w > p.h && p.x === top.x && p.y > top.y; })[0];
      f.x = 4560; f.y = top.y - f.r; f.vx = 0; f.vy = 0; f.onground = true;
      var ty = floors[0].y - t.r; t.controller = 'still';
      var pin = function(){ t.x = 4300; t.y = ty; t.vx = 0; t.vy = 0; };
      pin(); f.aiTarget = t; f.aiTimer = 999;
      var r = { slot: teamSlotOf(f), dy: ty - f.y, lipRight: (top.x + top.w) > f.x && (top.x + top.w) - f.x < f.x - top.x, below: -1, floor: -1, tHome: inOwnTeamZone(t) };
      for (var i=0;i<480;i++){
        step(); pin();
        if (r.below < 0 && f.y > low.y + low.h + f.r) r.below = i;
        if (r.floor < 0 && f.y > floors[0].y - f.r - 40) r.floor = i;
        if (r.floor >= 0 && i > r.floor + 60) break;      // down, and a second on the floor
      }
      r.endDx = Math.abs(f.x - t.x); r.endDy = Math.abs(f.y - t.y);
      return JSON.stringify(r);
    })()`));
    expect(r.slot, 'a flanker').toBe(1);
    expect(r.tHome, 'the target is out in the open').toBe(false);
    expect(r.dy, 'its target is far below').toBeGreaterThan(1000);
    expect(r.lipRight, 'the doorway is on the far side from the target').toBe(true);
    expect(r.below, 'it got through the arm (it used to pace the top face for good)').toBeGreaterThanOrEqual(0);
    expect(r.floor, 'and down to the target\'s floor within 8 s').toBeGreaterThanOrEqual(0);
    expect(r.endDy, 'on its level at the end').toBeLessThan(80);
  });
});

describe('safe zones and the CPU', () => {
  it('picks a foe out in the open over a nearer one standing in its own zone, and drops a target that goes home', () => {
    const { window: w } = loadMonolith(7);
    const r = JSON.parse(w.eval(`(function(){ ${SETUP}
      var f = ofTeam(2)[0], a = ofTeam(1)[0], b = ofTeam(3)[0];
      fighters.forEach(function(o){ if(o!==f && o!==a && o!==b) gone(o); });
      var za = teamZoneOf(1), y = za.y + za.h/2;
      f.x = za.x - 150; f.y = y;                          // just outside team 1's pocket
      a.x = za.x + 100; a.y = y;                          // 250 px away, home in its own zone
      b.x = za.x - 700; b.y = y;                          // 550 px away, out in the open
      var pick = function(timer){ if (timer === 0) f.aiTarget = null; f.aiTimer = timer; aiThink(f); return f.aiTarget && f.aiTarget.name; };
      var r = { names: [a.name, b.name], home: [inOwnTeamZone(a), inOwnTeamZone(b), inOwnTeamZone(f)] };
      r.fresh = pick(0);
      a.x = za.x - 60; r.aOut = pick(0);                  // a steps out, nearest and in the open
      a.x = za.x + 100; r.aBack = pick(999);              // ...and goes home again: dropped at once, whatever the timer says
      var zb = teamZoneOf(3); b.x = zb.x + zb.w/2; b.y = zb.y + zb.h/2;
      r.bHome = inOwnTeamZone(b); r.allHome = pick(0);    // every foe at home: it still takes the nearest
      return JSON.stringify(r);
    })()`));
    const [A, B] = r.names;
    expect(r.home, 'a is home, b and the CPU are not').toEqual([true, false, false]);
    expect(r.fresh, 'the open foe, not the nearer one at home').toBe(B);
    expect(r.aOut, 'a, once it steps out').toBe(A);
    expect(r.aBack, 'not a, once it is home again').toBe(B);
    expect(r.bHome).toBe(true);
    expect(r.allHome, 'with nobody in the open it still picks someone').toBe(A);
  });

  it('a CPU in its own zone walks out to fight an intruder instead of swinging where nothing lands', () => {
    const { window: w } = loadMonolith(7);
    const r = JSON.parse(w.eval(`(function(){ ${SETUP}
      var home = ofTeam(1), intr = ofTeam(3)[0];
      fighters.forEach(function(o){ if(home.indexOf(o)<0 && o!==intr) gone(o); });
      var b = bases.find(function(q){ return q.team===1; });
      // both on their home ledge, deep in their pocket, with the intruder between them
      home[0].x = b.x + b.w*0.35; home[1].x = b.x + b.w*0.65; intr.x = b.x + b.w*0.5;
      [home[0], home[1], intr].forEach(function(o){ o.y = b.y - o.r; o.vx = 0; o.vy = 0; o.onground = true; o.aiTarget = null; o.aiTimer = 0; });
      var r = { start: home.map(inOwnTeamZone).concat([inOwnTeamZone(intr)]), swings: 0, inZone: [0, 0], longest: [0, 0] }, run = [0, 0];
      var think = window.aiThink;
      window.aiThink = function(g){ var q = think.apply(this, arguments); g.__inp = q; return q; };
      try {
        for (var i=0;i<900;i++){
          step();
          for (var k=0;k<2;k++){
            var h = home[k], z = !h.dead && inOwnTeamZone(h);
            if (z && h.__inp && (h.__inp.attack || h.__inp.special || h.__inp.smash)) r.swings++;
            if (i < 60) continue;                         // a second to get going
            if (z){ r.inZone[k]++; run[k]++; r.longest[k] = Math.max(r.longest[k], run[k]); } else run[k] = 0;
          }
        }
      } finally { window.aiThink = think; }
      return JSON.stringify(r);
    })()`));
    expect(r.start, 'the two at home, the intruder not').toEqual([true, true, false]);
    // Measured before the fix: 267 frames of swinging inside the zone, 726 and 669 of the 840 frames at home, the longest stay 554.
    expect(r.swings, 'hardly a swing thrown from inside its own zone').toBeLessThan(30);
    for (const k of [0, 1]) expect(r.inZone[k], `CPU ${k} spends most of the fight out of its zone`).toBeLessThan(420);
    expect(Math.max(...r.longest), 'no long stay at home').toBeLessThan(240);
  });

  // Review, 2026-10-18: the walk-out ran BEFORE danger mode, so a CPU at kill percent that had backed into its zone was walked
  // straight back out at the fresh foe it was running from, then danger mode sent it in again. Two teams (side-wall zones), a CPU
  // at 140% in its zone 40 px from the edge, a foe at 0% 160 px outside. Before the walk-out these seeds kept the stock for the
  // whole 600 frames, crossing the edge once; with it they lost it at frames 27 and 28.
  it('a CPU at kill percent in its own zone is not walked back out at the foe it is backing off from', () => {
    for (const seed of [2, 6]) {
      const { window: w } = loadMonolith(seed);
      const r = JSON.parse(w.eval(`(function(){
        SETTINGS.mode='teams'; SETTINGS.teamKey='2v2'; SETTINGS.count=4; SETTINGS.stocks=3; SETTINGS.itemRate=0; running=true;
        beginMatchNow();
        fighters.forEach(function(o){ o.controller='ai'; o.you=false; o.pct=0; o.invuln=0; });
        var z0 = teamZoneOf(0), home = z0.x < WW/2 ? 0 : 1, z = teamZoneOf(home);
        var f = fighters.find(function(o){ return o.team===home; }), e = fighters.find(function(o){ return o.team!==home; });
        fighters.forEach(function(o){ if(o!==f && o!==e){ o.controller='still'; o.dead=true; o.stocks=0; o.x=-5000; o.y=-5000; } });
        var gy = floors[0].y;
        f.x = z.x + z.w - 40; f.y = gy - f.r; f.pct = 140;
        e.x = z.x + z.w + 160; e.y = gy - e.r; e.pct = 0;
        [f, e].forEach(function(o){ o.vx = 0; o.vy = 0; o.onground = true; o.aiTarget = null; o.aiTimer = 0; });
        lastKoFrame = hazardT;
        var r = { start: inOwnTeamZone(f), lost: false, cross: 0 }, prev = r.start;
        for (var i=0;i<90;i++){
          step();
          if (f.dead || f.stocks < 3){ r.lost = true; break; }
          var now = inOwnTeamZone(f); if (now !== prev) r.cross++; prev = now;
        }
        return JSON.stringify(r);
      })()`));
      expect(r.start, `seed ${seed}: it starts at home`).toBe(true);
      expect(r.lost, `seed ${seed}: it keeps the stock for 1.5 s`).toBe(false);
      expect(r.cross, `seed ${seed}: no shuttling across the edge`).toBeLessThanOrEqual(2);
    }
  });
});
