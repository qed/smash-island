// JANK / CLUNK detectors for scripts/playtest.mjs (PLAYTEST v2, 2026-11-11).
// THE THRESHOLDS BELOW WERE FIXED BEFORE THE BIG RUN (2026-11-11) AND ARE NOT TO BE CHANGED AFTER SEEING RESULTS. If one is ever changed, the README's
// "Threshold log" must say which, why and when. They are printed at the top of every report.
export const THRESH = Object.freeze({
  LAT_FLAG_FRAMES: 4,        // key press -> first change on the fighter, counted in frames AFTER the step that first saw the key: >= 4 frames (67 ms) is an outlier (0 = answered at once)
  EARLY_WINDOW: 6,           // a press up to 6 frames (100 ms) before the previous move's end-lag is over should be buffered by a forgiving game
  EAT_RATE_FLAG: 0.5,        // ... and it is a finding when >= 50% of such early presses (released before ready) were lost, with at least 8 samples
  EAT_MIN_SAMPLES: 8,
  TELEPORT_PX: 150,          // one-frame jump of a live fighter (no death/respawn/jail in the 3 frames around it)
  HITSTOP_DRIFT_PX: 8,       // a fighter in hitstop (_hitStop > 0) that moves more than this in one frame
  HITSTOP_LONG: 24,          // a hitstop longer than 24 frames (400 ms)
  CAM_SNAP_PX: 160,          // the camera centre moves more than this in one frame (not in the first 20 frames, not within 10 frames of the player's own KO)
  CAM_SNAP_ZOOM: 0.06,       // ... or the zoom changes by more than this in one frame
  CAM_JITTER_FLIPS: 10,      // velocity sign flips on an axis within 30 frames, each step 2-8 px
  SNAG_FRAMES: 24,           // the player held a walk key this long on the ground and moved less than SNAG_PX (away from the world's sides)
  SNAG_PX: 3,
  HANG_FRAMES: 45,           // alive in the air, not in a move, not moving at all
  EMBED_FRAMES: 30,          // the fighter's centre inside a solid platform for this long
  SPIKE_MS: 33,              // a frame slower than max(33 ms, 6 x the median of the last 90 frames) is a spike (headless wall time: noisy, so repeated spikes only)
  SPIKE_MULT: 6,
  STUTTER_SPIKES: 3,         // 3 spikes within 60 frames
  SLOW_CLICK_MS: 250,        // one menu click takes longer than this (wall time, headless)
  SLOW_START_MS: 800,        // Start Match to the first frame
  AUDIO_PER_FRAME: 8,        // sound calls (tone/noise) in one frame
  AUDIO_PER_SEC: 90,         // ... or in 60 frames
  CLICKS_TO_MATCH: 6,        // the default path from the title to a running match (journey scene) needs more than this many clicks/keys
  SECS_TO_MATCH: 60,         // ... or more than this many seconds of a persona's click-and-read time
  TEXT_OVERLAP_FRAC: 0.35,   // two HUD strings on the canvas overlap by more than this share of the smaller (width estimated as 0.55 x font px x characters)
  TEXT_WIDTH_FACTOR: 0.55,
  BOSS_WARN_FRAMES: 18,      // a boss attack that hits the player with less than 18 frames (300 ms) between the start of its telegraph and the hit
  TLC_SLACK_FRAMES: 15,      // a TLC ring that reaches the player in less than 15 frames (250 ms) after it appears
  BOSS_SHORT_SHARE: 0.25,    // ... and it is a finding when >= 25% of the hits on the player (of one boss move, with at least 8 hits) came with less warning than that / than the TLC slack
  BOSS_MIN_HITS: 8,
});

