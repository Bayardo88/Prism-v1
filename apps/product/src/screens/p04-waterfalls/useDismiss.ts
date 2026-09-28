/**
 * Outside-click and Escape dismissal for a trigger-owned popover
 * (ComboboxPanel, ContextMenu). The DS surfaces are surfaces only — the
 * trigger owns open state, positioning and dismissal (AI-GUIDE §7).
 * Mark the trigger (or a wrapper) with `data-popover-trigger`.
 * Shared by the waterfall and documents screens (p04, p05, p09, p10).
 */
import { useEffect, type RefObject } from 'react';

export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, close: () => void): void {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Element;
      // The trigger toggles on its own click; ignore it here so it doesn't re-open.
      if (t.closest?.('[data-popover-trigger]')) return;
      if (ref.current && !ref.current.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, open, close]);
}
