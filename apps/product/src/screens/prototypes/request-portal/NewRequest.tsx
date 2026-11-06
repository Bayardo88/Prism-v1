/**
 * New Information Request, inside the portal — what the sender's own user
 * (Scalar or firm) gets from "Info Request". The same builder as the platform's
 * Company › Documents › Requests (Template, Send to, Due date, Introduction,
 * then one numbered list by category), but it never leaves this page: the
 * portal keeps its tiers, and Cancel and Send sit in Tier 3.
 *
 * Each row's answer type is a Scalar SelectMenu opened from the field and its
 * chevron, never the browser's own list. Multiple choice takes the options
 * the sender writes; the responder selects as many as apply.
 *
 * Stakeholder feedback (Request Portal plan, Nov 5 2026):
 * - #2 Every row has an include checkbox (the template's rows start ticked; a
 *   category header ticks or clears its whole category) and an optional
 *   description the responder sees. Only included rows are sent, numbered
 *   without gaps. Send reads "Send 12 of 17 requests".
 * - #3 Every category shows, empty ones too, each with Add question and Add
 *   document. A new row fades in, scrolls into view and takes focus; Enter in a title
 *   adds a row of the same type below it.
 * - #4 Send opens a review step: the email each recipient gets (subject and a
 *   personal note editable), one link per recipient with Copy link, then Send
 *   email, Copy link only, or Back to edit.
 * - #5 "+ Add category" at the foot of a sticky category column: numbered next,
 *   renamed or deleted on hover (deleting one with requests asks where they go,
 *   Other by default). New categories join the company's default list.
 *
 * A hook, like the platform's request workspace; `NewRequestView` places it in
 * the portal's chrome and mounts it only while building, so each Info Request
 * starts fresh.
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Alert, Button, ButtonIcon, Checkbox, Chip, ComboboxPanel, FormField, Heading, Icon, Input, Link, Modal, Overline, PageTemplate,
  Select, SelectMenu, SelectMenuOption, SubmenuItem, TertiaryMenu, Text, Textarea, color, glyphs, icons, motion, radius, size, space, zIndex,
} from '@scalar/design-system';
import type { Company } from '../../../data/fixtures.js';
import { href } from '../../../router.js';
import { routes } from '../../../routes.js';
import { useDismiss } from '../../p04-waterfalls/useDismiss.js';
import { defaultDocumentRequests, defaultQuestions, responsibles } from '../../p10-company-documents/data.js';
import { CopyLink, EmailPreview, RecipientSwitch, defaultSubject, type EmailContent } from './EmailReview.js';
import { INTRODUCTION, type RequestSet } from './fixtures.js';
import { DOC_EXTENSIONS, formatDay, responseTypeLabel, type Category, type InformationRequest, type ResponseType } from './model.js';
import { DueDateDialog } from './PortalModals.js';
import { typeIcon } from './RequestRow.js';
import { newToken, type Outreach } from './store.js';

type BuilderType = 'choice' | 'multiple_choice' | 'text' | 'date' | 'file';
const BUILDER_TYPES: BuilderType[] = ['file', 'text', 'choice', 'multiple_choice', 'date'];
const toBuilderType = (t: ResponseType): BuilderType => ((BUILDER_TYPES as ResponseType[]).includes(t) ? t as BuilderType : 'file');
/** A multiple-choice request starts with two empty options; it needs two written ones to send. */
const MIN_OPTIONS = 2;
const DESCRIPTION_MAX = 500;
/** One light line until there is more to say; the field grows with the text (`field-sizing` is newer than the CSS types). */
const DESCRIPTION_STYLE = { fieldSizing: 'content', resize: 'none', minHeight: size.control.s } as CSSProperties;

interface TemplateRequest { title: string; categoryId: string; responseType: BuilderType; description?: string; options?: string[] }
interface RequestTemplate { id: string; name: string; updatedAt: string; introduction: string[]; requests: TemplateRequest[] }
interface DraftRequest extends TemplateRequest { key: string; description: string; included: boolean; options: string[] }
/** A category as the builder holds it: `saved` ones are the company's own (kept by number), `draft` ones are new here. */
interface BuilderCategory extends Category { custom?: 'saved' | 'draft' }

