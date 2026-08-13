import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// The UI-simplification pass. Nine screens had accumulated ~90 controls, most of them competing
// for attention on the title screen. These tests pin the SHAPE of the new organisation — how few
// controls the entry screens carry, and that nothing was buried deeper than one extra click —
// rather than the wording, which is free to change.

const btns = (w, id) => [...w.document.querySelectorAll(`#${id} button`)];
const html = (w, id) => w.document.getElementById(id).innerHTML;

describe('title screen — few, large, primary', () => {
  it('carries at most six buttons, led by one Play', () => {
    const { window: w } = loadMonolith();
    const b = btns(w, 'title');
    expect(b.length).toBeLessThanOrEqual(6);
    expect(b[0].textContent).toMatch(/Plunge/);
    expect(b[0].className, 'the first action is the full-size button').toBe('btn');
  });

  it('offers exactly one door to everything secondary', () => {
    const { window: w } = loadMonolith();
    const settings = btns(w, 'title').filter((x) => /Settings/.test(x.textContent));
    expect(settings).toHaveLength(1);
    expect(settings[0].getAttribute('onclick')).toBe("go('options')");
  });

  it('no longer shows the toggles, stats or sandbox as top-level buttons', () => {
    const { window: w } = loadMonolith();
    const t = html(w, 'title');
    for (const gone of ['toggleSound()', 'toggleMusic()', 'openStats()', 'openTest()']) {
      expect(t, `${gone} moved off the title screen`).not.toContain(gone);
    }
  });
});

describe('Settings — one panel, everything one extra click away', () => {
  it('holds the sound switches, the control map and My Stats', () => {
    const { window: w } = loadMonolith();
    const o = html(w, 'options');
    expect(o).toContain('toggleSound()');
    expect(o).toContain('toggleMusic()');
    expect(o).toContain("go('controls')");
    expect(o).toContain('openStats()');
  });

  it('every screen it leads to leads back into it, so nothing is a dead end', () => {
    const { window: w } = loadMonolith();
    expect(html(w, 'controls')).toContain("go('options')");
    expect(html(w, 'stats')).toContain("go('options')");
    expect(html(w, 'options')).toContain("go('title')");
  });

  it('is a real screen the router can reach, with menu music like its neighbours', () => {
    const { window: w } = loadMonolith();
    w.eval("go('options')");
    expect(w.document.getElementById('options').classList.contains('active')).toBe(true);
    expect(w.eval('MUSIC_SCREENS.options')).toBe('menu');
  });
});

describe('match settings — the three dials nobody changes are folded away', () => {
  it('starts collapsed but names what it contains', () => {
    const { window: w } = loadMonolith();
    expect(w.document.getElementById('advBody').style.display).toBe('none');
    w.eval('buildSettings()');
    expect(w.document.getElementById('advSummary').textContent)
      .toBe('Normal CPU · normal items · Normal map');
  });

  it('opens and closes on the one toggle, and the segs inside still drive SETTINGS', () => {
    const { window: w } = loadMonolith();
    w.eval('buildSettings(); toggleAdvSettings()');
    expect(w.document.getElementById('advBody').style.display).toBe('block');
    expect(w.document.getElementById('advToggle').getAttribute('aria-expanded')).toBe('true');
    const seg = w.document.getElementById('segMapSize');
    expect(w.document.getElementById('advBody').contains(seg)).toBe(true);
    seg.querySelector('[data-v="huge"]').onclick();
    expect(w.eval('SETTINGS.mapSize')).toBe('huge');
    expect(w.document.getElementById('advSummary').textContent).toContain('Huge map');
    w.eval('toggleAdvSettings()');
    expect(w.document.getElementById('advBody').style.display).toBe('none');
  });

  it('leaves mode, players, contestants and stocks in the open', () => {
    const { window: w } = loadMonolith();
    const adv = w.document.getElementById('advBody');
    for (const id of ['segMode', 'segLocalPlayers', 'segCount', 'segStocks']) {
      expect(adv.contains(w.document.getElementById(id)), `${id} stays visible`).toBe(false);
    }
  });

  it('every folded control is a live, enabled node inside the panel body', () => {
    const { window: w } = loadMonolith();
    w.eval('buildSettings(); toggleAdvSettings()');
    const body = w.document.getElementById('advBody');
    const controls = [...body.querySelectorAll('button')];
    expect(controls).toHaveLength(11);            // 3 CPU + 4 items + 4 map size
    for (const b of controls) {
      expect(body.contains(b)).toBe(true);
      expect(b.disabled).toBe(false);
      expect(b.dataset.v, 'each folded button carries the value it applies').toBeTruthy();
      expect(typeof b.onclick, 'and a handler bound by buildSettings').toBe('function');
    }
  });
});

