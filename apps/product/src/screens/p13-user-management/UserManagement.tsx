/**
 * User Management (Figma 13 · User Management). Left: the selected user's
 * profile, role and Edit/View permissions per fund and company. Right: every
 * firm user, filterable by email; a row's ⋯ opens the Row Action Toolbar
 * (Edit, Resend invite, Delete user). Reached from the avatar → user menu →
 * Firm Settings → User Management, or Global Search → "User Management".
 */
import { useMemo, useState } from 'react';
import {
  Button, ButtonIcon, Cell, ColumnHeader, ConfirmationDialog, DataGrid, FloatingLabelInput, Heading, Icon,
  MenuPanel, PermissionMatrixRow, ProfileHeader, RoleSelector, Row, RowActionToolbar, SubmenuItem, Text,
  color, glyphs, space, zIndex,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame, PageBody } from '../../shell/AppFrame.js';
import { navigate } from '../../router.js';
import { routes } from '../../routes.js';
import { ROLES, funds, permissionCompanies, users as seedUsers, type FirmUser, type Role } from './data.js';

type Access = { edit: boolean; view: boolean };
type Perms = Record<string, Access>;

const allAccess = (): Perms =>
  Object.fromEntries([...funds, ...permissionCompanies].map((k) => [k, { edit: true, view: true }]));

const COLS = { email: { flex: 3 }, login: { flex: 2 }, actions: { flex: 1 } } as const;

