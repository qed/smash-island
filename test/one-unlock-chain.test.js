import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// ONE, the secret boss: THE UNLOCK CHAIN (her fight itself is test/one-boss.test.js). The owner: "One is a secret boss:
// unlock requires >70% winrate on Lightning over 20+ matches AND reaching Boss Rush loop 2 with Lightning; then certain
// characters will begin getting banned until you can fight only with lightning. then you have to win the world cup, and
// then you will see an animation of the moon breaking open, and then you fight one ... after that one is a permanent unlock
// to fight." / "no not only as lightning once unlocked."
// Their answers: ban order "1, then 2" (the canon erased trio first -- Gaty, then Barf Bag, then Basketball -- THEN your
// most-played fighters); ONE fighter erased per WIN; the bans lift and One unlocks permanently ONLY AFTER YOU BEAT HER, and
// a loss is retried directly; "No way out"; the Moon PLAYS BY ITSELF straight after the World Cup win (TPOT 7: Lightning's
// strike cracks it; TPOT 9: One climbs out of the hole and says "Hey guys!").

const HTML = readFileSync('artifacts/V1/index.html', 'utf8');
function boot(seed = {}) {
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      const grad = { addColorStop() {} };
      window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
        get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
          : p === 'canvas' ? { width: 1100, height: 720 }
          : p === 'getImageData' ? () => ({ data: [] })
          : (p === 'createLinearGradient' || p === 'createRadialGradient') ? () => grad : () => {}),
        set: () => true,
      });
      window.Math.random = mulberry32(7);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
      for (const [k, v] of Object.entries(seed)) window.localStorage.setItem(k, v);
    },
  });
  return dom.window;
}
const sleep = (w, ms) => new Promise((r) => w.setTimeout(r, ms));
const stored = (w) => JSON.parse(w.localStorage.getItem('profile:v1'));

// A clean profile in the same window. Every profile field merges UPWARD on save, so going back to zero means letting any
// save still in flight land first, then clearing storage as well as the in-memory profile.
async function fresh(w, js = '') {
  await sleep(w, 0);
  w.localStorage.clear();
  w.eval(`PROFILE = freshProfile(); PROFILE.fighterStatsSeeded = true; PROFILE_STORAGE_OK = true;
    PENDING_ERASED.length = 0; PENDING_ALONE = false; PENDING_UNLOCKS.length = 0; clearTimeout(ONE_MOON_TIMER);
    running = false; paused = false; BOSSRUSH.active = false; TOURNEY = { active:false }; PENDING_TOURNEY = null;
    CUSTOM_LEVEL = null; TESTMODE.active = false; TUT.active = false; DAILY_ACTIVE = false; PENDING_DAILY = null;
    ONEFIGHT.retry = null; if(ONEFIGHT.active) oneFightRestore(); LOCAL_PLAYERS = 1;
    SETTINGS.mode = 'ffa'; SETTINGS.count = 2; SETTINGS.stocks = 3; SETTINGS.itemRate = 0; SETTINGS.bossPick = 'rush';
    chosen = ROSTER.find(function(r){ return r.name==='Firey'; });
    ${js}`);
}
// Both conditions met: a 20-match Lightning record at 75%, and loop 2 reached as Lightning.
const ARM = `PROFILE.fighterStats = { Lightning:{ g:20, w:15 } }; PROFILE.one.rushLightning = true;`;
// One counted match, the way checkWin reports it: `you` on team 0, and the winning team.
const play = (w, name, won) => w.eval(`(function(){
  fighters = [{ name:${JSON.stringify(name)}, you:true, team:0, killCount:0 }, { name:'Firey', team:1, killCount:0 }];
  awardMatchProgress(${won ? 0 : 1});
  return PROFILE.one.erased.slice();
})()`);
const profileAt = (one, extra = {}) => JSON.stringify(Object.assign({
  version: 1, matches: 80, wins: 60, kos: 0, bossesCleared: {}, soloBosses: {}, bestRushLoop: 2, wcTitles: 1,
  unlocked: ['Firey', 'Leafy', 'Bubble', 'Pencil', 'Blocky', 'Ice Cube', 'Match', 'Pen', 'Lightning'], viewMode: 'starters',
  migratedFrom: null, fighterStats: { Lightning: { g: 30, w: 25 } }, fighterStatsSeeded: true,
  one: Object.assign({ stage: 0, erased: [], rushLightning: true, wins: 0, bestSecs: 0 }, one),
}, extra));

let W;
beforeAll(async () => { W = boot(); await W.eval('profileReady'); });

