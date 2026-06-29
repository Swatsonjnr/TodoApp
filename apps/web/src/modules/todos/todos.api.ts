import {
  CreateTodoRequestSchema,
  UpdateTodoRequestSchema,
  TodoListResponseSchema,
  TodoResponseSchema,
} from '@todo-app/contracts';
import type { CreateTodoRequest, UpdateTodoRequest, TodoResponse, TodoListResponse } from '@todo-app/contracts';
import type { ResultAsync } from 'neverthrow';
import { errAsync } from 'neverthrow';
import { client } from '@/lib/client';
import type { ApiError } from '@/lib/client';

export const todosApi = {
  getAll: (): ResultAsync<TodoListResponse, ApiError> =>
    client.get('/todos', TodoListResponseSchema),

  getById: (id: string): ResultAsync<TodoResponse, ApiError> =>
    client.get(`/todos/${id}`, TodoResponseSchema),

  create: (data: CreateTodoRequest): ResultAsync<TodoResponse, ApiError> => {
    const parsed = CreateTodoRequestSchema.safeParse(data);
    if (!parsed.success) {
      return errAsync({
        type: 'validation_error',
        messages: parsed.error.issues.map((i) => i.message),
      });
    }
    return client.post('/todos', parsed.data, TodoResponseSchema);
  },

  update: (id: string, data: UpdateTodoRequest): ResultAsync<TodoResponse, ApiError> => {
    const parsed = UpdateTodoRequestSchema.safeParse(data);
    if (!parsed.success) {
      return errAsync({
        type: 'validation_error',
        messages: parsed.error.issues.map((i) => i.message),
      });
    }
    return client.patch(`/todos/${id}`, parsed.data, TodoResponseSchema);
  },

  delete: (id: string): ResultAsync<void, ApiError> =>
    client.del(`/todos/${id}`),
};
