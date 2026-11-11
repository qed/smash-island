import { loadMonolith } from '../helpers/load-monolith.js';
const { window: w } = loadMonolith();
console.log(w.eval(`JSON.stringify(Object.keys(ROSTER[0]))`));
console.log(w.eval(`ROSTER.filter(r=>/^(Ruby|Firey Jr\.|Bell|TV|Ruler|Gelatin|Loser|Fern|Coiny|Fanny|Barf Bag|Marker|Ice Cube|Pillow|Pencil|Cake|Taco \(II\))$/.test(r.name)).map(r=>r.name+':'+(r.group||r.cast||r.set||'')+':'+(r.hidden?'H':'')+(r.secret?'S':'')+(r.play===false?'noplay':'')).join(' | ')`));
