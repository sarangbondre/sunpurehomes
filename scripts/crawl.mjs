/**
 * Link and content integrity crawl — `npm run crawl` against a running site.
 *
 * Checks the §14 acceptance criteria that can only be checked on rendered
 * HTML: no dead links, no placeholder strings, no image without alt text.
 * Exits non-zero on any finding. Wired into CI in Phase 6.
 *
 *   npm run build && npm start &   # or: npm run dev
 *   npm run crawl
 */
const ORIGIN = "http://localhost:3000";
const seen = new Set(), queue = ["/"], problems = [];
const PLACEHOLDER = /lorem ipsum|text inside of a div|NUMBER GOES HERE|\bTBD\b/i;
let pages = 0, internalLinks = 0, externalLinks = new Set(), images = 0;

while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);

  const res = await fetch(ORIGIN + path);
  const html = await res.text();
  pages++;
  if (!res.ok) { problems.push(`${res.status} on ${path}`); continue; }

  if (PLACEHOLDER.test(html)) {
    problems.push(`placeholder string rendered on ${path}: ${html.match(PLACEHOLDER)[0]}`);
  }

  // dead anchors
  for (const m of html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>/g)) {
    const href = m[1];
    if (href === "#" || href === "" ) { problems.push(`href="${href}" on ${path}`); continue; }
    if (href.startsWith("/")) {
      internalLinks++;
      const clean = href.split("#")[0];
      if (!seen.has(clean)) queue.push(clean);
    } else if (/^https?:/.test(href)) externalLinks.add(href);
  }

  // images must carry non-empty alt
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    images++;
    const alt = /alt="([^"]*)"/.exec(m[0]);
    if (!alt || !alt[1].trim()) problems.push(`image without alt on ${path}: ${m[0].slice(0, 90)}`);
  }
}

console.log(`crawled ${pages} pages · ${internalLinks} internal links · ${externalLinks.size} distinct external · ${images} images`);
console.log("\nroutes reached:");
[...seen].sort().forEach(p => console.log("  " + p));
console.log("\nexternal destinations:");
[...externalLinks].sort().forEach(u => console.log("  " + u));
if (problems.length) {
  console.error(`\n${problems.length} PROBLEMS:\n  ` + problems.join("\n  "));
  process.exit(1);
}
console.log("\n✓ no dead links, no placeholder strings, no missing alt");