export function UserManagement({ state }: ScreenProps) {
  const analyst = state === 'analyst-row-actions';
  const [users, setUsers] = useState<FirmUser[]>(seedUsers);
  const [selected, setSelected] = useState(analyst ? 'scalar@spatical.com' : seedUsers[seedUsers.length - 1]!.email);
  const [actionsFor, setActionsFor] = useState<string | null>(analyst ? 'scalar@spatical.com' : null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [perms, setPerms] = useState<Record<string, Perms>>({});
  const [dirty, setDirty] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const current = users.find((u) => u.email === selected) ?? users[0]!;
  const currentPerms = perms[current.email] ?? allAccess();
  const visible = useMemo(
    () => users.filter((u) => u.email.toLowerCase().includes(filter.trim().toLowerCase())),
    [users, filter],
  );

  const setAccess = (entity: string, next: Access) => {
    setPerms((p) => ({ ...p, [current.email]: { ...(p[current.email] ?? allAccess()), [entity]: next } }));
    setDirty(true);
  };
  const setRole = (role: Role) => {
    setUsers((list) => list.map((u) => (u.email === current.email ? { ...u, role } : u)));
    setRoleOpen(false);
    setDirty(true);
  };

  const matrixGroup = (label: string, entities: string[]) => (
    <>
      <PermissionMatrixRow type="group" label={label} edit={false} view={false} />
      {entities.map((e) => (
        <PermissionMatrixRow key={e} label={e} edit={currentPerms[e]!.edit} view={currentPerms[e]!.view} onChange={(n) => setAccess(e, n)} />
      ))}
    </>
  );

  return (
    <AppFrame area="settings">
      <PageBody>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.xl, alignItems: 'start' }}>
          {/* User detail */}
          <section aria-labelledby="user-detail" style={{ display: 'flex', flexDirection: 'column', gap: space.l }}>
            <Heading level={1} step="l" id="user-detail">User Management Detail View</Heading>
            <div style={{ position: 'relative' }}>
              <ProfileHeader
                name={current.name}
                email={current.email}
                initials={current.initials}
                lastLogin={current.lastLoginLong ? `Last login: ${current.lastLoginLong}` : 'Has not logged in yet'}
                role={<RoleSelector role={current.role} open={roleOpen} onClick={() => setRoleOpen((o) => !o)} />}
              />
              {roleOpen && (
                <div style={{ position: 'absolute', top: '100%', left: '25%', zIndex: zIndex.overlay }}>
                  <MenuPanel label="Role">
                    {ROLES.map((r) => (
                      <SubmenuItem key={r} current={r === current.role} onClick={() => setRole(r)}>{r}</SubmenuItem>
                    ))}
                  </MenuPanel>
                </div>
              )}
            </div>
            <div role="grid" aria-label={`Permissions for ${current.email}`} style={{ maxHeight: '45vh', overflow: 'auto', border: `1px solid ${color.stroke.subtle}` }}>
              {matrixGroup('Funds', funds)}
              {matrixGroup('Companies', permissionCompanies)}
            </div>
          </section>

          {/* User list */}
          <section
            aria-labelledby="user-permissions"
            style={{ display: 'flex', flexDirection: 'column', gap: space.l, paddingLeft: space.xl, borderLeft: `1px solid ${color.stroke.divider}` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: space.m }}>
              <Heading level={2} step="l" id="user-permissions">User Permissions</Heading>
              <div style={{ marginLeft: 'auto' }}>
                <Button variant="primary" tone="positive" disabled={!dirty} onClick={() => setDirty(false)}>Save</Button>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.s }}>
              <Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><glyphs.Plus /></Icon>}>Bulk add</Button>
              <Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><glyphs.User /></Icon>}>Invite user</Button>
              <Button
                variant="secondary"
                leadingIcon={<Icon size="s" tone="inherit"><glyphs.User /></Icon>}
                onClick={() => navigate(routes.company.overview('abc-co'))}
              >
                Manage company users
              </Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: space.s, width: '50%' }}>
              <div style={{ flex: 1 }}>
                <FloatingLabelInput label="Filter users by email" type="search" value={filter} onChange={(e) => setFilter(e.target.value)} />
              </div>
              <ButtonIcon variant="tertiary" label="More filters" icon={<Icon size="s" tone="inherit"><glyphs.Filter /></Icon>} />
            </div>

            <DataGrid
              label="Firm users"
              head={
                <>
                  <ColumnHeader style={COLS.email}>Email</ColumnHeader>
                  <ColumnHeader style={COLS.login}>Last Login</ColumnHeader>
                  <ColumnHeader style={COLS.actions}><span className="scalar-visually-hidden">Actions</span></ColumnHeader>
                </>
              }
            >
              {visible.map((u) => {
                const sel = u.email === current.email;
                const cellState = sel ? 'selected' : 'default';
                return (
                  <Row key={u.email} onClick={() => setSelected(u.email)} style={{ cursor: 'pointer' }}>
                    <Cell state={cellState} style={COLS.email}>{u.email}</Cell>
                    <Cell state={cellState} style={COLS.login}>{u.lastLogin}</Cell>
                    <Cell state={cellState} style={{ ...COLS.actions, justifyContent: 'flex-end' }}>
                      <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        <ButtonIcon
                          variant="tertiary"
                          size="s"
                          label={`More actions for ${u.email}`}
                          onClick={() => { setSelected(u.email); setActionsFor((a) => (a === u.email ? null : u.email)); }}
                          icon={<Icon size="s" tone="inherit"><glyphs.MoreVertical /></Icon>}
                        />
                        {actionsFor === u.email && (
                          <div style={{ position: 'absolute', right: 0, bottom: '100%', zIndex: zIndex.overlay }}>
                            <RowActionToolbar
                              label={`Row actions for ${u.email}`}
                              onClose={() => setActionsFor(null)}
                              actions={[
                                { label: 'Edit user', icon: <Icon size="s" tone="inherit"><glyphs.Edit /></Icon>, onClick: () => setActionsFor(null) },
                                { label: 'Resend invite', icon: <Icon size="s" tone="inherit"><glyphs.Mail /></Icon>, onClick: () => setActionsFor(null) },
                                { label: 'Delete user', destructive: true, icon: <Icon size="s" tone="inherit"><glyphs.Trash /></Icon>, onClick: () => { setDeleting(u.email); setActionsFor(null); } },
                              ]}
                            />
                          </div>
                        )}
                      </div>
                    </Cell>
                  </Row>
                );
              })}
            </DataGrid>
            {visible.length === 0 && <Text step="s" tone="secondary">No users match “{filter}”.</Text>}
          </section>
        </div>
      </PageBody>
      <ConfirmationDialog
        open={deleting !== null}
        destructive
        title="Delete this user?"
        confirmLabel="Delete user"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          setUsers((list) => list.filter((u) => u.email !== deleting));
          if (selected === deleting) setSelected(users[0]!.email);
          setDeleting(null);
        }}
      >
        {deleting} loses access to every fund and company immediately. This can’t be undone.
      </ConfirmationDialog>
    </AppFrame>
  );
}
