import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';

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
  viewport: ViewportMode;
}

const ScalarThemeContext = createContext<ScalarThemeContextValue>({
  mode: 'light',
  viewport: 'desktop',
});

export const useScalarTheme = (): ScalarThemeContextValue => useContext(ScalarThemeContext);

export interface ScalarProviderProps {
  children: ReactNode;
  /** Colour mode. Defaults to `light` — pages are always light, whatever the OS says. */
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
 *   <ScalarProvider mode="light" viewport="auto">
 *     <App />
 *   </ScalarProvider>
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
}: ScalarProviderProps) {
  const value = useMemo<ScalarThemeContextValue>(() => ({ mode, viewport }), [mode, viewport]);

  useEffect(() => {
    if (target !== 'root' || typeof document === 'undefined') return;
    const el = document.documentElement;

    // The stylesheet no longer follows prefers-color-scheme, so an absent
    // attribute is light. `system` is therefore light too.
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
