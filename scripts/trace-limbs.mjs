// ============================================================================
//  trace-limbs.mjs -- every fighter's painted arms and legs, as cutouts the renderer can swing
// ============================================================================
// "these should have animations with the arms, not spawning arms randomly" (2026-09-23). Each render is one flat
// image with its arms painted in, so an attack used to draw an extra black stick arm out of the middle of the body.
// This finds the painted limbs instead, so drawSpriteBody can clip a limb out of the render and rotate it about its
// shoulder or hip: the character's own arm swings.
//
//   body  = the largest component of the alpha mask after a morphological opening (thin parts removed)
//   blobs = the other opened components: hands and feet, which ride with the limb they touch
//   a limb is a thin part plus the blobs it touches. A LEG reaches the ground; anything else is an ARM, unless it
//   grows out of the top of the body (flame tips, fuses, antennae, grass) or hangs from the bottom centre (a knot,
//   a screw base, bristles). At most one arm a side. Its outline is traced and simplified for clipping.
// A fighter with no separable arm (armless, or arms painted against the body) gets none, and animates with its body.
// The block it writes is GENERATED: edit this script, not the table.
//
//   node scripts/trace-limbs.mjs            (cwd = repo root; rewrites artifacts/V1/index.html)
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { loadMonolith } from '../test/helpers/load-monolith.js';

// Limbs the rules still get wrong, by eye (2026-09-23 review): the fuse on Bomby and Bomb, Grassy's blade tips,
// and a scrap at Flower's feet. Arms joining above this fraction of the body height are dropped for these.
const DROP_HIGH_ARMS = { 'Bomby': 0.35, 'Bomb': 0.35, 'Grassy': 1.01 };
const NO_ARMS = new Set(['Flower']);

const HTML = 'artifacts/V1/index.html';
const w = loadMonolith().window;
const list = w.eval("ROSTER.filter(function(r){return r.play;}).map(function(r){ var s=SPRITES[r.name]||{}; return {name:r.name, src:s.src||null, flip:!!s.flip, arms:s.arms!==false}; })")
  .filter((r) => r.src).map((r) => ({ name: r.name, path: 'artifacts/V1/' + r.src, flip: r.flip, armsFlag: r.arms }));
try { w.close(); } catch {}

const disk = (r) => { const o=[]; for (let y=-r;y<=r;y++) for (let x=-r;x<=r;x++) if (x*x+y*y<=r*r) o.push([x,y]); return o; };
function morph(m, W, H, k, erode){ const r = new Uint8Array(W*H);
  for (let y=0;y<H;y++) for (let x=0;x<W;x++){ let v = erode?1:0;
    for (const [dx,dy] of k){ const xx=x+dx, yy=y+dy; const s=(xx<0||yy<0||xx>=W||yy>=H)?0:m[yy*W+xx]; if(erode&&!s){v=0;break;} if(!erode&&s){v=1;break;} }
    r[y*W+x]=v; } return r; }
function comps(m, W, H){ const lab=new Int32Array(W*H).fill(-1), out=[];
  for (let i=0;i<W*H;i++){ if(!m[i]||lab[i]>=0) continue; const q=[i], px=[]; lab[i]=out.length;
    while(q.length){ const c=q.pop(); px.push(c); const cx=c%W, cy=(c/W)|0;
      for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++){ const xx=cx+dx, yy=cy+dy; if(xx<0||yy<0||xx>=W||yy>=H) continue; const j=yy*W+xx; if(m[j]&&lab[j]<0){lab[j]=out.length;q.push(j);} } }
    out.push(px); } return { lab, out }; }
function tracePoly(px, W, H){
  const m = new Uint8Array(W*H); for (const i of px) m[i] = 1;
  const g = new Uint8Array(W*H);
  for (let y=0;y<H;y++) for (let x=0;x<W;x++){ if(!m[y*W+x]) continue; for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++){ const xx=x+dx, yy=y+dy; if(xx>=0&&yy>=0&&xx<W&&yy<H) g[yy*W+xx]=1; } }
  let start = -1; for (let i=0;i<W*H;i++) if (g[i]){ start = i; break; }
  if (start < 0) return [];
  const at = (x,y)=> x>=0&&y>=0&&x<W&&y<H && g[y*W+x];
  const dirs = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
  let cx = start%W, cy = (start/W)|0, d = 7; const pts = [[cx,cy]];
  for (let n=0; n<W*H*2; n++){
    let found = false;
    for (let k=0;k<8;k++){ const dd=(d+6+k)%8, nx=cx+dirs[dd][0], ny=cy+dirs[dd][1]; if(at(nx,ny)){ cx=nx; cy=ny; d=dd; found=true; break; } }
    if (!found) break;
    if (cx===pts[0][0] && cy===pts[0][1]) break;
    pts.push([cx,cy]);
  }
  const dp = (a, eps) => { if (a.length < 3) return a; let idx=0, best=0; const [x1,y1]=a[0], [x2,y2]=a[a.length-1];
    for (let i=1;i<a.length-1;i++){ const [x,y]=a[i]; const L=Math.hypot(x2-x1,y2-y1)||1; const d2=Math.abs((y2-y1)*x-(x2-x1)*y+x2*y1-y2*x1)/L; if(d2>best){best=d2;idx=i;} }
    return best > eps ? [...dp(a.slice(0, idx+1), eps).slice(0,-1), ...dp(a.slice(idx), eps)] : [a[0], a[a.length-1]]; };
  return dp(pts, 1.1).flat();
}

