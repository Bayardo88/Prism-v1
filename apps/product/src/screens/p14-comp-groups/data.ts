/** Comp group demo data, copied from the Figma frames. */
export interface CompCompany { name: string; symbol: string; ciq: string }

export interface CompGroup {
  id: string;
  kind: 'public' | 'transaction';
  name: string;
  companies: CompCompany[];
}

export const versions = [
  { date: '09/21/2026', version: 'V-2' },
  { date: '09/14/2026', version: 'V-1' },
];

const testGroup: CompGroup = {
  id: 'test',
  kind: 'public',
  name: 'test',
  companies: [
    { name: 'Alphabet Inc.', symbol: 'NasdaqGS:GOOGL', ciq: 'IQT11311662' },
    { name: 'Meta Platforms, Inc.', symbol: 'NasdaqGS:META', ciq: 'IQT126910337' },
  ],
};

/** The groups each Figma state starts with. */
export function initialGroups(state: string): CompGroup[] {
  return state === 'new-transaction'
    ? [testGroup, { id: 'new-transaction', kind: 'transaction', name: '', companies: [] }]
    : [testGroup];
}
