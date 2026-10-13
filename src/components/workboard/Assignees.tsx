import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { Avatar } from '../avatar/Avatar.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Chip } from '../chip/Chip.js';
import { Icon } from '../icon/Icon.js';
import * as m from '../icon/material.js';

/** A person who can be put on a valuation or a workflow step. */
export interface Assignee {
  id: string;
  name: string;
  /** Avatar fallback. Default: the first letter of the first two words of `name`. */
  initials?: string;
}

/** First letter of the first two words, uppercased ("James Hemingway" → "JH"). */
export const initialsOf = (name: string): string =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/* ---------------------------------------------------------------------------
 * Assignee Avatars
 * ------------------------------------------------------------------------ */

/** The ink the outlined marks take: `brand` on a light surface, `onBrand` on a filled brand control. */
export type AssigneeAvatarsTone = 'brand' | 'onBrand';

export interface AssigneeAvatarsProps extends HTMLAttributes<HTMLSpanElement> {
  people: readonly Assignee[];
  /** Marks drawn before the rest fold into "+N". Default 2. */
  max?: number;
  tone?: AssigneeAvatarsTone;
  /** Spoken before the names. Default "Assigned". */
  label?: string;
}

/**
 * Assignee Avatars — who is on a step, as outlined initials. Up to `max` people
 * show in full; past that the first `max - 1` show and the rest fold into a
 * "+N" mark. Figma: workboard `Modal Status Dropdown` (538:29694) and the
 * Status trigger (536:23415).
 *
 * Tokens: Sizing/Avatar/XS; the ring and initials are Text/Brand (or Text/On
 * Brand on a filled control).
 *
 * Accessibility: the marks are decorative; every name is read once from hidden
 * text ("Assigned: John Lennon, Janis Joplin"), so a folded "+4" never hides
 * who they are (R8).
 */
export const AssigneeAvatars = forwardRef<HTMLSpanElement, AssigneeAvatarsProps>(function AssigneeAvatars(
  { people, max = 2, tone = 'brand', label = 'Assigned', className, ...rest },
  ref,
) {
  const folds = people.length > max;
  const shown = folds ? people.slice(0, Math.max(0, max - 1)) : people;
  const hidden = people.length - shown.length;
  return (
    <span ref={ref} className={cx('scalar-assignees', `scalar-assignees--${tone}`, className)} {...rest}>
      {shown.map((p) => (
        <Avatar
          key={p.id}
          size="xs"
          initials={p.initials ?? initialsOf(p.name)}
          className="scalar-assignees__mark"
          aria-hidden
          role={undefined}
          aria-label={undefined}
        />
      ))}
      {folds && <span className="scalar-avatar scalar-avatar--xs scalar-assignees__mark" aria-hidden>+{hidden}</span>}
      <VisuallyHidden>{`${label}: ${people.map((p) => p.name).join(', ')}`}</VisuallyHidden>
    </span>
  );
});

/* ---------------------------------------------------------------------------
 * Assignee Card
 * ------------------------------------------------------------------------ */

/**
 * How much the card stands out. `lead` the engagement's owner (filled brand),
 * `outline` a lead on the work (brand edge), `default` everyone else, `muted`
 * a person on a side panel, `inverse` the client's primary contact.
 */
export type AssigneeCardEmphasis = 'lead' | 'outline' | 'default' | 'muted' | 'inverse';

export interface AssigneeCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** The role the person holds ("Engagement Manager"). Shown as a Chip. */
  roleLabel: string;
  /** Who holds it. */
  name: string;
  initials?: string;
  emphasis?: AssigneeCardEmphasis;
  /** Adds the edit button. */
  onEdit?: () => void;
  /** Accessible name of the edit button. Default "Change {role}". */
  editLabel?: string;
  /**
   * Where the edit button sits: beside the role (`header`, default) or beside
   * the name (`person`) — the latter when `children` fill the header area.
   */
  editPlacement?: 'header' | 'person';
  /** Extra controls under the role (the Primary Contact's Notes button). */
  children?: ReactNode;
}

/**
 * Assignee Card — one person on a valuation: their role, an edit button and who
 * they are. The Valuation modal's people row and its side-panel tiles
 * (Primary Contact, Sales Rep, Preparer, Reviewer). Figma: workboard
 * "Valuation Lead" frames (536:23901 · 536:23991 · 536:24037).
 *
 * Tokens: `lead` Background/Brand + Text/On Brand, its edit button
 * Background/On Brand; `outline` Stroke/Brand; `default` Stroke/Subtle; `muted`
 * Background/Subtle; `inverse` Background/Inverse + Text/Inverse. The role is an
 * info `Chip`; the avatar is Sizing/Avatar/XS.
 *
 * Accessibility: a named group ("Valuation Lead: Jimmy Hendrix"). The avatar is
 * decorative beside the name. The edit button is named for the role, so five
 * of them on one row stay distinct.
 */
export const AssigneeCard = forwardRef<HTMLDivElement, AssigneeCardProps>(function AssigneeCard(
  {
    roleLabel, name, initials, emphasis = 'default', onEdit, editLabel, editPlacement = 'header', children, className,
    ...rest
  },
  ref,
) {
  const edit = onEdit && (
    <ButtonIcon
      variant="tertiary"
      size="xs"
      label={editLabel ?? `Change ${roleLabel.toLowerCase()}`}
      icon={<Icon size="s" tone="inherit"><m.Edit /></Icon>}
      onClick={onEdit}
      className="scalar-assignee-card__edit"
    />
  );
  return (
    <div
      {...rest}
      ref={ref}
      role="group"
      aria-label={rest['aria-label'] ?? `${roleLabel}: ${name}`}
      className={cx('scalar-assignee-card', `scalar-assignee-card--${emphasis}`, className)}
    >
      <div className="scalar-assignee-card__head">
        <div className="scalar-assignee-card__meta">
          {/* At the 12px floor a long role can outgrow a narrow card; the title keeps it readable. */}
          <Chip styleVariant="info" title={roleLabel} leadingIcon={<Icon size="xs" tone="inherit"><m.Person /></Icon>}>{roleLabel}</Chip>
          {children}
        </div>
        {editPlacement === 'header' && edit}
      </div>
      <div className="scalar-assignee-card__person">
        <Avatar
          size="xs"
          initials={initials ?? initialsOf(name)}
          className="scalar-assignees__mark"
          aria-hidden
          role={undefined}
          aria-label={undefined}
        />
        <span className="scalar-assignee-card__name">{name}</span>
        {editPlacement === 'person' && edit}
      </div>
    </div>
  );
});
