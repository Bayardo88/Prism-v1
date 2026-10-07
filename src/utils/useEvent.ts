import { useCallback } from 'react';
import { useLatestRef } from './useLatestRef.js';

/**
 * A callback with a stable identity that always calls the latest `fn`.
 * Use for handlers passed to effects or memoised children (a `useEffectEvent`
 * stand-in for React 18).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEvent<A extends any[], R>(fn: ((...args: A) => R) | undefined): (...args: A) => R | undefined {
  const ref = useLatestRef(fn);
  return useCallback((...args: A) => ref.current?.(...args), [ref]);
}
