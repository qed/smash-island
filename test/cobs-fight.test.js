import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';

// STEVE COBS, the second secret boss: his fight (cobs-decisions.md). The owner: "Cobs should also be a secret boss ... He
// should be harder ... you can only fight him as knife." / "25000 /j. 2500, and all attacks get harder by tier." / "do the
// thing that you did with One: attacks from Mephone4 and 4S, Springy, and 5 personalized ones. make sure to adapt them to
// him, cuz we arent in the realm of ppl's power taking on the form of their owner." / "All together, every 500" / "can you
// make the fight less gimmicky? I want more projectiles." / "2 metags with 75 hp each" / the passives: "Both in".
// Built on One's model: startCobsFight, COBS_MOVES, COBS_TIERS (five tiers, all stepping together), cobsTakeDamage.
//
// NOTHING HERE IS A BAR FOR HIS DIFFICULTY ("dont tune, cuz thats an agent, not a player"): the fight is checked beatable in
// principle -- every damage path reaches him, his tiers run to 0, he pops and the chain is told -- never that a bot beats it.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// Start his fight the way the chain will: startCobsFight(lineup, opts). onEnd returns true so no result screen is scheduled
// in the middle of the next test. `s` is him, `you` player 1, parked (his attack timer far off, you standing still).
const fight = (lineup, opts, body) => W.eval(`(function(){
  SETTINGS.itemRate=0; SETTINGS.stocks=3; LOCAL_PLAYERS=1; window.__cobsEnd = undefined;
  var __ok = startCobsFight(${JSON.stringify(lineup)}, Object.assign(${JSON.stringify(opts || {})}, { onEnd:function(won){ window.__cobsEnd = won; return true; } }));
  var s = summons.find(function(o){ return o._cobsFight; });
  s._hop = null;   // (the opening hop off the top is tested on its own: a test that places him itself starts with him home)
  var you = fighters[0];
  var park = function(){ s._atkTimer = 1e9; you.controller = 'still'; };
  var floorAt = function(f, x){ f.x = x; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.pct = 0; f.invuln = 0; step(); f.pct = 0; f.invuln = 0; };
  var shots = function(){ return projectiles.filter(function(p){ return p.owner===-2 && p.life > 0; }); };
  ${body}
})()`);
// ('rounds' is 'boomerangs' now: the owner, boss-overhaul-decisions.md Round 7, "Swap for BOOMERANGS!" -- SECURITY ROUNDS! is gone)
const ALL = ['boomerangs', 'van', 'samples', 'chainsaws', 'spikes', 'deploy', 'device', 'portal', 'springs', 'memurder', 'meknife', 'kernelpop', 'hands',
  'deletion', 'ticktock', 'plug', 'keynote', 'metags', 'cannon'];

describe('Steve Cobs is his own boss', () => {
  it('2500 HP, his own attack key, off the Boss Rush roster, on the Meeple backdrop, with his two renders credited', () => {
    const r = W.eval(`({ boss: COBS_BOSS, inRoster: BOSS_ROSTER.some(function(b){ return b.name==='Steve Cobs'; }), oldRow: COBS_ROW.attack,
      src: [BOSS_SPRITE_SRC.cobs, BOSS_SPRITE_SRC.cobshurt], drawn: String(drawBossSprite).indexOf('case "cobshurt"') >= 0, sky: BOSS_ARENA_SKY.meeplehq,
      deck: COBS_DECK.length, specials: COBS_SPECIALS, tiers: Object.keys(COBS_TIERS).length })`);
    expect(r.boss).toEqual({ name: 'Steve Cobs', color: '#f0d010', hp: 2500, big: 2.6, attack: 'cobsfight', arena: 'meeplehq', sprite: 'cobs' });
    expect(r.inRoster, 'never spawned by the gauntlet, never rolled').toBe(false);
    expect(r.oldRow, 'his Boss 11 kit (COBS_ROW) is a different boss under a different key').toBe('cobs');
    expect(r.src).toEqual(['assets/sprites/steve-cobs.png', 'assets/sprites/steve-cobs-hurt.png']);
    expect(r.drawn, 'a drawn cob under the broken-glasses render too').toBe(true);
    expect(Array.isArray(r.sky) && r.sky.length).toBe(2);
    expect(r.deck).toBe(13);
    expect(r.specials).toEqual(['deletion', 'ticktock', 'plug', 'keynote', 'metags', 'cannon']);
    expect(r.tiers, 'every attack has a tier row').toBe(19);
    // the broken-glasses render: File:CobsAFTERAPAINFULDROP.png, transparent, no taller than 200, credited
    const png = PNG.sync.read(readFileSync('artifacts/V1/assets/sprites/steve-cobs-hurt.png'));
    expect(png.height).toBeLessThanOrEqual(200);
    const a = (x, y) => png.data[(y * png.width + x) * 4 + 3];
    expect([a(0, 0), a(png.width - 1, 0), a(0, png.height - 1), a(png.width - 1, png.height - 1)]).toEqual([0, 0, 0, 0]);
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    expect(credits).toMatch(/`steve-cobs-hurt\.png`/);
    expect(credits).toMatch(/CobsAFTERAPAINFULDROP\.png/);
    const manifest = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    expect(manifest['Steve Cobs (hurt)'].file).toBe('steve-cobs-hurt.png');
  });

  it('the story fight is KNIFE ALONE whoever is named, a flat 2500, three stocks, no items, on the big arena; Boss Rush untouched', () => {
    W.eval(`BOSSRUSH = { active:false, bossIdx:3, cleared:7, defeated:false, loop:1, dmgMult:2 }; SETTINGS.mode = 'ffa'; SETTINGS.count = 3;`);
    const r = fight(['Firey', 'Knife'], { story: true }, `
      return { ok:__ok, mode:SETTINGS.mode, active:COBSFIGHT.active, story:COBSFIGHT.story, big:isBig(), names:fighters.map(function(f){ return f.name; }),
        hp:s.hp, max:s.maxHp, mult:s._dmgTakenMult, stocks:you.stocks, items:itemSpawnInterval(), rush:[BOSSRUSH.active, BOSSRUSH.bossIdx, BOSSRUSH.cleared, BOSSRUSH.dmgMult],
        arena:BOSS_ARENA, running:running, you:you.controller, bosses:summons.filter(function(o){ return o.type==='boss'; }).length, hover:s.hover, attack:s.attack,
        gy:groundY(), floor:cobsFloor().y, one:ONEFIGHT.active };`);
    expect(r.ok).toBe(true);
    expect(r.mode).toBe('boss');
    expect(r.active && r.story && r.big && r.running).toBe(true);
    expect(r.names, '"you can only fight him as knife": Firey was named first and is not here').toEqual(['Knife']);
    expect(r.you).toBe('local');
    expect([r.hp, r.max, r.mult]).toEqual([2500, 2500, 1]);
    expect(r.stocks, 'stocks like One\'s story fight').toBe(3);
    expect(r.items, 'no items').toBe(0);
    expect(r.bosses).toBe(1);
    expect([r.hover, r.attack]).toEqual([true, 'cobsfight']);
    expect(r.rush, 'no gauntlet state touched').toEqual([false, 3, 7, 2]);
    expect(r.arena).toBe('meeplehq');
    expect(r.gy, 'he and his attacks stand on the teams map\'s real floor line').toBeCloseTo(r.floor, 6);
    expect(r.one, 'one secret fight at a time').toBe(false);
    const k = fight(['Firey'], { story: true }, `return fighters.map(function(f){ return f.name; });`);
    expect(k, 'even a lineup with no Knife in it').toEqual(['Knife']);
  });

  it('once beaten takes any lineup ("Anyone", like One): allies scale each hit, never the 2500 bar', () => {
    const r = fight(['Firey', 'Leafy', 'Bubble', 'Pencil'], {}, `
      park(); var hp0 = s.hp; var d = cobsTakeDamage(s, 28);
      return { n:fighters.length, names:fighters.map(function(f){ return f.name; }), sides:fighters.map(function(f){ return f.team; }), ai:fighters.slice(1).every(function(f){ return f.controller==='ai'; }),
        max:s.maxHp, mult:s._dmgTakenMult, took:hp0 - s.hp, d:d, stocks:you.stocks };`);
    expect(r.n).toBe(4);
    expect(r.names[0]).toBe('Firey');
    expect(r.sides).toEqual([0, 0, 0, 0]);
    expect(r.ai).toBe(true);
    expect(r.max).toBe(2500);
    expect(r.mult).toBeCloseTo(1 / 2.8, 6);
    expect(r.took).toBeCloseTo(10, 6);
    expect(r.stocks, 'the player\'s own stocks once unlocked').toBe(3);
  });

  it('leaving the fight puts the player\'s own mode, count, stage and pick back; a loss keeps a Rematch that fights him again', () => {
    const r = fight(['Knife'], { story: true }, `
      var prev = COBSFIGHT.prev; endCobsFight(false); var retry = COBSFIGHT.retry && COBSFIGHT.retry.lineup.slice();
      var res = { end:window.__cobsEnd, retry:retry, over:COBSFIGHT.over, title:document.getElementById('resultTitle').textContent };
      go('result'); res.afterResult = { active:COBSFIGHT.active, mode:SETTINGS.mode, retryKept:!!COBSFIGHT.retry };
      startMatch(); res.rematch = { active:COBSFIGHT.active, names:fighters.map(function(f){ return f.name; }), hp:summons.find(function(o){ return o._cobsFight; }).hp };
      go('title'); res.afterTitle = { active:COBSFIGHT.active, retry:COBSFIGHT.retry, mode:SETTINGS.mode };
      return res;`);
    expect(r.end).toBe(false);
    expect(r.retry).toEqual(['Knife']);
    expect(r.title).toBe('Steve Cobs wins');
    expect(r.afterResult.active).toBe(false);
    expect(r.afterResult.retryKept, 'only the result screen keeps the Rematch').toBe(true);
    expect(r.rematch, 'Rematch fights him again from the top').toMatchObject({ active: true, names: ['Knife'], hp: 2500 });
    expect(r.afterTitle).toEqual({ active: false, retry: null, mode: 'ffa' });
  });
});

