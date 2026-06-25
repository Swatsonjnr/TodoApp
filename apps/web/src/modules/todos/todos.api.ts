import { fromPromise, err } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';
import {
  CreateTodoRequestSchema,
  UpdateTodoRequestSchema,
  TodoListResponseSchema,
  TodoResponseSchema,
} from '@todo-app/contracts';
import type {
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoResponse,
  TodoListResponse,
} from '@todo-app/contracts';

const BASE_URL = import.meta.env['VITE_API_URL'] as string;

type ApiError = { type: 'network_error'; message: string } | { type: 'invalid_response' };

async function handleResponse<T>(
  res: Response,
  schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false } },
): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
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

export const todosApi = {
  getAll: (): ResultAsync<TodoListResponse, ApiError> =>
    fromPromise(
      fetch(`${BASE_URL}/todos`).then((res) => handleResponse(res, TodoListResponseSchema)),
      toApiError,
    ),

  getById: (id: string): ResultAsync<TodoResponse, ApiError> =>
    fromPromise(
      fetch(`${BASE_URL}/todos/${id}`).then((res) => handleResponse(res, TodoResponseSchema)),
      toApiError,
    ),

  create: (data: CreateTodoRequest): ResultAsync<TodoResponse, ApiError> => {
    const parsed = CreateTodoRequestSchema.safeParse(data);
    if (!parsed.success) {
      return err({ type: 'network_error', message: parsed.error.issues[0]?.message ?? 'Invalid request' }) as unknown as ResultAsync<TodoResponse, ApiError>;
    }
    return fromPromise(
      fetch(`${BASE_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      }).then((res) => handleResponse(res, TodoResponseSchema)),
      toApiError,
    );
  },

  update: (id: string, data: UpdateTodoRequest): ResultAsync<TodoResponse, ApiError> => {
    const parsed = UpdateTodoRequestSchema.safeParse(data);
    if (!parsed.success) {
      return err({ type: 'network_error', message: parsed.error.issues[0]?.message ?? 'Invalid request' }) as unknown as ResultAsync<TodoResponse, ApiError>;
    }
    return fromPromise(
      fetch(`${BASE_URL}/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      }).then((res) => handleResponse(res, TodoResponseSchema)),
      toApiError,
    );
  },

  delete: (id: string): ResultAsync<void, ApiError> =>
    fromPromise(
      fetch(`${BASE_URL}/todos/${id}`, { method: 'DELETE' }).then((res) => {
        if (!res.ok) {
          return res.json().catch(() => ({})).then((body) => {
            throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
          });
        }
      }),
      toApiError,
    ),
};
