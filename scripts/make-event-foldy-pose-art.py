# Foldy's three pose pictures (FOLDY ART, 2026-11-06), made from the three owner-approved downloads (read as data only).
#   foldy-plane.png   File:Weirdfoldy.png  -- her BFB 12 "partly folded" pose, for the dart of Fold and Fly (2248 x 1096; trimmed, 256 wide)
#   foldy-hurt.png    File:FLD1.png        -- her BFB 12 KO picture, unfolded, for being hit and launched (878 x 705; trimmed, 256 wide)
#   foldy-soggy.png   File:Vomitfoldy.png  -- her TPOT 1 picture covered in Rocky's barf, for while she is soaked (538 x 360; trimmed, 256 wide)
# Run: <a Python with PIL> -I scripts/make-event-foldy-pose-art.py <downloads dir> artifacts/V1/assets/sprites
import sys, os
from PIL import Image

DL, SPR = sys.argv[1], sys.argv[2]

def trim(im):
    bb = im.getchannel('A').point(lambda v: 255 if v >= 8 else 0).getbbox()
    return im.crop(bb) if bb else im

def make(src, dst, width):
    im = trim(Image.open(os.path.join(DL, src)).convert('RGBA'))
    h = round(im.size[1] * width / im.size[0])
    out = im.convert('RGBa').resize((width, h), Image.LANCZOS).convert('RGBA')
    px = out.load()
    for y in range(out.size[1]):
        for x in range(out.size[0]):
            r, g, b, a = px[x, y]
            if 0 < a < 8: px[x, y] = (0, 0, 0, 0)   # the faint halo a resize leaves
    out.save(os.path.join(SPR, dst), optimize=True)
    print(dst, out.size, os.path.getsize(os.path.join(SPR, dst)), 'bytes')

make('Weirdfoldy.png', 'foldy-plane.png', 256)
make('FLD1.png', 'foldy-hurt.png', 256)
make('Vomitfoldy.png', 'foldy-soggy.png', 256)
