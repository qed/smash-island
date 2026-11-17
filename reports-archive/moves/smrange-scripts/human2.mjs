// HUMAN-INPUT PROBE 2: the up / down smash pressed with the real keys in play-like situations (a tap, walking, just after a neutral smash, smash cooldown,
// just after landing). Which move came out? Run from the worktree root: node human2.mjs out.json names(_ for spaces)
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/smrange/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/smrange/scripts/helpers/match-setup.js';
let LATE = 0; process.on('uncaughtException', (e) => { LATE++; console.error('UNCAUGHT', String(e && e.stack || e).slice(0, 300)); });
const { window: w } = loadMonolith(0xBEEF);
const errs = []; w.addEventListener('error', e => errs.push(String(e.message).slice(0, 120)));
w.eval(SETUP_SRC);
const NAMES = process.argv[3] ? process.argv[3].split(',').map(s => s.replace(/_/g, ' ')) : JSON.parse(w.eval('JSON.stringify(Object.keys(DSM_OWN))'));
w.eval(`window.__key = function(code, on){ window.dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { code:code, key:code, bubbles:true })); };`);
const SCEN = ['tap', 'hold', 'walking', 'afterNeutral', 'cooldown40', 'landing'];
const res = [];
for (const n of NAMES) for (const dir of [1, -1]) {
  const out = JSON.parse(w.eval(`(function(){
    const name = ${JSON.stringify(n)}, dir = ${dir}, AR = dir > 0 ? 'ArrowUp' : 'ArrowDown', rows = [];
    for (const sc of ${JSON.stringify(SCEN)}) {
      window.__setupCustomMatch([name, name === 'Coiny' ? 'Firey' : 'Coiny'], 99, 2, 0);
      const a = fighters[0], d = fighters[1]; a.controller = 'local'; a.you = true; d.controller = 'still';
      for (let i = 0; i < 30; i++) step();
      for (const f of fighters){ f.invuln = 0; f.x = WW*0.5; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.onground = true; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; }
      d.x = a.x + 400; for (let i = 0; i < 3; i++) step();
      let t0 = 0;
      if(sc === 'afterNeutral'){ __key('KeyV', true); for (let i = 0; i < 4; i++) step(); __key('KeyV', false); for (let i = 0; i < 90; i++) step(); }   // a neutral smash, then wait 90 frames
      if(sc === 'cooldown40'){ a.smCd = 40; }
      if(sc === 'landing'){ __key('ArrowUp', true); step(); __key('ArrowUp', false); let k = 0; while(!a.onground && k++ < 200) step(); }   // a hop, pressed on the landing frame
      const cd0 = a.smCd, lag0 = a._lag || 0, used0 = Object.assign({}, a._used || {});
      if(sc === 'walking') __key('ArrowRight', true);
      let key = null;
      for (let t = 0; t < 260; t++){
        if(t === 0){ __key(AR, true); __key('KeyV', true); }
        if(t === 6){ __key('KeyV', false); if(sc !== 'hold') __key(AR, false); }
        if(t === 200){ __key(AR, false); __key('ArrowRight', false); }
        step();
        if(a._mv && /smash/.test(a._mv.key) && !key) key = a._mv.key;
        if(!key && a._atkMove && /smash/.test(a._atkMove) && a._atkAnim > 0) key = a._atkMove;
      }
      __key(AR, false); __key('ArrowRight', false); __key('KeyV', false);
      const used = a._used || {}, diff = []; for (const k in used) if((used[k] || 0) !== (used0[k] || 0)) diff.push(k);
      rows.push({ sc, cd0, lag0, key, used: diff.join('+') });
    }
    return JSON.stringify(rows);
  })()`));
  res.push({ n, dir, rows: out });
  console.log(n.padEnd(12), dir > 0 ? 'up  ' : 'down', out.map(r => r.sc + '=' + (r.key || 'none') + (r.cd0 ? '(cd' + r.cd0 + ')' : '') + (r.lag0 ? '(lag' + r.lag0 + ')' : '')).join('  '));
}
console.log('page errors', errs.length ? errs.slice(0, 5) : 0, 'late', LATE);
fs.writeFileSync(process.argv[2], JSON.stringify({ res, errs }));
try { w.close(); } catch {}
