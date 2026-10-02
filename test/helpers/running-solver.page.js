// PAGE CODE, not a module: test/running-race.test.js and scripts/solve-running-lane.mjs read this file and W.eval() it inside the
// booted game. It defines window.__rs.
//
// THE SCRIPTED RUN OF RUNNING! The owner (2026-10-02): "running should be d5 bfdi:branches difficulty", and the lane must stay
// winnable "as Knife by a skilled player, with no checkpoint". This is the proof. The lane's hard sections (the ones with a
// `sec` on their obstacle record: where to start, where to wait, where they end) are SOLVED by search on the real engine: from
// the exact state of the game when the runner reaches a section, every plan of a few presses is played out frame by frame with
// the game's own step() (the state is saved before and put back after), and the plan that carries him through with no bump and
// no fall, and the most room to spare, is the one that is kept. The rest of the lane is the scripted runner (running-bot.page.js)
// as before. What the search finds is written down as PROGRAMS (a few numbers a section), and the test plays the programs back.
//
// A PLAN is a list of STEPS. A step is { w, t1, d2 }, all in frames:
//   w   frames the runner stands still first (step 0: on reaching the section's waiting spot, sec.wx; later steps: on landing)
//   t1  frames after that (or after the waiting spot is reached, for step 0) he presses jump; null = he does not jump
//   d2  frames after the first press he presses it again (the double jump); null = he does not
// He holds right all the time except while he waits. A step ends when he lands; the next step counts from the landing; the
// section ends when he is on the ground at sec.ex or further on. Every press is one frame long (the engine needs the key let go
// between presses). Nothing here reads anything a player could not see: the pits, the platforms, the hazards' tells.
window.__rs = (function(){
  var K = KEYS, FRAME_CAP = 240;
  function YOU(){ return fighters.find(function(f){ return f.you; }); }
  function hold(o){ down[K.left]=!!o.left; down[K.right]=!!o.right; down[K.jump]=!!o.jump; down[K.down]=!!o.down; down[K.special]=!!o.special; down[K.attack]=!!o.attack; down[K.smash]=!!o.smash; }

  // ---- the saved state: every fighter on the lane (him and Marshmallow: the runners are not in the solved world) and whatever the lane's hazards remember ----
  function snap(){
    return { T:hazardT, fr:RACE.frames, lx:RACE.lineX, fs:fighters.map(function(f){ return (f.dead && !f._marsh && !f.you) ? null : Object.assign({}, f); }), pl:worldPlats.slice(),
      cr:RACE.crumbles.map(function(c){ return [c.t, c.gone]; }), fk:(RACE.fakes || []).map(function(c){ return [c.t, c.gone]; }),
      ca:RACE.cannons.map(function(c){ return [c.fired, c.at]; }), bu:RACE.bullets.map(function(b){ return Object.assign({}, b); }),
      pi:RACE.pianos.map(function(p){ return [p.state, p.t]; }), vo:RACE.voices.map(function(v){ return v.fired; }),
      wa:RACE.waves.map(function(w){ return Object.assign({}, w); }), fe:RACE.ferries.map(function(f){ return f.plat.x; }) };
  }
  function restore(S){
    fighters.forEach(function(f, i){ var k, g = S.fs[i]; if(!g) return; for(k in f) if(!(k in g)) delete f[k]; Object.assign(f, g); });
    hazardT = S.T; RACE.frames = S.fr; RACE.lineX = S.lx; worldPlats = S.pl.slice();
    RACE.crumbles.forEach(function(c, i){ c.t = S.cr[i][0]; c.gone = S.cr[i][1]; });
    (RACE.fakes || []).forEach(function(c, i){ c.t = S.fk[i][0]; c.gone = S.fk[i][1]; });
    RACE.cannons.forEach(function(c, i){ c.fired = S.ca[i][0]; c.at = S.ca[i][1]; });
    RACE.bullets = S.bu.map(function(b){ return Object.assign({}, b); });
    RACE.pianos.forEach(function(p, i){ p.state = S.pi[i][0]; p.t = S.pi[i][1]; });
    RACE.voices.forEach(function(v, i){ v.fired = S.vo[i]; });
    RACE.waves = S.wa.map(function(w){ return Object.assign({}, w); });
    RACE.ferries.forEach(function(f, i){ f.plat.x = S.fe[i]; });
  }

  // ---- the player of a plan: what he presses this frame, given what he sees now ----
  function newDriver(sec, steps){ return { sec:sec, steps:steps, i:0, ph:'approach', t:0, air:false, pressed:false, done:false }; }
  function cloneDriver(P){ return Object.assign({}, P); }
  // after a frame: a jump that is under way ends when he is back on the ground, and then the next step begins
  function observe(P, you){
    if(!P.pressed) return;
    if(!you.onground) P.air = true;
    else if(P.air){ P.i++; P.ph = 'landed'; P.t = 0; P.pressed = false; P.air = false; }
  }
  // before a frame: what he presses (right unless he is waiting; jump on the frames the plan says)
  function inputs(P, you){
    var o = { right:true, left:false, jump:false, down:false }, st = P.steps[P.i];
    if(!st){ P.done = true; return o; }
    if(P.ph === 'approach'){ if(you.x < P.sec.wx) return o; P.ph = 'wait'; P.t = 0; }
    if(P.ph === 'landed'){ P.ph = 'wait'; P.t = 0; }
    if(P.ph === 'wait'){ if(P.t < st.w){ P.t++; o.right = false; return o; } P.ph = 'run'; P.t = 0; }
    // run: the press frames count from the first frame he is running again
    if(st.t1 !== null){
      if(P.t === st.t1){ o.jump = true; P.pressed = true; }
      else if(st.d2 !== null && P.pressed && P.t === st.t1 + st.d2) o.jump = true;
    } else if(you.onground && you.x >= P.sec.ex) P.done = true;
    P.t++;
    return o;
  }

  // ---- playing a step out on the real engine, from a saved state ----
  function frame(o, free){ STATS.frames++; var you = YOU(); hold(o); if(free) RACE.lineX = you.x - 5000; step(); }   // free: the red line is kept far behind (a rollout)
  function failed(you){ return !!(you.dead || RACE.over || you._raceBumpT > 0 || you.hitstun > 0 || you.y > RACE.floorY + 200); }
  // S: the saved state; isFirst: the step starts on the way in (step 0) or on a landing; st: the step.
  // -> { ok, fin, end } ok: he lands (or, with no jump, reaches the end) with no bump and no fall; fin: the section is over;
  //    end: the saved state at the landing (when asked for). A section that is over is also checked for TAIL more frames of running.
  var TAIL = 20;
  // every play-out from a saved state is remembered on it (the same step is asked about again and again: by the search, by the room of a wait, by the windows)
  function tryStep(S, isFirst, sec, st, wantEnd){
    var cache = S.cache || (S.cache = {}), key = (isFirst ? 1 : 0) + '|' + st.w + '|' + st.t1 + '|' + st.d2, hit = cache[key];
    if(hit && (!wantEnd || hit.end || !hit.ok)) return hit;
    return (cache[key] = playStep(S, isFirst, sec, st, wantEnd));
  }
  var STATS = { plays:0, frames:0 };
  function playStep(S, isFirst, sec, st, wantEnd){
    STATS.plays++;
    restore(S);
    var you = YOU(), P = newDriver(sec, [st]), n = 0, r = { ok:false, fin:false, end:null };
    if(!isFirst) P.ph = 'landed';
    while(n < FRAME_CAP){
      var o = inputs(P, you);
      if(P.done) break;
      frame(o, true); observe(P, you); n++;
      if(failed(you)) return r;
      if(P.i >= 1) break;
    }
    if(!(P.i >= 1 || P.done)) return r;
    r.fin = you.onground && you.x >= sec.ex;
    if(!P.done && P.i >= 1 && !r.fin){ r.ok = true; if(wantEnd) r.end = snap(); return r; }
    if(!r.fin) return r;
    var keep = wantEnd ? snap() : null;
    for(var k = 0; k < TAIL; k++){ frame({ right:true }, true); if(failed(you)) return r; }
    r.ok = true; r.end = keep;
    return r;
  }

  // ---- which plans work from a state, and how much room each leaves ----
  // The room of a plan (m) is how many frames either press can be early or late, each on its own, with the step still working: a single
  // jump's is half the length of the run of takeoff frames that work; a double's is the radius of the biggest square of (first, second)
  // press times that all work. Presses are searched every frame for the first jump, and every third frame for the second and then
  // looked at closely around what worked (a window of three frames always holds one of the third frames).
  function candidates(S, isFirst, sec, w, opt){
    var memo = {}, T1 = isFirst ? sec.t1max : 48, D2MAX = 41, out = [], t, a, b, run = [];
    function ev(t1, d2){ var k = t1 + '|' + d2; if(!(k in memo)) memo[k] = tryStep(S, isFirst, sec, { w:w, t1:t1, d2:d2 }, false).ok; return memo[k]; }
    function boxOk(c, r){ for(var da = -r; da <= r; da++) for(var db = -r; db <= r; db++){ var A = c[0] + da, B = c[1] + db; if(A < 0 || A > T1 || B < 2 || B > D2MAX || !ev(A, B)) return false; } return true; }
    function radius(c){ var m = 0; if(!ev(c[0], c[1])) return -1; while(m < 5 && boxOk(c, m + 1)) m++; return m; }
    if(opt.nojump !== false && ev(null, null)) out.push({ w:w, t1:null, d2:null, m:99 });
    var seenT = {};   // single jumps: looked for every third frame (a run of 3 always holds one), then each run that works is followed out to both ends
    for(t = 0; t <= T1; t += 3) if(ev(t, null) && !seenT[t]){
      var lo = t, hi = t;
      while(lo - 1 >= 0 && ev(lo - 1, null)) lo--;
      while(hi + 1 <= T1 && ev(hi + 1, null)) hi++;
      for(var q = lo; q <= hi; q++) seenT[q] = 1;
      out.push({ w:w, t1:lo + ((hi - lo) >> 1), d2:null, m:(hi - lo)/2 });
    }
    if(opt.double !== false && !sec.nodouble && out.reduce(function(m, c){ return Math.max(m, c.m); }, -1) < opt.want){
      var hits = [];
      for(a = 0; a <= T1; a += 3) for(b = 2; b <= D2MAX; b += 3) if(ev(a, b)) hits.push([a, b]);
      var scored = hits.map(function(c){ return { c:c, m:radius(c) }; }).sort(function(p, q){ return q.m - p.m; }).slice(0, 3), seen = {};
      scored.forEach(function(p){   // the middle of the region around a hit: the best of its neighbours
        var best = p;
        for(var da = -2; da <= 2; da++) for(var db = -2; db <= 2; db++){ var c = [p.c[0] + da, p.c[1] + db], m = radius(c); if(m > best.m) best = { c:c, m:m }; }
        var k = best.c.join('|'); if(!seen[k]){ seen[k] = 1; out.push({ w:w, t1:best.c[0], d2:best.c[1], m:best.m }); }
      });
    }
    return out.filter(function(c){ return c.m >= opt.min; }).sort(function(p, q){ return (q.m - p.m) || ((p.d2 === null ? 0 : 1) - (q.d2 === null ? 0 : 1)) || ((p.t1 === null ? 0 : p.t1) - (q.t1 === null ? 0 : q.t1)); });
  }
  // depth first through the section's steps: the best few plans of each step, each followed by a solution of what is left
  function waitsOf(sec, isFirst){ return isFirst ? sec.waits : (sec.waitsL || [0]); }
  function solveFrom(S, isFirst, sec, depth, opt, wlist){
    var all = waitsOf(sec, isFirst), ws = wlist || all;
    for(var wi = 0; wi < ws.length; wi++){
      var cs = candidates(S, isFirst, sec, ws[wi], opt).slice(0, 4);
      for(var ci = 0; ci < cs.length; ci++){
        var c = cs[ci], r = tryStep(S, isFirst, sec, { w:c.w, t1:c.t1, d2:c.d2 }, true);
        if(!r.ok) continue;
        if(all.length > 1){   // a wait has to be a window too: the start of the crossing can be early or late by frames and still work
          var wr = runAround(function(x){ return tryStep(S, isFirst, sec, { w:x, t1:c.t1, d2:c.d2 }, false).ok; }, c.w, 0, all[all.length - 1] + 12, 14);
          if(wr[1] - wr[0] + 1 < opt.wmin) continue;
        }
        if(r.fin) return [c];
        if(depth < 9){ var rest = solveFrom(r.end, false, sec, depth + 1, opt); if(rest) return [c].concat(rest); }
      }
    }
    return null;
  }

  // ---- a section: solved, its wait put in the middle of the waits that work, and the room of every press measured ----
  function runAround(f, v0, lo, hi, cap){   // the run of values around v0 for which f(v) is true: [first, last]
    var a = v0, b = v0;
    while(a - 1 >= lo && v0 - a < cap && f(a - 1)) a--;
    while(b + 1 <= hi && b - v0 < cap && f(b + 1)) b++;
    return [a, b];
  }
  function windowsOf(S0, sec, steps){
    var S = S0, out = [];
    for(var i = 0; i < steps.length; i++){
      var st = steps[i], first = i === 0, T1 = first ? sec.t1max : 48, w = { t1:null, d2:null, w:null };
      var ok = function(t1, d2, ww){ return tryStep(S, first, sec, { w:ww, t1:t1, d2:d2 }, false).ok; };
      if(st.t1 !== null){ var r1 = runAround(function(t){ return ok(t, st.d2, st.w); }, st.t1, 0, T1, 10); w.t1 = r1[1] - r1[0] + 1; }
      if(st.d2 !== null){ var r2 = runAround(function(d){ return ok(st.t1, d, st.w); }, st.d2, 2, 41, 10); w.d2 = r2[1] - r2[0] + 1; }
      var wl = waitsOf(sec, first);
      if(wl.length > 1){ var r3 = runAround(function(x){ return ok(st.t1, st.d2, x); }, st.w, 0, wl[wl.length - 1] + 12, 14); w.w = r3[1] - r3[0] + 1; }
      out.push(w);
      var nx = tryStep(S, first, sec, st, true); if(!nx.ok || !nx.end) break; S = nx.end;
    }
    return out;
  }
  function solveSection(S0, sec, optIn){
    var opt = Object.assign({ min:2, want:4, wmin:5 }, optIn || {}), steps = solveFrom(S0, true, sec, 0, opt);   // every press can be early or late by 2 frames, on its own and with the other, and a wait by 2 frames either way
    if(!steps) return null;
    steps = steps.map(function(c){ return { w:c.w, t1:c.t1, d2:c.d2 }; });
    var S = S0;   // the waits of every step, each put at the start of the waits that work and a few frames on, never to the middle of a long one (waiting costs the lead)
    for(var i = 0; i < steps.length; i++){
      var first = i === 0, wl = waitsOf(sec, first), st = steps[i];
      if(wl.length > 1){
        var okw = function(x){ return tryStep(S, first, sec, { w:x, t1:st.t1, d2:st.d2 }, false).ok; };
        var run = runAround(okw, st.w, 0, wl[wl.length - 1] + 12, 14), wc = run[0] + Math.min((run[1] - run[0]) >> 1, 4);
        if(wc !== st.w){
          var again = solveFrom(S, first, sec, 0, opt, [wc]);
          if(again) steps = steps.slice(0, i).concat(again.map(function(c){ return { w:c.w, t1:c.t1, d2:c.d2 }; }));
        }
      }
      var nx = tryStep(S, first, sec, steps[i], true); if(!nx.ok || !nx.end) break; S = nx.end;
    }
    var win = windowsOf(S0, sec, steps);
    return { steps:steps, win:win, room:roomOf(win) };
  }
  // the room of a section: its tightest press, in frames (the length of the run of frames that work around it)
  function roomOf(win){
    var m = 99;
    win.forEach(function(w){ if(w.t1 !== null) m = Math.min(m, w.t1); if(w.d2 !== null) m = Math.min(m, w.d2); if(w.w !== null) m = Math.min(m, w.w); });
    return m;
  }

  // ---- the lane: the scripted runner, and the plans where the lane has a section ----
  // opt: { bot: the scripted runner's inputs for this frame, programs: [{ k, steps }] to play back (without them every section is solved as
  // he comes to it), search: { min, want } }. ctl(you) is what he presses this frame; seen[i] is where and when section i began and ended.
  function controller(opt){
    var secs = RACE.obstacles.filter(function(o){ return o.sec; }), C = { si:0, P:null, seen:[], recs:[], failed:-1, secs:secs.length };
    C.ctl = function(you){
      if(C.P) observe(C.P, you);
      if(!C.P && C.si < secs.length && you.onground && you.x >= secs[C.si].sec.sx){
        var ob = secs[C.si], rec = opt.programs ? opt.programs[C.si] : null;
        if(!rec){
          var S = snap(), res = solveSection(S, ob.sec, opt.search); restore(S);
          rec = { k:ob.k, steps:res ? res.steps : null, win:res ? res.win : null, room:res ? res.room : null };
        }
        C.seen[C.si] = { frame:RACE.frames, x:you.x };
        if(opt.verify && rec.steps){ var S2 = snap(), win = windowsOf(S2, ob.sec, rec.steps); restore(S2); C.seen[C.si].win = win; C.seen[C.si].room = roomOf(win); }   // the room measured again, here, on this run
        C.recs[C.si] = rec;
        if(!rec.steps){ C.failed = C.si; C.si = secs.length; }
        else C.P = newDriver(ob.sec, rec.steps);
      }
      if(C.P){
        var o = inputs(C.P, you);
        if(!C.P.done) return o;
        Object.assign(C.seen[C.si], { endFrame:RACE.frames, endX:you.x });
        C.P = null; C.si++;
      }
      return opt.bot(you);
    };
    return C;
  }
  // a fingerprint of the lane's geometry and hazards: a plan is for one lane, and says so
  function laneHash(){
    var s = JSON.stringify([RACE.obstacles, worldPlats.map(function(p){ return [p.x, p.y, p.w, p.h, p.solid ? 1 : 0]; }), RACE.traps, RACE.hazards, RACE.cannons.map(function(c){ return [c.trig, c.cx, c.n, c.gap, c.bs, c.hi]; }),
      RACE.pendulums, RACE.crumbles.map(function(c){ return [c.x, c.w, c.delay]; }), (RACE.fakes || []).map(function(c){ return [c.x, c.w, c.delay]; }), RACE.pits]), h = 2166136261;
    for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16);
  }
  return { snap:snap, restore:restore, tryStep:tryStep, candidates:candidates, solveSection:solveSection, controller:controller, stats:function(){ return STATS; }, laneHash:laneHash, roomOf:roomOf, windowsOf:windowsOf, newDriver:newDriver, inputs:inputs, observe:observe, YOU:YOU, hold:hold };
})();
