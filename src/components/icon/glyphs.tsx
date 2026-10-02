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

/**
 * The Scalar AI mark (the circled sparkle) from the navigation file, drawn in a
 * 16-unit box and scaled onto Icon's 24px viewBox. Use it for the AI tool only.
 */
export const AiMark = (): ReactElement => (
  <g transform="scale(1.5)" fill="currentColor">
    <path d="M8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0ZM8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1ZM4.76465 10.3496C4.76466 10.8081 5.11309 11.185 5.55957 11.2305L5.65039 11.2354V11.4639C5.16135 11.4639 4.76485 11.8606 4.76465 12.3496H4.53613L4.53125 12.2588C4.48563 11.8126 4.10857 11.4641 3.65039 11.4639V11.2354L3.74121 11.2305C4.18746 11.1848 4.53612 10.8079 4.53613 10.3496H4.76465ZM8.52539 3.59961C8.52539 5.73971 10.2603 7.47461 12.4004 7.47461V8.47461C10.2604 8.47461 8.52559 10.2097 8.52539 12.3496H7.52539C7.52519 10.2098 5.79017 8.47485 3.65039 8.47461V7.47461C5.79029 7.47437 7.52539 5.73957 7.52539 3.59961H8.52539ZM4.65039 10.8379C4.54156 11.0603 4.36107 11.2407 4.13867 11.3496C4.36089 11.4584 4.54147 11.6382 4.65039 11.8604C4.75924 11.6386 4.93928 11.4584 5.16113 11.3496C4.93887 11.2407 4.75917 11.0602 4.65039 10.8379ZM8.02539 5.75C7.55027 6.7148 6.76552 7.49938 5.80078 7.97461C6.76535 8.44967 7.55018 9.23376 8.02539 10.1982C8.50052 9.23411 9.28483 8.44964 10.249 7.97461C9.28442 7.49937 8.50046 6.71471 8.02539 5.75ZM11.5146 3.59961C11.5147 4.05809 11.8631 4.43498 12.3096 4.48047L12.4004 4.48535V4.71387C11.9113 4.71387 11.5148 5.11061 11.5146 5.59961H11.2861L11.2812 5.50879C11.2356 5.0626 10.8586 4.7141 10.4004 4.71387V4.48535L10.4912 4.48047C10.9375 4.43476 11.2861 4.05793 11.2861 3.59961H11.5146ZM11.4004 4.08789C11.2916 4.31035 11.1111 4.49068 10.8887 4.59961C11.1109 4.70838 11.2915 4.88822 11.4004 5.11035C11.5092 4.88856 11.6893 4.70836 11.9111 4.59961C11.6889 4.49066 11.5092 4.31025 11.4004 4.08789Z" />
  </g>
);