// page side: injected BEFORE the game's script. Words drawn on the canvas are captured with their SCREEN position (the current transform is tracked through
// save/restore/translate/scale/rotate/setTransform), font size and alignment; strings drawn at the identity transform are the HUD.
export const CANVAS_PRE = `<script>(function(){window.__ptCanvasText=Object.create(null);window.__ptCap=false;window.__ptTexts=[];var o=HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext=function(){var c=o.apply(this,arguments);var m=[1,0,0,1,0,0],stack=[],font='10px sans-serif',align='left';
function mul(a){m=[m[0]*a[0]+m[2]*a[1],m[1]*a[0]+m[3]*a[1],m[0]*a[2]+m[2]*a[3],m[1]*a[2]+m[3]*a[3],m[0]*a[4]+m[2]*a[5]+m[4],m[1]*a[4]+m[3]*a[5]+m[5]];}
return new Proxy(c,{get:function(t,p){
 if(p==='save')return function(){stack.push([m.slice(),font,align]);return t.save&&t.save.apply(t,arguments);};
 if(p==='restore')return function(){var s=stack.pop();if(s){m=s[0];font=s[1];align=s[2];}return t.restore&&t.restore.apply(t,arguments);};
 if(p==='translate')return function(x,y){mul([1,0,0,1,x,y]);return t.translate&&t.translate.apply(t,arguments);};
 if(p==='scale')return function(x,y){mul([x,0,0,y,0,0]);return t.scale&&t.scale.apply(t,arguments);};
 if(p==='rotate')return function(a){var cs=Math.cos(a),sn=Math.sin(a);mul([cs,sn,-sn,cs,0,0]);return t.rotate&&t.rotate.apply(t,arguments);};
 if(p==='transform')return function(a,b,cc,d,e,f){mul([a,b,cc,d,e,f]);return t.transform&&t.transform.apply(t,arguments);};
 if(p==='setTransform')return function(a,b,cc,d,e,f){if(typeof a==='object'&&a){m=[a.a,a.b,a.c,a.d,a.e,a.f];}else m=[a,b,cc,d,e,f];return t.setTransform&&t.setTransform.apply(t,arguments);};
 if(p==='resetTransform')return function(){m=[1,0,0,1,0,0];return t.resetTransform&&t.resetTransform.apply(t,arguments);};
 if(p==='fillText'||p==='strokeText')return function(s,x,y){if(window.__ptCap){s=String(s);window.__ptCanvasText[s]=(window.__ptCanvasText[s]||0)+1;
   if(p==='fillText'&&window.__ptTexts.length<400){var mm=/(\\d+(?:\\.\\d+)?)px/.exec(font);var fs=mm?+mm[1]:10;
   window.__ptTexts.push({s:s,x:m[0]*x+m[2]*y+m[4],y:m[1]*x+m[3]*y+m[5],sc:Math.hypot(m[0],m[1]),hud:(m[0]===1&&m[3]===1&&m[1]===0&&m[2]===0&&m[4]===0&&m[5]===0)?1:0,fs:fs,al:align});}}};
 return t[p];},set:function(t,p,v){if(p==='font')font=String(v);else if(p==='textAlign')align=String(v);return true;}});};})();</script>`;

