import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadMonolith } from './helpers/load-monolith.js';

// TEAM STRATEGY — a teammate that thinks, in the huddle and in the fight.
//
// Three things had to be true for this to be a feature rather than a demo, and each has its own
// section below:
//
//   1. The panel has to APPEAR. The owner's report was "it never pops up, which is weird", and the
//      cause was not the display toggle — it was that the panel is revealed 15px below the fold of
//      a 720px select screen, so it appeared perfectly and nobody could see it.
//   2. The difficulty tier has to pick the model, both in the huddle and mid-fight.
//   3. None of it may block a frame, cost more than it is capped at, trust what the model says,
//      or break when the endpoint is not there — which is every offline session and every deploy
//      before the owner sets ANTHROPIC_API_KEY.

const SOURCE = readFileSync('artifacts/V1/index.html', 'utf8');
const SERVER = readFileSync('api/strategy.js', 'utf8');

/** Boot the game, walk to the select screen, and pick a teams match — the real player path. */
function huddle(seed) {
  const { window: w } = loadMonolith(seed);
  w.eval("go('select')");
  w.document.querySelector('#segMode button[data-v="teams"]').click();
  return w;
}

/**
 * Let the boot's deferred work land. The saved profile hydrates asynchronously and re-runs
 * buildBoard when it does, which walks all the way down to refreshTeamChat. In a browser that
 * happens milliseconds after load, long before a player has typed anything; in a test it lands in
 * the middle of whatever we are doing unless we wait for it first.
 */
const settle = () => new Promise((r) => setTimeout(r, 0));

/** Install a fake fetch in the monolith's own realm and record what it was asked for. */
function stubFetch(w, impl) {
  const calls = [];
  w.fetch = (url, opts) => {
    calls.push({ url: String(url), opts, body: opts && opts.body ? JSON.parse(opts.body) : null });
    return impl(String(url), opts, calls.length);
  };
  return calls;
}

/** A well-formed proxy response carrying `text`. */
const proxyOk = (text) => Promise.resolve({
  ok: true, status: 200, json: () => Promise.resolve({ text, model: 'x', tier: 'x' }),
});
const httpFail = (status) => Promise.resolve({
  ok: false, status, json: () => Promise.resolve({ error: 'nope' }),
});

