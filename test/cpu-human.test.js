import { describe, it, expect, beforeAll } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';
import { SETUP_SRC } from './helpers/match-setup.js';
import { REACT_SRC, MATCH_SRC, firstDiff, changes } from './helpers/cpu-human.js';

// A HUMAN CPU: REACTION TIME AND INPUT SPEED (CPU_HUMAN in index.html).
//
// THE OWNER, 2026-10-20: "bots on easy are easy, but bots on normal are going an absurd jump!!! it is inhuman reactions and inputs..."
// Every CPU thought once a frame with perfect, current knowledge of every foe (the only difficulty was the handicap tail in finishAI), so a
// Normal CPU answered a foe's swing on the very next frame and changed its keys up to 30 times inside one second. The owner's picks: Normal
// reacts "About 1/3 s" late to anything new a foe does (20 frames), Hard "Human-fast too" (10), both at "Human input speed" (about 8 changes
// a second to the keys it holds), Easy unchanged, bit for bit. A CPU sees its foes as they were that many frames ago (it knows its own body
// now); its keys change at most tapBurst times back to back and then once every inputGap frames.
//
// Each reaction case: a CPU beside a foe that does nothing, then the foe does one thing (starts a smash, jumps, or a shot of its comes in).
// The same run with the foe doing nothing is the yardstick: the first frame the CPU's keys differ between the two is when it answered.
// (On the build before this, the three answered on frames 1, 4-5 and 7-12.)

let W;
beforeAll(() => {
  W = loadMonolith(1).window;
  W.eval('BOT_PB.legacy = true;');   // today's rules, no playbook: what is measured is the eyes and hands, not a learned bot
  W.eval(SETUP_SRC);
});

const react = (cpu, foe, lvl, ev, gap) => {
  const base = W.eval(REACT_SRC(cpu, foe, lvl, 'none', gap));
  const hit = W.eval(REACT_SRC(cpu, foe, lvl, ev, gap));
  return firstDiff(base.got, hit.got);
};

