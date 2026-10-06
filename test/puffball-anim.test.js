import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { PNG } from 'pngjs';
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';
import { makePair } from './helpers/net-pair.js';

// "and add animations to attacks. puffball should have 3-5 frames while firing the projectile to spit it, and meteor puff should have the
// sprite from bfdia 6. like c'mon this is the 5th time ive asked." (the owner, 2026-10-06)
//
// Her SPIT: four pictures of her (puffball-spit-1..4.png, cut out of her own render) swapped in for her plain render by FIGHTER_ANIM.Puffball.body
// over the 18-tick swing of her X (render-only, like every pose), and the shot is DRAWN leaving her mouth on the spit frame (it is spawned, flies
// and hits on the tick it always did).

const SPRITES = 'artifacts/V1/assets/sprites';
const credits = readFileSync(`${SPRITES}/CREDITS.md`, 'utf8');
const html = readFileSync('artifacts/V1/index.html', 'utf8');
const readPng = (f) => PNG.sync.read(readFileSync(`${SPRITES}/${f}`));
const clearOf = (png) => { let c = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) c++; return c / (png.width * png.height); };

// A boot whose 2D context RECORDS every call, so what was drawn can be asserted instead of merely run.
function bootRecording(seed = 7) {
  const rec = [];
  const dom = new JSDOM(html, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      const grad = { addColorStop() {} };
      window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
        get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
          : p === 'canvas' ? { width: 1100, height: 720 }
          : p === 'getImageData' ? () => ({ data: [] })
          : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createConicGradient' || p === 'createPattern') ? () => grad
          : (...args) => { rec.push({ op: p, args }); }),
        set: () => true,
      });
      window.Math.random = mulberry32(seed);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
    },
  });
  return { w: dom.window, rec };
}

// A duel in the air-free middle of the stage: Puffball at x=300 facing right, a still Leafy at `foeX`.
const ARENA = (foeX = 640) => `
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; SETTINGS.items=false; running=true;
  startMatch(); worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var P = makeFighter(ROSTER.find(function(r){ return r.name==='Puffball'; }), 300, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), ${foeX}, groundY()-24, 1);
  P.team=0; D.team=1; P.controller='still'; D.controller='still'; P.stocks=9; D.stocks=9; P.you=false; D.you=false; P.face=1; D.face=-1;
  fighters=[P,D]; step(); [P,D].forEach(function(f){ f.invuln=0; f.hitstun=0; f.atkCd=0; f.spCd=0; f.smCd=0; f.flash=0; });
  P.onground=true; P.vx=0; P.vy=0;`;

// Pretend every picture of hers has decoded, each tagged with its own name so a drawImage says WHICH picture it drew.
const FAKE_DECODED = `
  (function(){
    var P = FIGHTER_ANIM.Puffball.poses, tag = function(sp, name, w, h){ sp._req = true; sp.img = { complete:true, naturalWidth:w, naturalHeight:h, tag:name }; };
    tag(SPRITES.Puffball, 'plain', 198, 200);
    for (var k in P) tag(P[k], k, P[k].src.indexOf('spit') > -1 ? 262 : 195, 200);
  })();`;

