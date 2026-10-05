// ============================================================
//  /api/strategy — server-side model proxy for TEAM STRATEGY
// ============================================================
// The game's teammate chat and its in-fight re-strategy both need a model call. Making that call
// from the browser would mean shipping a credential to every player, which is exactly the surface
// the deploy-hardening work tore out. So the browser calls THIS endpoint, same-origin, with no
// credential of any kind, and the key lives only in the Vercel project's environment.
//
// OWNER SETUP (one time, and the feature is inert until it is done):
//   Vercel dashboard -> Project -> Settings -> Environment Variables
//   Name: ANTHROPIC_API_KEY   Value: <the key>   Environments: Production + Preview
//   Redeploy. Until then this endpoint answers 503 {error:'unconfigured'} and the game falls back
//   to its scripted teammate replies — it never breaks, it just stops being clever.
//
// OWNER: ALSO SET A MONTHLY SPEND LIMIT ON THE KEY, in the Anthropic console (Settings -> Limits, or the spend
// limit of the workspace this key belongs to). Do it before you set the environment variable above.
//   It is the ONLY hard cap in this design. Everything below (the site-origin check, the per-IP rate limit, the
//   fixed-prompt check, the token and size ceilings) makes casual abuse hard and keeps the endpoint from being a
//   general-purpose model proxy, but every one of those lives in this file, in one function instance's memory, and
//   none of them can promise a ceiling on the bill: a determined caller can forge the Origin header from outside a
//   browser, spread across IPs and function instances, and send well-formed requests for as long as they like, and
//   each one is billed to this key. A spend limit turns "unbounded" into "at most N a month, then the teammate
//   falls back to its scripted lines" — which is exactly what the game already does whenever this endpoint answers
//   anything but 200. Set a number you would be content to lose.
//
// SECURITY POSTURE
// - The key is read from process.env and used only as the x-api-key header. It is never returned,
//   never logged, never echoed into an error body.
// - ONLY THE GAME'S OWN SITE may call it (ALLOWED HOSTS, below). Anything else gets 403 before a byte of the body is read.
// - A BEST-EFFORT per-IP rate limit (RATE, below) answers 429 to a client that is calling too fast.
// - IT IS NOT A GENERAL-PURPOSE PROXY. It answers exactly two questions, the game's own (THE GAME'S OWN PROMPTS, below):
//   the strategist's re-plan and the huddle teammate's reply. The system prompt must be one of the two fixed ones, the
//   user message must be built the way the game builds it, and a chat turn must carry one of a fixed list of phrase ids
//   whose sentence is the message's last line. Free text from a player can no longer reach the model through here.
// - The CLIENT DOES NOT CHOOSE THE MODEL. It sends a difficulty TIER and the mapping below picks
//   the model. A caller cannot talk this endpoint into an arbitrary/expensive model id.
// - Everything else the caller sends is clamped: token ceiling, message count, prompt bytes.
// - No CORS headers: same-origin only, which is all the game needs.

// Difficulty tier -> model. This table is mirrored in artifacts/V1/index.html (TEAM_AI_MODELS);
// test/team-ai.test.js asserts the two stay identical, because a silent drift here would bill the
// owner for a tier the game never asked for.
const TIER_MODELS = {
  easy: 'claude-haiku-4-5-20251001',
  normal: 'claude-sonnet-5',
  hard: 'claude-fable-5',
};
const DEFAULT_TIER = 'normal';

// Cost guards. The hard tier is the expensive one and the in-fight loop can fire repeatedly across
// a long match, so the ceiling is enforced HERE as well as in the client — a client-side cap is a
// suggestion, a server-side cap is a bill.
const MAX_TOKENS_CAP = 600;
const MAX_MESSAGES = 1;            // the game only ever sends ONE user turn, never a history
const MAX_PROMPT_BYTES = 12000;
const MAX_BODY_BYTES = 16000;
const UPSTREAM_TIMEOUT_MS = 12000;

