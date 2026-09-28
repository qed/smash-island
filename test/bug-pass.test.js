import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';
import { makePair } from './helpers/net-pair.js';
import { loadMonolith } from './helpers/load-monolith.js';

// "run a pass on every feature to check if anything bugs." (2026-09-28) -- one test per bug the pass reproduced and
// fixed, each written to fail on the build it was found in. See the commit for the list.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A 1v1 on the flat arena: A is a local human (keys through `down`), D a still dummy far off to the right.
const ARENA = (name, opts = '') => `
  SETTINGS.mode='ffa'; SETTINGS.items=false; SETTINGS.count=2; running=true; TESTMODE.active=false;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A=makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }),400,groundY()-24,0);
  var D=makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }),900,groundY()-24,1);
  A.team=0; D.team=1; A.controller='local'; A.you=true; D.controller='still'; A.stocks=99; D.stocks=99; A.face=1; D.face=-1;
  fighters=[A,D]; ${opts} step(); A.spCd=0; A.smCd=0; A.atkCd=0;
  for (var k in down) delete down[k];
`;

describe('a KO ends every move that was in flight', () => {
  it("Leafy's dash does not carry on from the respawn point", () => {
    const r = W.eval(`(function(){ ${ARENA('Leafy')}
      down[KEYS.special]=true; step(); down[KEYS.special]=false; for(var i=1;i<8;i++) step();
      var dashing = A._dashing;
      A.x=-300; step();   // blast-line KO mid-dash
      var after = [A._dashing, A.stocks];
      for(var i=0;i<52;i++) step();
      return { dashing:dashing, after:after, x:Math.round(A.x) }; })()`);
    expect(r.dashing).toBeGreaterThan(0);
    expect(r.after).toEqual([0, 98]);
    expect(r.x).toBe(550);   // she dropped straight down at the centre (was 1026, the arena edge)
  });

  it('a special press buffered in the direction window dies with the stock', () => {
    const r = W.eval(`(function(){ ${ARENA('Leafy')}
      down[KEYS.special]=true; step(); down[KEYS.special]=false; step(); step();   // _spPend counting down
      var pend = A._spPend;
      A.x=-300; step();   // KO on frame 3
      var inv = [];
      for(var i=4;i<70;i++){ step(); if(i<8) inv.push(A.invuln); }
      return { pend:pend, x:Math.round(A.x), dashing:A._dashing, inv:inv }; })()`);
    expect(r.pend).toBeGreaterThan(0);
    expect(r.dashing).toBe(0);
    expect(r.x).toBe(550);                                   // was 1110: the dash fired from the spawn point
    expect(Math.min(...r.inv)).toBeGreaterThan(80);          // the respawn's 90 frames stay (the dash's 22 replaced them)
  });

  it("Nickel (II)'s Experiment 626 snap-back does not outlive the stock that cast it", () => {
    const r = W.eval(`(function(){ ${ARENA('Nickel (II)', 'A.y=groundY()-24-150; A.onground=false; A.vy=0;')}
      down[KEYS.down]=true; down[KEYS.special]=true; step(); for (var k in down) delete down[k]; step(); step();
      var split = !!A._nsplit;
      A.x=-300; step();
      var xs = [];
      for(var i=4;i<400;i++){ step(); if(i%40===0) xs.push(Math.round(A.x)); }
      return { split:split, xs:xs }; })()`);
    expect(r.split).toBe(true);
    expect(r.xs.every((x) => x === 550)).toBe(true);   // frame 320 used to read 400: the pre-KO cast spot
  });

  it("Bubble's reform drops the smash she was charging", () => {
    const r = W.eval(`(function(){ ${ARENA('Bubble')}
      down[KEYS.smash]=true; step(); down[KEYS.smash]=false; step(); step();
      var charging = !!A._smQ;
      A.x=-300; step();   // pops -> reform
      var q = !!A._smQ, hold = A.smashHold, fired = false;
      for(var i=4;i<80;i++){ step(); if(A._sm) fired = true; }
      return { charging:charging, reform:A.reform, q:q, hold:hold, fired:fired, x:Math.round(A.x) }; })()`);
    expect(r.charging).toBe(true);
    expect(r.reform).toBe(0);
    expect([r.q, r.hold, r.fired]).toEqual([false, 0, false]);
    expect(r.x).toBe(550);   // was ~710: the smash went off from the reform point and hopped her away
  });

  it("Starfruit's One-Hit Wonder is back on the respawn point (no stale Has-Been pose)", () => {
    const r = W.eval(`(function(){ ${ARENA('Starfruit')}
      D.x = 470; step(); A.spCd = 0; fireSpecial(A, {}); var been = A._hasBeen;
      A.x=-500; var n=0; while(!(A._falls>0) && n<200){ step(); n++; }
      return { been:been, falls:A._falls, after:A._hasBeen }; })()`);
    expect(r.been).toBe(true);
    expect(r.falls).toBe(1);
    expect(r.after).toBe(false);
  });
});

