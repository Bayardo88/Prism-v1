/** Small cell renderers shared by the portfolio grids (Intelligence and firm Valuations). */
import { ModalStatus } from '@scalar/design-system';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import type { Company } from '../../data/fixtures.js';
import { statusView } from './data.js';

/**
 * Where a company's row header goes (its Summary by default). Pass it to a
 * `GridRow`'s `href`: the row header is a Row Header, not a text link.
 */
export function companyHref(company: Company, to: (id: string) => string = routes.company.summary): string {
  return href(to(company.id));
}

/** The valuation workflow status as a ModalStatus (label and tint, R8). */
export function StatusCell({ company }: { company: Company }) {
  const v = statusView[company.valuationStatus];
  return <ModalStatus state={v.state}>{v.label}</ModalStatus>;
}
