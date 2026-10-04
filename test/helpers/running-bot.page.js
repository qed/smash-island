// PAGE CODE, not a module: test/running-race.test.js splices this into the body of the function it W.eval()s in the booted game (it needs
// `you`, `fighters`, `hold` and the game's globals in scope), and scripts/solve-running-lane.mjs does the same.
//
// THE SCRIPTED RUNNER. It holds right and reads the lane the way a player reads the screen. Gaps: a jump at the edge and, for the wide
// ones, the second jump late in the descent. Walls: one jump, or two for the tall ones (early, then again ten frames on). Bars: hop the
// step, press DOWN on the ledge. Pistons: run in when the block is rising, wait in front of it when it is not. Pianos: nothing -- keep
// running. Voices: one jump when the wave is a jump away. Memories: over them, a jump and the second at the top. At the edge: stop, hold
// smash until the meter reads what it wants, let go; then wait for the bridge and cross. Everything it reads is on the screen for a player
// too, and it never dodges an AI runner. The lane's hard sections (the ones with a `sec`) are not its to read: running-solver.page.js's
// plans play those (__run takes the controller that switches between the two).
//
// __bot(you) -> this frame's inputs; __run(you, hold, maxFrames, ctl) plays the lane with ctl (default __bot) and reports how it went.

