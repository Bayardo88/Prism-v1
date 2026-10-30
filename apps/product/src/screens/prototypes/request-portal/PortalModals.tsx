/**
 * The portal's dialogs: every nav link and the deadline chip lead somewhere
 * real (P1.5, P1.6, P1.7). Submissions go through the prototype store, so they
 * confirm, fail and retry like the real flow would.
 */
import { useState } from 'react';
import {
  Alert, Button, FormField, Input, Link, Modal, Text, Textarea, space,
} from '@scalar/design-system';
import { REQUEST_META } from './fixtures.js';

export type PortalDialog = 'login' | 'contact' | 'privacy' | 'help' | 'extend' | 'delegate' | null;

const col = { display: 'flex', flexDirection: 'column', gap: space.m } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const fmt = (iso: string) => { const [y, m, d] = iso.split('-'); return `${m}/${d}/${y}`; };

export function LoginDialog({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: (t: 'positive', s: string) => void }) {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const bad = touched && !EMAIL.test(email);
  return (
    <Modal open={open} onClose={onClose} title="Log in to the request portal" size="s"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { setTouched(true); if (EMAIL.test(email)) { onClose(); notify('positive', `Prototype: a sign-in link would be sent to ${email}.`); } }}>Send sign-in link</Button>
      </>}
    >
      <div style={col}>
        <Text step="m" tone="secondary">You can answer without logging in from the link in your email. Log in to see every request sent to you.</Text>
        <FormField label="Work email" required state={bad ? 'error' : 'default'} helperText={bad ? 'Enter an email like name@company.com.' : undefined}>
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} onBlur={() => setTouched(true)} />
        </FormField>
      </div>
    </Modal>
  );
}

export function ContactDialog({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: (t: 'positive', s: string) => void }) {
  const [msg, setMsg] = useState('');
  const [touched, setTouched] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title="Contact your analyst" size="m"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { setTouched(true); if (msg.trim()) { setMsg(''); setTouched(false); onClose(); notify('positive', `Message sent to ${REQUEST_META.analyst}.`); } }}>Send message</Button>
      </>}
    >
      <div style={col}>
        <Text step="m">{REQUEST_META.analyst} · {REQUEST_META.firm}</Text>
        <Text step="m" tone="secondary">Usually replies within one business day. For urgent questions, email <Link href="mailto:analyst@scalar.example">analyst@scalar.example</Link>.</Text>
        <FormField label="Message" required state={touched && !msg.trim() ? 'error' : 'default'} helperText={touched && !msg.trim() ? 'Write your question before sending.' : 'Mention the request number, e.g. 3.2.'}>
          <Textarea rows={4} value={msg} onChange={(e) => setMsg(e.currentTarget.value)} />
        </FormField>
      </div>
    </Modal>
  );
}

export function PrivacyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Privacy Policy" size="m" footer={<Button onClick={onClose}>Close</Button>}>
      <div style={col}>
        <Alert tone="warning" title="Prototype">This page is a placeholder for the approved policy. In this prototype, answers and files stay in your browser and are not sent anywhere.</Alert>
        <Text step="m">Scalar uses the information you provide only to prepare the valuation requested by {REQUEST_META.firm}. Access is limited to the people working on this engagement.</Text>
        <Text step="m">You can ask for a copy or deletion of what you submitted by contacting your analyst.</Text>
      </div>
    </Modal>
  );
}

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const steps = [
    'Pick a category on the left, or work through the whole list.',
    'Open a request to answer it. Each one asks for exactly one kind of response — an answer, a date, a Yes/No, or a file.',
    'For a template request, download the template, fill it in, and upload it to the same request.',
    'A request turns Complete only once your response is saved. If an upload fails, it stays Pending and you can try again.',
    'If something does not apply, or you sent it another way, say so from the request’s actions. You can reopen it later.',
    'Select several requests to mark or delegate them together. Only the requests you can see are changed.',
  ];
  return (
    <Modal open={open} onClose={onClose} title="How do I use this?" size="m" footer={<Button onClick={onClose}>Got it</Button>}>
      <ol style={{ ...col, margin: 0, paddingLeft: space.l }}>
        {steps.map((s) => <li key={s}><Text step="m">{s}</Text></li>)}
      </ol>
    </Modal>
  );
}

export function ExtendDialog({ open, onClose, dueDate, onSubmit }: {
  open: boolean; onClose: () => void; dueDate: string; onSubmit: (date: string, reason: string) => Promise<void>;
}) {
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dateBad = !date || date <= dueDate;
  const submit = async () => {
    setTouched(true);
    if (dateBad || !reason.trim()) return;
    setBusy(true); setError(null);
    try { await onSubmit(date, reason.trim()); onClose(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Request more time" size="s"
      footer={<>
        <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={submit} loading={busy}>Send extension request</Button>
      </>}
    >
      <div style={col}>
        <Text step="m" tone="secondary">Current due date: {fmt(dueDate)}. {REQUEST_META.analyst} will confirm the new date.</Text>
        <FormField label="New due date" required state={touched && dateBad ? 'error' : 'default'} helperText={touched && dateBad ? `Pick a date after ${fmt(dueDate)}.` : undefined}>
          <Input type="date" min={dueDate} value={date} onChange={(e) => setDate(e.currentTarget.value)} />
        </FormField>
        <FormField label="Reason" required state={touched && !reason.trim() ? 'error' : 'default'} helperText={touched && !reason.trim() ? 'Tell the analyst why you need more time.' : undefined}>
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.currentTarget.value)} />
        </FormField>
        {error && <Alert tone="negative" title="Not sent">{error}</Alert>}
      </div>
    </Modal>
  );
}

export function DelegateDialog({ open, onClose, count, onSubmit }: {
  open: boolean; onClose: () => void; count: number; onSubmit: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bad = !EMAIL.test(email);
  const submit = async () => {
    setTouched(true);
    if (bad) return;
    setBusy(true); setError(null);
    try { await onSubmit(email.trim()); setEmail(''); setTouched(false); onClose(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title={`Delegate ${count === 1 ? 'this request' : `${count} requests`}`} size="s"
      footer={<>
        <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={submit} loading={busy}>Delegate</Button>
      </>}
    >
      <div style={col}>
        <Text step="m" tone="secondary">They will get a link to answer {count === 1 ? 'this request' : 'these requests'} only. You keep access and can still answer them yourself.</Text>
        <FormField label="Colleague’s email" required state={touched && bad ? 'error' : 'default'} helperText={touched && bad ? 'Enter an email like name@company.com.' : undefined}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} onBlur={() => setTouched(true)} />
        </FormField>
        {error && <Alert tone="negative" title="Not delegated">{error}</Alert>}
      </div>
    </Modal>
  );
}
