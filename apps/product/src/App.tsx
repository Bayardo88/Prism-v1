/**
 * Scalar — the full product as a clickable prototype. Every route renders a
 * screen from the registry; `?state=` selects which Figma frame of it to show.
 * `#/catalog` lists every screen and state; `#/figma/<node-id>` jumps to the
 * screen drawn in that Figma frame.
 */
import { useEffect } from 'react';
import { useLocation, navigate } from './router.js';
import { resolve, byFigmaNode, examplePath } from './registry.js';
import { Catalog } from './Catalog.js';
import { NotFound } from './NotFound.js';

export function App() {
  const { path, query } = useLocation();

  const figma = path.match(/^\/figma\/(\d+[:-]\d+)$/);
  useEffect(() => {
    if (!figma) return;
    const hit = byFigmaNode(figma[1]!.replace('-', ':'));
    if (hit) navigate(examplePath(hit.screen), hit.state.key);
  }, [path]);

  useEffect(() => { window.scrollTo(0, 0); }, [path]);

  if (path === '/catalog') return <Catalog />;
  if (figma) return null;

  const hit = resolve(path, query.get('state'));
  if (!hit) return <NotFound path={path} />;
  const Screen = hit.screen.component;
  // key: remount on state change so local UI state starts from the frame.
  return <Screen key={`${path}?${hit.state.key}`} state={hit.state.key} params={hit.params} />;
}
