import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkA11y } from '../../test/render.js';
import {
  AssigneeAvatars, AssigneeCard, DealCard, FigureList, NoteCard, NoteComposer, StatusTrigger, StepAssignMenu,
  ValuationModal, ValuationPanel, ValuationSummary, initialsOf, type StepAssignStep,
} from './index.js';
import { MODEL_STEPS, MODEL_STEPS_MIXED, PEOPLE, STATUS_PEOPLE } from './valuationFixtures.js';

describe('initialsOf', () => {
  it('takes the first letter of the first two words', () => {
    expect(initialsOf('James Hemingway')).toBe('JH');
    expect(initialsOf('Cher')).toBe('C');
    expect(initialsOf('  mary  ann  lee ')).toBe('MA');
  });
});

describe('AssigneeAvatars', () => {
  it('shows up to two, folds the rest into +N and reads every name', () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(<AssigneeAvatars ref={ref} className="x" data-testid="a" people={STATUS_PEOPLE} />);
    expect(ref.current).toBe(screen.getByTestId('a'));
    expect(ref.current).toHaveClass('scalar-assignees', 'scalar-assignees--brand', 'x');
    expect(container).toHaveTextContent('JY');
    expect(container).toHaveTextContent('+4');
    expect(screen.getByText(/^Assigned: Jamie Young, Team member 1/)).toBeInTheDocument();
  });

  it('shows two people in full', () => {
    const { container } = render(<AssigneeAvatars people={PEOPLE.slice(0, 2)} tone="onBrand" />);
    expect(container).toHaveTextContent('BD');
    expect(container).toHaveTextContent('AC');
    expect(container).not.toHaveTextContent('+');
  });
});