/** The platform's standard list, filed into the standard categories. Templates carry descriptions, so they ship pre-filled. */
const STANDARD: TemplateRequest[] = [
  { title: defaultDocumentRequests[5]!, categoryId: 'corporate', responseType: 'file', description: 'The current restated certificate, with every amendment since.' },
  { title: defaultQuestions[8]!, categoryId: 'corporate', responseType: 'text' },
  { title: defaultDocumentRequests[4]!, categoryId: 'capitalization', responseType: 'file', description: 'As of the report date, including options and warrants with their strike prices. Excel preferred.' },
  { title: defaultQuestions[3]!, categoryId: 'capitalization', responseType: 'choice' },
  { title: defaultQuestions[5]!, categoryId: 'capitalization', responseType: 'text' },
  { title: defaultQuestions[6]!, categoryId: 'capitalization', responseType: 'choice' },
  { title: defaultQuestions[7]!, categoryId: 'capitalization', responseType: 'date' },
  { title: defaultDocumentRequests[2]!, categoryId: 'financials', responseType: 'file', description: 'The last three fiscal years, audited where available. Excel preferred over PDF.' },
  { title: defaultDocumentRequests[3]!, categoryId: 'projections', responseType: 'file', description: 'The model you use internally, with its assumptions tab.' },
  { title: defaultQuestions[2]!, categoryId: 'projections', responseType: 'text' },
  { title: defaultDocumentRequests[1]!, categoryId: 'customers', responseType: 'file' },
  { title: defaultDocumentRequests[6]!, categoryId: 'transactions', responseType: 'file' },
  { title: defaultQuestions[0]!, categoryId: 'transactions', responseType: 'date' },
  { title: defaultQuestions[1]!, categoryId: 'transactions', responseType: 'text' },
  { title: defaultQuestions[4]!, categoryId: 'transactions', responseType: 'choice' },
  {
    title: 'Which of these events occurred since the last valuation?', categoryId: 'transactions', responseType: 'multiple_choice',
    options: ['Acquisition of another company', 'New financing round', 'Departure of a key executive', 'Restructuring or layoffs'],
  },
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
      { title: 'Audited financial statements', categoryId: 'financials', responseType: 'file', description: 'Signed by the auditors, with the notes.' },
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
      { title: defaultDocumentRequests[2]!, categoryId: 'financials', responseType: 'file', description: 'This quarter only. Excel preferred.' },
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
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

let keySeq = 0;
const newKey = () => `nd${++keySeq}`;
const blankOptions = () => Array.from({ length: MIN_OPTIONS }, () => '');
const withKeys = (rs: TemplateRequest[]): DraftRequest[] => rs.map((d) => ({
  ...d, description: d.description ?? '', included: true, key: newKey(),
  options: d.options ? [...d.options] : d.responseType === 'multiple_choice' ? blankOptions() : [],
}));
const writtenOptions = (d: DraftRequest) => d.options.map((o) => o.trim()).filter(Boolean);
/** What counts as an edit: the requests (wording, type, category, description, included) and the introduction. */
const snapshot = (drafts: DraftRequest[], intro: string) =>
  JSON.stringify([drafts.map((d) => [d.categoryId, d.title, d.responseType, d.description, d.included, d.options]), intro]);
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** "Add question" asks for a written answer; "Add document" for an upload. The type can still change after. */
const ADD_KINDS: { type: BuilderType; label: string }[] = [
  { type: 'text', label: 'Add question' },
  { type: 'file', label: 'Add document' },
];

export interface NewRequestOptions {
  company: Company;
  /** The request set's fixed categories. */
  baseCategories: Category[];
  /** Categories this company's earlier requests added (its default list). */
  companyCategories: Category[];
  requestSet: RequestSet;
  /** The requests already in this list: "Last request sent" and the numbering start from them. */
  existing: InformationRequest[];
  dueDate: string;
  /** The email's sender: brand, "Scalar" or the firm, and the signed-in user. */
  brand: 'scalar' | 'firm';
  senderName: string;
  senderUser: string;
  /** The respondent on file, first in the picker. */
  recipient: string;
  /** Empty state: Blank preselected, or the template field focused ("Start from a template"). */
  start?: { template?: string; focusTemplate?: boolean };
  /** The portal URL a recipient's token opens. */
  linkFor: (token: string) => string;
  onCancel: () => void;
  onSent: (added: InformationRequest[], dueDate: string, extra: { categories: Category[]; outreach: Outreach }, how: 'email' | 'link') => void;
}

/**
 * The builder as a page: the portal's Tier 1 and Tier 2 stay, Tier 3 names the
 * company and holds Cancel and Send.
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
      {body}
      {overlay}
    </PageTemplate>
  );
}

export function useNewRequest({
  company, baseCategories, companyCategories, requestSet, existing, dueDate: currentDue, brand, senderName, senderUser, recipient,
  start, linkFor, onCancel, onSent,
}: NewRequestOptions) {
  const introText = (t: { introduction: string[] }) => t.introduction.join('\n\n').replace(/\{company\}/g, company.name).replace(/\{sender\}/g, senderName);

  /* ---- categories: the set's own, the company's saved ones, and any added here ---- */
  const [cats, setCats] = useState<BuilderCategory[]>(() => [
    ...baseCategories,
    ...companyCategories.filter((c) => !baseCategories.some((b) => b.id === c.id)).map((c) => ({ ...c, custom: 'saved' as const })),
  ]);
  // Saved numbers never move (sent requests carry them); new categories are numbered after every number ever used.
  const highest = useMemo(() => Math.max(0, ...baseCategories.map((c) => c.order), ...companyCategories.map((c) => c.order), ...existing.map((r) => r.categoryOrder)), [baseCategories, companyCategories, existing]);
  const categories = useMemo<BuilderCategory[]>(() => {
    let next = highest;
    return cats.map((c) => (c.custom === 'draft' ? { ...c, order: ++next } : c));
  }, [cats, highest]);
  const catOrder = useCallback((id: string) => categories.find((c) => c.id === id)?.order ?? 99, [categories]);
  const fallbackCategory = categories.find((c) => c.id === 'other' || c.id === 'v-other')?.id ?? categories[categories.length - 1]!.id;

  /* ---- templates ---- */
  const templates = useMemo<RequestTemplate[]>(() => {
    const last = existing.filter((r) => !r.parentId).map((r) => ({ title: r.title, categoryId: r.categoryId, responseType: toBuilderType(r.responseType), description: r.details,
      ...(r.choice?.mode === 'multiple' ? { options: r.choice.options.filter((o) => !o.other).map((o) => o.label) } : {}) }))
      // Single-pick lists are not offered by the builder; they come back as Yes / No only when they were Yes / No.
      .map((d) => (d.responseType === 'multiple_choice' && !d.options ? { ...d, responseType: 'choice' as const } : d));
    return [
      ...(last.length ? [{ id: 'last', name: 'Last request sent to this company', updatedAt: '', introduction: INTRODUCTION, requests: last }] : []),
      { id: 'blank', name: 'Blank', updatedAt: '', introduction: [], requests: [] },
      ...(requestSet === 'standard' ? SAVED_TEMPLATES : []),
    ];
  }, [existing, requestSet]);
  const first = templates.find((t) => t.id === (start?.template ?? 'standard')) ?? templates.find((t) => t.id === 'standard') ?? templates[0]!;
  const [templateId, setTemplateId] = useState(first.id);
  const [switchTo, setSwitchTo] = useState<RequestTemplate | null>(null);
  const [drafts, setDrafts] = useState<DraftRequest[]>(() => withKeys(first.requests));
  const [category, setCategory] = useState<string>('all');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dueDate, setDueDate] = useState(currentDue);
  const [dueOpen, setDueOpen] = useState(false);
  const [intro, setIntro] = useState(() => introText(first));
  const [baseline, setBaseline] = useState(() => snapshot(drafts, intro));
  const edited = snapshot(drafts, intro) !== baseline;
  const contacts = [...new Set([recipient, ...responsibles.map((r) => r.name)])];
  const templateField = useRef<HTMLSelectElement>(null);
  useEffect(() => { if (start?.focusTemplate) templateField.current?.focus(); }, [start?.focusTemplate]);

  const mergeInto = (current: DraftRequest[], adding: TemplateRequest[]) => {
    const seen = new Set(current.map((d) => d.title.trim().toLowerCase()));
    const fresh = adding.filter((d) => !seen.has(d.title.trim().toLowerCase()));
    return [...current, ...withKeys(fresh)].map((d, i) => ({ d, i }))
      .sort((a, b) => catOrder(a.d.categoryId) - catOrder(b.d.categoryId) || a.i - b.i).map((x) => x.d);
  };
  // A template resets the selection: every one of its rows starts included.
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
  const closePicker = useCallback(() => setPickerOpen(false), []);
  useDismiss(panelRef, pickerOpen, closePicker);

  /* ---- what will be sent ---- */
  const included = drafts.filter((d) => d.included);
  const blank = included.filter((d) => !d.title.trim());
  const fewOptions = included.filter((d) => d.responseType === 'multiple_choice' && writtenOptions(d).length < MIN_OPTIONS);
  const problems = [
    !recipients.length && 'Choose at least one person to send the request to.',
    !included.length && 'Include at least one request.',
    blank.length > 0 && `${blank.length} included request${blank.length === 1 ? ' has' : 's have'} no wording. Write it, untick it or remove it.`,
    fewOptions.length > 0 && `${fewOptions.length} multiple-choice request${fewOptions.length === 1 ? ' needs' : 's need'} at least ${MIN_OPTIONS} options.`,
  ].filter((p): p is string => !!p);
  const usedCategories = new Set(included.map((d) => d.categoryId)).size;
  const sendLabel = included.length === drafts.length ? `Send ${plural(drafts.length, 'request')}` : `Send ${included.length} of ${plural(drafts.length, 'request')}`;

  /* ---- adding rows: focus, scroll into view, fade in ---- */
  const scrollRef = useRef<HTMLDivElement>(null);
  const focusKey = useRef<string | null>(null);
  const freshKeys = useRef(new Set<string>());
  const add = (categoryId: string, type: BuilderType = 'file', afterKey?: string) => {
    const key = newKey();
    focusKey.current = key;
    freshKeys.current.add(key);
    setDrafts((all) => {
      // After the row it came from (Enter), else after the last row of its category, keeping category order.
      const after = afterKey ? all.findIndex((d) => d.key === afterKey) : all.map((d) => d.categoryId).lastIndexOf(categoryId);
      const order = catOrder(categoryId);
      const idx = after >= 0 ? after + 1 : all.findIndex((d) => catOrder(d.categoryId) > order);
      const next = [...all];
      next.splice(idx < 0 ? all.length : idx, 0, { key, categoryId, title: '', description: '', responseType: type, included: true, options: type === 'multiple_choice' ? blankOptions() : [] });
      return next;
    });
    if (category !== 'all' && category !== categoryId) setCategory('all');
  };
  const rowRef = (key: string) => (el: HTMLLIElement | null) => {
    if (!el || !freshKeys.current.has(key)) return;
    freshKeys.current.delete(key);
    el.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
    if (reducedMotion()) return;
    el.style.opacity = '0';
    el.style.transform = `translateY(-${space.xs})`;
    window.requestAnimationFrame(() => {
      el.style.transition = `opacity ${motion.moderate} ${motion.decelerate}, transform ${motion.moderate} ${motion.decelerate}`;
      el.style.opacity = '';
      el.style.transform = '';
    });
  };
  const scrollToCategory = (id: string) => window.requestAnimationFrame(() =>
    scrollRef.current?.querySelector(`[data-category="${id}"]`)?.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' }));

  const update = (key: string, patch: Partial<DraftRequest>) => setDrafts((all) => all.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  /** Switching to multiple choice keeps any options already written, topped up to two. */
  const setType = (d: DraftRequest, responseType: BuilderType) => update(d.key, {
    responseType,
    ...(responseType === 'multiple_choice' && d.options.length < MIN_OPTIONS ? { options: [...d.options, ...blankOptions()].slice(0, Math.max(MIN_OPTIONS, d.options.length)) } : {}),
  });
  const setOption = (d: DraftRequest, i: number, value: string) => update(d.key, { options: d.options.map((o, j) => (j === i ? value : o)) });
  const addOption = (d: DraftRequest) => { optionFocus.current = `${d.key}:${d.options.length}`; update(d.key, { options: [...d.options, ''] }); };
  const removeOption = (d: DraftRequest, i: number) => update(d.key, { options: d.options.filter((_, j) => j !== i) });
  const optionFocus = useRef<string | null>(null);
  const remove = (key: string) => setDrafts((all) => all.filter((d) => d.key !== key));
  const includeCategory = (id: string, on: boolean) => setDrafts((all) => all.map((d) => (d.categoryId === id ? { ...d, included: on } : d)));
  const addRecipient = (name: string) => { if (name && !recipients.includes(name)) setRecipients((r) => [...r, name]); };

  /* ---- Add category, rename, delete (custom categories only) ---- */
  const [naming, setNaming] = useState<{ id: string | null; value: string; error?: string } | null>(null);
  const [hoverCat, setHoverCat] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<{ id: string; moveTo: string } | null>(null);
  const saveName = () => {
    if (!naming) return;
    const name = naming.value.trim();
    if (!name) { setNaming(null); return; }
    if (categories.some((c) => c.id !== naming.id && c.name.trim().toLowerCase() === name.toLowerCase())) {
      setNaming({ ...naming, error: `There is already a category called ${name}.` });
      return;
    }
    if (naming.id) {
      setCats((all) => all.map((c) => (c.id === naming.id ? { ...c, name } : c)));
    } else {
      const id = `c-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
      setCats((all) => [...all, { id, order: 0, name, custom: 'draft' }]);
      setCategory('all');
      scrollToCategory(id);
    }
    setNaming(null);
  };
  const removeCategory = (id: string, moveTo?: string) => {
    if (moveTo) setDrafts((all) => all.map((d) => (d.categoryId === id ? { ...d, categoryId: moveTo } : d)));
    setCats((all) => all.filter((c) => c.id !== id));
    if (category === id) setCategory('all');
    setDeleting(null);
  };
  const askRemove = (id: string) => {
    if (drafts.some((d) => d.categoryId === id)) setDeleting({ id, moveTo: fallbackCategory });
    else removeCategory(id);
  };

  /* ---- review step (#4): links exist before anything is sent ---- */
  const [review, setReview] = useState<{ tokens: Record<string, string>; who: string; subject: string; note: string } | null>(null);
  const send = () => {
    setTried(true);
    if (problems.length) return;
    setReview({
      tokens: Object.fromEntries(recipients.map((r) => [r, review?.tokens[r] ?? newToken()])),
      who: recipients[0]!,
      subject: review?.subject ?? defaultSubject(company.name, dueDate),
      note: review?.note ?? '',
    });
  };
  const paragraphs = intro.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const summary = categories
    .map((c) => ({ name: `${c.order}. ${c.name}`, count: included.filter((d) => d.categoryId === c.id).length }))
    .filter((s) => s.count > 0);
  const email: EmailContent = {
    from: `${senderName} on behalf of ${senderUser}`,
    brand, senderName, companyName: company.name,
    subject: review?.subject ?? '', note: review?.note ?? '', introduction: paragraphs, summary, dueDate,
  };
  const create = async (how: 'email' | 'link') => {
    if (!review) return;
    if (how === 'link') {
      try { await navigator.clipboard.writeText(linkFor(review.tokens[review.who]!)); } catch { /* the toast still names the link; Email & link has it */ }
    }
    // Only included rows are created, numbered after what was already sent in each category, without gaps.
    const next = new Map<string, number>();
    const stamp = Date.now();
    const added: InformationRequest[] = included.map((d, i) => {
      const cat = categories.find((c) => c.id === d.categoryId)!;
      const order = next.get(cat.id) ?? Math.max(0, ...existing.filter((r) => r.categoryId === cat.id && !r.parentId).map((r) => r.requestOrder));
      next.set(cat.id, order + 1);
      return {
        id: `n-${stamp}-${i}`,
        categoryId: cat.id,
        categoryOrder: cat.order,
        requestOrder: order + 1,
        title: d.title.trim(),
        ...(d.description.trim() ? { details: d.description.trim() } : {}),
        responseType: d.responseType,
        status: 'pending',
        ...(d.responseType === 'file' ? { allowedExtensions: DOC_EXTENSIONS, maxFiles: 5 } : {}),
        ...(d.responseType === 'multiple_choice' ? {
          shortNote: 'Select all that apply.',
          choice: { mode: 'multiple', options: writtenOptions(d).map((label, j) => ({ id: `o${j + 1}`, label })) },
        } : {}),
      } as InformationRequest;
    });
    const sentAt = new Date().toISOString();
    onSent(added, dueDate, {
      categories: categories.filter((c) => c.custom).map(({ id, order, name }) => ({ id, order, name })),
      outreach: {
        subject: review.subject, note: review.note, createdAt: sentAt, introduction: paragraphs, summary, dueDate,
        invites: recipients.map((r) => ({ recipient: r, token: review.tokens[r]!, emailSentAt: how === 'email' ? sentAt : null })),
      },
    }, how);
  };

  const typed = query.trim();
  const pickerItems = [
    ...contacts.filter((n) => n.toLowerCase().includes(typed.toLowerCase())).map((n) => ({ value: n, label: n })),
    ...(EMAIL.test(typed) && !contacts.includes(typed) ? [{ value: typed, label: `Send to ${typed}` }] : []),
  ];
  const shownCategories = categories.filter((c) => category === 'all' || c.id === category);

  /* ---- left column: categories (sticky), with Add category ---- */
  const nameField = (
    <FormField state={naming?.error ? 'error' : undefined} helperText={naming?.error ?? 'Enter to save, Esc to cancel.'}>
      <Input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        aria-label={naming?.id ? 'Category name' : 'New category name'}
        placeholder="Category name"
        value={naming?.value ?? ''}
        onChange={(e) => setNaming((n) => n && { ...n, value: e.target.value, error: undefined })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); saveName(); }
          if (e.key === 'Escape') { e.preventDefault(); setNaming(null); }
        }}
      />
    </FormField>
  );
  const aside = (
    <aside style={{ position: 'sticky', top: 0, alignSelf: 'start', border: `1px solid ${color.stroke.default}`, borderRadius: radius.s, background: color.bg.surface }}>
      <nav aria-label="Categories" style={{ display: 'flex', flexDirection: 'column', gap: space['2xs'], padding: space.s }}>
        <Overline as="h2" style={{ padding: `${space.xs} ${space.s}` }}>Categories</Overline>
        <SubmenuItem current={category === 'all'} onClick={() => setCategory('all')}>
          <span style={{ display: 'flex', justifyContent: 'space-between', gap: space.s, width: '100%' }}>
            <span>All requests</span><Text as="span" step="s" tone="secondary">{`${included.length}/${drafts.length}`}</Text>
          </span>
        </SubmenuItem>
        {categories.map((c) => {
          const rows = drafts.filter((d) => d.categoryId === c.id);
          if (naming?.id === c.id) return <div key={c.id} style={{ padding: `${space.xs} ${space.s}` }}>{nameField}</div>;
          return (
            // Custom categories show rename and delete on hover or focus.
            <div key={c.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
              onMouseEnter={() => setHoverCat(c.id)} onMouseLeave={() => setHoverCat(null)}
              onFocus={() => setHoverCat(c.id)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHoverCat(null); }}>
              <SubmenuItem current={category === c.id} onClick={() => setCategory(c.id)} style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: space.s, width: '100%' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.order}. {c.name}</span>
                  {!(c.custom && hoverCat === c.id) && (
                    <Text as="span" step="s" tone="secondary">{`${rows.filter((d) => d.included).length}/${rows.length}`}</Text>
                  )}
                </span>
              </SubmenuItem>
              {c.custom && hoverCat === c.id && (
                <span style={{ position: 'absolute', right: space.xs, display: 'inline-flex', gap: space['2xs'], background: color.bg.surface }}>
                  <ButtonIcon variant="tertiary" size="xs" label={`Rename ${c.name}`} onClick={() => setNaming({ id: c.id, value: c.name })}
                    icon={<Icon size="s" tone="inherit"><icons.Edit /></Icon>} />
                  <ButtonIcon variant="tertiary" size="xs" label={`Delete ${c.name}`} onClick={() => askRemove(c.id)}
                    icon={<Icon size="s" tone="inherit"><icons.Delete /></Icon>} />
                </span>
              )}
            </div>
          );
        })}
        {naming && naming.id === null ? (
          <div style={{ padding: `${space.xs} ${space.s}` }}>{nameField}</div>
        ) : (
          <div style={{ padding: `${space.xs} ${space.s}` }}>
            <Button variant="tertiary" size="s" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>} onClick={() => setNaming({ id: null, value: '' })}>
              Add category
            </Button>
          </div>
        )}
      </nav>
    </aside>
  );

  /* ---- who, when, and the introduction ---- */
  const sendTo = (
    <section aria-labelledby="nr-send-to" style={{ display: 'flex', flexDirection: 'column', gap: space.m, padding: space.m, borderBottom: `1px solid ${color.stroke.divider}` }}>
      <FormField label="Template" helperText="Sets the requests, their descriptions and the introduction; every row starts included. Recipients and the due date stay as they are.">
        <Select ref={templateField} value={templateId} onChange={(e) => pickTemplate(e.currentTarget.value)}>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {`${t.name} — ${plural(t.requests.length, 'request')}${t.updatedAt ? ` · edited ${formatDay(t.updatedAt)}` : ''}`}
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
                : 'Each person gets their own email and link. Pick a contact or type an email address.'}
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
      <FormField label="Introduction" helperText="Shown above the requests and in the email. Leave a blank line between paragraphs.">
        <Textarea rows={4} value={intro} onChange={(e) => setIntro(e.target.value)} />
      </FormField>
    </section>
  );

  /* ---- the numbered list: every category, each with its add actions ---- */
  const addButtons = (c: BuilderCategory) => (
    <span style={{ display: 'inline-flex', gap: space.s, flexWrap: 'wrap' }}>
      {ADD_KINDS.map((k) => (
        <Button key={k.type} variant="secondary" size="s" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}
          aria-label={`${k.label} to ${c.name}`} onClick={() => add(c.id, k.type)}>
          {k.label}
        </Button>
      ))}
    </span>
  );
  /** Multiple choice: the options the responder picks from, as many as apply. */
  const optionsEditor = (d: DraftRequest, label: string, short: boolean) => (
    <div role="group" aria-label={`Options for ${label}`} style={{ display: 'flex', flexDirection: 'column', gap: space.xs, paddingTop: space.xs }}>
      <Text as="span" step="s" tone={short ? 'negative' : 'secondary'}>
        {short ? `Write at least ${MIN_OPTIONS} options.` : 'Options. The responder can select as many as apply.'}
      </Text>
      {d.options.map((o, i) => (
        // Options have no id until sent; position is their identity here.
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: space.s }}>
          <Icon size="s" tone="disabled"><icons.CheckBoxOutlineBlank /></Icon>
          <Input
            aria-label={`Option ${i + 1} for ${label}`}
            placeholder={`Option ${i + 1}`}
            value={o}
            ref={(el) => { if (el && optionFocus.current === `${d.key}:${i}`) { el.focus(); optionFocus.current = null; } }}
            onChange={(e) => setOption(d, i, e.target.value)}
            // Enter adds the next option below the last one.
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); if (i === d.options.length - 1) addOption(d); } }}
            style={{ flex: 1, minWidth: 0 }}
          />
          <ButtonIcon variant="tertiary" size="s" label={`Remove option ${i + 1}`} disabled={d.options.length <= MIN_OPTIONS}
            onClick={() => removeOption(d, i)} icon={<Icon size="s" tone="inherit"><icons.Close /></Icon>} />
        </div>
      ))}
      <div>
        <Button variant="tertiary" size="s" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>} onClick={() => addOption(d)}>Add option</Button>
      </div>
    </div>
  );
  const list = (
    <ul aria-label="Requests to send" style={{ margin: 0, padding: 0 }}>
      {shownCategories.map((c) => {
        const items = drafts.filter((d) => d.categoryId === c.id);
        const on = items.filter((d) => d.included).length;
        let n = 0;
        return [
          <li key={`h-${c.id}`} data-category={c.id} style={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: space.s, padding: `${space.s} ${space.m} ${space.xs}`, background: color.bg.subtle, borderBottom: `1px solid ${color.stroke.divider}`, scrollMarginTop: space.m }}>
            {items.length > 0 && (
              <Checkbox size="s" checked={on === items.length} indeterminate={on > 0 && on < items.length}
                aria-label={`Include every request in ${c.name}`} onChange={() => includeCategory(c.id, on < items.length)} />
            )}
            <Overline>{`${c.order}. ${c.name}`}</Overline>
            {items.length > 0 && <Text as="span" step="s" tone="secondary">{`${on} of ${items.length} included`}</Text>}
          </li>,
          ...items.map((d) => {
            const num = d.included ? `${c.order}.${++n}` : '—';
            const missing = tried && d.included && !d.title.trim();
            const label = d.title.trim() || `new ${responseTypeLabel[d.responseType].toLowerCase()} request`;
            return (
              <li key={d.key} ref={rowRef(d.key)} style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'auto auto minmax(0, 1fr) minmax(min-content, 22%) auto', alignItems: 'start', gap: space.s, padding: `${space.s} ${space.m}`, borderBottom: `1px solid ${color.stroke.divider}`, background: d.included ? undefined : color.bg.subtle }}>
                <span style={{ paddingTop: space.xs }}>
                  <Checkbox size="s" checked={d.included} aria-label={`Include ${label}`} onChange={(e) => update(d.key, { included: e.currentTarget.checked })} />
                </span>
                <Text as="span" step="m" weight="semiBold" tone={d.included ? 'secondary' : 'tertiary'} style={{ paddingTop: space.xs, minWidth: space['2xl'], fontVariantNumeric: 'tabular-nums' }}>{num}</Text>
                {/* Unticked rows stay in place, dimmed, so they can be included again; they are not sent. */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs, opacity: d.included ? 1 : 0.6 }}>
                  <FormField state={missing ? 'error' : undefined} helperText={missing ? 'Write the request, untick it or remove it.' : undefined}>
                    <Input
                      aria-label={`Request ${num === '—' ? '(not included)' : num}`}
                      ref={(el) => { if (el && focusKey.current === d.key) { el.focus(); focusKey.current = null; } }}
                      placeholder={d.responseType === 'file' ? 'Name the document you need' : 'Write the question'}
                      value={d.title}
                      onChange={(e) => update(d.key, { title: e.target.value })}
                      // Enter adds the next row of the same type below this one.
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); add(d.categoryId, d.responseType, d.key); } }}
                    />
                  </FormField>
                  <FormField helperText={d.description.length >= DESCRIPTION_MAX - 100 ? `${d.description.length}/${DESCRIPTION_MAX}` : undefined}>
                    <Textarea
                      rows={1}
                      maxLength={DESCRIPTION_MAX}
                      aria-label={`Description for ${label} (optional)`}
                      placeholder="Add a description (optional) — the period, the format, what counts"
                      value={d.description}
                      onChange={(e) => update(d.key, { description: e.target.value })}
                      style={DESCRIPTION_STYLE}
                    />
                  </FormField>
                  {d.responseType === 'multiple_choice' && optionsEditor(d, label, tried && d.included && writtenOptions(d).length < MIN_OPTIONS)}
                </div>
                <TypePicker label={`How ${label} is answered`} value={d.responseType} onChange={(t) => setType(d, t)} />
                <ButtonIcon variant="tertiary" size="s" label={`Remove ${label}`} onClick={() => remove(d.key)}
                  icon={<Icon size="s" tone="inherit"><icons.Delete /></Icon>} />
              </li>
            );
          }),
          <li key={`a-${c.id}`} style={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: space.m, flexWrap: 'wrap', padding: `${space.s} ${space.m}`, borderBottom: `1px solid ${color.stroke.divider}` }}>
            {!items.length && <Text as="span" step="m" tone="secondary">{`No requests in ${c.name} yet`}</Text>}
            {addButtons(c)}
          </li>,
        ];
      })}
    </ul>
  );

  const body = (
    <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.l, paddingBlock: space.m }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: space.m, flexWrap: 'wrap' }}>
          <Heading level={2} step="2xl">New Information Request</Heading>
          <Text step="m" tone="secondary" aria-live="polite">
            {`${company.name} · ${included.length} of ${plural(drafts.length, 'request')} in ${usedCategories} categor${usedCategories === 1 ? 'y' : 'ies'}`}
          </Text>
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
    </div>
  );

  const deletingCat = deleting && categories.find((c) => c.id === deleting.id);
  const deletingCount = deleting ? drafts.filter((d) => d.categoryId === deleting.id).length : 0;
  const reviewInvite = review && recipients.includes(review.who) ? review.who : recipients[0];

  const overlay = (
    <>
      <DueDateDialog open={dueOpen} onClose={() => setDueOpen(false)} dueDate={dueDate} onSave={setDueDate} />
      <Modal
        open={switchTo !== null}
        onClose={() => setSwitchTo(null)}
        size="s"
        role="alertdialog"
        title={switchTo ? `Replace your ${plural(drafts.length, 'request')} with ‘${switchTo.name}’ (${plural(switchTo.requests.length, 'request')})?` : ''}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setSwitchTo(null)}>Cancel</Button>
            <Button variant="secondary" disabled={!switchTo?.requests.length} onClick={() => switchTo && addTemplate(switchTo)}>Add to current</Button>
            <Button variant="primary" onClick={() => switchTo && applyTemplate(switchTo)}>Replace</Button>
          </>
        }
      >
        <Text step="m">
          You have edited this request or changed which rows are included. Replace discards that and starts from the template, every row included.
          Add to current keeps it and adds the template’s requests, skipping any with the same wording. Recipients and the due date stay as they are.
        </Text>
      </Modal>
      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        size="s"
        role="alertdialog"
        title={deletingCat ? `Delete ${deletingCat.name}?` : ''}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="primary" tone="negative" onClick={() => deleting && removeCategory(deleting.id, deleting.moveTo)}>Delete and move</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
          <Text step="m">{`${plural(deletingCount, 'request')} in this category will move. ${deletingCat?.custom === 'saved' ? 'It stays in the company’s default list for later requests.' : ''}`}</Text>
          <FormField label="Move them to">
            <Select value={deleting?.moveTo ?? ''} onChange={(e) => setDeleting((d) => d && { ...d, moveTo: e.currentTarget.value })}>
              {categories.filter((c) => c.id !== deleting?.id).map((c) => <option key={c.id} value={c.id}>{`${c.order}. ${c.name}`}</option>)}
            </Select>
          </FormField>
        </div>
      </Modal>
      <Modal
        open={review !== null}
        onClose={() => setReview(null)}
        size="l"
        title="Review and send"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setReview(null)}>Back to edit</Button>
            <Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><icons.ContentCopy /></Icon>} onClick={() => create('link')}>Copy link only</Button>
            <Button variant="primary" trailingIcon={<Icon size="s" tone="inherit"><icons.Send /></Icon>} onClick={() => create('email')}>
              {recipients.length > 1 ? `Send ${recipients.length} emails` : 'Send email'}
            </Button>
          </>
        }
      >
        {review && reviewInvite && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
            <Text step="m" tone="secondary">
              {`Nothing has gone out yet. ${included.length === drafts.length ? plural(included.length, 'request') : `${included.length} of ${plural(drafts.length, 'request')}`} for ${company.name}, due ${fmt(dueDate)}. Copy link only creates the request without emailing, for sending from your own email.`}
            </Text>
            <RecipientSwitch recipients={recipients} value={reviewInvite} onChange={(who) => setReview((r) => r && { ...r, who })} />
            <CopyLink link={linkFor(review.tokens[reviewInvite]!)} label={recipients.length > 1 ? `${reviewInvite}’s link` : 'Request link'} />
            <FormField label="Subject">
              <Input value={review.subject} onChange={(e) => setReview((r) => r && { ...r, subject: e.target.value })} />
            </FormField>
            <FormField label="Personal note (optional)" helperText="Shown above the introduction. To change the requests, go back to edit.">
              <Textarea rows={2} value={review.note} onChange={(e) => setReview((r) => r && { ...r, note: e.target.value })} />
            </FormField>
            <Overline as="h3">Email preview</Overline>
            <EmailPreview email={email} to={reviewInvite} />
          </div>
        )}
      </Modal>
    </>
  );

  const actions = (
    <>
      <Button variant="tertiary" size="xs" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" size="xs" trailingIcon={<Icon size="s" tone="inherit"><icons.Send /></Icon>} onClick={send}>{sendLabel}</Button>
    </>
  );

  return { body, overlay, actions };
}

/**
 * The answer type of one request: a field that opens the Scalar SelectMenu
 * (click the field or its chevron, or ↓ / Enter / Space from the keyboard),
 * never the browser's native list. Esc or a click outside closes it and
 * returns focus to the field.
 */
function TypePicker({ label, value, onChange }: { label: string; value: BuilderType; onChange: (t: BuilderType) => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const close = useCallback(() => { setOpen(false); trigger.current?.focus(); }, []);
  useDismiss(wrap, open, close);
  useEffect(() => { if (open) menu.current?.focus(); }, [open]);
  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      {/* One trigger: the whole field, chevron included, opens the menu. */}
      <button
        ref={trigger}
        type="button"
        className="scalar-field"
        data-state="default"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${label}: ${responseTypeLabel[value]}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' && !open) { e.preventDefault(); setOpen(true); } }}
        style={{ cursor: 'pointer', textAlign: 'left' }}
      >
        <Icon size="s" tone="secondary">{typeIcon[value]}</Icon>
        <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{responseTypeLabel[value]}</span>
        <Icon size="s" tone="secondary" className={open ? 'scalar-rotate-180' : undefined}><glyphs.ChevronDown /></Icon>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, minWidth: '100%', zIndex: zIndex.overlay, marginTop: space.xs }}>
          <SelectMenu ref={menu} id={menuId} label={label} onEscape={close}>
            {BUILDER_TYPES.map((t) => (
              <SelectMenuOption key={t} selected={t === value} icon={<Icon size="s" tone="inherit">{typeIcon[t]}</Icon>}
                onSelect={() => { onChange(t); close(); }}>
                {responseTypeLabel[t]}
              </SelectMenuOption>
            ))}
          </SelectMenu>
        </div>
      )}
    </div>
  );
}
