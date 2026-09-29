import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';

// STEVE COBS'S PRIZE (2026-09-29). The OSC -- OJ, Suitcase and Cabby, the winners of Inanimate Insanity's three seasons -- were
// banned from the game by the owner's standing rule. The ruling that lets them in: "3, but only after you beat cobs." So all
// three are built as full playable fighters (batch-3 pattern: a row, seven lines, a smash identity, an up shape, a down, a
// special case, a traced hurtbox and limb rig, a render, art for what they throw, a quip) and HIDDEN until Steve Cobs has been
// beaten -- cobsBeaten(), off PROFILE.cobs.beaten. Hidden means not in ROSTER and in no table keyed by fighter or kit: the board
// must not reveal they exist, no AI pool can draw them, the Daily cannot pick them, no Vault code opens them, and the title's
// count leaves them out. Once the gate opens they sit in the DLC group like any other DLC fighter, unlocked.
// The owner's kit answers: OJ = "Classic orange" (File:OJ2024Pose.png), Juice Spill / Shattered Again / Across the Line / Cork;
// Suitcase = Full of Voices / Something Glowing Inside (THE BOMB) / Rocket to Mars / All the Tools We Need (the wrench);
// Cabby = File:Cabby2024Pose.png and the files, the Drawer Slam, Off the Cliff, the drawer ride. Art: OJ's puddle DRAWN; his
// a shard cropped from BFDIA 23 (File:BookSmashesThroughtheGlass.png); Suitcase's bomb cut from an Objects in Mirror frame; her wrench cut from the Marsh on
// Mars frame; Cabby's folder is File:Cabby file pose.png. No text on screen from any move; nothing of theirs leaks into anyone else.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const NAMES = ['OJ', 'Suitcase', 'Cabby'];
const KITS = { OJ: 'spill', Suitcase: 'voices', Cabby: 'files' };
const openGate = () => W.eval(`PROFILE.cobs = { beaten:true }; syncPrizeRoster(); PROFILE.viewMode = 'unlocked'; buildBoard(); ROSTER.length`);
const closeGate = () => W.eval(`PROFILE.cobs = null; syncPrizeRoster(); PROFILE.viewMode = 'unlocked'; buildBoard(); ROSTER.length`);
const cellNames = () => W.eval(`Array.prototype.map.call(document.querySelectorAll('#board .cell'), function(c){ var n = c.querySelector('.cellname'); return n ? n.textContent : ''; })`);

