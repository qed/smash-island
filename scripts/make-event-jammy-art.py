# SUPERSEDED (2026-11-25): do not run this script; it is kept as the record of how the first event art was made (2026-11-17).
# The event skins are now the show's own looks from the BFDI wiki (docs/LEDGER.md 2026-11-19; scripts/sprite-manifest-skins.json).
# This script re-makes jammy.png and jammy-nolid.png and then STOPS before its old recolour skin (that part never runs).
# So nothing current is rewritten by accident, it now refuses to write anything unless it is given --force-old-art.
# Jammy's art (event fighter, BFDIE; EVENT KIT: JAMMY), made from the one render the lead downloaded and checked (read as data only).
#   jammy.png           her BFDIE render (1192 x 1072): trimmed and scaled to 200 px tall (the size of the other event renders)
#   jammy-nolid.png     the same picture with the gingham lid taken off and the jar's open rim drawn (LID OFF; POSE_SETS.Jammy)
#   skins/grape-jammy.png and thumbs/grape-jammy.png   her event skin: the jam and the label turned grape purple (hue only)
# Run: <a Python with PIL> -I scripts/make-event-jammy-art.py <jammy.png> artifacts/V1/assets/sprites
import sys, os, colorsys
if '--force-old-art' not in sys.argv:
    sys.stderr.write('REFUSED: this script is superseded (see the note at the top) and would overwrite the current event art. Nothing was written. Pass --force-old-art to run it anyway.' + chr(10))
    sys.exit(2)
sys.argv = [a for a in sys.argv if a != '--force-old-art']
from PIL import Image, ImageDraw

SRC, SPR = sys.argv[1], sys.argv[2]

def trim(im):
    bb = im.getchannel('A').point(lambda v: 255 if v >= 8 else 0).getbbox()
    return im.crop(bb) if bb else im

def scale(im, h=200):
    w = round(im.size[0] * h / im.size[1])
    out = im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
    px = out.load()
    for y in range(out.size[1]):
        for x in range(out.size[0]):
            if 0 < px[x, y][3] < 8: px[x, y] = (0, 0, 0, 0)   # the faint halo a resize leaves
    return out

full = trim(Image.open(SRC).convert('RGBA'))
W0, H0 = full.size

# LID OFF: everything above the lid's lower edge goes (the lid is the top band, tilted a little: lower at the left), then a rim line on the open neck
nolid = full.copy()
px = nolid.load()
yl, yr = 160, 140   # the lid's bottom edge at the left and right of the picture (in the trimmed full-size picture)
for x in range(W0):
    cut = yl + (yr - yl) * x / (W0 - 1)
    for y in range(0, int(cut)):
        px[x, y] = (0, 0, 0, 0)
d = ImageDraw.Draw(nolid)
rim = (90, 128, 130, 255)   # the jar's own outline teal
d.line([(132, 168), (1040, 152)], fill=rim, width=11)
d.ellipse([(118, 158), (146, 180)], fill=rim)
d.ellipse([(1028, 142), (1054, 164)], fill=rim)

# GRAPE: the orange jam and label turned purple (hue only; saturation and lightness kept), the gingham lid left red
def grape(im):
    g = im.copy(); q = g.load()
    for y in range(g.size[1]):
        for x in range(g.size[0]):
            r, gg, b, a = q[x, y]
            if a == 0: continue
            h, l, s = colorsys.rgb_to_hls(r / 255, gg / 255, b / 255)
            if 0.04 <= h <= 0.15 and s > 0.35:
                h = (h + 0.68) % 1.0
                R, G, B = colorsys.hls_to_rgb(h, l * 0.78, s * 0.85)
                q[x, y] = (round(R * 255), round(G * 255), round(B * 255), a)
    return g

base = scale(full)
base.save(os.path.join(SPR, 'jammy.png'), optimize=True)
scale(nolid).save(os.path.join(SPR, 'jammy-nolid.png'), optimize=True)
# STOP BEFORE THE SKIN (2026-11-19): the event skins are now the show's own looks from the BFDI wiki (LEDGER 'EVENT FIGHTER SKINS ARE WIKI
# LOOKS, NOT RECOLOURS'; files listed in scripts/sprite-manifest-skins.json). The recolour below is the OLD skin: running it would bring the
# recolour back beside the wiki skin. The render above is still made; the skin part is kept only as a record and never runs.
sys.stderr.write("STOPPED before the event skin: the event skins are now the show's own looks from the BFDI wiki (see docs/LEDGER.md, 2026-11-19)." + chr(10) + "This script's old recolour skin would bring the recolour back beside them, so it does not run. The render above was written." + chr(10))
sys.exit(3)
gr = grape(base)
gr.save(os.path.join(SPR, 'skins', 'grape-jammy.png'), optimize=True)
tw = 56; th = round(gr.size[1] * tw / gr.size[0])
gr.convert('RGBa').resize((tw, th), Image.LANCZOS).convert('RGBA').save(os.path.join(SPR, 'thumbs', 'grape-jammy.png'), optimize=True)
for n in ['jammy.png', 'jammy-nolid.png', os.path.join('skins', 'grape-jammy.png'), os.path.join('thumbs', 'grape-jammy.png')]:
    im = Image.open(os.path.join(SPR, n)); print(n, im.size, os.path.getsize(os.path.join(SPR, n)), 'bytes')
