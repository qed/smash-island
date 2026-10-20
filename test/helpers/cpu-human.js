// The measurements test/cpu-human.test.js makes of a CPU's reaction time and input speed (CPU_HUMAN in index.html), as sources run
// inside a booted monolith window (they read the game's lexical state). Kept apart from the test so the same measurement can be run on
// another build, for the before/after numbers.

// mulberry32, inside the game's realm
const MK = 'function(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }';
const KEYS = "['left','right','jump','up','down','attack','special','smash','grab','fin','flag','edit']";

// Records, for every CPU, the keys it presses each frame: what its rules asked for (after fsBotInput: `want`) and what it pressed
// (after the hands, cpuHumanKeys, where the build has them and the CPU's level uses them: `got`; else the same as `want`). One entry a
// frame the CPU is up, "frame:keys:fight" -- the twelve keys, then X as a moveset move (inp.mv) and C as the side special (inp.side), which
// are which button-and-direction it is; then whether the hands were a fight's that frame (1), free (0), or not used at all (-). Installs
// the hooks; returns nothing.
export const RECORD_SRC = `
  window.__mk = ${MK};
  window.__sig = function(k, fight){ return hazardT + ':' + ${KEYS}.map(function(n){ return k && k[n] ? '1' : '0'; }).join('')
    + (k && k.attack && k.mv ? '1' : '0') + (k && k.special && k.side ? '1' : '0') + ':' + (fight === undefined ? '-' : fight ? '1' : '0'); };
  window.__want = {}; window.__got = {};
  window.__fs0 = fsBotInput;
  fsBotInput = function(f, inp){ var r = window.__fs0.apply(this, arguments); var s = window.__sig(inp);
    (window.__want[f.idx] = window.__want[f.idx] || []).push(s); (window.__got[f.idx] = window.__got[f.idx] || []).push(s); return r; };
  if(typeof cpuHumanKeys === 'function'){ window.__hk0 = cpuHumanKeys;   // (called just after fsBotInput, for the same CPU: what it pressed this frame)
    cpuHumanKeys = function(f, inp, gap, fight){ var r = window.__hk0.apply(this, arguments); var g = window.__got[f.idx]; if(g && g.length) g[g.length - 1] = window.__sig(r, !!fight); return r; }; }
`;
export const UNRECORD_SRC = `fsBotInput = window.__fs0; if(window.__hk0) cpuHumanKeys = window.__hk0; window.__hk0 = null;`;

// A CPU (`cpu`, at `lvl`) stands `gap` px from a foe that does nothing (controller 'still', never hurt, so the CPU's own swings change
// nothing about it). After 60 frames the foe does `ev` -- 'none', 'attack' (a smash starts to charge), 'jump', or 'shot' (a slow shot of
// its comes at the CPU from 130 px off, on `side` (+1 right, -1 left: pass the way the CPU goes after the event in the 'none' run, `xs`, so
// the shot is in front of it whichever side of the foe it has walked to and whichever way it walks next)) -- and the CPU's keys are read for
// `frames` more. Returns the keys, and `xs`: the CPU's x each frame after the event. The CPU's thinking (aiThink, and the difficulty tail in it) rolls
// its own dice, so the world's dice (dust, sparks) cannot make two runs differ: up to the frame the CPU sees what the foe did, a run
// with an event and one without are the same run.
export const REACT_SRC = (cpu, foe, lvl, ev, gap = 120, frames = 70, side = 1) => `(function(){
  ${RECORD_SRC}
  Math.random = window.__mk(91);
  __setupCustomMatch(${JSON.stringify([cpu, foe])}, 3, ${lvl}, 0);
  var C = fighters[0], T = fighters[1], gy = groundY();
  C._lvl = ${lvl}; T.controller = 'still'; T.invuln = 1e9;
  C.x = WW*0.45; T.x = C.x + ${gap}; C.y = gy - C.r; T.y = gy - T.r; C.vx = 0; C.vy = 0; T.vx = 0; T.vy = 0; T.face = -1;
  var aiR = window.__mk(17), a0 = aiThink;
  aiThink = function(f){ var keep = Math.random; Math.random = aiR; try { return a0.apply(this, arguments); } finally { Math.random = keep; } };
  try {
    for (var i = 0; i < 60; i++) step();
    var n0 = (window.__got[C.idx] || []).length;
    var ev = ${JSON.stringify(ev)};
    if (ev === 'attack'){ T._smQ = { angle:0, wait:0, held:false }; T.smashHold = 0; }
    if (ev === 'jump'){ T.vy = JUMP * (T.st || STAT_ONE).jump; T.onground = false; T.jumps = Math.max(0, (T.jumps || 1) - 1); }
    if (ev === 'shot'){ var side = ${side < 0 ? -1 : 1}; spawnProj(T, { x: C.x + side*130, y: C.y - 4, vx: -2*side, vy: 0, grav: false, dmg: 3, kb: 2, r: 7, color: '#ffffff', life: 400 }); }   // (130 px off, coming in at 2 px a frame)
    var xs = [];
    for (var k = 0; k < ${frames}; k++){ step(); xs.push(Math.round(C.x)); }
    return { got: (window.__got[C.idx] || []).slice(n0), want: (window.__want[C.idx] || []).slice(n0), dist: Math.round(Math.abs(T.x - C.x)), xs: xs };
  } finally { aiThink = a0; ${UNRECORD_SRC} running = false; }
})()`;
// The first frame two key streams differ (-1: they never do).
export function firstDiff(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
}

