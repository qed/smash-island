#!/usr/bin/env node
// THE BIG RUN driver (PLAYTEST v2): 80 personas x N passes, sharded over parallel node processes.
//   node scripts/playtest-big.mjs --shards 8 --passes 3 --out playtest-out/big [--dry] [--only tag,tag] [--budget-min 150]
// Each (persona, pass) is ONE node process running playtest.mjs --plan <file>: that person's scenes in order, their patience carried from scene to scene.
// Processes run at BelowNormal priority. Partial aggregates are written every few minutes to --report-dir.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PERSONA_LIST } from './helpers/personas.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = process.argv.slice(2);
const O = { shards: 8, passes: 3, out: 'playtest-out/big', dry: false, only: null, budget: 150, report: null, seed: 20261111, bosses: 12 };
for (let i = 0; i < A.length; i++) { const a = A[i]; if (a === '--shards') O.shards = +A[++i]; else if (a === '--passes') O.passes = +A[++i]; else if (a === '--out') O.out = A[++i]; else if (a === '--dry') O.dry = true; else if (a === '--only') O.only = A[++i].split(','); else if (a === '--budget-min') O.budget = +A[++i]; else if (a === '--report-dir') O.report = A[++i]; else if (a === '--seed') O.seed = +A[++i]; }
const CTF_MAPS = ['castle', 'mines', 'factory', 'forest', 'sky', 'oak'];
const hash = (...p) => { let h = 2166136261 >>> 0; for (const x of p) { for (const c of String(x)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } h ^= 0x9e37; h = Math.imul(h, 2654435761) >>> 0; } return h % 1000000007; };

// ---- the plans
let bossCtr = 0, ctfCtr = 0;
const personas = PERSONA_LIST.filter((p) => !O.only || O.only.includes(p.tag));
const jobs = [];   // one per (persona, pass)
for (let pass = 0; pass < O.passes; pass++) {
  for (const p of personas) {
    const items = [];
    const plan = p.plan.slice();
    if (pass === 0 && p.wasdFirst) plan.unshift('wasdprobe');
    // alternate the order between passes so a late scene is not always the one that ran out of patience
    if (pass % 2 === 1 && !p.wasdFirst) plan.reverse();
    plan.forEach((sc, k) => {
      const args = { persona: p.tag };
      if (sc === 'boss') args.boss = bossCtr++ % O.bosses;
      if (sc === 'ctf' || sc === 'ctf-spectate') { args.map = CTF_MAPS[ctfCtr++ % CTF_MAPS.length]; args.n = 2 + (ctfCtr % 3); }
      items.push({ scene: sc, seed: hash(O.seed, p.tag, pass, sc, k), args, cpuMinutes: sc === 'menus' || sc === 'journey' ? 8 : 6 });
    });
    jobs.push({ tag: p.tag, pass, items });
  }
}
// ---- coverage table
const cov = {};
for (const j of jobs) for (const it of j.items) cov[it.scene] = (cov[it.scene] || 0) + 1;
const bossCov = {}; for (const j of jobs) for (const it of j.items) if (it.scene === 'boss') bossCov[it.args.boss] = (bossCov[it.args.boss] || 0) + 1;
console.log(`personas ${personas.length}, passes ${O.passes}, jobs ${jobs.length}, scenes ${jobs.reduce((a, j) => a + j.items.length, 0)}`);
console.log('scene coverage', JSON.stringify(cov)); console.log('boss coverage', JSON.stringify(bossCov));
if (O.dry) process.exit(0);

// ---- run
const outRoot = path.resolve(ROOT, O.out); mkdirSync(path.join(outRoot, 'plans'), { recursive: true });
const started = Date.now(); let done = 0, running = 0; const queue = jobs.slice();
// order: interleave so every shard sees a mix (a heavy persona does not all land on one shard)
const logf = (s) => { const l = `[${((Date.now() - started) / 60000).toFixed(1)} min] ${s}`; console.log(l); };
function runJob(j) {
  return new Promise((resolve) => {
    const id = `${j.tag}-p${j.pass}`, dir = path.join(outRoot, 'runs', id); mkdirSync(dir, { recursive: true });
    const planFile = path.join(outRoot, 'plans', id + '.json'); writeFileSync(planFile, JSON.stringify(j.items));
    const child = spawn(process.execPath, ['scripts/playtest.mjs', '--plan', planFile, '--out', dir, '--priority', 'below', '--seed', String(hash(O.seed, id) % 1000003), '--force'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let log = ''; child.stdout.on('data', (d) => { log += d; }); child.stderr.on('data', (d) => { log += d; });
    child.on('exit', (code) => { writeFileSync(path.join(dir, 'console.log'), log.slice(-20000)); done++; logf(`done ${id} exit ${code} (${done}/${jobs.length})`); resolve(); });
    j.child = child;
  });
}
let stopping = false;
process.on('SIGINT', () => { stopping = true; for (const j of jobs) if (j.child && j.child.exitCode == null) j.child.kill('SIGINT'); });
async function worker() { while (queue.length && !stopping && (Date.now() - started) / 60000 < O.budget) { const j = queue.shift(); running++; await runJob(j); running--; } }
const agg = () => new Promise((r) => { const c = spawn(process.execPath, ['scripts/playtest-aggregate.mjs', '--in', O.out, ...(O.report ? ['--report-dir', O.report] : []), '--partial'], { cwd: ROOT, stdio: 'inherit', windowsHide: true }); c.on('exit', r); });
const timer = setInterval(() => { agg(); }, 12 * 60000);
await Promise.all(Array.from({ length: O.shards }, () => worker()));
clearInterval(timer);
logf(`all workers finished: ${done}/${jobs.length} jobs; aggregating`);
await agg();
