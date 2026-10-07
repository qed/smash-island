import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// THE FRAME LAYER (index.html, "THE FRAME LAYER") is render-only, and works for every fighter that has frames, in every moment, bare and in each skin.
// 1. The same scripted match is played twice, both times drawn every tick -- frames on, and frames stripped (FRAME_ON false) -- once bare and once in a skin, and every
//    number the sim can see has to come out the same, with the same dice left over. A launch every 90 ticks brings up the tumble, the hit and the rest. (Not drawing at all
//    is another thing: draw() itself has always touched a little of what the sim reads. This holds the FRAMES to it.)
// 2. Every fighter with frames (every row of FRAME_DATA) draws every moment -- each kind of swing at six ticks, a walk, a run, a jump, a fall, a flinch, a tumble, a
//    charge -- bare and in each of their skins, without throwing, and with every number of the frame finite.
// The fighters of the first test: the pilot of nine, then each batch of the roster as it lands (one batch a commit).
const FIGHTERS = ['Firey', 'Leafy', 'Bubble', 'Pen', 'Knife', 'Balloon', 'Tapey', 'Silver Spoon', 'Puffball',
  'Needle', 'Pin', 'Snowball', 'Bomby', 'Teardrop', 'Flower',
  'Tennis Ball', 'Blocky', 'Coiny', 'Pencil', 'Golf Ball', 'Rocky',
  'Book', 'Fries', 'Gelatin', 'Nickel', 'Ruby', 'Yellow Face',
  'Barf Bag', 'Basketball', 'Bell', 'Bracelety', 'Fanny', 'Gaty',
  'Grassy', 'Lightning', 'Liy', 'Lollipop', 'Marker', 'Money',
  'Naily', 'Remote', 'Rose', 'Saw', 'TV', 'Woody',
  'Toothpaste', 'Dora', 'Match', 'David', 'Firey Jr.', 'Fern',
  'Ruler', 'Sidewalky', 'Balloony', 'Roboty', 'Profily', 'Ice Cube',
  'Cake', 'Donut', 'Bomb', 'Lightbulb', 'Paintbrush', 'Taco (II)',
  'Bow', 'Marshmallow', 'Apple', 'Baseball', 'Pickle', 'Nickel (II)',
  'Paper', 'Microphone', 'Salt', 'Test Tube', 'Trophy', 'Bonesaw',
  'Spikey', 'Cheesy', 'Dough', 'Box', 'Goo', 'Lifering',
  'Candle', 'Cammy', 'Fan', 'Soap', 'Starfruit', 'Blueberry',
  'Tissues', 'Yin-Yang', 'Cherries', 'Clover', 'Jack', 'Magnet'];
const OFF = (src) => { expect(src, 'the switch is where the test expects it').toContain('const FRAME_ON = true;'); return src.replace('const FRAME_ON = true;', 'const FRAME_ON = false;'); };
// every picture "decoded" (a stand-in with a size), so drawFighter runs the layer's passes instead of the vector fallback
const FAKE = `window.__fake = function(sp){ sp._req = true; sp.img = { complete:true, naturalWidth:150, naturalHeight:200 }; }; true`;

const play = (name, frames) => {
  const { window: w } = loadMonolith(0xC0FFEE, frames ? undefined : OFF);
  w.eval(FAKE);
  return w.eval(`(function(){
    var skinId = COSMETICS.filter(function(c){ return c.kind === 'skin' && c.fighter === ${JSON.stringify(name)}; })[0].id, A, B, moments = {};
    __fake(SPRITES[${JSON.stringify(name)}]); __fake(cosSkinSprite(cosItem(skinId), ${JSON.stringify(name)}));
    var duel = function(skin){
      SETTINGS.mode = 'ffa'; SETTINGS.count = 2; SETTINGS.itemRate = 0; SETTINGS.items = false; running = true; startMatch();
      A = makeFighter(ROSTER.find(function(r){ return r.name === ${JSON.stringify(name)}; }), 300, groundY() - 24, 0); B = makeFighter(ROSTER.find(function(r){ return r.name === 'Coiny'; }), 520, groundY() - 24, 1);
      A.team = 0; B.team = 1; A.controller = 'ai'; B.controller = 'ai'; A.you = false; B.you = false; A.stocks = 9; B.stocks = 9; fighters = [A, B];
      window.cosOf = function(f){ return f === A && skin ? { skin: skin } : null; };
      var rec = [];
      for (var t = 0; t < 240; t++){
        if (t % 90 === 45){ A.hitstun = 16; A.vx = 15; A.vy = -9; A.onground = false; A.pct += 30; }   // launched
        step(); draw(); frPose(A, FRAME_DATA[A.name], skin ? cosSkinSprite(cosItem(skin), A.name) : SPRITES[A.name]); moments[_FP.mom] = 1;
        rec.push([A.x, A.y, A.vx, A.vy, A.pct, A.hitstun, A.atkCd, A.spCd, A._atkAnim, A.flash, A.onground, A.face, B.x, B.y, B.vx, B.pct, B.hitstun, projectiles.length, particles.length]
          .map(function(v){ return typeof v === 'number' ? Math.round(v*1000) : v; }).join('|'));
      }
      return rec;
    };
    return { bare: duel(null), skinned: duel(skinId), rng: Math.random(), moments: Object.keys(moments).sort().join('') };
  })()`);
};

