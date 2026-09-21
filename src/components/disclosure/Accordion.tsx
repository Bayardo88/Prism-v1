import { useId, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { useControllableState } from '../../utils/useControllableState.js';
import { Icon } from '../icon/Icon.js';
import { ChevronDown, ChevronUp } from '../icon/glyphs.js';

export interface AccordionItemProps {
  title: ReactNode;
  children?: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Accordion Item — one collapsible section.
 *
 * The whole header row is the target, not just the chevron, and it carries the
 * 44px minimum.
 */
export function AccordionItem({
  title, children, open, defaultOpen = false, onOpenChange, disabled, className,
}: AccordionItemProps) {
  const id = useId();
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);

  return (
    <div className={cx('scalar-accordion-item', className)}>
      <button
        type="button"
        className="scalar-accordion-item__header"
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        id={`${id}-header`}
        disabled={disabled}
        onClick={() => setOpen(!isOpen)}
      >
        <span>{title}</span>
        <Icon size="s" tone="secondary">
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </Icon>
      </button>
      {isOpen && (
        <div className="scalar-accordion-item__panel" id={`${id}-panel`} role="region" aria-labelledby={`${id}-header`}>
          {children}
        </div>
      )}
    </div>
  );
}

export interface AccordionProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Accordion — a stack of sections the reader opens as needed.
 *
 * Use for secondary detail on a dense page — assumption notes, methodology,
 * audit history. Never hide anything required to complete the task behind a
 * collapsed section.
 *
 * Allow more than one section open at a time unless space genuinely forbids it;
 * auto-closing the previous section steals content the reader may still be
 * using. If every section ends up open, the content wanted a page.
 */
export function Accordion({ children, className }: AccordionProps) {
  return <div className={cx('scalar-accordion', className)}>{children}</div>;
}
