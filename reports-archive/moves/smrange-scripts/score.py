import json, sys
S = r'C:\Users\carad\AppData\Local\Temp\claude\f6b4fec287bd4976\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\smrange'
for fn in sys.argv[1:]:
    J = json.load(open(S + '\\' + fn)); tot = came = hit = 0; noHit = []
    for r in J['res']:
        want = 'usmash' if r['dir'] > 0 else 'dsmash'
        rows = [x for x in r['rows'] if x['mode'] != 'arrowAtEnd']   # (arrow pressed 14 frames AFTER V: a jump or a late arrow; reported apart)
        c = sum(1 for x in rows if x['key'] == want); h = sum(1 for x in rows if x['key'] == want and x['hitT'] >= 0)
        tot += 1; came += (c == len(rows)); hit += (h > 0)
        spots = sorted(set(tuple(x['sp']) for x in rows if x['key'] == want and x['hitT'] >= 0))
        miss = sorted(set(tuple(x['sp']) for x in rows if x['key'] == want and x['hitT'] < 0))
        late = [x['key'] for x in r['rows'] if x['mode'] == 'arrowAtEnd']
        print('%-12s %-4s out %d/%d hit %d/%d  missed spots %s  | arrow-after-V: %s' % (r['n'], 'up' if r['dir'] > 0 else 'down', c, len(rows), h, len(rows), ' '.join('%d,%d' % s for s in miss) or '-', ','.join(sorted(set(str(k) for k in late)))))
        if h == 0: noHit.append(r['n'] + ' ' + want)
    print(fn, 'moves', tot, 'came out every time (together / arrow first)', came, 'hit the dummy at least once', hit, 'never hit:', noHit)
