import { createRef, useRef, useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { checkA11y, renderWithProvider } from '../../test/render.js';
import { Accordion, AccordionItem, DataReviewCard, Drawer, WorkspaceDrawer, WorkspaceDrawerTab } from './index.js';

describe('Accordion', () => {
  it('has no axe violations, forwards ref, className and data-testid', async () => {
    const ref = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLDivElement>();
    const { container } = renderWithProvider(
      <Accordion ref={ref} className="x" data-testid="acc">
        <AccordionItem ref={itemRef} title="One" defaultOpen data-testid="item">Body</AccordionItem>
        <AccordionItem title="Two">Body 2</AccordionItem>
      </Accordion>,
    );
    expect((await checkA11y(container)).violations).toEqual([]);
    expect(ref.current).toBe(screen.getByTestId('acc'));
    expect(itemRef.current).toBe(screen.getByTestId('item'));
    expect(screen.getByTestId('acc')).toHaveClass('scalar-accordion', 'x');
  });

  it('wraps the header button in a heading and wires aria-expanded / aria-controls', async () => {
    const user = userEvent.setup();
    renderWithProvider(<AccordionItem title="One" headingLevel={2}>Body</AccordionItem>);
    const btn = screen.getByRole('button', { name: 'One' });
    expect(screen.getByRole('heading', { level: 2 })).toContainElement(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(btn).not.toHaveAttribute('aria-controls');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById(btn.getAttribute('aria-controls')!);
    expect(panel).toHaveAttribute('role', 'region');
    await user.keyboard('{Enter}');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard(' ');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves between headers with arrows, Home and End', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <Accordion>
        <AccordionItem title="A">a</AccordionItem>
        <AccordionItem title="B">b</AccordionItem>
        <AccordionItem title="C">c</AccordionItem>
      </Accordion>,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'A' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'B' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'C' })).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('button', { name: 'B' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'A' })).toHaveFocus();
  });

  it('single type keeps one section open', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <Accordion type="single" defaultValue={['a']}>
        <AccordionItem value="a" title="A">a</AccordionItem>
        <AccordionItem value="b" title="B">b</AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByRole('button', { name: 'B' }));
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('DataReviewCard', () => {
  it('has no axe violations, forwards ref, className, data-testid', async () => {
    const ref = createRef<HTMLElement>();
    const { container } = renderWithProvider(
      <DataReviewCard ref={ref} className="x" data-testid="card" title="Value" sourceFile="a.pdf" quote="q" onSelect={() => {}} onAccept={() => {}} onReject={() => {}} />,
    );
    expect((await checkA11y(container)).violations).toEqual([]);
    expect(ref.current).toBe(screen.getByTestId('card'));
    expect(ref.current).toHaveClass('scalar-data-review-card', 'x');
    expect(ref.current).not.toHaveAttribute('aria-selected');
  });

  it('selects with the keyboard via a pressed-state button', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onAccept = vi.fn();
    renderWithProvider(<DataReviewCard title="Value" selected onSelect={onSelect} onAccept={onAccept} />);
    const select = screen.getByRole('button', { name: 'Value' });
    expect(select).toHaveAttribute('aria-pressed', 'true');
    await user.tab();
    expect(select).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalledTimes(2);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(2);
  });
});

function DrawerHarness({ modal }: { modal?: boolean }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={trigger} onClick={() => setOpen(true)}>Open</button>
      <button>Outside</button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Edit" modal={modal} triggerRef={trigger} footer={<button>Save</button>} data-testid="drawer" className="x">
        <input aria-label="Name" />
      </Drawer>
    </>
  );
}

