// IndexNow: tell Bing, Yandex and the other IndexNow engines which pages of the site changed, so they fetch them without waiting for
// a crawl. (Google does not take IndexNow; for Google, submit sitemap.xml in Search Console.)
//
// NOT RUN BY ANY BUILD OR AGENT. The owner runs it by hand, after a deploy has gone live:
//
//   node scripts/indexnow-ping.mjs              -> posts every <loc> of artifacts/V1/sitemap.xml
//   node scripts/indexnow-ping.mjs --dry-run    -> prints what it would post, sends nothing
//
// How IndexNow works: a key file sits on the site at https://smashisland.vercel.app/<key>.txt, holding the key itself (the file is in
// artifacts/V1, so every deploy serves it). This script POSTs { host, key, keyLocation, urlList } to https://api.indexnow.org/indexnow,
// which shares the list with every participating engine. A 200 or 202 means accepted; 422 means the key file did not match; 429 means
// too many pings (once per deploy is plenty). Up to 10,000 URLs a request; the sitemap is far smaller.
//
// Plain Node (fetch is built in since Node 18). No packages.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'artifacts', 'V1');
const HOST = 'smashisland.vercel.app';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const dry = process.argv.includes('--dry-run');

// The key is the one file in artifacts/V1 named <key>.txt whose content is its own name (8-128 chars of a-z, A-Z, 0-9 and -).
const keyFile = readdirSync(SRC).find((f) => /^[A-Za-z0-9-]{8,128}\.txt$/.test(f) && readFileSync(join(SRC, f), 'utf8').trim() === f.slice(0, -4));
if (!keyFile) { console.error('indexnow-ping: no key file in artifacts/V1 (a <key>.txt whose content is the key)'); process.exit(1); }
const key = keyFile.slice(0, -4);

const sitemap = readFileSync(join(SRC, 'sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (!urlList.length) { console.error('indexnow-ping: sitemap.xml has no <loc>'); process.exit(1); }
if (urlList.some((u) => new URL(u).host !== HOST)) { console.error('indexnow-ping: a sitemap URL is not on ' + HOST); process.exit(1); }

const body = { host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList };
console.log(`${urlList.length} URLs, key file /${keyFile}`);
if (dry) { console.log(JSON.stringify(body, null, 2)); process.exit(0); }

const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
console.log(`IndexNow answered ${res.status} ${res.statusText}${res.status === 200 || res.status === 202 ? ': accepted' : ''}`);
if (res.status !== 200 && res.status !== 202) { console.log(await res.text()); process.exit(1); }
