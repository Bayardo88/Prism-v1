/**
 * An input cell in a financial grid: a blue `GridValueCell` holding an
 * `InlineEdit` (click or Enter to edit, Enter / blur commits, Escape cancels).
 * An error puts the cell in its error state with the reason spoken (R8).
 * Read-only (auditor view) shows the value without the editor.
 */
import { GridValueCell, InlineEdit } from '@scalar/design-system';

export interface EditCellProps {
  /** Accessible name of the editor ("Shares of Series A"). */
  label: string;
  /** The value as displayed; empty for a blank cell. */
  value: string;
  onCommit: (text: string) => void;
  placeholder?: string;
  /** Shown when set: the cell turns to its error state (R8). */
  error?: string | null;
  readOnly?: boolean;
}

export function EditCell({ label, value, onCommit, placeholder = 'Enter data', error, readOnly }: EditCellProps) {
  return (
    <GridValueCell kind="editable" state={error ? 'error' : 'default'} errorMessage={error ?? undefined}>
      <InlineEdit label={label} placeholder={placeholder} value={value} onCommit={onCommit} readOnly={readOnly} invalid={Boolean(error)} />
    </GridValueCell>
  );
}
