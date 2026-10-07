import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react-vite';
import { describe, expect, it } from 'vitest';
import * as AdminStories from './Admin.stories.js';

const suites = {
  Admin: composeStories(AdminStories),
};

describe('admin stories', () => {
  for (const [suite, composed] of Object.entries(suites)) {
    it.each(Object.entries(composed))(`${suite}: %s renders`, (_name, Story) => {
      expect(() => render(<Story />)).not.toThrow();
    });
  }
});
