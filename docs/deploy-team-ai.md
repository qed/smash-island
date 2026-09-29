# Deploying the thinking teammate

The Team Strategy panel's teammate — the one you tap phrases at in the huddle, and the one that
re-plans for the CPU squads mid-fight — is written by a model. This is the one thing you have to set up for
that to happen. **Until you do, nothing breaks**: the game falls back to its built-in tactics, the
panel still works, matches still start, and no error reaches the player.

## The one setting

Vercel dashboard → the project → **Settings → Environment Variables**

| | |
|---|---|
| **Name** | `ANTHROPIC_API_KEY` |
| **Value** | your key |
| **Environments** | Production and Preview |

Then redeploy. That is the whole setup — apart from the one thing below, which you should do first.

## Set a monthly spend limit on the key

In the Anthropic console (Settings → Limits, or the spend limit of the workspace the key belongs to),
set a **monthly spend limit** before you put the key in Vercel. It is the only hard cap in this whole
design. The protections below make casual abuse hard, but they all live in `api/strategy.js`, in one
function instance's memory, and none of them can promise a ceiling on the bill. Pick a number you would
be content to lose: when the limit is reached the endpoint starts failing and the game falls back to its
scripted teammate, exactly as it does today when the key is not set.

## What locks the endpoint

`api/strategy.js` answers only the game, in three ways (all pinned by `test/strategy-lock.test.js`):

1. **Site origin.** Only the game's own site may call it: the production domain (`smash-delta.vercel.app`),
   previews of this project (`smash-*-helix3.vercel.app`) and localhost. Anyone else gets 403 before the
   body is read. The list is a constant at the top of the file: **if you attach a custom domain to the
   project, add it there**, or the teammate quietly stops using the model on that domain. This stops other
   websites using the endpoint through their visitors' browsers; it does not stop a script outside a
   browser, which can send any Origin it likes.
2. **A per-IP rate limit** (20 calls in a burst, 20 a minute after). It is best-effort: serverless
   instances do not share memory, so the real limit is that times the number of warm instances, and it
   resets when an instance is recycled. It deters a loop in a browser console; it is not a cap.
3. **The game's own prompt.** The system prompt must be one of the two fixed ones, the message must be
   built the way the game builds it, and a huddle turn must carry one of the six phrase ids whose fixed
   sentence is the message's last line. So this is no longer a general-purpose model proxy, and a player
   can no longer type words of their own to the model: the huddle has phrase buttons, not a text box.
   The phrase list and the two system prompts are mirrored in `api/strategy.js` and
   `artifacts/V1/index.html` (`TEAM_PHRASES`); a test fails if the two copies drift.

The key lives only in Vercel's environment. It is read by `api/strategy.js` at request time and used
as a request header; it is never returned to the browser, never logged, and never appears in the
shipped game. `test/credential-strip.test.js` fails the build if a key value is ever committed.

## How to tell whether it worked

Start a **Teams** match, tap a phrase ("Go aggressive", "Play safe", …) in the huddle, and read the line under the chat box:

- *"Teammate is thinking for real (normal tier)"* → the model is answering.
- *"Teammate is on built-in tactics right now — the strategy service is unreachable"* → the endpoint
  answered 503 (`ANTHROPIC_API_KEY` not set) or 404 (functions not deployed). The game is fine; the
  teammate is just running on the scripted replies.

## Which model answers

The **CPU Skill** setting under *More options* chooses the tier, in the huddle and in the fight:

| CPU Skill | Model |
|---|---|
| Easy | `claude-haiku-4-5-20251001` |
| Normal | `claude-sonnet-5` |
| Hard | `claude-fable-5` |

The browser never names a model — it sends the tier and `api/strategy.js` maps it, so a modified
client cannot talk the endpoint into an expensive model.

## What it costs

Per teams match, worst case:

- one opening plan as the match starts,
- one re-plan at most every **12s** (Easy/Normal) or **20s** (Hard — Fable is the expensive one), and
  only when the score has actually moved: damage is bucketed in 25% steps, so a long poking exchange
  costs nothing,
- a KO can cut in early, but never within 6s of the previous call,
- a hard ceiling of **16** calls a match (**8** on Hard), reset per match,
- plus one call per phrase you tap in the huddle (one turn at a time).

Responses are capped at 600 tokens server-side regardless of what the client asks for, and a caller is held to about 20 calls a minute. All the knobs
are constants at the top of the `TEAM AI` section in `artifacts/V1/index.html`, mirrored in
`api/strategy.js`.

## Running it somewhere else

If you run the game off-Vercel — a plain static host, or the Electron desktop build — there is no
`/api/strategy` to call. Open the Team Strategy panel, expand **Advanced**, and paste your own token
there. It stays in that browser's local storage, goes only to the model's own address, and is never
written to a log, a link, or the game's save data. This is an owner's escape hatch, not a thing to
ask a player for: it is two folds deep inside a panel that only exists in teams mode, and the title
screen has no idea it exists.
