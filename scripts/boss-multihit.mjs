// EVERY MOVE AGAINST A BOSS. A boss had no hit grace, so a hitbox that lives for several frames landed on it every frame unless the
// move remembers what it hit (a shot's pierce memory, hitCircle's `once`, the burst ring's set): a piercing shot did (A1, `56c6f37`),
// and so did Puffball's Meteor Puff -- "puffball multihitbox on smash. instakills bosses." (the owner, 2026-10-02; `3b681aa`): 721 HP
// in 32 frames, where a fighter takes 22. A boss keeps a grace for each attacking character now ("give bosses by-character iframes",
// the owner, 2026-10-04; bossGraceRec), which stops a second hit of the same character the way a fighter's does, and those per-move
// sets are the second guard. This fires every input of every playable fighter (the seven on the move card, the smash, and
// the smash from 200 px up) at a boss pinned beside them, and at a fighter dummy pinned at the same spot, and prints each move that
// deals the boss more than twice what the fighter takes. PER-FRAME marks one that lands on four or more frames in a row: the bug.
// The rest land harder because a boss's body is big (a shot that went through and was still inside it when the grace ran out; a
// spray of coins all reaching a body 170 px across, and before the grace all of them landing) -- look, but that is not this.
// Run from the repo root (about a minute per 34 fighters):
//
//   node scripts/boss-multihit.mjs                 the whole roster
//   node scripts/boss-multihit.mjs 0 34            a slice (first, count), to run several at once
//
// One game is booted, and its dice are seeded again before every measurement, so a row does not depend on the slice or the order:
// the same build prints the same rows.
import { bootMonolith } from '../test/helpers/smash-golden.js';
import { mulberry32 } from '../test/helpers/prng.js';

const W = bootMonolith(5);
await W.eval('profileReady');
const names = W.eval('ROSTER.filter(function(r){ return r.play; }).map(function(r){ return r.name; })');
const first = Number(process.argv[2] || 0), count = Number(process.argv[3] || names.length);
const MOVES = {
  jab: 'A.atkCd=0; doAttack(A)', ranged: 'A.atkCd=0; doGroundMove(A)', utilt: 'A.atkCd=0; doUpTilt(A)',
  special: 'fireSpecial(A, {})', up: 'fireSpecial(A, {up:true})', down: 'fireSpecial(A, {down:true})',
  finisher: 'doAttackSpecial(A)', smash: 'A.smCd=0; doSmash(A)',
  smashAir: 'A.smCd=0; A.y-=200; A.vy=0; A.onground=false; doSmash(A)',
};
const FRAMES = 90;
const vsFighter = (name, call) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 460, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step();
  [A,D].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; f.fnCd=0; f.armor=0; });
  A.onground = true;
  try { ${call}; } catch(e){ return { err: String(e && e.message || e) }; }
  var hits = D.pct > 30.05 ? 1 : 0, last = D.pct;
  for (var i=0;i<${FRAMES};i++){ step(); D.x = 460; D.y = Math.min(D.y, groundY()-24); D.vx = 0; D.dead = false;
    if (D.pct > last + 0.3) hits++; last = D.pct; }
  return { total: +(D.pct - 30).toFixed(1), hits: hits };
})()`);
const vsBoss = (name, call) => W.eval(`(function(){
  SETTINGS.mode='boss'; SETTINGS.items=false; running=true; BOSSRUSH={active:false,bossIdx:0,cleared:0,defeated:false,loop:0,dmgMult:1};
  worldPlats=[]; summons=[]; projectiles=[]; items=[]; particles=[]; beams=[]; tendrils=[];
  var A=makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }),400,groundY()-24,0);
  A.team=0; A.controller='still'; A.stocks=99; A.face=1; fighters=[A];
  spawnBossRushBoss(); var b=summons[0]; b._atkTimer=1e9; b.x=440; b.hp=b.maxHp=5000; step();
  A.smCd=0; A.spCd=0; A.atkCd=0; A.fnCd=0; A.onground = true;
  try { ${call}; } catch(e){ return { err: String(e && e.message || e) }; }
  var hits = b.hp < 5000 ? 1 : 0, last = b.hp, frames = [];
  for(var i=0;i<${FRAMES};i++){ step(); b.x=440; b.vx=0; if (b.hp < last - 0.3){ hits++; frames.push(i); } last = b.hp; }
  return { total: +(5000-b.hp).toFixed(1), hits: hits, frames: frames };
})()`);
// four or more hits on frames in a row
const perFrame = (fr) => { let run = 1; for (let i = 1; i < fr.length; i++){ run = fr[i] === fr[i - 1] + 1 ? run + 1 : 1; if (run >= 4) return true; } return false; };

let n = 0, shown = 0, bad = 0;
for (const name of names.slice(first, first + count)) {
  for (const [move, call] of Object.entries(MOVES)) {
    W.Math.random = mulberry32(5); const f = vsFighter(name, call);
    W.Math.random = mulberry32(5); const b = vsBoss(name, call);
    n++;
    if (f.err || b.err){ bad++; console.log(`ERROR ${name} ${move}: ${f.err || ''} ${b.err || ''}`); continue; }
    if (b.total > 30 && b.total > 2 * f.total){
      const pf = perFrame(b.frames);
      if (pf) bad++;
      shown++;
      console.log(`${pf ? 'PER-FRAME' : 'harder   '} ${name} ${move}: a fighter takes ${f.total} in ${f.hits} hit(s), the boss ${b.total} in ${b.hits} (frames ${b.frames.slice(0, 12).join(',')})`);
    }
  }
}
console.log(`boss-multihit: ${n} moves of ${Math.min(count, names.length - first)} fighters (${first}..${first + count} of ${names.length}); ${shown} hit a boss harder, ${bad} per-frame or erroring`);
process.exitCode = bad ? 1 : 0;
