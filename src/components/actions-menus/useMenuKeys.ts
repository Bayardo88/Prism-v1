import { useCallback, useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';
import { composeRefs, useLatestRef, useRovingFocus } from '../../utils/index.js';

/** Every item a menu can focus: menuitem, menuitemradio, menuitemcheckbox. */
export const MENU_ITEM_SELECTOR = '[role^="menuitem"]';

export type MenuCloseReason = 'escape' | 'tab';

export interface UseMenuKeysOptions {
  /** Esc and Tab ask the owner to close the menu. The menu never owns open state. */
  onClose?: (reason: MenuCloseReason) => void;
  /** Move focus to the first item on mount. Opt in: galleries that render menus statically must not steal focus. */
  autoFocus?: boolean;
  /** Consumer ref to merge onto the menu element. */
  forwardedRef?: React.Ref<HTMLElement>;
}

const enabledItems = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true',
  );

/**
 * Keeps exactly one element of `items` in the tab order: the one matching
 * `preferred`, else the one already at tabindex 0, else the first.
 */
export function normalizeTabStop(items: HTMLElement[], preferred?: (el: HTMLElement) => boolean): void {
  if (items.length === 0) return;
  const stop = items.find((el) => preferred?.(el)) ?? items.find((el) => el.getAttribute('tabindex') === '0') ?? items[0]!;
  items.forEach((el) => {
    const want = el === stop ? '0' : '-1';
    if (el.getAttribute('tabindex') !== want) el.setAttribute('tabindex', want);
  });
}

/**
 * APG menu keyboard model, shared by ContextMenu, UserMenu and any custom menu surface.
 *
 * - Up/Down move between items (wrapping), Home/End jump, typing focuses the next item whose label starts with it.
 * - Esc and Tab call `onClose` (Tab is not prevented, so focus leaves naturally).
 * - Right opens / enters an inline submenu (`aria-haspopup` item); Left collapses it and returns to its parent item.
 * - One tab stop: the menu is reachable with Tab, then arrows take over.
 *
 * Spread the result on the menu element: `<div role="menu" ref={menu.ref} onKeyDown={menu.onKeyDown}>`.
 */
export function useMenuKeys({ onClose, autoFocus, forwardedRef }: UseMenuKeysOptions = {}) {
  const innerRef = useRef<HTMLElement | null>(null);
  const latest = useLatestRef({ onClose });
  const roving = useRovingFocus({ orientation: 'vertical', itemSelector: MENU_ITEM_SELECTOR, typeahead: true });

  // Items are focusable by script only; one of them is the tab stop so a static menu is still reachable.
  useEffect(() => {
    if (innerRef.current) normalizeTabStop(enabledItems(innerRef.current));
  });

  useEffect(() => {
    if (autoFocus && innerRef.current) enabledItems(innerRef.current)[0]?.focus({ preventScroll: true });
  }, [autoFocus]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      roving.onKeyDown(event);
      if (event.defaultPrevented) return;
      const menu = event.currentTarget;
      const item = (event.target as HTMLElement).closest<HTMLElement>(MENU_ITEM_SELECTOR);
      if (event.key === 'Escape') {
        event.stopPropagation();
        latest.current.onClose?.('escape');
      } else if (event.key === 'Tab') {
        latest.current.onClose?.('tab');
      } else if (item && event.key === 'ArrowRight' && item.hasAttribute('aria-haspopup')) {
        event.preventDefault();
        if (item.getAttribute('aria-expanded') === 'true') {
          const group = item.nextElementSibling;
          (group?.querySelector<HTMLElement>(MENU_ITEM_SELECTOR) ?? null)?.focus();
        } else {
          item.click();
        }
      } else if (item && event.key === 'ArrowLeft') {
        const group = item.closest('[role="group"]');
        const parent = group?.previousElementSibling as HTMLElement | null | undefined;
        if (parent && menu.contains(parent) && parent.matches(MENU_ITEM_SELECTOR)) {
          event.preventDefault();
          if (parent.getAttribute('aria-expanded') === 'true') parent.click();
          parent.focus();
        } else if (item.getAttribute('aria-expanded') === 'true') {
          event.preventDefault();
          item.click();
        }
      }
    },
    [roving, latest],
  );

  const ref = composeRefs<HTMLElement>(innerRef, forwardedRef);
  return { ref, onKeyDown, innerRef: innerRef as RefObject<HTMLElement | null> };
}
