// Concatenates the token and component stylesheets into dist/styles/scalar.css
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const parts = ['src/styles/tokens.css', 'src/styles/base.css', 'src/styles/components.css'];
const css = parts.map((p) => readFileSync(join(root, p), 'utf8')).join('\n\n');
mkdirSync(join(root, 'dist/styles'), { recursive: true });
writeFileSync(join(root, 'dist/styles/scalar.css'), css);
console.log(`scalar.css written (${css.length} bytes)`);
