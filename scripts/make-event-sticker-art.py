# Sticker's render (event fighter art), made from the one owner-approved picture (read as data only): their BFDIE idle render
# (full size), supplied by the lead (the BFDI wiki's render of the upside-down square sunset sticker: blue top, red bottom, a yellow sun,
# a white liner with a grey edge, black stick arms and legs).
#   sticker.png                     trimmed and scaled to 200 px tall (the size of the other event renders)
#   skins/night-sticker.png         the event skin: a recolour of that render (hue and lightness only), the sunset turned to night
#   thumbs/night-sticker.png        its 56 px wide thumbnail
# Run: <a Python with PIL> -I scripts/make-event-sticker-art.py <the source png> artifacts/V1/assets/sprites
import sys, os, colorsys
from PIL import Image

SRC, SPR = sys.argv[1], sys.argv[2]

def trim(im):
    bb = im.getchannel('A').point(lambda v: 255 if v >= 8 else 0).getbbox()
    return im.crop(bb) if bb else im

def fit(im, h):
    w = round(im.size[0] * h / im.size[1])
    out = im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
    px = out.load()
    for y in range(out.size[1]):
        for x in range(out.size[0]):
            r, g, b, a = px[x, y]
            if 0 < a < 8: px[x, y] = (0, 0, 0, 0)   # the faint halo a resize leaves
    return out

im = fit(trim(Image.open(SRC).convert('RGBA')), 200)
im.save(os.path.join(SPR, 'sticker.png'), optimize=True)
print('sticker.png', im.size, os.path.getsize(os.path.join(SPR, 'sticker.png')), 'bytes')

# THE SKIN: night. The blue top goes to a deep night blue, the red bottom to violet, the yellow sun to a pale moon; the white liner,
# the grey edge and the black ink are left as they are (low saturation is untouched).
sk = im.copy(); px = sk.load()
for y in range(sk.size[1]):
    for x in range(sk.size[0]):
        r, g, b, a = px[x, y]
        if a == 0: continue
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        if s < 0.25 or l < 0.12 or l > 0.92: continue
        deg = h * 360
        if 190 <= deg <= 260: h, l = 232 / 360, l * 0.62            # blue -> night blue
        elif deg >= 320 or deg <= 20: h, l = 272 / 360, l * 0.78     # red -> violet
        elif 35 <= deg <= 70: h, l, s = 210 / 360, min(0.9, l * 1.08), s * 0.25   # yellow sun -> pale moon
        else: continue
        rr, gg, bb = colorsys.hls_to_rgb(h, l, s)
        px[x, y] = (round(rr * 255), round(gg * 255), round(bb * 255), a)
os.makedirs(os.path.join(SPR, 'skins'), exist_ok=True); os.makedirs(os.path.join(SPR, 'thumbs'), exist_ok=True)
sk.save(os.path.join(SPR, 'skins', 'night-sticker.png'), optimize=True)
th = sk.convert('RGBa').resize((56, round(56 * sk.size[1] / sk.size[0])), Image.LANCZOS).convert('RGBA')
th.save(os.path.join(SPR, 'thumbs', 'night-sticker.png'), optimize=True)
print('skins/night-sticker.png', sk.size, '| thumbs/night-sticker.png', th.size)
