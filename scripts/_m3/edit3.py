P='artifacts/V1/index.html'
s=open(P,'rb').read().decode('utf8')
a="count:3, seek:260, gap:40, at:90, dmg:10, kb:11, r:11"
b="count:3, seek:260, gap:40, at:90, dmg:12, kb:13, r:11"
assert s.count(a)==1
s=s.replace(a,b)
open(P+'.tmp','w',encoding='utf8',newline='').write(s)
import os; os.replace(P+'.tmp',P)
print('ok')
