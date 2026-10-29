import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkA11y } from '../../test/render.js';
import {
  AITool, Badge, CompanyDropdown, CompanyDropdownPanel, CompanyInfo, ComboTag, CurrencySelector, FilterDropdown,
  InformationLabel, MainMenuItem, MenuPanel, Notification, PrimaryMenu, SearchBar, SecondaryMenu, SecondaryMenuItem,
  SectionSubMenu, Selector, SubmenuItem, TertiaryMenu, TertiaryMenuItem, ToolSwitch, ValuationInfo, MenuGroupLabel,
  convertCurrencyDisplayUnit, formatCurrencyDisplayUnit, nextCurrencyDisplayUnit, currencySymbol, WORLD_CURRENCIES,
} from './index.js';

async function expectNoViolations(container: Element) {
  expect((await checkA11y(container)).violations).toEqual([]);
}

const companies = [
  { id: 'a', name: 'Acme', pinned: true },
  { id: 'b', name: 'Beta' },
  { id: 'c', name: 'Gamma' },
];

describe('ref / className / data-testid contract', () => {
  const cases: Array<[string, (ref: React.Ref<never>) => React.ReactElement]> = [
    ['Badge', (ref) => <Badge ref={ref as never} className="x" data-testid="t">3</Badge>],
    ['CompanyDropdown', (ref) => <CompanyDropdown ref={ref as never} className="x" data-testid="t">Acme</CompanyDropdown>],
    ['FilterDropdown', (ref) => <FilterDropdown ref={ref as never} className="x" data-testid="t">All</FilterDropdown>],
    ['Notification', (ref) => <Notification ref={ref as never} className="x" data-testid="t" />],
    ['ComboTag', (ref) => <ComboTag ref={ref as never} className="x" data-testid="t" label="Fund" value="I" />],
    ['CurrencySelector', (ref) => <CurrencySelector ref={ref as never} className="x" data-testid="t">K</CurrencySelector>],
    ['Selector', (ref) => <Selector ref={ref as never} className="x" data-testid="t" value="v" />],
    ['InformationLabel', (ref) => <InformationLabel ref={ref as never} className="x" data-testid="t" label="L" value="V" />],
    ['ToolSwitch', (ref) => <ToolSwitch ref={ref as never} className="x" data-testid="t" value="valuations" />],
    ['AITool', (ref) => <AITool ref={ref as never} className="x" data-testid="t" />],
    ['MainMenuItem', (ref) => <MainMenuItem ref={ref as never} className="x" data-testid="t">Home</MainMenuItem>],
    ['SecondaryMenuItem', (ref) => <SecondaryMenuItem ref={ref as never} className="x" data-testid="t">Tab</SecondaryMenuItem>],
    ['TertiaryMenuItem', (ref) => <TertiaryMenuItem ref={ref as never} className="x" data-testid="t">View</TertiaryMenuItem>],
    ['SubmenuItem', (ref) => <SubmenuItem ref={ref as never} className="x" data-testid="t">Row</SubmenuItem>],
    ['PrimaryMenu', (ref) => <PrimaryMenu ref={ref as never} className="x" data-testid="t" />],
    ['SecondaryMenu', (ref) => <SecondaryMenu ref={ref as never} className="x" data-testid="t" />],
    ['TertiaryMenu', (ref) => <TertiaryMenu ref={ref as never} className="x" data-testid="t" />],
    ['CompanyInfo', (ref) => <CompanyInfo ref={ref as never} className="x" data-testid="t" name="Acme" />],
    ['ValuationInfo', (ref) => <ValuationInfo ref={ref as never} className="x" data-testid="t" />],
    ['MenuPanel', (ref) => <MenuPanel ref={ref as never} label="m" className="x" data-testid="t" />],
    ['CompanyDropdownPanel', (ref) => <CompanyDropdownPanel ref={ref as never} companies={companies} className="x" data-testid="t" />],
    ['SectionSubMenu', (ref) => <SectionSubMenu ref={ref as never} label="Cap table" items={[]} className="x" data-testid="t" />],
    ['MenuGroupLabel', (ref) => <MenuGroupLabel ref={ref as never} className="x" data-testid="t">G</MenuGroupLabel>],
  ];
  it.each(cases)('%s forwards ref, merges className, passes data-testid and has no axe violations', async (_n, make) => {
    const ref = createRef<HTMLElement>();
    const { container } = render(make(ref as never));
    const el = screen.getByTestId('t');
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(el.className).toContain('x');
    await expectNoViolations(container);
  });

  it('SearchBar forwards ref to the input, className to the wrapper', async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<SearchBar ref={ref} className="x" data-testid="t" />);
    expect(ref.current).toBe(screen.getByTestId('t'));
    expect(screen.getByRole('search').className).toContain('x');
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBe(ref.current);
    await expectNoViolations(container);
  });
});

