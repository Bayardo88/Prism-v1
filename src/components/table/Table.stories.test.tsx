import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react-vite';
import { describe, expect, it } from 'vitest';
import * as CellStories from './Cell.stories.js';
import * as ColumnHeaderStories from './ColumnHeader.stories.js';
import * as RowHeaderStories from './RowHeader.stories.js';
import * as StatusStories from './Status.stories.js';
import * as FootnoteStories from './Footnote.stories.js';
import * as DataGridStories from './DataGrid.stories.js';

const suites = {
  Cell: composeStories(CellStories),
  ColumnHeader: composeStories(ColumnHeaderStories),
  RowHeader: composeStories(RowHeaderStories),
  Status: composeStories(StatusStories),
  Footnote: composeStories(FootnoteStories),
  DataGrid: composeStories(DataGridStories),
};

describe('table stories', () => {
  for (const [suite, composed] of Object.entries(suites)) {
    it.each(Object.entries(composed))(`${suite}: %s renders`, (_name, Story) => {
      expect(() => render(<Story />)).not.toThrow();
    });
  }
});