// =================================================================================================
describe('the strategy panel actually reaches the player', () => {
  it('is hidden for a free-for-all and shown for a teams match', () => {
    const w = huddle();
    const panel = w.document.getElementById('teamChatPanel');
    expect(panel.style.display).toBe('block');
    w.document.querySelector('#segMode button[data-v="ffa"]').click();
    expect(panel.style.display).toBe('none');
  });

  it('scrolls itself into view when revealed — the actual "it never pops up" bug', () => {
    // The display toggle was already correct on main. What was missing is this: measured in a real
    // 720px-tall browser window, clicking Teams put the panel at y=735 inside a 720px scroll box,
    // with the Start button below THAT. Revealing something off-screen is not revealing it.
    const w = huddle();
    const panel = w.document.getElementById('teamChatPanel');
    let scrolled = null;
    panel.scrollIntoView = (arg) => { scrolled = arg; };
    w.document.querySelector('#segMode button[data-v="ffa"]').click();     // hide
    w.document.querySelector('#segMode button[data-v="teams"]').click();   // and reveal again
    expect(scrolled, 'the reveal brings the panel into view').toBeTruthy();
    expect(scrolled.block).toBe('start');   // top-aligned, so the Start button below it is visible too
  });

  it('snaps the panel into place if the smooth scroll never ran', async () => {
    // Measured in a real browser: behavior:'smooth' is animated by the compositor and does not
    // advance at all in a tab that is not painting — scrollTop sat at 0 for 1.5s while
    // behavior:'auto' moved it instantly. A reveal that only works in a foreground tab is the
    // original bug wearing a nicer coat, so the position is verified and snapped shortly after.
    const w = huddle();
    const panel = w.document.getElementById('teamChatPanel');
    const behaviours = [];
    panel.scrollIntoView = (arg) => behaviours.push(arg.behavior);
    panel.getBoundingClientRect = () => ({ top: 9000, height: 400 });   // still far below the fold
    w.document.querySelector('#segMode button[data-v="ffa"]').click();
    w.document.querySelector('#segMode button[data-v="teams"]').click();
    expect(behaviours).toEqual(['smooth']);
    await new Promise((r) => setTimeout(r, 700));
    expect(behaviours, 'the animation did not happen, so the panel is snapped').toEqual(['smooth', 'auto']);
  });

  it('does not snap a second time when the smooth scroll worked', async () => {
    const w = huddle();
    const panel = w.document.getElementById('teamChatPanel');
    const behaviours = [];
    panel.scrollIntoView = (arg) => behaviours.push(arg.behavior);
    panel.getBoundingClientRect = () => ({ top: 40, height: 400 });     // arrived near the top
    w.document.querySelector('#segMode button[data-v="ffa"]').click();
    w.document.querySelector('#segMode button[data-v="teams"]').click();
    await new Promise((r) => setTimeout(r, 700));
    expect(behaviours, 'no redundant jump on top of a working animation').toEqual(['smooth']);
  });

  it('does not yank the page around when the select screen merely opens in teams mode', () => {
    // Re-entering select with teams already chosen must still start at the roster: the player is
    // there to pick a fighter. Only a deliberate click on Teams scrolls.
    const w = huddle();
    const panel = w.document.getElementById('teamChatPanel');
    let scrolled = false;
    panel.scrollIntoView = () => { scrolled = true; };
    w.eval("go('title')"); w.eval("go('select')");
    expect(w.eval('SETTINGS.mode')).toBe('teams');
    expect(panel.style.display).toBe('block');
    expect(scrolled, 'no scroll on a plain screen open').toBe(false);
  });

  it('would catch the reveal being switched off again (mutation check)', () => {
    // Restore the pre-fix behaviour — flip display and stop there — and prove the check above goes
    // red. Without this, "the panel appears" is satisfied by the exact bug that was reported.
    const w = huddle();
    const panel = w.document.getElementById('teamChatPanel');
    let scrolled = false;
    panel.scrollIntoView = () => { scrolled = true; };
    w.eval('syncModeUI = function(){ document.getElementById("teamChatPanel").style.display = "block"; }');
    w.document.querySelector('#segMode button[data-v="teams"]').click();
    expect(panel.style.display, 'the panel is still "shown"...').toBe('block');
    expect(scrolled, '...and still invisible, which the check must reject').toBe(false);
  });

  it('fills the huddle with the real match roster', () => {
    const w = huddle();
    expect(w.document.getElementById('planYourTeam').textContent).toMatch(/\(you\)/);
    expect(w.document.getElementById('planFoes').textContent.trim().length).toBeGreaterThan(0);
    // and the teammate has already opened with a suggestion, instantly, with no network at all
    expect(w.document.getElementById('planLog').textContent).toMatch(/focus/i);
  });
});

