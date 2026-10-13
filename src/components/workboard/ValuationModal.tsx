import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Modal, type ModalProps } from '../modals/Modal.js';

/* ---------------------------------------------------------------------------
 * Figure List
 * ------------------------------------------------------------------------ */

export interface FigureItem {
  label: ReactNode;
  value: ReactNode;
}

export interface FigureListProps extends HTMLAttributes<HTMLDListElement> {
  /** One tile per figure, laid out in equal columns on one row. */
  items: readonly FigureItem[];
}

/**
 * Figure List — a valuation's key figures as tiles (Valuation Date, Fee, Net
 * Value, Split, Booking Date). Figma: workboard "Valuation Numbers" (405:13342).
 *
 * Tokens: Background/Subtle tiles, Radius/S, Space/M padding, Space/S gaps;
 * label Text/M, value Heading/XL bold with tabular figures, both Text/Primary.
 *
 * Accessibility: a description list, so each value is read with its label.
 */
export const FigureList = forwardRef<HTMLDListElement, FigureListProps>(function FigureList(
  { items, className, ...rest },
  ref,
) {
  return (
    <dl ref={ref} className={cx('scalar-figures', className)} {...rest}>
      {items.map((item, i) => (
        <div key={i} className="scalar-figure">
          <dt className="scalar-figure__label">{item.label}</dt>
          <dd className="scalar-figure__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
});

/* ---------------------------------------------------------------------------
 * Valuation Panel
 * ------------------------------------------------------------------------ */

export interface ValuationPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The panel's heading ("Valued Entity", "Model"). */
  title?: ReactNode;
  /** The heading level. Default 3. */
  headingLevel?: 2 | 3 | 4;
  /** Beside the heading: a button or a segmented control. */
  action?: ReactNode;
  children?: ReactNode;
  /** Pinned to the bottom of the panel (people tiles, Save). */
  footer?: ReactNode;
}

/**
 * Valuation Panel — one of the Valuation modal's lower panels: heading and
 * action, content, and a footer pinned to the bottom so the three panels'
 * footers line up. Figma: workboard "Container" (536:23966 · 536:24007 · 536:24051).
 *
 * Tokens: Background/Surface, Radius/S, Space/L padding, Space/XL between the
 * content and the footer; heading Heading/XL bold.
 *
 * Accessibility: a region named by its heading when it has one.
 */
export const ValuationPanel = forwardRef<HTMLElement, ValuationPanelProps>(function ValuationPanel(
  { title, headingLevel = 3, action, children, footer, className, ...rest },
  ref,
) {
  const titleId = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      ref={ref}
      aria-labelledby={title ? titleId : undefined}
      className={cx('scalar-valuation-panel', className)}
      {...rest}
    >
      <div className="scalar-valuation-panel__main">
        {(title || action) && (
          <header className="scalar-valuation-panel__header">
            {title && <Heading id={titleId} className="scalar-valuation-panel__title">{title}</Heading>}
            {action}
          </header>
        )}
        {children}
      </div>
      {footer && <div className="scalar-valuation-panel__footer">{footer}</div>}
    </section>
  );
});

/* ---------------------------------------------------------------------------
 * Valuation Summary
 * ------------------------------------------------------------------------ */

export interface ValuationSummaryProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The overline title. Default "Valuation". */
  title?: ReactNode;
  /** Chips after the title (deal kind, notices). */
  tags?: ReactNode;
  /** The trailing status control ("Status:" + `StatusTrigger`). */
  status?: ReactNode;
  /** The subject: usually a large company link. */
  subject?: ReactNode;
  /** Beside the subject: folder, documents, onboarding, report. */
  meta?: ReactNode;
  /** The people row: `AssigneeCard`s, laid out in equal columns. */
  people?: ReactNode;
  /** Under the people: usually a `FigureList`. */
  figures?: ReactNode;
  /** The column on the right: usually a `DealCard tone="deal"`. */
  aside?: ReactNode;
}

/**
 * Valuation Summary — the Valuation modal's top panel: title, tags and status;
 * the company with its folder and onboarding; the people on the engagement,
 * the figures, and the deal beside them. Layout only — every part is a slot.
 * Figma: workboard "Valuation Container" (536:23867).
 *
 * Tokens: Background/Surface, Radius/S, Space/L padding and gaps; title
 * Heading/XL bold; the aside is three Sizing/Avatar/XL wide (240px).
 */
export const ValuationSummary = forwardRef<HTMLElement, ValuationSummaryProps>(function ValuationSummary(
  { title = 'Valuation', tags, status, subject, meta, people, figures, aside, className, ...rest },
  ref,
) {
  const titleId = useId();
  return (
    <section ref={ref} aria-labelledby={titleId} className={cx('scalar-valuation-summary', className)} {...rest}>
      <div className="scalar-valuation-summary__head">
        <div className="scalar-valuation-summary__row">
          <div className="scalar-valuation-summary__titles">
            <h2 id={titleId} className="scalar-valuation-summary__title">{title}</h2>
            {tags}
          </div>
          {status && <div className="scalar-valuation-summary__status">{status}</div>}
        </div>
        {(subject || meta) && (
          <div className="scalar-valuation-summary__row">
            <div className="scalar-valuation-summary__subject">{subject}</div>
            {meta && <div className="scalar-valuation-summary__meta">{meta}</div>}
          </div>
        )}
      </div>
      {(people || figures || aside) && (
        <div className="scalar-valuation-summary__body">
          <div className="scalar-valuation-summary__main">
            {people && <div className="scalar-valuation-summary__people">{people}</div>}
            {figures}
          </div>
          {aside && <div className="scalar-valuation-summary__aside">{aside}</div>}
        </div>
      )}
    </section>
  );
});

/* ---------------------------------------------------------------------------
 * Valuation Modal
 * ------------------------------------------------------------------------ */

export type ValuationModalProps = Omit<ModalProps, 'title' | 'footer' | 'size' | 'children'> & {
  /** The top panel: a `ValuationSummary`. */
  summary: ReactNode;
  /** The lower panels: three `ValuationPanel`s (entity · model · notes). */
  children?: ReactNode;
} & ({ 'aria-label': string } | { 'aria-labelledby': string });

/**
 * Valuation Modal — one valuation in full, opened from a Workboard row: the
 * summary on top and three panels below (valued entity, model, notes). The
 * shell is `Modal` at `size="2xl"` with no header — the summary carries the
 * title — so name it with `aria-label` (the compiler requires one). Figma:
 * workboard "Main Container" (536:23865 and its states).
 *
 * Tokens: the modal ground is Background/Subtle with Space/S between panels.
 *
 * Accessibility: everything `Modal` does — focus trap, Escape, scroll lock,
 * focus return.
 */
export const ValuationModal = forwardRef<HTMLDivElement, ValuationModalProps>(function ValuationModal(
  { summary, children, className, ...rest },
  ref,
) {
  return (
    <Modal ref={ref} size="2xl" className={cx('scalar-valuation-modal', className)} {...rest}>
      {summary}
      {children && <div className="scalar-valuation-modal__panels">{children}</div>}
    </Modal>
  );
});
