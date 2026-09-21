import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';

/** Colour mode. `system` follows the OS and is the default. */
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
  viewport: ViewportMode;
}

const ScalarThemeContext = createContext<ScalarThemeContextValue>({
  mode: 'system',
  viewport: 'desktop',
});

export const useScalarTheme = (): ScalarThemeContextValue => useContext(ScalarThemeContext);

export interface ScalarProviderProps {
  children: ReactNode;
  /** Colour mode. Defaults to `system`. */
  mode?: ThemeMode;
  /** Type-ramp mode. Defaults to `desktop`. */
  viewport?: ViewportMode;
  /**
   * Where the `data-theme` / `data-viewport` attributes are written.
   * `root` (default) writes to <html> so portalled content inherits them.
   * `scope` renders a wrapper div instead — use it to theme part of a page.
   */
  target?: 'root' | 'scope';
  className?: string;
}

function resolveViewport(viewport: ViewportMode): 'desktop' | 'desktop-large' | 'mobile' {
  if (viewport !== 'auto') return viewport;
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w >= 1920) return 'desktop-large';
  if (w < 768) return 'mobile';
  return 'desktop';
}

/**
 * Establishes the Scalar theme. Wrap the application once.
 *
 *   <ScalarProvider mode="system" viewport="auto">
 *     <App />
 *   </ScalarProvider>
 *
 * Import the stylesheet once, at the application entry point:
 *   import '@scalar/design-system/styles.css';
 */
export function ScalarProvider({
  children,
  mode = 'system',
  viewport = 'desktop',
  target = 'root',
  className,
}: ScalarProviderProps) {
  const value = useMemo<ScalarThemeContextValue>(() => ({ mode, viewport }), [mode, viewport]);

  useEffect(() => {
    if (target !== 'root' || typeof document === 'undefined') return;
    const el = document.documentElement;

    // `system` means "no pinned theme" — the stylesheet's prefers-color-scheme
    // branch takes over, so the attribute must be absent rather than set.
    if (mode === 'system') el.removeAttribute('data-theme');
    else el.setAttribute('data-theme', mode);

    const apply = () => el.setAttribute('data-viewport', resolveViewport(viewport));
    apply();

    if (viewport !== 'auto') return () => {};
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [mode, viewport, target]);

  if (target === 'scope') {
    return (
      <ScalarThemeContext.Provider value={value}>
        <div
          className={className}
          {...(mode !== 'system' ? { 'data-theme': mode } : {})}
          data-viewport={resolveViewport(viewport)}
        >
          {children}
        </div>
      </ScalarThemeContext.Provider>
    );
  }

  return <ScalarThemeContext.Provider value={value}>{children}</ScalarThemeContext.Provider>;
}
