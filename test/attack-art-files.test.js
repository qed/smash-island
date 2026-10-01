import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';

// THE SHOW'S OWN ART FOR WHAT THE FIGHTERS THROW -- the files themselves.
//
// "i think that all characters deserve good sprites." / "if you cant find a sprite, tell me abot it and give
// me options for the kit." The owner then chose, kit by kit, which file each kit throws. The rule for every
// one of them: it is the THROWN OBJECT ITSELF from the show, not a render of a character flying across the
// screen and not an episode screenshot. scripts/fetch-attack-sprites.mjs fetches them (and enforces
// transparency at fetch time); scripts/attack-sprite-manifest.json is its record. This pins what it wrote.
// Whether the game draws each one is test/attack-sprites.test.js's business.

const DIR = 'artifacts/V1/assets/sprites/attacks';
const manifest = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
const read = (f) => PNG.sync.read(readFileSync(`${DIR}/${f}`));
const clearOf = (png) => { let c = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) c++; return c / (png.width * png.height); };
const entries = Object.values(manifest);
const byFile = Object.fromEntries(entries.map((e) => [e.file, e]));

describe('every file on disk is on the record, and every record is on disk', () => {
  it('the folder and the manifest agree, file for file, size for size', () => {
    const onDisk = readdirSync(DIR).filter((f) => f.endsWith('.png')).sort();
    expect(onDisk).toEqual(entries.map((e) => e.file).sort());
    for (const e of entries) {
      const png = read(e.file);
      expect([png.width, png.height], e.file).toEqual([e.width, e.height]);
    }
  });

  it('each is projectile-sized: at most 128px on its long side, and not a speck', () => {
    for (const e of entries) {
      const png = read(e.file);
      expect(Math.max(png.width, png.height), `${e.file} is too big`).toBeLessThanOrEqual(128);
      expect(Math.max(png.width, png.height), `${e.file} is a speck`).toBeGreaterThanOrEqual(24);
    }
  });

  it('each came from one of the two shows\' wikis, and is credited with its exact source', () => {
    for (const e of entries) {
      expect(e.source, e.file).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/(battlefordreamisland|inanimateinsanity)\/images\//);
      expect(credits, `${e.file} is not credited with its source`).toContain(`(${e.file})`);
      expect(credits, `${e.file}'s source URL is not in CREDITS.md`).toContain(e.source);
    }
  });
});

describe('the owner\'s calls, kit by kit', () => {
  // The 34 kits with verified show art, plus the calls for the ones that had none: Apple throws a pencil,
  // Knife's hook is the Fist Thingy and his smoke is the Temporary Paralyzer, Lightbulb throws the Shimmer
  // Orb, Paintbrush throws MePhone4's paint bomb, Roboty fires BEEP lettering, Lightning strikes with the
  // TPOT 7 bolt.
  const kitsWithArt = ['ember', 'bomb', 'quake', 'serve', 'anvil', 'zapshooter', 'barf', 'fry', 'freeze', 'flip', 'beam',
    'buynow', 'splash', 'dribble', 'sign', 'grasstree', 'sucker', 'ink', 'payday', 'spike', 'battery', 'saw', 'jawbreaker',
    'fraidy', 'paste', 'spark', 'emberjr', 'timber', 'glaze', 'lemon', 'chair', 'heavy', 'fly', 'gust',
    'split', 'tricks', 'eball', 'fury', 'antenna', 'zap', 'evilpaper'];
  it('every one of those kits has a file', () => {
    const covered = new Set(entries.flatMap((e) => e.kits));
    expect(kitsWithArt.filter((k) => !covered.has(k))).toEqual([]);
  });

  it('the named files are the ones the owner named', () => {
    const src = (file) => byFile[file] && byFile[file].srcTitle;
    expect(src('pencil.png')).toBe('Pencil Prize.png');
    expect(src('fist.png')).toBe('Fist Thingy II.png');
    expect(src('taser.png')).toBe('Temp Paralyzer.png');
    expect(src('beep.png')).toBe('BEEP!.png');
    expect(src('shimmerorb.png')).toBe('Box with Shimmer Orb (S2E18).png');
    expect(src('paintbomb.png')).toBe('Paint Bombs.png');
    expect(src('rainbow.png')).toBe('Barf rainbow long.png');   // Puffball: the canon rainbow vomit
    expect(src('tpot7bolt.png')).toMatch(/^Tpot7dpacas lightningrampage/);   // "use the art from tpot 7"
    expect(src('piano.png')).toBe('Ep2 Piano.png');   // "There is a grand piano from the unremastered s1"
  });

  it('where the first verified pick failed on sight, the next one ships, and the record says why', () => {
    // Bracelety's blank board was a flat white rectangle (0% clear); Nickel's penny stack read as a brown cylinder.
    expect(byFile['sign.png'].srcTitle).toBe('ICY Sign (Bracelety) (BFB 1).png');
    expect(byFile['coins.png'].srcTitle).toBe('YellowToken.png');
    expect(byFile['coins.png'].skipped).toEqual(['Coins.png']);
  });

  it('the kits drawn in code have no file: Pickle, Microphone, Salt, Test Tube\'s flask and dart', () => {
    // Pickle's missed dive is only a splash now; the dodgeball, the sound waves, the salt and pepper, the flask and Test Tube's
    // tranquilizer dart are drawn. (Paper's paper cut is drawn too, but his piano is a file, so his kit is covered.)
    const covered = new Set(entries.flatMap((e) => e.kits));
    expect(['pickle', 'mic', 'saltpepper', 'testtube'].filter((k) => covered.has(k))).toEqual([]);
  });
});

