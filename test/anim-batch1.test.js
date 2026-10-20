import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { PNG } from 'pngjs';
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';
import { makePair } from './helpers/net-pair.js';

// "animations should be like pb's animations" (the owner, 2026-10-19) -- "First batch, full sets": Donut, Sidewalky, Lollipop, Box, Tissues, Goo,
// Bell, Paintbrush and Teddy Bear each wear a set of pictures for their moves, their hits, their launch, a held smash and the result screen,
// swapped in for their plain render the way Puffball's spit is (test/puffball-anim.test.js is the model). All nine read ONE table (POSE_SETS)
// through one reader (poseKey) and one drawer (poseBody). For each fighter this pins:
//   · the right picture for the right move and state, frame by frame, from the real moves (doSpecial and the rest), and drawn: the picture
//     drawFighter puts on the canvas is that picture, and no other;
//   · a hit stops the move's pictures (the hit's own picture, or the plain render where the set has none);
//   · ONLINE-SAFE: a client rebuilt from the wire (netFighter, as applySnapshot rebuilds it) wears the same picture as the host on every tick,
//     and the wire carries nothing new;
//   · the pictures themselves: on disk, at most 200px tall, transparent, drawn at the fighter's own size, credited, on the manifest;
//   · a skin keeps its own picture, and the result screen shows the set's win picture.
// Then, for all nine at once: drawing the sets changes nothing in the sim (an FFA, drawn and not drawn, tick for tick), and Puffball's spit is
// still read off her row of the table.

