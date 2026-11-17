# Bottle's art (BFDIE event fighter): her render, scaled to the game's 200 px sprite height, and her event skin (a recolour of that render).
#   bottle.png                   her official render (the owner approved the download, 2026-11-17; 600x871, transparent), trimmed and scaled to 200 tall
#   skins/green-glass-bottle.png  the same picture with the glass tinted bottle green (hue and lightness only), and its 56 px thumbnail in thumbs/
# Run: <a Python with PIL> -I scripts/make-event-bottle-art.py <downloaded bottle.png> artifacts/V1/assets/sprites
import sys, os, colorsys
from PIL import Image

SRC, SPR = sys.argv[1], sys.argv[2]

def trim(im):
    bb = im.getchannel('A').point(lambda v: 255 if v >= 8 else 0).getbbox()
    return im.crop(bb) if bb else im

im = trim(Image.open(SRC).convert('RGBA'))
H = 200
W = round(im.size[0] * H / im.size[1])
out = im.convert('RGBa').resize((W, H), Image.LANCZOS).convert('RGBA')
px = out.load()
for y in range(H):
    for x in range(W):
        r, g, b, a = px[x, y]
        if 0 < a < 8: px[x, y] = (0, 0, 0, 0)   # the faint halo a resize leaves
out.save(os.path.join(SPR, 'bottle.png'), optimize=True)
print('bottle.png', out.size, os.path.getsize(os.path.join(SPR, 'bottle.png')), 'bytes')

# THE SKIN: the pale glass goes bottle green, the grey-teal rim a darker green; the black face, arms and legs stay.
sk = out.copy()
q = sk.load()
changed = 0
for y in range(H):
    for x in range(W):
        r, g, b, a = q[x, y]
        if not a: continue
        h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)
        if l > 0.6:
            nr, ng, nb = colorsys.hls_to_rgb(140/360, 0.42 + (l - 0.6)*0.9, 0.55)
        elif l > 0.22 and s > 0.08:
            nr, ng, nb = colorsys.hls_to_rgb(150/360, l*0.75, min(1, s*2.2))
        else:
            continue
        q[x, y] = (round(nr*255), round(ng*255), round(nb*255), a); changed += 1
sk.save(os.path.join(SPR, 'skins', 'green-glass-bottle.png'), optimize=True)
sc = 56/max(W, H)
th = sk.convert('RGBa').resize((max(1, round(W*sc)), max(1, round(H*sc))), Image.LANCZOS).convert('RGBA')
th.save(os.path.join(SPR, 'thumbs', 'green-glass-bottle.png'), optimize=True)
print('skin changed', changed, 'thumb', th.size)
