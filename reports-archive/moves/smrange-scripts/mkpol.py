import json, sys
# Targets = the generated moves' coverage (reach_before.json): up top 132, side 96 / 90 at head height and above; down floor 126 each side.
# A width phase of an up smash also keeps the move's own height (need top >= its height before - 6, one grid step).
# caps: the most any stretch may grow a move (so a body hit stays near the body and a thin line stays a line); a move still short at its cap is LISTED.
T = 132; F = 96; B = 90; D = 126
TOP0 = {'Pin': 84, 'Snowball': 150, 'Bomby': 150, 'Bubble': 138, 'Teardrop': 132, 'Flower': 132, 'Coiny': 138, 'Pen': 138, 'Pencil': 138, 'Match': 132,
        'Ice Cube': 144, 'Golf Ball': 150, 'Rocky': 132, 'Woody': 132, 'Ruby': 150, 'Gelatin': 144, 'Nickel': 138, 'Yellow Face': 132, 'Donut': 150,
        'David': 132, 'Loser': 132, 'Lollipop': 150, 'Taco': 138, 'Gaty': 132}
def H(w=(0, 1, 0.3), need=None, caps=None): return {'w': list(w), 'need': need or {'top': T}, 'caps': caps or {'kx': 2.2, 'ky': 2.0, 'kr': 1.8}}
def W(w, need, kr=1.8, kx=2.2): return {'w': list(w), 'need': need, 'caps': {'kx': kx, 'ky': 2.0, 'kr': kr}}
def up(n, sides): d = dict(sides); d['top'] = TOP0[n] - 6; return d
both = {'fwd': F, 'back': B}; fw = {'fwd': F}; bk = {'back': B}
UP = {
 'Needle': [H((0, 1, 1))],
 'Pin': [W((1, 0, 0.3), up('Pin', both))],
 'Snowball': [W((1, 0, 0.5), up('Snowball', fw))],
 'Bomby': [W((0.5, 0, 1), up('Bomby', both), kr=2.2)],
 'Bubble': [W((1, 0, 1), up('Bubble', both), kr=2.2)],
 'Teardrop': [H(), W((1, 0, 0.5), up('Teardrop', both))],
 'Flower': [H(), W((1, 0, 0.5), up('Flower', both))],
 'Tennis Ball': [W((0, 0, 1), {'top': T, 'fwd': F, 'back': B}, kr=1.6)],
 'Blocky': [H(need={'topAny': T})],
 'Coiny': [W((1, 0, 1), up('Coiny', both))],
 'Pen': [W((0.6, 0, 1), up('Pen', both))],
 'Pencil': [W((0.6, 0, 0.8), up('Pencil', both))],
 'Match': [H((0, 1, 1)), W((1, 0, 1), up('Match', both), kr=2.2)],
 'Ice Cube': [W((1, 0, 0.5), up('Ice Cube', both))],
 'Golf Ball': [W((0.5, 0, 1), up('Golf Ball', fw))],
 'Rocky': [W((1, 0, 1), up('Rocky', both))],
 'Woody': [W((1, 0, 0.5), up('Woody', both))],
 'Ruby': [W((1, 0, 0.5), up('Ruby', both))],
 'Puffball': [W((0, 0, 1), {'top': T, 'fwd': F, 'back': B}, kr=1.6)],
 'Gelatin': [W((1, 0, 0.5), up('Gelatin', fw))],
 'Nickel': [W((1, 0, 1), up('Nickel', both), kr=1.6)],
 'Yellow Face': [W((1, 0, 0.5), up('Yellow Face', fw))],
 'Donut': [W((1, 0, 0.8), up('Donut', both), kr=1.6)],
 'Dora': [W((0, 0, 1), both, kr=1.6)],
 'David': [W((1, 0, 0.5), up('David', both))],
 'Loser': [W((1, 0, 0.6), up('Loser', fw))],
 'Lollipop': [W((1, 0, 0.6), up('Lollipop', bk), kr=1.6)],
 'Taco': [W((1, 0, 0.6), up('Taco', both))],
 'Barf Bag': [W((0, 0, 1), both, kr=2.2)],
 'Bell': [W((0, 0, 1), both, kr=1.5)],
 'Tree': [W((0, 0, 1), both, kr=1.8)],
 'Gaty': [H(), W((1, 0, 0.5), up('Gaty', both))],
}
db = {'fwd': D, 'back': D}
DN = {
 'Firey': [W((1, 0, 0.5), db)], 'Leafy': [W((1, 0, 0.5), db)], 'Needle': [W((1, 0, 0.5), db)], 'Pin': [W((1, 0, 1), db, kr=1.6)],
 'Bubble': [W((1, 0, 1), db, kr=2.2)], 'Teardrop': [W((1, 0, 0.5), db)], 'Tennis Ball': [W((1, 0, 0.5), db)], 'Blocky': [W((1, 0, 0.5), db)],
 'Coiny': [W((1, 0, 1), db, kr=1.6)], 'Pen': [W((1, 0, 0.5), db)], 'Golf Ball': [W((1, 0, 1), {'back': D}, kr=1.6)], 'Book': [W((1, 0, 0.5), db)],
 'Puffball': [W((1, 0, 0.6), db)], 'Nickel': [W((1, 0, 0.5), db)], 'Yellow Face': [W((1, 0, 0.5), db)], 'Donut': [W((1, 0, 0.5), {'fwd': D})],
 'Lollipop': [W((1, 0, 0.6), {'fwd': D})], 'Taco': [W((1, 0, 0.5), {'fwd': D})], 'Bell': [W((1, 0, 0.5), db)], 'Gaty': [W((1, 0, 0.5), db)],
}
pol = [{'n': n, 'dir': 1, 'phases': p} for n, p in UP.items()] + [{'n': n, 'dir': -1, 'phases': p} for n, p in DN.items()]
json.dump(pol, open(sys.argv[1], 'w'))
print(len(pol))
