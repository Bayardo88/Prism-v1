import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkA11y } from '../../test/render.js';
import { DealCard } from './index.js';

const full = {
  title: '409A Valuation 2026',
  stage: 'Proposal',
  company: 'Helios Bio',
  companyHref: '#company',
  notice: 'Renewal due in 30 days',
  contract: 'MSA-2026-014',
  contractHref: '#contract',
  totals: [{ label: 'NET', value: '$12,000.00' }, { label: 'DUE', value: '$4,000.00' }],
  owner: { name: 'Jordan Lee', role: 'Engagement Manager' },
};

describe('DealCard', () => {
  it('renders every part as a named region, forwards ref/className/testid and has no axe violations', async () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<DealCard ref={ref} className="x" data-testid="deal" {...full} onEditOwner={() => undefined} />);
    expect(ref.current).toBe(screen.getByTestId('deal'));
    expect(ref.current).toHaveClass('scalar-card', 'scalar-deal-card', 'x');
    expect(screen.getByRole('region', { name: '409A Valuation 2026' })).toBe(ref.current);
    expect(screen.getByRole('link', { name: 'Helios Bio' })).toHaveAttribute('href', '#company');
    expect(screen.getByRole('link', { name: 'MSA-2026-014' })).toHaveAttribute('href', '#contract');
    expect(screen.getByText('NET:').nextSibling).toHaveTextContent('$12,000.00');
    expect(screen.getByText('Deal stage:', { exact: false })).toBeInTheDocument();
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('makes the stage a menu trigger and the owner editable, by keyboard', async () => {
    const onStage = vi.fn();
    const onEdit = vi.fn();
    render(<DealCard {...full} onStageClick={onStage} stageExpanded={false} onEditOwner={onEdit} editOwnerLabel="Change engagement manager" />);
    const stage = screen.getByRole('button', { name: 'Deal stage: Proposal' });
    expect(stage).toHaveAttribute('aria-haspopup', 'menu');
    expect(stage).toHaveAttribute('aria-expanded', 'false');
    stage.focus();
    await userEvent.keyboard('{Enter}');
    expect(onStage).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Change engagement manager' })).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('omits what it is not given', () => {
    render(<DealCard title="Deal" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('term')).toBeNull();
  });
});