const result = {};
for (const f of list){
  const png = PNG.sync.read(readFileSync(f.path)); const { width:W, height:H, data } = png;
  const A = new Uint8Array(W*H); let lowY = 0;
  for (let i=0;i<W*H;i++){ A[i] = data[i*4+3] >= 60 ? 1 : 0; if (A[i]) lowY = Math.max(lowY, (i/W)|0); }
  const RAD = Math.max(3, Math.round(H*0.028));
  const opened = morph(morph(A, W, H, disk(RAD), true), W, H, disk(RAD), false);
  const oc = comps(opened, W, H);
  let bodyIdx = 0; oc.out.forEach((p,i)=>{ if (p.length > oc.out[bodyIdx].length) bodyIdx = i; });
  const body = new Uint8Array(W*H); for (const i of oc.out[bodyIdx]) body[i] = 1;
  const openedGrow = morph(opened, W, H, disk(1), false);
  const thin = new Uint8Array(W*H); for (let i=0;i<W*H;i++) thin[i] = A[i] && !openedGrow[i] ? 1 : 0;
  const tc = comps(thin, W, H);
  const bodyGrow = morph(body, W, H, disk(2), false);
  const limbs = [];
  for (const px of tc.out){
    if (px.length < H*0.05) continue;
    const touch = (i, m) => { const x=i%W, y=(i/W)|0; for (let dy=-2;dy<=2;dy++) for (let dx=-2;dx<=2;dx++){ const xx=x+dx, yy=y+dy; if(xx>=0&&yy>=0&&xx<W&&yy<H&&m[yy*W+xx]) return true; } return false; };
    const root = px.filter(i => touch(i, bodyGrow));
    if (!root.length) continue;                               // floating: not a limb of this body
    // the blobs (hands/feet) this thin part touches
    const members = new Set(px);
    const blobIds = new Set(); for (const i of px){ const x=i%W, y=(i/W)|0;
      for (let dy=-2;dy<=2;dy++) for (let dx=-2;dx<=2;dx++){ const xx=x+dx, yy=y+dy; if(xx<0||yy<0||xx>=W||yy>=H) continue; const l=oc.lab[yy*W+xx]; if(l>=0 && l!==bodyIdx) blobIds.add(l); } }
    for (const b of blobIds) for (const i of oc.out[b]) members.add(i);
    const all = [...members];
    const rx = root.reduce((s,i)=>s+i%W,0)/root.length, ry = root.reduce((s,i)=>s+((i/W)|0),0)/root.length;
    let minX=W, maxX=0, minY=H, maxY=0, tip=all[0], far=-1;
    for (const i of all){ const x=i%W, y=(i/W)|0; if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; const d=Math.hypot(x-rx,y-ry); if(d>far){far=d;tip=i;} }
    const leg = maxY >= lowY - H*0.08;
    if (far < H*0.045) continue;                                                    // saw teeth, leaf serrations
    let bTop = H, bBot = 0; for (const i of oc.out[bodyIdx]){ const y=(i/W)|0; if(y<bTop)bTop=y; if(y>bBot)bBot=y; }
    const fromTop = (ry - bTop) / Math.max(1, bBot - bTop);
    let bL = W, bR = 0; for (const i of oc.out[bodyIdx]){ const x=i%W; if(x<bL)bL=x; if(x>bR)bR=x; }
    const half = Math.max(1, (bR-bL)/2), mid = (bL+bR)/2;
    const cxRel = Math.abs(rx - mid) / half, tipX = tip%W, tipY = (tip/W)|0, tipCxRel = Math.abs(tipX - mid) / half;
    // joins at the top AND points up or stays central: a flame tip, a fuse, an antenna, a blade of grass
    if (!leg && fromTop < 0.2 && (tipY < ry - 2 || tipCxRel < 0.6)) continue;
    // joins at the bottom centre AND stays central: a knot, a screw base, bristles. A stick figure's arms reach out.
    if (!leg && fromTop > 0.8 && cxRel < 0.5 && tipCxRel < 0.6) continue;
    limbs.push({ kind: leg ? 'leg' : 'arm', side: rx < W/2 ? 'L' : 'R', pivot:[+rx.toFixed(1), +ry.toFixed(1)], tip:[tip%W,(tip/W)|0],
      box:[minX,minY,maxX,maxY], len:+far.toFixed(1), n: all.length, hand: blobIds.size>0, _px: all });
  }
  if (false) { const dbg = new PNG({ width:W, height:H });
  for (let i=0;i<W*H;i++){ const o=i*4; if(A[i]){ dbg.data[o]=205; dbg.data[o+1]=205; dbg.data[o+2]=205; dbg.data[o+3]=255; } }
  for (const L of limbs){ for (const i of L._px){ const o=i*4; if(L.kind==='arm'){ dbg.data[o]=225; dbg.data[o+1]=40; dbg.data[o+2]=40; } else { dbg.data[o]=40; dbg.data[o+1]=70; dbg.data[o+2]=225; } dbg.data[o+3]=255; }
    for (let dy=-3;dy<=3;dy++) for (let dx=-3;dx<=3;dx++){ const xx=Math.round(L.pivot[0])+dx, yy=Math.round(L.pivot[1])+dy; if(xx>=0&&yy>=0&&xx<W&&yy<H){ const o=(yy*W+xx)*4; dbg.data[o]=20; dbg.data[o+1]=190; dbg.data[o+2]=40; dbg.data[o+3]=255; } } }
  }
  if (f.armsFlag === false || NO_ARMS.has(f.name)) for (let k = limbs.length-1; k >= 0; k--) if (limbs[k].kind === 'arm') limbs.splice(k, 1);
  if (DROP_HIGH_ARMS[f.name] != null){ let bT=H, bB=0; for (const i of oc.out[bodyIdx]){ const y=(i/W)|0; if(y<bT)bT=y; if(y>bB)bB=y; }
    for (let k = limbs.length-1; k >= 0; k--){ const L = limbs[k]; if (L.kind==='arm' && (L.pivot[1]-bT)/Math.max(1,bB-bT) < DROP_HIGH_ARMS[f.name]) limbs.splice(k, 1); } }
  for (const side of ['L','R']){ const a = limbs.filter(l=>l.kind==='arm' && l.side===side).sort((x,y)=>y.len-x.len);
    for (const extra of a.slice(1)) limbs.splice(limbs.indexOf(extra), 1); }
  for (const L of limbs) L.poly = tracePoly(L._px, W, H);
  result[f.name] = { file: f.path.split(/[\/]/).pop(), W, H, RAD, flip: f.flip,
    arms: limbs.filter(l=>l.kind==='arm').map(({_px,...l})=>l), legs: limbs.filter(l=>l.kind==='leg').map(({_px,...l})=>l) };
}

