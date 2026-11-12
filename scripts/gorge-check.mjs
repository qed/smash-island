// DEADLY GORGES checks (one process): (A) no-op off the gorge stages with a fake frame clock: the same seeded match with the gorge KO on and off must be identical;
// (B) a fighter put deep in a Canyon gorge is KO'd, one just in it is not; (C) online (offline fake sockets): host and guest agree on the KO. Not part of the game.
import { loadMonolith } from './helpers/load-monolith.js';
import { makePair } from './helpers/net-pair.js';
let bad = 0; const say = (ok, m) => { console.log((ok ? 'ok   ' : 'FAIL ') + m); if (!ok) bad++; };
const off = (raw) => { if (!raw.includes('const GORGE_KO = 300;')) throw new Error('GORGE_KO'); return raw.replace('const GORGE_KO = 300;', 'const GORGE_KO = 1e9;'); };
function run(stageId, mode, count, seed, frames, xf) {
  const { window: w } = loadMonolith(seed >>> 0, xf);
  let t = 0; Object.defineProperty(w.performance, 'now', { value: () => (t += 1000 / 60), configurable: true }); w.Date.now = () => 1.7e12 + (t += 1000 / 60);   // the fake frame clock
  w.eval(`(function(){ if(typeof BOT_ADAPT!=='undefined') BOT_ADAPT.lock(); TESTMODE.active=false; TOURNEY.active=false; CUSTOM_LEVEL=null; window.__netRoster=null;
    SETTINGS.mode=${JSON.stringify(mode)}; SETTINGS.count=${count}; SETTINGS.stocks=3; SETTINGS.itemRate=2; SETTINGS.teamKey=''; AI_LEVEL=1;
    stage=STAGES.find(s=>s.id===${JSON.stringify(stageId)}); resize(); setupWorld(); buildFighters(); fighters.forEach(f=>{ f.you=false; f.controller='ai'; }); running=true; paused=false; hazardT=0; })()`);
  for (let i = 0; i < frames; i++) w.eval('step()');
  return w.eval('JSON.stringify(fighters.map(f=>[f.name,f.stocks,Math.round(f.x*10),Math.round(f.y*10),Math.round(f.pct)]))') + '|' + w.eval('gorgesOn()');
}
// (A)
const cfg = [['goiky','ffa',4],['fortress','ffa',4],['dreamisle','ffa',4],['tlc','ffa',4],['yoyle','ffa',4],['ice','ffa',4],['forest','ffa',3],['incin','ffa',4],['wind','ffa',4],['canyon','teams',4]];
const self = run('goiky','ffa',4,5,1500); say(self === run('goiky','ffa',4,5,1500), 'determinism: the same run twice is identical (so a difference below would be the gorge code)');
cfg.forEach(([s,m,c], i) => { const a = run(s,m,c,100+i,2400), b = run(s,m,c,100+i,2400,off); say(a === b && a.endsWith('|false'), `no-op ${s} ${m} x${c}: gorgesOn false, run identical (${a.length} chars)`); });
// (B)
{
  const { window: w } = loadMonolith(7);
  w.eval(`(function(){ TESTMODE.active=false; TOURNEY.active=false; CUSTOM_LEVEL=null; SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=3; AI_LEVEL=1; stage=STAGES.find(s=>s.id==='canyon'); resize(); setupWorld(); buildFighters(); fighters.forEach(f=>{f.you=false;f.controller='still';}); running=true; hazardT=0; })()`);
  say(w.eval('gorgesOn()'), 'canyon FFA: gorgesOn');
  const gap = w.eval('({x:(FLOOR_SEGS[0].x1+FLOOR_SEGS[1].x0)/2, gy:groundY(), k:GORGE_KO, w:FLOOR_SEGS[1].x0-FLOOR_SEGS[0].x1})');
  say(w.eval(`gorgeIn(${gap.x}, ${gap.gy + gap.k + 20})`) === true, `a point ${gap.k + 20} px under the floor in the gorge (width ${gap.w}) is in the deadly zone`);
  say(w.eval(`gorgeIn(${gap.x}, ${gap.gy + gap.k - 40})`) === false, 'a point 40 px above the line is not');
  say(w.eval(`gorgeIn(${w.eval('FLOOR_SEGS[0].x0 + 200')}, ${gap.gy + gap.k + 20})`) === false, 'under a floor span (not a gorge) is not a gorge KO');
  say(w.eval(`pastKo(${gap.x}, ${gap.gy + gap.k + 20})`) === false, 'pastKo (the camera and flight tests) is unchanged: 20 px past the gorge line is not past the old line');
  const put = (hs) => w.eval(`(function(){ var f=fighters[0]; f.x=${gap.x}; f.y=${gap.gy + gap.k + 30}; f.vx=0; f.vy=0; f.onground=false; f.hitstun=${hs}; f._gorgeT=0; f.jumps=0; f._usedAirSpecial=true; f.spCd=999; })()`);
  const s0 = w.eval('fighters[0].stocks');
  put(40); for (let i = 0; i < 3; i++) w.eval('step()');
  say(w.eval('fighters[0].stocks') === s0, 'a fighter in hitstun just below the line is NOT KO-ed while the stun lasts');
  put(0); for (let i = 0; i < 10; i++) w.eval('step()');
  say(w.eval('fighters[0].stocks') === s0, 'a free fighter below the line is not KO-ed in the first 10 frames (the grace)');
  put(0); for (let i = 0; i < 45; i++) w.eval('step()');
  say(w.eval('fighters[0].stocks') === s0 - 1, 'a free fighter with no air resources left, below the line, loses a stock (grace over)');
  // Marshmallow's save: once a stock, at the gorge line
  w.eval(`(function(){ var f=fighters[1]; f.kit = f.kit || {}; f.kit.special='wallmart'; f._gravSaved=false; f.x=${gap.x}; f.y=${gap.gy + gap.k + 5}; f.vy=8; f.vx=0; f.onground=false; f.hitstun=0; f.jumps=0; })()`);
  const sm = w.eval('fighters[1].stocks'); for (let i = 0; i < 60; i++) w.eval('step()');
  say(w.eval('fighters[1]._gravSaved') === true && w.eval('fighters[1].stocks') === sm, "Marshmallow's gravity save fires at the gorge line and she keeps her stock");
}
// (C) online
{
  const pr = await makePair({ stageId: 'canyon', count: 2, mode: 'ffa' });
  for (let i = 0; i < 120; i++) pr.frame();
  const gap = pr.Hh.eval('({x:(FLOOR_SEGS[0].x1+FLOOR_SEGS[1].x0)/2, gy:groundY(), k:GORGE_KO})');
  say(pr.Hh.eval('gorgesOn()') && pr.Cc.eval('gorgesOn()'), 'host and guest both have the gorges on');
  const st = (w) => w.eval('JSON.stringify(fighters.map(f=>[f.stocks,f.dead?1:0]))');
  const before = st(pr.Hh);
  for (let i = 0; i < 40; i++) pr.frame(null, `(function(){ var f=fighters[1]; if(f.stocks===${pr.Hh.eval('fighters[1].stocks')} && !f._testDone){ f.x=${gap.x}; f.y=${gap.gy + gap.k + 40}; f.vx=0; f.vy=0; f.onground=false; f._testDone=true; } })()`);
  for (let i = 0; i < 70; i++) pr.frame();
  const a = pr.Hh.eval('fighters[1].stocks'), b = pr.Cc.eval('fighters[1].stocks');
  say(a === 2 && b === 2, `the guest's fighter lost a stock for the gorge on the host (${a}) and the guest sees it (${b}); before ${before}`);
}
console.log(bad ? `FAILED ${bad}` : 'ALL OK'); process.exit(bad ? 1 : 0);
