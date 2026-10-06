import { render, type RenderOptions } from '@testing-library/react';
import { axe } from 'jest-axe';
import type { ReactElement } from 'react';
import { ScalarProvider } from '../theme/ScalarProvider.js';

/** Renders inside ScalarProvider, the way every product screen does. */
export function renderWithProvider(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: ({ children }) => <ScalarProvider>{children}</ScalarProvider>, ...options });
}

/** Runs axe on a rendered container. Use with `expect(await checkA11y(container)).toHaveNoViolations()`. */
export const checkA11y = (container: Element) => axe(container);
