import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// KITS v2 (the owner, 2026-10-16: the team plans other AIs wrote, pitted against each other in the Flag Cup): the CPU plan engine honours a team plan object pl.kit by SEAT: jobs, areas, the bid, the offers, the pieces each fighter
// buys, where each flag goes, and IF-THEN rules looked at about every second (a line in the spectator panel when one fires). One small test for each part.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
function start(w, map = 'castle') {
  w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=16; SETTINGS.itemRate=0; CTF.skipNav=true; CTF.forceMap='${map}'; beginMatchNow(); fighters.forEach(function(f){ f.controller='ai'; f.you=false; }); CTF.live.plans = null; ctfPlanBegin(CTF.live);`);
}
const seat = (w, t, s) => w.eval(`ctfKitSeats(${t})[${s}]`);

describe('a kit the CPUs honour', () => {
  it('is kept clean: bad entries are dropped, numbers stay in range; and the seats become fighters: jobs fill the slots in order, an area kind becomes a real area of the map', () => {
    const { window: w } = loadMonolith(91);
    start(w);
    const k = J(w, `ctfKitClean({ jobs:{ scout:[1], jailbreak:[2, 3, 4], nope:[1], zone:'x' }, areas:{ 0:'home', 5:'enemyHome', 6:'nowhere' }, bid:{ side:'weird', pts:500 }, offers:{ propose:['both+', 'bad'], accept:['mine+'] },
      budget:{ 1:{ stun:2, wall:99, junk:3 } }, flags:{ 2:{ spot:'deepHome', cover:'crate' }, 3:{ spot:'moon' } }, rules:[{ if:{ kind:'behind', n:1 }, then:{ kind:'allDefend' } }, { if:{ kind:'nope' }, then:{ kind:'allDefend' } }, { if:{ kind:'ahead' }, then:{ kind:'role', who:1, role:'bogus' } }] })`);
    expect(Object.keys(k.jobs), 'only real ideas with a list of seats').toEqual(['scout', 'jailbreak']);
    expect(k.areas, 'the unknown kind goes').toEqual({ 0:'home', 5:'enemyHome' });
    expect(k.bid, 'a bid in range').toEqual({ side:'any', pts:99 });
    expect(k.offers.propose, 'only real offers').toEqual(['both+']); expect(k.offers.refuseOthers).toBe(true);
    expect(k.budget[1], 'pieces in range, unknown ones dropped').toEqual({ stun:2, wall:40 });
    expect(k.flags[3].spot, 'a spot that is not one').toBe(null);
    expect(k.rules.length, 'a rule with an unknown trigger or a bad role is dropped').toBe(1);
    w.eval(`ctfKitSet(CTF.live, 0, { jobs:{ scout:[1], jailbreak:[2, 3, 4] }, areas:{ 0:'home', 5:'enemyHome' } })`);
    const jobs = J(w, 'CTF.live.plans[0].jobs');
    expect(jobs['scout.scout']).toBe(seat(w, 0, 1));
    expect([jobs['jailbreak.rescuer'], jobs['jailbreak.raider1'], jobs['jailbreak.raider2']], 'the slots in order').toEqual([seat(w, 0, 2), seat(w, 0, 3), seat(w, 0, 4)]);
    const a = J(w, 'CTF.live.plans[0].areas'), own = J(w, `ctfPlanAreas(CTF.live.map).find(function(q){ return q.id === ${JSON.stringify(a[seat(w, 0, 0)])}; })`), foe = J(w, `ctfPlanAreas(CTF.live.map).find(function(q){ return q.id === ${JSON.stringify(a[seat(w, 0, 5)])}; })`);
    expect(own.side, 'home is on its own side').toBe(0); expect(foe.side, 'the enemy home is on the other').toBe(1);
    expect(w.eval(`ctfPlanForcedRole(CTF.live.plans[0], ${seat(w, 0, 0)})`), 'a seat sent to its own area defends').toBe('def');
    expect(w.eval(`ctfPlanForcedRole(CTF.live.plans[0], ${seat(w, 0, 5)})`), 'one sent to theirs attacks').toBe('att');
  });

  it('the budget: each fighter places the pieces it bought and no more, and a piece nobody bought is not built', () => {
    const { window: w } = loadMonolith(92);
    start(w);
    w.eval(`fighters.forEach(function(f){ CTF.live.pts[f.idx] = 20; });`);
    w.eval(`ctfKitSet(CTF.live, 0, { budget:{ 1:{ stun:2 }, 2:{ spikes:1, wall:1 } } })`);
    const r = J(w, `(function(){ var L = CTF.live, M = CTF.map, pl = L.plans[0], c = ctfPlanCtx(L, pl), f1 = fighters[${seat(w, 0, 1)}], f2 = fighters[${seat(w, 0, 2)}], f0 = fighters[${seat(w, 0, 0)}];
      var spots = M.spots.filter(function(s){ return s.team === 0 && s.x < M.WW/2 - 2000; }), got = { stun:0, spikes:0, wall:0, tramp:0 }, p0 = [L.pts[f0.idx], L.pts[f1.idx], L.pts[f2.idx]];
      var tryAt = function(role, tool, kind){ for(var i = 0; i < spots.length; i++){ var s = spots[i]; if(s.used) continue; var sh = ctfEditShape(tool, kind, s.x, s.y); if(ctfEditCheck(f1, tool, kind, sh)) continue; s.used = true; var e = c.put(role, tool, kind, s.x, s.y, [0]); return e; } return null; };
      for(var k = 0; k < 4; k++) if(tryAt('trapper', 'trap', 'stun')) got.stun++;
      for(var k = 0; k < 3; k++) if(tryAt('trapper', 'trap', 'spikes')) got.spikes++;
      if(tryAt('trapper', 'trap', 'spring')) got.tramp++;
      return { got:got, spent:[p0[0] - L.pts[f0.idx], p0[1] - L.pts[f1.idx], p0[2] - L.pts[f2.idx]], owners:L.edits.map(function(e){ return e.owner; }) }; })()`);
    expect(r.got.stun, 'two stun pads were bought').toBe(2); expect(r.got.spikes, 'one spike trap').toBe(1); expect(r.got.tramp, 'nobody bought a spring').toBe(0);
    expect(r.spent[0], 'a fighter with no budget places nothing').toBe(0);
    expect(r.spent[1], 'two stun pads: 10 points').toBe(10); expect(r.spent[2], 'one spike trap: 5 points').toBe(5);
  });

  it('the flags: a spot kind is read from the real map and each fighter\'s candidates are only places of that kind (and that cover when one has it)', () => {
    const { window: w } = loadMonolith(93);
    start(w);
    const r = J(w, `(function(){ var M = CTF.map, kinds = ctfKitSpotKinds(M, null, 0), mid = M.WW/2, all = M.spots.filter(function(s){ return s.team === 0; }), count = {}, bad = 0;
      all.forEach(function(s){ var k = kinds.get(s); k.forEach(function(x){ count[x] = (count[x] || 0) + 1; }); if(k.has('deepHome') && Math.abs(s.x - mid) < 0.7*mid) bad++; if(k.has('approach') && Math.abs(s.x - mid) >= 0.45*mid) bad++; });
      var cover = (all.find(function(s){ return s.cover; }) || {}).cover;
      return { total:all.length, count:count, bad:bad, cover:cover }; })()`);
    expect(r.count.deepHome, 'some places are deep home').toBeGreaterThan(0); expect(r.count.approach, 'some are on the approach').toBeGreaterThan(0); expect(r.bad, 'each is where its kind says').toBe(0);
    w.eval(`ctfKitSet(CTF.live, 0, { flags:{ 2:{ spot:'deepHome', cover:'any' }, 3:{ spot:'approach', cover:'any' } } })`);
    const c = J(w, `(function(){ var L = CTF.live, M = CTF.map, cand = M.spots.filter(function(s){ return s.team === 0; }), kinds = ctfKitSpotKinds(M, null, 0), f2 = fighters[${seat(w, 0, 2)}], f3 = fighters[${seat(w, 0, 3)}], f4 = fighters[${seat(w, 0, 4)}];
      var a = ctfKitFlagCands(f2, cand, null, M), b = ctfKitFlagCands(f3, cand, null, M), n = ctfKitFlagCands(f4, cand, null, M);
      return { a:a.length > 0 && a.every(function(s){ return kinds.get(s).has('deepHome'); }), b:b.length > 0 && b.every(function(s){ return kinds.get(s).has('approach'); }), none:n, kit2:ctfKitHasFlag(f2), kit4:ctfKitHasFlag(f4) }; })()`);
    expect(c.a, 'deep home').toBe(true); expect(c.b, 'approach').toBe(true); expect(c.none, 'no word on seat 4: the plan decides').toBe(null); expect(c.kit2 && !c.kit4).toBe(true);
    // oak: the mill is the room under the map
    const { window: o } = loadMonolith(94);
    start(o, 'oak');
    const m = J(o, `(function(){ var M = CTF.map, kinds = ctfKitSpotKinds(M, null, 0), n = 0, off = 0; M.spots.forEach(function(s){ if(s.team !== 0) return; var k = kinds.get(s); if(k.has('mill')){ n++; if(!(s.y > M.pocketY)) off++; } }); return { n:n, off:off }; })()`);
    expect(m.n, 'the mill has hiding places').toBeGreaterThan(0); expect(m.off, 'all of them under the map').toBe(0);
  });

  it('the bid: a fortress or an open side and a number of points; the CPUs of a side with a kit bid by it', () => {
    const { window: w } = loadMonolith(95);
    start(w, 'oak');
    w.eval(`CTF.kitIn = [{ bid:{ side:'fortress', pts:4 } }, { bid:{ side:'open', pts:30 } }];`);
    const def = 'CTF_MAPS.oak', fort = w.eval(`${def}.asym.icons.indexOf('fort')`), run = w.eval(`${def}.asym.icons.indexOf('run')`);
    expect(J(w, `ctfBidCpu(0, ${def})`)).toEqual({ side:fort, amt:4 });
    expect(J(w, `ctfBidCpu(1, ${def})`), 'the bid is at most 10 a fighter').toEqual({ side:run, amt:10 });
    w.eval('CTF.kitIn = null');
    expect(w.eval(`ctfKitBid(0, ${def})`), 'no kit: the usual reckoning').toBe(null);
  });

  it('offers (advanced rules only): the CPUs of a side propose what the kit says, one at a time, and accept only what it lists', () => {
    const { window: w } = loadMonolith(96);
    start(w);
    w.eval(`ctfKitSet(CTF.live, 0, { offers:{ propose:['both+', 'mine-'], accept:['both-'], refuseOthers:true } }); ctfKitSet(CTF.live, 1, { offers:{ propose:[], accept:['both+'], refuseOthers:false } });`);
    w.eval(`CTF.live.t = 240; CTF.live.offerCool = 0; CTF.live.offer = null; ctfKitHideTick(CTF.live);`);
    expect(w.eval('CTF.live.offer'), 'off: nothing is proposed').toBe(null);
    w.eval(`ctfAdvSet(true); CTF.live.t = 240; ctfKitHideTick(CTF.live);`);
    expect(w.eval('CTF.live.offer && CTF.live.offer.kind'), 'the first proposal').toBe('both+');
    expect(w.eval(`ctfKitVerdict(CTF.live, { to:0, kind:'both-' })`)).toBe(true);
    expect(w.eval(`ctfKitVerdict(CTF.live, { to:0, kind:'both+' })`), 'refuseOthers: a no to anything not listed').toBe(false);
    expect(w.eval(`ctfKitVerdict(CTF.live, { to:1, kind:'both+' })`), 'listed').toBe(true);
    expect(w.eval(`ctfKitVerdict(CTF.live, { to:1, kind:'mine+' })`), 'not refusing others: the usual (a one-sided gain is refused)').toBe(false);
    expect(w.eval(`ctfKitVerdict(CTF.live, { to:1, kind:'both-' })`), 'not refusing others: the usual (an even trade is taken)').toBe(true);
  });

  it('the rules: a rule fires when its trigger becomes true (once if asked), changes roles, areas, the preset or the mode, and leaves a line for the panel', () => {
    const { window: w } = loadMonolith(97);
    start(w);
    w.eval(`ctfEndHide(CTF.live); CTF.live.plans = null; ctfPlanBegin(CTF.live);`);
    w.eval(`ctfKitSet(CTF.live, 0, { rules:[
      { if:{ kind:'behind', n:1 }, then:{ kind:'allDefend' } },
      { if:{ kind:'jailedUs', n:2 }, then:{ kind:'role', who:1, role:'def' } },
      { if:{ kind:'minutes', n:0 }, then:{ kind:'area', who:2, area:'enemyHome' }, once:true },
      { if:{ kind:'flagsLeftThem', n:100 }, then:{ kind:'preset', preset:'turtle' }, once:true },
      { if:{ kind:'enemiesOnOurHalf', n:50 }, then:{ kind:'noChase' } } ] })`);
    const pl = 'CTF.live.plans[0]';
    w.eval('ctfKitRules(CTF.live)');
    expect(w.eval(`${pl}.preset`), 'a preset rule switches the plan').toBe('turtle');
    expect(w.eval(`${pl}.areas[${seat(w, 0, 2)}] != null`), 'an area rule sends the seat there').toBe(true);
    expect(w.eval(`${pl}.kitState.kitMode`), 'behind did not fire (level)').toBe(null);
    expect(J(w, `${pl}.kitState.fired.filter(Boolean).length`), 'two fired').toBe(2);
    w.eval('ctfKitRules(CTF.live)');
    expect(J(w, `${pl}.kitState.fired.filter(Boolean).length`), 'a rule that is still true does not fire again').toBe(2);
    w.eval(`CTF.live.score = [0, 1]; ctfKitRules(CTF.live)`);
    expect(w.eval(`${pl}.kitState.kitMode`), 'behind by one: everyone defends').toBe('def');
    w.eval(`fighters[${seat(w, 0, 3)}]._jail = 0; fighters[${seat(w, 0, 4)}]._jail = 0; ctfKitRules(CTF.live)`);
    expect(w.eval(`${pl}.assign[${seat(w, 0, 1)}]`), 'two of ours in jail: seat 1 becomes a defender').toBe('def');
    expect(w.eval('ctfKitLogRow(0)'), 'a line for the spectator panel').toMatch(/^If .*: .* \(\d+:\d\d\)$/);
    expect(w.eval('ctfKitLogRow(1)'), 'the other team has none').toBe(null);
    // the mode and the rules' tactics are used after the dealing: holding position turns the chasers into zone keepers, a counter-raid sends half of the defenders
    w.eval(`ctfKitDo(CTF.live, ${pl}, { kind:'noChase' }); ctfKitDo(CTF.live, ${pl}, { kind:'counterRaid' });`);
    const dt = J(w, `(function(){ var ids = ${pl}.cpus.slice(0, 4), defs = ids.map(function(i){ return fighters[i]; }), defTags = {}; defTags[ids[0]] = 'chase'; defTags[ids[1]] = 'mark'; defTags[ids[2]] = 'patrol'; defTags[ids[3]] = 'patrol';
      ctfKitAfterDeal(CTF.live, ${pl}, { defs:defs, tags:{}, defTags:defTags }); return ids.map(function(i){ return defTags[i]; }); })()`);
    expect(dt, 'no chasing; two of four go counter-raiding').toEqual(['counter', 'counter', 'patrol', 'patrol']);
  });

  it('a kit set on the plan from outside (the Flag Cup sets pl.kit at kick-off) is taken up the first time anything asks: cleaned, its jobs in the vote; and the kit of a Flag Cup team gives the bid before the match exists', () => {
    const { window: w } = loadMonolith(98);
    start(w);
    w.eval(`CTF.live.plans[0].kit = { jobs:{ scout:[1] }, budget:{ 1:{ stun:1, bogus:5 } }, rules:[] };`);
    expect(w.eval(`ctfKitBudgetState(CTF.live.plans[0])[${seat(w, 0, 1)}].stun`), 'the budget is read').toBe(1);
    expect(w.eval(`CTF.live.plans[0].jobs['scout.scout']`), 'and the job is in the vote').toBe(seat(w, 0, 1));
    expect(w.eval(`CTF.live.plans[0].kit.budget[1].bogus`), 'cleaned').toBeUndefined();
    w.eval(`CTF.cupFix = { a:{ strat:{ mode:'fixed', kit:{ bid:{ side:'open', pts:2 } } } }, b:{ strat:{ mode:'auto', kit:{ bid:{ side:'open', pts:9 } } } } };`);
    const def = 'CTF_MAPS.oak', run = w.eval(`${def}.asym.icons.indexOf('run')`);
    expect(J(w, `ctfKitBid(0, ${def})`), 'the kit of a fixed team bids').toEqual({ side:run, amt:2 });
    expect(w.eval(`ctfKitBid(1, ${def})`), 'a team on the strategist has no kit').toBe(null);
  });
});
