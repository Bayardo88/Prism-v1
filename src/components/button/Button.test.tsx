import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProvider, checkA11y } from '../../test/render.js';
import { AIButton, Button, ButtonIcon } from './index.js';

describe('Button', () => {
  it('has no axe violations, forwards ref, merges className and data-testid', async () => {
    const ref = createRef<HTMLButtonElement>();
    const { container } = renderWithProvider(<Button ref={ref} className="x" data-testid="b">Save</Button>);
    expect(ref.current).toBe(screen.getByTestId('b'));
    expect(screen.getByTestId('b')).toHaveClass('scalar-button', 'x');
    expect(await checkA11y(container)).toHaveNoViolations();
  });
  it('stays focusable while loading, blocks clicks and announces', async () => {
    const onClick = vi.fn();
    renderWithProvider(<Button loading onClick={onClick}>Save</Button>);
    const b = screen.getByRole('button', { name: /save/i });
    expect(b).not.toBeDisabled();
    expect(b).toHaveAttribute('aria-disabled', 'true');
    expect(b).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    b.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(b);
    expect(onClick).not.toHaveBeenCalled();
    expect(b).toHaveFocus();
  });
  it('fires on Enter and Space', async () => {
    const onClick = vi.fn();
    renderWithProvider(<Button onClick={onClick}>Go</Button>);
    screen.getByRole('button').focus();
    await userEvent.keyboard('{Enter} ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });
  it('asChild renders the child with button classes, ref and merged handlers', async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    renderWithProvider(<Button asChild ref={ref} onClick={onClick} leadingIcon={<i data-testid="ic" />}><a href="#x">Go</a></Button>);
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).toHaveClass('scalar-button');
    expect(link).toContainElement(screen.getByTestId('ic'));
    expect(ref.current).toBe(link);
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalled();
  });
  it('asChild with disabled blocks activation', async () => {
    const onClick = vi.fn();
    renderWithProvider(<Button asChild disabled onClick={onClick}><a href="#x">Go</a></Button>);
    await userEvent.click(screen.getByRole('link'));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('link')).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('ButtonIcon', () => {
  it('maps label to aria-label, forwards ref and has no axe violations', async () => {
    const ref = createRef<HTMLButtonElement>();
    const { container } = renderWithProvider(<ButtonIcon ref={ref} label="Close" icon={<svg aria-hidden />} data-testid="bi" className="y" />);
    expect(screen.getByRole('button', { name: 'Close' })).toBe(ref.current);
    expect(ref.current).toHaveClass('scalar-button--icon-only', 'y');
    expect(await checkA11y(container)).toHaveNoViolations();
  });
  it('accepts aria-labelledby as the name', () => {
    renderWithProvider(<><span id="n">Dismiss</span><ButtonIcon aria-labelledby="n" icon={<svg aria-hidden />} /></>);
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });
  it('requires a name in its type', () => {
    // @ts-expect-error no label / aria-label / aria-labelledby
    const bad = <ButtonIcon icon={<svg />} />;
    expect(bad).toBeTruthy();
  });
});

describe('AIButton', () => {
  it('renders, forwards ref, has no axe violations', async () => {
    const ref = createRef<HTMLButtonElement>();
    const { container } = renderWithProvider(<AIButton ref={ref} data-testid="ai" className="z">Summarise</AIButton>);
    expect(ref.current).toBe(screen.getByTestId('ai'));
    expect(ref.current).toHaveClass('scalar-ai-button', 'z');
    expect(await checkA11y(container)).toHaveNoViolations();
  });
  it('loading keeps focus and blocks clicks; asChild works', async () => {
    const onClick = vi.fn();
    renderWithProvider(<><AIButton loading onClick={onClick}>Go</AIButton><AIButton asChild><a href="#y">Link</a></AIButton></>);
    await userEvent.click(screen.getByRole('button', { name: /go/i }));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Link' })).toHaveClass('scalar-ai-button');
  });
});
