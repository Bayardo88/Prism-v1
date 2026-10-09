import { createRef } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProvider, checkA11y } from '../../test/render.js';
import { Divider, EmptyState, Link, Scrim, Tooltip } from './index.js';

describe('Tooltip', () => {
  it('describes the focusable trigger itself, on focus, and Escape dismisses from anywhere', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLSpanElement>();
    const { container } = renderWithProvider(
      <Tooltip ref={ref} content="Explains" data-testid="tt" className="extra"><button type="button">Trigger</button></Tooltip>,
    );
    expect(ref.current).toBe(screen.getByTestId('tt'));
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    // The description target exists (hidden) before the tooltip opens, so screen readers can announce it.
    const hiddenTip = container.querySelector('[role="tooltip"]') as HTMLElement;
    expect(hiddenTip).toBeInTheDocument();
    expect(hiddenTip).not.toBeVisible();
    expect(trigger).toHaveAttribute('aria-describedby', hiddenTip.id);
    await user.tab();
    const tip = screen.getByRole('tooltip');
    expect(tip).toHaveClass('extra');
    expect(trigger).toHaveAttribute('aria-describedby', tip.id);
    expect((await checkA11y(container)).violations).toEqual([]);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('keeps an existing aria-describedby and reports open changes', async () => {
    const onOpenChange = vi.fn();
    renderWithProvider(
      <Tooltip content="Tip" onOpenChange={onOpenChange}><button type="button" aria-describedby="x">T</button></Tooltip>,
    );
    await userEvent.hover(screen.getByRole('button'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button').getAttribute('aria-describedby')).toMatch(/^x /);
  });

  it('Escape works when controlled open and focus is elsewhere', async () => {
    const onOpenChange = vi.fn();
    renderWithProvider(<Tooltip open content="Tip" onOpenChange={onOpenChange}><button type="button">T</button></Tooltip>);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Scrim', () => {
  it('forwards ref/className/testid and keeps both onClick and onDismiss', () => {
    const ref = createRef<HTMLDivElement>();
    const onClick = vi.fn();
    const onDismiss = vi.fn();
    renderWithProvider(<Scrim ref={ref} className="c" data-testid="s" onClick={onClick} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByTestId('s'));
    expect(ref.current).toBe(screen.getByTestId('s'));
    expect(screen.getByTestId('s')).toHaveClass('scalar-scrim', 'c');
    expect(onClick).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe('Divider', () => {
  it('is a separator, or hidden when decorative', async () => {
    const ref = createRef<HTMLHRElement>();
    const { container } = renderWithProvider(
      <div><Divider ref={ref} className="c" data-testid="d" orientation="vertical" /><Divider decorative data-testid="p" /></div>,
    );
    expect(ref.current).toBe(screen.getByTestId('d'));
    expect(screen.getByTestId('d')).toHaveClass('c');
    expect(screen.getByTestId('d')).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByTestId('p')).toHaveAttribute('role', 'none');
    expect(screen.getByTestId('p')).not.toHaveAttribute('aria-orientation');
    expect((await checkA11y(container)).violations).toEqual([]);
  });
});

describe('Link', () => {
  it('renders an anchor, forwards ref and defaults rel for _blank', async () => {
    const ref = createRef<HTMLAnchorElement>();
    const { container } = renderWithProvider(<Link ref={ref} href="/x" target="_blank" className="c" data-testid="l">Go</Link>);
    const a = screen.getByTestId('l');
    expect(ref.current).toBe(a);
    expect(a).toHaveClass('scalar-link', 'c');
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('asChild renders the child with link classes, once', () => {
    const ref = createRef<HTMLAnchorElement>();
    renderWithProvider(<Link asChild ref={ref} size="s"><a href="/v" data-testid="c">Valuations</a></Link>);
    const a = screen.getByTestId('c');
    expect(a.tagName).toBe('A');
    expect(a).toHaveClass('scalar-link', 'scalar-type-link-s');
    expect(ref.current).toBe(a);
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});

describe('EmptyState', () => {
  it('has no alert role by default, honours headingLevel, ref, className, testid', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithProvider(
      <EmptyState ref={ref} type="error" title="Nope" headingLevel={2} className="c" data-testid="e" actions={<button type="button">Retry</button>} />,
    );
    const el = screen.getByTestId('e');
    expect(ref.current).toBe(el);
    expect(el).toHaveClass('c');
    expect(el).not.toHaveAttribute('role');
    expect(screen.getByRole('heading', { level: 2, name: 'Nope' })).toBeInTheDocument();
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('lets the caller choose a role', () => {
    renderWithProvider(<EmptyState title="x" role="status" data-testid="e" />);
    expect(screen.getByTestId('e')).toHaveAttribute('role', 'status');
  });
});

describe('Tooltip mouse and focus handlers', () => {
  it('opens on hover/focus, closes on leave/blur, and calls consumer handlers', async () => {
    const user = userEvent.setup();
    const handlers = { onMouseEnter: vi.fn(), onMouseLeave: vi.fn(), onFocus: vi.fn(), onBlur: vi.fn() };
    renderWithProvider(
      <Tooltip content="Tip" data-testid="root" {...handlers}><button type="button">T</button></Tooltip>,
    );
    const tip = screen.getByRole('tooltip', { hidden: true });
    expect(tip).toHaveAttribute('hidden');
    await user.hover(screen.getByRole('button'));
    expect(handlers.onMouseEnter).toHaveBeenCalled();
    expect(tip).not.toHaveAttribute('hidden');
    await user.unhover(screen.getByRole('button'));
    expect(handlers.onMouseLeave).toHaveBeenCalled();
    expect(tip).toHaveAttribute('hidden');
    await user.tab();
    expect(handlers.onFocus).toHaveBeenCalled();
    expect(tip).not.toHaveAttribute('hidden');
    await user.tab();
    expect(handlers.onBlur).toHaveBeenCalled();
    expect(tip).toHaveAttribute('hidden');
  });
  it('Escape closes an uncontrolled tooltip', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Tooltip content="Tip"><button type="button">T</button></Tooltip>);
    await user.tab();
    const tip = screen.getByRole('tooltip');
    await user.keyboard('{Escape}');
    expect(tip).toHaveAttribute('hidden');
  });
  it('ignores other keys and a non-element trigger', async () => {
    const onOpenChange = vi.fn();
    renderWithProvider(<Tooltip open content="Tip" onOpenChange={onOpenChange}>{'plain text' as never}</Tooltip>);
    await userEvent.keyboard('a');
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByText('plain text')).toBeInTheDocument();
  });
});
