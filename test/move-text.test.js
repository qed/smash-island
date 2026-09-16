import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "add attack descriptions to everything". Every fighter's X, ↓+X, C, ↑+C, ↓+C and X+C has a line on the move card,
// written from the code and the measured move and checked line by line (MOVE_TEXT). The words drift the moment a
// move is retuned, so this measures every move again and holds each line's number to it: a stated first hit must be
// what some range actually lands, and a "no hit:" move must land nothing at any of them.

let W, LINES, MEASURED;
const MOVES = { jab: 'A.atkCd=0; doAttack(A)', ranged: 'A.atkCd=0; doGroundMove(A)', special: 'fireSpecial(A, {})',
  up: 'fireSpecial(A, {up:true})', down: 'fireSpecial(A, {down:true})', finisher: 'doAttackSpecial(A)' };

beforeAll(async () => {
  W = bootMonolith(); await W.eval('profileReady');
  LINES = W.eval('({ names: ROSTER.filter(function(r){ return r.play; }).map(function(r){ return r.name; }), text: MOVE_TEXT })');
  MEASURED = {};
  for (const name of LINES.names) {
    MEASURED[name] = {};
    for (const [move, call] of Object.entries(MOVES)) {
      MEASURED[name][move] = [40, 110, 220].map((dist) => W.eval(`(function(){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
        worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
        var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
        var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${400 + dist}, groundY()-24, 1);
        A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
        fighters=[A,D]; step();
        [A,D].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.armor=0; });
        A.onground = true;
        try { ${call}; } catch(e){ return { err: String(e && e.message || e) }; }
        var first = D.pct > 30.05 ? D.pct - 30 : 0, last = D.pct, any = D.pct - 30;
        for (var i=0;i<70;i++){
          step(); D.x = Math.max(D.x, 60); D.dead = false;
          if (!first && D.pct > last + 0.3) first = D.pct - last;
          last = D.pct; any = Math.max(any, D.pct - 30);
        }
        return { first: +first.toFixed(2), any: +any.toFixed(2) };
      })()`));
    }
  }
}, 480000);

describe('every move has its words', () => {
  it('every playable fighter has a line for all six inputs, named, readable and short', () => {
    const bad = [];
    for (const name of LINES.names) {
      const t = LINES.text[name];
      if (!t) { bad.push(`${name}: no lines`); continue; }
      for (const move of Object.keys(MOVES)) {
        const line = t[move];
        if (!line) bad.push(`${name} ${move}: missing`);
        else if (!/^[^—]+ — ./.test(line)) bad.push(`${name} ${move}: no "Name — " at the start`);
        else if (line.length > 210) bad.push(`${name} ${move}: ${line.length} characters`);
        else if (!/On hit:|no hit:/i.test(line)) bad.push(`${name} ${move}: says neither what a hit does nor that it lands nothing`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('no move errors when it is used', () => {
    const errs = [];
    for (const name of LINES.names) for (const move of Object.keys(MOVES)) for (const m of MEASURED[name][move]) if (m.err) errs.push(`${name} ${move}: ${m.err}`);
    expect(errs).toEqual([]);
  });
});

describe('the words match the moves', () => {
  it("a line's first-hit number is what the move lands at some range", () => {
    const bad = [];
    for (const name of LINES.names) for (const move of Object.keys(MOVES)) {
      const line = LINES.text[name][move], m = line.match(/On hit: (?:\d+ hits? of )?(\d+(?:\.\d+)?)%/);
      if (!m || /no hit:/i.test(line)) continue;
      const n = +m[1], landed = MEASURED[name][move].filter((x) => x.first > 0).map((x) => x.first);
      if (landed.length && !landed.some((d) => Math.abs(d - n) <= Math.max(1.05, n * 0.12))) bad.push(`${name} ${move}: says ${n}%, lands ${landed.join(' / ')} :: ${line}`);
    }
    expect(bad).toEqual([]);
  });

  it('a "no hit:" move lands nothing on a foe standing near', () => {
    const bad = [];
    for (const name of LINES.names) for (const move of Object.keys(MOVES)) {
      const line = LINES.text[name][move];
      if (!/no hit:/i.test(line)) continue;
      const any = Math.max(...MEASURED[name][move].map((x) => x.any || 0));
      if (any > 0.3) bad.push(`${name} ${move}: says no hit, dealt ${any} :: ${line}`);
    }
    expect(bad).toEqual([]);
  });

  it('the move card shows all seven lines for the chosen fighter', () => {
    const t = W.eval(`(function(){ chosen = ROSTER.find(function(r){ return r.name==='Gelatin'; }); refreshSel();
      return Array.prototype.map.call(document.querySelectorAll('#moveCard .mc-row'), function(e){ return e.textContent; }); })()`);
    expect(t.length).toBe(7);
    expect(t[0]).toMatch(/^X.*syringe jabs.*the third one launches/);
    expect(t[4]).toMatch(/Freeze Mine/);
    expect(t[5]).toMatch(/^V.*Trap · Ice Breaker/);
  });
});
