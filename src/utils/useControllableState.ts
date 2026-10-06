import { useCallback, useEffect, useRef, useState } from 'react';
import { useLatestRef } from './useLatestRef.js';

/**
 * Supports both controlled and uncontrolled usage from one hook.
 * Pass `value` to control; pass `defaultValue` to let the component own it.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [uncontrolled, setUncontrolled] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const onChangeRef = useLatestRef(onChange);

  // Switching between controlled and uncontrolled loses state silently — say so in development.
  const wasControlled = useRef(isControlled);
  useEffect(() => {
    if (wasControlled.current !== isControlled) {
      console.warn(
        `A component changed from ${wasControlled.current ? 'controlled' : 'uncontrolled'} to ` +
          `${isControlled ? 'controlled' : 'uncontrolled'}. Pass \`value\` for the component's whole lifetime, or never.`,
      );
      wasControlled.current = isControlled;
    }
  }, [isControlled]);

  const set = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
      onChangeRef.current?.(next);
    },
    [isControlled, onChangeRef],
  );

  return [isControlled ? value : uncontrolled, set];
}
