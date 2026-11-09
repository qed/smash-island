# Stapy's two pose pictures (event kit 8 art), made from the two owner-approved downloads (read as data only).
#   stapy-win.png    File:Stapy book.png -- his BFB "book" pose, for the result screen: scaled so its stapler is as big as his render's (256 wide)
#   stapy-hurt.png   File:Stapy stapler instincts just took over.png -- the moment he snaps out of the trance: for the daze after it, and when hit
#                    and launched; his face is on the left, so the picture is drawn mirrored (POSE_SETS.Stapy flip); scaled to his render's size
# Run: <a Python with PIL> -I scripts/make-event-stapy-art.py <downloads dir> artifacts/V1/assets/sprites
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

make('Stapy_book.png', 'stapy-win.png', 256)
make('Stapy_stapler_instincts_just_took_over.png', 'stapy-hurt.png', 240)
