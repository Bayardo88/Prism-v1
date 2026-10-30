/**
 * Unified Request Portal — the request contract (brief §3).
 *
 * The wording of a request (`title`, `description`) is independent of how it is
 * answered (`responseType`). A question can be answered with a file; a template
 * is an asset Scalar supplies, never the response. Numbering comes from
 * `categoryOrder` + `requestOrder` on the data, never from rendered position, so
 * filtering, selecting or completing a request can never renumber it (G2.5).
 */

export type ResponseType = 'text' | 'choice' | 'date' | 'file' | 'template_file';
/** `na` and `sent` resolve a request but are distinct outcomes: neither implies a file arrived (P0.8). */
export type RequestStatus = 'pending' | 'complete' | 'na' | 'sent';
export type StatusFilter = 'all' | 'pending' | 'completed';

export interface TemplateAsset {
  id: string;
  version: string;
  /** Date the version was issued, MM/DD/YYYY. */
  issued: string;
  name: string;
  /** Filename the download is saved as; keeps the native extension. */
  fileName: string;
  mimeType: string;
  /** Served path. In production an authorised download endpoint resolves this. */
  path: string;
}

export interface UploadedFile {
  id: string;
  requestId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  version: number;
}

export interface Category {
  id: string;
  order: number;
  name: string;
}

export interface InformationRequest {
  id: string;
  categoryId: string;
  categoryOrder: number;
  requestOrder: number;
  title: string;
  description?: string;
  responseType: ResponseType;
  template?: TemplateAsset;
  allowedExtensions?: string[];
  maxFileSizeBytes?: number;
  status: RequestStatus;
  /** text / choice ('yes' | 'no') / date (ISO yyyy-mm-dd). */
  answer?: string;
  files?: UploadedFile[];
  delegatee?: string;
  updatedAt?: string;
}

export const MAX_FILE_BYTES = 15 * 1024 * 1024;
export const DOC_EXTENSIONS = ['pdf', 'xlsx', 'xls', 'csv', 'docx', 'doc', 'pptx'];
export const SHEET_EXTENSIONS = ['csv', 'xlsx', 'xls'];

export const requestNumber = (r: Pick<InformationRequest, 'categoryOrder' | 'requestOrder'>) => `${r.categoryOrder}.${r.requestOrder}`;

/** Stable order, defined on the data. */
export const byNumber = (a: InformationRequest, b: InformationRequest) =>
  a.categoryOrder - b.categoryOrder || a.requestOrder - b.requestOrder;

export const isResolved = (r: InformationRequest) => r.status !== 'pending';

export const matchesStatus = (r: InformationRequest, f: StatusFilter) =>
  f === 'all' || (f === 'pending' ? !isResolved(r) : isResolved(r));

export const statusLabel: Record<RequestStatus, string> = {
  pending: 'Pending',
  complete: 'Complete',
  na: 'Not applicable',
  sent: 'Sent another way',
};

export const responseTypeLabel: Record<ResponseType, string> = {
  text: 'Written answer',
  choice: 'Yes / No',
  date: 'Date',
  file: 'Upload document',
  template_file: 'Template',
};

export const fileExtension = (name: string) => (name.includes('.') ? name.split('.').pop()!.toLowerCase() : '');

export const formatBytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;

/** File validation (P0.5): never trust the input's `accept` alone. Returns an error to show, or null. */
export function validateFile(file: File, req: InformationRequest): string | null {
  const allowed = req.allowedExtensions ?? DOC_EXTENSIONS;
  const ext = fileExtension(file.name);
  if (!allowed.includes(ext)) {
    return `${file.name} is a .${ext || 'unknown'} file. This request accepts ${allowed.map((e) => `.${e}`).join(', ')}.`;
  }
  const max = req.maxFileSizeBytes ?? MAX_FILE_BYTES;
  if (file.size > max) return `${file.name} is ${formatBytes(file.size)}. The limit is ${formatBytes(max)}.`;
  if (file.size === 0) return `${file.name} is empty. Choose the saved file and try again.`;
  return null;
}