// page side, evaluated after the game has booted (after PAGE_HOOKS): sound counting, the draw check of HUD text, boss-attack warnings and the TLC landings
export const JANK_HOOKS = `(function(){
  var P = window.__pt;
  P.tone = 0; P.textOver = Object.create(null); P.textOff = Object.create(null); P.bossWarn = []; P.tlc = []; P.hitstops = Object.create(null);
  function wrap(name, mk){ try{ var o = window[name]; if(typeof o === 'function'){ window[name] = mk(o); } }catch(e){} }
  wrap('tone', function(o){ return function(){ P.tone++; return o.apply(this, arguments); }; });
  wrap('noise', function(o){ return function(){ P.tone++; return o.apply(this, arguments); }; });
  var dn = 0;
  wrap('draw', function(o){ return function(){
    window.__ptTexts.length = 0;
    var r = o.apply(this, arguments);
    if(window.__ptCap && (dn++ % 5) === 0){ try{ analyze(); }catch(e){} }
    return r; }; });
  function box(t){ var w = t.s.length * t.fs * t.sc * __TWF__, h = t.fs * t.sc, x0 = t.al === 'center' ? t.x - w/2 : (t.al === 'right' || t.al === 'end') ? t.x - w : t.x; return { x0: x0, x1: x0 + w, y0: t.y - h, y1: t.y, w: w, h: h }; }
  function analyze(){
    var hud = window.__ptTexts.filter(function(t){ return t.hud && t.s.trim() && t.fs >= 8; }), i, j, a, b, A, B, W = window.W || 1100, H = window.H || 720;
    var bx = hud.map(box);
    for(i = 0; i < hud.length; i++){
      a = bx[i];
      if(a.x0 < -2 || a.x1 > W + 2 || a.y0 < -2 || a.y1 > H + 2){ var k = hud[i].s.replace(/\\d+/g, 'N').slice(0, 40); P.textOff[k] = (P.textOff[k] || 0) + 1; }
      for(j = i + 1; j < hud.length; j++){
        if(hud[i].s === hud[j].s) continue;
        b = bx[j];
        var ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
        if(ox > 0 && oy > 0 && ox * oy > __TOF__ * Math.min(a.w * a.h, b.w * b.h)){ var k2 = [hud[i].s, hud[j].s].map(function(s){ return s.replace(/\\d+/g, 'N').slice(0, 30); }).sort().join(' | '); P.textOver[k2] = (P.textOver[k2] || 0) + 1; }
      }
    }
  }
  // a boss's telegraph start (rising edge of _tel) and the warning a player had when an attack hit
  wrap('step', function(o){ return function(){
    var r = o.apply(this, arguments);
    try{ for(var i = 0; i < summons.length; i++){ var s = summons[i]; if(s.type !== 'boss' || !(s.hp > 0)) continue; var tl = s._tel || 0; if(tl > 0 && !(s._ptTel > 0)){ s._ptTelStart = hazardT; s._ptTelKind = s._telKind || s.attack; s._ptTelLen = tl; } s._ptTel = tl; } }catch(e){}
    return r; }; });
  wrap('applyHit', function(o){ return function(t, dmg, kbx, kby, from, opts){
    var before = t ? t.pct : 0, r = o.apply(this, arguments);
    try{ if(t && t.you && opts && opts.bossAtk != null && t.pct > before){
      var bs = null; for(var i = 0; i < summons.length; i++){ var s = summons[i]; if(s.type === 'boss' && s.hp > 0 && s._ptTelStart != null && (!bs || s._ptTelStart > bs._ptTelStart)) bs = s; }
      if(bs && P.bossWarn.length < 4000) P.bossWarn.push({ boss: bs.name, kind: bs._ptTelKind, warn: hazardT - bs._ptTelStart, tel: bs._ptTelLen, dmg: +(t.pct - before).toFixed(1), at: hazardT });
    } }catch(e){}
    return r; }; });
  // Firey Speaker Box's THE TLC NEEDS TO BE FIXED!: at each landing, how far the nearest fighter is, the ring's speed, and the slack (frames) before a ring reaches them
  wrap('fsbLand', function(o){ return function(s, F){
    try{ var best = null, bd = 1e9; for(var i = 0; i < fighters.length; i++){ var f = fighters[i]; if(f.dead) continue; var d = Math.abs(f.x - s.x); if(d < bd){ bd = d; best = f; } }
      var ph = F.P, spd = FSB.ringSp[ph] + (F.n === FSB.hops - 1 ? 1.4 : 0);
      if(best && P.tlc.length < 3000) P.tlc.push({ n: F.n, ph: ph, dist: Math.round(bd), spd: +spd.toFixed(2), slack: +(Math.max(0, bd - FSB.ringR) / (spd * (typeof PROJ_LIFE === 'number' ? 1 : 1))).toFixed(1), big: F.n === FSB.hops - 1, you: !!best.you, hopT: F.dur, wait: F.wait, t: hazardT });
    }catch(e){}
    return o.apply(this, arguments); }; });
  // hitstop lengths per move label
  wrap('armHitStop', function(o){ return o; });
})()`.replace(/__TWF__/g, String(THRESH.TEXT_WIDTH_FACTOR)).replace(/__TOF__/g, String(THRESH.TEXT_OVERLAP_FRAC));

