# 8-Ball's pose pictures (event kit 3). Reads the owner-approved downloads and his render; writes PNGs to an output folder.
import sys, os, json, numpy as np
from collections import deque
from PIL import Image, ImageDraw, ImageFilter
DL, RENDER, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
CW, CH = 199, 200            # the render's canvas
BX0, BY0, BD = 9, 8, 183     # the ball's box in the render (bbox 9..190 x 8..191)

def load(p): return Image.open(p).convert('RGBA')
def dehalo(im):
    a = np.array(im); a[..., 3][a[..., 3] < 24] = 0; return Image.fromarray(a)
def bbox(im, th=40):
    a = np.array(im)[..., 3]; ys, xs = np.nonzero(a > th); return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
def fit_ball(im):
    x0, y0, x1, y1 = bbox(im); c = im.crop((x0, y0, x1, y1))
    w, h = x1 - x0, y1 - y0; k = BD / max(w, h)
    c = c.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    can = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    can.alpha_composite(c, (BX0 + (BD - c.width) // 2, BY0 + (BD - c.height) // 2))
    return dehalo(can)
def lum(a): return a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114
def blobs(mask, minn=8):
    H, W = mask.shape; seen = np.zeros_like(mask, dtype=bool); out = []
    for y in range(H):
        for x in range(W):
            if mask[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True; pts = []
                while q:
                    cy, cx = q.popleft(); pts.append((cy, cx))
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            ny, nx = cy + dy, cx + dx
                            if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not seen[ny, nx]:
                                seen[ny, nx] = True; q.append((ny, nx))
                if len(pts) >= minn: out.append(pts)
    return out
def inpaint(a, m, iters=80):
    a = a.astype(float); m = m.copy()
    for _ in range(iters):
        if not m.any(): break
        acc = np.zeros(a.shape[:2] + (3,)); cnt = np.zeros(a.shape[:2])
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == 0 and dx == 0: continue
                sh = np.roll(np.roll(a[..., :3], dy, 0), dx, 1); sm = np.roll(np.roll(~m, dy, 0), dx, 1)
                acc += sh * sm[..., None]; cnt += sm
        fill = m & (cnt > 0)
        a[..., :3][fill] = acc[fill] / cnt[fill][:, None]; m = m & ~fill
    return a.clip(0, 255).astype(np.uint8)
def grow(pts, H, W, r=2):
    m = np.zeros((H, W), bool)
    for (y, x) in pts: m[max(0, y - r):y + r + 1, max(0, x - r):x + r + 1] = True
    return m

made = {}
# ---- the render, its face found (white blobs under the badge) ----
R = load(RENDER); ra = np.array(R).astype(int)
white = (lum(ra) > 150) & (ra[..., 3] > 200)
face = [b for b in blobs(white) if min(p[0] for p in b) > 60]
mouth = max(face, key=lambda b: max(p[1] for p in b) - min(p[1] for p in b))   # the widest blob is the mouth
H, W = white.shape
m_all = np.zeros((H, W), bool)
for b in face: m_all |= grow(b, H, W)
m_mouth = grow(mouth, H, W)
blank = inpaint(ra, m_all & (ra[..., 3] > 200)); blank[..., 3] = ra[..., 3]     # his body with no face painted on it
nomouth = inpaint(ra, m_mouth & (ra[..., 3] > 200)); nomouth[..., 3] = ra[..., 3]

# ---- spin frames 06-13: the BFB spin, eight turns of the ball ----
spins = ['06-8-ball-8-ball-spinning0001', '07-8-ball-8-ball-spinning0006', '08-8-ball-8-ball-spinning0012', '09-8-ball-8-ball-spinning0017',
         '10-8-ball-8-ball-spinning0023', '11-8-ball-8-ball-spinning0028', '12-8-ball-8-ball-spinning0034', '13-8-ball-8-ball-spinning0039']
for i, s in enumerate(spins):
    im = fit_ball(load(os.path.join(DL, s + '.png'))); fn = '8-ball-spin-%d.png' % (i + 1)
    im.save(os.path.join(OUT, fn)); made[fn] = (im.size, s)

# ---- mad (14): his angry face, the whole ball ----
im = fit_ball(load(os.path.join(DL, '14-8-ball-8-ballmad.png'))); im.save(os.path.join(OUT, '8-ball-mad.png')); made['8-ball-mad.png'] = (im.size, '14')

# ---- flat (16): flattened, for a KO; cut to the drawing, 1.3 balls wide ----
fl = load(os.path.join(DL, '16-8-ball-8-ball-flat.png')); x0, y0, x1, y1 = bbox(fl); fl = fl.crop((x0, y0, x1, y1))
k = round(BD * 1.3) / fl.width
fl = dehalo(fl.resize((round(BD * 1.3), max(1, round(fl.height * k))), Image.LANCZOS))
fl.save(os.path.join(OUT, '8-ball-flat.png')); made['8-ball-flat.png'] = (fl.size, '16')

# ---- scared (15): the white strokes of his scared face, cut out of the episode frame (nothing else of it), on his own body ----
sc = np.array(load(os.path.join(DL, '15-8-ball-8bscared.png'))).astype(int)
L = lum(sc); cand = (L > 225)
keep = []
for b in blobs(cand, 20):
    ys = [p[0] for p in b]; xs = [p[1] for p in b]
    if min(ys) < 140 or max(xs) > 230 or min(xs) < 25: continue             # not the badge's 8 above, not the golf ball or Book
    y0, y1, x0, x1 = min(ys), max(ys), min(xs), max(xs)
    ring = L[max(0, y0 - 6):y1 + 7, max(0, x0 - 6):x1 + 7]; dark = (ring < 90).mean()
    if dark < 0.25: continue                                                 # a stroke on his black body: dark all round it
    keep.append(b)
sm = np.zeros(L.shape, bool)
for b in keep:
    for (y, x) in b: sm[y, x] = True
ys, xs = np.nonzero(sm); fx0, fy0, fx1, fy1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
stroke = Image.fromarray((sm[fy0:fy1, fx0:fx1] * 255).astype(np.uint8), 'L')
s = 96.0 / max(fx1 - fx0, fy1 - fy0)                                          # the face about as big as his painted one
stroke = stroke.resize((max(1, round((fx1 - fx0) * s)), max(1, round((fy1 - fy0) * s))), Image.LANCZOS).filter(ImageFilter.MaxFilter(5))
base = Image.fromarray(blank.astype(np.uint8), 'RGBA')
cx, cy = 114, 116                                                            # his painted face's middle (eyes 87..149, mouth to 138)
layer = Image.new('RGBA', base.size, (0, 0, 0, 0)); wht = Image.new('RGBA', stroke.size, (255, 255, 255, 255))
layer.paste(wht, (cx - stroke.width // 2, cy - stroke.height // 2), stroke)
la = np.array(layer); la[..., 3] = np.minimum(la[..., 3], np.array(base)[..., 3]); layer = Image.fromarray(la)
scared = base.copy(); scared.alpha_composite(layer); scared = dehalo(scared)
scared.save(os.path.join(OUT, '8-ball-scared.png'))
made['8-ball-scared.png'] = (scared.size, '15 strokes=%d bbox=%s scale=%.3f' % (len(keep), (int(fx0), int(fy0), int(fx1), int(fy1)), s))

# ---- bite: his render with the mouth opened wide (cut from the render: eyes and badge his own) ----
mx0 = min(p[1] for p in mouth); mx1 = max(p[1] for p in mouth); my = sum(p[0] for p in mouth) / len(mouth)
SS = 4; big = Image.fromarray(nomouth.astype(np.uint8), 'RGBA').resize((CW * SS, CH * SS), Image.LANCZOS); d = ImageDraw.Draw(big)
mcx = (mx0 + mx1) / 2; mw = (mx1 - mx0) * 0.95; mh = 40
box = [(mcx - mw / 2) * SS, (my - 12) * SS, (mcx + mw / 2) * SS, (my - 12 + mh) * SS]
d.ellipse(box, fill=(255, 255, 255, 255)); inner = [box[0] + 4.5 * SS, box[1] + 4.5 * SS, box[2] - 4.5 * SS, box[3] - 4.5 * SS]
d.ellipse(inner, fill=(92, 22, 28, 255))
for tx in (-0.2, 0.0, 0.2):                                                  # three teeth along the top lip
    t0 = mcx + tx * mw; d.rectangle([(t0 - 5) * SS, inner[1] - SS, (t0 + 5) * SS, inner[1] + 8 * SS], fill=(255, 255, 255, 255))
bite = big.resize((CW, CH), Image.LANCZOS); ba = np.array(bite); ba[..., 3] = ra[..., 3]; bite = dehalo(Image.fromarray(ba.astype(np.uint8)))
bite.save(os.path.join(OUT, '8-ball-bite.png')); made['8-ball-bite.png'] = (bite.size, 'render')
print(json.dumps({k: [list(v[0]), v[1]] for k, v in made.items()}))
