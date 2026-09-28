/**
 * Structural glyphs — the short names the package's own components use
 * (a Select needs a chevron, a Checkbox a tick).
 *
 * Every glyph is now a Material Symbol from `material.tsx`, so the components
 * and the product share one icon set. For product UI, prefer the full set:
 * `import { icons } from '@scalar/design-system'` → `<Icon><icons.AttachMoney /></Icon>`.
 * These aliases stay so existing imports keep working.
 */
import type { ReactElement } from 'react';
import * as m from './material.js';

export const ChevronDown = m.KeyboardArrowDown;
export const ChevronUp = m.KeyboardArrowUp;
export const ChevronRight = m.ChevronRight;
export const ChevronLeft = m.ChevronLeft;
export const Check = m.Check;
export const Minus = m.Remove;
export const Close = m.Close;
export const Search = m.Search;
export const Info = m.Info;
export const Warning = m.Warning;
export const Error = m.Error;
export const Success = m.CheckCircle;
export const Bell = m.Notifications;
export const Sparkle = m.StarShine;
export const Calendar = m.CalendarToday;
export const ArrowUp = m.ArrowUpward;
export const ArrowDown = m.ArrowDownward;
export const Document = m.Description;
/**
 * The loading arc stays a stroked circle: spinners rotate it with CSS, and
 * Material's progress_activity is drawn off-centre for the font's own animation.
 */
export const Spinner = (): ReactElement => (
  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeDasharray="44" strokeDashoffset="14" />
);
export const Plus = m.Add;
export const MoreVertical = m.MoreVert;
export const MoreHorizontal = m.MoreHoriz;
export const DragHandle = m.DragIndicator;
export const Sort = m.SwapVert;
export const Filter = m.FilterAlt;
export const Trash = m.Delete;
export const Copy = m.ContentCopy;
export const Eye = m.Visibility;
export const Clock = m.Schedule;
export const Upload = m.Upload;
export const Download = m.Download;
export const Folder = m.Folder;
export const Edit = m.Edit;
export const Expand = m.OpenInFull;
export const Refresh = m.Refresh;
export const ArrowLeft = m.ArrowBack;
export const ArrowRight = m.ArrowForward;
export const Settings = m.Settings;
export const Link = m.Link;
export const List = m.List;
export const Mail = m.Mail;
export const User = m.Person;
export const Trend = m.TrendingUp;
export const ZoomOut = m.ZoomOut;
