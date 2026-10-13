// kit-roles-report.mjs -- turns a kit-roles.mjs run (JSON) into the verdicts and the markdown table. No engine here: it only reads the numbers.
//   node scripts/kit-roles-report.mjs kit-roles.json out-prefix        writes out-prefix.table.md and out-prefix.derived.json
//
// TWO TIERS. The engine gives EVERY fighter a shared kit: the jab, the up-tilt (a straight-up launch), the down-tilt, a default hop for an up-special where a
// kit has none, a shared finisher (the circle, 3 s cooldown) where a kit has no finisher of its own (81 of 102 do not), and a counter stance for a down-special where
// a kit has none. Those shared moves make every fighter look complete (the shared finisher alone KOs a weight-90 dummy at 50% and chains from any jab). So a fighter
// is judged on its OWN kit: its special, up-special, down-special, smash, and finisher if it has one of its own, plus the jab/tilts as the chip that starts a string.
import { writeFileSync, readFileSync } from 'node:fs';

export const T = {
  KILL: 150,            // the brief: a kit whose best kill needs over about 150% has no kill
  KILL_THIN: 100,       // 100-150 is thin
  REC_APEX: 40,         // a tool fills "recover" if, alone in open air, it lifts the fighter this many px above its start...
  REC_DX: 100,          // ...or carries it this many px further sideways than doing nothing...
  REC_SAVED: 350,       // ...or holds it up (height saved against falling after 60 frames) this much (a double jump alone saves ~800, a plain fall 0)
  REC_NONE: 0.45,       // recovery score (double jump spent; mean of beside-reach and depth-reach against the plain fighter) under this = no recovery
  REC_WEAK: 0.8,        // under this = weak
  COMBO_WINDOW: 5,      // a follow-up must still land when thrown this many frames after the opener, or the string is frame-perfect
  BUFF_GAIN: 25,        // a buff fills "kill" if it moves a move's KO % down by this much
};

const NAME = { J: 'double jump', U: 'up-special', N: 'special', D: 'down-special', S: 'smash', F: 'finisher' };
const TOOL_OF = { special: 'N', upspecial: 'U', downspecial: 'D', finisher: 'F' };
export const MV = { jab: 'jab', utilt: 'up-tilt', dtilt: 'down-tilt', finisher: 'finisher', special: 'special', upspecial: 'up-special', downspecial: 'down-special', smash: 'smash', smashup: 'smash-up', smashdown: 'smash-down' };
const CHIP = ['jab', 'utilt', 'dtilt'];
const DEF_FIELDS = /^(armor|countering|reflecting|cloud|invuln|frozen|_corked|_shield|_scrub|healing|_paperBag|_shatter|_holdT)/;

function ground(ko, m) { const v = ko && ko[m]; return v && v.ko != null ? v.ko : null; }
function air(ko, m) { const v = ko && ko['a:' + m]; return v && v.ko != null ? v.ko : null; }