// A at 400 facing right, Pen (D) and Coiny (E) as foes on their own teams unless the body says otherwise. The gate must be open.
const arena = (name, body, foeX = 460, thirdX = 550) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.itemRate=0; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${foeX}, groundY()-24, 1);
  var E = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), ${thirdX}, groundY()-24, 2);
  [A,D,E].forEach(function(f,i){ f.team=i; f.controller='still'; f.stocks=9; }); A.face=1; D.face=-1;
  fighters=[A,D,E]; step(); [A,D,E].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; f.pct=30; f.armor=0; });
  A.onground = true;
  ${body}
})()`);

describe('the gate, shut', () => {
  it('cobsBeaten() reads PROFILE.cobs.beaten and nothing else', () => {
    expect(W.eval(`PROFILE.cobs = undefined; cobsBeaten()`)).toBe(false);
    expect(W.eval(`PROFILE.cobs = { beaten:false }; cobsBeaten()`)).toBe(false);
    expect(W.eval(`PROFILE.bossesCleared['Steve Cobs'] = true; cobsBeaten()`), 'the boss list alone is not the gate').toBe(false);
    expect(W.eval(`PROFILE.cobs = { beaten:true }; cobsBeaten()`)).toBe(true);
    W.eval(`PROFILE.cobs = null; delete PROFILE.bossesCleared['Steve Cobs']`);
  });

  it('shut, the three are nowhere: ROSTER is the 101 it was, and no table keyed by fighter or kit has them', () => {
    expect(closeGate()).toBe(101);
    const r = W.eval(`({ rows: ROSTER.filter(function(r){ return ${JSON.stringify(NAMES)}.indexOf(r.name) >= 0 || r.prize; }).length,
      mt: ${JSON.stringify(NAMES)}.filter(function(n){ return MOVE_TEXT[n]; }), quips: ${JSON.stringify(NAMES)}.filter(function(n){ return VICTORY_QUIPS[n]; }),
      sprites: ${JSON.stringify(NAMES)}.filter(function(n){ return SPRITES[n]; }), hurt: ${JSON.stringify(NAMES)}.filter(function(n){ return HURTBOX[n]; }), anim: ${JSON.stringify(NAMES)}.filter(function(n){ return FIGHTER_ANIM[n]; }),
      kits: ['spill','voices','files'].filter(function(k){ return SMASH_ID[k] || SMASH_SPEC[k] || UPSPEC[k] || DOWNSPECIALS[k]; }),
      arch: ['Hotelier','Quartermaster','Archivist'].filter(function(a){ return AI_CLASS[a]; }),
      prize: PRIZE_ROSTER.map(function(r){ return [r.name, isUnlocked(r), onePickable(r)]; }) })`);
    expect(r.rows).toBe(0);
    expect([r.mt, r.quips, r.sprites, r.hurt, r.anim, r.kits, r.arch]).toEqual([[], [], [], [], [], [], []]);
    expect(r.prize, 'a prize row anything still holds is locked and unpickable').toEqual([['OJ', false, false], ['Suitcase', false, false], ['Cabby', false, false]]);
  });

  it('shut, the board draws no cell for them in any view -- no name, no "?", no count that includes them', () => {
    closeGate();
    for (const mode of ['starters', 'unlocked', 'everything']) {
      W.eval(`PROFILE.viewMode = ${JSON.stringify(mode)}; buildBoard();`);
      const names = cellNames();
      expect(names.filter((n) => /\bOJ\b|Suitcase|Cabby/.test(n)), mode).toEqual([]);
      expect(names.filter((n) => /^\?+$/.test(n.trim())), `${mode}: no mystery cell either`).toEqual([]);
      expect(names.filter((n) => /Show all|unlocked/.test(n)).join(' '), `${mode}: the toggle's count`).not.toMatch(/10[4-9]/);
    }
    expect(W.eval(`document.getElementById('rosterLegend').textContent`)).toMatch(/\b101\b/);
    expect(W.eval(`document.getElementById('titleFighters').textContent`)).toBe('101');
    expect(W.eval(`document.querySelectorAll('#board .dlchead').length`), 'one DLC group').toBe(1);
  });

  it('shut, no AI pool can draw them: matches, Test mode dummies, a net host\'s fill, the Daily, One\'s allies, the World Cup bag', () => {
    closeGate();
    const drawn = W.eval(`(function(){
      var seen = {}, note = function(list){ list.forEach(function(f){ if(${JSON.stringify(NAMES)}.indexOf(f.name) >= 0) seen[f.name] = 1; }); };
      chosen = ROSTER.find(function(r){ return r.name==='Firey'; });
      SETTINGS.mode='ffa'; SETTINGS.count=8; SETTINGS.items=false; LINEUP_MEMO = null;
      for (var i=0;i<30;i++){ LINEUP_MEMO = null; buildFighters(); note(fighters); }
      TESTMODE.active = true; TESTMODE.dummies = 4; buildFighters(); note(fighters); TESTMODE.active = false;
      window.__netRoster = ['Firey','Leafy']; window.__netHumanCount = 2; for (var j=0;j<20;j++){ buildFighters(); note(fighters); } window.__netRoster = null; window.__netHumanCount = 0;
      for (var s=0;s<3000;s++){ var m = dailyMatchup(s*7919 + 13); if(m){ note([m.you, m.foe]); } }
      for (var k=0;k<20;k++) note(oneLineup().map(function(n){ return { name:n }; }));
      note(ROSTER.filter(function(r){ return r.play; }));   // the World Cup's bag and the tutorial's foes are this list
      fighters = []; return Object.keys(seen);
    })()`);
    expect(drawn).toEqual([]);
  });

  it('shut, no Vault code opens them, and their names are not codes', () => {
    const r = W.eval(`({ codes: ${JSON.stringify(NAMES)}.map(function(n){ return VAULT_CODES.has(vaultNorm(n)); }), vault: VAULT.fighters.filter(function(v){ return ${JSON.stringify(NAMES)}.indexOf(v.name) >= 0; }).length })`);
    expect(r.codes).toEqual([false, false, false]);
    expect(r.vault).toBe(0);
  });
});

