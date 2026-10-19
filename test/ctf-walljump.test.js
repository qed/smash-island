import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// WALL JUMPS COUNT IN THE "MUST BE POSSIBLE" CHECK (the owner, 2026-10-18, in Capture the Flag: "the ai flagged a possible neutral-walljump neo as impossible, and removed my defense...").
// His setup, in a ship room: the flag lying in a nook; right beside it a tall stone column; on the column a WIDER block that overhangs back over the flag. The way in is up the column's
// face with wall jumps; the way out of the nook is up the column under the overhang and round its lip (a neo). Asked, he chose "Count wall jumps" (wall jumps, neutral ones and the neo round an
// overhang, count as possible when the check looks at what PLAYERS built) and, when something truly cannot be reached, the "Smallest piece" goes (only that one piece, never the defense).
// One test of his setup end to end (the graph, the check, a CPU attacker, a person with real key presses), one of a sealed box losing one piece.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const X = 5580, Y = 3240;   // the factory's long floor on the first side, cleared above (the same place as the sealed-room test in ctf-plan)

function boot(seed) {
  const { window: w } = loadMonolith(seed);
  w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='factory'; beginMatchNow(); fighters.forEach(function(f){ f.controller='ai'; f.you=false; });`);
  for (let i = 0; i < 4000 && w.eval('!(CTF.nav && CTF.nav.ready && CTF.live.phase === "hide")'); i++) { w.eval('step()'); if (i % 50 === 0) w.eval('CTF.nav && !CTF.nav.ready && ctfNavTick(CTF.nav, 200)'); }
  return w;
}
// the space cleared (its platforms and the conveyor belt there); for his setup the ship room's back wall and ceiling are the map's (the way in is from the right); then the pieces, placed as a player places them (ctfEditPlaceAt)
function build(w, setup) {
  return J(w, `(function(){ var L = CTF.live, M = CTF.map, f = fighters.find(function(q){ return q.team === 0; }); L.pts[f.idx] = 9999; var X = ${X}, Y = ${Y};
    L.edits = []; ctfRebuildDyn(L);
    M.plats = M.plats.filter(function(q){ return !(q.y < Y - 5 && q.y + q.h > Y - 900 && q.x < X + 900 && q.x + q.w > X - 620); });
    var away = function(z){ return !(z.y < Y + 10 && z.y + z.h > Y - 900 && z.x < X + 900 && z.x + z.w > X - 620); };   /* (and the conveyor belt on this floor: a ship's room has none) */
    M.zones = (M.zones || []).filter(away); worldZones = worldZones.filter(away);
    ${setup === 'owner' ? 'M.plats.push({ x:X - 460, y:Y - 680, w:60, h:680, solid:true }, { x:X - 460, y:Y - 680, w:820, h:60, solid:true });' : ''}
    worldPlats = M.plats.map(function(p){ return Object.assign({}, p); }); ctfRebuildDyn(L);
    var put = function(t, k, x, y){ var e = ctfEditPlaceAt(f, t, k, x, y); return e ? { id:e.id, kind:e.kind, x:e.x, y:e.y, w:e.w, h:e.h } : null; }, out = [];
    ${setup === 'owner'
      ? "out.push(put('wall', 'wall', X + 30, Y - 120)); out.push(put('wall', 'block', X, Y - 300));"   // the column (60 x 240) and the wider block on it, overhanging the nook by a column's width
      : "out.push(put('wall', 'wall', X - 270, Y - 120)); out.push(put('wall', 'wall', X + 30, Y - 120)); out.push(put('wall', 'block', X - 240, Y - 300)); out.push(put('wall', 'block', X - 120, Y - 300)); out.push(put('wall', 'block', X, Y - 300)); out.push(put('plat', 'plat', X + 240, Y - 120));"}   // two walls and a roof of three blocks on them; a platform outside
    var fl = L.flags.find(function(q){ return q.team === 0; }); ctfPlaceFlag(fl, X - ${setup === 'owner' ? 70 : 120}, Y);
    return out; })()`);
}
function check(w) {
  return J(w, `(function(){ var L = CTF.live, before = L.edits.filter(function(e){ return ctfEditStructural(e); }).length;
    ctfFixBegin(L); var g = 0; while (L.fix && g++ < 100000) ctfFixStep(L);
    return { before:before, left:L.edits.filter(function(e){ return ctfEditStructural(e); }).map(function(e){ return e.id; }), removed:L.removedByFix || 0, gone:L.fixGone || [], phase:L.phase, problems:ctfEditProblems(L, CTF.nav) }; })()`);
}
// everyone but the one we watch stands at their home, far away
const clear = (w) => w.eval(`fighters.forEach(function(f){ f.controller = 'still'; f.you = false; var sp = CTF.map.homes[f.team].spawns[0]; f.x = sp.x + (f.idx % 5)*30; f.y = sp.y - f.r; f.vx = f.vy = 0; }); CTF.live.over = false;`);
const nodeOf = (w, x, y) => w.eval(`(function(){ var n = ctfNavNodeAt(CTF.nav, ${x}, ${y}, 10); return n ? n.id : -1; })()`);

describe('capture the flag: wall jumps count when the check looks at what players built', () => {
  it("the owner's setup (a column, a wider block overhanging the flag in its nook): kept whole; a CPU attacker gets to the flag up the column; a person does it with the keys, wall jumps in and the neo round the lip out", { timeout: 300000 }, () => {
    const w = boot(91);
    const pieces = build(w, 'owner');
    expect(pieces.every(Boolean), 'the column and the block went down as a player places them').toBe(true);
    expect(pieces[1].x, 'the block overhangs the nook').toBeLessThan(pieces[0].x);
    // THE OLD CHECK: its graph has no wall jump (the moves the shipped maps still plan with), and in it the flag cannot be reached: the old code took the column away (68 s headless, so the
    // graph alone stands for it here: what it found unreachable is what it removed for)
    const graph = (wj) => J(w, `(function(){ CTF.noWallJump = ${!wj}; var L = CTF.live, nav = ctfEditNav(L, L.edits.filter(function(e){ return ctfEditStructural(e); }).length); while(!nav.ready) ctfNavTick(nav, 80, 6); CTF.noWallJump = false;
      return { problems:ctfEditProblems(L, nav), walls:nav.nodes.reduce(function(a, n){ return a + n.edges.filter(function(e){ return e.kind === 'wall'; }).length; }, 0) }; })()`);
    const old = graph(false);
    expect(old.problems, 'without wall jumps the nook is shut: the old check took a piece away').toEqual(['flag0']);
    expect(old.walls).toBe(0);
    // THE CHECK NOW: up the column's face with wall jumps is a move, so nothing is taken away
    const r = check(w);
    expect(r.removed, 'nothing taken away').toBe(0);
    expect(r.left.length, 'the column and the block both stand').toBe(2);
    expect(r.problems, 'and everything is reachable').toEqual([]);
    expect(r.phase).toBe('play');
    const walls = J(w, `(function(){ var out = []; CTF.nav.nodes.forEach(function(n){ n.edges.forEach(function(e){ if(e.kind === 'wall') out.push({ from:e.from, to:e.to, prof:e.prof || '', xa:e.xa, wj:e.wj, cost:e.cost, risky:!!e.risky }); }); }); return out; })()`);
    const right = nodeOf(w, X + 300, Y), nook = nodeOf(w, X - 70, Y), top = nodeOf(w, X, Y - 360);
    expect(right >= 0 && nook >= 0 && top >= 0 && new Set([right, nook, top]).size === 3, 'the room floor, the nook and the block top are three places').toBe(true);
    expect(walls.some(e => e.from === right && (e.to === top || e.to === nook) && e.prof === 'f' && !e.risky), 'in: up the column with wall jumps').toBe(true);
    expect(walls.some(e => e.from === nook && (e.to === top || e.to === right) && e.wj.a1 > 0), 'out of the nook: a kick off the column held away, round the lip (the neo)').toBe(true);
    expect(walls.every(e => e.cost >= w.eval('CTF_WJ_COST')), 'a wall jump is a last resort for a CPU').toBe(true);

    // A CPU ATTACKER: from the room floor to the flag, over and over (it plans the wall jumps only because the flag is behind them)
    clear(w);
    const atk = J(w, `fighters.filter(function(f){ return f.team === 1 && msOf(f); }).slice(0, 3).map(function(f){ return f.idx; })`);
    let got = 0, tries = 0;
    for (const a of atk) for (let k = 0; k < 2; k++) {
      tries++;
      w.eval(`(function(){ var L = CTF.live, f = fighters[${a}], fl = L.flags.find(function(q){ return q.team === 0; }), ai = f._ai;
        fighters.forEach(function(g){ if(g._cf === fl.id) g._cf = -1; if(g !== f){ g.controller = 'still'; var sp = CTF.map.homes[g.team].spawns[0]; g.x = sp.x; g.y = sp.y - g.r; } });
        f.controller = 'ai'; f.dead = false; f._jail = null; L.jails.forEach(function(j){ j.pris = j.pris.filter(function(i){ return i !== f.idx; }); }); f.hitstun = 0; f._cf = -1; f.x = ${X} + 160 + ${k}*270; f.y = ${Y} - f.r; f.vx = f.vy = 0; f.onground = true; f.jumps = 2;
        ctfPlaceFlag(fl, ${X} - 70, ${Y}); L.over = false;
        ctfAiResetMove(ai); ai.ban = {}; L.ai.gban = {}; L.ai.gfail = {}; ai.wjOK = {}; ai.deadN = {}; ai.dead = {}; ai.fight = 0; ai.think = 0;
        ai.role = 'att'; L.plans = null;   /* (an attacker on this one errand: the sides' plans would deal it a role and an errand of their own) */
        ai.goal = { kind:'flag', id:fl.id, x:fl.x, y:fl.y }; ai.replan = 1e12; window.__A = f; window.__F = fl; })()`);
      for (let t = 0; t < 1200; t++) { w.eval('step()'); if (w.eval('__F.st === 2 && __F.car === __A.idx')) { got++; break; } }
    }
    expect(tries, 'three CPUs with the wall jump').toBe(6);
    expect(got, 'a CPU attacker reaches the flag up the column (out of ' + tries + ')').toBeGreaterThanOrEqual(tries - 1);

    // A PERSON, WITH THE KEYS: up the column (wall jumps), down into the nook (the flag), and out again carrying it: up the column under the overhang and round its lip
    clear(w);
    const me = w.eval(`(function(){ var f = fighters.find(function(q){ return q.team === 1 && msOf(q); }); f.controller = 'local'; f.you = true; f._cf = -1; var fl = CTF.live.flags.find(function(q){ return q.team === 0; }); ctfPlaceFlag(fl, ${X} - 70, ${Y}); window.__P = f; window.__F = fl; return f.idx; })()`);
    const held = { ArrowLeft: false, ArrowRight: false, ArrowUp: false };
    const keys = (want) => { for (const k of Object.keys(held)) { const v = !!want[k]; if (v !== held[k]) { w.dispatchEvent(new w.KeyboardEvent(v ? 'keydown' : 'keyup', { code: k, bubbles: true, cancelable: true })); held[k] = v; } } };
    const st = () => J(w, `{ x:__P.x, y:__P.y, vx:__P.vx, vy:__P.vy, g:__P.onground, cf:__P._cf, n:(function(){ var n = __P.onground ? ctfNavNodeOf(CTF.nav, __P) : null; return n ? n.id : -1; })() }`);
    // a route of the graph from where the person stands (the one a player would take: the steadiest), played on the keys: stand at its take-off (by feel: the look ahead says go), then the arrows and
    // the jump key as its controller says, the first jump held long enough to be a full one (a quick tap is a short hop)
    const play = (from, to, prof) => {
      const e = J(w, `(function(){ var es = CTF.nav.nodes[${from}].edges.filter(function(e){ return e.kind === 'wall' && (${JSON.stringify(to)}).indexOf(e.to) >= 0 && (e.prof || 'f') === '${prof}'; }); es.sort(function(a, b){ return (a.risky ? 1 : 0) - (b.risky ? 1 : 0) || a.cost - b.cost; }); window.__E = es[0] || null; return window.__E; })()`);
      expect(e, 'a wall-jump route from ' + from + ' to ' + to).not.toBeNull();
      for (let t = 0; t < 300; t++) {   // to the take-off, a tap at a time
        const s = st(), dx = e.xa - s.x;
        if (Math.abs(dx) < 30 && w.eval('ctfAiWallLook(CTF.nav, __P, __E)')) break;
        keys(Math.abs(dx) > 2 && (Math.abs(s.vx) < 0.8 || Math.sign(s.vx) !== Math.sign(dx)) && (Math.abs(dx) > 30 || t % 2) ? (dx > 0 ? { ArrowRight: true } : { ArrowLeft: true }) : {});
        w.eval('step()');
      }
      w.eval('window.__C = {}');
      for (let t = 1; t < 200; t++) {
        const o = J(w, `ctfWjCtl(__E.wj, __C, { t:${t}, g:__P.onground, vy:__P.vy, jumps:__P.jumps, wall:__P._wallT != null ? hazardT + 1 - __P._wallT : 99, ws:__P._wallSide || 0, used:!!(__P._wallUsed && __P._wallUsed[__P._wallId]) })`);
        keys({ ArrowLeft: o.dir < 0, ArrowRight: o.dir > 0, ArrowUp: o.jump || t <= 8 });   // (let go once the rise is slower than SH_V: a full jump, not cut to a short hop)
        w.eval('step()');
        if (t > 2 && w.eval('__P.onground')) break;
      }
      keys({});
      return st();
    };
    w.eval(`(function(){ var f = __P; f.x = ${X} + 220; f.y = ${Y} - f.r; f.vx = f.vy = 0; f.onground = true; f.jumps = 2; })()`);
    for (let t = 0; t < 5; t++) w.eval('step()');
    let s = play(right, [top, nook], 'f');
    expect([top, nook], 'up the column with wall jumps: on the block, or over it into the nook').toContain(s.n);
    for (let t = 0; t < 240 && !w.eval('__F.st === 2 && __F.car === __P.idx'); t++) { const px = w.eval('__P.x'); keys({ ArrowLeft: px > X - 60, ArrowRight: px < X - 80 }); w.eval('step()'); }   // (to the flag, whichever way: a fall off the block carries past it)
    keys({});
    expect(w.eval('__F.st === 2 && __F.car === __P.idx'), 'the person has the flag').toBe(true);
    for (let t = 0; t < 30; t++) w.eval('step()');
    expect(st().n, 'standing in the nook with it').toBe(nook);
    s = play(nook, [top, right], 'c');
    expect([top, right], 'and out with it: up the column under the overhang and round its lip').toContain(s.n);
    expect(s.cf, 'still carrying it').toBe(w.eval('__F.id'));
  });

  it('a flag shut in a sealed box: only ONE piece is taken away (the smallest, the nearest of equals), everything else stands and the flag can be reached', { timeout: 300000 }, () => {
    const w = boot(92);
    const pieces = build(w, 'box');
    expect(pieces.every(Boolean), 'the box went down').toBe(true);
    const r = check(w);
    expect(r.removed, 'one piece out').toBe(1);
    expect(r.left.length, 'the other five stand').toBe(r.before - 1);
    expect(r.problems, 'and the flag can be reached').toEqual([]);
    const g = r.gone[0], sizes = pieces.filter(p => p.kind !== 'plat').map(p => p.w * p.h);
    expect(g.w * g.h, 'the smallest of the pieces that shut it').toBe(Math.min(...sizes));
    expect(g.kind, 'never the harmless platform outside').not.toBe('plat');
  });
});