// =================================================================================================
describe('the difficulty tier chooses the model', () => {
  it('maps Easy/Normal/Hard to haiku/sonnet/fable', () => {
    const w = huddle();
    expect(w.eval('teamAiTier(0)')).toBe('easy');
    expect(w.eval('teamAiTier(1)')).toBe('normal');
    expect(w.eval('teamAiTier(2)')).toBe('hard');
    expect(w.eval('teamAiModel("easy")')).toBe('claude-haiku-4-5-20251001');
    expect(w.eval('teamAiModel("normal")')).toBe('claude-sonnet-5');
    expect(w.eval('teamAiModel("hard")')).toBe('claude-fable-5');
  });

  it('follows the CPU Skill setting the player actually chose', () => {
    const w = huddle();
    w.document.querySelector('#segAI button[data-v="2"]').click();
    expect(w.eval('AI_LEVEL')).toBe(2);
    expect(w.eval('teamAiTier()')).toBe('hard');
    expect(w.document.getElementById('planAiTier').textContent).toBe('Normal');   // painted on refresh
    w.eval('refreshTeamChat()');
    expect(w.document.getElementById('planAiTier').textContent).toMatch(/Hard/);
  });

  it('falls back to normal for a difficulty that does not exist', () => {
    const w = huddle();
    expect(w.eval('teamAiTier(7)')).toBe('normal');
    expect(w.eval('teamAiTier(-1)')).toBe('normal');
    expect(w.eval('teamAiModel("wildcard")')).toBe('claude-sonnet-5');
  });

  it('sends the tier and never a model id — the server picks the model', () => {
    // A client that names its own model is a client that can be talked into an expensive one.
    const w = huddle();
    const calls = stubFetch(w, () => proxyOk('{"reply":"ok","plan":{}}'));
    w.eval('AI_LEVEL = 2');
    return w.eval('teamAiCall({ tier: teamAiTier(), messages:[{role:"user",content:"hi"}] })').then(() => {
      expect(calls).toHaveLength(1);
      expect(calls[0].url).toBe('/api/strategy');
      expect(calls[0].body.tier).toBe('hard');
      expect(calls[0].body.model, 'the browser must not choose the model').toBeUndefined();
    });
  });

  it('keeps the client and server tier tables identical', () => {
    // Two copies exist by necessity: the proxy maps the tier server-side, and the Advanced path
    // talks to the model directly and needs the same mapping. Drift between them would silently
    // bill the owner for a tier nobody asked for.
    const grab = (src, key) => {
      const at = src.indexOf(key);
      const body = src.slice(at, src.indexOf('};', at));
      return ['easy', 'normal', 'hard'].map((t) => (body.match(new RegExp(`${t}:\\s*'([^']+)'`)) || [])[1]);
    };
    expect(grab(SOURCE, 'const TEAM_AI_MODELS')).toEqual(grab(SERVER, 'const TIER_MODELS'));
    expect(grab(SERVER, 'const TIER_MODELS')).toEqual(
      ['claude-haiku-4-5-20251001', 'claude-sonnet-5', 'claude-fable-5']);
  });
});

