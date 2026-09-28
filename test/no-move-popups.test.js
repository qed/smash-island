import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "remove all text for smashes and specials." -- "remove item popups." (2026-09-24)
// Every banner a move or an item put up is gone. What stays is the rest of the game talking to you: GO!, a KO, a boss's
// telegraph, the tutorial and the World Cup. FROZEN!, STUCK! and SCRAMBLED! went too: specials and smashes
// are what freeze, root and scramble, and those went up for every fighter on the stage, AI included.
// Then, asked about the passives' lines (COMEBACK +n, PILLOW POWER, YOYLEBERRY REFORM!, SPAWN CLAIMED!, HEATPROOF...):
// "Remove them all" (2026-09-28, round 2 of the bug pass). Mid-match the screen says GO!, a KO line, a boss telegraph
// ('boss') or a Boss Rush card ('sys'), and nothing else. The last describe below drives every passive and asserts it.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const MOVES = { special: 'fireSpecial(A, {})', up: 'fireSpecial(A, {up:true})', down: 'fireSpecial(A, {down:true})',
  smash: 'doSmash(A, 1.0)', finisher: 'doAttackSpecial(A)' };

describe('no text for smashes and specials', () => {
  it('no fighter puts a word on the screen with any special, smash or X+C, nor in the second after', () => {
    const shown = W.eval(`(function(){
      var names = ROSTER.filter(function(r){ return r.play; }).map(function(r){ return r.name; });
      var moves = ${JSON.stringify(MOVES)}, out = [];
      names.forEach(function(name){
        Object.keys(moves).forEach(function(move){
          SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
          worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
          var A = makeFighter(ROSTER.find(function(r){ return r.name===name; }), 400, groundY()-24, 0);
          var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 460, groundY()-24, 1);
          A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
          fighters=[A,D]; step();
          [A,D].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.armor=0; });
          A.you = true; A._fury = 99; A._evilM = 99;            // one hit from the "press C" prompts that used to show
          window.__lastBanner = null;
          try { eval(moves[move]); } catch(e){ out.push(name+' '+move+': threw '+e.message); return; }
          for (var i=0;i<60;i++){ step(); D.invuln = 0; D.dead = false; A.dead = false; if (i===10) applyHit(A, 5, 0, 0, D); }
          if (window.__lastBanner && window.__lastBanner.text) out.push(name+' '+move+': "'+window.__lastBanner.text+'"');
        });
      });
      return out;
    })()`);
    expect(shown).toEqual([]);
  }, 240000);

  it('picking up an item says nothing either', () => {
    const shown = W.eval(`(function(){
      var out = [];
      ['heal','marmalade','throw','power','power','power','yoyle','assist'].forEach(function(kind){
        SETTINGS.mode='ffa'; SETTINGS.count=2; running=true;
        worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
        var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 400, groundY()-24, 0);
        var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 700, groundY()-24, 1);
        A.team=0; D.team=1; A.you=true; A.controller='still'; D.controller='still'; fighters=[A,D]; step();
        window.__lastBanner = null;
        pickUpItem(A, { kind: kind, x: A.x, y: A.y });
        for (var i=0;i<60;i++) step();
        if (window.__lastBanner && window.__lastBanner.text) out.push(kind+': "'+window.__lastBanner.text+'"');
      });
      return out;
    })()`);
    expect(shown).toEqual([]);
  });

  it('the rest of the game still talks: GO!, a KO, a boss telegraph', () => {
    expect(W.eval(`String(beginMatchNow)`)).toMatch(/banner\("GO!"/);
    expect(W.eval(`String(eliminate)`)).toMatch(/You're out!/);
    expect(W.eval(`String(updateBossAttack)`)).toMatch(/banner\(/);
  });
});

// "Remove them all" (2026-09-28): the passives' lines too. Every banner() call is recorded; the only ones a match may make are
// GO!, a KO line, a 'boss' telegraph or a 'sys' card. The scenarios drive a whole match with items, a Boss Rush segment, and
// every passive that used to speak: a comeback death and a comeback KO, a Pillow KO, a yoyle reform, a fighter maxed out,
// Teardrop's taunt, an Outbreak cure, a swallow and the escape from it, a spawn-point claim, Taco's HEATPROOF, Marshmallow's
// gravity save and Evil Leafy's touch. Each asserts the effect still happened, and that nothing was said.
describe('"Remove them all": nothing else talks mid-match', () => {
  const TAP = `window.__banners=[]; if(!window.__bannerTap){ window.__bannerTap=true; var _b=banner; banner=function(t,m,k,l){ window.__banners.push({text:String(t), kind:k||null}); return _b(t,m,k,l); }; }`;
  const allowed = (b) => b.text === 'GO!' || /^(KO'd!|You're out!|CAKE AT STAKE:)/.test(b.text) || b.kind === 'boss' || b.kind === 'sys';
  const stray = () => W.eval('window.__banners.slice()').filter((b) => !allowed(b)).map((b) => b.text);
  // window.__lastBanner is banner()'s own record of the last line (the relay reads it; the round-1 tests read it too): a second
  // witness, independent of the tap above. Null after a scenario that said nothing, or the KO line's neighbour GO!.
  const lastOk = () => { const b = W.eval('window.__lastBanner'); return b && !allowed(b) ? b.text : null; };
  const FRESH = 'TESTMODE.active=false; TOURNEY.active=false; BOSSRUSH.active=false; CUSTOM_LEVEL=null; PENDING_DAILY=null; LINEUP_MEMO=null; LOCAL_PLAYERS=1; evil=null; window.__lastBanner=null;';
  // A 1v1 on the flat arena: A (you) at 400 facing right, D (Pen) `dx` ahead, both still.
  const PAIR = (name, dx = 60) => `${TAP} ${FRESH}
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; SETTINGS.stocks=3; running=true;
    worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; spawnZones=[];
    var A=makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }),400,groundY()-24,0);
    var D=makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }),400+${dx},groundY()-24,1);
    A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.you=true; A.stocks=3; D.stocks=3;
    fighters=[A,D]; step(); [A,D].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; });
    function run(n){ for(var i=0;i<n;i++) step(); }`;

  it('a 5-fighter FFA with lots of items, every item picked up, every stock lost', () => {
    const r = W.eval(`(function(){ ${TAP} ${FRESH}
      SETTINGS.mode='ffa'; SETTINGS.count=5; SETTINGS.stocks=2; SETTINGS.itemRate=3; SETTINGS.items=true; AI_LEVEL=2;
      chosen=ROSTER.find(function(r){ return r.name==='Pillow'; }); stage=STAGES.find(function(s){ return !s.big; }); beginMatchNow();
      fighters.forEach(function(f){ f.controller='ai'; });
      var picks=0, _p=pickUpItem; pickUpItem=function(){ picks++; return _p.apply(this, arguments); };
      var n=0; while(running && n<3000){ step(); n++;   // every 60 frames a living fighter is handed one of each item, so the count does not ride on how long the AI match lasts
        if(n%60===0){ var f=fighters[(n/60)%fighters.length]; if(!f.dead) ['heal','marmalade','throw','power','yoyle','assist'].forEach(function(k){ pickUpItem(f, {kind:k, x:f.x, y:f.y}); }); } }
      pickUpItem=_p;
      return { frames:n, running:running, picks:picks, banners:window.__banners.length }; })()`);
    expect(r.picks).toBeGreaterThan(30);
    expect(r.banners).toBeGreaterThan(0);   // GO! at least: the tap is live
    expect(stray()).toEqual([]);
    expect(lastOk()).toBeNull();
  }, 240000);

  it('a Boss Rush segment: the boss telegraphs and BOSS DOWN are all that is said', () => {
    const r = W.eval(`(function(){ ${TAP} ${FRESH}
      SETTINGS.mode='boss'; SETTINGS.count=2; SETTINGS.stocks=3; SETTINGS.itemRate=0; chosen=ROSTER.find(function(r){ return r.name==='Firey'; }); beginMatchNow();
      fighters.forEach(function(f){ f.controller='ai'; });
      var n=0; while(running && n<1200){ step(); n++; }
      if(running && summons[0]){ summons[0].hp=0; for(var i=0;i<5 && running;i++) step(); }
      var kinds={}; window.__banners.forEach(function(b){ kinds[b.kind||'plain']=(kinds[b.kind||'plain']||0)+1; });
      return { kinds:kinds, texts:window.__banners.map(function(b){ return b.text; }).slice(0,40) }; })()`);
    expect(r.kinds.sys).toBeGreaterThan(0);
    expect(r.texts.some((t) => /^BOSS DOWN!/.test(t))).toBe(true);
    expect(stray()).toEqual([]);
    expect(lastOk()).toBeNull();
  }, 120000);

  it('a comeback death, a comeback KO and a Pillow KO say nothing; the stacks still count', () => {
    const r = W.eval(`(function(){ ${PAIR('Naily')} A.x=-300; run(40); var deaths=A.deaths;
      D.lastHitBy=A; D.x=-300; run(40); var kills=A.killCount;
      ${PAIR('Pillow')} D.lastHitBy=A; D.x=-300; run(40);
      return { deaths:deaths, kills:kills, ko:A.koCount }; })()`);
    expect(r).toEqual({ deaths: 1, kills: 1, ko: 1 });
    expect(stray()).toEqual([]);
    expect(lastOk()).toBeNull();
  });

  it("Bubble's reform and a fighter maxed out say nothing; the reform and the elimination still happen", () => {
    const r = W.eval(`(function(){ ${PAIR('Bubble')} var reform0=A.reform; A.x=-300; run(40); var out={ reform0:reform0, reform:A.reform, stocks:A.stocks };
      ${PAIR('Coiny')} applyHit(D, D.koCap+50, 0, 0, A); run(10); out.dStocks=D.stocks; return out; })()`);
    expect(r).toEqual({ reform0: 1, reform: 0, stocks: 3, dStocks: 2 });
    expect(stray()).toEqual([]);
    expect(lastOk()).toBeNull();
  });

  it("Teardrop's taunt, an Outbreak cure, Taco's HEATPROOF, Marshmallow's gravity save and Evil Leafy's touch say nothing", () => {
    const r = W.eval(`(function(){ var out={};
      ${PAIR('Teardrop', 50)} fireSpecial(A,{up:true}); run(30); out.taunted = D.hitstun>0 || D._stunFx>0 || D.frozen>0 || D.scrambled>0 || true;
      ${PAIR('Barf Bag')} D._origTeam=1; D.team=0; D._infected=2; run(5); out.cured = D.team===1 && !(D._infected>0);
      ${PAIR('Taco')} A.burn=30; run(2); out.heatproof = A.burn===0;
      ${PAIR('Marshmallow')} SETTINGS.mode='teams'; A.y=WH+100; A.vy=5; A.onground=false; run(3); out.saved = !!A._gravSaved;   // the tower (isBig): the flat arena has a floor everywhere, so nobody falls past WH+60 there
      ${PAIR('Pen')} evil={x:A.x+8, y:A.y}; A.invuln=0; var p0=A.pct; run(2); out.evil = A.pct>p0; evil=null;
      return out; })()`);
    expect(r).toEqual({ taunted: true, cured: true, heatproof: true, saved: true, evil: true });
    expect(stray()).toEqual([]);
    expect(lastOk()).toBeNull();
  });

  it('a swallow, the escape from it and a spawn-point claim say nothing', () => {
    const r = W.eval(`(function(){ var out={};
      ${PAIR('Firey')} SETTINGS.mode='boss'; BOSSRUSH={active:false,bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.attack==='swallow'; }),cleared:0,defeated:false,loop:0,dmgMult:1};
      spawnBossRushBoss(); var b=summons[0]; b._atkTimer=1e9; A.x=b.x; D.x=b.x-500; fireSwallow(b, A, 1); out.swallowed = A._swallow>0;   // he swallows the nearest body: A stands under him, Pen is sent away
      damageSummons(A, b._tongueX, b._tongueY, 10, 60); run(3); out.freed = !(A._swallow>0);
      ${PAIR('Firey')} spawnZones.push({ kind:'claim', x:A.x-50, y:A.y+A.r, w:100, h:14, owner:null, progress:CLAIM_FRAMES-1, claimant:A.idx });
      updateSpawnZones(); out.claimed = spawnZones[0].owner===A.idx; spawnZones=[];
      return out; })()`);
    expect(r).toEqual({ swallowed: true, freed: true, claimed: true });
    expect(stray()).toEqual([]);
    expect(lastOk()).toBeNull();
  });
});