describe('step 1: a lifetime Lightning record above 70% over 20+ matches', () => {
  it('records every counted match per fighter, win or lose, and nothing that is not progression', async () => {
    await fresh(W);
    play(W, 'Lightning', true); play(W, 'Lightning', true); play(W, 'Lightning', false); play(W, 'Firey', true);
    const r = W.eval(`(function(){
      var before = JSON.stringify(PROFILE.fighterStats);
      CUSTOM_LEVEL = { spawns:[] }; fighters = [{ name:'Lightning', you:true, team:0 }]; awardMatchProgress(0); CUSTOM_LEVEL = null;
      TESTMODE.active = true; awardMatchProgress(0); TESTMODE.active = false;
      TUT.active = true; awardMatchProgress(0); TUT.active = false;
      return { st:PROFILE.fighterStats, same: before === JSON.stringify(PROFILE.fighterStats) };
    })()`);
    expect(r.st.Lightning).toEqual({ g: 3, w: 2 });
    expect(r.st.Firey).toEqual({ g: 1, w: 1 });
    expect(r.same, 'a level-editor playtest, Test mode and the tutorial never count').toBe(true);
  });

  it('opens only at 20 or more matches and strictly above 70%', async () => {
    await fresh(W);
    const ok = (g, wn) => W.eval(`PROFILE.fighterStats = { Lightning:{ g:${g}, w:${wn} } }; oneRateOk()`);
    expect(ok(19, 19), '19 perfect matches is not 20').toBe(false);
    expect(ok(20, 14), 'exactly 70% is not above it').toBe(false);
    expect(ok(20, 15)).toBe(true);
    expect(ok(40, 28)).toBe(false);
    expect(ok(40, 29)).toBe(true);
    expect(W.eval(`PROFILE.fighterStats = { Firey:{ g:50, w:50 } }; oneRateOk()`), 'only Lightning counts').toBe(false);
  });

  it('counts the matches already in the match log once ("lifetime"), leaving level-editor playtests out', async () => {
    const rec = (name, won, stage = 'goiky') => ({ ts: 1, mode: 'ffa', count: 2, stage,
      fighters: [{ name, you: true, controller: 'local', won, kos: 1 }, { name: 'Firey', you: false, controller: 'ai', won: !won }] });
    const log = [];
    for (let i = 0; i < 20; i++) log.push(rec('Lightning', i < 15));
    for (let i = 0; i < 6; i++) log.push(rec('Lightning', true, 'custom'));
    log.push(rec('Leafy', false));
    const w = boot({ 'balance:matchlog': JSON.stringify(log) });
    await w.eval('profileReady');
    await w.eval('seedFighterStats()');
    await sleep(w, 0);
    const r = w.eval(`({ L:PROFILE.fighterStats.Lightning, leafy:PROFILE.fighterStats.Leafy, seeded:PROFILE.fighterStatsSeeded, ok:oneRateOk() })`);
    expect(r.L).toEqual({ g: 20, w: 15 });
    expect(r.leafy).toEqual({ g: 1, w: 0 });
    expect(r.seeded).toBe(true);
    expect(r.ok).toBe(true);
    expect(await w.eval('seedFighterStats()'), 'and only once').toBe(false);
    expect(w.eval('PROFILE.fighterStats.Lightning.g')).toBe(20);
  });
});

describe('step 2: Boss Rush loop 2 with Lightning', () => {
  it('counts when Four falls to your Lightning while it still stands, and for nobody else', async () => {
    await fresh(W);
    const hook = (you, loop) => W.eval(`fighters = [${JSON.stringify(you)}, { name:'Leafy', team:0 }]; oneRushHook(${loop}); PROFILE.one.rushLightning`);
    expect(hook({ name: 'Firey', you: true, team: 0 }, 2), 'another fighter in your hands').toBe(false);
    expect(hook({ name: 'Lightning', you: true, team: 0, dead: true }, 2), 'allies finishing Four for a fallen Lightning').toBe(false);
    expect(hook({ name: 'Lightning', you: true, team: 0 }, 1), 'loop 1 is not loop 2').toBe(false);
    expect(hook({ name: 'Lightning', you: false, team: 0 }, 2), 'an AI Lightning').toBe(false);
    expect(hook({ name: 'Lightning', you: true, team: 0 }, 2)).toBe(true);
    await sleep(W, 0);
    expect(stored(W).one.rushLightning, 'saved at the deed').toBe(true);
  });

  it('is wired into the real gauntlet: Four falling at the end of loop 1 records it', async () => {
    await fresh(W, `SETTINGS.mode = 'boss'; SETTINGS.count = 1; chosen = ROSTER.find(function(r){ return r.name==='Lightning'; });`);
    const r = W.eval(`(function(){
      startMatch();
      var i4 = BOSS_ROSTER.findIndex(function(b){ return b.name==='Four'; });
      BOSSRUSH.bossIdx = i4;
      summons = summons.filter(function(s){ return s.type!=='boss'; });
      summons.push({ type:'boss', _bossRush:true, name:'Four', color:'#3a6ad0', x:WW/2, y:groundY()-80, r:80, hp:0, maxHp:500, team:-1 });
      bossRushCheck();
      var out = { you:fighters.find(function(f){ return f.you; }).name, loop:BOSSRUSH.loop, rush:PROFILE.one.rushLightning,
        card:document.getElementById('rushVictory').style.display };
      running = false; BOSSRUSH.active = false; document.getElementById('rushVictory').style.display = 'none';
      return out; })()`);
    expect(r.you).toBe('Lightning');
    expect(r.loop).toBe(1);
    expect(r.card).toBe('flex');
    expect(r.rush).toBe(true);
  });
});

