/**
 * The request email and its links, as the sender reviews them (plan item 4).
 *
 * - `EmailPreview` draws the email a recipient gets: From, To, Subject, the
 *   personal note, the introduction, the request count by category, the due
 *   date and the portal button. One component for the review step and for
 *   "Email & link" afterwards, so the two never drift (the real build shares
 *   it with the email template).
 * - `CopyLink` is the request link with Copy link ("Copied" for 2 s). When the
 *   clipboard is blocked it selects the field so the sender can copy by hand.
 * - `EmailLinkDialog` reopens both after sending, with Resend email.
 *
 * PROTOTYPE: no email is sent and the link is a token in the portal URL.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Button, FormField, Icon, Input, Modal, Overline, Select, Text, color, icons, radius, size, space,
} from '@scalar/design-system';
import type { Outreach } from './store.js';

const fmt = (iso: string) => { const [y, m, d] = iso.split('-'); return `${m}/${d}/${y}`; };
const stamp = (iso: string) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export interface EmailContent {
  /** "Scalar on behalf of Steven Hansen". */
  from: string;
  brand: 'scalar' | 'firm';
  senderName: string;
  companyName: string;
  subject: string;
  note: string;
  introduction: string[];
  summary: { name: string; count: number }[];
  dueDate: string;
}

export const defaultSubject = (companyName: string, dueDate: string) => `${companyName} — information request due ${fmt(dueDate)}`;

/** The email as the recipient will read it. */
export function EmailPreview({ email, to }: { email: EmailContent; to: string }) {
  const total = email.summary.reduce((n, s) => n + s.count, 0);
  const row = (label: string, value: ReactNode) => (
    <div style={{ display: 'grid', gridTemplateColumns: `calc(${size.control.l} * 1.5) minmax(0, 1fr)`, gap: space.s }}>
      <Text as="span" step="s" tone="secondary">{label}</Text>
      <Text as="span" step="s">{value}</Text>
    </div>
  );
  return (
    <section aria-label="Email preview" style={{ border: `1px solid ${color.stroke.default}`, borderRadius: radius.s, background: color.bg.surface }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs, padding: space.m, borderBottom: `1px solid ${color.stroke.divider}`, background: color.bg.subtle }}>
        {row('From', email.from)}
        {row('To', to)}
        {row('Subject', email.subject || '(no subject)')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.m, padding: space.l }}>
        {email.brand === 'scalar'
          ? <img src="./assets/scalar-wordmark-navy.png" alt="Scalar" style={{ display: 'block', height: size.icon.l, width: 'auto' }} />
          : <img src="./assets/firm-logo.jpg" alt={email.senderName} style={{ display: 'block', height: size.icon.xl, width: 'auto' }} />}
        {email.note.trim() && <Text as="p" step="m" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{email.note.trim()}</Text>}
        {email.introduction.map((p) => <Text as="p" key={p} step="m" style={{ margin: 0 }}>{p}</Text>)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
          <Text step="m" weight="semiBold">{`${total} request${total === 1 ? '' : 's'} for ${email.companyName}`}</Text>
          <ul style={{ margin: 0, paddingLeft: space.l }}>
            {email.summary.map((s) => <li key={s.name}><Text step="s">{`${s.name}: ${s.count}`}</Text></li>)}
          </ul>
        </div>
        <Text step="m">{`Due ${fmt(email.dueDate)}`}</Text>
        {/* Presentational: the real email's button opens this recipient's link. */}
        <div><Button variant="primary" size="s" tabIndex={-1} aria-disabled>Open the request</Button></div>
        <Text step="s" tone="tertiary">{`${email.brand === 'scalar' ? 'Sent by Scalar.' : `Sent by ${email.senderName} through Scalar.`} This link is for ${to} only.`}</Text>
      </div>
    </section>
  );
}

/** The recipient's request link, with Copy link. */
export function CopyLink({ link, label = 'Request link' }: { link: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!copied) return; const t = window.setTimeout(() => setCopied(false), 2000); return () => window.clearTimeout(t); }, [copied]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); } catch {
      // Clipboard blocked: select the link so ⌘C / Ctrl+C copies it.
      field.current?.focus(); field.current?.select();
    }
  };
  return (
    <FormField label={label} helperText="One link per recipient. Anyone with it can open this request, so share it only with them.">
      <div style={{ display: 'flex', gap: space.s }}>
        <Input ref={field} readOnly value={link} onFocus={(e) => e.currentTarget.select()} style={{ flex: 1, minWidth: 0 }} />
        <Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit">{copied ? <icons.Check /> : <icons.ContentCopy />}</Icon>} onClick={copy}>
          <span aria-live="polite">{copied ? 'Copied' : 'Copy link'}</span>
        </Button>
      </div>
    </FormField>
  );
}

/** Pick which recipient's link and email to show, when there are several. */
export function RecipientSwitch({ recipients, value, onChange }: { recipients: string[]; value: string; onChange: (r: string) => void }) {
  if (recipients.length < 2) return null;
  return (
    <FormField label="Recipient">
      <Select value={value} onChange={(e) => onChange(e.currentTarget.value)}>
        {recipients.map((r) => <option key={r} value={r}>{r}</option>)}
      </Select>
    </FormField>
  );
}

/** After sending: reopen the email and links, copy a link again, or resend. */
export function EmailLinkDialog({ open, onClose, outreach, email, linkFor, onResend }: {
  open: boolean;
  onClose: () => void;
  outreach: Outreach;
  email: Omit<EmailContent, 'subject' | 'note' | 'introduction' | 'summary' | 'dueDate'>;
  linkFor: (token: string) => string;
  onResend: (recipient: string) => void;
}) {
  const [who, setWho] = useState(outreach.invites[0]?.recipient ?? '');
  const invite = outreach.invites.find((i) => i.recipient === who) ?? outreach.invites[0];
  if (!invite) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="l"
      title="Email & link"
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>Close</Button>
          <Button variant="primary" leadingIcon={<Icon size="s" tone="inherit"><icons.Send /></Icon>} onClick={() => onResend(invite.recipient)}>
            {invite.emailSentAt ? 'Resend email' : 'Send email'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
        <RecipientSwitch recipients={outreach.invites.map((i) => i.recipient)} value={invite.recipient} onChange={setWho} />
        <Text step="s" tone="secondary">
          {invite.emailSentAt ? `Email sent ${stamp(invite.emailSentAt)}.` : 'Not emailed: the link was copied to send another way.'}
          {' '}Resending makes a new link; the old one stops working.
        </Text>
        <CopyLink link={linkFor(invite.token)} />
        <Overline as="h3">Email</Overline>
        <EmailPreview
          to={invite.recipient}
          email={{ ...email, subject: outreach.subject, note: outreach.note, introduction: outreach.introduction, summary: outreach.summary, dueDate: outreach.dueDate }}
        />
      </div>
    </Modal>
  );
}
