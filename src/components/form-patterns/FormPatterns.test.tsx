import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkA11y, renderWithProvider } from '../../test/render.js';
import {
  ComboboxOption, ComboboxPanel, CopyField, Dropzone, FloatingLabelInput, FloatingLabelSelect, ImageCropField, InlineEdit,
  InlinePicker, NumberField, RepeatableRow, SelectMenu, SelectMenuOption, ShowMoreRow, Slider, TagInput, TimeField,
} from './index.js';

async function expectNoViolations(container: Element) {
  const r = await checkA11y(container);
  expect(r.violations.map((v) => `${v.id}: ${v.nodes[0]?.html}`)).toEqual([]);
}

const items = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta', disabled: true },
  { value: 'c', label: 'Gamma' },
];

describe('FloatingLabelInput / FloatingLabelSelect', () => {
  it('has no violations, forwards ref, className and data-testid', async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = renderWithProvider(<FloatingLabelInput ref={ref} label="Name" className="x" data-testid="t" />);
    await expectNoViolations(container);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByTestId('t')).toBe(ref.current);
    expect(container.firstElementChild).toHaveClass('x');
    expect(screen.getByLabelText('Name')).toBe(ref.current);
  });

  it('merges describedby, announces the error and marks required', () => {
    renderWithProvider(<FloatingLabelInput label="Email" state="error" helperText="Enter a valid email" aria-describedby="extra" required />);
    const input = screen.getByLabelText(/Email/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toContain('extra');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
    expect(input.getAttribute('aria-describedby')).toContain(screen.getByRole('alert').id);
  });

  it('select: labels, describes, forwards ref', async () => {
    const ref = createRef<HTMLSelectElement>();
    const { container } = renderWithProvider(
      <FloatingLabelSelect ref={ref} label="Role" helperText="Pick one" className="y" data-testid="s"><option value="">-</option><option>A</option></FloatingLabelSelect>,
    );
    await expectNoViolations(container);
    expect(screen.getByLabelText('Role')).toBe(ref.current);
    expect(ref.current).toHaveAccessibleDescription('Pick one');
    expect(container.firstElementChild).toHaveClass('y');
    expect(screen.getByTestId('s')).toBe(ref.current);
  });
});

describe('NumberField / TimeField', () => {
  it('works uncontrolled through the stepper and keyboard', async () => {
    const onChange = vi.fn();
    const ref = createRef<HTMLInputElement>();
    const { container } = renderWithProvider(
      <NumberField ref={ref} label="Window" defaultValue={5} min={0} max={6} unitLabel="days" onChange={onChange} className="c" data-testid="n" />,
    );
    await expectNoViolations(container);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Increase days' }));
    expect(ref.current).toHaveValue(6);
    await user.click(screen.getByRole('button', { name: 'Increase days' }));
    expect(ref.current).toHaveValue(6);
    await user.click(screen.getByRole('button', { name: 'Decrease days' }));
    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(screen.getByTestId('n')).toBe(ref.current);
    expect(container.firstElementChild).toHaveClass('c');
  });

  it('is controlled and describes its suffix', () => {
    const { rerender } = renderWithProvider(<NumberField value={10} suffix="%" aria-label="Threshold" onChange={() => {}} />);
    const input = screen.getByLabelText('Threshold');
    expect(input).toHaveValue(10);
    expect(input).toHaveAccessibleDescription('%');
    rerender(<NumberField value={12} suffix="%" aria-label="Threshold" onChange={() => {}} />);
    expect(screen.getByLabelText('Threshold')).toHaveValue(12);
  });

  it('time field: label, ref, className, disabled cannot be overridden', async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = renderWithProvider(<TimeField ref={ref} label="Send time" className="t" data-testid="tf" state="disabled" />);
    await expectNoViolations(container);
    expect(screen.getByLabelText('Send time')).toBe(ref.current);
    expect(ref.current).toBeDisabled();
    expect(container.firstElementChild).toHaveClass('t');
    expect(screen.getByTestId('tf')).toBe(ref.current);
  });
});

