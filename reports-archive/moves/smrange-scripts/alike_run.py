import json, subprocess, sys
S = r'C:\Users\carad\AppData\Local\Temp\claude\f6b4fec287bd4976\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\smrange'
AL = r'C:\Users\carad\Aardvark\smash-island-work\.worktrees\smrange\reports-archive\moves\updsm3-scripts\alike.py'
for tag in ('base', 'new'):
    J = json.load(open(S + '\\rows_%s.json' % tag, encoding='utf8'))
    rows = J['rows'] + J['gen']; json.dump(rows, open(S + '\\alike_%s.json' % tag, 'w', encoding='utf8'))
    own = [r['who'] + '|' + r['slot'] for r in J['rows'] if r['slot'] in ('upsmash', 'downsmash')]
    out = subprocess.run([sys.executable, '-I', AL, S + '\\alike_%s.json' % tag] + own, capture_output=True, text=True, encoding='utf8').stdout
    open(S + '\\alike_%s.txt' % tag, 'w', encoding='utf8').write(out)
    heads = [l for l in out.splitlines() if l.startswith('==')]; fulls = [l for l in out.splitlines() if 'full matches' in l]
    flagged = [(h.split('"')[0][3:].strip(), f.split(':')[-1].strip()) for h, f in zip(heads, fulls) if not f.strip().endswith(': 0')]
    print(tag, 'rows', len(rows), 'own moves checked', len(own), 'with 0 matches', sum(1 for f in fulls if f.strip().endswith(': 0')), 'flagged', flagged)
    print('\n'.join(l for l in out.splitlines() if 'ALIKE' in l))
