import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves4/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves4/scripts/helpers/match-setup.js';
const T = [['Ruby','down'],['Ruby','smash'],['Firey Jr.','down'],['Firey Jr.','up'],['Bell','down'],['TV','down'],['TV','neutral'],['Ruler','down'],['Gelatin','down'],['Loser','down'],['Loser','smash'],['Fern','smash'],['Coiny','down'],['Fanny','neutral'],['Fanny','smash']];
const FN = { up:'doUpSpecial(a)', smash:'doSmash(a)', down:'doDownSpecial(a)', neutral:'doSpecial(a)' };
const out = [];
for (const [n, slot] of T) {
  const errs = []; let res = {};
  try {
    for (const dist of [60, 140, 230]) {
      const { window: w } = loadMonolith(0xC0FFEE);
      w.addEventListener('error', e => errs.push(String(e.message)));
      w.eval(SETUP_SRC);
      w.eval(`__setupCustomMatch([${JSON.stringify(n)},'Pen'], 99, 2, 0); fighters.forEach(function(f){ f.controller='still'; f.invuln=0; }); for(let i=0;i<30;i++) step();
        var a=fighters[0], b=fighters[1]; a.x=WW*0.5; a.face=1; a.y=groundY()-a.r; a.vy=0; a.vx=0; a.onground=true; b.x=a.x+${dist}; b.y=a.y; b.onground=true; b.vx=0;b.vy=0; b.pct=0; b.invuln=0; a.spCd=0;a.smCd=0;a.atkCd=0; a.pct=${n==='Loser'&&slot==='down'?30:0}; a.burn=${n==='Loser'?60:0}; window.__x0=a.x; window.__y0=a.y;`);
      w.eval(FN[slot]);
      let mp = 0, root = 0, burn = 0, slow = 0, ice = 0, minvx = 0;
      for (let i = 0; i < 120; i++) { w.eval('step()'); mp = Math.max(mp, w.eval('b.pct')); root = Math.max(root, w.eval('b.rooted||0')); burn = Math.max(burn, w.eval('b.burn||0')); slow = Math.max(slow, w.eval('b.slowed||0')); ice = Math.max(ice, w.eval('b.iceUntil||0')); }
      res['d' + dist] = { pct: Math.round(mp * 10) / 10, root, burn: burn > 0, slow: slow > 0, ice: ice > 0 };
      if (dist === 60) { res.selfpct = Math.round(w.eval('a.pct')); res.selfburn = w.eval('a.burn||0'); res.carry = Math.round(w.eval('a.x-window.__x0')); res.dy = Math.round(w.eval('a.y-window.__y0')); }
    }
  } catch (e) { errs.push(e.message.slice(0, 160)); }
  out.push(n + ' ' + slot + ' ' + JSON.stringify(res) + ' errors=' + (errs.length ? errs.slice(0, 2) : 0));
}
console.log(out.join('\n'));