// The shipped panel expanded but showed NOTHING: .screen is a column flex container, and a flex
// item whose own overflow is not `visible` has an automatic minimum size of zero, so the layout
// squashed the panel (overflow:hidden, for its rounded corners) to 6px and clipped 247px of
// options inside it. The roster line went the same way — 12px for 106px of cells — because its
// overflow-x:auto has the same effect. Measured in a real browser at the game's own 1100x720
// letterbox, before and after.
//
// jsdom has no layout engine, so these tests cannot measure the collapse; they pin the
// declarations that prevent it. If someone drops the flex line, this goes red.
describe('collapsible panels and the roster line cannot be squashed flat', () => {
  const ruleFor = (w, selector) => {
    for (const sheet of w.document.styleSheets) {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText === selector) return rule;
      }
    }
    return null;
  };

  it('pins flex:0 0 auto on the two items whose overflow zeroes their minimum size', () => {
    const { window: w } = loadMonolith();
    for (const sel of ['.board', '.teamchat']) {
      const rule = ruleFor(w, sel);
      expect(rule, `${sel} rule exists`).toBeTruthy();
      expect(rule.style.flex, `${sel} must not shrink`).toBe('0 0 auto');
      // The pairing is the whole point: overflow that clips + a shrinkable box = invisible content.
      expect(rule.style.cssText).toMatch(/overflow(-x)?:\s*(hidden|auto)/);
    }
  });

  it('does not trap the folded options in a second scroller of their own', () => {
    const { window: w } = loadMonolith();
    const rule = ruleFor(w, '.advset .teamchat-body');
    expect(rule).toBeTruthy();
    expect(rule.style.cssText).toContain('max-height: none');
    expect(rule.style.cssText).toContain('overflow: visible');
    // The chat log keeps its own cap — it grows without bound, the six segments do not.
    expect(ruleFor(w, '.teamchat-body').style.cssText).toContain('max-height: 52vh');
  });
});

describe('the roster is one draggable line of fighter art', () => {
  it('renders a single row whose cells carry the fighter renders', async () => {
    const { window: w } = loadMonolith();
    await w.eval('profileReady');
    w.eval('PROFILE.viewMode="everything"; buildBoard()');
    const board = w.document.getElementById('board');
    const cells = [...board.querySelectorAll('.cell')].filter((c) => !c.classList.contains('rostertoggle'));
    expect(cells.length).toBe(w.eval('ROSTER.length'));
    const withArt = cells.filter((c) => c.querySelector('img.cellimg'));
    expect(withArt.length, 'most of the cast has a render').toBeGreaterThan(40);
    for (const img of board.querySelectorAll('img.cellimg')) {
      // data-src is the deferred source boardLazyPass() promotes to src once the cell nears the
      // visible slice of the strip; one of the two always names the fighter's own render.
      const src = img.getAttribute('src') || img.getAttribute('data-src');
      expect(src).toMatch(/^assets\/sprites\/.+\.png$/);
      // No loading="lazy": the browser's own deferral would second-guess boardLazyPass() and can
      // leave a src unfetched indefinitely in a hidden tab. What we hand over must load.
      expect(img.getAttribute('loading')).toBe(null);
    }
    // A fighter with no render still shows the blob the canvas would draw — never a blank cell.
    for (const c of cells) {
      expect(c.querySelector('img.cellimg') || c.querySelector('.dot')).toBeTruthy();
    }
  });

  it('points every thumbnail at the same file the match renders', () => {
    const { window: w } = loadMonolith();
    w.eval('buildBoard()');
    const img = w.document.querySelector('#board img.cellimg');
    const name = img.closest('.cell').querySelector('.cellname').textContent;
    const src = img.getAttribute('src') || img.getAttribute('data-src');
    expect(src).toBe(w.eval(`SPRITES[${JSON.stringify(name)}].src`));
  });

  it('fetches only the renders near the visible slice, and more as the line is dragged', async () => {
    const { window: w } = loadMonolith();
    await w.eval('profileReady');
    // jsdom has no layout, so give the strip one: 84px cells in an 800px window. This is the
    // geometry boardLazyPass() reasons about — nothing else in the game reads it.
    w.eval(`
      Object.defineProperty(HTMLElement.prototype, 'offsetLeft', { configurable:true,
        get(){ return this.parentElement ? [...this.parentElement.children].indexOf(this)*84 : 0; } });
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable:true, get(){ return 78; } });
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable:true, get(){ return 800; } });
      PROFILE.viewMode='everything'; buildBoard();
    `);
    const board = w.document.getElementById('board');
    const fetched = () => board.querySelectorAll('img.cellimg[src]').length;
    const deferred = () => board.querySelectorAll('img.cellimg[data-src]').length;
    const atRest = fetched();
    expect(atRest, 'the visible run plus a screen of lead-in').toBeGreaterThan(5);
    expect(atRest, 'nowhere near all 59').toBeLessThan(30);
    expect(deferred()).toBeGreaterThan(20);
    // Drag toward the far end: the cells that come into range load, the rest still wait.
    board.scrollLeft = 3000;
    w.eval('boardLazyPass()');
    expect(fetched(), 'dragging pulls in more art').toBeGreaterThan(atRest);
    expect(deferred(), 'and still not everything').toBeGreaterThan(0);
  });

  it('is wired for drag-to-pan, once, however often the line is rebuilt', () => {
    const { window: w } = loadMonolith();
    w.eval('buildBoard(); buildBoard()');
    expect(w.eval("document.getElementById('board')._dragWired")).toBe(true);
  });

  it('keeps the view toggle at the head of the line where it can be found', () => {
    const { window: w } = loadMonolith();
    w.eval('buildBoard()');
    expect(w.document.getElementById('board').firstElementChild.className)
      .toContain('rostertoggle');
  });

  it('a pan does not count as a pick', () => {
    const { window: w } = loadMonolith();
    w.eval('buildBoard()');
    const before = w.eval('chosen.name');
    const other = [...w.document.querySelectorAll('#board .cell.play')]
      .find((c) => !c.classList.contains('rostertoggle') && !c.classList.contains('sel'));
    w.eval("document.getElementById('board')._dragged = true");
    other.onclick();
    expect(w.eval('chosen.name'), 'the drag was swallowed').toBe(before);
    w.eval("document.getElementById('board')._dragged = false");
    other.onclick();
    expect(w.eval('chosen.name')).not.toBe(before);
  });
});

