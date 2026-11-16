# 250-cup batch (2026-11-05, local build 383fa7a: Update 2.3 + sprint + extra dash tells)

Setup (owner's): 48-team spectate cups, Solo, CPU Expert, items off, Goiky Field only, 3 stocks (group and knockout), no time limit. Counted by a page logger (champion, runner-up, semifinal losers). 84 different champions in 250 cups; 19 fighters never won.

Wins: Fries 19; Roboty 11; Rocky 10; Lollipop, Rose 9; Blocky 8; Pen, Tennis Ball 7; Bow, Donut, Match, Naily, Tree 6; Lightning, Microphone, Pickle, TV 5; ...
Runner-ups: Blocky 11; Rose 9; Donut, Fries 8.
Finals reached (wins + runner-ups): Fries 27, Blocky 19, Rose 18, Rocky 17.
Puffball: 1 win (cup 248, over Rose), 5 runner-ups.
Never won (19): Apple, Balloony, Basketball, Bubble, Cake, Coiny, Dora, Eraser, Fern, Gelatin, Goo, Loser, Marker, Money, Needle, Profily, Sidewalky, Teardrop, Yellow Face. Never reached a final (at 235 cups): Eraser, Gelatin, Needle.
Earlier live-build batch of 65 (same setup, before the extra dash tells): Donut 5 wins; here Donut 6 of 250 (2.4%).
Owner's Naily theory (melee smash + shields): Naily 6 wins here; shield-off A/B batch queued.

## A/B: CPU shield (and CPU reflector) OFF, 100 cups (same setup, same build 383fa7a)

Switch: BRAIN_LV[i].shd = 0 for all four levels (it also drives the CPU reflector of the nine no-bubble fighters). 50 different champions in 100 cups (84 in 250 with shields on).
Wins, shield ON (250) -> OFF (100): Fries 19 (7.6%) -> 7 (7%); Rocky 10 (4%) -> 7 (7%); Rose 9 -> 5; Roboty 11 (4.4%) -> 2 (2%); Donut 6 (2.4%) -> 5 (5%); Lollipop 9 -> 2; Blocky 8 -> 3; Tennis Ball 7 -> 2; **Naily 6 (2.4%) -> 2 (2%)**; Bonesaw 3 -> 4; Bow 6 -> 0; Microphone 5 -> 0; TV 5 -> 0; Pickle 5 -> 0; Remote 4 -> 0; Puffball 1 -> 1; Toothpaste 2 -> 1; David 3 -> 2.
Reading: the owner's Naily theory is NOT supported (his rate is unchanged without CPU shields). Fries is unaffected (7.6% vs 7%): his lead is not a shield effect. Rocky and Donut rose; Bow, Microphone, TV, Pickle, Remote dropped to 0 (small counts: 0 in 100 is within chance for a 2% fighter, p about 0.13).
