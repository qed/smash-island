import json,sys,re,difflib
R=json.load(open(sys.argv[1],encoding='utf8'))
src=open('artifacts/V1/index.html',encoding='utf8').read().replace('\r\n','\n')
L=src.split('\n')
def region(a,b): return '\n'.join(L[a-1:b])
# neutral: cases in doSpecial 89845..90845
neu=region(89845,90845)
cases={}
parts=re.split(r'\n    case "(\w+)":',neu)
# parts: pre, name, body, name, body...
for i in range(1,len(parts)-1,2): cases[parts[i]]=cases.get(parts[i],'')+parts[i+1]
# fallthrough: empty body cases
dsrc=region(73049,73500)
down={}
for m in re.finditer(r'\n  (\w+)\(f\)\{',dsrc):
    pass
dp=re.split(r'\n  (\w+)\(f\)\s*\{',dsrc)
for i in range(1,len(dp)-1,2): down[dp[i]]=dp[i+1]
def toks(t,keepnum=False):
    t=re.sub(r'//[^\n]*','',t)
    t=re.sub(r'"[^"]*"|\'[^\']*\'','S',t)
    t=re.sub(r'#[0-9a-fA-F]{3,6}','C',t)
    ts=re.findall(r'[A-Za-z_]\w*|\d+\.?\d*|[^\sA-Za-z_\d]',t)
    if not keepnum: ts=['N' if re.match(r'\d',x) else x for x in ts]
    return ts
def ratio(a,b):
    if len(a)<8 or len(b)<8: return 0
    return difflib.SequenceMatcher(None,a,b,autojunk=False).ratio()
def numsim(a,b):
    na=[float(x) for x in toks(a,True) if re.match(r'\d',x)]; nb=[float(x) for x in toks(b,True) if re.match(r'\d',x)]
    if not na or not nb: return 0
    c=0;n=max(len(na),len(nb))
    for x,y in zip(na,nb):
        if x==y or (x and y and abs(x-y)/max(abs(x),abs(y))<=.15): c+=1
    return c/n
rows=[r for r in R if r['k'] and not r['hid']]
def sim(a,b):
    return ratio(toks(a),toks(b))*0.6+numsim(a,b)*0.4
flat_=lambda d,p='':(sum([flat_(v,p+k+'.') for k,v in d.items()],[]) if isinstance(d,dict) else (sum([flat_(v,p+str(i)+'.') for i,v in enumerate(d)],[]) if isinstance(d,list) else [(p,d)]))
def dsim(a,b):
    fa,fb=dict(flat_(a)),dict(flat_(b)); ks=set(fa)|set(fb); s=0
    for k in ks:
        x,y=fa.get(k),fb.get(k)
        if x==y: s+=1
        elif isinstance(x,(int,float)) and isinstance(y,(int,float)) and x and y and abs(x-y)/max(abs(x),abs(y))<=.15: s+=1
    return s/len(ks)
done=set("Goo Box Lifering Balloon Tissues Yin-Yang Snowball Teardrop Starfruit Cammy Fries Lollipop Match Naily Toothpaste Bomby Rocky Firey Blocky Tree Leafy Basketball Knife Cheesy Soap Gaty Sidewalky Paintbrush Trophy Blueberry".split())
out=[]
for r in rows:
    k=r['k']
    def best(fn,slot):
        b=(0,'')
        for o in rows:
            if o is r: continue
            if not slot(o) or not slot(r): continue
            s=fn(r,o)
            if s>b[0]: b=(s,o['n'])
        return b
    bu=best(lambda r,o: dsim(r['up'],o['up']) if r['up'].get('shape')==o['up'].get('shape') else 0, lambda x:x['up'])
    bs=best(lambda r,o: dsim(r['sm'],o['sm']) if r['sm'].get('pat')==o['sm'].get('pat') else 0, lambda x:x['sm'])
    bd=best(lambda r,o: sim(down[r['k']],down[o['k']]), lambda x:x['k'] in down)
    bn=best(lambda r,o: sim(cases[r['k']],cases[o['k']]), lambda x:x['k'] in cases)
    nodown = k not in down
    out.append((r['n'],k,bu,bs,bd,bn,nodown,r['n'] in done))
# print
def tot(x): return x[2][0]+x[3][0]+x[4][0]+x[5][0]
out.sort(key=lambda x:-tot(x))
print('n,kit | up(sim,with) | smash | down | neutral | nodown | total')
for x in out:
    if x[7]: continue
    f=lambda b:'%.2f %s'%(b[0],b[1])
    print(x[0],x[1],'|',f(x[2]),'|',f(x[3]),'|',f(x[4]) if not x[6] else 'DEFAULT-COUNTER','|',f(x[5]),'|',round(tot(x),2))
