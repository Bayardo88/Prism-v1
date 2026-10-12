import { forwardRef, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { Avatar } from '../avatar/Avatar.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Card } from '../card/Card.js';
import { Chip } from '../chip/Chip.js';
import { Link } from '../core/Link.js';
import { Selector } from '../header/Controls.js';
import { Icon } from '../icon/Icon.js';
import * as m from '../icon/material.js';

/** One figure in the totals row ("NET", "$12,000.00"). */
export interface DealTotal {
  label: string;
  value: ReactNode;
}

/** The person who owns the deal. */
export interface DealOwner {
  name: string;
  /** Avatar fallback. Default: the first letter of the first two words of `name`. */
  initials?: string;
  avatarSrc?: string;
  /** Their role on the deal ("Engagement Manager"), shown as a Chip. */
  role?: ReactNode;
}

export interface DealCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The deal's name. */
  title: ReactNode;
  /** The title's heading level. Default 3. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** The deal's current stage. With `onStageClick` it is a menu trigger (the screen owns the menu). */
  stage?: ReactNode;
  onStageClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** The stage menu is open: drives `aria-expanded`. */
  stageExpanded?: boolean;
  /** Spoken before a string `stage`. Default "Deal stage". */
  stageLabel?: string;
  /** The company the deal is for; a link with `companyHref`. */
  company?: ReactNode;
  companyHref?: string;
  /** A one-line note about the deal ("Renewal due in 30 days"). */
  notice?: ReactNode;
  /** The contract name; a link with `contractHref`. */
  contract?: ReactNode;
  contractHref?: string;
  /** Spoken before the contract. Default "Contract". */
  contractLabel?: string;
  /** Figures in label / value pairs (NET, DUE). */
  totals?: DealTotal[];
  owner?: DealOwner;
  /** Adds the edit button to the owner row. */
  onEditOwner?: () => void;
  /** Accessible name of the edit button. Default "Change owner". */
  editOwnerLabel?: string;
  /** Actions at the foot of the card ("Send final invoice"). */
  actions?: ReactNode;
}

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/**
 * Deal Card — the deal behind a Workboard item: title and stage, the company,
 * a notice, the contract, the NET / DUE figures and the owner. Prop-driven:
 * every value comes from the screen.
 *
 * Composition: `Card` (named region, title heading) › `Selector` (stage,
 * `surface`) · `Link` (company, contract) · `Chip` (owner role) · `Avatar` ·
 * `ButtonIcon` (edit owner). Totals are a description list.
 *
 * Tokens: Background/Surface + Stroke/Default (the Card), Text/Secondary for the
 * notice and figure labels, Text/Primary semibold for the figures.
 */
export const DealCard = forwardRef<HTMLElement, DealCardProps>(function DealCard(
  {
    title, headingLevel = 3, stage, onStageClick, stageExpanded, stageLabel = 'Deal stage', company, companyHref,
    notice, contract, contractHref, contractLabel = 'Contract', totals, owner, onEditOwner,
    editOwnerLabel = 'Change owner', actions, className, ...rest
  },
  ref,
) {
  // A stage that cannot be changed is a fact about the deal (Chip), not a dead button.
  const stageControl = stage === undefined ? undefined : onStageClick ? (
    <Selector
      surface="surface"
      value={stage}
      onClick={onStageClick}
      expanded={Boolean(stageExpanded)}
      aria-label={typeof stage === 'string' ? `${stageLabel}: ${stage}` : undefined}
      className="scalar-deal-card__stage"
    />
  ) : (
    <Chip styleVariant="default" className="scalar-deal-card__stage"><VisuallyHidden>{stageLabel}: </VisuallyHidden>{stage}</Chip>
  );

  return (
    <Card
      ref={ref}
      title={title}
      headingLevel={headingLevel}
      tag={stageControl}
      className={cx('scalar-deal-card', className)}
      {...rest}
    >
      {company !== undefined && (
        <p className="scalar-deal-card__company">
          {companyHref ? <Link href={companyHref} size="m">{company}</Link> : company}
        </p>
      )}
      {notice !== undefined && <p className="scalar-deal-card__notice">{notice}</p>}
      {contract !== undefined && (
        <p className="scalar-deal-card__contract">
          <Icon size="s" tone="secondary"><m.Description /></Icon>
          <VisuallyHidden>{contractLabel}: </VisuallyHidden>
          {contractHref ? <Link href={contractHref} size="m">{contract}</Link> : contract}
        </p>
      )}
      {totals && totals.length > 0 && (
        <dl className="scalar-deal-card__totals">
          {totals.map((t) => (
            <div key={t.label} className="scalar-deal-card__total">
              <dt>{t.label}:</dt>
              <dd>{t.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {owner && (
        <div className="scalar-deal-card__owner">
          {owner.role !== undefined && (
            <Chip styleVariant="info" leadingIcon={<Icon size="xs" tone="inherit"><m.Person /></Icon>}>{owner.role}</Chip>
          )}
          <span className="scalar-deal-card__person">
            {/* Decorative: the name beside it is the accessible text. */}
            <Avatar size="xs" src={owner.avatarSrc} initials={owner.initials ?? initialsOf(owner.name)} aria-hidden role={undefined} aria-label={undefined} />
            <span className="scalar-deal-card__name">{owner.name}</span>
          </span>
          {onEditOwner && (
            <ButtonIcon
              variant="tertiary"
              size="s"
              label={editOwnerLabel}
              icon={<Icon size="s" tone="inherit"><m.Edit /></Icon>}
              onClick={onEditOwner}
              className="scalar-deal-card__edit"
            />
          )}
        </div>
      )}
      {actions && <div className="scalar-deal-card__actions">{actions}</div>}
    </Card>
  );
});
