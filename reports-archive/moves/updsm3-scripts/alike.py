# Look-alike check, the same kind the moves3 report used: two moves are "alike" when they have the same
# shape class, the same effect and numbers (damage of the launching hit, launch strength) within 25%.
# usage: python alike.py rows.json "Who|slot" ["Who|slot" ...]
import json, sys, math
rows = json.load(open(sys.argv[1], encoding='utf8'))
def launch(b):
    if b.get('rad') is not None: return abs(b['rad'])
    kb = b.get('kb') or [4, -3]; return math.hypot(kb[0], kb[1])
def kind(s):
    if s['k'] == 'f': return 'fan'
    if s['k'] == 'o': return 'disc'
    L = math.hypot(s['x2'] - s['x1'], s['y2'] - s['y1'])
    if L < s['r']: return 'disc'
    dx, dy = abs(s['x2'] - s['x1']), abs(s['y2'] - s['y1'])
    return 'line-flat' if dx >= 2*dy else ('line-upright' if dy >= 2*dx else 'line-slant')
def centre(s):
    if s['k'] == 'f':
        a = (s['a0'] + s['a1'])/2; r = (s['r0'] + s['r1'])/2
        return s.get('ox', 0) + r*math.cos(a), s.get('oy', 0) + r*math.sin(a)
    if s['k'] == 'o': return s['x'], s['y']
    return (s['x1'] + s['x2'])/2, (s['y1'] + s['y2'])/2
def zone(xs, ys):
    x = sum(xs)/len(xs); y = sum(ys)/len(ys)
    if min(xs) < -20 and max(xs) > 20: return 'both sides'
    if abs(x) <= 20: return 'low' if y > 5 else ('over' if y < -25 else 'on body')
    return 'front' if x > 0 else 'back'
def sig(r):
    S = r['S']; bx = S['boxes']; live1 = S['st'] + S['act'] - 1
    # hits in a row = distinct hit groups (a foe is hit once per group), in the order they come out
    groups = {}
    for i, b in enumerate(bx): groups.setdefault(b.get('g') or ('b%d' % i), []).append(b)
    order = sorted(groups.values(), key=lambda g: min(b.get('t0', S['st']) for b in g))
    kinds = sorted(set(kind(b['s']) for b in bx))
    cs = [centre(b['s']) for b in bx]
    mv = S.get('mv') or []
    moving = any((m.get('vx') or 0) != 0 or (m.get('vy') or 0) != 0 for m in mv)
    fx = set()
    for b in bx:
        f = b.get('fx')
        if isinstance(f, dict): fx.add(f['fx'])
        elif f: fx.add('code')
        if b.get('rehit'): fx.add('rehit')
    if S.get('start'): fx.add('start-code')
    last = order[-1]; top = max(last, key=lambda b: b.get('dmg', 0))
    return { 'hits': len(order), 'kinds': '+'.join(kinds), 'moving': moving, 'zone': zone([c[0] for c in cs], [c[1] for c in cs]),
             'fx': '+'.join(sorted(fx)) or 'none', 'dmg': top.get('dmg', 0), 'launch': launch(top) }
def near(a, b): return a == b or (max(abs(a), abs(b)) > 0 and abs(a - b)/max(abs(a), abs(b)) <= 0.25)
def cls(s): return (s['hits'], s['kinds'], s['moving'], s['zone'])
S = [(r, sig(r)) for r in rows]
for q in sys.argv[2:]:
    who, slot = q.split('|')
    me = [x for x in S if x[0]['who'] == who and x[0]['slot'] == slot]
    if not me: print(q, 'NOT FOUND'); continue
    r, s = me[0]
    print('== %s %s "%s": %d hit(s), %s, %s, %s, effect %s, %.1f dmg, launch %.1f' % (who, slot, r['S']['n'], s['hits'], s['kinds'], 'moving' if s['moving'] else 'still', s['zone'], s['fx'], s['dmg'], s['launch']))
    same_cls = 0; full = []
    for o, t in S:
        if o is r: continue
        if cls(t) != cls(s): continue
        same_cls += 1
        if t['fx'] == s['fx'] and near(t['dmg'], s['dmg']) and near(t['launch'], s['launch']): full.append((o, t))
    print('   same shape class: %d moves; full matches (class + effect + numbers within 25%%): %d' % (same_cls, len(full)))
    for o, t in full: print('     ALIKE: %s %s "%s" (%.1f dmg, launch %.1f, effect %s)' % (o['who'], o['slot'], o['S']['n'], t['dmg'], t['launch'], t['fx']))
