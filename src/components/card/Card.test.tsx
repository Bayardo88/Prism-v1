import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProvider, checkA11y } from '../../test/render.js';
import { Card, CardItem } from './index.js';

describe('Card', () => {
  it('is a named region, forwards ref/className/data-testid, no axe violations', async () => {
    const ref = createRef<HTMLElement>();
    const { container } = renderWithProvider(
      <Card ref={ref} title="Acme" headingLevel={2} className="k" data-testid="card"><CardItem label="NAV" value="1" /></Card>,
    );
    expect(ref.current).toBe(screen.getByTestId('card'));
    expect(ref.current).toHaveClass('scalar-card', 'k');
    expect(screen.getByRole('region', { name: 'Acme' })).toBe(ref.current);
    expect(screen.getByRole('heading', { level: 2, name: 'Acme' })).toBeInTheDocument();
    expect(await checkA11y(container)).toHaveNoViolations();
  });
  it('renders no empty heading when there is no title', () => {
    renderWithProvider(<Card tag={<span>tag</span>}>x</Card>);
    expect(screen.queryByRole('heading')).toBeNull();
  });
  it('asChild uses the child element as the root', () => {
    renderWithProvider(<Card asChild title="T"><article data-testid="r">body</article></Card>);
    expect(screen.getByTestId('r').tagName).toBe('ARTICLE');
    expect(screen.getByTestId('r')).toHaveClass('scalar-card');
    expect(screen.getByRole('heading', { name: 'T' })).toBeInTheDocument();
  });
  it('CardItem announces the trend direction as text and forwards ref/rest', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithProvider(<CardItem ref={ref} data-testid="ci" label="Δ" value="+4%" trend="up" />);
    expect(ref.current).toBe(screen.getByTestId('ci'));
    expect(screen.getByTestId('ci')).toHaveTextContent('Increase: +4%');
  });
});
