/**
 * Pinned table header for pages with exactly one table.
 *
 * The three navigation tiers stay put and the page body (`<main>`) scrolls
 * under them (see `AppFrame`). A `DataGrid` header is `position: sticky`, but
 * the grid scrolls sideways inside itself, so the header can only stick inside
 * the grid's own box, never to the page. So when the body holds **one** visible
 * table that is taller than the room left under it, this bounds that grid to
 * the remaining height — what `DataGrid maxHeight` does — so its body scrolls
 * and its `ColumnHeader` row stays pinned under the navigation. Sideways
 * scrolling and pinned first columns keep working because the grid is still
 * the scroller.
 *
 * A page with two or more tables is left alone: the whole body scrolls, headers
 * included. A short single table that already fits is left alone too.
 *
 * Applied from the shell so every screen gets it without opting in; a grid the
 * screen already bounds (`maxHeight`) is never touched.
 */
import { useEffect, type RefObject } from 'react';

const TABLES = '[role="table"], [role="grid"], table';
const MARK = 'data-pinned-head';
/** Below this share of the body, the grid takes the full body height and the content above it scrolls away first. */
const MIN_SHARE = 0.4;

function visibleTables(main: HTMLElement): HTMLElement[] {
  return [...main.querySelectorAll<HTMLElement>(TABLES)].filter((t) => {
    if (t.parentElement?.closest(TABLES)) return false; // a table nested in a table is part of it
    const r = t.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  });
}

/** The body's laid-out children, looking through `display: contents` wrappers (CompanyLayout's fieldset). */
function boxes(el: Element): Element[] {
  return [...el.children].flatMap((c) => (getComputedStyle(c).display === 'contents' ? boxes(c) : [c]));
}

function release(grid: HTMLElement) {
  grid.removeAttribute(MARK);
  grid.style.removeProperty('max-height');
  grid.style.removeProperty('overflow-y');
  grid.removeAttribute('tabindex');
  grid.classList.remove('scalar-grid--bounded');
}

function pin(main: HTMLElement) {
  const tables = visibleTables(main);
  main.querySelectorAll<HTMLElement>(`[${MARK}]`).forEach((g) => {
    if (tables.length !== 1 || g !== tables[0]) release(g);
  });
  if (tables.length !== 1) return;
  const grid = tables[0]!;
  if (!grid.classList.contains('scalar-grid')) return;
  if (!grid.hasAttribute(MARK) && grid.classList.contains('scalar-grid--bounded')) return; // the screen bounds it itself

  const cs = getComputedStyle(main);
  const padTop = parseFloat(cs.paddingTop) || 0;
  const padBottom = parseFloat(cs.paddingBottom) || 0;
  const body = main.clientHeight - padTop - padBottom;
  const top = grid.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - padTop;
  // Content under the table (a total row, a footer) keeps its place below it.
  const contentBottom = Math.max(...boxes(main).map((c) => c.getBoundingClientRect().bottom));
  const below = Math.max(0, contentBottom - grid.getBoundingClientRect().bottom);
  const room = body - top - below;
  const gs = getComputedStyle(grid);
  const borders = (parseFloat(gs.borderTopWidth) || 0) + (parseFloat(gs.borderBottomWidth) || 0);
  const height = (room >= body * MIN_SHARE ? room : body) - borders;

  // It fits, or would hide less than a header row: nothing to pin.
  const head = grid.querySelector<HTMLElement>('.scalar-grid__head:not(.scalar-grid__head--group)');
  if (grid.scrollHeight <= height + (head?.offsetHeight ?? 0)) { if (grid.hasAttribute(MARK)) release(grid); return; }
  grid.setAttribute(MARK, '');
  grid.style.maxHeight = `${Math.floor(height)}px`;
  grid.style.overflowY = 'auto';
  // A scrollable region must be keyboard-focusable (WCAG 2.1.1), as DataGrid does for maxHeight.
  grid.tabIndex = 0;
  grid.classList.add('scalar-grid--bounded');
}

/** Watches the body under `frame` and pins the header of its single table. */
export function usePinnedTableHead(frame: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = frame.current;
    if (!root) return;
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const main = root.querySelector<HTMLElement>('main');
        if (main) pin(main);
      });
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    const mutate = new MutationObserver(schedule);
    mutate.observe(root, { childList: true, subtree: true });
    schedule();
    return () => { cancelAnimationFrame(raf); resize.disconnect(); mutate.disconnect(); };
  }, [frame]);
}