describe('TagInput', () => {
  it('adds on Enter, removes with Backspace, uncontrolled', async () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    const { container } = renderWithProvider(
      <TagInput ref={ref} label="Domains" defaultValues={['a.com']} onChange={onChange} className="tg" data-testid="g" helperText="Press Enter to add" />,
    );
    await expectNoViolations(container);
    const user = userEvent.setup();
    expect(screen.getByTestId('g')).toHaveClass('tg');
    expect(screen.getByRole('group', { name: 'Domains' })).toBeInTheDocument();
    expect(ref.current).toHaveAccessibleDescription('Press Enter to add');
    await user.type(ref.current!, 'b.com{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['a.com', 'b.com']);
    await user.keyboard('{Backspace}');
    expect(onChange).toHaveBeenLastCalledWith(['a.com']);
    expect(screen.getByRole('status')).toHaveTextContent('b.com removed');
  });

  it('shows the validation error as visible, described alert text', async () => {
    const ref = createRef<HTMLInputElement>();
    renderWithProvider(<TagInput ref={ref} label="Domains" values={[]} onChange={() => {}} validate={(v) => (v.includes('.') ? undefined : 'Enter a domain like acme.com')} />);
    const user = userEvent.setup();
    await user.type(ref.current!, 'nope{Enter}');
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Enter a domain like acme.com');
    expect(ref.current).toHaveAttribute('aria-invalid', 'true');
    expect(ref.current).toHaveAccessibleDescription('Enter a domain like acme.com');
  });

  it('reports duplicates and splits pasted lists', async () => {
    const onChange = vi.fn();
    const ref = createRef<HTMLInputElement>();
    renderWithProvider(<TagInput ref={ref} label="Domains" values={['a.com']} onChange={onChange} />);
    const user = userEvent.setup();
    await user.type(ref.current!, 'a.com{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('a.com is already added');
    await user.clear(ref.current!);
    await user.click(ref.current!);
    await user.paste('b.com, c.com');
    expect(onChange).toHaveBeenLastCalledWith(['a.com', 'b.com', 'c.com']);
  });

  it('disabled propagates to the chips', () => {
    renderWithProvider(<TagInput label="Domains" values={['a.com']} onChange={() => {}} disabled />);
    expect(screen.queryByRole('button', { name: 'Remove a.com' })).toBeNull();
    expect(screen.getByRole('textbox', { name: 'Domains' })).toBeDisabled();
  });

  it('returns focus to the entry after removing a chip', async () => {
    renderWithProvider(<TagInput label="Domains" defaultValues={['a.com']} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Remove a.com' }));
    expect(screen.getByRole('textbox', { name: 'Domains' })).toHaveFocus();
  });
});

describe('CopyField', () => {
  it('names the value, keeps the button mounted and announces the copy', async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = renderWithProvider(<CopyField ref={ref} label="SCIM endpoint" value="https://x.test/scim" className="cf" data-testid="c" />);
    await expectNoViolations(container);
    const user = userEvent.setup();
    expect(screen.getByRole('textbox', { name: 'SCIM endpoint' })).toBe(ref.current);
    expect(ref.current).toHaveAttribute('readonly');
    expect(screen.getByTestId('c')).toHaveClass('cf');
    const button = screen.getByRole('button', { name: 'Copy SCIM endpoint' });
    await user.click(button);
    expect(await screen.findByRole('status')).toHaveTextContent('Copied');
    expect(screen.getByRole('button', { name: 'Copy SCIM endpoint' })).toBe(button);
    expect(button).toHaveFocus();
    expect(await navigator.clipboard.readText()).toBe('https://x.test/scim');
  });

  it('reveals a secret with a stable label and clears its timer on unmount', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithProvider(<CopyField label="Token" value="abcdefghijklmnopqrstuvwxyz" secret />);
    const box = screen.getByRole('textbox', { name: 'Token' });
    expect((box as HTMLInputElement).value).toContain('•');
    const toggle = screen.getByRole('button', { name: 'Reveal Token' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect((box as HTMLInputElement).value).toBe('abcdefghijklmnopqrstuvwxyz');
    await user.click(screen.getByRole('button', { name: 'Copy Token' }));
    unmount();
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
  });
});

/* eslint-disable jsx-a11y/no-autofocus -- `autoFocus` here is ComboboxPanel's opt-in prop, which is what these tests exercise. */
describe('ComboboxPanel / ComboboxOption', () => {
  function Harness(props: { onEscape?: () => void; autoFocus?: boolean }) {
    const [q, setQ] = useState('');
    const [picked, setPicked] = useState<string[]>([]);
    return (
      <>
        <ComboboxPanel
          label="Companies" items={items} value={picked} onSelect={(v) => setPicked((p) => [...p, v])}
          query={q} onQueryChange={setQ} onEscape={props.onEscape} autoFocus={props.autoFocus} className="cp" data-testid="panel"
        />
        <output data-testid="picked">{picked.join(',')}</output>
      </>
    );
  }

  it('has no violations and a named combobox with the listbox pattern', async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = renderWithProvider(
      <ComboboxPanel ref={ref} label="Companies" items={items} onSelect={() => {}} query="" onQueryChange={() => {}} className="cp" data-testid="panel" />,
    );
    await expectNoViolations(container);
    const box = screen.getByRole('combobox', { name: 'Companies' });
    expect(box).toBe(ref.current);
    expect(box).toHaveAttribute('aria-autocomplete', 'list');
    expect(box).toHaveAttribute('aria-haspopup', 'listbox');
    expect(screen.getByTestId('panel')).toHaveClass('cp');
    expect(document.activeElement).not.toBe(box);
  });

  it('focuses only when asked', () => {
    renderWithProvider(<Harness autoFocus />);
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('moves with arrows skipping disabled, selects with Enter, Esc clears then calls onEscape', async () => {
    const onEscape = vi.fn();
    renderWithProvider(<Harness onEscape={onEscape} autoFocus />);
    const user = userEvent.setup();
    const box = screen.getByRole('combobox');
    expect(box.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: /Alpha/ }).id);
    await user.keyboard('{ArrowDown}');
    expect(box.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: /Gamma/ }).id);
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('picked')).toHaveTextContent('c');
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    await user.keyboard('zz');
    await user.keyboard('{Escape}');
    expect(box).toHaveValue('');
    expect(onEscape).toHaveBeenCalled();
  });

  it('announces an empty result', () => {
    renderWithProvider(<ComboboxPanel label="Companies" items={[]} onSelect={() => {}} query="q" onQueryChange={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('No matches');
  });

  it('clamps the highlight when items shrink', () => {
    const { rerender } = renderWithProvider(<ComboboxPanel label="C" items={items} onSelect={() => {}} query="" onQueryChange={() => {}} />);
    rerender(<ComboboxPanel label="C" items={items.slice(0, 1)} onSelect={() => {}} query="" onQueryChange={() => {}} />);
    expect(screen.getByRole('combobox').getAttribute('aria-activedescendant')).toBe(screen.getByRole('option').id);
  });

  it('option forwards ref/className/testid and keeps focus on mousedown', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithProvider(
      <div role="listbox" aria-label="l">
        <ComboboxOption ref={ref} className="o" data-testid="opt" selection="multi" selected>One</ComboboxOption>
      </div>,
    );
    expect(screen.getByTestId('opt')).toBe(ref.current);
    expect(ref.current).toHaveClass('o');
    expect(fireEvent.mouseDown(ref.current!)).toBe(false);
  });

  it('ShowMoreRow is a forwarded native button', async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const { container } = renderWithProvider(<ShowMoreRow ref={ref} onClick={onClick} className="sm" data-testid="sm">Show 4 more</ShowMoreRow>);
    await expectNoViolations(container);
    await userEvent.setup().click(screen.getByRole('button', { name: /Show 4 more/ }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByTestId('sm')).toBe(ref.current);
    expect(ref.current).toHaveClass('sm');
  });
});

