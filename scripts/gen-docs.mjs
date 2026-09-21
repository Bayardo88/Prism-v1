/** Generates docs/tokens.md from src/tokens/tokens.json. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const t = JSON.parse(readFileSync(join(root, 'src/tokens/tokens.json'), 'utf8'));

const swatch = (hex) => `\`${hex}\``;
const rows = (entries) => entries.map(([k, v]) => `| \`${k}\` | ${swatch(v.light)} | ${swatch(v.dark)} |`).join('\n');

const group = (prefix, exclude = []) =>
  Object.entries(t.color)
    .filter(([k]) => k.startsWith(prefix) && !exclude.some((e) => k.startsWith(e)))
    .sort(([a], [b]) => a.localeCompare(b));

const section = (title, prefix, note, exclude) => {
  const entries = group(prefix, exclude);
  return `### ${title}\n\n${note ? note + '\n\n' : ''}| Token | Light | Dark |\n|---|---|---|\n${rows(entries)}\n`;
};

const scaleTable = (prefix, title) => {
  const entries = Object.entries(t.scales).filter(([k]) => k.startsWith(prefix));
  if (!entries.length) return '';
  return `### ${title}\n\n| Token | Value |\n|---|---|\n${entries
    .map(([k, v]) => `| \`${k}\` | \`${v}\` |`)
    .join('\n')}\n`;
};

const typeRoles = ['display', 'heading', 'text', 'label', 'link', 'overline'];
const typeTable = () => {
  const d = t.type.desktop;
  const dl = t.type['desktop-large'];
  const m = t.type.mobile;
  const out = [];
  for (const role of typeRoles) {
    const steps = Object.keys(d)
      .filter((k) => k.startsWith(`--font-size-${role}-`))
      .map((k) => k.replace(`--font-size-${role}-`, ''));
    out.push(`#### ${role[0].toUpperCase()}${role.slice(1)}\n`);
    out.push('| Step | Desktop (1440) | Desktop Large (1920) | Mobile (393) | Tracking |');
    out.push('|---|---|---|---|---|');
    for (const s of steps) {
      const f = (src) => `${src[`--font-size-${role}-${s}`]}/${src[`--line-height-${role}-${s}`]}`;
      out.push(
        `| \`${s}\` | ${f(d)} | ${f(dl)} | ${f(m)} | ${d[`--letter-spacing-${role}-${s}`]} |`,
      );
    }
    out.push('');
  }
  return out.join('\n');
};

const primitiveFamilies = {};
for (const [k, v] of Object.entries(t.primitives)) {
  const family = k.replace('--primitive-', '').split('-')[0];
  (primitiveFamilies[family] ??= []).push([k, v]);
}

const md = `# Scalar Design System — Token Reference

> Generated from \`src/tokens/tokens.json\`, which is generated from
> \`src/styles/tokens.css\`, which was extracted from the live Figma library
> \`${t.meta.source.tokens}\`.
> **Do not hand-edit.** Run \`npm run gen:tokens && node scripts/gen-docs.mjs\`.

- **${Object.keys(t.color).length}** semantic colour tokens (Light + Dark)
- **${Object.keys(t.primitives).length}** primitive colour steps (reference only)
- **${Object.keys(t.scales).length}** scale, elevation and motion tokens
- **${Object.keys(t.type.desktop).length}** typography tokens × 3 viewport modes

---

## 1. Semantic colour

Every token below responds to the theme. Use these, never the primitives.

${section('Text', '--color-text-', 'On a filled surface always use an `on*` token — `text-primary` on a fill is a contrast bug (rule R3).')}
${section('Background', '--color-bg-')}
${section('Stroke', '--color-stroke-', '`default`, `subtle` and `divider` are non-interactive container edges. Anything clickable, focusable or typable takes `control` (rule R5).')}
${section('Icon', '--color-icon-')}
${section('Overlay & shadow', '--color-overlay-')}
${section('Shadow', '--color-shadow-')}
${section('Chart', '--color-chart-', '⚠️ Series 2 and Series 3 separate by only ΔE 4.9 under deuteranopia in Light. Charts using both must carry direct labels or texture.')}

### PRISM

Semantic colour for **what an item represents** — never access, availability or
permission (rule R11). \`primary\` is graphic only, \`background\` is the tint,
\`text\` is the only member safe for small text.

| Token | Light | Dark |
|---|---|---|
${Object.entries(t.color)
  .filter(([k]) =>
    ['--color-entity-', '--color-data-', '--color-destination-', '--color-command-', '--color-utility-'].some((p) =>
      k.startsWith(p),
    ),
  )
  .map(([k, v]) => `| \`${k}\` | ${swatch(v.light)} | ${swatch(v.dark)} |`)
  .join('\n')}

---

## 2. Scales

${scaleTable('--space-', 'Spacing — gap and padding only')}
${scaleTable('--radius-', 'Radius')}
${scaleTable('--size-', 'Sizing — width and height only')}
${scaleTable('--breakpoint-', 'Breakpoints')}
${scaleTable('--elevation-', 'Elevation')}
${scaleTable('--border-width-', 'Border width')}
${scaleTable('--duration-', 'Motion — duration')}
${scaleTable('--easing-', 'Motion — easing')}
${scaleTable('--z-', 'Z-index ladder')}

---

## 3. Typography

Three modes (rule R6). Desktop is the default. Weight is orthogonal to size
(R7). The floor is 12px (R10).

Values are \`size/line-height\` in px.

${typeTable()}

---

## 4. Primitive colour — reference only

> **Rule R1: never bind product UI to a primitive.** They have no mode and will
> not respond to the theme. They are published here so the semantic aliases can
> be traced and audited.

${Object.entries(primitiveFamilies)
  .map(
    ([family, entries]) =>
      `### ${family[0].toUpperCase()}${family.slice(1)}\n\n| Token | Value |\n|---|---|\n${entries
        .map(([k, v]) => `| \`${k}\` | \`${v}\` |`)
        .join('\n')}\n`,
  )
  .join('\n')}
`;

writeFileSync(join(root, 'docs/tokens.md'), md);
console.log(`docs/tokens.md written (${md.length} bytes)`);
