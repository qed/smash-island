// PERSONA LIBRARY for scripts/playtest.mjs (PLAYTEST v2, 2026-11-11): 80 parameterized people.
//
// Each person = an archetype template (age band, skill, goal, habits, patience) + a seeded draw of motor numbers from the archetype's range.
// The numbers are USED by the playtester (reaction delay, key timing jitter, slipped presses, short-hop and double-tap success, aim error,
// frame rate of the input, click and reading time in the menus); they are not labels. Sources and which numbers are estimates: README-playtest.md.
// Deterministic: buildPersonas() always returns the same 80 people.
import { mulberry32 } from './prng.js';

const KEYMAPS = {
  arrows: null,   // the game's defaults
  wasd: { left: 'KeyA', right: 'KeyD', jump: 'KeyW', down: 'KeyS', attack: 'KeyJ', special: 'KeyK', smash: 'KeyL' },
  // a left-handed remapper: moves with the right hand (IJKL), attacks with the left (A S D)
  lefty: { left: 'KeyJ', right: 'KeyL', jump: 'KeyI', down: 'KeyK', attack: 'KeyA', special: 'KeyS', smash: 'KeyD' },
};

// skill -> what the fight() code does (see Player in playtest.mjs); each person varies +-20% around it
const SKILL = {
  'first-time':  { aggro: 0.55, aim: 0.30, recover: 0.35, walkoff: 0.20, smash: 0.05, special: 0.10, grab: 0.02, shortHop: 0.0,  fastFall: 0.0, drop: 0.15, retreat: 0.0,  space: false },
  casual:        { aggro: 0.60, aim: 0.18, recover: 0.60, walkoff: 0.08, smash: 0.12, special: 0.20, grab: 0.06, shortHop: 0.15, fastFall: 0.10, drop: 0.40, retreat: 0.10, space: false },
  veteran:       { aggro: 0.75, aim: 0.08, recover: 0.90, walkoff: 0.01, smash: 0.22, special: 0.28, grab: 0.14, shortHop: 0.60, fastFall: 0.60, drop: 0.75, retreat: 0.30, space: true },
  competitive:   { aggro: 0.80, aim: 0.05, recover: 0.97, walkoff: 0.00, smash: 0.25, special: 0.30, grab: 0.18, shortHop: 0.70, fastFall: 0.70, drop: 0.80, retreat: 0.35, space: true },
};

