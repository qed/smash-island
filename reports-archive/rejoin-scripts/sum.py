import json, glob, os, sys
D = sys.argv[1]
for p in sorted(glob.glob(os.path.join(D, '*.txt'))):
    t = open(p, encoding='utf-8', errors='replace').read()
    i = t.find('{')
    try:
        o = json.loads(t[i:])
    except Exception as e:
        print(os.path.basename(p), 'PARSE FAIL', t[:300].replace('\n', ' ')); continue
    a = o.get('after') or {}
    c = o.get('control') or {}
    og = o.get('otherGuest')
    row = [os.path.basename(p)[:-4], 'back +%sms' % (o.get('back') or {}).get('atMsAfterNetwork', '-'),
           'before ok' if (o.get('before') or {}).get('ok') else 'before BAD %s' % (o.get('before') or {}).get('bad'),
           'after ok lag%s' % a.get('lagFrames') if a.get('ok') else 'after BAD %s' % a.get('bad'),
           'you=%s' % a.get('you'), 'ctl %s/%s R%s L%s seat %s' % (c.get('ctlRemote'), c.get('steps'), c.get('right'), c.get('left'), c.get('seat')),
           'during %s' % o.get('duringHost'), 'dup %s' % o.get('dupIdsMax'), 'end H %s G %s' % (o.get('endHost'), o.get('endGuest')),
           'begin %s' % o.get('beginCalls'), 'wire %s' % o.get('wire'), 'err %s %s' % (o.get('errors'), o.get('errs'))]
    if og: row.append('other: begin %s idx %s view %s %s' % (og['beginMatchCalls'], og['myIdx'], og['view'].get('ok'), og['view'].get('bad')))
    print(' | '.join(str(x) for x in row))