describe('transparency: an object, never a rectangle pasted over the stage', () => {
  it('every file has clear pixels around the object, bar the one that is a rectangle edge to edge', () => {
    // The first seven are pinned by test/attack-sprites.test.js; the ruler and the price tag fill their
    // crop. Of the rest, only Remote's battery cell fills its own canvas, and the manifest says so.
    // (Bracelety's blank board did too, and was no richer than a drawn rectangle: her ICY sign ships now.)
    const firstSeven = ['shatter.png', 'slice.png', 'van.png', 'bubble.png', 'cap.png', 'tag.png', 'measure.png'];
    const solid = entries.filter((e) => e.solid).map((e) => e.file).sort();
    expect(solid, "Remote's battery cell and the Announcer's press (a block cut out of the crusher's asset) fill their own canvas, and so do Two's four team blocks (flat squares: File:TSTOE Block.png and its kin)").toEqual(['annpress.png', 'battery.png', 'twoblock0.png', 'twoblock1.png', 'twoblock2.png', 'twoblock3.png']);
    for (const e of entries) {
      if (firstSeven.includes(e.file) || e.solid) continue;
      expect(clearOf(read(e.file)), `${e.file} has no real transparency`).toBeGreaterThan(0.05);
    }
  });

  it('the ones cut out of a bigger picture carry nothing of it', () => {
    const keyed = entries.filter((e) => e.key).map((e) => e.file).sort();
    expect(keyed).toEqual(['annacid.png', 'book.png', 'capturepod.png', 'casebomb.png', 'cloth.png', 'dragonflame.png', 'ghostvacuum.png', 'losercage.png', 'marsrock.png', 'ojshard.png', 'oliveoil.png',   // the first five, batch 3's ten,
      'pager.png', 'paintball.png', 'paintbomb.png', 'piano.png', 'shimmerorb.png', 'soccerball.png', 'tpot7bolt.png', 'vacuum.png', 'wrench.png']);   // Steve Cobs's prize's three (test/dlc-ii-prize.test.js), and the Purple Dragon's flame (test/boss-dragon.test.js)
    for (const f of keyed) expect(clearOf(read(f)), `${f} kept its backdrop`).toBeGreaterThan(0.15);
    const opaque = (png, test) => { const bad = []; for (let i = 0; i < png.data.length; i += 4)
      if (png.data[i + 3] >= 128 && test(png.data[i], png.data[i + 1], png.data[i + 2])) bad.push(i >> 2); return bad.length; };
    // the paint bomb's flat green backdrop is gone
    expect(opaque(read('paintbomb.png'), (r, g, b) => g - Math.max(r, b) >= 28)).toBe(0);
    // ...and so are the dark streaks and the black shadow behind it: every solid pixel is the balloon's blue -- its
    // fill, its shine, its dark-blue outline. The streaks are grey-green (g over b), the shadow black; neither is blue.
    expect(opaque(read('paintbomb.png'), (r, g, b) => !(b - r >= 20 && b - g >= -4))).toBe(0);
    // the piano: no grass, no pole, no Paper. It is wood and gold (warm) with its keys and insides; the grass is
    // green, the pole flat grey, Paper white and black with a pink-red margin (blue over green).
    const piano = read('piano.png');
    expect(opaque(piano, (r, g, b) => g > r + 30 && g > b + 30), "grass (120,190,75); the keys' grey shade is not it").toBe(0);
    // the pole's flat grey would sit on the piano's outline; the only greys are inside, where black keys meet white
    let poleEdge = 0; const pw = piano.width, pa = (x, y) => (x < 0 || y < 0 || x >= pw || y >= piano.height) ? 0 : piano.data[(y * pw + x) * 4 + 3];
    for (let y = 0; y < piano.height; y++) for (let x = 0; x < pw; x++) { const i = (y * pw + x) * 4, [r, g, b, a] = piano.data.slice(i, i + 4);
      if (a >= 128 && Math.abs(r - g) < 8 && Math.abs(g - b) < 8 && r > 90 && r < 150 && Math.min(pa(x - 1, y), pa(x + 1, y), pa(x, y - 1), pa(x, y + 1)) < 64) poleEdge++; }
    expect(poleEdge, 'the pole').toBe(0);
    expect(opaque(piano, (r, g, b) => r > g + 40 && b > g + 8), "Paper's margin").toBe(0);
    const solidPiano = opaque(piano, () => true);
    expect(opaque(piano, (r, g, b) => r > b + 20 && r >= g - 10) / solidPiano, 'mostly wood and gold').toBeGreaterThan(0.6);
    // nothing of Box -- his brown side, his black hands -- survives around the orb: it is all near-white
    expect(opaque(read('shimmerorb.png'), (r, g, b) => Math.min(r, g, b) < 200)).toBe(0);
    // the TPOT 7 bolt is white and cyan: no sky, no volcano, no golden flare
    expect(opaque(read('tpot7bolt.png'), (r, g, b) => r > b + 6)).toBe(0);
    // and it keeps its cyan glow round the white core, not a thin white squiggle
    const bolt = read('tpot7bolt.png'); let glow = 0, seen = 0;
    for (let i = 0; i < bolt.data.length; i += 4) if (bolt.data[i + 3] >= 40) { seen++; if (bolt.data[i + 1] - bolt.data[i] > 40) glow++; }
    expect(glow / seen, 'the glow').toBeGreaterThan(0.25);
    // ...but not the sky's pale shards: a low floor lets those through as faint white slabs away from the bolt. Every
    // visible pixel is the core or its glow, so none lies more than 10px from the white-hot core.
    const bw = bolt.width, core = [];
    for (let y = 0; y < bolt.height; y++) for (let x = 0; x < bw; x++) { const i = (y * bw + x) * 4;
      if (bolt.data[i + 3] >= 200 && Math.min(bolt.data[i], bolt.data[i + 1], bolt.data[i + 2]) >= 235) core.push([x, y]); }
    let stray = 0;
    for (let y = 0; y < bolt.height; y++) for (let x = 0; x < bw; x++) { if (bolt.data[(y * bw + x) * 4 + 3] < 16) continue;
      if (!core.some(([cx, cy]) => (cx - x) ** 2 + (cy - y) ** 2 <= 100)) stray++; }
    expect(core.length, 'a white-hot core').toBeGreaterThan(300);
    expect(stray, 'faint slabs of sky away from the bolt').toBe(0);
  });
});

