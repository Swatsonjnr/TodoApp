import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTodoRequest, UpdateTodoRequest, TodoResponse } from '@todo-app/contracts';
import { todosApi } from '../todos.api';

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
    queryFn: () =>
      todosApi.getAll().match(
        (data) => data,
        (error) => { throw new Error(error.type === 'network_error' ? error.message : 'Invalid response'); },
      ),
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
