/**
 * Secure respondent portal (training C16, domain-logic.md §10).
 *
 * The page an external contact reaches from the request email, without a
 * Scalar login. DOC: answer the analyst's questions and upload the requested
 * documents. The steps are kept apart so a failure in one never misreports
 * another:
 *
 *   validate → upload (each file) → submit → confirm → recover
 *
 * BUG-09 (2025): the portal broke after a successful upload/answer, and the
 * respondent could not tell whether anything had arrived. Here, the
 * `confirmation-failed` state says the response *was* received (the server
 * accepted it) and never asks for a resend. Submitting again is idempotent:
 * the same submission id never duplicates answers or files.
 *
 * VERIFY: link expiry, identity checks, upload limits, partial save.
 */
import { useState } from 'react';
import {
  Banner, Button, Checkbox, Dropzone, FileRow, FormField, Heading, ScalarProvider, Text, Textarea, color, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../../types.js';
import { defaultDocumentRequests, defaultQuestions } from '../../p10-company-documents/data.js';

const QUESTIONS = defaultQuestions.slice(0, 3);
const DOCUMENTS = defaultDocumentRequests.slice(2, 5);

type Phase = 'answering' | 'submitting' | 'received' | 'confirmation-failed';

interface Upload { name: string; state: 'uploading' | 'uploaded' }

/** The server's record of a submission. Kept by id, so a retry never duplicates (BUG-03, BUG-09). */
const server = new Map<string, { answers: number; files: number }>();

export function RespondentPortal({ state }: ScreenProps) {
  const [answers, setAnswers] = useState<string[]>(() => QUESTIONS.map((_, i) => (state === 'default' ? '' : `Answer ${i + 1}`)));
  const [uploads, setUploads] = useState<Record<string, Upload[]>>(() => (state === 'default' ? {} : { [DOCUMENTS[0]!]: [{ name: 'Balance sheet FY2025.xlsx', state: 'uploaded' }] }));
  const [phase, setPhase] = useState<Phase>(state === 'confirmation-failed' ? 'confirmation-failed' : state === 'received' ? 'received' : 'answering');
  const [showErrors, setShowErrors] = useState(false);
  const [submissionId] = useState(() => `REQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
  const [simulateConfirmFailure, setSimulateConfirmFailure] = useState(false);

  const missing = answers.map((a, i) => (a.trim() ? null : i)).filter((i): i is number => i !== null);
  const uploading = Object.values(uploads).flat().some((u) => u.state === 'uploading');

  const addFiles = (doc: string, files: File[]) => {
    const added = files.map((f) => ({ name: f.name, state: 'uploading' as const }));
    setUploads((u) => ({ ...u, [doc]: [...(u[doc] ?? []), ...added] }));
    // Each file is its own step: it lands, then shows as uploaded.
    window.setTimeout(() => setUploads((u) => ({
      ...u, [doc]: (u[doc] ?? []).map((x) => (added.some((a) => a.name === x.name) ? { ...x, state: 'uploaded' } : x)),
    })), 600);
  };

  const submit = () => {
    if (missing.length) { setShowErrors(true); return; }
    setShowErrors(false);
    setPhase('submitting');
    window.setTimeout(() => {
      // The server keeps one record per submission id: retrying never adds a second.
      server.set(submissionId, { answers: answers.length, files: Object.values(uploads).flat().length });
      setPhase(simulateConfirmFailure ? 'confirmation-failed' : 'received');
    }, 500);
  };

  return (
    <ScalarProvider mode="light" viewport="auto">
      <div style={{ minHeight: '100vh', background: color.bg.page, display: 'flex', justifyContent: 'center', padding: space.xl }}>
        <main style={{ width: '100%', maxWidth: '72ch', display: 'flex', flexDirection: 'column', gap: space.l }}>
          <Heading level={1} step="l">Information request from Spatical Ventures</Heading>
          <Text step="m" tone="secondary">For ABC Co · measurement 12/31/2024. You don’t need a Scalar account to respond.</Text>

          {phase === 'received' && (
            <Banner tone="positive" title="Your response was received">
              {`Reference ${submissionId}. Spatical Ventures can now see your answers and ${Object.values(uploads).flat().length} file(s). You can close this page.`}
            </Banner>
          )}
          {phase === 'confirmation-failed' && (
            <Banner tone="warning" title="Your response was received, but this page could not finish loading the confirmation">
              {`Reference ${submissionId}. Your answers and files are saved — you don’t need to send them again. If you want a copy of the confirmation, reload this page.`}
            </Banner>
          )}
          {showErrors && (
            <Banner tone="negative" title="To submit, answer every question." issues={missing.map((i) => ({ label: `Question ${i + 1}` }))} />
          )}

          <section aria-labelledby="q-heading" style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
            <Heading level={2} step="s" id="q-heading">Questions</Heading>
            {QUESTIONS.map((q, i) => (
              <FormField
                key={q}
                label={`${i + 1}. ${q}`}
                state={showErrors && missing.includes(i) ? 'error' : 'default'}
                helperText={showErrors && missing.includes(i) ? 'Answer this question to submit.' : undefined}
              >
                <Textarea
                  rows={3}
                  value={answers[i]}
                  readOnly={phase !== 'answering'}
                  onChange={(e) => { const t = e.currentTarget.value; setAnswers((a) => a.map((x, j) => (j === i ? t : x))); }}
                />
              </FormField>
            ))}
          </section>

          <section aria-labelledby="d-heading" style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
            <Heading level={2} step="s" id="d-heading">Requested documents</Heading>
            {DOCUMENTS.map((d) => (
              <div key={d} style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
                <Text step="m" weight="semiBold">{d}</Text>
                {(uploads[d] ?? []).map((u) => (
                  <FileRow key={u.name} name={u.name} meta={[{ label: u.state === 'uploading' ? 'Uploading…' : 'Uploaded' }]} />
                ))}
                {phase === 'answering' && (
                  <Dropzone onFiles={(f) => addFiles(d, f)} multiple hint="PDF, Excel or Word, up to 25 MB" />
                )}
              </div>
            ))}
          </section>

          {phase === 'answering' || phase === 'submitting' ? (
            <div style={{ display: 'flex', gap: space.m, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Checkbox size="s" checked={simulateConfirmFailure} onChange={(e) => setSimulateConfirmFailure(e.currentTarget.checked)}>
                Prototype: simulate a confirmation failure after the server accepts the response
              </Checkbox>
              <Button onClick={submit} disabled={phase === 'submitting' || uploading}>
                {phase === 'submitting' ? 'Submitting…' : uploading ? 'Waiting for uploads…' : 'Submit response'}
              </Button>
            </div>
          ) : null}
        </main>
      </div>
    </ScalarProvider>
  );
}
