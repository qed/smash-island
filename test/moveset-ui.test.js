import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "How players learn the moves" (the owner, 2026-10-14): a move list in the pause menu, an All-moves tab on the character card, a Training
// room, and How to Play. Menus may have words; the match may not (no-move-popups holds that).

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });
const J = (code) => W.eval(`(function(){ return ${code}; })()`);

describe('the move list', () => {
  it('every playable fighter has one: the jab, the tilts, a grab and four throws, the specials, the smash, the finisher and the movetech, each with its keys', () => {
    const bad = [];
    const names = J('ROSTER.filter(function(r){ return r.play; }).map(function(r){ return r.name; })');
    for (const n of names) {
      const rows = J(`moveRowsFor(ROSTER.find(function(r){ return r.name===${JSON.stringify(n)}; }))`);
      const keys = rows.map((r) => r[0]);
      for (const k of ['X', 'X + C', 'C', 'V', 'V + C', 'Movetech']) if (!keys.includes(k)) bad.push(`${n}: no ${k}`);
      if (rows.some((r) => !r[1] || /undefined/.test(r[1]))) bad.push(`${n}: an empty or undefined line`);
      if (rows.length < 17) bad.push(`${n}: only ${rows.length} rows`);
    }
    expect(bad, bad.join(' ; ')).toEqual([]);
  });
  it('a converted fighter shows its own moves; one not yet converted says what stands in for them', () => {
    const rows = (n) => J(`moveRowsFor(ROSTER.find(function(r){ return r.name===${JSON.stringify(n)}; })).map(function(r){ return r[0] + ' | ' + r[1]; }).join('\\n')`);
    expect(rows('Pencil')).toContain('Lead Jab');
    expect(rows('Pencil')).toContain("She's Got Him");
    expect(rows('Pencil')).toContain('CLINGS');
    // (restated each batch: Firey was the example of a fighter not yet converted until batch 2; now the first playable fighter with no MOVESETS entry stands in)
    const todo = J(`ROSTER.filter(function(r){ return r.play && r.kit && !MOVESETS[r.kit.special] && !r.prize; })[0].name`);
    // (restated 2026-10-16: the owner removed side specials, so the one line that said 'until this fighter...' is gone; every fighter's <-/-> + C line now reads the neutral special, aimed that way)
    expect(rows(todo)).toContain('The neutral special, aimed that way.');
    expect(rows('Pencil')).toContain('The neutral special, aimed that way.');
    expect(rows('Pencil')).not.toContain('Side special');
    expect(rows(todo)).toContain('Forward throw');
  });
  it('the pause menu has a Move list button that shows the list for the fighter you are playing', () => {
    expect(J('!!document.getElementById("pauseMovesBtn") && !!document.getElementById("pauseMoves")')).toBe(true);
    W.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; running=true; fighters=[makeFighter(Object.assign({}, ROSTER.find(function(r){return r.name==='Bow';}), {you:true}), 300, 100, 0)]; setPaused(true); togglePauseMoves();`);
    expect(J('document.getElementById("pauseMoves").style.display')).toBe('block');
    expect(J('document.getElementById("pauseMoves").textContent')).toContain('Chair Shove');
    W.eval('setPaused(false)');
    expect(J('PAUSE_MOVES_OPEN')).toBe(false);
  });
  it('the character card has a Kit tab and an All moves tab', () => {
    W.eval(`chosen = ROSTER.find(function(r){ return r.name==='Leafy'; }); setMcTab('moves');`);
    expect(J('document.getElementById("moveCard").textContent')).toContain('Quick Kick');
    W.eval(`setMcTab('kit');`);
    expect(J('document.getElementById("moveCard").textContent')).toContain('moves');
    expect(J('document.getElementById("moveCard").querySelectorAll("button").length')).toBe(2);
  });
});

describe('Training', () => {
  it('opens from the title, with the dummy, its damage, its behaviour and the hitboxes as options', () => {
    expect(J('!!document.getElementById("trainBtn")')).toBe(true);
    W.eval('openTraining();');
    expect(J('document.getElementById("testTitle").textContent')).toBe('TRAINING');
    for (const id of ['testRowDummy', 'testRowPct', 'testRowHold', 'testRowBox']) expect(J(`document.getElementById("${id}").style.display`), id).toBe('');
    expect(J('document.getElementById("testBehavior").querySelectorAll("button").length')).toBe(4);
  });
  it('the dummy is the one picked, carries the damage set, holds it when asked, and walks at you when it is set to', () => {
    W.eval(`TESTMODE.dummyMode='walk'; TESTMODE.pct=80; TESTMODE.holdPct=true; TESTMODE.dummyPick='Pen'; TESTMODE.hitboxes=true; chosen=ROSTER.find(function(r){return r.name==='Puffball';}); startTestNow();`);
    expect(J('fighters.map(function(f){ return f.name; }).join(",")')).toBe('Puffball,Pen');
    expect(J('fighters[1].pct')).toBe(80);
    expect(J('SHOW_HITBOXES')).toBe(true);
    const x0 = J('fighters[1].x');
    W.eval('for (var i=0;i<90;i++) step();');
    expect(Math.abs(J('fighters[1].x') - J('fighters[0].x'))).toBeLessThan(Math.abs(x0 - J('fighters[0].x')));
    W.eval('fighters[1].pct = 5; step();');
    expect(J('fighters[1].pct')).toBe(80);    // held where it was set
    W.eval('TESTMODE.active = false; running = false; SHOW_HITBOXES = false;');
  });
  it('Test the Feel (the level creator) still goes through the same screen, without the training rows', () => {
    W.eval('openTest();');
    expect(J('document.getElementById("testTitle").textContent')).toBe('TEST THE FEEL');
    expect(J('document.getElementById("testRowPct").style.display')).toBe('none');
  });
});

describe('How to Play', () => {
  it('explains tilts, aerials, the grab and throws, and the movement, and the grab and finisher keys are the new ones', () => {
    const t = J('document.getElementById("tutorial").textContent');
    for (const w of ['Tilts', 'Aerials', 'Grab', 'short hop', 'fast-fall', 'wall jump', 'Move list', 'Training']) expect(t, w).toContain(w);
    expect(t).toMatch(/V \+ C\s*Finisher/);
    expect(t).toMatch(/X \+ C\s*Grab/);
  });
  it('the hands-on tutorial has a tilt, an aerial and a grab-and-throw step', () => {
    expect(J('TUT_STEPS.map(function(s){ return s.text; }).join("|")')).toMatch(/DOWN-TILT.*AERIAL.*GRAB/);
  });
});
