import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import {
  ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, Close, Copy, Download, DragHandle, Edit, Expand, Folder,
  MoreVertical, Trash, ZoomOut,
} from '../icon/glyphs.js';
import * as m from '../icon/material.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Button } from '../button/Button.js';
import { CheckboxItem } from '../checkbox/CheckboxItem.js';
import type { FileKind } from '../../tokens/index.js';

/* ---------------------------------------------------------------------------
 * File Type Badge
 * ------------------------------------------------------------------------ */


const EXT_KIND: Record<string, FileKind> = {
  pdf: 'pdf', doc: 'word', docx: 'word', xls: 'sheet', xlsx: 'sheet', csv: 'sheet',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', svg: 'image', txt: 'text', md: 'text',
};

/** Maps a file name or extension to its File/* token family. */
export const fileKindOf = (nameOrExt: string): FileKind =>
  EXT_KIND[nameOrExt.split('.').pop()?.toLowerCase() ?? ''] ?? 'generic';

export interface FileTypeBadgeProps {
  /** File name or extension ("report.pdf", "xlsx"). */
  file: string;
  className?: string;
}

/**
 * File Type Badge — colour-coded extension. Bound to the File/* family:
 * colour identifies a format, never a status. The extension text is always
 * shown — colour alone is not enough (R8).
 */
export function FileTypeBadge({ file, className }: FileTypeBadgeProps) {
  const ext = (file.split('.').pop() ?? '').toLowerCase();
  const kind = fileKindOf(file);
  const text = EXT_KIND[ext] ? ext.toUpperCase() : 'FILE';
  return <span className={cx('scalar-file-badge', `scalar-file-badge--${kind}`, className)}>{text}</span>;
}

/* ---------------------------------------------------------------------------
 * File Row
 * ------------------------------------------------------------------------ */

export interface FileRowProps {
  name: string;
  /** Meta chips: uploader, date, linked area. */
  meta?: ReadonlyArray<{ icon?: ReactNode; label: ReactNode }>;
  selected?: boolean;
  /** Shows the bulk-selection checkbox. */
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Shows the drag handle (move between folders). */
  draggable?: boolean;
  onOpen?: () => void;
  onDownload?: () => void;
  /** Opens a Context Menu (Rename, Move, Link to…, Delete). */
  onMenu?: () => void;
  /** Glyph for the download action (default `download`), e.g. `icons.CloudDownload`. */
  downloadIcon?: ReactNode;
  className?: string;
}

