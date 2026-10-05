import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

export interface BodySlotProps {
  /** Overrides the placeholder text. Default: "BODY-SLOT". */
  label?: ReactNode;
  className?: string;
}

/**
 * BodySlot — the placeholder that stands in for page content.
 *
 * It is what `PageTemplate` renders when it is given no `children`. A real page
 * never ships it: pass your content as the template's children and this
 * disappears. Matches the grey `BODY-SLOT` rectangle in the Figma frame
 * "Page Template · body space used for any component".
 */
export function BodySlot({ label = 'BODY-SLOT', className }: BodySlotProps) {
  return (
    <div className={cx('scalar-body-slot', className)} data-body-slot-placeholder="" role="note" aria-label="Placeholder for page content">
      <span className="scalar-body-slot__label">{label}</span>
      <span className="scalar-body-slot__hint">Replace this with the page content</span>
    </div>
  );
}

export interface PageTemplateProps {
  /** Slot 1 — the application bar. Pass a `PrimaryMenu`. */
  navigation?: ReactNode;
  /** Slot 2 — the company header under the bar. Pass a `CompanyInfo` (with a `SecondaryMenu` as its children). */
  companyInfo?: ReactNode;
  /** Slot 3 — the sub-navigation bar at the top of the sheet. Pass a `TertiaryMenu`. */
  subNavigation?: ReactNode;
  /**
   * Slot 4 — the BODY-SLOT: the page content. Any component or composition goes
   * here. Omit it and the template shows the `BodySlot` placeholder.
   */
  children?: ReactNode;
  /** Slot 5 — the docked drawer at the foot of the page. Pass a `WorkspaceDrawer`. */
  drawer?: ReactNode;
  /**
   * Fill the viewport height (default). Set `false` when something else already
   * owns the page height — for example when the template is nested in an app
   * frame that renders its own full-height column.
   */
  fullHeight?: boolean;
  className?: string;
}

/**
 * PageTemplate — the base template for every screen in the product.
 *
 * Figma: "Page Template · body space used for any component"
 * (components file `Z4MtKOfkNEzhMYJzN1q3kR`, node 1671:13280).
 *
 * ```
 * ┌ navigation ─────────────────────────────┐  Primary Menu (48)
 * │ companyInfo                             │  Company info + Secondary Menu (32)
 * │ ┌ sheet ──────────────────────────────┐ │
 * │ │ subNavigation                       │ │  Tertiary Menu (40)
 * │ │ ┌ BODY-SLOT ──────────────────────┐ │ │
 * │ │ │ children                        │ │ │  fills the remaining height
 * │ │ └─────────────────────────────────┘ │ │
 * │ └─────────────────────────────────────┘ │
 * │ drawer                                  │  Workspace Drawer, docked (28)
 * └─────────────────────────────────────────┘
 * ```
 *
 * Every slot is optional and independent. The body slot takes all the height the
 * other slots leave over and scrolls on its own, so the navigation above it and
 * the drawer below it stay put. Never restyle the slots from outside — change the
 * component you pass in.
 */
export function PageTemplate({ navigation, companyInfo, subNavigation, children, drawer, fullHeight = true, className }: PageTemplateProps) {
  return (
    <div className={cx('scalar-page-template', fullHeight && 'scalar-page-template--full', className)}>
      {navigation}
      <div className="scalar-page-template__body">
        {companyInfo}
        <div className="scalar-page-template__sheet">
          {subNavigation}
          <main className="scalar-page-template__slot" data-slot="body">
            {children ?? <BodySlot />}
          </main>
        </div>
        {drawer && <div className="scalar-page-template__drawer">{drawer}</div>}
      </div>
    </div>
  );
}