export function derive(data) {
  const R = data.results, base = R.Dummy;
  const B = base.rec.jumpSpent, BL = base.rec.jumpLeft;
  const rows = [];
  for (const name of Object.keys(R)) {
    if (name === 'Dummy') continue;
    const r = R[name];
    const own = (r.spec && r.spec.own) || { up: true, down: true, fin: false, smash: true };
    const ownMove = (m) => m === 'finisher' ? !!own.fin : ['special', 'upspecial', 'downspecial', 'smash', 'smashup', 'smashdown'].includes(m);
    const o = { name, w: r.w, kit: r.kit, desc: r.desc, ownFinisher: !!own.fin, errors: Object.keys(r).filter((k) => /Error$/.test(k)).map((k) => k + ': ' + r[k]) };

    // ---------------- KILL ----------------
    const kitKill = [];   // [pct, move, how]
    for (const m of ['smash', 'smashup', 'smashdown', 'special', 'upspecial', 'downspecial', ...(own.fin ? ['finisher'] : [])]) { const g = ground(r.ko, m); if (g != null) kitKill.push([g, m, 'ground']); }
    for (const m of ['downspecial', 'special']) { const c = r.spec && r.spec[m] && r.spec[m].counter; if (c && c.ko != null) kitKill.push([c.ko, m, 'counter (the foe must hit it)']); }
    for (const m of ['special', 'upspecial', 'downspecial']) {
      const b = r.spec && r.spec[m] && r.spec[m].buffedKo; if (!b) continue;
      for (const m2 of ['jab', 'utilt', 'smash']) { const un = ground(r.ko, m2); if (b[m2] != null && (un == null || b[m2] <= un - T.BUFF_GAIN)) kitKill.push([b[m2], m + '>' + m2, 'buff']); }
    }
    kitKill.sort((a, b) => a[0] - b[0]);
    const sharedFin = ground(r.ko, 'finisher');
    const bestAir = Math.min(...['smash', 'smashup', 'smashdown', 'special', 'upspecial', 'downspecial', ...(own.fin ? ['finisher'] : [])].map((m) => air(r.ko, m) ?? 999));
    o.kill = { best: kitKill[0] || null, bestAir: bestAir < 999 ? bestAir : null, sharedFinisher: own.fin ? null : sharedFin, utilt: ground(r.ko, 'utilt'), smash: Math.min(ground(r.ko, 'smash') ?? 999, ground(r.ko, 'smashup') ?? 999, ground(r.ko, 'smashdown') ?? 999) };
    o.kill.rating = !o.kill.best || o.kill.best[0] > T.KILL ? 'MISSING' : o.kill.best[0] > T.KILL_THIN ? 'THIN' : 'OK';

    // ---------------- RECOVERY ----------------
    if (r.rec) {
      const js = r.rec.jumpSpent, jl = r.rec.jumpLeft;
      const sc = (x, b) => 0.5 * (Math.max(0, x.beside) / Math.max(1, b.beside)) + 0.5 * (Math.max(0, x.below) / Math.max(1, b.below));
      const score = sc(js, B), scoreL = sc(jl, BL);
      const open = r.rec.open, tools = {};
      for (const k of ['special', 'upspecial', 'downspecial', 'finisher']) {
        const t = open[TOOL_OF[k]];
        tools[k] = t && (t.apex >= T.REC_APEX || t.dx >= T.REC_DX || t.saved60 >= T.REC_SAVED) ? t : null;
      }
      const used = new Set();
      for (const seq of [js.besideSeq, js.belowSeq]) for (const s of (seq || [])) if (s[0] !== 'J') used.add(s[0]);
      const kitTools = ['special', 'upspecial', 'downspecial', ...(own.fin ? ['finisher'] : [])].filter((m) => tools[m]);
      const up = open.U || { apex: 0 };
      o.rec = {
        score: +score.toFixed(2), scoreLeft: +scoreL.toFixed(2), beside: js.beside, below: js.below, high: js.high, besideL: jl.beside, belowL: jl.below,
        upLift: up.apex, kitTools, used: [...used].map((t) => NAME[t]),
        rating: kitTools.length === 0 ? 'NONE' : score < T.REC_NONE ? 'NONE' : score < T.REC_WEAK ? 'WEAK' : 'OK',
      };
    }

    // ---------------- COMBO ----------------
    if (r.combo) {
      const starters = [], strings = [];
      for (const X of Object.keys(r.combo)) {
        const row = r.combo[X], pcts = []; let win = 0; const ys = new Set();
        for (const p of Object.keys(row.byPct || {})) {
          const b = row.byPct[p]; if (!b.starts) continue;
          let ok = false;
          for (const [Y, v] of Object.entries(b.ys)) {
            const maxD = Math.max(...v.d);
            if (maxD < T.COMBO_WINDOW) continue;
            if (!(ownMove(X) || ownMove(Y))) continue;   // jab -> shared finisher, tilt -> tilt: every fighter has those
            ok = true; ys.add(Y); win = Math.max(win, maxD);
          }
          if (ok) pcts.push(+p);
        }
        if (pcts.length) { starters.push({ move: X, pcts, win, ys: [...ys] }); }
      }
      o.combo = { starters, chip: starters.filter((s) => CHIP.includes(s.move)), rating: starters.length === 0 ? 'MISSING' : (starters.length <= 1 || !starters.some((x) => CHIP.includes(x.move))) ? 'THIN' : 'OK' };   // thin: one opener only, or no chip (jab / tilt) that opens a string, the owner's "chipping with the attack"
    }

    // ---------------- SPECIALS ----------------
    o.specials = {};
    for (const m of ['special', 'upspecial', 'downspecial', ...(own.fin ? ['finisher'] : [])]) {
      const s = r.spec && r.spec[m];
      const roles = [], why = [];
      const co = r.combo && r.combo[m];
      const starts = co && Object.values(co.byPct || {}).some((b) => b.starts && Object.values(b.ys).some((y) => Math.max(...y.d) >= T.COMBO_WINDOW));
      const isLink = r.combo && Object.entries(r.combo).some(([X, row]) => X !== m && Object.values(row.byPct || {}).some((b) => b.starts && b.ys[m] && Math.max(...b.ys[m].d) >= T.COMBO_WINDOW));
      if (starts) { roles.push('combo'); why.push('opens strings'); } else if (isLink) { roles.push('combo'); why.push('link only'); }
      const g = ground(r.ko, m);
      if (g != null && g <= T.KILL) { roles.push('kill'); why.push(`KO ${g}%`); }
      if (o.rec && o.rec.kitTools.includes(m)) { roles.push('recover'); const t = r.rec.open[TOOL_OF[m]]; why.push(`lift ${t.apex}px, side ${t.dx}px`); }
      if (s && s.counter) {
        if (s.counter.ko != null && s.counter.ko <= T.KILL) { if (!roles.includes('kill')) roles.push('kill'); why.push(`counter KOs at ${s.counter.ko}%`); }
        if (s.counter.links.length) { if (!roles.includes('combo')) roles.push('combo'); why.push('counter links ' + s.counter.links.join('/')); }
      }
      if (s && s.buffedKo) { const un = Math.min(ground(r.ko, 'smash') ?? 999, ground(r.ko, 'jab') ?? 999, ground(r.ko, 'utilt') ?? 999); const bb = Math.min(...['jab', 'utilt', 'smash'].map((k) => s.buffedKo[k] ?? 999)); if (bb <= T.KILL && bb <= un - T.BUFF_GAIN) { if (!roles.includes('kill')) roles.push('kill'); why.push(`buff: next hit KOs at ${bb}%`); } }
      const tag = []; let soft = false;
      if (!roles.length && s) {
        const dfs = (s.diff || []).map((d) => d.split(':')[0]);
        if (s.counter) tag.push(`counter stance (answers a hit for ${s.counter.dmg}%, no KO, no string)`);
        else if (dfs.some((d) => DEF_FIELDS.test(d))) tag.push('defensive stance (' + dfs.filter((d) => DEF_FIELDS.test(d)).join(',') + ')');
        else if (dfs.length) tag.push('buff/state on the fighter (' + dfs.slice(0, 4).join(',') + ')');
        const fd = (s.foe || []).map((d) => d.split(':')[0]);
        if (s.dmg === 0 && fd.length) { tag.push('marks/debuffs the foe (' + fd.slice(0, 4).join(',') + '); no hit, no string, no KO, no lift'); soft = true; }
        if (s.dmg > 0) tag.push(`hits for ${s.dmg}% but no string, no KO, no lift`);
        else if (s.projs || s.summons) tag.push('lays something down that never touched the foe');
        if (!tag.length) tag.push('no effect found');
      }
      o.specials[m] = { roles, why, tag, soft, dmg: s ? s.dmg : null, ko: g };
    }
    o.noRole = Object.entries(o.specials).filter(([m, v]) => !v.roles.length).map(([m, v]) => ({ move: m, tag: v.tag, soft: v.soft }));

    // ---------------- VERDICT ----------------
    const miss = [];
    if (o.combo && o.combo.rating === 'MISSING') miss.push('combo');
    if (o.rec && o.rec.rating === 'NONE') miss.push('recovery');
    if (o.kill.rating === 'MISSING') miss.push('kill');
    const soft = [];
    if (o.combo && o.combo.rating === 'THIN') soft.push('thin combos');
    if (o.rec && o.rec.rating === 'WEAK') soft.push('weak recovery');
    if (o.kill.rating === 'THIN') soft.push('thin kill');
    o.miss = miss; o.soft = soft;
    o.verdict = miss.length ? miss.map((m) => 'missing ' + m).join(' + ') : (soft.length ? 'OK (' + soft.join(', ') + ')' : 'OK');
    // severity: worst first. A missing role weighs most; a special with no role and a thin role weigh less.
    o.severity = miss.length * 100 + soft.length * 15 + o.noRole.reduce((a, n) => a + (n.soft ? 5 : 10), 0)
      + (o.kill.best ? Math.max(0, o.kill.best[0] - 60) / 4 : 40) + (o.rec ? Math.max(0, (1 - o.rec.score)) * 30 : 0);
    rows.push(o);
  }
  rows.sort((a, b) => b.severity - a.severity);
  return { rows, base: { B, BL } };
}

