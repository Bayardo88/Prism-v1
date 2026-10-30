/**
 * One request in the unified list: a compact, always-visible header row and,
 * when expanded, the one response control its `responseType` calls for (G2.2).
 * The disclosure is a real button with `aria-expanded`; the checkbox and the
 * actions sit beside it, never inside it (P1.13).
 */
import { useEffect, useState } from 'react';
import {
  Alert, Button, Checkbox, Chip, Dropzone, FileRow, FormField, Icon, Input, Radio, RadioGroup, Text, Textarea,
  color, icons, size, space,
} from '@scalar/design-system';
import {
  formatBytes, isResolved, requestNumber, responseTypeLabel, statusLabel, type InformationRequest, type RequestStatus,
  type UploadedFile,
} from './model.js';
import { downloadTemplate, type OpState, type PortalStore } from './store.js';

const statusChip: Record<RequestStatus, { style: 'default' | 'positive' | 'info'; icon: JSX.Element }> = {
  pending: { style: 'default', icon: <icons.Pending /> },
  complete: { style: 'positive', icon: <icons.CheckCircle /> },
  na: { style: 'default', icon: <icons.DoNotDisturbOn /> },
  sent: { style: 'info', icon: <icons.Send /> },
};

const typeIcon: Record<InformationRequest['responseType'], JSX.Element> = {
  text: <icons.EditNote />,
  choice: <icons.Rule />,
  date: <icons.CalendarToday />,
  file: <icons.UploadFile />,
  template_file: <icons.TableView />,
};