// Bot was Test Tube's summon (Bot2024PoseAlt.png); "oh, and bot should get their own kit." made them a fighter, and "1, but s4 look."
// gave them the season-4 render, File:Bot Bandaged S4.png, fetched with the same pipeline (scripts/fetch-sprites.mjs --wiki=inanimateinsanity).
describe('Bot, a playable fighter', () => {
  it('is fetched like every II render: the S4 look, on-model, transparent, 200px tall, credited, facing measured', () => {
    expect(existsSync('artifacts/V1/assets/sprites/bot.png')).toBe(true);
    const png = PNG.sync.read(readFileSync('artifacts/V1/assets/sprites/bot.png'));
    expect(png.height).toBe(200);
    expect(clearOf(png)).toBeGreaterThan(0.2);
    const ii = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    expect(ii.Bot && ii.Bot.ok).toBe(true);
    expect(ii.Bot.source).toMatch(/inanimateinsanity\/images\/.*Bot_Bandaged_S4\.png/);
    expect(ii.Bot.source, 'not the summon\'s old Bot2024PoseAlt').not.toMatch(/Bot2024PoseAlt/);
    expect(typeof ii.Bot.facing).toBe('number');
    expect(credits).toContain('`bot.png`');
    expect(credits).toContain('Bot_Bandaged_S4.png');
    expect(credits).not.toContain('her summon');
  });
});
