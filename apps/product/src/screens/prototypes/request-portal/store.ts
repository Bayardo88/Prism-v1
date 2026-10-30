/**
 * PROTOTYPE-ONLY persistence and transfer adapter (P0.4, P0.6).
 *
 * Request data lives in localStorage and uploaded file bytes in IndexedDB, both
 * in this browser only. Nothing leaves the machine and nothing is encrypted or
 * scanned — the UI says so, and never claims a secure upload (P0.9). Swap this
 * module for the API client; the screen only talks to `usePortalStore`.
 *
 * Lifecycle (P0.3): validating → uploading → saving → submitted, or failed.
 * Status advances to Complete only when the save resolves (G3.7). A failure
 * keeps the request Pending, records the error and allows a retry.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { FIXTURES, REQUEST_META } from './fixtures.js';
import {
  validateFile, type InformationRequest, type RequestStatus, type UploadedFile,
} from './model.js';

export type Phase = 'idle' | 'validating' | 'uploading' | 'saving' | 'failed';
export interface OpState { phase: Phase; progress?: number; error?: string; fileName?: string }

export interface ExtensionRequest { requestedDate: string; reason: string; submittedAt: string }

interface Persisted {
  requests: InformationRequest[];
  dueDate: string;
  extension?: ExtensionRequest;
}

const KEY = (fixture: string) => `scalar.request-portal.v1.${fixture}`;
const LATENCY = 700;

function load(fixture: string): Persisted {
  try {
    const raw = window.localStorage.getItem(KEY(fixture));
    if (raw) return JSON.parse(raw) as Persisted;
  } catch { /* storage blocked: start from the fixture */ }
  return { requests: (FIXTURES[fixture] ?? FIXTURES.default!)(), dueDate: REQUEST_META.dueDate };
}

function persist(fixture: string, data: Persisted) {
  try { window.localStorage.setItem(KEY(fixture), JSON.stringify(data)); } catch { /* ignore */ }
}

/* ---- file bytes (IndexedDB) ---- */

