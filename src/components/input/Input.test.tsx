import { createRef, useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { renderWithProvider, checkA11y } from '../../test/render.js';
import { FormField, Input, Select, Textarea } from './index.js';

describe('Input / Textarea / Select', () => {
  it('forward ref to the control, className to the wrapper, controlClassName to the control, testid to the control', async () => {
    const i = createRef<HTMLInputElement>();
    const t = createRef<HTMLTextAreaElement>();
    const s = createRef<HTMLSelectElement>();
    const { container } = renderWithProvider(
      <>
        <Input ref={i} aria-label="a" className="w" controlClassName="c" data-testid="in" />
        <Textarea ref={t} aria-label="b" className="w" controlClassName="c" data-testid="ta" />
        <Select ref={s} aria-label="c" className="w" controlClassName="c" data-testid="se"><option>1</option></Select>
      </>,
    );
    expect(i.current).toBe(screen.getByTestId('in'));
    expect(t.current).toBe(screen.getByTestId('ta'));
    expect(s.current).toBe(screen.getByTestId('se'));
    for (const el of [i.current!, t.current!, s.current!]) {
      expect(el).toHaveClass('scalar-field__control', 'c');
      expect(el.parentElement).toHaveClass('scalar-field', 'w');
    }
    expect(await checkA11y(container)).toHaveNoViolations();
  });
  it('sets aria-invalid on error state and works controlled and uncontrolled', async () => {
    function Controlled() {
      const [v, setV] = useState('a');
      return <Input aria-label="c" value={v} onChange={(e) => setV(e.target.value)} />;
    }
    renderWithProvider(<><Controlled /><Input aria-label="u" defaultValue="x" state="error" /></>);
    await userEvent.type(screen.getByLabelText('c'), 'bc');
    expect(screen.getByLabelText('c')).toHaveValue('abc');
    await userEvent.type(screen.getByLabelText('u'), 'yz');
    expect(screen.getByLabelText('u')).toHaveValue('xyz');
    expect(screen.getByLabelText('u')).toBeInvalid();
  });
});

describe('FormField', () => {
  it('wires label, required, hint and error to the control', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container, rerender } = renderWithProvider(
      <FormField ref={ref} data-testid="ff" label="Amount" helperText="Positive number" required>
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText(/Amount/);
    expect(ref.current).toBe(screen.getByTestId('ff'));
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription('Positive number');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(await checkA11y(container)).toHaveNoViolations();
    rerender(
      <FormField label="Amount" helperText="Must be positive" state="error" required>
        <Input />
      </FormField>,
    );
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Must be positive');
    expect(screen.getByRole('alert')).toHaveTextContent('Must be positive');
  });
  it('merges a describedby already on the control and wires Textarea and Select', () => {
    renderWithProvider(
      <>
        <p id="extra">Extra</p>
        <FormField label="One" helperText="Hint"><Input aria-describedby="extra" /></FormField>
        <FormField label="Two" required><Textarea /></FormField>
        <FormField label="Three" state="error" helperText="Pick one"><Select><option>a</option></Select></FormField>
      </>,
    );
    expect(screen.getByLabelText('One')).toHaveAccessibleDescription('Extra Hint');
    expect(screen.getByLabelText(/Two/)).toBeRequired();
    expect(screen.getByLabelText('Three')).toBeInvalid();
    expect(screen.getByLabelText('Three')).toHaveAccessibleDescription('Pick one');
  });
});
