import { useEffect, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Icon } from '../icon/Icon.js';
import { Close } from '../icon/glyphs.js';
import { Scrim } from '../core/Scrim.js';
import { Typography } from '../typography/Typography.js';

export type DrawerSide = 'right' | 'left' | 'bottom';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  /** Real Button instances above a divider. */
  footer?: ReactNode;
  /**
   * Right is the default, for detail and edit flows. Left is for navigation.
   * Bottom is for narrow viewports.
   */
  side?: DrawerSide;
  className?: string;
}

/**
 * Drawer — a panel that slides in over the page for a focused task, without
 * losing the context behind it.
 *
 * A drawer keeps the page behind visible on purpose. If the task needs the
 * user's whole attention, or must be finished before anything else, use a
 * Modal instead.
 *
 * Escape closes it, and focus returns to whatever opened it.
 */
export function Drawer({ open, onClose, title, children, footer, side = 'right', className }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <Scrim onDismiss={onClose} />
      <aside
        className={cx('scalar-drawer', `scalar-drawer--${side}`, className)}
        role="dialog"
        aria-modal="false"
        aria-label={typeof title === 'string' ? title : undefined}
      >
        <header className="scalar-drawer__header">
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
        <div className="scalar-drawer__body">{children}</div>
        {footer && <footer className="scalar-drawer__footer">{footer}</footer>}
      </aside>
    </>
  );
}
