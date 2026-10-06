/**
 * Information Request — a focused, full-page task: list the documents and
 * questions to request from the company, choose who is responsible for
 * answering, and send. Opened from "New Info Request" on Company · Documents
 * or Questions, and from the Workspace drawer's "Request new document".
 *
 * Figma: 10 · Company · Documents & Requests → Information Request (2 frames).
 */
import { useCallback, useRef, useState } from 'react';
import {
  Button, ComboboxPanel, FormField, Heading, Icon, Input, PageTaskHeader, RepeatableRow, ScalarProvider, Text,
  color, icons, space, zIndex,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { navigate } from '../../router.js';
import { routes } from '../../routes.js';
import { companyById } from '../../data/fixtures.js';
import { useDismiss } from '../p04-waterfalls/useDismiss.js';
import { defaultDocumentRequests, defaultQuestions, responsibles } from './data.js';

function RequestList({ items, onRemove, noun }: { items: string[]; onRemove: (i: number) => void; noun: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
      {items.map((it, i) => (
        <RepeatableRow key={`${it}-${i}`} onRemove={() => onRemove(i)} removeLabel={`Remove ${noun}: ${it}`}>
          <Text step="m">{it}</Text>
        </RepeatableRow>
      ))}
    </div>
  );
}

export function InformationRequest({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [docs, setDocs] = useState(defaultDocumentRequests);
  const [questions, setQuestions] = useState(defaultQuestions);
  const [docDraft, setDocDraft] = useState('');
  const [questionDraft, setQuestionDraft] = useState<string | undefined>();
  const [responsible, setResponsible] = useState<string | undefined>();
  const [pickerOpen, setPickerOpen] = useState(state === 'responsible-picker');
  const [query, setQuery] = useState('');
  const docInput = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closePicker = useCallback(() => setPickerOpen(false), []);
  useDismiss(panelRef, pickerOpen, closePicker);

  const back = () => navigate(routes.company.documents(company.id));
  const chosen = responsibles.find((r) => r.id === responsible);
  const canSend = !!chosen && (docs.length > 0 || questions.length > 0);

  const addDoc = () => { if (docDraft.trim()) { setDocs((d) => [...d, docDraft.trim()]); setDocDraft(''); } };
  const addQuestion = () => {
    if (questionDraft?.trim()) setQuestions((q) => [...q, questionDraft.trim()]);
    setQuestionDraft(undefined);
  };

  return (
    <ScalarProvider mode="light" viewport="auto">
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: color.bg.page }}>
        <PageTaskHeader
          title="Information Request"
          subtitle={`${company.name} · ${company.asOf}`}
          onBack={back}
          actions={
            <Button variant="primary" disabled={!canSend} trailingIcon={<Icon size="s" tone="inherit"><icons.Send /></Icon>} onClick={back}>
              Send
            </Button>
          }
        />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: space['2xl'], padding: space.l }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: space['2xl'], alignItems: 'start' }}>
            <section aria-labelledby="ir-docs" style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
              <div>
                <Heading level={2} step="m" id="ir-docs">Document Requests</Heading>
                <Text step="m" tone="secondary">The recipient will need to upload a document that includes the information for each request.</Text>
              </div>
              <FormField label="Document Name">
                <Input
                  ref={docInput}
                  autoFocus={state === 'default'}
                  placeholder="Enter name of requested document and press enter"
                  value={docDraft}
                  onChange={(e) => setDocDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addDoc(); }}
                />
              </FormField>
              <RequestList items={docs} noun="document request" onRemove={(i) => setDocs((d) => d.filter((_, j) => j !== i))} />
              <div>
                <Button variant="tertiary" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>} onClick={() => (docDraft.trim() ? addDoc() : docInput.current?.focus())}>
                  Add document request
                </Button>
              </div>
            </section>

            <section aria-labelledby="ir-questions" style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
              <div>
                <Heading level={2} step="m" id="ir-questions">Questions</Heading>
                <Text step="m" tone="secondary">Use the questions to request additional information that will be needed to complete the valuation.</Text>
              </div>
              <RequestList items={questions} noun="question" onRemove={(i) => setQuestions((q) => q.filter((_, j) => j !== i))} />
              {questionDraft !== undefined && (
                <FormField label="New question" helperText="Press Enter to add it to the request.">
                  <Input
                    autoFocus
                    value={questionDraft}
                    onChange={(e) => setQuestionDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addQuestion(); if (e.key === 'Escape') setQuestionDraft(undefined); }}
                    onBlur={addQuestion}
                  />
                </FormField>
              )}
              <div>
                <Button variant="tertiary" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>} onClick={() => setQuestionDraft('')}>
                  Add question
                </Button>
              </div>
            </section>
          </div>

          <section style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
            <div style={{ position: 'relative' }} data-popover-trigger="">
              <FormField label="Select source responsible for sending information">
                <Input
                  readOnly
                  placeholder="Select a responsible or add a new one"
                  value={chosen?.name ?? ''}
                  aria-haspopup="listbox"
                  aria-expanded={pickerOpen}
                  onClick={() => setPickerOpen((o) => !o)}
                  leadingIcon={<Icon size="s" tone="secondary"><icons.Person /></Icon>}
                  trailingIcon={<Icon size="s" tone="secondary">{pickerOpen ? <icons.KeyboardArrowUp /> : <icons.KeyboardArrowDown />}</Icon>}
                />
              </FormField>
              {pickerOpen && (
                <div ref={panelRef} style={{ position: 'absolute', bottom: '100%', left: 0, zIndex: zIndex.overlay }}>
                  <ComboboxPanel
                    autoFocus
                    label="Responsible"
                    searchPlaceholder="Find a person"
                    items={responsibles
                      .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
                      .map((r) => ({ value: r.id, label: r.name }))}
                    value={responsible}
                    query={query}
                    onQueryChange={setQuery}
                    onSelect={(id) => { setResponsible(id); setPickerOpen(false); setQuery(''); }}
                    footer={
                      <Button variant="tertiary" size="s" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}>
                        Add a new responsible
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
            {!chosen && <Text step="s" tone="tertiary">Choose who answers this request before sending.</Text>}
          </section>
        </main>
      </div>
    </ScalarProvider>
  );
}
