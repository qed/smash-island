# Custom music slots

Drop a track in here and the game plays it instead of the shipped default for that context.
Nothing in this folder is required — if a slot is empty, the game falls back to the default track
in `../`, and if that is missing too it falls back to its built-in synth loop. It never goes silent.

## Filenames

The filename **is** the wiring. Use exactly these names, all lowercase, `.mp3`:

| File | When it plays |
|---|---|
| `title.mp3` | The title screen, and only the title screen |
| `menu.mp3` | Character select, controls, tutorial, stats, level creator, lobby |
| `battle.mp3` | Arena matches — FFA, 1v1, teams, World Cup fixtures |
| `boss.mp3` | Boss Rush |
| `tourney.mp3` | World Cup setup screen and tournament hub |
| `intense.mp3` | Clutch time — someone on their last stock, the player above 90%, or a Boss Rush boss under 25% HP |

Resolution order for every context: `custom/<name>.mp3` → `../<name>.mp3` → synth loop.

**`title` is the exception, and it has no shipped default.** There is no `../title.mp3` in the
repo, so its order is `custom/title.mp3` → `../title.mp3` → *the whole `menu` chain* → synth loop.
Leave the slot empty and the title screen plays the menu bed, which is exactly what it did before
the slot existed — so adding a title track is purely additive and removing it changes nothing back.
Players who load their own menu track through Controls → Custom Music still hear it on the title
screen; a track in the Title slot beats it.

A slot you have not filled costs one 404 the first time that context comes up in a session. The
game remembers the miss and does not ask again, so there is no ongoing cost to leaving slots empty.

Keep files reasonably small — these are downloaded by every player. Aim for under ~4 MB each; a
60–120 second loop at 128–256 kbps is the right shape. Tracks are played with `loop = true`, so
pick something that repeats without an obvious seam.

## You must have the right to use what you put here

**This folder ships with the site.** Anything you drop in is uploaded to the public deploy and
served to every visitor. That makes it publishing, not private listening.

Before adding a track:

1. **Acquire it legitimately.** Buy it from the artist or an authorised store (Bandcamp, the
   official label shop, etc.). A YouTube rip, a fan re-upload, or a file from a lyrics/converter
   site is not a legitimate copy no matter where you found it.
2. **Check that the rights holder permits non-commercial fan use**, and follow their terms. Buying
   a copy gives you a licence to *listen*, not automatically a licence to *redistribute*.
3. **Credit it** — in `../CREDITS.md` and in the `#musicCredits` line on the title screen in
   `index.html`. `../CREDITS.md` has a commented-out template block ready to uncomment.
4. **Keep the game non-commercial.** It is already an unofficial fan work; the moment money is
   involved, essentially none of the permissions below apply.

If you cannot satisfy all four for a track, leave the slot empty. The default is good.

### Undertale / Deltarune music specifically

Toby Fox's music (Undertale, Deltarune — including "Big Shot" from the Deltarune Chapter 2
soundtrack) is administered by **Materia Music Publishing**, who permit non-commercial fan use
provided the work is properly credited. Buy the soundtrack from the official Bandcamp release, and
then credit **both** of these, together, wherever the music is credited:

```
Composer: Toby Fox
Rights administrator: Materia Music Publishing
```

Both lines are required — the composer alone is not enough, because Materia is the party whose
policy is granting the permission. If Materia's published policy changes, that policy wins over
this README; check it before you publish.

Note the scope: this covers using the *recording* as a fan work with credit. It does not cover
selling anything, monetising a video of the game, or claiming any association with Toby Fox,
Materia, or the games.

## After adding a track

1. Uncomment and fill in the relevant block in `../CREDITS.md`.
2. Add the credit to the `#musicCredits` line in `artifacts/V1/index.html` so it is visible in the
   game itself, not only in the repo.
3. `npx vitest run` — the publish-root gate pins exactly which files ship, so it will fail until
   the new file is listed in `test/credential-strip.test.js`. That is the gate doing its job:
   nothing reaches the public deploy without someone deciding it should.