describe('the sandbox belongs to the level creator', () => {
  it('opens from the editor, on the level currently being drawn', () => {
    const { window: w } = loadMonolith();
    expect(html(w, 'editor')).toContain('edTestFeel()');
    w.eval("openEditor(); ED.plats=[{nx:0.2,ny:0.6,nw:0.3,hop:false,rot:0}]; ED.spawns=[{nx:0.3,ny:0.4}];");
    w.eval("document.getElementById('edName').value='Test Hill'; edTestFeel()");
    expect(w.document.getElementById('test').classList.contains('active')).toBe(true);
    expect(w.eval('CUSTOM_LEVEL && CUSTOM_LEVEL.name')).toBe('Test Hill');
    expect(w.eval('PENDING_CUSTOM'), 'the map survives a detour through fighter select').toBe(true);
    expect(w.document.getElementById('testMapNote').textContent).toContain('Test Hill');
    expect(w.eval('TESTMODE.active'), 'not live until they start it').toBe(false);
  });

  it('starts the sandbox on that map, spawning on the markers the map-maker placed', () => {
    const { window: w } = loadMonolith();
    w.eval("openEditor(); ED.spawns=[{nx:0.25,ny:0.5}]; ED.plats=[{nx:0.1,ny:0.7,nw:0.8,hop:false,rot:0}];");
    w.eval("document.getElementById('edName').value='Hill'; edTestFeel(); startTestNow()");
    expect(w.eval('TESTMODE.active')).toBe(true);
    expect(w.eval('fighters.length')).toBe(w.eval('TESTMODE.dummies + 1'));
    expect(w.eval('fighters[0].stocks')).toBe(99);
    expect(w.eval('Math.round(fighters[0].x)')).toBe(w.eval('Math.round(0.25*W)'));
  });

  it('is no longer advertised as a top-level mode', () => {
    const { window: w } = loadMonolith();
    expect(html(w, 'title')).not.toContain('openTest()');
    expect(html(w, 'options')).not.toContain('openTest()');
    expect(html(w, 'test')).toContain('openEditor()');   // back goes where it came from
  });
});

