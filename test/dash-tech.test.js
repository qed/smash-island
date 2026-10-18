import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "im a celeste nerd, give me hypers when im on a dasher.." (the owner, 2026-10-14). A dasher (Leafy, Liy, Woody) who jumps out of a dash on the
// ground: out of a down-forward dash a HYPER (long, low, fast), out of a straight dash a SUPER (normal height, the dash's speed), with the
// opposite direction held a short REVERSE HYPER; a down-forward air dash that lands is a WAVEDASH (jump within a few frames: a hyper); one air dash
// an airtime, refilled on landing.
// "hypers should only be in ctf" (the owner, 2026-10-15): the tech works in Capture the Flag and nowhere else, so these pins run with the CTF switch (hyperOk) on, and the last tests
// check that it is on in CTF only and that every other mode jumps out of a dash like anyone.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); W.eval('window.__hyperOk = hyperOk;'); });
const J = (code) => W.eval(`(function(){ return ${code}; })()`);
const stage = (name = 'Leafy', ctf = true) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
  var A = mk(${JSON.stringify(name)}, 300, 0), D = mk('Pen', 1000, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='local'; A.you=true; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; for (var k in down) delete down[k]; step(); step();
  fighters.forEach(function(f){ f.invuln=0; f.hitstun=0; f.atkCd=0; f.spCd=0; f.vx=0; f.vy=0; f.pct=0; });
  hyperOk = ${ctf ? 'function(){ return true; }' : 'window.__hyperOk'};   // (a real CTF match needs its map and flags: these pins flip only the switch)
})()`);
const hold = (keys, n = 1) => W.eval(`(function(){ ${JSON.stringify(keys)}.forEach(function(k){ down[KEYS[k]]=true; }); for(var i=0;i<${n};i++) step(); ${JSON.stringify(keys)}.forEach(function(k){ down[KEYS[k]]=false; }); })()`);
const steps = (n) => W.eval(`for(var i=0;i<${n};i++) step();`);
// follow the jump from here until she lands: how far she went along x and how high she rose
const flight = () => J(`(function(){ var A = fighters[0], x0 = A.x, y0 = groundY()-24, ymin = A.y, n = 0; while (!A.onground && n++ < 200){ step(); if (A.y < ymin) ymin = A.y; } return { dx: A.x - x0, rise: y0 - ymin, frames: n, kind: A._hyperKind }; })()`);
const normal = () => { stage(); W.eval('down[KEYS.right]=true; down[KEYS.jump]=true;'); steps(14); W.eval('down[KEYS.jump]=false;'); const r = flight(); W.eval('down[KEYS.right]=false;'); return r; };

describe('dash tech (Leafy; Liy and Woody are the other dashers)', () => {
  it('a hyper goes farther and lower than a normal jump', () => {
    const n = normal();
    stage(); hold(['right', 'down', 'special'], 1); steps(2);
    expect(J('fighters[0]._dashing')).toBeGreaterThan(0);
    expect(J('fighters[0].onground')).toBe(true);
    hold(['jump'], 1);
    const h = flight();
    expect(h.kind).toBe('hyper');
    expect(h.dx, 'farther').toBeGreaterThan(n.dx * 1.6);
    expect(h.rise, 'lower').toBeLessThan(n.rise * 0.65);
    expect(h.rise).toBeGreaterThan(10);
  });
  it('a super goes farther at normal height', () => {
    const n = normal();
    stage(); hold(['special'], 1); steps(6);
    expect(J('fighters[0]._dashing')).toBeGreaterThan(0);
    hold(['jump'], 1);
    const s = flight();
    expect(s.kind).toBe('super');
    expect(s.dx, 'farther').toBeGreaterThan(n.dx * 1.5);
    expect(s.rise, 'as high').toBeGreaterThan(n.rise * 0.8);
  });
  it('with the other direction held it is a short hyper backward', () => {
    stage(); hold(['right', 'down', 'special'], 1); steps(2); hold(['left', 'jump'], 1);
    const r = flight();
    expect(r.kind).toBe('rev');
    expect(r.dx).toBeLessThan(-120);
    expect(r.dx).toBeGreaterThan(-700);
    expect(J('fighters[0].face')).toBe(-1);
  });
  it('a wavedash: a down-forward dash from the air that lands, and a jump a few frames later, is a hyper', () => {
    stage(); W.eval('fighters[0].y = groundY()-24-120; fighters[0].onground = false; fighters[0].vy = 0;');
    hold(['right', 'down', 'special'], 1);
    let g = 0; while (!J('fighters[0].onground') && g++ < 30) steps(1);
    expect(J('fighters[0].onground')).toBe(true);
    expect(J('fighters[0]._dashing')).toBeGreaterThan(0);
    hold(['jump'], 1);
    const r = flight();
    expect(r.kind).toBe('hyper');
    expect(r.dx).toBeGreaterThan(300);
    // "nerf wavedashes" (the owner, 2026-10-16): a wavedash's hyper goes clearly less far than a hyper off a dash started on the ground
    stage(); hold(['right', 'down', 'special'], 1); steps(2); hold(['jump'], 1);
    const h = flight();
    expect(h.kind).toBe('hyper');
    expect(r.dx, 'the wavedash is the shorter hyper').toBeLessThan(h.dx * 0.9);
  });
  it('one air dash an airtime, and the dash comes back on landing', () => {
    stage(); W.eval('fighters[0].y = groundY()-24-300; fighters[0].onground = false; fighters[0].vy = 0;');
    hold(['right', 'special'], 1); steps(2); hold(['right', 'special'], 1);   // (right + C is the neutral special, aimed that way, and goes at once: the first is the air dash; side specials are gone, the owner, 2026-10-16)
    const first = J('fighters[0]._airDash');
    expect(first).toBe(true);
    W.eval('fighters[0].spCd = 0; fighters[0]._dashing = 0; fighters[0]._mv = null; fighters[0].atkCd = 0;'); steps(2);
    const x0 = J('fighters[0].x'); hold(['right', 'down', 'special'], 1); steps(3);
    expect(J('fighters[0]._dashing'), 'a second air dash is refused').toBe(0);
    W.eval('fighters[0].y = groundY()-24; fighters[0].onground = true; fighters[0].vy = 0;'); steps(2);
    expect(J('!!fighters[0]._airDash'), 'landing refills it').toBe(false);
  });
  it('a CPU dasher plays as it always did: its jump turns a dash into a hyper only when its own moveset logic asks (restated 2026-10-18: Woody was the unconverted dasher; batch 7 converted him, so the pin is the CPU rule itself)', () => {
    stage('Woody'); W.eval('fighters[0].controller = "ai"; fighters[0].you = false;');
    expect(J('mtOn(fighters[0])'), 'a converted fighter has movetech').toBe(true);
    expect(J('mtDashJump(fighters[0], { jump:true })'), 'but a CPU jump alone is no hyper').toBe(false);
  });
  it('the switch is on in Capture the Flag and in no other mode', () => {
    const on = (mode) => J(`(function(){ var m = SETTINGS.mode; SETTINGS.mode = ${JSON.stringify(mode)}; var r = window.__hyperOk(); SETTINGS.mode = m; return r; })()`);
    expect(on('ctf')).toBe(true);
    for (const m of ['ffa', 'teams', 'worldcup', 'boss', 'bossrush', 'training', 'race']) expect(on(m), m).toBe(false);
  });
  it('outside Capture the Flag a jump out of a dash is just a jump: no hyper, no super, no reverse hyper, no wavedash', () => {
    stage('Leafy', false); hold(['right', 'down', 'special'], 1); steps(2);
    expect(J('fighters[0]._dashing')).toBeGreaterThan(0);
    hold(['jump'], 1);
    const r = flight();
    expect(r.kind, 'a plain jump leaves no tech behind').toBeUndefined();
    stage('Leafy', false); hold(['special'], 1); steps(6); hold(['jump'], 1);
    expect(flight().kind).toBeUndefined();
    stage('Leafy', false); hold(['right', 'down', 'special'], 1); steps(2); hold(['left', 'jump'], 1);
    expect(flight().kind).toBeUndefined();
    stage('Leafy', false); W.eval('fighters[0].y = groundY()-24-120; fighters[0].onground = false; fighters[0].vy = 0;');
    hold(['right', 'down', 'special'], 1);
    let g = 0; while (!J('fighters[0].onground') && g++ < 30) steps(1);
    hold(['jump'], 1);
    expect(flight().kind, 'no wavedash').toBeUndefined();
  });
});