describe('step 3: the trigger', () => {
  it('fires when the win rate comes last, and the win that completes it erases Gaty', async () => {
    await fresh(W, `PROFILE.fighterStats = { Lightning:{ g:19, w:14 } }; PROFILE.one.rushLightning = true;`);
    expect(play(W, 'Lightning', true)).toEqual(['Gaty']);
    expect(W.eval('PROFILE.one.stage')).toBe(1);
    expect(W.eval('PROFILE.unlocked.indexOf("Lightning") >= 0'), 'the last fighter is pickable in every board view').toBe(true);
  });

  it('fires when loop 2 comes last: felling Four is that win, and the victory card says so', async () => {
    await fresh(W, `PROFILE.fighterStats = { Lightning:{ g:20, w:15 } };`);
    expect(play(W, 'Lightning', true), 'no loop 2 yet: nothing').toEqual([]);
    expect(W.eval('PROFILE.one.stage')).toBe(0);
    const r = W.eval(`(function(){ showRushVictory(); fighters = [{ name:'Lightning', you:true, team:0 }]; var now = oneRushHook(2);
      var n = document.getElementById('rushQuestNote'); var out = { now:now, stage:PROFILE.one.stage, shown:n.style.display, text:n.textContent };
      document.getElementById('rushVictory').style.display = 'none'; paused = false; return out; })()`);
    expect(r.now).toEqual(['Gaty']);
    expect(r.stage).toBe(1);
    expect(r.shown).toBe('block');
    expect(r.text).toMatch(/Gaty was erased from the timeline/);
    // the next loop is not another erasure: after the trigger, fighters go per won MATCH
    expect(W.eval(`fighters = [{ name:'Lightning', you:true, team:0 }]; oneRushHook(3); PROFILE.one.erased.length`)).toBe(1);
  });

  it('a trigger on a loss erases no one', async () => {
    await fresh(W, `PROFILE.fighterStats = { Lightning:{ g:19, w:17 } }; PROFILE.one.rushLightning = true;`);
    expect(play(W, 'Lightning', false)).toEqual([]);
    expect(W.eval('PROFILE.one.stage'), 'but the chain has started').toBe(1);
  });
});

