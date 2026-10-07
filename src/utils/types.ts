import type { ComponentPropsWithoutRef, ElementType } from 'react';

/** Native props of an element, minus `ref` — extend this in a component's props interface. */
export type NativeProps<T extends ElementType> = ComponentPropsWithoutRef<T>;

/** Adds the `asChild` escape hatch to a component's props. */
export interface AsChildProps {
  /**
   * Render the single child element instead of the component's own tag, merging
   * props onto it — use it to make a router link look like a Button:
   * `<Button asChild><Link to="/x">Go</Link></Button>`.
   */
  asChild?: boolean;
}
