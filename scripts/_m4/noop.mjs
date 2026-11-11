import fs from 'node:fs';
import crypto from 'node:crypto';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves3/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves3/scripts/helpers/match-setup.js';
const TEN = ['Leafy','Basketball','Knife','Cheesy','Soap','Gaty','Sidewalky','Paintbrush','Trophy','Blueberry'];
const { window: w } = loadMonolith(0xC0FFEE);
const rows = JSON.parse(w.eval(`JSON.stringify(ROSTER.map(r=>({n:r.name,k:r.kit&&r.kit.special,up:UPSPEC[r.kit&&r.kit.special]||null,sm:SMASH_SPEC[r.kit&&r.kit.special]||null,id:(SMASH_ID[r.kit&&r.kit.special]||{}).name||null,mt:MOVE_TEXT[r.name]||null,br:BRAIN_SPEC[r.kit&&r.kit.special]||null,dn:String(DOWNSPECIALS[r.kit&&r.kit.special]||''),en:ENDLAG_ADD[(r.kit&&r.kit.special)+'.smash']||null})))`));
const rest = rows.filter(r => !TEN.includes(r.n));
const h1 = crypto.createHash('sha1').update(JSON.stringify(rest)).digest('hex');
// seeded match of unchanged fighters, 1500 frames, state hash
const names = ['Firey','Pen','Match','Bomby'];
const { window: w2 } = loadMonolith(0x1234); w2.eval(SETUP_SRC);
w2.eval(`__setupCustomMatch(${JSON.stringify(names)}, 3, 2, 0);`);
for (let i = 0; i < 1500; i++) w2.eval('step()');
const st = w2.eval(`JSON.stringify(fighters.map(f=>[f.x.toFixed(2),f.y.toFixed(2),f.pct.toFixed(2),f.stocks]))`);
console.log(process.argv[2], 'rows', rest.length, h1, 'match', crypto.createHash('sha1').update(st).digest('hex'), st);
