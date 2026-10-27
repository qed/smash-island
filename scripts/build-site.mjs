// The website's copy of the game, with the code notes taken out ("Yes, strip for players", the owner, 2026-10-27).
//
// Vercel runs this as the deploy's build step (vercel.json: buildCommand) and serves what it writes (outputDirectory site-dist).
// It copies artifacts/V1 to site-dist/ and, in every .html file there, removes the comments: // and /* */ in the inline
// JavaScript, /* */ in <style>, and <!-- --> in the page itself. The source, artifacts/V1/index.html, keeps every note: the
// desktop build (electron/) and the jsdom tools read that file and never this copy.
//
// Nothing but comments goes. Every string, template literal (with its ${...}), regular expression, the JSON-LD block and the
// other files are left exactly as they are, and every line break stays (a line keeps its number, so a line named in an error
// banner on the site is the same line in the source, and no comment removal can join two lines -- ASI). A /*! or @license or
// @preserve comment is kept. Line endings become LF, which is what the browser turns CRLF into anyway.
//
// Plain Node with no packages, on purpose: the deploy installs nothing (installCommand ""). So the comments are found by the
// small tokenizer below, not by a minifier, and the build checks its own work before it writes the folder: each stripped script
// must give the same token stream as the original (only the comments gone), keep its line count, and still compile (node:vm);
// otherwise the build fails and Vercel keeps serving the last good deploy.
//
// The online same-version check hashes the game script's own text (gameBuild), and taking the notes out changes that text. So
// the build works out the hash of the FULL script with the game's own buildHash and stamps it on the tag (data-build), and
// gameBuild uses the stamp when it is there: the site, the desktop build and the source all report the same build.
//
//   node scripts/build-site.mjs              -> site-dist/ (emptied first)
//   node scripts/build-site.mjs --out <dir>  -> another folder (emptied first; must not be the source or the repo itself)

import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, sep, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'artifacts', 'V1');

// ---- JavaScript ------------------------------------------------------------------------------------------------------------

const KW_BEFORE_EXPR = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do',
  'else', 'yield', 'await', 'extends']);
const P4 = new Set(['>>>=']);
const P3 = new Set(['...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=']);
const P2 = new Set(['=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '%=', '&=', '|=', '^=',
  '<<', '>>', '**']);
const TPL = 0, BLOCK = 1, EXPR = 2;   // what an open { is: a template's ${, a block, or an expression (object literal)