describe('navigation landmarks', () => {
  it('labels the tiers and marks the current item', async () => {
    const { container } = render(
      <>
        <PrimaryMenu as="div"><MainMenuItem href="/a" current>A</MainMenuItem></PrimaryMenu>
        <SecondaryMenu><SecondaryMenuItem href="/s" current>S</SecondaryMenuItem></SecondaryMenu>
        <TertiaryMenu onAdd={() => {}}><TertiaryMenuItem href="/t" current>T</TertiaryMenuItem></TertiaryMenu>
      </>,
    );
    for (const name of ['Primary', 'Secondary', 'Tertiary']) expect(screen.getByRole('navigation', { name })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'A' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: 'Add view' })).toBeTruthy();
    await expectNoViolations(container);
  });

  it('MainMenuItem sets aria-expanded only for a disclosure', () => {
    render(<><MainMenuItem href="/a">Link</MainMenuItem><MainMenuItem expanded>Menu</MainMenuItem></>);
    expect(screen.getByRole('link', { name: 'Link' }).hasAttribute('aria-expanded')).toBe(false);
    expect(screen.getByRole('button', { name: 'Menu' }).getAttribute('aria-expanded')).toBe('true');
  });

  it('TertiaryMenuItem kebab is a real button only with onMenuClick', async () => {
    const onMenuClick = vi.fn();
    render(<TertiaryMenuItem current onMenuClick={onMenuClick}>View</TertiaryMenuItem>);
    await userEvent.click(screen.getByRole('button', { name: 'View actions' }));
    expect(onMenuClick).toHaveBeenCalled();
  });

  it('CompanyInfo renders the title as a heading', () => {
    render(<CompanyInfo name="Acme" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Acme' })).toBeTruthy();
  });
});

describe('SectionSubMenu (navigation disclosure)', () => {
  it('is a labelled nav with no menu roles and aria-current', async () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SectionSubMenu label="Cap table" currentId="b" onSelect={onSelect}
        items={[{ id: 'a', label: 'Summary' }, { id: 'b', label: 'Rounds', hasSubmenu: true }]} />,
    );
    expect(screen.getByRole('navigation', { name: 'Cap table' })).toBeTruthy();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByRole('button', { name: 'Rounds' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: 'Rounds' }).getAttribute('aria-haspopup')).toBe('true');
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Summary' }));
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('a');
    await expectNoViolations(container);
  });
});

