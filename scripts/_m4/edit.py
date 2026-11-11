import re,sys
P='artifacts/V1/index.html'
raw=open(P,'rb').read().decode('utf8'); crlf='\r\n' in raw
s=raw.replace('\r\n','\n')
L=s.split('\n')
def setline(pattern,new,cnt=1):
    idx=[i for i,l in enumerate(L) if re.match(pattern,l)]
    assert len(idx)==cnt,(pattern,idx)
    L[idx[0]]=new
TAG=' (UNIQUE MOVES 4)'
SM={
'beam':"{pat:'rain', count:2, seek:260, gap:46, at:90, dmg:15, kb:10, r:12, effect:'burn', n:80, cost:{stun:32}, color:'#ff2a4a'},   // Ruby -- Facet Fall"+TAG+": two jagged crystals drop on the nearest foe (was a beam shared with TV, Ruler, Cheesy)",
'cool':"{pat:'burst', frames:12, r0:24, rad:90, grow:26, dmg:13, kb:11, effect:'ice', n:100, cost:{stun:28}, color:'#6fd2c8'},   // Loser -- Cold Snap"+TAG+": a ring of chill, like the blast his Stay Cool ends in (was a lunge)",
'photo':"{pat:'plant', wind:16, rad:56, dmg:12, kb:9, effect:'root', n:40, cost:{root:26}, color:'#4a9c6a'},   // Fern -- Root Down"+TAG+": roots himself, then roots burst up all round and root foes (was a burst that drained)",
'gust':"{pat:'walk', spd:6, dmg:10, kb:10, r:16, life:90, pierce:true, effect:'knockdown', n:30, cost:{cd:52}, color:'#bfe8ff'},   // Fanny -- Cyclone"+TAG+": a whirlwind that travels the floor through everyone (was a burst)",
}
for k,v in SM.items(): setline(r"^  %s:\s*\{pat:"%k, "  %s: %s"%(k,v))
NM={'beam':'Facet Fall','cool':'Cold Snap','photo':'Root Down'}
for k,n in NM.items():
    idx=[i for i,l in enumerate(L) if re.match(r'^  %s:\s*\{name:"'%k,l)]
    assert len(idx)==1,(k,idx)
    L[idx[0]]=re.sub(r'\{name:"[^"]*"','{name:"%s"'%n,L[idx[0]],1)
