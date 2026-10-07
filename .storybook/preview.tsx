import type { Preview } from '@storybook/react-vite';
import '../src/styles/tokens.css';
import '../src/styles/base.css';
import '../src/styles/components.css';
import { ScalarProvider } from '../src/theme/ScalarProvider.js';

// Pages are always light mode (AI-GUIDE R14), so stories are too.
const preview: Preview = {
  decorators: [
    (Story) => (
      <ScalarProvider mode="light" viewport="desktop">
        <Story />
      </ScalarProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    a11y: { test: 'error' },
    controls: { expanded: true },
  },
};
export default preview;
