import {
  forwardRef, useEffect, useId, useRef, useState,
  type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode,
} from 'react';
import { cx } from '../../utils/cx.js';
import { useControllableState } from '../../utils/useControllableState.js';
import { useEvent } from '../../utils/useEvent.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { Button } from '../button/Button.js';
import { CheckboxItem } from '../checkbox/CheckboxItem.js';
import { Chip } from '../chip/Chip.js';
import { Icon } from '../icon/Icon.js';
import * as m from '../icon/material.js';
import { AssigneeAvatars, type Assignee } from './Assignees.js';

/* ---------------------------------------------------------------------------
 * Status Trigger
 * ------------------------------------------------------------------------ */

/** `s` for the modal header's Status (12px label), `l` for a panel's Model Status (16px). */
export type StatusTriggerSize = 's' | 'l';

export interface StatusTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** The status in force ("Client Docs Received"). */
  value: ReactNode;
  /** Spoken before the value. Default "Status". */
  label?: string;
  size?: StatusTriggerSize;
  /** People on the current status, drawn between the check and the value. */
  assignees?: readonly Assignee[];
  /** The status menu is open: drives `aria-expanded`. */
  expanded?: boolean;
  /** Stretch to the container's width. */
  fullWidth?: boolean;
}

/**
 * Status Trigger — the filled brand control that shows a valuation's status and
 * opens its step list. A trigger only: the screen owns the open state and
 * renders the `StepAssignMenu`. Figma: workboard Status "input" (536:23875,
 * 536:23415).
 *
 * Tokens: Background/Brand (+ Hover / Pressed) with Text/On Brand and
 * Icon/On Brand; `s` is Sizing/Control/S with Label/S, `l` Sizing/Control/M
 * with Text/L.
 *
 * Accessibility: a button with `aria-haspopup` and `aria-expanded`; its name is
 * "Status: Client Docs Received", plus who is on it.
 */
export const StatusTrigger = forwardRef<HTMLButtonElement, StatusTriggerProps>(function StatusTrigger(
  { value, label = 'Status', size = 's', assignees, expanded = false, fullWidth, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-haspopup="true"
      aria-expanded={expanded}
      className={cx('scalar-status-trigger', `scalar-status-trigger--${size}`, fullWidth && 'scalar-status-trigger--full', className)}
      {...rest}
    >
      <Icon size={size === 'l' ? 'm' : 's'} tone="inherit"><m.TaskAlt /></Icon>
      {/* Drawn before the value, read after it: "Status: Client Docs Received, assigned: …". */}
      {assignees && assignees.length > 0 && <AssigneeAvatars people={assignees} tone="onBrand" aria-hidden />}
      <span className="scalar-status-trigger__value">
        <VisuallyHidden>{label}:</VisuallyHidden>{' '}
        {value}
        {assignees && assignees.length > 0 && (
          <VisuallyHidden>{`, assigned: ${assignees.map((a) => a.name).join(', ')}`}</VisuallyHidden>
        )}
      </span>
      <Icon size={size === 'l' ? 'l' : 's'} tone="inherit" className="scalar-status-trigger__caret"><m.ArrowDropDown /></Icon>
    </button>
  );
});

/* ---------------------------------------------------------------------------
 * Step Assign Menu
 * ------------------------------------------------------------------------ */

export interface StepAssignStep {
  id: string;
  label: string;
  /** The step has been reached: checked mark and brand label. */
  done?: boolean;
  /** People on the step. Empty: the assign button shows instead. */
  assignees?: readonly Assignee[];
}

