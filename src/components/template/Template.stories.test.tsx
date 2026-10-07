import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { ScalarProvider } from '../../theme/ScalarProvider.js';
import * as S1 from './PageTemplate.stories.js';

const files = [
  ['PageTemplate', composeStories(S1)],
] as const;

describe.each(files)('%s stories', (_name, stories) => {
  it.each(Object.entries(stories))('%s renders without throwing', (_story, Story) => {
    const { container } = render(
      <ScalarProvider mode="light" viewport="desktop">
        <Story />
      </ScalarProvider>,
    );
    expect(container).toBeTruthy();
  });
});
