/**
 * Story and test data for the Workboard Valuation modal (Figma workboard
 * 532:16434). Not exported from the package.
 */
import type { Assignee } from './Assignees.js';
import type { StepAssignStep } from './StepAssignMenu.js';

const person = (id: string, name: string): Assignee => ({ id, name });

export const PEOPLE: Assignee[] = [
  person('bd', 'Bob Dylan'),
  person('ac', 'Alice Cooper'),
  person('jl', 'John Lennon'),
  person('jh', 'Jimi Hendrix'),
  person('fm', 'Freddie Mercury'),
  person('jj', 'Janis Joplin'),
  person('db', 'David Bowie'),
  person('sw', 'Stevie Wonder'),
  person('ch', 'Cher'),
];

const byId = (...ids: string[]) => ids.map((id) => PEOPLE.find((p) => p.id === id) ?? person(id, id.toUpperCase()));
const jamesH = person('jhem', 'James Hemingway');
const extra = (n: number) => Array.from({ length: n }, (_, i) => person(`x${i}`, `Team member ${i + 1}`));

/** The model's steps with nobody on them (538:29138). */
export const MODEL_STEPS: StepAssignStep[] = [
  { id: 'draft', label: 'Draft', done: true },
  { id: 'review', label: 'Review', done: true },
  { id: 'in-process-usa', label: 'In-Process USA', done: true },
  { id: 'final', label: 'Final' },
  { id: 'review-final', label: 'Review Final' },
  { id: 'complete', label: 'Complete' },
];

/** Some steps staffed, some not (538:29624). */
export const MODEL_STEPS_MIXED: StepAssignStep[] = MODEL_STEPS.map((s) =>
  s.id === 'draft' ? { ...s, assignees: [jamesH] }
    : s.id === 'review' ? { ...s, assignees: [person('jy', 'Jamie Young'), ...extra(4)] }
      : s.id === 'complete' ? { ...s, assignees: [jamesH, person('bm', 'Bruno Mars')] }
        : s);

/** Every step staffed (538:29694). */
export const MODEL_STEPS_STAFFED: StepAssignStep[] = MODEL_STEPS.map((s, i) => ({
  ...s,
  done: i < 2,
  assignees: [
    [jamesH],
    [person('jy', 'Jamie Young'), ...extra(4)],
    [jamesH],
    [person('pb', 'Paul Brown')],
    [person('mr', 'Maria Ruiz'), ...extra(2)],
    [jamesH, person('bm', 'Bruno Mars')],
  ][i],
}));

/** The engagement's own steps, as in the staffed Model panel (536:23253). */
export const ENGAGEMENT_STEPS: StepAssignStep[] = [
  { id: 'onboarding-sent', label: 'Onboarding Sent', done: true, assignees: [jamesH] },
  { id: 'onboarding-finished', label: 'Onboarding Finished', done: true, assignees: [jamesH, ...extra(3)] },
  { id: 'client-docs', label: 'Client Docs Received', done: true, assignees: [jamesH, person('jh2', 'Jimi Hendrix')] },
  { id: 'in-process-usa', label: 'In-Process USA', assignees: [jamesH] },
];

export const STATUS_PEOPLE: Assignee[] = [person('jy', 'Jamie Young'), ...extra(4)];
export const CHOSEN = byId('jl', 'jj');