describe('the frame layer is render-only: the same match, tick for tick, with the frames drawn or stripped', () => {
  for (const name of FIGHTERS) {
    it(`${name}: bare and in a skin, the same ticks and the same dice`, () => {
      const on = play(name, true), off = play(name, false);
      expect(on.moments, 'the frames really came up: moving, and the tumble of a launch').toMatch(/3.*5|5.*3/);
      expect(off.moments, 'and stripped there are none').toBe('0');
      expect(off.bare).toEqual(on.bare);
      expect(off.skinned).toEqual(on.skinned);
      expect(off.rng).toBe(on.rng);
    });
  }
});

describe('every fighter with frames draws every moment, bare and in each of their skins', () => {
  it('draws without throwing, and every number of every frame is finite', () => {
    const { window: w } = loadMonolith();
    w.eval(FAKE);
    const bad = w.eval(`(function(){
      SETTINGS.mode = 'ffa'; SETTINGS.count = 2; SETTINGS.itemRate = 0; running = true; startMatch();
      var out = [], moments = [function(f){}, function(f){ f.vx = 2; hazardT = 20; }, function(f){ f.vx = 7; hazardT = 20; }, function(f){ f.onground = false; f.vy = -9; }, function(f){ f.onground = false; f.vy = 12; },
        function(f){ f._hurtAnim = 9; f.vx = 3; }, function(f){ f._hurtAnim = 9; f.flash = 8; }, function(f){ f.hitstun = 15; f.vx = 14; f.vy = -9; f.onground = false; }, function(f){ f.smashHold = 20; },
        function(f){ f._plunge = { from:0, life:9 }; f.onground = false; f.vy = 16; },
        function(f){ f._g1Pose = 'flaps'; f._g1PoseUntil = hazardT + 12; }, function(f){ f._g1Pose = 'limp'; f._g1PoseUntil = hazardT + 12; }, function(f){ f._g1Pose = 'puddle'; f._g1PoseUntil = hazardT + 12; },
        function(f){ f._dashing = 8; }, function(f){ f.healing = 5; f.rooted = 5; }, function(f){ f._windup = { smash: true }; },
        function(f){ f._windup = { b3: 'grip' }; }, function(f){ f._windup = { b3: 'snap' }; }, function(f){ f._flameOutUntil = hazardT + 12; f.weakened = 5; },
        function(f){ f._windup = { nap: true }; }, function(f){ f._yangT = hazardT + 12; }, function(f){ f._mindfulT = hazardT + 12; }];
      FR_KINDS.forEach(function(k){ [0, 3, 6, 9, 12, 15].forEach(function(e){ moments.push(function(f){ armAtk(f, ATK_ANIM, k); f._atkAnim = ATK_ANIM - e; }); }); });
      Object.keys(FRAME_DATA).forEach(function(n){
        var skins = [null].concat(COSMETICS.filter(function(c){ return c.kind === 'skin' && c.fighter === n; }).map(function(c){ return c.id; }));
        skins.forEach(function(id){
          __fake(SPRITES[n]); if(id) __fake(cosSkinSprite(cosItem(id), n));
          window.cosOf = function(){ return id ? { skin: id } : null; };
          moments.forEach(function(m, i){
            var f = makeFighter(ROSTER.find(function(r){ return r.name === n; }), 300, groundY() - 24, 1); f.you = false; f.controller = 'still'; fighters = [f]; hazardT = 100;
            try { m(f); if(f._atkAnim > 0){ f._atkPhase = atkPhase(f); f._atkProg = atkPhaseK(f); } drawFighter(f); } catch(e){ out.push(n + ' ' + id + ' #' + i + ': ' + e.message); }
            for(var k in _FP) if(typeof _FP[k] === 'number' && !isFinite(_FP[k])) out.push(n + ' ' + id + ' #' + i + ' ' + k);
          });
        });
      });
      return out; })()`);
    expect(bad).toEqual([]);
  });
});
