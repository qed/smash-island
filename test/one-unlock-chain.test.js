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
// And the adversarial review's fixes: every won match erases, the World Cup's and Boss Rush's bosses included; the chain is
// as long as your own roster whatever the board's view; a merged record is a record one tab really had; the tutorial never
// counts; the final crowns you and the Moon follows with nothing to press; and the title keeps its six buttons at every step.

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

  // The victory card used to spell the erasure out in red (#rushQuestNote). The owner: "remove the hint when you beat
  // loop 2." So the card says nothing about it -- but the trigger, the erasure and its save are exactly as before.
  const LOOP2_HINT = /erased|timeline|Moon|vanish|Only Lightning/i;
  it('fires when loop 2 comes last: felling Four is that win, and the victory card gives no hint of it', async () => {
    await fresh(W, `PROFILE.fighterStats = { Lightning:{ g:20, w:15 } };`);
    expect(play(W, 'Lightning', true), 'no loop 2 yet: nothing').toEqual([]);
    expect(W.eval('PROFILE.one.stage')).toBe(0);
    const r = W.eval(`(function(){ showRushVictory(); fighters = [{ name:'Lightning', you:true, team:0 }]; var now = oneRushHook(2);
      var card = document.getElementById('rushVictory');
      var out = { now:now, stage:PROFILE.one.stage, erased:PROFILE.one.erased.slice(), note:!!document.getElementById('rushQuestNote'),
        text:card.textContent };
      card.style.display = 'none'; paused = false; return out; })()`);
    expect(r.now).toEqual(['Gaty']);
    expect(r.stage).toBe(1);
    expect(r.erased).toEqual(['Gaty']);
    expect(r.note, 'the note element is gone from the card').toBe(false);
    expect(r.text, 'no erasure hint anywhere on the card').not.toMatch(LOOP2_HINT);
    await sleep(W, 0);
    expect(stored(W).one.erased, 'the erasure is still saved').toEqual(['Gaty']);
    expect(stored(W).one.stage).toBe(1);
    // the next loop is not another erasure: after the trigger, fighters go per won MATCH
    expect(W.eval(`fighters = [{ name:'Lightning', you:true, team:0 }]; oneRushHook(3); PROFILE.one.erased.length`)).toBe(1);
  });

  it('through the real gauntlet: Four falling to your Lightning triggers the chain, and the card still gives no hint', async () => {
    await fresh(W, `PROFILE.fighterStats = { Lightning:{ g:20, w:15 } };
      SETTINGS.mode = 'boss'; SETTINGS.count = 1; chosen = ROSTER.find(function(r){ return r.name==='Lightning'; });`);
    const r = W.eval(`(function(){
      startMatch();
      BOSSRUSH.bossIdx = BOSS_ROSTER.findIndex(function(b){ return b.name==='Four'; });
      summons = summons.filter(function(s){ return s.type!=='boss'; });
      summons.push({ type:'boss', _bossRush:true, name:'Four', color:'#3a6ad0', x:WW/2, y:groundY()-80, r:80, hp:0, maxHp:500, team:-1 });
      bossRushCheck();
      var card = document.getElementById('rushVictory');
      var out = { loop:BOSSRUSH.loop, card:card.style.display, text:card.textContent, stage:PROFILE.one.stage,
        erased:PROFILE.one.erased.slice(), rush:PROFILE.one.rushLightning };
      running = false; BOSSRUSH.active = false; card.style.display = 'none'; paused = false;
      return out; })()`);
    expect(r.loop).toBe(1);
    expect(r.card, 'the victory card still shows').toBe('flex');
    expect(r.rush).toBe(true);
    expect(r.stage, 'the chain still triggers').toBe(1);
    expect(r.erased, 'and the first fighter is still erased').toEqual(['Gaty']);
    expect(r.text).toMatch(/VICTORY!/);
    expect(r.text).toMatch(/Loop 2 cleared|Keep going/i);
    expect(r.text, 'the owner: "remove the hint when you beat loop 2."').not.toMatch(LOOP2_HINT);
    await sleep(W, 0);
    expect(stored(W).one.erased, 'saved').toEqual(['Gaty']);
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
    // The review: handing your erased fighter the foe's seat changed the one thing the Daily keeps the same for everyone.
    expect(daily.b, 'and if Lightning was today\'s opponent, the foe stays today\'s: a mirror match').toEqual(['Lightning', 'Lightning']);
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
      var R = Math.min(1100, 720)*0.30, hx = 1100*0.5 + MOON_GEO.hit.x*R, hy = 720*0.46 + MOON_GEO.hit.y*R;
      var at = function(t){ log = []; drawMoonFrame(M, t);
        var has = function(k, v){ return log.some(function(e){ return e[0]===k && e[1]===v; }); };
        return { bolt:has('=strokeStyle', '#f2e84b'), crack:has('=strokeStyle', '#2a2a33'), hole:has('=fillStyle', '#05060f'),
                 moonHit:log.some(function(e){ return e[0]==='lineTo' && Math.abs(e[1]-hx) < 0.5 && Math.abs(e[2]-hy) < 0.5; }),
                 bolts:log.filter(function(e){ return e[0]==='=strokeStyle' && e[1]==='#f2e84b'; }).length,
                 one:has('=fillStyle', '#5D7AF2'), hey:log.some(function(e){ return e[0]==='fillText' && e[1]==='Hey guys!'; }),
                 stars:has('=fillStyle', '#9FE8FF') }; };
      return { t05:at(0.5), t12:at(1.2), t20:at(2.0), t33:at(3.3), t70:at(7.0), t95:at(9.5), t120:at(12.0),
               same:JSON.stringify(MOON_GEO)===JSON.stringify(moonGeometry(7)) };
    })()`);
    // TPOT 7 (the wiki's plot): Lightning "unleashes a thunderstorm" and it hits "the moon with One inside of it by accident"
    expect(beats.t05, 'the storm first: bolts, all going down to the ground, none at the Moon').toMatchObject({ bolt: true, moonHit: false, crack: false, hole: false, hey: false });
    expect(beats.t12, '...and the stray that hits the Moon, in Lightning\'s yellow').toMatchObject({ bolt: true, moonHit: true, crack: false });
    expect(beats.t12.bolts, 'it is one bolt among the storm\'s').toBeGreaterThan(1);
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
    W.eval(`ONE_TITLE_MOON_DELAY = 30; PROFILE.one.stage = 3; playMoonScene(); go('title');`);
    expect(W.eval('MOON.raf')).toBe(0);
    expect(W.eval('PROFILE.one.stage'), 'a refresh or a quit mid-scene plays it again').toBe(3);
    expect(W.eval(`!!document.getElementById('oneEntry')`), 'no button for it: the title keeps its six').toBe(false);
    await sleep(W, 90);
    expect(W.eval(`document.getElementById('moonScene').classList.contains('active')`), 'it plays again by itself').toBe(true);
    W.eval(`stopMoonScene(); PROFILE.one.stage = 0; go('title'); ONE_TITLE_MOON_DELAY = 900;`);
  });

  it('there is no way out of the chain anywhere on the page', () => {
    const buttons = W.eval(`[].slice.call(document.querySelectorAll('button')).map(function(b){ return b.textContent + ' ' + (b.getAttribute('onclick')||''); }).join('\\n')`);
    expect(buttons).not.toMatch(/abandon|give up|forfeit/i);
    expect(HTML).not.toMatch(/function\s+\w*(abandon|giveUp)\w*/i);
  });

  it('no way out, walked: every control on her card, her result screen and the title leaves every ban in place', async () => {
    // The review: "No way out" was only tested by grepping. So press everything the player can press between the Moon and
    // a win -- One's card, the result screen after a loss, and the title's own buttons -- and check the chain after each.
    await fresh(W, ARM + ` PROFILE.one.stage = 4; PROFILE.one.erased = ['Gaty','Barf Bag','Basketball','Firey']; unlockFighter('Lightning');`);
    const held = `(PROFILE.one.stage === 4 && oneBanned(ROSTER.find(function(r){ return r.name==='Firey'; })) && oneBanned(ROSTER.find(function(r){ return r.name==='Gaty'; })))`;
    const card = W.eval(`go('moonScene'); document.getElementById('moonCard').style.display = 'flex';
      [].slice.call(document.querySelectorAll('#moonScene button')).filter(function(b){ return b.style.display !== 'none'; }).map(function(b){ return b.textContent; })`);
    expect(card, 'her card: the fight and nothing else').toEqual(['Fight ▸']);
    W.eval(`oneStoryFight(); fighters.forEach(function(f){ f.dead = true; }); running = true; oneFightCheck();`);
    await sleep(W, 950);
    const labels = W.eval(`[].slice.call(document.querySelectorAll('#result .row button')).map(function(b){ return b.textContent; })`);
    expect(labels).toEqual(['Rematch ↻', 'Change fighter', 'Title']);
    for (let i = 0; i < labels.length; i++) {
      W.eval(`oneStoryFight(); fighters.forEach(function(f){ f.dead = true; }); running = true; oneFightCheck();`);
      await sleep(W, 950);
      const after = W.eval(`document.querySelectorAll('#result .row button')[${i}].click(); var h = ${held}; running = false; h`);
      expect(after, `after "${labels[i]}"`).toBe(true);
    }
    W.eval(`go('title')`);
    const title = W.eval(`[].slice.call(document.querySelectorAll('#title button')).map(function(b){ return b.textContent; })`);
    expect(title.join(' | ')).not.toMatch(/abandon|give up|forfeit|skip/i);
    expect(W.eval(held), 'and the title changes nothing').toBe(true);
    expect(W.eval(`chosen = ROSTER.find(function(r){ return r.name==='Firey'; }); SETTINGS.mode='ffa'; SETTINGS.count=2; startMatch(); var n = fighters.find(function(f){ return f.you; }).name; running = false; n`),
      'a match from the title is still Lightning').toBe('Lightning');
    W.eval(`go('title')`);
  }, 30000);
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
    expect(r.note, 'and where to find her: under Boss Rush, where the bosses live').toMatch(/Boss Rush ▸ 🌕 One\.$/);
    await sleep(W, 950);
    expect(stored(W).one).toMatchObject({ stage: 5, wins: 1, bestSecs: 95 });
    W.eval(`go('title')`);
    expect(W.eval(`!!document.getElementById('oneEntry')`), 'the title is everyone\'s title again: six buttons').toBe(false);
  });
});

describe('step 8: One for good, with any fighter', () => {
  it('Boss Rush ▸ One: picked on the select screen, she takes any fighter with AI allies', async () => {
    // She used to have a title button of her own for good, a seventh; the title's rule is six (see the step above).
    await fresh(W, `PROFILE.one.stage = 5; PROFILE.one.wins = 1; go('title');`);
    const r = W.eval(`(function(){
      var row = !document.getElementById('oneEntry') ? 'none' : 'shown';
      go('select');
      document.querySelector('#segMode button[data-v="boss"]').click();
      var shown = document.getElementById('bossPickRow').style.display;
      document.querySelector('#segBossPick button[data-v="one"]').click();
      var pick = document.querySelector('#segBossPick button.on');
      var out = { row:row, shown:shown, select:document.getElementById('select').classList.contains('active'), mode:SETTINGS.mode, bossPick:SETTINGS.bossPick,
        pickRow:document.getElementById('bossPickRow').style.display, on:pick && pick.dataset.v, summary:document.getElementById('matchSummary').textContent };
      chosen = ROSTER.find(function(r){ return r.name==='Pen'; }); SETTINGS.count = 3; startMatch();
      var one = summons.find(function(s){ return s._oneFight; });
      out.fight = { active:ONEFIGHT.active, story:ONEFIGHT.story, lineup:ONEFIGHT.lineup.slice(), n:fighters.length, rush:BOSSRUSH.active, mult:one._dmgTakenMult };
      return out; })()`);
    expect(r.row, 'no title button').toBe('none');
    expect(r.shown, 'the pick appears under Boss Rush once she is beaten').toBe('flex');
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
    // Whole records, the one with more games (the review): taking g and w separately wrote {g:31,w:25}, a record neither tab
    // had, and it inflated the win rate that opens the chain.
    expect(p.fighterStats).toEqual({ Lightning: { g: 31, w: 24 }, Pen: { g: 2, w: 1 } });
    const tie = W.eval(`JSON.stringify(mergeFighterStats({ L:{ g:31, w:24 } }, { L:{ g:31, w:25 } }))`);
    expect(JSON.parse(tie), 'on the same number of games, the better one -- still a record one tab had').toEqual({ L: { g: 31, w: 25 } });
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
    const r = w.eval(`({ entry:!!document.getElementById('oneEntry'),
      n:[].slice.call(document.querySelectorAll('#title button')).filter(function(b){ return !b.closest('#dailyCard'); }).length })`);
    expect(r).toEqual({ entry: false, n: 6 });
  });

  it('keeps the title\'s six buttons at every step of the chain, with at most one more on its one card', async () => {
    // The UI pass: "at most six buttons" (test/ui-simplify). A One row made it seven for everyone from the Moon on, and for
    // good once she was beaten; the review caught it because that test only ever boots a fresh profile.
    for (const stage of [0, 1, 2, 3, 4, 5]) {
      const w = boot({ 'profile:v1': profileAt({ stage, erased: stage ? ['Gaty'] : [], wins: stage === 5 ? 1 : 0 }) });
      await w.eval('profileReady'); await sleep(w, 0);
      const r = w.eval(`({ row:[].slice.call(document.querySelectorAll('#title button')).filter(function(b){ return !b.closest('#dailyCard'); }).length,
        card:document.querySelectorAll('#dailyCard button').length })`);
      expect(r.row, `stage ${stage}`).toBeLessThanOrEqual(6);
      expect(r.card, `stage ${stage}`).toBeLessThanOrEqual(1);
      w.eval(`clearTimeout(ONE_MOON_TIMER)`);
    }
  }, 60000);

  it('erasing: the board still shows who is gone, and your pick is Lightning', async () => {
    const w = boot({ 'profile:v1': profileAt({ stage: 1, erased: ['Gaty', 'Barf Bag', 'Basketball', 'Firey'] }) });
    await w.eval('profileReady'); await sleep(w, 0);
    const r = w.eval(`go('select'); ({ chosen:chosen.name, firey:!!document.querySelector('#board .cell.erased'), entry:!!document.getElementById('oneEntry') })`);
    expect(r).toEqual({ chosen: 'Lightning', firey: true, entry: false });
  });

  it('only Lightning left: still only Lightning', async () => {
    const w = boot({ 'profile:v1': profileAt({ stage: 2, erased: ['Gaty'] }) });
    await w.eval('profileReady'); await sleep(w, 0);
    expect(w.eval(`ROSTER.filter(onePickable).map(function(r){ return r.name; })`)).toEqual(['Lightning']);
  });

  it('the Moon not yet seen: the title brings it back, and it plays by itself', async () => {
    const w = boot({ 'profile:v1': profileAt({ stage: 3 }) });
    await w.eval('profileReady'); await sleep(w, 0);
    const before = w.eval(`({ title:document.getElementById('title').classList.contains('active'), entry:!!document.getElementById('oneEntry') })`);
    expect(before, 'the title first, with nothing to press').toEqual({ title: true, entry: false });
    await sleep(w, 1000);
    expect(w.eval(`document.getElementById('moonScene').classList.contains('active')`), 'then the Moon, by itself').toBe(true);
    w.eval(`stopMoonScene()`);
  });

  it('One not yet beaten: the title faces her, as solo Lightning', async () => {
    const w = boot({ 'profile:v1': profileAt({ stage: 4, erased: ['Gaty', 'Firey'] }) });
    await w.eval('profileReady'); await sleep(w, 0);
    const r = w.eval(`(function(){ var b = document.getElementById('oneEntry'), t = b.textContent, inCard = !!b.closest('#dailyCard'),
      card = document.getElementById('dailyCard').textContent; b.click();
      return { t:t, inCard:inCard, card:/ONE IS WAITING/.test(card) && !/DAILY/.test(card), story:ONEFIGHT.story, names:fighters.map(function(f){ return f.name; }) }; })()`);
    expect(r, 'her card, in the Daily card\'s place').toEqual({ t: 'Face One ▶', inCard: true, card: true, story: true, names: ['Lightning'] });
  });

  it('One beaten: no bans, and she is there to fight', async () => {
    const w = boot({ 'profile:v1': profileAt({ stage: 5, erased: ['Gaty', 'Barf Bag', 'Basketball', 'Firey'], wins: 1, bestSecs: 200 }) });
    await w.eval('profileReady'); await sleep(w, 0);
    const r = w.eval(`({ entry:!!document.getElementById('oneEntry'), daily:/DAILY/.test(document.getElementById('dailyCard').textContent),
      banned:ROSTER.filter(oneBanned).length, live:oneQuestLive() })`);
    expect(r, 'the Daily is back in its place, and she is under Boss Rush').toEqual({ entry: false, daily: true, banned: 0, live: false });
    const pick = w.eval(`go('select'); SETTINGS.mode = 'boss'; syncModeUI(); document.getElementById('bossPickRow').style.display`);
    expect(pick).toBe('flex');
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

describe('the review\'s fixes to the chain', () => {
  it('a World Cup match you win erases one, and the hub says who; a lost or drawn one erases no one', async () => {
    // "ONE fighter erased per WIN", with no mode left out: the cup's matches never reach awardMatchProgress.
    await fresh(W, ARM + ` PROFILE.one.stage = 1; unlockFighter('Lightning'); chosen = oneLightning(); PENDING_TOURNEY = { size:1, mode:'normal' }; startMatch();`);
    const play1 = (kosMine, kosTheirs) => W.eval(`(function(){
      var fx = TOURNEY.fixtures.find(function(f){ return !f.played && (f.a===TOURNEY.myTeam || f.b===TOURNEY.myTeam); });
      if(!fx){ TOURNEY.round = 0; buildGroupFixtures(); fx = TOURNEY.fixtures.find(function(f){ return f.a===TOURNEY.myTeam || f.b===TOURNEY.myTeam; }); }
      watchFixture(fx, true);
      var you = fighters.find(function(f){ return f.you; });
      fighters.forEach(function(f){ f._kos = (f.team===you.team) ? ${kosMine} : ${kosTheirs}; });
      finishWatchedGroup(fx);
      return { erased:PROFILE.one.erased.slice(), hub:document.getElementById('tourneyHubBody').textContent, you:you.name };
    })()`);
    const won = play1(2, 0);
    expect(won.you).toBe('Lightning');
    expect(won.erased).toEqual(['Gaty']);
    expect(won.hub).toMatch(/ERASED FROM THE TIMELINE: Gaty/);
    expect(play1(0, 2).erased, 'a loss').toEqual(['Gaty']);
    expect(play1(1, 1).erased, 'a draw').toEqual(['Gaty']);
    await sleep(W, 0);
    expect(stored(W).one.erased, 'saved at the win').toEqual(['Gaty']);
    W.eval(`endTournament(); go('title');`);
  });

  it('the final crowns you on the spot, and the Moon follows with nothing pressed (the real flow, not advanceKnockout)', async () => {
    // The review: after the final the hub waited for "Sim rest & Continue" before the champions and the Moon.
    await fresh(W, ARM + ` PROFILE.one.stage = 2; unlockFighter('Lightning'); chosen = oneLightning(); ONE_MOON_DELAY = 400;
      PENDING_TOURNEY = { size:1, mode:'normal' }; startMatch();`);
    W.eval(`(function(){
      var t = TOURNEY.myTeam, other = TOURNEY.teams.find(function(x){ return x!==t; });
      var fin = { kind:'ko', a:t, b:other, played:false, result:null };
      TOURNEY.stage = 'knockout'; TOURNEY.knockoutRound = 4; TOURNEY.bracket = [[], [], [], [], [fin]]; TOURNEY.fixtures = [fin]; TOURNEY.fxIndex = 0;
      watchFixture(fin, true);
      var you = fighters.find(function(f){ return f.you; });
      fighters.forEach(function(f){ if(f.team!==you.team){ f.dead = true; f.stocks = 0; } });
      checkWin();
    })()`);
    await sleep(W, 1500);
    const champ = W.eval(`({ champ:TOURNEY.champion===TOURNEY.myTeam, stage:PROFILE.one.stage, hub:document.getElementById('tourneyHubBody').textContent,
      moon:document.getElementById('moonScene').classList.contains('active') })`);
    expect(champ.champ, 'crowned without a click').toBe(true);
    expect(champ.stage).toBe(3);
    expect(champ.hub, "the champions' screen first").toMatch(/YOU win the World Cup!/);
    expect(champ.moon).toBe(false);
    await sleep(W, 500);
    expect(W.eval(`document.getElementById('moonScene').classList.contains('active')`), 'and the Moon plays by itself').toBe(true);
    W.eval(`stopMoonScene(); PROFILE.one.stage = 0; go('title'); ONE_MOON_DELAY = 2000;`);
  });

  it('every boss felled in Boss Rush is a win too, once the chain has started -- never before it', async () => {
    await fresh(W, ARM + ` PROFILE.one.stage = 1; unlockFighter('Lightning'); SETTINGS.mode = 'boss'; SETTINGS.count = 1; chosen = oneLightning();`);
    const fell = () => W.eval(`(function(){
      var b = summons.find(function(s){ return s.type==='boss' && s._bossRush; }); b.hp = 0; bossRushCheck();
      return PROFILE.one.erased.slice(); })()`);
    W.eval(`startMatch();`);
    expect(fell()).toEqual(['Gaty']);
    W.eval(`spawnBossRushBoss();`);
    expect(fell()).toEqual(['Gaty', 'Barf Bag']);
    W.eval(`running = false; BOSSRUSH.active = false; PROFILE.one.stage = 0; PROFILE.one.erased = []; startMatch();`);
    expect(fell(), 'a locked chain: a boss is just a boss').toEqual([]);
    W.eval(`running = false; BOSSRUSH.active = false; go('title');`);
  });

  it('is as long as your own roster whatever the board shows, and the view toggle cannot hand an erased-out fighter back', async () => {
    // The review: the queue read isUnlocked, which is true for everyone in the "show everything" view -- about 74 wins
    // there against 38 in the other, and switching mid-chain changed how many were left.
    await fresh(W, ARM + ` PROFILE.one.stage = 1; PROFILE.one.erased = ['Gaty','Barf Bag','Basketball']; unlockFighter('Lightning');`);
    const r = W.eval(`(function(){
      var left = function(){ return ROSTER.filter(function(r){ return r.play && r.name!=='Lightning' && PROFILE.one.erased.indexOf(r.name)<0 && oneOwns(r); }).length; };
      var pickable = function(){ return ROSTER.filter(onePickable).length; };
      PROFILE.viewMode = 'starters'; var a = { left:left(), next:oneNextErased(), pick:pickable() };
      PROFILE.viewMode = 'everything'; var b = { left:left(), next:oneNextErased(), pick:pickable() };
      var notMine = ROSTER.find(function(r){ return r.play && !oneOwns(r); });
      var banned = notMine ? oneBanned(notMine) : true;
      PROFILE.viewMode = 'starters';
      return { a:a, b:b, banned:banned, name:notMine && notMine.name };
    })()`);
    expect(r.b, 'the same chain in either view').toEqual(r.a);
    expect(r.banned, `a fighter you do not have (${r.name}) cannot be picked while she erases`).toBe(true);
  });

  it('the Daily is played against today\'s foe -- before, only Test Mode ever did -- and under the bans you play it as Lightning', async () => {
    // Found on the bug pass: since Wave 3.5 the fixed opponent went only into the Test Mode lineup, so a real Daily drew
    // its opponent at random and was never "the same seeded matchup for everyone" -- the thing the chain's default keeps.
    const day = (setup) => W.eval(`(function(){ var ds = dailySeed, out = [];
      try { [11, 222, 3333, 44444, 555555].forEach(function(S){
        dailySeed = function(){ return S; };
        var m = oneDailyMatchup(dailyMatchup(S)); ${setup}
        startDailyMatch();
        out.push({ got:[fighters[0].name, fighters[1].name], want:[m.you.name, m.foe.name] });
        running = false; DAILY_ACTIVE = false; PENDING_DAILY = null; }); }
      finally { dailySeed = ds; }
      return out; })()`);
    await fresh(W);
    day('').forEach(d => expect(d.got).toEqual(d.want));
    await fresh(W, ARM + ` PROFILE.one.stage = 1; PROFILE.one.erased = ['Gaty']; unlockFighter('Lightning');`);
    day('').forEach(d => { expect(d.got[0]).toBe('Lightning'); expect(d.got).toEqual(d.want); });
    const mirror = W.eval(`(function(){ chosen = oneLightning(); DAILY_ACTIVE = true; PENDING_DAILY = oneLightning();
      SETTINGS.mode = 'ffa'; SETTINGS.count = 2; beginMatchNow(); var n = fighters.map(function(f){ return f.name; });
      running = false; DAILY_ACTIVE = false; PENDING_DAILY = null; return n; })()`);
    expect(mirror, 'when today\'s foe is Lightning: a mirror match').toEqual(['Lightning', 'Lightning']);
    W.eval(`go('title')`);
  });

  it('the one-time backfill leaves the tutorial out, as live recording always has', async () => {
    const rec = (name, won, dummy) => ({ ts: 1, mode: 'ffa', count: 2, stage: 'goiky',
      fighters: [{ name, you: true, controller: 'local', won }, dummy ? { name: 'Dummy', you: false, controller: 'still', won: !won }
        : { name: 'Leafy', you: false, controller: 'ai', won: !won }] });
    const log = [rec('Firey', true, true), rec('Firey', true, true), rec('Firey', false, false)];
    const w = boot({ 'balance:matchlog': JSON.stringify(log) });
    await w.eval('profileReady'); await w.eval('seedFighterStats()'); await sleep(w, 0);
    expect(w.eval(`PROFILE.fighterStats.Firey`), 'two tutorial runs against the Dummy do not count').toEqual({ g: 1, w: 0 });
  });
});

// The owner, after the chain shipped: "also, make it so that the ais also dont have access to the fighters that have been
// erased. until the world cup, ofc." So from the first erasure until One is beaten, no fighter the computer drives is drawn
// from the erased list -- FFA and Teams opponents and teammates, the Daily's foe, Boss Rush allies, Test mode's dummies, a
// net host's AI fill -- while the World Cup's sides are drawn as they always were, and so is a second human's fighter.
describe('the erased are gone for the AI too ("the ais also dont have access to the fighters that have been erased")', () => {
  const J = JSON.stringify;
  // Two thirds of the roster erased -- the canon three first, as the chain always does -- so every draw has to skip plenty.
  const BIG = `(function(){ var e = ['Gaty','Barf Bag','Basketball'];
    ROSTER.forEach(function(r, i){ if(r.play && r.name!=='Lightning' && e.indexOf(r.name)<0 && i % 3 !== 2) e.push(r.name); });
    return e; })()`;
  const ERASING = (stage = 1, erased = BIG) => ARM + ` PROFILE.one.stage = ${stage}; unlockFighter('Lightning'); PROFILE.one.erased = ${erased};
    chosen = oneLightning(); TOURNEY_MATCH_ACTIVE = false; TOURNEY_WATCHING = null; window.__netRoster = null; SETTINGS.teamKey = '';`;
  // One match's lineup, built the way every match builds it, on its own seed.
  const draw = (mode, count, seed, extra = '') => {
    W.Math.random = mulberry32(seed);
    return W.eval(`(function(){
      SETTINGS.mode = ${J(mode)}; SETTINGS.count = ${count}; LINEUP_MEMO = null; ${extra}
      resize(); setupWorld(); buildFighters();
      return fighters.map(function(f){ return { name:f.name, c:f.controller, you:!!f.you }; });
    })()`);
  };
  const erasedNow = () => new Set(W.eval('PROFILE.one.erased.slice()'));
  const done = () => { W.Math.random = mulberry32(7); W.eval(`LOCAL_PLAYERS = 1; TESTMODE.active = false; window.__netRoster = null; LINEUP_MEMO = null; go('title');`); };

  it('FFA and Teams: across hundreds of seeded matches no AI opponent or teammate is ever an erased fighter', async () => {
    let ai = 0; const seen = new Set();
    for (const stage of [1, 2, 4]) {   // erasing, only Lightning left, and One waiting: all before she is beaten
      await fresh(W, ERASING(stage));
      const erased = erasedNow();
      expect(erased.size).toBeGreaterThan(30);
      for (let s = 0; s < (stage === 1 ? 50 : 12); s++) {
        for (const [mode, count] of [['ffa', 2], ['ffa', 5], ['teams', 4], ['teams', 8], ['teams', 20]]) {
          const f = draw(mode, count, 1000 * stage + s);
          expect(f.length, `${mode} ${count}`).toBe(count);
          expect(f[0]).toMatchObject({ name: 'Lightning', you: true, c: 'local' });
          for (const x of f.filter((y) => y.c === 'ai')) {
            ai++; seen.add(x.name);
            expect(erased.has(x.name), `stage ${stage} ${mode} ${count} seed ${s}: AI drew erased ${x.name}`).toBe(false);
          }
        }
      }
    }
    expect(ai).toBeGreaterThan(1500);
    expect(seen.size, 'drawn from everyone who is not erased, not a fixed few').toBeGreaterThan(15);
    done();
  }, 60000);

  it('the team huddle\'s preview is the same lineup, and a remembered lineup with an erased AI in it is drawn again', async () => {
    await fresh(W, ERASING());
    const erased = erasedNow();
    W.Math.random = mulberry32(99);
    const r = W.eval(`(function(){
      SETTINGS.mode = 'teams'; SETTINGS.count = 8; LINEUP_MEMO = null;
      refreshTeamChat(); var preview = fighters.map(function(f){ return f.name; });
      buildFighters(); var match = fighters.map(function(f){ return f.name; });
      // a lineup remembered from before an erasure (the memo is keyed on mode, count, split and pick, not on the chain)
      LINEUP_MEMO = { key:lineupKey(8), names:['Gaty','Barf Bag','Basketball','Pen','Pin','Leafy','Rocky'], teamOf:null };
      buildFighters(); var redrawn = fighters.filter(function(f){ return f.controller==='ai'; }).map(function(f){ return f.name; });
      return { preview:preview, match:match, redrawn:redrawn };
    })()`);
    expect(r.match, 'the teammates you planned with are the ones you fight beside').toEqual(r.preview);
    for (const n of [...r.preview.slice(1), ...r.redrawn]) expect(erased.has(n), n).toBe(false);
    expect(r.redrawn.length).toBe(7);
    done();
  });

  it('Boss Rush allies are never erased either', async () => {
    await fresh(W, ERASING());
    const erased = erasedNow();
    let allies = 0;
    for (let s = 0; s < 80; s++) {
      const f = draw('boss', 5, 5000 + s);
      for (const x of f.filter((y) => y.c === 'ai')) { allies++; expect(erased.has(x.name), `seed ${s}: ally ${x.name}`).toBe(false); }
    }
    expect(allies).toBe(80 * 4);
    // ...and the real gauntlet: Start in Boss Rush.
    const real = W.eval(`SETTINGS.mode = 'boss'; SETTINGS.count = 5; startMatch();
      var o = fighters.map(function(f){ return { name:f.name, c:f.controller, team:f.team }; }); running = false; BOSSRUSH.active = false; o`);
    expect(real[0].name).toBe('Lightning');
    for (const x of real.slice(1)) { expect(x.c).toBe('ai'); expect(x.team).toBe(0); expect(erased.has(x.name), x.name).toBe(false); }
    done();
  });

  it('the Daily: its foe is never erased, and a stand-in is the same every time for that date', async () => {
    await fresh(W, ERASING());
    const r = W.eval(`(function(){ var out = { replaced:0, kept:0, bad:[], unstable:0, day:null };
      for (var d = 0; d < 730; d++){
        var seed = dailySeed(new Date(Date.UTC(2026, 8, 28 + d)));
        var raw = dailyMatchup(seed), m = oneDailyMatchup(raw), again = oneDailyMatchup(dailyMatchup(seed));
        if (m.you.name !== 'Lightning') out.bad.push(seed + ': you on ' + m.you.name);
        if (PROFILE.one.erased.indexOf(m.foe.name) >= 0) out.bad.push(seed + ': foe ' + m.foe.name + ' is erased');
        if (again.foe !== m.foe || again.you !== m.you) out.unstable++;
        if (m.foe === raw.foe) out.kept++;
        else {
          out.replaced++;
          if (PROFILE.one.erased.indexOf(raw.foe.name) < 0) out.bad.push(seed + ': replaced ' + raw.foe.name + ', who is not erased');
          if (m.foe.name === 'Lightning') out.bad.push(seed + ': a stand-in mirror with others left');
          if (!out.day) out.day = { seed:seed, raw:raw.foe.name, foe:m.foe.name };
        }
      }
      return out; })()`);
    expect(r.bad).toEqual([]);
    expect(r.unstable, 'deterministic: the same date gives the same foe').toBe(0);
    expect(r.replaced, 'erased foes were stood in for').toBeGreaterThan(100);
    expect(r.kept, 'a foe who is not erased stays today\'s foe').toBeGreaterThan(100);
    // More erasures change a stand-in only if they take the stand-in itself.
    const moved = W.eval(`(function(){ var S = ${r.day.seed}, a = oneDailyMatchup(dailyMatchup(S)).foe.name;
      var other = ROSTER.find(function(x){ return x.play && x.name!=='Lightning' && x.name!==a && PROFILE.one.erased.indexOf(x.name)<0; }).name;
      PROFILE.one.erased.push(other); var b = oneDailyMatchup(dailyMatchup(S)).foe.name;
      PROFILE.one.erased.push(b); var c = oneDailyMatchup(dailyMatchup(S)).foe.name;
      return { a:a, b:b, c:c, cErased:PROFILE.one.erased.indexOf(c) >= 0 }; })()`);
    expect(moved.b).toBe(moved.a);
    expect(moved.c).not.toBe(moved.a);
    expect(moved.cErased).toBe(false);
    W.eval(`PROFILE.one.erased = ${BIG};`);
    // The real match, and the title's card, on that day.
    const real = W.eval(`(function(){ var ds = dailySeed; dailySeed = function(){ return ${r.day.seed}; };
      try { startDailyMatch(); return fighters.map(function(f){ return { name:f.name, c:f.controller }; }); }
      finally { running = false; returnDailyLoan(); dailySeed = ds; } })()`);
    expect(real).toEqual([{ name: 'Lightning', c: 'local' }, { name: r.day.foe, c: 'ai' }]);
    W.eval(`window.__ds = dailySeed; dailySeed = function(){ return ${r.day.seed}; };`);
    await W.eval('refreshDailyCard()');
    expect(W.eval(`document.querySelector('#dailyCard .daily-line').textContent`)).toBe(`Lightning  vs  ${r.day.foe}`);
    W.eval('dailySeed = window.__ds;');
    done();
  });

  it('Test mode\'s dummies, a net host\'s AI fill and the tutorial\'s dummy skip the erased too', async () => {
    await fresh(W, ERASING(1, `(function(){ var e = ${BIG};
      ROSTER.filter(function(r){ return r.play; }).slice(1, 5).forEach(function(r){ if(r.name!=='Lightning' && e.indexOf(r.name)<0) e.push(r.name); });
      return e; })()`));
    const erased = erasedNow();
    const usual = W.eval(`ROSTER.filter(function(r){ return r.play; }).slice(1, 5).map(function(r){ return r.name; })`);
    expect(usual.filter((n) => n !== 'Lightning').every((n) => erased.has(n)), 'the usual dummies are all erased here').toBe(true);
    for (const mode of ['still', 'live']) {
      const f = draw('ffa', 2, 1, `TESTMODE.active = true; TESTMODE.dummies = 4; TESTMODE.dummyMode = ${J(mode)};`);
      expect(f.length).toBe(5);
      for (const x of f.slice(1)) expect(erased.has(x.name), `${mode} dummy ${x.name}`).toBe(false);
    }
    W.eval('TESTMODE.active = false;');
    for (let s = 0; s < 30; s++) {
      const f = draw('ffa', 5, 7000 + s, `window.__netRoster = ['Lightning', 'Gaty'];`);
      expect(f[1].name, 'a human\'s pick in the room is theirs').toBe('Gaty');
      for (const x of f.slice(2)) { expect(x.c).toBe('ai'); expect(erased.has(x.name), `net fill ${x.name}`).toBe(false); }
    }
    W.eval('window.__netRoster = null;');
    W.Math.random = mulberry32(3);
    const dummy = W.eval(`startTutorial(); var d = fighters[1]; var o = { color:d.color, kit:d.kit && d.kit.special }; running = false; TUT.active = false; o`);
    const erasedLooks = W.eval(`PROFILE.one.erased.map(function(n){ var r = ROSTER.find(function(x){ return x.name===n; }); return r.color + '|' + r.kit.special; })`);
    expect(erasedLooks).not.toContain(`${dummy.color}|${dummy.kit}`);
    done();
  });

  it('a second player at the keyboard is not an AI: their fighter is drawn exactly as it always was', async () => {
    await fresh(W, ERASING() + ' LOCAL_PLAYERS = 2;');
    const erased = erasedNow();
    let p2Erased = 0;
    for (let s = 0; s < 60; s++) {
      W.eval('PROFILE.one.stage = 1;');
      const now = draw('ffa', 4, 9000 + s);
      W.eval('PROFILE.one.stage = 0;');   // the same seed with the chain not started: the draw as it always was
      const before = draw('ffa', 4, 9000 + s);
      const p2 = now.find((x) => x.c === 'local2');
      expect(p2.name, `seed ${s}`).toBe(before.find((x) => x.c === 'local2').name);
      if (erased.has(p2.name)) p2Erased++;
      for (const x of now.filter((y) => y.c === 'ai')) expect(erased.has(x.name), `seed ${s}: AI ${x.name}`).toBe(false);
    }
    expect(p2Erased, 'so a second human can still be handed an erased fighter').toBeGreaterThan(0);
    done();
  });

  it('the World Cup is the exception ("until the world cup, ofc"): its sides are drawn as they always were', async () => {
    await fresh(W, ERASING());
    const erased = erasedNow();
    W.Math.random = mulberry32(11);
    const r = W.eval(`(function(){
      startTournament(1, 'normal');
      var others = TOURNEY.teams.filter(function(t){ return t !== TOURNEY.myTeam; });
      var onSides = others.filter(function(t){ return PROFILE.one.erased.indexOf(t.members[0].name) >= 0; }).length;
      var fx = TOURNEY.fixtures.find(function(f){ return f.a !== TOURNEY.myTeam && f.b !== TOURNEY.myTeam
        && (PROFILE.one.erased.indexOf(f.a.members[0].name) >= 0 || PROFILE.one.erased.indexOf(f.b.members[0].name) >= 0); });
      watchFixture(fx, false);
      var inMatch = fighters.map(function(f){ return { name:f.name, c:f.controller }; });
      var want = [fx.a.members[0].name, fx.b.members[0].name];
      var aiRuleOff = oneAiBanned(ROSTER.find(function(x){ return x.name==='Gaty'; }));
      running = false; TOURNEY_WATCHING = null; TOURNEY_MATCH_ACTIVE = false;
      var aiRuleBack = oneAiBanned(ROSTER.find(function(x){ return x.name==='Gaty'; }));
      endTournament();
      return { onSides:onSides, inMatch:inMatch, want:want, lead:TOURNEY.myTeam.members[0].name, aiRuleOff:aiRuleOff, aiRuleBack:aiRuleBack };
    })()`);
    expect(r.lead).toBe('Lightning');
    expect(r.onSides, 'erased fighters still lead other sides').toBeGreaterThan(10);
    expect(r.inMatch.map((x) => x.name)).toEqual(r.want);
    expect(r.inMatch.some((x) => x.c === 'ai' && erased.has(x.name)), 'and the computer plays them in the cup\'s matches').toBe(true);
    expect(r.aiRuleOff, 'not during a World Cup match').toBe(false);
    expect(r.aiRuleBack, '...and back after it').toBe(true);
    done();
  });

  it('once One is beaten the erased come back for the AI, as they do for you', async () => {
    await fresh(W, ERASING(5));
    const erased = erasedNow();
    let back = 0;
    for (let s = 0; s < 40; s++) back += draw('ffa', 5, 11000 + s).filter((x) => x.c === 'ai' && erased.has(x.name)).length;
    expect(back, 'erased fighters are drawn again').toBeGreaterThan(40);
    const daily = W.eval(`(function(){ var same = 0; for (var d = 0; d < 200; d++){ var S = 20261001 + d, raw = dailyMatchup(S), m = oneDailyMatchup(raw);
      if (m === raw) same++; } return same; })()`);
    expect(daily, 'the Daily is everyone\'s Daily again').toBe(200);
    expect(W.eval(`oneAiBanned(ROSTER.find(function(x){ return x.name==='Gaty'; }))`)).toBe(false);
    done();
  });

  it('before the chain starts nothing changes: the same seed draws the same lineup', async () => {
    await fresh(W, `chosen = oneLightning(); TOURNEY_MATCH_ACTIVE = false; PROFILE.one.erased = ['Gaty'];`);   // stage 0: a stale list bans nobody
    const a = draw('teams', 8, 12345), b = draw('teams', 8, 12345);
    expect(a).toEqual(b);
    W.eval('PROFILE.one.stage = 1; PROFILE.one.erased = [];');   // started on a loss: nobody erased yet
    expect(draw('teams', 8, 12345), 'nobody erased yet: the same lineup').toEqual(a);
    done();
  });

  it('with nobody left who is not erased, an AI seat falls back to Lightning, never an erased fighter or an empty seat', async () => {
    await fresh(W, ERASING(2, `ROSTER.filter(function(r){ return r.play && r.name!=='Lightning'; }).map(function(r){ return r.name; })`));
    const f = draw('ffa', 5, 1);
    expect(f.map((x) => x.name)).toEqual(['Lightning', 'Lightning', 'Lightning', 'Lightning', 'Lightning']);
    expect(W.eval(`oneDailyMatchup(dailyMatchup(20261225)).foe.name`)).toBe('Lightning');
    const t = draw('ffa', 2, 1, 'TESTMODE.active = true; TESTMODE.dummies = 3;');
    expect(t.map((x) => x.name)).toEqual(['Lightning', 'Lightning', 'Lightning', 'Lightning']);
    done();
  });
});