// per-frame snapshot read by the Node-side watcher: one eval, plain numbers
export const FRAME_PROBE = `(function(){
  var o = [], i, f;
  for(i = 0; i < fighters.length; i++){ f = fighters[i]; o.push([f.x, f.y, f.dead ? 1 : 0, f.stocks, f._hitStop || 0, f.onground ? 1 : 0, f.hitstun || 0, f.vx, f.vy, f.idx, f._jail != null ? 1 : 0, f.you ? 1 : 0, f.r, (f._ptLbl && hazardT - f._ptLblT < 40) ? f._ptLbl : '', f.name, (f._mv || f._hold || f._windup || f._sm || f._cam || f._grabbed != null || f._heldBy != null || f.frozen > 0 || f.rooted > 0) ? 1 : 0]); }
  var z = 1; try{ z = viewZoom(); }catch(e){}
  return { f: o, cx: camX + W/2, cy: camY + H/2, z: z, tone: window.__pt.tone || 0, t: hazardT, mode: SETTINGS.mode, tut: !!(TUT && TUT.active), test: !!(typeof TESTMODE !== 'undefined' && TESTMODE.active), kos: window.__pt.kos.length, ctfPh: (typeof CTF !== 'undefined' && CTF.live) ? CTF.live.phase : '', spec: !!(typeof CTF !== 'undefined' && CTF.spec && CTF.spec.on), plats: window.__ptPlat ? 1 : 0 };
})()`;