var __opts = { charge:125 };
var __bot = function(you){
  var o = { right:true, jump:false, down:false, smash:false }, fy = RACE.floorY, ahead = you.x + you.r;
  if(RACE.bridge) return o;
  var m = fighters.find(function(q){ return q._marsh; });
  if(ahead > RACE.edge - 80){
    o.right = false;
    if(RACE.thrown || RACE.marshOver) return o;
    if(you.onground && Math.abs(you.vx) < 0.6 && m && Math.abs(m.x - you.x) < RACE_THROW_REACH){
      if(RACE.charge) o.smash = RACE.charge.t < __opts.charge;   // holding, until the meter reads what I want
      else o.smash = !you._smRaw;                                 // not charging: a fresh press (the key up for a frame first)
    }
    return o;
  }
  var wv = RACE.waves.find(function(w){ return w.x + w.th > ahead - you.r*2 && w.x - ahead < (MAXVX + w.sp)*18; });
  if(wv && you.onground) o.jump = true;
  var bl = RACE.bullets.find(function(b){ return b.y > fy - 40 && b.x + b.w > ahead - you.r*2 && b.x - ahead < (MAXVX + b.sp)*18; });   // a low shot coming: one jump
  if(bl && you.onground) o.jump = true;
  var ob = RACE.obstacles.find(function(b){ return b.x1 > you.x - 20; });
  if(!ob) return o;
  var lead = 34 + Math.max(0, you.vx)*3;
  if(ob.k==='gap'){
    if(you.onground && ob.x0 - ahead < lead && ob.x0 - ahead > -60) o.jump = true;
    else if(!you.onground && you.vy > 0 && you.jumps > 0 && you.x > ob.x0 && you.x < ob.x1 && you.y + you.r > fy - 30) o.jump = true;
  } else if(ob.k==='wall'){
    if(fy - ob.top <= 105){
      if(you.onground && ob.x0 - ahead < 70 + Math.max(0, you.vx)*2 && ob.x0 - ahead > -10) o.jump = true;
      else if(!you.onground && you.jumps > 0 && you.vy > 0 && you.x < ob.x1 && you.y + you.r > ob.top - 6) o.jump = true;
    } else {   // a wall a single jump cannot top: jump early, and again ten frames later
      if(you.onground && ob.x0 - you.x < 215 && ob.x0 - you.x > 20) o.jump = true;
      else if(!you.onground && you.jumps > 0 && you.vy < -5 && you.vy > -7.2) o.jump = true;
      else if(!you.onground && you.jumps > 0 && you.vy > 0 && you.x < ob.x1 && you.y + you.r > ob.top - 6) o.jump = true;
    }
  } else if(ob.k==='bar'){
    if(you.onground && Math.abs(you.y + you.r - ob.ledgeY) < 3){ if(ob.barX0 - ahead < 70) o.down = true; }
    else if(you.onground && ob.stepX - ahead < 70 + Math.max(0, you.vx)*2 && ob.stepX - ahead > -10) o.jump = true;
    else if(!you.onground && you.jumps > 0 && you.vy > 0 && you.x < ob.stepX + 40 && you.y + you.r > ob.ledgeY - 6) o.jump = true;
  } else if(ob.k==='piston'){
    var h = RACE.hazards.find(function(z){ return z.x===ob.x0; }), d = ob.x0 - ahead;
    if(h && d > -10 && d < 260 && you.onground){
      var P = h.period, tc = ((h.w + 2*you.r)/MAXVX + 3)/P;   // crossing it, and three frames to spare, as a part of its cycle
      var eta = Math.max(0, d)/MAXVX + (you.vx < 3 ? 6 : 0), phE = (((hazardT + eta)/P) + h.phase) % 1;
      if(!(phE >= 0.69 || phE <= 0.31 - tc) && d < 90){ o.right = false; return o; }
    }
  } else if(ob.k==='ferry'){
    var fl = RACE.ferries.filter(function(z){ return z.g === ob.g; });
    var onf = fl.find(function(z){ return you.onground && Math.abs(you.y + you.r - z.y) < 3 && you.x > z.plat.x - 4 && you.x < z.plat.x + z.w + 4 && you.x > ob.x0 + 5; });
    if(onf){   // riding: walk to the front of it and wait there; hop off when the far edge is near
      var front = onf.plat.x + onf.w, nearFar = ob.x1 - front <= 70;
      o.right = nearFar || you.x < front - 34; o.jump = nearFar && you.onground && you.x > front - 60; return o;
    }
    // wait at the edge for one to come in: go when one is docked, or is coming in to dock (within 60 px of the edge and slowing to it: it docks for about ten frames, and he needs
    // those to be at the edge as it arrives, not to start running when it has already left)
    var coming = function(z){ return z.plat.x <= ob.x0 + 10 || (z.plat.x <= ob.x0 + 60 && Math.sin(2*Math.PI*(hazardT/z.period + z.phase)) < 0); };
    if(ob.x0 - ahead < 40 && !fl.some(coming)){ o.right = false; if(you.onground && you.vx > 1) o.left = true; return o; }
  } else if(ob.k==='spikes'){
    if(you.onground && ob.x0 - ahead < 34 && ob.x0 - ahead > -10) o.jump = true;   // one jump over the strip
  } else if(ob.k==='ceiling'){
    if(you.onground && ob.strip.x0 - ahead < 34 && ob.strip.x0 - ahead > -10) o.jump = true;   // one jump under the tips, never a second
  } else if(ob.k==='spring' && ob.mode==='trap'){
    if(you.onground && ob.pad.x0 - ahead < 60 && ob.pad.x0 - ahead > -10) o.jump = true;   // hop the pad under the tips (a pad before a field of spikes is run onto)
  } else if(ob.k==='fire'){
    // a run of vents: go when a runner setting off from where he is, holding right, would cross every one of them while it rests
    var vs = RACE.traps.filter(function(z){ return z.k==='fire' && z.g===ob.g && z.x + z.w > you.x - you.r; }), d0 = vs[0].x - ahead;
    if(d0 > -10 && d0 < 120 && you.onground){
      var arrive = function(dist){ var v = Math.max(0, you.vx), x = 0, t = 0; while(x < dist && t < 300){ v = Math.min(MAXVX, v + 0.9); x += v; t++; } return t; };
      var bad = false;
      vs.forEach(function(z){ var di = z.x - ahead, ta = arrive(di), tb = arrive(di + z.w + 2*you.r);
        for(var u = ta - 2; u <= tb + 2; u++){ var pf = (((hazardT + u)/z.period) + z.phase) % 1; if(pf >= z.warn/z.period && pf < (z.warn + z.burn)/z.period) bad = true; } });
      if(bad && d0 < 90){ o.right = false; return o; }
    }
  } else if(ob.k==='pendulum'){
    // what a player only approximates: look at the swing and take the first way through -- run on, or jump in a few frames --
    // that misses the saw; if there is none yet, wait where you are
    var pe = RACE.pendulums.find(function(z){ return z.px === ob.px; }), dz = ob.x0 - ahead;
    if(pe && dz < 150 && you.x < pe.px + 120){
      var path = function(jumpAt){   // the runner's centre, frame by frame, running on from here and jumping at frame jumpAt
        var pts = [], v = Math.max(0, you.vx), x = you.x, tj = -1;
        for(var k = 0; k < 130; k++){ v = Math.min(MAXVX, v + 0.9); x += v; if(jumpAt !== null && k >= jumpAt && k < jumpAt + 40) tj = k - jumpAt; else tj = -1;
          pts.push({ x:x, y:you.y - (tj >= 0 ? Math.max(0, 11.88*(tj + 1) - 0.31*(tj + 1)*tj) : 0) }); if(x > pe.px + pe.L*Math.sin(pe.A) + pe.R + 60) break; }
        return pts; };
      var clear = function(jumpAt){ var pts = path(jumpAt); for(var k = 0; k < pts.length; k++){ var bb = racePendulumPos(pe, hazardT + k + 1); if(Math.hypot(pts[k].x - bb.x, pts[k].y - bb.y) < pe.R + you.r*0.85 + 4) return false; } return true; };
      var plan = null;
      if(clear(null)) plan = 'run'; else for(var jj = 0; jj <= 70 && plan === null; jj += 2) if(clear(jj)) plan = jj;
      if(plan === null){ if(dz < 90){ o.right = false; return o; } }
      else if(plan === 0 && you.onground) o.jump = true;
    }
  } else if(ob.k==='memory'){
    if(you.onground && ob.x0 - ahead < 90 && ob.x0 - ahead > -10) o.jump = true;
    else if(!you.onground && you.jumps > 0 && you.vy > 0 && you.x < ob.x1 - 20) o.jump = true;
  }
  return o;
};
var __run = function(you, hold, maxFrames, ctl){
  var r = { frames:0, minLead:1e9, worst:-1e9, worstSec:-1e9, behindLine:0, lost:0, leadAtThrow:null, chargeMax:0, held:0, bumps:0 }, n = 0, pb = false;
  for(; n < maxFrames && running; n++){
    hold((ctl || __bot)(you)); step();
    var bb = you._raceBumpT > 0; if(bb && !pb) r.bumps++; pb = bb;
    var mm = fighters.find(function(q){ return q._marsh; });
    if(!you.dead) r.minLead = Math.min(r.minLead, you.x - RACE.lineX);
    if(mm.dead) r.lost++;
    if(!RACE.marshOver && !RACE.thrown && !RACE.charge){ r.worst = Math.max(r.worst, you.x - mm.x); if(raceSectionAt(you.x)) r.worstSec = Math.max(r.worstSec, you.x - mm.x); if(mm.x - mm.r*0.5 <= RACE.lineX) r.behindLine++; }
    if(RACE.charge){ r.held++; r.chargeMax = Math.max(r.chargeMax, RACE.charge.t); if(r.leadAtThrow === null) r.leadAtThrow = you.x - RACE.lineX; }
  }
  hold({});
  r.frames = n;
  return r;
};
