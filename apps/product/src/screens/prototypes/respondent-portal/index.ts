import type { ScreenDef } from '../../../types.js';
import { RespondentPortal } from './RespondentPortal.js';

/** Prototype — the external respondent's page for an information request (no Scalar login). */
export const screens: ScreenDef[] = [
  {
    id: 'prototype.respondent-portal',
    title: 'Respondent Portal (prototype)',
    figmaPage: 'Prototype · respondent-portal',
    route: '/prototypes/respondent-portal/:requestId',
    summary: 'An external contact answers the analyst’s questions and uploads the requested documents, and is told truthfully whether the response arrived.',
    component: RespondentPortal,
    states: [
      { key: 'default', label: 'Respondent Portal — answering', figmaNode: 'proto:respondent-portal:1', section: 'Prototype' },
      { key: 'received', label: 'Respondent Portal — response received', figmaNode: 'proto:respondent-portal:2', section: 'Prototype' },
      { key: 'confirmation-failed', label: 'Respondent Portal — received, confirmation failed (BUG-09 recovery)', figmaNode: 'proto:respondent-portal:3', section: 'Prototype' },
    ],
  },
];
