import { fromPromise } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';

export type ApiError =
  | { type: 'network_error'; message: string }
  | { type: 'invalid_response' }
  | { type: 'validation_error'; messages: string[] };

const BASE_URL = import.meta.env['VITE_API_URL'] as string;

async function parseResponse<T>(
  res: Response,
  schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false } },
): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { error?: string }).error ?? `HTTP ${res.status}`;
    throw new Error(message);
  }
  const data = await res.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error('invalid_response');
  }
  return parsed.data;
}

function toApiError(e: unknown): ApiError {
  if (e instanceof Error && e.message === 'invalid_response') {
    return { type: 'invalid_response' };
  }
  return { type: 'network_error', message: e instanceof Error ? e.message : 'Unknown error' };
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }
  return url.toString();
}

export const client = {
  get: <T>(
    path: string,
    schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false } },
    params?: Record<string, string>,
  ): ResultAsync<T, ApiError> =>
    fromPromise(
      fetch(buildUrl(path, params)).then((res) => parseResponse(res, schema)),
      toApiError,
    ),

  post: <T>(
    path: string,
    body: unknown,
    schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false } },
  ): ResultAsync<T, ApiError> =>
    fromPromise(
      fetch(buildUrl(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((res) => parseResponse(res, schema)),
      toApiError,
    ),

  patch: <T>(
    path: string,
    body: unknown,
    schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false } },
  ): ResultAsync<T, ApiError> =>
    fromPromise(
      fetch(buildUrl(path), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((res) => parseResponse(res, schema)),
      toApiError,
    ),

  del: (path: string): ResultAsync<void, ApiError> =>
    fromPromise(
      fetch(buildUrl(path), { method: 'DELETE' }).then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
        }
      }),
      toApiError,
    ),
};
