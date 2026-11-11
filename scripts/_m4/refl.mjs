import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves4/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/moves4/scripts/helpers/match-setup.js';
const { window: w } = loadMonolith(0xC0FFEE); w.eval(SETUP_SRC);
w.eval(`__setupCustomMatch(['Ruler','Pen'], 99, 2, 0); fighters.forEach(function(f){ f.controller='still'; f.invuln=0; }); for(let i=0;i<30;i++) step();
 var a=fighters[0], b=fighters[1]; a.x=WW*0.5; a.face=1; a.y=groundY()-a.r; a.onground=true; b.x=a.x+70; b.y=a.y; b.onground=true; a.spCd=0; b.invuln=0; a.pct=0; b.pct=0;
 doDownSpecial(a); step(); spawnProj(b,{vx:-8,vy:0,grav:false,dmg:6,kb:5,r:8,color:'#fff',life:80}); window.__n0=projectiles.length;`);
for (let i=0;i<60;i++) w.eval('step()');
console.log('Ruler pct', w.eval('a.pct'), 'Pen pct', w.eval('b.pct'), 'refl left', w.eval('a.reflecting'));
