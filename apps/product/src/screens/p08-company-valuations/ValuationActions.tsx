/**
 * ⋮ Valuation actions in the Valuations header (domain-logic.md §8, P8).
 *
 * - Workflow moves for the version in view: In Progress → In Review → Ready
 *   for Audit → Final, and Publish, which asks first because it puts the
 *   version's values into fund, firm and Intelligence summaries.
 * - View as auditor: the company's pages become read-only (DOC: an auditor reads
 *   a ready-for-audit valuation read-only).
 * - Save as New Version, Roll over to a new date and Excel Export.
 *
 * VERIFY: the real transition graph and who may make each move. The prototype
 * lets anyone make any move; it never claims a rule the training did not show.
 */
import { useState } from 'react';
import {
  ButtonIcon, ConfirmationDialog, ContextMenu, Icon, MenuDivider, MenuItem, icons, space, zIndex,
} from '@scalar/design-system';
import type { Company } from '../../data/fixtures.js';
import { useValuationContext, valuation } from '../../domain/context.js';
import type { ValuationWorkflowStatus } from '../../domain/model.js';
import { guarded } from '../../domain/useDirtyGuard.js';
import { statusView } from '../p02-intelligence/data.js';
import { openRollover } from '../prototypes/rollover/state.js';
import { openExport } from '../prototypes/export/state.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';

const MOVES: Array<{ to: ValuationWorkflowStatus; label: string }> = [
  { to: 'in-progress', label: 'Mark In Progress' },
  { to: 'in-review', label: 'Send to Review' },
  { to: 'ready-for-audit', label: 'Mark Ready for Audit' },
  { to: 'final', label: 'Mark Final' },
];

export function ValuationActions({ company }: { company: Company }) {
  const v = useValuationContext(company);
  const [open, setOpen] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const status = v.valuation?.status;
  const setStatus = (to: ValuationWorkflowStatus) => {
    setOpen(false);
    valuation.setValuation(company, (x) => ({ ...x, status: to }));
  };
  const run = (fn: () => void) => () => { setOpen(false); fn(); };

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <ButtonIcon
        variant="tertiary"
        size="s"
        label="Valuation actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        icon={<Icon size="s" tone="inherit"><icons.MoreVert /></Icon>}
      />
      {open && (
        <span style={{ position: 'absolute', top: '100%', right: 0, marginTop: space.xs, zIndex: zIndex.overlay }}>
          <ContextMenu label="Valuation actions" heading={v.valuation?.name ?? 'Valuation'}>
            {MOVES.map((m) => (
              <MenuItem key={m.to} disabled={!v.valuation || status === m.to || v.readOnly} onClick={() => setStatus(m.to)}>
                {m.label}
              </MenuItem>
            ))}
            <MenuItem
              icon={<Icon size="s" tone="inherit"><icons.Publish /></Icon>}
              disabled={!v.valuation || status === 'published' || v.readOnly}
              onClick={run(() => setConfirmPublish(true))}
            >
              Publish…
            </MenuItem>
            <MenuItem disabled={!v.valuation || status === 'draft' || v.readOnly} onClick={() => setStatus('draft')}>Return to Draft</MenuItem>
            <MenuDivider />
            <MenuItem
              icon={<Icon size="s" tone="inherit"><icons.Visibility /></Icon>}
              onClick={run(() => valuation.setContext(company, { viewAs: v.readOnly ? 'analyst' : 'auditor' }))}
            >
              {v.readOnly ? 'Return to analyst view' : 'View as auditor (read-only)'}
            </MenuItem>
            <MenuDivider />
            <MenuItem
              disabled={v.readOnly}
              onClick={run(() => guarded(() => valuation.saveAsNewVersion(company, 'valuation', `Version ${v.measurement.valuations.length + 1} - ${v.measurement.date}`)))}
            >
              Save as New Version
            </MenuItem>
            <MenuItem disabled={v.readOnly} onClick={run(() => openRollover(company.id))}>Roll over to a new date…</MenuItem>
            <MenuItem icon={<Icon size="s" tone="inherit"><icons.TableView /></Icon>} onClick={run(() => openExport(company.id))}>Excel Export…</MenuItem>
            <MenuItem icon={<Icon size="s" tone="inherit"><icons.Description /></Icon>} href={href(routes.prototypes.reportComposer(company.id))}>Compose 409A client report</MenuItem>
          </ContextMenu>
        </span>
      )}
      <ConfirmationDialog
        open={confirmPublish}
        title={`Publish ${v.valuation?.name ?? 'this version'}?`}
        confirmLabel="Publish version"
        cancelLabel="Keep as is"
        onConfirm={() => { setConfirmPublish(false); setStatus('published'); }}
        onCancel={() => setConfirmPublish(false)}
      >
        {`Its values will appear in fund, firm and Intelligence summaries for the ${v.measurement.date} measurement. Its current status is ${statusView[status ?? 'draft'].label ?? status}.`}
      </ConfirmationDialog>
    </span>
  );
}
