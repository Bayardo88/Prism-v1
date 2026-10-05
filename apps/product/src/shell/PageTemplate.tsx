/**
 * PageTemplate — the base template for any screen in the product.
 *
 * Figma: "Page Template · body space used for any component" (components file
 * `Z4MtKOfkNEzhMYJzN1q3kR`, node 1671:13280). Start every new screen here:
 *
 *   <PageTemplate area="valuations" company={company} section="valuations">
 *     <YourContent />            ← the BODY-SLOT
 *   </PageTemplate>
 *
 * It wires the product's standard chrome into the design system's
 * `PageTemplate` slots: the Primary Menu (via `AppFrame`, with its global menus),
 * the company header and Secondary Menu (when a `company` is given), the
 * Tertiary Menu sub-navigation, and the docked Workspace Drawer. Omit `children`
 * and the body shows the `BodySlot` placeholder.
 *
 * Firm-level screens (no company) get the Primary Menu, the body and the
 * drawer. Pass `dock={false}` to leave the drawer off.
 *
 * Existing screens built on `CompanyLayout` keep working; use this for new ones.
 */
import type { ReactNode } from 'react';
import {
  Badge, CompanyInfo, PageTemplate as BasePageTemplate, SecondaryMenu, SecondaryMenuItem, TertiaryMenu,
} from '@scalar/design-system';
import { AppFrame, type AppFrameProps } from './AppFrame.js';
import { SECTIONS, type CompanySection } from './CompanyLayout.js';
import { WorkspaceDock, type DockTab } from './WorkspaceDock.js';
import { href } from '../router.js';
import type { Company } from '../data/fixtures.js';

export interface PageTemplateProps extends Pick<AppFrameProps, 'area' | 'openMenu' | 'overlay' | 'date'> {
  /** Show the company header and Secondary Menu. Omit for firm-level screens. */
  company?: Company;
  /** Which Secondary Menu item is current. Required with `company`. */
  section?: CompanySection;
  /** Right side of the company header: selectors, the ⋮ actions menu. */
  headerEnd?: ReactNode;
  /** Tertiary Menu items for the section's sub-pages. Omit both sub-nav props to drop the bar. */
  subNav?: ReactNode;
  /** Right side of the sub-navigation bar: currency, Save, page actions. */
  subNavEnd?: ReactNode;
  /** Shows the + after the Tertiary items; called when it is pressed. */
  subNavAdd?: () => void;
  /** Workspace drawer tabs. Pass `false` to leave the drawer off. */
  dock?: DockTab[] | false;
  /** Which dock tab is open, if any. */
  dockOpen?: string;
  /** Body shown for every dock tab. */
  dockContent?: ReactNode;
  /** Per-tab dock bodies, keyed by tab key. */
  dockPanels?: Partial<Record<string, ReactNode>>;
  /** The BODY-SLOT. Omit it and the placeholder shows. */
  children?: ReactNode;
}

export function PageTemplate({
  area, company, section, headerEnd, subNav, subNavEnd, subNavAdd, dock, dockOpen, dockContent, dockPanels,
  openMenu, overlay, date, children,
}: PageTemplateProps) {
  return (
    <AppFrame area={area} company={company} openMenu={openMenu} overlay={overlay} date={date}>
      <BasePageTemplate
        fullHeight={false}
        companyInfo={
          company && (
            <CompanyInfo name={company.name} status={<Badge>Draft</Badge>} end={headerEnd}>
              <SecondaryMenu>
                {SECTIONS.map((s) => (
                  <SecondaryMenuItem key={s.key} current={s.key === section} href={href(s.to(company.id))}>
                    {s.label}
                  </SecondaryMenuItem>
                ))}
              </SecondaryMenu>
            </CompanyInfo>
          )
        }
        subNavigation={
          (subNav || subNavEnd) && (
            <TertiaryMenu onAdd={subNavAdd} end={subNavEnd}>
              {subNav}
            </TertiaryMenu>
          )
        }
        drawer={dock !== false && <WorkspaceDock tabs={dock} open={dockOpen} panels={dockPanels}>{dockContent}</WorkspaceDock>}
      >
        {children}
      </BasePageTemplate>
    </AppFrame>
  );
}
