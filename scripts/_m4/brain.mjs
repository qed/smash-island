import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves4/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves4/scripts/helpers/match-setup.js';
const KITS = {Ruby:'beam', 'Firey Jr.':'emberjr', Bell:'ring', TV:'static', Ruler:'measure', Gelatin:'freeze', Loser:'cool', Fern:'photo', Coiny:'slap', Fanny:'gust'};
const { window: w } = loadMonolith(0xC0FFEE); w.eval(SETUP_SRC);
w.eval('(function(){var t=1700000000000;Date.now=function(){return t+=16;};})()');
function sweep(n, fn) {
  let near = -1, far = -1, dmg = 0;
  for (let d = 10; d <= 440; d += 10) {
    w.eval(`__setupCustomMatch([${JSON.stringify(n)},'Pen'], 99, 2, 0); fighters.forEach(function(f){ f.controller='still'; f.invuln=0; }); for(let i=0;i<30;i++) step();
      var a=fighters[0], b=fighters[1]; a.x=WW*0.5; a.face=1; a.y=groundY()-a.r; a.vy=0;a.vx=0;a.onground=true; b.x=a.x+${d}; b.y=a.y; b.onground=true; b.vx=0;b.vy=0; b.pct=0; b.invuln=0; a.spCd=0;a.smCd=0;a.atkCd=0; a.pct=0; projectiles.length=0; ${fn}`);
    let mp = 0; for (let i = 0; i < 70; i++) { w.eval('step()'); mp = Math.max(mp, w.eval('b.pct')); }
    if (mp > 0) { if (near < 0) near = d; far = d; dmg = Math.max(dmg, mp); }
  }
  return [near, far, Math.round(dmg * 10) / 10];
}
function carry(n, fn) {
  w.eval(`__setupCustomMatch([${JSON.stringify(n)},'Pen'], 99, 2, 0); fighters.forEach(function(f){ f.controller='still'; f.invuln=0; }); for(let i=0;i<30;i++) step();
   var a=fighters[0], b=fighters[1]; a.x=WW*0.4; a.face=1; a.y=groundY()-a.r; a.vy=0;a.vx=0;a.onground=true; b.x=a.x+900; b.y=a.y; b.onground=true; a.spCd=0;a.smCd=0;a.atkCd=0; window.__x0=a.x; ${fn}`);
  let mx = 0; for (let i = 0; i < 100; i++) { w.eval('step()'); const dd = w.eval('a.x - window.__x0'); if (Math.abs(dd) > Math.abs(mx)) mx = dd; }
  return Math.round(mx);
}
for (const [n, k] of Object.entries(KITS)) {
  const ne = sweep(n, 'doSpecial(a)'), dn = sweep(n, 'doDownSpecial(a)');
  console.log(k, JSON.stringify([ne[0], ne[1], ne[2], carry(n, 'doSpecial(a)'), carry(n, 'doSmash(a)'), dn[0], dn[1], dn[2]]));
}
