import { apiUrl } from './api';

const ADMIN_KEY = (import.meta.env.VITE_ADMIN_API_KEY as string | undefined)?.trim() || 'dev-admin-key';

type JsonRecord = Record<string, unknown>;

export interface BuilderLayoutPayload {
  name: string;
  ownerId: string;
  tree: JsonRecord;
  styles?: JsonRecord;
  metadata?: JsonRecord;
}

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const body = (await response.json().catch(() => null)) as { error?: string } | T | null;
  if (!response.ok) {
    const message = typeof body === 'object' && body && 'error' in body
      ? String((body as { error?: string }).error || 'Request failed')
      : 'Request failed';
    throw new Error(message);
  }
  return body as T;
}

function adminHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-admin-key': ADMIN_KEY,
  };
}

export async function createLayout(payload: BuilderLayoutPayload) {
  return request<{ ok: true; layout: JsonRecord }>(apiUrl('/api/layouts'), {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateLayout(id: string, payload: BuilderLayoutPayload) {
  return request<{ ok: true; layout: JsonRecord }>(apiUrl(`/api/layouts/${id}`), {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function publishLayout(id: string, slug?: string) {
  return request<{ ok: true; layout: JsonRecord }>(apiUrl(`/api/layouts/${id}/publish`), {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ slug }),
  });
}

export async function listLayouts(ownerId: string) {
  const query = new URLSearchParams({ ownerId, limit: '50' });
  return request<{ ok: true; layouts: JsonRecord[] }>(apiUrl(`/api/admin/layouts?${query.toString()}`), {
    method: 'GET',
    headers: {
      'x-admin-key': ADMIN_KEY,
    },
  });
}

export async function listRecentLayouts(limit = 5) {
  const query = new URLSearchParams({ limit: String(Math.max(1, Math.min(limit, 50))) });
  return request<{ ok: true; layouts: JsonRecord[] }>(apiUrl(`/api/admin/layouts?${query.toString()}`), {
    method: 'GET',
    headers: {
      'x-admin-key': ADMIN_KEY,
    },
  });
}
