import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react-vite';
import { describe, expect, it } from 'vitest';
import * as WorkboardStories from './Workboard.stories.js';
import * as DealCardStories from './DealCard.stories.js';
import * as ColorPickerStories from './ColorPicker.stories.js';
import * as WorkCalendarStories from './WorkCalendar.stories.js';
import * as WorkTimelineStories from './WorkTimeline.stories.js';
import * as StepAssignMenuStories from './StepAssignMenu.stories.js';
import * as ValuationModalStories from './ValuationModal.stories.js';

const suites = {
  Workboard: composeStories(WorkboardStories),
  DealCard: composeStories(DealCardStories),
  ColorPicker: composeStories(ColorPickerStories),
  WorkCalendar: composeStories(WorkCalendarStories),
  WorkTimeline: composeStories(WorkTimelineStories),
  StepAssignMenu: composeStories(StepAssignMenuStories),
  ValuationModal: composeStories(ValuationModalStories),
};

describe('workboard stories', () => {
  for (const [suite, composed] of Object.entries(suites)) {
    it.each(Object.entries(composed))(`${suite}: %s renders`, (_name, Story) => {
      expect(() => render(<Story />)).not.toThrow();
    });
  }
});