describe('her spit: four frames, and the shot leaves on the spit', () => {
  it('plays 4 distinct frames over the swing of her X, in order, each long enough to be seen', () => {
    const { w, rec } = bootRecording();
    w.eval(ARENA()); w.eval(FAKE_DECODED);
    w.eval(`P.atkCd=0; doAttack(P);`);
    const seq = [];
    for (let t = 0; t < 22; t++) {
      rec.length = 0;
      w.eval(`drawFighter(P)`);
      const imgs = rec.filter((c) => c.op === 'drawImage').map((c) => c.args[0] && c.args[0].tag).filter(Boolean);
      expect(imgs.length, `tick ${t}: one picture of her is drawn`).toBe(1);
      seq.push(imgs[0]);
      w.eval(`P._atkAnim = Math.max(0, P._atkAnim - 1); P._atkPhase = atkPhase(P); if (P.flash > 0) P.flash--; hazardT++;`);
    }
    // the swing is 18 ticks: four pictures, then her plain render is back
    expect(seq.slice(0, 18).filter((s, i) => s !== seq[i - 1]), 'the pictures, in the order they play').toEqual(['puff', 'spit', 'recoil', 'settle']);
    expect(new Set(seq.slice(0, 18)).size, 'the owner asked for 3 to 5 frames').toBeGreaterThanOrEqual(3);
    expect(new Set(seq.slice(0, 18)).size, 'the owner asked for 3 to 5 frames').toBeLessThanOrEqual(5);
    for (const name of ['puff', 'spit', 'recoil', 'settle']) {
      expect(seq.filter((s) => s === name).length, `${name} is held for at least 3 ticks`).toBeGreaterThanOrEqual(3);
    }
    expect(seq.slice(18), 'after the swing she is her plain self again').toEqual(['plain', 'plain', 'plain', 'plain']);
  });

  it('draws the shot leaving her mouth on the first tick of the spit frame, and not before', () => {
    const { w } = bootRecording();
    w.eval(ARENA()); w.eval(FAKE_DECODED);
    const out = w.eval(`(function(){
      projectiles.length = 0; P.atkCd = 0;
      var t0 = hazardT; doAttack(P);
      var shot = projectiles[0], rows = [];
      for (var e = 0; e < 14; e++){
        hazardT = t0 + e; P._atkAnim = ATK_ANIM - e; P._atkPhase = atkPhase(P);
        var frame = puffSpitFrame(P), on = projVisLerp(shot), a = fighterAnchor(P, {x:0, y:0});
        rows.push({ e: e, frame: frame, launching: on, scale: on ? _pvScale : 1, dx: on ? shot.x + _pvDX - a.x : null, dy: on ? shot.y + _pvDY - a.y : null });
      }
      return { rows: rows, held: PUFF_SPIT_AT[PUFF_SPIT_SHOT], spitFrame: PUFF_SPIT_SHOT };
    })()`);
    const first = out.rows.findIndex((r) => r.frame === out.spitFrame);
    expect(first, 'the spit frame starts on the tick the data says').toBe(out.held);
    for (const r of out.rows.slice(0, first)) {
      expect(r.launching && r.scale === 0, `tick ${r.e}: the shot is still in her cheeks, so nothing of it is drawn`).toBe(true);
    }
    const r = out.rows[first];
    expect(r.launching && r.scale > 0, 'on the spit frame it starts to come out').toBe(true);
    expect(Math.hypot(r.dx, r.dy), 'and it comes out of her mouth').toBeLessThan(0.001);
    expect(out.rows[first - 1].frame, 'the frame before it is the puff').toBe(0);
  });

  it('holds the shot on her mouth while she moves, instead of leaving it where she was', () => {
    const { w } = bootRecording();
    w.eval(ARENA());
    const d = w.eval(`(function(){
      projectiles.length = 0; P.atkCd = 0; var t0 = hazardT; doAttack(P);
      var shot = projectiles[0];
      P.x += 30;   // she runs on while it is held
      hazardT = t0 + PUFF_SPIT_AT[PUFF_SPIT_SHOT];
      projVisLerp(shot);
      var a = fighterAnchor(P, {x:0, y:0});
      return Math.hypot(shot.x + _pvDX - a.x, shot.y + _pvDY - a.y);
    })()`);
    expect(d, 'the shot leaves the mouth she has now').toBeLessThan(0.001);
  });

  it('does not wash the spit white with her own attack flash, but a hit still flashes her', () => {
    const { w, rec } = bootRecording();
    w.eval(ARENA()); w.eval(FAKE_DECODED);
    // a flash is a tinted copy of the picture (a canvas) laid over the picture itself
    const tints = (setup) => {
      w.eval(`P.flash = 0; P._atkAnim = 0; P._hurtAnim = 0; ${setup}`);
      rec.length = 0;
      w.eval(`drawFighter(P)`);
      return rec.filter((c) => c.op === 'drawImage' && c.args[0] && c.args[0].tagName === 'CANVAS').length;
    };
    const spitting = tints(`doAttack(P);`);
    expect(w.eval('P.flash'), 'her own flash is still set: the sim is untouched').toBeGreaterThan(0);
    expect(spitting, 'a spit is not washed white').toBe(0);
    expect(tints(`P._atkAnim = 0; P.flash = 6; P._hurtAnim = 8;`), 'being hit is still the white flash').toBeGreaterThan(0);
    expect(tints(`armAtk(P, ATK_ANIM, 'punch'); P.flash = 6;`), 'and so is any other swing of hers').toBeGreaterThan(0);
    expect(tints(`P.flash = 0;`), 'no flash, no tint').toBe(0);
  });

  it('throws no blade swipe: she has nothing to swing, and a punch still does', () => {
    const { w, rec } = bootRecording();
    w.eval(ARENA()); w.eval(FAKE_DECODED);
    const arcs = (kind) => {
      w.eval(`armAtk(P, ATK_ANIM, ${JSON.stringify(kind)}); P.flash = 0; P._atkAnim = 8; P._atkPhase = atkPhase(P);`);
      rec.length = 0;
      w.eval(`drawFighter(P)`);
      return rec.filter((c) => c.op === 'arc' && c.args[2] > 20).length;
    };
    expect(arcs('spit'), 'no swipe on the spit').toBe(0);
    expect(arcs('punch'), 'the swipe is still there for every other swing').toBeGreaterThan(0);
  });

  it('blows a rainbow out of her mouth on the spit frame: six bands in the colours of her barf, the way she faces, and on no other frame', () => {
    const { w } = bootRecording();
    w.eval(ARENA());
    const bands = w.eval(`(function(){
      var mk = function(){ var c = { log: [], globalAlpha: 1, lineWidth: 1, lineCap: '', fillStyle: '', _s: '', _mx: 0 };
        Object.defineProperty(c, 'strokeStyle', { get: function(){ return this._s; }, set: function(v){ this._s = v; } });
        ['beginPath','lineTo','quadraticCurveTo','closePath','fill','arc','save','restore','translate','rotate','scale','fillRect','ellipse','bezierCurveTo','rect','transform'].forEach(function(n){ c[n] = function(){}; });
        c.moveTo = function(x){ this._mx = x; }; c.stroke = function(){ this.log.push({ s: this._s, x: this._mx }); }; return c; };
      var at = function(face, e){ P.face = face; armAtk(P, ATK_ANIM, 'spit'); P._atkAnim = ATK_ANIM - e; var c = mk(); FIGHTER_ANIM.Puffball.over(P, c); return c.log; };
      var out = { colours: PUFF_RAINBOW.slice() };
      out.spit = at(1, PUFF_SPIT_AT[PUFF_SPIT_SHOT] + 2);
      out.left = at(-1, PUFF_SPIT_AT[PUFF_SPIT_SHOT] + 2);
      out.puff = at(1, 1);
      out.recoil = at(1, PUFF_SPIT_AT[2] + 1);
      P._atkAnim = 0; var c = mk(); FIGHTER_ANIM.Puffball.over(P, c); out.rest = c.log;
      return out;
    })()`);
    const rainbow = (log) => log.filter((l) => bands.colours.includes(l.s));
    expect(rainbow(bands.spit).map((l) => l.s), 'six bands, top to bottom, on the spit frame').toEqual(bands.colours);
    expect(rainbow(bands.spit).every((l) => l.x > 0), 'ahead of her when she faces right').toBe(true);
    expect(rainbow(bands.left).every((l) => l.x < 0), 'and ahead of her when she faces left').toBe(true);
    for (const k of ['puff', 'recoil', 'rest']) expect(rainbow(bands[k]), `no rainbow on ${k}`).toEqual([]);
  });

  it("gives the swing her own lunge: gathered back on the puff, snapped forward on the spit, kicked back on the recoil", () => {
    const { w } = bootRecording();
    w.eval(ARENA());
    const drive = w.eval(`(function(){ var o = [];
      for (var e = 0; e < 18; e++){ var f = { _atkKind:'spit', _atkAnim: ATK_ANIM - e, _atkLen: ATK_ANIM, kit:{special:'fly'} }; o.push(+puffSpitDrive(f).toFixed(3)); }
      return o; })()`);
    expect(Math.min(...drive.slice(0, 3)), 'wound back on the puff').toBeLessThan(-0.5);
    expect(Math.max(...drive.slice(3, 8)), 'forward on the spit').toBeGreaterThan(0.9);
    expect(Math.min(...drive.slice(8, 13)), 'kicked back on the recoil').toBeLessThan(-0.4);
    expect(Math.abs(drive[17]), 'and settled').toBeLessThan(0.15);
    // and the shared rig really uses it for her and for nobody else: the same swing of anyone else is the shared lunge
    const other = w.eval(`(function(){ var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 300, 300, 3); armAtk(f, ATK_ANIM, 'spit'); f._atkAnim = ATK_ANIM - 5;
      return [!!FIGHTER_ANIM.Firey.atkDrive, atkDrive(f)]; })()`);
    expect(other[0], "no other fighter brings a drive of its own").toBe(false);
  });

  it('is her and only her: no spit frame for anyone else, nor for her outside a spit', () => {
    const { w } = bootRecording();
    w.eval(ARENA());
    const r = w.eval(`(function(){
      var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 300, 300, 3); armAtk(f, ATK_ANIM, 'spit');
      var other = puffSpitFrame(f), otherPose = puffPose(f);
      armAtk(P, ATK_ANIM, 'punch'); var punch = puffSpitFrame(P);
      P._atkAnim = 0; var idle = puffPose(P);
      armAtk(P, ATK_ANIM, 'spit'); P._hurtAnim = 8; var hurt = puffPose(P);
      return { other: other, otherPose: otherPose, punch: punch, idle: idle, hurt: hurt };
    })()`);
    expect(r.other).toBe(-1);
    expect(r.otherPose).toBe(null);
    expect(r.punch, 'her other attacks are not spits').toBe(-1);
    expect(r.idle).toBe(null);
    expect(r.hurt, 'clipped mid-spit she shows the hit, not the spit').toBe(null);
  });
});