// motor ranges per age band x skill: [lo, hi]. rtMs = simple/choice reaction to something new on screen; rtSd; jitter = key timing SD in frames (16.7 ms);
// dropRate = share of presses that do not register as intended (slips); doubleTap/shortHop = success rate of those timed inputs; fps = the machine's frame rate;
// clickSecs = seconds per menu target (find it, aim, click); msPerWord = reading speed; readFrac = share of a screen's words actually read.
const MOTOR = {
  'kid|first-time':    { rtMs: [330, 440], rtSd: [60, 90], jitter: [3.0, 4.5], dropRate: [0.08, 0.16], doubleTap: [0.35, 0.60], shortHop: [0.2, 0.4], clickSecs: [1.4, 2.6], msPerWord: [420, 620] },
  'kid|casual':        { rtMs: [290, 380], rtSd: [50, 75], jitter: [2.2, 3.5], dropRate: [0.05, 0.10], doubleTap: [0.50, 0.75], shortHop: [0.3, 0.55], clickSecs: [1.0, 1.8], msPerWord: [380, 520] },
  'kid|veteran':       { rtMs: [250, 320], rtSd: [40, 60], jitter: [1.6, 2.5], dropRate: [0.03, 0.06], doubleTap: [0.65, 0.85], shortHop: [0.5, 0.75], clickSecs: [0.8, 1.4], msPerWord: [340, 480] },
  'teen|first-time':   { rtMs: [280, 360], rtSd: [50, 70], jitter: [2.5, 3.8], dropRate: [0.06, 0.12], doubleTap: [0.45, 0.70], shortHop: [0.25, 0.45], clickSecs: [0.9, 1.6], msPerWord: [260, 340] },
  'teen|casual':       { rtMs: [240, 310], rtSd: [40, 60], jitter: [1.8, 2.8], dropRate: [0.04, 0.08], doubleTap: [0.60, 0.80], shortHop: [0.4, 0.65], clickSecs: [0.7, 1.2], msPerWord: [230, 300] },
  'teen|veteran':      { rtMs: [200, 260], rtSd: [28, 45], jitter: [1.0, 1.8], dropRate: [0.01, 0.04], doubleTap: [0.80, 0.95], shortHop: [0.70, 0.90], clickSecs: [0.6, 1.0], msPerWord: [210, 280] },
  'teen|competitive':  { rtMs: [175, 225], rtSd: [20, 35], jitter: [0.6, 1.2], dropRate: [0.005, 0.02], doubleTap: [0.88, 0.98], shortHop: [0.82, 0.96], clickSecs: [0.5, 0.9], msPerWord: [200, 260] },
  'adult|first-time':  { rtMs: [300, 400], rtSd: [55, 80], jitter: [2.5, 4.0], dropRate: [0.07, 0.14], doubleTap: [0.40, 0.65], shortHop: [0.2, 0.4], clickSecs: [1.0, 2.0], msPerWord: [240, 330] },
  'adult|casual':      { rtMs: [250, 330], rtSd: [45, 65], jitter: [1.8, 3.0], dropRate: [0.04, 0.09], doubleTap: [0.55, 0.80], shortHop: [0.35, 0.60], clickSecs: [0.8, 1.4], msPerWord: [230, 300] },
  'adult|veteran':     { rtMs: [210, 275], rtSd: [30, 48], jitter: [1.1, 2.0], dropRate: [0.015, 0.05], doubleTap: [0.75, 0.92], shortHop: [0.65, 0.88], clickSecs: [0.6, 1.1], msPerWord: [220, 290] },
  'adult|competitive': { rtMs: [180, 235], rtSd: [22, 38], jitter: [0.7, 1.3], dropRate: [0.005, 0.025], doubleTap: [0.85, 0.97], shortHop: [0.78, 0.95], clickSecs: [0.5, 0.9], msPerWord: [210, 270] },
  'older|first-time':  { rtMs: [360, 480], rtSd: [70, 100], jitter: [3.0, 5.0], dropRate: [0.08, 0.16], doubleTap: [0.30, 0.55], shortHop: [0.15, 0.35], clickSecs: [1.6, 3.0], msPerWord: [280, 400] },
};

