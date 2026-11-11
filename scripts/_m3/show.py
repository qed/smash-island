import json,sys
R=json.load(open(sys.argv[1],encoding='utf8'))
for r in R:
    if r['n'] in sys.argv[2:]:
        print('==',r['n'],r['k']); print('UP',json.dumps(r['up'])); print('SM',json.dumps(r['sm']))
        for s in ('special','up','down','smash'):
            print(s,':',(r['mt'] or {}).get(s))
