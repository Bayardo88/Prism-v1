/**
 * The Notifications Center panel under the bell (Figma Notifications-center,
 * frames 79:1853 collapsed and 131:4940 with the filters open).
 *
 * A composition of DS parts on the `NotificationCenter` surface. The DS
 * component itself can't be used as is: its gear swaps the list out for the
 * settings and its body stops at 480px, while the frames keep the filters
 * above the list and run the list to the foot of the viewport (logged in
 * docs/product/pages/prototype-notifications-center.md › Gaps).
 *
 * Cards are a screen-local composition of DS parts (Icon, Typography, Chip,
 * Spinner, Link, ButtonIcon). The DS ships no notification item.
 */
import { createContext, useContext, useId, useState } from 'react';
import {
  AiOutline, ButtonIcon, Checkbox, Chip, EmptyState, Icon, Link, Spinner, Typography,
  color, glyphs, icons, radius, size, space,
} from '@scalar/design-system';
import { href } from '../../../router.js';
import { Popover } from '../../../shell/overlays/Popover.js';
import type { OverlayProps } from '../../../shell/overlays/index.js';
import {
  AI_TYPES, FILTER_OPTIONS, relativeTime, type AppNotification, type Filters, type NotificationType,
} from './data.js';

export interface NotificationsStore {
  visible: AppNotification[];
  total: number;
  filters: Filters;
  setFilters: (f: Filters) => void;
  dismiss: (id: string) => void;
}

export const NotificationsStoreContext = createContext<NotificationsStore | null>(null);

/** AI work carries the Scalar AI mark (Figma "Union"); everything else a Material glyph. */
const GLYPHS: Record<NotificationType, typeof icons.Description> = {
  'document_ai.processing': glyphs.AiMark,
  'document_ai.completed': glyphs.AiMark,
  'financial_mapping.completed': glyphs.AiMark,
  'documents.uploaded': icons.UploadFile,
  'bulk_rollover.completed': icons.EditCalendar,
  'bulk_action.completed': icons.ListAlt,
  'system.announcement': icons.Info,
  'table.updated': icons.TableRows,
};

export function NotificationCard({ n, onDismiss }: { n: AppNotification; onDismiss: () => void }) {
  const titleId = useId();
  const Glyph = GLYPHS[n.type];
  const ai = AI_TYPES.has(n.type);
  const activity = n.display === 'activity';
  // A new or running item is outlined in its family colour; read alerts get the container edge; activity is a quiet log.
  const edge = activity ? 'transparent' : !n.read || n.inProgress ? (ai ? color.stroke.ai : color.stroke.brand) : color.stroke.default;
  const who = n.actor && (n.actor.isYou ? 'You' : n.actor.name);
  // A running AI job wears the DS AI outline (its colours orbit) until it completes.
  const orbiting = !!n.inProgress && ai;

  const card = (
    <article
      aria-labelledby={titleId}
      style={{
        display: 'flex', flexDirection: 'column', gap: space.s, padding: space.m,
        borderRadius: radius.m,
        ...(!orbiting && { border: `1px solid ${edge}`, background: activity ? color.bg.subtle : color.bg.surface }),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: space.s }}>
        <Icon size="m" tone={ai ? 'ai' : 'secondary'}><Glyph /></Icon>
        <Typography variant="heading" step="s" weight="semiBold" as="h3" id={titleId} style={{ flex: 1, margin: 0 }}>
          {n.title}
        </Typography>
        {!n.inProgress && (
          <Typography variant="text" step="s" tone="tertiary" as="span">{relativeTime(n.minutesAgo)}</Typography>
        )}
        {n.display === 'alert' && (
          <ButtonIcon
            variant="tertiary"
            size="s"
            label={`Dismiss ${n.title}`}
            onClick={onDismiss}
            icon={<Icon size="s" tone="inherit"><icons.Close /></Icon>}
          />
        )}
      </div>

      {n.inProgress ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: space.s }}>
          <Chip size="s" styleVariant="ai">{n.body}</Chip>
          <Spinner size="s" label="In progress" />
        </div>
      ) : (
        <>
          <Typography variant="text" step="m" tone="secondary" as="p" style={{ margin: 0 }}>
            {activity && who && <Typography variant="text" step="m" weight="semiBold" tone="primary" as="span">{who} </Typography>}
            {n.body}
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: space.xs }}>
            {!n.read && <Chip size="s" styleVariant="info">New</Chip>}
            <Chip size="s">{n.priority === 'high' ? 'High priority' : 'Normal priority'}</Chip>
            <Typography variant="text" step="s" tone="secondary" as="span">· {n.context}</Typography>
          </div>
          {n.link && <Link size="s" href={href(n.link.href)}>{n.link.label}</Link>}
        </>
      )}
    </article>
  );
  return orbiting ? <AiOutline asChild>{card}</AiOutline> : card;
}