describe('the spit changes nothing about damage, timing or the shot', () => {
  // The same duel is played twice from the same dice: once as the game is (the frames drawn every tick, the shot's drawing held for her spit
  // frame), once with the one line of the sim side that the animation touches put back (visLaunch without its delay) and nothing drawn at
  // all. Every number the sim can see has to come out the same, tick for tick.
  const SHOT_LINE = "visLaunch(f, proj, sp==='fly' ? PUFF_SPIT_AT[PUFF_SPIT_SHOT] : 0);";
  const run = (frames, foeX, mutation = '') => {
    const strip = frames ? undefined : (src) => {
      expect(src, 'the call the animation touches is where the test expects it').toContain(SHOT_LINE);
      return src.replace(SHOT_LINE, 'visLaunch(f, proj);' + mutation);
    };
    const { window: w } = loadMonolith(0xC0FFEE, strip);
    return w.eval(`(function(){
      ${ARENA(foeX)}
      var rec = [], shot = null;
      for (var t = 0; t < 70; t++){
        if (t === 3){ P.atkCd = 0; doAttack(P); shot = projectiles.length ? { dmg:projectiles[0].dmg, kb:projectiles[0].kb, r:projectiles[0].r, vx:projectiles[0].vx, vy:projectiles[0].vy, life:projectiles[0].life,
            x:projectiles[0].x, y:projectiles[0].y, color:projectiles[0].color, ticks:projectiles[0].ticks } : null; }
        step();
        ${frames ? 'draw();' : ''}
        rec.push([t, Math.round(D.pct*100), Math.round(D.vx*100), D.hitstun, D._ticks ? D._ticks.n : 0, P.atkCd, P._atkAnim, P.flash, P.smashHold,
          projectiles.map(function(p){ return [Math.round(p.x*1000), Math.round(p.y*1000), p.life, p.dmg].join(':'); }).join(','), particles.length, Math.round(P.x*100), Math.round(P.y*100)].join('|'));
      }
      return { rec: rec, shot: shot, rng: Math.random(), pct: D.pct, projLife: PROJ_LIFE };
    })()`);
  };

  it('same damage, same ticks, same shot, same dice, whether or not the frames are drawn', () => {
    for (const foeX of [640, 380]) {   // across the stage, and point-blank (where the shot lands on the tick after it fires)
      const a = run(true, foeX), b = run(false, foeX);
      expect(a.shot, `foe at ${foeX}: the shot she fires`).toEqual(b.shot);
      expect(a.rec, `foe at ${foeX}: every tick of the sim`).toEqual(b.rec);
      expect(a.rng, `foe at ${foeX}: drawing the frames spends no randomness`).toBe(b.rng);
      expect(a.pct, `foe at ${foeX}: the damage`).toBe(b.pct);
    }
    const near = run(true, 380);
    expect(near.pct, 'the point-blank shot does land').toBeGreaterThan(0);
  });

  it('would catch a change to the sim (mutation check): one extra tick of life on the shot shows in the record', () => {
    const honest = run(true, 380), mutated = run(false, 380, ' proj.life += 1;');
    expect(mutated.shot.life, 'the line the A/B test strips is the one a sim change would go through').toBe(honest.shot.life + 1);
    expect(mutated.rec, 'and the tick-by-tick record sees it').not.toEqual(honest.rec);
  });

  it('fires the shot the way it always was: where it starts, how fast, what it hits for, and that it stings three times', () => {
    const { shot, projLife } = run(true, 640);
    expect(shot.r).toBe(8);
    expect(Math.abs(shot.vx)).toBe(12);
    expect(shot.vy).toBe(0);
    expect(shot.life, "RANGED_ATTACKERS.fly's 52 frames, as addProj scales every shot's life").toBe(Math.round(52 * projLife));
    expect(shot.ticks, 'a puff that keeps hurting').toEqual({ n: 3, every: 4 });
    expect(shot.x, 'it is spawned in front of her, not at her mouth').toBe(300 + (24 + 8));
  });

  it('never touches the attack cooldown or the swing timer: both are the lengths they were', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){ ${ARENA()}
      P.atkCd = 0; doAttack(P);
      return { len: P._atkLen, anim: P._atkAnim, kind: P._atkKind, atk: ATK_ANIM, frames: PUFF_SPIT_AT.length, last: PUFF_SPIT_AT[PUFF_SPIT_AT.length - 1] };
    })()`);
    expect(r.len).toBe(r.atk);
    expect(r.anim).toBe(r.atk);
    expect(r.kind, 'still the kind the move was read as').toBe('spit');
    expect(r.last, 'every frame starts inside the swing').toBeLessThan(r.atk);
  });
});

describe("online: a client draws the frames from the same state", () => {
  it('ships nothing it did not already ship, and the swing timer, its length and its kind are all the frames need', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){ ${ARENA()}
      P.atkCd = 0; doAttack(P);
      var wire = netFighter(P);
      // the client's rebuild of her, as applySnapshot makes it
      var c = { name: wire.name, kit: wire.kit, _atkAnim: wire.swing || 0, _atkKind: wire.swingKind || null, _atkLen: wire.swingLen, _hurtAnim: wire.hurtT, flash: wire.flash, f: 1 };
      var frames = [];
      for (var e = 0; e < ATK_ANIM; e++){ c._atkAnim = ATK_ANIM - e; frames.push(puffSpitFrame(c)); }
      return { keys: Object.keys(wire), frames: frames, wire: JSON.stringify(wire) };
    })()`);
    expect(r.keys).toContain('swing');
    expect(r.keys).toContain('swingKind');
    expect(r.keys.filter((k) => /^_/.test(k)), 'no render-only field leaks onto the wire').toEqual([]);
    expect(r.wire).not.toMatch(/_vis|visOrigin|visLive/i);
    expect(new Set(r.frames).size, 'the client walks through all four frames').toBe(4);
  });
});

