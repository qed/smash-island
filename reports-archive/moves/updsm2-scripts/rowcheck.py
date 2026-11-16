# rowcheck (batch 1's approach): every new up / down smash row against the generated move it replaces.
# Per box: damage <= old damage, launch length <= old launch length. Most one foe can take (one hit per hit group, the largest box of each) <= old damage,
# and the row's `tot` says the same number. Frames (st + act + end) >= old frames. Reach in px is printed for the report (not a pass/fail: see the report).
# usage: python rowcheck.py rows_before.json rows_after.json
import json, sys, math
B = json.load(open(sys.argv[1], encoding='utf8')); A = json.load(open(sys.argv[2], encoding='utf8'))
NAMES = ['Pen', 'Pencil', 'Match', 'Ice Cube', 'Golf Ball', 'Rocky', 'Woody', 'Book', 'Ruby', 'Puffball', 'Gelatin', 'Fries']
old = {(g['who'], g['slot']): g['S'] for g in B['gen']}
new = {(r['who'], r['slot']): r['S'] for r in A['rows'] if r['slot'] in ('upsmash', 'downsmash')}
def launch(b):
    if b.get('rad') is not None: return abs(b['rad'])
    return math.hypot(*b['kb'])
def reach(S):
    m = 0
    for b in S['boxes']:
        s = b['s']
        if s['k'] == 'f': e = math.hypot(s.get('ox', 0), s.get('oy', 0)) + s['r1']
        elif s['k'] == 'c': e = max(math.hypot(s['x1'], s['y1']), math.hypot(s['x2'], s['y2'])) + s['r']
        else: e = math.hypot(s['x'], s['y']) + s['r']
        m = max(m, e)
    return m
problems = 0
for n in NAMES:
    for slot, key in (('usmash', 'upsmash'), ('dsmash', 'downsmash')):
        O = old[(n, slot)]; N = new.get((n, key))
        if not N: print('MISSING', n, key); problems += 1; continue
        od = max(b['dmg'] for b in O['boxes']); ol = max(launch(b) for b in O['boxes']); of = O['st'] + O['act'] + O['end']
        groups = {}
        for i, b in enumerate(N['boxes']): groups.setdefault(b.get('g') or 'b%d' % i, []).append(b)
        # df and db are the two sides of one hit: a foe stands on one side, so they count once
        sides = max([max(b['dmg'] for b in groups[g]) for g in ('df', 'db') if g in groups] or [0])
        tot = sides + sum(max(b['dmg'] for b in bs) for g, bs in groups.items() if g not in ('df', 'db'))
        nd = max(b['dmg'] for b in N['boxes']); nl = max(launch(b) for b in N['boxes']); nf = N['st'] + N['act'] + N['end']
        bad = []
        if nd > od + 1e-9: bad.append('a hit does more damage')
        if nl > ol + 1e-9: bad.append('a hit launches harder')
        if tot > od + 1e-9: bad.append('one foe can take more in all')
        if abs(tot - N['tot']) > 0.051: bad.append('tot says %s, boxes say %.1f' % (N['tot'], tot))
        if nf < of: bad.append('shorter in frames')
        last = max(b.get('t1', N['st'] + N['act'] - 1) for b in N['boxes'])
        if last > N['st'] + N['act'] - 1: bad.append('a box is live after the active frames')
        if min(b.get('t0', N['st']) for b in N['boxes']) < N['st']: bad.append('a box is live before startup')
        problems += len(bad)
        print('%-10s %-6s %-22s dmg %5.1f -> max hit %5.1f, in all %5.1f | launch %5.2f -> %5.2f | frames %d -> %d | reach %3.0f -> %3.0f px %s' % (n, slot, N['n'], od, nd, tot, ol, nl, of, nf, reach(O), reach(N), ('PROBLEM: ' + '; '.join(bad)) if bad else 'ok'))
print('problems:', problems)
