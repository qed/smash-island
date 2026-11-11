import re,sys
P='artifacts/V1/index.html'
raw=open(P,'rb').read().decode('utf8'); crlf='\r\n' in raw
s=raw.replace('\r\n','\n')
L=s.split('\n')
def setline(pattern,new,cnt=1):
    idx=[i for i,l in enumerate(L) if re.match(pattern,l)]
    assert len(idx)==cnt,(pattern,idx)
    L[idx[0]]=new
SM={
'dash':"{pat:'rain', count:3, seek:260, gap:40, at:90, dmg:12, kb:13, r:11, effect:'knockdown', cost:{cd:56}, color:'#8ed24b'},   // Leafy -- Leaf Fall (UNIQUE MOVES 3): three leaves shaken down on the nearest foe (was a dash; Basketball, Knife and Cheesy shared it)",
'dribble':"{pat:'leap', rise:12, fwd:6, rad:40, dmg:14, kb:12, effect:'knockdown', cost:{stun:28}, color:'#e08a3a'},   // Basketball -- Slam Dunk (UNIQUE MOVES 3): a hop at the nearest foe and a dunk on them (was a dash)",
'tricks':"{pat:'mine', at:40, dmg:11, kb:8, r:18, life:300, effect:'bleed', n:120, cost:{cd:56}, color:'#dfe6ec'},   // Knife -- Caltrops (UNIQUE MOVES 3): from the Bag of Tricks, left on the floor ahead (was the Blade Rush dash)",
'pun':"{pat:'beam', len:380, wide:20, dmg:12, kb:11, effect:'weaken', n:150, cost:{stun:26}, color:'#f9d84a'},   // Cheesy -- Punchline (UNIQUE MOVES 3): a line of groans straight ahead that weakens whoever it catches (was a dash)",
'disinfect':"{pat:'walk', spd:7, dmg:13, kb:10.5, r:15, life:80, ride:true, effect:'ice', n:90, cost:{cd:56}, color:'#f5a3cb'},   // Soap -- Soap Slide (UNIQUE MOVES 3): a slippery bar sliding along the floor (was a reel)",
'reflect':"{pat:'reel', draw:14, pull:150, force:8, reach:38, dmg:13, kb:14, effect:'strip', cost:{stun:26}, color:'#c8d8e8'},   // Gaty -- Gate Swing (UNIQUE MOVES 3): the gate swings shut on whoever is near, and judges them (was a lunge)",
'slam':"{pat:'plant', wind:16, rad:54, dmg:14, kb:12, effect:'stun', n:34, cost:{root:26}, color:'#a0a0a8'},   // Sidewalky -- Slab Down (UNIQUE MOVES 3): roots, then the slab comes down all round (was a leap)",
'blackmail':"{pat:'lunge', step:8, reach:38, band:-0.5, dmg:14, kb:14, far:1, effect:'knockdown', cost:{stun:22, cd:20}, color:'#d4a82a'},   // Trophy -- Off the Iceberg (UNIQUE MOVES 3): a longer lunge, sweetest at the toe (band -0.5)",
}
for k,v in SM.items(): setline(r"^  %s:\s*\{pat:"%k, "  %s: %s"%(k,v))
UP={
'pun':"{shape:'spin', power:-13, frames:18, spinKb:'flat', hit:{off:-6, fx:0, reach:20, dmg:[3,5], band:null, kb:[3,-7], eff:'slow', n:50}, self:{jumps:1}},   // Cheesy -- Cheese Wheel (UNIQUE MOVES 3): a rolling wheel of cheese (was a hop shared with Soap)",
'disinfect':"{shape:'warp', dist:120, dx:70, invuln:8, drop:{rider:'puddle', dmg:3, count:1, color:'#f5a3cb'}, self:{healing:15}},   // Soap -- Slip Away (UNIQUE MOVES 3): slips out like a wet bar of soap, a slick where she was (was a hop shared with Cheesy)",
'blackmail':"{shape:'hop', power:-16, hit:{off:6, fx:8, reach:26, dmg:[6,10], band:0.55, kb:[-3,-11], eff:'stun', n:14}, self:{empower:45}},   // Trophy -- Horseplay (UNIQUE MOVES 3): a rising knee that pulls them in, sweetest close (was shared with Blueberry)",
'blueberry':"{shape:'spin', power:-14, frames:16, spinKb:'pull', self:{armor:18, empower:45}},   // Blueberry -- Berry Roll (UNIQUE MOVES 3): an armoured rolling ball that pulls foes in (was a hop shared with Trophy)",
'fury':"{shape:'warp', dist:100, dx:45, invuln:6, drop:{rider:'burn', dmg:4, kb:3, r:8, vy:8, life:24, count:2, spread:3, color:'#ff6a2a'}},   // Paintbrush -- Pyrokinesis (UNIQUE MOVES 3): bristles flare, a blink up and forward, two burning blobs left behind (was a hop shared with Knife)",
'slam':"{shape:'spin', power:-10, frames:22, spinKb:'fwd', hit:{off:8, fx:0, reach:30, dmg:[3,5], band:null, kb:[2,-6], eff:'root', n:24}, self:{armor:14}},   // Sidewalky -- Cement Mixer (UNIQUE MOVES 3): a slow armoured spinning slab that drags foes forward into wet cement (was a plunge shared with Gaty)",
}
for k,v in UP.items(): setline(r"^  %s:\s*\{shape:"%k, "  %s: %s"%(k,v))
# smash names
NM={'dash':'Leaf Fall','tricks':'Caltrops','pun':'Punchline','disinfect':'Soap Slide','reflect':'Gate Swing','slam':'Slab Down'}
for k,n in NM.items():
    idx=[i for i,l in enumerate(L) if re.match(r'^  %s:\s*\{name:"'%k,l)]
    assert len(idx)==1,(k,idx)
    L[idx[0]]=re.sub(r'\{name:"[^"]*"','{name:"%s"'%n,L[idx[0]],1)
