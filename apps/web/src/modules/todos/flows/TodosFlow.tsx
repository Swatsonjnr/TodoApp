import { useState } from 'react';
import type { CreateTodoRequest } from '@todo-app/contracts';
import { useTodosStatus, useCreateTodo, useUpdateTodo, useDeleteTodo } from '../hooks/todo.hooks';
import { TodosView } from '../views/TodosView';

export function TodosFlow() {
  const todosStatus = useTodosStatus();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleSubmit(data: CreateTodoRequest) {
    createTodo.mutate(data);
  }

  function handleToggle(id: string) {
    if (todosStatus.status !== 'success') {
      return;
    }

    const todo = [...todosStatus.pending, ...todosStatus.completed].find((t) => t.id === id);
    if (!todo) {
      return;
    }

    setTogglingId(id);
    updateTodo.mutate(
      { id, data: { status: todo.status === 'pending' ? 'completed' : 'pending' } },
      { onSettled: () => setTogglingId(null) },
    );
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteTodo.mutate(id, { onSettled: () => setDeletingId(null) });
  }

  const listStatus = todosStatus.status;
  const listError = todosStatus.status === 'error' ? todosStatus.message : undefined;
  const pending = todosStatus.status === 'success' ? todosStatus.pending : [];
  const completed = todosStatus.status === 'success' ? todosStatus.completed : [];
  const isEmpty = todosStatus.status === 'success' ? todosStatus.total === 0 : true;

  return (
    <TodosView
      onSubmit={handleSubmit}
      isSubmitting={createTodo.isPending}
      submitError={
        createTodo.isError ? (createTodo.error?.message ?? 'Failed to create todo') : null
      }
      listStatus={listStatus}
      listError={listError}
      pending={pending}
      completed={completed}
      isEmpty={isEmpty}
      onToggle={handleToggle}
      onDelete={handleDelete}
      togglingId={togglingId}
      deletingId={deletingId}
    />
  );
}
