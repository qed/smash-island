# SUPERSEDED (2026-11-25): do not run this script; it is kept as the record of how the first event art was made (2026-11-17).
# The event skins are now the show's own looks from the BFDI wiki (docs/LEDGER.md 2026-11-19; scripts/sprite-manifest-skins.json).
# This script re-makes hot-dog.png and then STOPS before its old recolour skin (that part never runs).
# So nothing current is rewritten by accident, it now refuses to write anything unless it is given --force-old-art.
# Hot Dog's render (BFDIE event fighter art), made from the official BFDIE render (read as data only).
#   hot-dog.png   the BFDIE render (2245 x 1158, transparent), on his two little black stick legs: trimmed and scaled to 200 px tall, the other renders'
#                 size (388 x 200). He has NO arms and he HAS legs (the owner, 2026-11-17: "hot dog doesnt have arms"; an earlier build cut his legs off
#                 by mistake). It also prints his LIMB_RIG leg rows (scripts/helpers/trace_legs.py) and where his bun ends (BODY_FRAC: the bun's share
#                 of the picture's height), which the game's rows for him copy (LIMB_RIG["Hot Dog"], HD_LEGS in index.html).
# Run: <a Python with PIL> -I scripts/make-event-hotdog-art.py <path to the render> artifacts/V1/assets/sprites
import sys, os
if '--force-old-art' not in sys.argv:
    sys.stderr.write('REFUSED: this script is superseded (see the note at the top) and would overwrite the current event art. Nothing was written. Pass --force-old-art to run it anyway.' + chr(10))
    sys.exit(2)
sys.argv = [a for a in sys.argv if a != '--force-old-art']
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'helpers'))
from trace_legs import leg_mask, leg_rows, js_row

SRC, SPR = sys.argv[1], sys.argv[2]
CUT = 916   # the first row under the bun's lowest edge: only the legs are under it (above it, down from row 900, narrow runs, under 40 px, are leg)

def bbox(im):
    return im.getchannel('A').point(lambda v: 255 if v >= 8 else 0).getbbox()

src = Image.open(SRC).convert('RGBA')
box = bbox(src)
legs = leg_mask(src, CUT, 40)
body = src.copy(); body.paste((0, 0, 0, 0), (0, 0) + src.size, legs)
bb_body = bbox(body)
k = 200 / (box[3] - box[1])
w, h = round((box[2] - box[0])*k), round((box[3] - box[1])*k)
out = src.crop(box).convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
px = out.load()
for y in range(out.size[1]):
    for x in range(out.size[0]):
        r, g, b, a = px[x, y]
        if 0 < a < 8: px[x, y] = (0, 0, 0, 0)   # the faint halo a resize leaves
out.save(os.path.join(SPR, 'hot-dog.png'), optimize=True)
print('hot-dog.png', out.size, os.path.getsize(os.path.join(SPR, 'hot-dog.png')), 'bytes')
print('BODY_FRAC', round((bb_body[3] - box[1])/(box[3] - box[1]), 4), '(the bun ends this far down the picture; the legs are under it)')
print('LIMB_RIG["Hot Dog"] = { W:%d, H:%d, arms:[], legs:%s };' % (w, h, js_row(leg_rows(legs, box, (w, h)))))

# STOP BEFORE THE SKIN (2026-11-19): the event skins are now the show's own looks from the BFDI wiki (LEDGER 'EVENT FIGHTER SKINS ARE WIKI
# LOOKS, NOT RECOLOURS'; files listed in scripts/sprite-manifest-skins.json). The recolour below is the OLD skin: running it would bring the
# recolour back beside the wiki skin. The render above is still made; the skin part is kept only as a record and never runs.
sys.stderr.write("STOPPED before the event skin: the event skins are now the show's own looks from the BFDI wiki (see docs/LEDGER.md, 2026-11-19)." + chr(10) + "This script's old recolour skin would bring the recolour back beside them, so it does not run. The render above was written." + chr(10))
sys.exit(3)
# His event skin, TOASTED HOT DOG: the render above, darker and a little warmer (hue and lightness only, as the other event fighters' skins), and its
# thumbnail (56 px wide) for the Wardrobe.
import colorsys
sk = out.copy(); px = sk.load()
for y in range(sk.size[1]):
    for x in range(sk.size[0]):
        r, g, b, a = px[x, y]
        if not a: continue
        h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)
        h = (h - 0.015) % 1.0; l = l*0.74; s = min(1.0, s*1.12)
        rr, gg, bb = colorsys.hls_to_rgb(h, l, s)
        px[x, y] = (round(rr*255), round(gg*255), round(bb*255), a)
SKN = os.path.join(SPR, 'skins', 'toasted-hot-dog.png'); sk.save(SKN, optimize=True)
th = sk.convert('RGBa').resize((56, round(56*sk.size[1]/sk.size[0])), Image.LANCZOS).convert('RGBA')
THM = os.path.join(SPR, 'thumbs', 'toasted-hot-dog.png'); th.save(THM, optimize=True)
print('toasted-hot-dog.png', sk.size, os.path.getsize(SKN), 'bytes; thumb', th.size)
