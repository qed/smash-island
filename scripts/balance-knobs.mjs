// ============================================================================
//  balance-knobs.mjs — every stat a balance sweep can move, including the hidden ones
// ============================================================================
// auto-balance.mjs can only reach two things: per-fighter WEIGHT and the RANGE_PROFILE row
// (reach/dmg/kb). Everything else that decides a fight — how long a move is on cooldown, how many
// ticks a burn runs for, how long a freeze locks you — is a bare literal somewhere in the monolith,
// so nothing could measure it and nothing could sweep it.
//
// A knob here is a family of literals plus a way to rewrite them. Sweeping happens by TEXT PATCH on
// the source before jsdom parses it (see loadMonolith's `transform`), which is what makes the
// scattered ones addressable without first hoisting hundreds of numbers into a config table — a
// large, risky, behaviour-preserving refactor that would have to land before any measurement could.
// Nothing here writes to disk.
//
// Each knob: { doc, find: RegExp(g), read(match)->number, write(match, v)->string, clamp:[lo,hi] }
// A scale of 1.0 must reproduce the source byte-for-byte — verify() below asserts exactly that.

const int = (s) => parseInt(s, 10);

export const KNOBS = {
  // ---- COOLDOWNS ---------------------------------------------------------------------------
  'cd.attack': {
    doc: 'every attack cooldown: jab 22, ground move 26, smash 30, finisher 40',
    find: /f\.atkCd\s*=\s*(\d+)/g,
    read: (m) => int(m[1]), write: (m, v) => m[0].replace(/\d+/, v), clamp: [6, 120],
  },
  'cd.special': {
    doc: 'every special cooldown (f.spCd = N), ~50 sites from 26 to 150',
    find: /f\.spCd\s*=\s*(\d+)/g,
    read: (m) => int(m[1]), write: (m, v) => m[0].replace(/\d+/, v), clamp: [10, 300],
  },
  'cd.drop': {
    doc: 'the shared downpour throttle (dropCd), so drop moves cannot rapid-fire',
    find: /dropCd\s*=\s*(\d+)/g,
    read: (m) => int(m[1]), write: (m, v) => m[0].replace(/\d+/, v), clamp: [20, 200],
  },

  // ---- EFFECT TICKS ------------------------------------------------------------------------
  'tick.burn': {
    doc: 'burn/poison duration in frames — every Math.max(x.burn, N) site (80..140)',
    find: /\.burn\s*,\s*(\d+)\s*\)/g,
    read: (m) => int(m[1]), write: (m, v) => m[0].replace(/\d+/, v), clamp: [20, 400],
  },
  'tick.freeze': {
    doc: 'the freeze ceiling and the re-freeze immunity that stops chain-locking',
    find: /(?:const FREEZE_MAX\s*=\s*|const REFREEZE_GAP\s*=\s*)(\d+)/g,
    read: (m) => int(m[1]), write: (m, v) => m[0].replace(/\d+/, v), clamp: [10, 200],
  },
  'tick.scramble': {
    doc: 'control-reversal ceiling and its re-scramble immunity',
    find: /(?:const CTRLREV_MAX\s*=\s*|const RESCRAMBLE_GAP\s*=\s*)(\d+)/g,
    read: (m) => int(m[1]), write: (m, v) => m[0].replace(/\d+/, v), clamp: [10, 200],
  },
  'tick.root': {
    doc: 'root/staple duration — Lollipop\'s sucker and Stapy\'s staple',
    find: /rooted\s*\|\|\s*0\s*,\s*(\d+)\s*\)/g,
    read: (m) => int(m[1]), write: (m, v) => m[0].replace(/(\d+)(?!.*\d)/, v), clamp: [0, 400],
  },
  'tick.armor': {
    doc: 'super-armour frames granted by the moves that grant it (16..50)',
    find: /armor\s*=\s*(\d+)/g,
    read: (m) => int(m[1]), write: (m, v) => m[0].replace(/\d+/, v), clamp: [0, 150],
  },
  'tick.buff': {
    doc: 'item buff durations: attack-up, haste, star invincibility, yoyleberry',
    // The tournament harness sets itemRate=0 on purpose, to keep pickup RNG out of the balance
    // signal. That makes this knob UNOBSERVABLE there: it comes back a clean 0.0000, which reads
    // exactly like "buff length does not affect balance" and means nothing of the kind. Declared so
    // the sweep can say so instead of printing a number nobody should believe.
    needsItems: true,
    find: /(?:_empowerT|_hasteT|_yoyleT|_starT)\s*=\s*(\d+)/g,
    read: (m) => int(m[1]), write: (m, v) => m[0].replace(/\d+/, v), clamp: [60, 1200],
  },
  'tick.weaken': {
    doc: 'Golf Ball\'s single-target debuff duration',
    find: /weakened\s*=\s*(\d+)/g,
    read: (m) => int(m[1]), write: (m, v) => m[0].replace(/\d+/, v), clamp: [30, 600],
  },

  // ---- THE HIDDEN STAT ---------------------------------------------------------------------
  'weight': {
    doc: 'per-fighter weight in ROSTER — feeds koCap = 150 + w, i.e. how much damage you survive',
    find: /(\{name:"[^"]+",\s*w:)(\d+)/g,
    read: (m) => int(m[2]), write: (m, v) => m[1] + v, clamp: [40, 145],
  },

  // ---- OFFENCE ------------------------------------------------------------------------------
  // These reach further than auto-balance's RANGE_PROFILE rows: `dmg:` and `kb:` are also written
  // inline on every projectile the kits spawn, so scaling here moves the roster's whole offence,
  // which is what you want from a global sweep. The lower clamp is 0, not 1: `kb:0` is a real,
  // deliberate value (pure-damage shots that add no knockback) and clamping it to 1 would make a
  // 1.0 scale silently change the build.
  'dmg.all': {
    doc: 'every damage literal: RANGE_PROFILE rows and the inline projectiles kits spawn',
    find: /(dmg:)(\d+)/g,
    read: (m) => int(m[2]), write: (m, v) => m[1] + v, clamp: [0, 40],
  },
  'kb.all': {
    doc: 'every knockback literal, same reach',
    find: /(kb:)(\d+)/g,
    read: (m) => int(m[2]), write: (m, v) => m[1] + v, clamp: [0, 30],
  },
};

// Build a source transform that scales one knob by `factor` (1.0 = identity).
export function patch(knobName, factor) {
  const k = KNOBS[knobName];
  if (!k) throw new Error(`unknown knob: ${knobName}`);
  return (src) => src.replace(new RegExp(k.find.source, k.find.flags), (...args) => {
    const m = args.slice(0, -2);
    m[0] = args[0];
    const cur = k.read(m);
    const next = Math.max(k.clamp[0], Math.min(k.clamp[1], Math.round(cur * factor)));
    return k.write(m, next);
  });
}

// How many literals a knob actually reaches, and their range — so a sweep can report what it moved.
export function census(src, knobName) {
  const k = KNOBS[knobName];
  const vals = [];
  for (const m of src.matchAll(new RegExp(k.find.source, k.find.flags))) vals.push(k.read(m));
  return { count: vals.length, min: Math.min(...vals), max: Math.max(...vals) };
}

// A scale of 1.0 must be a no-op. If it is not, the knob's write() is lossy and every measurement
// taken with it would be comparing against a build that already differs from the baseline.
export function verify(src) {
  const bad = [];
  for (const name of Object.keys(KNOBS)) {
    if (patch(name, 1)(src) !== src) bad.push(name);
  }
  return bad;
}