describe('AssigneeCard', () => {
  it('is a named group with a role-named edit button and no axe violations', async () => {
    const ref = createRef<HTMLDivElement>();
    const onEdit = vi.fn();
    const { container } = render(
      <AssigneeCard ref={ref} className="x" data-testid="c" emphasis="lead" roleLabel="Engagement Manager" name="James Hemingway" onEdit={onEdit} />,
    );
    expect(ref.current).toBe(screen.getByTestId('c'));
    expect(ref.current).toHaveClass('scalar-assignee-card', 'scalar-assignee-card--lead', 'x');
    expect(screen.getByRole('group', { name: 'Engagement Manager: James Hemingway' })).toBe(ref.current);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Change engagement manager' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('moves the edit button beside the name and takes extra content', () => {
    render(
      <AssigneeCard emphasis="inverse" roleLabel="Primary Contact" name="Bob Dylan" onEdit={() => undefined} editPlacement="person">
        <button type="button">Notes</button>
      </AssigneeCard>,
    );
    const edit = screen.getByRole('button', { name: 'Change primary contact' });
    expect(edit.closest('.scalar-assignee-card__person')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Notes' })).toBeInTheDocument();
  });

  it('has no edit button without onEdit', () => {
    render(<AssigneeCard roleLabel="Sales Rep" name="Leonel Messi" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('StatusTrigger', () => {
  it('is a popup button named by its value and people, forwarding ref/className', async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const { container } = render(
      <StatusTrigger ref={ref} className="x" value="Client Docs Received" assignees={STATUS_PEOPLE} expanded onClick={onClick} />,
    );
    const btn = screen.getByRole('button', { name: /Status: Client Docs Received/ });
    expect(ref.current).toBe(btn);
    expect(btn).toHaveClass('scalar-status-trigger', 'scalar-status-trigger--s', 'x');
    expect(btn).toHaveAttribute('aria-haspopup', 'true');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(btn).toHaveAccessibleName('Status: Client Docs Received, assigned: Jamie Young, Team member 1, Team member 2, Team member 3, Team member 4');
    btn.focus();
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect((await checkA11y(container)).violations).toEqual([]);
  });
});

function Controlled({ onAssign }: { onAssign: (id: string, ids: string[]) => void }) {
  const [steps, setSteps] = useState<StepAssignStep[]>(MODEL_STEPS);
  return (
    <StepAssignMenu
      label="Model status"
      steps={steps}
      people={PEOPLE}
      onAssign={(id, ids) => {
        onAssign(id, ids);
        setSteps(steps.map((s) => (s.id === id ? { ...s, assignees: PEOPLE.filter((p) => ids.includes(p.id)) } : s)));
      }}
    />
  );
}

describe('StepAssignMenu', () => {
  it('lists the steps with their state in words, forwards ref/className and has no axe violations', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <StepAssignMenu ref={ref} className="x" data-testid="m" label="Model status" steps={MODEL_STEPS_MIXED} people={PEOPLE} />,
    );
    expect(ref.current).toBe(screen.getByTestId('m'));
    expect(ref.current).toHaveClass('scalar-step-assign', 'scalar-step-assign--overlay', 'x');
    expect(screen.getByRole('group', { name: 'Model status' })).toBe(ref.current);
    expect(screen.getByText('Draft').parentElement).toHaveTextContent('Draft, completed');
    expect(screen.getByText('Final').parentElement).toHaveTextContent('Final, not started');
    expect(screen.getByRole('button', { name: 'Assign people to Final' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Change people on Draft (assigned: James Hemingway)' })).toBeInTheDocument();
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('assigns people by keyboard: open, filter, check, remove a chip, Save', async () => {
    const onAssign = vi.fn();
    render(<Controlled onAssign={onAssign} />);
    const assign = screen.getByRole('button', { name: 'Assign people to Draft' });
    assign.focus();
    await userEvent.keyboard('{Enter}');
    expect(assign).toHaveAttribute('aria-expanded', 'true');
    const search = screen.getByRole('textbox', { name: 'Find people to assign to Draft' });
    expect(search).toHaveFocus();
    await userEvent.keyboard('j');
    const list = screen.getByRole('list', { name: 'People for Draft' });
    expect(within(list).getAllByRole('checkbox').map((c) => c.closest('label')?.textContent)).toEqual([
      'John Lennon', 'Jimi Hendrix', 'Janis Joplin',
    ]);
    await userEvent.click(within(list).getByRole('checkbox', { name: 'John Lennon' }));
    await userEvent.click(within(list).getByRole('checkbox', { name: 'Janis Joplin' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove John Lennon' }));
    expect(within(list).getByRole('checkbox', { name: 'John Lennon' })).not.toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onAssign).toHaveBeenCalledWith('draft', ['jj']);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByRole('button', { name: 'Change people on Draft (assigned: Janis Joplin)' })).toBeInTheDocument();
  });

  it('closes the picker on Escape without saving, and says when nobody matches', async () => {
    const onAssign = vi.fn();
    render(<StepAssignMenu label="Model status" steps={MODEL_STEPS} people={PEOPLE} onAssign={onAssign} defaultAssigningStepId="final" pickerDefaults={{ query: 'zz' }} />);
    expect(screen.getByText('No one matches “zz”')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(onAssign).not.toHaveBeenCalled();
  });

  it('makes the step labels buttons only with onSelectStep', async () => {
    const onSelect = vi.fn();
    const { rerender } = render(<StepAssignMenu label="Model status" steps={MODEL_STEPS} people={PEOPLE} />);
    expect(screen.queryByRole('button', { name: /^Final/ })).toBeNull();
    rerender(<StepAssignMenu label="Model status" steps={MODEL_STEPS} people={PEOPLE} onSelectStep={onSelect} surface="inline" />);
    screen.getByRole('button', { name: 'Final, not started' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('final');
  });
});

describe('NoteCard and NoteComposer', () => {
  it('names the note by its author and deletes by keyboard', async () => {
    const ref = createRef<HTMLElement>();
    const onDelete = vi.fn();
    const { container } = render(
      <NoteCard ref={ref} className="x" author="Olivia Barrand" timestamp="Sep 18, 2025 12:11 PM" dateTime="2025-09-18T12:11" onDelete={onDelete}>
        Note test
      </NoteCard>,
    );
    expect(screen.getByRole('article', { name: 'Olivia Barrand' })).toBe(ref.current);
    expect(ref.current).toHaveClass('scalar-note', 'x');
    expect(container.querySelector('time')).toHaveAttribute('datetime', '2025-09-18T12:11');
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('puts the toolbar over a named textarea, with Save', async () => {
    const ref = createRef<HTMLTextAreaElement>();
    const onToggle = vi.fn();
    const onSave = vi.fn();
    const { container } = render(<NoteComposer ref={ref} className="x" onToggleFormat={onToggle} activeFormats={['bold']} onSave={onSave} />);
    const box = screen.getByRole('textbox', { name: 'Add note' });
    expect(ref.current).toBe(box);
    expect(box).toHaveClass('scalar-note-composer__input', 'x');
    expect(box).toHaveAttribute('placeholder', 'Add note...');
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });
    expect(within(toolbar).getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
      'Bold', 'Italic', 'Underline', 'Bulleted list', 'Numbered list',
    ]);
    expect(within(toolbar).getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
    within(toolbar).getByRole('button', { name: 'Bold' }).focus();
    await userEvent.keyboard('{End}{Enter}');
    expect(onToggle).toHaveBeenCalledWith('numbered');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect((await checkA11y(container)).violations).toEqual([]);
  });
});

describe('Valuation layout', () => {
  it('reads figures as a description list', () => {
    const ref = createRef<HTMLDListElement>();
    render(<FigureList ref={ref} className="x" items={[{ label: 'Net Value:', value: '$3,500' }]} />);
    expect(ref.current?.tagName).toBe('DL');
    expect(ref.current).toHaveClass('scalar-figures', 'x');
    expect(screen.getByRole('term')).toHaveTextContent('Net Value:');
    expect(screen.getByRole('definition')).toHaveTextContent('$3,500');
  });

  it('names panels and the summary by their headings', () => {
    render(
      <>
        <ValuationSummary subject="7Learnings" people={<span>people</span>} aside={<span>deal</span>} />
        <ValuationPanel title="Model" action={<button type="button">ARG</button>} footer={<span>tiles</span>}>body</ValuationPanel>
      </>,
    );
    expect(screen.getByRole('region', { name: 'Valuation' })).toHaveClass('scalar-valuation-summary');
    expect(screen.getByRole('region', { name: 'Model' })).toHaveClass('scalar-valuation-panel');
    expect(screen.getByRole('heading', { name: 'Valuation', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Model', level: 3 })).toBeInTheDocument();
  });

  it('opens as a 2xl modal named by aria-label, and closes on Escape', async () => {
    const onClose = vi.fn();
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <ValuationModal ref={ref} open onClose={onClose} aria-label="Valuation: 7Learnings" summary={<ValuationSummary subject="7Learnings" />}>
        <ValuationPanel title="Valued Entity">entity</ValuationPanel>
      </ValuationModal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Valuation: 7Learnings' });
    expect(ref.current).toBe(dialog);
    expect(dialog).toHaveClass('scalar-modal', 'scalar-modal--2xl', 'scalar-valuation-modal');
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('fills the deal card in the deal tone with an action on the contract row', () => {
    render(
      <DealCard
        tone="deal"
        title="Deal"
        contract="Signed_EL"
        contractHref="#c"
        contractAction={<button type="button">Send Final Invoice</button>}
      />,
    );
    const card = screen.getByRole('region', { name: 'Deal' });
    expect(card).toHaveClass('scalar-deal-card--deal');
    expect(screen.getByRole('button', { name: 'Send Final Invoice' }).closest('.scalar-deal-card__contract-row')).not.toBeNull();
  });
});
