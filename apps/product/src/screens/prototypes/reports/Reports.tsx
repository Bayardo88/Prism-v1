import { Button, EmptyState, Icon, icons } from '@scalar/design-system';
import { AppFrame, PageBody } from '../../../shell/AppFrame.js';
import { PageHeader } from '../../../shell/PageHeader.js';
import { ToolbarKebab } from '../../../shell/Toolbar.js';

/** Reports — the fifth area in the Primary Menu. Only its bar is drawn in the navigation file. */
export function Reports() {
  return (
    <AppFrame area="reports">
      <PageHeader
        title="Reports"
        trailing={<ToolbarKebab />}
        actions={
          <>
            <Button variant="secondary" size="xs" leadingIcon={<Icon size="s" tone="inherit"><icons.Description /></Icon>}>Request Report</Button>
            <Button variant="primary" size="xs" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}>Create Report</Button>
          </>
        }
      />
      <PageBody>
        <EmptyState title="No reports yet" body="Create a report or request one from the Scalar team." />
      </PageBody>
    </AppFrame>
  );
}