# MOVE_TEXT up
TX={
'Cheesy':"Cheese Wheel \u2014 curls into a spinning wheel of cheese and rolls up, slinging foes aside and slowing them (short reach), with a jump back. On hit: 3-5%, slows them; the spin then hits for 4% a tick.",
'Soap':"Slip Away \u2014 slips out of sight like a wet bar of soap and comes out higher and ahead, untouchable for a moment, leaving a soapy slick where she was (short reach) and a little healing. On hit: 3%.",
'Trophy':"Horseplay \u2014 a jock's jump with a rising knee that pulls foes in and stuns them (short reach), and his next Attack (X) hits much harder. On hit: 6% (10% up close), stuns them.",
'Blueberry':"Berry Roll \u2014 curls up and rolls upward in a spinning, armoured ball that pulls foes in with each turn (short reach), and his next Attack (X) hits much harder. On hit: 4% a tick, pulls them in.",
'Paintbrush':"Pyrokinesis \u2014 the bristles flare and they blink up and forward, untouchable for a moment, dropping two burning blobs of paint from where they were (medium reach). On hit: 4% each, sets them burning.",
'Sidewalky':"Cement Mixer \u2014 heaves up slowly as a spinning, armoured slab that drags foes forward and roots them in wet cement (short reach). On hit: 3-5%, then 4% a tick, roots them.",
}
for n,t in TX.items():
    idx=[i for i,l in enumerate(L) if l.startswith('  "%s": {'%n) or l.startswith("  %s: {"%n)]
    mt=[i for i,l in enumerate(L) if l.startswith('const MOVE_TEXT = {')][0]
    idx=[i for i in idx if mt<i<mt+400]; assert len(idx)==1,(n,idx)
    L[idx[0]],c=re.subn(r'(, up:")[^"]*(")',lambda m:m.group(1)+t+m.group(2),L[idx[0]],count=1); assert c==1,n
s2='\n'.join(L)
open(P,'w',encoding='utf8',newline='\r\n' if crlf else '\n').write(s2)
print('ok')
