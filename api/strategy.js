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
// SECURITY POSTURE
// - The key is read from process.env and used only as the x-api-key header. It is never returned,
//   never logged, never echoed into an error body.
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
const MAX_MESSAGES = 8;
const MAX_PROMPT_BYTES = 12000;
const MAX_BODY_BYTES = 16000;
const UPSTREAM_TIMEOUT_MS = 12000;

const UPSTREAM_URL = 'https://api.anthropic.com/v1/messages';
const UPSTREAM_VERSION = '2023-06-01';

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

/** Coerce the caller's messages into the narrow shape the upstream accepts, or throw. */
function sanitizeMessages(raw) {
  if (!Array.isArray(raw) || !raw.length) throw new Error('no-messages');
  const msgs = raw.slice(0, MAX_MESSAGES).map((m) => {
    const role = m && m.role === 'assistant' ? 'assistant' : 'user';
    const content = typeof (m && m.content) === 'string' ? m.content : '';
    if (!content) throw new Error('empty-message');
    return { role, content };
  });
  const bytes = Buffer.byteLength(msgs.map((m) => m.content).join(''), 'utf8');
  if (bytes > MAX_PROMPT_BYTES) throw new Error('prompt-too-large');
  return msgs;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' });
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    res.status(400).json({ error: 'bad-request' });
    return;
  }

  const tier = Object.prototype.hasOwnProperty.call(TIER_MODELS, body.tier) ? body.tier : DEFAULT_TIER;
  const model = TIER_MODELS[tier];

  let messages;
  try {
    messages = sanitizeMessages(body.messages);
  } catch {
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

  const payload = { model, max_tokens: maxTokens, messages };
  if (typeof body.system === 'string' && body.system) payload.system = body.system.slice(0, MAX_PROMPT_BYTES);

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
