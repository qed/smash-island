import { loadMonolith } from './load-monolith.js';
import { mulberry32 } from './prng.js';
import { SETUP_SRC } from './match-setup.js';

// One measurement procedure, shared by the fixture GENERATOR (scripts/bot-golden.mjs) and the test that checks the
// live build against it (test/bot-playbooks.test.js). If they measured differently the fixture would prove nothing.
//
// It records the matches the AI plays BEFORE the per-fighter playbooks existed (test/golden/bot-legacy.json), so a
// later build can show that Easy is today's AI bit for bit, and that Normal and Hard are too wherever a fighter has no
// playbook entry. A match is a seeded lineup played to a knockout on the balance tournament's own flat stage, driven
// frame by frame through the real step(); the fixture keeps a rolling hash of every fighter's position, velocity,
// damage, stocks and cooldowns (a checkpoint every GOLDEN_EVERY frames, so a mismatch says where it left the old
// match), and the standings at the end. Every dice roll the AI makes moves one of those numbers sooner or later, so a
// single extra Math.random() in an Easy fighter's think fails it.

export const GOLDEN_EVERY = 120;
export const GOLDEN_FRAMES = 3000;   // a 50 s cap: a match that times out is still a fixed number of frames of the same thing

// level 0/1/2 = Easy/Normal/Hard (the CPU Skill setting). Classes: rush, zone, trap, grapple, heavy, evade, brawl.
export const BOT_GOLDEN_MATCHES = [
  { names: ['Firey', 'Pen'],                    seed: 301, level: 0 },
  { names: ['Rocky', 'Needle'],                 seed: 302, level: 0 },
  { names: ['Golf Ball', 'Leafy'],              seed: 303, level: 0 },
  { names: ['Puffball', 'Gelatin'],             seed: 304, level: 0 },
  { names: ['Tennis Ball', 'Pin'],              seed: 305, level: 0 },
  { names: ['Bomby', 'Snowball', 'Coiny'],      seed: 306, level: 0 },
  { names: ['Firey', 'Pen'],                    seed: 311, level: 1 },
  { names: ['Golf Ball', 'Leafy'],              seed: 312, level: 1 },
  { names: ['Taco', 'Ice Cube', 'Needle'],      seed: 313, level: 1 },
  { names: ['Rocky', 'Needle'],                 seed: 321, level: 2 },
  { names: ['Puffball', 'Gelatin'],             seed: 322, level: 2 },
  { names: ['Cammy', 'Candle', 'Teddy Bear'],   seed: 323, level: 2 },
];

const SNAP = `fighters.map(function(f){ return [f.x, f.y, f.vx, f.vy, f.pct, f.stocks === Infinity ? 999 : f.stocks, f.atkCd, f.spCd, f.smCd, f.smashHold, f.face]
  .map(function(v){ return Math.round(v * 1000) / 1000; }).join(','); }).join('|')`;

function hashInto(h, s) {
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}

// Plays one golden match in `w` (a booted monolith window; any number of matches may share one, see below) and returns
// { frames, checks: [hex...], final }. `after` is source run in the game's realm once the lineup is set up, for a test
// that wants to change something about the fighters (install a playbook, force a level) before the first frame.
//
// Sharing a window is safe because the match depends on nothing but its seed and lineup: Math.random is re-seeded here
// and __setupCustomMatch rebuilds the whole world (verified by running A, B, C, then C, A, B in one window and fresh).
export function playBotMatch(w, m, after = '') {
  w.Math.random = mulberry32(m.seed);
  w.eval(SETUP_SRC);
  w.eval(`__setupCustomMatch(${JSON.stringify(m.names)}, ${m.stocks || 2}, ${m.level | 0}, 0)`);
  if (after) w.eval(after);
  let frames = 0, h = 0;
  const checks = [];
  while (w.eval('running') && frames < GOLDEN_FRAMES) {
    w.eval('step()');
    frames++;
    if (frames % GOLDEN_EVERY === 0) {
      h = hashInto(h, w.eval(SNAP));
      checks.push((h >>> 0).toString(16));
    }
  }
  h = hashInto(h, w.eval(SNAP));
  checks.push((h >>> 0).toString(16));
  const final = w.eval('fighters.map(function(f){ return f.name + ":" + (f.stocks === Infinity ? 999 : f.stocks) + ":" + Math.round(f.pct) + ":" + (f.dead ? "x" : "a"); }).join(",")');
  return { frames, checks, final };
}

export function bootGoldenWindow() {
  return loadMonolith(1).window;
}
