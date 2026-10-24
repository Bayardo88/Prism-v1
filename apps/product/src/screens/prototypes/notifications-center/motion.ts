/**
 * Motion for the Notifications Center prototype, rebuilt from the AI Studio
 * prototype (app b01d6c65-38cf-47a1-a253-5cacf2ce2a4e, src/App.tsx):
 *
 *   toast `animate-in slide-in-from-bottom-5 fade-in duration-300`
 *     → fade + rise from `space.l`, `motion.moderate` + `motion.decelerate`
 *
 * The AI card's orbiting outline is the DS `AiOutline` (known gap 15), built
 * from GOOGLE_AI_STUDIO_GRADIENT_INPUT_ANIMATION.md.
 */
import { useEffect, useState, type CSSProperties } from 'react';
import { motion, space } from '@scalar/design-system';

/** False on the first paint, true on the next, so a transition has a start state. */
export function useEntered(): boolean {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setEntered(true)); });
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
  }, []);
  return entered;
}

/**
 * Rise into place from below while fading in. A transition, so the base
 * stylesheet's reduced-motion rule (it zeroes every transition) covers it.
 */
export function riseStyle(entered: boolean): CSSProperties {
  const ease = `${motion.moderate} ${motion.decelerate}`;
  return {
    opacity: entered ? 1 : 0,
    transform: entered ? 'none' : `translateY(${space.l})`,
    transition: `opacity ${ease}, transform ${ease}`,
  };
}
