/**
 * New Information Request, inside the portal — what the sender's own user
 * (Scalar or firm) gets from "Info Request". The same builder as the platform's
 * Company › Documents › Requests (Template, Send to, Due date, Introduction,
 * then one numbered list by category), but it never leaves this page: the
 * portal keeps its tiers, Cancel and Send sit in Tier 3, and sending adds the
 * requests to this list as Pending, numbered after what was already sent.
 *
 * A hook, like the platform's request workspace: the portal places `body`,
 * `overlay` and the Tier 3 actions in its own chrome.
 */
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Alert, Button, ButtonIcon, Chip, ComboboxPanel, FormField, Heading, Icon, Input, Link, Modal, Overline, PageTemplate, Select,
  SubmenuItem, TertiaryMenu, Text, Textarea, color, icons, radius, space, zIndex,
} from '@scalar/design-system';
import type { Company } from '../../../data/fixtures.js';
import { href } from '../../../router.js';
import { routes } from '../../../routes.js';
import { useDismiss } from '../../p04-waterfalls/useDismiss.js';
import { defaultDocumentRequests, defaultQuestions, responsibles } from '../../p10-company-documents/data.js';
import { INTRODUCTION, type RequestSet } from './fixtures.js';
import { DOC_EXTENSIONS, formatDay, responseTypeLabel, type Category, type InformationRequest, type ResponseType } from './model.js';
import { DueDateDialog } from './PortalModals.js';

type BuilderType = 'choice' | 'text' | 'date' | 'file';
const BUILDER_TYPES: BuilderType[] = ['choice', 'text', 'date', 'file'];
const toBuilderType = (t: ResponseType): BuilderType =>
  (BUILDER_TYPES as ResponseType[]).includes(t) ? t as BuilderType : t === 'multiple_choice' ? 'choice' : 'file';

interface TemplateRequest { title: string; categoryId: string; responseType: BuilderType }
interface RequestTemplate { id: string; name: string; updatedAt: string; introduction: string[]; requests: TemplateRequest[] }
interface DraftRequest extends TemplateRequest { key: string }

/** The platform's standard list, filed into the standard categories (the platform builder starts from it). */
const STANDARD: TemplateRequest[] = [
  { title: defaultDocumentRequests[5]!, categoryId: 'corporate', responseType: 'file' },
  { title: defaultQuestions[8]!, categoryId: 'corporate', responseType: 'text' },
  { title: defaultDocumentRequests[4]!, categoryId: 'capitalization', responseType: 'file' },
  { title: defaultQuestions[3]!, categoryId: 'capitalization', responseType: 'choice' },
  { title: defaultQuestions[5]!, categoryId: 'capitalization', responseType: 'text' },
  { title: defaultQuestions[6]!, categoryId: 'capitalization', responseType: 'choice' },
  { title: defaultQuestions[7]!, categoryId: 'capitalization', responseType: 'date' },
  { title: defaultDocumentRequests[2]!, categoryId: 'financials', responseType: 'file' },
  { title: defaultDocumentRequests[3]!, categoryId: 'projections', responseType: 'file' },
  { title: defaultQuestions[2]!, categoryId: 'projections', responseType: 'text' },
  { title: defaultDocumentRequests[1]!, categoryId: 'customers', responseType: 'file' },
  { title: defaultDocumentRequests[6]!, categoryId: 'transactions', responseType: 'file' },
  { title: defaultQuestions[0]!, categoryId: 'transactions', responseType: 'date' },
  { title: defaultQuestions[1]!, categoryId: 'transactions', responseType: 'text' },
  { title: defaultQuestions[4]!, categoryId: 'transactions', responseType: 'choice' },
  { title: defaultDocumentRequests[0]!, categoryId: 'other', responseType: 'file' },
  { title: defaultQuestions[9]!, categoryId: 'other', responseType: 'text' },
];

