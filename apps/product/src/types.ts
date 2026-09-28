import type { ComponentType } from 'react';

/**
 * One Figma frame. A screen usually has several — the default view plus the
 * menus, modals and error states drawn on top of it. Every frame in the
 * Scalar-full-product file (cZktZhD0ssL5lRVOvSqmOV) is exactly one state.
 */
export interface ScreenState {
  /** URL-safe key, passed back to the screen as `state`. The first is the default. */
  key: string;
  /** The Figma frame name, verbatim. */
  label: string;
  /** Figma node id of the frame, e.g. "11:20696". */
  figmaNode: string;
  /** The Figma Section the frame sits in. */
  section: string;
}

export interface ScreenProps {
  /** One of the screen's `states[].key`. */
  state: string;
  /** Route params, e.g. `{ companyId: 'abc-co' }`. */
  params: Record<string, string>;
}

/** A screen in the product: one route, one component, one or more states. */
export interface ScreenDef {
  /** Dotted id, stable across refactors: `company.financials.income-statement`. */
  id: string;
  title: string;
  /** The Figma page it came from, verbatim (e.g. "06 · Company · Summary & Financials"). */
  figmaPage: string;
  /** Route pattern. `:param` segments are matched and passed as `params`. */
  route: string;
  /** One sentence: what the user does here. Feeds the catalog and the docs. */
  summary: string;
  component: ComponentType<ScreenProps>;
  states: ScreenState[];
}