const UPSTREAM_URL = 'https://api.anthropic.com/v1/messages';
const UPSTREAM_VERSION = '2023-06-01';

// ---- ALLOWED HOSTS: who may call this ---------------------------------------------------------------------------
// Only the game's own site. It is a constant, here, so the owner can read it and change it in one place:
//   * the PRODUCTION domain of the Vercel project;
//   * PREVIEWS OF THIS PROJECT ONLY. Vercel names them smash-<hash>-<scope>.vercel.app (one per deployment) and
//     smash-git-<branch>-<scope>.vercel.app (one per branch), where "smash" is this project and "<scope>" is the
//     owner's Vercel scope (the ones the GitHub deployments list). Another project's *.vercel.app is NOT on the
//     list, and neither is a look-alike such as smashisland.vercel.app.example.com;
//   * localhost, so the tests and a local `vercel dev` keep working.
// A custom domain added to the project later has to be added HERE, or this function answers 403 to that domain and the
// game quietly falls back to its scripted teammate.
// WHAT THIS CHECK IS, AND IS NOT: it reads the Origin header (or, when a browser sends none, the Referer). A browser
// sets those itself and a page on some other site cannot forge them, so this stops other websites from using this
// endpoint through their visitors' browsers. It does NOT stop a script that runs outside a browser: curl can send any
// Origin it likes. It is a fence against casual, cross-site use, not a lock — the spend limit (above) is the lock.
const PRODUCTION_HOSTS = ['smashisland.vercel.app'];   // the game's public address. (It said smash-delta.vercel.app until 2026-10-05: that host is another project's site, so the live game's
//   requests were refused and a stranger's page was allowed -- found when the link previews pointed there.)
const PREVIEW_HOST_PATTERN = /^smash-[a-z0-9-]+-helix3\.vercel\.app$/;
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

// ---- RATE: how often ------------------------------------------------------------------------------------------
// A best-effort token bucket per client IP, held in THIS function instance's memory. Read this before trusting it:
// serverless instances do not share memory. Vercel runs as many copies of this function as it needs, each with its own
// bucket table, and throws a copy away when it goes idle (which also empties its table). So the real limit is roughly
// (this limit) x (the number of warm instances), and it resets whenever an instance is recycled. It deters casual abuse —
// a loop pasted into a browser console, a page hammering the endpoint — and that is all it does. IT IS NOT A HARD CAP.
// The hard cap is the spend limit on the key (see OWNER, above).
// Sized for honest play: a player's busiest minute is an opening plan plus a few phrase taps (the huddle allows one turn
// at a time), and after that the game's own cost guard spaces re-plans at least 12s apart.
const RATE_BURST = 20;            // calls a quiet client may make back to back
const RATE_PER_MINUTE = 20;       // and the steady rate at which it earns them back
const RATE_PER_MS = RATE_PER_MINUTE / 60000;
const RATE_IDLE_MS = 10 * 60000;  // a bucket untouched this long is forgotten
const RATE_MAX_CLIENTS = 5000;    // bound on the table; past it, idle buckets go, then (if still full) all of them
const buckets = new Map();        // client key -> { tokens, at }

/** The caller's address. On Vercel x-real-ip / x-forwarded-for are set by the platform's edge; anywhere else a client can
 *  choose them, so off Vercel this is only as good as the proxy in front of it. Bounded, so a giant header cannot bloat the table. */
function clientKey(req) {
  const h = (req && req.headers) || {};
  const one = (v) => (Array.isArray(v) ? v[0] : v);
  const real = one(h['x-real-ip']);
  if (real) return String(real).trim().slice(0, 64);
  const fwd = one(h['x-forwarded-for']);
  if (fwd) return String(fwd).split(',')[0].trim().slice(0, 64);
  return String((req && req.socket && req.socket.remoteAddress) || 'unknown').slice(0, 64);
}

