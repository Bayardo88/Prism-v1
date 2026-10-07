import { useRef, type MutableRefObject } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect.js';

/**
 * Holds the latest value in a ref, updated after commit (never during render).
 * Read `.current` from effects and event handlers so they never need the value
 * in their dependency list.
 */
export function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
