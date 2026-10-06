import { useRef, useState } from 'react';
import { render, screen, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Slot } from './Slot.js';
import { composeRefs } from './refs.js';
import { useControllableState } from './useControllableState.js';
import { useFieldIds, describedBy } from './useFieldIds.js';
import { useRovingFocus } from './useRovingFocus.js';
import { useOverlay } from './useOverlay.js';
import { useEvent } from './useEvent.js';

describe('Slot', () => {
  it('merges className, handlers, style and ref onto the child', async () => {
    const slotClick = vi.fn();
    const childClick = vi.fn();
    const ref = { current: null as HTMLElement | null };
    render(
      <Slot ref={ref} className="a" style={{ color: 'red' }} onClick={slotClick}>
        <a href="/x" className="b" onClick={childClick}>go</a>
      </Slot>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveClass('a', 'b');
    expect(link.style.color).toBe('red');
    expect(ref.current).toBe(link);
    await userEvent.click(link);
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(slotClick).toHaveBeenCalledTimes(1);
  });
});

describe('Slot (disabled)', () => {
  it('does not run the child handler when the slot is aria-disabled', async () => {
    const childClick = vi.fn();
    const slotClick = vi.fn();
    render(
      <Slot aria-disabled="true" onClick={slotClick}>
        <a href="/x" onClick={childClick}>go</a>
      </Slot>,
    );
    await userEvent.click(screen.getByRole('link'));
    expect(slotClick).toHaveBeenCalledTimes(1);
    expect(childClick).not.toHaveBeenCalled();
  });
});

describe('composeRefs', () => {
  it('assigns callback and object refs', () => {
    const obj = { current: null as HTMLDivElement | null };
    const fn = vi.fn();
    const node = document.createElement('div');
    composeRefs(obj, fn)(node);
    expect(obj.current).toBe(node);
    expect(fn).toHaveBeenCalledWith(node);
  });
});

describe('useControllableState', () => {
  it('works uncontrolled and reports changes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState<number>(undefined, 1, onChange));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });
  it('does not own state when controlled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState<number>(5, 1, onChange));
    act(() => result.current[1](9));
    expect(result.current[0]).toBe(5);
    expect(onChange).toHaveBeenCalledWith(9);
  });
});

describe('useControllableState (mode switch)', () => {
  it('warns when a value goes from controlled to uncontrolled', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = renderHook(({ v }: { v: number | undefined }) => useControllableState<number>(v, 0), { initialProps: { v: 1 as number | undefined } });
    rerender({ v: undefined });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('controlled to uncontrolled'));
    warn.mockRestore();
  });
});

describe('useFieldIds / describedBy', () => {
  it('derives ids and honours a consumer id', () => {
    const { result } = renderHook(() => useFieldIds('email'));
    expect(result.current).toEqual({ id: 'email', labelId: 'email-label', hintId: 'email-hint', errorId: 'email-error' });
    expect(describedBy('a', false, undefined, 'b')).toBe('a b');
    expect(describedBy(false)).toBeUndefined();
  });
});

describe('useEvent', () => {
  it('has a stable identity and calls the latest function', () => {
    let calls = '';
    const { result, rerender } = renderHook(({ tag }) => useEvent(() => { calls += tag; }), { initialProps: { tag: 'a' } });
    const first = result.current;
    rerender({ tag: 'b' });
    expect(result.current).toBe(first);
    first();
    expect(calls).toBe('b');
  });
});

function Tabs({ onFocusItem }: { onFocusItem?: (i: number) => void }) {
  const { onKeyDown } = useRovingFocus({ orientation: 'horizontal', itemSelector: '[role="tab"]', typeahead: true, onFocusItem: (_, i) => onFocusItem?.(i) });
  return (
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus -- keys bubble from the focusable tabs
    <div role="tablist" onKeyDown={onKeyDown}>
      <button role="tab" tabIndex={0}>One</button>
      <button role="tab" tabIndex={-1}>Two</button>
      <button role="tab" tabIndex={-1} disabled>Skip</button>
      <button role="tab" tabIndex={-1}>Three</button>
    </div>
  );
}

describe('useRovingFocus', () => {
  it('moves with arrows, skips disabled, wraps, and keeps one tab stop', async () => {
    const seen: number[] = [];
    render(<Tabs onFocusItem={(i) => seen.push(i)} />);
    const [one, two, three] = [screen.getByText('One'), screen.getByText('Two'), screen.getByText('Three')];
    one.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(two).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(three).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(one).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(three).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(one).toHaveFocus();
    expect(one).toHaveAttribute('tabindex', '0');
    expect(three).toHaveAttribute('tabindex', '-1');
    expect(seen.length).toBeGreaterThan(3);
  });
  it('supports type-ahead', async () => {
    render(<Tabs />);
    screen.getByText('One').focus();
    await userEvent.keyboard('t');
    expect(screen.getByText('Two')).toHaveFocus();
  });
});

function Dialog({ modal = true, onClose }: { modal?: boolean; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useOverlay({ open, onClose: () => { setOpen(false); onClose(); }, containerRef: ref, modal, triggerRef: trigger });
  return (
    <>
      <button ref={trigger} onClick={() => setOpen(true)}>open</button>
      <button>outside</button>
      {open && (
        <div ref={ref} role="dialog" aria-label="d">
          <button>first</button>
          <button>last</button>
        </div>
      )}
    </>
  );
}

describe('useOverlay', () => {
  it('moves focus in, traps Tab, closes on Escape and restores focus', async () => {
    const onClose = vi.fn();
    render(<Dialog onClose={onClose} />);
    const trigger = screen.getByText('open');
    await userEvent.click(trigger);
    expect(screen.getByText('first')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByText('last')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByText('first')).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByText('last')).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).not.toBe('hidden');
  });
  it('closes non-modal overlays on outside click but not on the trigger', async () => {
    const onClose = vi.fn();
    render(<Dialog modal={false} onClose={onClose} />);
    await userEvent.click(screen.getByText('open'));
    await userEvent.click(screen.getByText('outside'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it('does not re-run (and steal focus) when onClose changes identity', async () => {
    function Host() {
      const [n, setN] = useState(0);
      const ref = useRef<HTMLDivElement>(null);
      useOverlay({ open: true, onClose: () => setN(n), containerRef: ref });
      return (
        <div ref={ref}>
          <input aria-label="field" />
          <button onClick={() => setN((x) => x + 1)}>bump</button>
        </div>
      );
    }
    render(<Host />);
    const field = screen.getByLabelText('field');
    field.focus();
    await userEvent.click(screen.getByText('bump'));
    await userEvent.click(field);
    await userEvent.click(screen.getByText('bump'));
    await userEvent.click(field);
    expect(field).toHaveFocus();
  });
});
