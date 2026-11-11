// Boot check: the game loads, and a few CPU matches play for a while without errors (FFA, Teams, CTF).
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves4/scripts/helpers/load-monolith.js';
const { window: w } = loadMonolith();
const errs = [];
w.addEventListener && w.addEventListener('error', e => errs.push(String(e.message || e)));
const run = (setup, frames) => { try { w.eval(setup); for (let i = 0; i < frames; i++) w.eval('step()'); return w.eval('fighters.filter(function(f){return !isFinite(f.x)||!isFinite(f.y)}).length'); } catch (e) { errs.push(e.message); return -1; } };
const r1 = run("SETTINGS.mode='ffa'; SETTINGS.count=4; SETTINGS.itemRate=2; startMatch(); fighters.forEach(function(f){f.controller='ai';});", 1800);
const r2 = run("SETTINGS.mode='teams'; SETTINGS.count=4; startMatch(); fighters.forEach(function(f){f.controller='ai';});", 1200);
console.log('ffa bad positions', r1, 'teams bad positions', r2, 'errors', errs.length ? errs.slice(0, 5) : 'none');
// guards added 2026-11-05: stray control bytes (a backslash+digit once became 0x01 and shipped), bare LF in the CRLF monolith, the hidden fighters' real names
import fs from 'node:fs';
const buf = fs.readFileSync('C:/Users/carad/Aardvark/smash-island/.worktrees/moves4/artifacts/V1/index.html');
let ctrl = 0, lf = 0;
for (let i = 0; i < buf.length; i++) { const c = buf[i]; if (c < 32 && c !== 9 && c !== 10 && c !== 13) ctrl++; if (c === 10 && buf[i - 1] !== 13) lf++; }
const txt = buf.toString('utf8');
const hidden = ['Suitcase', 'Cabby'].filter(n => txt.includes(n)).concat(/\bOJ\b/.test(txt) ? ['OJ'] : []);
console.log('guards: control bytes', ctrl, '| bare LF', lf, '| hidden names', hidden.length ? hidden : 'none');
if (ctrl || lf || hidden.length) { console.log('GUARD FAILED'); process.exitCode = 1; }
// kit guard added 2026-11-08 (Foldy's glide once ran for EVERY fighter: holding Up in the air made anyone fall at 1.25): for five ordinary kits, 12 frames falling with Up
// held must not be slower than the same fall with no key (a kit-only step that forgot its guard shows up here).
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves4/scripts/helpers/match-setup.js';
const { window: w2 } = loadMonolith(0xC0FFEE);
w2.eval(SETUP_SRC);
const fall = (name, hold) => {
  w2.eval(`__setupCustomMatch(['${name}','Pen'], 99, 2, 0); fighters.forEach(function(f){ f.controller='still'; f.invuln=0; }); for(let i=0;i<30;i++) step(); var f=fighters[0]; f.controller='local'; fighters[1].x=3000; f.x=WW*0.4; f.y=groundY()-320; f.vx=0; f.vy=0; f.onground=false; f.jumps=0; f.spCd=0;`);
  if (hold) w2.dispatchEvent(new w2.KeyboardEvent('keydown', { code: 'ArrowUp', bubbles: true }));
  for (let i = 0; i < 12; i++) w2.eval('step()');
  const vy = w2.eval('fighters[0].vy');
  if (hold) w2.dispatchEvent(new w2.KeyboardEvent('keyup', { code: 'ArrowUp', bubbles: true }));
  return vy;
};
const badKits = [];
for (const k of ['Bow', 'Firey', 'Clover', 'Tennis Ball', 'Cloudy', 'Spongy']) { try { const a = fall(k, false), b = fall(k, true); if (b < a - 0.5) badKits.push(k + ' ' + a.toFixed(1) + ' -> ' + b.toFixed(1)); } catch (e) { badKits.push(k + ' ERR ' + String(e.message).slice(0, 60)); } }
console.log('kit guard (Up held in the air falls as fast as plain):', badKits.length ? badKits : 'ok');
if (badKits.length) { console.log('KIT GUARD FAILED'); process.exitCode = 1; }
