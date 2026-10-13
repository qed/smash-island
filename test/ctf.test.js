import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// CAPTURE THE FLAG: the rules of the mode, on the real game (the castle map, every fighter standing still so only what the test does happens).
// Five a side, one flag each. A KO on your own side is a trip home; on the enemy side it is a trip to their jail, and a teammate at the jail
// door frees everyone in it. The jail's own team cannot enter the zone round it. A carrier drops the flag when KO'd. The match has no clock:
// only carrying all five of the other side's flags home ends it.

function start(w, map = 'castle') {
  w.eval(`CTF.skipNav=true; SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='${map}'; beginMatchNow();
          fighters.forEach(function(f){ f.controller='still'; f.you=false; }); ctfEndHide(CTF.live);`);
}
const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
// a fighter of team t, the k-th of that side
const mate = (w, t, k = 0) => w.eval(`fighters.filter(function(f){ return f.team===${t}; })[${k}].idx`);
const step = (w, n = 1) => { for (let i = 0; i < n; i++) w.eval('step()'); };
// the match logic alone (no physics, no fighters' own moves): cheap enough to run for a very long match
const logic = (w, n) => w.eval(`(function(){ for (var i=0;i<${n};i++){ ctfStep(); ctfCheckWin(); } })()`);
// put fighter i on the floor at (x, y) standing, where nothing else is going on
const put = (w, i, x, y) => w.eval(`(function(){ var f=fighters[${i}]; f.x=${x}; f.y=${y}-f.r; f.vx=0; f.vy=0; f.invuln=0; })()`);
// the castle: the surface is at 4320, the cellar floor (the jail) at 5520
const GY = 4320, CAVE = 5520;
const flagOf = (w, team, k = 0) => w.eval(`CTF.live.flags.filter(function(f){ return f.team===${team}; })[${k}].id`);