describe('Drawer', () => {
  it('has no axe violations, forwards ref and passes className / data-testid', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithProvider(<Drawer ref={ref} open onClose={() => {}} title="Edit" className="x" data-testid="d">Body</Drawer>);
    expect((await checkA11y(container)).violations).toEqual([]);
    expect(ref.current).toBe(screen.getByTestId('d'));
    expect(ref.current).toHaveClass('scalar-drawer', 'x');
    expect(screen.getByRole('dialog', { name: 'Edit' })).toHaveAttribute('aria-modal', 'true');
  });

  it('modal: focuses in, traps Tab, closes on Escape and returns focus', async () => {
    const user = userEvent.setup();
    renderWithProvider(<DrawerHarness />);
    const opener = screen.getByRole('button', { name: 'Open' });
    await user.click(opener);
    const dialog = screen.getByRole('dialog', { name: 'Edit' });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    for (let i = 0; i < 5; i += 1) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opener).toHaveFocus();
  });

  it('non-modal: no scrim, aria-modal false, outside click closes', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProvider(<DrawerHarness modal={false} />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'false');
    expect(container.querySelector('.scalar-scrim')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('WorkspaceDrawer', () => {
  function Tabs() {
    const [active, setActive] = useState('notes');
    return (
      <WorkspaceDrawer
        data-testid="wd"
        className="x"
        tabs={['notes', 'sheets', 'docs'].map((k) => (
          <WorkspaceDrawerTab key={k} label={k} active={k === active} onClick={() => setActive(k)} />
        ))}
      >
        Panel {active}
      </WorkspaceDrawer>
    );
  }

  it('has no axe violations, forwards ref, className, data-testid', async () => {
    const ref = createRef<HTMLElement>();
    const { container } = renderWithProvider(
      <WorkspaceDrawer ref={ref} className="x" data-testid="wd" tabs={<WorkspaceDrawerTab label="Notes" active />}>Body</WorkspaceDrawer>,
    );
    expect((await checkA11y(container)).violations).toEqual([]);
    expect(ref.current).toBe(screen.getByTestId('wd'));
    expect(ref.current).toHaveClass('scalar-workspace-drawer', 'x');
  });

  it('tab ref forwards, and tabpanel is labelled by the active tab', () => {
    const ref = createRef<HTMLButtonElement>();
    renderWithProvider(
      <WorkspaceDrawer tabs={<><WorkspaceDrawerTab ref={ref} label="Notes" active /><WorkspaceDrawerTab label="Sheets" /></>}>Body</WorkspaceDrawer>,
    );
    const tab = screen.getByRole('tab', { name: 'Notes' });
    expect(ref.current).toBe(tab);
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Sheets' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Notes');
    expect(tab).toHaveAttribute('aria-controls', screen.getByRole('tabpanel').id);
  });

  it('uses roving tabindex with arrows, Home and End', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Tabs />);
    const [notes, sheets, docs] = screen.getAllByRole('tab');
    expect(notes).toHaveAttribute('tabindex', '0');
    expect(sheets).toHaveAttribute('tabindex', '-1');
    await user.tab();
    expect(notes).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(sheets).toHaveFocus();
    await user.keyboard('{End}');
    expect(docs).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(notes).toHaveFocus();
    await user.keyboard('{Home}');
    expect(notes).toHaveFocus();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel sheets');
  });

  it('docked has no tabpanel and keeps one tab stop when none is active', () => {
    renderWithProvider(<WorkspaceDrawer docked tabs={<><WorkspaceDrawerTab label="A" /><WorkspaceDrawerTab label="B" /></>} />);
    expect(screen.queryByRole('tabpanel')).toBeNull();
    expect(screen.getAllByRole('tab').filter((t) => t.tabIndex === 0)).toHaveLength(1);
  });
});

describe('Accordion toggling modes', () => {
  it('single type collapses the open section when it is clicked again', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithProvider(
      <Accordion type="single" defaultValue={['a']} onValueChange={onValueChange}>
        <AccordionItem value="a" title="A">a</AccordionItem>
        <AccordionItem value="b" title="B">b</AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByRole('button', { name: 'A' }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-expanded', 'false');
  });
  it('multiple type opens and closes sections independently, reporting the list', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithProvider(
      <Accordion onValueChange={onValueChange}>
        <AccordionItem value="a" title="A">a</AccordionItem>
        <AccordionItem value="b" title="B">b</AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByRole('button', { name: 'A' }));
    await user.click(screen.getByRole('button', { name: 'B' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b']);
    await user.click(screen.getByRole('button', { name: 'A' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['b']);
  });
  it('controlled value drives expansion and does not change without the parent', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithProvider(
      <Accordion value={['b']} onValueChange={onValueChange}>
        <AccordionItem value="a" title="A">a</AccordionItem>
        <AccordionItem value="b" title="B">b</AccordionItem>
      </Accordion>,
    );
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'A' }));
    expect(onValueChange).toHaveBeenCalledWith(['b', 'a']);
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-expanded', 'false');
  });
});
