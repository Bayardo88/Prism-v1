import type { ScreenDef } from '../../types.js';
import { routes, companyPattern } from '../../routes.js';
import { DocumentList } from './DocumentList.js';
import { InformationRequest } from './InformationRequest.js';
import { Questions } from './Questions.js';

const figmaPage = '10 · Company · Documents & Requests';

/** Screens from Figma page "10 · Company · Documents & Requests". */
export const screens: ScreenDef[] = [
  {
    id: 'company.documents.list',
    title: 'Documents',
    figmaPage,
    route: companyPattern(routes.company.documents),
    summary: 'See the company’s documents for the measurement date, upload new ones and track information requests.',
    component: DocumentList,
    states: [
      { key: 'default', label: 'Documents — Document List', figmaNode: '11:13664', section: 'Documents List' },
      { key: 'upload', label: 'Documents — Upload Document modal', figmaNode: '14:4176', section: 'Documents List' },
      { key: 'page-menu', label: 'Documents — Page menu open', figmaNode: '14:4259', section: 'Documents List' },
    ],
  },
  {
    id: 'company.documents.information-request',
    title: 'Information Request',
    figmaPage,
    route: companyPattern(routes.company.informationRequest),
    summary: 'Compose the documents and questions to request from the company and send them to a responsible contact.',
    component: InformationRequest,
    states: [
      { key: 'default', label: 'Information Request — New request', figmaNode: '16:13871', section: 'Information Request' },
      { key: 'responsible-picker', label: 'Information Request — Responsible picker open', figmaNode: '19:19795', section: 'Information Request' },
    ],
  },
  {
    id: 'company.documents.questions',
    title: 'Questions',
    figmaPage,
    route: companyPattern(routes.company.questions),
    summary: 'Read the answers to questions sent in information requests.',
    component: Questions,
    states: [
      { key: 'empty', label: 'Questions — Empty', figmaNode: '14:10616', section: 'Questions' },
    ],
  },
];