describe('MenuPanel kind="menu"', () => {
  function Harness({ onClose }: { onClose: () => void }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open</button>
        {open && (
          <MenuPanel kind="menu" label="Actions" initialFocus onClose={() => { setOpen(false); onClose(); }}>
            <SubmenuItem>Alpha</SubmenuItem>
            <SubmenuItem disabled>Skipped</SubmenuItem>
            <SubmenuItem>Beta</SubmenuItem>
            <SubmenuItem>Gamma</SubmenuItem>
          </MenuPanel>
        )}
      </>
    );
  }

  it('has menuitems, one tab stop, arrows/Home/End/typeahead, Esc closes and returns focus', async () => {
    const onClose = vi.fn();
    const { container } = render(<Harness onClose={onClose} />);
    const opener = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(opener);
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeTruthy();
    const items = screen.getAllByRole('menuitem');
    expect(document.activeElement).toBe(items[0]);
    expect(items.filter((i) => i.getAttribute('tabindex') === '0')).toHaveLength(1);
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(items[2]); // disabled row skipped
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(items[3]);
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(items[0]); // wraps
    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(items[3]);
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(items[0]);
    await userEvent.keyboard('g');
    expect(document.activeElement).toBe(items[3]);
    await expectNoViolations(container);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('Tab calls onClose', async () => {
    const onClose = vi.fn();
    render(<MenuPanel kind="menu" label="m" onClose={onClose}><SubmenuItem>One</SubmenuItem></MenuPanel>);
    screen.getByRole('menuitem').focus();
    await userEvent.tab();
    expect(onClose).toHaveBeenCalled();
  });

  it('does not steal focus when initialFocus is off', () => {
    render(<MenuPanel kind="menu" label="m"><SubmenuItem>One</SubmenuItem></MenuPanel>);
    expect(document.activeElement).toBe(document.body);
  });
});

describe('CompanyDropdownPanel (listbox)', () => {
  it('is a listbox of options with aria-selected, groups and keyboard selection', async () => {
    const onSelect = vi.fn();
    const { container } = render(<CompanyDropdownPanel companies={companies} currentId="b" onSelect={onSelect} initialFocus />);
    expect(screen.getByRole('listbox', { name: 'Companies' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Pinned' })).toBeTruthy();
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
    expect(document.activeElement).toBe(options[1]); // starts on the current one
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(options[2]);
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(options[0]);
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('a');
    await expectNoViolations(container);
  });
});

describe('ToolSwitch (radiogroup)', () => {
  it('has one tab stop; arrows move and select; Home/End work', async () => {
    const onChange = vi.fn();
    function Controlled() {
      const [v, setV] = useState<'valuations' | 'workboard'>('valuations');
      return <ToolSwitch value={v} onChange={(n) => { setV(n); onChange(n); }} />;
    }
    const { container } = render(<Controlled />);
    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['true', 'false']);
    await userEvent.tab();
    expect(document.activeElement).toBe(radios[0]);
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('workboard');
    expect(document.activeElement).toBe(radios[1]);
    expect(radios[1]!.getAttribute('aria-checked')).toBe('true');
    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('valuations');
    await expectNoViolations(container);
  });
});

describe('triggers', () => {
  it('CompanyDropdown / FilterDropdown expose haspopup + expanded; FilterDropdown names the filter', () => {
    render(<><CompanyDropdown expanded>Acme</CompanyDropdown><FilterDropdown label="Period">All periods</FilterDropdown></>);
    const company = screen.getByRole('button', { name: /Acme/ });
    expect(company.getAttribute('aria-haspopup')).toBe('listbox');
    expect(company.getAttribute('aria-expanded')).toBe('true');
    const filter = screen.getByRole('button', { name: /Period: All periods/ });
    expect(filter.getAttribute('aria-expanded')).toBe('false');
  });

  it('Selector / CurrencySelector announce a popup only when they can open one', () => {
    render(
      <>
        <Selector value="x" label="Date" data-testid="ro" />
        <Selector value="y" label="Date2" onClick={() => {}} expanded data-testid="rw" />
        <CurrencySelector data-testid="cro">K</CurrencySelector>
        <CurrencySelector expanded={false} data-testid="crw">K</CurrencySelector>
      </>,
    );
    expect(screen.getByTestId('ro').hasAttribute('aria-haspopup')).toBe(false);
    expect(screen.getByTestId('rw').getAttribute('aria-haspopup')).toBe('menu');
    expect(screen.getByTestId('rw').getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('cro').hasAttribute('aria-haspopup')).toBe(false);
    expect(screen.getByTestId('crw').getAttribute('aria-expanded')).toBe('false');
  });

  it('Notification name carries the unread state and is overridable', () => {
    render(<Notification unread unreadLabel="Avisos sin leer" />);
    expect(screen.getByRole('button', { name: 'Avisos sin leer' })).toBeTruthy();
  });

  it('AITool input is uncontrolled by default, submits on Enter, forwards ref', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<HTMLInputElement & HTMLButtonElement>();
    const { container } = render(<AITool ref={ref} state="input" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Ask the assistant' }), 'hello{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('hello');
    expect(ref.current).toBe(screen.getByRole('textbox'));
    await expectNoViolations(container);
  });

  it('AITool opens on click, takes typing, and the AI mark or Escape closes it', async () => {
    const onSubmit = vi.fn();
    const onStateChange = vi.fn();
    const { container } = render(<AITool onSubmit={onSubmit} onStateChange={onStateChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ask AI' }));
    expect(onStateChange).toHaveBeenLastCalledWith('input');
    const field = screen.getByRole('textbox', { name: 'Ask the assistant' });
    expect(document.activeElement).toBe(field);
    expect(field.getAttribute('placeholder')).toBe('How can I help you?');
    await userEvent.type(field, 'Summarise ABC Co{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('Summarise ABC Co');
    await userEvent.click(screen.getByRole('button', { name: /Press ↵/ }));
    expect(onSubmit).toHaveBeenCalledTimes(2);
    await expectNoViolations(container);
    await userEvent.click(screen.getByRole('button', { name: 'Close AI' }));
    expect(onStateChange).toHaveBeenLastCalledWith('trigger');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Ask AI' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ask AI' }));
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Summarise ABC Co');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('ValuationInfo toggles groups with stable names and exposes picker state', async () => {
    const onMarket = vi.fn();
    const { container } = render(<ValuationInfo equityValue="$1" marketDate="06/01" version="V1" onMarketDateClick={onMarket} marketDateExpanded />);
    const values = screen.getByRole('button', { name: 'Valuation values' });
    expect(values.getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(values);
    expect(values.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('$1')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Market date and version' }));
    const picker = screen.getByRole('button', { name: /Market.*06\/01/ });
    expect(picker.getAttribute('aria-expanded')).toBe('true');
    await userEvent.click(picker);
    expect(onMarket).toHaveBeenCalled();
    await expectNoViolations(container);
  });

  it('CurrencySelector cycles Hundreds → Thousands → Millions → Hundreds', () => {
    const seen: string[] = [];
    render(<CurrencySelector currency="USD" defaultUnit="Hundreds" onUnitChange={(u) => seen.push(u)} data-testid="cyc" />);
    const chip = screen.getByTestId('cyc');
    expect(chip.hasAttribute('aria-haspopup')).toBe(false);
    expect(chip.textContent).toContain('($) Hundreds');
    expect(chip.textContent).toContain('switch to Thousands');
    fireEvent.click(chip); fireEvent.click(chip); fireEvent.click(chip);
    expect(seen).toEqual(['Thousands', 'Millions', 'Hundreds']);
    expect(chip.getAttribute('data-unit')).toBe('Hundreds');
    expect(screen.getByRole('status').textContent).toBe('Showing Hundreds');
  });

  it('formatCurrencyDisplayUnit rescales from the stored unit', () => {
    expect(nextCurrencyDisplayUnit('Millions')).toBe('Hundreds');
    expect(formatCurrencyDisplayUnit(22118, 'Thousands', 'Hundreds')).toBe('$221,180');
    expect(formatCurrencyDisplayUnit(22118, 'Thousands', 'Thousands')).toBe('$22,118');
    expect(formatCurrencyDisplayUnit(22118, 'Thousands', 'Millions')).toBe('$22.1');
    expect(formatCurrencyDisplayUnit(-2503, 'Thousands', 'Millions')).toBe('($2.5)');
    expect(convertCurrencyDisplayUnit(1, 'Millions', 'Thousands')).toBe(1000);
  });

  it('CurrencySelector with currencies opens a searchable list and reports the pick', async () => {
    const picked: string[] = [];
    render(<CurrencySelector currencies={WORLD_CURRENCIES} defaultCurrency="USD" defaultUnit="Thousands" onCurrencyChange={(c) => picked.push(c)} />);
    const code = screen.getByRole('button', { name: /USD, change currency/ });
    expect(code.getAttribute('aria-haspopup')).toBe('listbox');
    expect(code.getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(code);
    expect(code.getAttribute('aria-expanded')).toBe('true');
    await userEvent.type(screen.getByRole('combobox', { name: 'Find a currency' }), 'pound');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['GBP · British Pound£']);
    await userEvent.click(screen.getByRole('option'));
    expect(picked).toEqual(['GBP']);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('button', { name: /GBP, change currency/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /\(£\) Thousands, switch to Millions/ })).toBeTruthy();
  });

  it('currencySymbol gives the narrow symbol', () => {
    expect(currencySymbol('EUR')).toBe('€');
    expect(currencySymbol('JPY')).toBe('¥');
    expect(formatCurrencyDisplayUnit(20349, 'Thousands', 'Millions', currencySymbol('EUR'))).toBe('€20.3');
  });
});
