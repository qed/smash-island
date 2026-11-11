// Mid-top panel: each of the ten (Expert, _lvl 3) vs a rotating mid-top opponent (also Expert), 1v1, Goiky Field, 3 stocks, capped; winner by stocks then %.
// Run with cwd = a folder holding artifacts/V1/index.html (before or after). usage: node panel.mjs <matchesPerFighter> <maxFrames> <out.json>
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves3/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves3/scripts/helpers/match-setup.js';
const M = +process.argv[2], MAXF = +process.argv[3], OUT = process.argv[4];
const TEN = ['Leafy','Basketball','Knife','Cheesy','Soap','Gaty','Sidewalky','Paintbrush','Trophy','Blueberry'];
const PANEL = ['Fries','Lollipop','Match','Naily','Toothpaste','Rocky','Firey','Pen'];
const res = {};
for (const n of TEN) {
  let win = 0, loss = 0, draw = 0, errs = 0;
  for (let m = 0; m < M; m++) {
    const opp = PANEL[m % PANEL.length], side = m % 2;
    const { window: w } = loadMonolith((0x2000 + m * 7919) >>> 0);
    w.eval(SETUP_SRC);
    const names = side ? [opp, n] : [n, opp];
    try {
      w.eval(`window.__setupCustomMatch(${JSON.stringify(names)}, 3, 2, 0); fighters.forEach(function(f){ f._lvl = 3; });`);
      let k = 0; while (w.eval('running') && k < MAXF) { w.eval('step()'); k++; }
      const fs_ = JSON.parse(w.eval('JSON.stringify(fighters.map(f=>({stocks:f.stocks,dead:!!f.dead,pct:Math.round(f.pct)})))'));
      const me = side ? 1 : 0, ot = 1 - me;
      let r = 0;
      if (fs_[me].dead !== fs_[ot].dead) r = fs_[me].dead ? -1 : 1;
      else if (fs_[me].stocks !== fs_[ot].stocks) r = fs_[me].stocks > fs_[ot].stocks ? 1 : -1;
      else if (fs_[me].pct !== fs_[ot].pct) r = fs_[me].pct < fs_[ot].pct ? 1 : -1;
      if (r > 0) win++; else if (r < 0) loss++; else draw++;
    } catch (e) { errs++; }
    try { w.close(); } catch {}
  }
  res[n] = { win, loss, draw, errs };
  console.log(n, JSON.stringify(res[n]));
  fs.writeFileSync(OUT, JSON.stringify(res));
}
