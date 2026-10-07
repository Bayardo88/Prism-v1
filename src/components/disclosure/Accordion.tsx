import {
  createContext, forwardRef, useContext, useId,
  type HTMLAttributes, type ReactNode,
} from 'react';
import { cx } from '../../utils/cx.js';
import { useControllableState } from '../../utils/useControllableState.js';
import { useRovingFocus } from '../../utils/useRovingFocus.js';
import { Icon } from '../icon/Icon.js';
import { ChevronDown, ChevronUp } from '../icon/glyphs.js';

export type AccordionType = 'single' | 'multiple';
export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface AccordionContextValue {
  type: AccordionType;
  value: string[];
  toggle: (value: string, open: boolean) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export interface AccordionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  children?: ReactNode;
  /** Controlled open state. Wins over the parent Accordion's `value`. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /**
   * Identifies the item to a parent `Accordion` that is controlling (or limiting
   * to one) the open sections. Ignored when the item is used on its own.
   */
  value?: string;
  /** Level of the heading that wraps the header button, so it joins the outline. Default 3. */
  headingLevel?: AccordionHeadingLevel;
  /** Keep the panel in the DOM (hidden) while closed. Default false: it unmounts. */
  keepMounted?: boolean;
  /**
   * Expose the open panel as a `region` landmark labelled by its header. Default
   * true; turn it off in long accordions, where a dozen landmarks are noise.
   */
  panelRegion?: boolean;
}

/**
 * Accordion Item — one collapsible section.
 *
 * The whole header row is the target, not just the chevron, and it carries the
 * 44px minimum.
 *
 * Accessibility: the header is a button inside a heading (`headingLevel`), with
 * `aria-expanded` and `aria-controls` (the latter only while the panel exists).
 */
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  {
    title, children, open, defaultOpen = false, onOpenChange, disabled, value, headingLevel = 3,
    keepMounted = false, panelRegion = true, className, ...rest
  },
  ref,
) {
  const id = useId();
  const group = useContext(AccordionContext);
  const [ownOpen, setOwnOpen] = useControllableState(open, defaultOpen, onOpenChange);

  const grouped = group !== null && value !== undefined && open === undefined;
  const isOpen = grouped ? group.value.includes(value) : ownOpen;
  const toggle = () => {
    if (grouped) {
      group.toggle(value, !isOpen);
      onOpenChange?.(!isOpen);
    } else setOwnOpen(!isOpen);
  };

  const Heading = `h${headingLevel}` as const;
  const panelId = `${id}-panel`;
  const showPanel = isOpen || keepMounted;

  return (
    <div ref={ref} className={cx('scalar-accordion-item', className)} {...rest}>
      <Heading className="scalar-accordion-item__heading">
        <button
          type="button"
          className="scalar-accordion-item__header"
          aria-expanded={isOpen}
          aria-controls={showPanel ? panelId : undefined}
          id={`${id}-header`}
          disabled={disabled}
          onClick={toggle}
        >
          <span>{title}</span>
          <Icon size="s" tone="secondary">
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </Icon>
        </button>
      </Heading>
      {showPanel && (
        <div
          className="scalar-accordion-item__panel"
          id={panelId}
          role={panelRegion ? 'region' : undefined}
          aria-labelledby={panelRegion ? `${id}-header` : undefined}
          hidden={!isOpen}
        >
          {children}
        </div>
      )}
    </div>
  );
});

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  children?: ReactNode;
  /**
   * `multiple` (default) lets any number of sections be open; `single` keeps
   * one open at a time. Only items that carry a `value` take part.
   */
  type?: AccordionType;
  /** Controlled list of open item values. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
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
 *
 * Keyboard: with focus on a header, ↑/↓ move to the previous/next header and
 * Home/End to the first/last (APG accordion). Tab still visits every header.
 * Pass `value` on the items and `type`/`value`/`defaultValue` here to coordinate
 * them; plain items keep their own state.
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { children, className, type = 'multiple', value, defaultValue = [], onValueChange, onKeyDown, ...rest },
  ref,
) {
  const [open, setOpen] = useControllableState<string[]>(value, defaultValue, onValueChange);
  const roving = useRovingFocus({
    orientation: 'vertical',
    itemSelector: '.scalar-accordion-item__header',
    manageTabIndex: false,
  });

  const toggle = (itemValue: string, next: boolean) => {
    if (type === 'single') setOpen(next ? [itemValue] : []);
    else setOpen(next ? [...open, itemValue] : open.filter((v) => v !== itemValue));
  };

  return (
    <AccordionContext.Provider value={{ type, value: open, toggle }}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- keydown is delegated from the header buttons inside */}
      <div
        ref={ref}
        className={cx('scalar-accordion', className)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          roving.onKeyDown(e);
        }}
        {...rest}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
});
