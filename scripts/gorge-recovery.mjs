import { loadMonolith } from './helpers/load-monolith.js';
const OFF = (raw) => raw.replace('const GORGE_KO = 300;', 'const GORGE_KO = 1e9;');
const stageId = process.argv[2] || 'canyon';
const frames = 200;
function mk(xf) { const { window: w } = loadMonolith(11, xf); let t = 0; Object.defineProperty(w.performance, 'now', { value: () => (t += 1000 / 60), configurable: true }); w.Date.now = () => 1.7e12 + (t += 1000 / 60); return w; }
const A = mk(), B = mk(OFF);
const names = A.eval('ROSTER.filter(r=>r.play!==false && !r.boss).map(r=>r.name)');
const hid = A.eval('ROSTER.map(r=>[r.name, Object.keys(r).filter(k=>/hid|secret|prize|lock|boss|evil/i.test(k)).join(",")]).filter(a=>a[1]).map(a=>a.join(":")).slice(0,40)');
console.error('roster', names.length, 'flags', JSON.stringify(hid).slice(0,600));
function trial(w, name, depth, jumps, usedAir, vy0, hs) {
  return JSON.parse(w.eval(`(function(){
    TESTMODE.active=false; TOURNEY.active=false; CUSTOM_LEVEL=null; window.__netRoster=null; if(typeof BOT_ADAPT!=='undefined') BOT_ADAPT.lock();
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=3; SETTINGS.itemRate=0; SETTINGS.teamKey=''; AI_LEVEL=1;
    stage=STAGES.find(s=>s.id==='${stageId}'); resize(); setupWorld(); buildFighters();
    const r=ROSTER.find(x=>x.name==='${name}'); 
    const f=fighters[0]; Object.assign(f, makeFighter(Object.assign({}, r,{you:false}), 0,0,0)); f.stocks=3; f.team=0; f.homeBase=null;
    f.controller='local'; f.you=false; fighters[1].controller='still'; fighters[1].x=100; fighters[1].y=groundY()-80;
    running=true; paused=false; hazardT=0; for(const k in down) down[k]=false;
    const gy=groundY(), S=FLOOR_SEGS; const cx=(S[0].x1+S[1].x0)/2; window.__gw=S[1].x0-S[0].x1;
    f.x=cx; f.y=gy+${depth}; f.vx=0; f.vy=${vy0}; f.onground=false; f.jumps=${jumps}; f._usedAirSpecial=${usedAir}; f.hitstun=${hs}; f.invuln=0;
    window.__t={f, gy, S, ko:-1, land:-1, s0:f.stocks, maxUp:0};
    return JSON.stringify([0]);})()`) && 0) || null;
}
function macro(w, name, depth, jumps, usedAir, vy0, hs) {
  w.eval(`(function(){
    TESTMODE.active=false; TOURNEY.active=false; CUSTOM_LEVEL=null; window.__netRoster=null; if(typeof BOT_ADAPT!=='undefined') BOT_ADAPT.lock();
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=3; SETTINGS.itemRate=0; SETTINGS.teamKey=''; AI_LEVEL=1;
    stage=STAGES.find(s=>s.id==='${stageId}'); resize(); setupWorld(); buildFighters();
    const r=ROSTER.find(x=>x.name==='${name}');
    fighters[0]=makeFighter(Object.assign({}, r,{you:false}), 0,0,0); const f=fighters[0]; f.stocks=3; f.team=0; f.homeBase=null;
    f.controller='local'; f.you=false; fighters[1].controller='still'; fighters[1].x=100; fighters[1].y=groundY()-80;
    running=true; paused=false; hazardT=0; for(const k in down) down[k]=false;
    const gy=groundY(), S=FLOOR_SEGS; const cx=(S[0].x1+S[1].x0)/2;
    f.x=cx; f.y=gy+${depth}; f.vx=0; f.vy=${vy0}; f.onground=false; f.jumps=${jumps}; f._usedAirSpecial=${usedAir}; f.hitstun=${hs}; f.invuln=0;
    window.__T={ko:-1, land:-1, s0:f.stocks, minY:f.y, wj:0, tick:0};
  })()`);
  for (let i = 0; i < frames; i++) {
    w.eval(`(function(){
      const T=window.__T, f=fighters[0], S=FLOOR_SEGS, gy=groundY(); const K=KEYS;
      const left=S[0].x1, right=S[1].x0; const toward = (f.x-left < right-f.x) ? -1 : 1;  // nearest wall
      for(const k of [K.left,K.right,K.jump,K.special,K.attack]) down[k]=false;
      if(f.hitstun<=0){
        down[toward<0?K.left:K.right]=true;
        const wallNow = f._wallT!=null && hazardT-f._wallT<4;
        if(T.tick%10<5 && (f.jumps>0 || wallNow)) down[K.jump]=true;   // tap jump (double jump, wall jump)
        if(f.jumps<=0 && !f._usedAirSpecial && !wallNow && f.vy>-2) { down[K.jump]=true; down[K.special]=true; }  // up special
      }
      T.tick++;
      if(f.y<T.minY) T.minY=f.y; if(!(T.maxY>f.y)) T.maxY=f.y; if(f.onground && T.land<0){T.lx=f.x;T.ly=f.y;}
      if(f.onground && T.land<0) T.land=T.tick;
      if(f.stocks<T.s0 && T.ko<0) T.ko=T.tick;
    })()`);
    w.eval('step()');
    const o = w.eval('[__T.ko, __T.land]');
    if (o[0] >= 0 || o[1] >= 0) break;
  }
  const o = w.eval('[__T.ko, __T.land, Math.round(__T.maxY - groundY()), Math.round(__T.ly-groundY()), Math.round(__T.lx)]');
  return { ko: o[0], land: o[1], maxD: o[2], ly: o[3], lx: o[4] };
}
const depths = (process.argv[3]||'100,200,280').split(',').map(Number);
const cases = JSON.parse(process.env.CASES || '[[1,false,0,0]]');
const rows = [];
for (const n of names) for (const d of depths) for (const c of cases) {
  const a = macro(A, n, d, c[0], c[1], c[2], c[3]), b = macro(B, n, d, c[0], c[1], c[2], c[3]);
  rows.push({ n, d, c: c.join('/'), on: a, off: b });
}
console.log(JSON.stringify(rows));
