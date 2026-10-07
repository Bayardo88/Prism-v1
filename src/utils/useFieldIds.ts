import { useId } from 'react';

export interface FieldIds {
  /** Id for the control itself. */
  id: string;
  labelId: string;
  hintId: string;
  errorId: string;
}

/**
 * Stable, SSR-safe ids for a form field. Pass the consumer's `id` to honour it;
 * otherwise one is generated with `useId`.
 */
export function useFieldIds(id?: string): FieldIds {
  const generated = useId();
  const base = id ?? generated;
  return { id: base, labelId: `${base}-label`, hintId: `${base}-hint`, errorId: `${base}-error` };
}

/** Joins the ids that should describe a control (`aria-describedby`), skipping falsy ones. */
export function describedBy(...ids: Array<string | false | null | undefined>): string | undefined {
  const joined = ids.filter(Boolean).join(' ');
  return joined || undefined;
}
