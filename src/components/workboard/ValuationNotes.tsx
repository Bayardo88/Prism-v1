import { forwardRef, useId, type HTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';
import { Avatar } from '../avatar/Avatar.js';
import { RichTextToolbar, type RichTextFormat } from '../admin/Admin.js';
import { Button } from '../button/Button.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Icon } from '../icon/Icon.js';
import * as m from '../icon/material.js';
import { initialsOf } from './Assignees.js';

/* ---------------------------------------------------------------------------
 * Note Card
 * ------------------------------------------------------------------------ */

export interface NoteCardProps extends HTMLAttributes<HTMLElement> {
  /** Who wrote it. */
  author: string;
  initials?: string;
  /** When, as shown ("Sep 18, 2025 12:11 PM"). */
  timestamp: ReactNode;
  /** Machine-readable `datetime` for the `<time>` element. */
  dateTime?: string;
  /** The note. */
  children: ReactNode;
  /** Adds the delete button. */
  onDelete?: () => void;
  /** Accessible name of the delete button. Default "Delete note by {author}". */
  deleteLabel?: string;
}

/**
 * Note Card — one note on a valuation: author, when, delete, and the text.
 * Figma: workboard "Notes Content Container" (536:24061).
 *
 * Tokens: Stroke/Default edge, Radius/XS, Space/L padding; author Text/L
 * semibold in Text/Secondary, time Text/S light; body Text/L in Text/Primary;
 * the author mark outlined Text/Brand at Sizing/Avatar/XS.
 *
 * Accessibility: an `article` named by its author; the time is a `<time>`; the
 * delete button is named for the note's author.
 */
export const NoteCard = forwardRef<HTMLElement, NoteCardProps>(function NoteCard(
  { author, initials, timestamp, dateTime, children, onDelete, deleteLabel, className, ...rest },
  ref,
) {
  const authorId = useId();
  return (
    <article ref={ref} aria-labelledby={authorId} className={cx('scalar-note', className)} {...rest}>
      <header className="scalar-note__head">
        <Avatar
          size="xs"
          initials={initials ?? initialsOf(author)}
          className="scalar-assignees__mark scalar-note__mark"
          aria-hidden
          role={undefined}
          aria-label={undefined}
        />
        <span id={authorId} className="scalar-note__author">{author}</span>
        <time className="scalar-note__time" dateTime={dateTime}>{timestamp}</time>
        {onDelete && (
          <ButtonIcon
            variant="tertiary"
            size="xs"
            label={deleteLabel ?? `Delete note by ${author}`}
            icon={<Icon size="s" tone="inherit"><m.Delete /></Icon>}
            onClick={onDelete}
            className="scalar-note__delete"
          />
        )}
      </header>
      <div className="scalar-note__body">{children}</div>
    </article>
  );
});

/* ---------------------------------------------------------------------------
 * Note Composer
 * ------------------------------------------------------------------------ */

export interface NoteComposerProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> {
  /** Formats currently on (pressed toolbar buttons). */
  activeFormats?: readonly RichTextFormat[];
  /** A toolbar button was pressed. Omit to hide the toolbar. */
  onToggleFormat?: (format: RichTextFormat) => void;
  /** Toolbar buttons. Default bold · italic · underline · bulleted · numbered. */
  formats?: readonly RichTextFormat[];
  /** Adds the Save button under the box. */
  onSave?: () => void;
  saveLabel?: string;
  /** Lands on the wrapper; `className` lands on the `<textarea>`. */
  wrapperClassName?: string;
}

const COMPOSER_FORMATS: readonly RichTextFormat[] = ['bold', 'italic', 'underline', 'list', 'numbered'];

/**
 * Note Composer — the formatting bar over a note box, and Save. Figma: workboard
 * "Note Input Tools Container" (536:24080) and its Save button (536:24089).
 *
 * Composition: `RichTextToolbar` (APG toolbar) over a native `<textarea>`;
 * Save is a primary `Button`.
 *
 * Tokens: the bar Background/Subtle, the box Stroke/Control (it is typable,
 * R5), Radius/S; text Text/L, placeholder Text/Tertiary.
 *
 * Accessibility: the textarea needs a name — pass `aria-label` (default "Add
 * note") or `aria-labelledby`. `ref` lands on the `<textarea>`.
 */
export const NoteComposer = forwardRef<HTMLTextAreaElement, NoteComposerProps>(function NoteComposer(
  {
    activeFormats, onToggleFormat, formats = COMPOSER_FORMATS, onSave, saveLabel = 'Save', wrapperClassName, className,
    placeholder = 'Add note...', rows = 2, ...rest
  },
  ref,
) {
  return (
    <div className={cx('scalar-note-composer', wrapperClassName)}>
      <div className="scalar-note-composer__box">
        {onToggleFormat && (
          <RichTextToolbar
            formats={formats}
            active={activeFormats}
            onToggle={onToggleFormat}
            className="scalar-note-composer__toolbar"
          />
        )}
        <textarea
          ref={ref}
          rows={rows}
          placeholder={placeholder}
          aria-label={rest['aria-labelledby'] ? undefined : (rest['aria-label'] ?? 'Add note')}
          className={cx('scalar-note-composer__input', className)}
          {...rest}
        />
      </div>
      {onSave && (
        <Button variant="primary" size="m" onClick={onSave} className="scalar-note-composer__save">{saveLabel}</Button>
      )}
    </div>
  );
});
