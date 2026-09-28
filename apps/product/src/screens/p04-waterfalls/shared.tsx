/**
 * Pieces shared by the firm Waterfalls page (p04) and the company Waterfall
 * page (p09): the scenario columns derived from a company record, the
 * "Create Waterfall View" modal and the Workspace dock's per-tab panels.
 */
import { useState, type ReactNode } from 'react';
import {
  Button, EmptyState, FileRow, FloatingLabelInput, Icon, Link, Modal, icons, space,
} from '@scalar/design-system';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import type { Company } from '../../data/fixtures.js';
import type { DockTab } from '../../shell/WorkspaceDock.js';
import type { ScenarioColumn } from './ScenarioGrid.js';

export const EXIT_DATE = '09/22/2026';

/** Companies that report in a non-USD currency (Backside Blocks: NIO, shown in EUR — as in the frames). */
const REPORTING: Record<string, { currency: string; symbol: string; display: string; displaySymbol: string; rate: number }> = {
  'backside-blocks': { currency: 'NIO', symbol: 'NIO ', display: 'EUR', displaySymbol: '€', rate: 0.02 },
};

/**
 * The scenario sheet's columns for a company, from its database record:
 * exit enterprise value = the record's equity value, cash ≈ 10% of LTM
 * revenue, debt ≈ 1.5× positive LTM EBITDA, all in millions.
 */
export function scenarioFor(company: Company | undefined): { columns: ScenarioColumn[]; band?: { rate: string; unit: string }; rateLabel: string } {
  if (!company) {
    return {
      rateLabel: 'USD · ($) Millions',
      columns: [{
        key: 'input', currency: 'USD', symbol: '$', editable: true, exitDate: EXIT_DATE,
        fxRate: 0, exitEnterpriseValue: 0, cash: 0, debt: 0, ownershipPct: 0,
      }],
    };
  }
  const m = (v: number) => Math.round(v / 1e5) / 10;
  const base = {
    company: company.name, capTableDate: company.asOf, capTable: 'Primary Captable', exitDate: EXIT_DATE,
    ownershipPct: company.ownershipPct,
  };
  const figures = (k: number) => ({
    exitEnterpriseValue: m(company.equityValue) * k,
    cash: m(company.revenueLtm * 0.1) * k,
    debt: m(Math.max(0, company.ebitdaLtm) * 1.5) * k,
  });
  const fx = REPORTING[company.id];
  if (!fx) {
    return {
      rateLabel: 'USD · ($) Millions',
      band: { rate: 'USD', unit: '($) Millions' },
      columns: [{ key: 'input', currency: 'USD', symbol: '$', editable: true, fxRate: 1, ...base, ...figures(1) }],
    };
  }
  const local = 1 / fx.rate;
  return {
    rateLabel: `1 ${fx.currency} → ${fx.rate} ${fx.display} · (${fx.displaySymbol}) Millions`,
    band: { rate: `1 ${fx.currency} → ${fx.rate} ${fx.display}`, unit: `(${fx.displaySymbol}) Millions` },
    columns: [
      { key: 'input', currency: fx.currency, symbol: fx.symbol, editable: true, fxRate: 1, ...base, ...figures(local) },
      { key: 'display', currency: fx.display, symbol: fx.displaySymbol, editable: false, fxRate: fx.rate, ...base, ...figures(1) },
    ],
  };
}

export const WATERFALL_DOCK: DockTab[] = [
  { key: 'notes', label: 'Notes (0)' },
  { key: 'sheets', label: 'Sheets' },
  { key: 'documents', label: 'Documents' },
];

export function CreateViewModal({ open, onClose, onCreate }: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const submit = () => { if (name.trim()) { onCreate(name.trim()); setName(''); } };
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="m"
      title="Create Waterfall View"
      dismissOnScrimClick={!name}
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!name.trim()} onClick={submit}>Create</Button>
        </>
      }
    >
      <FloatingLabelInput
        label="View Name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
      />
    </Modal>
  );
}

const DOCS = [
  { name: 'Scalar Landing Page (technology section).pdf', uploaded: 'Uploaded on Feb 6, 2023' },
  { name: 'Screenshot 2023-02-02 at 5.11.41 PM.png', uploaded: 'Uploaded on Feb 6, 2023' },
];

function LinkWithIcon({ to, children, icon }: { to: string; children: ReactNode; icon: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', gap: space.xs, alignItems: 'center' }}>
      <Link href={to}>{children}</Link>
      <Icon size="s" tone="brand">{icon}</Icon>
    </span>
  );
}

/** Workspace → Documents: the company's files for this measurement date. */
export function WorkspaceDocuments({ companyId }: { companyId: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.m, padding: space.m }}>
      <div role="table" aria-label="Workspace documents">
        {DOCS.map((d) => (
          <FileRow
            key={d.name}
            name={d.name}
            meta={[{ label: d.uploaded }]}
            onOpen={() => { window.location.hash = href(routes.documents, 'pdf-viewer').slice(1); }}
            onDownload={() => {}}
            onMenu={() => {}}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: space.xl, alignItems: 'center' }}>
        <LinkWithIcon to={href(routes.company.documents(companyId), 'upload')} icon={<icons.AttachFile />}>Add new document</LinkWithIcon>
        <LinkWithIcon to={href(routes.company.informationRequest(companyId))} icon={<icons.UploadFile />}>Request new document</LinkWithIcon>
      </div>
    </div>
  );
}

/** Per-tab bodies for the Workspace dock (Notes / Sheets / Documents). */
export function waterfallDockPanels(companyId: string): Record<string, ReactNode> {
  return {
    notes: (
      <EmptyState
        title="No notes for this scenario"
        body="Notes you add here are saved with the waterfall view and shown to everyone on the deal team."
        icon={<Icon size="xl" tone="secondary"><icons.EditNote /></Icon>}
        actions={<Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}>Add note</Button>}
      />
    ),
    sheets: (
      <EmptyState
        title="No sheets linked"
        body="Link a supporting workbook to keep the calculation next to the scenario."
        icon={<Icon size="xl" tone="secondary"><icons.TableView /></Icon>}
        actions={<Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><icons.AddLink /></Icon>}>Link a sheet</Button>}
      />
    ),
    documents: <WorkspaceDocuments companyId={companyId} />,
  };
}
