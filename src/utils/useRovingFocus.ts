import { useCallback, useRef, type KeyboardEvent } from 'react';
import { useLatestRef } from './useLatestRef.js';

export interface RovingFocusOptions {
  /** Which arrow keys move focus. `both` is for 2-D clusters. Default `horizontal`. */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** Wrap from last to first and back. Default true. */
  loop?: boolean;
  /** CSS selector for the focusable items inside the container. */
  itemSelector: string;
  /** Home / End jump to first / last. Default true. */
  homeEnd?: boolean;
  /** Type-ahead: typing characters focuses the next item whose text starts with them. Default false. */
  typeahead?: boolean;
  /**
   * Keep exactly one item in the tab order (the one that last had focus).
   * Sets `tabindex` on the DOM nodes. Default true.
   */
  manageTabIndex?: boolean;
  /** Called after focus moves — use for "selection follows focus" tabs. */
  onFocusItem?: (item: HTMLElement, index: number) => void;
}

/**
 * Roving-focus keyboard handling for composite widgets (tabs, menus, toolbars,
 * segmented controls, listboxes). Attach the returned `onKeyDown` to the
 * container; items are found by `itemSelector`.
 *
 * It handles keys only. Each item's initial `tabIndex` (0 for the active one,
 * -1 for the rest) is still the component's job.
 */
export function useRovingFocus(options: RovingFocusOptions) {
  const opts = useLatestRef(options);
  const buffer = useRef({ text: '', timer: 0 as unknown as ReturnType<typeof setTimeout> });

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const o = opts.current;
      const container = event.currentTarget;
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement;
      const current = target.closest<HTMLElement>(o.itemSelector);
      if (!current || !container.contains(current)) return;
      // Leave text editing alone inside an item (e.g. an input in a menu row).
      if (target !== current && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      const items = Array.from(container.querySelectorAll<HTMLElement>(o.itemSelector)).filter(
        (el) => el.getAttribute('aria-disabled') !== 'true' && !el.hasAttribute('disabled') && !el.hidden,
      );
      const index = items.indexOf(current);
      if (index === -1) return;

      const rtl = getComputedStyle(container).direction === 'rtl';
      const orientation = o.orientation ?? 'horizontal';
      const horizontal = orientation !== 'vertical';
      const vertical = orientation !== 'horizontal';
      const loop = o.loop ?? true;
      let next = -1;

      const step = (delta: number) => {
        const raw = index + delta;
        if (raw < 0) return loop ? items.length - 1 : 0;
        if (raw >= items.length) return loop ? 0 : items.length - 1;
        return raw;
      };

      if (event.ctrlKey || event.metaKey || event.altKey) return;
      switch (event.key) {
        case 'ArrowRight': if (horizontal) next = step(rtl ? -1 : 1); break;
        case 'ArrowLeft': if (horizontal) next = step(rtl ? 1 : -1); break;
        case 'ArrowDown': if (vertical) next = step(1); break;
        case 'ArrowUp': if (vertical) next = step(-1); break;
        case 'Home': if (o.homeEnd ?? true) next = 0; break;
        case 'End': if (o.homeEnd ?? true) next = items.length - 1; break;
        default:
          if (o.typeahead && event.key.length === 1 && event.key !== ' ') {
            const state = buffer.current;
            clearTimeout(state.timer);
            state.text += event.key.toLowerCase();
            state.timer = setTimeout(() => { state.text = ''; }, 500);
            const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
            const hit = ordered.find((el) => (el.textContent ?? '').trim().toLowerCase().startsWith(state.text));
            if (hit) next = items.indexOf(hit);
          }
      }

      if (next < 0) return;
      event.preventDefault();
      const el = items[next]!;
      el.focus();
      if (o.manageTabIndex ?? true) {
        items.forEach((item) => item.setAttribute('tabindex', item === el ? '0' : '-1'));
      }
      o.onFocusItem?.(el, next);
    },
    [opts],
  );

  return { onKeyDown };
}
