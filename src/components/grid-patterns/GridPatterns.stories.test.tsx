import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react-vite';
import { describe, expect, it } from 'vitest';
import * as GridPatternsStories from './GridPatterns.stories.js';

const suites = {
  GridPatterns: composeStories(GridPatternsStories),
};

describe('grid-patterns stories', () => {
  for (const [suite, composed] of Object.entries(suites)) {
    it.each(Object.entries(composed))(`${suite}: %s renders`, (_name, Story) => {
      expect(() => render(<Story />)).not.toThrow();
    });
  }
});
