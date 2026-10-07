import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { ScalarProvider, useScalarTheme } from './ScalarProvider.js';

function Probe() {
  const t = useScalarTheme();
  return <output data-testid="o">{`${t.mode}|${t.viewport}|${t.resolvedViewport}`}</output>;
}

const setWidth = (w: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: w });
  window.dispatchEvent(new Event('resize'));
};

afterEach(() => setWidth(1024));

describe('ScalarProvider', () => {
  it('root mode writes attributes to <html> and removes them on unmount', () => {
    const { unmount } = render(<ScalarProvider mode="dark" viewport="mobile"><Probe /></ScalarProvider>);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement).toHaveAttribute('data-viewport', 'mobile');
    unmount();
    expect(document.documentElement).not.toHaveAttribute('data-theme');
    expect(document.documentElement).not.toHaveAttribute('data-viewport');
  });

  it('scope mode forwards className/native props and follows resize with viewport="auto"', () => {
    setWidth(1000);
    render(<ScalarProvider target="scope" viewport="auto" className="x" data-testid="s"><Probe /></ScalarProvider>);
    const el = screen.getByTestId('s');
    expect(el).toHaveClass('x');
    expect(el).toHaveAttribute('data-viewport', 'desktop');
    act(() => setWidth(500));
    expect(el).toHaveAttribute('data-viewport', 'mobile');
    act(() => setWidth(2000));
    expect(el).toHaveAttribute('data-viewport', 'desktop-large');
    expect(screen.getByTestId('o')).toHaveTextContent('light|auto|desktop-large');
  });

  it('server render never reads window and uses the desktop default for auto', () => {
    const html = renderToString(<ScalarProvider target="scope" viewport="auto"><Probe /></ScalarProvider>);
    expect(html).toContain('data-viewport="desktop"');
  });

  it('useScalarTheme returns defaults outside a provider', () => {
    render(<Probe />);
    expect(screen.getByTestId('o')).toHaveTextContent('light|desktop|desktop');
  });
});