describe("online, end to end: the client draws her spit from the host's snapshots", () => {
  it("walks the client's copy of her through the frames of a spit the host fired", async () => {
    const p = await makePair({ hostFighter: 'Puffball', cliFighter: 'Firey', mode: 'ffa', count: 2, stageId: 'goiky' });
    for (let i = 0; i < 20; i++) p.frame(null);
    const pose = () => p.Cc.eval("puffPose(fighters.find(function(f){ return f.name==='Puffball'; }))");
    expect(pose(), 'at rest she is her plain self on the client too').toBe(null);
    const seen = [];
    p.frame(null, 'fighters[0].atkCd=0; doAttack(fighters[0]);');
    seen.push(pose());
    for (let i = 0; i < 26; i++) { p.frame(null); seen.push(pose()); }
    const order = seen.filter((s, i) => s !== seen[i - 1]).filter(Boolean);
    expect(order, "the client sees the pictures in order").toEqual(expect.arrayContaining(['puff', 'spit', 'recoil', 'settle']));
    expect(order.indexOf('spit')).toBeLessThan(order.indexOf('recoil'));
    expect(order.indexOf('recoil')).toBeLessThan(order.indexOf('settle'));
    expect(seen[seen.length - 1], 'and her plain render is back once the swing is over').toBe(null);
  }, 240000);
});

