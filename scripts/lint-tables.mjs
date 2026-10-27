/**
 * Table linter (AI-GUIDE R15, R16).
 *
 * R15 — no table in the product shows pagination. `DataGrid` and `Table` render
 * every row they are given, and a screen never pages them. This fails on any
 * use of `Pagination` / `PageItem` in product or example code — the only
 * place they could go is under a table.
 *
 * R16 — every table uses the one column header, `ColumnHeader`. This fails on
 * `GridColumnHeader` / `AddColumnHeader` in product or example code; a trailing
 * add-column header is the product's `AddColumn` (a `ColumnHeader
 * kind="action-button"`).
 *
 * The component showcases (examples/screens/Playground.tsx, Gallery.tsx) may
 * render these to document the library. Anything else needs an entry in ALLOW
 * with a reason.
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
  'examples/screens/Playground.tsx': 'component showcase: documents Pagination on its own, under no table',
};
const ALLOW_HEADERS = {
  'examples/screens/Gallery.tsx': 'component showcase: documents the grid-pattern headers on their own',
};

const SCAN = ['apps/product/src', 'examples'];
const errors = [];

function check(rel) {
  const src = readFileSync(join(root, rel), 'utf8');
  src.split('\n').forEach((line, i) => {
    if (!ALLOW[rel] && /<(Pagination|PageItem)([\s>/]|$)|\b(Pagination|PageItem)\b\s*[,}]/.test(line)) {
      errors.push(`${rel}:${i + 1}  Pagination on a table. Tables never paginate (R15) — render every row; bound a long grid with \`maxHeight\`.`);
    }
    if (!ALLOW_HEADERS[rel] && /<(GridColumnHeader|AddColumnHeader)([\s>/]|$)|\b(GridColumnHeader|AddColumnHeader)\b\s*[,}]/.test(line)) {
      errors.push(`${rel}:${i + 1}  Grid-pattern column header. Every table uses \`ColumnHeader\` (R16); a trailing add-column header is \`AddColumn\`.`);
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
console.log('lint-tables: no table shows pagination (R15); every table uses ColumnHeader (R16).');
