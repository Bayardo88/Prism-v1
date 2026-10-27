/**
 * The trailing "add column" header of a grid, on the platform's one column
 * header: `ColumnHeader kind="action-button"` (Figma Header · Style = Action
 * Button). The + button is the control; it opens a picker or menu, so it
 * reports `aria-haspopup` / `aria-expanded`. The `action` rule shows while
 * that picker is open.
 */
import { ButtonIcon, ColumnHeader, Icon, icons } from '@scalar/design-system';

export interface AddColumnProps {
  /** Visible label, also the button's accessible name ("Add Column"). */
  label: string;
  onClick: () => void;
  /** The picker or menu it opens is showing. */
  open?: boolean;
  /** What the button opens. Default `dialog`. */
  popup?: 'dialog' | 'menu';
}

export function AddColumn({ label, onClick, open = false, popup = 'dialog' }: AddColumnProps) {
  return (
    <ColumnHeader
      kind="action-button"
      input
      action={open}
      actions={
        <ButtonIcon
          variant="tertiary"
          size="xs"
          label={label}
          aria-haspopup={popup}
          aria-expanded={open}
          onClick={onClick}
          icon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}
        />
      }
    >
      {label}
    </ColumnHeader>
  );
}