/** "Receive notifications for" — the gear opens the four checkboxes above the list (Figma 131:4946). */
function FilterSection({ store, open, onToggle }: { store: NotificationsStore; open: boolean; onToggle: () => void }) {
  const { filters, setFilters } = store;
  const headingId = useId();
  const optionsId = useId();
  return (
    <section
      aria-labelledby={headingId}
      style={{ padding: space.l, borderBottom: `1px solid ${color.stroke.divider}`, flex: 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: space.s }}>
        <Typography variant="heading" step="s" weight="semiBold" as="h3" id={headingId} style={{ flex: 1, margin: 0 }}>
          Receive notifications for
        </Typography>
        <ButtonIcon
          variant="secondary"
          size="s"
          label={open ? 'Close notification settings' : 'Notification settings'}
          aria-expanded={open}
          aria-controls={optionsId}
          onClick={onToggle}
          icon={<Icon size="s" tone="inherit">{open ? <icons.Close /> : <icons.Settings />}</Icon>}
        />
      </div>
      {open && (
        <div id={optionsId} style={{ display: 'flex', flexDirection: 'column', gap: space.s, paddingTop: space.s }}>
          {FILTER_OPTIONS.map((o) => (
            <Checkbox
              key={o.key}
              checked={filters[o.key]}
              onChange={(e) => setFilters({ ...filters, [o.key]: e.target.checked })}
            >
              {o.label}
            </Checkbox>
          ))}
        </div>
      )}
    </section>
  );
}

/** Replaces the global Notifications menu while the prototype is mounted. */
export function NotificationsPanel({ menu, onClose }: OverlayProps) {
  const store = useContext(NotificationsStoreContext)!;
  const titleId = useId();
  const [filtersOpen, setFiltersOpen] = useState(menu === 'notification-settings');
  return (
    <Popover onClose={onClose} placement={{ right: space.l }} label="Notifications">
      <div
        role="dialog"
        aria-labelledby={titleId}
        className="scalar-notification-center"
        // Runs to the foot of the viewport (Figma panel height), less the Primary Menu above it.
        style={{ display: 'flex', flexDirection: 'column', maxHeight: `calc(100vh - ${size.control.l} * 2)` }}
      >
        <div className="scalar-notification-center__header" style={{ flex: 'none' }}>
          <div className="scalar-notification-center__titles">
            <h2 id={titleId} className="scalar-notification-center__title">Notifications</h2>
            <div className="scalar-notification-center__scope">Temporary updates while you’re active</div>
          </div>
        </div>
        <FilterSection store={store} open={filtersOpen} onToggle={() => setFiltersOpen((o) => !o)} />
        <div
          aria-live="polite"
          style={{
            flex: '1 1 auto', minHeight: 0, overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: space.s, padding: space.l,
          }}
        >
          {store.visible.length === 0
            ? <EmptyState type="no-data" title="No notifications" body="You’re all caught up." />
            : store.visible.map((n) => <NotificationCard key={n.id} n={n} onDismiss={() => store.dismiss(n.id)} />)}
        </div>
      </div>
    </Popover>
  );
}
