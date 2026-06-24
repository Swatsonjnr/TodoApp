import type { TodoResponse } from '@todo-app/contracts';
// have one view to receive all the components and make them take props 
interface TodoItemViewProps {
  todo: TodoResponse;
  onToggle: () => void;
  onDelete: () => void;
  isToggling: boolean;
  isDeleting: boolean;
}

export function TodoItemView({
  todo,
  onToggle,
  onDelete,
  isToggling,
  isDeleting,
}: TodoItemViewProps) {
  const isCompleted = todo.status === 'completed';

  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg border bg-white ${isCompleted ? 'opacity-60' : ''}`}>
      <button
        onClick={onToggle}
        disabled={isToggling}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          isCompleted
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-gray-300 hover:border-emerald-400'
        }`}
        aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
      >
        {isCompleted && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-gray-900 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
          {todo.title}
        </p>
        {todo.description && (
          <p className="mt-1 text-sm text-gray-500">{todo.description}</p>
        )}
      </div>

      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        aria-label="Delete todo"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
          <path
            d="M3 4h10M6 4V3h4v1M5 4v8h6V4H5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}