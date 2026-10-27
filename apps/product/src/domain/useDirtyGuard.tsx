/**
 * Unsaved-changes guard (P9). While `dirty`:
 * - any in-app link click asks first, with a ConfirmationDialog whose confirm
 *   repeats the verb ("Leave anyway");
 * - a browser reload or close is guarded with `beforeunload`;
 * - `guarded(fn)` (used by the version and date pickers in the header) asks
 *   before running `fn`, so a version switch never drops edits silently.
 *
 *   const guard = useDirtyGuard(dirty, { onDiscard: reset });
 *   …
 *   {guard.dialog}
 */
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { ConfirmationDialog } from '@scalar/design-system';

type Pending = { kind: 'link'; href: string } | { kind: 'action'; run: () => void };

interface Active { dirty: boolean; request: (p: Pending) => void }
/** Every mounted guard (a page editor and a notes panel can both be open). */
const actives = new Set<Active>();

/** Run an action that changes what the page shows, asking first if anything on the page has unsaved edits. */
export function guarded(run: () => void): void {
  const dirty = [...actives].find((a) => a.dirty);
  if (dirty) dirty.request({ kind: 'action', run });
  else run();
}

export interface DirtyGuardOptions {
  /** Called when the user chooses to leave: drop the edits. */
  onDiscard?: () => void;
  /** Open the dialog on first render (Figma states that draw it). */
  initiallyOpen?: boolean;
  /** Where the initially open dialog leads. */
  initialHref?: string;
}

export interface DirtyGuard {
  open: boolean;
  /** Ask, as if the user had clicked a link to `href`. */
  ask: (href: string) => void;
  dialog: ReactElement;
}

export function useDirtyGuard(dirty: boolean, opts: DirtyGuardOptions = {}): DirtyGuard {
  const [pending, setPending] = useState<Pending | null>(
    opts.initiallyOpen ? { kind: 'link', href: opts.initialHref ?? window.location.hash } : null,
  );
  const self = useRef<Active>({ dirty, request: setPending });
  self.current.dirty = dirty;

  useEffect(() => {
    const me = self.current;
    actives.add(me);
    return () => { actives.delete(me); };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (!a) return;
      const target = a.getAttribute('href')!;
      if (target === window.location.hash) return;
      e.preventDefault();
      // Only one dirty guard on the page asks.
      e.stopImmediatePropagation();
      setPending({ kind: 'link', href: target });
    };
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    document.addEventListener('click', onClick, true);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [dirty]);

  const leave = () => {
    const p = pending;
    setPending(null);
    opts.onDiscard?.();
    if (p?.kind === 'link') window.location.hash = p.href.replace(/^#/, '');
    else p?.run();
  };

  const dialog = (
    <ConfirmationDialog
      open={pending !== null}
      title="Leave without saving?"
      confirmLabel="Leave anyway"
      cancelLabel="Stay on page"
      destructive
      onConfirm={leave}
      onCancel={() => setPending(null)}
    >
      Are you sure you want to continue? All changes will be lost if you leave this page without saving.
    </ConfirmationDialog>
  );

  return { open: pending !== null, ask: (href) => setPending({ kind: 'link', href }), dialog };
}