/* eslint-enable jsx-a11y/no-autofocus */
describe('SelectMenu / SelectMenuOption', () => {
  it('has no violations, forwards ref to the listbox', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithProvider(
      <SelectMenu ref={ref} label="Currency" className="sm" data-testid="lb">
        <SelectMenuOption className="op" data-testid="o1">USD</SelectMenuOption>
      </SelectMenu>,
    );
    await expectNoViolations(container);
    expect(screen.getByRole('listbox', { name: 'Currency' })).toBe(ref.current);
    expect(screen.getByTestId('lb')).toBe(ref.current);
    expect(container.firstElementChild).toHaveClass('sm');
    expect(screen.getByTestId('o1')).toHaveClass('op');
  });

  it('navigates with arrows, Home/End, type-ahead, selects with Enter/Space and Esc', async () => {
    const onEscape = vi.fn();
    const pick = vi.fn();
    renderWithProvider(
      <SelectMenu label="Currency" onEscape={onEscape}>
        <SelectMenuOption selected onSelect={() => pick('usd')}>USD</SelectMenuOption>
        <SelectMenuOption disabled onSelect={() => pick('eur')}>EUR</SelectMenuOption>
        <SelectMenuOption onSelect={() => pick('gbp')}>GBP</SelectMenuOption>
        <SelectMenuOption onSelect={() => pick('jpy')}>JPY</SelectMenuOption>
      </SelectMenu>,
    );
    const user = userEvent.setup();
    await user.tab();
    const lb = screen.getByRole('listbox');
    expect(lb).toHaveFocus();
    const id = (n: string) => screen.getByRole('option', { name: n }).id;
    expect(lb).toHaveAttribute('aria-activedescendant', id('USD'));
    await user.keyboard('{ArrowDown}');
    expect(lb).toHaveAttribute('aria-activedescendant', id('GBP'));
    await user.keyboard('{End}');
    expect(lb).toHaveAttribute('aria-activedescendant', id('JPY'));
    await user.keyboard('{Home}');
    expect(lb).toHaveAttribute('aria-activedescendant', id('USD'));
    await user.keyboard('j');
    expect(lb).toHaveAttribute('aria-activedescendant', id('JPY'));
    await user.keyboard('{Enter}');
    expect(pick).toHaveBeenLastCalledWith('jpy');
    await user.keyboard('{ArrowUp}{ }');
    expect(pick).toHaveBeenLastCalledWith('gbp');
    await user.keyboard('{Escape}');
    expect(onEscape).toHaveBeenCalled();
  });

  it('respects a consumer-driven aria-activedescendant', async () => {
    renderWithProvider(
      <SelectMenu label="L" aria-activedescendant="x">
        <SelectMenuOption id="x" active>One</SelectMenuOption>
        <SelectMenuOption>Two</SelectMenuOption>
      </SelectMenu>,
    );
    await userEvent.setup().tab();
    await userEvent.setup().keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-activedescendant', 'x');
  });
});

