import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { ScalarProvider } from '../../theme/ScalarProvider.js';
import * as S1 from './Menus.stories.js';
import * as S2 from './Actions.stories.js';

const files = [
  ['Menus', composeStories(S1)],
  ['Actions', composeStories(S2)],
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
