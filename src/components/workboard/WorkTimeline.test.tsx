import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkA11y } from '../../test/render.js';
import { WorkTimeline, type WorkTimelineItem } from './index.js';

const TODAY = '2026-10-12';
const items: WorkTimelineItem[] = [
  { id: 'a', name: 'Helios Bio', start: '2026-10-08', end: '2026-10-12', label: 'Request financials', tone: 'blue' },
  { id: 'b', name: 'Kestrel Payments', start: '2026-09-20', end: '2026-10-07', label: 'Review model', tone: 'cyan' },
  { id: 'c', name: 'Orbit Labs', start: '2026-12-01', end: '2026-12-04', label: 'Prepare model', tone: 'orange' },
];

describe('WorkTimeline', () => {
  it('is a table with a row header per item, forwards ref/className/testid and has no axe violations', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <WorkTimeline ref={ref} className="x" data-testid="tl" label="Valuation timeline" start="2026-10-05" days={35} today={TODAY} items={items} />,
    );
    expect(ref.current).toBe(screen.getByTestId('tl'));
    expect(ref.current).toHaveClass('scalar-work-timeline', 'x');
    const table = screen.getByRole('table', { name: 'Valuation timeline' });
    expect(within(table).getAllByRole('row')).toHaveLength(4);
    expect(within(table).getAllByRole('columnheader')[1]).toHaveTextContent('Schedule, 10/05/2026 to 11/08/2026');
    expect(within(table).getAllByRole('rowheader').map((h) => h.textContent)).toEqual(['Helios Bio', 'Kestrel Payments', 'Orbit Labs']);
    const cells = within(table).getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('Request financials, due today, 10/08/2026 to 10/12/2026');
    expect(cells[1]).toHaveTextContent('Review model, overdue, 09/20/2026 to 10/07/2026, runs past this range');
    expect(cells[2]).toHaveTextContent('Prepare model, 12/01/2026 to 12/04/2026, outside this range');
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('opens an item from its row name by keyboard', async () => {
    const onItemClick = vi.fn();
    render(<WorkTimeline label="Timeline" start="2026-10-05" days={14} today={TODAY} items={items} onItemClick={onItemClick} />);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Helios Bio' })).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(onItemClick).toHaveBeenCalledWith(items[1]);
  });
});