describe('Boss Rush: every smash and special reaches the boss', () => {
  const BOSS = (name, move) => `(function(){
    SETTINGS.mode='boss'; SETTINGS.items=false; running=true; BOSSRUSH={active:false,bossIdx:0,cleared:0,defeated:false,loop:0,dmgMult:1};
    worldPlats=[]; summons=[]; projectiles=[]; items=[]; particles=[]; beams=[]; tendrils=[];
    var A=makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }),400,groundY()-24,0);
    A.team=0; A.controller='still'; A.stocks=99; A.face=1; fighters=[A];
    spawnBossRushBoss(); var b=summons[0]; b._atkTimer=1e9; b.x=440; b.hp=b.maxHp=5000; step(); A.smCd=0; A.spCd=0;
    ${move};
    for(var i=0;i<90;i++){ step(); b.x=440; b.vx=0; }
    return 5000-b.hp; })()`;
  it("the expanding 'burst' smash ring damages the boss, once", () => {
    for (const n of ['Snowball', 'Fries', 'Bomb']) {
      const d = W.eval(BOSS(n, 'doSmash(A)'));
      expect(d, n).toBeGreaterThan(0);
      expect(d, n).toBeLessThan(60);   // one hit of the ring, not one per frame
    }
  });
  it('Light My Fuse, THE KICK and Fluff Bounce land on the boss', () => {
    expect(W.eval(BOSS('Bomby', 'fireSpecial(A,{})'))).toBeGreaterThan(0);
    expect(W.eval(BOSS('Teardrop', 'fireSpecial(A,{})'))).toBeGreaterThan(0);
    expect(W.eval(BOSS('Pillow', 'fireSpecial(A,{})'))).toBeGreaterThan(0);
  });
});

