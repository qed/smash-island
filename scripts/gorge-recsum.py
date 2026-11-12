import json,glob,collections
for fn in sorted(glob.glob('rec_*.json')):
    try: rows=json.load(open(fn))
    except Exception as e: print(fn,'bad',e); continue
    agg=collections.defaultdict(lambda:[0,0,0,0,0])
    for r in rows:
        k=(r['d'],r['c']); a=agg[k]; a[0]+=1
        on_ko=r['on']['ko']>=0; off_ko=r['off']['ko']>=0; off_land=r['off']['land']>=0
        if on_ko and not off_ko and off_land: a[1]+=1   # recovered before, KO'd now
        elif on_ko and not off_ko: a[2]+=1             # neither ko'd nor landed before, KO'd now
        if off_ko: a[3]+=1
        if on_ko: a[4]+=1
    for k,a in agg.items(): print(f"{fn[4:-5]:18} depth {k[0]:4} case {k[1]:10} n={a[0]} newlyKO(recovered-before)={a[1]} newlyKO(other)={a[2]} koOff={a[3]} koOn={a[4]}")
