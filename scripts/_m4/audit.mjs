import { loadMonolith } from '../helpers/load-monolith.js';
const { window: w } = loadMonolith();
const out = w.eval(`JSON.stringify(ROSTER.map(r=>({n:r.name,k:r.kit&&r.kit.special,hid:!!(r.hidden||r.secret),play:!!r.play,up:UPSPEC[r.kit&&r.kit.special]||null,sm:SMASH_SPEC[r.kit&&r.kit.special]||null,mt:MOVE_TEXT[r.name]||null})))`);
import fs from 'node:fs';
fs.writeFileSync(process.argv[2], out);
console.log(JSON.parse(out).length);