describe('step 4: the bans', () => {
  it('erases the canon three first, then your most-played, ONE per WIN and none per loss', async () => {
    await fresh(W, ARM + ` PROFILE.fighterStats.Pen = { g:30, w:10 }; PROFILE.fighterStats.Firey = { g:12, w:3 }; PROFILE.fighterStats.Leafy = { g:12, w:9 };`);
    const seen = [];
    for (let i = 0; i < 6; i++) {
      seen.push(play(W, 'Lightning', true).length);
      seen.push(play(W, 'Lightning', false).length);
    }
    expect(seen, 'one more after each win, none after each loss').toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]);
    // Pen is played most; Firey and Leafy are tied, so the show's order breaks it (Leafy debuts first)
    expect(W.eval('PROFILE.one.erased')).toEqual(['Gaty', 'Barf Bag', 'Basketball', 'Pen', 'Leafy', 'Firey']);
  });

  it('holds on player 1\'s pick everywhere: the board, Start, the World Cup pick, the Daily and the lobby', async () => {
    await fresh(W, ARM + ` PROFILE.one.stage = 1; PROFILE.one.erased = ['Gaty','Barf Bag','Basketball','Firey']; unlockFighter('Lightning');`);
    const board = W.eval(`(function(){
      go('select');
      var cells = [].slice.call(document.querySelectorAll('#board .cell')).filter(function(c){ return !c.classList.contains('rostertoggle'); });
      var cell = function(n){ return cells.find(function(c){ return c.querySelector('.cellname').textContent===n; }); };
      var f = cell('Firey'), l = cell('Lightning');
      f.onclick();
      return { chosen:chosen.name, fErased:f.classList.contains('erased'), fPlay:f.classList.contains('play'), lPlay:!!l && l.classList.contains('play'),
        note:document.getElementById('lockNote').textContent, legend:document.getElementById('rosterLegend').textContent,
        leafy:cell('Leafy').classList.contains('play') };
    })()`);
    expect(board.chosen, 'a pick One took snaps to Lightning').toBe('Lightning');
    expect(board.fErased && !board.fPlay).toBe(true);
    expect(board.lPlay, 'Lightning joins the starters view so the board is never empty').toBe(true);
    expect(board.leafy, 'fighters not yet erased are still yours').toBe(true);
    expect(board.note).toMatch(/Firey — erased from the timeline/);
    expect(board.legend).toBe('4 erased from the timeline');

    const start = W.eval(`chosen = ROSTER.find(function(r){ return r.name==='Firey'; }); SETTINGS.mode='ffa'; SETTINGS.count=2; startMatch();
      var n = fighters.find(function(f){ return f.you; }).name; running = false; n`);
    expect(start, 'Start Match').toBe('Lightning');

    const cup = W.eval(`chosen = ROSTER.find(function(r){ return r.name==='Firey'; }); PENDING_TOURNEY = { size:1, mode:'normal' }; startMatch();
      var n = TOURNEY.myTeam.members[0].name; endTournament(); n`);
    expect(cup, 'the World Cup pick').toBe('Lightning');

    const daily = W.eval(`(function(){
      var F = ROSTER.find(function(r){ return r.name==='Firey'; }), L = oneLightning(), P = ROSTER.find(function(r){ return r.name==='Pin'; });
      var a = oneDailyMatchup({ you:F, foe:P, seed:1 }), b = oneDailyMatchup({ you:F, foe:L, seed:1 });
      startDailyMatch(); var you = fighters.find(function(f){ return f.you; }).name; running = false; DAILY_ACTIVE = false;
      return { a:[a.you.name, a.foe.name], b:[b.you.name, b.foe.name], you:you };
    })()`);
    expect(daily.a, 'the Daily puts your side on Lightning').toEqual(['Lightning', 'Pin']);
    expect(daily.b, 'and if Lightning was today\'s opponent, your fighter takes that seat').toEqual(['Lightning', 'Firey']);
    expect(daily.you).toBe('Lightning');

    const lobby = W.eval(`(function(){
      chosen = oneLightning(); NET.pickFighter('Firey'); var kept = chosen.name;
      NET.role = 'host'; NET.renderLobbySettings(); NET.role = 'solo';
      var opts = [].slice.call(document.querySelectorAll('#lobbyFighter option')).map(function(o){ return o.value; });
      return { kept:kept, firey:opts.indexOf('Firey') >= 0, lightning:opts.indexOf('Lightning') >= 0, leafy:opts.indexOf('Leafy') >= 0 };
    })()`);
    expect(lobby).toEqual({ kept: 'Lightning', firey: false, lightning: true, leafy: true });
  });

  it('ends when Lightning is the only fighter you can pick, and a fighter unlocked after that stays erased', async () => {
    await fresh(W, ARM);
    let prev = 0, each = true;
    for (let i = 0; i < 200 && W.eval('PROFILE.one.stage') < 2; i++) {
      const n = play(W, 'Lightning', true).length;
      if (n !== prev + 1 && W.eval('PROFILE.one.stage') < 2) each = false;
      prev = n;
    }
    const r = W.eval(`(function(){
      var pickable = ROSTER.filter(onePickable).map(function(r){ return r.name; });
      var mine = ROSTER.filter(function(r){ return r.play && r.name!=='Lightning' && isUnlocked(r); });
      var allGone = mine.every(function(r){ return PROFILE.one.erased.indexOf(r.name) >= 0; });
      showErasedNote();
      var note = document.getElementById('eraseNote').textContent;
      unlockFighter('Pin');
      PROFILE.viewMode = 'everything'; buildBoard();
      var open = [].slice.call(document.querySelectorAll('#board .cell.play')).filter(function(c){ return !c.classList.contains('rostertoggle'); })
        .map(function(c){ return c.querySelector('.cellname').textContent; });
      PROFILE.viewMode = 'starters';
      return { stage:PROFILE.one.stage, pickable:pickable, allGone:allGone, note:note, pin:oneBanned(ROSTER.find(function(r){ return r.name==='Pin'; })),
        open:open, legend:document.getElementById('rosterLegend').textContent, trio:PROFILE.one.erased.slice(0,3) };
    })()`);
    expect(r.stage).toBe(2);
    expect(each, 'exactly one fighter per win all the way').toBe(true);
    expect(r.trio).toEqual(['Gaty', 'Barf Bag', 'Basketball']);
    expect(r.allGone).toBe(true);
    expect(r.pickable).toEqual(['Lightning']);
    expect(r.note).toMatch(/Only Lightning is left\. Win the World Cup\./);
    expect(r.pin, '"until you can fight only with lightning"').toBe(true);
    expect(r.open, 'even the show-everything view').toEqual(['Lightning']);
    expect(r.legend).toBe('Only Lightning is left');
  });

  it('shows each erasure on the real result screen after a won match', async () => {
    await fresh(W, ARM + ` PROFILE.one.stage = 1; unlockFighter('Lightning'); chosen = oneLightning(); SETTINGS.mode = 'ffa'; SETTINGS.count = 2;`);
    W.eval(`startMatch(); fighters.forEach(function(f){ if(!f.you){ f.dead = true; f.stocks = 0; } }); checkWin();`);
    await sleep(W, 800);
    const r = W.eval(`({ screen:document.getElementById('result').classList.contains('active'), note:document.getElementById('eraseNote').textContent,
      shown:document.getElementById('eraseNote').style.display })`);
    expect(r.screen).toBe(true);
    expect(r.shown).toBe('block');
    expect(r.note).toMatch(/^✖ ERASED FROM THE TIMELINE: Gaty · Every win, another fighter vanishes\./);
    W.eval(`showErasedNote()`);
    expect(W.eval(`document.getElementById('eraseNote').style.display`), 'drained: a Rematch does not repeat it').toBe('none');
  });
});

