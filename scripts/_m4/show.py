import re,sys
L=open('artifacts/V1/index.html',encoding='utf8').read().replace('\r\n','\n').split('\n')
names=sys.argv[1].split(','); kits=sys.argv[2].split(',')
mt=[i for i,l in enumerate(L) if l.startswith('const MOVE_TEXT = {')][0]
for n in names:
    for l in L[mt:mt+400]:
        if l.startswith('  "%s": {'%n) or l.startswith('  %s: {'%n): print(l[:1500]); break
for k in kits:
    print('=====',k)
    for a,b,tag in [(72329,72676,'SMASH'),(72699,73049,'UP'),(73049,73500,'DOWN'),(87942,88300,'ENDLAG')]:
        for i in range(a-1,b):
            if re.match(r'^  %s[:(]'%k,L[i]) or (tag=='DOWN' and re.match(r'^  %s\(f\)'%k,L[i])):
                print(tag,i+1,L[i][:700])
    for i in range(89845,90845):
        if re.match(r'^    case "%s":'%k,L[i]):
            j=i+1
            while not re.match(r'^    case "',L[j]) and j<i+30: j+=1
            print('NEUTRAL',i+1,'\n'.join(x[:300] for x in L[i:j]))
