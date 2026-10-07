import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProvider, checkA11y } from '../../test/render.js';
import { Chip } from './index.js';

describe('Chip', () => {
  it('has no axe violations, forwards ref, className, data-testid', async () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = renderWithProvider(<Chip ref={ref} className="c" data-testid="chip">Active</Chip>);
    expect(ref.current).toBe(screen.getByTestId('chip'));
    expect(ref.current).toHaveClass('scalar-chip', 'c');
    expect(await checkA11y(container)).toHaveNoViolations();
  });
  it('is a toggle button with aria-pressed when selected/onClick is given', async () => {
    const onClick = vi.fn();
    renderWithProvider(<Chip selected onClick={onClick}>Filter</Chip>);
    const b = screen.getByRole('button', { name: 'Filter' });
    expect(b).toHaveAttribute('aria-pressed', 'true');
    b.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });
  it('removes via button and via Backspace/Delete on the label', async () => {
    const onRemove = vi.fn();
    const { container } = renderWithProvider(<Chip onClick={() => {}} onRemove={onRemove}>Tag</Chip>);
    await userEvent.click(screen.getByRole('button', { name: 'Remove Tag' }));
    screen.getByRole('button', { name: 'Tag' }).focus();
    await userEvent.keyboard('{Backspace}{Delete}');
    expect(onRemove).toHaveBeenCalledTimes(3);
    expect(await checkA11y(container)).toHaveNoViolations();
  });
  it('gives a unique remove name for non-string children, or uses removeLabel', () => {
    renderWithProvider(<><Chip onRemove={() => {}}><b>Bold</b></Chip><Chip onRemove={() => {}} removeLabel="Drop it">x</Chip></>);
    expect(screen.getByRole('button', { name: 'Remove Bold' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Drop it' })).toBeInTheDocument();
  });
  it('asChild renders the child element', () => {
    renderWithProvider(<Chip asChild><a href="/t">Tag</a></Chip>);
    expect(screen.getByRole('link', { name: 'Tag' })).toHaveClass('scalar-chip');
  });
});
