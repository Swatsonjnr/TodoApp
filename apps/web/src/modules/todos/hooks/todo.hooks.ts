import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTodoRequest, UpdateTodoRequest, TodoResponse } from '@todo-app/contracts';
import { todosApi } from '../todos.api';

export const todoKeys = {
  all: ['todos'] as const,
  filtered: (status?: 'pending' | 'completed') => ['todos', { status }] as const,
  detail: (id: string) => ['todos', id] as const,
};

export function useTodos(filter?: { status?: 'pending' | 'completed' }) {
  return useQuery({
    queryKey: todoKeys.filtered(filter?.status),
    queryFn: () =>
      todosApi.getAll(filter).match(
        (data) => data,
        (error) => { throw new Error(error.type === 'network_error' ? error.message : 'Invalid response'); },
      ),
  });
}

type TodosStatus =
  | { status: 'loading' }
  | { status: 'success'; pending: TodoResponse[]; completed: TodoResponse[]; total: number }
  | { status: 'error'; message: string };

export function useTodosStatus(): TodosStatus {
  const pendingQuery = useTodos({ status: 'pending' });
  const completedQuery = useTodos({ status: 'completed' });

  if (pendingQuery.isLoading || completedQuery.isLoading) {
    return { status: 'loading' };
  }

  if (pendingQuery.isError || completedQuery.isError) {
    const error = pendingQuery.error ?? completedQuery.error;
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  const pending = pendingQuery.data?.todos ?? [];
  const completed = completedQuery.data?.todos ?? [];

  return {
    status: 'success',
    pending,
    completed,
    total: pending.length + completed.length,
  };
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTodoRequest) =>
      todosApi.create(data).match(
        (todo) => todo,
        (error) => { throw new Error(error.type === 'network_error' ? error.message : 'Invalid response'); },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      todosApi.update(id, data).match(
        (todo) => todo,
        (error) => { throw new Error(error.type === 'network_error' ? error.message : 'Invalid response'); },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      todosApi.delete(id).match(
        () => undefined,
        (error) => { throw new Error(error.type === 'network_error' ? error.message : 'Invalid response'); },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}