UP={
'emberjr':"{shape:'spin', power:-13, frames:14, spinKb:'flat', hit:{off:0, fx:0, reach:24, dmg:[2,4], band:null, kb:[3,-6], eff:'burn', n:70}},   // Firey Jr. -- Fire Whirl"+TAG+": a rising spiral of flame that sets foes burning (was a hop and a spark shared with Fries)",
}
for k,v in UP.items(): setline(r"^  %s:\s*\{shape:"%k, "  %s: %s"%(k,v))
DN={
'beam':"beam(f){ f.flash=8; for(const v of [[6,-6],[8,-3],[10,-1]]){ spawnProj(f,{vx:f.face*v[0],vy:v[1],grav:true,dmg:4,kb:4,r:7,color:'#e0384b',life:50,bounce:true,maxBounces:1}); } for(let i=0;i<6;i++) puff(f.x+f.face*14,f.y-8,'#e0384b',4);  }, // Ruby -- Shard Spray"+TAG+": three gem shards fan out and bounce (was a floor trap shared with four others)",
'emberjr':"emberjr(f){ f.flash=10; for(const t of fighters){ if(t.dead||t.idx===f.idx||t.team===f.team||t.invuln>0) continue; if(hurtGap(t,f.x,f.y)<80-HURT_R0){ applyHit(t,3,Math.sign(t.x-f.x||1)*3,-4,f); SM_FX.burn(t,f,100); } }\n    if(summons.length) damageSummons(f, f.x, f.y, 80, 3);\n    hitArt(f, 'flare', { kind:'circle', x:f.x, y:f.y, r:80 - HURT_R0 }, { color:'#f0803a', style:'ring', fade:8 });\n    for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; puff(f.x+Math.cos(a)*30,f.y+Math.sin(a)*30,'#f0803a',3); } },   // Firey Jr. -- Flare Up"+TAG+": a flame ring that sets near foes burning (was a floor trap)",
'ring':"ring(f){ f.flash=8; f.armor=Math.max(f.armor||0,24); startWindup(f, CIRCLE_WINDUP, function(){ hitArt(f, 'ring', { kind:'circle', x:f.x, y:f.y, r:130-HURT_R0 }, { color:'#f2c84b', style:'ring' }); for(const t of fighters){ if(t.dead||t.idx===f.idx||t.team===f.team)continue; if(hurtGap(t, f.x, f.y) < 130-HURT_R0){ SM_FX.slow(t,f,150); } } puff(f.x,f.y-8,'#f2c84b',6); }, '#f2c84b', { kind:'circle', r:130-HURT_R0 });  }, // Bell -- Toll"+TAG+": a heavy toll that slows everyone near (was a stun ring identical to TV's)",
'static':"static(f){ f.flash=8; startWindup(f, CIRCLE_WINDUP, function(){ hitArt(f, 'static', { kind:'circle', x:f.x, y:f.y, r:haEdgeR(220) }, { color:'#8fd0ff', style:'zone', fade:8 }); let tgt=null,best=220; for(const t of fighters){ if(t.dead||t.idx===f.idx||t.team===f.team||hardInvuln(t))continue; const d=Math.hypot(t.x-f.x,t.y-f.y); if(d<best){best=d;tgt=t;} } if(tgt){ SM_FX.root(tgt,f,34); for(let i=0;i<8;i++) puff(tgt.x,tgt.y-8,'#8fd0ff',4); } puff(f.x,f.y-8,'#8fd0ff',6); }, '#8fd0ff', { kind:'circle', r:220 });  }, // TV -- Pause"+TAG+": hits pause on the nearest foe and holds them still (was a stun ring identical to Bell's)",
'measure':"measure(f){ f.flash=8; f.reflecting=22; f._reflAtk=false; puff(f.x+f.face*14,f.y-10,'#b0b0b0',5);  }, // Ruler -- Straight Edge"+TAG+": the ruler held flat turns shots back for a moment (was a counter shared with Coiny and Firey)",
'freeze':"freeze(f){ f.flash=8; addProj({owner:f.idx,ownerObj:f,x:f.x,y:feetY(f)-8,vx:0,vy:0,grav:false,dmg:2,kb:0,r:12,color:'#9ad24b',life:120,trap:true,root:true,arm:20}); f.invuln=Math.max(f.invuln,12); f.onground=false; f.vy=-9; f.vx=f.face*9; for(let i=0;i<8;i++) puff(f.x,f.y+8,'#9ad24b',4);  }, // Gelatin -- Jelly Bounce"+TAG+": bounces over a foe untouchable, a sticky blob left where he took off (was a freeze mine)",
'cool':"cool(f){ f.flash=8; f.armor=Math.max(f.armor,30); braceUp(f, 30); f.burn=0; f.bleed=0; f.slowed=0; f.weakened=0; f.iceUntil=0; f.curseStacks=0; f._poisonT=0; f.pct=Math.max(0,f.pct-6); puff(f.x,f.y-8,'#e8e8e8',6);  }, // Loser -- Shrug It Off"+TAG+": nothing sticks to him: it clears every status, heals a little, short armour (was a heal and a long brace)",
'slap':"slap(f){ f.flash=8; for(const v of [[4,-7],[6,-6],[8,-5]]){ spawnProj(f,{vx:f.face*v[0],vy:v[1],grav:true,dmg:3,kb:3,r:6,color:'#f2c84b',life:60,bounce:true,maxBounces:2}); } for(let i=0;i<4;i++) puff(f.x+f.face*10,f.y-12,'#f2c84b',3);  }, // Coiny -- Spare Change"+TAG+": tosses three coins that bounce away (was a counter stance shared with Ruler and Firey)",
}
for k,v in DN.items():
    idx=[i for i,l in enumerate(L) if re.match(r'^  %s\(f\)\{'%k,l) and 73000<i<73500]
    assert len(idx)==1,(k,idx)
    L[idx[0]]='  '+v