const DB = 'scalar-request-portal';
function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('files');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function putBytes(id: string, blob: Blob) {
  const d = await db();
  await new Promise<void>((res, rej) => {
    const tx = d.transaction('files', 'readwrite');
    tx.objectStore('files').put(blob, id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function getBytes(id: string): Promise<Blob | undefined> {
  const d = await db();
  return new Promise((res, rej) => {
    const r = d.transaction('files').objectStore('files').get(id);
    r.onsuccess = () => res(r.result as Blob | undefined);
    r.onerror = () => rej(r.error);
  });
}

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
const now = () => new Date().toISOString();

export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function usePortalStore(fixture: string) {
  const [data, setData] = useState<Persisted>(() => load(fixture));
  const [ops, setOps] = useState<Record<string, OpState>>({});
  const [simulateFailure, setSimulateFailure] = useState(false);
  const failRef = useRef(simulateFailure);
  failRef.current = simulateFailure;
  const inFlight = useRef(new Set<string>());

  useEffect(() => { persist(fixture, data); }, [fixture, data]);

  const setOp = (id: string, op: OpState | null) =>
    setOps((o) => { const n = { ...o }; if (op) n[id] = op; else delete n[id]; return n; });

  const patch = useCallback((ids: readonly string[], fn: (r: InformationRequest) => InformationRequest) =>
    setData((d) => ({ ...d, requests: d.requests.map((r) => (ids.includes(r.id) ? { ...fn(r), updatedAt: now() } : r)) })), []);

  /** Text / choice / date. Completes only after the save resolves. */
  const saveAnswer = useCallback(async (id: string, answer: string) => {
    if (inFlight.current.has(id)) return; // no duplicate submissions
    inFlight.current.add(id);
    setOp(id, { phase: 'saving' });
    await wait(LATENCY);
    inFlight.current.delete(id);
    if (failRef.current) {
      setOp(id, { phase: 'failed', error: 'Your answer was not saved. Check your connection and try again — what you typed is kept.' });
      return;
    }
    patch([id], (r) => ({ ...r, answer, status: 'complete' }));
    setOp(id, null);
  }, [patch]);

  /** File / completed template: validate → upload (progress) → save → Complete. */
  const uploadFile = useCallback(async (req: InformationRequest, file: File) => {
    if (inFlight.current.has(req.id)) return;
    setOp(req.id, { phase: 'validating', fileName: file.name });
    const invalid = validateFile(file, req);
    if (invalid) { setOp(req.id, { phase: 'failed', error: invalid, fileName: file.name }); return; }
    inFlight.current.add(req.id);
    for (const p of [15, 40, 65, 90]) {
      setOp(req.id, { phase: 'uploading', progress: p, fileName: file.name });
      await wait(LATENCY / 4);
    }
    setOp(req.id, { phase: 'saving', progress: 100, fileName: file.name });
    await wait(LATENCY / 2);
    inFlight.current.delete(req.id);
    if (failRef.current) {
      setOp(req.id, { phase: 'failed', error: `${file.name} did not finish uploading, so this request is still pending. Try again.`, fileName: file.name });
      return;
    }
    const meta: UploadedFile = {
      id: `f-${Math.random().toString(36).slice(2, 10)}`,
      requestId: req.id,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      uploadedAt: now(),
      uploadedBy: REQUEST_META.respondent,
      version: (req.files?.length ?? 0) + 1,
    };
    try {
      await putBytes(meta.id, file);
    } catch {
      setOp(req.id, { phase: 'failed', error: `${file.name} could not be stored in this browser. Try again.`, fileName: file.name });
      return;
    }
    // A completed template replaces the previous submission; earlier versions stay listed for the audit trail.
    patch([req.id], (r) => ({ ...r, files: [...(r.files ?? []), meta], status: 'complete' }));
    setOp(req.id, null);
  }, [patch]);

  const clearError = useCallback((id: string) => setOp(id, null), []);

  const removeFile = useCallback((reqId: string, fileId: string) =>
    patch([reqId], (r) => {
      const files = (r.files ?? []).filter((f) => f.id !== fileId);
      return { ...r, files, status: files.length || r.status !== 'complete' ? r.status : 'pending' };
    }), [patch]);

  const downloadUpload = useCallback(async (f: UploadedFile) => {
    const blob = await getBytes(f.id).catch(() => undefined);
    if (!blob) return false;
    saveBlob(blob, f.name);
    return true;
  }, []);

  /** Mark N/A / sent another way. Answers and files already saved stay attached. */
  const setStatus = useCallback((ids: readonly string[], status: RequestStatus) => patch(ids, (r) => ({ ...r, status })), [patch]);

  /**
   * Reopen (G2.7): status returns to Pending at once; the saved answer and files
   * stay attached and visible, so the respondent can edit or replace them.
   */
  const reopen = useCallback((ids: readonly string[]) => patch(ids, (r) => ({ ...r, status: 'pending' })), [patch]);

  const delegate = useCallback(async (ids: readonly string[], email: string) => {
    await wait(LATENCY);
    if (failRef.current) throw new Error('Delegation was not saved. Try again.');
    patch(ids, (r) => ({ ...r, delegatee: email }));
  }, [patch]);

  const requestExtension = useCallback(async (requestedDate: string, reason: string) => {
    await wait(LATENCY);
    if (failRef.current) throw new Error('Your extension request was not sent. Try again.');
    setData((d) => ({ ...d, extension: { requestedDate, reason, submittedAt: now() } }));
  }, []);

  const reset = useCallback(() => {
    try { window.localStorage.removeItem(KEY(fixture)); } catch { /* ignore */ }
    setData(load(fixture));
    setOps({});
  }, [fixture]);

  return {
    requests: data.requests, dueDate: data.dueDate, extension: data.extension, ops,
    simulateFailure, setSimulateFailure,
    saveAnswer, uploadFile, clearError, removeFile, downloadUpload, setStatus, reopen, delegate, requestExtension, reset,
  };
}

export type PortalStore = ReturnType<typeof usePortalStore>;

/** Fetch a template asset and save it with its own name and type. Returns an error message or null (G3.4). */
export async function downloadTemplate(path: string, fileName: string, mimeType: string): Promise<string | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return 'This template is not available right now. Contact your analyst and they will send it directly.';
    const blob = new Blob([await res.arrayBuffer()], { type: mimeType });
    saveBlob(blob, fileName);
    return null;
  } catch {
    return 'The template could not be downloaded. Check your connection and try again.';
  }
}
