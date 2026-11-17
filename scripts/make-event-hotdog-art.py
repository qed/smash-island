# Hot Dog's render (BFDIE event fighter art), made from the official BFDIE render (read as data only).
#   hot-dog.png   the BFDIE render (2245 x 1158, transparent): its two little stick legs cut off (the approved design is limbless:
#                 no arms, no legs, he rocks and hops on the bottom of his bun), trimmed, and scaled at the other event renders' size
#                 (the render with legs would be 200 px tall; the bun alone comes out about 388 x 158)
# Run: <a Python with PIL> -I scripts/make-event-hotdog-art.py <path to the render> artifacts/V1/assets/sprites
import sys, os
from PIL import Image

SRC, SPR = sys.argv[1], sys.argv[2]

def trim(im):
    bb = im.getchannel('A').point(lambda v: 255 if v >= 8 else 0).getbbox()
    return im.crop(bb) if bb else im

im = trim(Image.open(SRC).convert('RGBA'))
k = 200 / im.size[1]   # the scale the whole render (with legs) would have at 200 px tall
# THE LEGS: below the bun every row holds only thin runs (two legs, two feet). Scan up from the bottom while every opaque run in the
# row is narrower than 8% of the width, and clear those rows.
W, H = im.size
A = im.getchannel('A').load()
def leg_row(y):
    run = 0
    for x in range(W):
        if A[x, y] >= 60:
            run += 1
            if run > W * 0.08: return False
        else: run = 0
    return True
y = H - 1
while y > H // 2 and leg_row(y): y -= 1
cut = y + 1
im.paste((0, 0, 0, 0), (0, cut, W, H))
print('legs cleared from row', cut, 'of', H)
im = trim(im)
w = round(im.size[0] * k)
h = round(im.size[1] * k)
out = im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
px = out.load()
for y in range(out.size[1]):
    for x in range(out.size[0]):
        r, g, b, a = px[x, y]
        if 0 < a < 8: px[x, y] = (0, 0, 0, 0)   # the faint halo a resize leaves
out.save(os.path.join(SPR, 'hot-dog.png'), optimize=True)
print('hot-dog.png', out.size, os.path.getsize(os.path.join(SPR, 'hot-dog.png')), 'bytes')

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
