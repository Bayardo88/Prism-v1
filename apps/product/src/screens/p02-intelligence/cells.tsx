/** Small cell renderers shared by the portfolio grids (Intelligence and firm Valuations). */
import { Link, ModalStatus } from '@scalar/design-system';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import type { Company } from '../../data/fixtures.js';
import { statusView } from './data.js';

/** A company name, linked to one of its own pages (Summary by default). */
export function CompanyLink({ company, to = routes.company.summary }: { company: Company; to?: (id: string) => string }) {
  return <Link size="s" href={href(to(company.id))}>{company.name}</Link>;
}

/** The valuation workflow status as a ModalStatus (label and tint, R8). */
export function StatusCell({ company }: { company: Company }) {
  const v = statusView[company.valuationStatus];
  return <ModalStatus state={v.state}>{v.label}</ModalStatus>;
}
