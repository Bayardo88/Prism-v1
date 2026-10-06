import type { MutableRefObject, Ref, RefCallback } from 'react';

/** Assigns a value to any kind of ref. */
export function setRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as MutableRefObject<T | null>).current = value;
}

/** Combines several refs into one callback ref — forward a consumer's ref *and* keep an internal one. */
export function composeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => refs.forEach((r) => setRef(r, node));
}
