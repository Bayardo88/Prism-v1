/**
 * Company · Questions — answers to the questions sent in information
 * requests. Empty until a request with questions has been sent.
 *
 * Figma: 10 · Company · Documents & Requests → Questions (1 frame).
 */
import { Button, EmptyState, Icon, icons } from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { navigate } from '../../router.js';
import { routes } from '../../routes.js';
import { companyById } from '../../data/fixtures.js';
import { CompanyLayout } from '../../shell/CompanyLayout.js';
import { CompanyActionsButton, DocumentsSubNav, RequestsHeading } from './shared.js';

export function Questions({ params }: ScreenProps) {
  const company = companyById(params.companyId);
  return (
    <CompanyLayout
      company={company}
      section="documents"
      date={company.asOf}
      headerEnd={<CompanyActionsButton />}
      subNav={<DocumentsSubNav companyId={company.id} current="questions" />}
      dock={false}
    >
      <RequestsHeading
        companyId={company.id}
        title="Questions"
        counts={{ done: 0, total: 0, label: 'Questions answered', text: 'Requests: 0 sent, 0 answered, 0 pending' }}
      />
      <EmptyState
        type="no-data"
        title="No questions sent yet"
        body={`Questions you send to ${company.name} in an information request appear here, with their answers as they come in.`}
        icon={<Icon size="xl" tone="secondary"><icons.QuestionMark /></Icon>}
        actions={
          <Button variant="primary" onClick={() => navigate(routes.company.informationRequest(company.id))}>
            New Info Request
          </Button>
        }
      />
    </CompanyLayout>
  );
}