// =================================================================================================
describe('model output is treated as untrusted input', () => {
  const validate = (w, entry, opts) => w.eval(`
    (function(){
      var ctx = teamAiContext();
      var cpu = ctx.teams.filter(function(t){ return t.cpu; })[0];
      var e = Object.assign({ team: cpu.team }, ${JSON.stringify(entry)});
      return JSON.parse(JSON.stringify(teamAiValidatePlan({teams:[e]}, ctx, ${JSON.stringify(opts || null)})));
    })()`);

  it('drops a fighter who is not in the match', () => {
    const w = huddle();
    const v = validate(w, { focusName: 'Firey Jr Deluxe' });
    const team = Object.keys(v.plans)[0];
    expect(v.plans[team].focusName, 'a hallucinated name never reaches TEAM_PLAN').toBeNull();
    expect(v.rejected.join(' ')).toContain('Firey Jr Deluxe');
  });

  it('will not let a team focus-fire its own ally, or protect an enemy', () => {
    const w = huddle();
    const out = w.eval(`
      (function(){
        var ctx = teamAiContext();
        var cpu = ctx.teams.filter(function(t){ return t.cpu; })[0];
        var ally = cpu.fighters[0].name;
        var foe = ctx.teams.filter(function(t){ return t.team!==cpu.team; })[0].fighters[0].name;
        var v = teamAiValidatePlan({teams:[{team:cpu.team, focusName:ally, protectName:foe}]}, ctx);
        return { focus: v.plans[cpu.team].focusName, protect: v.plans[cpu.team].protectName,
                 ally: ally, foe: foe, rejected: v.rejected };
      })()`);
    expect(out.focus, 'an ally is not a focus-fire target').toBeNull();
    expect(out.protect, 'an enemy is not someone to protect').toBeNull();
    expect(out.rejected.length).toBe(2);
  });

  it('accepts the real names it is supposed to accept', () => {
    // The rejection tests above are only meaningful if the happy path gets through.
    const w = huddle();
    const out = w.eval(`
      (function(){
        var ctx = teamAiContext();
        var cpu = ctx.teams.filter(function(t){ return t.cpu; })[0];
        var foe = ctx.teams.filter(function(t){ return t.team!==cpu.team; })[0].fighters[0].name;
        var v = teamAiValidatePlan({teams:[{team:cpu.team, stance:'aggressive', focusName:foe,
                 protectName:cpu.fighters[0].name, specialUsage:'spam', riskTolerance:0.25}]}, ctx);
        return { plan: v.plans[cpu.team], foe: foe, rejected: v.rejected };
      })()`);
    expect(out.rejected).toEqual([]);
    expect(out.plan.stance).toBe('aggressive');
    expect(out.plan.focusName).toBe(out.foe);
    expect(out.plan.specialUsage).toBe('spam');
    expect(out.plan.riskTolerance).toBe(0.25);
  });

  it('clamps every enum to a value the game implements', () => {
    const w = huddle();
    const v = validate(w, { stance: 'reckless', specialUsage: 'nuke' });
    const team = Object.keys(v.plans)[0];
    expect(v.plans[team].stance).toBe('balanced');
    expect(v.plans[team].specialUsage).toBe('normal');
    expect(v.rejected).toEqual(['stance reckless', 'specialUsage nuke']);
  });

  it('clamps riskTolerance into 0..1 whatever arrives', () => {
    const w = huddle();
    const at = (v) => { const o = validate(w, { riskTolerance: v }); return o.plans[Object.keys(o.plans)[0]].riskTolerance; };
    expect(at(9)).toBe(1);
    expect(at(-4)).toBe(0);
    expect(at('0.75')).toBe(0.75);
    expect(at('later')).toBe(0.5);      // unparseable falls to the neutral middle, never NaN
    expect(at(null)).toBe(0.5);
  });

  it('refuses to rewrite the human team unless the huddle asked it to', () => {
    // Mid-fight the model plans for CPU teams only: the player's own squad follows what the player
    // set in the huddle. The huddle itself is the one place a human team may be written.
    const w = huddle();
    const out = w.eval(`
      (function(){
        var ctx = teamAiContext();
        var human = ctx.teams.filter(function(t){ return !t.cpu; })[0];
        var mid  = teamAiValidatePlan({teams:[{team:human.team, stance:'aggressive'}]}, ctx);
        var chat = teamAiValidatePlan({teams:[{team:human.team, stance:'aggressive'}]}, ctx, {allowHumanTeams:true});
        return { mid: Object.keys(mid.plans), chat: Object.keys(chat.plans), team: String(human.team) };
      })()`);
    expect(out.mid, 'the in-fight path leaves the human team alone').toEqual([]);
    expect(out.chat).toEqual([out.team]);
  });

  it('rejects a team index that is not in this match, and a reply that is not a plan', () => {
    const w = huddle();
    const v = w.eval('JSON.parse(JSON.stringify(teamAiValidatePlan({teams:[{team:99,stance:"aggressive"}]}, teamAiContext())))');
    expect(v.plans).toEqual({});
    expect(v.rejected).toEqual(['team 99']);
    expect(() => w.eval('teamAiValidatePlan({not:"a plan"}, teamAiContext())')).toThrow();
    expect(() => w.eval('teamAiParseJSON("I would rather not answer in JSON")')).toThrow();
  });

  it('keeps the first answer when the model contradicts itself about a team', () => {
    // Found in the browser, not in a unit test: a payload listing the same team twice used to let
    // the LAST entry win, so a well-formed aggressive plan was replaced by a following entry whose
    // focus target did not exist — the team ended up worse off than if nothing had been asked.
    const w = huddle();
    const out = w.eval(`
      (function(){
        var ctx = teamAiContext();
        var cpu = ctx.teams.filter(function(t){ return t.cpu; })[0];
        var foe = ctx.teams.filter(function(t){ return t.team!==cpu.team; })[0].fighters[0].name;
        var v = teamAiValidatePlan({teams:[
          { team:cpu.team, stance:'aggressive', focusName:foe },
          { team:cpu.team, stance:'defensive',  focusName:'Nonexistent McFakename' }
        ]}, ctx);
        return { plan: v.plans[cpu.team], rejected: v.rejected, foe: foe };
      })()`);
    expect(out.plan.stance).toBe('aggressive');
    expect(out.plan.focusName).toBe(out.foe);
    expect(out.rejected.join(' ')).toContain('duplicate team');
  });

  it('finds the JSON inside a model that wrapped it in prose', () => {
    const w = huddle();
    expect(w.eval('teamAiParseJSON("Sure! ```json\\n{\\"a\\":1}\\n``` hope that helps").a')).toBe(1);
  });
});

