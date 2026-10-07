import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProvider, checkA11y } from '../../test/render.js';
import { Heading, Label, Overline, Text, Typography } from './index.js';

describe('Typography', () => {
  it('forwards ref, merges className, passes data-testid, no axe violations', async () => {
    const ref = createRef<HTMLElement>();
    const { container } = renderWithProvider(<Typography ref={ref} variant="text" step="m" className="t" data-testid="t">Hi</Typography>);
    expect(ref.current).toBe(screen.getByTestId('t'));
    expect(ref.current).toHaveClass('scalar-type-text-m', 't');
    expect(await checkA11y(container)).toHaveNoViolations();
  });
  it('Heading renders h{level}; Text/Overline set their role classes', () => {
    renderWithProvider(<><Heading level={4}>H</Heading><Text>T</Text><Overline>O</Overline></>);
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
    expect(screen.getByText('O')).toHaveClass('scalar-type-overline-s');
  });
  it('Label is a <label> only when htmlFor is given', () => {
    renderWithProvider(<><Label htmlFor="x">Name</Label><input id="x" /><Label data-testid="s">Plain</Label></>);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByTestId('s').tagName).toBe('SPAN');
  });
  it('checks step against the role', () => {
    // @ts-expect-error overline has no 'xl' step
    const bad = <Typography variant="overline" step="xl">x</Typography>;
    expect(bad).toBeTruthy();
  });
});
