import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "supervan can be shot in air but not on platforms, and gravity affects it -- it should be able to be
// shot from platforms, and explode in an area after falling off." Asked, the owner chose: the special
// explodes without hitting a surface, the finisher falls and explodes, the smash does not change; fired in
// the air it drops, then drives; a medium blast.
//
// Measured before the change: from a platform the van drove past the edge and hovered at platform height;
// in the air it fell through the platform and the floor, off the bottom of the screen; the finisher would
// not fire in the air. Now both vans ride the surface they are on (vanDrive).

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// Pencil on a platform (x 300..560, top 180 above the floor), or on the floor, or in the air above the
// platform; a dummy wherever the case needs one. Returns the van's path and what it did to the dummies.
const run = ({ where, move, dummies = [], frames = 90, wall = null }) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var platTop = groundY()-180;
  worldPlats=[{x:300, y:platTop, w:260, h:16}${wall ? `, {x:${wall}, y:platTop-80, w:40, h:80, solid:true}` : ''}];
  var A = makeFighter(ROSTER.find(function(r){ return r.name==='Pencil'; }), 420, groundY()-24, 0);
  A.team=0; A.face=1; A.controller='still'; A.stocks=9;
  var ds = ${JSON.stringify(dummies)}.map(function(d, i){
    var f = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), d.x, (d.y==='plat' ? platTop : groundY()) - 24, i+1);
    f.team=i+1; f.controller='still'; f.stocks=9; return f; });
  fighters=[A].concat(ds);
  ${where === 'plat' ? 'A.y = platTop - A.r;' : where === 'air' ? 'A.y = groundY()-260;' : ''}
  for (var k=0;k<3;k++){ step(); }
  ${where === 'air' ? 'A.y = groundY()-260; A.vy=0; A.onground=false;' : ''}
  fighters.forEach(function(f){ f.invuln=0; f.pct=0; f.hitstun=0; f.vx=0; });
  A.spCd=0; A.atkCd=0;
  var before = projectiles.length;
  ${move === 'special' ? 'fireSpecial(A, {});' : move === 'finisher' ? 'doAttackSpecial(A);' : 'doSmash(A);'}
  var van = projectiles.slice(before).filter(function(p){ return p.owner===A.idx; })[0];
  if (!van) return { fired: false };
  var path = [], boomAt = null, minVy = ds.map(function(){ return 0; });
  for (var i=0; i<${frames}; i++){
    step();
    ds.forEach(function(d, j){ minVy[j] = Math.min(minVy[j], d.vy); d.vx = 0; });   // the launch, read when it happens
    if (van.life > 0 && !van.boomed) path.push([Math.round(van.x), Math.round(van.y)]);
    else if (boomAt === null){ boomAt = { frame: i, x: Math.round(van.x), y: Math.round(van.y), boomed: !!van.boomed }; }
  }
  return { fired: true, platTop: platTop, ground: groundY(), r: van.r, drive: van.drive || null, grav: !!van.grav, pierce: !!van.pierce,
           path: path, boomAt: boomAt, hit: ds.map(function(d){ return +d.pct.toFixed(1); }), vy: minVy.map(function(v){ return +v.toFixed(1); }),
           R: VAN_BOOM_R, DMG: VAN_BOOM_DMG };
})()`);

describe('the special (C): drives the surface, explodes the moment it runs off an edge', () => {
  it('fired on a platform, it rides the platform and blows up at its edge, before it falls', () => {
    const r = run({ where: 'plat', move: 'special', dummies: [{ x: 600, y: 'plat' }, { x: 900, y: 'ground' }] });
    expect(r.fired).toBe(true);
    const onPlat = r.path.filter(([x]) => x < 555);
    expect(onPlat.length, 'it drove along the platform').toBeGreaterThan(2);
    for (const [, y] of onPlat) expect(y, 'at the platform top, not hovering or falling').toBe(Math.round(r.platTop - r.r));
    expect(r.boomAt && r.boomAt.boomed, 'it exploded').toBe(true);
    expect(r.boomAt.x, 'at the edge (the platform ends at 560)').toBeGreaterThanOrEqual(555);
    expect(r.boomAt.x).toBeLessThanOrEqual(580);
    expect(r.boomAt.y, 'without falling first').toBeLessThanOrEqual(Math.round(r.platTop - r.r) + 2);
    expect(r.hit[0], 'the blast catches a foe just past the edge').toBeGreaterThanOrEqual(r.DMG);
    expect(r.hit[1], 'and nobody far below').toBe(0);
  });

  it('fired in the air, it drops to the surface below, then drives from there', () => {
    const r = run({ where: 'air', move: 'special' });
    const drop = r.path.slice(0, 6);
    expect(Math.max(...drop.map(([x]) => x)) - Math.min(...drop.map(([x]) => x)), 'straight down while dropping').toBeLessThanOrEqual(15);
    const riding = r.path.filter(([, y]) => y === Math.round(r.platTop - r.r));
    expect(riding.length, 'then it rides the platform').toBeGreaterThan(1);
    expect(riding[riding.length - 1][0] - riding[0][0], 'and drives forward').toBeGreaterThan(20);
  });

  it('on the floor of a normal stage it drives out its life: the floor has no edge', () => {
    const r = run({ where: 'ground', move: 'special', frames: 140 });
    expect(r.boomAt, 'it ended').not.toBeNull();
    expect(r.boomAt.boomed, 'by running out, not by exploding').toBe(false);
    for (const [, y] of r.path) expect(y).toBe(Math.round(r.ground - r.r));
  });

  it('drives into a wall and explodes there', () => {
    const r = run({ where: 'plat', move: 'special', wall: 480 });
    expect(r.boomAt && r.boomAt.boomed).toBe(true);
    expect(r.boomAt.x).toBeLessThan(480);
  });
});

describe('the finisher (X+C): falls off the edge and explodes where it lands', () => {
  it('rides the platform, falls, and blows up on the floor it lands on', () => {
    const r = run({ where: 'plat', move: 'finisher', frames: 120, dummies: [{ x: 1000, y: 'ground' }, { x: 1400, y: 'ground' }] });
    expect(r.fired).toBe(true);
    expect(r.drive).toBe('land');
    const past = r.path.filter(([x]) => x > 600);
    expect(past.some(([, y]) => y > Math.round(r.platTop - r.r) + 20), 'it fell after the edge').toBe(true);
    expect(r.boomAt && r.boomAt.boomed, 'it exploded').toBe(true);
    expect(r.boomAt.y, 'on the floor').toBeGreaterThanOrEqual(Math.round(r.ground - r.r) - 3);
    expect(r.hit[0], 'catching a foe beside where it landed').toBeGreaterThanOrEqual(r.DMG);
    expect(r.vy[0], 'with a solid launch').toBeLessThan(-4);
    expect(r.hit[1], 'but not one far away').toBe(0);
  });

  it('fires in the air too, dropping first', () => {
    const r = run({ where: 'air', move: 'finisher' });
    expect(r.fired).toBe(true);
    expect(r.path.some(([, y]) => y === Math.round(r.platTop - r.r)), 'it landed on the platform and drove').toBe(true);
  });
});

describe('the smash (Supervan Ram) does not change', () => {
  it('still a level, gravity-free, piercing ram from the ground, a platform or the air', () => {
    for (const where of ['ground', 'plat', 'air']) {
      const r = run({ where, move: 'smash', frames: 40 });
      expect(r.fired, where).toBe(true);
      expect(r.drive, where).toBe(null);
      expect(r.pierce, where).toBe(true);
      const ys = new Set(r.path.map(([, y]) => y));
      expect(ys.size, `${where}: flies level`).toBe(1);
    }
  });
});