function isWs(c) {
  return c === 32 || c === 9 || c === 10 || c === 13 || c === 11 || c === 12 || c === 0xa0 || c === 0xfeff || c === 0x2028
    || c === 0x2029 || c === 0x1680 || (c >= 0x2000 && c <= 0x200a) || c === 0x202f || c === 0x205f || c === 0x3000;
}
function isIdStart(c) {
  return (c >= 97 && c <= 122) || (c >= 65 && c <= 90) || c === 36 || c === 95 || c === 92 || (c >= 128 && !isWs(c));
}
function isIdPart(c) { return isIdStart(c) || (c >= 48 && c <= 57); }
function isDigit(c) { return c >= 48 && c <= 57; }
function isHex(c) { return isDigit(c) || (c >= 97 && c <= 102) || (c >= 65 && c <= 70) || c === 95; }
function lineOf(s, i) { let n = 1; for (let k = s.indexOf('\n'); k >= 0 && k < i; k = s.indexOf('\n', k + 1)) n++; return n; }
function keepBlock(text) { return text.startsWith('/*!') || text.includes('@license') || text.includes('@preserve'); }
function keepLine(text) { return /^\/\/[#@] source(MappingURL|URL)=/.test(text); }

// Walks a script and returns its comments (the ones to remove, and how many are kept) plus a signature of everything else: the
// exact text of every token in order. Strings, template literals and regular expressions are read whole, so nothing inside them
// is ever taken for a comment. The one guess a tokenizer without a parser has to make -- is this / a regular expression or a
// division? -- follows the previous token, with ( ) and { } tracked so `if (x) /re/` and `{...} / 2` read right; a wrong guess
// cannot slip through, because the stripped script must match the original token for token and compile.
export function scanJS(src) {
  const n = src.length, spans = [];
  let kept = 0, ntok = 0, h1 = 0x811c9dc5 | 0, h2 = 0x01000193 | 0;
  const tok = (type, s, e) => {
    ntok++;
    h1 = Math.imul(h1 ^ type, 16777619); h2 = Math.imul(h2 ^ type, 2246822507);
    for (let k = s; k < e; k++) { const c = src.charCodeAt(k); h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ c, 2246822507); }
    h1 = Math.imul(h1 ^ 0x1f, 16777619); h2 = Math.imul(h2 ^ 0x1f, 2246822507);
  };
  const fail = (what, at) => { throw new Error(`${what} at script line ${lineOf(src, at)}`); };
  let pt = 0, pv = '', pre = false, pdot = false;   // previous token: 0 none / 1 punctuator / 2 name / 3 literal; its text;
  const parens = [], braces = [];                   // "a regex may follow" (for ) and }); a name right after . or ?.
  const regexOK = () => {
    if (pt === 0) return true;
    if (pt === 1) {
      if (pv === ')' || pv === '}') return pre;
      return !(pv === ']' || pv === '++' || pv === '--');
    }
    if (pt === 2) return !pdot && KW_BEFORE_EXPR.has(pv);
    return false;
  };
  const exprBrace = () => {
    if (pt === 1) return !(pv === ')' || pv === ']' || pv === '}' || pv === ';' || pv === '=>' || pv === '{');
    if (pt === 2) return !pdot && KW_BEFORE_EXPR.has(pv) && pv !== 'else' && pv !== 'do';
    return false;
  };
  // A template's text from j (just after ` or after the } that closes a ${...}): returns where the main loop carries on.
  const template = (j) => {
    const s = j;
    for (;;) {
      if (j >= n) fail('unterminated template literal', s);
      const c = src.charCodeAt(j);
      if (c === 92) { j += 2; continue; }
      if (c === 96) { tok(5, s, j); pt = 3; return j + 1; }
      if (c === 36 && src.charCodeAt(j + 1) === 123) { tok(6, s, j); braces.push(TPL); pt = 1; pv = '${'; return j + 2; }
      j++;
    }
  };
  let i = 0;
  while (i < n) {
    const c = src.charCodeAt(i);
    if (isWs(c)) { i++; continue; }
    if (c === 47) {                                                     // /
      const d = src.charCodeAt(i + 1);
      if (d === 47) {                                                   // // comment, up to the line's end
        let j = i + 2;
        while (j < n) { const e = src.charCodeAt(j); if (e === 10 || e === 13 || e === 0x2028 || e === 0x2029) break; j++; }
        if (keepLine(src.slice(i, j))) kept++; else spans.push([i, j]);
        i = j; continue;
      }
      if (d === 42) {                                                   // /* comment */
        const k = src.indexOf('*/', i + 2); if (k < 0) fail('unterminated comment', i);
        if (keepBlock(src.slice(i, k + 2))) kept++; else spans.push([i, k + 2]);
        i = k + 2; continue;
      }
      if (regexOK()) {                                                  // a regular expression literal
        let j = i + 1, cls = false;
        for (;;) {
          if (j >= n) fail('unterminated regular expression', i);
          const e = src.charCodeAt(j);
          if (e === 92) { j += 2; continue; }
          if (e === 10 || e === 13 || e === 0x2028 || e === 0x2029) fail('line break in what was read as a regular expression', i);
          if (e === 91) cls = true; else if (e === 93) cls = false; else if (e === 47 && !cls) { j++; break; }
          j++;
        }
        while (j < n && isIdPart(src.charCodeAt(j))) j++;
        tok(4, i, j); pt = 3; i = j; continue;
      }
      const j = d === 61 ? i + 2 : i + 1;                               // / or /=
      tok(1, i, j); pt = 1; pv = src.slice(i, j); i = j; continue;
    }
    if (c === 39 || c === 34) {                                         // 'string' or "string"
      let j = i + 1;
      for (;;) {
        if (j >= n) fail('unterminated string', i);
        const e = src.charCodeAt(j);
        if (e === 92) { j += 2; continue; }
        if (e === c) { j++; break; }
        if (e === 10 || e === 13) fail('line break in a string', i);
        j++;
      }
      tok(3, i, j); pt = 3; i = j; continue;
    }
    if (c === 96) { i = template(i + 1); continue; }                    // `template`
    if (c === 125) {                                                    // }
      if (!braces.length) fail('unbalanced }', i);
      const b = braces.pop();
      if (b === TPL) { i = template(i + 1); continue; }
      tok(1, i, i + 1); pt = 1; pv = '}'; pre = b === BLOCK; i++; continue;
    }
    if (c === 123) { braces.push(exprBrace() ? EXPR : BLOCK); tok(1, i, i + 1); pt = 1; pv = '{'; i++; continue; }
    if (c === 40) {                                                     // ( : after if/while/for/with, a regex may follow its )
      parens.push(pt === 2 && !pdot && (pv === 'if' || pv === 'while' || pv === 'for' || pv === 'with'));
      tok(1, i, i + 1); pt = 1; pv = '('; i++; continue;
    }
    if (c === 41) {
      if (!parens.length) fail('unbalanced )', i);
      pre = parens.pop(); tok(1, i, i + 1); pt = 1; pv = ')'; i++; continue;
    }
    if (isIdStart(c) || c === 35) {                                     // a name, a keyword, or a #private name
      let j = i + 1;
      while (j < n) { const e = src.charCodeAt(j); if (e === 92) { j += 2; continue; } if (!isIdPart(e)) break; j++; }
      tok(2, i, j);
      pdot = pt === 1 && (pv === '.' || pv === '?.');
      pt = c === 35 ? 3 : 2; pv = src.slice(i, j); i = j; continue;
    }
    if (isDigit(c) || (c === 46 && isDigit(src.charCodeAt(i + 1)))) {   // a number
      let j = i;
      const x = src.charCodeAt(i + 1);
      if (c === 48 && (x === 120 || x === 88 || x === 111 || x === 79 || x === 98 || x === 66)) {
        j = i + 2; while (j < n && isHex(src.charCodeAt(j))) j++;
      } else {
        while (j < n && (isDigit(src.charCodeAt(j)) || src.charCodeAt(j) === 95)) j++;
        if (src.charCodeAt(j) === 46) { j++; while (j < n && (isDigit(src.charCodeAt(j)) || src.charCodeAt(j) === 95)) j++; }
        const e = src.charCodeAt(j);
        if (e === 101 || e === 69) {
          let k = j + 1; const sg = src.charCodeAt(k); if (sg === 43 || sg === 45) k++;
          if (isDigit(src.charCodeAt(k))) { j = k; while (j < n && (isDigit(src.charCodeAt(j)) || src.charCodeAt(j) === 95)) j++; }
        }
      }
      if (src.charCodeAt(j) === 110) j++;                               // BigInt n
      tok(3, i, j); pt = 3; i = j; continue;
    }
    let len = 1;                                                        // a punctuator, longest first
    if (P4.has(src.substr(i, 4))) len = 4;
    else if (P3.has(src.substr(i, 3))) len = 3;
    else if (P2.has(src.substr(i, 2)) && !(c === 63 && src.charCodeAt(i + 1) === 46 && isDigit(src.charCodeAt(i + 2)))) len = 2;
    const p = src.substr(i, len);
    if (p === '<' && src.startsWith('<!--', i)) fail('an HTML-style <!-- comment in the code', i);
    if (p === '--' && src.charCodeAt(i + 2) === 62) {
      let k = i; while (k > 0 && (src.charCodeAt(k - 1) === 32 || src.charCodeAt(k - 1) === 9)) k--;
      if (k === 0 || src.charCodeAt(k - 1) === 10) fail('an HTML-style --> comment in the code', i);
    }
    tok(1, i, i + len); pt = 1; pv = p; i += len;
  }
  if (braces.length) fail('unclosed { or ${', n);
  if (parens.length) fail('unclosed (', n);
  return { spans, kept, ntok, sig: (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16) };
}

// ---- CSS -------------------------------------------------------------------------------------------------------------------

function isCssName(c) { return isIdPart(c) || c === 45; }
export function scanCSS(src) {
  const n = src.length, spans = [];
  let kept = 0, i = 0;
  while (i < n) {
    const c = src.charCodeAt(i);
    if (c === 47 && src.charCodeAt(i + 1) === 42) {
      const k = src.indexOf('*/', i + 2); if (k < 0) throw new Error(`unterminated CSS comment at style line ${lineOf(src, i)}`);
      if (keepBlock(src.slice(i, k + 2))) kept++; else spans.push([i, k + 2]);
      i = k + 2; continue;
    }
    if (c === 34 || c === 39) {
      let j = i + 1;
      while (j < n) { const e = src.charCodeAt(j); if (e === 92) { j += 2; continue; } j++; if (e === c || e === 10) break; }
      i = j; continue;
    }
    if ((c === 117 || c === 85) && /^url\(/i.test(src.substr(i, 4)) && !(i > 0 && isCssName(src.charCodeAt(i - 1)))) {
      let j = i + 4; while (j < n && isWs(src.charCodeAt(j))) j++;
      const q = src.charCodeAt(j);
      if (q !== 34 && q !== 39) { const k = src.indexOf(')', j); i = k < 0 ? n : k + 1; continue; }   // url(unquoted) is one token
      i = j; continue;
    }
    i++;
  }
  return { spans, kept };
}
// What a style sheet says once its comments are gone (a comment stands for nothing, as in CSS itself) and every run of white space
// counts as one: the stripped sheet must say the same.
function cssSig(src) {
  const { spans } = scanCSS(src);
  let out = '', pos = 0;
  for (const [s, e] of spans) { out += src.slice(pos, s); pos = e; }
  return (out + src.slice(pos)).replace(/\s+/g, ' ').trim();
}

// ---- Taking the comments out -------------------------------------------------------------------------------------------------

const isH = (ch) => ch === ' ' || ch === '\t';
// Applies edits in order. {s, e, rep} replaces s..e with rep. {s, e, nl, mode} is a comment (or a run of comments with only spaces
// between them) holding nl line breaks, replaced by what keeps the meaning and the line count:
//   alone on its line   -> the line stays, empty            trailing a line -> gone with the spaces before it
//   before code         -> gone with the spaces after it    mid-line        -> one space (or its line breaks)
// For CSS and HTML a comment sitting between two characters with no space around it is different: there it separates nothing in
// HTML (removed outright) and in CSS it is removed only next to punctuation, else kept, so no two words ever join.
function applyEdits(text, edits) {
  const out = []; let pos = 0, tail = '\n', lost = 0;
  const push = (s) => { if (s.length) { out.push(s); tail = s[s.length - 1]; } };
  const n = text.length;
  for (const g of edits) {
    if (g.rep !== undefined) { push(text.slice(pos, g.s)); push(g.rep); pos = g.e; continue; }
    let ls = g.s; while (ls > pos && isH(text[ls - 1])) ls--;
    let le = g.e; while (le < n && isH(text[le])) le++;
    const before = ls > pos ? text[ls - 1] : tail, after = le < n ? text[le] : '\n';
    const NL = '\n'.repeat(g.nl);
    let from = ls, to = le, rep;
    if (after === '\n') rep = NL;                                       // alone on its line, or trailing one
    else if (before === '\n') { from = g.s; rep = NL; }                 // before code: the indentation stays
    else if (g.mode === 'js' || ls < g.s || le > g.e) rep = NL || ' ';  // mid-line, with space around it (or JS: always a gap)
    else if (g.mode === 'html' && before !== '<') { rep = ''; lost += g.nl; }
    else if (g.mode === 'css' && /[{};:,>()[\]]/.test(before + after) && !/[/*]/.test(before + after)) { rep = ''; lost += g.nl; }
    else { from = g.s; to = g.e; rep = text.slice(g.s, g.e); }         // would join two words: keep this one
    push(text.slice(pos, from)); push(rep); pos = to;
  }
  push(text.slice(pos));
  return { text: out.join(''), lost };
}
// Comment spans -> edits, a run of comments with only spaces between them being one edit.
function spansToEdits(text, spans, mode) {
  const edits = [];
  for (const [s, e] of spans) {
    let nl = 0; for (let k = text.indexOf('\n', s); k >= 0 && k < e; k = text.indexOf('\n', k + 1)) nl++;
    const last = edits[edits.length - 1];
    if (last && /^[ \t]*$/.test(text.slice(last.e, s))) { last.e = e; last.nl += nl; } else edits.push({ s, e, nl, mode });
  }
  return edits;
}
const countNL = (s) => { let c = 0; for (let k = s.indexOf('\n'); k >= 0; k = s.indexOf('\n', k + 1)) c++; return c; };

export function stripJS(src, label = 'script') {
  const a = scanJS(src);
  const { text } = applyEdits(src, spansToEdits(src, a.spans, 'js'));
  const b = scanJS(text);   // the checks: same tokens, no comment left but the kept ones, same lines
  if (b.ntok !== a.ntok || b.sig !== a.sig) throw new Error(`${label}: the stripped script's tokens differ from the original's`);
  if (b.spans.length || b.kept !== a.kept) throw new Error(`${label}: comments are left after stripping`);
  if (countNL(text) !== countNL(src)) throw new Error(`${label}: the line count changed`);
  return { text, removed: a.spans.length, kept: a.kept, tokens: a.ntok };
}
export function stripCSS(src, label = 'style') {
  const a = scanCSS(src);
  const { text, lost } = applyEdits(src, spansToEdits(src, a.spans, 'css'));
  if (cssSig(text) !== cssSig(src)) throw new Error(`${label}: the stripped style sheet differs from the original`);
  const left = scanCSS(text).spans.length;
  return { text, removed: a.spans.length - left, kept: a.kept + left, lost };
}

// ---- The page ----------------------------------------------------------------------------------------------------------------

const RAW = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript', 'plaintext']);
const JS_TYPES = new Set(['', 'module', 'text/javascript', 'application/javascript', 'text/ecmascript', 'application/ecmascript',
  'application/x-javascript', 'application/x-ecmascript', 'text/jscript', 'text/livescript', 'text/x-javascript',
  'text/x-ecmascript', 'text/javascript1.0', 'text/javascript1.1', 'text/javascript1.2', 'text/javascript1.3',
  'text/javascript1.4', 'text/javascript1.5']);
function attr(tag, name) {
  const m = new RegExp(`[\\s"']${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))|[\\s"']${name}(?=[\\s/>])`, 'i').exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : null;
}

// The hash gameBuild would make of this script's text, made by the game's own buildHash and alphabet (so the two can never drift
// apart). null if the game has no such function or does not read a stamp -- then no stamp, and the site's pages hash the text.
function buildStamp(js) {
  if (!js.includes("getAttribute('data-build')")) return null;
  const fn = /\nfunction buildHash\(s\)\{[\s\S]*?\n\}/.exec(js), abc = /\nconst BUILD_ABC = ("[^"\n]*");/.exec(js);
  if (!fn || !abc) return null;
  try {
    const id = vm.runInNewContext(`const BUILD_ABC = ${abc[1]};${fn[0]}\nbuildHash(SRC)`, { SRC: js }, { timeout: 20000 });
    return /^[BCDFGHJKMNPQRSTVWXYZ23456789]{8}$/.test(id) ? id : null;
  } catch { return null; }
}

// One .html file -> its stripped text and what was done. `stamp`: stamp the first inline classic script (the game's: gameBuild's own
// rule, !src && !type) with its full-text build hash.
export function stripHtml(input, label = 'page', { stamp = true } = {}) {
  const src = input.replace(/\r\n?/g, '\n');
  const n = src.length, edits = [], notes = [];
  const st = { htmlComments: 0, jsComments: 0, cssComments: 0, kept: 0, scripts: 0, styles: 0, linesLost: 0, build: null };
  let stamped = false, i = 0;
  const comment = (s, e) => {
    st.htmlComments++;
    const nl = countNL(src.slice(s, e)), last = edits[edits.length - 1];
    if (last && last.mode === 'html' && /^[ \t]*$/.test(src.slice(last.e, s))) { last.e = e; last.nl += nl; }
    else edits.push({ s, e, nl, mode: 'html' });
  };
  while (i < n) {
    i = src.indexOf('<', i); if (i < 0) break;
    if (src.startsWith('<!--', i)) {
      let e;
      if (src.startsWith('<!-->', i)) e = i + 5; else if (src.startsWith('<!--->', i)) e = i + 6;
      else { const k = src.indexOf('-->', i + 4); if (k < 0) throw new Error(`${label}: unterminated <!-- at line ${lineOf(src, i)}`); e = k + 3; }
      const body = src.slice(i, e);
      if (/^<!--\[if|<!\[endif\]-->$/i.test(body) || keepBlock(body.replace(/^<!--/, '/*'))) st.kept++; else comment(i, e);
      i = e; continue;
    }
    if (src.startsWith('<!', i) || src.startsWith('<?', i) || src[i + 1] === '/') {   // doctype, bogus comment, end tag
      const k = src.indexOf('>', i); i = k < 0 ? n : k + 1; continue;
    }
    if (!/[A-Za-z]/.test(src[i + 1] || '')) { i++; continue; }
    let j = i + 1; while (j < n && !/[\s/>]/.test(src[j])) j++;
    const name = src.slice(i + 1, j).toLowerCase();
    let k = j, q = null, eq = false;                                    // the end of the start tag, quotes honoured
    for (; k < n; k++) {
      const ch = src[k];
      if (q) { if (ch === q) q = null; continue; }
      if (ch === '>') break;
      if ((ch === '"' || ch === "'") && eq) q = ch;
      if (ch === '=') eq = true; else if (!/\s/.test(ch)) eq = false;
    }
    const tagEnd = k + 1, tag = src.slice(i, tagEnd);
    if (!RAW.has(name)) { i = tagEnd; continue; }
    const close = new RegExp(`</${name}[\\s/>]`, 'ig'); close.lastIndex = tagEnd;
    const m = close.exec(src), cEnd = m ? m.index : n, body = src.slice(tagEnd, cEnd);
    const type = attr(tag, 'type'), isJS = attr(tag, 'src') === null && JS_TYPES.has((type || '').trim().toLowerCase());
    if (name === 'script' && isJS && body.trim()) {
      if (body.includes('<!--')) {                                      // the HTML parser's escaped-script rules: leave it be
        notes.push(`script at line ${lineOf(src, tagEnd)} left as it is (it holds "<!--")`);
      } else {
        const where = `${label} script at line ${lineOf(src, tagEnd)}`;
        const r = stripJS(body, where);
        let compiled = true;
        if (!/module/i.test(type || '')) {                              // node:vm compiles classic scripts (not modules)
          try { new vm.Script(body); } catch { compiled = false; notes.push(`${where}: the original does not compile in Node; compile check skipped`); }
          if (compiled) { try { new vm.Script(r.text); } catch (err) { throw new Error(`${where}: the stripped script does not compile: ${err.message}`); } }
        }
        const id = stamp && !stamped && (type === null || type === '') ? buildStamp(body) : null;
        if (id) {                                                       // the game's own script: document.currentScript in gameBuild
          if (attr(tag, 'data-build') !== null) throw new Error(`${where}: already has data-build`);
          stamped = true; st.build = id;
          edits.push({ s: tagEnd - 1, e: tagEnd - 1, rep: ` data-build="${id}"` });
        } else if (/function gameBuild\(/.test(body)) {
          notes.push(`${where}: no build stamp (no buildHash, or gameBuild does not read data-build); the site hashes the stripped text`);
        }
        edits.push({ s: tagEnd, e: cEnd, rep: r.text });
        st.scripts++; st.jsComments += r.removed; st.kept += r.kept;
      }
    } else if (name === 'style' && body.trim()) {
      const r = stripCSS(body, `${label} style at line ${lineOf(src, tagEnd)}`);
      edits.push({ s: tagEnd, e: cEnd, rep: r.text });
      st.styles++; st.cssComments += r.removed; st.kept += r.kept; st.linesLost += r.lost;
    }
    i = cEnd;
  }
  const { text, lost } = applyEdits(src, edits);
  st.linesLost += lost;
  return { text, stats: st, notes, changed: st.htmlComments + st.jsComments + st.cssComments > 0 || !!st.build };
}

// ---- The folder --------------------------------------------------------------------------------------------------------------

function* walk(dir) {
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, d.name);
    if (d.isDirectory()) yield* walk(p); else if (d.isFile()) yield p;
  }
}
const gz = (b) => gzipSync(b, { level: 9 }).length;
const kb = (x) => (x / 1024).toFixed(1) + ' KB';

export function buildSite(out, { log = console.log } = {}) {
  out = resolve(out);
  const within = (a, b) => { const r = relative(b, a); return r === '' || (!r.startsWith('..') && !isAbsolute(r)); };
  if (within(out, SRC) || within(SRC, out) || within(ROOT, out)) throw new Error(`refusing to build into ${out} (it would hold or be the source)`);
  // Everything is made and checked in memory first; the folder is only touched once every page has passed.
  const files = [];
  for (const p of walk(SRC)) {
    const rel = relative(SRC, p), raw = readFileSync(p);
    if (!/\.html?$/i.test(p)) { files.push({ rel, src: p }); continue; }
    const res = stripHtml(raw.toString('utf8'), rel.split(sep).join('/'));
    if (!res.changed) { files.push({ rel, src: p }); continue; }
    const data = Buffer.from(res.text, 'utf8');
    files.push({ rel, data });
    const s = res.stats;
    log(`${rel}: ${kb(raw.length)} -> ${kb(data.length)} raw, ${kb(gz(raw))} -> ${kb(gz(data))} gzip `
      + `(removed ${s.jsComments} JS, ${s.cssComments} CSS, ${s.htmlComments} HTML comments; kept ${s.kept}`
      + `${s.linesLost ? `; ${s.linesLost} line breaks went with mid-text comments` : '; every line kept'}`
      + `${s.build ? `; build ${s.build.slice(0, 4)}-${s.build.slice(4)}` : ''})`);
    for (const note of res.notes) log(`  note: ${note}`);
  }
  rmSync(out, { recursive: true, force: true });
  for (const f of files) {
    const dest = join(out, f.rel);
    mkdirSync(dirname(dest), { recursive: true });
    if (f.data) writeFileSync(dest, f.data); else copyFileSync(f.src, dest);
  }
  log(`site: ${files.length} files -> ${relative(ROOT, out) || out}`);
  return files;
}

const same = (a, b) => (process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b);
if (process.argv[1] && same(fileURLToPath(import.meta.url), resolve(process.argv[1]))) {
  const k = process.argv.indexOf('--out');
  const out = k > 0 && process.argv[k + 1] ? resolve(process.argv[k + 1]) : join(ROOT, 'site-dist');
  if (!existsSync(join(SRC, 'index.html'))) { console.error('build-site: artifacts/V1/index.html not found'); process.exit(1); }
  try { buildSite(out); } catch (err) { console.error('build-site FAILED: ' + err.message); process.exit(1); }
}
