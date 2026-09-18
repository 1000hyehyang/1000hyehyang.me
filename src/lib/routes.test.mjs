import assert from "node:assert/strict";
import test from "node:test";

// Run npm run build and npm run start, then npm run test:routes.
const origin = process.env.TEST_ORIGIN ?? "http://localhost:3000";

test("Resume shows infrastructure criteria only for projects that provide it", async () => {
  const response = await fetch(origin);
  assert.equal(response.status, 200);
  const html = await response.text();
  const articles = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/g) ?? [];
  const realMatch = articles.find((article) => article.includes('/projects/project/real-match"'));
  const udidura = articles.find((article) => article.includes('/projects/project/udidura"'));
  assert.ok(realMatch, "RealMatch remains visible without infrastructure criteria");
  assert.ok(udidura, "Udidura remains visible");
  assert.doesNotMatch(realMatch, /인프라 설계 기준|<dd[^>]*>--<\/dd>/);
  assert.match(udidura, /인프라 설계 기준/);
  assert.match(udidura, /DAU 1,000명/);
});

test("Portfolio home and Projects links, metadata, and removed routes", async () => {
  for (const source of [
    "/portfolio",
    "/portfolio/projects",
    "/portfolio/udidura",
    "/portfolio/projects/real-match",
    "/portfolio/project/udidura",
    "/portfolio/hackathon/xr-makerthon",
    "/about",
    "/blog",
  ]) {
    const response = await fetch(origin + source, { redirect: "manual" });
    assert.equal(response.status, 404, source);
    assert.equal(response.headers.get("location"), null, source);
  }

  const home = await fetch(origin);
  assert.equal(home.status, 200);
  const homeHtml = await home.text();
  assert.match(homeHtml, /href="\/"[^>]*>Portfolio<\/a>/);
  assert.match(homeHtml, /href="\/projects"/);
  assert.doesNotMatch(homeHtml, /href="\/portfolio(?:["/?])/);

  const sitemap = await fetch(origin + "/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
  assert.ok(urls.some((url) => url.pathname === "/projects"));
  assert.ok(urls.some((url) => url.pathname.startsWith("/projects/project/")));
  assert.ok(urls.some((url) => url.pathname.startsWith("/projects/hackathon/")));
  assert.ok(urls.every((url) => !url.pathname.startsWith("/portfolio")));
  assert.ok(urls.every((url) => !url.pathname.startsWith("/cv")));

  const robots = await fetch(origin + "/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Sitemap: https:\/\/www\.1000hyehyang\.me\/sitemap\.xml/);

  for (const url of urls.filter((url) => url.pathname.startsWith("/projects"))) {
    const response = await fetch(origin + url.pathname, { headers: { "User-Agent": "Googlebot" } });
    assert.equal(response.status, 200, url.pathname);
    const html = await response.text();
    assert.ok(html.includes(`rel="canonical" href="${url.href}"`), url.pathname);
    assert.ok(html.includes(`property="og:url" content="${url.href}"`), url.pathname);
    assert.match(html, /property="og:image" content="https:\/\//);
    assert.match(html, /name="twitter:image" content="https:\/\//);
    assert.match(html, /name="robots" content="index, follow"/);
    assert.doesNotMatch(html, /href="\/portfolio(?:["/?])/);
    const structuredData = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((match) => JSON.parse(match[1]));
    assert.ok(structuredData.length > 0);
    assert.ok(!JSON.stringify(structuredData).includes("1000hyehyang.me/portfolio"));

  }
  const filtered = await fetch(origin + "/projects?filter=design");
  assert.equal(filtered.status, 200);
  assert.match(await filtered.text(), /rel="canonical" href="https:\/\/www\.1000hyehyang\.me\/projects"/);
  const cv = await fetch(origin + "/cv");
  assert.equal(cv.status, 404);
  assert.match(cv.headers.get("x-robots-tag"), /noindex/);
  assert.doesNotMatch(await cv.text(), /YEO CHAE HYEON|ducogus12|type="password"/);
  assert.equal((await fetch(origin + "/portfolio/nonexistent-route-check")).status, 404);
});
