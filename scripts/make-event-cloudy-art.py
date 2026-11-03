# Cloudy's pose pictures (event kit 6), made from the two owner-approved downloads (read as data only) and his own render.
#   cloudy-thunder.png  File:CloudyTransThunder.png -- the cloud only (the white lightning strokes under him are left out: the bolt is
#                       drawn in code in their style), sized to his render's width (his body is the same cloud)
#   cloudy-puffed.png   File:Cloudy puffed up by jawbreaker.png -- swollen: its fill area 1.35x his render's, shrunk to 200 px tall (k)
#   cloudy-rain.png     his render (cloudy.png) tinted rain-grey, his smile turned down (Rain Cloud: "his face falls and he turns grey")
# The two downloads are files 20 and 21 of the owner-approved event art list (downloaded once from their BFDI wiki file pages; read here as
# data only). Run: <a Python with PIL> -I scripts/make-event-cloudy-art.py <downloads dir> artifacts/V1/assets/sprites <out json>
import sys, os, json
from PIL import Image

DL, SPR, OUTJ = sys.argv[1], sys.argv[2], sys.argv[3]
base = Image.open(os.path.join(SPR, 'cloudy.png')).convert('RGBA')
BW, BH = base.size

def fill_area(im):
    a = im.getchannel('A').load(); w, h = im.size
    return sum(1 for y in range(h) for x in range(w) if a[x, y] >= 128)

def trim(im):
    bb = im.getchannel('A').point(lambda v: 255 if v >= 8 else 0).getbbox()
    return im.crop(bb) if bb else im

def resize(im, w, h):
    return im.convert('RGBa').resize((max(1, round(w)), max(1, round(h))), Image.LANCZOS).convert('RGBA')

def clean(im):
    # the faint halo a resize leaves: alpha under 8 to nothing
    px = im.load(); w, h = im.size; n = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if 0 < a < 8: px[x, y] = (0, 0, 0, 0); n += 1
    return n

def facing(im):
    # which way the art faces: the dark ink's centre against the silhouette's (the fetch scripts' rule of thumb)
    px = im.load(); w, h = im.size; sx = n = 0; ax = an = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 128: continue
            ax += x; an += 1
            if r + g + b < 150: sx += x; n += 1
    if not n or not an: return 0.0
    return round((sx / n - ax / an) / w, 3)

rows = {}
base_area = fill_area(base)

# ---- THUNDER ----
src = Image.open(os.path.join(DL, '20-cloudy-cloudytransthunder.png')).convert('RGBA')
W, H = src.size
px = src.load()
# the lightning strokes are pure white, with no outline; below the mouth (y > 615) every pure-white pixel is a stroke
for y in range(615, H):
    for x in range(W):
        r, g, b, a = px[x, y]
        if a and r > 238 and g > 238 and b > 238: px[x, y] = (0, 0, 0, 0)
cloud = trim(src)
cw, ch = cloud.size
k = BW / cw
th = resize(cloud, cw * k, ch * k)
kk = 1.0
if th.size[1] > 200:
    kk = 200 / th.size[1]; th = resize(cloud, cw * k * kk, ch * k * kk)
halo = clean(th); th = trim(th)
th.save(os.path.join(SPR, 'cloudy-thunder.png'))
rows['thunder'] = dict(w=th.size[0], h=th.size[1], k=round(kk, 4), facing=facing(th), halo=halo, src_px=[cw, ch])

# ---- PUFFED ----
src = Image.open(os.path.join(DL, '21-cloudy-cloudy-puffed-up-by-jawbreaker.png')).convert('RGBA')
pf = trim(src)
pw, ph = pf.size
s = ((base_area * 1.35) / fill_area(pf)) ** 0.5
kk = 1.0
if ph * s > 200: kk = 200 / (ph * s)
pu = resize(pf, pw * s * kk, ph * s * kk)
halo = clean(pu); pu = trim(pu)
pu.save(os.path.join(SPR, 'cloudy-puffed.png'))
rows['puffed'] = dict(w=pu.size[0], h=pu.size[1], k=round(kk, 4), facing=0.0, halo=halo, src_px=[pw, ph], area_k=1.35)

# ---- RAIN (a tint of the render, the smile turned down) ----
rn = base.copy(); p = rn.load()
# the mouth's box (FR_FACE 'cloudy.png' m: centre 0.551, 0.761, size 0.42 x 0.105), a little padded
mx0, mx1 = 78, 258   # (the sheet of measure-faces.mjs boxes the smile at x 85-249)
my0, my1 = int(BH * (0.761 - 0.0525)) - 18, int(BH * (0.761 + 0.0525)) + 4
ink = []
dark = lambda x, y: p[x, y][3] > 200 and sum(p[x, y][:3]) < 722
# the smile only: the connected run of ink (with its soft edge) round the darkest pixel in the box
seed = min(((x, y) for x in range(mx0, mx1 + 1) for y in range(my0, my1 + 1) if p[x, y][3] > 200), key=lambda q: sum(p[q[0], q[1]][:3]))
seen, todo = {seed}, [seed]
while todo:
    x, y = todo.pop()
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            q = (x + dx, y + dy)
            if q in seen or not (mx0 <= q[0] <= mx1 and my0 <= q[1] <= my1) or not dark(*q): continue
            seen.add(q); todo.append(q)
cols = {}
for (x, y) in seen: cols.setdefault(x, []).append(y)
for x, ys in cols.items():
    top, bot = min(ys), max(ys)
    fa, fb = p[x, top - 1], p[x, bot + 1]   # the fill just above and just below the ink in this column
    for y in ys:
        ink.append((x, y, p[x, y])); p[x, y] = fa if (y - top) <= (bot - y) else fb
cy0 = min(y for (x, y) in seen); cy1 = max(y for (x, y) in seen)
for (x, y, c) in ink:
    p[x, cy0 + cy1 - y] = c
# rain-grey: the white cloud to a blue-grey, the outline darker, the ink kept
for y in range(BH):
    for x in range(BW):
        r, g, b, a = p[x, y]
        if not a: continue
        p[x, y] = (round(r * 0.66), round(g * 0.69), round(b * 0.75), a)
rn.save(os.path.join(SPR, 'cloudy-rain.png'))
rows['rain'] = dict(w=BW, h=BH, k=1.0, facing=facing(rn), halo=0, mouth_box=[mx0, my0, mx1, my1], ink_px=len(ink))

json.dump(dict(base=[BW, BH], base_area=base_area, pics=rows), open(OUTJ, 'w'), indent=1)
print(json.dumps(rows))
