# Art 9 (2026-11-19): the show's pictures for three things the Purple Dragon's WIND LOTTERY! throws (Category One).
# Same processing as scripts/make-real-assists-art.py: trim to the drawing, scale (here 200 px on the long side),
# erase the faint halo, reduce to a 256-colour palette. The Wireless Recovery Center render is from TPOT 19, where its
# screen shows a sad face ":-(" -- the face is painted over with the screen's own dark colour (the keys, the GO button and
# its lettering are left as the show has them).
# usage: make-art9-props.py <dlroot> <outdir>     (<dlroot>/<key>/img.png for key in wrc, mkey, saw2)
import sys, os
import numpy as np
from PIL import Image
root, out = sys.argv[1], sys.argv[2]
JOBS = [('wrc', 'dragonrc'), ('mkey', 'dragonkey'), ('saw2', 'dragonsaw')]
for k, name in JOBS:
    im = Image.open(os.path.join(root, k, 'img.png')).convert('RGBA')
    arr = np.array(im)
    if k == 'wrc':
        # the face on the screen: green strokes inside this box (source pixels); the screen's dark grey under them
        x0, y0, x1, y1 = 755 + 130, 439 + 70, 755 + 270, 439 + 165
        box = arr[y0:y1, x0:x1]
        r, g, b = box[..., 0].astype(int), box[..., 1].astype(int), box[..., 2].astype(int)
        green = (g > r + 25) & (g > b + 25)
        dark = np.median(arr[439 + 175:439 + 185, 755 + 60:755 + 120, :3].reshape(-1, 3), axis=0).astype(np.uint8)
        grow = green.copy()   # one pixel more round each stroke, for its soft edge
        grow[1:] |= green[:-1]; grow[:-1] |= green[1:]; grow[:, 1:] |= green[:, :-1]; grow[:, :-1] |= green[:, 1:]
        box[grow, :3] = dark
        print('wrc face pixels painted', int(grow.sum()), 'with', dark)
        im = Image.fromarray(arr)
    a = np.array(im)[..., 3]
    ys, xs = np.nonzero(a > 16)
    im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    L = 200
    if im.width >= im.height: w, h = L, round(im.height * L / im.width)
    else: h, w = L, round(im.width * L / im.height)
    im = im.resize((w, h), Image.LANCZOS)
    arr = np.array(im); arr[..., 3][arr[..., 3] < 10] = 0; arr[arr[..., 3] == 0, :3] = 0
    im = Image.fromarray(arr)
    p = os.path.join(out, name + '.png')
    im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(p, optimize=True)
    print(name, im.size, os.path.getsize(p), 'bytes')