/** The firm's saved templates. They use the standard categories, so a 409A request offers only its own last list and Blank. */
const SAVED_TEMPLATES: RequestTemplate[] = [
  { id: 'standard', name: 'Standard valuation request', updatedAt: '2026-10-02', introduction: INTRODUCTION, requests: STANDARD },
  {
    id: 'annual-audit',
    name: 'Annual audit',
    updatedAt: '2026-09-14',
    introduction: [
      'Hello {company} team,',
      'Our annual audit support is starting. Along with the usual valuation requests, we need the audit documents below. Please upload the signed versions where you have them.',
      'Thank you, {sender}',
    ],
    requests: [
      ...STANDARD,
      { title: 'Audited financial statements', categoryId: 'financials', responseType: 'file' },
      { title: 'Management letter from the auditors', categoryId: 'financials', responseType: 'file' },
      { title: 'Did the auditors issue a qualified opinion?', categoryId: 'financials', responseType: 'choice' },
      { title: 'Date the audit report was signed', categoryId: 'financials', responseType: 'date' },
      { title: 'Board minutes for the year', categoryId: 'corporate', responseType: 'file' },
    ],
  },
  {
    id: 'quarterly',
    name: 'Quarterly update',
    updatedAt: '2026-08-30',
    introduction: ['Hello {company} team,', 'Here is this quarter’s short update. It should take a few minutes.', 'Thank you, {sender}'],
    requests: [
      { title: defaultDocumentRequests[2]!, categoryId: 'financials', responseType: 'file' },
      { title: 'Current cash balance and monthly burn', categoryId: 'financials', responseType: 'text' },
      { title: 'Updated KPI dashboard', categoryId: 'financials', responseType: 'file' },
      { title: defaultDocumentRequests[4]!, categoryId: 'capitalization', responseType: 'file' },
      { title: defaultQuestions[3]!, categoryId: 'capitalization', responseType: 'choice' },
      { title: defaultQuestions[6]!, categoryId: 'capitalization', responseType: 'choice' },
      { title: defaultDocumentRequests[3]!, categoryId: 'projections', responseType: 'file' },
      { title: defaultQuestions[9]!, categoryId: 'other', responseType: 'text' },
    ],
  },
];

const fmt = (iso: string) => { const [y, m, d] = iso.split('-'); return `${m}/${d}/${y}`; };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let keySeq = 0;
const newKey = () => `nd${++keySeq}`;
const withKeys = (rs: TemplateRequest[]): DraftRequest[] => rs.map((d) => ({ ...d, key: newKey() }));
/** What counts as an edit: the requests (wording, type, category) and the introduction. */
const snapshot = (drafts: DraftRequest[], intro: string) =>
  JSON.stringify([drafts.map((d) => [d.categoryId, d.title, d.responseType]), intro]);

export interface NewRequest {
  body: ReactNode;
  overlay: ReactNode;
  /** Tier 3 end: Cancel, then Send N requests. */
  actions: ReactNode;
}

type NewRequestOptions = Parameters<typeof useNewRequest>[0];

/**
 * The builder as a page: the portal's Tier 1 and Tier 2 stay, Tier 3 names the
 * company and holds Cancel and Send. Mounted only while building, so every
 * Info Request starts fresh.
 */
export function NewRequestView({ navigation, companyInfo, ...options }: NewRequestOptions & { navigation: ReactNode; companyInfo: ReactNode }) {
  const { body, overlay, actions } = useNewRequest(options);
  return (
    <PageTemplate
      fullHeight={false}
      navigation={navigation}
      companyInfo={companyInfo}
      subNavigation={
        <TertiaryMenu label="New request" end={actions}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: space.m, minWidth: 0 }}>
            <Text as="span" step="m" weight="semiBold" style={{ whiteSpace: 'nowrap' }}>{options.company.name}</Text>
            <Link href={href(routes.company.documents(options.company.id))} size="s">Open company</Link>
          </span>
        </TertiaryMenu>
      }
    >
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{body}</div>
      {overlay}
    </PageTemplate>
  );
}