// =================================================================================================
describe('the cost guard', () => {
  const gate = (w, state, args) => w.eval(`
    (function(){
      Object.assign(TEAM_AI, ${JSON.stringify(state)});
      return teamAiShouldRefresh(${args.now}, ${JSON.stringify(args.sig)}, ${JSON.stringify(args.tier)});
    })()`);

  it('thinks less often on the expensive tier, not more', () => {
    const w = huddle();
    expect(w.eval('teamAiRefreshMs("normal")')).toBe(12000);      // the owner's "~every 12s"
    expect(w.eval('teamAiRefreshMs("hard")'), 'Fable is the expensive path')
      .toBeGreaterThan(w.eval('teamAiRefreshMs("normal")'));
    expect(w.eval('teamAiMaxCalls("hard")'))
      .toBeLessThan(w.eval('teamAiMaxCalls("normal")'));
  });

  it('skips the call when nothing material has changed', () => {
    const w = huddle();
    const base = { inflight: false, calls: 1, lastAt: 1000, koPending: false, sig: 'same' };
    expect(gate(w, base, { now: 999999, sig: 'same', tier: 'normal' }),
      'a metronome billing for the same answer').toBe(false);
    expect(gate(w, base, { now: 999999, sig: 'different', tier: 'normal' })).toBe(true);
  });

  it('holds the tier cadence, and lets a KO cut in once the minimum gap has passed', () => {
    const w = huddle();
    const base = { inflight: false, calls: 1, lastAt: 100000, koPending: false, sig: 'a' };
    expect(gate(w, base, { now: 105000, sig: 'b', tier: 'normal' }), '5s in, too soon').toBe(false);
    expect(gate(w, base, { now: 113000, sig: 'b', tier: 'normal' }), '13s in, due').toBe(true);
    expect(gate(w, base, { now: 113000, sig: 'b', tier: 'hard' }), 'hard waits 20s').toBe(false);
    const ko = Object.assign({}, base, { koPending: true });
    expect(gate(w, ko, { now: 103000, sig: 'b', tier: 'hard' }), 'a KO 3s in still waits').toBe(false);
    expect(gate(w, ko, { now: 107000, sig: 'b', tier: 'hard' }), 'a KO 7s in cuts the queue').toBe(true);
  });

  it('stops entirely at the per-match ceiling, and never stacks a second call on a slow one', () => {
    const w = huddle();
    expect(gate(w, { inflight: false, calls: 8, lastAt: 1, koPending: true, sig: 'a' },
      { now: 9e9, sig: 'z', tier: 'hard' }), 'hard is capped at 8 calls a match').toBe(false);
    expect(gate(w, { inflight: true, calls: 0, lastAt: 0, koPending: false, sig: 'a' },
      { now: 9e9, sig: 'z', tier: 'normal' }), 'one request in flight at a time').toBe(false);
  });

  it('resets the budget for each new match', () => {
    const w = huddle();
    w.eval('TEAM_AI.calls = 99; TEAM_AI.sig = "stale"; TEAM_AI.inflight = true');
    w.eval('startMatch()');
    expect(w.eval('TEAM_AI.calls')).toBeLessThan(99);
    expect(w.eval('TEAM_AI.sig')).not.toBe('stale');
  });

  it('notices a KO and a damage swing, and ignores noise below the bucket', () => {
    const w = huddle();
    const sigs = w.eval(`
      (function(){
        startMatch();
        var a = teamAiMaterialSig(teamAiContext());
        fighters[1].pct += 3;                       // a poke
        var b = teamAiMaterialSig(teamAiContext());
        fighters[1].pct += 40;                      // a real exchange
        var c = teamAiMaterialSig(teamAiContext());
        fighters[1].stocks -= 1;                    // a KO
        var d = teamAiMaterialSig(teamAiContext());
        return [a, b, c, d];
      })()`);
    expect(sigs[1], 'a 3% poke is not worth a model call').toBe(sigs[0]);
    expect(sigs[2], 'a 40% swing is').not.toBe(sigs[0]);
    expect(sigs[3], 'and so is a lost stock').not.toBe(sigs[2]);
  });
});