const SPRITES_DIR = 'artifacts/V1/assets/sprites';
const credits = readFileSync(`${SPRITES_DIR}/CREDITS.md`, 'utf8');
const html = readFileSync('artifacts/V1/index.html', 'utf8');
const MAN = { ...JSON.parse(readFileSync('scripts/sprite-manifest.json', 'utf8')), ...JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8')) };
const readPng = (f) => PNG.sync.read(readFileSync(`${SPRITES_DIR}/${f}`));

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

// A duel in the middle of the stage: the fighter F at x=400 facing right, a still Leafy beside them (in reach of a grab).
const ARENA = (name, foeX = 470) => `
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; SETTINGS.items=false; running=true;
  startMatch(); worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var F = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), ${foeX}, groundY()-24, 1);
  F.team=0; D.team=1; F.controller='still'; D.controller='still'; F.stocks=9; D.stocks=9; F.you=false; D.you=false; F.face=1; D.face=-1;
  fighters=[F,D]; step(); [F,D].forEach(function(f){ f.invuln=0; f.hitstun=0; f.atkCd=0; f.spCd=0; f.smCd=0; f.fnCd=0; f.flash=0; });
  F.onground=true; F.vx=0; F.vy=0;`;
// Every picture of the fighter's set "decoded", each tagged with its key, and their plain render tagged 'plain', so a drawImage says WHICH it drew.
const FAKE_DECODED = (name) => `
  (function(){
    var P = FIGHTER_ANIM[${JSON.stringify(name)}].poses, tag = function(sp, t){ sp._req = true; sp.img = { complete:true, naturalWidth:150, naturalHeight:200, tag:t }; };
    tag(SPRITES[${JSON.stringify(name)}], 'plain');
    for (var k in P) tag(P[k], k);
  })();`;
// The moves, as the game starts them.
const ACT = { jab: 'doAttack(F)', special: 'doSpecial(F)', up: 'doUpSpecial(F)', down: 'doDownSpecial(F)', smash: 'F.smashHold=0; doSmash(F, 1)',
  finisher: 'doAttackSpecial(F)', dt: 'doGroundMove(F)' };
// The distinct pictures in the order they came, dropping the plain render ('-').
const runs = (seq) => seq.filter((s, i) => s !== seq[i - 1]).filter((s) => s !== '-');

// What each fighter's set must do. `moves`: the move started, and the pictures it must show, in order, from its first tick to its end (a loop is
// checked for being only its own frames). `states`: a state set on a still fighter, and the picture.
const SCREECH = Array.from({ length: 15 }, (_, i) => `screech-${String(i + 1).padStart(2, '0')}`);
const SPEC = {
  Donut: { moves: { jab: ['o', 'open-side', 'smile-side'], finisher: ['frown-side', 'open-side', 'smile-side'], special: ['roll'], up: ['up'],
      down: ['frown', 'open', 'n'], smash: ['angry', 'open-side', 'smile-side'], dt: ['n-side', 'kick-fwd', 'smile-side'] },   // (the kick's leg ahead of him: 'kick' itself is Rear Roll's, behind)
    hurt: ['screeched'], states: { ko: 'o', charge: 'angry' }, win: 'up' },
  Sidewalky: { moves: { special: ['enraged'], smash: ['crush', 'enraged'], finisher: ['crush', 'enraged'], up: ['jump'], down: ['brace'] },
    hurt: ['breaking', 'cracked'], states: { charge: 'crush', frozen: 'frozen', armor: 'brace' }, ko: ['fall-1', 'fall-2', 'fall-3', 'fall-4', 'fall-5'], win: 'laughing' },
  Lollipop: { moves: { special: ['sucker'], up: ['twirl-1', 'twirl-2', 'twirl-3', 'twirl-6'], smash: { loop: SCREECH } },
    hurt: ['flung-1', 'flung-2'], states: { ko: 'pieces' }, charge: SCREECH, win: 'laughing' },
  Box: { moves: { special: ['flaps-1', 'flaps-2', 'flaps-3', 'flaps-4'], up: ['running'], down: ['limp'] },
    hurt: ['panicked'], states: { ko: 'damaged', armor: 'limp' }, win: 'smiling' },
  Tissues: { moves: { jab: ['face-1'], finisher: ['face-1'], special: ['sneeze', 'face-3'], up: ['sneeze', 'face-3'], smash: ['sneeze', 'face-4'] },
    hurt: ['scared'], states: { ko: 'out', charge: 'sniff', frozen: 'face-2' }, win: 'happy' },
  Goo: { moves: { jab: ['arm'], finisher: ['arm'], up: ['hand'], special: { then: ['engulf-1', 'engulf-2', 'engulf-3', 'engulf-4'], hold: ['engulf-5', 'engulf-6'] } },
    hurt: ['scream'], states: { ko: 'splat' }, win: 'happy' },
  Bell: { moves: { jab: ['spin-8', 'spin-1', 'spin-2', 'spin-1'], finisher: ['spin-8', 'spin-1', 'spin-2', 'spin-1'], special: ['before-ring', 'ding'],
      up: ['spin-1', 'spin-2', 'spin-3', 'spin-4', 'spin-5', 'spin-6', 'spin-7', 'spin-8', 'spin-1'], down: ['avoid'], smash: ['angry', 'ding'] },
    hurtLoop: ['zapped-1', 'zapped-2'], states: { charge: 'angry', armor: 'avoid' }, ko: ['zapped-1', 'zapped-2'], win: 'happy' },
  Paintbrush: { moves: { up: ['rage-2'] }, hurt: ['shocked'], states: { ko: 'tired' }, win: 'win',
    meter: [[0, null], [33, null], [34, 'rage-1'], [66, 'rage-1'], [67, 'rage-2'], [98, 'rage-2'], [100, 'rage-3']] },
  'Teddy Bear': { moves: { special: ['laugh-01'], up: ['fists'], finisher: ['fists'], down: ['mad'], smash: ['mad'] },
    hurt: ['paint', 'no'], states: { ko: 'grief', charge: 'mad' }, winLoop: Array.from({ length: 17 }, (_, i) => `laugh-${String(i + 1).padStart(2, '0')}`) },
};
const LEGACY = ['limp', 'giant', 'puddle', 'nap'];   // the older swaps, host only (Box's g1 limp, Goo's giant and puddle, Tissues' nap); Box's g1 flaps no longer follows her four flap frames
const STATE = { ko: 'F.hitstun = 12; F.vx = 12; F.vy = -6; F.onground = false;', charge: 'F.smashHold = 20;', frozen: 'F.frozen = 40;', armor: 'F.armor = 20;' };

// The client's copy of the fighter, rebuilt from the wire the way applySnapshot rebuilds it (only the fields poseKey can read).
const CLIENT = `function(o){ var w = netFighter(o); return { name: w.name, kit: w.kit, vx: w.vx, vy: w.vy, onground: w.onground, hitstun: w.hitstun, flash: w.flash,
  _atkAnim: w.swing || 0, _atkKind: w.swingKind || null, _atkMove: w.swingMove || null, _atkLen: w.swingLen, _hurtAnim: w.hurtT, smashHold: w.smashHold,
  _windup: (w.charge && typeof w.charge === 'object') ? w.charge : null, rooted: w.rooted, frozen: w.frozen, armor: w.armor, _fury: w._fury }; }`;

for (const [name, spec] of Object.entries(SPEC)) {
  describe(`${name}: the pose set`, () => {
    it('shows the right picture for each move, frame by frame, from the real moves', () => {
      const { window: w } = loadMonolith(0xC0FFEE);
      for (const [act, want] of Object.entries(spec.moves)) {
        const seq = w.eval(`(function(){ ${ARENA(name)} ${ACT[act]}; var s = [];
          for (var t = 0; t < 64; t++){ s.push(poseKey(F) || '-'); step(); } return s; })()`);
        if (want.then) {   // the frames in order, then a loop for as long as the hold lasts
          const got = runs(seq);
          expect(got.slice(0, want.then.length), `${act}: the pictures, in order`).toEqual(want.then);
          expect(new Set(got.slice(want.then.length)), `${act}: then the hold's loop`).toEqual(new Set(want.hold));
        } else if (want.loop) {
          const got = runs(seq);
          expect(got.length, `${act}: the loop plays`).toBeGreaterThan(4);
          expect(got.every((k) => want.loop.includes(k)), `${act}: only its own frames (${got.join(' ')})`).toBe(true);
        } else expect(runs(seq), `${act}: the pictures, in order`).toEqual(want);
        expect(seq[seq.length - 1], `${act}: the plain render is back after it`).toBe('-');
      }
    });

    it('draws that picture and no other, without washing it white with its own attack flash', () => {
      const { w, rec } = bootRecording();
      w.eval(ARENA(name)); w.eval(FAKE_DECODED(name));
      const [act] = Object.entries(spec.moves).find(([, v]) => Array.isArray(v) && v.length > 1) || Object.entries(spec.moves)[0];
      w.eval(ACT[act]);
      const seen = [];
      for (let t = 0; t < 64; t++) {
        rec.length = 0;
        w.eval('drawFighter(F)');
        const tags = [...new Set(rec.filter((c) => c.op === 'drawImage').map((c) => c.args[0] && c.args[0].tag).filter(Boolean))];
        expect(tags.length, `tick ${t}: one picture of them (${tags.join(',')})`).toBe(1);
        const key = w.eval('poseKey(F)');
        expect(tags[0], `tick ${t}: the picture drawn is the one poseKey names`).toBe(key || (LEGACY.includes(tags[0]) ? tags[0] : 'plain'));   // (an older host-only hold may follow a move)
        if (key && w.eval('F._atkAnim > 0 && F.flash > 0 && !(F._hurtAnim > 0)')) {
          expect(rec.filter((c) => c.op === 'drawImage' && c.args[0] && c.args[0].tagName === 'CANVAS').length, `tick ${t}: no white wash on ${key}`).toBe(0);
        }
        seen.push(tags[0]);
        w.eval('step()');
      }
      expect(seen.filter((s) => s !== 'plain').length, `${act}: its pictures were drawn`).toBeGreaterThan(3);
      expect(seen[seen.length - 1], 'and the plain render after it').toBe('plain');
    });

    it('stops the move when hit: the hit shows instead (its own picture, frame by frame)', () => {
      const { window: w } = loadMonolith(0xC0FFEE);
      const act = Object.keys(spec.moves)[0];
      const r = w.eval(`(function(){ ${ARENA(name)} ${ACT[act]}; step(); step(); var during = poseKey(F);
        F._hurtAnim = HURT_ANIM; F.flash = 8; var hit = [];
        for (var i = 0; i < HURT_ANIM; i++){ hit.push(poseKey(F) || '-'); F._hurtAnim--; hazardT++; }
        return { during: during, hit: hit, moves: Object.keys(POSE_SETS[F.name].moves).map(function(k){ return POSE_SETS[F.name].moves[k]; }) }; })()`);
      expect(r.during, 'mid-move it wears a move picture').toBeTruthy();
      if (spec.hurt) expect(runs(r.hit), 'the hit, in order').toEqual(spec.hurt);
      if (spec.hurtLoop) expect(runs(r.hit).every((k) => spec.hurtLoop.includes(k)) && runs(r.hit).length >= 2, `the hit's flicker (${r.hit.join(' ')})`).toBe(true);
      if (!(spec.hurt || spec.hurtLoop).includes(r.during)) expect(r.hit, 'the move picture is gone the moment the hit lands').not.toContain(r.during);
      expect(r.hit, 'the whole reaction shows the hit').not.toContain('-');
      const still = w.eval(`(function(){ ${ARENA(name)} return poseKey(F); })()`);
      expect(still, 'standing still they are their plain self').toBe(null);
    });

    it('wears the state pictures: launched, a held smash, frozen, a brace, a meter', () => {
      const { window: w } = loadMonolith(0xC0FFEE);
      for (const [st, want] of Object.entries(spec.states || {})) {
        expect(w.eval(`(function(){ ${ARENA(name)} ${STATE[st]} return poseKey(F); })()`), st).toBe(want);
      }
      if (spec.ko) {
        const loop = w.eval(`(function(){ ${ARENA(name)} ${STATE.ko} var s = []; for (var i = 0; i < 40; i++){ s.push(poseKey(F)); hazardT++; } return s; })()`);
        expect(new Set(loop), 'launched: the whole loop').toEqual(new Set(spec.ko));
      }
      if (spec.charge) {
        const loop = w.eval(`(function(){ ${ARENA(name)} ${STATE.charge} var s = []; for (var i = 0; i < 40; i++){ s.push(poseKey(F)); hazardT++; } return s; })()`);
        expect(new Set(loop), 'a held smash: the whole loop').toEqual(new Set(spec.charge));
      }
      if (spec.meter) for (const [v, want] of spec.meter) expect(w.eval(`(function(){ ${ARENA(name)} F._fury = ${v}; return poseKey(F); })()`), `rage ${v}`).toBe(want);
      if (spec.meter) for (const act of [`${ACT.jab}; step();`, STATE.charge]) {   // a move with no picture of its own keeps the render and its painted swing, rage or not
        expect(w.eval(`(function(){ ${ARENA(name)} F._fury = 100; ${act} return poseKey(F); })()`), `full rage, then ${act}`).toBe(null);
      }
      // the set is theirs: another fighter in the same states wears nothing of it
      expect(w.eval(`(function(){ ${ARENA('Coiny')} ${STATE.ko} return poseKey(F); })()`)).toBe(null);
    });

    it('is ONLINE-SAFE: a client rebuilt from the wire wears the same picture as the host on every tick, and the wire carries nothing new', () => {
      const { window: w } = loadMonolith(0xC0FFEE);
      const bad = [];
      const acts = Object.keys(spec.moves).map((a) => ACT[a]).concat(['F._hurtAnim = HURT_ANIM; F.flash = 8;', STATE.ko, STATE.charge, STATE.frozen, STATE.armor, 'F._fury = 100;']);
      for (const act of acts) {
        const r = w.eval(`(function(){ ${ARENA(name)} var mk = ${CLIENT}; ${act}; var out = [], keys = {};
          for (var t = 0; t < 40; t++){ var h = poseKey(F), c = poseKey(mk(F));
            if (h !== c) out.push(t + ':' + h + '/' + c);   // (a launch's speed is sent to a tenth, and poseKey reads it to a tenth: the same tick on both)
            Object.keys(netFighter(F)).forEach(function(k){ keys[k] = 1; });
            if (F._hurtAnim > 0) F._hurtAnim--; step(); }
          return { out: out, keys: Object.keys(keys) }; })()`);
        if (r.out.length) bad.push(`${act}: ${r.out.slice(0, 4).join(' ')}`);
        expect(r.keys.filter((k) => /^_/.test(k) && k !== '_fury' && !['_stunFx', '_infected', '_empowerT', '_empower', '_momentumT', '_hasteT', '_bulletT', '_starT', '_yoyleT', '_noBattery', '_taunted', '_grasstree', '_floatT', '_swallow', '_poisonT', '_tpT'].includes(k)), `${act}: no new render-only field on the wire`).toEqual([]);
      }
      expect(bad, 'host and client disagree').toEqual([]);
    });

    it('keeps every picture on disk, at most 200px tall, transparent, at the fighter\'s own size, credited and on the manifest', () => {
      const { window: w } = loadMonolith();
      const P = w.eval(`(function(){ var S = POSE_SETS[${JSON.stringify(name)}], P = FIGHTER_ANIM[${JSON.stringify(name)}].poses, B = SPRITES[${JSON.stringify(name)}], o = {};
        for (var k in S.pics) o[k] = { src: P[k].src, imgH: P[k].imgH, imgW: P[k].imgW, flip: P[k].flip, k: S.pics[k][3] || 1 };
        return { pics: o, base: { src: B.src, imgH: B.imgH || 2.8, imgW: B.imgW || 2.3 } }; })()`);
      const base = readPng(P.base.src.replace('assets/sprites/', '')), R = 24;
      const fit = (b, pw, ph) => Math.min(b.imgH * R, b.imgW * R / (pw / ph));   // drawSpriteBody's contain-fit
      const density = fit(P.base, base.width, base.height) / base.height;
      for (const [k, p] of Object.entries(P.pics)) {
        const file = p.src.replace('assets/sprites/', '');
        expect(existsSync(`${SPRITES_DIR}/${file}`), file).toBe(true);
        const png = readPng(file);
        expect(png.height, `${file} is at most 200px tall`).toBeLessThanOrEqual(200);
        expect(png.data[3], `${file}: the corner is clear`).toBe(0);
        let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
        expect(clear / (png.width * png.height), `${file} is transparent`).toBeGreaterThan(0.05);
        expect(fit(p, png.width, png.height) / png.height * p.k, `${k}: drawn at the render's pixel density`).toBeCloseTo(density, 3);
        expect(credits, `${file} is credited`).toContain(`\`${file}\``);
        const row = MAN[`${name} (${k})`];
        expect(row && row.ok && row.file === file, `${file} has its manifest row`).toBe(true);
        expect([row.width, row.height], `${file}: the row has its size`).toEqual([png.width, png.height]);
        expect(!!row.flip, `${k}: flipped as the row says`).toBe(!!p.flip);
        expect(row.source, `${file}: a source address`).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\//);
        for (const s of row.sources) expect(credits, `${file}: ${s.file} is credited with its address`).toContain(s.source);
      }
    });

    it('a skin keeps its own picture: no picture of the set is drawn on it', () => {
      const { w, rec } = bootRecording();
      w.eval(ARENA(name)); w.eval(FAKE_DECODED(name));
      const has = w.eval(`COSMETICS.some(function(c){ return c.kind === 'skin' && c.fighter === ${JSON.stringify(name)}; })`);
      if (!has) return;
      w.eval(`(function(){ var id = COSMETICS.filter(function(c){ return c.kind === 'skin' && c.fighter === ${JSON.stringify(name)}; })[0].id, sp = cosSkinSprite(cosItem(id), ${JSON.stringify(name)});
        sp._req = true; sp.img = { complete:true, naturalWidth:150, naturalHeight:200, tag:'skin' }; window.cosOf = function(f){ return f === F ? { skin: id } : null; }; })()`);
      const act = Object.keys(spec.moves)[0];
      w.eval(ACT[act]);
      const tags = new Set();
      for (let t = 0; t < 20; t++) { rec.length = 0; w.eval('drawFighter(F); step();'); rec.filter((c) => c.op === 'drawImage').forEach((c) => c.args[0] && c.args[0].tag && tags.add(c.args[0].tag)); }
      expect([...tags], 'only the skin').toEqual(['skin']);
    });

    it('shows the set\'s win picture on the result screen', () => {
      const { w, rec } = bootRecording();
      w.eval(ARENA(name)); w.eval(FAKE_DECODED(name));
      if (spec.winLoop) {
        const got = w.eval(`(function(){ var s = []; for (var t = 0; t < 120; t++){ var sp = poseWinSprite(${JSON.stringify(name)}, t); s.push(sp && sp.img.tag); } return s; })()`);
        expect([...new Set(got)], 'every frame of the laugh, in order').toEqual(spec.winLoop);
        expect(got.slice(0, 6).every((k) => k === spec.winLoop[0]), 'each held for 6 ticks (the GIF\'s 10 a second)').toBe(true);
      } else expect(w.eval(`poseWinSprite(${JSON.stringify(name)}, 30).img.tag`)).toBe(spec.win);
      rec.length = 0;
      w.eval(`(function(){ var g = document.createElement('canvas').getContext('2d'), sp = poseWinSprite(${JSON.stringify(name)}, 10);
        frStageDraw(g, ${JSON.stringify(name)} + ' (win)', sp, FRAME_DATA[${JSON.stringify(name)}], 10, 0, 180, 178, 2); })()`);
      const tags = rec.filter((c) => c.op === 'drawImage').map((c) => c.args[0] && c.args[0].tag).filter(Boolean);
      expect(tags.length, 'the stage draws the win picture whole (no limb rig cut out of it)').toBe(1);
      expect(w.eval(`(function(){ window.cosOf = function(){ return null; }; return poseWinSprite('Coiny', 10); })()`), 'nobody else has one').toBe(null);
    });
  });
}

describe('the nine sets together', () => {
  // Both runs draw every tick (draw() itself is not a no-op for the sim even before these sets: at HEAD a drawn and an undrawn FFA of these nine part
  // at tick 219 by 0.9px), and one has every picture of every set decoded, so the sets are drawn, the other none, so the plain fallback is.
  it('change nothing in the sim: an FFA of all nine plays out tick for tick the same with every picture of the sets drawn or none', () => {
    const play = (drawn) => {
      const { window: w } = loadMonolith(0xBEEF);
      return w.eval(`(function(){
        var NAMES = ${JSON.stringify(Object.keys(SPEC))};
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; SETTINGS.items=false; running=true; startMatch(); worldPlats=[]; summons=[]; projectiles=[];
        fighters = NAMES.map(function(n, i){ var f = makeFighter(ROSTER.find(function(r){ return r.name===n; }), 140 + i*95, groundY()-24, i); f.team = i; f.controller = 'ai'; f.you = false; f.stocks = 3; return f; });
        ${drawn ? `NAMES.forEach(function(n){ var P = FIGHTER_ANIM[n].poses, fk = function(sp){ sp._req = true; sp.img = { complete:true, naturalWidth:150, naturalHeight:200 }; }; fk(SPRITES[n]); for (var k in P) fk(P[k]); });` : ''}
        var rec = [], seen = {}, errs = [];
        for (var t = 0; t < 900; t++){
          step();
          try { draw(); } catch(e){ errs.push(t + ': ' + e.message); }
          ${drawn ? `fighters.forEach(function(f){ var k = poseKey(f); if (k) seen[f.name + ':' + k] = 1; });` : ''}
          if (t % 3 === 0) rec.push(fighters.map(function(f){ return [Math.round(f.x*100), Math.round(f.y*100), Math.round(f.pct*10), f.stocks, f.hitstun|0, f._atkAnim|0].join(','); }).join('|'));
        }
        return { rec: rec, rng: Math.random(), seen: Object.keys(seen), errs: errs };
      })()`);
    };
    const a = play(true), b = play(false);
    expect(a.errs, 'drawing every set throws nothing').toEqual([]);
    expect(a.rec, 'every third tick of the sim').toEqual(b.rec);
    expect(a.rng, 'drawing spends no randomness').toBe(b.rng);
    const who = new Set(a.seen.map((s) => s.split(':')[0]));
    expect(who.size, `the sets really came up in the fight (${a.seen.length} pictures: ${[...who].join(', ')})`).toBeGreaterThanOrEqual(7);
  }, 240000);

  it("reads Puffball's spit off her row of the table, unchanged", () => {
    const { window: w } = loadMonolith();
    expect(w.eval('JSON.stringify([PUFF_SPIT_AT, PUFF_FRAME])')).toBe(JSON.stringify([[0, 3, 8, 13], ['puff', 'spit', 'recoil', 'settle']]));
    expect(w.eval('poseKey(makeFighter(ROSTER.find(function(r){ return r.name==="Puffball"; }), 300, 300, 0))'), 'her own body draws her pictures').toBe(null);
  });

  it('every picture in the table is used by a rule, and every rule names a picture in the table', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){ var out = [];
      Object.keys(POSE_SETS).forEach(function(n){ var S = POSE_SETS[n]; if (!S.pics) return; var used = {}, anim = FIGHTER_ANIM[n];
        var take = function(F){ if (!F) return; if (typeof F === 'string') used[F] = 1; else if (F.loop) F.loop.forEach(function(k){ used[k] = 1; }); else F.forEach(function(r){ used[r[1]] = 1; }); };
        Object.keys(S.moves || {}).forEach(function(k){ take(S.moves[k]); }); ['frozen','ko','hurt','hold','charge','armor','win'].forEach(function(k){ take(S[k]); });
        if (S.meter) S.meter.steps.forEach(function(s){ used[s[1]] = 1; });
        Object.keys(S.pics).forEach(function(k){ if (!used[k]) out.push(n + ': ' + k + ' is never shown'); });
        Object.keys(used).forEach(function(k){ if (!anim.poses[k]) out.push(n + ': ' + k + ' has no picture'); });
      }); return out; })()`);
    expect(r).toEqual([]);
  });
});

describe("online, end to end: a client draws a host's pose set from the snapshots", () => {
  it("walks the client's copy of the host's Bell through RING's wind-up and burst", async () => {
    const p = await makePair({ hostFighter: 'Bell', cliFighter: 'Firey', mode: 'ffa', count: 2, stageId: 'goiky' });
    for (let i = 0; i < 20; i++) p.frame(null);
    const pose = () => p.Cc.eval("poseKey(fighters.find(function(f){ return f.name==='Bell'; }))");
    expect(pose(), 'at rest she is her plain self on the client too').toBe(null);
    p.frame(null, 'fighters[0].spCd=0; doSpecial(fighters[0]);');
    const seen = [pose()];
    for (let i = 0; i < 26; i++) { p.frame(null); seen.push(pose()); }
    expect(seen.filter((s, i) => s !== seen[i - 1]).filter(Boolean), 'the client sees the wind-up, then the burst').toEqual(['before-ring', 'ding']);
    expect(seen[seen.length - 1], 'and her plain render is back once the swing is over').toBe(null);
  }, 240000);
});
