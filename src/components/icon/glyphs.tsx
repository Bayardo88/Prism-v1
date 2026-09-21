/**
 * Structural glyphs.
 *
 * These exist because components in this package cannot function without them
 * — a Select needs a chevron, a Checkbox needs a tick. They are deliberately
 * minimal and are NOT the Scalar icon set.
 *
 * The product icon set is the separate `SDS_Main icons` Figma library. For any
 * icon that appears in product UI, export the real glyph and pass it to `Icon`
 * rather than reaching for one of these.
 */
import type { ReactElement } from 'react';

const s = { stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const ChevronDown = (): ReactElement => <path d="M6 9l6 6 6-6" {...s} />;
export const ChevronUp = (): ReactElement => <path d="M18 15l-6-6-6 6" {...s} />;
export const ChevronRight = (): ReactElement => <path d="M9 18l6-6-6-6" {...s} />;
export const ChevronLeft = (): ReactElement => <path d="M15 18l-6-6 6-6" {...s} />;
export const Check = (): ReactElement => <path d="M20 6L9 17l-5-5" {...s} />;
export const Minus = (): ReactElement => <path d="M5 12h14" {...s} />;
export const Close = (): ReactElement => <path d="M18 6L6 18M6 6l12 12" {...s} />;
export const Search = (): ReactElement => (
  <>
    <circle cx="11" cy="11" r="7" {...s} />
    <path d="M21 21l-4.3-4.3" {...s} />
  </>
);
export const Info = (): ReactElement => (
  <>
    <circle cx="12" cy="12" r="9" {...s} />
    <path d="M12 11v5M12 8h.01" {...s} />
  </>
);
export const Warning = (): ReactElement => (
  <>
    <path d="M12 3l9 16H3l9-16z" {...s} />
    <path d="M12 10v4M12 17h.01" {...s} />
  </>
);
export const Error = (): ReactElement => (
  <>
    <circle cx="12" cy="12" r="9" {...s} />
    <path d="M12 7v6M12 16h.01" {...s} />
  </>
);
export const Success = (): ReactElement => (
  <>
    <circle cx="12" cy="12" r="9" {...s} />
    <path d="M8 12l3 3 5-6" {...s} />
  </>
);
export const Bell = (): ReactElement => (
  <>
    <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9z" {...s} />
    <path d="M10 21a2 2 0 004 0" {...s} />
  </>
);
export const Sparkle = (): ReactElement => (
  <path d="M12 3l2 5.5L19.5 10 14 12l-2 5.5L10 12 4.5 10 10 8.5 12 3z" {...s} />
);
export const Calendar = (): ReactElement => (
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" {...s} />
    <path d="M3 10h18M8 3v4M16 3v4" {...s} />
  </>
);
export const ArrowUp = (): ReactElement => <path d="M12 19V5M5 12l7-7 7 7" {...s} />;
export const ArrowDown = (): ReactElement => <path d="M12 5v14M19 12l-7 7-7-7" {...s} />;
export const Document = (): ReactElement => (
  <>
    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" {...s} />
    <path d="M14 3v5h5" {...s} />
  </>
);
export const Spinner = (): ReactElement => (
  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeDasharray="44" strokeDashoffset="14" />
);