// =================================================================================================
describe('nothing blocks a frame', () => {
  it('teamAiTick returns synchronously even when the request never resolves', () => {
    const w = huddle();
    stubFetch(w, () => new Promise(() => {}));    // a request that hangs forever
    w.eval('startMatch()');
    w.eval('TEAM_AI.calls = 0; TEAM_AI.lastAt = 0; TEAM_AI.sig = ""; TEAM_AI.inflight = false');
    // If teamAiTick awaited anything, this expression could not produce a boolean.
    expect(typeof w.eval('teamAiTick()')).toBe('boolean');
    expect(w.eval('TEAM_AI.inflight'), 'the request is out, and the frame moved on').toBe(true);
    // ...and the game keeps stepping while it hangs.
    expect(() => w.eval('for (var i=0;i<200;i++) step();')).not.toThrow();
  });

  it('starts the match immediately, whatever the endpoint is doing', () => {
    const w = huddle();
    stubFetch(w, () => new Promise(() => {}));
    w.eval('startMatch()');
    expect(w.eval('running'), 'Start starts the match, it does not wait for a plan').toBe(true);
    expect(w.eval('fighters.length')).toBeGreaterThan(1);
  });

  it('only looks at the clock twice a second, not every frame', () => {
    expect(SOURCE).toMatch(/hazardT % TEAM_AI_TICK_FRAMES === 0/);
    expect(SOURCE).toMatch(/const TEAM_AI_TICK_FRAMES = 30;/);
  });

  it('a KO marks the next tick without doing any work itself', () => {
    const w = huddle();
    w.eval('startMatch(); TEAM_AI.koPending = false; teamAiKoSignal()');
    expect(w.eval('TEAM_AI.koPending')).toBe(true);
  });
});

// =================================================================================================
describe('TEAM_PLAN updates mid-match, and aiThink reads it', () => {
  it('writes a validated plan into TEAM_PLAN when the answer lands', async () => {
    const w = huddle();
    w.eval('startMatch()');
    const target = w.eval(`
      (function(){
        var ctx = teamAiContext();
        var cpu = ctx.teams.filter(function(t){ return t.cpu; })[0];
        var foe = ctx.teams.filter(function(t){ return t.team!==cpu.team; })[0].fighters[0].name;
        window.__t = cpu.team;
        return { team: cpu.team, foe: foe };
      })()`);
    stubFetch(w, () => proxyOk(JSON.stringify({
      teams: [{ team: target.team, stance: 'aggressive', focusName: target.foe, riskTolerance: 0.9 }],
    })));
    await w.eval('teamAiRestrategise(teamAiContext(), "normal")');
    const plan = w.eval(`JSON.parse(JSON.stringify(TEAM_PLAN[${target.team}]))`);
    expect(plan.stance).toBe('aggressive');
    expect(plan.focusName).toBe(target.foe);
    expect(plan.riskTolerance).toBe(0.9);
  });

  it('aiThink picks the plan up as a plain property read, with no plan meaning no change', () => {
    const w = huddle();
    // planRiskScale/planSpecialUsage are the two new reads. Absent a plan they are exact no-ops,
    // which is what keeps every existing golden valid.
    const out = w.eval(`
      (function(){
        startMatch();
        var f = fighters.filter(function(x){ return !x.you; })[0];
        TEAM_PLAN = {};
        var bare = [planRiskScale(f), planSpecialUsage(f)];
        TEAM_PLAN[f.team] = { riskTolerance: 0, specialUsage: 'spam' };
        var timid = [planRiskScale(f), planSpecialUsage(f)];
        TEAM_PLAN[f.team] = { riskTolerance: 1, specialUsage: 'hoard' };
        var brave = [planRiskScale(f), planSpecialUsage(f)];
        return { bare: bare, timid: timid, brave: brave };
      })()`);
    expect(out.bare, 'no plan = no behaviour change at all').toEqual([1, 'normal']);
    expect(out.timid[0], 'riskTolerance 0 backs off earlier').toBeLessThan(1);
    expect(out.brave[0], 'riskTolerance 1 stays in the fight longer').toBeGreaterThan(1);
    expect(out.timid[1]).toBe('spam');
    expect(out.brave[1]).toBe('hoard');
  });

  it('leaves the random sequence untouched when no plan is present (golden safety)', () => {
    // finishAI's new specialUsage branch must not consume a random draw on the DEFAULT path, or
    // every recorded golden would drift by one number and the whole golden suite would go red for
    // a feature nobody switched on. The `&&` chain short-circuits before Math.random() on 'normal'.
    const w = huddle();
    const draws = (plan) => w.eval(`
      (function(){
        startMatch();
        TEAM_PLAN = {};
        var f = fighters.filter(function(x){ return !x.you; })[0];
        ${plan ? `TEAM_PLAN[f.team] = ${JSON.stringify(plan)};` : ''}
        var real = Math.random; var n = 0;
        Math.random = function(){ n++; return real(); };
        finishAI(f, {left:false,right:false,jump:false,attack:false,special:true,smash:false}, 'ember');
        Math.random = real;
        return n;
      })()`);
    const baseline = draws(null);
    expect(draws(null), 'the default path is stable').toBe(baseline);
    expect(draws({ specialUsage: 'normal' }), "and a plan that says 'normal' costs nothing either")
      .toBe(baseline);
    expect(draws({ specialUsage: 'hoard' }), 'only an actual instruction reaches for the dice')
      .toBe(baseline + 1);
  });
});

