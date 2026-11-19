# Renders hitbox strips to PNG from scripts/dump-hitboxes.mjs --raw data (the same recorded boxes the SVGs are drawn from), for showing
# the owner. usage: python scripts/hitbox-png.py raw.json outdir "Fighter|key" [...]   (needs Pillow)
import sys, json, math, os
from PIL import Image, ImageDraw, ImageFont

C = dict(hit=(255, 77, 61), grab=(59, 156, 255), shot=(255, 166, 48), pull=(196, 155, 255), hurt=(255, 210, 63), inv=(74, 222, 128),
         armor=(232, 121, 249), counter=(34, 211, 238), bg=(27, 34, 48), ground=(138, 150, 170),
         startup=(63, 125, 90), active=(184, 51, 43), endlag=(70, 85, 122), free=(74, 74, 74))
S = 3              # supersample
PW, LAB, GAP, COLS = 150, 22, 6, 8

def font(sz):
    for f in ['C:/Windows/Fonts/segoeuib.ttf', 'C:/Windows/Fonts/arialbd.ttf']:
        if os.path.exists(f): return ImageFont.truetype(f, sz)
    return ImageFont.load_default()

def poly_pad(dr, pts, pad, col, k):
    if len(pts) >= 6: dr.polygon(pts, fill=col)
    if pad > 0:
        w = max(1, int(round(2 * pad * k)))
        dr.line(pts + pts[:2], fill=col, width=w, joint='curve')
        for i in range(0, len(pts), 2):
            r = pad * k; dr.ellipse([pts[i] - r, pts[i+1] - r, pts[i] + r, pts[i+1] + r], fill=col)

def panel(F, gy, E, ph):
    sz = PW * S; k = sz / (2 * E)
    img = Image.new('RGBA', (sz, sz), C['bg'] + (255,))
    T = lambda x, y: ((x - F['x'] + E) * k, (y - F['y'] + E) * k)
    d = ImageDraw.Draw(img)
    g = (gy - F['y'] + E) * k
    if 0 <= g <= sz: d.line([0, g, sz, g], fill=C['ground'], width=2 * S)
    def layer(boxes, col, alpha, dashed=False):
        L = Image.new('RGBA', (sz, sz), (0, 0, 0, 0)); dl = ImageDraw.Draw(L); c = col + (255,)
        for b in boxes:
            kd = b[1]
            if kd == 'c':
                x, y = T(b[2], b[3]); r = max(1, b[4]) * k
                if dashed: dl.ellipse([x - r, y - r, x + r, y + r], outline=c, width=2 * S)
                else: dl.ellipse([x - r, y - r, x + r, y + r], fill=c)
            elif kd == 'r':
                x, y = T(b[2], b[3]); dl.rectangle([x, y, x + b[4] * k, y + b[5] * k], fill=c)
            elif kd == 'l':
                x1, y1 = T(b[2], b[3]); x2, y2 = T(b[4], b[5]); r = b[6] * k
                if b[7]:
                    dl.line([x1, y1, x2, y2], fill=c, width=max(1, int(2 * r)))
                    for (x, y) in ((x1, y1), (x2, y2)): dl.ellipse([x - r, y - r, x + r, y + r], fill=c)
                else:
                    dl.polygon([x1, y1 - r, x2, y2 - r, x2, y2 + r, x1, y1 + r], fill=c)
            elif kd == 'p':
                pts = []
                for i in range(0, len(b[2]), 2): pts += list(T(b[2][i], b[2][i+1]))
                if dashed: dl.line(pts + pts[:2], fill=c, width=2 * S)
                else: poly_pad(dl, pts, b[3], c, k)
        a = L.split()[3].point(lambda v: int(v * alpha)); L.putalpha(a)
        return L
    # hurtbox
    st = F.get('st') or ''
    hc = C['inv'] if 'i' in st else C['counter'] if 'c' in st else C['armor'] if 'a' in st else C['hurt']
    fa = 0.6 if ('i' in st or 'c' in st) else 0.28
    hb = F['hb']; H = Image.new('RGBA', (sz, sz), (0, 0, 0, 0)); dh = ImageDraw.Draw(H)
    if hb[0] == 'p':
        pts = []
        for i in range(0, len(hb[1]), 2): pts += list(T(hb[1][i], hb[1][i+1]))
        dh.polygon(pts, fill=hc + (int(255 * fa),)); dh.line(pts + pts[:2], fill=hc + (255,), width=int(1.5 * S))
    else:
        x, y = T(hb[1], hb[2]); rx, ry = hb[3] * k, hb[4] * k
        dh.ellipse([x - rx, y - ry, x + rx, y + ry], fill=hc + (int(255 * fa),), outline=hc + (255,), width=int(1.5 * S))
    img = Image.alpha_composite(img, H)
    by = {c: [b for b in F['bx'] if b[0] == c] for c in 'hgstu'}
    if by['u']: img = Image.alpha_composite(img, layer(by['u'], C['pull'], 1, True))
    if by['t']: img = Image.alpha_composite(img, layer(by['t'], C['shot'], 1, True))
    if by['s']: img = Image.alpha_composite(img, layer(by['s'], C['shot'], .75))
    if by['g']: img = Image.alpha_composite(img, layer(by['g'], C['grab'], .75))
    if by['h']: img = Image.alpha_composite(img, layer(by['h'], C['hit'], .7))
    img = img.resize((PW, PW), Image.LANCZOS)
    if ph == 'free': img = Image.blend(Image.new('RGBA', img.size, (20, 20, 20, 255)), img, .55)
    return img

