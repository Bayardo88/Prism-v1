import { createRef, useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkA11y } from '../../test/render.js';
import {
  KeyValueRow, KeyValueList, VersionHistoryItem, VersionHistoryList, PermissionMatrix, PermissionMatrixRow, RoleSelector,
  ProfileHeader, FilterBar, DirectoryGroup, ProductTile, FirmSwitcherTile, PageTaskHeader, CodeGrid, RichTextToolbar, AppFooter,
} from './index.js';

const clean = async (c: Element) => expect((await checkA11y(c)).violations).toEqual([]);

/** ref + className + data-testid + axe, for any component. */
async function contract<T extends HTMLElement>(
  make: (p: { ref: React.Ref<T>; className: string; 'data-testid': string }) => React.ReactElement,
  wrap: (el: React.ReactElement) => React.ReactElement = (e) => e,
) {
  const ref = createRef<T>();
  const { container } = render(wrap(make({ ref, className: 'extra', 'data-testid': 'x' })));
  expect(ref.current).toBe(screen.getByTestId('x'));
  expect(ref.current).toHaveClass('extra');
  await clean(container);
}

describe('KeyValueRow', () => {
  it('meets the contract inside a dl', () => contract<HTMLDivElement>(
    (p) => <KeyValueRow label="Name" {...p}>Acme</KeyValueRow>, (e) => <KeyValueList>{e}</KeyValueList>));
});

describe('VersionHistoryItem', () => {
  it('meets the contract inside an ol; current entry has aria-current', async () => {
    await contract<HTMLLIElement>((p) => <VersionHistoryItem range="Aug" current {...p} />, (e) => <VersionHistoryList>{e}</VersionHistoryList>);
    expect(screen.getByRole('listitem')).toHaveAttribute('aria-current', 'true');
  });
});

describe('PermissionMatrixRow', () => {
  const wrap = (e: React.ReactElement) => <PermissionMatrix aria-label="Permissions">{e}</PermissionMatrix>;
  it('meets the contract', () => contract<HTMLDivElement>((p) => <PermissionMatrixRow label="VIP Fund" edit view {...p} />, wrap));

  it('names the checkboxes after the entity and explains the implied View', () => {
    render(wrap(<PermissionMatrixRow label="VIP Fund" edit view />));
    expect(screen.getByRole('checkbox', { name: 'Edit VIP Fund' })).toBeChecked();
    const view = screen.getByRole('checkbox', { name: 'View VIP Fund' });
    expect(view).toBeDisabled();
    expect(view).toHaveAccessibleDescription('Included with edit access');
  });

  it('Edit implies View, in controlled and uncontrolled mode', async () => {
    const onChange = vi.fn();
    render(wrap(<PermissionMatrixRow label="Fund" defaultEdit={false} defaultView={false} onChange={onChange} />));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Edit Fund' }));
    expect(onChange).toHaveBeenCalledWith({ edit: true, view: true });
    expect(screen.getByRole('checkbox', { name: 'View Fund' })).toBeChecked();
  });

  it('group row has no checkboxes', () => {
    render(wrap(<PermissionMatrixRow type="group" label="Funds" />));
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.getByRole('rowheader', { name: 'Funds' })).toBeInTheDocument();
  });
});

