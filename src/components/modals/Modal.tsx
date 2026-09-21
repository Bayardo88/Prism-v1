import { useEffect, useRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Icon } from '../icon/Icon.js';
import { Close } from '../icon/glyphs.js';
import { Scrim } from '../core/Scrim.js';
import { Typography } from '../typography/Typography.js';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Whether clicking the scrim dismisses. Turn it off when state is unsaved. */
  dismissOnScrimClick?: boolean;
  className?: string;
}

/**
 * Modal — the dialog shell.
 *
 * Accessibility: a modal traps focus, closes on Escape, and returns focus to
 * whatever opened it. The scrim is a sibling, never a child.
 *
 * Use a modal when the task needs the user's whole attention or must be
 * finished before anything else. Otherwise use a Drawer, which keeps the page
 * behind visible.
 */
export function Modal({
  open, onClose, title, children, footer, dismissOnScrimClick = true, className,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    trigger.current = document.activeElement;
    ref.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;

      // Focus trap: cycle within the dialog.
      const focusable = ref.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      (trigger.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <Scrim onDismiss={dismissOnScrimClick ? onClose : undefined} />
      <div className="scalar-modal__layer">
        <div
          ref={ref}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : undefined}
          className={cx('scalar-modal', className)}
        >
          {title && (
            <header className="scalar-modal__header">
              <Typography variant="heading" step="l" weight="semiBold" as="h2">
                {title}
              </Typography>
              <ButtonIcon
                variant="tertiary"
                size="s"
                label="Close"
                onClick={onClose}
                icon={<Icon size="s" tone="inherit"><Close /></Icon>}
              />
            </header>
          )}
          <div className="scalar-modal__body">{children}</div>
          {footer && <footer className="scalar-modal__footer">{footer}</footer>}
        </div>
      </div>
    </>
  );
}