const r1 = (v) => Math.round(v*10)/10;
const rows = Object.entries(result).filter(([,r]) => r.arms.length || r.legs.length).map(([name, r]) => {
  const limb = (L) => `{side:'${L.side}',pivot:[${r1(L.pivot[0])},${r1(L.pivot[1])}],tip:[${L.tip[0]},${L.tip[1]}],poly:[${L.poly.join(',')}]}`;
  return `  ${JSON.stringify(name)}: {W:${r.W},H:${r.H},arms:[${r.arms.map(limb).join(',')}],legs:[${r.legs.map(limb).join(',')}]},`;
});
const block = `// GENERATED by scripts/trace-limbs.mjs -- do not edit by hand. Each fighter's painted limbs, found in their render:
// a pivot (shoulder or hip) and a traced outline, in the render's own pixels. drawSpriteBody clips a limb out of the
// image and swings it about the pivot, so an attack moves the character's own arm (see LIMB ANIMATION).
const LIMB_RIG = {
${rows.join('\n')}
};
// END GENERATED (LIMB_RIG)`;
let html = readFileSync(HTML, 'utf8');
const a = html.indexOf('// GENERATED by scripts/trace-limbs.mjs'), b = html.indexOf('// END GENERATED (LIMB_RIG)');
if (a >= 0 && b > a) html = html.slice(0, a) + block + html.slice(b + '// END GENERATED (LIMB_RIG)'.length);
else { const anchor = 'const HURT_R0 = 24;'; if (!html.includes(anchor)) throw new Error('anchor not found'); html = html.replace(anchor, block.replace(/\n/g, '\r\n') + '\r\n' + anchor); }
writeFileSync(HTML, html);
const withArms = Object.values(result).filter((r) => r.arms.length).length;
console.log(`${Object.keys(result).length} renders traced; arms for ${withArms}, legs for ${Object.values(result).filter((r)=>r.legs.length).length}`);
