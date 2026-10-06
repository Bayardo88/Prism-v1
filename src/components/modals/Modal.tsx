import { forwardRef, useId, useRef, type HTMLAttributes, type ReactNode, type RefObject } from 'react';
import { cx } from '../../utils/cx.js';
import { composeRefs } from '../../utils/refs.js';
import { useOverlay } from '../../utils/useOverlay.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Icon } from '../icon/Icon.js';
import { Close } from '../icon/glyphs.js';
import { Scrim } from '../core/Scrim.js';
import { Typography } from '../typography/Typography.js';

/** Modal width: s 400 · m 560 (default) · l 800 · xl 1120. Never wider than the viewport. */
export type ModalSize = 's' | 'm' | 'l' | 'xl';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  /** The heading. It names the dialog (`aria-labelledby`), whatever node it is. */
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Whether clicking the scrim dismisses. Turn it off when state is unsaved. */
  dismissOnScrimClick?: boolean;
  /**
   * Width. `s` for a short confirm-style form, `m` (default) for most tasks,
   * `l` for a two-column form or a small table, `xl` for a grid or a document
   * preview.
   */
  size?: ModalSize;
  /** `alertdialog` for a confirmation that interrupts the user. Default `dialog`. */
  role?: 'dialog' | 'alertdialog';
  /** What receives focus on open. Default: the first tabbable control. */
  initialFocus?: RefObject<HTMLElement | null>;
}

/**
 * Modal — the dialog shell.
 *
 * Accessibility: a modal traps focus, closes on Escape (top-most only), locks
 * page scroll and returns focus to whatever opened it. `onClose` may be an
 * inline function; changing it never moves focus. The scrim is a sibling,
 * never a child. `ref`, `id`, `aria-*` and `data-*` land on the dialog element.
 *
 * Use a modal when the task needs the user's whole attention or must be
 * finished before anything else. Otherwise use a Drawer, which keeps the page
 * behind visible.
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open, onClose, title, children, footer, dismissOnScrimClick = true, size = 'm', role = 'dialog',
    initialFocus, className, ...rest
  },
  forwardedRef,
) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlay({ open, onClose, containerRef: ref, modal: true, initialFocus });

  if (!open) return null;

  const labelledBy = rest['aria-labelledby'] ?? (title && !rest['aria-label'] ? titleId : undefined);

  return (
    <>
      <Scrim onDismiss={dismissOnScrimClick ? onClose : undefined} />
      <div className="scalar-modal__layer">
        <div
          {...rest}
          ref={composeRefs(ref, forwardedRef)}
          tabIndex={-1}
          role={role}
          aria-modal="true"
          aria-labelledby={labelledBy}
          className={cx('scalar-modal', `scalar-modal--${size}`, className)}
        >
          {title && (
            <header className="scalar-modal__header">
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
          )}
          <div className="scalar-modal__body">{children}</div>
          {footer && <footer className="scalar-modal__footer">{footer}</footer>}
        </div>
      </div>
    </>
  );
});