// archetypes: [count, tag, template]
const A = (count, tag, t) => ({ count, tag, ...t });
const ARCHETYPES = [
  A(5, 'kid-bfdi-fan', { age: 'kid', ageRange: [8, 12], skill: 'first-time', goal: 'try every fighter', habits: ['reads nothing, clicks the fighter they know from BFDI', 'mashes attack when excited'], mash: [0.06, 0.10], reads: 0.10, patience: { menuSecs: [60, 120], confusionSecs: [20, 40], rageLosses: [2, 4] }, wander: 0.0, keys: 'arrows', fps: [60, 60] }),
  A(4, 'kid-masher', { age: 'kid', ageRange: [8, 12], skill: 'first-time', goal: 'win by button mashing', habits: ['mashes every button', 'button-checker: presses every key to see what it does'], mash: [0.10, 0.16], reads: 0.05, patience: { menuSecs: [40, 90], confusionSecs: [15, 30], rageLosses: [2, 3] }, wander: 0.25, keys: 'arrows', fps: [60, 60] }),
  A(3, 'kid-sibling-rival', { age: 'kid', ageRange: [10, 12], skill: 'casual', goal: 'beat Boss Rush', habits: ['wants to beat the bosses to brag', 'retries immediately after a loss'], mash: [0.03, 0.06], reads: 0.15, patience: { menuSecs: [60, 120], confusionSecs: [25, 45], rageLosses: [4, 7] }, wander: 0.0, keys: 'arrows', fps: [60, 60] }),
  A(5, 'teen-friends-ctf', { age: 'teen', ageRange: [13, 17], skill: 'casual', goal: 'play Capture the Flag with friends online', habits: ['skims text', 'plans with teammates in the planning menu'], mash: [0.01, 0.03], reads: 0.25, patience: { menuSecs: [60, 120], confusionSecs: [20, 40], rageLosses: [4, 6] }, wander: 0.0, keys: 'arrows', fps: [60, 60] }),
  A(3, 'teen-speedrunner', { age: 'teen', ageRange: [14, 18], skill: 'veteran', goal: 'speedrun: fastest route through menus and modes', habits: ['skips all text', 'mashes Enter and Esc through screens'], mash: [0.0, 0.02], reads: 0.02, patience: { menuSecs: [20, 40], confusionSecs: [8, 15], rageLosses: [5, 8] }, wander: 0.0, keys: 'arrows', fps: [60, 60] }),
  A(4, 'teen-platform-veteran', { age: 'teen', ageRange: [14, 18], skill: 'veteran', goal: 'try every fighter and learn the movesets', habits: ['reads move cards', 'uses short hops and fast falls'], mash: [0.0, 0.01], reads: 0.45, patience: { menuSecs: [60, 120], confusionSecs: [20, 35], rageLosses: [6, 10] }, wander: 0.0, keys: 'arrows', fps: [60, 60] }),
  A(4, 'teen-collector', { age: 'teen', ageRange: [13, 17], skill: 'casual', goal: 'collect tokens and finish quests', habits: ['opens Locker, Quests, Store, Vault first', 'reads reward text'], mash: [0.02, 0.04], reads: 0.40, patience: { menuSecs: [90, 180], confusionSecs: [25, 45], rageLosses: [4, 6] }, wander: 0.10, keys: 'arrows', fps: [60, 60] }),
  A(4, 'adult-parent-first-time', { age: 'adult', ageRange: [32, 45], skill: 'first-time', goal: 'play a few rounds with their kid', habits: ['reads the tutorial card', 'asks "what do I press"'], mash: [0.03, 0.06], reads: 0.55, patience: { menuSecs: [90, 180], confusionSecs: [30, 60], rageLosses: [3, 5] }, wander: 0.05, keys: 'arrows', fps: [60, 60] }),
  A(4, 'adult-casual-low-patience', { age: 'adult', ageRange: [25, 40], skill: 'casual', goal: 'a quick match after work', habits: ['skims', 'leaves a menu after a few seconds of confusion'], mash: [0.01, 0.03], reads: 0.15, patience: { menuSecs: [25, 50], confusionSecs: [8, 15], rageLosses: [2, 3] }, wander: 0.0, keys: 'arrows', fps: [60, 60] }),
  A(5, 'adult-smash-veteran', { age: 'adult', ageRange: [22, 35], skill: 'veteran', goal: 'FFA and 1v1 with a favourite fighter', habits: ['expects Smash conventions', 'complains about input feel'], mash: [0.0, 0.01], reads: 0.30, patience: { menuSecs: [45, 90], confusionSecs: [15, 25], rageLosses: [6, 9] }, wander: 0.0, keys: 'arrows', fps: [60, 60] }),
  A(4, 'adult-competitive', { age: 'adult', ageRange: [20, 30], skill: 'competitive', goal: 'teams and 1v1 at a high level, test frame data', habits: ['notices latency and dropped inputs', 'uses every tool'], mash: [0.0, 0.0], reads: 0.35, patience: { menuSecs: [45, 90], confusionSecs: [12, 22], rageLosses: [8, 12] }, wander: 0.0, keys: 'arrows', fps: [60, 60] }),
  A(4, 'adult-reader-explorer', { age: 'adult', ageRange: [28, 50], skill: 'casual', goal: 'explore every menu and read every card', habits: ['reads every card', 'presses Esc everywhere'], mash: [0.01, 0.03], reads: 0.85, patience: { menuSecs: [150, 300], confusionSecs: [40, 80], rageLosses: [4, 6] }, wander: 0.20, keys: 'arrows', fps: [60, 60] }),
  A(4, 'lefty-remapper', { age: 'teen', ageRange: [13, 40], skill: 'casual', goal: 'remap keys to IJKL / ASD for the left hand, then play', habits: ['goes to Settings > Keys before anything else'], mash: [0.01, 0.03], reads: 0.35, patience: { menuSecs: [90, 180], confusionSecs: [25, 45], rageLosses: [4, 6] }, wander: 0.0, keys: 'lefty', fps: [60, 60] }),
  A(4, 'wasd-habit', { age: 'teen', ageRange: [13, 30], skill: 'casual', goal: 'plays with WASD (remaps to it), after first trying it unbound', habits: ['presses WASD first and waits for the fighter to move', 'remaps if the game does not respond'], mash: [0.01, 0.03], reads: 0.25, patience: { menuSecs: [60, 120], confusionSecs: [15, 30], rageLosses: [4, 6] }, wander: 0.0, keys: 'wasd', wasdFirst: true, fps: [60, 60] }),
  A(5, 'old-laptop', { age: 'teen', ageRange: [13, 50], skill: 'casual', goal: 'FFA on an old laptop at 25-35 fps', habits: ['tolerates choppiness', 'reads the screen late'], mash: [0.02, 0.04], reads: 0.25, patience: { menuSecs: [60, 120], confusionSecs: [20, 40], rageLosses: [4, 6] }, wander: 0.0, keys: 'arrows', fps: [24, 36] }),
  A(4, 'worldcup-fan', { age: 'adult', ageRange: [18, 45], skill: 'casual', goal: 'run a World Cup and watch it play out', habits: ['sets up a cup then watches fixtures', 'reads the hub'], mash: [0.01, 0.03], reads: 0.40, patience: { menuSecs: [120, 240], confusionSecs: [30, 60], rageLosses: [5, 8] }, wander: 0.05, keys: 'arrows', fps: [60, 60] }),
  A(4, 'boss-rush-grinder', { age: 'teen', ageRange: [14, 30], skill: 'veteran', goal: 'clear Boss Rush', habits: ['retries after a loss', 'learns attack patterns'], mash: [0.0, 0.02], reads: 0.20, patience: { menuSecs: [45, 90], confusionSecs: [15, 25], rageLosses: [8, 14] }, wander: 0.0, keys: 'arrows', fps: [60, 60] }),
  A(4, 'ctf-planner', { age: 'adult', ageRange: [18, 35], skill: 'veteran', goal: 'Capture the Flag: hide the flag, build, plan', habits: ['uses the planning menu', 'does the practice first'], mash: [0.0, 0.02], reads: 0.50, patience: { menuSecs: [90, 180], confusionSecs: [25, 45], rageLosses: [6, 9] }, wander: 0.0, keys: 'arrows', fps: [60, 60] }),
  A(3, 'menu-skipper', { age: 'teen', ageRange: [13, 25], skill: 'casual', goal: 'start a match as fast as possible', habits: ['clicks the first big button', 'never reads'], mash: [0.02, 0.05], reads: 0.0, patience: { menuSecs: [15, 30], confusionSecs: [6, 12], rageLosses: [2, 4] }, wander: 0.0, keys: 'arrows', fps: [60, 60] }),
  A(3, 'older-slow-reaction', { age: 'adult', ageRange: [60, 72], skill: 'first-time', motorBand: 'older|first-time', goal: 'play with a grandchild', habits: ['reads everything slowly', 'needs time to find keys'], mash: [0.02, 0.05], reads: 0.80, patience: { menuSecs: [150, 300], confusionSecs: [40, 80], rageLosses: [3, 5] }, wander: 0.0, keys: 'arrows', fps: [60, 60] }),
];

