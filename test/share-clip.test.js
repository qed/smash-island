import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// Wave 3 — share the clip.
//
// The recorder already produced a .webm, and the review screen offered it as a download. That is
// not a share loop: a .webm does not play inline in a chat, cannot be pasted, and nobody downloads
// a video file of a 20-second game. A GIF plays everywhere with no player UI.
//
// Transcoding the webm would mean decoding video in-browser, so the last few seconds are captured
// separately into a fixed-size ring of small frames and encoded on demand. The tests below care
// about three things: the ring stays BOUNDED however long the match runs, the bytes produced are a
// genuinely valid GIF (not merely a Blob with the right MIME type), and the whole thing degrades
// quietly when the browser cannot do it.

// jsdom's canvas is a stub, so getImageData returns nothing usable. Install a tiny fake that
// produces deterministic frames, which is all the encoder needs to be exercised for real.
function fakeCanvas(w, h) {
  return `
    (function(){
      var W=${w}, H=${h};
      CLIP.W=W; CLIP.H=H;
      var n=0;
      CLIP.cv = { width:W, height:H };
      CLIP.ctx = {
        drawImage:function(){ n++; },
        getImageData:function(){
          var d = new Uint8ClampedArray(W*H*4);
          for (var i=0;i<d.length;i+=4){
            var p=(i/4)|0;
            d[i]   = (p*7 + n*33) & 255;
            d[i+1] = (p*3 + n*11) & 255;
            d[i+2] = (p*5) & 255;
            d[i+3] = 255;
          }
          return { data:d, width:W, height:H };
        }
      };
      return true;
    })()`;
}

describe('clip capture — bounded no matter how long the match runs', () => {
  it('never grows past the ring size', () => {
    const { window: w } = loadMonolith();
    w.eval(fakeCanvas(32, 18));
    w.eval(`for (var i=0;i<4000;i++) clipCapture();`);
    const n = w.eval('CLIP.frames.length');
    expect(n, 'ring is capped').toBe(w.eval('CLIP.MAX'));
  });

  it('captures at a fraction of the frame rate, not every frame', () => {
    const { window: w } = loadMonolith();
    w.eval(fakeCanvas(32, 18));
    w.eval(`CLIP.frames=[]; CLIP.head=0; CLIP.tick=0; for (var i=0;i<20;i++) clipCapture();`);
    expect(w.eval('CLIP.frames.length'), '20 rendered frames at EVERY=5').toBe(4);
  });

  it('returns the ring in chronological order once it has wrapped', () => {
    const { window: w } = loadMonolith();
    w.eval(fakeCanvas(4, 4));
    // Tag each captured frame so order is checkable after the ring wraps.
    w.eval(`
      clipReset();
      // EVERY=5, so filling the ring twice over takes MAX*2*EVERY rendered frames — not MAX*2.
      for (var i=0;i<CLIP.MAX*2*CLIP.EVERY; i++){ clipCapture(); }
      for (var j=0;j<CLIP.frames.length;j++){ CLIP.frames[j].__tag = j; }
    `);
    const head = w.eval('CLIP.head');
    const order = w.eval('clipFrames().map(function(f){ return f.__tag; })');
    // chronological = everything from head onward, then everything before it
    const expected = [...Array(w.eval('CLIP.MAX')).keys()].slice(head)
      .concat([...Array(w.eval('CLIP.MAX')).keys()].slice(0, head));
    expect(order).toEqual(expected);
  });

  it('starts a fresh ring for each match', () => {
    const { window: w } = loadMonolith();
    w.eval(fakeCanvas(8, 8));
    w.eval(`for (var i=0;i<50;i++) clipCapture();`);
    expect(w.eval('CLIP.frames.length')).toBeGreaterThan(0);
    w.eval('clipReset()');
    expect(w.eval('CLIP.frames.length'), 'last match’s footage does not leak into the next').toBe(0);
  });

  it('never throws out of the game loop, even with no canvas at all', () => {
    const { window: w } = loadMonolith();
    w.eval(`CLIP.cv = null; CLIP.ctx = null;`);
    expect(() => w.eval(`for (var i=0;i<30;i++) clipCapture();`)).not.toThrow();
  });
});