/** File Row — one document in a file list or folder. */
export function FileRow({ name, meta, selected, checked, onCheckedChange, draggable, onOpen, onDownload, onMenu, downloadIcon, className }: FileRowProps) {
  return (
    <div role="row" aria-selected={selected || undefined} className={cx('scalar-file-row', selected && 'scalar-file-row--selected', className)}>
      {onCheckedChange && <CheckboxItem size="s" checked={!!checked} onChange={(e) => onCheckedChange(e.target.checked)} aria-label={`Select ${name}`} />}
      {draggable && <span className="scalar-file-row__drag" aria-hidden><Icon size="xs" tone="inherit"><DragHandle /></Icon></span>}
      <FileTypeBadge file={name} />
      <button type="button" className="scalar-file-row__main" onClick={onOpen}>
        <span className="scalar-file-row__name">{name}</span>
        {meta && (
          <span className="scalar-file-row__meta">
            {meta.map((m, i) => <span key={i} className="scalar-file-row__chip">{m.icon}{m.label}</span>)}
          </span>
        )}
      </button>
      {onDownload && <ButtonIcon variant="tertiary" size="s" label={`Download ${name}`} onClick={onDownload} icon={<Icon size="s" tone="inherit">{downloadIcon ?? <Download />}</Icon>} />}
      {onMenu && <ButtonIcon variant="tertiary" size="s" label={`${name} options`} onClick={onMenu} icon={<Icon size="s" tone="inherit"><MoreVertical /></Icon>} />}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Tree Item
 * ------------------------------------------------------------------------ */

export interface TreeItemProps {
  children: ReactNode;
  type: 'folder' | 'file';
  /** 0-based depth; sets the indent. */
  level?: number;
  /** Folders only. */
  expanded?: boolean;
  onToggle?: () => void;
  /** Folders only — document count shown after the name. */
  count?: ReactNode;
  /** Files only — the file name for the badge. */
  fileName?: string;
  selected?: boolean;
  onSelect?: () => void;
  /** Folders only — replaces the folder glyph, e.g. `icons.Domain` for a company node. */
  icon?: ReactNode;
  className?: string;
}

/**
 * Tree Item — row of a folder/file tree (Documents: measurement date →
 * company → subfolder → file). Render inside an element with `role="tree"`.
 */
export function TreeItem({ children, type, level = 0, expanded, onToggle, count, fileName, selected, onSelect, icon, className }: TreeItemProps) {
  return (
    <div
      role="treeitem"
      aria-level={level + 1}
      aria-expanded={type === 'folder' ? !!expanded : undefined}
      aria-selected={selected || undefined}
      className={cx('scalar-tree-item', `scalar-tree-item--l${Math.min(level, 3)}`, selected && 'scalar-tree-item--selected', className)}
    >
      {type === 'folder' ? (
        <button type="button" className="scalar-tree-item__toggle" aria-label={expanded ? 'Collapse' : 'Expand'} onClick={onToggle}>
          <Icon size="s" tone="inherit">{expanded ? <ChevronDown /> : <ChevronRight />}</Icon>
        </button>
      ) : (
        <span className="scalar-tree-item__spacer" aria-hidden />
      )}
      {type === 'folder' ? <Icon size="s" tone="brand">{icon ?? <Folder />}</Icon> : <FileTypeBadge file={fileName ?? String(children)} />}
      <button type="button" className="scalar-tree-item__label" onClick={type === 'folder' ? onToggle : onSelect}>{children}</button>
      {type === 'folder' && count != null && <span className="scalar-tree-item__count">{count}</span>}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Viewer chrome
 * ------------------------------------------------------------------------ */

export interface PageStepperProps {
  page: number;
  total: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Page Stepper — page navigation for a paged document. Typing a number + Enter jumps. */
export function PageStepper({ page, total, onChange, className }: PageStepperProps) {
  const go = (n: number) => onChange(Math.min(total, Math.max(1, n)));
  return (
    <div className={cx('scalar-page-stepper', className)}>
      <ButtonIcon variant="tertiary" size="s" label="Previous page" disabled={page <= 1} onClick={() => go(page - 1)} icon={<Icon size="s" tone="inherit"><ChevronLeft /></Icon>} />
      <input
        className="scalar-page-stepper__input"
        aria-label={`Page, of ${total}`}
        inputMode="numeric"
        defaultValue={page}
        key={page}
        onKeyDown={(e) => { if (e.key === 'Enter') go(Number((e.target as HTMLInputElement).value) || page); }}
      />
      <span className="scalar-page-stepper__total">/ {total}</span>
      <ButtonIcon variant="tertiary" size="s" label="Next page" disabled={page >= total} onClick={() => go(page + 1)} icon={<Icon size="s" tone="inherit"><ChevronRight /></Icon>} />
    </div>
  );
}

export interface ZoomControlProps {
  /** Percent. */
  value: number;
  onChange: (value: number) => void;
  onFit?: () => void;
  steps?: readonly number[];
  className?: string;
}

/** Zoom Control — zoom out / level / zoom in / Fit (Material `zoom_in`, `fit_screen`). */
export function ZoomControl({ value, onChange, onFit, steps = [50, 75, 100, 125, 150, 200], className }: ZoomControlProps) {
  const next = steps.find((s) => s > value);
  const prev = [...steps].reverse().find((s) => s < value);
  return (
    <div className={cx('scalar-zoom', className)}>
      <ButtonIcon variant="tertiary" size="s" label="Zoom out" disabled={prev == null} onClick={() => prev != null && onChange(prev)} icon={<Icon size="s" tone="inherit"><ZoomOut /></Icon>} />
      <span className="scalar-zoom__value" aria-live="polite">{value}%</span>
      <ButtonIcon variant="tertiary" size="s" label="Zoom in" disabled={next == null} onClick={() => next != null && onChange(next)} icon={<Icon size="s" tone="inherit"><m.ZoomIn /></Icon>} />
      {onFit && <><span className="scalar-zoom__sep" aria-hidden /><Button variant="tertiary" size="s" leadingIcon={<Icon size="s" tone="inherit"><m.FitScreen /></Icon>} onClick={onFit}>Fit</Button></>}
    </div>
  );
}

export interface DocumentViewerHeaderProps {
  fileName: string;
  meta?: ReactNode;
  onDownload?: () => void;
  onCopyLink?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onExpand?: () => void;
  onClose?: () => void;
  className?: string;
}

/**
 * Document Viewer Header — file badge, name and meta, then file actions
 * (Download, Copy link, Rename, Delete — negative) and pane actions (Expand,
 * Close). Only the actions you pass are rendered.
 */
export function DocumentViewerHeader({ fileName, meta, onDownload, onCopyLink, onRename, onDelete, onExpand, onClose, className }: DocumentViewerHeaderProps) {
  const act = (label: string, glyph: ReactNode, fn?: () => void, tone: 'main' | 'negative' = 'main') =>
    fn && <ButtonIcon variant="tertiary" tone={tone} size="s" label={label} onClick={fn} icon={<Icon size="s" tone="inherit">{glyph}</Icon>} />;
  return (
    <div className={cx('scalar-viewer-header', className)}>
      <FileTypeBadge file={fileName} />
      <div className="scalar-viewer-header__text">
        <div className="scalar-viewer-header__name">{fileName}</div>
        {meta && <div className="scalar-viewer-header__meta">{meta}</div>}
      </div>
      {act('Download', <Download />, onDownload)}
      {act('Copy link', <Copy />, onCopyLink)}
      {act('Rename', <Edit />, onRename)}
      {act('Delete', <Trash />, onDelete, 'negative')}
      {(onExpand || onClose) && <span className="scalar-viewer-header__sep" aria-hidden />}
      {act('Expand', <Expand />, onExpand)}
      {act('Close', <Close />, onClose)}
    </div>
  );
}

export interface ScrollHintPillProps {
  children: ReactNode;
  direction?: 'down' | 'up';
  onClick?: () => void;
  className?: string;
}

/** Scroll Hint Pill — how much of a long list is out of view ("↓ 17 companies"). */
export function ScrollHintPill({ children, direction = 'down', onClick, className }: ScrollHintPillProps) {
  return (
    <button type="button" onClick={onClick} className={cx('scalar-scroll-hint', className)}>
      <Icon size="xs" tone="inherit">{direction === 'down' ? <ArrowDown /> : <ArrowUp />}</Icon>
      {children}
    </button>
  );
}
