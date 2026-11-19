// Draws one move's recorded frames (scripts/dump-hitboxes.mjs) as a compact SVG strip: one panel per shown frame, the camera on the
// fighter, every coordinate the game's own (world px, made relative to the fighter's centre on that frame). Pure: no game, no jsdom.
// Nothing here measures or invents a box; it only draws what the recording holds.
export const RENDER_VERSION = 1;

export const COLORS = {
  hit: '#ff4d3d', grab: '#3b9cff', shot: '#ffa630', trap: '#ffa630', pull: '#c49bff',
  hurt: '#ffd23f', inv: '#4ade80', armor: '#e879f9', counter: '#22d3ee',
  startup: '#3f7d5a', active: '#b8332b', endlag: '#46557a', free: '#4a4a4a', bg: '#1b2230', ground: '#8a96aa', label: '#ffffff',
};
const COLS = 9, PW = 72, GAP = 4, LAB = 13;   // columns, panel px, gap, label bar height
const SA_MAX = 90, EL_PANELS = 12;   // startup + active longer than SA_MAX: startup sampled; end lag longer than EL_PANELS: sampled to about that many

// Which frames are drawn, and every how many frames end lag (and an over-long startup) is sampled.
export function pickFrames(rec) {
  const { frames, freeAt, firstBox, lastBox } = rec;
  const usual = freeAt != null && firstBox != null && firstBox < freeAt;
  // no box at all on a miss (a counter, a stance, a hit that needs a foe near): to the frame before they are free, or as long as a state
  // (invincible, armour, counter) lasts, up to 120 frames
  let end = usual ? freeAt - 1 : frames.length - 1;
  if (firstBox == null) { let ls = 0; frames.forEach((F, i) => { if (F.st) ls = i; }); end = Math.min(frames.length - 1, 120, Math.max(freeAt != null ? freeAt - 1 : 120, ls + 1, 1)); }
  const phase = (i) => (firstBox == null ? (freeAt != null && i >= freeAt ? 'free' : 'startup')
    : i < firstBox ? 'startup' : i <= lastBox ? (freeAt != null && i >= freeAt && !frames[i].bx.length ? 'free' : 'active')
    : freeAt != null && i >= freeAt ? 'free' : 'endlag');
  const N = end + 1, shown = [];
  let every = 1, everyStart = 1;
  {
    const sa = firstBox == null ? N : Math.min(N, lastBox + 1);
    if (sa > SA_MAX && firstBox != null) everyStart = Math.ceil(firstBox / 24);
    const elLen = Math.max(0, end - (firstBox == null ? end : lastBox));
    every = elLen > EL_PANELS ? Math.ceil(elLen / EL_PANELS) : 1;
    let lastPh = null;
    for (let i = 0; i <= end; i++) {
      const ph = phase(i), has = frames[i].bx.length > 0;
      const first = ph !== lastPh; lastPh = ph;
      if (first || i === end || has || frames[i].st !== (frames[i - 1] || {}).st) { shown.push(i); continue; }
      if (ph === 'startup') { if (firstBox == null ? i % Math.max(1, Math.ceil(N / 48)) === 0 : (everyStart === 1 || i % everyStart === 0)) shown.push(i); continue; }
      if (ph === 'active') { shown.push(i); continue; }   // (a gap inside a multi-hit: every frame of active is drawn)
      const base = firstBox == null ? 0 : lastBox;
      if ((i - base) % every === 0) shown.push(i);
    }
    if (firstBox == null) every = Math.max(1, Math.ceil(N / 48));
  }
  return { shown, phase, end, every, everyStart };
}

