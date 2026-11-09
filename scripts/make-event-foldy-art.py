# Foldy's render (event kit 9 art), made from the one owner-approved download (read as data only).
#   foldy.png   File:Tpot renders0034.png -- her TPOT render (700 x 543): trimmed and scaled to 200 px tall (the size of the other event renders)
# Run: <a Python with PIL> -I scripts/make-event-foldy-art.py <downloads dir> artifacts/V1/assets/sprites
import sys, os
from PIL import Image

DL, SPR = sys.argv[1], sys.argv[2]

def trim(im):
    bb = im.getchannel('A').point(lambda v: 255 if v >= 8 else 0).getbbox()
    return im.crop(bb) if bb else im

im = trim(Image.open(os.path.join(DL, 'Tpot_renders0034.png')).convert('RGBA'))
h = 200
w = round(im.size[0] * h / im.size[1])
out = im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
px = out.load()
for y in range(out.size[1]):
    for x in range(out.size[0]):
        r, g, b, a = px[x, y]
        if 0 < a < 8: px[x, y] = (0, 0, 0, 0)   # the faint halo a resize leaves
out.save(os.path.join(SPR, 'foldy.png'), optimize=True)
print('foldy.png', out.size, os.path.getsize(os.path.join(SPR, 'foldy.png')), 'bytes')