describe('the gate, open', () => {
  it('open, the three join the END of ROSTER (104), unlocked, and sit in the DLC group on the board like any other DLC fighter', () => {
    expect(openGate()).toBe(104);
    const r = W.eval(`({ last: ROSTER.slice(-3).map(function(r){ return r.name; }), open: PRIZE_ROSTER.map(function(r){ return [isUnlocked(r), onePickable(r), r.dlc, r.prize]; }),
      heads: document.querySelectorAll('#board .dlchead').length, legend: document.getElementById('rosterLegend').textContent, title: document.getElementById('titleFighters').textContent,
      afterHead: (function(){ var out = [], on = false; Array.prototype.forEach.call(document.getElementById('board').children, function(c){
        if (c.classList.contains('dlchead')) on = true; else if (on) out.push(c.querySelector('.cellname').textContent); }); return out; })(),
      locked: Array.prototype.filter.call(document.querySelectorAll('#board .cell.locked'), function(c){ return /OJ|Suitcase|Cabby/.test(c.textContent); }).length })`);
    expect(r.last).toEqual(NAMES);
    expect(r.open).toEqual(NAMES.map(() => [true, true, 'Inanimate Insanity', 'Steve Cobs']));
    expect(r.heads).toBe(1);
    expect(NAMES.filter((n) => !r.afterHead.includes(n)), 'all three in the DLC group').toEqual([]);
    expect(r.afterHead.slice(-3), 'shown last, in the order they won').toEqual(NAMES);
    expect(r.locked).toBe(0);
    expect(r.legend).toMatch(/\b104\b/);
    expect(r.title).toBe('104');
  });

  it('open, every table has its rows: seven lines, a smash identity, a spec, an up shape, a down, a quip, a hurtbox, an AI class, a render', () => {
    openGate();
    const r = W.eval(`${JSON.stringify(NAMES)}.map(function(n){ var k = ROSTER.find(function(r){ return r.name===n; }).kit.special;
      return { n: n, lines: Object.keys(MOVE_TEXT[n]).sort(), sid: SMASH_ID[k] && SMASH_ID[k].name, spec: !!SMASH_SPEC[k], up: !!UPSPEC[k], down: typeof DOWNSPECIALS[k], quip: victoryQuipFor(n),
        hurt: [!!HURTBOX[n], !!HURT_POLY[n], !!LIMB_RIG[n]], cls: AI_CLASS[ROSTER.find(function(r){ return r.name===n; }).arch], src: SPRITES[n] && SPRITES[n].src, anim: !!FIGHTER_ANIM[n] }; })`);
    for (const x of r) {
      expect(x.lines).toEqual(['down', 'finisher', 'jab', 'ranged', 'special', 'up', 'utilt']);
      expect(x.spec).toBe(true); expect(x.up).toBe(true); expect(x.down).toBe('function'); expect(x.anim).toBe(true);
      expect(x.hurt).toEqual([true, true, true]);
      expect(x.quip.length).toBeGreaterThan(5);
    }
    expect(r.map((x) => x.sid)).toEqual(['Shattered Again', 'Something Glowing Inside', 'Drawer Slam']);
    expect(r.map((x) => x.cls)).toEqual(['brawl', 'trap', 'brawl']);
    expect(r.map((x) => x.src)).toEqual(['assets/sprites/oj.png', 'assets/sprites/suitcase.png', 'assets/sprites/cabby.png']);
    expect(r.map((x) => x.quip)).toEqual(['I did it! I won Inanimate Insanity!', 'Well, looks like I won.', "I have my notes. Now let's change some minds!"]);
  });

  it('open, the AI pools draw them like anyone else', () => {
    openGate();
    const drawn = W.eval(`(function(){
      var seen = {}, note = function(list){ list.forEach(function(f){ if(${JSON.stringify(NAMES)}.indexOf(f.name) >= 0) seen[f.name] = 1; }); };
      for (var s=0;s<3000;s++){ var m = dailyMatchup(s*7919 + 13); if(m) note([m.you, m.foe]); }
      chosen = ROSTER.find(function(r){ return r.name==='Firey'; }); SETTINGS.mode='ffa'; SETTINGS.count=8; SETTINGS.items=false;
      for (var i=0;i<40;i++){ LINEUP_MEMO = null; buildFighters(); note(fighters); }
      fighters = []; return Object.keys(seen).sort();
    })()`);
    expect(drawn).toEqual(['Cabby', 'OJ', 'Suitcase']);
  });

  it('the gate shutting again (a profile reset) takes them back out, tables and all, and never leaves the pick on one of them', () => {
    openGate();
    W.eval(`chosen = ROSTER.find(function(r){ return r.name==='OJ'; });`);
    expect(closeGate()).toBe(101);
    const r = W.eval(`({ chosen: chosen.name, mt: !!MOVE_TEXT.OJ, sid: !!SMASH_ID.spill, up: !!UPSPEC.voices, sp: !!SPRITES.Cabby, title: document.getElementById('titleFighters').textContent })`);
    expect(r.chosen).not.toBe('OJ');
    expect([r.mt, r.sid, r.up, r.sp]).toEqual([false, false, false, false]);
    expect(r.title).toBe('101');
  });

  it("the result screen's unlock note is the prize's only UI: the three are announced once, the moment the gate opens", () => {
    closeGate();
    const r = W.eval(`(function(){ PENDING_UNLOCKS.length = 0;
      PROFILE.cobs = { beaten:true }; var first = syncPrizeRoster(true), q1 = PENDING_UNLOCKS.slice(); var again = syncPrizeRoster(true), q2 = PENDING_UNLOCKS.slice();
      showUnlockNote(); var note = document.getElementById('unlockNote').textContent;
      return { first: first, q1: q1, again: again, q2: q2, note: note }; })()`);
    expect(r.first).toBe(true);
    expect(r.q1).toEqual(NAMES);
    expect(r.again).toBe(false);
    expect(r.q2).toEqual(NAMES);
    expect(r.note).toMatch(/3 NEW FIGHTERS: OJ, Suitcase, Cabby/);
    // awardBossCleared and showResult both sync: a Cobs fall that set the flag is announced with the result
    expect(W.eval(`String(awardBossCleared)`)).toMatch(/syncPrizeRoster\(true\)/);
    expect(W.eval(`String(showResult)`)).toMatch(/syncPrizeRoster\(true\)/);
  });
});

