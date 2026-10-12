import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkA11y } from '../../test/render.js';
import { ColorPicker, hexToHsv, hsvToHex } from './index.js';

describe('colour maths', () => {
  it('round-trips hex through HSV and rejects anything that is not #RRGGBB', () => {
    for (const hex of ['#0268c1', '#ffffff', '#000000', '#be185d']) expect(hsvToHex(hexToHsv(hex)!)).toBe(hex);
    expect(hexToHsv('#0268c1')).toMatchObject({ s: expect.closeTo(0.99, 1), v: expect.closeTo(0.757, 2) });
    expect(hexToHsv('red')).toBeUndefined();
    expect(hexToHsv('#fff')).toBeUndefined();
  });
});

describe('ColorPicker', () => {
  const setup = (props: Partial<Parameters<typeof ColorPicker>[0]> = {}) => {
    const onApply = vi.fn();
    const onCancel = vi.fn();
    const onChange = vi.fn();
    const utils = render(<ColorPicker label="Draft" value="#FF0000" onApply={onApply} onCancel={onCancel} onChange={onChange} {...props} />);
    return { ...utils, onApply, onCancel, onChange };
  };

  it('is a named group, forwards ref/className/testid and has no axe violations', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = setup({ ref, className: 'x', 'data-testid': 'cp' } as never);
    expect(ref.current).toBe(screen.getByTestId('cp'));
    expect(ref.current).toHaveClass('scalar-color-picker', 'x');
    expect(screen.getByRole('group', { name: 'Draft' })).toBe(ref.current);
    expect(screen.getByRole('slider', { name: 'Saturation' })).toHaveAttribute('aria-valuetext', 'Saturation 100%, brightness 100%');
    expect(screen.getByRole('slider', { name: 'Hue' })).toHaveAttribute('aria-valuenow', '0');
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('moves saturation and brightness with the arrow keys', async () => {
    const { onChange } = setup();
    const plane = screen.getByRole('slider', { name: 'Saturation' });
    plane.focus();
    await userEvent.keyboard('{ArrowLeft}{ArrowDown}');
    expect(plane).toHaveAttribute('aria-valuetext', 'Saturation 99%, brightness 99%');
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    expect(plane).toHaveAttribute('aria-valuenow', '89');
    await userEvent.keyboard('{Home}{PageDown}');
    expect(plane).toHaveAttribute('aria-valuetext', 'Saturation 0%, brightness 89%');
    await userEvent.keyboard('{ArrowRight}{ArrowUp}{PageUp}');
    expect(plane).toHaveAttribute('aria-valuetext', 'Saturation 1%, brightness 100%');
    await userEvent.keyboard('{End}');
    expect(plane).toHaveAttribute('aria-valuenow', '100');
    expect(onChange).toHaveBeenLastCalledWith(hsvToHex({ h: 0, s: 1, v: 1 }));
  });

  it('moves hue with the keyboard and clamps at the ends', async () => {
    setup();
    const hue = screen.getByRole('slider', { name: 'Hue' });
    hue.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(hue).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{ArrowRight}{PageUp}');
    expect(hue).toHaveAttribute('aria-valuetext', 'Hue 31°');
    await userEvent.keyboard('{End}');
    expect(hue).toHaveAttribute('aria-valuenow', '359');
    await userEvent.keyboard('{PageDown}{Shift>}{ArrowDown}{/Shift}');
    expect(hue).toHaveAttribute('aria-valuenow', '319');
    await userEvent.keyboard('{ArrowUp}{Home}');
    expect(hue).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('textbox', { name: 'Hex colour' })).toHaveValue(hsvToHex({ h: 359, s: 1, v: 1 }).toUpperCase());
  });

  it('drags on the square and the hue track', () => {
    const { onChange } = setup();
    const box = { left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON: () => ({}) };
    const captured = new Set<number>();
    for (const name of ['Saturation', 'Hue']) {
      const el = screen.getByRole('slider', { name });
      el.getBoundingClientRect = () => box as DOMRect;
      el.setPointerCapture = (id: number) => { captured.add(id); };
      el.hasPointerCapture = (id: number) => captured.has(id);
    }
    const plane = screen.getByRole('slider', { name: 'Saturation' });
    fireEvent.pointerDown(plane, { pointerId: 1, clientX: 50, clientY: 25 });
    expect(plane).toHaveAttribute('aria-valuetext', 'Saturation 25%, brightness 75%');
    fireEvent.pointerMove(plane, { pointerId: 1, clientX: 400, clientY: -10 });
    expect(plane).toHaveAttribute('aria-valuetext', 'Saturation 100%, brightness 100%');
    fireEvent.pointerMove(plane, { pointerId: 2, clientX: 0, clientY: 0 });
    expect(plane).toHaveAttribute('aria-valuenow', '100');
    const hue = screen.getByRole('slider', { name: 'Hue' });
    fireEvent.pointerDown(hue, { pointerId: 3, clientX: 100, clientY: 5 });
    expect(hue).toHaveAttribute('aria-valuenow', '180');
    expect(onChange).toHaveBeenLastCalledWith(hsvToHex({ h: 180, s: 1, v: 1 }));
  });

  it('takes a typed hex, flags an invalid one and reverts it on blur', async () => {
    const { onApply } = setup();
    const field = screen.getByRole('textbox', { name: 'Hex colour' });
    await userEvent.clear(field);
    await userEvent.type(field, '#0268C1');
    expect(screen.getByRole('slider', { name: 'Hue' })).toHaveAttribute('aria-valuenow', '208');
    await userEvent.clear(field);
    await userEvent.type(field, '#02');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    fireEvent.blur(field);
    expect(field).toHaveValue('#0268C1');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onApply).toHaveBeenCalledWith('#0268c1');
  });

  it('cancels with the button and with Escape', async () => {
    const { onCancel } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    screen.getByRole('slider', { name: 'Hue' }).focus();
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});
