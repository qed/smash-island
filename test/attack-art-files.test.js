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
    'split', 'tricks', 'eball', 'fury', 'antenna', 'zap'];
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
  });

  it('the kits drawn in code have no file: Pickle, Paper, Microphone, Salt, Test Tube\'s flask', () => {
    // Pickle's missed dive is only a splash now; Paper's paper cut is drawn, and his season-1 piano exists
    // only as an episode screenshot; the dodgeball, the sound waves, the salt and pepper and the flask are drawn.
    const covered = new Set(entries.flatMap((e) => e.kits));
    expect(['pickle', 'evilpaper', 'mic', 'saltpepper', 'testtube'].filter((k) => covered.has(k))).toEqual([]);
  });
});

describe('transparency: an object, never a rectangle pasted over the stage', () => {
  it('every file has clear pixels around the object, bar the two that are rectangles edge to edge', () => {
    // The first seven are pinned by test/attack-sprites.test.js; the ruler and the price tag fill their
    // crop. Of the rest, only Bracelety's board and Remote's battery cell fill their own canvas, and the
    // manifest says so.
    const firstSeven = ['shatter.png', 'slice.png', 'van.png', 'bubble.png', 'cap.png', 'tag.png', 'measure.png'];
    const solid = entries.filter((e) => e.solid).map((e) => e.file).sort();
    expect(solid).toEqual(['battery.png', 'sign.png']);
    for (const e of entries) {
      if (firstSeven.includes(e.file) || e.solid) continue;
      expect(clearOf(read(e.file)), `${e.file} has no real transparency`).toBeGreaterThan(0.05);
    }
  });

  it('the four cut out of a bigger picture carry nothing of it', () => {
    const keyed = entries.filter((e) => e.key).map((e) => e.file).sort();
    expect(keyed).toEqual(['book.png', 'paintbomb.png', 'shimmerorb.png', 'tpot7bolt.png']);
    for (const f of keyed) expect(clearOf(read(f)), `${f} kept its backdrop`).toBeGreaterThan(0.15);
    const opaque = (png, test) => { const bad = []; for (let i = 0; i < png.data.length; i += 4)
      if (png.data[i + 3] >= 128 && test(png.data[i], png.data[i + 1], png.data[i + 2])) bad.push(i >> 2); return bad.length; };
    // the paint bomb's flat green backdrop is gone
    expect(opaque(read('paintbomb.png'), (r, g, b) => g - Math.max(r, b) >= 28)).toBe(0);
    // nothing of Box -- his brown side, his black hands -- survives around the orb: it is all near-white
    expect(opaque(read('shimmerorb.png'), (r, g, b) => Math.min(r, g, b) < 200)).toBe(0);
    // the TPOT 7 bolt is white and cyan: no sky, no volcano, no golden flare
    expect(opaque(read('tpot7bolt.png'), (r, g, b) => r > b + 6)).toBe(0);
  });
});

describe('Bot, Test Tube\'s summon', () => {
  it('is fetched like every II render: on-model, transparent, 200px tall, credited, facing measured', () => {
    expect(existsSync('artifacts/V1/assets/sprites/bot.png')).toBe(true);
    const png = PNG.sync.read(readFileSync('artifacts/V1/assets/sprites/bot.png'));
    expect(png.height).toBe(200);
    expect(clearOf(png)).toBeGreaterThan(0.2);
    const ii = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    expect(ii.Bot && ii.Bot.ok).toBe(true);
    expect(ii.Bot.source).toMatch(/inanimateinsanity\/images\/.*Bot2024PoseAlt\.png/);
    expect(typeof ii.Bot.facing).toBe('number');
    expect(credits).toContain('`bot.png`');
  });
});
