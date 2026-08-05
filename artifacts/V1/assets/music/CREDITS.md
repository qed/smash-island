# Music credits — Battle for Smash Island

Every background-music file shipped in this directory is listed below with its title, author,
source page, licence, and the attribution the licence requires. All four were downloaded from
Pixabay and the licence line **"Free for use under the Pixabay Content License"** was verified on
each track's own page before download.

None of this music is from, or a cover of, any commercial soundtrack. The brief asked for an
"Undertale-ish" menu/battle feel and a "Hollow Knight / Silksong-ish" boss feel — these are
independent style-alike tracks chosen to evoke that mood. No Toby Fox or Christopher Larkin
composition (or any arrangement, rip, or fan re-upload of one) is included anywhere in this repo.

---

## 1. `menu.mp3` — menus, character select, lobby, tutorial, level creator

| | |
|---|---|
| **Title** | Chill/Calming Chiptune Loop |
| **Author** | Reganati (Pixabay user `reganati-46795721`) |
| **Source** | https://pixabay.com/music/electronic-chillcalming-chiptune-loop-527182/ |
| **Licence** | Pixabay Content License — https://pixabay.com/service/license-summary/ |
| **Attribution required?** | No ("Use Content without having to attribute the author") |
| **Attribution used anyway** | Music: "Chill/Calming Chiptune Loop" by Reganati, from Pixabay |
| **Length / size** | 1:16 · 2.3 MB · MP3 256 kbps 48 kHz |

Warm, unhurried chiptune — the cosy-town register the brief asked for.

## 2. `battle.mp3` — arena matches (FFA, 1v1, teams, World Cup fixtures)

| | |
|---|---|
| **Title** | 8-Bit Chiptune Action Music for Video Games |
| **Author** | HauntSync (Pixabay user `hauntsync-38266323`) |
| **Source** | https://pixabay.com/music/video-games-8-bit-chiptune-action-music-for-video-games-329940/ |
| **Licence** | Pixabay Content License — https://pixabay.com/service/license-summary/ |
| **Attribution required?** | No |
| **Attribution used anyway** | Music: "8-Bit Chiptune Action Music for Video Games" by HauntSync, from Pixabay |
| **Length / size** | 1:36 · 2.9 MB · MP3 256 kbps 48 kHz |

Driving, upbeat 8-bit with a melodic lead — energetic without drowning the hit SFX.

## 3. `boss.mp3` — Boss Rush

| | |
|---|---|
| **Title** | Dark Orchestral Battle Tension |
| **Author** | Montogoronto (Pixabay user `montogoronto-34345685`) |
| **Source** | https://pixabay.com/music/build-up-scenes-dark-orchestral-battle-tension-395613/ |
| **Licence** | Pixabay Content License — https://pixabay.com/service/license-summary/ |
| **Attribution required?** | No |
| **Attribution used anyway** | Music: "Dark Orchestral Battle Tension" by Montogoronto, from Pixabay |
| **Length / size** | 1:00 · 1.8 MB · MP3 256 kbps 44.1 kHz |

Dark, string-led orchestral tension — the atmospheric-boss register.

## 4. `tourney.mp3` — World Cup setup + tournament hub

| | |
|---|---|
| **Title** | Epic Orchestral Anthem Loop |
| **Author** | Sonican (Pixabay user `sonican-38947841`) |
| **Source** | https://pixabay.com/music/main-title-epic-orchestral-anthem-loop-308394/ |
| **Licence** | Pixabay Content License — https://pixabay.com/service/license-summary/ |
| **Attribution required?** | No |
| **Attribution used anyway** | Music: "Epic Orchestral Anthem Loop" by Sonican, from Pixabay |
| **Length / size** | 1:20 · 2.5 MB · MP3 256 kbps 44.1 kHz |

Regal and anthemic — the World Cup deserves a fanfare, not a battle loop.

---

## Licence terms as published (Pixabay Content License summary, verified 2026-08-05)

Allowed:

- "Use Content for free"
- "Use Content without having to attribute the author (although giving credit is always
  appreciated by our community!)"
- "Modify or adapt Content into new works"

Prohibited (none of which this project does):

- "You cannot sell or distribute Content (either in digital or physical form) on a Standalone
  basis. Standalone means where no creative effort has been applied to the Content and it remains
  in substantially the same form as it exists on our website."
- Commercial use of Content containing recognisable trademarks, logos or brands in relation to
  goods and services.
- Immoral, illegal, misleading or deceptive use.
- Use as part of a trade mark, design mark, trade name, business name or service mark.

Here each track is embedded as one layer of an interactive game alongside original code, art and
sound effects, and the game is not sold — so the "Standalone" prohibition does not apply.

## If you replace a track

`artifacts/V1/index.html` maps contexts to filenames in the `MUSIC_FILES` object. Drop a
replacement at the same path and it is picked up with no code change. If a file is missing or
fails to decode, the game falls back to its built-in WebAudio synth loop for that context rather
than going silent — so a bad file degrades, it does not break. Update this file and the
`#musicCredits` line on the title screen whenever a track changes.
