// ROLLBACK STUDY, static scan. Parses the game's main <script>, builds a by-name call/reference graph of the top-level
// functions, and counts the non-deterministic things in the code the simulation (step) can reach vs. the drawing.
// usage (cwd = worktree root): node rbscan.mjs
import os from 'node:os'; try { os.setPriority(0, os.constants.priority.PRIORITY_LOW); } catch (e) {}
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const req = createRequire(new URL('../../package.json', import.meta.url));
const acorn = req('acorn');
const walk = { full(node, cb) { const st = [node]; while (st.length) { const n = st.pop(); if (!n || typeof n.type !== 'string') continue; cb(n);
  for (const k in n) { if (k === 'start' || k === 'end' || k === 'type') continue; const v = n[k]; if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === 'string') st.push(c); } else if (v && typeof v.type === 'string') st.push(v); } } } };
const html = readFileSync(process.env.RB_HTML || 'artifacts/V1/index.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const src = scripts.sort((a, b) => b.length - a.length)[0];
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true });
const NL = []; for (let i = 0; i < src.length; i++) if (src.charCodeAt(i) === 10) NL.push(i);
const lineOf = (pos) => { let lo = 0, hi = NL.length; while (lo < hi) { const m = (lo + hi) >> 1; if (NL[m] < pos) lo = m + 1; else hi = m; } return lo + 2091; };

