# Trim to the alpha box, scale to 200 px tall (at most 480 wide), drop faint halo, save optimised PNG.
# usage: proc.py <dlroot> <outdir> key=outname ...
import sys, os, glob
import numpy as np
from PIL import Image
root, out = sys.argv[1], sys.argv[2]
for kv in sys.argv[3:]:
    k, name = kv.split('=')
    f = glob.glob(os.path.join(root, k, 'img.png'))[0]
    im = Image.open(f).convert('RGBA')
    a = np.array(im)[..., 3]
    ys, xs = np.nonzero(a > 16)
    im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    H = 200; w = round(im.width * H / im.height)
    if w > 480: w = 480; H = round(im.height * w / im.width)
    im = im.resize((w, H), Image.LANCZOS)
    arr = np.array(im); arr[..., 3][arr[..., 3] < 10] = 0; arr[arr[..., 3] == 0, :3] = 0
    im = Image.fromarray(arr)
    p = os.path.join(out, name + '.png')
    im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(p, optimize=True)
    clear = (arr[..., 3] == 0).mean()
    # facing: where the darkest small blobs (eyes) sit is hard; report the alpha centroid vs box centre instead
    cx = (np.nonzero(arr[..., 3] > 40)[1].mean() / w) - 0.5
    print(name, im.size, os.path.getsize(p), 'clear %.2f' % clear, 'mass-x %.3f' % cx)