export interface StepAssignMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Accessible name of the list ("Model status"). */
  label: string;
  steps: readonly StepAssignStep[];
  /** Everyone who can be assigned, in display order. */
  people: readonly Assignee[];
  /** A step's label was pressed. Omit to make the labels read-only. */
  onSelectStep?: (id: string) => void;
  /** Save in a step's picker: the step and the ids now on it. */
  onAssign?: (stepId: string, personIds: string[]) => void;
  /** The step whose picker is open (controlled). `null` = none. */
  assigningStepId?: string | null;
  defaultAssigningStepId?: string | null;
  onAssigningStepChange?: (id: string | null) => void;
  /** `overlay` floats as a dropdown (Elevation/Overlay); `inline` sits flat inside a panel. Default `overlay`. */
  surface?: 'overlay' | 'inline';
  /** Picker placeholder. Default "Select User". */
  searchPlaceholder?: string;
  /** Picker save label. Default "Save". */
  saveLabel?: string;
  /**
   * Seeds the picker when it opens: suggested people (ids) in place of the
   * step's current ones, and a pre-typed filter.
   */
  pickerDefaults?: { chosen?: readonly string[]; query?: string };
}

const stepWords = { done: 'completed', open: 'not started' } as const;

interface PickerProps {
  step: StepAssignStep;
  people: readonly Assignee[];
  placeholder: string;
  saveLabel: string;
  onSave: (ids: string[]) => void;
  onCancel: () => void;
  defaults?: { chosen?: readonly string[]; query?: string };
  id: string;
}

/** The picker under a step: chosen people as removable chips, a filter, Save, then the checklist. */
function AssignPicker({ id, step, people, placeholder, saveLabel, onSave, onCancel, defaults }: PickerProps) {
  const [chosen, setChosen] = useState<string[]>(() => [...(defaults?.chosen ?? (step.assignees ?? []).map((a) => a.id))]);
  const [query, setQuery] = useState(defaults?.query ?? '');
  const listId = useId();
  const q = query.trim().toLowerCase();
  const visible = q ? people.filter((p) => p.name.toLowerCase().includes(q)) : people;
  const toggle = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  // Escape anywhere in the picker closes it before the key can reach the menu's owner.
  const rootRef = useRef<HTMLDivElement>(null);
  const cancel = useEvent(onCancel);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      cancel();
    };
    root.addEventListener('keydown', onKeyDown);
    return () => root.removeEventListener('keydown', onKeyDown);
  }, [cancel]);

  return (
    <div ref={rootRef} id={id} role="group" aria-label={`Assign people to ${step.label}`} className="scalar-step-assign__picker">
      <div className="scalar-step-assign__field">
        <Icon size="s" tone="secondary"><m.Person /></Icon>
        <span className="scalar-step-assign__chips">
          {chosen.map((id) => {
            const person = people.find((p) => p.id === id);
            return person ? (
              <Chip key={id} styleVariant="info" onRemove={() => toggle(id)} removeLabel={`Remove ${person.name}`}>
                {person.name}
              </Chip>
            ) : null;
          })}
          <input
            type="text"
            className="scalar-step-assign__search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={chosen.length === 0 ? placeholder : undefined}
            aria-label={`Find people to assign to ${step.label}`}
            aria-controls={listId}
            // The picker opens because the user asked to assign: put them in the filter.
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
        </span>
        <Button variant="primary" size="xs" onClick={() => onSave(chosen)}>{saveLabel}</Button>
      </div>
      <ul id={listId} className="scalar-step-assign__options" aria-label={`People for ${step.label}`}>
        {visible.map((p) => (
          <li key={p.id}>
            <label className="scalar-step-assign__option">
              <CheckboxItem size="s" checked={chosen.includes(p.id)} onChange={() => toggle(p.id)} />
              <span>{p.name}</span>
            </label>
          </li>
        ))}
        {visible.length === 0 && <li className="scalar-step-assign__empty">No one matches “{query}”</li>}
      </ul>
    </div>
  );
}

