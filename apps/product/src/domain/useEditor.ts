/**
 * The edit cycle every product editor follows (domain-logic.md §5, P7, P9):
 *
 *   viewing → (edit) dirty → (Save) validationError | saving → saved
 *
 *   const ed = useEditor(() => rowsFor(company), { validate: issuesOf });
 *   ed.update((rows) => …);          // marks the page dirty
 *   ed.save();                       // validates first; errors stay on screen
 *   <ToolbarSave state={ed.saveState} onClick={ed.save} />
 *   {ed.showErrors && ed.issues.length > 0 && <Banner tone="negative" issues={ed.issues} … />}
 *   {ed.guard.dialog}
 *
 * Validation reports, it never corrects. Saving is simulated (the prototype has
 * no server) but still goes through `saving` before `saved`, so the screen only
 * ever claims what has been acknowledged.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { BannerIssue, SaveStateValue } from '@scalar/design-system';
import { useDirtyGuard, type DirtyGuard, type DirtyGuardOptions } from './useDirtyGuard.js';

export interface EditorOptions<T> {
  /** Every problem with the current data, in words. Empty when it can be saved. */
  validate?: (data: T) => BannerIssue[];
  /** Start dirty (Figma states drawn mid-edit). */
  initiallyDirty?: boolean;
  /** Read-only: edits are ignored and Save is off (auditor view). */
  readOnly?: boolean;
  guard?: Omit<DirtyGuardOptions, 'onDiscard'>;
}

export interface Editor<T> {
  data: T;
  update: (fn: (cur: T) => T) => void;
  dirty: boolean;
  saveState: SaveStateValue;
  issues: BannerIssue[];
  /** Errors are shown once Save has been tried, and stay until fixed. */
  showErrors: boolean;
  save: () => boolean;
  guard: DirtyGuard;
}

const SAVE_DELAY = 350;

export function useEditor<T>(initial: () => T, opts: EditorOptions<T> = {}): Editor<T> {
  const [data, setData] = useState<T>(initial);
  const [dirty, setDirty] = useState(Boolean(opts.initiallyDirty));
  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const { validate } = opts;
  const issues = useMemo(() => validate?.(data) ?? [], [data, validate]);
  const guard = useDirtyGuard(dirty, { ...opts.guard, onDiscard: () => { setData(initial()); setDirty(false); } });

  const update = (fn: (cur: T) => T) => {
    if (opts.readOnly) return;
    setData(fn);
    setDirty(true);
    setSavedOnce(false);
  };

  const save = () => {
    if (opts.readOnly) return false;
    if (issues.length) { setShowErrors(true); return false; }
    setShowErrors(false);
    setSaving(true);
    timer.current = window.setTimeout(() => { setSaving(false); setDirty(false); setSavedOnce(true); }, SAVE_DELAY);
    return true;
  };

  const saveState: SaveStateValue = saving ? 'saving' : dirty ? 'unsaved' : savedOnce ? 'saved' : 'no-changes';
  return { data, update, dirty, saveState, issues, showErrors: showErrors && issues.length > 0, save, guard };
}
