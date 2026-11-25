// The wiki's move data, read from the RUNNING game (dev only: needs jsdom, a devDependency).
//
//   node scripts/dump-wiki-moves.mjs        -> writes scripts/wiki-moves.json
//
// Why: the fighter pages (scripts/gen-seo-pages.mjs) show every move in full with its frame data. The game does not keep those as
// literal tables: at boot it rescales MOVE_TEXT by each fighter's damage stat, rewrites the tilts, builds the movesets' lines
// (msWords), writes the smash, up/down smash, shield and Final Smash lines from code, and adds frame-data rows after the
// FB_FRAME_DATA literal (Object.assign and single rows further down). Reading the literals would print old numbers, so this
// boots the real game once (scripts/helpers/load-monolith.js) and asks it for exactly what its own Moves list uses:
// moveRowsFor(r) for the words, MV_SLOT + FB_FRAME_DATA (frameData's table) for the frames, ZS / RF for the shield, statsFor for
// the speeds. Nothing is measured or computed here; numbers the game does not have stay absent. COUNTED FROM THE PRESS (2026-11-25): each row
// also carries the game's own from-the-press startup (frameDataPress: FB_FRAME_DATA + FB_PRESS_ADD), its act frames for a move that never
// connects (actDataPress), and for the aimed rows the aimed press's startup; the shield's up-frames are ZS_PRESS / RF_PRESS.
//
// Only PUBLIC fighters are dumped (a ROSTER row with play:true, not event, not prize), the same rule as the pages. The file carries
// the sha256 of artifacts/V1/index.html it was read from; gen-seo-pages refuses (or re-runs this) when the game has changed since.

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);   // load-monolith reads artifacts/V1/index.html from the current folder
const { loadMonolith } = await import('./helpers/load-monolith.js');

const sha = createHash('sha256').update(readFileSync(join(ROOT, 'artifacts', 'V1', 'index.html'), 'utf8').replace(/\r\n?/g, '\n')).digest('hex');   // (line endings ignored, as gen-seo-pages hashes it)
const { window: w } = loadMonolith();
const json = w.eval(`JSON.stringify((function(){
  const out = {};
  for(const r of ROSTER){
    if(!r.play || r.event || r.prize || !MOVE_TEXT[r.name]) continue;
    const kit = r.kit && r.kit.special, st = statsFor(r.name, r.w);
    const rows = moveRowsFor(r).map(function(x){
      const slot = MV_SLOT[x[0]] || null, fd = (slot && kit) ? (FB_FRAME_DATA[kit + '.' + slot] || null) : null;
      const aim = /^The neutral (attack|special), aimed that way/.test(x[1]) ? (x[0].indexOf('X') >= 0 ? 'jab' : 'neutral') : null;
      const fp = slot && kit ? frameDataPress(kit, slot) : null, ap = aim && kit ? frameDataPress(kit, aim, true) : null;
      return { key:x[0], text:x[1], slot:slot, frames:fd ? fd.slice(0, 4) : null, pressStartup:fp ? fp.startup : null,
        act:slot && kit ? (actDataPress(kit, slot) || null) : null, aimStartup:ap ? ap.startup : null, aimAct:aim && kit ? (actDataPress(kit, aim, true) || null) : null,
        pummel:x[0] === 'X, holding' && kit ? pummelData(kit) : null };
    });
    const refl = isReflector(r);
    out[r.name] = { kit:kit, rows:rows,
      z: refl ? { kind:'reflector', start:RF_PRESS, active:RF.active, endLag:RF.endLag, cd:RF.cd } : { kind:'shield', start:ZS_PRESS, endLag:ZS.endLag },
      stats: { run:st.run, air:st.air, jump:st.jump, fall:st.fall, dmg:st.dmg } };
  }
  return out;
})())`);
const fighters = JSON.parse(json);
const file = join(ROOT, 'scripts', 'wiki-moves.json');
writeFileSync(file, JSON.stringify({ note: 'written by scripts/dump-wiki-moves.mjs from the running game; do not edit by hand', gameSha256: sha, fighters }, null, 1) + '\n', 'utf8');
console.log(`dump-wiki-moves: ${Object.keys(fighters).length} public fighters -> scripts/wiki-moves.json (game ${sha.slice(0, 12)})`);