const n = (v) => String(Math.round(v));
function pathOf(pts, dx, dy) { let d = ''; for (let i = 0; i < pts.length; i += 2) d += (i ? 'L' : 'M') + n(pts[i] - dx) + ' ' + n(pts[i + 1] - dy); return d + 'Z'; }
// one box -> svg, relative to (dx, dy)
function primSvg(b, dx, dy) {
  const k = b[1];
  if (k === 'c') return `<circle cx="${n(b[2] - dx)}" cy="${n(b[3] - dy)}" r="${n(Math.max(1, b[4]))}"/>`;
  if (k === 'r') return `<rect x="${n(b[2] - dx)}" y="${n(b[3] - dy)}" width="${n(b[4])}" height="${n(b[5])}"/>`;
  if (k === 'l') return `<line x1="${n(b[2] - dx)}" y1="${n(b[3] - dy)}" x2="${n(b[4] - dx)}" y2="${n(b[5] - dy)}" stroke="currentColor" stroke-width="${n(2 * b[6])}"${b[7] ? ' stroke-linecap="round"' : ''}/>`;
  if (k === 'p') return `<path d="${pathOf(b[2], dx, dy)}"${b[3] > 0 ? ` stroke="currentColor" stroke-width="${n(2 * b[3])}" stroke-linejoin="round"` : ''}/>`;
  return '';
}
function primExt(b, dx, dy) {   // the farthest the box reaches from (dx, dy), per axis
  const k = b[1]; let mx = 0, my = 0;
  const pt = (x, y, pad) => { mx = Math.max(mx, Math.abs(x - dx) + pad); my = Math.max(my, Math.abs(y - dy) + pad); };
  if (k === 'c') pt(b[2], b[3], b[4]);
  else if (k === 'r') { pt(b[2], b[3], 0); pt(b[2] + b[4], b[3] + b[5], 0); }
  else if (k === 'l') { pt(b[2], b[3], b[6]); pt(b[4], b[5], b[6]); }
  else if (k === 'p') for (let i = 0; i < b[2].length; i += 2) pt(b[2][i], b[2][i + 1], b[3]);
  return [mx, my];
}
const KIND = { h: 'hit', g: 'grab', s: 'shot', t: 'trap', u: 'pull' };

