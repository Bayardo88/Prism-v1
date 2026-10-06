import { createContext, useContext } from 'react';
import { describedBy } from '../../utils/index.js';

/** What `FormField` shares with the control inside it. */
export interface FormFieldContextValue {
  id: string;
  /** Space-separated ids of the hint / error text, ready for `aria-describedby`. */
  describedBy: string | undefined;
  state: 'default' | 'error' | 'disabled';
  required: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/** Reads the surrounding `FormField` (if any) — custom controls can use it to wire themselves up. */
export function useFormField(): FormFieldContextValue | null {
  return useContext(FormFieldContext);
}

/** Merges the consumer's own `aria-describedby` with the field's. */
export function mergeDescribedBy(own: string | undefined, field: FormFieldContextValue | null): string | undefined {
  const ids = [...(own?.split(/\s+/) ?? []), ...(field?.describedBy?.split(/\s+/) ?? [])].filter(Boolean);
  return describedBy(...new Set(ids)); // de-duplicated: FormField also passes it as a prop
}