describe('capture the flag', () => {
  it('is five a side, one flag each, hiding first', () => {
    const { window: w } = loadMonolith(1);
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=10; beginMatchNow();`);
    expect(J(w, `fighters.map(function(f){return f.team;}).sort().join('')`)).toBe('0000011111');
    expect(w.eval('CTF.live.flags.length')).toBe(10);
    expect(w.eval('CTF.live.phase')).toBe('hide');
    expect(w.eval('isBig()')).toBe(true);
  });

  it('Space puts your flag down, C says done, and the hiding phase ends when the human is done', () => {
    const { window: w } = loadMonolith(11);
    w.eval(`CTF.skipNav=true; SETTINGS.mode='ctf'; SETTINGS.count=10; CTF.forceMap='castle'; beginMatchNow();`);
    expect(w.eval('DEFAULT_KEYS.flag')).toBe('Space');
    expect(w.eval('fighters[0].controller')).toBe('local');
    w.eval(`down[KEYS.flag]=true;`); step(w, 2); w.eval(`down[KEYS.flag]=false;`); step(w, 2);
    expect(w.eval('CTF.live.flags[0].st'), 'put down where she stands').toBe(1);
    expect(w.eval('CTF.live.phase')).toBe('hide');
    w.eval(`down[KEYS.special]=true;`); step(w, 2); w.eval(`down[KEYS.special]=false;`); step(w, 2);
    expect(w.eval('CTF.live.phase'), 'one human, and done: the phase is over').toBe('play');
  });

  it('everyone moves 1.5x as fast in this mode, a carrier a little slower, other modes as before', () => {
    const { window: w } = loadMonolith(12);
    start(w);
    expect(w.eval('ctfSpeedK(fighters[0])')).toBe(1.5);
    w.eval('fighters[0]._cf = 3');
    expect(w.eval('ctfSpeedK(fighters[0])')).toBeCloseTo(1.5 * w.eval('CTF_CARRY_SPEED'), 5);
    w.eval(`SETTINGS.mode='ffa'`);
    expect(w.eval('ctfSpeedK(fighters[0])')).toBe(1);
    w.eval(`SETTINGS.mode='ctf'; fighters[0]._cf = -1; fighters[0].controller='local'; fighters[0].x=3000; fighters[0].y=${GY}-24; fighters[0].vx=0; down[KEYS.right]=true;`);
    step(w, 40);
    w.eval('down[KEYS.right]=false');
    expect(w.eval('fighters[0].vx')).toBeGreaterThan(w.eval('MAXVX') * 1.2);   // past the old top speed
  });

  it('the areas do what they look like: ice, water, wind, belt, spring, thin air', () => {
    const { window: w } = loadMonolith(13);
    start(w);
    const zone = type => J(w, `worldZones.filter(function(z){ return z.type==='${type}'; })[0]`);
    const into = (z, vx) => w.eval(`(function(){ var f=fighters[0]; f.controller='still'; f.x=${z.x + z.w / 2}; f.y=${z.y + z.h - 30}; f.vx=${vx || 0}; f.vy=0; f.iceUntil=0; f._floatT=0; f._springT=0; return 1; })()`);
    let z = zone('ice'); into(z); step(w, 2);
    expect(w.eval('fighters[0].iceUntil'), 'ice: low friction').toBeGreaterThan(0);
    z = zone('water'); into(z, 8); step(w, 1);
    expect(w.eval('fighters[0].vx'), 'water drags').toBeLessThan(8);
    z = zone('wind'); into(z, 0); step(w, 3);
    expect(Math.sign(w.eval('fighters[0].vx')), 'wind pushes the way it points').toBe(z.dir);
    z = zone('spring'); into(z); step(w, 3);
    expect(w.eval('fighters[0].vy'), 'spring throws you up').toBeLessThan(-8);
    z = zone('float'); into(z); step(w, 2);
    expect(w.eval('fighters[0]._floatT'), 'thin air').toBeGreaterThan(0);
    // the right side mirrors: a wind toward the middle on the left blows toward the middle on the right
    const winds = J(w, `worldZones.filter(function(z){ return z.type==='wind'; }).map(function(z){ return [z.x + z.w/2 < 14400, z.dir]; })`);
    expect(winds.find(q => q[0])[1]).toBe(-winds.find(q => !q[0])[1]);
    // and a dark area is only a picture
    expect(w.eval(`worldZones.some(function(z){ return z.type==='dark'; })`)).toBe(false);
    expect(w.eval(`CTF.map.zones.some(function(z){ return z.type==='dark'; })`)).toBe(true);
  });

  it('2 to 8 a side: the team size is the number of flags that wins, and every fighter has a flag', () => {
    const { window: w } = loadMonolith(15);
    w.eval(`CTF.skipNav=true; SETTINGS.mode='ctf'; SETTINGS.count=4; CTF.forceMap='castle'; beginMatchNow();`);
    expect(w.eval('fighters.length')).toBe(4);
    expect(w.eval('CTF.live.n')).toBe(2);
    expect(w.eval('CTF.live.flags.length')).toBe(4);
    expect(J(w, `fighters.map(function(f){return f.team;}).sort().join('')`)).toBe('0011');
    w.eval(`SETTINGS.count=16; beginMatchNow();`);
    expect(w.eval('CTF.live.n')).toBe(8);
    expect(J(w, `fighters.map(function(f){return f.team;}).sort().join('')`)).toBe('0000000011111111');
  });

  it('a flag its own side drops is picked up by that side and hidden again; the other side cannot see it any more', () => {
    const { window: w } = loadMonolith(16);
    start(w);
    const a = mate(w, 0), b = mate(w, 1), fl = flagOf(w, 1), f = J(w, `CTF.live.flags[${fl}]`);
    put(w, a, f.x, f.y); step(w, 2);
    w.eval(`CTF.live.seen[0][${fl}]=true`);
    w.eval(`ctfDropFlag(fighters[${a}], 'hit')`);
    expect(w.eval(`CTF.live.flags[${fl}].st`), 'lying where it fell').toBe(3);
    put(w, b, w.eval(`CTF.live.flags[${fl}].x`), w.eval(`CTF.live.flags[${fl}].y`)); step(w, 40);
    expect(w.eval(`CTF.live.flags[${fl}].st`), 'its own side picked it up').toBe(2);
    expect(w.eval(`fighters[${b}]._cf`)).toBe(fl);
    // not a capture, even across the line (it is their own flag)
    put(w, b, 20000, GY); step(w, 2);
    expect(w.eval('CTF.live.score[1]')).toBe(0);
    // the flag key puts it down somewhere new on its side
    put(w, b, 24000, GY); w.eval(`CTF.skipNav=false`);
    w.eval(`ctfAiReachable = function(){ return true; }`);
    w.eval(`down[KEYS.flag]=false; fighters[${b}].controller='local'; down[KEYS.flag]=true;`); step(w, 2); w.eval(`down[KEYS.flag]=false`); step(w, 2);
    expect(w.eval(`CTF.live.flags[${fl}].st`), 'hidden again').toBe(1);
    expect(w.eval(`Math.abs(CTF.live.flags[${fl}].hx - ${f.x})`), 'somewhere new').toBeGreaterThan(200);
    expect(w.eval(`CTF.live.seen[0][${fl}]`), 'and the other side has lost sight of it').toBe(false);
  });

  it('a ghost is invisible to the other side; a shield takes the hit that would have jailed you', () => {
    const { window: w } = loadMonolith(17);
    start(w);
    const a = mate(w, 0);
    w.eval(`fighters[${a}]._ghostT=100; fighters[${a}].you=false; fighters[${mate(w, 1)}].you=true`);
    expect(w.eval(`ctfHiddenFrom(fighters[${a}])`), 'hidden from the other side').toBe(true);
    w.eval(`fighters[${a}].you=true; fighters[${mate(w, 1)}].you=false`);
    expect(w.eval(`ctfHiddenFrom(fighters[${a}])`), 'not from its own').toBe(false);
    const t = w.eval('ctfJailThreshold(CTF.live.n)');
    put(w, a, 20000, GY); w.eval(`fighters[${a}]._shield=1; fighters[${a}].pct=${t + 5}`); logic(w, 2);
    expect(w.eval(`fighters[${a}]._jail`), 'the shield took it').toBe(null);
    expect(w.eval(`fighters[${a}]._shield`)).toBe(0);
    w.eval(`fighters[${a}].pct=${t + 5}`); logic(w, 2);
    expect(w.eval(`fighters[${a}]._jail`), 'once only').toBe(1);
  });

  it('a capture scores', () => {
    const { window: w } = loadMonolith(2);
    start(w);
    const a = mate(w, 0), fl = flagOf(w, 1);
    const f = J(w, `CTF.live.flags[${fl}]`);
    put(w, a, f.x, f.y);                                   // team 0 touches one of team 1's flags
    step(w, 2);
    expect(w.eval(`CTF.live.flags[${fl}].st`), 'picked up').toBe(2);
    expect(w.eval(`fighters[${a}]._cf`)).toBe(fl);
    put(w, a, 14400 + 300, GY); step(w, 2);                // still on the enemy side of the middle line: not captured
    expect(w.eval('CTF.live.score[0]')).toBe(0);
    put(w, a, 14400 - 300, GY);                            // ...and across the line, onto its own side: captured
    step(w, 2);
    expect(w.eval('CTF.live.score[0]')).toBe(1);
    expect(w.eval(`CTF.live.flags[${fl}].st`), 'captured').toBe(4);
    expect(w.eval(`fighters[${a}]._cf`)).toBe(-1);
  });

  it('a carrier KO\'d drops the flag, and its own team touching it sends it home', () => {
    const { window: w } = loadMonolith(3);
    start(w);
    const a = mate(w, 0), b = mate(w, 1), fl = flagOf(w, 1);
    const f = J(w, `CTF.live.flags[${fl}]`);
    put(w, a, f.x, f.y); step(w, 2);
    expect(w.eval(`fighters[${a}]._cf`)).toBe(fl);
    // KO'd where it was picked up, in the enemy's country: it drops the flag there (and goes to their jail)
    step(w, 1);
    w.eval(`eliminate(fighters[${a}])`);
    expect(w.eval(`CTF.live.flags[${fl}].st`), 'dropped').toBe(3);
    expect(w.eval(`fighters[${a}]._cf`)).toBe(-1);
    // the flag's own team walks over it
    put(w, b, w.eval(`CTF.live.flags[${fl}].x`), w.eval(`CTF.live.flags[${fl}].y`)); step(w, 40);
    expect(w.eval(`CTF.live.flags[${fl}].st`), 'its own side picked it up (to hide it again)').toBe(2);
    expect(w.eval(`fighters[${b}]._cf`)).toBe(fl);
  });

  it('a hit launching a carrier fast drops the flag; a light one does not', () => {
    const { window: w } = loadMonolith(4);
    start(w);
    const a = mate(w, 0), fl = flagOf(w, 1), f = J(w, `CTF.live.flags[${fl}]`);
    put(w, a, f.x, f.y); step(w, 2);
    w.eval(`fighters[${a}].vx=3; fighters[${a}].vy=-2; ctfBigHit(fighters[${a}], null)`);
    expect(w.eval(`CTF.live.flags[${fl}].st`)).toBe(2);
    w.eval(`fighters[${a}].vx=18; fighters[${a}].vy=-8; ctfBigHit(fighters[${a}], null)`);
    expect(w.eval(`CTF.live.flags[${fl}].st`)).toBe(3);
  });

  it('a KO on the enemy side is a trip to their jail, and a teammate at the door frees it', () => {
    const { window: w } = loadMonolith(5);
    start(w);
    const a = mate(w, 0), friend = mate(w, 0, 1);
    const j = J(w, 'CTF.map.jails[1]');   // team 1 owns the right jail: it holds team 0's fighters
    put(w, a, 20000, GY);
    w.eval(`eliminate(fighters[${a}])`);
    expect(w.eval(`fighters[${a}]._jail`), 'jailed by the right-hand side').toBe(1);
    const sl = J(w, `{x:fighters[${a}].x, y:fighters[${a}].y}`);
    expect(Math.abs(sl.x - j.door.x), 'inside the cell, by the door').toBeLessThan(900);
    step(w, 30);
    expect(w.eval(`fighters[${a}]._jail`), 'still inside').toBe(1);
    put(w, friend, j.door.x - 20, CAVE);   // a teammate touches the door
    step(w, 2);
    expect(w.eval(`fighters[${a}]._jail`), 'freed').toBe(null);
    expect(w.eval('CTF.live.jails[1].pris.length')).toBe(0);
    // a KO on your own side is a trip home instead
    put(w, a, 800, GY); w.eval(`eliminate(fighters[${a}])`);
    expect(w.eval(`fighters[${a}]._jail`)).toBe(null);
    expect(w.eval(`fighters[${a}].x`)).toBeLessThan(14400);
  });

  it('a prisoner stays until a teammate frees them; freed, they cannot be jailed again for a few seconds, and are quick', () => {
    const { window: w } = loadMonolith(6);
    start(w);
    const a = mate(w, 0), friend = mate(w, 0, 1), j = J(w, 'CTF.map.jails[1]');
    put(w, a, 20000, GY); w.eval(`eliminate(fighters[${a}])`);
    logic(w, 20000);
    expect(w.eval(`fighters[${a}]._jail`), 'still there, however long').toBe(1);
    put(w, friend, j.door.x - 20, CAVE); logic(w, 2);
    expect(w.eval(`fighters[${a}]._jail`)).toBe(null);
    expect(w.eval(`fighters[${a}]._ctfFree`)).toBeGreaterThan(100);
    expect(w.eval(`fighters[${a}]._hasteT`), 'a short speed boost').toBeGreaterThan(0);
    // a KO inside those seconds, on the enemy side, is a trip home and not a cell
    put(w, a, 20000, GY); w.eval(`eliminate(fighters[${a}])`);
    expect(w.eval(`fighters[${a}]._jail`)).toBe(null);
  });

  it('damage over the threshold on the enemy side is a cell too (higher in small teams); on your own side it is not', () => {
    const { window: w } = loadMonolith(14);
    start(w);
    expect(w.eval('ctfJailThreshold(2)')).toBe(120);
    expect(w.eval('ctfJailThreshold(5)')).toBe(90);
    expect(w.eval('ctfJailThreshold(8)')).toBe(60);
    const a = mate(w, 0), t = w.eval('ctfJailThreshold(CTF.live.n)');
    put(w, a, 800, GY); w.eval(`fighters[${a}].pct=${t + 5}`); logic(w, 2);
    expect(w.eval(`fighters[${a}]._jail`), 'on its own side: no cell').toBe(null);
    put(w, a, 20000, GY); w.eval(`fighters[${a}].pct=${t - 5}`); logic(w, 2);
    expect(w.eval(`fighters[${a}]._jail`), 'under the threshold').toBe(null);
    w.eval(`fighters[${a}].pct=${t + 5}`); logic(w, 2);
    expect(w.eval(`fighters[${a}]._jail`), 'over it, in the enemy country').toBe(1);
  });

  it('the no-go zone pushes the jail\'s own team out, and never hurts them', () => {
    const { window: w } = loadMonolith(7);
    start(w);
    const owner = mate(w, 1), j = J(w, 'CTF.map.jails[1]'), z = j.zone;
    put(w, owner, z.x + 300, CAVE);
    const pct0 = w.eval(`fighters[${owner}].pct`);
    step(w, 600);
    const x = w.eval(`fighters[${owner}].x`);
    expect(x < z.x || x > z.x + z.w, 'walked out of the zone').toBe(true);
    expect(w.eval(`fighters[${owner}].pct`)).toBe(pct0);
    // the other side may stand there
    const foe = mate(w, 0);
    put(w, foe, z.x + z.w / 2, CAVE); step(w, 60);
    const fx = w.eval(`fighters[${foe}].x`);
    expect(Math.abs(fx - (z.x + z.w / 2))).toBeLessThan(50);
  });

  it('a key opens its door for its team only, goes back where it lay, and a KO\'d holder drops it', () => {
    const { window: w } = loadMonolith(8);
    start(w);
    const k = J(w, `CTF.live.keys.filter(function(k){ return k.door==='1r'; })[0]`);
    const holder = mate(w, 0);
    put(w, holder, k.x, k.y); step(w, 2);
    expect(w.eval(`fighters[${holder}]._ck`)).toBe(k.i);
    expect(w.eval(`CTF.live.doors.filter(function(d){ return d.id==='1r'; })[0].op[0]`)).toBe(false);
    put(w, holder, 1000, GY); w.eval(`eliminate(fighters[${holder}])`);
    expect(w.eval(`CTF.live.keys[${k.i}].st`), 'dropped where it fell').toBe(0);
    // pick it up again and take it to its door
    const d = J(w, `CTF.live.doors.filter(function(d){ return d.id==='1r'; })[0]`);
    w.eval(`CTF.live.keys[${k.i}].lockT=0`);
    const kk = J(w, `CTF.live.keys[${k.i}]`);
    put(w, holder, kk.x, kk.y); step(w, 70);
    expect(w.eval(`fighters[${holder}]._ck`)).toBe(k.i);
    put(w, holder, d.x - 50, d.y + d.h); step(w, 2);
    expect(w.eval(`CTF.live.doors.filter(function(d){ return d.id==='1r'; })[0].op[0]`), 'open for the key\'s team').toBe(true);
    expect(w.eval(`CTF.live.doors.filter(function(d){ return d.id==='1r'; })[0].op[1]`), 'and not for the other').toBe(false);
    expect(w.eval(`CTF.live.keys[${k.i}].st`), 'back where it lay').toBe(0);
    expect(w.eval(`Math.round(CTF.live.keys[${k.i}].x)`)).toBe(Math.round(k.hx));
  });

  it('a whole side in jail at once is over: the other side wins', () => {
    const { window: w } = loadMonolith(10);
    start(w);
    for (let k = 0; k < 5; k++) {
      const a = mate(w, 0, k);
      put(w, a, 20000, GY); w.eval(`eliminate(fighters[${a}])`);
      expect(w.eval(`fighters[${a}]._jail`)).toBe(1);
      logic(w, 1);
      expect(w.eval('CTF.live.over'), 'after ' + (k + 1) + ' in jail').toBe(k === 4);
    }
    expect(w.eval('CTF.live.winner')).toBe(1);
    expect(w.eval('CTF.live.why')).toBe('jail');
  });

  it('only capturing all five ends the match: no clock', () => {
    const { window: w } = loadMonolith(9);
    start(w);
    logic(w, 40000);                                      // far longer than any match clock there could have been (and no capture came of it)
    expect(w.eval('running')).toBe(true);
    expect(w.eval('CTF.live.over')).toBe(false);
    for (let n = 0; n < 5; n++) {
      const a = mate(w, 0, n % 5), fl = flagOf(w, 1, n), f = J(w, `CTF.live.flags[${fl}]`);
      put(w, a, f.x, f.y); step(w, 2);
      put(w, a, 14400 - 300, GY); step(w, 2);
      expect(w.eval('CTF.live.score[0]')).toBe(n + 1);
      expect(w.eval('CTF.live.over')).toBe(n === 4);
    }
    expect(w.eval('running')).toBe(false);
    expect(w.eval('CTF.live.winner')).toBe(0);
  });
});
