import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button/index.js';
import { ColorPicker, HUE_SPECTRUM } from './index.js';

const meta = {
  title: 'Workboard/Color Picker',
  component: ColorPicker,
  tags: ['autodocs'],
  args: { label: 'Draft', value: '#0268C1', onApply: () => undefined, onCancel: () => undefined },
} satisfies Meta<typeof ColorPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Drag on the square or the hue track, or Tab to either and use the arrow keys (Shift for 10×). */
export const Default: Story = {};

/**
 * A firm's own status colours (the Workboard's Model Status settings). The
 * swatches are user data, so they are inline values, not tokens.
 */
function StatusColours() {
  const [colours, setColours] = useState<Record<string, string>>({ Draft: '#E3E8F0', Review: '#FFBB33', Final: '#007E17' });
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-s)', alignItems: 'flex-start' }}>
      {Object.entries(colours).map(([status, hex]) => (
        <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          <Button
            variant="secondary"
            aria-expanded={editing === status}
            leadingIcon={<span aria-hidden style={{ display: 'inline-block', width: 'var(--size-icon-s)', height: 'var(--size-icon-s)', borderRadius: 'var(--radius-xs)', background: hex }} />}
            onClick={() => setEditing(editing === status ? null : status)}
          >
            {`${status} colour`}
          </Button>
          {editing === status && (
            <ColorPicker
              label={status}
              value={hex}
              onCancel={() => setEditing(null)}
              onApply={(next) => { setColours({ ...colours, [status]: next.toUpperCase() }); setEditing(null); }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export const EditingStatusColours: Story = { name: 'Editing status colours', render: () => <StatusColours /> };

/** The hue track's gradient, exported for any surface that needs to draw the spectrum. */
export const Spectrum: Story = {
  render: () => <div aria-hidden style={{ height: 'var(--size-icon-l)', borderRadius: 'var(--radius-xs)', backgroundImage: HUE_SPECTRUM }} />,
};
