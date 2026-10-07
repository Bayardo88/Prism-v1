import { createContext, useContext, useMemo, useSyncExternalStore, type HTMLAttributes, type ReactNode } from 'react';
import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect.js';

/**
 * Colour mode. **Pages are always `light`**, even when the OS is set to dark —
 * that is the default and the rule. `dark` exists for the library only and must
 * be asked for explicitly. `system` no longer follows the OS: it is the same as
 * `light`, kept so existing code keeps compiling.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Type-ramp mode (contract rule R6). Desktop (1440) is the default.
 * Desktop Large (1920) is the Desktop ramp shifted one step up.
 * Mobile (393) matches Desktop except Display and the top two Heading steps.
 *
 * `auto` resolves from the viewport width against the system breakpoints.
 */
export type ViewportMode = 'desktop' | 'desktop-large' | 'mobile' | 'auto';

export interface ScalarThemeContextValue {
  mode: ThemeMode;
  /** The requested ramp. May be `auto`; read `resolvedViewport` for the one in effect. */
  viewport: ViewportMode;
  /** The ramp actually in effect: `auto` resolved against the viewport width. */
  resolvedViewport: Exclude<ViewportMode, 'auto'>;
}

const ScalarThemeContext = createContext<ScalarThemeContextValue>({
  mode: 'light',
  viewport: 'desktop',
  resolvedViewport: 'desktop',
});

/**
 * Reads the nearest `ScalarProvider`'s mode and viewport ramp.
 *
 * Outside a provider it returns the defaults (`light`, `desktop`) rather than
 * throwing, so isolated component renders keep working; wrap the app in
 * `ScalarProvider` for the real values.
 */
export const useScalarTheme = (): ScalarThemeContextValue => useContext(ScalarThemeContext);

export interface ScalarProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  /** Colour mode. Defaults to `light` — pages are always light, whatever the OS says. */
  mode?: ThemeMode;
  /** Type-ramp mode. Defaults to `desktop`. */
  viewport?: ViewportMode;
  /**
   * Where the `data-theme` / `data-viewport` attributes are written.
   * `root` (default) writes to <html> so portalled content inherits them.
   * `scope` renders a wrapper div instead — use it to theme part of a page. The
   * wrapper receives `className` and any other native div props; in `root` mode
   * no element is rendered, so `className` and native props are ignored.
   */
  target?: 'root' | 'scope';
}

type ResolvedViewport = Exclude<ViewportMode, 'auto'>;

function measureViewport(): ResolvedViewport {
  const w = window.innerWidth;
  if (w >= 1920) return 'desktop-large';
  if (w < 768) return 'mobile';
  return 'desktop';
}

function subscribeResize(onChange: () => void) {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

/**
 * Establishes the Scalar theme. Wrap the application once.
 *
 *   <ScalarProvider mode="light" viewport="auto">
 *     <App />
 *   </ScalarProvider>
 *
 * With `viewport="auto"` the ramp follows the window width. It is read through
 * `useSyncExternalStore`, so server rendering and hydration use `desktop` and
 * the real width is applied right after — no hydration mismatch.
 *
 * Import the stylesheet once, at the application entry point:
 *   import '@scalar/design-system/styles.css';
 */
export function ScalarProvider({
  children,
  mode = 'light',
  viewport = 'desktop',
  target = 'root',
  className,
  ...rest
}: ScalarProviderProps) {
  const measured = useSyncExternalStore<ResolvedViewport>(
    viewport === 'auto' ? subscribeResize : subscribeNone,
    () => (viewport === 'auto' ? measureViewport() : 'desktop'),
    () => 'desktop',
  );
  const resolvedViewport: ResolvedViewport = viewport === 'auto' ? measured : viewport;
  const value = useMemo<ScalarThemeContextValue>(
    () => ({ mode, viewport, resolvedViewport }),
    [mode, viewport, resolvedViewport],
  );

  // Layout effects so <html> is themed before first paint (no flash of default).
  useIsomorphicLayoutEffect(() => {
    if (target !== 'root' || typeof document === 'undefined') return;
    const el = document.documentElement;
    // The stylesheet no longer follows prefers-color-scheme, so an absent
    // attribute is light. `system` is therefore light too.
    if (mode === 'system') el.removeAttribute('data-theme');
    else el.setAttribute('data-theme', mode);
    return () => el.removeAttribute('data-theme');
  }, [mode, target]);

  useIsomorphicLayoutEffect(() => {
    if (target !== 'root' || typeof document === 'undefined') return;
    const el = document.documentElement;
    el.setAttribute('data-viewport', resolvedViewport);
    return () => el.removeAttribute('data-viewport');
  }, [resolvedViewport, target]);

  if (target === 'scope') {
    return (
      <ScalarThemeContext.Provider value={value}>
        <div
          {...rest}
          className={className}
          {...(mode !== 'system' ? { 'data-theme': mode } : {})}
          data-viewport={resolvedViewport}
        >
          {children}
        </div>
      </ScalarThemeContext.Provider>
    );
  }

  return <ScalarThemeContext.Provider value={value}>{children}</ScalarThemeContext.Provider>;
}

function subscribeNone() {
  return () => {};
}