describe('the rows and renders', () => {
  beforeAll(() => openGate());

  it('all three are playable II DLC fighters with their canon kits, weights and colours, marked as Steve Cobs\'s prize', () => {
    const r = W.eval(`${JSON.stringify(NAMES)}.map(function(n){ var x = ROSTER.find(function(r){ return r.name===n; });
      return { name:x.name, dlc:x.dlc, play:x.play, kit:x.kit.special, desc:x.kit.desc, w:x.w, color:x.color, arch:x.arch, prize:x.prize }; })`);
    expect(r.map((x) => [x.dlc, x.play, x.prize])).toEqual(NAMES.map(() => ['Inanimate Insanity', true, 'Steve Cobs']));
    expect(r.map((x) => x.kit)).toEqual(['spill', 'voices', 'files']);
    expect(r.map((x) => [x.w, x.color, x.arch])).toEqual([[74, '#f8cd4f', 'Hotelier'], [78, '#c0996c', 'Quartermaster'], [92, '#a7b5e4', 'Archivist']]);
    for (const x of r) expect(x.desc).toMatch(/^[^→]+ → ./);
  });

  it('each render is a real transparent cut-out at most 200px tall from the II wiki, facing measured (Suitcase flipped), on the manifest and credited', () => {
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const manifest = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    for (const [n, file, flip, src] of [['OJ', 'oj.png', false, 'OJ2024Pose.png'], ['Suitcase', 'suitcase.png', true, 'Suitcase2024PoseCropped.png'], ['Cabby', 'cabby.png', false, 'Cabby2024Pose.png']]) {
      const png = PNG.sync.read(readFileSync(`artifacts/V1/assets/sprites/${file}`));
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(png.height).toBeLessThanOrEqual(200);
      expect(clear / (png.width * png.height), `${file} is not a cut-out`).toBeGreaterThan(0.1);
      expect(credits).toContain('`' + file + '`');
      expect(manifest[n].ok).toBe(true);
      expect(manifest[n].source).toContain(src);
      expect(manifest[n].flip).toBe(flip);
      expect(W.eval(`SPRITES[${JSON.stringify(n)}].flip`)).toBe(flip);
      expect(credits).toContain(manifest[n].source);
    }
  });

  it('the limb rigs match the bodies: Suitcase is armless, Cabby rolls on wheels', () => {
    const r = W.eval(`({ s: LIMB_RIG.Suitcase.arms.length, sFlag: SPRITES.Suitcase.arms, cLegs: SPRITES.Cabby.legs, oj: LIMB_RIG.OJ.arms.length })`);
    expect(r.s).toBe(0);
    expect(r.sFlag).toBe(false);
    expect(r.cLegs).toBe(false);
    expect(r.oj).toBeGreaterThan(0);
  });
});

// The seven inputs, measured the way test/move-text does (Pen at 40, 110 and 220).
const MOVES = { jab: 'A.atkCd=0; doAttack(A)', ranged: 'A.atkCd=0; doGroundMove(A)', utilt: 'A.atkCd=0; doUpTilt(A)', special: 'fireSpecial(A, {})',
  up: 'fireSpecial(A, {up:true})', down: 'fireSpecial(A, {down:true})', finisher: 'doAttackSpecial(A)' };
