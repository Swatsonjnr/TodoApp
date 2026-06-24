import type { TodoResponse } from '@todo-app/contracts';
import { TodoItemView } from './TodoItemView';
import { useDeleteTodo, useUpdateTodo } from '../hooks/todo.hooks';

interface TodoItemProps {
  todo: TodoResponse;
}

export function TodoItem({ todo }: TodoItemProps) {
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  return (
    <TodoItemView
      todo={todo}
      onToggle={() =>
        updateTodo.mutate({
          id: todo.id,
          data: { status: todo.status === 'pending' ? 'completed' : 'pending' },
        })
      }
      onDelete={() => deleteTodo.mutate(todo.id)}
      isToggling={updateTodo.isPending}
      isDeleting={deleteTodo.isPending}
    />
  );
}