describe('RepeatableRow', () => {
  it('names each remove button, forwards ref, calls onRemove', async () => {
    const ref = createRef<HTMLDivElement>();
    const onRemove = vi.fn();
    const { container } = renderWithProvider(
      <RepeatableRow ref={ref} index={1} onRemove={onRemove} className="rr" data-testid="row"><input aria-label="Email" /></RepeatableRow>,
    );
    await expectNoViolations(container);
    expect(screen.getByTestId('row')).toBe(ref.current);
    expect(ref.current).toHaveClass('rr');
    expect(screen.getByRole('group', { name: 'Row 2' })).toBe(ref.current);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Remove row 2' }));
    expect(onRemove).toHaveBeenCalled();
  });
});

describe('Dropzone', () => {
  it.each([
    ['default', 'select a file'],
    ['uploading', 'Choose another file'],
    ['error', 'Try again'],
  ] as const)('always offers a browse button (%s)', async (state, name) => {
    const ref = createRef<HTMLDivElement>();
    const onFiles = vi.fn();
    const { container } = renderWithProvider(
      <Dropzone ref={ref} state={state} progress={40} message="Message" hint="CSV · 15 MB max" onFiles={onFiles} className="dz" data-testid="dz" />,
    );
    await expectNoViolations(container);
    expect(screen.getByTestId('dz')).toBe(ref.current);
    expect(ref.current).toHaveClass('dz');
    const btn = screen.getByRole('button', { name });
    expect(btn).toHaveAccessibleDescription('CSV · 15 MB max');
    if (state === 'uploading') expect(screen.getByRole('progressbar', { name: 'Upload progress' })).toHaveAttribute('aria-valuenow', '40');
    const file = new File(['x'], 'a.csv', { type: 'text/csv' });
    const input = container.querySelector('input[type=file]') as HTMLInputElement;
    await userEvent.setup().upload(input, file);
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it('does not flicker over child boundaries and honours disabled', () => {
    const onFiles = vi.fn();
    const { rerender } = renderWithProvider(<Dropzone hint="h" onFiles={onFiles} data-testid="dz" />);
    const zone = screen.getByTestId('dz');
    fireEvent.dragEnter(zone);
    fireEvent.dragEnter(zone);
    fireEvent.dragLeave(zone);
    expect(zone).toHaveClass('scalar-dropzone--over');
    fireEvent.dragLeave(zone);
    expect(zone).not.toHaveClass('scalar-dropzone--over');
    rerender(<Dropzone hint="h" onFiles={onFiles} data-testid="dz" disabled />);
    fireEvent.drop(screen.getByTestId('dz'), { dataTransfer: { files: [new File(['x'], 'a.csv')] } });
    expect(onFiles).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'select a file' })).toBeDisabled();
  });
});

