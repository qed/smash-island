# SUPERSEDED (2026-11-25): do not run this script; it is kept as the record of how the first event art was made (2026-11-17).
# The event skins are now the show's own looks from the BFDI wiki (docs/LEDGER.md 2026-11-19; scripts/sprite-manifest-skins.json).
# This script re-makes needy.png and then STOPS before its old recolour skin (that part never runs).
# So nothing current is rewritten by accident, it now refuses to write anything unless it is given --force-old-art.
# Needy's render and her event skin (BFDIE event kit art), made from the one owner-approved picture (read as data only).
#   needy.png               File:NeedyPoseIntro.png -- her BFDIE intro pose (2438 x 1166): a syringe lying on its side, plunger left, needle right,
#                           on her two thin black stick legs. She has NO arms and she HAS legs (the owner, 2026-11-17: "why does needy not have legs?";
#                           an earlier build cut the legs off by mistake). The whole picture, trimmed, at the scale the old legless one had (her barrel
#                           160 px tall, 462 px across), so the picture is 462 px across and taller by the legs.
#   skins/red-eye-needy.png the same render with its hue turned from pink to red and a little darker: the event skin (a recolour, nothing new downloaded)
#   thumbs/red-eye-needy.png 56 px wide, for the skin card
# It also prints her LIMB_RIG leg rows (scripts/helpers/trace_legs.py) and where her body ends (BODY_FRAC: the barrel's share of the picture's height),
# which the game's rows for her copy (LIMB_RIG['Needy'], NDY_LEGS in index.html).
# Run: <a Python with PIL> -I scripts/make-event-needy-art.py <downloads dir> artifacts/V1/assets/sprites
import sys, os, colorsys
if '--force-old-art' not in sys.argv:
    sys.stderr.write('REFUSED: this script is superseded (see the note at the top) and would overwrite the current event art. Nothing was written. Pass --force-old-art to run it anyway.' + chr(10))
    sys.exit(2)
sys.argv = [a for a in sys.argv if a != '--force-old-art']
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'helpers'))
from trace_legs import leg_mask, leg_rows, js_row

DL, SPR = sys.argv[1], sys.argv[2]
CUT = 850   # the first row under the barrel's bottom edge: only the legs are under it
            # (from row 826 down to it the tops of the legs sit beside the barrel's slanted bottom edge: there, narrow runs, under 60 px, are leg)

def bbox(im):
    return im.getchannel('A').point(lambda v: 255 if v >= 8 else 0).getbbox()

def clean(out):
    px = out.load()
    for y in range(out.size[1]):
        for x in range(out.size[0]):
            r, g, b, a = px[x, y]
            if 0 < a < 8: px[x, y] = (0, 0, 0, 0)   # the faint halo a resize leaves
    return out

src = Image.open(os.path.join(DL, 'NeedyPoseIntro.png')).convert('RGBA')
# her barrel alone (the legs taken away, as the legless build did) sets the scale: 160 px tall, as before
legs = leg_mask(src, CUT, 60)
body = src.copy(); body.paste((0, 0, 0, 0), (0, 0) + src.size, legs)
bb_body = bbox(body)
k = 160 / (bb_body[3] - bb_body[1])
box = bbox(src)
w, h = round((box[2] - box[0])*k), round((box[3] - box[1])*k)
out = clean(src.crop(box).convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA'))
out.save(os.path.join(SPR, 'needy.png'), optimize=True)
print('needy.png', out.size, os.path.getsize(os.path.join(SPR, 'needy.png')), 'bytes')
print('BODY_FRAC', round((bb_body[3] - box[1])/(box[3] - box[1]), 4), '(the barrel ends this far down the picture; the legs are under it)')
print("LIMB_RIG['Needy'] = { W:%d, H:%d, arms:[], legs:%s };" % (w, h, js_row(leg_rows(legs, box, (w, h)))))

# STOP BEFORE THE SKIN (2026-11-19): the event skins are now the show's own looks from the BFDI wiki (LEDGER 'EVENT FIGHTER SKINS ARE WIKI
# LOOKS, NOT RECOLOURS'; files listed in scripts/sprite-manifest-skins.json). The recolour below is the OLD skin: running it would bring the
# recolour back beside the wiki skin. The render above is still made; the skin part is kept only as a record and never runs.
sys.stderr.write("STOPPED before the event skin: the event skins are now the show's own looks from the BFDI wiki (see docs/LEDGER.md, 2026-11-19)." + chr(10) + "This script's old recolour skin would bring the recolour back beside them, so it does not run. The render above was written." + chr(10))
sys.exit(3)
# THE SKIN: pink (hue ~0.85-0.95) turned to red, every colour a little darker; greys stay grey (their saturation is low), and so do her black legs.
sk = out.copy(); px = sk.load()
for y in range(sk.size[1]):
    for x in range(sk.size[0]):
        r, g, b, a = px[x, y]
        if a == 0: continue
        hh, ll, ss = colorsys.rgb_to_hls(r/255, g/255, b/255)
        if ss > 0.25 and (hh > 0.75 or hh < 0.05): hh = 0.985
        ll *= 0.88
        rr, gg, bb = colorsys.hls_to_rgb(hh, ll, ss)
        px[x, y] = (round(rr*255), round(gg*255), round(bb*255), a)
sk.save(os.path.join(SPR, 'skins', 'red-eye-needy.png'), optimize=True)
th = sk.resize((56, round(sk.size[1]*56/sk.size[0])), Image.LANCZOS)
th.save(os.path.join(SPR, 'thumbs', 'red-eye-needy.png'), optimize=True)
print('skins/red-eye-needy.png', sk.size, '| thumbs/red-eye-needy.png', th.size)