describe('step 5: the World Cup', () => {
  const winCup = `(function(){
    var t = TOURNEY.myTeam, other = TOURNEY.teams.find(function(x){ return x!==t; });
    TOURNEY.stage = 'knockout'; TOURNEY.knockoutRound = 0;
    TOURNEY.bracket = [[{ kind:'ko', a:t, b:other, played:true, winner:t, result:{ sa:1, sb:0 } }]];
    advanceKnockout();
    return { lead:t.members[0].name, body:document.getElementById('tourneyHubBody').textContent, btn:document.getElementById('tourneyProceedBtn').textContent };
  })()`;

  it('won with only Lightning left, it cracks the Moon, and the Moon plays by itself', async () => {
    await fresh(W, ARM + ` PROFILE.one.stage = 2; unlockFighter('Lightning'); ONE_MOON_DELAY = 40;
      PENDING_TOURNEY = { size:1, mode:'normal' }; startMatch();`);
    const r = W.eval(winCup);
    expect(r.lead).toBe('Lightning');
    expect(r.body).toMatch(/YOU win the World Cup!/);
    expect(r.body).toMatch(/something up there just cracked/);
    expect(r.btn).toBe('Look up 🌕');
    expect(W.eval('PROFILE.one.stage')).toBe(3);
    await sleep(W, 120);
    expect(W.eval(`document.getElementById('moonScene').classList.contains('active')`), 'nothing pressed').toBe(true);
    expect(W.eval('TOURNEY.active')).toBe(false);
    expect(stored(W).one.stage, 'saved at the win').toBe(3);
    W.eval(`go('title'); ONE_MOON_DELAY = 2500;`);
  });

  it('won earlier in the chain, it is just a cup', async () => {
    await fresh(W, ARM + ` PROFILE.one.stage = 1; PROFILE.one.erased = ['Gaty']; unlockFighter('Lightning'); chosen = oneLightning();
      PENDING_TOURNEY = { size:1, mode:'normal' }; startMatch();`);
    const r = W.eval(winCup);
    expect(r.body).not.toMatch(/cracked/);
    expect(r.btn).toBe('Back to Title');
    expect(W.eval('PROFILE.one.stage')).toBe(1);
    W.eval(`endTournament(); go('title');`);
  });
});

describe('step 6: the Moon', () => {
  it('draws the canon beats in order: Lightning\'s strike, the crack, the hole, One climbing out, "Hey guys!"', async () => {
    await fresh(W);
    const beats = W.eval(`(function(){
      var log = [];
      var rec = new Proxy({}, {
        get: function(t, p){ if(p==='createLinearGradient' || p==='createRadialGradient') return function(){ return { addColorStop:function(){} }; };
          return function(){ log.push([p].concat([].slice.call(arguments))); }; },
        set: function(t, p, v){ log.push(['=' + p, v]); return true; } });
      var M = { ctx:rec, w:1100, h:720 };
      var at = function(t){ log = []; drawMoonFrame(M, t);
        var has = function(k, v){ return log.some(function(e){ return e[0]===k && e[1]===v; }); };
        return { bolt:has('=strokeStyle', '#f2e84b'), crack:has('=strokeStyle', '#2a2a33'), hole:has('=fillStyle', '#05060f'),
                 one:has('=fillStyle', '#5D7AF2'), hey:log.some(function(e){ return e[0]==='fillText' && e[1]==='Hey guys!'; }),
                 stars:has('=fillStyle', '#9FE8FF') }; };
      return { t05:at(0.5), t12:at(1.2), t20:at(2.0), t33:at(3.3), t70:at(7.0), t95:at(9.5), t120:at(12.0),
               same:JSON.stringify(MOON_GEO)===JSON.stringify(moonGeometry(7)) };
    })()`);
    expect(beats.t05).toMatchObject({ bolt: false, crack: false, hole: false, hey: false });
    expect(beats.t12, 'TPOT 7: the strike, in Lightning\'s yellow').toMatchObject({ bolt: true, crack: false });
    expect(beats.t20, '...and the crack it leaves').toMatchObject({ bolt: false, crack: true, hole: false });
    expect(beats.t33, 'knocks from inside, as her star-shaped telekinesis').toMatchObject({ stars: true, hole: false });
    expect(beats.t70, 'TPOT 9: it cracks open').toMatchObject({ hole: true });
    expect(beats.t95, 'One climbs out and says it').toMatchObject({ hole: true, one: true, hey: true });
    expect(beats.t120.hey).toBe(false);
    expect(beats.same, 'seeded: it breaks the same way every time').toBe(true);
  });

  it('plays on its own, then One\'s card offers the fight and nothing else ("No way out")', async () => {
    await fresh(W, `PROFILE.one.stage = 3;`);
    const r = W.eval(`(function(){
      var ok = playMoonScene();
      var mid = { ok:ok, active:document.getElementById('moonScene').classList.contains('active'), card:document.getElementById('moonCard').style.display, raf:!!MOON.raf };
      moonTick(MOON.t0 + 6000);
      var still = { stage:PROFILE.one.stage, raf:!!MOON.raf };
      moonTick(MOON.t0 + (MOON_T.end + 0.1)*1000);
      var btns = [].slice.call(document.querySelectorAll('#moonCard button')).map(function(b){ return b.textContent; });
      return { mid:mid, still:still, stage:PROFILE.one.stage, raf:MOON.raf, card:document.getElementById('moonCard').style.display, btns:btns,
        skip:document.getElementById('moonSkip').style.display };
    })()`);
    expect(r.mid).toEqual({ ok: true, active: true, card: 'none', raf: true });
    expect(r.still).toEqual({ stage: 3, raf: true });
    expect(r.stage).toBe(4);
    expect(r.raf).toBe(0);
    expect(r.card).toBe('flex');
    expect(r.btns).toEqual(['Fight ▸']);
    expect(r.skip).toBe('none');
    await sleep(W, 0);
    expect(stored(W).one.stage).toBe(4);
  });

  it('never plays before its time, and leaving mid-scene stops it without skipping it', async () => {
    await fresh(W, `PROFILE.one.stage = 2;`);
    expect(W.eval('playMoonScene()')).toBe(false);
    W.eval(`PROFILE.one.stage = 3; playMoonScene(); go('title');`);
    expect(W.eval('MOON.raf')).toBe(0);
    expect(W.eval('PROFILE.one.stage'), 'a refresh or a quit mid-scene plays it again').toBe(3);
    expect(W.eval(`document.getElementById('oneEntry').textContent`)).toBe('🌕 Something is wrong with the Moon…');
  });

  it('there is no way out of the chain anywhere on the page', () => {
    const buttons = W.eval(`[].slice.call(document.querySelectorAll('button')).map(function(b){ return b.textContent + ' ' + (b.getAttribute('onclick')||''); }).join('\\n')`);
    expect(buttons).not.toMatch(/abandon|give up|forfeit/i);
    expect(HTML).not.toMatch(/function\s+\w*(abandon|giveUp)\w*/i);
  });
});

