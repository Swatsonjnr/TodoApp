import {
  TodoListResponseSchema,
  TodoResponseSchema,
} from '@todo-app/contracts';
import type {
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoResponse,
  TodoListResponse,
} from '@todo-app/contracts';

const BASE_URL = 'http://localhost:3001';
// All functions should be returning a resolve not promises
// and have sensitive data live in the .env file for security reasons.
// validate the request also

async function handleResponse<T>(
  res: Response,
  schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: { message: string } } },
): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  const data = await res.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid response shape: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const todosApi = {
  getAll: (): Promise<TodoListResponse> =>
    fetch(`${BASE_URL}/todos`).then((res) => handleResponse(res, TodoListResponseSchema)),

  getById: (id: string): Promise<TodoResponse> =>
    fetch(`${BASE_URL}/todos/${id}`).then((res) => handleResponse(res, TodoResponseSchema)),

  create: (data: CreateTodoRequest): Promise<TodoResponse> =>
    fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => handleResponse(res, TodoResponseSchema)),

  update: (id: string, data: UpdateTodoRequest): Promise<TodoResponse> =>
    fetch(`${BASE_URL}/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => handleResponse(res, TodoResponseSchema)),

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/todos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
    }
  },
};