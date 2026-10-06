import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { bootMonolith } from './helpers/smash-golden.js';

// "skins make fighters giant, and make them lose their attack animations." (the owner, 2026-10-06, with a picture of Puffball in her
// Thinking Hat drawn well past her own outline.)
//
// A skin used to bring its own box, sized against the default 2.8 x 2.3 and grown for whatever it carries, and nothing else of its fighter's
// entry: 71 of the 153 drew more than 12% bigger than the fighter wearing them, and Puffball stopped floating in hers. A skin now starts from
// its fighter's SPRITES entry and is fitted inside what that fighter's own render fills on screen, grown by its prop by 10% at most
// (cosSkinSprite, cosSkinBox). (The lost animations are the frame layer's work: test/fighter-frames, when it lands.)

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const dims = (p) => { const b = readFileSync('artifacts/V1/' + p); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };   // a PNG's size, from its header
const fit = (h, w, d) => { const ar = d.w / d.h, dh = Math.min(h, w / ar); return [dh, dh * ar]; };   // contain-fit, as drawSpriteBody does

describe('a skin is its fighter\'s size', () => {
  it('every skin is drawn within its fighter\'s own on-screen size, plus at most 10% for what it carries', () => {
    const rows = JSON.parse(W.eval(`JSON.stringify(cosOfKind('skin').map(function(c){ var sp = cosSkinSprite(c, c.fighter), b = SPRITES[c.fighter];
      return { id:c.id, src:c.src, bsrc:b.src, bH:b.imgH || 2.8, bW:b.imgW || 2.3, roomH:sp.roomH, roomW:sp.roomW, same:sp.base === b }; }))`));
    expect(rows.length, 'every skin in the catalogue').toBe(153);
    const big = [];
    for (const r of rows) {
      expect(r.same, `${r.id} starts from its fighter's own entry`).toBe(true);
      expect(r.roomH <= 1.1 && r.roomW <= 1.1, `${r.id}: room for its prop is 10% at most`).toBe(true);
      const [bh, bw] = fit(r.bH, r.bW, dims(r.bsrc.replace(/^.*?assets\//, 'assets/')));   // what the fighter's own render fills
      const [sh, sw] = fit(bh * r.roomH, bw * r.roomW, dims(r.src));                        // what the skin fills (cosSkinBox)
      if (sh > bh * 1.1 + 1e-9 || sw > bw * 1.1 + 1e-9) big.push(`${r.id}: ${(sh / bh).toFixed(2)} tall x ${(sw / bw).toFixed(2)} wide`);
    }
    expect(big, 'skins drawn more than 10% taller or wider than their fighter').toEqual([]);
  });

  it('the box drawSpriteBody fits a skin in is the base render\'s, by cosSkinBox, once the base picture is in', () => {
    const r = JSON.parse(W.eval(`(function(){ var sp = cosSkinSprite(cosItem('sk_puff_think'), 'Puffball'), b = SPRITES.Puffball;
      var before = cosSkinBox(sp, 24);
      var keep = { img: b.img, req: b._req }; b._req = true; b.img = { complete: true, naturalWidth: 200, naturalHeight: 100 };   // a wide base picture
      var after = cosSkinBox(sp, 24); b.img = keep.img; b._req = keep.req;
      return JSON.stringify({ before: before, after: after, room: [sp.roomH, sp.roomW], box: [b.imgH, b.imgW] }); })()`));
    // before the base picture decodes: its box, grown by the room
    expect(r.before.h).toBeCloseTo(r.box[0] * 24 * r.room[0], 6);
    expect(r.before.w).toBeCloseTo(r.box[1] * 24 * r.room[1], 6);
    // after: what the 2:1 picture fills of a 2.6 x 2.4 box at R 24 (width-limited: 57.6 wide, 28.8 tall), grown by the room
    expect(r.after.w).toBeCloseTo(2.4 * 24 * r.room[1], 6);
    expect(r.after.h).toBeCloseTo(2.4 * 24 / 2 * r.room[0], 6);
  });

  it('a skin keeps how its fighter is drawn: Puffball still floats, anchored and faced as in her own render, in either of hers', () => {
    const r = JSON.parse(W.eval(`JSON.stringify(['sk_puff_frozen', 'sk_puff_think'].map(function(id){ var sp = cosSkinSprite(cosItem(id), 'Puffball'), b = SPRITES.Puffball;
      return { id: id, float: sp.float, lift: sp.floatLift, amp: sp.floatAmp, anchorY: sp.anchorY, face: JSON.stringify(sp.face) === JSON.stringify(b.face), src: sp.src, skin: sp.skin }; }))`));
    for (const s of r) {
      expect(s.float, s.id).toBe(true); expect(s.lift, s.id).toBe(8); expect(s.amp, s.id).toBe(5); expect(s.anchorY, s.id).toBe(-0.08);
      expect(s.face, `${s.id}: her face sits where it does in her own render`).toBe(true);
      expect(s.src, `${s.id}: its own picture`).toMatch(/assets\/sprites\/skins\//);
      expect(s.skin).toBe(true);
    }
  });

  it('a skin never borrows its fighter\'s loaded picture or its load state', () => {
    const r = JSON.parse(W.eval(`(function(){ var b = SPRITES.Firey, keep = { img: b.img, req: b._req };
      b._req = true; b.img = { complete: true, naturalWidth: 10, naturalHeight: 10 };
      delete COS_SKIN_SPRITES.sk_firey_mech; var sp = cosSkinSprite(cosItem('sk_firey_mech'), 'Firey');
      var out = { img: sp.img === undefined, req: sp._req === undefined, src: sp.src };
      b.img = keep.img; b._req = keep.req; delete COS_SKIN_SPRITES.sk_firey_mech;
      return JSON.stringify(out); })()`));
    expect(r.img, 'no picture of the base render').toBe(true);
    expect(r.req, 'and its own load still to start').toBe(true);
    expect(r.src).toMatch(/skins\//);
  });
});