describe('step 7: the story fight', () => {
  it('is Lightning alone against a flat 2000; a loss keeps every ban and Rematch fights her again directly', async () => {
    await fresh(W, ARM + ` PROFILE.one.stage = 4; PROFILE.one.erased = ['Gaty','Barf Bag','Basketball','Firey']; unlockFighter('Lightning');`);
    const r = W.eval(`(function(){
      document.getElementById('moonFight').click();
      var one = summons.find(function(s){ return s._oneFight; });
      var out = { active:ONEFIGHT.active, story:ONEFIGHT.story, names:fighters.map(function(f){ return f.name; }), hp:one.hp, max:one.maxHp, mult:one._dmgTakenMult,
        rush:BOSSRUSH.active };
      fighters.forEach(function(f){ f.dead = true; }); running = true; oneFightCheck();
      out.over = ONEFIGHT.over; out.won = ONEFIGHT.won; out.stage = PROFILE.one.stage;
      out.banned = oneBanned(ROSTER.find(function(r){ return r.name==='Pen'; })) || oneBanned(ROSTER.find(function(r){ return r.name==='Firey'; }));
      return out; })()`);
    expect(r.active && r.story).toBe(true);
    expect(r.names).toEqual(['Lightning']);
    expect([r.hp, r.max, r.mult]).toEqual([2000, 2000, 1]);
    expect(r.rush, 'never Boss Rush').toBe(false);
    expect(r.over).toBe(true);
    expect(r.won).toBe(false);
    expect(r.stage).toBe(4);
    expect(r.banned).toBe(true);
    await sleep(W, 950);
    const res = W.eval(`({ screen:document.getElementById('result').classList.contains('active'), title:document.getElementById('resultTitle').textContent,
      note:document.getElementById('unlockNote').style.display, retry:!!ONEFIGHT.retry && ONEFIGHT.retry.opts.story, mode:SETTINGS.mode })`);
    expect(res.screen).toBe(true);
    expect(res.title).toBe('One wins');
    expect(res.note).toBe('none');
    expect(res.retry).toBe(true);
    expect(res.mode, 'the player\'s own settings come back').toBe('ffa');
    const again = W.eval(`startMatch(); ({ active:ONEFIGHT.active, story:ONEFIGHT.story, names:fighters.map(function(f){ return f.name; }),
      hp:summons.find(function(s){ return s._oneFight; }).hp })`);
    expect(again).toEqual({ active: true, story: true, names: ['Lightning'], hp: 2000 });
  });

  it('beating her lifts every ban at once and unlocks her for good', async () => {
    const r = W.eval(`(function(){
      ONEFIGHT.won = true; ONEFIGHT.frames = 60*95 - 1; running = true; oneFightCheck();
      var F = ROSTER.find(function(r){ return r.name==='Firey'; }), G = ROSTER.find(function(r){ return r.name==='Gaty'; });
      return { stage:PROFILE.one.stage, wins:PROFILE.one.wins, best:PROFILE.one.bestSecs, bans:oneBanned(F) || oneBanned(G),
        note:document.getElementById('unlockNote').textContent };
    })()`);
    expect(r.stage).toBe(5);
    expect(r.wins).toBe(1);
    expect(r.best).toBe(95);
    expect(r.bans, 'everyone she erased is back (TPOT 25)').toBe(false);
    expect(r.note).toMatch(/^★ ONE UNLOCKED! Everyone she erased is back\./);
    await sleep(W, 950);
    expect(stored(W).one).toMatchObject({ stage: 5, wins: 1, bestSecs: 95 });
    W.eval(`go('title')`);
    expect(W.eval(`document.getElementById('oneEntry').textContent`)).toBe('🌕 Fight One');
  });
});

