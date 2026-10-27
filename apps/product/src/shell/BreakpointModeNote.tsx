/**
 * Which breakpoints drive a Waterfall (UX-01): calculated or custom, and for
 * which Cap Table version — always visible where Waterfall results are shown.
 */
import { Icon, Link, Text, icons, space } from '@scalar/design-system';
import type { Company } from '../data/fixtures.js';
import { useValuationContext } from '../domain/context.js';
import { href } from '../router.js';
import { routes } from '../routes.js';

export function BreakpointModeNote({ company }: { company: Company }) {
  const { ctx, capTable } = useValuationContext(company);
  const custom = ctx.breakpointMode === 'custom';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
      <Icon size="s" tone={custom ? 'warning' : 'secondary'}><icons.Info /></Icon>
      <Text step="s" tone="secondary">
        {`Using ${custom ? 'custom' : 'calculated'} breakpoints · ${capTable.name}. `}
      </Text>
      <Link href={href(routes.company.breakpoints(company.id))}>Breakpoint Analysis</Link>
    </div>
  );
}
