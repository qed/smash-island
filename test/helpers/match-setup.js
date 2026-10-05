// The match setup the balance tournament, the bot trainer and the bot golden all use: the function we inject into the
// monolith's realm. Kept as a string so it runs INSIDE jsdom's script realm (where SETTINGS/fighters/makeFighter/etc. are
// lexical). It lives here, not in scripts/balance-tournament.mjs, so a test can import it without pulling in that script's
// process-level handlers. Moved verbatim, plus one line: a measurement locks the in-browser adaptation (BOT_ADAPT) off for good, so what
// is played here depends on nothing but the seed and the lineup.
export const SETUP_SRC = `
window.__setupCustomMatch = function(names, stocks, aiLevel, itemRate){
  if(typeof BOT_ADAPT!=='undefined') BOT_ADAPT.lock();
  // Kill every rival mode/flag so we land in a clean plain FFA.
  TESTMODE.active=false; TOURNEY.active=false; TOURNEY_WATCHING=null;
  if(typeof BOSSRUSH!=='undefined') BOSSRUSH.active=false;
  CUSTOM_LEVEL=null; TOURNEY_MATCH_ACTIVE=false; PENDING_TOURNEY=null; window.__netRoster=null;
  SETTINGS.mode='ffa'; SETTINGS.count=names.length; SETTINGS.stocks=stocks;
  // Items OFF by default — random pickups are noise in a balance signal about FIGHTERS. But that
  // default is also why the sweep reports a clean 0.0000 for item-buff durations, which reads like
  // "this stat does not affect balance" and means "this stat was never in the room". Passing a rate
  // turns them on so those knobs can be measured at all.
  SETTINGS.itemRate = (itemRate === undefined || itemRate === null) ? 0 : itemRate;
  AI_LEVEL=aiLevel; LOCAL_PLAYERS=1;
  stage = STAGES.find(s=>s.id==='goiky') || STAGES.find(s=>!s.big) || STAGES[0];  // flat, hazard:null
  resize(); setupWorld();
  const N=names.length;
  fighters=[];
  names.forEach(function(nm,i){
    const r = ROSTER.find(x=>x.name===nm);
    if(!r) throw new Error('unknown fighter: '+nm);
    const sx = WW*(0.08+0.84*i/Math.max(1,N-1));         // same spread as buildFighters' small-FFA branch
    const sy = groundY()-60;
    const f = makeFighter(Object.assign({}, r, {you:false}), sx, sy, i);
    f.stocks=stocks; f.team=i; f.homeBase=null;           // one fighter per team => true FFA
    f.controller='ai'; f.you=false; f.you2=false;         // all AI: nobody waits on a keyboard
    fighters.push(f);
  });
  // mirror beginMatchNow()'s per-match resets
  running=true; paused=false; hazardT=0;
  window.__elimSeq=0; lastKoFrame=0;
  fighters.forEach(function(f){ f.placement=null; f._downOrder=0; f._kos=0; f._falls=0; f._dmgDealt=0; f._dmgTaken=0; });
  particles=[]; projectiles=[]; beams=[]; evil=null; items=[]; summons=[]; itemTimer=0; tendrils=[]; BOSS_ARENA=null;
  if(stage.hazard==='evilleafy'){ evil={x:WW*0.9,y:groundY()-40}; }  // (goiky has none; kept for safety)
  return fighters.length;
};
`;