describe('step 8: One for good, with any fighter', () => {
  it('the title opens Boss Rush with One picked, and she takes any fighter with AI allies', async () => {
    await fresh(W, `PROFILE.one.stage = 5; PROFILE.one.wins = 1; go('title');`);
    const r = W.eval(`(function(){
      var row = document.getElementById('oneEntryRow').style.display;
      document.getElementById('oneEntry').click();
      var pick = document.querySelector('#segBossPick button.on');
      var out = { row:row, select:document.getElementById('select').classList.contains('active'), mode:SETTINGS.mode, bossPick:SETTINGS.bossPick,
        pickRow:document.getElementById('bossPickRow').style.display, on:pick && pick.dataset.v, summary:document.getElementById('matchSummary').textContent };
      chosen = ROSTER.find(function(r){ return r.name==='Pen'; }); SETTINGS.count = 3; startMatch();
      var one = summons.find(function(s){ return s._oneFight; });
      out.fight = { active:ONEFIGHT.active, story:ONEFIGHT.story, lineup:ONEFIGHT.lineup.slice(), n:fighters.length, rush:BOSSRUSH.active, mult:one._dmgTakenMult };
      return out; })()`);
    expect(r.row).toBe('flex');
    expect(r.select).toBe(true);
    expect([r.mode, r.bossPick, r.pickRow, r.on]).toEqual(['boss', 'one', 'flex', 'one']);
    expect(r.summary).toMatch(/vs One \(2000 HP\)/);
    expect(r.fight.active).toBe(true);
    expect(r.fight.story).toBe(false);
    expect(r.fight.lineup[0], '"no not only as lightning once unlocked"').toBe('Pen');
    expect(r.fight.n).toBe(3);
    expect(r.fight.rush).toBe(false);
    expect(r.fight.mult).toBeCloseTo(1 / 2.2, 6);
    const won = W.eval(`ONEFIGHT.won = true; ONEFIGHT.frames = 60*80; running = true; oneFightCheck();
      ({ wins:PROFILE.one.wins, best:PROFILE.one.bestSecs, stage:PROFILE.one.stage, note:document.getElementById('unlockNote').textContent })`);
    expect(won).toMatchObject({ wins: 2, best: 80, stage: 5 });
    expect(won.note).toMatch(/One beaten 2 times · best 1:20/);
    await sleep(W, 950);
    W.eval(`go('title')`);
  });

  it('stays local, the Gauntlet stays the Gauntlet, and before she is beaten the pick does not exist', async () => {
    await fresh(W, `PROFILE.one.stage = 5; SETTINGS.mode = 'boss'; SETTINGS.count = 1;`);
    const rush = W.eval(`SETTINGS.bossPick = 'rush'; startMatch(); var o = { rush:BOSSRUSH.active, one:ONEFIGHT.active }; running = false; BOSSRUSH.active = false; o`);
    expect(rush).toEqual({ rush: true, one: false });
    expect(W.eval(`SETTINGS.bossPick = 'one'; NET.role = 'host'; var w1 = oneWanted(); NET.role = 'solo'; w1`), 'local play only').toBe(false);
    expect(W.eval(`oneWanted()`)).toBe(true);
    const locked = W.eval(`PROFILE.one.stage = 4; go('select'); ({ wanted:oneWanted(), row:document.getElementById('bossPickRow').style.display })`);
    expect(locked).toEqual({ wanted: false, row: 'none' });
    W.eval(`go('title')`);
  });
});