describe('no text on screen from a move, and no blank line wiping the one that is up', () => {
  const TRIO = (a, d) => `
    SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.items=false; running=true; worldPlats=[];summons=[];projectiles=[];beams=[];tendrils=[];items=[];particles=[];
    var A=makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(a)}; }),400,groundY()-24,0);
    var D=makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(d)}; }),460,groundY()-24,1);
    var E=makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }),530,groundY()-24,2);
    A.team=0;D.team=1;E.team=2; [A,D,E].forEach(function(f){ f.controller='still'; }); A.face=1; D.face=-1; fighters=[A,D,E]; step();
    [A,D,E].forEach(function(f){ f.invuln=0;f.hitstun=0;f.spCd=0;f.atkCd=0;f.smCd=0;f.pct=30; }); window.__lastBanner=null;`;
  it('no DOUSED! when a water fighter hits Firey', () => {
    for (const a of ['Bubble', 'Teardrop', 'Barf Bag']) {
      const b = W.eval(`(function(){ ${TRIO(a, 'Firey')} D.burn=30; var p0=D.pct; doAttack(A);
        for(var i=0;i<70;i++){ step(); D.invuln=0; } return { hit: D.pct>p0, banner: window.__lastBanner && window.__lastBanner.text }; })()`);
      expect(b.hit, a).toBe(true);
      expect(b.banner, a).toBeFalsy();
    }
  });
  it("no MOMENTUM! from Puffball's plunge", () => {
    const b = W.eval(`(function(){ ${TRIO('Puffball', 'Firey')} A.you=true; A.y=D.y-220; A.vy=0; A.onground=false; doSmash(A);
      for(var i=0;i<70;i++) step(); return { momentum: A._momentumT>0, banner: window.__lastBanner && window.__lastBanner.text }; })()`);
    expect(b.momentum).toBe(true);
    expect(b.banner).toBeFalsy();
  });
  it("Match's cloud ending does not blank the KO line", () => {
    const b = W.eval(`(function(){ ${TRIO('Match', 'Pen')} A.you=true; fireSpecial(A,{up:true}); var c=A.cloud;
      banner("KO'd! − a stock",1100); var n=0; while(A.cloud>0 && n<200){ step(); n++; }
      return { cloud:c, text: document.getElementById('banner').textContent, last: window.__lastBanner.text }; })()`);
    expect(b.cloud).toBeGreaterThan(0);
    expect(b.text).toBe("KO'd! − a stock");
    expect(b.last).toBe("KO'd! − a stock");
  });
  it("no NEW BATTERY when Remote's special wears off", () => {
    const b = W.eval(`(function(){ ${ARENA('Remote')} window.__lastBanner=null;
      down[KEYS.special]=true; step(); for (var k in down) delete down[k]; var nb=0;
      for(var i=0;i<240;i++){ step(); nb=Math.max(nb, A._noBattery||0); } return { nb:nb, banner: window.__lastBanner && window.__lastBanner.text }; })()`);
    expect(b.nb).toBeGreaterThan(0);
    expect(b.banner).toBeFalsy();
  });
  it('an AI cured of Outbreak, or spat out, puts up no empty banner', () => {
    expect(W.eval('String(step)')).not.toMatch(/banner\(f\.you\?"Cured!":""/);
    expect(W.eval('String(freeFromStomach)')).not.toMatch(/banner\(f\.you\?"Spat out!":""/);
    expect(W.eval('String(freeFromStomach)')).toMatch(/if\(f\.you\) banner\("Spat out!"/);
  });
});

// ---- online play (a host and a client joined by fake sockets: test/helpers/net-pair.js) ----
const runFrames = (P, n, keys = null) => { for (let i = 0; i < n; i++) P.frame(keys); };
const ROSTER_MSG = (players) => JSON.stringify({ t: 'roster', players: players.map((p) => ({ isHost: false, ...p })) });

describe('online: the match ends for the client too', () => {
  it('the final KO frame is broadcast and the client shows the ceremony', async () => {
    const P = await makePair({ mode: 'ffa', stageId: 'goiky', count: 2, stocks: 3 });
    runFrames(P, 30);
    P.Cc.setTimeout = (fn) => { fn(); return 0; };   // the pair stubs timers out; the ceremony waits 700 ms on both ends
    P.Hh.eval('fighters[0].stocks=1; fighters[0].x=-300;');
    runFrames(P, 30);
    const c = P.Cc.eval(`({ running:running, dead:fighters.map(function(f){ return f.dead; }), result:document.getElementById('result').classList.contains('active'),
      title:document.getElementById('resultTitle').textContent, sub:document.getElementById('resultSub').textContent,
      rematch:document.getElementById('resultRematch').style.display, place:fighters.map(function(f){ return f.placement; }) })`);
    expect(c.running).toBe(false);
    expect(c.dead).toEqual([true, false]);            // the winning KO reached the client (it used to freeze a frame before it)
    expect(c.result).toBe(true);
    expect(c.title).toBe('🏆 YOU WIN!');               // the client's fighter is the one standing
    expect(c.sub).toMatch(/Waiting for the host to rematch/);
    expect(c.rematch).toBe('none');
    expect(c.place).toEqual([2, 1]);
  });
  it("Boss Rush: the client sees Defeated, and Four's victory card", async () => {
    const P = await makePair({ mode: 'boss', count: 2 });
    runFrames(P, 30);
    P.Cc.setTimeout = (fn) => { fn(); return 0; };
    // Four beaten: bossRushCheck (inside step) shows the card and pauses the host, and loop() still broadcasts that frame.
    // The same two calls, in the loop's order: the card, then the broadcast the gates used to drop.
    P.Hh.eval('showRushVictory(); NET.broadcastState();');
    runFrames(P, 3);
    expect(P.Hh.eval('paused && BOSSRUSH.card')).toBe(true);
    expect(P.Cc.eval("document.getElementById('rushVictory').style.display")).toBe('flex');
    expect(P.Cc.eval("document.getElementById('rushVicBtns').style.display")).toBe('none');
    P.Hh.eval('rushKeepGoing();'); runFrames(P, 3);
    expect(P.Cc.eval("document.getElementById('rushVictory').style.display")).toBe('none');
    P.Hh.eval('fighters.forEach(function(f){ f.stocks=1; f.x=-300; });'); runFrames(P, 30);
    const c = P.Cc.eval(`({ running:running, title:document.getElementById('resultTitle').textContent, result:document.getElementById('result').classList.contains('active') })`);
    expect(c).toEqual({ running: false, title: 'Defeated', result: true });
  });
  it("the host's Rematch is a start for the whole room", async () => {
    const P = await makePair({ mode: 'ffa', count: 2 });
    runFrames(P, 30);
    P.Hh.eval('window.__starts=0; var _s=NET.send.bind(NET); NET.send=function(o){ if(o.t==="start") window.__starts++; return _s(o); };');
    P.Hh.eval('running=false; document.getElementById("result").classList.add("active"); document.getElementById("resultRematch").onclick();');
    expect(P.Hh.eval('window.__starts')).toBe(1);
  });
});

describe('online: KO lines are per device', () => {
  it("a client reads its own KO, not the host's", async () => {
    const P = await makePair({ mode: 'ffa', count: 2, stocks: 3 });
    runFrames(P, 30);
    P.Cc.eval('window.__banners=[]; var _b=banner; banner=function(t,m,k,l){ window.__banners.push(t); return _b(t,m,k,l); };');
    P.Hh.eval('fighters[1].x=-300;'); runFrames(P, 30);
    expect(P.Cc.eval('window.__banners.slice()')).toContain("KO'd! − a stock");
    P.Cc.eval('window.__banners=[]');
    P.Hh.eval('fighters[0].x=-300;'); runFrames(P, 30);
    expect(P.Cc.eval('window.__banners.slice()')).not.toContain("KO'd! − a stock");
  });
});

describe('online: a roster during a match', () => {
  it('a leaver does not shift every later client onto the wrong fighter; the seat goes to the computer', async () => {
    const P = await makePair({ mode: 'ffa', count: 3, phantoms: [{ id: 'x', name: 'Leafy' }] });
    runFrames(P, 30);
    expect(P.Cc.eval('NET.myIdx')).toBe(2);
    const roster = ROSTER_MSG([{ id: 'h', name: 'Pen', isHost: true }, { id: 'c', name: 'Firey' }]);
    P.Hh.eval(`NET.onMessage(${roster})`); P.Cc.eval(`NET.onMessage(${roster})`);
    const x2 = P.Hh.eval('fighters[2].x');
    runFrames(P, 60, ['right']);
    expect(P.Cc.eval('({myIdx:NET.myIdx, you:fighters.filter(function(f){ return f.you; }).map(function(f){ return f.idx; })})')).toEqual({ myIdx: 2, you: [2] });
    expect(Math.abs(P.Hh.eval('fighters[2].x') - x2)).toBeGreaterThan(100);   // the client's own fighter moved
    expect(P.Hh.eval('({ctrl:fighters[1].controller, inp:NET.inputs[1]||null, count:SETTINGS.count})')).toEqual({ ctrl: 'ai', inp: null, count: 3 });
  });
  it('a client that drops does not leave its fighter running off the edge on its last input', async () => {
    const P = await makePair({ mode: 'ffa', stageId: 'goiky', count: 2 });
    runFrames(P, 30); runFrames(P, 10, ['right']);
    P.Hh.eval(`NET.onMessage(${ROSTER_MSG([{ id: 'h', name: 'Pen', isHost: true }])})`);
    for (let i = 0; i < 180; i++) { P.tick(); P.Hh.eval('loop()'); }
    expect(P.Hh.eval('({ctrl:fighters[1].controller, stocks:fighters[1].stocks})')).toEqual({ ctrl: 'ai', stocks: 3 });
  });
  it('when the host leaves, the client is told and sent back to the lobby', async () => {
    const P = await makePair({ mode: 'ffa', count: 2 });
    runFrames(P, 30);
    P.Cc.eval(`NET.onMessage(${ROSTER_MSG([{ id: 'c', name: 'Firey' }])})`);
    const c = P.Cc.eval(`({ running:running, role:NET.role, screen:(document.querySelector('.screen.active')||{}).id, status:document.getElementById('lobbyStatus').textContent })`);
    expect(c.running).toBe(false);
    expect(c.role).toBe('solo');
    expect(c.screen).toBe('lobby');
    expect(c.status).toMatch(/host left/);
  });
  it('a joiner mid-match does not change the contestant count, and is seated by the Rematch', async () => {
    const P = await makePair({ mode: 'boss', count: 2 });
    runFrames(P, 30);
    const roster = ROSTER_MSG([{ id: 'h', name: 'Pen', isHost: true }, { id: 'c', name: 'Firey' }, { id: 'j', name: 'Rocky' }]);
    P.Hh.eval(`NET.onMessage(${roster})`); P.Cc.eval(`NET.onMessage(${roster})`);
    expect(P.Hh.eval('SETTINGS.count')).toBe(2);
    P.Hh.eval('window.__start=null; var _s=NET.send.bind(NET); NET.send=function(o){ if(o.t==="start") window.__start=o; return _s(o); };');
    P.Hh.eval('running=false; rematch();');
    expect(P.Hh.eval('window.__start && window.__start.ids')).toEqual(['h', 'c', 'j']);
    expect(P.Hh.eval('fighters.map(function(f){ return [f.name, f.controller]; })')).toEqual([['Pen', 'local'], ['Firey', 'remote'], ['Rocky', 'remote']]);
  });
});

describe('online: joining, and what the client is shown', () => {
  it('a pasted invite link joins the room in the link', () => {
    const { window: w } = loadMonolith();
    w.eval('window.__dial=[]; window.WebSocket=function(u){ window.__dial.push(u); this.readyState=0; this.send=function(){}; this.close=function(){}; };');
    w.eval("NET.join('http://localhost/#room=QXTR')");
    expect(w.eval('NET.room')).toBe('QXTR');
    expect(w.eval('window.__dial[0]')).toMatch(/room=QXTR$/);
    expect(w.eval("document.getElementById('joinAddr').maxLength")).toBeGreaterThan(40);   // the box takes a whole link
    w.eval("NET.join(' qxtr ')");
    expect(w.eval('NET.room')).toBe('QXTR');
  });
  it("Evil Forest's Evil Leafy moves on the client as on the host", async () => {
    const P = await makePair({ mode: 'ffa', stageId: 'forest', count: 2 });
    runFrames(P, 240, ['left']);
    const h = P.Hh.eval('({x:evil.x, y:evil.y})'), c = P.Cc.eval('({x:evil.x, y:evil.y})');
    expect(Math.abs(h.x - c.x)).toBeLessThan(12);
    expect(Math.abs(h.y - c.y)).toBeLessThan(12);
    expect(h.x).toBeLessThan(1000);   // she left her corner
  });
  it("Evil Leafy's tendrils reach the client", async () => {
    const P = await makePair({ mode: 'boss', count: 2 });
    runFrames(P, 10);
    P.Hh.eval('for(let i=0;i<4;i++) spawnTendril(300+i*100, 1);'); runFrames(P, 3);
    expect(P.Cc.eval('tendrils.map(function(t){ return t.x; })')).toEqual([300, 400, 500, 600]);
  });
  it('status icons and tints show on the client', async () => {
    const P = await makePair({ mode: 'ffa', count: 2 });
    runFrames(P, 10);
    P.Hh.eval('fighters[1].cloud=100; fighters[1].armor=100; fighters[1].countering=100; fighters[1].rooted=200; fighters[1]._starT=300; fighters[1]._yoyleT=300; fighters[1].curseStacks=2; fighters[1].healing=50;');
    runFrames(P, 6);
    const icons = (w) => w.eval('STATUS_ICONS.filter(function(s){ try{ return s.on(fighters[1]); }catch(e){ return false; } }).map(function(s){ return s.key; })');
    expect(icons(P.Cc)).toEqual(icons(P.Hh));
    expect(icons(P.Cc)).toEqual(expect.arrayContaining(['rooted', 'star', 'yoyle', 'curse', 'healing']));
  });
  it("Steve Cobs's popped arrow keeps the surface it came out of", async () => {
    const P = await makePair({ mode: 'boss', count: 2 });
    P.Hh.eval('projectiles.push({owner:0, ownerObj:fighters[0], x:472, y:413, vx:0, vy:0, r:8, dmg:1, kb:1, color:"#c33", life:200, cobsTrap:true, delay:0, warn:0, warnY:446});');
    runFrames(P, 3);
    expect(P.Cc.eval('(projectiles.find(function(p){ return p.cobsTrap; })||{}).warnY')).toBe(446);
  });
});

// ---- screens ----
describe('screens: every mode gives back what it took, and every match can be left', () => {
  let w;
  beforeAll(async () => { ({ window: w } = loadMonolith()); await w.eval('profileReady'); });
  const ESC = "window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}))";
  const screen = () => w.eval("(document.querySelector('.screen.active')||{}).id");

  it('Test the Feel: Esc comes back to the test screen with the level still armed', () => {
    w.eval("openEditor(); ED.plats.push({nx:0.2,ny:0.5,nw:0.3,hop:false,rot:0}); edTestFeel(); startTestNow();");
    expect(w.eval('running && TESTMODE.active')).toBe(true);
    w.eval(ESC);
    expect(w.eval('({running:running, paused:paused, pending:PENDING_CUSTOM, custom:!!CUSTOM_LEVEL})')).toEqual({ running: false, paused: false, pending: true, custom: true });
    expect(screen()).toBe('test');
  });
  it('Esc shows a PAUSED card with Resume and Quit to title', () => {
    w.eval("go('title'); SETTINGS.mode='ffa'; SETTINGS.count=3; go('select'); startMatch();");
    w.eval(ESC);
    expect(w.eval("({paused:paused, card:document.getElementById('pauseCard').style.display})")).toEqual({ paused: true, card: 'flex' });
    w.eval(ESC);
    expect(w.eval("({paused:paused, card:document.getElementById('pauseCard').style.display})")).toEqual({ paused: false, card: 'none' });
    w.eval(ESC + '; quitMatch();');
    expect(w.eval("({running:running, paused:paused, card:document.getElementById('pauseCard').style.display})")).toEqual({ running: false, paused: false, card: 'none' });
    expect(screen()).toBe('title');
  });
  it('How to Play restores the match settings and the pick (complete, skip and Esc)', () => {
    const set = "go('title'); SETTINGS.mode='ffa'; SETTINGS.count=5; SETTINGS.stocks=3; chosen=ROSTER.find(function(r){ return r.name==='Leafy'; });";
    const read = "({mode:SETTINGS.mode, count:SETTINGS.count, stocks:SETTINGS.stocks, chosen:chosen.name})";
    w.eval(set + ' openTutorial(); startTutorial();');
    expect(w.eval('SETTINGS.count')).toBe(2);
    w.eval('finishTutorial(true);');
    expect(w.eval(read)).toEqual({ mode: 'ffa', count: 5, stocks: 3, chosen: 'Leafy' });
    w.eval(set + ' openTutorial(); startTutorial(); tutorialComplete();');
    expect(w.eval(read)).toEqual({ mode: 'ffa', count: 5, stocks: 3, chosen: 'Leafy' });
    w.eval(set + ' openTutorial(); startTutorial(); ' + ESC);
    expect(w.eval(read)).toEqual({ mode: 'ffa', count: 5, stocks: 3, chosen: 'Leafy' });
    expect(screen()).toBe('title');
  });
  it('the Daily restores mode, contestants, stocks and items, not only the fighter', () => {
    w.eval("go('title'); SETTINGS.mode='teams'; SETTINGS.count=5; SETTINGS.stocks=3; SETTINGS.itemRate=2; chosen=ROSTER.find(function(r){ return r.name==='Pen'; });");
    w.eval("document.querySelector('#dailyCard button').onclick()");
    expect(w.eval('({count:SETTINGS.count, stocks:SETTINGS.stocks, loan:!!DAILY_LOAN})')).toEqual({ count: 2, stocks: 2, loan: true });
    w.eval("go('title')");
    expect(w.eval('({mode:SETTINGS.mode, count:SETTINGS.count, stocks:SETTINGS.stocks, items:SETTINGS.itemRate, chosen:chosen.name, loan:DAILY_LOAN})'))
      .toEqual({ mode: 'teams', count: 5, stocks: 3, items: 2, chosen: 'Pen', loan: null });
  });
  it('the World Cup restores mode and contestant count when it ends or is left', () => {
    w.eval("go('title'); SETTINGS.mode='ffa'; SETTINGS.count=5; openTournamentSetup(); document.querySelector('#segTourneySize [data-v=\"2\"]').click(); kickOffTournament();");
    w.eval("document.querySelector('.th-watch').click();");
    expect(w.eval('({mode:SETTINGS.mode, count:SETTINGS.count})')).toEqual({ mode: 'teams', count: 4 });
    w.eval('TOURNEY.liveTimer=2; step(); step(); endTournament(); go("title");');
    expect(w.eval('({mode:SETTINGS.mode, count:SETTINGS.count, active:TOURNEY.active})')).toEqual({ mode: 'ffa', count: 5, active: false });
    // ...and leaving to the title mid-cup, without endTournament
    w.eval("SETTINGS.mode='ffa'; SETTINGS.count=3; openTournamentSetup(); document.querySelector('#segTourneySize [data-v=\"2\"]').click(); kickOffTournament(); document.querySelector('.th-watch').click(); go('title');");
    expect(w.eval('({mode:SETTINGS.mode, count:SETTINGS.count})')).toEqual({ mode: 'ffa', count: 3 });
  });
  it('the title counts the fighters and bosses off the rosters', () => {
    expect(w.eval("document.getElementById('titleFighters').textContent")).toBe(String(w.eval('ROSTER.length')));
    expect(w.eval('ROSTER.length')).toBe(101);
    expect(w.eval("document.getElementById('titleBosses').textContent")).toBe(String(w.eval('BOSS_ROSTER.length')));
  });
  it('phone width: the move card, the scorecard and the editor tools fit the screen', () => {
    const css = w.eval("[...document.querySelectorAll('style')].map(function(s){ return s.textContent; }).join('\\n')");
    expect(css).toMatch(/\.movecard\{[^}]*width:100%/);
    expect(css).toMatch(/\.mc-d\{[^}]*min-width:0/);
    expect(css).toMatch(/@media \(max-width:480px\)\{[^}]*\.schead,\.scrow\{grid-template-columns:42px 1fr 74px 84px/);
    expect(css).toMatch(/@media \(max-width:480px\)\{ #edTool\{flex-wrap:wrap/);
  });
});

// ---- Inanimate Insanity batch 3, the AI, and One ----
// A 1v1 with a third fighter far off: A at 400 facing right, D (Pen) `dx` ahead and pinned back where he stood each frame.
const TRIO3 = (nameExpr, dx = 70) => `
  SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.items=false; running=true; TESTMODE.active=false;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A=makeFighter(ROSTER.find(function(r){ return r.name===${nameExpr}; }),400,groundY()-24,0);
  var D=makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }),400+${dx},groundY()-24,1);
  var E=makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }),1000,groundY()-24,2);
  A.team=0; D.team=1; E.team=2; A.face=1; D.face=-1; [A,D,E].forEach(function(f){ f.controller='still'; f.stocks=9; });
  fighters=[A,D,E]; step(); [A,D,E].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; });
  var dx0=D.x, dy0=D.y; function run(n){ for(var i=0;i<n;i++){ step(); D.x=dx0; D.y=dy0; D.vx=0; D.vy=0; D.dead=false; D.invuln=0; } }
`;

describe("Dough's Shameless Knockoff", () => {
  it('a copy is weaker for the whole copied action, and holds the same cooldown as the original', () => {
    const r = W.eval(`(function(){ var out={};
      ['engulf','lifeguard','coresaw','innerflame','glowgold'].forEach(function(kind){
        var real = ROSTER.find(function(r){ return r.play && r.kit && r.kit.special===kind; }), res={};
        [real.name, 'Dough'].forEach(function(nm){ ${TRIO3('nm')}
          D._lastSpecialKind = kind; var p0=D.pct, cdMax=0; fireSpecial(A,{});
          for(var i=0;i<100;i++){ run(1); cdMax=Math.max(cdMax, A.spCd); }
          res[nm] = { total:+(D.pct-p0).toFixed(2), cd:cdMax }; });
        out[kind]=[res[real.name], res.Dough]; });
      return out; })()`);
    for (const [kind, [real, dough]] of Object.entries(r)) {
      if (real.total > 0) expect(dough.total, kind).toBeCloseTo(real.total * 0.7, 1);   // was the original's full number for every late hit
      expect(Math.abs(dough.cd - real.cd), kind).toBeLessThanOrEqual(1);              // was 1.25x (the copy set its cooldown raw inside the wind-up)
    }
  });
  it("a copied Everything Packed lets the shot out on his next press, and copied spikes draw as spikes", () => {
    const r = W.eval(`(function(){ ${TRIO3("'Dough'", 200)}
      D._lastSpecialKind='packed'; var shot=spawnProj(D,{vx:-9,vy:0,grav:false,dmg:6,kb:4,r:8,color:'#fff',life:600}); shot.x=A.x+140; shot.y=A.y;
      fireSpecial(A,{}); run(13); var held = A._packed===shot && projectiles.indexOf(shot)<0;
      D._lastSpecialKind='jack'; A.spCd=0; var p0=D.pct; fireSpecial(A,{}); run(30);
      var out = { held:held, stillHeld:!!A._packed, shotBack: projectiles.indexOf(shot)>=0 || D.pct>p0 };
      ${TRIO3("'Dough'", 300)} D._lastSpecialKind='spikeburst'; fireSpecial(A,{}); run(20);
      out.spikes = projectiles.filter(function(p){ return p.owner===A.idx; }).map(function(p){ return [p.shape, p.dmg]; });
      return out; })()`);
    expect(r.held).toBe(true);
    expect(r.stillHeld).toBe(false);
    expect(r.shotBack).toBe(true);
    expect(r.spikes.length).toBeGreaterThan(0);
    for (const [shape, dmg] of r.spikes) { expect(shape).toBe('spikeburst'); expect(dmg).toBeCloseTo(2.8, 5); }
  });
});

describe('batch 3 kits', () => {
  it("Tapey's Playback plays the biggest hit taped, and her own poke does not wipe the tape", () => {
    const r = W.eval(`(function(){ var out={}; ${TRIO3("'Tapey'")}
      fireSpecial(A,{down:true}); applyHit(D,5,0,0,E); applyHit(D,5,0,0,E); A.spCd=0; fireSpecial(A,{});
      var w=projectiles.find(function(p){ return p.shape==='tapewave'; }); out.a=w.dmg;
      projectiles=[]; A.spCd=0; fireSpecial(A,{down:true}); applyHit(D,12,0,0,E); applyHit(D,2,0,0,A); A.spCd=0; fireSpecial(A,{});
      w=projectiles.find(function(p){ return p.shape==='tapewave'; }); out.b=w.dmg;
      return out; })()`);
    expect(r.a).toBe(5);    // was 10: the damage racked up
    expect(r.b).toBe(12);   // was 3: her own poke last on the target lost Coiny's 12
  });
  it("Spikey tapped during the hold loses the burst but not 150 frames of cooldown", () => {
    const r = W.eval(`(function(){ ${TRIO3("'Spikey'", 60)}
      A._sp=true; fireSpecial(A,{}); for(var i=0;i<6;i++){ A._sp=true; step(); }
      A.invuln=0; applyHit(A,5,-3,-2,E); for(var i=0;i<30;i++) step();
      return { spikes:projectiles.filter(function(p){ return p.owner===A.idx; }).length, cd:A.spCd, bald:A._baldUntil>hazardT }; })()`);
    expect(r.spikes).toBe(0);
    expect(r.bald).toBe(false);
    expect(r.cd).toBeLessThan(30);   // was 84 still to run
  });
  it("Candle's held foe dying mid-hold does not put her flame out", () => {
    const r = W.eval(`(function(){ ${TRIO3("'Candle'", 120)}
      fireSpecial(A,{}); for(var i=0;i<8;i++) step(); D._falls=(D._falls||0)+1; for(var i=0;i<40;i++) step();
      return { weak:A.weakened, out:A._flameOutUntil>hazardT }; })()`);
    expect(r.weak).toBe(0);
    expect(r.out).toBe(false);
  });
  it('Box cannot pack Yin, so Yang never throws a second one', () => {
    const r = W.eval(`(function(){ ${TRIO3("'Yin-Yang'", 120)}
      D=makeFighter(ROSTER.find(function(r){ return r.name==='Box'; }),520,groundY()-24,1); D.team=3; D.face=-1; D.controller='still'; fighters=[A,D,E]; step(); A.spCd=0; D.spCd=0;
      fireSpecial(A,{}); for(var i=0;i<8;i++) step(); fireSpecial(D,{});
      var packedYin = !!(D._packed && D._packed._yin); A.spCd=0; fireSpecial(A,{});
      return { packedYin:packedYin, yins:projectiles.filter(function(p){ return p._yin; }).length }; })()`);
    expect(r.packedYin).toBe(false);
    expect(r.yins).toBe(1);
  });
});

describe('the computer', () => {
  it("CPU MeTag fights: he is not a zoner around a 0-damage wall", () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=3; SETTINGS.itemRate=0; TESTMODE.active=false; TOURNEY.active=false; BOSSRUSH.active=false; CUSTOM_LEVEL=null;
      chosen=ROSTER.find(function(r){ return r.name==='MeTag'; }); stage=STAGES.find(function(s){ return !s.big; }); beginMatchNow();
      fighters[1]=makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), fighters[1].x, fighters[1].y, 1); fighters[1].team=1;
      fighters.forEach(function(f){ f.controller='ai'; f.you=false; });
      var n=0, atk=0, _a=doAttack; doAttack=function(f){ if(f.idx===0) atk++; return _a.apply(this, arguments); };
      while(running && n<1500){ step(); n++; } doAttack=_a;
      return { dealt:fighters[0]._dmgDealt||0, attacks:atk }; })()`);
    expect(r.dealt).toBeGreaterThan(0);
    expect(r.attacks).toBeGreaterThan(5);
  });
  it('a big-stage all-AI FFA ends: spawn-point holding yields to the stalemate clock', () => {
    const { window: w } = loadMonolith(1008);
    const r = w.eval(`(function(){ TESTMODE.active=false; TOURNEY.active=false; BOSSRUSH.active=false; CUSTOM_LEVEL=null; PENDING_DAILY=null; LINEUP_MEMO=null; LOCAL_PLAYERS=1;
      SETTINGS.mode='ffa'; SETTINGS.count=5; SETTINGS.stocks=2; SETTINGS.itemRate=2; AI_LEVEL=2; chosen=ROSTER.find(function(r){ return r.name==='Goo'; });
      stage=STAGES.find(function(s){ return s.id==='canyon'; }); beginMatchNow(); fighters.forEach(function(f){ f.controller='ai'; });
      var n=0; while(running && n<12000){ step(); n++; } return { frames:n, running:running }; })()`);
    expect(r.running).toBe(false);   // seed 1008 on Canyon was still running at frame 12000
    expect(r.frames).toBeLessThan(12000);
  }, 300000);
});

describe("One's chain", () => {
  it('the select board crosses out only the fighters she erased; a locked one keeps its locked hint', async () => {
    const { window: w } = loadMonolith(); await w.eval('profileReady');
    const r = w.eval(`(function(){ PROFILE.one.stage=1; PROFILE.one.erased=['Gaty','Barf Bag','Basketball']; PROFILE.one.rushLightning=true; unlockFighter('Lightning');
      PROFILE.viewMode='unlocked'; go('select');
      var cells=[...document.querySelectorAll('#board .cell')].filter(function(c){ return !c.classList.contains('rostertoggle'); });
      var woody=cells.find(function(c){ return c.querySelector('.cellname').textContent==='Woody'; });
      var gaty=cells.find(function(c){ return c.querySelector('.cellname').textContent==='Gaty'; });
      return { erased:cells.filter(function(c){ return c.classList.contains('erased'); }).length, woody:woody.className, title:woody.title, gaty:gaty.className,
               banned: oneBanned(ROSTER.find(function(r){ return r.name==='Woody'; })), legend:document.getElementById('rosterLegend').textContent }; })()`);
    expect(r.erased).toBe(3);                 // was 51
    expect(r.woody).toBe('cell locked');
    expect(r.title).toMatch(/locked · /);
    expect(r.gaty).toBe('cell locked erased');
    expect(r.banned).toBe(true);              // still not pickable while she erases
    expect(r.legend).toBe('3 erased from the timeline');
  });
  it('Boss Rush loop 2 puts no quest line on the banner mid-match', () => {
    expect(W.eval('String(oneRushKill)')).not.toMatch(/banner\(/);
  });
});