// =================================================================================================
describe('it degrades instead of breaking', () => {
  it('falls back to the owner token when the endpoint is not deployed (404)', async () => {
    const w = huddle();
    const calls = stubFetch(w, (url) => (url === '/api/strategy' ? httpFail(404)
      : Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ content: [{ type: 'text', text: 'hi' }] }) })));
    w.document.getElementById('planLocalKey').value = 'placeholder-not-a-real-credential';
    const res = await w.eval('teamAiCall({ tier:"normal", messages:[{role:"user",content:"x"}] })');
    expect(res.source).toBe('local');
    expect(calls.map((c) => c.url)).toEqual(['/api/strategy', 'https://api.anthropic.com/v1/messages']);
    expect(calls[1].opts.headers['x-api-key']).toBe('placeholder-not-a-real-credential');
  });

  it('falls back the same way when the owner has not set the environment variable (503)', async () => {
    const w = huddle();
    const calls = stubFetch(w, (url) => (url === '/api/strategy' ? httpFail(503) : httpFail(401)));
    w.document.getElementById('planLocalKey').value = 'placeholder-not-a-real-credential';
    await expect(w.eval('teamAiCall({ tier:"normal", messages:[{role:"user",content:"x"}] })')).rejects.toThrow();
    expect(calls, 'it tried the proxy first, then the token').toHaveLength(2);
  });

  it('gives up quietly when there is no endpoint and no token', async () => {
    const w = huddle();
    stubFetch(w, () => httpFail(404));
    await expect(w.eval('teamAiCall({ tier:"normal", messages:[{role:"user",content:"x"}] })'))
      .rejects.toThrow(/unconfigured/);
  });

  it('answers the player with scripted tactics when every rung fails', async () => {
    const w = huddle();
    await settle();
    stubFetch(w, () => Promise.reject(new Error('offline')));
    w.document.getElementById('planMsg').value = 'everyone play defensive';
    await w.eval('planSend()');
    const log = w.document.getElementById('planLog').textContent;
    expect(log, 'the player still gets an answer').toMatch(/punish|safe/i);
    expect(log, 'and no spinner is left behind').not.toMatch(/thinking…/);
    expect(w.document.getElementById('planAiStatus').textContent).toMatch(/built-in tactics/i);
    // The instant keyword pass still ran, so the plan controls moved with no network at all.
    expect(w.document.querySelector('#planStance button.on').dataset.v).toBe('defensive');
  });

  it('holds a real conversation and moves the huddle controls when the endpoint answers', async () => {
    const w = huddle();
    await settle();
    const foe = w.eval('(function(){ var y=fighters.find(function(f){return f.you;}); return fighters.filter(function(f){return f.team!==y.team;})[0].name; })()');
    stubFetch(w, () => proxyOk(JSON.stringify({
      reply: `Right — I'll glue myself to ${foe} and you punish the whiffs.`,
      plan: { stance: 'aggressive', focusName: foe },
    })));
    w.document.getElementById('planMsg').value = 'who should we go after?';
    await w.eval('planSend()');
    const log = w.document.getElementById('planLog').textContent;
    expect(log, 'the reply is the model\'s, not a canned line').toContain('glue myself');
    expect(w.document.getElementById('planFocus').value, 'and the huddle shows what was agreed').toBe(foe);
    expect(w.document.querySelector('#planStance button.on').dataset.v).toBe('aggressive');
    expect(w.document.getElementById('planAiStatus').textContent).toMatch(/thinking for real/i);
  });

  it('escapes whatever the model says before it reaches the chat log', async () => {
    const w = huddle();
    await settle();
    stubFetch(w, () => proxyOk(JSON.stringify({ reply: '<img src=x onerror=alert(1)>pow', plan: {} })));
    w.document.getElementById('planMsg').value = 'hi';
    await w.eval('planSend()');
    expect(w.document.getElementById('planLog').querySelectorAll('img')).toHaveLength(0);
    expect(w.document.getElementById('planLog').textContent).toContain('<img src=x');
  });

  it('never lets a mid-fight failure touch the match', async () => {
    const w = huddle();
    stubFetch(w, () => proxyOk('the model felt chatty today and forgot the JSON'));
    w.eval('startMatch()');
    await expect(w.eval('teamAiRestrategise(teamAiContext(), "normal")')).resolves.toBe(0);
    expect(w.eval('running')).toBe(true);
  });

  it('does nothing at all outside a local teams match', () => {
    const w = huddle();
    w.eval('startMatch()');
    w.eval('SETTINGS.mode = "ffa"');
    expect(w.eval('teamAiTick()'), 'a free-for-all has no teams to strategise for').toBe(false);
    w.eval('SETTINGS.mode = "teams"; NET.role = "host"');
    expect(w.eval('teamAiTick()'), 'and a net session is somebody else\'s match').toBe(false);
  });
});