describe('a human CPU (CPU_HUMAN)', () => {
  it("is the owner's numbers: Normal sees 20 frames late, Hard 10, Easy as it is; Normal and Hard change keys about 8 times a second", () => {
    const c = W.eval('JSON.parse(JSON.stringify(CPU_HUMAN))');
    expect(c.react).toEqual([0, 20, 10]);
    expect(c.inputGap[0]).toBe(0);
    // no 60 frames hold more than tapBurst + 60/inputGap changes: 9, "about 8 a second"
    for (const lv of [1, 2]) expect(c.tapBurst + Math.floor(60 / c.inputGap[lv]), `level ${lv}`).toBeLessThanOrEqual(9);
    expect(c.tapMin).toBeGreaterThanOrEqual(2);
  });

  it('a Normal CPU answers a foe starting a smash no sooner than 20 frames later, Hard no sooner than 10 (and they do answer)', () => {
    for (const [lvl, late] of [[1, 20], [2, 10]]) {
      const d = react('Golf Ball', 'Rocky', lvl, 'attack', 110);
      expect(d, `level ${lvl}: first changed key on frame ${d}`).toBeGreaterThanOrEqual(late);
      expect(d, `level ${lvl}: it never answered`).toBeGreaterThanOrEqual(0);
    }
  });

  it('... a foe jumping: no sooner than 20 frames on Normal, 10 on Hard', () => {
    for (const [lvl, late] of [[1, 20], [2, 10]]) {
      const d = react('Pen', 'Firey', lvl, 'jump', 70);
      expect(d, `level ${lvl}: first changed key on frame ${d}`).toBeGreaterThanOrEqual(late);
      expect(d, `level ${lvl}: it never answered`).toBeGreaterThanOrEqual(0);
    }
  });

  it('... a shot coming in (Box packs away a shot that comes near): not seen until it is 20 frames old on Normal, 10 on Hard', () => {
    for (const [lvl, late] of [[1, 20], [2, 10]]) {
      const d = react('Box', 'Pen', lvl, 'shot', 150);
      expect(d, `level ${lvl}: first changed key on frame ${d}`).toBeGreaterThanOrEqual(late);
    }
  });

  it("Easy is today's CPU: with the eyes and hands taken out of the build, an Easy match presses the same keys every frame and rolls the same dice", () => {
    const m = ['Firey', 'Pen'];
    const a = W.eval(MATCH_SRC(m, 0, 501, 1800));
    const b = W.eval(`(function(){
      var r0 = cpuSeeRecord, b0 = cpuSeeBegin, k0 = cpuHumanKeys, touched = 0;
      cpuSeeRecord = function(){}; cpuSeeBegin = function(){ touched++; return null; }; cpuHumanKeys = function(f, inp){ touched++; return inp; };
      try { var r = ${MATCH_SRC(m, 0, 501, 1800)}; r.touched = touched; return r; }
      finally { cpuSeeRecord = r0; cpuSeeBegin = b0; cpuHumanKeys = k0; }
    })()`);
    expect(b.touched, 'an Easy CPU went through the eyes or the hands').toBe(0);
    expect(a.calls, 'Math.random calls').toBe(b.calls);
    expect(a.final).toBe(b.final);
    for (const i of [0, 1]) expect(a.got[i], `CPU ${i}'s keys`).toEqual(b.got[i]);
  });

  it('Normal and Hard: the keys a CPU holds never change more than 9 times in any 60 frames of a 30 s CPU-v-CPU match (its rules asked for far more)', () => {
    for (const lvl of [1, 2]) {
      const m = W.eval(MATCH_SRC(['Firey', 'Pen'], lvl, 501, 1800));
      for (const i of [0, 1]) {
        const got = changes(m.got[i]), want = changes(m.want[i]);
        expect(got.most, `level ${lvl}, CPU ${i}: ${got.most} changes in 60 frames`).toBeLessThanOrEqual(9);
        expect(got.total / (m.frames / 60), `level ${lvl}, CPU ${i}: changes a second`).toBeLessThanOrEqual(8);
        expect(want.most, `level ${lvl}, CPU ${i}: what its rules asked for (the hands have work to do)`).toBeGreaterThan(9);
      }
    }
  });

  it('a hold stays held, a tap stays a tap, and a press held on by the hands is never long enough for a second jab', () => {
    const r = JSON.parse(W.eval(`(function(){
      var keep = hazardT, K = function(o){ return Object.assign({ left:false, right:false, jump:false, down:false, attack:false, special:false, smash:false, up:false }, o || {}); };
      var drive = function(wants){ var f = { idx: 3 }, out = []; hazardT = 100000; for (var i = 0; i < wants.length; i++){ hazardT++; out.push(cpuHumanKeys(f, wants[i], CPU_HUMAN.inputGap[1])); } return out; };
      var run = function(out, key, from){ var n = 0; for (var i = from; i < out.length && out[i][key]; i++) n++; return n; };
      var res = {};
      // a special held 40 frames from rest: pressed at once, held all 40, never let go in between
      var w = []; for (var i = 0; i < 50; i++) w.push(K({ special: i < 40 }));
      var o = drive(w); res.holdStart = o[0].special; res.holdRun = run(o, 'special', 0);
      // a 1-frame jump from rest: a tap, let go tapMin frames later (the short hop stays a short hop)
      w = [K({ jump: true })]; for (var i = 0; i < 20; i++) w.push(K());
      o = drive(w); res.tapRun = run(o, 'jump', 0);
      // left and right swapped every frame for 120 frames: the hands go no faster than allowed, and each way is held tapMin frames or more
      w = []; for (var i = 0; i < 120; i++) w.push(K({ left: i % 2 === 0, right: i % 2 === 1 }));
      o = drive(w); var at = [], shortest = 1e9, last = 0;
      for (var i = 1; i < o.length; i++) if (!!o[i].left !== !!o[i-1].left || !!o[i].right !== !!o[i-1].right){ at.push(i); shortest = Math.min(shortest, i - last); last = i; }
      var most = 0; for (var a = 0, b = 0; b < at.length; b++){ while (at[b] - at[a] >= 60) a++; most = Math.max(most, b - a + 1); }
      res.jiggleMost = most; res.jiggleShortest = shortest;
      // a 1-frame jab that spends the last of the hands: held on until they come back, and let go well before a jab's cooldown ends
      w = [K({ right: true }), K({ right: true }), K({ right: true }), K({ right: true, attack: true })]; for (var i = 0; i < 30; i++) w.push(K({ right: true }));
      o = drive(w); var j0 = -1; for (var i = 0; i < o.length; i++) if (o[i].attack){ j0 = i; break; }
      res.jabRun = j0 < 0 ? 0 : run(o, 'attack', j0); res.jabCd = JAB_HIT_CD;
      // the smash commitment presses until its charge starts: a press wanted on, frame after frame, goes through when the hands come back
      w = [K({ right: true }), K(), K(), K({ left: true })]; for (var i = 0; i < 20; i++) w.push(K({ left: true, smash: true }));
      o = drive(w); res.smashAt = -1; for (var i = 4; i < o.length; i++) if (o[i].smash){ res.smashAt = i - 4; break; }
      hazardT = keep;
      return JSON.stringify(res);
    })()`));
    expect(r.holdStart, 'a hold from rest starts at once').toBe(true);
    expect(r.holdRun, 'the hold is one press, all 40 frames').toBeGreaterThanOrEqual(40);
    expect(r.holdRun, 'and let go as soon as the hands allow').toBeLessThanOrEqual(40 + 9);
    expect(r.tapRun, 'a tap is a tap').toBe(W.eval('CPU_HUMAN.tapMin'));
    expect(r.jiggleMost).toBeLessThanOrEqual(9);
    expect(r.jiggleShortest).toBeGreaterThanOrEqual(W.eval('CPU_HUMAN.tapMin'));
    expect(r.jabRun, 'the jab press went through').toBeGreaterThan(0);
    expect(r.jabRun, 'held on shorter than the jab cooldown: one jab').toBeLessThan(r.jabCd);
    expect(r.smashAt, 'the smash press waited for the hands, then went').toBeGreaterThanOrEqual(0);
    expect(r.smashAt).toBeLessThanOrEqual(10);
  });

  it('Normal CPUs still charge and throw their smashes, fire every Final Smash they win (some land), and Bow still Teleports at her foes', () => {
    const r = JSON.parse(W.eval(`(function(){
      var mk = window.__mk || ${'function(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }'};
      var tot = { sm: 0, commits: 0, glows: 0, fsFire: 0, fsHit: 0, wasted: 0, tps: 0, tpNear: 0 };
      var f0 = fireSmash, t0 = fsTryFire, a0 = teleportArrive;
      fireSmash = function(f){ tot.sm++; return f0.apply(this, arguments); };
      fsTryFire = function(f){ var r = t0.apply(this, arguments); if (r) tot.fsFire++; return r; };
      teleportArrive = function(f){ var r = a0.apply(this, arguments); tot.tps++;
        if (fighters.some(function(t){ return t !== f && !t.dead && t.team !== f.team && Math.hypot(t.x - f.x, t.y - f.y) < f.r + t.r + 40; })) tot.tpNear++; return r; };
      try {
        [['Firey', 'Pen', 'Rocky', 'Leafy'], ['Bow', 'Pen', 'Bow', 'Firey']].forEach(function(names, li){
          Math.random = mk(400 + li * 2);
          __setupCustomMatch(names, 9, 1, 3);
          var live = new Set(), prevC = {}, prevG = {}, best = {};
          for (var i = 0; i < 4000 && running; i++){
            if (!SMASHBALL && !fighters.some(function(f){ return f.fsGlow > 0 || f._fs; })) FS.next = Math.min(FS.next, 1);   // a Smash Ball whenever none is out
            step();
            fighters.forEach(function(f){ var c = f._aiCharging > 0, g = f.fsGlow > 0;
              if (c && !prevC[f.idx]) tot.commits++; if (g && !prevG[f.idx]) tot.glows++; if (!g && prevG[f.idx] && !f._fs) tot.wasted++;
              prevC[f.idx] = c; prevG[f.idx] = g;
              if (f._fs){ live.add(f); best[f.idx] = Math.max(best[f.idx] || 0, f._fs.hit.size); }
              else if (live.has(f)){ live.delete(f); if (best[f.idx] > 0) tot.fsHit++; best[f.idx] = 0; } });
          }
          running = false;
        });
      } finally { fireSmash = f0; fsTryFire = t0; teleportArrive = a0; }
      return JSON.stringify(tot);
    })()`));
    expect(r.commits, 'smash commitments in the sample').toBeGreaterThan(10);
    expect(r.sm, `${r.sm} smashes thrown for ${r.commits} commitments`).toBeGreaterThanOrEqual(Math.floor(r.commits * 0.9));
    expect(r.glows, 'Smash Balls won').toBeGreaterThan(5);
    expect(r.fsFire, 'every glow became a Final Smash').toBe(r.glows);
    expect(r.wasted, 'no glow ran out unused').toBe(0);
    expect(r.fsHit, 'Final Smashes that landed').toBeGreaterThan(0);
    expect(r.tps, 'Bow Teleported').toBeGreaterThan(0);
    expect(r.tpNear, 'and came out beside a foe').toBeGreaterThan(0);
  });

  it('knows its own body: flung out past the side, a Normal or Hard CPU gets back whenever it does with the eyes and hands taken off', () => {
    // (A single-screen stage's floor runs on under the whole world; what kills is the side blast zone, 120 px past the edge, and a CPU
    // flung out there has to stop its drift and come back in: aiThink's recovery, which reads only its own body.)
    const SRC = (name, lvl, on, vx) => `(function(){
      var keepR = CPU_HUMAN.react.slice(), keepG = CPU_HUMAN.inputGap.slice();
      if (!${on}){ CPU_HUMAN.react = [0, 0, 0]; CPU_HUMAN.inputGap = [0, 0, 0]; }
      try {
        Math.random = (window.__mk || ${'function(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }'})(77);
        __setupCustomMatch([${JSON.stringify(name)}, 'Rocky'], 3, ${lvl}, 0);
        var C = fighters[0], T = fighters[1]; C._lvl = ${lvl}; T.controller = 'still'; T.invuln = 1e9;
        for (var i = 0; i < 40; i++) step();
        var gy = groundY();
        T.x = WW - 300; T.y = gy - T.r; T.vx = 0; T.vy = 0;
        C.x = WW + 30; C.y = gy - 160; C.vx = ${vx}; C.vy = -4; C.onground = false; C.hitstun = 0; C.jumps = 1; C.spCd = 0; C._usedAirSpecial = false;
        var falls0 = C._falls || 0, back = false;
        for (var k = 0; k < 300 && running; k++){ step(); if ((C._falls || 0) > falls0 || C.dead) break; if (C.x < WW - 60){ back = true; break; } }
        return back;
      } finally { CPU_HUMAN.react = keepR; CPU_HUMAN.inputGap = keepG; running = false; }
    })()`;
    const lost = [];
    let cases = 0;
    for (const name of ['Firey', 'Pen', 'Rocky', 'Leafy', 'Puffball', 'Golf Ball']) for (const lvl of [1, 2]) for (const vx of [4, 8]) {
      if (!W.eval(SRC(name, lvl, false, vx))) continue;   // a launch it does not come back from anyway says nothing
      cases++;
      if (!W.eval(SRC(name, lvl, true, vx))) lost.push(`${name} L${lvl} vx${vx}`);
    }
    expect(cases, 'launches the CPU comes back from').toBeGreaterThan(6);
    expect(lost, 'came back without the eyes and hands, fell with them').toEqual([]);
  });

  it('touches no one else: not Easy, not a boss piece (One\'s ghost), not a RUNNING! runner', () => {
    const r = W.eval(`(function(){
      __setupCustomMatch(['Firey', 'Pen'], 3, 1, 0);
      var f = fighters[0], out = {};
      f._lvl = 0; out.easy = cpuHumanLevel(f);
      f._lvl = 1; out.normal = cpuHumanLevel(f);
      f._lvl = 2; out.hard = cpuHumanLevel(f);
      f._oneGhost = true; out.ghost = cpuHumanLevel(f); f._oneGhost = false;
      var keep = RACE.active; RACE.active = true; f._runner = true; out.runner = cpuHumanLevel(f); RACE.active = keep; f._runner = false;
      running = false;
      return out;
    })()`);
    expect(r).toEqual({ easy: 0, normal: 1, hard: 2, ghost: 0, runner: 0 });
  });
});
