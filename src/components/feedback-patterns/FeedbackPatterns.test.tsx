import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { checkA11y, renderWithProvider } from '../../test/render.js';
import { Banner, DataFreshness, ProgressRing, SaveState, Spinner } from './index.js';

const clean = async (c: Element) => expect((await checkA11y(c)).violations).toEqual([]);

describe('Banner', () => {
  it('passes axe, forwards ref/className, role by tone, labelled dismiss', async () => {
    const ref = createRef<HTMLDivElement>();
    const onDismiss = vi.fn();
    const onIssue = vi.fn();
    const { container, rerender } = renderWithProvider(
      <Banner ref={ref} tone="warning" title="Heads up" className="x" data-testid="b" onDismiss={onDismiss} issues={[{ label: 'Cell A1', onClick: onIssue }]} />,
    );
    await clean(container);
    expect(ref.current).toBe(screen.getByTestId('b'));
    expect(ref.current).toHaveClass('x');
    expect(ref.current).toHaveAttribute('role', 'status');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    await user.click(screen.getByRole('button', { name: 'Cell A1' }));
    expect(onDismiss).toHaveBeenCalled();
    expect(onIssue).toHaveBeenCalled();
    rerender(<Banner tone="negative" title="Bad" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('Spinner / ProgressRing', () => {
  it('Spinner is a named status and forwards ref', async () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = renderWithProvider(<Spinner ref={ref} label="Preparing" className="x" data-testid="s" />);
    await clean(container);
    expect(ref.current).toBe(screen.getByTestId('s'));
    expect(screen.getByRole('status', { name: 'Preparing' })).toHaveClass('x');
  });
  it('ProgressRing clamps now, sets valuetext, handles max=0', async () => {
    const ref = createRef<HTMLSpanElement>();
    const { container, rerender } = renderWithProvider(<ProgressRing ref={ref} value={9} max={5} label="Answered" className="x" data-testid="r" />);
    await clean(container);
    const bar = screen.getByRole('progressbar', { name: 'Answered' });
    expect(ref.current).toBe(bar);
    expect(bar).toHaveAttribute('aria-valuenow', '5');
    expect(bar).toHaveAttribute('aria-valuemax', '5');
    expect(bar).toHaveAttribute('aria-valuetext', '5 of 5');
    rerender(<ProgressRing value={3} max={0} label="Answered" display="percent" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '0%');
  });
});

describe('DataFreshness', () => {
  it('speaks state, keeps the refresh button mounted while refreshing, forwards ref', async () => {
    const ref = createRef<HTMLSpanElement>();
    const onRefresh = vi.fn();
    const { container, rerender } = renderWithProvider(
      <DataFreshness ref={ref} state="stale" onRefresh={onRefresh} className="x" data-testid="d">As of today</DataFreshness>,
    );
    await clean(container);
    expect(ref.current).toBe(screen.getByTestId('d'));
    expect(screen.getByRole('status')).toHaveTextContent('Stale. As of today');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Refresh data' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
    rerender(<DataFreshness state="refreshing" onRefresh={onRefresh}>As of today</DataFreshness>);
    const btn = screen.getByRole('button', { name: 'Refresh data' });
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    await user.click(btn);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing.');
  });
});

describe('SaveState', () => {
  it('status by default, alert on error, forwards ref/className', async () => {
    const ref = createRef<HTMLSpanElement>();
    const { container, rerender } = renderWithProvider(<SaveState ref={ref} state="saved" className="x" data-testid="s" />);
    await clean(container);
    expect(ref.current).toBe(screen.getByTestId('s'));
    expect(ref.current).toHaveAttribute('role', 'status');
    rerender(<SaveState state="error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
