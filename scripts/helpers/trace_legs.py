# Finds a render's two painted stick legs and writes them as LIMB_RIG leg rows (side, pivot, tip, poly, in the render's own px), the shape
# scripts/trace-limbs.mjs gives every other fighter, so drawSpriteBody can clip each leg out of the picture and swing it about its hip.
# Used by scripts/make-event-needy-art.py and scripts/make-event-hotdog-art.py (the two BFDIE event fighters with legs and no arms).
#   leg_mask(src, y0, narrow)   the legs in the SOURCE picture: every opaque pixel at or under row y0 (only legs are there), and above it the pixels
#                               of narrow runs (under `narrow` px: the tops of the sticks, between the body's slanted bottom edge and y0); of those,
#                               the parts that reach the picture's bottom (the feet), so a speck of the body's edge is never taken for a leg
#   leg_rows(mask, box, size)   the mask cropped to the picture's trimmed box and scaled to the render's size, traced: [{side, pivot, tip, poly}], left leg first
from PIL import Image

def leg_mask(src, y0, narrow):
    W, H = src.size
    A = src.getchannel('A').load()
    m = Image.new('L', (W, H), 0); M = m.load()
    for y in range(H):
        x = 0
        while x < W:
            if A[x, y] < 8: x += 1; continue
            e = x
            while e < W and A[e, y] >= 8: e += 1
            if y >= y0 or e - x < narrow:
                for k in range(x, e): M[k, y] = 255
            x = e
    # keep the parts that reach the bottom rows (the feet)
    seen = bytearray(W*H); keep = Image.new('L', (W, H), 0); K = keep.load()
    for sx in range(W):
        for sy in range(H - 12, H):
            if M[sx, sy] and not seen[sy*W + sx]:
                st = [(sx, sy)]; seen[sy*W + sx] = 1
                while st:
                    x, y = st.pop(); K[x, y] = 255
                    for dx in (-1, 0, 1):
                        for dy in (-1, 0, 1):
                            xx, yy = x + dx, y + dy
                            if 0 <= xx < W and 0 <= yy < H and M[xx, yy] and not seen[yy*W + xx]:
                                seen[yy*W + xx] = 1; st.append((xx, yy))
    return keep

def _comps(px, W, H):
    lab = [-1]*(W*H); out = []
    for i in range(W*H):
        if not px[i] or lab[i] >= 0: continue
        q = [i]; lab[i] = len(out); pts = []
        while q:
            c = q.pop(); pts.append(c); cx, cy = c % W, c // W
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    xx, yy = cx + dx, cy + dy
                    if 0 <= xx < W and 0 <= yy < H:
                        j = yy*W + xx
                        if px[j] and lab[j] < 0: lab[j] = len(out); q.append(j)
        out.append(pts)
    return out

def _trace(pts, W, H):   # the outline of a component grown by one px (as trace-limbs.mjs), simplified (Douglas-Peucker, 1.1 px)
    g = bytearray(W*H)
    for i in pts:
        x, y = i % W, i // W
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                xx, yy = x + dx, y + dy
                if 0 <= xx < W and 0 <= yy < H: g[yy*W + xx] = 1
    start = next(i for i in range(W*H) if g[i])
    at = lambda x, y: 0 <= x < W and 0 <= y < H and g[y*W + x]
    dirs = [(1,0),(1,1),(0,1),(-1,1),(-1,0),(-1,-1),(0,-1),(1,-1)]
    cx, cy, d = start % W, start // W, 7; P = [(cx, cy)]
    for _ in range(W*H*2):
        found = False
        for k in range(8):
            dd = (d + 6 + k) % 8; nx, ny = cx + dirs[dd][0], cy + dirs[dd][1]
            if at(nx, ny): cx, cy, d, found = nx, ny, dd, True; break
        if not found or (cx, cy) == P[0]: break
        P.append((cx, cy))
    def dp(a, eps):
        if len(a) < 3: return a
        (x1, y1), (x2, y2) = a[0], a[-1]; L = ((x2-x1)**2 + (y2-y1)**2) ** 0.5 or 1; idx, best = 0, 0
        for i in range(1, len(a) - 1):
            x, y = a[i]; d2 = abs((y2-y1)*x - (x2-x1)*y + x2*y1 - y2*x1)/L
            if d2 > best: best, idx = d2, i
        return dp(a[:idx+1], eps)[:-1] + dp(a[idx:], eps) if best > eps else [a[0], a[-1]]
    return dp(P, 1.1)

def leg_rows(mask, box, size):
    m = mask.crop(box)
    w, h = size
    m = m.resize((w, h), Image.BOX); M = m.load()
    px = bytearray(w*h)
    for y in range(h):
        for x in range(w):
            if M[x, y] >= 24: px[y*w + x] = 1
    legs = sorted([c for c in _comps(px, w, h) if len(c) > 8], key=lambda c: min(i % w for i in c))
    rows = []
    for n, c in enumerate(legs):
        top = min(i // w for i in c); bot = max(i // w for i in c)
        xs = [i % w for i in c if i // w <= top + 2]            # the stick's top: the hip
        sx = [i % w for i in c if i // w == top + (bot - top)//2]   # the stick halfway down: where the tip sits over
        pivot = [round(sum(xs)/len(xs), 1), round(top + 1.5, 1)]
        tip = [round(sum(sx)/len(sx)), bot]
        # the outline runs through pixel indices, grown one px; a clip path runs along pixel edges, so a row or column on the picture's own edge (the
        # feet's bottom row) is taken to the edge (h, w), or that last row of pixels would be left behind on the body when the leg swings
        poly = [v for x, y in _trace(c, w, h) for v in (w if x == w - 1 else x, h if y == h - 1 else y)]
        rows.append({'side': 'L' if n == 0 else 'R', 'pivot': pivot, 'tip': tip, 'poly': poly})
    return rows

def js_row(rows):
    return '[' + ','.join("{side:'%s',pivot:[%s,%s],tip:[%s,%s],poly:[%s]}" % (r['side'], r['pivot'][0], r['pivot'][1], r['tip'][0], r['tip'][1], ','.join(str(v) for v in r['poly'])) for r in rows) + ']'
