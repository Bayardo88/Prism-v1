import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react-vite';
import { describe, expect, it } from 'vitest';
import * as ChromeStories from './Chrome.stories.js';
import * as ControlsStories from './Controls.stories.js';
import * as MenusStories from './Menus.stories.js';
import * as ValuationInfoStories from './ValuationInfo.stories.js';

const suites = {
  Chrome: composeStories(ChromeStories),
  Controls: composeStories(ControlsStories),
  Menus: composeStories(MenusStories),
  ValuationInfo: composeStories(ValuationInfoStories),
};

describe('header stories', () => {
  for (const [suite, composed] of Object.entries(suites)) {
    it.each(Object.entries(composed))(`${suite}: %s renders`, (_name, Story) => {
      expect(() => render(<Story />)).not.toThrow();
    });
  }
});
