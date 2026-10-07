import { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProvider, checkA11y } from '../../test/render.js';
import { Avatar } from './index.js';

describe('Avatar', () => {
  it('is a named img from alt or initials, forwards ref, className, data-testid', async () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = renderWithProvider(<Avatar ref={ref} initials="AB" alt="Ada Byron" className="a" data-testid="av" />);
    expect(ref.current).toBe(screen.getByTestId('av'));
    expect(screen.getByRole('img', { name: 'Ada Byron' })).toHaveClass('scalar-avatar', 'a');
    expect(await checkA11y(container)).toHaveNoViolations();
  });
  it('uses initials as the name when alt is missing, with or without an image', () => {
    renderWithProvider(<><Avatar initials="CD" /><Avatar src="x.png" initials="EF" /></>);
    expect(screen.getByRole('img', { name: 'CD' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'EF' })).toBeInTheDocument();
  });
  it('is hidden from AT when it has no name', () => {
    renderWithProvider(<Avatar data-testid="av" />);
    expect(screen.getByTestId('av')).toHaveAttribute('aria-hidden', 'true');
  });
  it('falls back to initials when the image fails', () => {
    const { container } = renderWithProvider(<Avatar src="broken.png" initials="GH" />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('GH')).toBeInTheDocument();
  });
});
