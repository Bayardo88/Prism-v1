import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react-vite';
import { describe, expect, it } from 'vitest';
import * as stories from './Core.stories.js';

const composed = composeStories(stories);

describe('Core stories', () => {
  it.each(Object.entries(composed))('%s renders', (_name, Story) => {
    expect(() => render(<Story />)).not.toThrow();
  });
});