/**
 * Step Assign Menu — a valuation's workflow steps, each with the people on it.
 * Reached steps carry a checked mark and the brand label; every step ends in
 * its assignees, or an assign button when nobody is on it. The assign button
 * (or the avatars) opens a picker under the step: chosen people as removable
 * chips, a filter, Save, and a checklist of everyone. Figma: workboard
 * "Modal Status Dropdown" (538:29138 … 538:29764) and its inline use in the
 * Model panel (536:23422).
 *
 * Tokens: rows Background/Surface + Stroke/Subtle; reached steps Text/Brand +
 * Icon/Brand, the rest Text/Tertiary; the assign button Stroke/Control on
 * Background/Subtle; the picker field Stroke/Control; chips `info`; the menu
 * surface Elevation/Overlay (or flat when `inline`).
 *
 * Accessibility: a labelled group of steps. A step's state is in hidden words
 * (", completed"), never colour alone (R8). The assign button is named for its
 * step and reports `aria-expanded`; the picker's filter is focused on open and
 * Escape closes the picker, then the menu (`onKeyDown` bubbles to the owner).
 */
export const StepAssignMenu = forwardRef<HTMLDivElement, StepAssignMenuProps>(function StepAssignMenu(
  {
    label, steps, people, onSelectStep, onAssign, assigningStepId, defaultAssigningStepId = null, onAssigningStepChange,
    surface = 'overlay', searchPlaceholder = 'Select User', saveLabel = 'Save', pickerDefaults, className, ...rest
  },
  ref,
) {
  const [assigning, setAssigning] = useControllableState<string | null>(
    assigningStepId, defaultAssigningStepId, onAssigningStepChange,
  );
  const pickerId = useId();

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className={cx('scalar-step-assign', `scalar-step-assign--${surface}`, className)}
      {...rest}
    >
      {steps.map((step) => {
        const open = assigning === step.id;
        const has = (step.assignees?.length ?? 0) > 0;
        const words = step.done ? stepWords.done : stepWords.open;
        const mark = (
          <Icon size="s" tone="inherit" className="scalar-step-assign__mark">
            {step.done ? <m.CheckCircle /> : <m.RadioButtonUnchecked />}
          </Icon>
        );
        const body = (
          <>
            {mark}
            <span className="scalar-step-assign__label">{step.label}</span>
            <VisuallyHidden>, {words}</VisuallyHidden>
          </>
        );
        return (
          <div key={step.id} className="scalar-step-assign__group">
            <div className={cx('scalar-step-assign__row', step.done && 'scalar-step-assign__row--done')}>
              {onSelectStep ? (
                <button type="button" className="scalar-step-assign__step" onClick={() => onSelectStep(step.id)}>{body}</button>
              ) : (
                <span className="scalar-step-assign__step">{body}</span>
              )}
              <button
                type="button"
                className={cx('scalar-step-assign__assign', has && 'scalar-step-assign__assign--people')}
                aria-expanded={open}
                aria-controls={open ? `${pickerId}-${step.id}` : undefined}
                aria-label={
                  has
                    ? `Change people on ${step.label} (assigned: ${(step.assignees ?? []).map((a) => a.name).join(', ')})`
                    : `Assign people to ${step.label}`
                }
                onClick={() => setAssigning(open ? null : step.id)}
              >
                {has ? (
                  <AssigneeAvatars people={step.assignees ?? []} aria-hidden />
                ) : (
                  <>
                    <Icon size="s" tone="inherit"><m.Person /></Icon>
                    <span className="scalar-step-assign__plus"><Icon size="s" tone="inherit"><m.Add /></Icon></span>
                  </>
                )}
              </button>
            </div>
            {open && (
              <AssignPicker
                  id={`${pickerId}-${step.id}`}
                  step={step}
                  people={people}
                  placeholder={searchPlaceholder}
                  saveLabel={saveLabel}
                  onSave={(ids) => { onAssign?.(step.id, ids); setAssigning(null); }}
                  onCancel={() => setAssigning(null)}
                  defaults={pickerDefaults}
                />
            )}
          </div>
        );
      })}
    </div>
  );
});
