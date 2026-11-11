import json,sys
R=json.load(open(sys.argv[1],encoding='utf8'))
done=set("Goo Box Lifering Balloon Tissues Yin-Yang Snowball Teardrop Starfruit Cammy Fries Lollipop Match Naily Toothpaste Bomby Rocky Firey Blocky Tree".split())
def flat(d,p=''):
    o={}
    if isinstance(d,dict):
        for k,v in d.items(): o.update(flat(v,p+k+'.'))
    elif isinstance(d,list):
        for i,v in enumerate(d): o.update(flat(v,p+str(i)+'.'))
    else: o[p]=d
    return o
def sim(a,b):
    if not a or not b: return 0
    fa,fb=flat(a),flat(b); keys=set(fa)|set(fb); s=0;n=0
    for k in keys:
        n+=1; x,y=fa.get(k),fb.get(k)
        if x==y: s+=1
        elif isinstance(x,(int,float)) and isinstance(y,(int,float)) and x and y and abs(x-y)/max(abs(x),abs(y))<=.15: s+=1
    return s/n
rows=[r for r in R if r['k'] and r['up'] and r['sm']]
res=[]
for r in rows:
    def best(key,filt=None):
        b=(0,'');cnt=0
        for o in rows:
            if o is r: continue
            if key=='up' and o['up'].get('shape')!=r['up'].get('shape'): continue
            if key=='sm' and o['sm'].get('pat')!=r['sm'].get('pat'): continue
            s=sim(r[key],o[key])
            if s>=.8: cnt+=1
            if s>b[0]: b=(s,o['n'])
        return b,cnt
    (bu,cu),(bs,cs)=best('up'),best('sm')
    res.append((cu+cs,r['n'],r['k'],r['up'].get('shape'),round(bu[0],2),bu[1],cu,r['sm'].get('pat'),round(bs[0],2),bs[1],cs,r['hid']))
res.sort(reverse=True)
for x in res[:70]: print(x, 'DONE' if x[1] in done else '')
