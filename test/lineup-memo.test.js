import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// THE TEAM-CHAT PREVIEW IS THE LINEUP YOU GET.
//
// "how can I get the teams chat to be up to date? the characters in the preview dont match the ones I
// actually am with." refreshTeamChat built its preview with buildFighters() -- a random draw -- and the
// match called buildFighters() again, a second draw. One draw per (mode, count, split, chosen fighter)
// is remembered now; starting the match spends it, so the next preview and the next match roll fresh.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const lineup = 'fighters.map(function(f){ return f.name + ":" + f.team; }).join(",")';

describe('preview and match', () => {
  it('agree, name for name and team for team', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='teams'; SETTINGS.count=4; SETTINGS.teamKey='2v2'; SETTINGS.items=false;
      chosen = ROSTER.find(function(x){ return x.name==='Firey'; });
      refreshTeamChat();
      var preview = ${lineup};
      var yt = document.getElementById('planYourTeam').textContent, ft = document.getElementById('planFoes').textContent;
      beginMatchNow();
      var match = ${lineup};
      var me = fighters[0].team;
      return { preview: preview, match: match, yt: yt, ft: ft,
               mine: fighters.filter(function(f){ return f.team===me && !f.you; }).map(function(f){ return f.name; }),
               foes: fighters.filter(function(f){ return f.team!==me; }).map(function(f){ return f.name; }),
               spent: LINEUP_MEMO === null };
    })()`);
    expect(r.match).toBe(r.preview);
    for (const n of r.mine) expect(r.yt, 'the teammate shown is the teammate you get').toContain(n);
    for (const n of r.foes) expect(r.ft, 'the opponents shown are the opponents you get').toContain(n);
    expect(r.spent, 'starting the match spends the memo').toBe(true);
  });

  it('a second preview without a match in between shows the same lineup', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='teams'; SETTINGS.count=4; SETTINGS.teamKey='2v2';
      chosen = ROSTER.find(function(x){ return x.name==='Firey'; });
      LINEUP_MEMO = null;
      refreshTeamChat(); var a = ${lineup};
      refreshTeamChat(); var b = ${lineup};
      return { a: a, b: b };
    })()`);
    expect(r.b).toBe(r.a);
  });

  it('changing the chosen fighter or the split rolls a new lineup', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='teams'; SETTINGS.count=4; SETTINGS.teamKey='2v2';
      chosen = ROSTER.find(function(x){ return x.name==='Firey'; }); LINEUP_MEMO = null;
      refreshTeamChat(); var a = ${lineup}, keyA = LINEUP_MEMO.key;
      chosen = ROSTER.find(function(x){ return x.name==='Leafy'; });
      refreshTeamChat(); var b = ${lineup}, keyB = LINEUP_MEMO.key;
      return { a: a, b: b, keyA: keyA, keyB: keyB };
    })()`);
    expect(r.keyB).not.toBe(r.keyA);
    expect(r.b.startsWith('Leafy:')).toBe(true);
    expect(r.a.startsWith('Firey:')).toBe(true);
  });

  it('a free-for-all still rolls fresh opponents each match', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=5; SETTINGS.items=false;
      chosen = ROSTER.find(function(x){ return x.name==='Firey'; }); LINEUP_MEMO = null;
      var seen = {};
      for (var i=0;i<6;i++){ beginMatchNow(); seen[${lineup}] = true; }
      return Object.keys(seen).length;
    })()`);
    expect(r, 'six matches, more than one lineup').toBeGreaterThan(1);
  });
});