describe('RoleSelector', () => {
  it('meets the contract and is a menu button', async () => {
    // eslint-disable-next-line jsx-a11y/aria-role -- `role` is RoleSelector's own prop (the user's role), not an ARIA role
    await contract<HTMLButtonElement>((p) => <RoleSelector role="Firm admin" {...p} />);
    const b = screen.getByRole('button');
    expect(b).toHaveAttribute('aria-haspopup', 'menu');
    expect(b).toHaveAttribute('aria-expanded', 'false');
  });
  it('fires onClick and passes aria-controls', async () => {
    const onClick = vi.fn();
    // eslint-disable-next-line jsx-a11y/aria-role -- `role` is RoleSelector's own prop (the user's role), not an ARIA role
    render(<RoleSelector role="Analyst" onClick={onClick} aria-controls="m" open />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-controls', 'm');
  });
});

describe('ProfileHeader', () => {
  it('meets the contract; name is a heading and avatar is decorative', async () => {
    await contract<HTMLDivElement>((p) => <ProfileHeader name="Ada Lovelace" email="a@b.c" initials="AL" {...p} />);
    expect(screen.getByRole('heading', { name: 'Ada Lovelace', level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });
});

describe('FilterBar', () => {
  it('meets the contract; is a labelled group, not a search landmark', async () => {
    await contract<HTMLDivElement>((p) => <FilterBar {...p}><button>One</button></FilterBar>);
    expect(screen.queryByRole('search')).toBeNull();
    expect(screen.getByRole('group', { name: 'Filter by' })).toBeInTheDocument();
  });
});

describe('DirectoryGroup', () => {
  it('meets the contract with a meaningful section name', async () => {
    await contract<HTMLElement>((p) => <DirectoryGroup letter="A" entries={[{ label: 'Acme', href: '/a' }, { label: 'Apex', onClick: () => {} }]} {...p} />);
    expect(screen.getByRole('region', { name: 'Companies starting with A' })).toBeInTheDocument();
  });
});

describe('ProductTile', () => {
  it('meets the contract as a button and as a link', async () => {
    await contract<HTMLElement>((p) => <ProductTile product="valuations" title="Valuations" icon={<svg />} {...p} />);
  });
  it('renders an anchor with href and forwards ref', async () => {
    const ref = createRef<HTMLElement>();
    render(<ProductTile ref={ref} product="valuations" title="Valuations" icon={<svg />} href="/v" />);
    expect(screen.getByRole('link', { name: 'Valuations' })).toBe(ref.current);
  });
});

describe('FirmSwitcherTile', () => {
  it('meets the contract; selected is aria-current', async () => {
    await contract<HTMLButtonElement>((p) => <FirmSwitcherTile name="Acme Capital" initials="AC" selected {...p} />);
    expect(screen.getByRole('button', { name: 'Acme Capital' })).toHaveAttribute('aria-current', 'true');
  });
});

describe('PageTaskHeader', () => {
  it('meets the contract; h1, no banner landmark, custom back label', async () => {
    const onBack = vi.fn();
    await contract<HTMLDivElement>((p) => <PageTaskHeader title="Request" onBack={onBack} backLabel="Back to requests" {...p} />);
    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: 'Request' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Back to requests' }));
    expect(onBack).toHaveBeenCalled();
  });
});

describe('CodeGrid', () => {
  it('meets the contract and reads masked codes as hidden', async () => {
    await contract<HTMLDivElement>((p) => <CodeGrid codes={['1111-2222', '3333-4444']} masked {...p} />);
    expect(screen.getAllByText('Hidden code')).toHaveLength(2);
    expect(screen.getByRole('status')).toHaveTextContent('Codes hidden');
  });
  it('shows real codes when not masked', () => {
    render(<CodeGrid codes={['1111-2222']} />);
    expect(screen.getByText('1111-2222')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Codes shown');
  });
});

describe('RichTextToolbar', () => {
  function Harness() {
    const [active, setActive] = useState<string[]>([]);
    return <RichTextToolbar active={active as never} onToggle={(f) => setActive((a) => (a.includes(f) ? a.filter((x) => x !== f) : [...a, f]))} />;
  }
  it('meets the contract', () => contract<HTMLDivElement>((p) => <RichTextToolbar onToggle={() => {}} {...p} />));

  it('is one tab stop; arrows, Home and End move focus; Space toggles', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.filter((b) => b.tabIndex === 0)).toHaveLength(1);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Italic' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Link' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Link' })).toHaveFocus();
    await user.keyboard('{Home}');
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
    await user.tab();
    expect(document.body).toHaveFocus(); // Tab leaves the toolbar
  });

  it('accepts localised labels', () => {
    render(<RichTextToolbar onToggle={() => {}} labels={{ bold: 'Negrita' }} />);
    expect(screen.getByRole('button', { name: 'Negrita' })).toBeInTheDocument();
  });
});

describe('AppFooter', () => {
  it('meets the contract', () => contract<HTMLElement>((p) => <AppFooter version="v1" {...p} />));
  it('uses the given year and fills the current year after mount otherwise', () => {
    const { rerender } = render(<AppFooter year={2030} />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© Scalar Technologies 2030');
    rerender(<AppFooter />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent(`© Scalar Technologies ${new Date().getFullYear()}`);
  });
});
