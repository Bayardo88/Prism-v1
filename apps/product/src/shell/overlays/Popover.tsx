/**
 * Positioning + dismissal for the Primary Menu popovers. The DS surfaces
 * (ComboboxPanel, MenuPanel, NotificationCenter) are surfaces only — the
 * trigger owns open state, placement and outside-click dismissal, so that
 * lives here, once, for every global menu.
 */
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { space, zIndex } from '@scalar/design-system';

export function Popover({ onClose, placement, children, label }: {
  onClose: () => void;
  /** Horizontal anchor under the trigger, as a share of the bar width. */
  placement: { left: string } | { right: string };
  children: ReactNode;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    // Attach after the opening click has finished propagating.
    const t = window.setTimeout(() => document.addEventListener('click', onClick), 0);
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const style: CSSProperties = {
    position: 'absolute',
    top: space.xs,
    zIndex: zIndex.overlay,
    ...placement,
  };

  return (
    <div ref={ref} style={style} aria-label={label}>
      {children}
    </div>
  );
}
