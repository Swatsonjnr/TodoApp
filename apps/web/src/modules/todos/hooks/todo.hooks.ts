import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTodoRequest, UpdateTodoRequest, TodoResponse } from '@todo-app/contracts';
import { todosApi } from '@todo-app/web/src/modules/todos/todos.api.js';

export const todoKeys = {
  all: ['todos'] as const,
  detail: (id: string) => ['todos', id] as const,
};

type TodosStatus =
  | { status: 'loading' }
  | { status: 'success'; todos: TodoResponse[]; total: number }
  | { status: 'error'; message: string };

export function useTodos() {
  return useQuery({
    queryKey: todoKeys.all,
    queryFn: () => todosApi.getAll(),
  });
}

export function useTodosStatus(): TodosStatus {
  const query = useTodos();

  if (query.isLoading) {
    return { status: 'loading' };
  }

  if (query.isError) {
    return {
      status: 'error',
      message: query.error instanceof Error ? query.error.message : 'Unknown error',
    };
  }

  return {
    status: 'success',
    todos: query.data?.todos ?? [],
    total: query.data?.total ?? 0,
  };
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTodoRequest) => todosApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      todosApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todosApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}