export function renderStrip(rec, { title = '' } = {}) {
  const { frames, gy } = rec;
  const { shown, phase, every, everyStart } = pickFrames(rec);
  // the camera's half-size: the hurtbox and the swings in full, shots and traps up to 170 px out (a shot further off leaves the panel)
  let E = 56;
  const kinds = new Set();
  let inset = 0;   // a body hit with a NEGATIVE margin (it needs that much overlap): drawn as the plain outline, and the caption says by how much
  for (const F of frames) for (const b of F.bx) if (b[1] === 'p' && b[3] < 0) inset = Math.max(inset, -b[3]);
  for (const i of shown) {
    const F = frames[i];
    if (F.hb[0] === 'p') { const e = primExt(['', 'p', F.hb[1], 0], F.x, F.y); E = Math.max(E, e[0] + 6, e[1] + 6); }
    else E = Math.max(E, F.hb[3] + 6, F.hb[4] + Math.abs(F.hb[2] - F.y) + 6);
    for (const b of F.bx) { kinds.add(KIND[b[0]]); const e = primExt(b, F.x, F.y), far = b[0] === 's' || b[0] === 't';
      E = Math.max(E, Math.min(far ? 170 : 230, Math.max(e[0], e[1]) + 4)); }
  }
  E = Math.min(230, Math.ceil(E / 10) * 10);
  for (const i of shown) if (frames[i].st) for (const c of frames[i].st) kinds.add(c === 'i' ? 'invincible' : c === 'a' ? 'armour' : 'counter');
  // the hurtbox outlines, relative to the fighter's centre: one <path> each in <defs>, used by every panel that has it
  const defs = new Map();
  const hurtRef = (F) => {
    const d = F.hb[0] === 'p' ? pathOf(F.hb[1], F.x, F.y) : `M${n(F.hb[1] - F.x - F.hb[3])} ${n(F.hb[2] - F.y)}a${n(F.hb[3])} ${n(F.hb[4])} 0 1 0 ${n(2 * F.hb[3])} 0a${n(F.hb[3])} ${n(F.hb[4])} 0 1 0 ${n(-2 * F.hb[3])} 0Z`;
    if (!defs.has(d)) defs.set(d, 'b' + defs.size);
    return defs.get(d);
  };
  const rows = Math.ceil(shown.length / COLS), W = Math.min(shown.length, COLS) * (PW + GAP) - GAP, H = rows * (PW + LAB + GAP) - GAP;
  const C = COLORS;
  let body = '';
  const usedPh = new Set();
  shown.forEach((i, j) => {
    const F = frames[i], ph = phase(i), px = (j % COLS) * (PW + GAP), py = Math.floor(j / COLS) * (PW + LAB + GAP);
    const gap = j > 0 && i - shown[j - 1] > 1;
    usedPh.add(ph);
    body += `<use href="#L${ph[0]}" x="${px}" y="${py}"/><text x="${px + 3}" y="${py + 10}">${gap ? '…' : ''}${i}</text>`;
    let p = `<svg x="${px}" y="${py + LAB}" width="${PW}" height="${PW}" viewBox="${-E} ${-E} ${2 * E} ${2 * E}"${ph === 'free' ? ' opacity=".55"' : ''}><use href="#K"/>`;
    const g = gy - F.y; if (g > -E && g < E) p += `<line x1="${-E}" y1="${n(g)}" x2="${E}" y2="${n(g)}" class="g"/>`;
    const st = F.st || '', hc = st.includes('i') ? 'v' : st.includes('c') ? 'o' : st.includes('a') ? 'a' : 'u';
    p += `<use href="#${hurtRef(F)}" class="${hc}"/>`;
    const by = { h: '', g: '', s: '', t: '', u: '' };
    for (const b of F.bx) by[b[0]] += primSvg(b, F.x, F.y);
    if (by.u) p += `<g class="P">${by.u}</g>`;
    for (const c of ['t', 's', 'g', 'h']) if (by[c]) p += `<g class="${c.toUpperCase()}">${by[c]}</g>`;
    body += p + '</svg>';
  });
  const sw = (2 * E / PW).toFixed(2);   // ~1 screen px in world units
  const css = `text{font:bold 10px sans-serif;fill:${C.label}}.k{fill:${C.bg}}.g{stroke:${C.ground};stroke-width:${sw}}`
    + `use{stroke-width:${(2 * E / PW * 1.5).toFixed(2)};fill-opacity:.28}.u{stroke:${C.hurt};fill:${C.hurt}}.v{stroke:${C.inv};fill:${C.inv};fill-opacity:.6}.a{stroke:${C.armor};fill:${C.armor}}.o{stroke:${C.counter};fill:${C.counter};fill-opacity:.5}`
    + `.H{color:${C.hit};fill:${C.hit};opacity:.7}.G{color:${C.grab};fill:${C.grab};opacity:.75}.S{color:${C.shot};fill:${C.shot};opacity:.75}.T{color:${C.trap};fill:none;stroke:${C.trap};stroke-width:${(2 * E / PW * 2).toFixed(2)};stroke-dasharray:${(2 * E / PW * 4).toFixed(1)}}`
    + `.P{color:${C.pull};fill:none;stroke:${C.pull};stroke-width:${sw};stroke-dasharray:${(2 * E / PW * 3).toFixed(1)}}`;
  const defsSvg = [...defs].map(([d, id]) => `<path id="${id}" d="${d}"/>`).join('') + `<rect id="K" x="${-E}" y="${-E}" width="${2 * E}" height="${2 * E}" class="k"/>`
    + [...usedPh].map((ph) => `<rect id="L${ph[0]}" width="${PW}" height="${LAB}" fill="${C[ph]}"/>`).join('');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><title>${esc(title)}</title><style>${css}</style><defs>${defsSvg}</defs>${body}</svg>\n`;
  return { svg, every, everyStart, shown: shown.length, frameList: shown, phases: shown.map(phase), w: W, h: H, kinds: [...kinds], half: E, inset };
}