describe('Slider', () => {
  it('is a labelled range input with native keyboard support, uncontrolled', async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = renderWithProvider(
      <Slider ref={ref} label="Zoom" min={0} max={10} step={1} defaultValue={5} aria-valuetext="5 times" className="sl" data-testid="sl" readout="5×" />,
    );
    await expectNoViolations(container);
    expect(screen.getByRole('slider', { name: 'Zoom' })).toBe(ref.current);
    expect(screen.getByTestId('sl')).toBe(ref.current);
    expect(container.firstElementChild).toHaveClass('sl');
    expect(ref.current).toHaveAttribute('aria-valuetext', '5 times');
    // jsdom has no native range key handling; assert the contract that the browser relies on.
    expect(ref.current).toHaveAttribute('type', 'range');
    fireEvent.change(ref.current!, { target: { value: '7' } });
    expect(ref.current).toHaveValue('7');
  });
});

describe('InlineEdit', () => {
  it('Enter commits and returns focus to the trigger', async () => {
    const onCommit = vi.fn();
    const ref = createRef<HTMLElement>();
    const { container } = renderWithProvider(<InlineEdit ref={ref} label="Name" placeholder="Enter name" defaultValue="Old" onCommit={onCommit} className="ie" data-testid="ie" />);
    await expectNoViolations(container);
    const user = userEvent.setup();
    expect(screen.getByTestId('ie')).toBe(ref.current);
    await user.click(screen.getByRole('button', { name: 'Name: Old. Edit' }));
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveFocus();
    await user.clear(input);
    await user.type(input, 'New{Enter}');
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith('New');
    const button = await screen.findByRole('button', { name: 'Name: New. Edit' });
    await waitFor(() => expect(button).toHaveFocus());
  });

  it('Escape cancels without committing and returns focus', async () => {
    const onCommit = vi.fn();
    renderWithProvider(<InlineEdit label="Name" placeholder="Enter name" value="Old" onCommit={onCommit} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Name: Old. Edit' }));
    await user.type(screen.getByRole('textbox'), 'zzz{Escape}');
    expect(onCommit).not.toHaveBeenCalled();
    const button = screen.getByRole('button', { name: 'Name: Old. Edit' });
    await waitFor(() => expect(button).toHaveFocus());
  });

  it('blur commits; disabled and readOnly do not enter edit mode', async () => {
    const onCommit = vi.fn();
    renderWithProvider(
      <>
        <InlineEdit label="A" placeholder="p" value="x" onCommit={onCommit} />
        <InlineEdit label="B" placeholder="p" value="y" onCommit={onCommit} readOnly />
        <InlineEdit label="C" placeholder="p" value="z" onCommit={onCommit} disabled />
      </>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'B: y. Edit' }));
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByRole('button', { name: 'C: z. Edit' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'A: x. Edit' }));
    await user.type(screen.getByRole('textbox'), '1');
    await user.tab();
    expect(onCommit).toHaveBeenCalledWith('x1');
  });
});

