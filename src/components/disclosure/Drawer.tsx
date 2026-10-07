import { forwardRef, useId, useRef, type HTMLAttributes, type ReactNode, type RefObject } from 'react';
import { cx } from '../../utils/cx.js';
import { composeRefs } from '../../utils/refs.js';
import { useOverlay } from '../../utils/useOverlay.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Icon } from '../icon/Icon.js';
import { Close } from '../icon/glyphs.js';
import { Scrim } from '../core/Scrim.js';
import { Typography } from '../typography/Typography.js';

export type DrawerSide = 'right' | 'left' | 'bottom';

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
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
  /**
   * Modal (default): a scrim covers the page, Tab is trapped inside, the page
   * does not scroll and `aria-modal` is true. Non-modal: no scrim, Tab can leave
   * the drawer and a click outside closes it.
   */
  modal?: boolean;
  /** Element to focus on open. Defaults to the first tabbable control (the Close button). */
  initialFocus?: RefObject<HTMLElement | null>;
  /** The control that opened the drawer, so a click on it is not an "outside" click. */
  triggerRef?: RefObject<HTMLElement | null>;
  /** Return focus to the opener on close. Default true. */
  restoreFocus?: boolean;
}

/**
 * Drawer — a panel that slides in over the page for a focused task, without
 * losing the context behind it.
 *
 * A drawer keeps the page behind visible on purpose. If the task needs the
 * user's whole attention, or must be finished before anything else, use a
 * Modal instead.
 *
 * Accessibility: `role="dialog"` labelled by its title. On open, focus moves
 * into the drawer; Escape closes it; on close focus returns to whatever opened
 * it (`restoreFocus`). With `modal` (default) Tab is trapped; with
 * `modal={false}` there is no scrim and Tab and outside clicks leave it.
 */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
    open, onClose, title, children, footer, side = 'right', modal = true,
    initialFocus, triggerRef, restoreFocus, className, ...rest
  },
  ref,
) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  useOverlay({ open, onClose, containerRef, modal, initialFocus, triggerRef, restoreFocus });

  if (!open) return null;

  return (
    <>
      {modal && <Scrim onDismiss={onClose} />}
      <div
        aria-labelledby={title ? titleId : undefined}
        {...rest}
        ref={composeRefs(ref, containerRef)}
        className={cx('scalar-drawer', `scalar-drawer--${side}`, className)}
        role="dialog"
        aria-modal={modal}
      >
        <header className="scalar-drawer__header">
          <Typography variant="heading" step="l" weight="semiBold" as="h2" id={titleId}>
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
      </div>
    </>
  );
});