// A seeded CPU-vs-CPU 1v1 (the balance tournament's flat stage, both at `lvl`) for `frames` frames, every key recorded; and every
// Math.random call counted, the world's included.
export const MATCH_SRC = (names, lvl, seed, frames) => `(function(){
  ${RECORD_SRC}
  var base = window.__mk(${seed}), calls = 0;
  Math.random = function(){ calls++; return base(); };
  __setupCustomMatch(${JSON.stringify(names)}, 3, ${lvl}, 0);
  try {
    for (var i = 0; i < ${frames} && running; i++) step();
    return { got: window.__got, want: window.__want, calls: calls, frames: i,
      final: fighters.map(function(f){ return f.name + ':' + f.stocks + ':' + Math.round(f.pct); }).join(',') };
  } finally { ${UNRECORD_SRC} running = false; }
})()`;
// Is the change from key string a to b only a letting go of buttons (no key pressed, the arrows as they were)? The hands count that as part
// of the tap that pressed them (CPU_HUMAN), not as an input of its own.
const DIRS = [0, 1, 3, 4];
export function onlyLetGo(a, b) {
  for (let i = 0; i < b.length; i++) if (b[i] === '1' && a[i] !== '1') return false;
  return DIRS.every((i) => a[i] === b[i]);
}
// Most changes of a key stream inside any 60 frames, and how many it made in all. fightOnly: count only the changes made on frames the
// hands were a fight's (a foe within reach); `fight` is how many frames were. inputs: count the INPUTS -- a change that presses a key, or turns,
// stops or starts the arrows -- and not a change that only lets go of buttons.
export function changes(stream, fightOnly = false, inputs = false) {
  const at = [], part = (e) => e.split(':');
  let fight = 0;
  for (let i = 0; i < stream.length; i++) {
    const [t, k, fl] = part(stream[i]);
    if (fl === '1') fight++;
    const k0 = i > 0 ? part(stream[i - 1])[1] : null;
    if (i > 0 && k !== k0 && (!fightOnly || fl === '1') && !(inputs && onlyLetGo(k0, k))) at.push(+t);
  }
  let most = 0;
  for (let a = 0, b = 0; b < at.length; b++) { while (at[b] - at[a] >= 60) a++; most = Math.max(most, b - a + 1); }
  return { most, total: at.length, fight, frames: stream.length };
}
// A small stable hash of a key stream.
export function hashStream(stream) {
  let h = 0;
  for (const s of stream) for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}
