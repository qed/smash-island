import { loadMonolith } from '../helpers/load-monolith.js';
import { SETUP_SRC } from '../helpers/match-setup.js';
const [n, dist, slot] = [process.argv[2], +process.argv[3], process.argv[4] || 'smash'];
const { window: w } = loadMonolith(0xC0FFEE); w.eval(SETUP_SRC);
w.eval(`__setupCustomMatch([${JSON.stringify(n)},'Pen'], 99, 2, 0); fighters.forEach(function(f){ f.controller='still'; f.invuln=0; }); for(let i=0;i<30;i++) step();
 var a=fighters[0], b=fighters[1]; a.x=WW*0.5; a.face=1; a.y=groundY()-a.r; a.vy=0; a.vx=0; a.onground=true; b.x=a.x+${dist}; b.y=a.y; b.onground=true; b.vx=0;b.vy=0;b.pct=0;b.invuln=0;a.spCd=0;a.smCd=0;a.atkCd=0;`);
console.log('start', w.eval('[a.x,a.y,a.onground,b.x,b.y,b.onground,b.r,a.r].join()'));
w.eval(slot === 'up' ? 'doUpSpecial(a)' : 'doSmash(a)');
for (let i = 0; i < 60; i++) { w.eval('step()'); if (i % 4 == 0) console.log(i, w.eval('[Math.round(a.x),Math.round(a.y),!!a._sm,!!a._windup,a.rooted,Math.round(b.x),Math.round(b.y),b.pct,b.dead,b.hitstun,projectiles.length].join()')); }