/** Spend one token from `key`'s bucket. Returns {ok, retryAfter} (seconds until the next token, when not ok). */
function takeToken(key, now) {
  let b = buckets.get(key);
  if (!b) {
    if (buckets.size >= RATE_MAX_CLIENTS) {
      for (const [k, v] of buckets) if (now - v.at > RATE_IDLE_MS) buckets.delete(k);
      if (buckets.size >= RATE_MAX_CLIENTS) buckets.clear();   // still full of live callers: forget them all (a best-effort limiter fails open)
    }
    b = { tokens: RATE_BURST, at: now };
    buckets.set(key, b);
  } else {
    b.tokens = Math.min(RATE_BURST, b.tokens + Math.max(0, now - b.at) * RATE_PER_MS);
    b.at = now;
  }
  if (b.tokens < 1) return { ok: false, retryAfter: Math.max(1, Math.ceil((1 - b.tokens) / RATE_PER_MS / 1000)) };
  b.tokens -= 1;
  return { ok: true, retryAfter: 0 };
}

// ---- THE GAME'S OWN PROMPTS: what may be asked ---------------------------------------------------------------
// This endpoint used to relay whatever system prompt and messages a caller sent, which made it a general-purpose
// model proxy on the owner's key. It now answers the game's two questions only, and checks that a request IS one of them.
//
// Everything in this section is MIRRORED from artifacts/V1/index.html: STRATEGY_SYSTEM / CHAT_SYSTEM are
// TEAM_AI_STRATEGY_SYSTEM / TEAM_AI_CHAT_SYSTEM, PHRASES is TEAM_PHRASES (id -> the sentence it says), and the message
// shapes below are what teamAiStrategyPrompt and teamAiChatPrompt build. test/team-ai.test.js and
// test/strategy-lock.test.js pin the strings equal and run the game's own prompt builders, over every fighter and stage,
// through the checks below — so a change to one side without the other fails there instead of silently turning the
// teammate off in production.
const STRATEGY_SYSTEM =
  "You are the strategist for CPU teams in a cartoon 2D platform fighter. You answer with STRICT " +
  "JSON only: no prose, no markdown fences, no commentary. Schema: " +
  '{"teams":[{"team":<int>,"stance":"aggressive"|"balanced"|"defensive","focusName":<exact enemy name or null>,' +
  '"protectName":<exact ally name or null>,"specialUsage":"hoard"|"normal"|"spam","riskTolerance":<0..1>}]}. ' +
  "focusName MUST be copied exactly from that team's listed enemies, protectName exactly from its own " +
  "listed allies; use null rather than inventing a name. riskTolerance 0 means retreat early at high " +
  "damage, 1 means keep fighting.";

const CHAT_SYSTEM =
  "You are a teammate in a cartoon platform fighter, talking to your human partner in the huddle " +
  "before the match. Be brief and warm — two sentences at most, in character as a scrappy fighter, " +
  "never a corporate assistant. Then set the squad's plan. Reply with STRICT JSON only, no markdown " +
  'fences: {"reply":"<what you say out loud>","plan":{"stance":"aggressive"|"balanced"|"defensive",' +
  '"focusName":<exact enemy name or null>,"protectName":<exact ally name or null>}}. ' +
  "focusName must be copied exactly from the listed enemies and protectName exactly from the listed " +
  "allies — use null rather than naming anyone who is not listed. Follow what your partner asks for.";

// The quick phrases a player can tap in the huddle: id -> the sentence sent as "Your partner says: ...". A chat request
// carries an id from THIS list, and its last line must be that id's sentence, word for word. There is no other way to say
// something to the model through here.
const PHRASES = {
  aggressive: 'Go aggressive and press the attack.',
  safe: 'Play safe and stay careful.',
  balanced: 'Stay balanced and keep your options open.',
  threat: 'Everyone focus the biggest threat first.',
  split: 'Split up: each of you take the nearest enemy.',
  cover: 'Cover me: stay close and guard your partner.',
};

