/* eslint-disable jsx-a11y/no-autofocus -- autoFocus here is the component's own opt-in prop, not the DOM attribute */
import { createRef, useState } from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProvider, checkA11y } from '../../test/render.js';
import {
  ContextMenu, Fab, MenuDivider, MenuItem, MenuSubItems, SegmentedControl, SpeedDial, SpeedDialItem,
  SplitButton, UserMenu, ViewTab, ViewTabBar,
} from './index.js';

const noViolations = async (c: Element) => expect((await checkA11y(c)).violations).toEqual([]);

describe('MenuItem / MenuDivider / MenuSubItems', () => {
  it('forwards ref, className, data-testid and rest props', () => {
    const ref = createRef<HTMLElement>();
    const dRef = createRef<HTMLDivElement>();
    const gRef = createRef<HTMLDivElement>();
    renderWithProvider(
      <ContextMenu label="Actions">
        <MenuItem ref={ref} className="x" data-testid="item" aria-keyshortcuts="E">Edit</MenuItem>
        <MenuDivider ref={dRef} className="d" data-testid="div" />
        <MenuSubItems ref={gRef} label="More" className="g" data-testid="grp"><MenuItem>One</MenuItem></MenuSubItems>
      </ContextMenu>,
    );
    expect(ref.current).toBe(screen.getByTestId('item'));
    expect(ref.current).toHaveClass('scalar-menu-item', 'x');
    expect(dRef.current).toHaveClass('scalar-menu-divider', 'd');
    expect(gRef.current).toHaveAttribute('aria-label', 'More');
  });

  it('exposes selected as menuitemradio and submenu as aria-haspopup', () => {
    renderWithProvider(
      <ContextMenu label="Actions">
        <MenuItem selected>Current</MenuItem>
        <MenuItem hasSubmenu expanded={false}>More</MenuItem>
      </ContextMenu>,
    );
    expect(screen.getByRole('menuitemradio', { name: 'Current' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitem', { name: 'More' })).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('renders asChild as the child element', async () => {
    const onClick = vi.fn();
    renderWithProvider(
      <ContextMenu label="Actions">
        <MenuItem asChild onClick={onClick}><a href="/x">Go</a></MenuItem>
      </ContextMenu>,
    );
    const link = screen.getByRole('menuitem', { name: 'Go' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('scalar-menu-item');
    expect(link.querySelector('.scalar-menu-item__label')).toHaveTextContent('Go');
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalled();
  });
});

describe('ContextMenu', () => {
  const ui = (props: object = {}) => (
    <ContextMenu label="Row actions" heading="Row" data-testid="menu" {...props}>
      <MenuItem>Alpha</MenuItem>
      <MenuItem disabled>Skipped</MenuItem>
      <MenuItem>Beta</MenuItem>
      <MenuDivider />
      <MenuItem tone="destructive">Delete</MenuItem>
    </ContextMenu>
  );

  it('has no axe violations and forwards ref/className', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithProvider(ui({ ref, className: 'c' }));
    await noViolations(container);
    expect(ref.current).toBe(screen.getByTestId('menu'));
    expect(ref.current).toHaveClass('scalar-context-menu', 'c');
  });

  it('does not steal focus unless autoFocus', () => {
    const { unmount } = renderWithProvider(ui());
    expect(document.body).toHaveFocus();
    unmount();
    renderWithProvider(ui({ autoFocus: true }));
    expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus();
  });

  it('is reachable with Tab (single tab stop)', async () => {
    renderWithProvider(ui());
    await userEvent.tab();
    expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus();
  });

  it('moves with arrows (skipping disabled), Home/End and type-ahead', async () => {
    renderWithProvider(ui({ autoFocus: true }));
    const k = userEvent.keyboard;
    await k('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Beta' })).toHaveFocus();
    await k('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus(); // wraps
    await k('{End}');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await k('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Beta' })).toHaveFocus();
    await k('{Home}');
    expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus();
    await k('d');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
  });

  it('calls onClose on Escape and Tab', async () => {
    const onClose = vi.fn();
    renderWithProvider(ui({ autoFocus: true, onClose }));
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenLastCalledWith('escape');
    await userEvent.tab();
    expect(onClose).toHaveBeenLastCalledWith('tab');
  });

  it('activates with Enter and Space', async () => {
    const onClick = vi.fn();
    renderWithProvider(
      <ContextMenu label="A" autoFocus><MenuItem onClick={onClick}>Go</MenuItem></ContextMenu>,
    );
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('opens and collapses an inline submenu with Right / Left', async () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <ContextMenu label="Firm" autoFocus>
          <MenuItem hasSubmenu expanded={open} onClick={() => setOpen((o) => !o)}>Settings</MenuItem>
          {open && <MenuSubItems label="Settings"><MenuItem>Profile</MenuItem></MenuSubItems>}
          <MenuItem>Other</MenuItem>
        </ContextMenu>
      );
    }
    renderWithProvider(<Demo />);
    const k = userEvent.keyboard;
    await k('{ArrowRight}');
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'true');
    await k('{ArrowRight}');
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toHaveFocus();
    await k('{ArrowLeft}');
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveFocus();
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('UserMenu', () => {
  it('has a default and overridable name, forwards ref, no axe violations', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container, rerender } = renderWithProvider(
      <UserMenu ref={ref} name="Acme" detail="a@b.co" initials="AC" className="u" data-testid="um" onClose={() => {}}>
        <MenuItem>Account settings</MenuItem>
        <MenuDivider />
        <MenuItem>Sign out</MenuItem>
      </UserMenu>,
    );
    expect(screen.getByRole('menu', { name: 'Account' })).toBe(ref.current);
    expect(screen.getByTestId('um')).toHaveClass('u');
    await noViolations(container);
    rerender(<UserMenu name="Acme" label="Firm account" />);
    expect(screen.getByRole('menu', { name: 'Firm account' })).toBeInTheDocument();
  });

  it('supports keyboard navigation and Esc', async () => {
    const onClose = vi.fn();
    renderWithProvider(
      <UserMenu name="Acme" autoFocus onClose={onClose}>
        <MenuItem>One</MenuItem><MenuItem>Two</MenuItem>
      </UserMenu>,
    );
    expect(screen.getByRole('menuitem', { name: 'One' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Two' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledWith('escape');
  });
});

describe('SplitButton', () => {
  const menu = (
    <ContextMenu label="Report">
      <MenuItem>Validate</MenuItem>
      <MenuItem>Preview</MenuItem>
    </ContextMenu>
  );

  it('forwards ref/className/data-testid and has no axe violations', async () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = renderWithProvider(
      <SplitButton ref={ref} className="s" data-testid="sb" menuLabel="More options" menu={menu}>Report</SplitButton>,
    );
    expect(ref.current).toBe(screen.getByTestId('sb'));
    expect(ref.current).toHaveClass('s');
    await noViolations(container);
  });

  it('opens, focuses the first item, closes on Esc and returns focus to the caret', async () => {
    renderWithProvider(<SplitButton menuLabel="More options" menu={menu}>Report</SplitButton>);
    const caret = screen.getByRole('button', { name: 'More options' });
    await userEvent.click(caret);
    expect(caret).toHaveAttribute('aria-expanded', 'true');
    expect(caret).toHaveAttribute('aria-controls', screen.getByRole('menu').parentElement!.id);
    expect(screen.getByRole('menuitem', { name: 'Validate' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Preview' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(caret).toHaveFocus();
    expect(caret).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on outside click and on Tab, and ArrowDown opens it', async () => {
    renderWithProvider(<div><SplitButton menuLabel="More options" menu={menu}>Report</SplitButton><button>outside</button></div>);
    const caret = screen.getByRole('button', { name: 'More options' });
    caret.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('menu')).toBeNull();
    await userEvent.click(caret);
    await userEvent.tab();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('supports the controlled API', async () => {
    const onToggle = vi.fn();
    renderWithProvider(<SplitButton menuLabel="More" menuOpen menu={menu} onMenuToggle={onToggle}>Report</SplitButton>);
    await userEvent.keyboard('{Escape}');
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe('Fab / SpeedDial', () => {
  it('Fab forwards ref and rest, toggles uncontrolled, aria-controls links to the dial', async () => {
    const ref = createRef<HTMLButtonElement>();
    function Demo() {
      const [open, setOpen] = useState(true);
      const fab = <Fab ref={ref} hasMenu open={open} onClick={() => setOpen((o) => !o)} fixed={false} data-testid="fab" className="f">Add</Fab>;
      return <SpeedDial label="Add" trigger={fab} onClose={() => setOpen(false)}><SpeedDialItem>One</SpeedDialItem></SpeedDial>;
    }
    const { container } = renderWithProvider(<Demo />);
    expect(ref.current).toBe(screen.getByTestId('fab'));
    expect(ref.current).toHaveClass('f');
    expect(ref.current).toHaveAttribute('aria-controls', screen.getByRole('menu').id);
    await noViolations(container);
  });

  it('Fab owns its open state when uncontrolled', async () => {
    renderWithProvider(<Fab hasMenu>Add</Fab>);
    const fab = screen.getByRole('button', { name: /Add/ });
    expect(fab).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(fab);
    expect(fab).toHaveAttribute('aria-expanded', 'true');
  });

  it('SpeedDial uses arrows/Home/End, Esc returns focus to the FAB, Tab closes', async () => {
    const onClose = vi.fn();
    renderWithProvider(
      <SpeedDial label="Add" autoFocus onClose={onClose} trigger={<Fab hasMenu open fixed={false}>Add</Fab>}>
        <SpeedDialItem>One</SpeedDialItem>
        <SpeedDialItem>Two</SpeedDialItem>
        <SpeedDialItem>Three</SpeedDialItem>
      </SpeedDial>,
    );
    const k = userEvent.keyboard;
    expect(screen.getByRole('menuitem', { name: 'One' })).toHaveFocus();
    await k('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Two' })).toHaveFocus();
    await k('{End}');
    expect(screen.getByRole('menuitem', { name: 'Three' })).toHaveFocus();
    await k('{Escape}');
    expect(onClose).toHaveBeenCalledWith('escape');
    expect(screen.getByRole('button', { name: /Add/ })).toHaveFocus();
  });

  it('SpeedDialItem forwards ref', () => {
    const ref = createRef<HTMLButtonElement>();
    renderWithProvider(<SpeedDial label="d" trigger={null}><SpeedDialItem ref={ref} data-testid="i">One</SpeedDialItem></SpeedDial>);
    expect(ref.current).toBe(screen.getByTestId('i'));
  });
});

describe('SegmentedControl', () => {
  const options = [
    { value: 'chart', label: 'Chart' },
    { value: 'table', label: 'Table', disabled: true },
    { value: 'raw', label: 'Raw' },
  ] as const;

  it('has no axe violations, forwards ref/className/data-testid', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithProvider(
      <SegmentedControl ref={ref} label="View" options={options} value="chart" onChange={() => {}} className="s" data-testid="seg" />,
    );
    expect(ref.current).toBe(screen.getByTestId('seg'));
    expect(ref.current).toHaveClass('s');
    await noViolations(container);
  });

  it('moves selection with arrows (skipping disabled) and Home/End', async () => {
    const onChange = vi.fn();
    function Demo() {
      const [v, setV] = useState<'chart' | 'table' | 'raw'>('chart');
      return <SegmentedControl label="View" options={options} value={v} onChange={(n) => { onChange(n); setV(n); }} />;
    }
    renderWithProvider(<Demo />);
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Chart' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Raw' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Raw' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('chart');
    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('raw');
    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('chart');
  });

  it('stays reachable when value matches nothing, and works uncontrolled', async () => {
    renderWithProvider(<SegmentedControl label="View" options={options} value={'zzz' as never} onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Chart' })).toHaveAttribute('tabindex', '0');
  });

  it('owns its value when uncontrolled', async () => {
    renderWithProvider(<SegmentedControl label="View" options={options} defaultValue="raw" />);
    expect(screen.getByRole('radio', { name: 'Raw' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(screen.getByRole('radio', { name: 'Chart' }));
    expect(screen.getByRole('radio', { name: 'Chart' })).toHaveAttribute('aria-checked', 'true');
  });
});

describe('ViewTabBar / ViewTab', () => {
  const bar = (extra: Partial<React.ComponentProps<typeof ViewTab>> = {}) => (
    <ViewTabBar label="Views" onAdd={() => {}} data-testid="bar">
      <ViewTab selected tabId="t1" panelId="p1" onMenu={() => {}} {...extra}>Summary</ViewTab>
      <ViewTab onMenu={() => {}} onClose={() => {}}>Current</ViewTab>
      <ViewTab>Backsolve</ViewTab>
    </ViewTabBar>
  );

  it('has no axe violations, forwards refs', async () => {
    const ref = createRef<HTMLDivElement>();
    const tRef = createRef<HTMLSpanElement>();
    const { container } = renderWithProvider(
      <ViewTabBar ref={ref} label="Views" className="b" data-testid="bar">
        <ViewTab ref={tRef} selected className="t" data-testid="tab" onMenu={() => {}}>Summary</ViewTab>
      </ViewTabBar>,
    );
    expect(ref.current).toBe(screen.getByTestId('bar'));
    expect(ref.current).toHaveClass('b');
    expect(tRef.current).toBe(screen.getByTestId('tab'));
    await noViolations(container);
    await noViolations(renderWithProvider(<>{bar()}<div id="p1" role="tabpanel" aria-labelledby="t1" /></>).container);
  });

  it('wires aria-controls / id and per-tab action labels', () => {
    renderWithProvider(bar());
    const tab = screen.getByRole('tab', { name: 'Summary' });
    expect(tab).toHaveAttribute('id', 't1');
    expect(tab).toHaveAttribute('aria-controls', 'p1');
    expect(screen.getByRole('button', { name: 'Summary options' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close Current' })).toBeInTheDocument();
  });

  it('uses the label prop for non-string children', () => {
    renderWithProvider(
      <ViewTabBar label="Views"><ViewTab label="Q3" selected onMenu={() => {}}><b>Q3</b></ViewTab></ViewTabBar>,
    );
    expect(screen.getByRole('button', { name: 'Q3 options' })).toBeInTheDocument();
  });

  it('is a single tab stop; kebab and close are not tab stops', async () => {
    renderWithProvider(<div>{bar()}<button>after</button></div>);
    await userEvent.tab();
    expect(screen.getByRole('tab', { name: 'Summary' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Add view' })).toHaveFocus();
  });

  it('moves between tabs with arrows, Home and End', async () => {
    renderWithProvider(bar());
    await userEvent.tab();
    const k = userEvent.keyboard;
    await k('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Current' })).toHaveFocus();
    await k('{End}');
    expect(screen.getByRole('tab', { name: 'Backsolve' })).toHaveFocus();
    await k('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Summary' })).toHaveFocus();
    await k('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Backsolve' })).toHaveFocus();
    await k('{Home}');
    expect(screen.getByRole('tab', { name: 'Summary' })).toHaveFocus();
  });

  it('selects with Enter, opens menu with Shift+F10, closes with Delete', async () => {
    const onSelect = vi.fn(); const onMenu = vi.fn(); const onClose = vi.fn();
    renderWithProvider(
      <ViewTabBar label="Views">
        <ViewTab selected>A</ViewTab>
        <ViewTab onSelect={onSelect} onMenu={onMenu} onClose={onClose}>B</ViewTab>
      </ViewTabBar>,
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
    expect(onMenu).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Delete}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps a tab stop when no tab is selected', () => {
    render(
      <ViewTabBar label="Views"><ViewTab>A</ViewTab><ViewTab>B</ViewTab></ViewTabBar>,
    );
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('tabindex', '-1');
  });
});
