/**
 * Packaging smoke test: pack the package, install the tarball into a clean project and prove a
 * consumer can import it, typecheck against it and server-render a component.
 * Run: npm run pack:smoke
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const work = mkdtempSync(join(tmpdir(), 'scalar-pack-'));
const run = (cmd, cwd = work) => execSync(cmd, { cwd, stdio: 'inherit' });

console.log(`› packing into ${work}`);
const out = execSync(`npm pack --pack-destination ${work} --silent`, { cwd: root }).toString().trim().split('\n').pop();
const tarball = join(work, out);
if (!existsSync(tarball)) throw new Error(`tarball not found: ${tarball}`);

writeFileSync(join(work, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type: 'module' }));
run(`npm install --silent --no-audit --no-fund ${tarball} react@18 react-dom@18 @types/react@18 typescript@5`);

writeFileSync(join(work, 'app.tsx'), `
import '@scalar/design-system/styles.css';
import { ScalarProvider, Button, Modal, Tabs, TabItem } from '@scalar/design-system';
import { color } from '@scalar/design-system/tokens';
export const App = () => (
  <ScalarProvider>
    <Button asChild><a href="/x">Go</a></Button>
    <Modal open onClose={() => {}} title="Hi">x</Modal>
    <Tabs label="Sections"><TabItem value="a">A</TabItem></Tabs>
  </ScalarProvider>
);
export const text = color.text.primary;
`);
writeFileSync(join(work, 'tsconfig.json'), JSON.stringify({ compilerOptions: { jsx: 'react-jsx', module: 'ESNext', moduleResolution: 'Bundler', strict: true, noEmit: true, skipLibCheck: true, target: 'ES2020', lib: ['ES2020', 'DOM'] }, include: ['app.tsx'] }));
console.log('› typechecking a consumer file');
run('npx tsc -p tsconfig.json');

writeFileSync(join(work, 'ssr.mjs'), `
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { ScalarProvider, Button } from '@scalar/design-system';
const html = renderToString(createElement(ScalarProvider, null, createElement(Button, null, 'Save')));
if (!html.includes('scalar-button')) throw new Error('SSR output missing the button');
console.log('✓ server render ok');
`);
console.log('› server-rendering');
run('node ssr.mjs');
console.log('✓ pack smoke passed');
