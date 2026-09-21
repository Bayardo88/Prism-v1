/**
 * PRISM — the semantic colour contract for what an item REPRESENTS.
 *
 * Five families. `Entity` is a thing that exists, `Data` is something recorded
 * about it, `Destination` is somewhere you land, `Command` is something you
 * run, and `Utility` is the fallback when none of those apply.
 *
 * PRISM never states whether the user may open a thing. Access, availability
 * and permission are not its job (contract rule R11).
 */
export type PrismType =
  | 'firm'
  | 'company'
  | 'document'
  | 'version'
  | 'measurement-date'
  | 'page'
  | 'firm-action'
  | 'company-action'
  | 'neutral';

/**
 * The five types a search can be scoped into.
 *
 * A Page or an Action is a destination you land on, not a scope you search
 * inside — which is why neither appears here.
 */
export type PrismScopeType = Extract<PrismType, 'firm' | 'company' | 'document' | 'version' | 'measurement-date'>;

export const prismScopeTypes: readonly PrismScopeType[] = [
  'firm',
  'company',
  'document',
  'version',
  'measurement-date',
] as const;

/** Default plural group labels. Keep them plain plural nouns. */
export const prismGroupLabel: Record<PrismType, string> = {
  firm: 'Firms',
  company: 'Companies',
  document: 'Documents',
  version: 'Versions',
  'measurement-date': 'Measurement dates',
  page: 'Pages',
  'firm-action': 'Firm actions',
  'company-action': 'Company actions',
  neutral: 'Other',
};

/** Singular badge labels shown on a result row. */
export const prismBadgeLabel: Record<PrismType, string> = {
  firm: 'Firm',
  company: 'Company',
  document: 'Document',
  version: 'Version',
  'measurement-date': 'Measurement date',
  page: 'Page',
  'firm-action': 'Firm action',
  'company-action': 'Company action',
  neutral: 'Other',
};
