import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoItemView } from '@todo-app/web/src/modules/todos/components/TodoItemView';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

const mockTodo = {
  id: '1',
  title: 'Buy groceries',
  description: 'Milk and eggs',
  status: 'pending' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

afterEach(() => {
  cleanup();
});

describe('TodoItemView', () => {
  it('renders the todo title', () => {
    render(
      <TodoItemView
        todo={mockTodo}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        isToggling={false}
        isDeleting={false}
      />,
    );

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  it('renders the description when present', () => {
    render(
      <TodoItemView
        todo={mockTodo}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        isToggling={false}
        isDeleting={false}
      />,
    );

    expect(screen.getByText('Milk and eggs')).toBeInTheDocument();
  });

  it('calls onToggle when toggle button is clicked', () => {
    const onToggle = vi.fn();

    render(
      <TodoItemView
        todo={mockTodo}
        onToggle={onToggle}
        onDelete={vi.fn()}
        isToggling={false}
        isDeleting={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /mark as completed/i }));

    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();

    render(
      <TodoItemView
        todo={mockTodo}
        onToggle={vi.fn()}
        onDelete={onDelete}
        isToggling={false}
        isDeleting={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('disables toggle button while toggling', () => {
    render(
      <TodoItemView
        todo={mockTodo}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        isToggling={true}
        isDeleting={false}
      />,
    );

    expect(screen.getByRole('button', { name: /mark as completed/i })).toBeDisabled();
  });

  it('shows strikethrough and completed style when todo is completed', () => {
    render(
      <TodoItemView
        todo={{ ...mockTodo, status: 'completed' }}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        isToggling={false}
        isDeleting={false}
      />,
    );

    expect(screen.getByText('Buy groceries')).toHaveClass('line-through');
  });
});
