// Steve Cobs's three prize fighters are secret, so no script spells their names: they are read at run time from the game's
// own PZ_CODE (artifacts/V1/index.html: each name spelled backwards, then base64'd) and unscrambled the way its pzName() does.
// hidePz() turns any of them in a string into {PZ_A}, {PZ_B} or {PZ_C}, the game's own constants, for what a script writes or prints.
import { readFileSync } from 'node:fs';

export const PZ_CODE = Object.fromEntries([...readFileSync(new URL('../artifacts/V1/index.html', import.meta.url), 'utf8')
  .match(/PZ_CODE\s*=\s*\{([^}]*)\}/)[1].matchAll(/(\w+)\s*:\s*'([A-Za-z0-9+/=]+)'/g)].map(([, k, v]) => [k, v]));
export const pzName = (code) => Buffer.from(code, 'base64').toString('utf8').split('').reverse().join('');
export const PZ_A = pzName(PZ_CODE.A), PZ_B = pzName(PZ_CODE.B), PZ_C = pzName(PZ_CODE.C);
export const hidePz = (s) => Object.entries(PZ_CODE).reduce((t, [k, code]) =>
  t.replace(new RegExp(`(?<![A-Za-z])${pzName(code)}(?![A-Za-z])`, 'gi'), `{PZ_${k}}`), String(s));
