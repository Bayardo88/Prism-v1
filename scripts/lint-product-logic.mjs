/**
 * Product-logic linter (AI-GUIDE §11, docs/product/domain-logic.md).
 *
 * Catches the two product-logic mistakes that can be seen in source:
 *
 * - P5 · Empty is not zero. A placeholder `$0` / `$0.00` string or a
 *   `.format(0)` for a value that does not exist yet. Use `displayValue()` or
 *   `ABSENCE_LABEL` from `domain/display.ts`. A *real* zero is marked on its
 *   line with `lint-allow: real-zero`, or a block of them is wrapped in
 *   `// lint-allow-block: real-zero` … `// lint-allow-end`.
 * - P2 · Market date ≠ measurement date. A "Market Date" control fed from
 *   the company's as-of (measurement) date.
 *
 * The domain layer itself (apps/product/src/domain) is not scanned: it defines
 * the absence labels and the tests that use real zeros.
 *
 * Run: node scripts/lint-product-logic.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCAN = ['apps/product/src'];
const SKIP = /^apps\/product\/src\/domain\//;
const errors = [];

const ZERO = /(['"`])\$0(\.0+)?\1|\.format\(\s*0\s*\)/;
const MARKET_FROM_AS_OF = /Market Date[^\n]*\basOf(Iso)?\b/;

function check(rel) {
  const src = readFileSync(join(root, rel), 'utf8');
  let allowBlock = false;
  src.split('\n').forEach((line, i) => {
    if (line.includes('lint-allow-block: real-zero')) { allowBlock = true; return; }
    if (line.includes('lint-allow-end')) { allowBlock = false; return; }
    if (!allowBlock && !line.includes('lint-allow: real-zero') && ZERO.test(line)) {
      errors.push(`${rel}:${i + 1}  Placeholder $0. Empty is not zero (P5): use displayValue() / ABSENCE_LABEL, or mark a real zero with \`lint-allow: real-zero\`.`);
    }
    if (MARKET_FROM_AS_OF.test(line)) {
      errors.push(`${rel}:${i + 1}  Market Date fed from the as-of date. The market date is held apart from the measurement date (P2): read it from useValuationContext().`);
    }
  });
}

// Tracked and new (unignored) files, so the check also runs before a commit.
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', ...SCAN], { cwd: root, encoding: 'utf8' }).split('\n');
for (const rel of new Set(files)) if (['.ts', '.tsx'].includes(extname(rel)) && !SKIP.test(rel) && !rel.endsWith('.test.ts')) check(rel);

if (errors.length) {
  console.error(`lint-product-logic: ${errors.length} problem(s)\n` + errors.map((e) => `  ${e}`).join('\n'));
  process.exit(1);
}
console.log('lint-product-logic: no placeholder zeros, market date held apart (P2, P5).');
