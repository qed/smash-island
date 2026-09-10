// Solo Boss Rush, per fighter: how far does each one actually GET?
// The previous investigation measured "damage to bosses over 60s", which is not what soloing means.
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from '../../test/helpers/prng.js';
function boot(seed){
  const html=readFileSync('artifacts/V1/index.html','utf8');
  const dom=new JSDOM(html,{url:'http://localhost/',runScripts:'dangerously',pretendToBeVisual:true,
    beforeParse(w){ w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(_t,p)=>(p==='measureText'?()=>({width:0}):p==='canvas'?{width:1100,height:720}:p==='getImageData'?()=>({data:[]}):()=>{}),set:()=>true});
      w.Math.random=mulberry32(seed); w.requestAnimationFrame=()=>0; w.cancelAnimationFrame=()=>{}; }});
  return dom.window;
}
const NAMES = JSON.parse(process.env.NAMES || '["Money"]');
const SEEDS = JSON.parse(process.env.SEEDS || '[5,17,41]');
const FRAMES = Number(process.env.FRAMES || 18000);
const out=[];
for(const name of NAMES){
  let cleared=0, dmg=0, frames=0;
  for(const seed of SEEDS){
    const w=boot(seed); await w.eval('profileReady');
    const r=w.eval(`(function(){
      SETTINGS.mode='boss'; SETTINGS.count=1; SETTINGS.items=false; SETTINGS.stocks=3;
      var R = ROSTER.find(function(r){return r.name===${JSON.stringify(name)};});
      fighters=[ makeFighter(R, WW*0.25, groundY()-60, 0) ];
      fighters[0].team=0; fighters[0].controller='ai'; fighters[0].stocks=3;
      summons=[]; projectiles=[]; items=[]; tendrils=[]; running=true;
      startBossRush();
      var dealt=0, f=0;
      for(; f<${FRAMES}; f++){
        var b = summons.find(function(s){return s.type==='boss'&&s._bossRush;});
        if(!b){ if(!BOSSRUSH.active) break; spawnBossRushBoss(); b = summons[summons.length-1]; }
        var hp0 = b.hp;
        step();
        if(summons.indexOf(b)>=0 && b.hp<hp0) dealt += hp0-b.hp;
        if(!running) break;
      }
      return { cleared: BOSSRUSH.cleared, dealt: Math.round(dealt), frames: f };
    })()`);
    cleared+=r.cleared; dmg+=r.dealt; frames+=r.frames; w.close();
  }
  const n=SEEDS.length;
  out.push({name, cleared:(cleared/n).toFixed(2), dmg:Math.round(dmg/n), frames:Math.round(frames/n)});
}
console.log(JSON.stringify(out));
