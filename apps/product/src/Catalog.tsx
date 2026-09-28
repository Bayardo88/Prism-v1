/**
 * The screen catalog: every Figma page → section → frame, each linked to the
 * route and state that renders it. This is the map of the product.
 */
import {
  Chip, DataGrid, Row, Cell, ColumnHeader, Heading, Link, Text, space,
} from '@scalar/design-system';
import { AppFrame } from './shell/AppFrame.js';
import { allScreens, examplePath } from './registry.js';
import { href } from './router.js';

const FIGMA = 'https://www.figma.com/design/cZktZhD0ssL5lRVOvSqmOV/Scalar-full-product?node-id=';

const COL = {
  frame: { flex: '3 1 0', minWidth: 0 },
  screen: { flex: '2 1 0', minWidth: 0 },
  route: { flex: '3 1 0', minWidth: 0 },
  figma: { flex: '1 1 0', minWidth: 0 },
} as const;

export function Catalog() {
  const pages = [...new Set(allScreens.map((s) => s.figmaPage))];
  const frames = allScreens.reduce((n, s) => n + s.states.length, 0);

  return (
    <AppFrame area="home">
      <main style={{ padding: space.xl, display: 'flex', flexDirection: 'column', gap: space.xl }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
          <Heading level={1} step="2xl">Screen catalog</Heading>
          <Text tone="secondary">
            {allScreens.length} screens · {frames} Figma frames · {pages.length} Figma pages. Every row opens the
            exact state drawn in that frame.
          </Text>
        </div>

        {pages.map((page) => {
          const screens = allScreens.filter((s) => s.figmaPage === page);
          return (
            <section key={page} style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
              <Heading level={2} step="l">{page}</Heading>
              <DataGrid
                label={page}
                head={
                  <>
                    <ColumnHeader style={COL.frame}>Figma frame</ColumnHeader>
                    <ColumnHeader style={COL.screen}>Screen</ColumnHeader>
                    <ColumnHeader style={COL.route}>Route</ColumnHeader>
                    <ColumnHeader style={COL.figma}>Figma</ColumnHeader>
                  </>
                }
              >
                {screens.flatMap((screen) =>
                  screen.states.map((st, i) => (
                    <Row key={st.figmaNode} zebra={i % 2 === 1}>
                      <Cell style={COL.frame}>
                        <Link href={href(examplePath(screen), i === 0 ? undefined : st.key)}>{st.label}</Link>
                      </Cell>
                      <Cell style={COL.screen}>
                        {screen.title} {i === 0 && <Chip size="s">default</Chip>}
                      </Cell>
                      <Cell style={COL.route}>
                        <Text step="s" tone="secondary">{screen.route}{i === 0 ? '' : `?state=${st.key}`}</Text>
                      </Cell>
                      <Cell style={COL.figma}>
                        <Link href={FIGMA + st.figmaNode.replace(':', '-')}>{st.figmaNode}</Link>
                      </Cell>
                    </Row>
                  )),
                )}
              </DataGrid>
            </section>
          );
        })}
      </main>
    </AppFrame>
  );
}