describe('the chain survives a reload at every step', () => {
  it('merges upward, so a second tab can never undo a step or bring a ban back', () => {
    const m = W.eval(`JSON.stringify(mergeProfiles(
      { one:{ stage:5, erased:['Gaty'], rushLightning:false, wins:1, bestSecs:90 }, fighterStats:{ Lightning:{ g:30, w:25 } }, fighterStatsSeeded:true },
      { one:{ stage:1, erased:['Gaty','Firey'], rushLightning:true, wins:0, bestSecs:120 }, fighterStats:{ Lightning:{ g:31, w:24 }, Pen:{ g:2, w:1 } }, fighterStatsSeeded:false }))`);
    const p = JSON.parse(m);
    expect(p.one).toEqual({ stage: 5, erased: ['Gaty', 'Firey'], rushLightning: true, wins: 1, bestSecs: 90 });
    expect(p.fighterStats).toEqual({ Lightning: { g: 31, w: 25 }, Pen: { g: 2, w: 1 } });
    expect(p.fighterStatsSeeded).toBe(true);
    expect(W.eval(`(function(){ var keep = PROFILE; PROFILE = JSON.parse(${JSON.stringify(m)}); var b = oneBanned(ROSTER.find(function(r){ return r.name==='Firey'; })); PROFILE = keep; return b; })()`),
      'a stale list after her defeat bans nobody').toBe(false);
  });

  it('a save made mid-chain loads back as it was', async () => {
    await fresh(W, `PROFILE.fighterStats = { Lightning:{ g:19, w:14 } }; PROFILE.one.rushLightning = true;`);
    play(W, 'Lightning', true);
    await sleep(W, 0);
    const w2 = boot({ 'profile:v1': W.localStorage.getItem('profile:v1') });
    await w2.eval('profileReady');
    expect(w2.eval(`({ stage:PROFILE.one.stage, erased:PROFILE.one.erased, L:PROFILE.fighterStats.Lightning, rush:PROFILE.one.rushLightning })`))
      .toEqual({ stage: 1, erased: ['Gaty'], L: { g: 20, w: 15 }, rush: true });
  });

  it('a secret stays secret: before the Moon cracks the title has no One button at all, and keeps its six', async () => {
    const w = boot({ 'profile:v1': profileAt({ stage: 2, erased: ['Gaty'] }) });
    await w.eval('profileReady'); await sleep(w, 0);
    const r = w.eval(`({ entry:!!document.getElementById('oneEntry'), row:document.getElementById('oneEntryRow').style.display,
      n:[].slice.call(document.querySelectorAll('#title button')).filter(function(b){ return !b.closest('#dailyCard'); }).length })`);
    expect(r).toEqual({ entry: false, row: 'none', n: 6 });
  });

  it('erasing: the board still shows who is gone, and your pick is Lightning', async () => {
    const w = boot({ 'profile:v1': profileAt({ stage: 1, erased: ['Gaty', 'Barf Bag', 'Basketball', 'Firey'] }) });
    await w.eval('profileReady'); await sleep(w, 0);
    const r = w.eval(`go('select'); ({ chosen:chosen.name, firey:!!document.querySelector('#board .cell.erased'), entry:document.getElementById('oneEntryRow').style.display })`);
    expect(r).toEqual({ chosen: 'Lightning', firey: true, entry: 'none' });
  });

  it('only Lightning left: still only Lightning', async () => {
    const w = boot({ 'profile:v1': profileAt({ stage: 2, erased: ['Gaty'] }) });
    await w.eval('profileReady'); await sleep(w, 0);
    expect(w.eval(`ROSTER.filter(onePickable).map(function(r){ return r.name; })`)).toEqual(['Lightning']);
  });

  it('the Moon not yet seen: the title brings it back, and it plays', async () => {
    const w = boot({ 'profile:v1': profileAt({ stage: 3 }) });
    await w.eval('profileReady'); await sleep(w, 0);
    const r = w.eval(`(function(){ var row = document.getElementById('oneEntryRow').style.display, t = document.getElementById('oneEntry').textContent;
      document.getElementById('oneEntry').click(); return { row:row, t:t, moon:document.getElementById('moonScene').classList.contains('active') }; })()`);
    expect(r).toEqual({ row: 'flex', t: '🌕 Something is wrong with the Moon…', moon: true });
  });

  it('One not yet beaten: the title faces her, as solo Lightning', async () => {
    const w = boot({ 'profile:v1': profileAt({ stage: 4, erased: ['Gaty', 'Firey'] }) });
    await w.eval('profileReady'); await sleep(w, 0);
    const r = w.eval(`(function(){ var t = document.getElementById('oneEntry').textContent; document.getElementById('oneEntry').click();
      return { t:t, story:ONEFIGHT.story, names:fighters.map(function(f){ return f.name; }) }; })()`);
    expect(r).toEqual({ t: '🌕 Face One', story: true, names: ['Lightning'] });
  });

  it('One beaten: no bans, and she is there to fight', async () => {
    const w = boot({ 'profile:v1': profileAt({ stage: 5, erased: ['Gaty', 'Barf Bag', 'Basketball', 'Firey'], wins: 1, bestSecs: 200 }) });
    await w.eval('profileReady'); await sleep(w, 0);
    const r = w.eval(`({ t:document.getElementById('oneEntry').textContent, banned:ROSTER.filter(oneBanned).length, live:oneQuestLive() })`);
    expect(r).toEqual({ t: '🌕 Fight One', banned: 0, live: false });
  });

  it('a Lightning main who already has both conditions starts the chain on first boot, from the match log', async () => {
    const rec = (won) => ({ ts: 1, mode: 'ffa', count: 2, stage: 'goiky', fighters: [{ name: 'Lightning', you: true, controller: 'local', won }] });
    const log = []; for (let i = 0; i < 22; i++) log.push(rec(i < 18));
    const w = boot({ 'balance:matchlog': JSON.stringify(log),
      'profile:v1': profileAt({ stage: 0, rushLightning: true }, { fighterStats: {}, fighterStatsSeeded: false }) });
    await w.eval('profileReady'); await w.eval('seedFighterStats()'); await sleep(w, 0);
    expect(w.eval(`({ stage:PROFILE.one.stage, erased:PROFILE.one.erased.length })`), 'started, but a win has to take the first').toEqual({ stage: 1, erased: 0 });
  });
});
