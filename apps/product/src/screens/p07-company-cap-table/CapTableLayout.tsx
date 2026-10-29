/**
 * The frame shared by the four Cap Table sub-pages: the company header with
 * the Cap Table Version picker and Draft status, the Tertiary sub-nav
 * (Cap Table · Fund Ownership · Breakpoint Analysis · Cash Flow Ledger) and the
 * Workspace dock.
 */
import type { ReactNode } from 'react';
import { ModalStatus, TertiaryMenuItem, type SaveStateValue } from '@scalar/design-system';
import { CompanyLayout } from '../../shell/CompanyLayout.js';
import { ToolbarAi, ToolbarCurrency, ToolbarKebab, ToolbarSave, ToolbarTableTools } from '../../shell/Toolbar.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import type { Company } from '../../data/fixtures.js';
import type { DockTab } from '../../shell/WorkspaceDock.js';
import { VersionPicker } from '../../shell/VersionPicker.js';

export type CapTablePage = 'securities' | 'fund-ownership' | 'breakpoints' | 'cash-flow-ledger';

const PAGES: Array<{ key: CapTablePage; label: string; to: (id: string) => string }> = [
  { key: 'securities', label: 'Cap Table', to: routes.company.capTable },
  { key: 'fund-ownership', label: 'Fund Ownership', to: routes.company.fundOwnership },
  { key: 'breakpoints', label: 'Breakpoint Analysis', to: routes.company.breakpoints },
  { key: 'cash-flow-ledger', label: 'Cash Flow Ledger', to: routes.company.cashFlowLedger },
];

export const CAP_TABLE_DOCK: DockTab[] = [
  { key: 'notes', label: 'Notes', count: 0 },
  { key: 'sheets', label: 'Sheets' },
  { key: 'documents', label: 'Documents' },
];

export interface CapTableLayoutProps {
  company: Company;
  page: CapTablePage;
  /** Show the company-currency pill (Cap Table and Fund Ownership only). */
  currency?: boolean;
  /** Show Save (hidden while breakpoints are calculated — nothing to save). */
  save?: boolean;
  onSave?: () => void;
  /** The page's own action, in the Tertiary Menu between the table tools and Save. */
  action?: ReactNode;
  /** Shown beside Save (P9). */
  saveState?: SaveStateValue;
  footer?: ReactNode;
  overlay?: ReactNode;
  children?: ReactNode;
}

export function CapTableLayout({ company, page, currency, save = true, onSave, action, saveState, footer, overlay, children }: CapTableLayoutProps) {
  return (
    <CompanyLayout
      company={company}
      section="cap-table"
      dock={CAP_TABLE_DOCK}
      overlay={overlay}
      footer={footer}
      headerEnd={
        <>
          {/* P4: picking a Cap Table version also selects its paired Fund Ownership version. */}
          <VersionPicker company={company} kind="capTable" />
          <ModalStatus state="draft" />
          <ToolbarKebab label="Cap table actions" />
        </>
      }
      subNav={PAGES.map((p) => (
        <TertiaryMenuItem key={p.key} current={p.key === page} href={href(p.to(company.id))}>{p.label}</TertiaryMenuItem>
      ))}
      subNavEnd={
        <>
          <ToolbarAi />
          {currency && <ToolbarCurrency />}
          <ToolbarTableTools />
          {action}
          {save && <ToolbarSave onClick={onSave} state={saveState} />}
        </>
      }
    >
      {children}
    </CompanyLayout>
  );
}
