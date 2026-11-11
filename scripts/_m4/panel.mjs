// Mid-top panel: each fighter (Expert, _lvl 3) vs a rotating mid-top opponent (also Expert), 1v1, 3 stocks, capped; before and after in ONE process, one after the other.
// run from the worktree root. usage: node panel.mjs <matches> <maxFrames> <out.json> [fighters comma list]
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves4/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves4/scripts/helpers/match-setup.js';
let LATE = 0; process.on('uncaughtException', (e) => { LATE++; if (LATE <= 3) console.log('late error after window close:', String(e.message).slice(0, 80)); });
const M = +process.argv[2], MAXF = +process.argv[3], OUT = process.argv[4];
const TEN = (process.argv[5] || 'Ruby,Firey Jr.,Bell,TV,Ruler,Gelatin,Loser,Fern,Coiny,Fanny').split(',');
const BEFORE = fs.readFileSync('C:/Users/carad/AppData/Local/Temp/claude/f6b4fec287bd4976/82251bbe-13a2-473f-9c20-558b0b86c2bf/scratchpad/before.html', 'utf8');
const PANEL = ['Fries','Lollipop','Match','Naily','Toothpaste','Rocky','Firey','Pen'];
const res = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
for (const n of TEN) {
  res[n] = res[n] || {};
  for (const ver of ['before', 'after']) {
    let win = 0, loss = 0, draw = 0, errs = 0, stk = 0, t0 = Date.now();
    for (let m = 0; m < M; m++) {
      const opp = PANEL[m % PANEL.length], side = m % 2;
      const { window: w } = loadMonolith((0x2000 + m * 7919) >>> 0, ver === 'before' ? () => BEFORE : undefined);
      w.eval(SETUP_SRC);
      const names = side ? [opp, n] : [n, opp];
      try {
        w.eval(`window.__setupCustomMatch(${JSON.stringify(names)}, 3, 2, 0); fighters.forEach(function(f){ f._lvl = 3; });`);
        let k = 0; while (w.eval('running') && k < MAXF) { w.eval('step()'); k++; }
        const fs_ = JSON.parse(w.eval('JSON.stringify(fighters.map(f=>({stocks:f.stocks,dead:!!f.dead,pct:Math.round(f.pct)})))'));
        const me = side ? 1 : 0, ot = 1 - me;
        stk += fs_[me].stocks - fs_[ot].stocks;
        let r = 0;
        if (fs_[me].dead !== fs_[ot].dead) r = fs_[me].dead ? -1 : 1;
        else if (fs_[me].stocks !== fs_[ot].stocks) r = fs_[me].stocks > fs_[ot].stocks ? 1 : -1;
        else if (fs_[me].pct !== fs_[ot].pct) r = fs_[me].pct < fs_[ot].pct ? 1 : -1;
        if (r > 0) win++; else if (r < 0) loss++; else draw++;
      } catch (e) { errs++; }
      try { w.close(); } catch {}
    }
    res[n][ver] = { win, loss, draw, errs, stockDiff: stk, secs: Math.round((Date.now() - t0) / 1000) };
    console.log(n, ver, JSON.stringify(res[n][ver]));
    fs.writeFileSync(OUT, JSON.stringify(res));
  }
}
