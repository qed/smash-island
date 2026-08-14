const { app, BrowserWindow, session, protocol, net } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// THE GAME IS artifacts/V1. It is a single self-contained HTML file plus its assets, and it is what
// Vercel serves. It is NOT dist/ — that is the output of the modularization effort whose entry point
// (src/main.js) is still `console.log('BFSI boot placeholder')`. This app used to load dist/, so
// `npm run dist` packaged a blank window: the installable build has never actually run the game.
const GAME_ROOT = path.join(__dirname, '..', 'artifacts', 'V1');

// Served over a real custom origin rather than file://, because localStorage — and therefore the
// whole progression/profile/custom-music layer — is unavailable on an opaque file:// origin.
//
// The host segment is load-bearing. `app://index.html` parses index.html as the HOSTNAME with a
// path of "/", so a relative asset like `assets/sprites/firey.png` would resolve to
// app://index.html/assets/... and be looked up at artifacts/V1/index.html/assets/... — every sprite,
// track and font 404s. Using a fixed host and putting the file in the PATH is what makes relative
// asset references work.
const ORIGIN = 'app://game';

function setCsp() {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",   // the game keeps its inline on*= handlers
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",          // blob: for the share-clip GIF and replay preview
    "media-src 'self' data: blob:",        // music, and the .webm match recording
    "font-src 'self' data:",
    // ws: for LAN netplay. Exactly ONE third-party origin is allowed, and only because the desktop
    // build has no /api/strategy to proxy through: the web build's team-strategy calls are
    // same-origin, but this app is served from app://game with no server behind it, so the only way
    // an owner can drive the thinking teammate here is the token they paste under Advanced, which
    // goes straight to the model's own address. Nothing else may be added to this list.
    "connect-src 'self' ws: wss: blob: https://api.anthropic.com",
  ].join('; ');
  session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
    cb({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [csp] } });
  });
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800, backgroundColor: '#88cdf2',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.loadURL(`${ORIGIN}/index.html`);
}

app.whenReady().then(() => {
  setCsp();
  protocol.handle('app', (req) => {
    const url = new URL(req.url);
    if (url.hostname !== 'game') return new Response('not found', { status: 404 });
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.normalize(path.join(GAME_ROOT, rel));
    // Path-traversal guard: a crafted app://game/../../.. must not escape the game directory.
    if (file !== GAME_ROOT && !file.startsWith(GAME_ROOT + path.sep)) {
      return new Response('forbidden', { status: 403 });
    }
    // pathToFileURL, not 'file://' + file — on Windows the latter produces file://C:\Users\...,
    // which is not a valid URL and fails for every asset.
    return net.fetch(pathToFileURL(file).toString());
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