# neutral specials: TV and Fanny
def repl_case(key,new_lines):
    i=[j for j,l in enumerate(L) if re.match(r'^    case "%s":'%key,l) and 89000<j<91000]
    assert len(i)==1,(key,i); i=i[0]
    j=i+1
    while not re.match(r'^    case "',L[j]): j+=1
    L[i:j]=new_lines
repl_case('static',[
'    case "static": { // TV: Scan Lines'+TAG+' -- two bars of static sweep out at head and feet height (was a stun ring like Bell\'s)',
"      for(const dy of [-14,14]){ const p=spawnProj(f,{vx:f.face*12,vy:0,grav:false,dmg:5,kb:6,r:8,color:'#8fd0ff',life:50}); if(p) p.y+=dy; }",
"      for(let i=0;i<8;i++) puff(f.x+f.face*20,f.y+(Math.random()*30-15),'#8fd0ff',4);",
"      f.flash=10; f.spCd=74;  break; }"])
repl_case('gust',[
'    case "gust": f._empower=1; f.flash=10; for(const t of fighters){ if(t.dead||t.idx===f.idx||t.team===f.team) continue; const dx=(t.x-f.x)*f.face; if(dx>0 && dx<170 && Math.abs(t.y-f.y)<70) t.vx+=f.face*6; }   // Fanny: Gust'+TAG+' -- a real gust shoves foes ahead of her as it charges her next air blast',
"      for(let i=0;i<8;i++) puff(f.x+f.face*(10+i*18),f.y-6+(Math.random()*20-10),'#bfe8ff',5);  f.spCd=67; break;"])
# kit desc for TV
for i,l in enumerate(L):
    if 'kit:{special:"static", desc:"Static Burst' in l: L[i]=l.replace('Static Burst \u2192 stunning screen-flash aura','Scan Lines \u2192 two bars of static')
# MOVE_TEXT
D='\u2014'
TX={
'Ruby':('down',"Shard Spray %s throws three gem shards in a fan that bounce along the floor (medium reach). On hit: 4%% each."%D),
'Firey Jr.':('down',"Flare Up %s a ring of flame bursts around him (short reach). On hit: 3%%, sets them burning."%D),
'Bell':('down',"Toll %s armour for a moment, and after a short wind-up a heavy toll slows everyone near you (short reach). On hit: no damage, slows them."%D),
'TV':('down',"Pause %s after a short wind-up, hits pause on the nearest foe (medium reach) and holds them in place. On hit: no damage, roots them."%D),
'Ruler':('down',"Straight Edge %s no hit: you hold the ruler up flat for a third of a second and any shot that reaches you is turned back."%D),
'Gelatin':('down',"Jelly Bounce %s bounces forward over a foe, untouchable for a moment, leaving a sticky blob where you took off (short reach). On hit: 2%%, roots them."%D),
'Loser':('down',"Shrug It Off %s no hit: clears every status on you (burn, bleed, slow, weaken, ice), heals you 6%% and gives short armour."%D),
'Coiny':('down',"Spare Change %s tosses three coins that bounce away from you (medium reach). On hit: 3%% each."%D),
'Firey Jr.#up':('up',"Fire Whirl %s you spin up in a rising spiral of flame (short reach). On hit: 2-4%%, sets them burning."%D),
'TV#sp':('special',"Scan Lines %s two bars of static sweep out ahead, one at head height and one at your feet (long reach). On hit: 5%% each."%D),
'Fanny#sp':('special',"Gust %s a gust shoves foes in front of you (medium reach) and charges your next Air Blast (X) to hit three times as hard with more push; it stays charged until you use it. On hit: no damage."%D),
}
mt=[i for i,l in enumerate(L) if l.startswith('const MOVE_TEXT = {')][0]
for n,(slot,t) in TX.items():
    n=n.split('#')[0]
    idx=[i for i,l in enumerate(L[:mt+400]) if i>mt and l.startswith('  "%s": {'%n)]
    assert len(idx)==1,(n,idx)
    t=t.replace('%%','%')
    L[idx[0]],c=re.subn(r'(\b%s:")[^"]*(")'%slot,lambda m:m.group(1)+t+m.group(2),L[idx[0]],count=1); assert c==1,(n,slot)
s2='\n'.join(L)
open(P,'w',encoding='utf8',newline='\r\n' if crlf else '\n').write(s2)
print('ok')
