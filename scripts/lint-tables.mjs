/**
 * Table pagination linter (AI-GUIDE R15).
 *
 * Every DataGrid and Table renders its own pagination bar, and no prop turns
 * it off. This catches the two ways a screen can still get it wrong:
 *   1. A hand-placed `<Pagination>` in product or example code — it would sit
 *      beside the table's own bar, or replace it with a different one.
 *   2. A tabular element built by hand (`role="table"`, `role="grid"`,
 *      `<table>`) instead of a DataGrid / Table, which skips pagination.
 *
 * The component showcase (examples/screens/Playground.tsx) may render a bare
 * Pagination to document it. Anything else needs an entry in ALLOW with a reason.
 *
 * Run: node scripts/lint-tables.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** path → why it may break the rule. */
const ALLOW = {
  'examples/screens/Playground.tsx': 'component showcase: documents Pagination on its own',
  'examples/screens/Gallery.tsx': 'component showcase: lays grid-pattern cells out on their own',
  'apps/product/src/screens/p04-waterfalls/shared.tsx': 'a FileRow list in a drawer, not a data table',
};

const SCAN = ['apps/product/src', 'examples'];
const errors = [];

function check(rel) {
  if (ALLOW[rel]) return;
  const src = readFileSync(join(root, rel), 'utf8');
  src.split('\n').forEach((line, i) => {
    if (/<Pagination[\s>/]/.test(line)) {
      errors.push(`${rel}:${i + 1}  hand-placed <Pagination>. DataGrid and Table paginate themselves — pass \`pagination={{ … }}\` to the table instead (R15).`);
    }
    if (/role=["'](table|grid)["']|<table[\s>]/.test(line)) {
      errors.push(`${rel}:${i + 1}  hand-built table. Use DataGrid or Table, which always paginate (R15).`);
    }
  });
}

// Tracked files only: the check is about what the repo ships, not local scratch work.
const tracked = execFileSync('git', ['ls-files', ...SCAN], { cwd: root, encoding: 'utf8' }).split('\n');
for (const rel of tracked) if (['.tsx', '.jsx'].includes(extname(rel))) check(rel);

if (errors.length) {
  console.error(`lint-tables: ${errors.length} problem(s)\n` + errors.map((e) => `  ${e}`).join('\n'));
  process.exit(1);
}
console.log('lint-tables: every table paginates through DataGrid / Table (R15).');
