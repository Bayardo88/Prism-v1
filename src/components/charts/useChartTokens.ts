import { useEffect, useState, type RefObject } from 'react';
import { resolveChartTokens, type ChartTokens } from './chartTokens.js';

/**
 * Keeps resolved chart tokens in step with the theme.
 *
 * Three things can change the values under a chart, and all three are watched:
 *   1. `data-theme` flipping on an ancestor (an explicit Light/Dark choice)
 *   2. `data-viewport` changing the type ramp
 *   3. the OS colour scheme changing while the app is on `mode="system"`,
 *      which fires no attribute mutation at all
 */
export function useChartTokens(ref: RefObject<HTMLElement | null>): ChartTokens | null {
  const [tokens, setTokens] = useState<ChartTokens | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const read = () => setTokens(resolveChartTokens(el));
    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-viewport'],
    });
    // A scoped provider writes the attributes on a wrapper, not on <html>.
    const scope = el.closest('[data-theme], [data-viewport]');
    if (scope && scope !== document.documentElement) {
      observer.observe(scope, { attributes: true, attributeFilter: ['data-theme', 'data-viewport'] });
    }

    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    media?.addEventListener('change', read);

    return () => {
      observer.disconnect();
      media?.removeEventListener('change', read);
    };
  }, [ref]);

  return tokens;
}
