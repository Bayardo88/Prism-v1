import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProvider, checkA11y } from '../../test/render.js';
import { Icon, icons, glyphs } from './index.js';

describe('Icon', () => {
  it('is aria-hidden by default, forwards ref, className, data-testid', async () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = renderWithProvider(<Icon ref={ref} className="i" data-testid="ic"><icons.Search /></Icon>);
    expect(ref.current).toBe(screen.getByTestId('ic'));
    expect(ref.current).toHaveAttribute('aria-hidden', 'true');
    expect(ref.current).toHaveClass('scalar-icon', 'i');
    expect(await checkA11y(container)).toHaveNoViolations();
  });
  it('label opts in to role=img; a consumer aria-label does too (no contradictory aria-hidden)', () => {
    renderWithProvider(<><Icon label="Search"><icons.Search /></Icon><Icon aria-label="Close"><glyphs.Close /></Icon></>);
    expect(screen.getByRole('img', { name: 'Search' })).not.toHaveAttribute('aria-hidden');
    expect(screen.getByRole('img', { name: 'Close' })).not.toHaveAttribute('aria-hidden');
  });
  it('glyphs pass props through to their <g>', () => {
    const { container } = renderWithProvider(<Icon><icons.Search data-testid="g" className="gg" /></Icon>);
    expect(container.querySelector('[data-testid="g"]')).toHaveClass('gg');
  });
});