def strip(rec, title, out):
    fr = rec['shownFrames']; ph = rec['phases']; E = rec['half']
    rows = math.ceil(len(fr) / COLS)
    TOP = 64; LEG = 30
    W = COLS * (PW + GAP) + GAP; Hh = TOP + rows * (PW + LAB + GAP) + LEG + GAP
    im = Image.new('RGB', (W, Hh), (14, 19, 28)); d = ImageDraw.Draw(im)
    d.text((GAP + 2, 8), title, font=font(22), fill=(255, 255, 255))
    sub = 'frame 0 = the frame the button is pressed; each panel is %d x %d game px, camera on the fighter' % (2 * E, 2 * E)
    d.text((GAP + 2, 38), sub, font=font(14), fill=(170, 185, 200))
    f12 = font(15)
    for j, i in enumerate(fr):
        x = GAP + (j % COLS) * (PW + GAP); y = TOP + (j // COLS) * (PW + LAB + GAP)
        d.rectangle([x, y, x + PW - 1, y + LAB - 1], fill=C[ph[j]])
        lab = ('... ' if j and i - fr[j-1] > 1 else '') + 'frame %d' % i + {'startup': '  startup', 'active': '  active', 'endlag': '  end lag', 'free': '  free'}[ph[j]]
        d.text((x + 4, y + 2), lab, font=f12, fill=(255, 255, 255))
        im.paste(panel(rec['frames'][i], rec['gy'], E, ph[j]).convert('RGB'), (x, y + LAB))
    ly = Hh - LEG; lx = GAP + 2
    for nm, col in [('hit', C['hit']), ('grab', C['grab']), ('shot / trap', C['shot']), ('hurtbox', C['hurt']), ('invincible', C['inv']), ('armour', C['armor']), ('counter', C['counter']), ('ground', C['ground'])]:
        d.rectangle([lx, ly + 4, lx + 16, ly + 20], fill=col); d.text((lx + 22, ly + 3), nm, font=f12, fill=(220, 228, 236)); lx += 30 + int(d.textlength(nm, font=f12))
    im.save(out)

if __name__ == '__main__':
    raw = json.load(open(sys.argv[1], encoding='utf8')); outdir = sys.argv[2]; os.makedirs(outdir, exist_ok=True)
    for mid in sys.argv[3:]:
        rec = raw[mid]; fn = rec['file'].replace('.svg', '.png')
        strip(rec, mid.replace('|', ' - '), os.path.join(outdir, fn)); print('wrote', fn, len(rec['shownFrames']), 'panels')
