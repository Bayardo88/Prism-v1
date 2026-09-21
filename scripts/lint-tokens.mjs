/**
 * Token-compliance linter.
 *
 * Enforces the parts of the Scalar token contract a reviewer cannot reliably
 * check by eye:
 *   1. No raw colour literals in the component layer            (rule R1/R2)
 *   2. Every var(--token) reference resolves to a declared token (typos)
 *   3. No raw px in properties that own a scale                  (rule R2)
 *
 * Run: node scripts/lint-tokens.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// Global design tokens, plus the component-local custom properties a component
// declares for itself (--btn-*, --prism-* and friends). Both are legitimate;
// an undeclared reference is the bug this catches.
const declared = new Set();
for (const file of ['src/styles/tokens.css', 'src/styles/components.css', 'src/styles/base.css']) {
  const css = strip(readFileSync(join(root, file), 'utf8'));
  for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:/g)) declared.add(m[1]);
}
const globalTokens = new Set(
  [...strip(readFileSync(join(root, 'src/styles/tokens.css'), 'utf8')).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
);

const errors = [];

/* --- 1 & 3: the component layer ----------------------------------------- */
// Properties that must take a token, with the exceptions the system documents.
const SCALED = /(?:^|[;{\s])(padding|margin|gap|row-gap|column-gap|border-radius|font-size|line-height)\s*:\s*([^;}]+)/g;
// 0 and 1px/2px hairlines are legitimate: border widths, focus rings and the
// -1px clip idiom in .scalar-visually-hidden.
const ALLOWED_PX = new Set(['0', '0px', '1px', '2px', '-1px']);

for (const file of ['src/styles/components.css', 'src/styles/base.css']) {
  const css = strip(readFileSync(join(root, file), 'utf8'));

  for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    errors.push(`${file}: raw colour literal "${m[0]}" — use a semantic token (R1)`);
  }
  for (const m of css.matchAll(/\b(?:rgb|rgba|hsl|hsla)\(/g)) {
    errors.push(`${file}: raw colour function "${m[0]}" — use a semantic token (R1)`);
  }
  for (const m of css.matchAll(SCALED)) {
    const [, prop, rawValue] = m;
    const value = rawValue.trim();
    if (value.includes('var(')) continue;
    const offending = value.split(/\s+/).filter((p) => /\dpx$/.test(p) && !ALLOWED_PX.has(p));
    if (offending.length) {
      errors.push(`${file}: "${prop}: ${value}" — ${offending.join(', ')} should come from a scale token (R2)`);
    }
  }
}

/* --- 2: every reference resolves ---------------------------------------- */
const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const sources = walk(join(root, 'src')).filter((f) => ['.css', '.ts', '.tsx'].includes(extname(f)));

for (const file of sources) {
  const text = readFileSync(file, 'utf8');
  // Require a closing paren or comma so a template literal such as
  // `var(--color-chart-series-${n})` is not read as a static reference.
  for (const m of text.matchAll(/var\(\s*(--[a-z0-9-]+)\s*(\)|,)/g)) {
    if (!declared.has(m[1])) {
      errors.push(`${file.replace(root + '/', '')}: var(${m[1]}) is not a declared token`);
    }
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} token-contract violation(s):\n`);
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}
console.log(
  `✓ token contract clean — ${globalTokens.size} design tokens, ` +
    `${declared.size - globalTokens.size} component-local properties, all references resolve`,
);
