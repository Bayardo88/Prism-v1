/**
 * Chrome shared by Company · Documents and Company · Questions: the sub-nav
 * (Documents / Questions) and the request heading (title, progress ring,
 * request counts, "New Info Request" and the page ⋮ menu).
 */
import { useCallback, useRef, useState } from 'react';
import {
  Button, ButtonIcon, ContextMenu, Heading, Icon, MenuItem, ProgressRing, TertiaryMenuItem, Text,
  glyphs, space, zIndex,
} from '@scalar/design-system';
import { href, navigate } from '../../router.js';
import { routes } from '../../routes.js';
import { useDismiss } from '../p04-waterfalls/useDismiss.js';

export function DocumentsSubNav({ companyId, current }: { companyId: string; current: 'documents' | 'questions' }) {
  return (
    <>
      <TertiaryMenuItem current={current === 'documents'} href={href(routes.company.documents(companyId))}>Documents</TertiaryMenuItem>
      <TertiaryMenuItem current={current === 'questions'} href={href(routes.company.questions(companyId))}>Questions</TertiaryMenuItem>
    </>
  );
}

export function CompanyActionsButton() {
  return <ButtonIcon variant="tertiary" size="s" label="Company actions" icon={<Icon size="s" tone="inherit"><glyphs.MoreVertical /></Icon>} />;
}

export function RequestsHeading({ companyId, title, counts, menuOpen: initialMenu = false }: {
  companyId: string;
  title: string;
  /** e.g. "Requests: 0 sent, 0 uploaded, 0 pending". */
  counts: { done: number; total: number; text: string; label: string };
  menuOpen?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(initialMenu);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setMenuOpen(false), []);
  useDismiss(ref, menuOpen, close);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: space.m }}>
      <Heading level={2} step="2xl">{title}</Heading>
      <ProgressRing value={counts.done} max={counts.total} label={counts.label} />
      <Text step="m" tone="secondary">{counts.text}</Text>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: space.s, position: 'relative' }}>
        {/* Starts a task (the request editor), so it is an action, not a link. */}
        <Button
          variant="primary"
          leadingIcon={<Icon size="s" tone="inherit"><glyphs.Mail /></Icon>}
          onClick={() => navigate(routes.company.informationRequest(companyId))}
        >
          New Info Request
        </Button>
        <span data-popover-trigger="">
          <ButtonIcon
            variant="tertiary"
            label={`${title} page actions`}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            icon={<Icon size="s" tone="inherit"><glyphs.MoreVertical /></Icon>}
          />
        </span>
        {menuOpen && (
          <div ref={ref} style={{ position: 'absolute', top: '100%', right: 0, zIndex: zIndex.overlay }}>
            <ContextMenu label={`${title} page actions`}>
              <MenuItem
                icon={<Icon size="s" tone="inherit"><glyphs.Edit /></Icon>}
                href={href(routes.company.informationRequest(companyId))}
              >
                Edit Company Questions and Documents
              </MenuItem>
            </ContextMenu>
          </div>
        )}
      </div>
    </div>
  );
}
