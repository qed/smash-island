import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';

// THE SHOW'S OWN ART FOR WHAT A FIGHTER THROWS.
//
// "add sprites from the actual show (puffballs rainbow vomit thing, moneys coins, etc.)". Seven of the
// thrown things exist as the show's art and ARE the thrown thing (a character render flying across the
// screen is the wrong result; those were rejected on sight): Ice Cube's shatter, Cake's slice, the
// Supervan, Bubble's bubble, Pen's cap, the price tag, the ruler. They draw in place of the glyph once
// loaded and never before, so a headless boot -- which never loads an image -- draws what it always did.
// Puffball's rainbow vomit has no clean asset, so it is drawn the way the show draws it.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const counting = `new Proxy({}, { get:function(_t,p){
  if(p==='canvas') return {width:1100,height:720};
  if(p==='measureText') return function(){ return {width:0}; };
  return function(){ calls[p] = (calls[p]||0) + 1; if (p==='scale') scales.push([arguments[0], arguments[1]]); }; }, set:function(){ return true; } })`;

describe('the registry', () => {
  it('names only shapes the game draws, and every file exists', () => {
    const r = W.eval(`Object.keys(ATTACK_SPRITES).map(function(k){ return [k, !!PROJ_SHAPE[k], ATTACK_SPRITES[k].src]; })`);
    expect(r.length).toBe(7);
    for (const [k, hasShape, src] of r) {
      expect(hasShape, `${k} has no glyph to fall back on`).toBe(true);
      expect(existsSync(`artifacts/V1/${src}`), `${src} is missing`).toBe(true);
    }
  });

  it('every file is a real PNG at projectile size, and alpha survives the pipeline', () => {
    // Transparency is verified at fetch time on the UNCROPPED source (scripts/fetch-attack-sprites.mjs
    // rejects anything under 12% clear, which is what a screenshot looks like). After cropping to the
    // alpha box a rectangle -- the ruler, the price tag -- can legitimately have no clear pixel left, so
    // the shipped files are checked for being real PNGs at size, and alpha for surviving on the one
    // that must have it: the shatter is two thirds clear.
    const srcs = W.eval('Object.keys(ATTACK_SPRITES).map(function(k){ return ATTACK_SPRITES[k].src; })');
    const clearOf = (src) => { const png = PNG.sync.read(readFileSync(`artifacts/V1/${src}`));
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      return { png, clear: clear / (png.width * png.height) }; };
    for (const src of srcs) {
      const { png } = clearOf(src);
      expect(png.width * png.height, `${src} is empty`).toBeGreaterThan(0);
      expect(Math.max(png.width, png.height), `${src} is not projectile-sized`).toBeLessThanOrEqual(128);
    }
    expect(clearOf('assets/sprites/attacks/shatter.png').clear).toBeGreaterThan(0.3);
  });

  it('the credits name every file and its source', () => {
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const srcs = W.eval('Object.keys(ATTACK_SPRITES).map(function(k){ return ATTACK_SPRITES[k].src; })');
    for (const src of srcs) expect(credits, `${src} is not credited`).toContain(src.split('/').pop());
    expect(credits).toContain('battlefordreamisland');
  });

  it('Tennis Ball is left out, on purpose', () => {
    expect(W.eval("['serve','gadgetMine','gadgetTurret','gadgetBattery','gadgetShot','gadgetAcid'].filter(function(k){ return ATTACK_SPRITES[k]; })")).toEqual([]);
  });
});

describe('drawing', () => {
  it('until the art has loaded there is no image, and a shot still draws its glyph without throwing', () => {
    const r = W.eval(`(function(){
      var im = attackImage('cap');
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 700, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; fighters=[A,D]; step(); A.spCd=0;
      doSpecial(A); for (var i=0;i<6;i++) step();
      var err = null; try { projectiles.forEach(function(p){ drawProjectile(p); }); } catch(e){ err = e.message; }
      return { im: im, shots: projectiles.length, err: err };
    })()`);
    expect(r.im).toBe(null);
    expect(r.shots).toBeGreaterThan(0);
    expect(r.err).toBe(null);
  });

  it('a loaded image is drawn in place of the glyph, scaled with the shot', () => {
    const r = W.eval(`(function(){
      var calls = {}, scales = [];
      var c = ${counting};
      var im = { complete:true, naturalWidth:63, naturalHeight:56 };
      drawAttackSprite(c, { x:100, y:100, vx:5, vy:0, r:8 }, 'shatter', im);
      return calls;
    })()`);
    expect(r.drawImage).toBe(1);
    expect(r.fill || 0).toBe(0);
    expect(r.stroke || 0).toBe(0);
  });

  it('the van faces the way it drives', () => {
    const r = W.eval(`(function(){
      var out = {};
      ['right','left'].forEach(function(dir){
        var calls = {}, scales = [];
        var c = ${counting};
        drawAttackSprite(c, { x:100, y:100, vx: dir==='left' ? -6 : 6, vy:0, r:8 }, 'van', { complete:true, naturalWidth:121, naturalHeight:56 });
        out[dir] = scales.some(function(s){ return s[0] === -1; });
      });
      return out;
    })()`);
    expect(r.right).toBe(false);
    expect(r.left).toBe(true);
  });

  it("Puffball's rainbow is stripes with no outline", () => {
    const r = W.eval(`(function(){
      var calls = {}, scales = [];
      var c = ${counting};
      PROJ_SHAPE.fly.draw(c, 8, { x:0, y:0, vx:5, vy:0, r:8, color:'#e6a6e0' });
      return calls;
    })()`);
    expect(r.fillRect || 0, 'the stripes').toBeGreaterThanOrEqual(11);
    expect(r.fill || 0, 'the arc head').toBeGreaterThanOrEqual(6);
    expect(r.stroke || 0).toBe(0);
  });
});
