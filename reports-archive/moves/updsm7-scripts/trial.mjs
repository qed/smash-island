import os from 'node:os'; try { os.setPriority(0, os.constants.priority.PRIORITY_LOW); } catch(e) {}
// Each of the 24 moves thrown at a still dummy on a grid of positions (offline, one page). Records what the dummy took at each spot, where it was thrown,
// errors, and runs every prop drawing over frames 0..40 against a counting canvas (the game swallows prop errors, so they are counted here).
// Run from the worktree root: node trial.mjs out.json
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/scripts/helpers/match-setup.js';
let LATE = 0; process.on('uncaughtException', () => { LATE++; });
const NAMES = ['Balloon', 'Bomb', 'Fern', 'Goo', 'Microphone', 'Pillow', 'Taco (II)', 'Tea Kettle'];
const { window: w } = loadMonolith(0xBEEF);
const errs = []; w.addEventListener('error', e => errs.push(String(e.message).slice(0, 120)));
w.eval(SETUP_SRC);
const res = [];
for (const n of NAMES) {
  for (const dir of [1, -1]) {
    const out = JSON.parse(w.eval(`(function(){
      const XS = [-110,-90,-70,-50,-30,-10,10,30,50,70,90,110], YS = ${dir > 0 ? '[0,-40,-70,-100]' : '[0,-40]'}, cells = [];
      let thrown = 0, exc = 0, maxT = 0;
      for (const dy of YS) for (const dx of XS) {
        window.__setupCustomMatch([${JSON.stringify(n)}, 'Coiny'], 99, 2, 0);
        for (const f of fighters){ f.controller = 'still'; f.invuln = 0; }
        for (let i = 0; i < 30; i++) step();
        const a = fighters[0], d = fighters[1];
        for (const f of fighters){ f.invuln = 0; f.x = WW*0.5; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.onground = true; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; }
        d.x = a.x + dx; d.y = groundY() - d.r + dy; d.pct = 60;
        const hold = dy < 0;   // a foe in the air is held where it is until it is hit (a still target)
        const S = dirSmashSpec(a, ${dir});
        let ok = false; try { ok = dirSmash(a, ${dir}); } catch(e){ exc++; }
        if(ok) thrown++;
        const p0 = d.pct, hx = d.x, hy = d.y; let burn = 0, hitT = -1, vx = 0, vy = 0, fxs = {};
        for (let t = 0; t < S.st + S.act + S.end + 4; t++){
          if(d.pct === p0){ d.x = hx; if(hold){ d.y = hy; d.vy = 0; d.onground = false; } d.vx = 0; }
          try { step(); } catch(e){ exc++; }
          if(d.pct !== p0 && hitT < 0){ hitT = t; }
          if(d.pct !== p0 && t <= S.st + S.act){ if(Math.hypot(d.vx, d.vy) > Math.hypot(vx, vy)){ vx = d.vx; vy = d.vy; } }
          if(d.burn > 0) fxs.burn = 1; if(d._poisonT > 0) fxs.poison = 1; if(d.iceUntil > 0) fxs.ice = 1; if(d.bleed > 0) fxs.bleed = 1;
        }
        if(a._mv) maxT++;
        // the burn / poison a move leaves keeps ticking after it: 120 more frames, and the most the dummy ever showed is what it "took" in all
        let top = d.pct; for (let t = 0; t < 120; t++){ try { step(); } catch(e){ exc++; } if(d.pct > top) top = d.pct; }
        d.pct = top;
        cells.push({ dx, dy, took: Math.round((d.pct - p0)*10)/10, hitT, vx: Math.round(vx*10)/10, vy: Math.round(vy*10)/10, fx: Object.keys(fxs).join('+'), ax: Math.round(a.x - WW*0.5) });
      }
      return JSON.stringify({ thrown, exc, stillInMove: maxT, cells });
    })()`));
    const hits = out.cells.filter(c => c.took > 0);
    const mx = hits.length ? Math.max(...hits.map(c => c.took)) : 0;
    res.push({ n, dir, ...out });
    console.log(n, dir > 0 ? 'up  ' : 'down', 'thrown', out.thrown + '/' + out.cells.length, 'exceptions', out.exc, 'cells hit', hits.length, 'most taken', mx,
      '| hit at dx:', [...new Set(hits.map(c => c.dx + (c.dy ? '@' + c.dy : '')))].join(' '));
  }
}
// the props: every drawing over frames 0..40, facing both ways, exceptions counted
const pr = JSON.parse(w.eval(`(function(){
  let n = 0, exc = [], calls = 0;
  const c = new Proxy({}, { get:(t, p) => (p === 'measureText' ? () => ({ width:0 }) : () => { calls++; }), set:() => true });
  for (const who of ${JSON.stringify(NAMES)}) for (const d of ['up', 'down']) {
    const fn = DSM_PROPS[who + '.' + d]; if(!fn){ exc.push('NO PROP ' + who + '.' + d); continue; } n++;
    for (const face of [1, -1]) for (let t = 0; t <= 40; t++){ try { fn(c, function(x){ return 500 + x*face; }, function(y){ return 400 + y; }, 1, t); } catch(e){ exc.push(who + '.' + d + ' t' + t + ': ' + String(e.message).slice(0, 80)); } }
  }
  return JSON.stringify({ props:n, canvasCalls:calls, exc:exc.slice(0, 10), excN:exc.length });
})()`));
console.log('props', JSON.stringify(pr));
console.log('page errors', errs.length ? errs.slice(0, 5) : 0, 'late', LATE);
fs.writeFileSync(process.argv[2], JSON.stringify({ res, pr, errs }));
try { w.close(); } catch {}
