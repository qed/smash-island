# Needy's render and her event skin (BFDIE event kit art), made from the one owner-approved picture (read as data only).
#   needy.png               File:NeedyPoseIntro.png -- her BFDIE intro pose (2438 x 1166): a syringe lying on its side, plunger left, needle right.
#                           The picture has two thin stick legs under the barrel; the approved design (2026-11-17, "CHANGED: limbless") has her with NO
#                           arms and NO legs, so the legs are left out: the picture is cut under the barrel's lowest edge (row 850 of the original), and from
#                           row 826 down every narrow run of opaque pixels (under 60 px: the two legs) is cleared, while the barrel's own slanted edge stays.
#                           Trimmed and scaled to 160 px tall.
#   skins/red-eye-needy.png the same render with its hue turned from pink to red and a little darker: the event skin (a recolour, nothing new downloaded)
#   thumbs/red-eye-needy.png 56 px wide, for the skin card
# Run: <a Python with PIL> -I scripts/make-event-needy-art.py <downloads dir> artifacts/V1/assets/sprites
import sys, os, colorsys
from PIL import Image

DL, SPR = sys.argv[1], sys.argv[2]
CUT = 850   # the first row under the barrel's bottom edge: the legs start here

def trim(im):
    bb = im.getchannel('A').point(lambda v: 255 if v >= 8 else 0).getbbox()
    return im.crop(bb) if bb else im

def clean(out):
    px = out.load()
    for y in range(out.size[1]):
        for x in range(out.size[0]):
            r, g, b, a = px[x, y]
            if 0 < a < 8: px[x, y] = (0, 0, 0, 0)   # the faint halo a resize leaves
    return out

src = Image.open(os.path.join(DL, 'NeedyPoseIntro.png')).convert('RGBA')
sp = src.load()
for y in range(826, CUT):   # the tops of the legs, between the barrel's slanted bottom edge and the cut
    x = 0
    while x < src.size[0]:
        if sp[x, y][3] < 8: x += 1; continue
        e = x
        while e < src.size[0] and sp[e, y][3] >= 8: e += 1
        if e - x < 60:
            for k in range(x, e): sp[k, y] = (0, 0, 0, 0)
        x = e
body = trim(src.crop((0, 0, src.size[0], CUT)))
h = 160
w = round(body.size[0] * h / body.size[1])
out = clean(body.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA'))
out.save(os.path.join(SPR, 'needy.png'), optimize=True)
print('needy.png', out.size, os.path.getsize(os.path.join(SPR, 'needy.png')), 'bytes')

# THE SKIN: pink (hue ~0.85-0.95) turned to red, every colour a little darker; greys stay grey (their saturation is low).
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
