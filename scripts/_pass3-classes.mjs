import { loadMonolith } from '../test/helpers/load-monolith.js';
const { window: w } = loadMonolith(1);
const out = w.eval(`(function(){
  const rows = ROSTER.filter(r=>r.play).map(r=>{
    const sp=r.kit&&r.kit.special;
    let c = AI_CLASS[r.arch] || "brawl";
    if(["fly","beam","gust"].includes(sp)) c="zone";
    if(["paste","salsa","sucker","static"].includes(sp) && c==="brawl") c="trap";
    if(["morse","shatter","timber"].includes(sp)) c="zone";
    if(sp==="glaze") c="rush";
    if(sp==="pricetag") c="zone";
    const P = RANGE_PROFILE[sp]||{};
    return {name:r.name, sp, arch:r.arch, cls:c, w:r.w, reach:P.reach, dmg:P.dmg, kb:P.kb,
            hasSmash:!!SMASHES[sp], hasAtkSp:!!ATKSPECIALS[sp], hasUp:!!UPSPECIALS[sp], hasDown:!!DOWNSPECIALS[sp]};
  });
  return JSON.stringify(rows);
})()`);
const rows = JSON.parse(out);
const byCls = {};
for (const r of rows) (byCls[r.cls] ||= []).push(r.name);
console.log('=== AI CLASS DISTRIBUTION (only heavy+brawl ever charge a smash) ===');
for (const [c, names] of Object.entries(byCls).sort((a, b) => b[1].length - a[1].length)) {
  const can = (c === 'heavy' || c === 'brawl') ? 'CAN smash   ' : 'NEVER smashes';
  console.log(`${c.padEnd(8)} ${String(names.length).padStart(2)}  [${can}]  ${names.join(', ')}`);
}
console.log('\n=== NO ATKSPECIALS finisher entry (falls back to generic 14dmg/12kb) ===');
console.log(rows.filter(r => !r.hasAtkSp).map(r => r.name).join(', '));
console.log('\n=== basic-attack reach leaderboard ===');
rows.slice().sort((a, b) => b.reach - a.reach).slice(0, 12)
  .forEach(r => console.log(`  ${r.name.padEnd(14)} reach ${String(r.reach).padStart(3)} dmg ${String(r.dmg).padStart(2)} kb ${String(r.kb).padStart(2)}  w${r.w}  (${r.cls})`));
for (let i = 0; i < 3; i++) await new Promise(r => setTimeout(r, 0));
w.close();
