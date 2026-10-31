/**
 * One request in the unified list: a compact, always-visible header row and,
 * when expanded, the one response control its `responseType` calls for (G2.2).
 * The disclosure is a real button with `aria-expanded`; the checkbox and the
 * actions sit beside it, never inside it (P1.13).
 */
import { useEffect, useState } from 'react';
import {
  Alert, Button, Checkbox, Chip, ConfirmationDialog, Dropzone, FileRow, FormField, Icon, Input, Label, Radio, RadioGroup,
  Text, Textarea, color, icons, radius, size, space,
} from '@scalar/design-system';
import {
  MAX_FILE_BYTES, activeFollowUp, formatBytes, requestNumber, responseTypeLabel, shownStatus, statusLabel,
  type InformationRequest, type RequestStatus, type UploadedFile,
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
  multiple_choice: <icons.FormatListBulleted />,
  date: <icons.CalendarToday />,
  file: <icons.UploadFile />,
  template_file: <icons.TableView />,
};

export function StatusChip({ status, label }: { status: RequestStatus; label?: string }) {
  const s = statusChip[status];
  return (
    <Chip size="s" styleVariant={s.style} leadingIcon={<Icon size="xs" tone="inherit">{s.icon}</Icon>}>
      {label ?? statusLabel[status]}
    </Chip>
  );
}

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${m}/${d}/${y}`;
};

interface RowProps {
  req: InformationRequest;
  /** Every request, so a row can find its follow-up. */
  all: readonly InformationRequest[];
  expanded: boolean;
  onToggle: () => void;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  store: PortalStore;
  onDelegate: (id: string) => void;
  notify: (tone: 'positive' | 'negative' | 'info', text: string) => void;
  mobile: boolean;
}

export function RequestRow({ req, all, expanded, onToggle, selected, onSelect, store, onDelegate, notify, mobile }: RowProps) {
  const num = requestNumber(req);
  const panelId = `req-panel-${req.id}`;
  const op = store.ops[req.id];
  // Reopen is offered for any saved outcome, including a saved answer whose follow-up is still open.
  const resolved = req.status !== 'pending';
  const followUp = req.status === 'pending' || req.status === 'complete' ? activeFollowUp(req, all) : undefined;
  const status = shownStatus(req, all);
  const waitingOnFollowUp = req.status === 'complete' && status === 'pending';

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
        <StatusChip status={status} label={waitingOnFollowUp ? 'Follow-up needed' : undefined} />
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

          <Response req={req} op={op} store={store} notify={notify} all={all} />

          {op?.phase === 'failed' && (
            <Alert tone="negative" title="Not saved" onDismiss={() => store.clearError(req.id)} dismissLabel="Dismiss error">
              {op.error}
            </Alert>
          )}

          {followUp && <FollowUp req={followUp} store={store} notify={notify} all={all} />}

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

interface ResponseProps { req: InformationRequest; op?: OpState; store: PortalStore; notify: RowProps['notify']; all: readonly InformationRequest[] }

/**
 * A follow-up, shown inside its parent once the parent's saved answer calls for
 * it. Any response type; it has its own number (2.5a), save and errors.
 */
function FollowUp({ req, store, notify, all }: Omit<ResponseProps, 'op'>) {
  const op = store.ops[req.id];
  const num = requestNumber(req);
  return (
    <section
      aria-label={`Follow-up ${num}`}
      style={{ display: 'flex', flexDirection: 'column', gap: space.s, padding: space.m, borderLeft: `2px solid ${color.stroke.brand}`, background: color.bg.subtle, borderRadius: `0 ${radius.xs} ${radius.xs} 0` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: space.s, flexWrap: 'wrap' }}>
        <Text as="span" step="s" weight="semiBold" tone="secondary">Follow-up {num}</Text>
        <StatusChip status={req.status} />
      </div>
      <Text step="m" weight="semiBold">{req.title}</Text>
      {req.description && <Text step="s" tone="secondary">{req.description}</Text>}
      <Response req={req} op={op} store={store} notify={notify} all={all} />
      {op?.phase === 'failed' && (
        <Alert tone="negative" title="Not saved" onDismiss={() => store.clearError(req.id)} dismissLabel="Dismiss error">{op.error}</Alert>
      )}
      {req.status !== 'pending' && (
        <div>
          <Button variant="tertiary" size="s" leadingIcon={<Icon size="s" tone="inherit"><icons.Undo /></Icon>} onClick={() => store.reopen([req.id])}>
            Edit follow-up
          </Button>
        </div>
      )}
    </section>
  );
}

function Response(props: ResponseProps) {
  switch (props.req.responseType) {
    case 'text': return <AnswerResponse {...props} kind="text" />;
    case 'choice': return <AnswerResponse {...props} kind="choice" />;
    case 'multiple_choice': return <ChoiceResponse {...props} />;
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
  const readOnly = req.status !== 'pending';

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

/**
 * Multiple choice: radios to pick one, checkboxes to select all that apply.
 * An "Other" option asks for text. Saving can add a follow-up; a change that
 * drops a follow-up which already has an answer asks first, then clears it.
 */
function ChoiceResponse({ req, op, store, all }: ResponseProps) {
  const cfg = req.choice!;
  const [ids, setIds] = useState<string[]>(req.selection?.optionIds ?? []);
  const [other, setOther] = useState(req.selection?.otherText ?? '');
  const [touched, setTouched] = useState(false);
  const [confirm, setConfirm] = useState<InformationRequest[] | null>(null);
  useEffect(() => { setIds(req.selection?.optionIds ?? []); setOther(req.selection?.otherText ?? ''); }, [req.selection]);

  const saving = op?.phase === 'saving';
  const labelId = `choice-label-${req.id}`;
  const otherOption = cfg.options.find((o) => o.other);
  const otherPicked = !!otherOption && ids.includes(otherOption.id);
  const otherMissing = otherPicked && !other.trim();
  const followUps = all.filter((f) => f.parentId === req.id);
  const wouldAdd = followUps.find((f) => (f.showWhen ?? []).some((id) => ids.includes(id)) && f !== activeFollowUp(req, all));

  if (req.status !== 'pending') {
    if (!req.selection) return null;
    const labels = cfg.options.filter((o) => req.selection!.optionIds.includes(o.id))
      .map((o) => (o.other && req.selection!.otherText ? `${o.label}: ${req.selection!.otherText}` : o.label));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
        <Text step="s" tone="secondary">Your saved answer</Text>
        {labels.map((l) => <Text key={l} step="m">{l}</Text>)}
      </div>
    );
  }

  const save = (clearIds: string[] = []) => {
    const selection = { optionIds: ids, otherText: otherPicked ? other.trim() : undefined };
    void store.saveSelection(req.id, selection, clearIds);
  };
  const onSave = () => {
    setTouched(true);
    if (!ids.length || otherMissing) return;
    // Follow-ups this choice no longer calls for, that already hold an answer.
    const dropped = followUps.filter((f) => !(f.showWhen ?? []).some((id) => ids.includes(id))
      && (f.status !== 'pending' || f.answer || f.selection || f.files?.length));
    if (dropped.length) setConfirm(dropped); else save();
  };

  const otherField = otherPicked && (
    <div style={{ paddingLeft: space.xl }}>
      <FormField label="Please specify" required state={touched && otherMissing ? 'error' : 'default'}
        helperText={touched && otherMissing ? 'Describe your “Other” answer to save.' : undefined}>
        <Input value={other} onChange={(e) => setOther(e.currentTarget.value)} disabled={saving} />
      </FormField>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
      {cfg.mode === 'single' ? (
        <RadioGroup label="Choose one" value={ids[0]} onValueChange={(v) => setIds([v])} disabled={saving}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
            {cfg.options.map((o) => <Radio key={o.id} value={o.id}>{o.label}</Radio>)}
          </div>
        </RadioGroup>
      ) : (
        <div role="group" aria-labelledby={labelId} style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
          <Label as="span" step="l" id={labelId}>Select all that apply</Label>
          {cfg.options.map((o) => (
            <Checkbox key={o.id} checked={ids.includes(o.id)} disabled={saving}
              onChange={(e) => { const on = e.currentTarget.checked; setIds((x) => (on ? [...x, o.id] : x.filter((id) => id !== o.id))); }}>
              {o.label}
            </Checkbox>
          ))}
        </div>
      )}
      {otherField}
      {touched && !ids.length && <Text step="s" tone="negative">Choose at least one option to save.</Text>}
      {wouldAdd && <Text step="s" tone="secondary">Saving this answer adds a follow-up question.</Text>}
      <div>
        <Button size="s" loading={saving} disabled={saving} onClick={onSave}>
          {op?.phase === 'failed' ? 'Try again' : req.selection ? 'Save changes' : 'Save answer'}
        </Button>
      </div>
      <ConfirmationDialog
        open={confirm !== null}
        title="Remove the follow-up answer?"
        confirmLabel="Remove and save"
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={() => { save((confirm ?? []).map((f) => f.id)); setConfirm(null); }}
      >
        {`This answer no longer calls for follow-up ${confirm?.map(requestNumber).join(', ')}. Saving removes what was entered there.`}
      </ConfirmationDialog>
    </div>
  );
}

function hintFor(req: InformationRequest) {
  const exts = (req.allowedExtensions ?? []).map((e) => e.toUpperCase()).join(', ');
  return `${exts} · ${formatBytes(req.maxFileSizeBytes ?? MAX_FILE_BYTES)} max`;
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