// top-level units: function declarations, and top-level variables (their initialisers: arrow functions, object tables of functions)
const units = new Map();   // name -> { node, kind }
const topLets = [], topConsts = [], topVars = [];
for (const st of ast.body) {
  if (st.type === 'FunctionDeclaration') units.set(st.id.name, { node: st, kind: 'fn' });
  else if (st.type === 'VariableDeclaration') for (const d of st.declarations) {
    if (d.id.type !== 'Identifier') continue;
    (st.kind === 'let' ? topLets : st.kind === 'const' ? topConsts : topVars).push(d.id.name);
    if (d.init) units.set(d.id.name, { node: d.init, kind: st.kind });
  }
}
const names = new Set(units.keys());
const TRANS = new Set(['sin', 'cos', 'tan', 'atan2', 'atan', 'asin', 'acos', 'exp', 'log', 'log2', 'log10', 'pow', 'hypot', 'cbrt', 'sinh', 'cosh', 'tanh', 'expm1', 'log1p']);
const VIEWID = new Set(['camX', 'camY', 'camAng', 'CAM_ZOOM', 'W', 'H', 'innerWidth', 'innerHeight', 'devicePixelRatio', 'cv', 'ctx']);
const info = new Map();
for (const [name, u] of units) {
  const I = { refs: new Set(), you: 0, role: 0, net: 0, rnd: 0, perf: 0, date: 0, timer: 0, async: 0, forin: 0, keys: 0, trans: 0, view: 0, ls: 0, line: lineOf(u.node.start) };
  walk.full(u.node, (n) => {
    if (n.type === 'Identifier' && names.has(n.name) && n.name !== name) I.refs.add(n.name);
    if (n.type === 'Identifier' && VIEWID.has(n.name)) I.view++;
    if (n.type === 'MemberExpression' && !n.computed && n.object.type === 'Identifier') {
      const o = n.object.name, p = n.property.name;
      if (o === 'Math' && p === 'random') I.rnd++;
      if (p === 'role' && (o === 'NET' || o === 'N')) I.role++;
      if (o === 'Math' && TRANS.has(p)) I.trans++;
      if (o === 'performance' && p === 'now') I.perf++;
      if (o === 'Date' && p === 'now') I.date++;
      if (o === 'Object' && (p === 'keys' || p === 'values' || p === 'entries')) I.keys++;
      if (o === 'localStorage' || o === 'BStore' || o === 'sessionStorage') I.ls++;
    }
    if (n.type === 'NewExpression' && n.callee.type === 'Identifier' && n.callee.name === 'Date') I.date++;
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && ['setTimeout', 'setInterval', 'requestAnimationFrame', 'queueMicrotask'].includes(n.callee.name)) I.timer++;
    if (n.type === 'AwaitExpression' || (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'fetch')) I.async++;
    if (n.type === 'ForInStatement') I.forin++;
    if (n.type === 'MemberExpression' && !n.computed && n.property.name === 'you') I.you++;
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'inNetSession') I.net++;
  });
  info.set(name, I);
}
function reach(roots, stop = new Set()) {
  const seen = new Set(), st = [...roots];
  while (st.length) { const n = st.pop(); if (seen.has(n) || stop.has(n) || !info.has(n)) continue; seen.add(n); for (const r of info.get(n).refs) st.push(r); }
  return seen;
}
// the simulation's roots: step() (what the host and offline play run each frame) and startMatch/beginMatchNow (the match's setup)
const DRAWROOTS = ['drawView', 'draw', 'updateHUD', 'clientFrame'];
const SIM = reach(['step'], new Set(DRAWROOTS));
const SETUP = reach(['startMatch', 'beginMatchNow'], new Set(DRAWROOTS));
const DRAW = reach(DRAWROOTS, new Set(['step']));
const both = [...SIM].filter((n) => DRAW.has(n));
const tot = (set, k) => [...set].reduce((s, n) => s + info.get(n)[k], 0);
const all = new Set(info.keys());
const fnCount = (set) => [...set].filter((n) => units.get(n).kind === 'fn').length;
console.log('top-level: functions', [...units.values()].filter((u) => u.kind === 'fn').length, '| let', topLets.length, '| var', topVars.length, '| const', topConsts.length);
console.log('reachable by name from step():', SIM.size, 'units (', fnCount(SIM), 'functions ); from the match setup:', SETUP.size, '; from drawing:', DRAW.size, '; reached by both step and drawing:', both.length);
const K = ['you', 'role', 'net', 'rnd', 'trans', 'perf', 'date', 'timer', 'async', 'forin', 'keys', 'view', 'ls'];
const row = (label, set) => console.log(label.padEnd(26), K.map((k) => k + ' ' + tot(set, k)).join(' | '));
row('ALL CODE', all); row('reachable from step()', SIM); row('reachable from setup', SETUP); row('reachable from drawing', DRAW); row('step AND drawing', new Set(both));
// top sim functions by each risky thing
for (const k of ['rnd', 'perf', 'date', 'timer', 'async', 'forin', 'view', 'ls']) {
  const top = [...SIM].map((n) => [n, info.get(n)[k], info.get(n).line]).filter((r) => r[1] > 0).sort((a, b) => b[1] - a[1]);
  console.log(`\n[${k}] in ${top.length} step-reachable units; top:`, top.slice(0, 25).map((r) => `${r[0]}:${r[1]}@${r[2]}`).join(' '));
}
// areas: the function name's leading prefix (the code's lane names: ctf*, yn*, di*, ai*, ...)
const area = (n) => { const m = n.match(/^(ctf|yn|di|wh|tc|si|stg|stb|mc|ai|cpu|net|fs|fin|kit|assist|summon|item|boss|cobs|hs|ttw|tt|crm|crn|lhc|rma|fdr|stkr|lk|ev|evt|twist|race|tut)/i); return m ? m[1].toLowerCase() : 'other'; };
const byArea = {};
for (const n of SIM) { const I = info.get(n), a = area(n); const B = byArea[a] || (byArea[a] = { units: 0, rnd: 0, perf: 0, date: 0, timer: 0, forin: 0, view: 0 }); B.units++; for (const k of ['rnd', 'perf', 'date', 'timer', 'forin', 'view']) B[k] += I[k]; }
console.log('\nBY AREA (step-reachable): area units rnd perf date timer forin view');
for (const [a, B] of Object.entries(byArea).sort((x, y) => y[1].rnd - x[1].rnd)) console.log(' ', a.padEnd(8), B.units, B.rnd, B.perf, B.date, B.timer, B.forin, B.view);
import { writeFileSync } from 'node:fs';
writeFileSync(process.env.OUT || new URL('./scan.json', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), JSON.stringify({ lets: topLets, vars: topVars, consts: topConsts, fns: [...units].filter(([n, u]) => u.kind === 'fn').map(([n]) => n), sim: [...SIM] }));