describe('FIVE TIERS, all attacks stepping up together at 2000, 1500, 1000 and 500 ("All together, every 500")', () => {
  it('every one of the nineteen attacks is at the same tier, and it steps at each line, capped at five', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); var out = [];
      [2001, 2000, 1501, 1500, 1001, 1000, 501, 500, 1].forEach(function(hp){ s.hp = hp; step();
        var tiers = ${JSON.stringify(ALL)}.map(function(k){ return COBS_TIERS[k].indexOf(cobsT(s, k)) + 1; });
        out.push({ hp:hp, tier:cobsTier(s), same:tiers.every(function(t){ return t===tiers[0]; }), phase:s._phase }); });
      return out;`);
    expect(r.map(o => o.tier)).toEqual([1, 2, 2, 3, 3, 4, 4, 5, 5]);
    expect(r.every(o => o.same), 'every attack at the one tier').toBe(true);
    expect(r.map(o => o.phase)).toEqual(r.map(o => o.tier));
  });

  it('one big hit across two lines steps up twice, and each line pays your side what One\'s does: a heal and a stock back', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); you.pct = 250; you.stocks = 1; s.hp = 900; step();
      return { tier:cobsTier(s), marks:s._marks, pct:you.pct, stocks:you.stocks };`);
    expect(r.tier).toBe(4);
    expect(r.marks).toBe(3);
    expect(r.pct, 'three lines, 64 each').toBeCloseTo(250 - 3 * 64, 6);
    expect(r.stocks, 'a stock back per line, never past the three you started with').toBe(3);
  });

  it('the tables rise: at every tier n, speed and damage never fall, and every attack has something that climbs from tier 1 to 5', () => {
    const rows = W.eval(`COBS_TIERS`);
    for (const k of ALL) {
      const T = rows[k];
      expect(T.length, k).toBe(5);
      for (let i = 1; i < 5; i++) {
        expect(T[i].n, `${k} n tier ${i + 1}`).toBeGreaterThanOrEqual(T[i - 1].n);
        expect(T[i].spd, `${k} spd tier ${i + 1}`).toBeGreaterThanOrEqual(T[i - 1].spd);
        expect(T[i].dmg, `${k} dmg tier ${i + 1}`).toBeGreaterThanOrEqual(T[i - 1].dmg);
      }
      expect(T[4].n > T[0].n || T[4].spd > T[0].spd || T[4].dmg > T[0].dmg, `${k} climbs`).toBe(true);
    }
    // "2 metags with 75 hp each" -- and, the owner's nerf of 2026-10-05, "One tag at a time": one MeTag a turn, 75 hp, at every tier
    expect(rows.metags.every(t => t.n === 1 && t.hp === 75)).toBe(true);
  });

  it('every attack FIRES at every tier, with the tier\'s count of shots, summons, rings, panes, portals or Xs', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s.x = you.x + 380; s.y = you.y - 160; s.face = -1;
      var keys = ${JSON.stringify(ALL)}, out = {}, err = null;
      var count = function(k, T){
        var sh = shots();
        switch(k){
          case 'deploy': return summons.filter(function(m){ return m.type==='mephoneunit'; }).length;
          case 'portal': return s._portals.length;
          case 'deletion': return s._xs.length;
          case 'keynote': return s._rings.filter(function(R){ return !R.stress; }).length;   // (from tier 3 the finish adds two stressed rings of its own: the crescendo, Round 7)
          case 'metags': return summons.filter(function(m){ return m.type==='metag'; }).length;
          case 'cannon': return s._ship ? s._ship.left : 0;
          case 'plug': return sh.filter(function(p){ return p.cobsPane; }).length;
          case 'springs': return sh.length - (T.box ? 1 : 0) - (T.clone ? 1 : 0);
          default: return sh.length;
        }
      };
      for (var t=1; t<=5; t++){
        s._marks = t-1;
        keys.forEach(function(k){
          projectiles = projectiles.filter(function(p){ return p.owner!==-2; });
          summons = summons.filter(function(m){ return m===s; });
          s._xs=[]; s._rings=[]; s._ship=null; s._tick=null; s._plug=null; s._portals=[]; s._stompT=0; s._knife=null; s._holdT=0; s._lungeT=0; s._stuckT=0;
          worldPlats = worldPlats.filter(function(p){ return !p._cobsPane && !p._cobsWall && !p._springy; });
          try {
            var T = COBS_TIERS[k][t-1];
            cobsFightTelegraph(s, k, you); var tel = s._tel; s._tel = 0;
            var ret = COBS_MOVES[k](s, you, ++BOSS_ATK_ID);
            var sh = shots(), spd = sh.reduce(function(m, p){ return Math.max(m, Math.hypot(p.vx||0, p.vy||0)); }, 0);
            out[k+'/'+t] = { n:count(k, T), want:T.n, spd:spd, tel:tel, dmgOk: sh.every(function(p){ return p.bossCap != null && p.bossCap >= p.dmg; }),
              extra: k==='ticktock' ? !!s._tick : k==='plug' ? !!s._plug : k==='spikes' ? (ret > 0) : k==='memurder' ? (ret===T.n) : true };
          } catch(e){ err = k + '/' + t + ': ' + (e.stack || e); }
        });
      }
      return { out:out, err:err };`);
    expect(r.err).toBe(null);
    for (const k of ALL) {
      let lastSpd = -1;
      for (let t = 1; t <= 5; t++) {
        const o = r.out[`${k}/${t}`];
        expect(o, `${k} tier ${t} ran`).toBeTruthy();
        expect(o.tel, `${k} tier ${t} has a wind-up`).toBeGreaterThan(0);
        expect(o.dmgOk, `${k} tier ${t}: every shot carries its own cap, so "hitting harder" is not clamped to 22`).toBe(true);
        expect(o.extra, `${k} tier ${t} side effect`).toBe(true);
        if (k === 'spikes') { expect(o.n, `${k} tier ${t} spikes`).toBeGreaterThan(0); continue; }   // how many platforms are near is the arena's business
        if (k === 'kernelpop') { expect(o.n, `${k} tier ${t} kernels`).toBeGreaterThanOrEqual(o.want); continue; }   // a kernel may already have splatted into its puddle
        expect(o.n, `${k} tier ${t} count`).toBe(o.want);
        if (['boomerangs', 'van', 'samples', 'chainsaws', 'device', 'springs', 'meknife', 'hands', 'ticktock', 'plug'].includes(k)) {
          expect(o.spd, `${k} tier ${t} flies no slower than the tier before`).toBeGreaterThanOrEqual(lastSpd - 1e-9); lastSpd = o.spd;
        }
      }
    }
  });
});

describe('the adapted set is HIS: he built the phones, he is not one', () => {
  it('firing every base attack leaves one boss on the stage -- him -- and no MePhone or Springy standing in as one', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s._marks = 4;
      COBS_DECK.forEach(function(k){ cobsFightTelegraph(s, k, you); s._tel = 0; COBS_MOVES[k](s, you, ++BOSS_ATK_ID); });
      for (var i=0;i<20;i++) step();
      var bosses = summons.filter(function(m){ return m.type==='boss'; });
      return { bosses:bosses.length, name:bosses[0].name, stray:summons.filter(function(m){ return /^(MePhone4|MePhone4S|Springy)$/.test(m.name) || /^(mephone|mephone4s|springy|cobs)$/.test(m.attack||''); }).length,
        units:summons.filter(function(m){ return m.type==='mephoneunit'; }).map(function(m){ return [m.hostile, m.team, m.hp > 0]; }),
        owners:shots().every(function(p){ return p.owner===-2 && p.ownerObj.team===-1; }), fast:COBS_SPD > ONE_SPD, harder:COBS_DMG_MULT >= ONE_DMG_MULT };`);
    expect(r.bosses).toBe(1);
    expect(r.name).toBe('Steve Cobs');
    expect(r.stray, 'no MePhone4, MePhone4S, Springy or Boss-11 Cobs summon spawned as if it were the boss').toBe(0);
    expect(r.units.length, 'his MePhone units are small hostile adds of his own').toBeGreaterThan(0);
    expect(r.units.every(u => u[0] === true && u[1] === -1 && u[2])).toBe(true);
    expect(r.owners, 'every shot is the boss side\'s').toBe(true);
    expect(r.fast, '"launched faster": faster than One\'s inherited set').toBe(true);
    expect(r.harder).toBe(true);
  });

  it('the boomerangs leave HIS hand on the arc the sight locked; the van drives the floor; the samples burst into crumbs; the units shoot', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s.x = you.x + 400; s.y = you.y - 120; s.face = -1;
      cobsFightTelegraph(s, 'boomerangs', you); var aimed = [s._aimX, s._aimY];
      for (var i=0;i<s._tel - cobsT(s,'boomerangs').lock + 2;i++) step();   // follows you until the lock...
      you.x += 300; step(); var lockedAim = s._aimX, lockedY = s._aimY;      // ...then holds
      s._tel = 0; COBS_MOVES.boomerangs(s, you, ++BOSS_ATK_ID);
      var r0 = shots()[0], hx = s.x + (s.face||1)*s.r*0.6, hy = s.y - s.r*0.1, T = cobsT(s, 'boomerangs');
      var path = cobsBoomPath(T, hx, hy, lockedAim, lockedY, 0), end = path[path.length-1];
      var near = Math.min.apply(null, path.map(function(q){ return Math.hypot(q[0] - lockedAim, q[1] - lockedY); }));
      var boom = { fromHand: Math.abs(r0.x - hx) < 1 && Math.abs(r0.y - hy) < 1, near: near, heldAim: lockedAim === aimed[0], shape: r0.shape, pierce: !!r0.pierce, turns: r0._bm.turns, n: shots().length, want: T.n };
      projectiles = []; cobsFightTelegraph(s, 'van', you); s._tel = 0; COBS_MOVES.van(s, you, ++BOSS_ATK_ID);
      var v = shots()[0], fl = cobsFloor();
      var van = { onFloor: Math.abs(v.y - (groundY() - 26)) < 1, fromEdge: v.x < fl.x + 40 || v.x > fl.x + fl.w - 40, pierce: !!v.pierce, shape: v.shape, dir: Math.sign(v.vx) === Math.sign(you.x - v.x) };
      projectiles = []; cobsFightTelegraph(s, 'samples', you); s._tel = 0; COBS_MOVES.samples(s, you, ++BOSS_ATK_ID);
      var boxes = shots().length; you.invuln = 99999;   // (a fighter under a box is hit by it, and a crumb that hits is spent: count them with nobody in the way)
      for (var i=0;i<95;i++) step();
      var crumbs = projectiles.filter(function(p){ return p.owner===-2 && p._crumb; });
      var samples = { boxes:boxes, crumbs: crumbs.length, poison: crumbs.every(function(p){ return p.fxTag==='poison'; }), traps: projectiles.filter(function(p){ return p.trap; }).length };
      projectiles = []; summons = summons.filter(function(m){ return m===s; }); cobsFightTelegraph(s, 'deploy', you); s._tel = 0; COBS_MOVES.deploy(s, you, ++BOSS_ATK_ID);
      var u = summons.find(function(m){ return m.type==='mephoneunit'; }); u._cd = 0; step(); step();
      var unit = { shot: u._shots, alive: u.life > 0, cd: u._cd > 0 };   // a round can break on a platform top the frame it leaves, so the unit's own count is what is read
      return { boom:boom, van:van, samples:samples, unit:unit };`);
    expect(r.boom).toMatchObject({ fromHand: true, heldAim: false, shape: 'cobsboomerang', pierce: true, turns: 4, n: r.boom.want });
    expect(r.boom.near, 'the first leg is an arc that passes through the point the sight locked').toBeLessThan(30);
    expect(r.van).toMatchObject({ onFloor: true, fromEdge: true, pierce: true, shape: 'meeplevan', dir: true });
    expect(r.samples.boxes).toBe(3);
    expect(r.samples.crumbs, 'every box burst into crumbs (2 a side at tier 1), and the cookies no longer wait as mines').toBe(3 * 2 * 2);
    expect(r.samples.poison).toBe(true);
    expect(r.samples.traps).toBe(0);
    expect(r.unit).toEqual({ shot: 1, alive: true, cd: true });
  });
});

describe('his four base melee', () => {
  it('MeMURDER: the poles come FROM THE FLOOR on marks laid at the wind-up, buried under their shadow, then up; they stand as spikes (from tier 1 since the owner\'s tuning of 2026-10-05: "Strikes linger")', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s._marks = 1;
      cobsFightTelegraph(s, 'memurder', you); var spots = s._poleSpots.map(function(p){ return p.x; }); s._tel = 0;
      COBS_MOVES.memurder(s, you, ++BOSS_ATK_ID);
      var poles = shots(), T = cobsT(s, 'memurder'), y0 = poles[0].y, buried = poles.every(function(p){ return p.delay===T.delay && p.cobsTrap && p.warn===1; });
      // a pole under a platform rises slower so it never reaches the platform's top (cobsPole); one with open sky over it rises at the tier's spd
      // (and never the middle pole: it pops you, and a pole that hit is spent)
      var free = poles.find(function(p, i){ return i !== 1 && vanTopsAt(p.x).every(function(t){ return t.y >= groundY() - 4; }); }) || null, watch = free || poles[0];
      for (var i=0;i<T.delay;i++) step(); var yAfterDelay = watch.y; step(); step(); var rose = yAfterDelay - watch.y, v = -watch.vy;
      var out = { n:poles.length, gap:Math.abs(spots[1]-spots[0]), fromFloor: y0 > groundY(), buried:buried, rose:rose, v:v, freeV: free ? -free.vy : null, spd:T.spd, ids: poles.every(function(p){ return p.bossAtk===poles[0].bossAtk; }) };
      projectiles = []; s._marks = 0; cobsFightTelegraph(s, 'memurder', you); s._tel = 0; COBS_MOVES.memurder(s, you, ++BOSS_ATK_ID);
      var p = shots()[0], T4 = cobsT(s, 'memurder'); for (var i=0;i<T4.delay + 12;i++) step();   // (tier 1: no pairs, so the first pole has risen)
      out.linger = { vy:p.vy, life:p.life, alive:p.life > 0 };
      return out;`);
    expect(r.n, 'tier 2: four (one more than the old 3 -- "More strikes", the owner)').toBe(4);
    expect(r.gap).toBe(84);
    expect(r.fromFloor, 'buried under the floor line').toBe(true);
    expect(r.buried).toBe(true);
    expect(r.rose, 'up once the delay ends').toBeCloseTo(r.v * 2, 3);
    expect(r.v).toBeGreaterThanOrEqual(4);
    expect(r.v).toBeLessThanOrEqual(r.spd);
    if (r.freeV != null) expect(r.freeV, 'open sky over it: the tier\'s rise').toBeCloseTo(r.spd, 6);
    expect(r.ids, 'one attack, one cap').toBe(true);
    expect(r.linger.alive, 'tier 1: still standing after its seven frames of rise').toBe(true);
    expect(r.linger.vy, 'as a spike, not a rocket').toBe(0);
  });

  it('MeKNIFE: a lunging stab; a whiff sticks in the floor for half a second and every hit on him counts more; a stab that lands does not', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s.x = you.x + 300; s.y = you.y - 40; s.face = -1;
      cobsFightTelegraph(s, 'meknife', you); s._tel = 0; COBS_MOVES.meknife(s, you, ++BOSS_ATK_ID);
      var lunge = { t:s._lungeT, dir:s._lungeDir, knife:!!s._knife, shape:s._knife.shape };
      you.x -= 900; you.invuln = 0; for (var i=0;i<80 && s._knife;i++) step();
      var whiff = { stuck:s._stuckT, fx:cobsFx.some(function(e){ return e.kind==='stuckknife'; }) };
      var hp0 = s.hp; cobsTakeDamage(s, 10); whiff.took = hp0 - s.hp;
      for (var i=0;i<40;i++) step(); whiff.after = s._stuckT;
      floorAt(you, s.x - 120); s._stuckT = 0; cobsFightTelegraph(s, 'meknife', you); s._tel = 0; COBS_MOVES.meknife(s, you, ++BOSS_ATK_ID);
      you.invuln = 0; var p0 = you.pct; for (var i=0;i<80 && s._knife;i++){ step(); you.invuln = 0; }
      var hit = { pct:you.pct - p0, stuck:s._stuckT };
      return { lunge:lunge, whiff:whiff, hit:hit };`);
    expect(r.lunge).toMatchObject({ t: 16, dir: -1, knife: true, shape: 'meepleknife' });
    expect(r.whiff.stuck, 'the blade in the floor: COBS_STUCK_T').toBe(30);
    expect(r.whiff.fx).toBe(true);
    expect(r.whiff.took, 'x1.5 while stuck').toBeCloseTo(15, 6);
    expect(r.whiff.after).toBe(0);
    expect(r.hit.pct, 'the stab landed').toBeGreaterThan(0);
    expect(r.hit.stuck, 'and he is not stuck').toBe(0);
  });

  it('KERNEL POP: costs him 1%, the kernels splat into sticky puddles that slow, the stomp bursts them into popcorn', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s.x = you.x + 260; s.y = you.y - 60; s._marks = 1;
      var hp0 = s.hp; cobsFightTelegraph(s, 'kernelpop', you); s._tel = 0; COBS_MOVES.kernelpop(s, you, ++BOSS_ATK_ID);
      var cost = hp0 - s.hp, T = cobsT(s, 'kernelpop');
      for (var i=0;i<70;i++) step();   // they land at about frame 45; the stomp waits until T.stomp + 40
      var sticky = projectiles.filter(function(p){ return p.cobsSticky && p.delay > 0; });
      var slowed = 0; if (sticky.length){ you.x = sticky[0].x; you.y = sticky[0].y - you.r; you.vx = 0; you.vy = 0; for (var i=0;i<3;i++){ step(); you.x = sticky[0].x; you.y = sticky[0].y - you.r; you.vy = 0; } slowed = you.slowed; }   // a kernel may land on a platform: stand where it splatted
      var before = shots().length; s._stompT = 1; step();
      var popcorn = projectiles.filter(function(p){ return p.shape==='popcorn' && p.life > 0; }).length, left = projectiles.filter(function(p){ return p.cobsSticky && p.delay > 0; }).length;
      return { cost:cost, sticky:sticky.length, slowed:slowed, popcorn:popcorn, perPuddle:T.pop, left:left };`);
    expect(r.cost, '1% of 2500').toBe(25);
    expect(r.sticky).toBeGreaterThan(0);
    expect(r.slowed, 'standing in one slows you').toBeGreaterThan(0);
    expect(r.popcorn, 'tier 2: two popcorn a puddle').toBe(r.sticky * r.perPuddle);
    expect(r.left, 'the stomp spends the puddles').toBe(0);
  });

  it('MY OWN HANDS: a punch string whose last punch is the wrist snap that weakens you; a hit on him in the wind-up knocks his glasses off', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s.x = you.x + 200; s.y = you.y; s.face = -1; s._marks = 1;
      cobsFightTelegraph(s, 'hands', you); var telUp = s._tel > 0;
      cobsTakeDamage(s, 5); var glasses = s._glassesOff;
      s._tel = 0; COBS_MOVES.hands(s, you, ++BOSS_ATK_ID);
      var fists = shots(), T = cobsT(s, 'hands'), last = fists[fists.length-1];
      var out = { telUp:telUp, glasses:glasses, n:fists.length, want:T.n, snap:last.fxTag, snapN:last.fxN, gaps:fists.map(function(p){ return p.delay; }), row: fists.every(function(p, i){ return Math.abs(p.y - fists[i % 2].y) < 1; }), rows2: Math.abs(fists[0].y - fists[1].y) > 50 };
      var rowX = s.x - 120, rowY = fists[0].y - (hurtCY(you) - you.y);   // held in the fists' row (he drifts on his orbit; the fists do not)
      you.invuln = 0; var p0 = you.pct; for (var i=0;i<80;i++){ step(); you.invuln = 0; you.x = rowX; you.y = rowY; you.vx = 0; you.vy = 0; }
      out.hit = you.pct - p0; out.weakened = you.weakened;
      var aim = cobsAim(s, you); out.missAim = Math.abs(aim.x - you.x) > 0;
      s._rageT = 600; s._glassesOff = 0; projectiles = []; cobsFightTelegraph(s, 'hands', you); s._tel = 0; COBS_MOVES.hands(s, you, ++BOSS_ATK_ID);
      out.rageN = shots().length;
      return out;`);
    expect(r.telUp).toBe(true);
    expect(r.glasses, '"Ow- it\'s fine": COBS_GLASSES_T').toBe(180);
    expect(r.n).toBe(r.want);
    expect(r.snap).toBe('weaken');
    expect(r.snapN).toBe(120);
    // Round 7, verbatim: "MY OWN HANDS: TWO ROWS, MARKED -- punches alternate between two rows, both lit at the start with their order": from tier 2 the
    // punches alternate between two rows (this is tier 2) and each gap is gap2 = 8 frames longer so the swap can be made: 21 + 8 (test/boss-cobs-fight.test.js)
    expect(r.gaps).toEqual([0, 29, 58]);
    expect(r.row, 'punch i on row i mod 2').toBe(true);
    expect(r.rows2).toBe(true);
    expect(r.hit).toBeGreaterThan(0);
    expect(r.weakened, 'the snap: your hits deal less for a while').toBeGreaterThan(0);
    expect(r.missAim, 'and with his glasses off he aims off').toBe(true);
    expect(r.rageN, 'rage: a punch more').toBe(r.want + 1);
  });
});

describe('the six personalised specials', () => {
  it('MePhone X: DELETION -- caught facing X on the ground: big damage and your special locked; facing AWAY, or airborne: it passes', () => {
    const run = (setup, perFrame) => fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s.x = you.x + 500; s.y = you.y - 200; s._marks = 1; you.face = 1; you.spCd = 0;
      // a height with no floating platform under your feet: standing on one is grounded, and the counter is to be in the AIR
      var airY = groundY() - 200; while (worldPlats.some(function(p){ return !p.solid && Math.abs(p.y - (airY + you.r)) < 26 && you.x > p.x - 30 && you.x < p.x + p.w + 30; })) airY -= 30;
      cobsFightTelegraph(s, 'deletion', you); var X = s._xs[0], tel = s._tel, red = s._redT > 0, side = X.side;
      ${setup}
      s._tel = 0; COBS_MOVES.deletion(s, you, ++BOSS_ATK_ID);
      var p0 = you.pct, grounded = [], lockAt = null, delAt = null; for (var i=0;i<130 && s._xs.length;i++){ step(); grounded.push(you.onground); if (lockAt === null && you.pct > p0){ lockAt = you.spCd; delAt = you._deletedT > 0; } ${perFrame || ''} }   // (130: both lunges -- the owner's "Double lunge", 2026-10-05 -- and the turn between them; the lock is read the frame of the hit)
      return { tel:tel, red:red, side:side, faced: side===1, dmg:you.pct - p0, lock:(lockAt === null ? you.spCd : lockAt), deleted:(delAt === null ? you._deletedT > 0 : delAt), left:s._xs.length, grounded:grounded };`);
    const caught = run('/* facing X, on the floor */', 'if (s._xs.length) you.face = s._xs[0].side;');   // (and facing the second lunge too: it deals nothing more -- one id, one cap)
    expect(caught.tel, 'tier 2\'s wind-up').toBe(66);
    expect(caught.red, 'the siren: the screen tints red').toBe(true);
    expect(caught.faced, 'X comes in on the side you face').toBe(true);
    expect(caught.dmg, '1.6 x 33').toBeCloseTo(52.8, 3);
    expect(caught.lock, 'specials locked 120 frames').toBeGreaterThanOrEqual(100);
    expect(caught.deleted).toBe(true);
    expect(caught.left).toBe(0);
    const away = run('you.face = -1;   // turned away', 'if (s._xs.length) you.face = -s._xs[0].side;');   // (turned away from the first lunge, and from the second one that comes back from the other side)
    expect(away.dmg, '"simply not looking at him": neither lunge lands -- all that reaches a fighter who stood still in the trail (from tier 1 now: the owner, 2026-10-05) is its zap, 0.3 of the hit').toBeCloseTo(52.8*0.3, 3);
    expect(away.lock).toBe(0);
    const air = run('you.y = airY; you.vy = 0;', 'you.y = airY; you.vy = 0;');
    expect(air.grounded.slice(1).some(g => g), 'held in the air').toBe(false);
    expect(air.dmg, 'or airborne').toBe(0);
    const two = fight(['Knife'], { story: true }, `park(); floorAt(you, WW*0.5); s._marks = 4; cobsFightTelegraph(s, 'deletion', you); return { n:s._xs.length, sides:s._xs.map(function(X){ return X.side; }), beat:s._xs[1].delay };`);
    expect(two.n, 'tier 5: "two MePhoneX\'s exist"').toBe(2);
    expect(two.sides.sort()).toEqual([-1, 1]);
    expect(two.beat, 'the second a beat behind, so turn and turn back').toBe(24);
  });

  it('TICK, TOCK -- a countdown, watches that bend and ricochet, and at zero a VOLLEY with no wind-up (a MeMURDER pole under you from tier 4)', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s.x = you.x + 300; s.y = you.y - 100; s._marks = 1;
      cobsFightTelegraph(s, 'ticktock', you); s._tel = 0; COBS_MOVES.ticktock(s, you, ++BOSS_ATK_ID);
      var T = cobsT(s, 'ticktock'), w = shots();
      var out = { timer:s._tick.t, want:T.timer, n:w.length, wantN:T.n, bounce:w.every(function(p){ return p.bounce && p.maxBounces===T.ric + 1 && p.shape==='meeplewatch'; }) };
      projectiles = []; s._track = []; s._tick.t = 1; step();   // (the stage cleared by hand: the track too, or the first throw's watches would shatter now)
      out.zero = { shots:shots().length, volley:T.volley, tel:s._tel, tick:s._tick, kind:s._telKind };
      projectiles = []; s._marks = 3; s._tick = { t:1, T:420 }; step();
      out.t4 = { pole: shots().filter(function(p){ return p.cobsTrap; }).length, watches: shots().filter(function(p){ return p.shape==='meeplewatch'; }).length, want:cobsT(s, 'ticktock').volley };
      return out;`);
    expect(r.timer).toBe(r.want);
    expect(r.n).toBe(r.wantN);
    expect(r.bounce).toBe(true);
    expect(r.zero.shots, 'the zero is a volley, not a trick').toBe(r.zero.volley);
    expect(r.zero.tel, 'with no wind-up').toBe(0);
    expect(r.zero.tick).toBe(null);
    expect(r.t4.watches).toBe(r.t4.want);
    expect(r.t4.pole, 'tier 4: and a pole under you').toBe(1);
  });

  it('PULL THE PLUG + SCREEN PROTECTOR -- the pane lands as the only footing; [POOF] every other platform and shot is gone, then it all comes back', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s.x = you.x + 300; s.y = you.y - 100; s._marks = 2;
      var plats0 = worldPlats.length, floating0 = worldPlats.filter(function(p){ return !p.solid; }).length;
      // one of your own shots on the stage, and the ship in the sky (MeLife made it)
      addProj({ owner:you.idx, ownerObj:you, x:you.x + 100, y:you.y - 300, vx:0, vy:0, r:8, dmg:1, kb:1, life:9000, color:'#fff' });
      cobsFightTelegraph(s, 'cannon', you); s._tel = 0; COBS_MOVES.cannon(s, you, ++BOSS_ATK_ID); var shipUp = !!s._ship;
      cobsFightTelegraph(s, 'plug', you); s._tel = 0; COBS_MOVES.plug(s, you, ++BOSS_ATK_ID);
      var T = cobsT(s, 'plug'), panes = shots().filter(function(p){ return p.cobsPane; }).length, wait = s._plug.t;
      // (from tier 2 the [POOF] is a wave of T.wave frames, end to end -- the owner, Round 7: "PULL THE PLUG wave" -- so it is run out before looking)
      var poofSeen = false; for (var i=0;i<wait + T.wave + 2;i++){ step(); if (cobsFx.some(function(e){ return e.kind==='poof'; })) poofSeen = true; }
      var landed = worldPlats.filter(function(p){ return p._cobsPane; });
      var during = { phase:s._plug.phase, floating:worldPlats.filter(function(p){ return !p.solid; }).length, floor:worldPlats.some(function(p){ return p.solid && p.floor===0; }),
        panes:landed.length, solidPane:landed.every(function(p){ return p.solid; }), yours:projectiles.filter(function(p){ return p.owner===you.idx; }).length, ship:!!s._ship, poof:poofSeen };
      for (var i=0;i<T.poof + T.wave + 2;i++) step();
      var after = { plug:s._plug, floating:worldPlats.filter(function(p){ return !p.solid; }).length, plats:worldPlats.length - worldPlats.filter(function(p){ return p._cobsPane; }).length };
      return { panes:panes, want:T.n, shipUp:shipUp, floating0:floating0, plats0:plats0, during:during, after:after };`);
    expect(r.panes).toBe(r.want);
    expect(r.shipUp).toBe(true);
    expect(r.floating0).toBeGreaterThan(30);
    expect(r.during.phase).toBe('out');
    expect(r.during.floating, '[POOF]: every floating platform gone').toBe(0);
    expect(r.during.floor, 'the floor stays').toBe(true);
    expect(r.during.panes, 'the panes stay, as footing').toBe(r.want);
    expect(r.during.solidPane).toBe(true);
    expect(r.during.yours, 'and every shot on screen is gone').toBe(0);
    expect(r.during.ship, 'the ship too: MeLife made it').toBe(false);
    expect(r.during.poof).toBe(true);
    expect(r.after.plug, 'plugged back in').toBe(null);
    expect(r.after.floating, 'every platform back where it was').toBe(r.floating0);
    expect(r.after.plats).toBe(r.plats0);
  });

  it('THE FUTURE IS SO YESTERDAY -- rings along the floor to jump (low) or stay under (high); the CARE! finale spares the airborne and the pane; a hit in the keynote skips it', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s.x = you.x - 200; s.y = you.y - 120; s._marks = 1;
      var T = cobsT(s, 'keynote');
      var runRings = function(place){
        s._rings = []; s._burst = null; you.pct = 0; you.invuln = 0; var hits = [];
        cobsFightTelegraph(s, 'keynote', you); s._tel = 0; COBS_MOVES.keynote(s, you, ++BOSS_ATK_ID);
        var rings = s._rings.slice(), burstT = s._burst ? s._burst.t : 0;
        for (var i=0;i<burstT - 2;i++){ var p0 = you.pct; place(); step(); you.invuln = 0;
          if (you.pct > p0){ var live = rings.filter(function(R){ return R.delay<=0 && R.life>0; }); hits.push(live.length ? (live[live.length-1].high ? 'high' : 'low') : '?'); } }
        return { hits:hits, burstLeft:s._burst ? s._burst.t : null };
      };
      var grounded = runRings(function(){ you.x = s.x + 60; you.y = groundY() - you.r; you.vx = 0; you.vy = 0; });
      var jumping = runRings(function(){ you.x = s.x + 60; you.y = groundY() - 150; you.vx = 0; you.vy = 0; });
      // the finale (his tick reads where you stood the frame before, so each stance settles for a frame before the burst is armed)
      s._rings = []; you.pct = 0; you.invuln = 0; you.x = s.x + 60; you.y = groundY() - you.r; you.vy = 0; step(); var g1 = you.onground;
      s._burst = { t:1, dmg:33, id:++BOSS_ATK_ID, hp0:s.hp }; step();
      var burstGround = you.pct;
      you.pct = 0; you.invuln = 0; you.y = groundY() - 220; you.vy = 0; step(); you.y = groundY() - 220; you.vy = 0;
      s._burst = { t:1, dmg:33, id:++BOSS_ATK_ID, hp0:s.hp }; step();
      var burstAir = you.pct;
      cobsPlacePane(s.x + 60, groundY(), 600); you.pct = 0; you.invuln = 0; you.x = s.x + 60; you.y = groundY() - COBS_PANE_H - you.r; you.vy = 0; step(); var onPane = you.onground;
      s._burst = { t:1, dmg:33, id:++BOSS_ATK_ID, hp0:s.hp }; step();
      var burstPane = you.pct;
      s._burst = { t:30, dmg:33, id:++BOSS_ATK_ID, hp0:s.hp }; s._holdT = 60; cobsTakeDamage(s, COBS_SPEECH_STOP); step();
      var interrupted = { burst:s._burst, hold:s._holdT };
      return { T:T, grounded:grounded, jumping:jumping, g1:g1, burstGround:burstGround, burstAir:burstAir, burstPane:burstPane, onPane:onPane, interrupted:interrupted };`);
    expect(r.T.n, 'tier 2: three lines').toBe(3);
    expect(r.grounded.hits.length, 'on the floor the low rings hit you').toBeGreaterThan(0);
    expect(r.grounded.hits.every(h => h === 'low'), 'and only the low ones').toBe(true);
    expect(r.jumping.hits.length, 'in the air the high ring hits you').toBeGreaterThan(0);
    expect(r.jumping.hits.every(h => h === 'high'), 'and only that one').toBe(true);
    expect(r.burstGround, 'CARE!: a grounded fighter takes the burst').toBeCloseTo(33, 3);
    expect(r.burstGround > 0 || !r.g1, 'grounded when it burst').toBe(true);
    expect(r.burstAir, 'airborne at the burst: blocked').toBe(0);
    expect(r.onPane).toBe(true);
    expect(r.burstPane, 'standing on a Screen Protector pane: blocked').toBe(0);
    expect(r.interrupted.burst, 'COBS_SPEECH_STOP damage during the keynote skips the finale').toBe(null);
    expect(r.interrupted.hold).toBe(0);
  });

  it('MeTAG LOCKDOWN -- "2 metags with 75 hp each", one at a time since the owner\'s nerf (2026-10-05): a summon that flies at you and cuffs on contact, killable on every path; from tier 3 a wall splits the stage', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s.x = you.x + 260; s.y = you.y - 60; s._marks = 2;
      cobsFightTelegraph(s, 'metags', you); s._tel = 0; COBS_MOVES.metags(s, you, ++BOSS_ATK_ID);
      var tags = summons.filter(function(m){ return m.type==='metag'; });
      var out = { n:tags.length, hp:tags.map(function(m){ return [m.hp, m.maxHp]; }), hostile:tags.every(function(m){ return m.hostile && m.team===-1; }), again:COBS_MOVES.metags(s, you, ++BOSS_ATK_ID) };
      var rooted = 0, pct0 = you.pct, walled = false;
      for (var i=0;i<400;i++){ step(); you.invuln = 0; rooted = Math.max(rooted, you.rooted||0); if (worldPlats.some(function(p){ return p._cobsWall; })) walled = true; if (rooted && walled) break; }
      out.cuff = { rooted:rooted, dmg:you.pct - pct0, walled:walled, wallSolid:worldPlats.filter(function(p){ return p._cobsWall; }).every(function(p){ return p.solid; }) };
      // killable: melee, a shot, a dash -- each through the boss side's own path. (you is Knife, the story fighter: "2x damage on knife in the cobs fight." -- the owner, 2026-10-05 -- so a swing of 20
      // is 40 on a unit of his, and a shot of 10 is 20: written at half, the numbers read as they did.)
      var a = tags[0];
      damageSummons(you, a.x, a.y, 30, 20); out.melee = a.hp;
      addProj({ owner:you.idx, ownerObj:you, x:a.x, y:a.y, vx:0.1, vy:0, r:12, dmg:10, kb:1, life:5, color:'#fff' }); step(); out.shot = a.hp;
      damageSummons(you, a.x, a.y, 30, 20); step(); out.dead = { life:a.life, gone:summons.indexOf(a) < 0 };
      COBS_MOVES.metags(s, you, ++BOSS_ATK_ID); var b = summons.filter(function(m){ return m.type==='metag' && m.life > 0; })[0];   // (the first is gone: another may be placed)
      b.hp = 5; you._dashing = 3; you._dashDmg = 12; you.x = b.x - 10; you.y = b.y; you.vx = 8; step(); out.dash = { hp:b.hp, gone:summons.indexOf(b) < 0 };
      return out;`);
    expect(r.n, 'ONE tag at a time').toBe(1);
    expect(r.hp).toEqual([[75, 75]]);
    expect(r.hostile).toBe(true);
    expect(r.again, 'never a second while one stands').toBe(0);
    expect(r.cuff.rooted, 'cuffed: rooted').toBeGreaterThan(0);
    expect(r.cuff.dmg).toBeGreaterThan(0);
    expect(r.cuff.walled, 'tier 3: the first cuff drops the wall').toBe(true);
    expect(r.cuff.wallSolid).toBe(true);
    expect(r.melee).toBe(35);
    expect(r.shot).toBe(15);
    expect(r.dead).toEqual({ life: 0, gone: true });
    expect(r.dash.hp).toBeLessThanOrEqual(0);
  });

  it('TOXIC CANNON -- the ship crosses the sky sweeping a beam along the floor: jump it; it leaves poison puddles that poison whoever stands in them', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5 + 300); s.x = you.x - 300; s.y = you.y - 100; s._marks = 1;
      cobsFightTelegraph(s, 'cannon', you); s._tel = 0; COBS_MOVES.cannon(s, you, ++BOSS_ATK_ID);
      var S = s._ship, T = cobsT(s, 'cannon'), out = { passes:S.left, want:T.n, dir:S.dir, fromFar: S.dir===1 ? S.x < you.x : S.x > you.x };
      S.x = you.x - S.dir*(COBS_SHIP_LEAD + 160);   // bring it in, so the test is not a minute of sky
      you.invuln = 0; var p0 = you.pct; for (var i=0;i<60;i++){ step(); you.invuln = 0; }
      out.ground = { dmg:you.pct - p0, poisoned:you._poisonT > 0 };
      var puddles = projectiles.filter(function(p){ return p.cobsPuddle && p.delay > 0; });
      out.puddles = { n:puddles.length, life:puddles.length ? puddles[0].delay <= T.puddle : false };
      // a second pass, jumped
      s._ship = { x:you.x - 400, y:groundY() - COBS_SHIP_Y, dir:1, spd:T.spd, left:1, dmg:33, id:++BOSS_ATK_ID, puddle:T.puddle, hit:{}, x0:cobsFloor().x - 120, x1:cobsFloor().x + cobsFloor().w + 120, lastPud:you.x, t:0 };
      you.pct = 0; you.burn = 0; you._poisonT = 0; for (var i=0;i<60;i++){ you.y = groundY() - 160; you.vy = 0; step(); }
      out.jumped = you.pct;
      // standing in a puddle poisons
      you.burn = 0; you._poisonT = 0; if (puddles.length){ floorAt(you, puddles[0].x); for (var i=0;i<3;i++) step(); } out.inPuddle = you._poisonT > 0;
      return out;`);
    expect(r.passes).toBe(r.want);
    expect(r.fromFar, 'it sails toward you and across you (it appears near you now -- "the ship should spawn near you", the owner, 2026-10-06; test/cobs-tune2.test.js)').toBe(true);
    expect(r.ground.dmg, 'on the floor in its path: the beam').toBeGreaterThan(0);
    expect(r.ground.poisoned).toBe(true);
    expect(r.puddles.n, 'it leaves puddles').toBeGreaterThan(0);
    expect(r.puddles.life).toBe(true);
    expect(r.jumped, 'in the air: it passes under you').toBe(0);
    expect(r.inPuddle, 'the puddles poison').toBe(true);
  });
});

describe('the passives ("Both in")', () => {
  it('KEYNOTE RAGE at 60%: a 2 s monologue, no attack through it; left alone he rages -- shorter wind-ups, a punch more, his glasses break', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s.x = you.x + 300; s.y = you.y - 100;
      s.hp = 1501; step(); var before = { spoke:s._spoke, speech:s._speechT };
      s.hp = 1500; step(); var hopped = !!s._hop; for (var i=0;i<100 && s._hop;i++) step(); step();   // (1500 is a tier line too: he is off the top of the screen and back before the speech begins, Round 15's bigger movement)
      var at = { spoke:s._spoke, speech:s._speechT, tier:cobsTier(s), banner:window.__lastBanner && window.__lastBanner.text, hopped:hopped };
      s._atkTimer = 1; var tels = 0; for (var i=0;i<COBS_SPEECH_T - 2;i++){ step(); if (s._tel > 0) tels++; }
      var quiet = { tels:tels, speech:s._speechT };
      step(); step();
      var tel0 = COBS_TEL.hands; s._telKind = 'hands';
      var rage = { rageT:s._rageT, look:cobsLook(s), tel:cobsTelLen(s), base:tel0, gap:cobsGap(s), plainGap:COBS_GAPS[cobsTier(s)-1], banner:window.__lastBanner && window.__lastBanner.text, kind:window.__lastBanner && window.__lastBanner.kind };
      return { before:before, at:at, quiet:quiet, rage:rage };`);
    expect(r.before).toEqual({ spoke: false, speech: 0 });
    expect(r.at.spoke).toBe(true);
    expect(r.at.speech).toBe(120);
    expect(r.at.tier, '1500 is a tier line too').toBe(3);
    expect(r.quiet.tels, 'fully punishable: no wind-up starts through the speech').toBe(0);
    expect(r.rage.rageT, 'left alone: COBS_RAGE_T').toBe(1080);
    expect(r.rage.look, 'his glasses break').toBe('cobshurt');
    expect(r.rage.tel, 'wind-ups x0.8').toBe(Math.round(r.rage.base * 0.8));
    expect(r.rage.gap).toBeLessThan(r.rage.plainGap);
    expect(r.rage.kind).toBe('boss');
  });

  it('...but hitting him through the speech shortens the rage, and COBS_SPEECH_STOP of damage cancels it', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); s.hp = 1500; step(); cobsTakeDamage(s, COBS_SPEECH_STOP);
      for (var i=0;i<COBS_SPEECH_T + 2;i++) step();
      var cancelled = { rageT:s._rageT, look:cobsLook(s), broken:s._glassesBroken };
      s._spoke = false; s._speechT = 0; s._glassesBroken = false; s.hp = 1400; step(); cobsTakeDamage(s, COBS_SPEECH_STOP/2);
      for (var i=0;i<COBS_SPEECH_T + 2;i++) step();
      return { cancelled:cancelled, halved:s._rageT };`);
    expect(r.cancelled).toEqual({ rageT: 0, look: 'cobs', broken: false });
    expect(r.halved, 'half the damage: half the rage (less the frames since it began)').toBeGreaterThanOrEqual(535);
    expect(r.halved).toBeLessThanOrEqual(540);
  });

  // Round 7, verbatim: "Popping Point burst ring" -- the kernels no longer fly 1-3 at you: every hit pops a RING of them (COBS_POP_RING), 2% each, the same cap.
  it('POPPING POINT below 20%: every hit he takes pops a ring of kernels, 2% each, and he wears the broken-glasses render', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); s.x = you.x + 300; s.y = you.y - 100;
      s.hp = 502; step(); projectiles = []; cobsTakeDamage(s, 1); var above = { pops:shots().length, look:cobsLook(s) };   // 501: still above the line
      s._spoke = true; s._speechT = 0; s.hp = 500; step(); projectiles = [];
      var counts = [];
      for (var k=0;k<12;k++){ s._popCd = 0; projectiles = []; cobsTakeDamage(s, 1); var ks = shots(); counts.push(ks.length); }
      var one = shots()[0];
      return { above:above, counts:counts, dmg:one.dmg, cap:one.bossCap, shape:one.shape, look:cobsLook(s), cd:COBS_POP_CD, ring:COBS_POP_RING };`);
    expect(r.above, 'not yet at 501').toEqual({ pops: 0, look: 'cobs' });
    expect(r.cd).toBeGreaterThan(0);
    expect(r.counts.every(n => n === r.ring), 'a ring of the same number a hit').toBe(true);
    expect(r.ring).toBeGreaterThanOrEqual(6);
    expect(r.dmg, '2% each').toBe(2);
    expect(r.shape).toBe('kernel');
    expect(r.look).toBe('cobshurt');
  });
});

