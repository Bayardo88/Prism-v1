import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { checkA11y, renderWithProvider } from '../../test/render.js';
import { BodySlot, PageTemplate } from './index.js';

describe('PageTemplate', () => {
  it('has one main landmark, passes axe, forwards ref/className/data-testid', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithProvider(
      <PageTemplate ref={ref} className="x" data-testid="pt" navigation={<nav aria-label="App" />}><p>Body</p></PageTemplate>,
    );
    expect((await checkA11y(container)).violations).toEqual([]);
    expect(ref.current).toBe(screen.getByTestId('pt'));
    expect(ref.current).toHaveClass('scalar-page-template', 'x');
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });
  it('placeholder BodySlot has no role/aria-label noise and forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithProvider(<PageTemplate />);
    const slot = document.querySelector('[data-body-slot-placeholder]')!;
    expect(slot).not.toHaveAttribute('role');
    expect(slot).not.toHaveAttribute('aria-label');
    renderWithProvider(<BodySlot ref={ref} className="y" data-testid="bs" />);
    expect(ref.current).toBe(screen.getByTestId('bs'));
  });
});
