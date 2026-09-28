import { Button, EmptyState } from '@scalar/design-system';
import { AppFrame, PageBody } from './shell/AppFrame.js';
import { href } from './router.js';
import { routes } from './routes.js';

export function NotFound({ path }: { path: string }) {
  return (
    <AppFrame area="home">
      <PageBody>
        <EmptyState
          type="no-results"
          title="There is no page at this address"
          body={`Nothing is routed to ${path}. The catalog lists every screen in the product.`}
          actions={<a href={href(routes.catalog)}><Button variant="secondary">Open the screen catalog</Button></a>}
        />
      </PageBody>
    </AppFrame>
  );
}