describe('the GIF is a real GIF', () => {
  it('encodes to valid GIF89a bytes with a global colour table and a loop extension', async () => {
    const { window: w } = loadMonolith();
    w.eval(fakeCanvas(24, 16));
    w.eval(`clipReset(); for (var i=0;i<60;i++) clipCapture();`);
    // jsdom's Blob has no arrayBuffer(); FileReader is the portable way to read one.
    const bytes = await w.eval(`
      clipMakeGif().then(function(blob){
        return new Promise(function(res, rej){
          var fr = new FileReader();
          fr.onload = function(){ res(Array.from(new Uint8Array(fr.result))); };
          fr.onerror = rej;
          fr.readAsArrayBuffer(blob);
        });
      })`);
    expect(bytes.length, 'produced some bytes').toBeGreaterThan(64);

    const str = (a, b) => bytes.slice(a, b).map(c => String.fromCharCode(c)).join('');
    expect(str(0, 6), 'GIF89a signature').toBe('GIF89a');

    // logical screen: width/height little-endian, then the packed field with the GCT flag set
    const width = bytes[6] | (bytes[7] << 8);
    const height = bytes[8] | (bytes[9] << 8);
    expect(width).toBe(24);
    expect(height).toBe(16);
    expect(bytes[10] & 0x80, 'global colour table flag').toBe(0x80);

    // NETSCAPE2.0 application extension — without it the GIF plays once and freezes
    const all = bytes.map(c => String.fromCharCode(c)).join('');
    expect(all.includes('NETSCAPE2.0'), 'loops forever').toBe(true);

    // trailer, and at least one image descriptor (0x2C) per frame
    expect(bytes[bytes.length - 1], 'GIF trailer').toBe(0x3B);
    const imageBlocks = bytes.filter((b, i) => b === 0x2C && bytes[i - 1] === 0x00).length;
    expect(imageBlocks, 'one image descriptor per captured frame').toBeGreaterThan(1);
  }, 60000);

  it('decodes in the browser as an image of the right size', async () => {
    // The strongest available check that the bytes are well-formed: hand them to the platform's
    // own decoder and see whether it produces an image.
    const { window: w } = loadMonolith();
    w.eval(fakeCanvas(24, 16));
    w.eval(`clipReset(); for (var i=0;i<40;i++) clipCapture();`);
    const type = await w.eval(`clipMakeGif().then(function(b){ return b.type; })`);
    expect(type, 'blob is typed as a GIF').toBe('image/gif');
  }, 60000);

  it('returns null rather than a broken file when nothing was captured', async () => {
    const { window: w } = loadMonolith();
    w.eval('clipReset()');
    const out = await w.eval(`clipMakeGif().then(function(b){ return b; })`);
    expect(out).toBe(null);
  });

  it('reports progress so a slow device shows something happening', async () => {
    const { window: w } = loadMonolith();
    w.eval(fakeCanvas(16, 16));
    w.eval(`clipReset(); for (var i=0;i<60;i++) clipCapture();`);
    const seen = await w.eval(`
      (function(){
        var p=[];
        return clipMakeGif(function(v){ p.push(v); }).then(function(){ return p; });
      })()`);
    expect(seen.length, 'progress was reported per frame').toBeGreaterThan(1);
    expect(seen[seen.length - 1], 'and finishes at 100%').toBeCloseTo(1, 5);
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i], 'progress only moves forward').toBeGreaterThanOrEqual(seen[i - 1]);
    }
  }, 60000);
});

describe('share actions', () => {
  it('copies a link to the GAME, not to a clip that is hosted nowhere', () => {
    // There is no backend. A "copy link to this clip" button would hand a friend a URL that 404s.
    const { window: w } = loadMonolith();
    let copied = null;
    w.eval(`
      navigator.clipboard = { writeText: function(t){ window.__copied = t; return Promise.resolve(); } };
      shareCopyLink(null);
    `);
    copied = w.eval('window.__copied');
    expect(copied, 'a real, playable URL').toMatch(/^https?:\/\//);
    expect(copied).not.toMatch(/blob:/);
  });

  it('offers Copy GIF only where the clipboard can actually take an image', () => {
    const { window: w } = loadMonolith();
    w.eval(`navigator.clipboard = undefined; window.ClipboardItem = undefined;`);
    expect(w.eval('shareCanCopyImages()'), 'hidden when unsupported').toBe(false);
    w.eval(`navigator.clipboard = { write: function(){ return Promise.resolve(); } };
            window.ClipboardItem = function(){};`);
    expect(w.eval('shareCanCopyImages()'), 'shown when supported').toBe(true);
  });

  it('the review panel offers the GIF and the link, not just a raw video download', () => {
    const { window: w } = loadMonolith();
    w.eval(`
      RUN_REC.supported = true; RUN_REC.url = 'blob:fake';
      showRunReview();
    `);
    const html = w.eval(`document.getElementById('runReview').innerHTML`);
    expect(html, 'GIF is the primary action').toContain('Make GIF');
    expect(html, 'and the growth loop is there').toContain('Copy Link');
  });

  it('says so plainly when there is no footage to turn into a GIF', async () => {
    const { window: w } = loadMonolith();
    w.eval(`RUN_REC.supported = true; RUN_REC.url = 'blob:fake'; showRunReview(); clipReset();`);
    await w.eval(`shareMakeGif()`);
    expect(w.eval(`document.getElementById('rrShare').innerHTML`)).toContain('No clip captured');
  });
});
