import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// CAPTURE THE FLAG: the rules of the mode, on the real game (the castle map, every fighter standing still so only what the test does happens).
// 2 to 8 a side, one flag each. A KO on your own side is a trip home; on the enemy side (or damage over a threshold there) it is a trip to their jail,
// and a teammate at the jail door frees everyone in it. The jail's own team cannot enter the zone round it. A carrier drops the flag when KO'd, and a
// flag is captured by carrying it across the middle line. The match has no clock.

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
const flagOf = (w, team, k = 0) => w.eval(`CTF.live.flags.filter(function(f){ return f.team===${team}; })[${k}].id`);
// where things are on this map: a standing place on each side (the spawn of each home), the middle line, the floor in front of a jail's door
const spawn = (w, t) => J(w, `{ x:CTF.map.homes[${t}].spawns[0].x, y:CTF.map.homes[${t}].spawns[0].y }`);
const MID = 13200;   // the middle line of the castle (110 columns a side)
const cellFloor = (w, owner) => { const j = J(w, `CTF.map.jails[${owner}]`); return j.door.y + j.door.h; };

describe('capture the flag', () => {
  it('is five a side, one flag each, hiding first', () => {
    const { window: w } = loadMonolith(1);
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=10; beginMatchNow();`);
    expect(J(w, `fighters.map(function(f){return f.team;}).sort().join('')`)).toBe('0000011111');
    expect(w.eval('CTF.live.flags.length')).toBe(10);
    expect(w.eval('CTF.live.phase')).toBe('hide');
    expect(w.eval('isBig()')).toBe(true);
    expect(w.eval('CAM_ZOOM'), 'the rooms are drawn closer').toBeGreaterThan(0.72);
    expect(w.eval('WW'), 'the castle: 110 columns a side').toBe(26400);
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
    const sp = spawn(w, 0);
    w.eval(`SETTINGS.mode='ctf'; fighters[0]._cf = -1; fighters[0].controller='local'; fighters[0].x=${sp.x}; fighters[0].y=${sp.y}-24; fighters[0].vx=0; down[KEYS.right]=true;`);
    step(w, 25);
    w.eval('down[KEYS.right]=false');
    expect(w.eval('fighters[0].vx')).toBeGreaterThan(w.eval('MAXVX') * 1.2);   // past the old top speed
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

  it('a capture scores only across the middle line', () => {
    const { window: w } = loadMonolith(2);
    start(w);
    const a = mate(w, 0), fl = flagOf(w, 1), own = spawn(w, 0), foe = spawn(w, 1);
    const f = J(w, `CTF.live.flags[${fl}]`);
    put(w, a, f.x, f.y);                                   // team 0 touches one of team 1's flags
    step(w, 2);
    expect(w.eval(`CTF.live.flags[${fl}].st`), 'picked up').toBe(2);
    expect(w.eval(`fighters[${a}]._cf`)).toBe(fl);
    put(w, a, MID + 300, foe.y); step(w, 2);               // still on the enemy side of the line: not captured
    expect(w.eval('CTF.live.score[0]')).toBe(0);
    put(w, a, MID - 300, own.y);                           // ...and across the line, onto its own side: captured
    step(w, 2);
    expect(w.eval('CTF.live.score[0]')).toBe(1);
    expect(w.eval(`CTF.live.flags[${fl}].st`), 'captured').toBe(4);
    expect(w.eval(`fighters[${a}]._cf`)).toBe(-1);
  });

  it('a carrier KO\'d drops the flag, and its own side picks it up to hide it again', () => {
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
    const a = mate(w, 0), friend = mate(w, 0, 1), foe = spawn(w, 1), own = spawn(w, 0);
    const j = J(w, 'CTF.map.jails[1]');   // team 1 owns the right jail: it holds team 0's fighters
    put(w, a, foe.x, foe.y);
    w.eval(`eliminate(fighters[${a}])`);
    expect(w.eval(`fighters[${a}]._jail`), 'jailed by the right-hand side').toBe(1);
    const sl = J(w, `{x:fighters[${a}].x, y:fighters[${a}].y}`);
    expect(Math.abs(sl.x - j.door.x), 'inside the cell, by the door').toBeLessThan(900);
    step(w, 30);
    expect(w.eval(`fighters[${a}]._jail`), 'still inside').toBe(1);
    put(w, friend, j.door.x - 20, cellFloor(w, 1));   // a teammate holds the door
    step(w, 135);
    expect(w.eval(`fighters[${a}]._jail`), 'freed').toBe(null);
    expect(w.eval('CTF.live.jails[1].pris.length')).toBe(0);
    // a KO on your own side is a trip home instead
    put(w, a, own.x, own.y); w.eval(`eliminate(fighters[${a}])`);
    expect(w.eval(`fighters[${a}]._jail`)).toBe(null);
    expect(w.eval(`fighters[${a}].x`)).toBeLessThan(MID);
  });

  it('a prisoner is let out after 90 s, home to its own base, with a fresh key and the short grace but no speed boost; the ring on its head runs down; a rescue before then still works', () => {
    const { window: w } = loadMonolith(38);
    start(w);
    const a = mate(w, 0), foe = spawn(w, 1);
    put(w, a, foe.x, foe.y); w.eval(`eliminate(fighters[${a}]); fighters[${a}]._pk = false`);
    expect(w.eval(`fighters[${a}]._jail`)).toBe(1);
    logic(w, 2700);
    expect(w.eval(`fighters[${a}]._jailT`), 'the timer runs').toBe(2700);
    logic(w, 2600);
    expect(w.eval(`fighters[${a}]._jail`), 'not yet at 89 s').toBe(1);
    logic(w, 120);
    expect(w.eval(`fighters[${a}]._jail`), 'let out at 90 s').toBe(null);
    expect(w.eval(`fighters[${a}].x < CTF.map.WW/2`), 'home, on its own side').toBe(true);
    expect(w.eval(`CTF.live.jails[1].pris.length`), 'the cell is empty').toBe(0);
    expect(w.eval(`fighters[${a}]._ctfFree`), 'the short grace').toBeGreaterThan(100);
    expect(w.eval(`fighters[${a}]._hasteT || 0`), 'no speed boost: that is the rescue reward').toBe(0);
    expect(w.eval(`fighters[${a}]._pk`), 'a fresh personal key').toBe(true);
  });

  it('a prisoner stays until a teammate frees them; freed, they cannot be jailed again for a few seconds, and are quick', () => {
    const { window: w } = loadMonolith(6);
    start(w);
    const a = mate(w, 0), friend = mate(w, 0, 1), j = J(w, 'CTF.map.jails[1]'), foe = spawn(w, 1);
    put(w, a, foe.x, foe.y); w.eval(`eliminate(fighters[${a}])`);
    logic(w, 5000);
    expect(w.eval(`fighters[${a}]._jail`), 'still there well into the 90 s').toBe(1);
    put(w, friend, j.door.x - 20, cellFloor(w, 1)); logic(w, 125);
    expect(w.eval(`fighters[${a}]._jail`)).toBe(null);
    expect(w.eval(`fighters[${a}]._ctfFree`)).toBeGreaterThan(100);
    expect(w.eval(`fighters[${a}]._hasteT`), 'a short speed boost').toBeGreaterThan(0);
    // a KO inside those seconds, on the enemy side, is a trip home and not a cell
    put(w, a, foe.x, foe.y); w.eval(`eliminate(fighters[${a}])`);
    expect(w.eval(`fighters[${a}]._jail`)).toBe(null);
  });

  it('a rescue is a hold: 2 s at the door, unhit; a hit starts it again; after a jailbreak the door is locked for 15 s; the no-go zone is small and holds no spawn', () => {
    const { window: w } = loadMonolith(41);
    start(w);
    const a = mate(w, 0), b = mate(w, 0, 1), friend = mate(w, 0, 2), foe = spawn(w, 1), j = J(w, 'CTF.map.jails[1]');
    for (const t of [0, 1]) {
      const z = J(w, `CTF.map.jails[${t}].zone`), sp = J(w, `CTF.map.homes[${t}].spawns`);
      expect(z.w, 'about 520 px wide').toBeLessThan(700);
      expect(sp.some(s => s.x > z.x && s.x < z.x + z.w && s.y > z.y && s.y < z.y + z.h), 'no spawn in its own jail zone').toBe(false);
    }
    put(w, a, foe.x, foe.y); w.eval(`eliminate(fighters[${a}])`);
    expect(w.eval(`fighters[${a}]._jail`)).toBe(1);
    put(w, friend, j.door.x - 20, cellFloor(w, 1)); logic(w, 100);
    expect(w.eval(`fighters[${a}]._jail`), '100 steps is not enough').toBe(1);
    w.eval(`fighters[${friend}].pct += 5`); logic(w, 1); logic(w, 100);
    expect(w.eval(`fighters[${a}]._jail`), 'a hit started the count again').toBe(1);
    put(w, friend, j.door.x + 400, cellFloor(w, 1)); logic(w, 60);   // leaving the zone does too
    put(w, friend, j.door.x - 20, cellFloor(w, 1)); logic(w, 100);
    expect(w.eval(`fighters[${a}]._jail`)).toBe(1);
    logic(w, 30);
    expect(w.eval(`fighters[${a}]._jail`), '2 s unhit: free').toBe(null);
    // the lockdown: a second prisoner cannot be freed for 15 s
    put(w, b, foe.x, foe.y); w.eval(`eliminate(fighters[${b}])`);
    expect(w.eval(`fighters[${b}]._jail`)).toBe(1);
    logic(w, 400);
    expect(w.eval(`fighters[${b}]._jail`), 'locked down').toBe(1);
    expect(w.eval('CTF.live.jails[1].lock')).toBeGreaterThan(0);
    logic(w, 700);
    expect(w.eval(`fighters[${b}]._jail`), 'after the lockdown the hold goes on').toBe(null);
  });

  it('damage over the threshold on the enemy side is a cell too (higher in small teams); on your own side it is not', () => {
    const { window: w } = loadMonolith(14);
    start(w);
    expect(w.eval('ctfJailThreshold(2)')).toBe(120);
    expect(w.eval('ctfJailThreshold(5)')).toBe(90);
    expect(w.eval('ctfJailThreshold(8)')).toBe(60);
    const a = mate(w, 0), t = w.eval('ctfJailThreshold(CTF.live.n)'), own = spawn(w, 0), foe = spawn(w, 1);
    put(w, a, own.x, own.y); w.eval(`fighters[${a}].pct=${t + 5}`); logic(w, 2);
    expect(w.eval(`fighters[${a}]._jail`), 'on its own side: no cell').toBe(null);
    put(w, a, foe.x, foe.y); w.eval(`fighters[${a}].pct=${t - 5}`); logic(w, 2);
    expect(w.eval(`fighters[${a}]._jail`), 'under the threshold').toBe(null);
    w.eval(`fighters[${a}].pct=${t + 5}`); logic(w, 2);
    expect(w.eval(`fighters[${a}]._jail`), 'over it, in the enemy country').toBe(1);
  });

  it('the no-go zone pushes the jail\'s own team out, and never hurts them', () => {
    const { window: w } = loadMonolith(7);
    start(w);
    const owner = mate(w, 1), j = J(w, 'CTF.map.jails[1]'), z = j.zone, floor = cellFloor(w, 1);
    put(w, owner, z.x + 200, floor);
    const pct0 = w.eval(`fighters[${owner}].pct`);
    step(w, 900);
    const x = w.eval(`fighters[${owner}].x`), y = w.eval(`fighters[${owner}].y`);
    expect(x < z.x || x > z.x + z.w || y < z.y || y > z.y + z.h, 'out of the zone').toBe(true);
    expect(w.eval(`fighters[${owner}].pct`)).toBe(pct0);
    // the other side may stand there
    const foe = mate(w, 0);
    put(w, foe, z.x + z.w / 2, floor); step(w, 60);
    const fx = w.eval(`fighters[${foe}].x`);
    expect(Math.abs(fx - (z.x + z.w / 2))).toBeLessThan(120);
  });

  it('a key opens its door for its team only, goes back where it lay, and a KO\'d holder drops it', () => {
    const { window: w } = loadMonolith(8);
    start(w);
    const k = J(w, `CTF.live.keys.filter(function(k){ return k.door==='1r'; })[0]`);
    const holder = mate(w, 0), own = spawn(w, 0);
    put(w, holder, k.x, k.y); step(w, 2);
    expect(w.eval(`fighters[${holder}]._ck`)).toBe(k.i);
    expect(w.eval(`CTF.live.doors.filter(function(d){ return d.id==='1r'; })[0].op[0]`)).toBe(false);
    put(w, holder, own.x, own.y); w.eval(`eliminate(fighters[${holder}])`);
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

  it('a flag its own side drops is picked up by that side and hidden again; the other side loses sight of it', () => {
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
    const own1 = spawn(w, 1);
    put(w, b, own1.x, own1.y); step(w, 2);
    expect(w.eval('CTF.live.score[1]')).toBe(0);
    // the flag key puts it down somewhere new on its side
    const spot = J(w, `CTF.map.spots.filter(function(s){ return s.team===1 && Math.abs(s.x-${f.x})>700 && ctfHideValid(1, s.x, s.y); })[0]`);
    put(w, b, spot.x, spot.y);
    w.eval(`ctfAiReachable = function(){ return true; }; fighters[${b}].controller='local'; down[KEYS.flag]=true;`); step(w, 2); w.eval(`down[KEYS.flag]=false`); step(w, 2);
    expect(w.eval(`CTF.live.flags[${fl}].st`), 'hidden again').toBe(1);
    expect(w.eval(`Math.abs(CTF.live.flags[${fl}].hx - ${f.x})`), 'somewhere new').toBeGreaterThan(300);
    expect(w.eval(`CTF.live.seen[0][${fl}]`), 'and the other side has lost sight of it').toBe(false);
  });

  it('a ghost is invisible to the other side; a shield takes the hit that would have jailed you', () => {
    const { window: w } = loadMonolith(17);
    start(w);
    const a = mate(w, 0), foe = spawn(w, 1);
    w.eval(`fighters[${a}]._ghostT=100; fighters[${a}].you=false; fighters[${mate(w, 1)}].you=true`);
    expect(w.eval(`ctfHiddenFrom(fighters[${a}])`), 'hidden from the other side').toBe(true);
    w.eval(`fighters[${a}].you=true; fighters[${mate(w, 1)}].you=false`);
    expect(w.eval(`ctfHiddenFrom(fighters[${a}])`), 'not from its own').toBe(false);
    const t = w.eval('ctfJailThreshold(CTF.live.n)');
    put(w, a, foe.x, foe.y); w.eval(`fighters[${a}]._shield=1; fighters[${a}].pct=${t + 5}`); logic(w, 2);
    expect(w.eval(`fighters[${a}]._jail`), 'the shield took it').toBe(null);
    expect(w.eval(`fighters[${a}]._shield`)).toBe(0);
    w.eval(`fighters[${a}].pct=${t + 5}`); logic(w, 2);
    expect(w.eval(`fighters[${a}]._jail`), 'once only').toBe(1);
  });

  it('the areas do what they look like: ice, water, wind, belt, spring, thin air', () => {
    const { window: w } = loadMonolith(13);
    start(w);
    const zone = type => J(w, `worldZones.filter(function(z){ return z.type==='${type}'; })[0] || null`);
    const into = (z, vx) => w.eval(`(function(){ var f=fighters[0]; f.controller='still'; f.x=${z.x + z.w / 2}; f.y=${z.y + z.h - 30}; f.vx=${vx || 0}; f.vy=0; f.iceUntil=0; f._floatT=0; f._springT=0; return 1; })()`);
    let tested = 0;
    let z = zone('ice'); if (z) { into(z); step(w, 2); expect(w.eval('fighters[0].iceUntil'), 'ice: low friction').toBeGreaterThan(0); tested++; }
    z = zone('water'); if (z) { into(z, 8); step(w, 1); expect(w.eval('fighters[0].vx'), 'water drags').toBeLessThan(8); tested++; }
    z = zone('wind'); if (z) { into(z, 0); step(w, 3); expect(Math.sign(w.eval('fighters[0].vx')), 'wind pushes the way it points').toBe(z.dir); tested++; }
    z = zone('spring'); if (z) { into(z); step(w, 3); expect(w.eval('fighters[0].vy'), 'spring throws you up').toBeLessThan(-8); tested++; }
    z = zone('float'); if (z) { into(z); step(w, 2); expect(w.eval('fighters[0]._floatT'), 'thin air').toBeGreaterThan(0); tested++; }
    z = zone('belt'); if (z) { into(z); const x0 = w.eval('fighters[0].x'); step(w, 8); expect(Math.sign(w.eval('fighters[0].x') - x0), 'a belt carries you').toBe(z.dir); tested++; }
    expect(tested, 'at least four of the area kinds are on this map').toBeGreaterThanOrEqual(4);
    // the right side mirrors: a wind toward the middle on the left blows toward the middle on the right
    const winds = J(w, `worldZones.filter(function(z){ return z.type==='wind'; }).map(function(z){ return [z.x + z.w/2 < ${MID}, z.dir]; })`);
    if (winds.length) expect(winds.find(q => q[0])[1]).toBe(-winds.find(q => !q[0])[1]);
    // and a dark area is only a picture
    expect(w.eval(`worldZones.some(function(z){ return z.type==='dark'; })`)).toBe(false);
    expect(w.eval(`CTF.map.zones.some(function(z){ return z.type==='dark'; })`)).toBe(true);
  });

  it('a whole side in jail at once is over: the other side wins', () => {
    const { window: w } = loadMonolith(10);
    start(w);
    const foe = spawn(w, 1);
    for (let k = 0; k < 5; k++) {
      const a = mate(w, 0, k);
      put(w, a, foe.x, foe.y); w.eval(`eliminate(fighters[${a}])`);
      expect(w.eval(`fighters[${a}]._jail`)).toBe(1);
      logic(w, 1);
      expect(w.eval('CTF.live.over'), 'after ' + (k + 1) + ' in jail').toBe(k === 4);
    }
    expect(w.eval('CTF.live.winner')).toBe(1);
    expect(w.eval('CTF.live.why')).toBe('jail');
  });

  it('a lift carries whoever stands on it; a team buff is claimed once per team', () => {
    const { window: w } = loadMonolith(18);
    start(w);
    expect(w.eval('CTF.live.elevs.length'), 'a lift puzzle a side').toBe(2);
    w.eval('worldZones = []');   // (a belt in the room would carry the rider off the car)
    const e = J(w, 'CTF.live.elevs[0]');
    put(w, 0, e.x + e.w / 2, e.y0); w.eval('fighters[0].onground = true');
    step(w, 150);   // it rests, then runs down: the real game steps so the rider is carried
    expect(w.eval('fighters[0].y'), 'carried down the shaft').toBeGreaterThan(e.y0 + 100);
    const b = J(w, 'CTF.live.buffs[0]');
    expect(w.eval('CTF.live.buffs.length'), 'one reward puzzle a side').toBe(2);
    put(w, 1, b.x, b.y); logic(w, 2);
    const team1 = w.eval('fighters[1].team');
    expect(w.eval(`CTF.live.buff[${team1}]`), 'a modest speed-up for the side').toBeCloseTo(1.1, 5);
    expect(w.eval('ctfSpeedK(fighters[1])')).toBeCloseTo(1.5 * 1.1, 5);
    const other = mate(w, 1 - team1);
    put(w, other, b.x, b.y); logic(w, 2);
    expect(w.eval(`CTF.live.buff[${1 - team1}]`), 'the other side may claim it too').toBeCloseTo(1.1, 5);
    const again = mate(w, team1, 1);
    w.eval(`CTF.live.buff[${team1}] = 0; CTF.live.buffs[0].got[${team1}] = true`);
    put(w, again, b.x, b.y); logic(w, 2);
    expect(w.eval(`CTF.live.buff[${team1}]`), 'not twice').toBe(0);
  });

  it('a player drops through the maze one-way ledges (and a lift car) by holding Down; a solid floor holds', () => {
    const { window: w } = loadMonolith(21);
    start(w);
    const stand = (sel) => { const P = J(w, `(function(){ var q = worldPlats.filter(${sel}); q.sort(function(a,b){ return a.x-b.x; }); var p = q[Math.floor(q.length/3)]; return { x:p.x, y:p.y, w:p.w }; })()`);
      w.eval(`(function(){ var f = fighters[0]; f.controller='local'; f.you=true; f.x=${P.x + P.w/2}; f.y=${P.y}-f.r; f.vx=0; f.vy=0; f.onground=true; f.invuln=0; down[KEYS.down]=true; })()`);
      step(w, 14); w.eval(`down[KEYS.down]=false`);
      return { y: w.eval('fighters[0].y + fighters[0].r'), top: P.y }; };
    const ledge = stand('function(p){ return p.hop && !p.solid && p.w >= 100 && p.x < 8000 && p.y > 1200; }');
    expect(ledge.y, 'fell through the ledge').toBeGreaterThan(ledge.top + 20);
    const floor = stand('function(p){ return p.solid && p.w >= 400 && p.x < 8000 && p.y > 1200; }');
    expect(Math.abs(floor.y - floor.top), 'a solid floor holds').toBeLessThan(6);
  });

  it('a super-jump pad lifts a fighter to a ledge nothing else reaches', () => {
    const { window: w } = loadMonolith(23);
    start(w);
    const s = J(w, `CTF.map.info.supers[0]`);
    expect(s, 'the map has super-jump rooms').toBeTruthy();
    const f = s.pad.r + 1, lx = ((s.ledge.c0 + s.ledge.c1 + 1) / 2) * 120, ledgeY = s.ledge.r * 120;   // the walkway's surface row, the middle of the ledge, the ledge's surface
    const tryJump = (boost) => {
      w.eval(`(function(){ var q = fighters[0]; q.controller='local'; q.you=true; q.x=${lx}; q.y=${f * 120}-q.r; q.vx=0; q.vy=0; q.onground=true; q.jumps=2; q.invuln=0; q._ctfJT=${boost ? 600 : 0}; })()`);
      step(w, 3);
      w.eval(`down[KEYS.jump]=true`); step(w, 1); w.eval(`down[KEYS.jump]=false`); step(w, 1);
      for (let i = 0; i < 40 && w.eval('fighters[0].vy') < -0.4; i++) step(w, 1);
      w.eval(`down[KEYS.jump]=true`); step(w, 1); w.eval(`down[KEYS.jump]=false`); step(w, 90);
      return w.eval('fighters[0].y + fighters[0].r');
    };
    expect(Math.abs(tryJump(true) - ledgeY), 'with the boost: standing on the ledge').toBeLessThan(10);
    expect(tryJump(false), 'without it: back on the floor').toBeGreaterThan(ledgeY + 100);
  });

  it('the free camera: smash toggles it, the arrows steer a cursor, Space puts the flag only on a valid, reachable spot', () => {
    const { window: w } = loadMonolith(22);
    w.eval(`CTF.skipNav=true; SETTINGS.mode='ctf'; SETTINGS.count=10; CTF.forceMap='castle'; beginMatchNow(); CTF.nav = ctfNavNew(CTF.map); while(!CTF.nav.ready) ctfNavTick(CTF.nav, 80);`);
    const tap = (key) => { w.eval(`down[KEYS.${key}]=true`); step(w, 2); w.eval(`down[KEYS.${key}]=false`); step(w, 2); };
    const x0 = w.eval('fighters[0].x');
    tap('smash');
    expect(w.eval('!!fighters[0]._cam'), 'smash turns the free camera on').toBe(true);
    const c0 = J(w, 'fighters[0]._cam');
    w.eval(`down[KEYS.right]=true`); step(w, 5); w.eval(`down[KEYS.right]=false`);
    expect(w.eval('fighters[0]._cam.x') - c0.x, 'the cursor moves 26 a step').toBeGreaterThan(100);
    expect(w.eval('fighters[0].x'), 'the fighter stands still').toBeCloseTo(x0, 0);
    expect(w.eval('ctfCamFighter(fighters[0]).x'), 'the camera follows the cursor').toBe(w.eval('fighters[0]._cam.x'));
    // a hiding spot of team 0: the cursor a little above it snaps to the floor and the flag goes there
    const sp = J(w, `CTF.map.spots.filter(function(s){ return s.team===0 && s.y > 1000; })[0]`);
    w.eval(`fighters[0]._cam = { x:${sp.x}, y:${sp.y - 60} }`);
    expect(w.eval('ctfCamSnap(fighters[0]).ok')).toBe(true);
    tap('flag');
    expect(w.eval('CTF.live.flags[0].st'), 'put down').toBe(1);
    expect(w.eval('CTF.live.flags[0].x')).toBe(sp.x);
    expect(Math.abs(w.eval('CTF.live.flags[0].y') - sp.y), 'on the floor under the cursor').toBeLessThan(2);
    // not in a wall, not near the middle line, not on the other side
    const wall = J(w, `(function(){ var p = worldPlats.filter(function(p){ return p.solid && p.x < 8000 && p.w >= 100 && p.h >= 100 && p.y > 1000; })[0]; return { x:p.x + p.w/2, y:p.y + p.h/2 }; })()`);
    w.eval(`fighters[0]._cam = { x:${wall.x}, y:${wall.y} }`);
    expect(w.eval('ctfCamSnap(fighters[0]).ok'), 'inside a wall').toBe(false);
    w.eval(`fighters[0]._cam = { x:${MID - 100}, y:${sp.y - 60} }`);
    expect(w.eval('ctfCamSnap(fighters[0]).ok'), 'near the line').toBe(false);
    w.eval(`fighters[0]._cam = { x:${sp.x}, y:${sp.y - 60} }`);
    const xBefore = w.eval('CTF.live.flags[0].x');
    w.eval(`fighters[0]._cam = { x:${wall.x}, y:${wall.y} }`); tap('flag');
    expect(w.eval('CTF.live.flags[0].x'), 'a refused spot leaves the flag where it was').toBe(xBefore);
    // the cursor cannot cross to the enemy side
    w.eval(`fighters[0]._cam = { x:${MID - 60}, y:${sp.y} }; down[KEYS.right]=true`); step(w, 6); w.eval(`down[KEYS.right]=false`);
    expect(w.eval('fighters[0]._cam.x'), 'stays on its own side').toBeLessThan(MID);
    // the camera is gone once the hiding is over
    w.eval(`ctfEndHide(CTF.live)`);
    expect(w.eval('fighters[0]._cam')).toBe(null);
  });

  it('a flag put down within the width of a prop is behind it (seen only from close); anywhere else it is in the open; every prop kind draws', () => {
    const { window: w } = loadMonolith(24);
    start(w);
    const sp = J(w, `CTF.map.spots.filter(function(s){ return s.team===0 && s.cover==='crate'; })[0] || CTF.map.spots.filter(function(s){ return s.team===0 && s.cover; })[0]`);
    const hw = w.eval(`CTF_COVER_HW['${sp.cover}']`);
    w.eval(`ctfPlaceFlag(CTF.live.flags[0], ${sp.x + hw - 8}, ${sp.y})`);
    expect(w.eval('CTF.live.flags[0].cover'), 'at the edge of the prop: behind it').toBe(true);
    w.eval(`ctfPlaceFlag(CTF.live.flags[0], ${sp.x + hw + 300}, ${sp.y})`);
    const near = w.eval(`CTF.map.spots.some(function(s){ return s.team===0 && s.cover && Math.abs(s.x-${sp.x + hw + 300}) < (CTF_COVER_HW[s.cover]||46) && Math.abs(s.y-${sp.y}) < 80; })`);
    expect(w.eval('CTF.live.flags[0].cover'), 'away from every prop: in the open').toBe(near);
    expect(w.eval('Object.keys(CTF_COVER).length'), 'a wide choice of props').toBeGreaterThanOrEqual(20);
    const bad = J(w, `Object.keys(CTF_COVER_HW).filter(function(k){ try{ ctfCoverDraw(ctx, { x:100, y:200, cover:k }, CTF.map.theme); return false; }catch(e){ return true; } })`);
    expect(bad, 'prop kinds that fail to draw').toEqual([]);
  });

  // ---- editing your area while hiding ----
  const hideStart = (w, nav = false) => w.eval(`CTF.skipNav=${!nav}; SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='castle'; beginMatchNow(); fighters.forEach(function(f){ f.you=false; if(f.idx>0) f.controller='still'; }); fighters[0].controller='local'; fighters[0].you=true;`);
  // a free place on team 0's side: a floor inside a room, with air above it
  const roomSpot = (w) => J(w, `(function(){ var s = CTF.map.spots.filter(function(s){ return s.team===0 && s.y>1500 && s.x<8000; })[3]; return { x:s.x, y:s.y }; })()`);
  const tryPlace = (w, who, tool, kind, x, y, offs = [0, 130, -130, 260, -260, 390, -390, 520]) => { for (const dx of offs) { const ok = w.eval(`!!ctfEditPlaceAt(fighters[${who}], '${tool}', '${kind}', ${x + dx}, ${y})`); if (ok) return dx; } return null; };

  it('a jailed human is rescued: CPU teammates set out within seconds (one when the door is clear, two when a guard stands by it: one fights, one holds), and defenders go when no attacker is left', () => {
    const { window: w } = loadMonolith(34);
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='castle'; beginMatchNow(); while(!CTF.nav.ready) ctfNavTick(CTF.nav, 80);
      fighters.forEach(function(f){ f.controller = f.idx === 0 ? 'local' : 'ai'; f.you = f.idx === 0; }); ctfEndHide(CTF.live);`);
    const sp = spawn(w, 1), door = J(w, 'CTF.map.jails[1].door');
    w.eval(`(function(){ var f = fighters[0]; f.x = ${sp.x}; f.y = ${sp.y}; eliminate(f); })()`);
    expect(w.eval('fighters[0]._jail'), 'the human is in the enemy jail').toBe(1);
    const going = () => J(w, `fighters.filter(function(f){ return f.team===0 && f.idx!==0 && f._ai && f._ai.goal && f._ai.goal.kind==='jail' && f._jail==null; }).map(function(f){ return f._ai.goal.role; })`);
    const choose = () => w.eval(`fighters.filter(function(f){ return f.team===0 && f.idx!==0 && f._jail==null; }).forEach(function(f){ ctfAiChoose(f, f._ai, CTF.live, CTF.nav, CTF.live.t); })`);
    const clear = () => w.eval(`fighters.forEach(function(f){ if(f._ai) f._ai.goal = null; })`);
    // a beat after the jailing: nobody yet; then one rescuer, holding the door
    w.eval('fighters[0]._jailT = 10'); choose();
    expect(going(), 'a moment to react').toEqual([]);
    w.eval('fighters[0]._jailT = 100'); choose();
    expect(going(), 'one rescuer goes when the door is clear, to hold it').toEqual(['hold']);
    // a guard at the door: two, one holds and one fights
    clear();
    const foe = mate(w, 1, 0); put(w, foe, door.x - 160, door.y + door.h);
    choose();
    expect(going().sort(), 'two go when it is guarded').toEqual(['bait', 'hold']);
    // only defenders are left free: they go too
    clear(); put(w, foe, door.x - 3000, door.y + door.h);
    w.eval(`fighters.forEach(function(f){ if(f.team===0 && f.idx!==0 && f._ai && f._ai.role==='att') f._jail = 1; })`);
    choose();
    expect(going().length, 'with every attacker in jail the defenders go').toBeGreaterThanOrEqual(1);
  });

  it('a human who takes their time hiding: their CPU teammates keep moving (building, walking about, taking their opening places) instead of standing frozen; the map choice is remembered and used', { timeout: 300000 }, () => {
    const { window: w } = loadMonolith(35);
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='castle'; beginMatchNow();`);
    step(w, 1700);
    expect(w.eval('CTF.live.phase'), 'the human has not pressed done: still hiding').toBe('hide');
    const mates = J(w, `fighters.filter(function(f){ return f.team===0 && f.idx!==0; }).map(function(f){ return f.idx; })`);
    expect(mates.filter(i => w.eval(`!!CTF.live.done[${i}]`)).length, 'most are ready').toBeGreaterThanOrEqual(3);
    const pos = () => mates.map(i => J(w, `[fighters[${i}].x, fighters[${i}].y]`));
    let last = pos(); const moved = mates.map(() => 0);
    for (let k = 0; k < 40; k++) { step(w, 30); const p = pos(); p.forEach((q, i) => { moved[i] += Math.hypot(q[0] - last[i][0], q[1] - last[i][1]); }); last = p; }
    expect(moved.filter(m => m > 250).length, 'still on the move 20 s on (walking, or looking about)').toBeGreaterThanOrEqual(3);
    // the map choice: a named map is the one played; Random picks among them; it is kept
    w.eval(`CTF.forceMap = null; ctfMapPickSet('mines')`);
    expect(w.eval('ctfPickMap()')).toBe('mines');
    expect(w.eval(`localStorage.getItem('bfsi:ctfmap')`)).toBe('mines');
    w.eval(`ctfMapPickSet('random')`);
    const ch = J(w, 'ctfMapChoices().map(function(c){ return c[0]; })');
    expect(ch[0], 'Random first').toBe('random'); expect(ch).toEqual(expect.arrayContaining(['castle', 'mines']));
  });

  it('a fighter standing inside a prop is hidden from the other side (not drawn, not targeted from afar) until it attacks or is hit; the prop breaking shows it; a friend or a close foe sees it', () => {
    const { window: w } = loadMonolith(36);
    start(w);
    const a = mate(w, 0, 1), foe = mate(w, 1, 0), friend = mate(w, 0, 2);
    const sp = J(w, `CTF.map.spots.filter(function(s){ return s.team === 0 && s.cover && s.y > 1500; })[2]`), spi = w.eval(`CTF.map.spots.findIndex(function(s){ return s.team === 0 && s.cover && s.x === ${sp.x} && s.y === ${sp.y}; })`);
    const standAt = (i, x, y) => w.eval(`(function(){ var f = fighters[${i}]; f.x = ${x}; f.y = ${y} - f.r; f.vx = 0; f.vy = 0; f.onground = true; f.hitstun = 0; f.invuln = 0; f._ctfRevealT = 0; })()`);
    standAt(foe, sp.x + 2500, sp.y); standAt(friend, sp.x - 900, sp.y);
    standAt(a, sp.x, sp.y); logic(w, 2);
    expect(w.eval(`fighters[${a}]._hid`), 'inside the prop: hidden').toBe(true);
    expect(w.eval(`ctfHidInProp(fighters[${a}], 1)`), 'the other side does not see it').toBe(true);
    expect(w.eval(`ctfHidInProp(fighters[${a}], 0)`), 'its own side does').toBe(false);
    expect(w.eval(`ctfAiFoe(fighters[${foe}], 3000)`), 'an enemy CPU does not target it from afar').toBe(null);
    standAt(foe, sp.x + 90, sp.y); logic(w, 2);
    expect(w.eval(`ctfHidInProp(fighters[${a}], 1)`), 'a foe right beside it sees it').toBe(false);
    standAt(foe, sp.x + 2500, sp.y);
    w.eval(`ctfFilterInput(fighters[${a}], { attack:true })`); logic(w, 2);
    expect(w.eval(`fighters[${a}]._hid`), 'attacking shows it for a moment').toBe(false);
    logic(w, 100);
    expect(w.eval(`fighters[${a}]._hid`), 'and it hides again').toBe(true);
    w.eval(`CTF.live.gone = CTF.live.gone || {}; CTF.live.gone[${spi}] = true`); logic(w, 2);
    expect(w.eval(`fighters[${a}]._hid`), 'the prop broke: shown').toBe(false);
    // the page's own AI leaves it alone too
    w.eval(`CTF.live.gone[${spi}] = false`); standAt(a, sp.x, sp.y); logic(w, 2);
    expect(w.eval(`fighters[${a}]._hid`)).toBe(true);
  });

  it('every fighter starts play with one personal key: it opens a locked door for its side and is used up; a respawn after a KO and a jailbreak give a fresh one', () => {
    const { window: w } = loadMonolith(37);
    start(w);
    expect(w.eval('fighters.every(function(f){ return f._pk === true; })'), 'everyone holds one key at the start of play').toBe(true);
    const f1 = mate(w, 1, 0), di = w.eval('CTF.live.doors.findIndex(function(d){ return d.team === 0; })'), d = J(w, `CTF.live.doors[${di}]`);
    expect(w.eval(`CTF.live.doors[${di}].op[1]`), 'the door is shut to the enemy').toBe(false);
    put(w, f1, d.x - 40, d.y + d.h); logic(w, 2);
    expect(w.eval(`CTF.live.doors[${di}].op[1]`), 'the personal key opened it for the enemy side').toBe(true);
    expect(w.eval(`CTF.live.doors[${di}].op[0]`), 'only for that side').toBe(false);
    expect(w.eval(`fighters[${f1}]._pk`), 'and was used up').toBe(false);
    // a KO on its own side: back home with a fresh key
    const home = spawn(w, 1); put(w, f1, home.x, home.y); w.eval(`eliminate(fighters[${f1}])`);
    expect(w.eval(`fighters[${f1}]._pk`), 'a fresh key after the respawn').toBe(true);
    // freed from jail: a fresh key as well
    const foe = spawn(w, 0); put(w, f1, foe.x, foe.y); w.eval(`eliminate(fighters[${f1}]); fighters[${f1}]._pk = false`);
    expect(w.eval(`fighters[${f1}]._jail`), 'jailed on the enemy side').toBe(0);
    w.eval(`ctfFreeJail(CTF.live, CTF.live.jails[0], null)`);
    expect(w.eval(`fighters[${f1}]._pk`), 'a fresh key once freed').toBe(true);
  });

  it('bargaining is points for speed: +10 points makes a side 8% slower, giving 10 up 8% faster, at most 16% either way; sacrificing 10 for speed needs no vote', () => {
    const { window: w } = loadMonolith(39);
    start(w);
    const a = mate(w, 0), b = mate(w, 1), k = (i) => w.eval(`ctfSpeedK(fighters[${i}])`);
    const a0 = k(a), b0 = k(b);
    w.eval('CTF.live.bonus = [10, -10]');
    expect(k(a) / a0, '+10: slower').toBeCloseTo(0.92, 3);
    expect(k(b) / b0, '-10: faster').toBeCloseTo(1.08, 3);
    w.eval('CTF.live.bonus = [30, -30]');
    expect(k(a) / a0, 'at most 16% slower').toBeCloseTo(0.84, 3);
    expect(k(b) / b0, 'at most 16% faster').toBeCloseTo(1.16, 3);
    w.eval('CTF.live.bonus = [0, 0]');
    expect(k(a) / a0).toBeCloseTo(1, 3);
    // the sacrifice: each of the side's points drop by 10 and the side is faster, with no offer to answer
    w.eval(`CTF.live.pts[${a}] = 20; CTF.live.offerCool = 0; fighters[${a}]._piece = 3; ctfEditOffer(fighters[${a}])`);
    expect(w.eval('CTF.live.offer'), 'nothing to vote on').toBe(null);
    expect(w.eval(`CTF.live.pts[${a}]`), '10 points given up').toBe(10);
    expect(w.eval('CTF.live.bonus[0]')).toBe(-10);
    expect(k(a) / a0, 'and faster').toBeCloseTo(1.08, 3);
    expect(k(b) / b0, 'the other side is as it was').toBeCloseTo(1, 3);
  });

  it('the decoration tool offers what fits the place: a set for the area under the cursor (halls, snowy mountain, mines, reef), B steps through it, the ghost is that prop, both sides alike', () => {
    const { window: w } = loadMonolith(33);
    hideStart(w);
    const a = mate(w, 0, 1), set = (x, y) => J(w, `ctfDecoSet(${x}, ${y})`), WW = w.eval('CTF.map.WW');
    expect(set(30*120, 20*120), 'a great hall: armour and chests').toEqual(expect.arrayContaining(['armor', 'chest', 'urn']));
    expect(set(70*120, 20*120), 'the snowy mountain: snow, pines, ice').toEqual(expect.arrayContaining(['drift', 'pine', 'iceblock']));
    expect(set(WW - 70*120, 20*120), 'the other side has the same').toEqual(set(70*120, 20*120));
    expect(set(30*120, 20*120).includes('pine'), 'no pines in a hall').toBe(false);
    w.eval(`CTF.map = ctfMapGet('mines')`);
    expect(set(85*120, 30*120), 'the reef: coral and kelp').toEqual(expect.arrayContaining(['coral', 'kelp', 'shell', 'anchor']));
    expect(set(30*120, 20*120), 'in the mine: crystals and carts').toEqual(expect.arrayContaining(['crystal', 'minecart', 'lamp']));
    w.eval(`CTF.map = ctfMapGet('castle')`);
    // B steps through the set under the cursor and the ghost is that prop
    const kinds = set(70*120, 20*120);
    for (let i = 0; i < kinds.length + 2; i++) {
      w.eval(`fighters[${a}]._tool = 1; fighters[${a}]._piece = ${i}; fighters[${a}]._cam = { x:${70*120}, y:${20*120} }`);
      expect(w.eval(`ctfEditGhost(fighters[${a}]).kind`)).toBe(kinds[i % kinds.length]);
    }
    // a set that is not the old five has a painter and a size for every kind
    for (const k of [...kinds, 'coral', 'kelp', 'shell', 'anchor', 'crystal', 'lamp', 'cone', 'hydrant', 'ball', 'minecart']) {
      expect(w.eval(`!!CTF_COVER_HW['${k}'] && !!CTF_DECO_H['${k}']`), k + ' has a width and a height').toBe(true);
    }
  });

  it('editing the area: pieces cost points, go on your own side only, can be removed (a piece you placed refunds, a prop of the map costs one)', () => {
    const { window: w } = loadMonolith(31);
    hideStart(w);
    const a = mate(w, 0, 1), sp = roomSpot(w);
    expect(w.eval(`CTF.live.pts[${a}]`), 'twenty points to start').toBe(20);
    expect(tryPlace(w, a, 'deco', 'crate', sp.x, sp.y - 20), 'a crate goes down').not.toBeNull();
    expect(w.eval(`CTF.live.pts[${a}]`), 'a decoration is 1').toBe(19);
    expect(tryPlace(w, a, 'plat', 'plat', sp.x, sp.y - 240), 'a thin platform goes up').not.toBeNull();
    expect(w.eval(`CTF.live.pts[${a}]`), 'a platform is 2').toBe(17);
    expect(tryPlace(w, a, 'wall', 'block', sp.x, sp.y - 60), 'a block goes down').not.toBeNull();
    expect(w.eval(`CTF.live.pts[${a}]`), 'a wall is 3').toBe(14);
    expect(tryPlace(w, a, 'trap', 'stun', sp.x, sp.y - 20), 'a trap goes down').not.toBeNull();
    expect(w.eval(`CTF.live.pts[${a}]`), 'a trap is 5').toBe(9);
    expect(tryPlace(w, a, 'trap', 'spikes', sp.x, sp.y - 20), 'a second trap fits (4 left)').not.toBeNull();
    expect(tryPlace(w, a, 'trap', 'spring', sp.x, sp.y - 20), 'not enough points for a third').toBeNull();
    expect(tryPlace(w, a, 'deco', 'crate', MID + 1200, sp.y - 20, [0]), 'not on the other side').toBeNull();
    expect(tryPlace(w, a, 'deco', 'crate', MID - 100, sp.y - 20, [0]), 'not by the line').toBeNull();
    const n0 = w.eval('CTF.live.edits.length');
    const wall = J(w, `CTF.live.edits.filter(function(e){ return e.tool==='wall'; })[0]`);
    const before = w.eval(`CTF.live.pts[${a}]`);
    expect(w.eval(`ctfEditRemoveAt(fighters[${a}], ${wall.x + 20}, ${wall.y + 20})`), 'a piece of yours comes away').toBe(true);
    expect(w.eval(`CTF.live.pts[${a}]`), 'and gives its 3 back').toBe(before + 3);
    expect(w.eval('CTF.live.edits.length')).toBe(n0 - 1);
    // a prop of the map: costs one, and a flag behind it is in the open afterwards
    const pr = J(w, `(function(){ var i = CTF.map.spots.findIndex(function(s){ return s.team===0 && s.cover; }); var s = CTF.map.spots[i]; return { i:i, x:s.x, y:s.y }; })()`);
    w.eval(`ctfPlaceFlag(CTF.live.flags[${a}], ${pr.x}, ${pr.y})`);
    expect(w.eval(`CTF.live.flags[${a}].cover`)).toBe(true);
    const b4 = w.eval(`CTF.live.pts[${a}]`);
    expect(w.eval(`ctfEditRemoveAt(fighters[${a}], ${pr.x}, ${pr.y - 40})`)).toBe(true);
    expect(w.eval(`CTF.live.pts[${a}]`), 'a map prop costs 1').toBe(b4 - 1);
    expect(w.eval(`!!CTF.live.gone[${pr.i}]`)).toBe(true);
    expect(w.eval(`CTF.live.flags[${a}].cover`), 'the flag that was behind it is out in the open').toBe(false);
  });

  it('a decoration you placed breaks when it is hit; walls and platforms do not; traps catch only the other side', () => {
    const { window: w } = loadMonolith(32);
    hideStart(w);
    const a = mate(w, 0, 1), foe = mate(w, 1, 1), sp = roomSpot(w);
    tryPlace(w, a, 'deco', 'crate', sp.x, sp.y - 20, [0, 200, -200, 400]);
    const d = J(w, `CTF.live.edits.filter(function(e){ return e.tool==='deco'; })[0]`);
    tryPlace(w, a, 'trap', 'spikes', sp.x - 600, sp.y - 20, [0, 100, 200, -100, -200, 300, 400]);
    tryPlace(w, a, 'wall', 'block', sp.x, sp.y - 60, [300, -300, 450, -450, 600]);
    w.eval(`ctfEndHide(CTF.live)`);
    expect(w.eval('CTF.live.phase')).toBe('play');
    const nWall = w.eval(`CTF.live.edits.filter(function(e){ return e.tool==='wall'; }).length`);
    // a swing next to the crate
    w.eval(`(function(){ var f = fighters[${foe}]; f.x = ${d.cx - 70}; f.y = ${d.fy} - f.r; f.face = 1; f.vx = 0; f.vy = 0; f._atkSeq = (f._atkSeq||0) + 1; })()`);
    w.eval('ctfEditStep(CTF.live)');
    expect(w.eval(`CTF.live.edits.filter(function(e){ return e.tool==='deco'; }).length`), 'the swing broke the crate').toBe(0);
    expect(w.eval(`CTF.live.edits.filter(function(e){ return e.tool==='wall'; }).length`), 'a wall does not break').toBe(nWall);
    // spikes: bump the other side and hurt it (the owner, 2026-10-13, asked what spikes should do: "Damage + bounce"); the placer's own side walks over them
    const sk = J(w, `CTF.live.edits.filter(function(e){ return e.kind==='spikes'; })[0]`);
    expect(sk, 'spikes were placed').toBeTruthy();
    w.eval(`(function(){ var g = fighters[${a}]; g.x = ${sk.cx}; g.y = ${sk.fy} - g.r; g.vy = 0; g.pct = 0; })()`); w.eval('ctfEditStep(CTF.live)');
    expect(w.eval(`fighters[${a}].vy`), 'a teammate is not bumped').toBe(0);
    w.eval(`(function(){ var g = fighters[${foe}]; g.x = ${sk.cx}; g.y = ${sk.fy} - g.r; g.vy = 0; g.pct = 0; g._trapT = 0; })()`); w.eval('ctfEditStep(CTF.live)');
    expect(w.eval(`fighters[${foe}].vy`), 'the other side is bumped up').toBeLessThan(-5);
    expect(w.eval(`fighters[${foe}].pct`), 'and takes the spike damage').toBe(w.eval('CTF_SPIKE_DMG'));
    expect(w.eval(`fighters[${a}].pct`), 'a teammate takes none').toBe(0);
  });

  it('a trapdoor gives way under the other side, and a stun trap stuns it', () => {
    const { window: w } = loadMonolith(33);
    hideStart(w);
    const a = mate(w, 0, 1), foe = mate(w, 1, 1), sp = roomSpot(w);
    const dx = tryPlace(w, a, 'trap', 'trapdoor', sp.x, sp.y - 240);
    expect(dx, 'a trapdoor goes up').not.toBeNull();
    tryPlace(w, a, 'trap', 'stun', sp.x - 700, sp.y - 20, [0, 120, 240, -120, -240, 360]);
    w.eval(`ctfEndHide(CTF.live)`);
    const td = J(w, `CTF.live.edits.filter(function(e){ return e.kind==='trapdoor'; })[0]`);
    expect(w.eval('ctfDynSolids().some(function(p){ return p.trapdoor; })'), 'the plank is solid').toBe(true);
    for (let i = 0; i < 14; i++) { w.eval(`(function(){ var g = fighters[${foe}]; g.x = ${td.cx}; g.onground = true; g.y = ${td.y} - g.r; g.vy = 0; ctfEditStep(CTF.live); })()`); }
    expect(w.eval('ctfDynSolids().some(function(p){ return p.trapdoor; })'), 'it opened').toBe(false);
    const st = J(w, `CTF.live.edits.filter(function(e){ return e.kind==='stun'; })[0]`);
    expect(st).toBeTruthy();
    w.eval(`(function(){ var g = fighters[${foe}]; g.x = ${st.cx}; g.y = ${st.fy} - g.r; g.vy = 0; g.hitstun = 0; g._trapT = 0; })()`); w.eval('ctfEditStep(CTF.live)');
    expect(w.eval(`fighters[${foe}].hitstun`), 'stunned').toBeGreaterThan(20);
  });

  it('bargaining: the CPU side accepts an offer that is the same for both and declines a lopsided one; humans vote', () => {
    const { window: w } = loadMonolith(34);
    hideStart(w);
    const a = mate(w, 0, 0), foe = mate(w, 1, 1);
    const offer = (piece) => { w.eval(`fighters[${a}]._piece = ${piece}; CTF.live.offerCool = 0; ctfEditOffer(fighters[${a}])`); for (let i = 0; i < 100; i++) w.eval('ctfEditStep(CTF.live)'); };
    offer(0);   // both +10
    expect(w.eval(`CTF.live.pts[${a}]`), 'both +10 accepted').toBe(30);
    expect(w.eval(`CTF.live.pts[${foe}]`)).toBe(30);
    offer(2);   // only us +10
    expect(w.eval(`CTF.live.pts[${a}]`), 'a lopsided offer is declined').toBe(30);
    offer(1);   // both -10
    expect(w.eval(`CTF.live.pts[${a}]`), 'both -10 accepted').toBe(20);
    expect(w.eval(`CTF.live.pts[${foe}]`)).toBe(20);
    // with a human on the other side the human decides
    w.eval(`fighters[${foe}].controller='remote'`);
    w.eval(`fighters[${a}]._piece = 0; CTF.live.offerCool = 0; ctfEditOffer(fighters[${a}])`);
    for (let i = 0; i < 200; i++) w.eval('ctfEditStep(CTF.live)');
    expect(w.eval('!!CTF.live.offer'), 'it waits for the human').toBe(true);
    w.eval(`ctfEditVote(fighters[${foe}], false)`); w.eval('ctfEditStep(CTF.live)');
    expect(w.eval('!!CTF.live.offer'), 'a no settles it').toBe(false);
    expect(w.eval(`CTF.live.pts[${a}]`)).toBe(20);
  });

  it('must be possible: pieces that shut a flag away are taken out when the hiding ends (newest first); the rest stay', { timeout: 120000 }, () => {
    const { window: w } = loadMonolith(35);
    hideStart(w, true);
    w.eval(`while(!CTF.nav.ready) ctfNavTick(CTF.nav, 80);`);
    const a = mate(w, 0, 1);
    // a harmless platform first (oldest), then blocks that wall off the corridor to the jail's door (the door must stay reachable: the check takes the newest away)
    w.eval(`(function(){ var P = fighters[${a}]; CTF.live.pts[P.idx] = 99;
      var add = function(tool, kind, x, y, w, h){ var e = { id:++CTF.live.editSeq, team:0, owner:P.idx, tool:tool, kind:kind, x:x, y:y, w:w, h:h, fy:y+h, cx:x+w/2, cost:1, seq:CTF.live.editSeq, hp:0, open:false, openT:0, stand:0 }; CTF.live.edits.push(e); return e; };
      add('plat','plat', 4500, 3080, 180, 16);
      add('wall','block', 1440, 5520, 120, 120); add('wall','block', 1440, 5400, 120, 120); add('wall','block', 1440, 5280, 120, 120);   // (the castle is nine rows taller: everything is 1080 px lower)
      CTF.live.editT = CTF.live.t; ctfRebuildDyn(CTF.live); })()`);
    expect(w.eval('CTF.live.edits.length')).toBe(4);
    w.eval(`CTF.live.done = {}; ctfEndHide(CTF.live)`);
    expect(w.eval('CTF.live.phase'), 'checking before the match').toBe('fix');
    for (let i = 0; i < 4000 && w.eval('CTF.live.phase') === 'fix'; i++) w.eval('ctfStep()');
    expect(w.eval('CTF.live.phase'), 'then the match').toBe('play');
    expect(w.eval('CTF.live.removedByFix'), 'some of the walls came out').toBeGreaterThan(0);
    expect(w.eval(`CTF.live.edits.some(function(e){ return e.tool==='plat'; })`), 'the harmless one stays').toBe(true);
    expect(J(w, 'ctfEditProblems(CTF.live, CTF.nav)'), 'everything is reachable').toEqual([]);
  });

  it('a flag can be put on a one-way platform, a platform somebody built, and a lift car (walking or with the free camera); not inside a wall', { timeout: 120000 }, () => {
    const { window: w } = loadMonolith(36);
    hideStart(w, true);
    w.eval(`while(!CTF.nav.ready) ctfNavTick(CTF.nav, 80);`);
    const hop = J(w, `(function(){ var p = worldPlats.filter(function(p){ return p.hop && !p.solid && p.w >= 200 && p.x < 8000 && p.y > 1500 && p.y < 4000; })[5]; return { x:p.x + p.w/2, y:p.y, w:p.w }; })()`);
    // walking: standing on the thin platform, Space
    w.eval(`(function(){ var f = fighters[0]; f.x = ${hop.x}; f.y = ${hop.y} - f.r; f.vx = 0; f.vy = 0; f.onground = true; })()`);
    expect(w.eval('ctfHidePlace(fighters[0])'), 'put down on a thin platform').toBe(true);
    expect(w.eval('CTF.live.flags[0].st')).toBe(1);
    expect(w.eval('CTF.live.flags[0].y'), 'on its top').toBe(hop.y);
    // the free camera: a cursor a little below the platform snaps to it, not to the floor beneath
    w.eval(`fighters[0]._cam = { x:${hop.x + 30}, y:${hop.y + 12} }`);
    const sn = J(w, 'ctfCamSnap(fighters[0])');
    expect(sn.y, 'snapped to the platform').toBe(hop.y);
    expect(sn.ok, 'and it may go there').toBe(true);
    w.eval(`fighters[0]._cam = { x:${hop.x}, y:${hop.y - 35} }`);
    expect(J(w, 'ctfCamSnap(fighters[0])').y, 'a cursor just above it too').toBe(hop.y);
    // inside a wall: no
    const wall = J(w, `(function(){ var p = worldPlats.filter(function(p){ return p.solid && p.x < 8000 && p.w >= 100 && p.h >= 100 && p.y > 1000; })[0]; return { x:p.x + p.w/2, y:p.y + p.h/2 }; })()`);
    w.eval(`fighters[0]._cam = { x:${wall.x}, y:${wall.y} }`);
    expect(J(w, 'ctfCamSnap(fighters[0])').ok, 'not inside a wall').toBe(false);
    // a platform the player built
    const a = mate(w, 0, 1), sp = roomSpot(w);
    const dx = tryPlace(w, a, 'plat', 'plat', sp.x, sp.y - 240);
    expect(dx).not.toBeNull();
    const ep = J(w, `CTF.live.edits.filter(function(e){ return e.tool==='plat'; })[0]`);
    w.eval(`fighters[0]._cam = { x:${ep.x + ep.w/2}, y:${ep.y - 40} }`);
    const sn2 = J(w, 'ctfCamSnap(fighters[0])');
    expect(sn2.y, 'the built platform is a surface').toBe(ep.y);
    expect(sn2.ok, 'a flag may go on it').toBe(true);
    // a lift car at rest, and it goes with the car
    const lift = J(w, `(function(){ var e = CTF.live.elevs.filter(function(e){ return e.x < 8000; })[0]; return { i:e.i, x:e.x + e.w/2, y:e.y, w:e.w }; })()`);
    w.eval(`(function(){ var f = fighters[0]; f.x = ${lift.x}; f.y = ${lift.y} - f.r; f.vx = 0; f.vy = 0; f.onground = true; CTF.live.flags[0].st = 0; CTF.live.flags[0].car = 0; f._cam = null; })()`);
    expect(w.eval('ctfHidePlace(fighters[0])'), 'put down on a lift car').toBe(true);
    w.eval(`CTF.live.elevs[${lift.i}].pause = 0; CTF.live.elevs[${lift.i}].dir = 1`);
    for (let i = 0; i < 40; i++) w.eval('ctfStepElevs(CTF.live)');
    expect(w.eval(`CTF.live.flags[0].y === CTF.live.elevs[${lift.i}].y`), 'the flag rides the car').toBe(true);
  });

  it('what is put on a lift rides with it: a decoration and a wall that you build, and a flag or key that lands there', () => {
    const { window: w } = loadMonolith(37);
    hideStart(w);
    const a = mate(w, 0, 1);
    const lift = J(w, `(function(){ var e = CTF.live.elevs.filter(function(e){ return e.x < 8000; })[0]; return { i:e.i, x:e.x + e.w/2, y:e.y, w:e.w }; })()`);
    expect(w.eval(`!!ctfEditPlaceAt(fighters[${a}], 'deco', 'crate', ${lift.x}, ${lift.y - 20})`), 'a crate goes on the lift car').toBe(true);
    const p = J(w, `CTF.live.edits[0]`);
    expect(p.elev, 'it rides that lift').toBe(lift.i);
    w.eval(`CTF.live.elevs[${lift.i}].pause = 0; CTF.live.elevs[${lift.i}].dir = 1`);
    for (let i = 0; i < 40; i++) w.eval('ctfStepElevs(CTF.live)');
    const moved = w.eval(`CTF.live.elevs[${lift.i}].y`) - lift.y;
    expect(moved, 'the lift moved').toBeGreaterThan(50);
    expect(w.eval('CTF.live.edits[0].y') - p.y, 'and the crate went with it').toBeCloseTo(moved, 3);
    expect(w.eval('CTF.live.edits[0].fy'), 'standing on the car').toBe(w.eval(`CTF.live.elevs[${lift.i}].y`));
    // a flag dropped onto the car lies there and goes with it
    w.eval(`(function(){ var L = CTF.live, e = L.elevs[${lift.i}], fl = L.flags[${a}]; fl.st = 3; fl.fall = true; fl.vy = 0; fl.x = e.x + e.w/2; fl.y = e.y - 60; fl.car = -1; })()`);
    for (let i = 0; i < 30; i++) w.eval('ctfStepFlags(CTF.live)');
    expect(w.eval(`CTF.live.flags[${a}].elev`), 'it landed on the car').toBe(lift.i);
    const y0 = w.eval(`CTF.live.flags[${a}].y`);
    for (let i = 0; i < 30; i++) w.eval('ctfStepElevs(CTF.live)');
    expect(w.eval(`CTF.live.flags[${a}].y`) !== y0, 'and rode it').toBe(true);
  });

  it('only capturing all five ends the match: no clock', () => {
    const { window: w } = loadMonolith(9);
    start(w);
    logic(w, 40000);                                      // far longer than any match clock there could have been (and no capture came of it)
    expect(w.eval('running')).toBe(true);
    expect(w.eval('CTF.live.over')).toBe(false);
    const own = spawn(w, 0);
    for (let n = 0; n < 5; n++) {
      const a = mate(w, 0, n % 5), fl = flagOf(w, 1, n), f = J(w, `CTF.live.flags[${fl}]`);
      put(w, a, f.x, f.y); step(w, 2);
      put(w, a, MID - 300, own.y); step(w, 2);
      expect(w.eval('CTF.live.score[0]')).toBe(n + 1);
      expect(w.eval('CTF.live.over')).toBe(n === 4);
    }
    expect(w.eval('running')).toBe(false);
    expect(w.eval('CTF.live.winner')).toBe(0);
  });
});
