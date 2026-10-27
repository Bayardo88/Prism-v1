/** Which company's Excel Export dialog is open. */
import { createDialogState } from '../dialogState.js';

const exportDialog = createDialogState();
export const openExport = exportDialog.open;
export const closeExport = exportDialog.close;
export const useExportOpen = exportDialog.useOpen;
