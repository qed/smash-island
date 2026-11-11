import { loadMonolith } from '../helpers/load-monolith.js';
import { SETUP_SRC } from '../helpers/match-setup.js';
const { window: w } = loadMonolith(0xC0FFEE); w.eval(SETUP_SRC);
w.eval(`__setupCustomMatch(['Cheesy','Pen'], 99, 2, 0);`);
console.log(w.eval(`JSON.stringify({WW:WW,gy:groundY(),f0:[fighters[0].x,fighters[0].y,fighters[0].r,fighters[0].onground],land:[0.2,0.3,0.4,0.5,0.6,0.7].map(function(k){return landable(WW*k, groundY()-2)}), plats:platRects().slice(0,6).map(function(p){return [p.x,p.y,p.w,p.h,!!p.solid]})})`));
w.eval('for(let i=0;i<40;i++) step();');
console.log(w.eval(`JSON.stringify(fighters.map(function(f){return [Math.round(f.x),Math.round(f.y),f.onground,f.dead]}))`));
