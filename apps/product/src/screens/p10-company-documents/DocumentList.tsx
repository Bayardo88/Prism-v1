/**
 * Company · Documents — the company's files for the selected measurement
 * date, with information-request progress, subfolders and upload.
 *
 * Figma: 10 · Company · Documents & Requests → Documents List (3 frames).
 */
import { useCallback, useRef, useState } from 'react';
import {
  Button, ButtonIcon, Cell, CheckboxItem, ColumnHeader, ContextMenu, DataGrid, Dropzone, FileRow, FileTypeBadge,
  Icon, Input, Link, MenuDivider, MenuItem, Modal, Row, Text, glyphs, size, space, zIndex,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import { companyById, user } from '../../data/fixtures.js';
import { CompanyLayout } from '../../shell/CompanyLayout.js';
import { useDismiss } from '../p04-waterfalls/useDismiss.js';
import { CompanyActionsButton, DocumentsSubNav, RequestsHeading } from './shared.js';
import { companyDocs, exportDocs, type CompanyDoc } from './data.js';

const COL = {
  select: { flex: '0 0 auto', width: size.control.s },
  format: { flex: '0.6 1 0', minWidth: 0 },
  name: { flex: '4 1 0', minWidth: 0 },
  source: { flex: '1.4 1 0', minWidth: 0 },
  date: { flex: '1.3 1 0', minWidth: 0 },
  refs: { flex: '1.4 1 0', minWidth: 0 },
  requests: { flex: '1.2 1 0', minWidth: 0 },
  actions: { flex: '1 1 0', minWidth: 0, justifyContent: 'flex-end' },
} as const;

const toTime = (d: string) => { const [m, day, y] = d.split('/').map(Number); return new Date(y!, m! - 1, day).getTime(); };
const today = '09/28/2026';

function UploadModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (files: File[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New Document"
      dismissOnScrimClick={!files.length}
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!files.length} onClick={() => { onDone(files); setFiles([]); }}>Done</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
        <Dropzone
          multiple
          accept=".csv,.docx,.jpg,.pdf,.xlsx,.zip"
          hint="250 MB max file size. CSV, DOCX, JPG, PDF, XLSX, ZIP format file."
          onFiles={(list) => setFiles((f) => [...f, ...list])}
        />
        {files.map((f, i) => (
          <FileRow key={`${f.name}-${i}`} name={f.name} meta={[{ label: `${Math.max(1, Math.round(f.size / 1024))} KB` }]} onMenu={() => setFiles((all) => all.filter((_, j) => j !== i))} />
        ))}
        <Text step="s" tone="tertiary">The document will be added to the currently selected measurement date.</Text>
        <Text step="s" tone="tertiary">The uploaded document will be saved in the documents section.</Text>
      </div>
    </Modal>
  );
}

