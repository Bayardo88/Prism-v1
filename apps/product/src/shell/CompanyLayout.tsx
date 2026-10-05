/**
 * Company-scoped pages: the company header (name + Secondary Menu of company
 * sections), an optional sub-navigation bar (Tertiary Menu items + actions),
 * the content, an optional footer action bar and the Workspace dock.
 *
 * Every page on Figma pages 06–11 is one of these.
 */
import type { ReactNode } from 'react';
import {
  Badge, CompanyInfo, SecondaryMenu, SecondaryMenuItem, TertiaryMenu, space,
} from '@scalar/design-system';
import { AppFrame, type AppFrameProps } from './AppFrame.js';
import { WorkspaceDock, type DockTab } from './WorkspaceDock.js';
import { href } from '../router.js';
import { routes } from '../routes.js';
import type { Company } from '../data/fixtures.js';

export type CompanySection = 'summary' | 'financials' | 'cap-table' | 'valuations' | 'waterfall' | 'documents' | 'overview';

export const SECTIONS: Array<{ key: CompanySection; label: string; to: (id: string) => string }> = [
  { key: 'summary', label: 'Summary', to: routes.company.summary },
  { key: 'financials', label: 'Financials', to: routes.company.incomeStatement },
  { key: 'cap-table', label: 'Cap Table', to: routes.company.capTable },
  { key: 'valuations', label: 'Valuations', to: routes.company.valuationSummary },
  { key: 'waterfall', label: 'Waterfall', to: routes.company.waterfall },
  { key: 'documents', label: 'Documents', to: routes.company.documents },
];

export interface CompanyLayoutProps extends Pick<AppFrameProps, 'openMenu' | 'overlay' | 'date'> {
  company: Company;
  section: CompanySection;
  /** Right side of the company header: Financials Date, version selectors, the ⋮ actions menu. */
  headerEnd?: ReactNode;
  /** Tertiary Menu items for the section's sub-pages. */
  subNav?: ReactNode;
  /** Right side of the sub-navigation bar: currency, Save, page actions. */
  subNavEnd?: ReactNode;
  /** Shows the + after the Tertiary items; called when it is pressed. */
  subNavAdd?: () => void;
  /** Sticky footer actions (e.g. "Add Projection Year"). */
  footer?: ReactNode;
  /** Workspace dock tabs. Pass `false` to hide the dock. */
  dock?: DockTab[] | false;
  /** Which dock tab is open, if any — opens the drawer. */
  dockOpen?: string;
  /** Body shown for every dock tab. */
  dockContent?: ReactNode;
  /** Per-tab dock bodies, keyed by tab key; win over `dockContent`. */
  dockPanels?: Partial<Record<string, ReactNode>>;
  children?: ReactNode;
}

export function CompanyLayout({
  company, section, headerEnd, subNav, subNavEnd, subNavAdd, footer, dock, dockOpen, dockContent, dockPanels,
  openMenu, overlay, date, children,
}: CompanyLayoutProps) {
  return (
    <AppFrame area="company" company={company} openMenu={openMenu} overlay={overlay} date={date}>
      <CompanyInfo name={company.name} status={<Badge>Draft</Badge>} end={headerEnd}>
        <SecondaryMenu>
          {SECTIONS.map((s) => (
            <SecondaryMenuItem key={s.key} current={s.key === section} href={href(s.to(company.id))}>
              {s.label}
            </SecondaryMenuItem>
          ))}
        </SecondaryMenu>
      </CompanyInfo>

      {(subNav || subNavEnd) && (
        <TertiaryMenu onAdd={subNavAdd} end={subNavEnd}>
          {subNav}
        </TertiaryMenu>
      )}

      <main style={{ flex: 1, padding: space.l, display: 'flex', flexDirection: 'column', gap: space.l }}>
        {children}
      </main>

      {footer && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: space.s, padding: `${space.s} ${space.l}` }}>
          {footer}
        </div>
      )}

      {dock !== false && <WorkspaceDock tabs={dock} open={dockOpen} panels={dockPanels}>{dockContent}</WorkspaceDock>}
    </AppFrame>
  );
}
