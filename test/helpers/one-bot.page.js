// PAGE CODE, not a module: test/one-winnable.test.js reads this file and W.eval()s it inside the booted game.
//
// A scripted player for One's story fight, standing in for the person who reaches her. It plays Lightning the way the
// fight is meant to be read and no better: it steps off her marked spots, lanes and lines once a wind-up is close, walks
// into a gap in a Screechy ring, jumps a shot coming at it and sidesteps one coming down, keeps to Chain Bolt range, stays
// close to ground Power Ungrounded, and goes for the ghost first. It never looks ahead, never uses a platform on purpose
// and never recovers a launch. (It is weaker than the player she is for: it falls to the Boss Rush gauntlet by its fourth
// boss, and everyone who reaches One has cleared the gauntlet with Lightning.)
//
// window.__oneBot(L, one) -> the inputs for this frame, for NET.inputs with L.controller = 'remote'.
window.__oneBot = (function(){
  var jp = false, lastDir = 1;
  // the nearest hostile shot that will pass within reach in the next 22 frames
  function threat(L){
    var best = null;
    for (var i = 0; i < projectiles.length; i++){
      var p = projectiles[i];
      var hostile = p.owner === -2 || (p.ownerObj && p.ownerObj.team === -1);
      if (!hostile || (p.delay > 0)) continue;
      var dx = p.x - L.x, dy = p.y - hurtCY(L), vx = p.vx || 0, vy = p.vy || 0, v2 = vx*vx + vy*vy;
      if (v2 < 0.01){ if (Math.hypot(dx, dy) < (p.r||8) + 40) best = best || { p:p, t:0 }; continue; }
      var t = -(dx*vx + dy*vy)/v2; if (t < 0 || t > 22) continue;
      var cx = dx + vx*t, cy = dy + vy*t;
      if (Math.hypot(cx, cy) < (p.r||8) + 30 && (!best || t < best.t)) best = { p:p, t:t };
    }
    return best;
  }
  // SCREECHY is a 360-degree ring with a few gaps: find the nearest gap and walk into its line (9 = already in one).
  function ringDodge(L){
    var ring = [], cx = null, cy = null;
    for (var i = 0; i < projectiles.length; i++){ var p = projectiles[i];
      if (!p.ring || p.owner !== -2) continue;
      if (!p._botC) p._botC = [p.x - p.vx, p.y - p.vy];
      ring.push(p); cx = p._botC[0]; cy = p._botC[1]; }
    if (ring.length < 30) return 0;
    var ly = hurtCY(L), dL = Math.hypot(L.x - cx, ly - cy), rr = Math.hypot(ring[0].x - cx, ring[0].y - cy);
    if (rr > dL + 20 || dL - rr > 520) return 0;   // passed already, or still far off
    var angs = ring.map(function(p){ return Math.atan2(p.y - cy, p.x - cx); }).sort(function(a,b){ return a-b; });
    var gaps = [];
    for (var k = 0; k < angs.length; k++){ var a = angs[k], b = (k+1 < angs.length) ? angs[k+1] : angs[0] + Math.PI*2;
      if (b - a > 0.12) gaps.push((a + b)/2); }
    if (!gaps.length) return 0;
    var diff = function(a, b){ var d = a - b; while (d > Math.PI) d -= Math.PI*2; while (d < -Math.PI) d += Math.PI*2; return Math.abs(d); };
    var at = function(x){ return Math.atan2(ly - cy, x - cx); };
    var best = 1e9, bx = 0;
    for (var g = 0; g < gaps.length; g++){ for (var step = -1; step <= 1; step += 2){
      for (var dx = 0; dx <= 400; dx += 20){ var x = L.x + step*dx, d = diff(at(x), gaps[g]);
        if (d < 0.05){ if (dx < best){ best = dx; bx = step; } break; } } } }
    if (best === 0) return 9;
    return best < 1e9 ? bx : 0;
  }
  // the way out of a jaw that is lit over you: away from its middle (0: you are not in one)
  function outOfJaws(L, zones){
    for (var i = 0; i < zones.length; i++){ var z = zones[i];
      if (L.x > z.x0 - 10 && L.x < z.x1 + 10 && Math.abs(feetY(L) - z.y) < 40) return Math.sign(L.x - (z.x0 + z.x1)/2) || lastDir; }
    return 0;
  }
  return function(L, one){
    var inp = { left:false, right:false, jump:false, down:false, attack:false, special:false, smash:false };
    var slab = worldPlats.find(function(p){ return p.solid && !p.wall; }) || { x:0, w:WW, y:groundY() };
    var lo = slab.x + 160, hi = slab.x + slab.w - 160;
    var g = (one._ghost && !one._ghost.dead) ? one._ghost : null;
    var tgt = g || one;
    var move = 0, wantJump = false;
    var dxT = tgt.x - L.x, dist = Math.hypot(dxT, tgt.y - L.y);
    // offence: where to stand
    var want = g ? 40 : (one._ungrounded ? 90 : 150);   // on the ghost; close enough to ground her; in jab-and-bolt range
    var gap = Math.abs(dxT) - (g ? 0 : one.r*0.5);
    if (gap > want + 30) move = Math.sign(dxT);
    else if (gap < want - 60 && !g && !one._ungrounded) move = -Math.sign(dxT);
    // defence: her wind-ups, read late, the way a person reacts to a tell
    if (one._tel > 0){
      var k = one._telKind, tl = one._tel;
      if (k === 'zap' && one._telX != null && Math.abs(L.x - one._telX) < 70 && tl < 24) move = Math.sign(L.x - one._telX) || lastDir;
      // FOLDING ISLAND! (it was INCOMING!): the jaw over the floor stretch round you is lit for most of a second -- run out of it
      if (k === 'fold' && one._foldZones && tl < 44) move = outOfJaws(L, one._foldZones) || move;
      if (k === 'hands' && one._handSpots){ for (var i = 0; i < one._handSpots.length; i++){ var sp = one._handSpots[i];
        if (Math.abs(L.x - sp.x) < 220 && tl < 30) move = Math.sign(L.x - sp.x) || lastDir; } }
      if (k === 'orbitkick'){ var dir = one._telDir || one.face || 1, y = one._kickY;
        if (dir*(L.x - one.x) > -one.r*0.5 && Math.abs(hurtCY(L) - y) < 110){ if (tl < 16) wantJump = true; } }
      if (k === 'eyelasers'){ var T = oneTier(one, 'eyelasers'); if (tl <= T.lock){ move = Math.sign(L.x - one._aimX) || lastDir; if (tl < 6) wantJump = true; } }
      if (k === 'mindread' && tl < 18 && Math.hypot(L.x - one.x, L.y - one.y) < 380) move = -Math.sign(one.x - L.x) || lastDir;
      if (k === 'moonrocks' && tl < 8) move = lastDir;
      if (k === 'screechy' && tl < 20 && Math.abs(L.x - one.x) < 260) move = -Math.sign(one.x - L.x) || lastDir;
    }
    // ...and the next fold of a chain, lit where you stood when the last one shut
    for (var q = 0; q < oneFx.length; q++){ var fe = oneFx[q]; if (fe.kind === 'foldwarn' && fe.life < fe.max - 6) move = outOfJaws(L, fe.zones) || move; }
    var rd = ringDodge(L);
    if (rd === 9) move = 0; else if (rd) move = rd;
    var th = rd ? null : threat(L);
    if (th){ var p = th.p;
      if (Math.abs(p.vy||0) > Math.abs(p.vx||0)*1.2) move = Math.sign(L.x - p.x) || lastDir;
      else wantJump = true; }
    // stay on the floor, away from the pits at both ends
    if (L.x < lo) move = 1; else if (L.x > hi) move = -1;
    if (L.x < slab.x + 40 || L.x > slab.x + slab.w - 40){ move = L.x < slab.x + slab.w/2 ? 1 : -1; wantJump = true; }
    if (move > 0) inp.right = true; else if (move < 0) inp.left = true;
    if (move) lastDir = move;
    // jump is edge-triggered: release between presses, press again for the double jump
    if (wantJump && !jp && (L.onground || (L.jumps > 0 && L.vy > -2))){ inp.jump = true; jp = true; } else jp = false;
    // attacks: face the target first
    var faceOk = Math.sign(dxT) === L.face || Math.abs(dxT) < 10;
    if (!move && !faceOk){ if (dxT > 0) inp.right = true; else inp.left = true; }
    var reachJab = (g ? L.r + 40 : one.r + 50);
    var boltReach = g ? 250 : 250 + one.r;
    if (faceOk && dist < boltReach && L.spCd <= 0) inp.special = true;
    else if (faceOk && Math.abs(dxT) < reachJab && Math.abs(tgt.y - L.y) < (g ? 60 : one.r + 40)) inp.attack = (hazardT % 3) !== 0;
    if (faceOk && Math.abs(dxT) < reachJab && L.smCd <= 0 && !th) inp.smash = true;
    return inp;
  };
})();