// =================================================================================================
describe('the serverless proxy', () => {
  it('maps the tier itself and refuses to be told a model', () => {
    expect(SERVER).toMatch(/const model = TIER_MODELS\[tier\]/);
    expect(SERVER, 'body.model is never read').not.toMatch(/body\.model/);
  });

  it('reads the key from the environment and never returns it', () => {
    expect(SERVER).toMatch(/process\.env\.ANTHROPIC_API_KEY/);
    expect(SERVER, 'the key is only ever a request header').toMatch(/'x-api-key': key/);
    expect(SERVER, 'and never lands in a response body').not.toMatch(/json\(\{[^}]*key/);
    expect(SERVER, 'nor in a log line').not.toMatch(/console\.\w+\([^)]*key/);
  });

  it('caps what a caller can spend', () => {
    expect(SERVER).toMatch(/MAX_TOKENS_CAP = 600/);
    expect(SERVER).toMatch(/Math\.min\(MAX_TOKENS_CAP/);
    expect(SERVER).toMatch(/MAX_MESSAGES/);
    expect(SERVER).toMatch(/MAX_PROMPT_BYTES/);
  });

  it('answers 503 unconfigured so the client knows to try its own token', () => {
    expect(SERVER).toMatch(/status\(503\)\.json\(\{ error: 'unconfigured' \}\)/);
    expect(SERVER).toMatch(/status\(405\)/);
  });

  it('is deployable beside the static game, and documents what the owner must set', () => {
    const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
    expect(vercel.outputDirectory, 'the static game still ships from here').toBe('artifacts/V1');
    expect(vercel.functions, 'and the function is configured alongside it').toBeTruthy();
    expect(Object.keys(vercel.functions)[0]).toMatch(/^api\//);
    // installCommand is "", so the function must run on built-ins alone — no npm dependency may
    // creep in or the deploy will build a function that cannot start.
    expect(SERVER, 'no imports: nothing is installed at deploy time').not.toMatch(/^\s*(import|require)\b/m);
    expect(SERVER, 'the one thing the owner has to do is written down where they will find it')
      .toMatch(/Environment Variables/);
  });
});
