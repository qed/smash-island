import json,glob,statistics as st,os
for c in ["canyon_ffa_4","canyon_ffa_8","canyon_teams_4","fortress_ffa_4","skytower_ffa_4","goiky_ffa_4","grandplains_ffa_4"]:
  for cond in ["before","after"]:
    fn=f"out_{cond}_{c}.txt"
    if not os.path.exists(fn): continue
    rows=[json.loads(l) for l in open(fn) if l.startswith('{')]
    if not rows: print(c,cond,'none'); continue
    fk=sorted((r['first'] if r['first'] is not None else r['frames']) for r in rows)
    g={k:sum(r['gstat'][k] for r in rows) for k in rows[0]['gstat']}
    print(f"{c:16}{cond:7} n={len(rows)} KOs={sum(r['kos'] for r in rows):3} medFirst={st.median(fk)/60:5.0f}s stallMin={sum(r['stallMin'] for r in rows):2} noKO={sum(r['first'] is None for r in rows)} top/side/bot/gorge={g['topKO']}/{g['sideKO']}/{g['bottomKO']}/{g['gorgeKO']} entries={g['entries']} knocked={g['knockedIn']} self={g['selfIn']}")