describe('InlinePicker', () => {
  it('name contains the visible value, links aria-controls, forwards ref', async () => {
    const ref = createRef<HTMLButtonElement>();
    const { container } = renderWithProvider(
      <InlinePicker ref={ref} label="Previous versions" secondary="V-2" aria-controls="menu" className="ip" data-testid="ip">09/21/2026</InlinePicker>,
    );
    await expectNoViolations(container);
    const btn = screen.getByRole('button', { name: /Previous versions.*09\/21\/2026/ });
    expect(btn).toBe(ref.current);
    expect(btn).toHaveAttribute('aria-controls', 'menu');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('ip')).toHaveClass('ip');
  });
});

describe('ImageCropField', () => {
  it('explains the disabled controls and drives zoom', async () => {
    const ref = createRef<HTMLDivElement>();
    const onZoom = vi.fn();
    const { container, rerender } = renderWithProvider(
      <ImageCropField ref={ref} label="Firm logo" zoom={1} onZoomChange={onZoom} onRemove={() => {}} className="ic" data-testid="ic" />,
    );
    await expectNoViolations(container);
    expect(screen.getByTestId('ic')).toBe(ref.current);
    expect(ref.current).toHaveClass('ic');
    const slider = screen.getByRole('slider', { name: 'Firm logo zoom' });
    expect(slider).toBeDisabled();
    expect(slider).toHaveAccessibleDescription('Upload an image to adjust its zoom.');
    rerender(<ImageCropField label="Firm logo" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" zoom={1} onZoomChange={onZoom} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Firm logo zoom' }), { target: { value: '2' } });
    expect(onZoom).toHaveBeenCalledWith(2);
  });
});

describe('Pickers coverage: ComboboxPanel', () => {
  function Panel(props: { onSelect?: (v: string) => void; onEscape?: () => void; initial?: string; items?: typeof items }) {
    const [q, setQ] = useState(props.initial ?? '');
    return (
      <ComboboxPanel
        label="Companies" items={props.items ?? items} onSelect={props.onSelect ?? (() => {})}
        query={q} onQueryChange={setQ} onEscape={props.onEscape} data-testid="panel"
      />
    );
  }

  it('clicking an option selects it; clicking a disabled option does not', async () => {
    const onSelect = vi.fn();
    renderWithProvider(<Panel onSelect={onSelect} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('option', { name: /Alpha/ }));
    expect(onSelect).toHaveBeenCalledWith('a');
    await user.click(screen.getByRole('option', { name: /Beta/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('arrows skip disabled options, stop at the ends, and Enter selects the active one', async () => {
    const onSelect = vi.fn();
    renderWithProvider(<Panel onSelect={onSelect} />);
    const user = userEvent.setup();
    const input = screen.getByRole('combobox');
    input.focus();
    await user.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: /Gamma/ }).id);
    await user.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: /Gamma/ }).id);
    await user.keyboard('{ArrowUp}');
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: /Alpha/ }).id);
    await user.keyboard('{ArrowUp}');
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: /Alpha/ }).id);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith('c');
  });

  it('Enter does nothing on a disabled active option, and keys are ignored with no items', async () => {
    const onSelect = vi.fn();
    const disabledFirst = [{ value: 'x', label: 'Locked', disabled: true }];
    const { unmount } = renderWithProvider(<Panel onSelect={onSelect} items={disabledFirst} />);
    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).not.toHaveBeenCalled();
    unmount();
    renderWithProvider(<Panel onSelect={onSelect} items={[]} />);
    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('Escape clears a non-empty query first and then calls onEscape; consumer onMouseDown still runs', async () => {
    const onEscape = vi.fn();
    renderWithProvider(<Panel onEscape={onEscape} initial="alp" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    input.focus();
    await userEvent.keyboard('{Escape}');
    expect(input.value).toBe('');
    expect(onEscape).toHaveBeenCalledTimes(1);

    const onMouseDown = vi.fn();
    renderWithProvider(<ComboboxOption onMouseDown={onMouseDown} data-testid="opt2">Two</ComboboxOption>);
    const md = fireEvent.mouseDown(screen.getByTestId('opt2'));
    expect(onMouseDown).toHaveBeenCalled();
    expect(md).toBe(false); // default prevented so the input keeps focus
  });
});