describe('beatable in principle -- whatever a bot manages', () => {
  it('every damage path reaches him (melee, a shot, a dash, the Chain Bolt), there is no shield, and his tiers run to 0', () => {
    const r = fight(['Knife'], { story: true }, `
      park(); floorAt(you, WW*0.5); var out = {};
      // (each path is tried on its own: a hit opens this fighter's grace on him, one for each attacker -- "give bosses by-character iframes", the
      // owner, 2026-10-04 -- so the clock moves 30 frames on before each, past any grace)
      var hp = s.hp; damageSummons(you, s.x, s.y, s.r, 20); out.melee = hp - s.hp;
      hazardT += 30; hp = s.hp; addProj({ owner:you.idx, ownerObj:you, x:s.x, y:s.y, vx:0.1, vy:0, r:10, dmg:15, kb:1, life:5, color:'#fff' }); step(); out.shot = hp - s.hp;
      hazardT += 30; hp = s.hp; you._dashing = 3; you._dashDmg = 12; you.x = s.x - 10; you.y = s.y; you.vx = 8; step(); out.dash = hp - s.hp;
      hazardT += 30; hp = s.hp; chainBoltBoss(s, 12, you); out.bolt = hp - s.hp;
      s.hp = 2001; step(); out.t1 = cobsTier(s); s.hp = 1; cobsTakeDamage(s, 5); out.zero = s.hp; window.__lastBanner = null; step(); out.dying = s._dying; out.total = COBS_END.total;
      for (var i=0;i<COBS_END.total + 6 && running;i++) step();
      out.won = COBSFIGHT.won; out.told = window.__cobsEnd; out.life = s.life; out.over = COBSFIGHT.over; out.banner = window.__lastBanner;
      out.rushCleared = (PROFILE.bossesCleared || {})['Steve Cobs'] || null; out.title = document.getElementById('resultTitle').textContent;
      return out;`);
    // ("2x damage on knife in the cobs fight." -- the owner, 2026-10-05: you is Knife, the story fighter, so every path into him counts double: a swing of 20 takes 40, a shot of 15 takes 30, a dash of 12 and a bolt of 12 take 24)
    expect(r.melee).toBe(40);
    expect(r.shot).toBe(30);
    expect(r.dash).toBe(24);
    expect(r.bolt).toBe(24);
    expect(r.t1).toBe(1);
    expect(r.zero).toBe(0);
    expect(r.dying, 'his ending scene runs COBS_END.total frames before the fight ends').toBe(r.total);
    expect(r.won && r.told && r.over).toBe(true);
    expect(r.life).toBe(0);
    // Round 15, verbatim: "a short canon ending scene when he's beaten (no text)" -- his last-words banner is gone: the scene says nothing (test/boss-cobs-fight.test.js)
    expect(r.banner, 'no text in the ending').toBe(null);
    expect(r.title).toBe('Steve Cobs is beaten!');
  });

  it('the whole fight, headless: a long AI fight through every kind of move without an error, every tell drawn, and nothing on the screen but boss lines', () => {
    W.Math.random = mulberry32(11);
    const r = fight(['Knife'], { story: true }, `
      you.controller = 'ai'; s._atkTimer = 40;
      var banners = []; if (!window.__cobsTap){ window.__cobsTap = true; var _b = banner; banner = function(t, m, k, l){ banners.push({ text:String(t), kind:k||null }); return _b(t, m, k, l); }; window.__cobsBanners = function(){ return banners; }; }
      banners = []; var kinds = {}, err = null, drawErr = null, maxShots = 0, minions = 0;
      for (var i=0; i<5400 && running; i++){
        if (i % 700 === 0) s.hp = Math.min(s.hp, s.maxHp - COBS_PHASE_HP*Math.floor(i/700));   // walk him down the tiers so every tier's turns come out
        try { step(); } catch(e){ err = String(e && e.stack || e); break; }
        if (s._telKind) kinds[s._telKind] = 1;
        maxShots = Math.max(maxShots, projectiles.filter(function(p){ return p.owner===-2; }).length);
        minions = Math.max(minions, summons.length - 1);
        if (i % 7 === 0){ try { drawCobsFx(); drawCobsBar(); summons.forEach(drawSummon); projectiles.forEach(drawProjectile); drawArenaDecor('meeplehq'); } catch(e){ drawErr = String(e && e.stack || e); } }
      }
      var stray = window.__cobsBanners().filter(function(b){ return !(b.kind==='boss' || b.kind==='sys' || b.text==='GO!' || /^(KO'd!|You're out!)/.test(b.text)); }).map(function(b){ return b.text; });
      return { err:err, drawErr:drawErr, kinds:Object.keys(kinds), maxShots:maxShots, minions:minions, stray:stray, said:window.__cobsBanners().length, loopErr:!!window.__loopErrLogged, frames:COBSFIGHT.frames };`);
    expect(r.err).toBe(null);
    expect(r.drawErr).toBe(null);
    expect(r.kinds.length, 'most of his moves came out').toBeGreaterThan(12);
    expect(r.maxShots).toBeGreaterThan(0);
    expect(r.minions, 'his tags or units stood at some point').toBeGreaterThan(0);
    expect(r.said).toBeGreaterThan(5);
    expect(r.stray, 'no text on screen but his telegraphs (boss) and the cards (sys)').toEqual([]);
  }, 240000);

  it('the telegraph names are his own words or his moves, none is the Boss-11 kit\'s, and every one is a boss line', () => {
    const r = W.eval(`(function(){ var out = {}; ${JSON.stringify(ALL)}.forEach(function(k){ out[k] = COBS_MOVE_NAME[k]; }); return { names:out, tel:COBS_TEL, gaps:COBS_GAPS }; })()`);
    for (const k of ALL) { expect(r.names[k], k).toMatch(/!$/); expect(r.tel[k], `${k} wind-up`).toBeGreaterThan(0); }
    expect(r.gaps).toEqual([100, 84, 70, 58, 48]);
    expect(new Set(Object.values(r.names)).size, 'no two moves share a line').toBe(ALL.length);
  });
});
// The owner's playtest, 2026-10-07: "future is so yesterday still only spawns on the ground, toxic cannon shoots an undodgeable line." and "more windows
// between attacks for cobs." with "some of the \"passive\" attacks can be kept while others run." (asked which: the countdown, the ship, the van, the crumbs).
describe("the owner's playtest of 2026-10-07", () => {
  it("THE FUTURE IS SO YESTERDAY!'s rings run along the platform you stand on, and a fighter on the ground under it is not on their line", () => {
    const r = fight(['Knife'], { story: true }, `
      park();
      var gy = groundY(), p = worldPlats.filter(function(q){ return !q.solid && q.y < gy - 300; })[0];
      you.x = p.x + p.w/2; you.y = p.y - you.r; you.vx = 0; you.vy = 0; you.onground = true;
      s._marks = 0; s._rings = []; s._podium = cobsPodiumSpot(s, you, 0);
      var podFloor = s._podium.floor;
      COBS_MOVES.keynote(s, you, ++BOSS_ATK_ID);
      var up = s._rings.map(function(R){ return R.y; });
      // now from the ground: the line is the ground
      s._rings = []; s._burst = null; you.x = p.x - 400; you.y = gy - you.r; s._podium = cobsPodiumSpot(s, you, 0);
      COBS_MOVES.keynote(s, you, ++BOSS_ATK_ID);
      var down = s._rings.map(function(R){ return R.y; });
      // a ring on the platform's line passing a fighter on the ground below it: no hit
      s._rings = [{ x0:you.x, y:p.y, r:0, spd:0, high:false, delay:0, id:++BOSS_ATK_ID, dmg:10, hit:{}, life:5 }]; s._burst = null; you.pct = 0; you.invuln = 0;
      cobsTickEntities(s, you);
      return { top:p.y, podFloor:podFloor, up:up, gy:gy, down:down, groundHit:you.pct };
    `);
    expect(r.podFloor, 'the podium knows the line: the platform under you').toBeCloseTo(r.top, 0);
    expect(r.up.length).toBeGreaterThan(0);
    r.up.forEach((y) => expect(y, 'every ring on the platform line').toBeCloseTo(r.top, 0));
    r.down.forEach((y) => expect(y, 'from the ground, on the ground').toBeCloseTo(r.gy, 0));
    expect(r.groundHit, 'a low ring up on a platform does not reach the ground under it').toBe(0);
  });

  it("TOXIC CANNON!'s beam hurts only at its splash, low enough that one jump is over it for most of a second", () => {
    const r = W.eval(`(function(){ var y = 0, v = JUMP, over = 0; for (var t = 0; t < 120; t++){ v += GRAV; y -= v; if (y > COBS_BEAM_H) over++; if (y < 0) break; } return { h: COBS_BEAM_H, over: over }; })()`);
    expect(r.h, 'was 100, which a jump cleared for a few frames at its top').toBeLessThanOrEqual(50);
    expect(r.over, 'frames a plain jump stays over the splash').toBeGreaterThanOrEqual(25);
  });

  it('one attack at a time: no wind-up while his turn runs, his whole gap after it -- and the passives do not hold the turn', () => {
    const r = fight(['Knife'], { story: true }, `
      s._atkTimer = 0; s._marks = 2; you.controller = 'still';
      var gy = groundY(); you.x = s.x + 300; you.y = gy - you.r;
      cobsFightTelegraph(s, 'keynote', you);
      var fired = -1, overAt = -1, nextTel = -1, telWhileLive = 0;
      for (var t = 0; t < 1500; t++){
        var wasTel = s._tel > 0; step(); you.invuln = 1e9; you.pct = 0;
        if (fired < 0 && wasTel && !(s._tel > 0)) fired = t;
        if (fired >= 0 && overAt < 0 && s._turnLive && s._tel > 0) telWhileLive++;
        if (fired >= 0 && overAt < 0 && !s._turnLive) overAt = t;
        if (overAt >= 0 && s._tel > 0){ nextTel = t; break; }
      }
      var gap = cobsGap(s);
      // the passives: the ship once it sails, the van
      park(); projectiles = []; s._ship = null; var lo = BOSS_ATK_ID;
      cobsFightTelegraph(s, 'cannon', you); s._tel = 0; COBS_MOVES.cannon(s, you, ++BOSS_ATK_ID);
      var charging = cobsTurnOver(s, { lo: lo }); s._ship.arm = 0; var sailing = cobsTurnOver(s, { lo: lo });
      s._ship = null; lo = BOSS_ATK_ID; cobsFightTelegraph(s, 'van', you); s._tel = 0; COBS_MOVES.van(s, you, ++BOSS_ATK_ID);
      var van = cobsTurnOver(s, { lo: lo });
      return { fired: fired, overAt: overAt, nextTel: nextTel, telWhileLive: telWhileLive, gap: gap, charging: charging, sailing: sailing, van: van };
    `);
    expect(r.fired, 'the keynote fired').toBeGreaterThanOrEqual(0);
    expect(r.overAt - r.fired, 'its rings ran on after it fired').toBeGreaterThan(60);
    expect(r.telWhileLive, 'no wind-up while it ran').toBe(0);
    expect(r.nextTel - r.overAt, 'then his whole gap: the window').toBeGreaterThanOrEqual(r.gap - 2);
    expect(r.charging, 'the ship holds the turn while it hangs there charging').toBe(false);
    expect(r.sailing, '...not once it sails').toBe(true);
    expect(r.van, 'the van never holds it').toBe(true);
  });
});