describe('the spit frames: her own render, four pictures of it', () => {
  const FILES = [1, 2, 3, 4].map((n) => `puffball-spit-${n}.png`);

  it('are four PNGs, as tall as her render, with transparent corners and room for the cheeks', () => {
    const plain = readPng('puffball.png');
    const pngs = FILES.map(readPng);
    for (const [i, p] of pngs.entries()) {
      expect(p.height, FILES[i]).toBe(plain.height);
      expect(p.width, `${FILES[i]} is the render with room for the puffed cheeks`).toBeGreaterThan(plain.width);
      for (const [x, y] of [[0, 0], [p.width - 1, 0], [0, p.height - 1], [p.width - 1, p.height - 1]]) {
        expect(p.data[(y * p.width + x) * 4 + 3], `${FILES[i]}: the corner ${x},${y} is clear`).toBe(0);
      }
      for (let y = 0; y < p.height; y++) {
        for (const x of [0, p.width - 1]) expect(p.data[(y * p.width + x) * 4 + 3], `${FILES[i]}: nothing of her is cut off at the side`).toBeLessThan(9);
      }
      expect(clearOf(p), `${FILES[i]} is genuinely transparent`).toBeGreaterThan(0.1);
    }
    expect(new Set(pngs.map((p) => p.width)).size, 'one size for all four, so none of them moves her').toBe(1);
  });

  it('are four different pictures, and none of them is her plain render', () => {
    const plain = readPng('puffball.png'), pngs = FILES.map(readPng), W = pngs[0].width, off = Math.round((W - plain.width) / 2);
    const diff = (a, b) => { let n = 0; for (let i = 0; i < a.data.length; i += 4) if (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) + Math.abs(a.data[i + 3] - b.data[i + 3]) > 60) n++; return n / (a.width * a.height); };
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) expect(diff(pngs[i], pngs[j]), `${FILES[i]} vs ${FILES[j]}`).toBeGreaterThan(0.01);
    // her plain render, laid on the same wider canvas
    const wide = new PNG({ width: W, height: plain.height });
    for (let y = 0; y < plain.height; y++) for (let x = 0; x < plain.width; x++) { const s = (y * plain.width + x) * 4, d = (y * W + x + off) * 4; for (let c = 0; c < 4; c++) wide.data[d + c] = plain.data[s + c]; }
    for (let i = 0; i < 4; i++) expect(diff(pngs[i], wide), `${FILES[i]} vs her plain render`).toBeGreaterThan(0.01);
  });

  it('are drawn at the render\'s own size: the box that fits each one keeps her pixel density', () => {
    const { window: w } = loadMonolith();
    const boxes = w.eval(`(function(){ var P = FIGHTER_ANIM.Puffball.poses, o = {};
      for (var k in P) o[k] = { src: P[k].src, imgH: P[k].imgH, imgW: P[k].imgW, flip: P[k].flip, float: P[k].float, lift: P[k].floatLift, amp: P[k].floatAmp };
      var b = SPRITES.Puffball; o.__plain = { src: b.src, imgH: b.imgH, imgW: b.imgW, flip: !!b.flip, float: b.float, lift: b.floatLift, amp: b.floatAmp };
      return o; })()`);
    const R = 24, plain = readPng('puffball.png');
    const fit = (b, pw, ph) => Math.min(b.imgH * R, b.imgW * R / (pw / ph));   // drawSpriteBody's contain-fit
    const base = fit(boxes.__plain, plain.width, plain.height) / plain.height;
    for (const k of ['puff', 'spit', 'recoil', 'settle']) {
      const p = readPng(boxes[k].src.replace('assets/sprites/', ''));
      expect(fit(boxes[k], p.width, p.height) / p.height, `${k}: pixels per pixel`).toBeCloseTo(base, 3);
      expect(boxes[k].flip, `${k} faces the way she does`).toBe(boxes.__plain.flip);
      expect([boxes[k].float, boxes[k].lift, boxes[k].amp], `${k} hovers exactly as she does`).toEqual([boxes.__plain.float, boxes.__plain.lift, boxes.__plain.amp]);
    }
  });

  it('are credited, and the generator that cut them is in the repo', () => {
    for (const f of FILES) expect(credits, `${f} is credited`).toContain(`\`${f}\``);
    expect(credits).toContain('scripts/make-puffball-spit.mjs');
    expect(credits, 'and they say whose art they are cut from').toContain('Tpot_renders0042.png');
    expect(existsSync('scripts/make-puffball-spit.mjs')).toBe(true);
    const poses = loadMonolith().window.eval(`Object.keys(FIGHTER_ANIM.Puffball.poses).map(function(k){ return FIGHTER_ANIM.Puffball.poses[k].src; })`);
    for (const f of FILES) expect(poses, `${f} is one of her poses, so it is not dead weight`).toContain(`assets/sprites/${f}`);
  });
});
