import { loadMonolith } from '../helpers/load-monolith.js';
const { window: w } = loadMonolith();
for (const n of ['Leafy','Basketball','Knife','Cheesy','Soap','Gaty','Sidewalky','Paintbrush','Trophy','Blueberry']) console.log(n, w.eval(`JSON.stringify(statsFor(${JSON.stringify(n)}))`), w.eval(`SMASH_DMG_MULT`));
console.log(w.eval(`JSON.stringify(Object.keys(MOVE_TEXT).filter(k=>/Knife|Basketball|Sidewalky|Soap/.test(k)))`));
