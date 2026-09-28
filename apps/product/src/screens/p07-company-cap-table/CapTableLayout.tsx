/**
 * The frame shared by the four Cap Table sub-pages: the company header with
 * the Cap Table Version picker and Draft status, the Tertiary sub-nav
 * (Cap Table · Fund Ownership · Breakpoint Analysis · Cash Flow Ledger) and the
 * Workspace dock.
 */
import { useState, type ReactNode } from 'react';
import {
  ButtonIcon, CurrencySelector, Icon, ModalStatus, SelectMenu, SelectMenuOption, Selector, SplitButton,
  TertiaryMenuItem, icons, zIndex,
} from '@scalar/design-system';
import { CompanyLayout } from '../../shell/CompanyLayout.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import type { Company } from '../../data/fixtures.js';
import type { DockTab } from '../../shell/WorkspaceDock.js';

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
  footer?: ReactNode;
  overlay?: ReactNode;
  children?: ReactNode;
}

const VERSIONS = ['Primary Captable'] as const;

export function CapTableLayout({ company, page, currency, save = true, onSave, footer, overlay, children }: CapTableLayoutProps) {
  const [versionOpen, setVersionOpen] = useState(false);
  const [version, setVersion] = useState<string>(VERSIONS[0]);
  return (
    <CompanyLayout
      company={company}
      section="cap-table"
      dock={CAP_TABLE_DOCK}
      overlay={overlay}
      footer={footer}
      headerEnd={
        <>
          <div style={{ position: 'relative' }}>
            <Selector
              surface="surface"
              label="Cap Table Version"
              value={version}
              expanded={versionOpen}
              onClick={() => setVersionOpen((o) => !o)}
            />
            {versionOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: zIndex.overlay }}>
                <SelectMenu label="Cap table version">
                  {VERSIONS.map((v) => (
                    <SelectMenuOption key={v} selected={v === version} onSelect={() => { setVersion(v); setVersionOpen(false); }}>{v}</SelectMenuOption>
                  ))}
                </SelectMenu>
              </div>
            )}
          </div>
          <ModalStatus state="draft" />
          <ButtonIcon
            variant="tertiary"
            size="s"
            label="Cap table actions"
            icon={<Icon size="s" tone="inherit"><icons.MoreVert /></Icon>}
          />
        </>
      }
      subNav={PAGES.map((p) => (
        <TertiaryMenuItem key={p.key} current={p.key === page} href={href(p.to(company.id))}>{p.label}</TertiaryMenuItem>
      ))}
      subNavEnd={
        <>
          {currency && <CurrencySelector>USD</CurrencySelector>}
          {save && (
            <SplitButton tone="positive" menuLabel="More save options" onClick={onSave}>Save</SplitButton>
          )}
        </>
      }
    >
      {children}
    </CompanyLayout>
  );
}