const measure = (name, call) => [40, 110, 220].map((dist) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${400 + dist}, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step();
  [A,D].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.armor=0; });
  A.onground = true;
  try { ${call}; } catch(e){ return { err: String(e && e.message || e) }; }
  var first = D.pct > 30.05 ? D.pct - 30 : 0, last = D.pct, any = D.pct - 30;
  for (var i=0;i<70;i++){ step(); D.x = Math.max(D.x, 60); D.dead = false;
    if (!first && D.pct > last + 0.3) first = D.pct - last; last = D.pct; any = Math.max(any, D.pct - 30); }
  return { first: +first.toFixed(2), any: +any.toFixed(2) };
})()`));

describe('every input runs and lands what its card says', () => {
  beforeAll(() => openGate());
  it.each(NAMES)('%s: seven lines, no errors, and every stated number is what lands (or nothing lands)', (name) => {
    const text = W.eval(`MOVE_TEXT[${JSON.stringify(name)}]`);
    for (const [move, call] of Object.entries(MOVES)) {
      const line = text[move], got = measure(name, call);
      expect(line, `${name} ${move}`).toMatch(/^[^—]+ — ./);
      expect(line.length, `${name} ${move}: too long`).toBeLessThanOrEqual(210);
      for (const m of got) expect(m.err, `${name} ${move} threw`).toBeUndefined();
      if (/no hit:/i.test(line)) { expect(Math.max(...got.map((x) => x.any)), `${name} ${move} says no hit`).toBeLessThan(0.3); continue; }
      const nums = [...line.match(/On hit: (.*)$/)[1].matchAll(/(\d+(?:\.\d+)?)%/g)].map((x) => +x[1]);
      const landed = got.filter((x) => x.first > 0).map((x) => x.first);
      expect(landed.length, `${name} ${move} never lands`).toBeGreaterThan(0);
      expect(landed.some((d) => nums.some((n) => Math.abs(d - n) <= Math.max(1.05, n * 0.12))), `${name} ${move}: says ${nums}, lands ${landed}`).toBe(true);
    }
  }, 120000);
});

describe('OJ: Juice Spill, Shattered Again, Across the Line, Cork', () => {
  beforeAll(() => openGate());

  it('the spill is a drawn puddle on the floor ahead that trips the first foe onto it once, and empties him', () => {
    const r = arena('OJ', `fireSpecial(A, {}); var p = projectiles.find(function(q){ return q.shape==='juicepuddle'; });
      var placed = !!p && !!p.trap && p.owner===A.idx, emptied = A._empty > hazardT;
      for (var i=0;i<60 && D.pct<=30;i++) step();
      return { placed: placed, emptied: emptied, pct: D.pct - 30, down: D._stunFx > 0, gone: !projectiles.some(function(q){ return q.shape==='juicepuddle'; }),
        art: ATTACK_SPRITES.juicepuddle === undefined && !!PROJ_SHAPE.juicepuddle };`, 470);
    expect(r.placed).toBe(true);
    expect(r.emptied).toBe(true);
    expect(r.pct).toBeCloseTo(4, 0);
    expect(r.down).toBe(true);
    expect(r.gone).toBe(true);
    expect(r.art, 'the puddle is drawn, not a file').toBe(true);
  });

  it('his own puddle never trips him or a teammate; one puddle at a time; empty, he cannot spill again until he refills', () => {
    const r = arena('OJ', `E.team = 0; fireSpecial(A, {}); var p1 = projectiles.find(function(q){ return q.shape==='juicepuddle'; });
      A.x = 470; E.x = 470; for (var i=0;i<60;i++) step();
      A.spCd = 0; fireSpecial(A, {}); var n = projectiles.filter(function(q){ return q.shape==='juicepuddle'; }).length, same = projectiles.indexOf(p1) >= 0;
      A._empty = 0; A.spCd = 0; fireSpecial(A, {}); var p2 = projectiles.find(function(q){ return q.shape==='juicepuddle'; });
      return { self: A.pct - 30, mate: E.pct - 30, n: n, same: same, fresh: !!p2 && p2 !== p1, count: projectiles.filter(function(q){ return q.shape==='juicepuddle'; }).length };`, 900, 470);
    expect(r.self).toBe(0);
    expect(r.mate).toBe(0);
    expect(r.n).toBe(1);
    expect(r.same, 'empty: the old puddle stays, nothing new is poured').toBe(true);
    expect(r.fresh, 'refilled: a fresh puddle').toBe(true);
    expect(r.count).toBe(1);
  });

  it('empty, he is moody: his hits land a quarter harder and the empty glass flies a quarter further', () => {
    const r = arena('OJ', `A._empty = hazardT + 240; var p0 = D.pct; applyHit(D, 8, 0, 0, A); var emptyHit = D.pct - p0;
      A._empty = 0; p0 = D.pct; applyHit(D, 8, 0, 0, A); var fullHit = D.pct - p0;
      A.pct = 50; A.vx = 0; A.vy = 0; A._empty = hazardT + 240; applyHit(A, 5, 10, -5, D); var vEmpty = Math.hypot(A.vx, A.vy);
      A.pct = 50; A.vx = 0; A.vy = 0; A._empty = 0; A.invuln = 0; applyHit(A, 5, 10, -5, D); var vFull = Math.hypot(A.vx, A.vy);
      return { emptyHit: emptyHit, fullHit: fullHit, vEmpty: vEmpty, vFull: vFull };`, 700);
    expect(r.emptyHit).toBeCloseTo(10, 1);
    expect(r.fullHit).toBeCloseTo(8, 1);
    expect(r.vEmpty).toBeGreaterThan(r.vFull * 1.15);
  });

  it('Shattered Again knocks everyone round him down and costs him 5%; Across the Line rises, bowls over the neighbour and leaves him sprinting', () => {
    const smash = arena('OJ', `doSmash(A); var down = 0; for (var i=0;i<30;i++){ step(); down = Math.max(down, D._stunFx||0); } return { d: D.pct - 30, e: E.pct - 30, self: A.pct - 30, downD: down > 0 };`, 460, 340);
    expect(smash.d).toBeGreaterThan(10);
    expect(smash.e).toBeGreaterThan(10);
    expect(smash.self).toBe(5);
    expect(smash.downD).toBe(true);
    const up = arena('OJ', `fireSpecial(A, {up:true}); var rising = A.vy < 0, haste = A._hasteT > 0, down = D._stunFx||0; for (var i=0;i<30;i++){ step(); down = Math.max(down, D._stunFx||0); }
      return { rising: rising, haste: haste, pct: D.pct - 30, down: down > 0 };`, 440);
    expect(up.rising).toBe(true);
    expect(up.haste).toBe(true);
    expect(up.pct).toBeCloseTo(6, 0);
    expect(up.down).toBe(true);
  });

  it('the Cork: no hit; a shot that reaches him stops dead, no slick trips him, he cannot spill, and he walks slower', () => {
    const r = arena('OJ', `fireSpecial(A, {down:true}); var corked = A._corked > hazardT, slow = A.slowed > 0, hits = D.pct + E.pct;
      spawnProj(D, {vx:-10, vy:0, grav:false, dmg:9, kb:6, r:8, color:'#fff', life:60}); for (var i=0;i<20;i++) step();
      var shot = { pct: A.pct - 30, left: projectiles.filter(function(p){ return p.owner===D.idx; }).length };
      projectiles = []; addProj({owner:-1, ownerObj:E, x:A.x, y:A.y, vx:0, vy:0, grav:false, dmg:4/TRAP_DMG_MULT, kb:6, r:40, color:'#6b5a1e', life:300, trap:true, arm:2, shape:'oliveoil', fxTag:'knockdown', fxN:24});
      for (var j=0;j<30;j++) step(); var slick = A.pct - 30;
      A.spCd = 0; fireSpecial(A, {}); var spilled = projectiles.some(function(p){ return p.shape==='juicepuddle'; });
      A._corked = 0; A.invuln = 0; for (var k=0;k<30;k++) step(); var tripped = A.pct - 30;
      return { corked: corked, slow: slow, others: hits - 60, shot: shot, slick: slick, spilled: spilled, tripped: tripped };`, 600, 700);
    expect(r.corked).toBe(true);
    expect(r.slow).toBe(true);
    expect(r.others, 'the cork hits nobody').toBe(0);
    expect(r.shot.pct, 'a shot stops dead on the cork').toBe(0);
    expect(r.shot.left, 'and is spent').toBe(0);
    expect(r.slick, 'a slick cannot trip him while corked').toBe(0);
    expect(r.spilled, 'the juice is sealed in').toBe(false);
    expect(r.tripped, 'uncorked, the same slick trips him').toBeGreaterThan(0);
  });
});

describe('Suitcase: Full of Voices, Something Glowing Inside, Rocket to Mars, All the Tools We Need', () => {
  beforeAll(() => openGate());

  it('the voices are a slow drawn wave that scrambles the controls of whoever hears them (3%), and her lid opens', () => {
    const r = arena('Suitcase', `fireSpecial(A, {}); var w = projectiles.find(function(p){ return p.shape==='voices'; }), lid = A._lidT > hazardT;
      for (var i=0;i<40 && D.pct<=30;i++) step();
      return { wave: !!w && w.fxTag==='scramble', slow: !!w && Math.abs(w.vx) <= 6, lid: lid, pct: D.pct - 30, rev: D.ctrlRev > 0, drawn: ATTACK_SPRITES.voices === undefined && !!PROJ_SHAPE.voices };`);
    expect(r.wave).toBe(true);
    expect(r.slow).toBe(true);
    expect(r.lid).toBe(true);
    expect(r.pct).toBeCloseTo(3, 0);
    expect(r.rev).toBe(true);
    expect(r.drawn).toBe(true);
  });

  it('the bomb is set down 40 ahead, arms, and blows whoever comes for it -- and it is the bomb art, glowing', () => {
    const r = arena('Suitcase', `doSmash(A); var m = projectiles.find(function(p){ return p._mine && p.owner===A.idx; });
      var out = { shape: m && m.shape, at: m && Math.round(m.x - A.x), glow: !!(ATTACK_SPRITES.casebomb && ATTACK_SPRITES.casebomb.glow) };
      D.x = m.x; for (var i=0;i<90 && D.pct<=30;i++) step(); out.pct = D.pct - 30; out.down = D._stunFx > 0; return out;`, 800);
    expect(r.shape).toBe('casebomb');
    expect(r.at).toBe(40);
    expect(r.glow).toBe(true);
    expect(r.pct).toBeGreaterThan(15);
    expect(r.down).toBe(true);
  });

  it('Rocket to Mars is pure height, and the blast under her burns whoever is below', () => {
    const r = arena('Suitcase', `fireSpecial(A, {up:true}); var rising = A.vy < -12, pct = D.pct - 30; for (var i=0;i<20;i++) step();
      return { rising: rising, pct: pct, burn: D.burn > 0, burnt: D.pct - 30 - pct };`, 440);
    expect(r.rising).toBe(true);
    expect(r.pct).toBeCloseTo(4, 0);
    expect(r.burn).toBe(true);
    expect(r.burnt, 'and the burn keeps ticking').toBeGreaterThan(0);
  });

  it('the wrench is a placed trap: the first foe onto it is stunned (4%); a teammate picks it up and hits harder for 4 seconds; one at a time', () => {
    const foe = arena('Suitcase', `fireSpecial(A, {down:true}); var w = projectiles.find(function(p){ return p.shape==='wrench'; }), lid = A._lidT > hazardT;
      for (var i=0;i<80 && D.pct<=30;i++) step();
      return { placed: !!w && !!w.trap && !!w.allyPickup, lid: lid, pct: D.pct - 30, stun: D._stunFx > 0, gone: !projectiles.some(function(p){ return p.shape==='wrench'; }) };`, 460);
    expect(foe.placed).toBe(true);
    expect(foe.lid).toBe(true);
    expect(foe.pct).toBeCloseTo(4, 0);
    expect(foe.stun).toBe(true);
    expect(foe.gone).toBe(true);
    const mate = arena('Suitcase', `E.team = 0; E.x = 460; fireSpecial(A, {down:true});
      for (var i=0;i<80 && projectiles.some(function(p){ return p.shape==='wrench'; });i++) step();
      return { emp: E._empowerT, pct: E.pct - 30, gone: !projectiles.some(function(p){ return p.shape==='wrench'; }) };`, 900, 460);
    expect(mate.emp).toBeGreaterThan(200);
    expect(mate.pct).toBe(0);
    expect(mate.gone).toBe(true);
    const one = arena('Suitcase', `fireSpecial(A, {down:true}); A.spCd = 0; A.x += 120; fireSpecial(A, {down:true}); return projectiles.filter(function(p){ return p.shape==='wrench'; }).length;`, 900, 950);
    expect(one).toBe(1);
    expect(W.eval(`AI_TRAP_DOWN.has('voices')`), 'the bot lays it like any floor trap').toBe(true);
  });
});

describe('Cabby: On File, Drawer Slam, Off the Cliff, Ride in the Drawer', () => {
  beforeAll(() => openGate());

  it('the file marks the foe it hits (4%): her hits on them land 30% harder, nobody else\'s do, and a new file moves the mark', () => {
    const r = arena('Cabby', `fireSpecial(A, {}); var p = projectiles.find(function(q){ return q.shape==='file'; }), drawer = A._drawerT > hazardT;
      for (var i=0;i<40 && D.pct<=30;i++) step(); var pct = D.pct - 30, marked = D._onFile > hazardT && D._onFileBy === A.idx;
      var p0 = D.pct; applyHit(D, 10, 0, 0, A); var hers = D.pct - p0;
      p0 = E.pct; applyHit(E, 10, 0, 0, A); var unmarked = E.pct - p0;
      p0 = D.pct; applyHit(D, 10, 0, 0, E); var others = D.pct - p0;
      SM_FX.onfile(E, A, 360); var moved = !(D._onFile > hazardT) && E._onFile > hazardT;
      return { file: !!p, drawer: drawer, pct: pct, marked: marked, hers: hers, unmarked: unmarked, others: others, moved: moved };`, 500, 900);
    expect(r.file).toBe(true);
    expect(r.drawer).toBe(true);
    expect(r.pct).toBeCloseTo(4, 0);
    expect(r.marked).toBe(true);
    expect(r.hers).toBeCloseTo(13, 1);
    expect(r.unmarked).toBeCloseTo(10, 1);
    expect(r.others).toBeCloseTo(10, 1);
    expect(r.moved).toBe(true);
  });

  it('the Drawer Slam lunges and knocks them down; Off the Cliff rises, hangs, then drops on whoever is under her (13%, knocked down)', () => {
    const smash = arena('Cabby', `doSmash(A); var down = 0; for (var i=0;i<30;i++){ step(); down = Math.max(down, D._stunFx||0); } return { pct: D.pct - 30, down: down > 0 };`, 460);
    expect(smash.pct).toBeGreaterThan(15);
    expect(smash.down).toBe(true);
    const up = arena('Cabby', `fireSpecial(A, {up:true}); var rising = A.vy < 0, hung = false, maxY = A.y, down = 0; var y0 = A.y;
      for (var i=0;i<90;i++){ step(); if (A._stall && A._stall.phase==='hang') hung = true; maxY = Math.min(maxY, A.y); down = Math.max(down, D._stunFx||0); }
      return { rising: rising, hung: hung, rose: y0 - maxY, pct: D.pct - 30, down: down > 0 };`, 440);
    expect(up.rising).toBe(true);
    expect(up.hung).toBe(true);
    expect(up.rose).toBeGreaterThan(20);
    expect(up.pct).toBeCloseTo(13, 0);
    expect(up.down).toBe(true);
  });

  it('the ride bundles the foe in front into her drawer (6%), rolls forward with them, and pops them out behind her, dizzy; a boss is not carried', () => {
    const r = arena('Cabby', `var x0 = A.x; fireSpecial(A, {down:true}); var held = D.rooted > 20 && !!A._drawer && A._drawer.idx === D.idx, pct = D.pct - 30;
      var rode = 0; for (var i=0;i<14;i++){ step(); if (A._dashing > 0 && Math.abs(D.x - A.x) < 10) rode++; }
      return { held: held, pct: pct, rode: rode, moved: A.x - x0, behind: Math.sign(D.x - A.x) === -A.face, dizzy: D._stunFx > 0, released: !A._drawer, e: E.pct - 30 };`, 440, 470);
    expect(r.held).toBe(true);
    expect(r.pct).toBe(6);
    expect(r.rode).toBeGreaterThan(5);
    expect(r.moved).toBeGreaterThan(50);
    expect(r.behind).toBe(true);
    expect(r.dizzy).toBe(true);
    expect(r.released).toBe(true);
    expect(r.e, 'the roll itself hits nobody').toBe(0);
    const boss = arena('Cabby', `summons = [{ type:'boss', name:'Announcer', team:1, x:432, y:A.y, r:40, hp:100, maxHp:100, life:1e9, vx:0, vy:0 }];
      fireSpecial(A, {down:true}); return { hp: summons[0].hp, carried: !!A._drawer, dashing: A._dashing > 0 };`, 900, 950);
    expect(boss.hp).toBe(94);
    expect(boss.carried).toBe(false);
    expect(boss.dashing).toBe(false);
  });
});

describe('the standing rules', () => {
  beforeAll(() => openGate());

  it('no word reaches the screen through any move, the puddle, the bomb, the wrench, the ride or the cork', () => {
    const shown = W.eval(`(function(){
      var calls = ['doAttack(A)', 'doGroundMove(A)', 'doUpTilt(A)', 'fireSpecial(A, {})', 'fireSpecial(A, {up:true})', 'fireSpecial(A, {down:true})',
        'doSmash(A, 1.0)', 'doAttackSpecial(A)', 'fireSpecial(A, {down:true}); A.spCd=0; fireSpecial(A, {})', 'doSmash(A, 1.0); D.x = A.x + 40;'];
      var out = [];
      ${JSON.stringify(NAMES)}.forEach(function(name){ calls.forEach(function(call){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
        worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
        var A = makeFighter(ROSTER.find(function(r){ return r.name===name; }), 400, groundY()-24, 0);
        var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 460, groundY()-24, 1);
        A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
        fighters=[A,D]; step(); [A,D].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.armor=0; });
        A.you = true; window.__lastBanner = null;
        try { eval(call); } catch(e){ out.push(name+' '+call+': threw '+e.message); return; }
        for (var i=0;i<60;i++){ step(); D.dead = false; A.dead = false; }
        if (window.__lastBanner && window.__lastBanner.text) out.push(name+' '+call+': "'+window.__lastBanner.text+'"');
      }); });
      return out;
    })()`);
    expect(shown).toEqual([]);
  }, 120000);

  it("the OSC appears in the file only inside blocks marked as Steve Cobs's prize (and the two generated tables), and nothing of theirs leaks into anyone else's rows, lines or quips", () => {
    const lines = readFileSync('artifacts/V1/index.html', 'utf8').split(/\r?\n/);
    let inPrize = false, inGen = false, blocks = 0;
    const stray = lines.filter((l) => {
      if (/Steve Cobs's prize \(OJ, Suitcase, Cabby\): begin/.test(l)) { inPrize = true; blocks++; }
      const skip = inPrize || inGen;
      if (/Steve Cobs's prize: end/.test(l)) inPrize = false;
      if (/^\/\/ GENERATED by scripts\/trace-(hurtboxes|limbs)\.mjs/.test(l)) inGen = true;
      if (/^\/\/ END GENERATED/.test(l)) inGen = false;
      return !skip && /\b(OJ|Suitcase|Cabby|Orange Juice)\b/.test(l) && !/No one from the OSC/.test(l);
    });
    expect(stray).toEqual([]);
    expect(inPrize, 'every begin has its end').toBe(false);
    expect(blocks).toBeGreaterThan(10);
    const leaks = W.eval(`ROSTER.filter(function(r){ return ${JSON.stringify(NAMES)}.indexOf(r.name) < 0; }).map(function(r){
      return [r.name, JSON.stringify(r) + JSON.stringify(MOVE_TEXT[r.name]||{}) + (VICTORY_QUIPS[r.name]||'')]; }).filter(function(x){ return /\\bOJ\\b|Suitcase|Cabby|Orange Juice/.test(x[1]); }).map(function(x){ return x[0]; })`);
    expect(leaks).toEqual([]);
    // the SMASH_ID block's names and colours pass the identity rules everyone else's do
    const ids = W.eval(`['spill','voices','files'].map(function(k){ return [SMASH_ID[k].name, SMASH_ID[k].color, SMASH_ID[k].tones.length, !!SMASH_ID[k].noise]; })`);
    for (const [name, color, tones, noise] of ids) { expect(name.length).toBeGreaterThan(3); expect(color).toMatch(/^#[0-9a-f]{6}$/); expect(tones).toBeGreaterThanOrEqual(2); expect(noise).toBe(true); }
  });

  it("what they throw or set down wears the show's art (the shards, the bomb, the wrench, the file) or a drawn prop (the puddle, the voices); every file is a transparent cut-out at projectile size, on the manifest and credited", () => {
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const manifest = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
    const want = { ojshard: 'ojshard.png', casebomb: 'casebomb.png', wrench: 'wrench.png', file: 'file.png' };
    const r = W.eval(`(function(){ var o = {}; ${JSON.stringify(Object.keys(want))}.forEach(function(k){ o[k] = { src: ATTACK_SPRITES[k] && ATTACK_SPRITES[k].src, glyph: !!PROJ_SHAPE[k] }; });
      o.drawn = ['juicepuddle','voices'].map(function(k){ return [ATTACK_SPRITES[k] === undefined, !!PROJ_SHAPE[k]]; }); return o; })()`);
    expect(r.drawn).toEqual([[true, true], [true, true]]);
    for (const [k, file] of Object.entries(want)) {
      expect(r[k].src).toBe(`assets/sprites/attacks/${file}`);
      expect(r[k].glyph).toBe(true);
      expect(existsSync(`artifacts/V1/assets/sprites/attacks/${file}`)).toBe(true);
      const png = PNG.sync.read(readFileSync(`artifacts/V1/assets/sprites/attacks/${file}`));
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(Math.max(png.width, png.height)).toBeLessThanOrEqual(128);
      expect(Math.max(png.width, png.height)).toBeGreaterThanOrEqual(24);
      expect(clear / (png.width * png.height), `${file} is transparent`).toBeGreaterThan(0.1);
      const e = manifest[k];
      expect(e && e.file).toBe(file);
      expect([png.width, png.height]).toEqual([e.width, e.height]);
      // the shard is BFDI art (BFDIA 23, the owner's episode); the rest are the II wiki's
      expect(e.source).toMatch(k === 'ojshard' ? /^https:\/\/static\.wikia\.nocookie\.net\/battlefordreamisland\/images\// : /^https:\/\/static\.wikia\.nocookie\.net\/inanimateinsanity\/images\//);
      expect(credits).toContain(`(${file})`);
      expect(credits).toContain(e.source);
    }
    // the owner's sources, exactly: the shard out of BFDIA 23 ("the episode bfdia 23.": Book smashing through the glass), the bomb out of an Objects in Mirror frame, the wrench out of the
    // Marsh on Mars frame, the folder as-is
    expect(manifest.ojshard.srcTitle).toBe('BookSmashesThroughtheGlass.png');
    expect(manifest.ojshard.key).toBe('glass');
    expect(manifest.casebomb.srcTitle).toMatch(/^II218 \d+\.jpeg$/);
    expect(manifest.wrench.srcTitle).toBe('S2e2 wow, this should make this challenge a walk in the park!.png');
    expect(manifest.file.srcTitle).toBe('Cabby file pose.png');
    // the cuts carry nothing of their frames: no sky blue in the shard, no case brown in the wrench, no sky in the bomb
    const solid = (f, test) => { const p = PNG.sync.read(readFileSync(`artifacts/V1/assets/sprites/attacks/${f}`)); let n = 0;
      for (let i = 0; i < p.data.length; i += 4) if (p.data[i + 3] >= 128 && test(p.data[i], p.data[i + 1], p.data[i + 2])) n++; return n; };
    expect(solid('ojshard.png', (r0, g, b) => b - r0 > 55 && b > 190 && g > 150), 'the sky').toBe(0);
    expect(solid('wrench.png', (r0, g, b) => r0 - b > 45), 'the case').toBe(0);
    expect(solid('casebomb.png', (r0, g, b) => Math.min(r0, g, b) < 180), 'the sky or the hands').toBe(0);
  });
});
