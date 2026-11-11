P='artifacts/V1/index.html'
raw=open(P,'rb').read().decode('utf8'); s=raw
R=[("dash:[0,360,10,369,155,-1,-1,0]","dash:[0,360,10,369,0,-1,-1,0]"),("dribble:[10,440,7,0,162,0,40,8]","dribble:[10,440,7,0,215,0,40,8]"),("tricks:[0,220,4.4,0,155,-1,-1,0]","tricks:[0,220,4.4,0,0,-1,-1,0]"),("pun:[10,440,6,0,179,-1,-1,0]","pun:[10,440,6,0,0,-1,-1,0]"),("reflect:[0,50,5,0,55,-1,-1,0]","reflect:[0,50,5,0,0,-1,-1,0]"),("slam:[0,60,10.5,31,92,-1,-1,0]","slam:[0,60,10.5,31,0,-1,-1,0]"),("blackmail:[0,140,0,0,70,0,70,9]","blackmail:[0,140,0,0,80,0,70,9]")]
for a,b in R:
    assert s.count(a)==1,(a,s.count(a)); s=s.replace(a,b)
open(P,'w',encoding='utf8',newline='').write(s)
print('ok')
