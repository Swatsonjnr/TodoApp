import type { TodoResponse } from '@todo-app/contracts';
import { TodoItemView } from './TodoItemView';

interface TodoListProps {
  listStatus: 'loading' | 'error' | 'success';
  listError?: string;
  pending: TodoResponse[];
  completed: TodoResponse[];
  isEmpty: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  togglingId: string | null;
  deletingId: string | null;
}

export function TodoList({
  listStatus,
  listError,
  pending,
  completed,
  isEmpty,
  onToggle,
  onDelete,
  togglingId,
  deletingId,
}: TodoListProps) {
  if (listStatus === 'loading') {
    return (
      <div className="flex justify-center py-12" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (listStatus === 'error') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {listError}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No todos yet. Create one above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Pending ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((todo) => (
              <TodoItemView
                key={todo.id}
                todo={todo}
                onToggle={() => onToggle(todo.id)}
                onDelete={() => onDelete(todo.id)}
                isToggling={togglingId === todo.id}
                isDeleting={deletingId === todo.id}
              />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Completed ({completed.length})
          </h2>
          <div className="space-y-2">
            {completed.map((todo) => (
              <TodoItemView
                key={todo.id}
                todo={todo}
                onToggle={() => onToggle(todo.id)}
                onDelete={() => onDelete(todo.id)}
                isToggling={togglingId === todo.id}
                isDeleting={deletingId === todo.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
