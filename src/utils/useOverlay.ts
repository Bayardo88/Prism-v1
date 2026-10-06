import { useEffect, type RefObject } from 'react';
import { getFocusable } from './focus.js';
import { useLatestRef } from './useLatestRef.js';

export interface OverlayOptions {
  open: boolean;
  /** Called on Escape and (non-modal) outside click. Safe to pass an inline function. */
  onClose?: () => void;
  /** The overlay's root element. */
  containerRef: RefObject<HTMLElement | null>;
  /**
   * Modal: Tab is trapped, focus is kept inside and the page scroll is locked.
   * Non-modal (popover/drawer): Tab can leave, outside click dismisses.
   */
  modal?: boolean;
  /** What to focus on open: an element/ref, or default to the first tabbable (else the container). */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Return focus to whatever had it before opening. Default true. */
  restoreFocus?: boolean;
  /** The element that opened the overlay, so clicking it is not treated as "outside". */
  triggerRef?: RefObject<HTMLElement | null>;
  /** Close on Escape. Default true. */
  closeOnEscape?: boolean;
  /** Close on pointer-down outside (non-modal only). Default true. */
  closeOnOutsideClick?: boolean;
}

// Only the top-most overlay reacts to Escape / outside clicks.
const stack: symbol[] = [];
let scrollLocks = 0;
let previousOverflow = '';

/**
 * Focus and dismissal behaviour shared by Modal, Drawer, popovers and menus:
 * focus moves in on open, Tab is trapped (modal), Escape closes, and focus
 * returns to the trigger on close.
 *
 * The effect depends on `open` only. `onClose` is read through a ref, so an
 * inline arrow function never re-runs the effect (and never steals focus).
 */
export function useOverlay({
  open, onClose, containerRef, modal = true, initialFocus, restoreFocus = true,
  triggerRef, closeOnEscape = true, closeOnOutsideClick = true,
}: OverlayOptions): void {
  const latest = useLatestRef({ onClose, initialFocus, triggerRef, restoreFocus, closeOnEscape, closeOnOutsideClick, modal });

  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    const id = Symbol('overlay');
    stack.push(id);
    const isTop = () => stack[stack.length - 1] === id;
    const opener = (latest.current.triggerRef?.current ?? document.activeElement) as HTMLElement | null;

    // Move focus in. Prefer an explicit target, then the first tabbable, then the container itself.
    if (container) {
      const target = latest.current.initialFocus?.current ?? getFocusable(container)[0] ?? container;
      if (target === container && !container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isTop()) return;
      const l = latest.current;
      if (e.key === 'Escape' && l.closeOnEscape) {
        e.stopPropagation();
        l.onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !l.modal || !container) return;
      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === container)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const l = latest.current;
      if (l.modal || !l.closeOnOutsideClick || !isTop() || !container) return;
      const t = e.target as Node;
      if (container.contains(t) || l.triggerRef?.current?.contains(t)) return;
      l.onClose?.();
    };

    // Keep focus inside a modal even if script or a screen-reader command moves it out.
    const onFocusIn = (e: FocusEvent) => {
      if (!latest.current.modal || !isTop() || !container) return;
      if (!container.contains(e.target as Node)) (getFocusable(container)[0] ?? container).focus();
    };

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('focusin', onFocusIn);

    const read = () => latest.current;
    const locked = read().modal;
    if (locked) {
      if (scrollLocks++ === 0) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('focusin', onFocusIn);
      stack.splice(stack.indexOf(id), 1);
      if (locked && --scrollLocks === 0) document.body.style.overflow = previousOverflow;
      if (read().restoreFocus && opener && opener.isConnected) opener.focus?.({ preventScroll: true });
    };
  }, [open, containerRef, latest]);
}
