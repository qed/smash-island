// Records what today's AI does, on the CURRENT build, before any playbook is read.
//   node scripts/bot-golden.mjs            -> writes test/golden/bot-legacy.json
// test/bot-playbooks.test.js replays the same matches and fails if Easy (or a fighter with no playbook entry, at any
// level) plays a different match. Re-record ONLY when the game itself changes on purpose (physics, a kit, a stage), never
// to make an AI change pass: the point of the file is that the AI change did not move it.
import { writeFileSync } from 'node:fs';
import { BOT_GOLDEN_MATCHES, bootGoldenWindow, playBotMatch } from '../test/helpers/bot-golden.js';

const w = bootGoldenWindow();
const out = [];
for (const m of BOT_GOLDEN_MATCHES) {
  const t0 = Date.now();
  const r = playBotMatch(w, m);
  await new Promise((res) => setTimeout(res, 0));   // let recordMatch's storage writes settle between matches
  out.push({ names: m.names, seed: m.seed, level: m.level, ...r });
  console.log(`${m.names.join(' v ')} (level ${m.level}, seed ${m.seed}): ${r.frames} frames, ${r.final}  [${Date.now() - t0} ms]`);
}
writeFileSync('test/golden/bot-legacy.json', JSON.stringify(out, null, 1) + '\n');
console.log(`wrote test/golden/bot-legacy.json (${out.length} matches)`);
process.exit(0);
