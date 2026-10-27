/**
 * Open state for a company-scoped dialog that several menus can open (the Date
 * menu, the company ⋮, the valuation ⋮) and CompanyLayout renders once.
 */
import { useSyncExternalStore } from 'react';

export function createDialogState() {
  let openFor: string | null = null;
  const listeners = new Set<() => void>();
  const emit = () => { for (const l of listeners) l(); };
  return {
    open(companyId: string) { openFor = companyId; emit(); },
    close() { openFor = null; emit(); },
    useOpen(companyId: string): boolean {
      return useSyncExternalStore(
        (l) => { listeners.add(l); return () => listeners.delete(l); },
        () => openFor === companyId,
        () => false,
      );
    },
  };
}