const lerp = (r, rng) => r[0] + (r[1] - r[0]) * rng();
const jit = (v, rng, k = 0.2) => v * (1 - k + 2 * k * rng());

// the scene plan: goal -> the scenes this person plays in one pass (the driver repeats a pass twice with other seeds)
const PLANS = {
  'kid-bfdi-fan': ['ffa', 'boss', 'training', '1v1'],
  'kid-masher': ['ffa', 'menus', 'tutorial', 'running'],
  'kid-sibling-rival': ['boss', 'boss', 'ffa'],
  'teen-friends-ctf': ['ctf-practice', 'ctf', 'ctf-spectate', 'teams'],
  'teen-speedrunner': ['journey', 'running', '1v1', 'flow'],
  'teen-platform-veteran': ['ffa', '1v1', 'training', 'teams'],
  'teen-collector': ['menus', 'ffa', 'worldcup'],
  'adult-parent-first-time': ['tutorial', 'training', 'ffa', 'journey'],
  'adult-casual-low-patience': ['journey', 'ffa', 'flow'],
  'adult-smash-veteran': ['ffa', '1v1', 'teams', 'flow'],
  'adult-competitive': ['1v1', 'teams', 'training', 'flow'],
  'adult-reader-explorer': ['menus', 'tutorial', 'journey', 'flagcup'],
  'lefty-remapper': ['ffa', 'training', '1v1'],
  'wasd-habit': ['ffa', 'boss', 'teams'],
  'old-laptop': ['ffa', 'teams', 'boss'],
  'worldcup-fan': ['worldcup', 'flagcup', 'journey'],
  'boss-rush-grinder': ['boss', 'boss', 'boss'],
  'ctf-planner': ['ctf-practice', 'ctf', 'flagcup', 'ctf'],
  'menu-skipper': ['journey', 'ffa', 'menus'],
  'older-slow-reaction': ['tutorial', 'training', 'ffa'],
};

