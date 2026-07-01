import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTodoRequest, UpdateTodoRequest, TodoResponse } from '@todo-app/contracts';
import { todosApi } from '../todos.api';
// fetch all todos and have 
export const todoKeys = {
  all: ['todos'] as const,
  detail: (id: string) => ['todos', id] as const,
};

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

type TodosStatus =
  | { status: 'loading' }
  | { status: 'success'; pending: TodoResponse[]; completed: TodoResponse[]; total: number }
  | { status: 'error'; message: string };

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

  const all = query.data?.todos ?? [];
  const pending = all.filter((t) => t.status === 'pending');
  const completed = all.filter((t) => t.status === 'completed');

  return {
    status: 'success',
    pending,
    completed,
    total: all.length,
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
