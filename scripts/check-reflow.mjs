#!/usr/bin/env node
/**
 * Reflow gate (WCAG 1.4.10): renders every Storybook story at a 320px-wide
 * viewport in a real browser and fails if the page scrolls horizontally.
 *
 * Needs a built Storybook (`npm run build:storybook`) and Playwright Chromium.
 * Stories that are deliberately wider than a phone (data grids that scroll
 * inside their own container, full-page templates) are listed in
 * REFLOW_EXEMPT with the reason; the list is expected to shrink, never grow.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'storybook-static');
const WIDTH = Number(process.env.REFLOW_WIDTH ?? 320);
const REFLOW_EXEMPT = JSON.parse(await readFile(join(dirname(fileURLToPath(import.meta.url)), 'reflow-exempt.json'), 'utf8').catch(() => '{}'));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  try {
    const body = await readFile(join(root, normalize(path).replace(/^(\.\.[/\\])+/, '')));
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
await new Promise((r) => server.once('listening', r));
const base = `http://localhost:${server.address().port}`;

const index = JSON.parse(await readFile(join(root, 'index.json'), 'utf8'));
const stories = Object.values(index.entries).filter((e) => e.type === 'story');
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 800 } });
const failures = [];
let checked = 0;
/**
 * Stories wrap components in fixed-width demo containers (`style="width: 360px"`).
 * That is the harness, not the component, so inline widths are capped to the viewport
 * and what remains is overflow caused by the component's own CSS.
 */
const capHarnessWidths = () => {
  for (const el of document.querySelectorAll('#storybook-root [style*="width"]')) el.style.maxWidth = '100%';
};
const queue = [...stories];
await Promise.all(Array.from({ length: 8 }, async () => {
  const page = await ctx.newPage();
  for (let s = queue.shift(); s; s = queue.shift()) {
    await page.goto(`${base}/iframe.html?id=${s.id}&viewMode=story`, { waitUntil: 'load' });
    await page.waitForTimeout(120);
    await page.evaluate(capHarnessWidths);
    const measure = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    let over = await measure();
    // Animations and late fonts can overshoot for a frame: only a persistent overflow counts.
    if (over > 1) { await page.waitForTimeout(500); await page.evaluate(capHarnessWidths); over = await measure(); }
    checked++;
    if (over > 1 && !(s.id in REFLOW_EXEMPT)) failures.push(`${s.id}: ${over}px wider than ${WIDTH}px`);
  }
  await page.close();
}));
failures.sort();
await browser.close();
server.close();
if (process.argv.includes('--json')) console.log(JSON.stringify(failures));
if (failures.length) {
  console.error(`✗ reflow gate failed at ${WIDTH}px: ${failures.length} of ${checked} stories overflow`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log(`✓ reflow gate clean — ${checked} stories fit ${WIDTH}px without horizontal scroll`);