const STRATEGY_OPENING_HEADER = 'Pre-match. Plan for each CPU team.';
const STRATEGY_LIVE_HEADER = 'Mid-match. Re-plan for each CPU team given the current score.';
const STRATEGY_FOOTER = 'Reply with the JSON object only.';
const MAX_TEAM_LINES = 20;         // the game's MAX_TEAMS
const MAX_ENTRIES_PER_LIST = 60;   // fighters on one side of one team line

// A fighter or stage name: letters, digits, spaces and a little punctuation, at most 24 characters (the longest roster name
// is 12) — never a newline, a comma, a semicolon, a colon or a square bracket, which are this format's own delimiters. The
// game sanitises the stage name it sends (a level name typed by a player is never sent), so anything else here is not the game.
// HONEST LIMIT: this cannot prove that a name belongs to a real fighter — that would mean copying the whole roster in here
// and keeping it current as fighters are added. What it does is bound what a name slot can carry: 24 plain characters, in a
// fixed frame, under a system prompt that demands strict JSON. That is a strategist's input, not a way to ask the model
// anything, but it is not a lock on its own, which is why the rate limit and the spend limit are there too.
const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9 .'&!()-]{0,23}$/;
const SPECIAL_RE = /^[a-z0-9_]{1,24}$/;
const ARCH_RE = /^[A-Za-z][A-Za-z0-9 '.\/-]{0,31}$/;
const WEIGHT_RE = /^weight \d{1,3}(?:\.\d{1,2})?$/;
const DAMAGE_RE = /^\d{1,4}% damage$/;
const STOCKS_RE = /^(?:∞|\d{1,3}) stocks$/;
const STANCES = ['aggressive', 'balanced', 'defensive'];

/** `Name [special(, arch), weight W(, P% damage, S stocks(, OUT))]` — the strategy prompt's fighter entry. Linear: split, then bounded regexes. */
function strategyEntryOk(entry, live) {
  const open = entry.indexOf(' [');
  if (open < 1 || !entry.endsWith(']')) return false;
  if (!NAME_RE.test(entry.slice(0, open))) return false;
  const parts = entry.slice(open + 2, -1).split(', ');
  let i = 0;
  if (!SPECIAL_RE.test(parts[i++])) return false;
  if (parts[i] !== undefined && !parts[i].startsWith('weight ')) { if (!ARCH_RE.test(parts[i])) return false; i++; }
  if (!WEIGHT_RE.test(parts[i++] || '')) return false;
  if (!live) return i === parts.length;
  if (!DAMAGE_RE.test(parts[i++] || '')) return false;
  if (!STOCKS_RE.test(parts[i++] || '')) return false;
  if (parts[i] === 'OUT') i++;
  return i === parts.length;
}
function strategyListOk(list, live) {
  const entries = list.split('; ');
  return entries.length <= MAX_ENTRIES_PER_LIST && entries.every((e) => strategyEntryOk(e, live));
}
/** `Team N — allies: LIST. Enemies: LIST.` */
function strategyTeamLineOk(line, live) {
  const head = /^Team \d{1,2} — allies: /.exec(line);
  if (!head || !line.endsWith('.')) return false;
  const rest = line.slice(head[0].length);
  const cut = rest.indexOf('. Enemies: ');
  if (cut < 0) return false;
  return strategyListOk(rest.slice(0, cut), live) && strategyListOk(rest.slice(cut + '. Enemies: '.length, -1), live);
}
function stageLineOk(line) {
  return line.startsWith('Stage: ') && line.endsWith('.') && NAME_RE.test(line.slice(7, -1));
}
/** The in-fight / opening strategy prompt, as teamAiStrategyPrompt builds it. */
function strategyPromptOk(content) {
  const lines = content.split('\n');
  if (lines.length < 4 || lines.length > 3 + MAX_TEAM_LINES) return false;
  const live = lines[0] === STRATEGY_LIVE_HEADER;
  if (!live && lines[0] !== STRATEGY_OPENING_HEADER) return false;
  if (!stageLineOk(lines[1]) || lines[lines.length - 1] !== STRATEGY_FOOTER) return false;
  return lines.slice(2, -1).every((l) => strategyTeamLineOk(l, live));
}

/** `Name [special]` (an ally) or `Name [special, weight W]` (an enemy) — the chat prompt's fighter entries. */
function chatEntryOk(entry, enemy) {
  const open = entry.indexOf(' [');
  if (open < 1 || !entry.endsWith(']')) return false;
  if (!NAME_RE.test(entry.slice(0, open))) return false;
  const parts = entry.slice(open + 2, -1).split(', ');
  if (!SPECIAL_RE.test(parts[0])) return false;
  return enemy ? (parts.length === 2 && WEIGHT_RE.test(parts[1])) : parts.length === 1;
}
function chatListOk(body, enemy) {
  if (body === '(none)') return true;
  // Entries are joined with ', ' but an enemy's own tag holds one too ("Pin [pierce, weight 102], Bomby [bomb, weight 120]"),
  // so split on the '], ' that ends an entry, not on every ', ' (a name cannot hold ']' or ',', so this is unambiguous).
  const cut = body.split('], ');
  const entries = cut.map((e, i) => (i < cut.length - 1 ? `${e}]` : e));
  return entries.length <= MAX_ENTRIES_PER_LIST * 2 && entries.every((e) => chatEntryOk(e, enemy));
}
/** The huddle chat prompt, as teamAiChatPrompt builds it: five lines, the last one the phrase's own sentence. */
function chatPromptOk(content, sentence) {
  const lines = content.split('\n');
  if (lines.length !== 5) return false;
  const [stage, allies, enemies, plan, says] = lines;
  const ALLIES = 'Your allies (you are one of them): ', ENEMIES = 'Your enemies: ';
  if (!stageLineOk(stage)) return false;
  if (!allies.startsWith(ALLIES) || !allies.endsWith('.') || !chatListOk(allies.slice(ALLIES.length, -1), false)) return false;
  if (!enemies.startsWith(ENEMIES) || !enemies.endsWith('.') || !chatListOk(enemies.slice(ENEMIES.length, -1), true)) return false;
  const p = /^Current plan — stance ([a-z]{1,12}), focus (.{1,40}), protect (.{1,40})\.$/.exec(plan);
  if (!p || !STANCES.includes(p[1])) return false;
  if (p[2] !== 'nobody in particular' && !NAME_RE.test(p[2])) return false;
  if (p[3] !== 'nobody' && !NAME_RE.test(p[3])) return false;
  return says === 'Your partner says: ' + sentence;
}

/**
 * Is this request the game's own? Returns { kind, system, content } for the one accepted shape, or null. Exactly one user
 * message; the system prompt is one of the two fixed ones; a chat turn names a phrase id from PHRASES.
 */
function checkGamePrompt(body) {
  if (!body || typeof body !== 'object') return null;
  const msgs = body.messages;
  if (!Array.isArray(msgs) || msgs.length !== MAX_MESSAGES) return null;
  const m = msgs[0];
  if (!m || m.role !== 'user' || typeof m.content !== 'string') return null;
  if (Buffer.byteLength(m.content, 'utf8') > MAX_PROMPT_BYTES) return null;
  if (body.system === STRATEGY_SYSTEM) {
    return strategyPromptOk(m.content) ? { kind: 'strategy', system: STRATEGY_SYSTEM, content: m.content } : null;
  }
  if (body.system === CHAT_SYSTEM) {
    const id = body.phrase;
    if (typeof id !== 'string' || !Object.prototype.hasOwnProperty.call(PHRASES, id)) return null;
    return chatPromptOk(m.content, PHRASES[id]) ? { kind: 'chat', system: CHAT_SYSTEM, content: m.content } : null;
  }
  return null;
}

/** Was this request made from the game's own site? See ALLOWED HOSTS for what that does and does not prove. */
function originAllowed(req) {
  const h = (req && req.headers) || {};
  const one = (v) => (Array.isArray(v) ? v[0] : v);
  const origin = one(h.origin);
  const raw = origin || one(h.referer);      // a browser sends Origin on every POST; Referer is the fallback
  if (!raw || raw === 'null') return false;  // 'null' is an opaque origin (a sandboxed frame, a file): never the game
  let u;
  try { u = new URL(String(raw)); } catch { return false; }
  const host = u.hostname.toLowerCase();
  if (LOCAL_HOSTS.includes(host)) return u.protocol === 'http:' || u.protocol === 'https:';
  if (u.protocol !== 'https:') return false;
  return PRODUCTION_HOSTS.includes(host) || PREVIEW_HOST_PATTERN.test(host);
}

/** Read a JSON body whether the platform pre-parsed it or handed us a stream. */
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > MAX_BODY_BYTES) throw new Error('body-too-large');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' });
    return;
  }

  // Who is asking, and how often — both BEFORE the body is read, so a stranger or a flood costs nothing but the refusal.
  if (!originAllowed(req)) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }
  const rate = takeToken(clientKey(req), Date.now());
  if (!rate.ok) {
    res.setHeader('Retry-After', String(rate.retryAfter));
    res.status(429).json({ error: 'rate-limited' });
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    res.status(400).json({ error: 'bad-request' });
    return;
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {   // `null`, a number, a list: not the game
    res.status(400).json({ error: 'bad-request' });
    return;
  }

  const tier = Object.prototype.hasOwnProperty.call(TIER_MODELS, body.tier) ? body.tier : DEFAULT_TIER;
  const model = TIER_MODELS[tier];

  // Is this the game asking? Anything else — another system prompt, free text, a history, a phrase that is not on the
  // list — is refused here, so this is not a way to reach the model with words of one's own choosing.
  const asked = checkGamePrompt(body);
  if (!asked) {
    res.status(400).json({ error: 'bad-request' });
    return;
  }

  let maxTokens = Number(body.maxTokens);
  if (!Number.isFinite(maxTokens) || maxTokens < 1) maxTokens = 256;
  maxTokens = Math.min(MAX_TOKENS_CAP, Math.round(maxTokens));

  // Read the key LAST, so a malformed request is rejected as a bad request rather than reported as
  // an unconfigured deployment — the two failures send the client down different fallback paths.
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // Deliberately explicit: this is the state the owner must fix, and the client uses this exact
    // code to decide whether to try its own locally-pasted key instead.
    res.status(503).json({ error: 'unconfigured' });
    return;
  }

  // The system prompt sent upstream is OUR constant, the one the request was checked against — not a caller's string.
  const payload = { model, max_tokens: maxTokens, messages: [{ role: 'user', content: asked.content }], system: asked.system };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const upstream = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': UPSTREAM_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!upstream.ok) {
      // Status only. The upstream body can quote request material back at us and there is no reason
      // to relay any of it to a browser.
      res.status(502).json({ error: 'upstream', status: upstream.status });
      return;
    }
    const data = await upstream.json();
    const text = Array.isArray(data && data.content)
      ? data.content.filter((b) => b && b.type === 'text').map((b) => b.text).join('')
      : '';
    res.status(200).json({ text, model, tier });
  } catch (err) {
    const aborted = err && (err.name === 'AbortError' || err.name === 'TimeoutError');
    res.status(aborted ? 504 : 502).json({ error: aborted ? 'timeout' : 'upstream' });
  } finally {
    clearTimeout(timer);
  }
}

// Test hooks, under one name that no HTTP-method export can collide with. The tests import the module and drive these and the
// handler directly; nothing in the game or on Vercel reads this.
export const __test = {
  STRATEGY_SYSTEM, CHAT_SYSTEM, PHRASES, TIER_MODELS,
  PRODUCTION_HOSTS, PREVIEW_HOST_PATTERN, LOCAL_HOSTS,
  RATE_BURST, RATE_PER_MINUTE,
  originAllowed, checkGamePrompt, clientKey, takeToken,
  resetRateLimit: () => buckets.clear(),
};