export function StatusChip({ status }: { status: RequestStatus }) {
  const s = statusChip[status];
  return (
    <Chip size="s" styleVariant={s.style} leadingIcon={<Icon size="xs" tone="inherit">{s.icon}</Icon>}>
      {statusLabel[status]}
    </Chip>
  );
}

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${m}/${d}/${y}`;
};

interface RowProps {
  req: InformationRequest;
  expanded: boolean;
  onToggle: () => void;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  store: PortalStore;
  onDelegate: (id: string) => void;
  notify: (tone: 'positive' | 'negative' | 'info', text: string) => void;
  mobile: boolean;
}

export function RequestRow({ req, expanded, onToggle, selected, onSelect, store, onDelegate, notify, mobile }: RowProps) {
  const num = requestNumber(req);
  const panelId = `req-panel-${req.id}`;
  const op = store.ops[req.id];
  const resolved = isResolved(req);

  return (
    <li
      style={{
        listStyle: 'none',
        borderBottom: `1px solid ${color.stroke.divider}`,
        background: selected ? color.bg.brandSubtle : expanded ? color.bg.surface : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: space.s, paddingInline: space.s, minHeight: size.target.minimum }}>
        <Checkbox size="s" checked={selected} onChange={(e) => onSelect(e.currentTarget.checked)} aria-label={`Select request ${num}`} />
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="scalar-focusable"
          style={{
            flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: space.s, padding: `${space.xs} 0`,
            background: 'none', border: 0, textAlign: 'left', cursor: 'pointer', color: 'inherit', font: 'inherit',
            minHeight: size.target.minimum,
          }}
        >
          <Text as="span" step="s" weight="semiBold" tone="secondary" style={{ minWidth: space['2xl'], fontVariantNumeric: 'tabular-nums' }}>{num}</Text>
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'flex-start' : 'center', gap: mobile ? space['2xs'] : space.m }}>
            <Text as="span" step="m" weight={expanded ? 'semiBold' : 'regular'} style={{ flex: 1, minWidth: 0 }}>{req.title}</Text>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: space.xs, flex: 'none' }}>
              <Icon size="xs" tone="secondary">{typeIcon[req.responseType]}</Icon>
              <Text as="span" step="s" tone="secondary">{responseTypeLabel[req.responseType]}</Text>
            </span>
          </span>
          <Icon size="s" tone="secondary">{expanded ? <icons.KeyboardArrowUp /> : <icons.KeyboardArrowDown />}</Icon>
        </button>
        {req.delegatee && !mobile && (
          <Chip size="s" leadingIcon={<Icon size="xs" tone="inherit"><icons.Person /></Icon>}>{req.delegatee}</Chip>
        )}
        {op && op.phase !== 'idle' && op.phase !== 'failed' && (
          <Text as="span" step="s" tone="brand" role="status">{op.phase === 'saving' ? 'Saving…' : op.phase === 'validating' ? 'Checking…' : `Uploading ${op.progress ?? 0}%`}</Text>
        )}
        <StatusChip status={req.status} />
      </div>

      {expanded && (
        <div
          id={panelId}
          role="region"
          aria-label={`Request ${num}`}
          style={{ display: 'flex', flexDirection: 'column', gap: space.m, padding: `${space.xs} ${space.l} ${space.l}`, paddingLeft: mobile ? space.l : `calc(${space['2xl']} + ${space['3xl']})` }}
        >
          {req.description && <Text step="m" tone="secondary">{req.description}</Text>}
          {req.delegatee && mobile && <Text step="s" tone="secondary">Delegated to {req.delegatee}</Text>}

          {(req.status === 'na' || req.status === 'sent') && (
            <Alert tone="info" title={req.status === 'na' ? 'Marked as not applicable' : 'Marked complete — sent another way'}>
              {req.status === 'na'
                ? 'No response is expected for this request. Reopen it if that changes.'
                : 'You told the analyst this was delivered outside the portal. No file was uploaded here.'}
            </Alert>
          )}

          <Response req={req} op={op} store={store} notify={notify} />

          {op?.phase === 'failed' && (
            <Alert tone="negative" title="Not saved" onDismiss={() => store.clearError(req.id)} dismissLabel="Dismiss error">
              {op.error}
            </Alert>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.s, paddingTop: space.xs }}>
            {resolved ? (
              <Button variant="secondary" size="s" leadingIcon={<Icon size="s" tone="inherit"><icons.Undo /></Icon>} onClick={() => { store.reopen([req.id]); notify('info', `Request ${num} reopened. Your saved response is still attached.`); }}>
                Reopen
              </Button>
            ) : (
              <>
                <Button variant="tertiary" size="s" leadingIcon={<Icon size="s" tone="inherit"><icons.DoNotDisturbOn /></Icon>} onClick={() => { store.setStatus([req.id], 'na'); notify('info', `Request ${num} marked as not applicable.`); }}>
                  Mark as not applicable
                </Button>
                <Button variant="tertiary" size="s" leadingIcon={<Icon size="s" tone="inherit"><icons.Send /></Icon>} onClick={() => { store.setStatus([req.id], 'sent'); notify('info', `Request ${num} marked complete — sent another way.`); }}>
                  Mark complete – sent another way
                </Button>
              </>
            )}
            <Button variant="tertiary" size="s" leadingIcon={<Icon size="s" tone="inherit"><icons.PersonAdd /></Icon>} onClick={() => onDelegate(req.id)}>
              {req.delegatee ? 'Change delegate' : 'Delegate'}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

/* ---------------------------------------------------------------------------
 * Response renderers — one per response type (P1.9)
 * ------------------------------------------------------------------------ */

interface ResponseProps { req: InformationRequest; op?: OpState; store: PortalStore; notify: RowProps['notify'] }

function Response(props: ResponseProps) {
  switch (props.req.responseType) {
    case 'text': return <AnswerResponse {...props} kind="text" />;
    case 'choice': return <AnswerResponse {...props} kind="choice" />;
    case 'date': return <AnswerResponse {...props} kind="date" />;
    case 'file': return <FileResponse {...props} />;
    case 'template_file': return <TemplateResponse {...props} />;
  }
}

function AnswerResponse({ req, op, store, kind }: ResponseProps & { kind: 'text' | 'choice' | 'date' }) {
  // Restores the saved value when reopened (P1.4); what was typed survives a failed save.
  const [draft, setDraft] = useState(req.answer ?? '');
  useEffect(() => { setDraft(req.answer ?? ''); }, [req.answer]);
  const saving = op?.phase === 'saving';
  const readOnly = isResolved(req);

  if (readOnly) {
    if (!req.answer) return null;
    const shown = kind === 'choice' ? (req.answer === 'yes' ? 'Yes' : 'No') : kind === 'date' ? fmtDate(req.answer) : req.answer;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
        <Text step="s" tone="secondary">Your saved answer</Text>
        <Text step="m" style={{ whiteSpace: 'pre-wrap' }}>{shown}</Text>
      </div>
    );
  }

  const control =
    kind === 'text' ? (
      <FormField label="Your answer">
        <Textarea rows={3} value={draft} onChange={(e) => setDraft(e.currentTarget.value)} disabled={saving} />
      </FormField>
    ) : kind === 'choice' ? (
      <RadioGroup label="Your answer" value={draft || undefined} onValueChange={setDraft} disabled={saving}>
        <div style={{ display: 'flex', gap: space.l }}>
          <Radio value="yes">Yes</Radio>
          <Radio value="no">No</Radio>
        </div>
      </RadioGroup>
    ) : (
      <FormField label="Date" helperText="MM/DD/YYYY">
        <Input type="date" value={draft} onChange={(e) => setDraft(e.currentTarget.value)} disabled={saving} />
      </FormField>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.s, alignItems: 'stretch' }}>
      <div style={{ maxWidth: kind === 'text' ? undefined : 'max-content' }}>{control}</div>
      <div>
        <Button size="s" loading={saving} disabled={!draft.trim() || saving || (draft === req.answer && req.status === 'complete')} onClick={() => store.saveAnswer(req.id, draft.trim())}>
          {op?.phase === 'failed' ? 'Try again' : req.answer ? 'Save changes' : 'Save answer'}
        </Button>
      </div>
    </div>
  );
}

function hintFor(req: InformationRequest) {
  const exts = (req.allowedExtensions ?? []).map((e) => e.toUpperCase()).join(', ');
  return `${exts} · 15 MB max`;
}

function UploadArea({ req, op, store, label }: ResponseProps & { label?: string }) {
  const busy = op && (op.phase === 'uploading' || op.phase === 'saving' || op.phase === 'validating');
  return (
    <Dropzone
      onFiles={(files) => { if (files[0]) void store.uploadFile(req, files[0]); }}
      // No `accept`: the Dropzone silently discards a dropped file that doesn't match it, and the
      // respondent must be told why a file was refused (P0.5). `validateFile` checks type and size.
      hint={hintFor(req)}
      state={busy ? 'uploading' : op?.phase === 'failed' ? 'error' : 'default'}
      progress={busy ? op?.progress : undefined}
      message={busy ? (op?.phase === 'saving' ? `Saving ${op.fileName}` : `Uploading ${op?.fileName}`) : op?.phase === 'failed' ? 'Not uploaded — see the message below.' : undefined}
      prompt={label ? (browse) => <>Drag & drop {label} or {browse('select a file')}</> : undefined}
      disabled={busy}
    />
  );
}

function UploadedList({ req, store, notify }: ResponseProps) {
  const files = req.files ?? [];
  if (!files.length) return null;
  const latest = files[files.length - 1]!;
  const row = (f: UploadedFile, current: boolean) => (
    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <FileRow
          name={f.name}
          meta={[
            { label: current ? 'Uploaded by you' : `Earlier version ${f.version}` },
            { label: formatBytes(f.sizeBytes) },
            { label: fmtDate(f.uploadedAt) },
          ]}
          onDownload={async () => { if (!(await store.downloadUpload(f))) notify('negative', `${f.name} is not stored in this browser any more.`); }}
        />
      </div>
      {current && (
        <Button variant="tertiary" size="s" tone="negative" onClick={() => { store.removeFile(req.id, f.id); notify('info', `${f.name} removed.`); }}>
          Remove
        </Button>
      )}
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
      <Text step="s" tone="secondary">{req.responseType === 'template_file' ? 'Your completed file' : 'Your upload'}</Text>
      {row(latest, true)}
      {files.slice(0, -1).reverse().map((f) => row(f, false))}
    </div>
  );
}

function FileResponse(props: ResponseProps) {
  const { req } = props;
  const [replacing, setReplacing] = useState(false);
  const hasFile = (req.files?.length ?? 0) > 0;
  const fileCount = req.files?.length ?? 0;
  useEffect(() => { setReplacing(false); }, [fileCount]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
      <UploadedList {...props} />
      {req.status === 'pending' || replacing || props.op ? <UploadArea {...props} /> : hasFile && req.status === 'complete' && (
        <div><Button variant="secondary" size="s" leadingIcon={<Icon size="s" tone="inherit"><icons.SwapHoriz /></Icon>} onClick={() => setReplacing(true)}>Replace file</Button></div>
      )}
    </div>
  );
}

function TemplateResponse(props: ResponseProps) {
  const { req, notify } = props;
  const t = req.template!;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    const err = await downloadTemplate(t.path, t.fileName, t.mimeType);
    setBusy(false);
    setError(err);
    if (!err) notify('positive', `${t.fileName} downloaded. Fill it in, then upload it here.`);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
        <Text step="s" tone="secondary">Step 1 · Template provided by Scalar</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.s, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FileRow name={t.fileName} meta={[{ label: t.name }, { label: `CSV · v${t.version}` }, { label: `Issued ${t.issued}` }]} />
          </div>
          <Button variant="secondary" size="s" loading={busy} leadingIcon={<Icon size="s" tone="inherit"><icons.Download /></Icon>} onClick={download}>
            Download template
          </Button>
        </div>
        {error && <Alert tone="warning" title="Template unavailable" onDismiss={() => setError(null)}>{error}</Alert>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
        <Text step="s" tone="secondary">Step 2 · Upload the completed template</Text>
        <FileResponse {...props} />
      </div>
    </div>
  );
}
