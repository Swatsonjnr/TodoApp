import { useState } from 'react';
import type { TodoResponse, CreateTodoRequest } from '@todo-app/contracts';
import { useTodosStatus, useCreateTodo, useUpdateTodo, useDeleteTodo } from '../hooks/todo.hooks';
import { TodosView } from '../views/TodosView';

type FlowState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; pending: TodoResponse[]; completed: TodoResponse[]; isEmpty: boolean };

function useFlow(): FlowState {
  const todosStatus = useTodosStatus();

  if (todosStatus.status === 'loading') {return { status: 'loading' }};
  if (todosStatus.status === 'error') {return { status: 'error', message: todosStatus.message }};

  // filtering should come from the backend for authenticity rather than having it being done on the frontend
  // have all 
  const pending = todosStatus.todos.filter((t) => t.status === 'pending');
  const completed = todosStatus.todos.filter((t) => t.status === 'completed');


  return { status: 'success', pending, completed, isEmpty: todosStatus.todos.length === 0 };
}

export function TodosFlow() {
  const flow = useFlow();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleSubmit(data: CreateTodoRequest) {
    createTodo.mutate(data);
  }

  // toggling should come from the backend for authenticity rather than having it being done on the frontend
  function handleToggle(id: string) {
    const todo =
      flow.status === 'success'
        ? [...flow.pending, ...flow.completed].find((t) => t.id === id)
        : undefined;

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

  const listStatus = flow.status;
  const listError = flow.status === 'error' ? flow.message : undefined;
  const pending = flow.status === 'success' ? flow.pending : [];
  const completed = flow.status === 'success' ? flow.completed : [];
  const isEmpty = flow.status === 'success' ? flow.isEmpty : true;

  return (
    <TodosView
      onSubmit={handleSubmit}
      isSubmitting={createTodo.isPending}
      submitError={createTodo.isError ? (createTodo.error?.message ?? 'Failed to create todo') : null}
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
