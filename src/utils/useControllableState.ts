import { useCallback, useRef, useState } from 'react';

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
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const set = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  return [isControlled ? value : uncontrolled, set];
}