describe('My Stats replaces the developer balance table', () => {
  it('counts only the fighters the player actually held the keyboard for', () => {
    const { window: w } = loadMonolith();
    const log = [
      // new-style records carry `you`
      { fighters: [{ name: 'Firey', you: true, won: true, kos: 2 }, { name: 'Leafy', you: false, won: false }] },
      { fighters: [{ name: 'Firey', you: true, won: false, kos: 1 }, { name: 'Leafy', you: false, won: true }] },
      // older records only say controller:"local" — they still count
      { fighters: [{ name: 'Leafy', controller: 'local', won: true, kos: 3 }] },
      // a match nobody local played (a simmed fixture) contributes nothing
      { fighters: [{ name: 'Bomby', controller: 'ai', won: true }] },
    ];
    const mains = w.eval(`JSON.stringify(myMains(${JSON.stringify(log)}, 5))`);
    expect(JSON.parse(mains)).toEqual([
      { name: 'Firey', games: 2, wins: 1, kos: 3 },
      { name: 'Leafy', games: 1, wins: 1, kos: 3 },
    ]);
  });

  it('caps the list at the player top five', () => {
    const { window: w } = loadMonolith();
    const log = [];
    for (let i = 0; i < 7; i++) {
      for (let n = 0; n <= i; n++) log.push({ fighters: [{ name: 'F' + i, you: true, won: n === 0 }] });
    }
    const mains = JSON.parse(w.eval(`JSON.stringify(myMains(${JSON.stringify(log)}))`));
    expect(mains).toHaveLength(5);
    expect(mains[0].name, 'most-played first').toBe('F6');
  });

  it('marks the player in every new record, which is what rival memory reads', async () => {
    const { window: w } = loadMonolith();
    await w.eval('profileReady');
    w.eval("SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=1; startMatch(); await0=0");
    await w.eval('recordMatch(fighters[0].team)');
    const log = JSON.parse(w.localStorage.getItem('balance:matchlog') || '[]');
    expect(log.length).toBeGreaterThan(0);
    const me = log.at(-1).fighters.filter((p) => p.you === true);
    expect(me, 'exactly one fighter is flagged as the player').toHaveLength(1);
    expect(me[0].name).toBe(w.eval('chosen.name'));
  });

  it('drops the all-fighter table, its sort control and the JSON export', () => {
    const { window: w } = loadMonolith();
    expect(w.eval('typeof exportStats')).toBe('undefined');
    expect(w.document.getElementById('statsSort')).toBe(null);
    const s = html(w, 'stats');
    expect(s).not.toContain('exportStats');
    expect(s).toContain('resetStats()');       // clearing your own history stays
  });

  it('still records match data for the headless balance pipeline', () => {
    const { window: w } = loadMonolith();
    expect(w.eval('typeof recordMatch')).toBe('function');
    expect(w.eval('typeof hydrateRatings')).toBe('function');
  });
});

describe('every inline handler on every screen is still reachable', () => {
  // Whole-document coverage is asserted by credential-strip.test.js, which resolves in the
  // monolith's own realm (top-level `let`s are not window properties). This pins the handlers
  // THIS pass introduced, and pins them on the window bridge specifically.
  it('bridges every handler the reorganisation added', () => {
    const { window: w } = loadMonolith();
    for (const fn of ['toggleAdvSettings', 'edTestFeel', 'startTestNow', 'openStats', 'resetStats',
      'myMains', 'fighterThumb', 'initBoardDrag', 'queueCustomLevel']) {
      expect(typeof w[fn], `${fn} is on the window bridge`).toBe('function');
    }
  });

  it('leaves no on*= attribute pointing at something that no longer exists', () => {
    const { window: w } = loadMonolith();
    const ids = new Set();
    for (const el of w.document.querySelectorAll('[onclick],[onchange],[oninput]')) {
      for (const a of ['onclick', 'onchange', 'oninput']) {
        const src = el.getAttribute(a);
        if (!src) continue;
        // Leading identifiers only, and never a keyword — `onclick="if(confirm(...))"` is code,
        // not a handler name.
        const KEYWORDS = new Set(['if', 'else', 'return', 'typeof', 'new', 'this', 'function']);
        for (const m of src.matchAll(/(?<![.\w$])([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)) {
          if (!KEYWORDS.has(m[1])) ids.add(m[1]);
        }
      }
    }
    expect(ids.size).toBeGreaterThan(15);
    const missing = [...ids].filter((id) => w.eval(`typeof ${id}`) === 'undefined');
    expect(missing, `unreachable: ${missing.join(', ')}`).toEqual([]);
  });
});