const pr = (s) => (s.pcts.length === 3 ? '0-80' : s.pcts.join('/'));
export function tableLine(o) {
  const combo = o.combo ? (o.combo.starters.filter((s) => CHIP.includes(s.move) || ownMoveName(s.move)).slice(0, 4).map((s) => `${MV[s.move]} ${pr(s)}%`).join(', ') || 'none') : '?';
  const rec = o.rec ? `${o.rec.rating} ${o.rec.score}: ${o.rec.kitTools.map((m) => MV[m]).join('+') || 'none'}${o.rec.upLift < T.REC_APEX ? ' (up-special no lift)' : ''}` : '?';
  const kill = o.kill.best ? `${o.kill.best[1].replace('>', ' then ')} ${o.kill.best[0]}%${o.kill.best[2] !== 'ground' ? ' (' + o.kill.best[2] + ')' : ''}` : 'none';
  const nr = o.noRole.map((n) => MV[n.move]).join(', ') || '-';
  return `| ${o.name} | ${combo} | ${rec} | ${kill} | ${nr} | ${o.verdict} |`;
}
const ownMoveName = (m) => ['special', 'upspecial', 'downspecial', 'smash'].includes(m);

export function buildReport(data, prefix) {
  const { rows, base } = derive(data);
  const head = '| Fighter | Combo starters (move, %) | Recovery (rating score: kit tools) | Kill (best own move, %) | Specials with no role | Verdict |\n|---|---|---|---|---|---|\n';
  writeFileSync(prefix + '.table.md', head + [...rows].sort((a, b) => a.name.localeCompare(b.name)).map(tableLine).join('\n') + '\n');
  writeFileSync(prefix + '.derived.json', JSON.stringify({ T, base, rows }, null, 1) + '\n');
  // the small file worth committing: one line of numbers per fighter
  const sum = rows.map((o) => ({
    name: o.name, kit: o.kit, verdict: o.verdict, severity: +o.severity.toFixed(1),
    combo: o.combo.rating, starters: o.combo.starters.map((x) => `${x.move}@${x.pcts.join('/')}`),
    recovery: o.rec.rating, recScore: o.rec.score, recBeside: o.rec.beside, recBelow: o.rec.below, upSpecialLift: o.rec.upLift, recTools: o.rec.kitTools,
    kill: o.kill.rating, bestKill: o.kill.best ? `${o.kill.best[1]} ${o.kill.best[0]}% (${o.kill.best[2]})` : null, smashKo: o.kill.smash >= 999 ? null : o.kill.smash,
    ownFinisher: o.ownFinisher, noRoleSpecials: o.noRole.map((n) => `${n.move}: ${n.tag.join('; ')}`),
  }));
  writeFileSync(prefix + '.summary.json', JSON.stringify({ made: data.made, thresholds: T, baseline: base, fighters: sum }, null, 1) + '\n');
  return rows;
}

if (/kit-roles-report\.mjs$/.test(process.argv[1] || '')) {
  const [, , file, prefix] = process.argv;
  if (file && prefix) buildReport(JSON.parse(readFileSync(file, 'utf8')), prefix);
}
