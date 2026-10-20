// node --test campus/test/basecamp.test.mjs  — checks the base camp map and the back-link script (Sion's Tab agent)
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const root = new URL("../../", import.meta.url).pathname;
const html = fs.readFileSync(root + "index.html", "utf8");
const js = fs.readFileSync(root + "public/ghf-lang/basecamp.js", "utf8");
const lang = fs.readFileSync(root + "public/ghf-lang/ghf-lang.js", "utf8");
const stops = JSON.parse(fs.readFileSync(root + "campus/basecamp_stops.json", "utf8")).stops;
const BANNED = /\b(says|claims|according to|hearsay|unverified|alleged|allegedly|family account|family's account|family testimony)\b/i;
test("map: viewport, title, start and end", () => {
  assert.match(html, /<meta name="viewport" content="width=device-width/);
  assert.match(html, /<title>Cedwyn Estate/);
  assert.equal(stops[0].url, "https://greathousefarmwiki.wordpress.com/");
  assert.equal(stops.at(-1).key, "shop");
  for (const s of stops) assert.ok(html.includes(`data-stop="${s.n}"`), "stop " + s.n);
  assert.match(html, /id="shop"/);
  assert.match(html, /bucklerfamily\.estate\/ebook\//);
  assert.match(html, /ebooks\.bucklerfamily\.estate/);
  assert.match(html, /Our case, prospective\. Not a finding of any court\./);
  assert.match(html, /payment_status=/, "Stripe return forward kept");
  assert.match(html, /href="\/campus\/"/, "old campus reachable");
});
test("rules: banned words, privacy, no personal name", () => {
  for (const t of [html, js, JSON.stringify(stops)]) {
    assert.doesNotMatch(t, BANNED);
    assert.doesNotMatch(t, /Robin Hill|hywelapbuckler|7845 ?933262|@(gmail|hotmail|yahoo|outlook|icloud|btinternet|aol)\./i);
    assert.doesNotMatch(t.replace(/Sion's Tab agent/g, ""), /\bSion\b/);
    assert.doesNotMatch(t, /\.pdf\b/i);
  }
});
test("back link: script loaded by ghf-lang, guards and skips the root", () => {
  assert.match(lang, /basecamp\.js/);
  assert.match(js, /window\.GHFBasecamp/);
  assert.match(js, /Back to Cedwyn Estate/);
  assert.match(js, /path === "\/"/);
  assert.ok(fs.existsSync(root + "campus/index.html"), "campus moved, not deleted");
  assert.match(fs.readFileSync(root + "public/_redirects", "utf8"), /^\/basecamp\.js \/ghf-lang\/basecamp\.js 200$/m);
});
test("no placeholder text", () => { assert.doesNotMatch(html, /lorem|TODO|FIXME|\{\{/i); });
