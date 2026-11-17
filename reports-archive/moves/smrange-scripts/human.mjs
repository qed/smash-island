// HUMAN-INPUT PROBE: each own up / down smash pressed with the real keys (keydown events: ArrowUp / ArrowDown + KeyV) by a 'local' fighter,
// a still dummy placed above (up) or beside (down). Three ways to press: together, arrow held first, arrow only at release.
// Records: which move came out (f._lastKey / the row's name), the frame it started, whether the dummy took damage at which spots.
// Run from the worktree root: node human.mjs out.json [names comma-separated]
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/smrange/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/smrange/scripts/helpers/match-setup.js';
let LATE = 0; process.on('uncaughtException', (e) => { LATE++; console.error('UNCAUGHT', String(e && e.stack || e).slice(0, 400)); });
const BASE = process.env.SMR_BASE ? fs.readFileSync('C:/Users/carad/AppData/Local/Temp/claude/f6b4fec287bd4976/82251bbe-13a2-473f-9c20-558b0b86c2bf/scratchpad/smrange/base.html', 'utf8') : null;   // SMR_BASE=1: the build before this branch
const { window: w } = loadMonolith(0xBEEF, BASE ? () => BASE : undefined);
const errs = []; w.addEventListener('error', e => errs.push(String(e.message).slice(0, 120)));
w.eval(SETUP_SRC);
const NAMES = process.argv[3] ? process.argv[3].split(',').map(s => s.replace(/_/g, ' ')) : JSON.parse(w.eval('JSON.stringify(Object.keys(DSM_OWN))'));
w.eval(`window.__key = function(code, on){ const e = new KeyboardEvent(on ? 'keydown' : 'keyup', { code:code, key:code, bubbles:true }); window.dispatchEvent(e); };`);
const res = [];
for (const n of NAMES) {
  for (const dir of [1, -1]) {
    const out = JSON.parse(w.eval(`(function(){
      const name = ${JSON.stringify(n)}, dir = ${dir}, AR = dir > 0 ? 'ArrowUp' : 'ArrowDown';
      const spots = dir > 0 ? [[0,-60],[0,-90],[30,-70],[-30,-70],[50,-40],[-50,-40]] : [[50,0],[-50,0],[80,0],[-80,0],[30,0],[-30,0]];
      const modes = ['together', 'arrowFirst', 'arrowAtEnd'];
      const rows = [];
      for (const mode of modes) for (const sp of spots) {
        window.__setupCustomMatch([name, name === 'Coiny' ? 'Firey' : 'Coiny'], 99, 2, 0);
        const a = fighters[0], d = fighters[1];
        a.controller = 'local'; a.you = true; d.controller = 'still';
        for (let i = 0; i < 30; i++) step();
        for (const f of fighters){ f.invuln = 0; f.x = WW*0.5; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.onground = true; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; }
        d.x = a.x + sp[0]; d.y = groundY() - d.r + sp[1]; d.pct = 60; const hx = d.x, hy = d.y, hold = sp[1] < 0;
        for (let i = 0; i < 3; i++) step();
        for (const f of fighters){ f.invuln = 0; } a.x = WW*0.5; a.face = 1;
        const p0 = d.pct; let started = -1, key = null, hitT = -1, ax0 = a.x, ay0 = a.y, minAy = a.y, ground0 = a.onground, lastKeySeen = null;
        const used0 = Object.assign({}, a._used || {});
        for (let t = 0; t < 110; t++){
          // the keys
          if(mode === 'together'){ if(t === 0){ __key(AR, true); __key('KeyV', true); } if(t === 6) __key('KeyV', false); if(t === 50) __key(AR, false); }
          if(mode === 'arrowFirst'){ if(t === 0) __key(AR, true); if(t === 4) __key('KeyV', true); if(t === 10) __key('KeyV', false); if(t === 54) __key(AR, false); }
          if(mode === 'arrowAtEnd'){ if(t === 0) __key('KeyV', true); if(t === 6) __key('KeyV', false); if(t === 14) __key(AR, true); if(t === 54) __key(AR, false); }
          if(d.pct === p0){ d.x = hx; if(hold){ d.y = hy; d.vy = 0; d.onground = false; } d.vx = 0; }
          step();
          if(a._mv && started < 0 && /smash/.test(a._mv.key)){ started = t; key = a._mv.key; }
          if(a.y < minAy) minAy = a.y;
          if(d.pct !== p0 && hitT < 0) hitT = t;
        }
        __key(AR, false); __key('KeyV', false);
        const used = a._used || {}, diff = {}; for (const k in used) if((used[k] || 0) !== (used0[k] || 0)) diff[k] = used[k] - (used0[k] || 0);
        rows.push({ mode, sp, started, key, used: diff, took: Math.round((d.pct - p0)*10)/10, hitT, rose: Math.round(ay0 - minAy), ground0 });
      }
      return JSON.stringify(rows);
    })()`));
    const want = dir > 0 ? 'usmash' : 'dsmash';
    const came = out.filter(r => r.key === want).length, hit = out.filter(r => r.key === want && r.took > 0).length;
    const wrong = out.filter(r => r.key && r.key !== want).map(r => r.mode + ':' + r.key);
    const none = out.filter(r => !r.key).map(r => r.mode + ':' + JSON.stringify(r.used));
    res.push({ n, dir, rows: out });
    console.log(n.padEnd(12), dir > 0 ? 'up  ' : 'down', 'came out', came + '/' + out.length, 'hit dummy', hit + '/' + out.length,
      wrong.length ? 'WRONG ' + [...new Set(wrong)].join(' ') : '', none.length ? 'NONE ' + [...new Set(none)].slice(0, 4).join(' ') : '',
      '| hit spots:', [...new Set(out.filter(r => r.key === want && r.took > 0).map(r => r.sp.join(',')))].join(' '));
  }
}
console.log('page errors', errs.length ? errs.slice(0, 5) : 0, 'late', LATE);
fs.writeFileSync(process.argv[2], JSON.stringify({ res, errs }));
try { w.close(); } catch {}
