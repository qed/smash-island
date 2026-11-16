// The site-wide password gate: every request to the website (the game, the info pages, /api/strategy, robots.txt, all of it)
// stops here until the visitor has typed the password. Added 2026-11-16 at the owner's request ("no one can access the website").
//
// Vercel runs this file (middleware.js at the project root) before its CDN cache on every request, so a cached page can't be
// served around it. It is plain JavaScript with no packages, like scripts/build-site.mjs, because the deploy installs nothing
// (vercel.json: installCommand "").
//
// The password itself is NOT in this file (the repo is public). It is the SITE_PASSWORD environment variable on the Vercel
// project "smash" (Production and Preview). Change it there and redeploy; every visitor then has to type the new one, because
// the cookie holds a hash made from the password. If SITE_PASSWORD is missing, the gate fails closed: nobody gets in.
//
// To take the gate down: delete this file and push.
//
// Only the website is gated. The desktop build (electron/) and the online relay (relay/, a Cloudflare Worker) never pass
// through Vercel, so they are unaffected.

export const config = { matcher: '/:path*' };

const COOKIE = 'smash_gate';
const UNLOCK_PATH = '/__unlock';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export default async function middleware(request) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return page({ status: 503, message: 'The site is closed right now.', form: false });

  const url = new URL(request.url);
  const token = await sha256hex('smash-island-gate:' + password);

  if (readCookie(request.headers.get('cookie'), COOKIE) === token) {
    // Let the request through to the site (what next() from @vercel/functions returns).
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }

  if (request.method === 'POST' && url.pathname === UNLOCK_PATH) {
    let entered = '';
    let back = '/';
    try {
      // The form posts as application/x-www-form-urlencoded (a browser's default), so the body parses as URLSearchParams.
      // Testing this from Git Bash on Windows? Set MSYS_NO_PATHCONV=1 first: Git Bash rewrites a curl argument such as
      // next=/about.html into next=C:/Program Files/Git/about.html, which (rightly) redirects to / and looks like a bug here.
      const form = new URLSearchParams(await request.text());
      entered = form.get('password') || '';
      back = safePath(form.get('next') || '/', url);
    } catch { /* not a form post: treat it as a wrong password */ }

    if (entered && (await sha256hex('smash-island-gate:' + entered)) === token) {
      return new Response(null, {
        status: 303,
        headers: {
          location: back,
          'set-cookie': `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
          'cache-control': 'no-store',
        },
      });
    }
    return page({ status: 401, message: 'That password is not right. Try again.', next: back });
  }

  return page({ status: 401, next: safePath(url.pathname + url.search, url) });
}

// Only a path on this same site, so the form can't be used to send someone elsewhere after they unlock.
function safePath(path, url) {
  try {
    const target = new URL(path, url.origin);
    if (target.origin !== url.origin || target.pathname === UNLOCK_PATH) return '/';
    return target.pathname + target.search;
  } catch {
    return '/';
  }
}

function readCookie(header, name) {
  for (const part of (header || '').split(';')) {
    const eq = part.indexOf('=');
    if (eq > -1 && part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return '';
}

async function sha256hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// The lock screen. Everything it needs is inline: a stylesheet or font on the site would itself be behind the gate.
function page({ status, message = '', next = '/', form = true }) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Battle for Smash Island</title>
<style>
  :root{ --sky:#dcefff; --ink:#1c1c1c; --muted:#4b5a66; --card:#ffffff; --pink:#e84d8a; --sun:#ffd23f; --line:#b9d4ea; --bad:#b3261e }
  @media (prefers-color-scheme: dark){ :root{ --sky:#0f1b28; --ink:#eef4fa; --muted:#a9b9c6; --card:#172636; --pink:#ff6fa3; --line:#2a3d50; --bad:#ff8a80 } }
  *{ box-sizing:border-box }
  body{ margin:0; min-height:100vh; display:grid; place-items:center; padding:24px 16px; background:var(--sky); color:var(--ink); font:16px/1.5 system-ui, -apple-system, 'Segoe UI', sans-serif }
  .card{ width:100%; max-width:380px; background:var(--card); border:2px solid var(--line); border-radius:16px; padding:28px 24px }
  h1{ font-size:24px; line-height:1.15; margin:0 0 6px }
  p{ margin:0 0 18px; color:var(--muted) }
  label{ display:block; font-weight:700; margin-bottom:6px }
  input{ width:100%; font:inherit; padding:11px 12px; border-radius:12px; border:2px solid var(--line); background:var(--sky); color:var(--ink) }
  input:focus-visible, button:focus-visible{ outline:3px solid var(--sun); outline-offset:2px }
  button{ margin-top:14px; width:100%; font:inherit; font-weight:800; font-size:17px; color:#fff; background:var(--pink); border:0; border-radius:12px; padding:12px; cursor:pointer }
  .msg{ color:var(--bad); font-weight:700; margin:12px 0 0 }
</style>
</head>
<body>
<main class="card">
  <h1>Battle for Smash Island</h1>
  ${form ? `<p>This site is private. Enter the password to continue.</p>
  <form method="post" action="${UNLOCK_PATH}">
    <input type="hidden" name="next" value="${escapeHtml(next)}">
    <label for="pw">Password</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
    <button type="submit">Enter</button>
  </form>` : ''}
  ${message ? `<p class="msg" role="alert">${escapeHtml(message)}</p>` : ''}
</main>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}