describe('Pickers coverage: SelectMenu type-ahead and blur', () => {
  it('type-ahead cycles through matches, ignores no-match and non-printing keys, and resets after the timeout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      renderWithProvider(
        <SelectMenu label="Fruit">
          <SelectMenuOption>Apple</SelectMenuOption>
          <SelectMenuOption>Avocado</SelectMenuOption>
          <SelectMenuOption>Banana</SelectMenuOption>
        </SelectMenu>,
      );
      const lb = screen.getByRole('listbox');
      const id = (n: string) => screen.getByRole('option', { name: n }).id;
      lb.focus();
      fireEvent.keyDown(lb, { key: 'b' });
      expect(lb).toHaveAttribute('aria-activedescendant', id('Banana'));
      fireEvent.keyDown(lb, { key: 'z' }); // "bz" matches nothing: active option stays
      expect(lb).toHaveAttribute('aria-activedescendant', id('Banana'));
      fireEvent.keyDown(lb, { key: 'Shift' }); // not a printable key
      expect(lb).toHaveAttribute('aria-activedescendant', id('Banana'));
      act(() => { vi.advanceTimersByTime(600); });
      fireEvent.keyDown(lb, { key: 'a' });
      expect(lb).toHaveAttribute('aria-activedescendant', id('Apple'));
    } finally {
      vi.useRealTimers();
    }
  });

  it('blur to outside clears the active option and calls onBlur; focus moving inside keeps it', async () => {
    const onBlur = vi.fn();
    renderWithProvider(
      <>
        <SelectMenu label="L" onBlur={onBlur}>
          <SelectMenuOption>One</SelectMenuOption>
        </SelectMenu>
        <button type="button">outside</button>
      </>,
    );
    const user = userEvent.setup();
    await user.tab();
    const lb = screen.getByRole('listbox');
    expect(lb).toHaveAttribute('aria-activedescendant');
    await user.tab();
    expect(onBlur).toHaveBeenCalled();
    expect(lb).not.toHaveAttribute('aria-activedescendant');
  });

  it('an empty menu is focusable without activating anything', async () => {
    renderWithProvider(<SelectMenu label="Empty">{null}</SelectMenu>);
    await userEvent.setup().tab();
    expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-activedescendant');
  });
});

