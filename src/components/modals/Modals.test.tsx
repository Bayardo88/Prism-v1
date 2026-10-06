import { createRef, useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProvider, checkA11y } from '../../test/render.js';
import { ColumnItem, ColumnTitle, Modal, ModalSearch } from './index.js';

function Harness({ title }: { title: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(0);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open</button>
      <button type="button" onClick={() => setN(n + 1)}>Rerender {n}</button>
      {/* inline onClose on purpose: it changes identity each render */}
      <Modal open={open} onClose={() => setOpen(false)} title={title} footer={<button type="button">Save</button>}>
        <input aria-label="Name" />
      </Modal>
    </div>
  );
}

describe('Modal', () => {
  it('is named by a non-string title, forwards ref/className/testid/aria-describedby', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithProvider(
      <Modal ref={ref} open onClose={() => {}} title={<span>Rich <em>title</em></span>} className="c" data-testid="m" aria-describedby="d">
        <p id="d">Body</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Rich title' });
    expect(ref.current).toBe(dialog);
    expect(dialog).toBe(screen.getByTestId('m'));
    expect(dialog).toHaveClass('scalar-modal', 'c');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('supports role=alertdialog and an explicit aria-label', () => {
    renderWithProvider(<Modal open onClose={() => {}} role="alertdialog" aria-label="Sure?">x</Modal>);
    expect(screen.getByRole('alertdialog', { name: 'Sure?' })).toBeInTheDocument();
  });

  it('moves focus in, traps Tab, closes on Escape and returns focus', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Harness title="Edit" />);
    const opener = screen.getByRole('button', { name: 'Open' });
    await user.click(opener);
    const close = screen.getByRole('button', { name: 'Close' });
    expect(close).toHaveFocus();
    await user.tab(); // input
    await user.tab(); // save
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    await user.tab(); // wraps to close
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opener).toHaveFocus();
  });

  it('does not steal focus when the parent re-renders with a new onClose', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Harness title="Edit" />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const input = screen.getByRole('textbox', { name: 'Name' });
    await user.click(input);
    expect(input).toHaveFocus();
    // Re-render the parent without leaving the dialog (programmatic: the rest of the page is inert to the pointer)
    screen.getByRole('button', { name: /Rerender/ }).click();
    expect(await screen.findByRole('button', { name: 'Rerender 1' })).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('scrim click dismisses unless disabled', async () => {
    const onClose = vi.fn();
    const { container, rerender } = renderWithProvider(<Modal open onClose={onClose} title="T">x</Modal>);
    await userEvent.click(container.ownerDocument.querySelector('.scalar-scrim')!);
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(<Modal open onClose={onClose} title="T" dismissOnScrimClick={false}>x</Modal>);
    await userEvent.click(container.ownerDocument.querySelector('.scalar-scrim')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('ColumnPicker parts', () => {
  it('ColumnItem is a toggle button with aria-pressed, ref, className, testid, rest', async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const { container } = renderWithProvider(
      <div>
        <ColumnTitle title="Columns" count="2 items" className="t" data-testid="ct" />
        <ColumnItem ref={ref} label="Revenue" subText="Currency" selected onClick={onClick} className="c" data-testid="ci" />
        <ColumnItem label="EBITDA" />
      </div>,
    );
    const item = screen.getByTestId('ci');
    expect(ref.current).toBe(item);
    expect(item).toHaveClass('scalar-column-item', 'c');
    expect(item).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'EBITDA' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('ct')).toHaveClass('t');
    expect(screen.queryByRole('option')).toBeNull();
    item.focus();
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('ModalSearch is named "Search" by default, role=search wrapper, ref on the input', async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = renderWithProvider(<ModalSearch ref={ref} className="w" data-testid="in" />);
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBe(ref.current);
    expect(screen.getByRole('search')).toHaveClass('w');
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('ModalSearch keeps a consumer aria-label', () => {
    renderWithProvider(<ModalSearch aria-label="Search columns" />);
    expect(screen.getByRole('searchbox', { name: 'Search columns' })).toBeInTheDocument();
  });
});