// Node side: per-frame watcher. note(sev, kind, msg, data{rc}) is playtest.mjs's reporter.
export class FrameWatch {
  constructor(wo, note, stats, cur) {
    this.wo = wo; this.note = note; this.stats = stats; this.cur = cur; this.n = 0; this.prev = null; this.lastEvent = new Map();
    this.camHist = []; this.camPrev = null; this.holdPos = null; this.hang = new Map(); this.embed = new Map(); this.dts = []; this.spikes = []; this.toneLast = null; this.toneRing = [];
    this.lastYouEvent = -999; this.walkHold = 0; this.walkX = null; this.reported = new Set();
  }
  once(key) { if (this.reported.has(key)) return false; this.reported.add(key); return true; }
  // dt: the step time (ms) of this frame; held: the keys the player holds (a Set of codes); keys: the player's MOVE_KEYS
  observe(dt, held, keys, plats) {
    const wo = this.wo, T = THRESH; let Z;
    try { Z = wo.E(FRAME_PROBE); } catch (e) { return; }
    this.n++;
    const n = this.n, ctx = `${Z.mode}${Z.ctfPh ? '/' + Z.ctfPh : ''}`;
    const skipMode = Z.tut || Z.spec || Z.test;   // (Training dummies respawn instantly at the top: by design)
    // ---- teleports, hitstop drift, snags, hangs, embedding
    const prev = this.prev; this.prev = Z;
    if (prev && Z.kos !== prev.kos) for (const f of Z.f) this.lastEvent.set(f[9], n);   // a KO this frame: positions around it are respawn, not a jump
    if (prev && !skipMode) {
      for (const f of Z.f) {
        const idx = f[9], pf = prev.f.find((q) => q[9] === idx); if (!pf) continue;
        const dead = f[2], pdead = pf[2];
        if (dead || pdead || f[3] !== pf[3] || f[10] !== pf[10]) { this.lastEvent.set(idx, n); if (f[11]) this.lastYouEvent = n; continue; }
        const le = this.lastEvent.get(idx) || -99;
        const dx = f[0] - pf[0], dy = f[1] - pf[1], d = Math.hypot(dx, dy);
        const name = f[14], lbl = f[13] || 'no move';
        if (n - le > 3 && n > 30 && d > T.TELEPORT_PX && !(Z.mode === 'ctf' && Z.ctfPh !== 'play')) {
          this.note('FEEL', 'jank-teleport', `${name} moved ${Math.round(d)} px in one frame (${ctx}; last move: ${lbl})`, { rc: `teleport|${name}|${lbl}`, group: 'JANK', detail: `from ${Math.round(pf[0])},${Math.round(pf[1])} to ${Math.round(f[0])},${Math.round(f[1])} frame ${n}; dead ${pf[2]}>${f[2]} stocks ${pf[3]}>${f[3]} onground ${pf[5]}>${f[5]} hitstun ${Math.round(pf[6])}>${Math.round(f[6])} v ${pf[7].toFixed(1)},${pf[8].toFixed(1)}>${f[7].toFixed(1)},${f[8].toFixed(1)}` });
        }
        if (f[4] > 0 && pf[4] > 0 && d > T.HITSTOP_DRIFT_PX && !f[15] && n > 30) {
          this.note('FEEL', 'jank-hitstop-drift', `${name} moved ${Math.round(d)} px in one frame while in hitstop (${ctx}; last move: ${lbl})`, { rc: `hsdrift|${name}|${lbl}`, group: 'JANK' });
        }
        if (f[4] > T.HITSTOP_LONG) {
          this.note('FEEL', 'jank-hitstop-long', `${name} was in a hitstop of ${f[4]} frames (> ${T.HITSTOP_LONG}) after: ${lbl}`, { rc: `hslong|${name}|${lbl}`, group: 'JANK' });
        }
        // hangs: alive, in the air, no move, no hitstun, not moving at all
        if (!f[5] && !f[15] && f[6] <= 0 && Math.abs(f[7]) < 0.05 && Math.abs(f[8]) < 0.05 && Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
          const c = (this.hang.get(idx) || 0) + 1; this.hang.set(idx, c);
          if (c === T.HANG_FRAMES && !skipMode && Z.mode !== 'ctf') this.note('FEEL', 'jank-air-hang', `${name} hung motionless in the air for ${T.HANG_FRAMES} frames (${ctx}) at ${Math.round(f[0])},${Math.round(f[1])}`, { rc: `hang|${name}|${wo.E('stage.id')}`, group: 'JANK', detail: `x ${Math.round(f[0])} y ${Math.round(f[1])} stage ${wo.E('stage.id')}` });
        } else this.hang.set(idx, 0);
        // embedded in a solid platform
        if (plats && !dead) {
          let inside = false;
          for (const p of plats) { if (!p.solid) continue; if (f[0] > p.x + f[12] * 0.5 && f[0] < p.x + p.w - f[12] * 0.5 && f[1] > p.y + 4 && f[1] < p.y + (p.h || 40) - 4 && (p.h || 40) > 12) { inside = true; break; } }
          const c = inside ? (this.embed.get(idx) || 0) + 1 : 0; this.embed.set(idx, c);
          if (c === T.EMBED_FRAMES) this.note('BUG', 'jank-embedded', `${name} stood inside a solid platform for ${T.EMBED_FRAMES} frames (${ctx})`, { rc: `embed|${name}|${wo.E('stage.id')}`, group: 'JANK', detail: `x ${Math.round(f[0])} y ${Math.round(f[1])}` });
        }
        // the player's own walk snag
        if (f[11]) {
          const walking = held.has(keys.left) !== held.has(keys.right);
          const busy = f[6] > 0 || f[15] || !f[5];
          if (walking && !busy && f[0] > 40 && wo.E('WW') - f[0] > 40 && Math.abs(dx) < 0.3) {
            this.walkHold++;
            if (this.walkHold === T.SNAG_FRAMES && !(Z.mode === 'ctf' && Z.ctfPh !== 'play')) this.note('FEEL', 'jank-snag', `the player held a walk key ${T.SNAG_FRAMES} frames on the ground and did not move (${ctx}, stage ${wo.E('stage.id')})`, { rc: `snag|${wo.E('stage.id')}|${Math.round(f[0] / 40)}`, group: 'JANK', detail: `x ${Math.round(f[0])} y ${Math.round(f[1])} fighter ${name}` });
          } else this.walkHold = 0;
        }
      }
      // ---- the camera
      if (n > 20 && n - this.lastYouEvent > 10 && Z.mode !== 'ctf') {
        const dcx = Z.cx - prev.cx, dcy = Z.cy - prev.cy, dz = Math.abs(Z.z - prev.z);
        if (Math.hypot(dcx, dcy) > T.CAM_SNAP_PX || dz > T.CAM_SNAP_ZOOM) this.note('FEEL', 'jank-camera-snap', `the camera jumped ${Math.round(Math.hypot(dcx, dcy))} px / zoom ${dz.toFixed(2)} in one frame (${ctx})`, { rc: `camsnap|${wo.E('stage.id')}|${Z.mode}`, group: 'JANK', detail: `frame ${n} stage ${wo.E('stage.id')}` });
        this.camHist.push([dcx, dcy]); if (this.camHist.length > 30) this.camHist.shift();
        if (this.camHist.length === 30 && n % 10 === 0) {
          for (const ax of [0, 1]) {
            let flips = 0, ok = true;
            for (let i = 1; i < 30; i++) { const a = this.camHist[i - 1][ax], b = this.camHist[i][ax]; if (Math.abs(a) > 8 || Math.abs(b) > 8) ok = false; if (Math.abs(a) >= 2 && Math.abs(b) >= 2 && Math.sign(a) !== Math.sign(b)) flips++; }
            if (ok && flips >= T.CAM_JITTER_FLIPS) this.note('FEEL', 'jank-camera-jitter', `the camera ${ax ? 'y' : 'x'} axis shook back and forth ${flips} times in 30 frames (${ctx})`, { rc: `camjit|${wo.E('stage.id')}|${ax}`, group: 'JANK', detail: `frame ${n}` });
          }
        }
      } else this.camHist.length = 0;
    }
    // ---- audio spam
    if (this.toneLast != null) { const d = Z.tone - this.toneLast; this.toneRing.push(d); if (this.toneRing.length > 60) this.toneRing.shift();
      if (d >= T.AUDIO_PER_FRAME && n > 30) this.note('FEEL', 'jank-audio-burst', `${d} sound calls in one frame (${ctx})`, { rc: `audioburst|${ctx}`, group: 'JANK' });
      if (this.toneRing.length === 60 && n % 30 === 0) { const s = this.toneRing.reduce((a, b) => a + b, 0); if (s >= T.AUDIO_PER_SEC) this.note('FEEL', 'jank-audio-spam', `${s} sound calls in one second (${ctx})`, { rc: `audiospam|${ctx}`, group: 'JANK' }); } }
    this.toneLast = Z.tone;
    // ---- spikes
    if (dt != null && n > 90) {
      this.dts.push(dt); if (this.dts.length > 90) this.dts.shift();
      const med = this.dts.slice().sort((a, b) => a - b)[this.dts.length >> 1], lim = Math.max(T.SPIKE_MS, T.SPIKE_MULT * med);
      if (dt > lim) {
        this.spikes.push(n); while (this.spikes.length && n - this.spikes[0] > 60) this.spikes.shift();
        const lbl = Z.f.map((q) => q[13]).filter(Boolean)[0] || 'no recent move';
        this.note('SLOW', 'jank-spike', `a ${Math.round(dt)} ms frame (median ${med.toFixed(1)}) in ${ctx}; recent move: ${lbl}`, { rc: `spike|${ctx}|${lbl}`, group: 'JANK', detail: `frame ${n}` });
        if (this.spikes.length >= T.STUTTER_SPIKES) { this.spikes.length = 0; this.note('SLOW', 'jank-stutter', `3 slow frames within a second in ${ctx}`, { rc: `stutter|${ctx}`, group: 'JANK' }); }
      }
    }
  }
}
