/** Which company's Rollover dialog is open. */
import { createDialogState } from '../dialogState.js';

const rollover = createDialogState();
export const openRollover = rollover.open;
export const closeRollover = rollover.close;
export const useRolloverOpen = rollover.useOpen;
