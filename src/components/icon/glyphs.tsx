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

/* --- Structural glyphs for the gap-analysis components (pages 20–26) ------
 * Same rule as above: these let the components render on their own. Every
 * component that shows one also accepts an `icon` / `*Icon` prop — pass the
 * real SDS_Main glyph in product UI.
 * ------------------------------------------------------------------------ */
export const Plus = (): ReactElement => <path d="M12 5v14M5 12h14" {...s} />;
export const MoreVertical = (): ReactElement => (
  <>
    <circle cx="12" cy="5" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="12" cy="19" r="1.5" fill="currentColor" />
  </>
);
export const DragHandle = (): ReactElement => <path d="M5 9h14M5 15h14" {...s} />;
export const Sort = (): ReactElement => <path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4" {...s} />;
export const Filter = (): ReactElement => <path d="M4 5h16l-6 8v5l-4 2v-7z" {...s} />;
export const Trash = (): ReactElement => <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" {...s} />;
export const Copy = (): ReactElement => (
  <>
    <rect x="9" y="9" width="11" height="11" rx="2" {...s} />
    <path d="M5 15V6a2 2 0 0 1 2-2h8" {...s} />
  </>
);
export const Eye = (): ReactElement => (
  <>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" {...s} />
    <circle cx="12" cy="12" r="3" {...s} />
  </>
);
export const Clock = (): ReactElement => (
  <>
    <circle cx="12" cy="12" r="9" {...s} />
    <path d="M12 7v5l3 2" {...s} />
  </>
);
export const Upload = (): ReactElement => <path d="M12 16V4M7 9l5-5 5 5M4 20h16" {...s} />;
export const Download = (): ReactElement => <path d="M12 4v12M7 11l5 5 5-5M4 20h16" {...s} />;
export const Folder = (): ReactElement => <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...s} />;
export const Edit = (): ReactElement => <path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" {...s} />;
export const Expand = (): ReactElement => <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" {...s} />;
export const Refresh = (): ReactElement => <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" {...s} />;
export const ArrowLeft = (): ReactElement => <path d="M19 12H5M12 19l-7-7 7-7" {...s} />;
export const ArrowRight = (): ReactElement => <path d="M5 12h14M12 5l7 7-7 7" {...s} />;
export const Settings = (): ReactElement => (
  <>
    <circle cx="12" cy="12" r="3" {...s} />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" {...s} />
  </>
);
export const Link = (): ReactElement => <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" {...s} />;
export const List = (): ReactElement => <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" {...s} />;
export const Mail = (): ReactElement => (
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" {...s} />
    <path d="M3 7l9 6 9-6" {...s} />
  </>
);
export const User = (): ReactElement => (
  <>
    <circle cx="12" cy="8" r="4" {...s} />
    <path d="M4 20a8 8 0 0 1 16 0" {...s} />
  </>
);
export const Trend = (): ReactElement => <path d="M3 17l6-6 4 4 8-8M15 7h6v6" {...s} />;
export const ZoomOut = (): ReactElement => <path d="M5 12h14" {...s} />;
