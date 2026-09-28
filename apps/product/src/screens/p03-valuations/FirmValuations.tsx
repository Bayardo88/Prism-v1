/**
 * Valuations (firm): every company's latest valuation in one configurable
 * grid — date, open process tasks, status, approaches and the headline values
 * — with saved views and an Add Columns picker at the end of the grid.
 */
import { useMemo, useState } from 'react';
import {
  Button, ButtonIcon, Checkbox, Icon, ModalStatus, Modal, ModalSearch, Overline, Text, glyphs, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame, PageBody } from '../../shell/AppFrame.js';
import { navigate } from '../../router.js';
import { routes } from '../../routes.js';
import { PortfolioGrid, type GridRow } from '../p02-intelligence/PortfolioGrid.js';
import { ExportMenuItems, PortfolioHeader, PublishedNote, SavedViewsBar } from '../p02-intelligence/chrome.js';
import { CompanyName } from '../p02-intelligence/Summaries.js';
import { columnCatalogue, fixtureId, slug } from '../p02-intelligence/data.js';
import { valuationColumns, valuationRows, type ValStatus } from './data.js';

const statusCell = (s: ValStatus) =>
  s === 'final' ? <ModalStatus state="final" /> : s === 'published' ? <ModalStatus state="complete">Published</ModalStatus> : <ModalStatus state="draft" />;

/** Open process-management tasks: document requests and questions, each a jump to the company. */
function Tasks({ company }: { company: string }) {
  const id = fixtureId(company) ?? 'abc-co';
  return (
    <span style={{ display: 'inline-flex', gap: space.xs }}>
      <ButtonIcon
        size="s" variant="primary" tone="negative" label={`${company}: documents requested`}
        onClick={() => navigate(routes.company.informationRequest(id))}
        icon={<Icon size="s" tone="inherit"><glyphs.Document /></Icon>}
      />
      <ButtonIcon
        size="s" variant="primary" tone="negative" label={`${company}: open questions`}
        onClick={() => navigate(routes.company.questions(id))}
        icon={<Icon size="s" tone="inherit"><glyphs.Info /></Icon>}
      />
    </span>
  );
}

function AddColumnsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const catalogue = columnCatalogue.map((g) => ({ ...g, items: g.items.filter((i) => i !== 'Valuation Date') }));
  const toggle = (c: string) => setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Columns"
      footer={
        <>
          <Text step="s" tone="secondary">{picked.length} of 140 available selected</Text>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: space.s }}>
            <Button variant="tertiary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" disabled={!picked.length} onClick={onClose}>Add Columns</Button>
          </div>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
        <ModalSearch placeholder="Search columns…" aria-label="Search columns" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} />
        {catalogue.map((g) => {
          const items = g.items.filter((i) => i.toLowerCase().includes(q));
          if (!items.length) return null;
          return (
            <div key={g.group} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ paddingTop: space.s }}><Overline>{g.group}</Overline></div>
              {items.map((i) => (
                <Checkbox key={i} size="s" checked={picked.includes(i)} onChange={() => toggle(i)}>{i}</Checkbox>
              ))}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

export function FirmValuations({ state }: ScreenProps) {
  const atEnd = state !== 'default';
  const [view, setView] = useState('Firm Valuations');
  const [viewMenu, setViewMenu] = useState<string | undefined>();
  const [actions, setActions] = useState(false);
  const [adding, setAdding] = useState(state === 'add-columns');

  const rows: GridRow[] = useMemo(() => valuationRows.map((r) => ({
    id: slug(r.name),
    label: <CompanyName name={r.name} to={routes.company.valuationSummary} />,
    sortText: r.name,
    values: {
      ...r.v,
      process: r.tasks ? <Tasks company={r.name} /> : <Text step="s" tone="tertiary">No tasks required</Text>,
      status: statusCell(r.status),
    },
  })), []);

  return (
    <AppFrame area="valuations" overlay={<AddColumnsModal open={adding} onClose={() => setAdding(false)} />}>
      <PortfolioHeader
        title="Valuations"
        actionsOpen={actions}
        onActionsOpen={setActions}
        actions={<ExportMenuItems />}
      />
      <PageBody gap={space.m}>
        <SavedViewsBar
          views={['Firm Valuations', 'Steven Valuation View']}
          current={view}
          onSelect={setView}
          menuFor={viewMenu}
          onMenuFor={setViewMenu}
          onAdd={() => navigate(routes.intelligence.summaries, 'create-view')}
          onEdit={() => setAdding(true)}
        />
        <PortfolioGrid
          label="Firm valuations"
          firstColumn="Firm Portfolio Summary"
          columns={valuationColumns}
          rows={rows}
          total={{}}
          colPct={10}
          scrollTo={atEnd ? 'end' : undefined}
          onAddColumn={() => setAdding(true)}
          addColumnLabel="Add Column"
        />
        <PublishedNote />
      </PageBody>
    </AppFrame>
  );
}