export function useNewRequest({ company, categories, requestSet, existing, dueDate: currentDue, senderName, recipient, onCancel, onSent }: {
  company: Company;
  categories: Category[];
  requestSet: RequestSet;
  /** The requests already in this list: "Last request sent" and the numbering start from them. */
  existing: InformationRequest[];
  dueDate: string;
  senderName: string;
  /** The respondent on file, first in the picker. */
  recipient: string;
  onCancel: () => void;
  onSent: (added: InformationRequest[], dueDate: string, recipients: string[]) => void;
}): NewRequest {
  const catOrder = useCallback((id: string) => categories.find((c) => c.id === id)?.order ?? 99, [categories]);
  const introText = (t: { introduction: string[] }) => t.introduction.join('\n\n').replace(/\{company\}/g, company.name).replace(/\{sender\}/g, senderName);

  // The template list: this company's last request and Blank first, then the firm's saved templates.
  const templates = useMemo<RequestTemplate[]>(() => {
    const last = existing.filter((r) => !r.parentId).map((r) => ({ title: r.title, categoryId: r.categoryId, responseType: toBuilderType(r.responseType) }));
    return [
      ...(last.length ? [{ id: 'last', name: 'Last request sent to this company', updatedAt: '', introduction: INTRODUCTION, requests: last }] : []),
      { id: 'blank', name: 'Blank', updatedAt: '', introduction: [], requests: [] },
      ...(requestSet === 'standard' ? SAVED_TEMPLATES : []),
    ];
  }, [existing, requestSet]);
  const start = templates.find((t) => t.id === 'standard') ?? templates[0]!;
  const [templateId, setTemplateId] = useState(start.id);
  const [switchTo, setSwitchTo] = useState<RequestTemplate | null>(null);
  const [drafts, setDrafts] = useState<DraftRequest[]>(() => withKeys(start.requests));
  const [category, setCategory] = useState<string>('all');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dueDate, setDueDate] = useState(currentDue);
  const [dueOpen, setDueOpen] = useState(false);
  const [intro, setIntro] = useState(() => introText(start));
  const [baseline, setBaseline] = useState(() => snapshot(drafts, intro));
  const edited = snapshot(drafts, intro) !== baseline;
  const contacts = [...new Set([recipient, ...responsibles.map((r) => r.name)])];

  const mergeInto = (current: DraftRequest[], adding: TemplateRequest[]) => {
    const seen = new Set(current.map((d) => d.title.trim().toLowerCase()));
    const fresh = adding.filter((d) => !seen.has(d.title.trim().toLowerCase()));
    return [...current, ...withKeys(fresh)].map((d, i) => ({ d, i }))
      .sort((a, b) => catOrder(a.d.categoryId) - catOrder(b.d.categoryId) || a.i - b.i).map((x) => x.d);
  };
  const applyTemplate = (t: RequestTemplate) => {
    const next = withKeys(t.requests);
    const text = introText(t);
    setDrafts(next); setIntro(text); setBaseline(snapshot(next, text)); setTemplateId(t.id); setCategory('all'); setSwitchTo(null);
  };
  const addTemplate = (t: RequestTemplate) => { setDrafts((cur) => mergeInto(cur, t.requests)); setTemplateId(t.id); setSwitchTo(null); };
  const pickTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t || id === templateId) return;
    if (edited) setSwitchTo(t); else applyTemplate(t);
  };

  const [tried, setTried] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusKey = useRef<string | null>(null);
  const closePicker = useCallback(() => setPickerOpen(false), []);
  useDismiss(panelRef, pickerOpen, closePicker);

  const blank = drafts.filter((d) => !d.title.trim());
  const problems = [
    !recipients.length && 'Choose at least one person to send the request to.',
    !drafts.length && 'Add at least one request.',
    blank.length > 0 && `${blank.length} request${blank.length === 1 ? ' has' : 's have'} no wording. Write it or remove ${blank.length === 1 ? 'it' : 'them'}.`,
  ].filter((p): p is string => !!p);

  const send = () => {
    setTried(true);
    if (problems.length) return;
    // Numbered after what was already sent in each category, so existing numbers never move.
    const next = new Map<string, number>();
    const stamp = Date.now();
    const added: InformationRequest[] = drafts.map((d, i) => {
      const cat = categories.find((c) => c.id === d.categoryId)!;
      const order = next.get(cat.id) ?? Math.max(0, ...existing.filter((r) => r.categoryId === cat.id && !r.parentId).map((r) => r.requestOrder));
      next.set(cat.id, order + 1);
      return {
        id: `n-${stamp}-${i}`,
        categoryId: cat.id,
        categoryOrder: cat.order,
        requestOrder: order + 1,
        title: d.title.trim(),
        responseType: d.responseType,
        status: 'pending',
        ...(d.responseType === 'file' ? { allowedExtensions: DOC_EXTENSIONS, maxFiles: 5 } : {}),
      } as InformationRequest;
    });
    onSent(added, dueDate, recipients);
  };

  const update = (key: string, patch: Partial<DraftRequest>) => setDrafts((all) => all.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  const remove = (key: string) => setDrafts((all) => all.filter((d) => d.key !== key));
  const add = (categoryId: string) => {
    const key = newKey();
    focusKey.current = key;
    setDrafts((all) => {
      // Keep the list in category order: a new request goes after the last one of its category.
      const at = all.map((d) => d.categoryId).lastIndexOf(categoryId);
      const order = catOrder(categoryId);
      const idx = at >= 0 ? at + 1 : all.findIndex((d) => catOrder(d.categoryId) > order);
      const nextList = [...all];
      nextList.splice(idx < 0 ? all.length : idx, 0, { key, categoryId, title: '', responseType: 'file' });
      return nextList;
    });
  };
  const addRecipient = (name: string) => { if (name && !recipients.includes(name)) setRecipients((r) => [...r, name]); };

  const shownCategories = categories.filter((c) => category === 'all' ? drafts.some((d) => d.categoryId === c.id) : c.id === category);
  const typed = query.trim();
  const pickerItems = [
    ...contacts.filter((n) => n.toLowerCase().includes(typed.toLowerCase())).map((n) => ({ value: n, label: n })),
    ...(EMAIL.test(typed) && !contacts.includes(typed) ? [{ value: typed, label: `Send to ${typed}` }] : []),
  ];

  /* ---- left column: categories ---- */
  const aside = (
    <aside style={{ alignSelf: 'start', border: `1px solid ${color.stroke.default}`, borderRadius: radius.s, background: color.bg.surface }}>
      <nav aria-label="Categories" style={{ display: 'flex', flexDirection: 'column', gap: space['2xs'], padding: space.s }}>
        <Overline as="h2" style={{ padding: `${space.xs} ${space.s}` }}>Categories</Overline>
        <SubmenuItem current={category === 'all'} onClick={() => setCategory('all')}>
          <span style={{ display: 'flex', justifyContent: 'space-between', gap: space.s, width: '100%' }}>
            <span>All requests</span><Text as="span" step="s" tone="secondary">{drafts.length}</Text>
          </span>
        </SubmenuItem>
        {categories.map((c) => (
          <SubmenuItem key={c.id} current={category === c.id} onClick={() => setCategory(c.id)}>
            <span style={{ display: 'flex', justifyContent: 'space-between', gap: space.s, width: '100%' }}>
              <span style={{ whiteSpace: 'nowrap' }}>{c.order}. {c.name}</span>
              <Text as="span" step="s" tone="secondary">{drafts.filter((d) => d.categoryId === c.id).length}</Text>
            </span>
          </SubmenuItem>
        ))}
      </nav>
    </aside>
  );

  /* ---- who, when, and the introduction ---- */
  const sendTo = (
    <section aria-labelledby="nr-send-to" style={{ display: 'flex', flexDirection: 'column', gap: space.m, padding: space.m, borderBottom: `1px solid ${color.stroke.divider}` }}>
      <FormField label="Template" helperText="Sets the requests and the introduction. Recipients and the due date stay as they are.">
        <Select value={templateId} onChange={(e) => pickTemplate(e.currentTarget.value)}>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {`${t.name} — ${t.requests.length} request${t.requests.length === 1 ? '' : 's'}${t.updatedAt ? ` · edited ${formatDay(t.updatedAt)}` : ''}`}
            </option>
          ))}
        </Select>
      </FormField>
      <Heading level={2} step="m" id="nr-send-to">Send to</Heading>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: space.l, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
          <div style={{ position: 'relative' }} data-popover-trigger="">
            <FormField
              label="Recipients"
              state={tried && !recipients.length ? 'error' : undefined}
              helperText={tried && !recipients.length
                ? 'Choose at least one recipient.'
                : 'Each person gets an email with a link to these requests. Pick a contact or type an email address.'}
            >
              <Input
                readOnly
                placeholder="Select a responsible or add a new one"
                value=""
                aria-haspopup="listbox"
                aria-expanded={pickerOpen}
                onClick={() => setPickerOpen((o) => !o)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); setPickerOpen(true); } }}
                leadingIcon={<Icon size="s" tone="secondary"><icons.PersonAdd /></Icon>}
                trailingIcon={<Icon size="s" tone="secondary">{pickerOpen ? <icons.KeyboardArrowUp /> : <icons.KeyboardArrowDown />}</Icon>}
              />
            </FormField>
            {pickerOpen && (
              <div ref={panelRef} style={{ position: 'absolute', top: '100%', left: 0, zIndex: zIndex.overlay }}>
                <ComboboxPanel
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  multiple
                  label="Recipients"
                  searchPlaceholder="Find a person or type an email"
                  items={pickerItems}
                  value={recipients}
                  query={query}
                  onQueryChange={setQuery}
                  onSelect={(v) => {
                    setRecipients((r) => (r.includes(v) ? r.filter((x) => x !== v) : [...r, v]));
                    setQuery('');
                  }}
                  footer={
                    <Button variant="tertiary" size="s" disabled={!EMAIL.test(typed)} leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}
                      onClick={() => { addRecipient(typed); setQuery(''); }}>
                      Add a new responsible
                    </Button>
                  }
                />
              </div>
            )}
          </div>
          {recipients.length > 0 && (
            <div aria-label="Selected recipients" role="group" style={{ display: 'flex', flexWrap: 'wrap', gap: space.xs }}>
              {recipients.map((name) => (
                <Chip key={name} leadingIcon={<Icon size="xs" tone="inherit"><icons.Person /></Icon>} onRemove={() => setRecipients((r) => r.filter((x) => x !== name))}>
                  {name}
                </Chip>
              ))}
            </div>
          )}
        </div>
        <FormField label="Due date" helperText="Recipients see how many days are left. You can change it after sending.">
          <div>
            <Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><icons.EditCalendar /></Icon>} onClick={() => setDueOpen(true)}
              aria-label={`Due ${fmt(dueDate)}. Change due date`}>
              Due {fmt(dueDate)}
            </Button>
          </div>
        </FormField>
      </div>
      <FormField label="Introduction" helperText="Shown above the requests. Leave a blank line between paragraphs.">
        <Textarea rows={4} value={intro} onChange={(e) => setIntro(e.target.value)} />
      </FormField>
    </section>
  );

  /* ---- the numbered list ---- */
  const list = (
    <ul aria-label="Requests to send" style={{ margin: 0, padding: 0 }}>
      {shownCategories.map((c) => {
        const items = drafts.filter((d) => d.categoryId === c.id);
        return [
          <li key={`h-${c.id}`} style={{ listStyle: 'none', padding: `${space.s} ${space.m} ${space.xs}`, background: color.bg.subtle, borderBottom: `1px solid ${color.stroke.divider}` }}>
            <Overline>{`${c.order}. ${c.name}`}</Overline>
          </li>,
          ...items.map((d, i) => {
            const n = `${c.order}.${i + 1}`;
            const missing = tried && !d.title.trim();
            return (
              <li key={d.key} style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) minmax(min-content, 22%) auto', alignItems: 'start', gap: space.s, padding: `${space.s} ${space.m}`, borderBottom: `1px solid ${color.stroke.divider}` }}>
                <Text as="span" step="m" weight="semiBold" tone="secondary" style={{ paddingTop: space.xs, fontVariantNumeric: 'tabular-nums' }}>{n}</Text>
                <FormField state={missing ? 'error' : undefined} helperText={missing ? 'Write the request or remove it.' : undefined}>
                  <Input
                    aria-label={`Request ${n}`}
                    // Focus a request the sender just added.
                    ref={(el) => { if (el && focusKey.current === d.key) { el.focus(); focusKey.current = null; } }}
                    placeholder={d.responseType === 'file' ? 'Name the document you need' : 'Write the question'}
                    value={d.title}
                    onChange={(e) => update(d.key, { title: e.target.value })}
                  />
                </FormField>
                <Select aria-label={`How request ${n} is answered`} value={d.responseType}
                  onChange={(e) => update(d.key, { responseType: e.currentTarget.value as BuilderType })}>
                  {BUILDER_TYPES.map((t) => <option key={t} value={t}>{responseTypeLabel[t]}</option>)}
                </Select>
                <ButtonIcon variant="tertiary" size="s" label={`Remove request ${n}`} onClick={() => remove(d.key)}
                  icon={<Icon size="s" tone="inherit"><icons.Delete /></Icon>} />
              </li>
            );
          }),
          <li key={`a-${c.id}`} style={{ listStyle: 'none', padding: `${space.xs} ${space.m}`, borderBottom: `1px solid ${color.stroke.divider}` }}>
            <Button variant="tertiary" size="s" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>} onClick={() => add(c.id)}>
              {`Add request to ${c.name}`}
            </Button>
          </li>,
        ];
      })}
      {category === 'all' && (
        <li style={{ listStyle: 'none', padding: space.m }}>
          <Text step="s" tone="secondary">Pick a category on the left to add a request to one that has none yet.</Text>
        </li>
      )}
    </ul>
  );

  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.l, paddingBlock: space.m }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: space.m, flexWrap: 'wrap' }}>
        <Heading level={2} step="2xl">New Information Request</Heading>
        <Text step="m" tone="secondary">{`${company.name} · ${drafts.length} request${drafts.length === 1 ? '' : 's'} in ${new Set(drafts.map((d) => d.categoryId)).size} categories`}</Text>
      </div>
      {tried && problems.length > 0 && (
        <Alert tone="negative" title="This request can’t be sent yet">
          <ul style={{ margin: 0, paddingLeft: space.l }}>
            {problems.map((p) => <li key={p}><Text step="m">{p}</Text></li>)}
          </ul>
        </Alert>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(min-content, 1fr) minmax(0, 4fr)', gap: space.l, alignItems: 'start' }}>
        {aside}
        <section aria-label="Request" style={{ minWidth: 0, border: `1px solid ${color.stroke.default}`, borderRadius: radius.s, background: color.bg.surface }}>
          {sendTo}
          {list}
        </section>
      </div>
    </div>
  );

  const overlay = (
    <>
      <DueDateDialog open={dueOpen} onClose={() => setDueOpen(false)} dueDate={dueDate} onSave={setDueDate} />
      <Modal
        open={switchTo !== null}
        onClose={() => setSwitchTo(null)}
        size="s"
        role="alertdialog"
        title={switchTo ? `Replace your ${drafts.length} request${drafts.length === 1 ? '' : 's'} with ‘${switchTo.name}’ (${switchTo.requests.length} request${switchTo.requests.length === 1 ? '' : 's'})?` : ''}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setSwitchTo(null)}>Cancel</Button>
            <Button variant="secondary" disabled={!switchTo?.requests.length} onClick={() => switchTo && addTemplate(switchTo)}>Add to current</Button>
            <Button variant="primary" onClick={() => switchTo && applyTemplate(switchTo)}>Replace</Button>
          </>
        }
      >
        <Text step="m">
          You have edited this request. Replace discards your edits and starts from the template. Add to current keeps
          them and adds the template’s requests, skipping any with the same wording. Recipients and the due date stay as they are.
        </Text>
      </Modal>
    </>
  );

  const actions = (
    <>
      <Button variant="tertiary" size="xs" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" size="xs" trailingIcon={<Icon size="s" tone="inherit"><icons.Send /></Icon>} onClick={send}>
        {`Send ${drafts.length} request${drafts.length === 1 ? '' : 's'}`}
      </Button>
    </>
  );

  return { body, overlay, actions };
}
