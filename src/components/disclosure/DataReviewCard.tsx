import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Icon } from '../icon/Icon.js';
import { Check, Close, Document } from '../icon/glyphs.js';
import { Typography } from '../typography/Typography.js';

export interface DataReviewCardProps {
  title: ReactNode;
  /** The document the value came from. */
  sourceFile?: ReactNode;
  /** The sentence the value was extracted from. */
  quote?: ReactNode;
  /** Why the model believes the value. */
  rationale?: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  className?: string;
}

/**
 * Data Review Card — one model-extracted value waiting on a human decision.
 *
 * The card never asserts a value on its own: it shows what was extracted, the
 * document and sentence it came from, and why. Accept and reject live in the
 * title row so the decision is always one click from the evidence.
 *
 * Accept and reject are Secondary icon buttons: the system has no soft-filled
 * icon button, so positive and negative read as a coloured outline rather than
 * the green and red fills used elsewhere.
 */
export function DataReviewCard({
  title, sourceFile, quote, rationale, selected, onSelect, onAccept, onReject, className,
}: DataReviewCardProps) {
  return (
    <article
      className={cx('scalar-data-review-card', className)}
      aria-selected={selected}
      onClick={onSelect}
    >
      <header className="scalar-data-review-card__header">
        <Typography variant="text" step="m" weight="semiBold">
          {title}
        </Typography>
        <div className="scalar-data-review-card__actions">
          {onAccept && (
            <ButtonIcon
              variant="secondary"
              tone="positive"
              size="s"
              label="Accept"
              onClick={onAccept}
              icon={<Icon size="s" tone="inherit"><Check /></Icon>}
            />
          )}
          {onReject && (
            <ButtonIcon
              variant="secondary"
              tone="negative"
              size="s"
              label="Reject"
              onClick={onReject}
              icon={<Icon size="s" tone="inherit"><Close /></Icon>}
            />
          )}
        </div>
      </header>

      {sourceFile && (
        <span className="scalar-data-review-card__source">
          <Icon size="xs" tone="inherit"><Document /></Icon> {sourceFile}
        </span>
      )}
      {quote && <blockquote className="scalar-data-review-card__quote">{quote}</blockquote>}
      {rationale && (
        <Typography variant="text" step="s" tone="tertiary">
          {rationale}
        </Typography>
      )}
    </article>
  );
}
