// CPU-only (or any lineup) stall probe: plays real step() matches on a chosen stage and reports time-to-first-KO,
// the longest stretch with no stock lost, and where KOs happen. One match at a time. Not part of the game.
// usage: node scripts/stalemate-probe.mjs --stage canyon --mode ffa --count 4 --seeds 1,2,3 [--stocks 3] [--ai 2] [--frames 10800]
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const stage = arg('stage', 'canyon'), mode = arg('mode', 'ffa'), count = +arg('count', 4), stocks = +arg('stocks', 3);
const ai = +arg('ai', 1), cap = +arg('frames', 10800), seeds = arg('seeds', '1,2,3').split(',').map(Number);
const out = [];
for (const seed of seeds) {
  const topFrac = process.argv.includes('--topfrac') ? +arg('topfrac') : null;   // EXPERIMENT only: lower the big stages' top KO line to WH*frac (a source transform; the file is untouched)
  const noG = process.argv.includes('--nogorge');   // BEFORE: switch the deadly gorges off (a source transform), same code otherwise
  const xf0 = (raw) => noG ? raw.replace('const GORGE_KO = 300;', 'const GORGE_KO = 1e9;') : raw;
  const xf = topFrac == null ? (noG ? xf0 : undefined) : (raw) => { const a = 'function koT(){ return (STG && STG.top != null) ? STG.top : KO_TOP; }'; if (!raw.includes(a)) throw new Error('koT not found'); return raw.replace(a, 'function koT(){ return (STG && STG.top != null) ? STG.top : (isBig() ? Math.round(WH*' + topFrac + ') : KO_TOP); }'); };
  const { window: w } = loadMonolith(seed >>> 0, xf);
  try {
    w.eval(`(function(){
      if(typeof BOT_ADAPT!=='undefined') BOT_ADAPT.lock();
      TESTMODE.active=false; TOURNEY.active=false; TOURNEY_WATCHING=null; if(typeof BOSSRUSH!=='undefined') BOSSRUSH.active=false;
      CUSTOM_LEVEL=null; TOURNEY_MATCH_ACTIVE=false; PENDING_TOURNEY=null; window.__netRoster=null;
      SETTINGS.mode=${JSON.stringify(mode)}; SETTINGS.count=${count}; SETTINGS.stocks=${stocks}; SETTINGS.itemRate=2; SETTINGS.teamKey='';
      AI_LEVEL=${ai}; stage=STAGES.find(s=>s.id===${JSON.stringify(stage)}); if(!stage) throw new Error('no stage');
      resize(); setupWorld(); buildFighters();
      fighters.forEach(f=>{ f.you=false; f.controller='ai'; });
      running=true; paused=false; hazardT=0; window.__elimSeq=0; lastKoFrame=0; itemTimer=180;
      fighters.forEach(f=>{ f.placement=null; f._downOrder=0; f._kos=0; f._falls=0; f._dmgDealt=0; f._dmgTaken=0; });
      particles=[]; projectiles=[]; beams=[]; evil=null; items=[]; summons=[]; tendrils=[]; BOSS_ARENA=null;
    })()`);
    const N = w.eval('fighters.length');
    const prevHs = []; let gyNow = 0, segsNow = []; let prevPct = w.eval('fighters.map(f=>f.pct)'), prev = w.eval('fighters.map(f=>f.stocks)'), prevPos = w.eval('fighters.map(f=>[f.x,f.y])');
    const kos = []; const gstat = { gorgeKO: 0, topKO: 0, sideKO: 0, bottomKO: 0, entries: 0, knockedIn: 0, selfIn: 0 }; const inG = new Array(N).fill(false); let last = 0, maxGap = 0, frames = 0, stallMin = 0;
    const diag = []; let dsum = 0, dn = 0;
    while (w.eval('running') && frames < cap) {
      w.eval('step()'); frames++;
      if (frames % 30 === 0) { const d = w.eval(`(function(){const a=fighters.filter(f=>!f.dead&&f.stocks>0);let s=0;a.forEach(f=>{let m=1e9;a.forEach(e=>{if(e!==f&&e.team!==f.team)m=Math.min(m,Math.hypot(e.x-f.x,e.y-f.y))});s+=m});return [s/Math.max(1,a.length), fighters.reduce((q,f)=>q+(f._dmgDealt||0),0)]})()`); dsum += d[0]; dn++; if (frames % 3600 === 0) { diag.push([Math.round(dsum / dn), Math.round(d[1])]); dsum = 0; dn = 0; } }
      const st = w.eval('fighters.map(f=>f.stocks)');
      { const g = w.eval(`(function(){ const gy=groundY(), o=[]; const S=FLOOR_SEGS||[]; fighters.forEach(f=>{ let ing=false; for(let i=0;i<S.length-1;i++) if(f.x>S[i].x1-5&&f.x<S[i+1].x0+5&&f.y>gy+40&&!f.dead) ing=true; o.push([ing?1:0, f.hitstun>0?1:0]); }); return [o, gy, S]; })()`);
        for (let i = 0; i < N; i++) { if (g[0][i][0] && !inG[i]) { gstat.entries++; if (g[0][i][1] || prevHs[i]) gstat.knockedIn++; else gstat.selfIn++; } inG[i] = !!g[0][i][0]; prevHs[i] = g[0][i][1]; }
        gyNow = g[1]; segsNow = g[2]; }
      for (let i = 0; i < N; i++) if (st[i] < prev[i]) {
        { const [px, py] = prevPos[i]; let inGap = false; for (let k = 0; k < segsNow.length - 1; k++) if (px > segsNow[k].x1 - 45 && px < segsNow[k + 1].x0 + 45) inGap = true;
          const where = py < 0 ? 'top' : (px < 0 || px > w.eval('WW')) ? 'side' : (inGap && py > gyNow + 100) ? 'gorge' : 'bottom'; gstat[where + 'KO']++; }
        kos.push({ f: frames, who: w.eval(`fighters[${i}].name`), pos: prevPos[i].map(Math.round), pct: Math.round(prevPct[i]) });
        maxGap = Math.max(maxGap, frames - last); last = frames;
      }
      prevPct = w.eval('fighters.map(f=>f.pct)'); prev = st; prevPos = w.eval('fighters.map(f=>[f.x,f.y])');
    }
    maxGap = Math.max(maxGap, frames - last);
    // stalled minutes: windows of 3600 frames (one minute) starting at 0,3600,... with no KO inside
    for (let s = 0; s + 3600 <= frames; s += 3600) if (!kos.some(k => k.f > s && k.f <= s + 3600)) stallMin++;
    const dims = w.eval('[WW,WH]'), end = w.eval('fighters.map(f=>f.name+":"+f.stocks+"/"+Math.round(f.pct))').join(' ');
    out.push({ seed, N, frames, ended: !w.eval('running'), first: kos.length ? kos[0].f : null, kos: kos.length, maxGap, stallMin, dims, end, gstat, koList: process.argv.includes('--allko') ? kos : kos.slice(0, 4), diag: process.argv.includes('--diag') ? diag : undefined });
    console.log(JSON.stringify(out[out.length - 1]));
  } finally { }
}
const fk = out.map(o => o.first == null ? cap : o.first).sort((a, b) => a - b);
process.on('uncaughtException',()=>{});
console.log(`SUMMARY ${stage} ${mode} x${count} ai${ai}: matches ${out.length} noKO ${out.filter(o => o.first == null).length} medFirstKO ${fk[fk.length >> 1]}f(${(fk[fk.length >> 1] / 60).toFixed(0)}s) stalledMinutes ${out.reduce((a, o) => a + o.stallMin, 0)} longestGap ${Math.max(...out.map(o => o.maxGap))}f`);