export function DocumentList({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [docs, setDocs] = useState<CompanyDoc[]>(companyDocs);
  const [uploading, setUploading] = useState(state === 'upload');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [query, setQuery] = useState('');
  const [exportsOpen, setExportsOpen] = useState(false);
  const [rowMenu, setRowMenu] = useState<string | undefined>();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setRowMenu(undefined), []);
  useDismiss(menuRef, !!rowMenu, closeMenu);

  const visible = docs
    .filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (sort === 'desc' ? toTime(b.uploaded) - toTime(a.uploaded) : toTime(a.uploaded) - toTime(b.uploaded)));
  const allChecked = docs.length > 0 && docs.every((d) => checked.has(d.id));
  const setOne = (id: string, v: boolean) => setChecked((s) => { const n = new Set(s); if (v) n.add(id); else n.delete(id); return n; });

  const docRow = (d: CompanyDoc) => (
    <Row key={d.id}>
      <Cell style={COL.select}><CheckboxItem size="s" checked={checked.has(d.id)} onChange={(e) => setOne(d.id, e.target.checked)} aria-label={`Select ${d.name}`} /></Cell>
      <Cell style={COL.format}><FileTypeBadge file={d.ext} /></Cell>
      <Cell style={COL.name}>{d.name}</Cell>
      <Cell style={COL.source}>{d.source}</Cell>
      <Cell style={COL.date} numeric>{d.uploaded}</Cell>
      <Cell style={COL.refs}>
        <Link size="s" href={href(d.reference.startsWith('Cap') ? routes.company.capTable(company.id) : routes.company.incomeStatement(company.id))}>{d.reference}</Link>
      </Cell>
      <Cell style={COL.requests}>—</Cell>
      <Cell style={{ ...COL.actions, position: 'relative' }}>
        <ButtonIcon variant="tertiary" size="s" label={`Download ${d.name}`} icon={<Icon size="s" tone="inherit"><glyphs.Download /></Icon>} />
        <span data-popover-trigger="">
          <ButtonIcon
            variant="tertiary" size="s" label={`${d.name} options`} aria-expanded={rowMenu === d.id}
            onClick={() => setRowMenu((m) => (m === d.id ? undefined : d.id))}
            icon={<Icon size="s" tone="inherit"><glyphs.MoreVertical /></Icon>}
          />
        </span>
        {rowMenu === d.id && (
          <div ref={menuRef} style={{ position: 'absolute', top: '100%', right: 0, zIndex: zIndex.overlay }}>
            <ContextMenu label={`${d.name} actions`}>
              <MenuItem icon={<Icon size="s" tone="inherit"><glyphs.Eye /></Icon>} href={href(routes.documents, 'pdf-viewer')}>Open in viewer</MenuItem>
              <MenuItem icon={<Icon size="s" tone="inherit"><glyphs.Edit /></Icon>}>Rename</MenuItem>
              <MenuItem icon={<Icon size="s" tone="inherit"><glyphs.Folder /></Icon>}>Move to folder</MenuItem>
              <MenuDivider />
              <MenuItem tone="destructive" icon={<Icon size="s" tone="inherit"><glyphs.Trash /></Icon>} onClick={() => { setDocs((all) => all.filter((x) => x.id !== d.id)); setRowMenu(undefined); }}>
                Delete document
              </MenuItem>
            </ContextMenu>
          </div>
        )}
      </Cell>
    </Row>
  );

  const folderRow = (name: string, open?: boolean, onToggle?: () => void) => (
    <Row key={name}>
      <Cell style={COL.select} />
      <Cell style={{ flex: '11.3 1 0', minWidth: 0 }} icon={<Icon size="s" tone="brand"><glyphs.Folder /></Icon>}>
        <Text step="m" weight="semiBold" tone="brand">{name}</Text>
      </Cell>
      <Cell style={COL.actions}>
        {onToggle && (
          <ButtonIcon
            variant="tertiary" size="s" label={open ? `Collapse ${name}` : `Expand ${name}`} onClick={onToggle}
            icon={<Icon size="s" tone="inherit">{open ? <glyphs.ChevronUp /> : <glyphs.ChevronDown />}</Icon>}
          />
        )}
        <ButtonIcon variant="tertiary" size="s" label={`${name} folder options`} icon={<Icon size="s" tone="inherit"><glyphs.MoreVertical /></Icon>} />
      </Cell>
    </Row>
  );

  return (
    <CompanyLayout
      company={company}
      section="documents"
      date={company.asOf}
      headerEnd={<CompanyActionsButton />}
      subNav={<DocumentsSubNav companyId={company.id} current="documents" />}
      dock={false}
      overlay={
        <UploadModal
          open={uploading}
          onClose={() => setUploading(false)}
          onDone={(files) => {
            setDocs((all) => [
              ...files.map((f, i) => ({
                id: `u${all.length + i}`, name: f.name.replace(/\.[^.]+$/, ''), ext: f.name.split('.').pop() ?? '',
                source: user.name, uploaded: today, reference: 'Financials',
              })),
              ...all,
            ]);
            setUploading(false);
          }}
        />
      }
    >
      <RequestsHeading
        companyId={company.id}
        title="Documents"
        menuOpen={state === 'page-menu'}
        counts={{ done: 0, total: 0, label: 'Document requests uploaded', text: 'Requests: 0 sent, 0 uploaded, 0 pending' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: space.m }}>
        <Button variant="tertiary" leadingIcon={<Icon size="s" tone="inherit"><glyphs.Folder /></Icon>}>Add Subfolder</Button>
        <Button variant="tertiary" leadingIcon={<Icon size="s" tone="inherit"><glyphs.Upload /></Icon>} onClick={() => setUploading(true)}>Upload Document</Button>
        <Text step="s" tone="tertiary">{docs.length + exportDocs.length} Document(s) | 1 Subfolder(s)</Text>
        <div style={{ marginLeft: 'auto', width: '22%' }}>
          <Input
            aria-label="Search documents"
            placeholder="Search documents…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leadingIcon={<Icon size="s" tone="secondary"><glyphs.Search /></Icon>}
          />
        </div>
      </div>

      <DataGrid
        label={`${company.name} documents`}
        head={
          <>
            <ColumnHeader style={COL.select}>
              <CheckboxItem
                size="s"
                aria-label="Select all documents"
                checked={allChecked}
                indeterminate={!allChecked && checked.size > 0}
                onChange={(e) => setChecked(e.target.checked ? new Set(docs.map((d) => d.id)) : new Set())}
              />
            </ColumnHeader>
            <ColumnHeader style={COL.format}>Format</ColumnHeader>
            <ColumnHeader style={COL.name}>Name</ColumnHeader>
            <ColumnHeader style={COL.source}>Source</ColumnHeader>
            <ColumnHeader style={COL.date} numeric sort={sort} onSortChange={setSort}>Upload Date</ColumnHeader>
            <ColumnHeader style={COL.refs}>References</ColumnHeader>
            <ColumnHeader style={COL.requests}>File Requests</ColumnHeader>
            <ColumnHeader style={COL.actions}>Actions</ColumnHeader>
          </>
        }
      >
        {folderRow('/')}
        {visible.map(docRow)}
        {folderRow('Exports', exportsOpen, () => setExportsOpen((o) => !o))}
        {exportsOpen && exportDocs.map(docRow)}
      </DataGrid>
    </CompanyLayout>
  );
}
