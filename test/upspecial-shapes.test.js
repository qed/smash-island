import { describe, it, expect } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "Most fighters don't have an up-C." They did — thirty of them had the same one (upLaunch plus a
// hitCircle two integers apart), nineteen more had a hop plus one dropped projectile. UPSPEC gives
// each of those forty-eight a row: a rise SHAPE (hop / warp / plunge / spin), a sweet band, a
// launch angle, and what it leaves behind. The first test is the whole point: no two rows may be
// the same move.

const key = (r) => [r.shape, r.hit ? (r.hit.band == null ? 'nb' : r.hit.band) : '-',
  r.hit ? r.hit.kb.map(Math.sign).join('') : '-', r.kb ? r.kb.map(Math.sign).join('') : '-',
  r.drop ? r.drop.rider + (r.drop.count || 1) : '-', r.leave || '-', r.spinKb || '-', r.dx ? 'dx' : '-', r.ram ? 'ram' : '-'].join('|');

const stage = (w, name, dummyAt) => w.eval(`
  (function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
    worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
    var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
    var D = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${dummyAt}, groundY()-24, 1);
    A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
    fighters=[A,D]; step(); A.invuln=0; D.invuln=0; A.pct=0; D.pct=0;
    var y0=A.y, x0=A.x; doUpSpecial(A);
    var yAfter1=A.y, inv=A.invuln, hits=0, last=D.pct, minY=A.y;
    for (var i=0;i<70;i++){ step(); minY=Math.min(minY,A.y); if(D.pct>last){ hits++; last=D.pct; } }
    return { rose1:y0-yAfter1, rose:y0-minY, dx:A.x-x0, inv:inv, hits:hits, pct:+D.pct.toFixed(2), projs:projectiles.length };
  })()`);

describe('every UPSPEC row is a different move', () => {
  it('no two rows share shape, band, angle, drop, leave and spin', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const rows = w.eval('Object.entries(UPSPEC).map(function(e){ return [e[0], e[1]]; })');
    const seen = new Map(), dupes = [];
    for (const [k, r] of rows) { const id = key(r); if (seen.has(id)) dupes.push(`${k} = ${seen.get(id)} (${id})`); else seen.set(id, k); }
    expect(dupes, 'rows that are the same move').toEqual([]);
    expect(rows.length).toBe(48);
  });
  it('every playable fighter still has an up-special that rises', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const names = w.eval('ROSTER.filter(function(r){return r.play;}).map(function(r){return r.name;})');
    const stuck = [];
    for (const n of names) { const r = stage(w, n, 900); if (!(r.rose > 20)) stuck.push(`${n} rose ${r.rose.toFixed(0)}`); }
    expect(stuck).toEqual([]);
  });
});

describe('the four shapes do what their names say', () => {
  it('hop: rises and swings — Needle only hits at the tip', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    expect(stage(w, 'Needle', 400).pct, 'a target on top of her is in the sour hilt').toBeLessThan(stage(w, 'Needle', 452).pct);
  });
  it('warp: Lightning is a hundred pixels higher on the very next frame, and briefly untouchable', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = stage(w, 'Lightning', 900);
    expect(r.rose1).toBeGreaterThan(100); expect(r.inv).toBeGreaterThan(0);
  });
  it('warp: Leafy goes forward as well as up', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = w.eval(`(function(){ var f=makeFighter(ROSTER.find(function(r){return r.name==='Leafy';}),400,groundY()-24,0); f.face=1; f._inRight=true; fighters=[f]; var x=f.x; doUpSpecial(f); return f.x-x; })()`);
    expect(r).toBeGreaterThan(50);
  });
  it('plunge: David rises, hangs, and lands on whoever is under him', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = stage(w, 'David', 400);
    expect(r.rose).toBeGreaterThan(40); expect(r.pct, 'the landing should hit').toBeGreaterThan(8);
  });
  it('spin: Bell hits a neighbour more than once on the way up', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    expect(stage(w, 'Bell', 430).hits).toBeGreaterThanOrEqual(2);
  });
});
