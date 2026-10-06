import { createRef, useRef, useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProvider, checkA11y } from '../../test/render.js';
import { ConfirmationDialog, NotificationCenter, RowActionToolbar, SettingRow } from './index.js';

describe('ConfirmationDialog', () => {
  const base = { title: 'Delete this group?', confirmLabel: 'Delete group', onConfirm: () => {}, onCancel: () => {} };

  it('destructive: alertdialog named by title, described by message, opens on Cancel', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithProvider(
      <ConfirmationDialog {...base} ref={ref} open destructive className="c" data-testid="cd">This cannot be undone.</ConfirmationDialog>,
    );
    const dlg = screen.getByRole('alertdialog', { name: 'Delete this group?' });
    expect(ref.current).toBe(dlg);
    expect(dlg).toBe(screen.getByTestId('cd'));
    expect(dlg).toHaveClass('c', 'scalar-confirm--destructive');
    expect(dlg).toHaveAccessibleDescription('This cannot be undone.');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('non-destructive is a plain dialog; Escape cancels', async () => {
    const onCancel = vi.fn();
    renderWithProvider(<ConfirmationDialog {...base} open onCancel={onCancel}>Sure?</ConfirmationDialog>);
    expect(screen.getByRole('dialog', { name: 'Delete this group?' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('ignores Escape while busy', async () => {
    const onCancel = vi.fn();
    renderWithProvider(<ConfirmationDialog {...base} open busy onCancel={onCancel}>Working</ConfirmationDialog>);
    await userEvent.keyboard('{Escape}');
    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe('SettingRow', () => {
  it('works controlled and uncontrolled, ref on the switch', async () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    const { container } = renderWithProvider(<SettingRow ref={ref} label="Desktop" defaultChecked={false} onChange={onChange} />);
    const sw = screen.getByRole('switch', { name: 'Desktop' });
    expect(ref.current).toBe(sw);
    await userEvent.click(sw);
    expect(sw).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true);
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('stays put when controlled', async () => {
    renderWithProvider(<SettingRow label="X" checked={false} onChange={() => {}} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).not.toBeChecked();
  });
});

describe('NotificationCenter', () => {
  it('static: named by its heading, takes no focus, empty state, ref/className/testid', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithProvider(<NotificationCenter ref={ref} scope="Firm" className="c" data-testid="nc" />);
    const dlg = screen.getByRole('dialog', { name: 'Notifications' });
    expect(ref.current).toBe(dlg);
    expect(dlg).toBe(screen.getByTestId('nc'));
    expect(dlg).toHaveClass('c');
    expect(dlg).not.toContainElement(document.activeElement as HTMLElement);
    expect(screen.getByRole('heading', { level: 2, name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByText('You’re all caught up.')).toBeInTheDocument();
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('treats false/empty fragment children as empty and shows items in a live region', () => {
    const { rerender } = renderWithProvider(<NotificationCenter>{false}</NotificationCenter>);
    expect(screen.getByText('No notifications')).toBeInTheDocument();
    rerender(<NotificationCenter><p>Item</p></NotificationCenter>);
    expect(screen.getByText('Item').parentElement).toHaveAttribute('aria-live', 'polite');
  });

  it('toggles view uncontrolled and via the gear', async () => {
    const onViewChange = vi.fn();
    renderWithProvider(<NotificationCenter onViewChange={onViewChange} settings={<p>Prefs</p>} />);
    await userEvent.click(screen.getByRole('button', { name: 'Notification settings' }));
    expect(screen.getByText('Prefs')).toBeInTheDocument();
    expect(onViewChange).toHaveBeenCalledWith('settings');
  });

  it('live popover: focus in, Escape and outside click close, focus returns', async () => {
    const user = userEvent.setup();
    function Host() {
      const [open, setOpen] = useState(false);
      const bell = useRef<HTMLButtonElement>(null);
      return (
        <div>
          <button ref={bell} type="button" onClick={() => setOpen((o) => !o)}>Bell</button>
          <p>Outside</p>
          {open && <NotificationCenter triggerRef={bell} onClose={() => setOpen(false)} />}
        </div>
      );
    }
    renderWithProvider(<Host />);
    const bell = screen.getByRole('button', { name: 'Bell' });
    await user.click(bell);
    expect(screen.getByRole('button', { name: 'Notification settings' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(bell).toHaveFocus();
    await user.click(bell);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByText('Outside'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('RowActionToolbar', () => {
  const actions = [
    { label: 'Edit', icon: <span aria-hidden>e</span>, onClick: () => {} },
    { label: 'Copy', icon: <span aria-hidden>c</span>, onClick: () => {} },
    { label: 'Delete', icon: <span aria-hidden>d</span>, onClick: () => {}, destructive: true },
  ];

  it('is a labelled toolbar with one tab stop and arrow/Home/End roving', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    const onClose = vi.fn();
    const { container } = renderWithProvider(
      <div>
        <RowActionToolbar ref={ref} label="Row actions for Jane" actions={actions} onClose={onClose} className="c" data-testid="tb" />
        <button type="button">After</button>
      </div>,
    );
    const tb = screen.getByRole('toolbar', { name: 'Row actions for Jane' });
    expect(ref.current).toBe(tb);
    expect(tb).toBe(screen.getByTestId('tb'));
    expect(tb).toHaveClass('c');
    expect((await checkA11y(container)).violations).toEqual([]);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Copy' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Close actions' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Close actions' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus();
    // Tab leaves the toolbar in one press.
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    // Escape closes.
    await user.tab({ shift: true });
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
