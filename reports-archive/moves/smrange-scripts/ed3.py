# Applies grow results: rewrites each grown row's box shapes (s:MvC/MvO/MvF literals, in order) and adds DSM_GROW (the same stretch for the props) + the draw hook.
# usage: python ed3.py grow.json
import sys, json, re
P = r'C:\Users\carad\Aardvark\smash-island-work\.worktrees\smrange\artifacts\V1\index.html'
G = json.load(open(sys.argv[1], encoding='utf8'))
b = open(P, 'rb').read().decode('utf8')
start = b.index('const DSM_OWN = {'); end = b.index('\r\n};\r\n', start)
blk = b[start:end]
def num(v):
    if abs(v - round(v)) < 1e-9: return str(int(round(v)))
    return ('%.1f' % v)
def fmt(s, orig):
    if s['k'] == 'o': return 'MvO(%s,%s,%s)' % (num(s['x']), num(s['y']), num(s['r']))
    if s['k'] == 'c': return 'MvC(%s,%s, %s,%s, %s)' % (num(s['x1']), num(s['y1']), num(s['x2']), num(s['y2']), num(s['r']))
    a = [x.strip() for x in orig.split(',')]   # keep the angle text as written
    return 'MvF(%s, %s, %s, %s, %s, %s)' % (num(s['r0']), num(s['r1']), a[2], a[3], num(s['oy']), num(s['ox']))
grow = []
for g in G:
    Pk = g['P']
    if Pk['kx'] == 1 and Pk['ky'] == 1 and Pk['kr'] == 1: continue
    n, slot = g['n'], ('up' if g['dir'] > 0 else 'down')
    i = blk.index("\r\n  '%s': {" % n)
    j = blk.index('\r\n    %s:' % slot, i)
    k1 = blk.find('\r\n    down:', j + 4); k2 = blk.find('\r\n  },', j + 4)
    k = min(x for x in (k1, k2) if x > 0) if slot == 'up' else k2
    row = blk[j:k]
    masked = re.sub(r'//[^\r\n]*', lambda q: ' '*len(q.group(0)), row)   # (comments may name old shapes)
    calls = list(re.finditer(r'MvF\(([^)]*)\)|MvC\(([^)]*)\)|MvO\(([^)]*)\)', masked[masked.index('boxes:['):]))
    if len(calls) != len(g['boxes']): sys.exit('box count %s %s: %d vs %d' % (n, slot, len(calls), len(g['boxes'])))
    off = row.index('boxes:[')
    out = row[:off]; last = off
    for m, s in zip(calls, g['boxes']):
        out += row[last:off + m.start()] + fmt(s, (m.group(1) or '') if m.group(0).startswith('MvF') else '')
        last = off + m.end()
    out += row[last:]
    blk = blk[:j] + out + blk[k:]
    grow.append("'%s.%s':[%s,%s,%s]" % (n, slot, Pk['kx'], Pk['ky'], Pk['kr']))
b = b[:start] + blk + b[end:]
# the props: the same stretch
old = "function drawDsmProps(){\r\n"
assert b.count(old) == 1
add = ("// RANGE PASS (2026-11-17, the owner: \"the new up smashes have so little range\", \"some of the down smashes too\"): each own up / down smash whose hit area reached less high or\r\n"
       "// less wide than the generated move it replaced was stretched (its box numbers in DSM_OWN were rewritten); its drawing gets the SAME stretch here, so what you see is what hits:\r\n"
       "// [kx, ky, kr]: x past 12 px from the middle grows by kx, y above 24 px over the middle by ky, every radius by kr (dsmGx, dsmGy). Damage, launch and frames are unchanged.\r\n"
       "const DSM_GROW = { " + ", ".join(grow) + " };\r\n"
       "function dsmGx(x, k){ const m = Math.abs(x); return m <= 12 ? x : (x < 0 ? -1 : 1)*(12 + (m - 12)*k); }\r\n"
       "function dsmGy(y, k){ return y >= -24 ? y : -24 + (y + 24)*k; }\r\n")
b = b.replace(old, add + old)
old2 = "    const d = f.face < 0 ? -1 : 1, z = sizeOf(f), t = dsmFrame(f);\r\n    ctx.save(); ctx.globalAlpha = 1;\r\n    try { fn(ctx, function(x){ return f.x + x*d*z; }, function(y){ return f.y + y*z; }, z, t); } catch(e){}\r\n"
assert b.count(old2) == 1
new2 = ("    const d = f.face < 0 ? -1 : 1, z = sizeOf(f), t = dsmFrame(f), gw = dir === 'neu' ? null : DSM_GROW[f.name + '.' + dir];   // (RANGE PASS: the row's stretch)\r\n"
        "    ctx.save(); ctx.globalAlpha = 1;\r\n"
        "    try { fn(ctx, function(x){ return f.x + (gw ? dsmGx(x, gw[0]) : x)*d*z; }, function(y){ return f.y + (gw ? dsmGy(y, gw[1]) : y)*z; }, gw ? z*gw[2] : z, t); } catch(e){}\r\n")
b = b.replace(old2, new2)
bb = b.encode('utf8')
open(P, 'wb').write(bb)
lf = sum(1 for i in range(len(bb)) if bb[i] == 10 and (i == 0 or bb[i-1] != 13))
ctl = sum(1 for x in bb if x < 32 and x not in (9, 10, 13))
print('grown rows', len(grow), 'bareLF', lf, 'ctl', ctl, 'markers', bb.count(b'<<<<<<<') + bb.count(b'>>>>>>>'))