export function buildPersonas() {
  const out = [];
  let n = 0;
  for (const a of ARCHETYPES) {
    for (let i = 0; i < a.count; i++) {
      n++;
      const tag = `${a.tag}-${String(i + 1).padStart(2, '0')}`;
      const rng = mulberry32((0x5eed0000 + n * 7919) >>> 0);
      const age = Math.round(lerp(a.ageRange, rng));
      // the age band for the motor table: 'kid' | 'teen' | 'adult' | 'older'
      const band = a.motorBand ? a.motorBand.split('|')[0] : (age >= 60 ? 'older' : age < 13 ? 'kid' : age < 18 ? 'teen' : 'adult');
      // a skill label can be one notch off the archetype for variety (a casual who is a bit better / worse)
      const skill = a.skill;
      const mkey = a.motorBand || `${band === 'older' ? 'adult' : band}|${skill === 'first-time' && band !== 'kid' && band !== 'teen' && band !== 'older' ? 'first-time' : skill}`;
      const M = MOTOR[mkey] || MOTOR[`${band === 'older' ? 'adult' : band}|casual`] || MOTOR['adult|casual'];
      const motor = {
        rtMs: Math.round(lerp(M.rtMs, rng)), rtSd: Math.round(lerp(M.rtSd, rng)), jitterFrames: +lerp(M.jitter, rng).toFixed(2),
        dropRate: +lerp(M.dropRate, rng).toFixed(3), doubleTap: +lerp(M.doubleTap, rng).toFixed(2), shortHop: +lerp(M.shortHop, rng).toFixed(2),
        clickSecs: +lerp(M.clickSecs, rng).toFixed(2), msPerWord: Math.round(lerp(M.msPerWord, rng)), readFrac: +jit(a.reads, rng, 0.3).toFixed(2),
        fps: Math.round(lerp(a.fps, rng)),
        // pressing the next move slightly before the last one's end-lag is over (a person queues); share of attack presses
        earlyPress: +(skill === 'first-time' ? 0.25 : skill === 'casual' ? 0.30 : 0.45).toFixed(2),
      };
      const sk = SKILL[skill];
      const brain = {};
      for (const k of Object.keys(sk)) brain[k] = typeof sk[k] === 'boolean' ? sk[k] : +Math.max(0, Math.min(1, jit(sk[k], rng))).toFixed(3);
      brain.mash = +lerp(a.mash, rng).toFixed(3);
      brain.wander = lerp([0, 1], rng) < a.wander * 2 ? true : false;
      const rtF = motor.rtMs / (1000 / 60);
      brain.react = [Math.max(5, Math.round(rtF * 0.8)), Math.max(7, Math.round(rtF * 1.25))];
      out.push({
        tag, archetype: a.tag, ageYears: age, ageBand: band, skill, goal: a.goal, habits: a.habits.slice(), keys: a.keys, wasdFirst: !!a.wasdFirst,
        patience: { menuSecs: Math.round(lerp(a.patience.menuSecs, rng)), confusionSecs: Math.round(lerp(a.patience.confusionSecs, rng)), rageLosses: Math.round(lerp(a.patience.rageLosses, rng)) },
        motor, brain, plan: PLANS[a.tag].slice(), keymap: KEYMAPS[a.keys],
        profile: `${tag}: ${band === 'kid' ? 'kid' : band === 'teen' ? 'teen' : band === 'older' ? 'older adult' : 'adult'} (${age}), ${skill}; goal: ${a.goal}; ${a.habits.join('; ')}.`,
      });
    }
  }
  return out;
}

export const PERSONA_LIST = buildPersonas();
export const PERSONA_BY_TAG = Object.fromEntries(PERSONA_LIST.map((p) => [p.tag, p]));