describe('Pickers coverage: Dropzone', () => {
  const csv = new File(['x'], 'a.csv', { type: 'text/csv' });
  const png = new File(['x'], 'b.png', { type: 'image/png' });
  const drop = (el: HTMLElement, files: File[]) => fireEvent.drop(el, { dataTransfer: { files } });

  it('browse button opens the native file picker', async () => {
    const { container } = renderWithProvider(<Dropzone hint="h" onFiles={() => {}} />);
    const input = container.querySelector('input[type=file]') as HTMLInputElement;
    const click = vi.spyOn(input, 'click');
    await userEvent.setup().click(screen.getByRole('button', { name: 'select a file' }));
    expect(click).toHaveBeenCalled();
  });

  it('dropped files are filtered by accept (extension, mime, wildcard) and truncated unless multiple', () => {
    const onFiles = vi.fn();
    const { rerender } = renderWithProvider(<Dropzone hint="h" accept=".csv" onFiles={onFiles} data-testid="dz" />);
    const dz = screen.getByTestId('dz');
    drop(dz, [png, csv]);
    expect(onFiles).toHaveBeenLastCalledWith([csv]);
    drop(dz, [png]);
    expect(onFiles).toHaveBeenCalledTimes(1);

    rerender(<Dropzone hint="h" accept="image/*" onFiles={onFiles} data-testid="dz" />);
    drop(screen.getByTestId('dz'), [csv, png]);
    expect(onFiles).toHaveBeenLastCalledWith([png]);

    rerender(<Dropzone hint="h" accept="text/csv, image/png" multiple onFiles={onFiles} data-testid="dz" />);
    drop(screen.getByTestId('dz'), [csv, png]);
    expect(onFiles).toHaveBeenLastCalledWith([csv, png]);

    rerender(<Dropzone hint="h" onFiles={onFiles} data-testid="dz" />);
    drop(screen.getByTestId('dz'), [csv, png]);
    expect(onFiles).toHaveBeenLastCalledWith([csv]);
  });

  it('shows the over state on drag enter and removes it when the last drag leaves; consumer handlers still run', () => {
    const handlers = { onDragEnter: vi.fn(), onDragOver: vi.fn(), onDragLeave: vi.fn(), onDrop: vi.fn() };
    renderWithProvider(<Dropzone hint="h" onFiles={() => {}} data-testid="dz" {...handlers} />);
    const dz = screen.getByTestId('dz');
    fireEvent.dragEnter(dz);
    fireEvent.dragEnter(dz);
    expect(dz).toHaveClass('scalar-dropzone--over');
    fireEvent.dragLeave(dz);
    expect(dz).toHaveClass('scalar-dropzone--over');
    fireEvent.dragOver(dz);
    fireEvent.dragLeave(dz);
    expect(dz).not.toHaveClass('scalar-dropzone--over');
    drop(dz, []);
    expect(handlers.onDragEnter).toHaveBeenCalledTimes(2);
    expect(handlers.onDragOver).toHaveBeenCalled();
    expect(handlers.onDragLeave).toHaveBeenCalledTimes(2);
    expect(handlers.onDrop).toHaveBeenCalled();
  });
});

describe('Pickers coverage: InlineEdit', () => {
  it('ignores Enter while an IME composition is active, and a second finish is a no-op', async () => {
    const onCommit = vi.fn();
    renderWithProvider(<InlineEdit label="Name" placeholder="p" value="Old" onCommit={onCommit} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Name: Old. Edit' }));
    const input = screen.getByRole('textbox', { name: 'Name' });
    fireEvent.change(input, { target: { value: 'New' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(input, { key: 'Enter' });
      fireEvent.blur(input);
    });
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith('New');
  });
});
