import type { TodoResponse } from '@todo-app/contracts';
import type { CreateTodoRequest } from '@todo-app/contracts';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';

interface TodosViewProps {
  // form
  onSubmit: (data: CreateTodoRequest) => void;
  isSubmitting: boolean;
  submitError: string | null;
  // list
  listStatus: 'loading' | 'error' | 'success';
  listError?: string;
  pending: TodoResponse[];
  completed: TodoResponse[];
  isEmpty: boolean;
  // item interactions
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  togglingId: string | null;
  deletingId: string | null;
}

export function TodosView({
  onSubmit,
  isSubmitting,
  submitError,
  listStatus,
  listError,
  pending,
  completed,
  isEmpty,
  onToggle,
  onDelete,
  togglingId,
  deletingId,
}: TodosViewProps) {
  return (
    <div className="space-y-6">
      <TodoForm onSubmit={onSubmit} isSubmitting={isSubmitting} submitError={submitError} />
      <TodoList
        listStatus={listStatus}
        listError={listError}
        pending={pending}
        completed={completed}
        isEmpty={isEmpty}
        onToggle={onToggle}
        onDelete={onDelete}
        togglingId={togglingId}
        deletingId={deletingId}
      />
    </div>
  );
}
