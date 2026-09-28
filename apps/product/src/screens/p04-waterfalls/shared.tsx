/**
 * Pieces shared by the firm Waterfalls page (p04) and the company Waterfall
 * page (p09): the "Create Waterfall View" modal and the Workspace drawer's
 * Documents tab.
 */
import { useState } from 'react';
import {
  Button, FileRow, FloatingLabelInput, Icon, Link, Modal, glyphs, space,
} from '@scalar/design-system';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import type { DockTab } from '../../shell/WorkspaceDock.js';

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

/** Workspace drawer → Documents: the company's files for this measurement date. */
export function WorkspaceDocuments({ companyId }: { companyId: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.m, padding: space.m }}>
      <div role="table" aria-label="Workspace documents">
        {DOCS.map((d) => (
          <FileRow
            key={d.name}
            name={d.name}
            meta={[{ label: d.uploaded }]}
            onOpen={() => { window.location.hash = href(routes.documents).slice(1); }}
            onDownload={() => {}}
            onMenu={() => {}}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: space.xl, alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', gap: space.xs, alignItems: 'center' }}>
          <Link href={href(routes.company.documents(companyId), 'upload')}>Add new document</Link>
          <Icon size="s" tone="brand"><glyphs.Upload /></Icon>
        </span>
        <span style={{ display: 'inline-flex', gap: space.xs, alignItems: 'center' }}>
          <Link href={href(routes.company.informationRequest(companyId))}>Request new document</Link>
          <Icon size="s" tone="brand"><glyphs.Mail /></Icon>
        </span>
      </div>
    </div>
  );
}
