import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoList } from './TodoList';

const mockPending = {
  id: '1',
  title: 'Buy groceries',
  description: null,
  status: 'pending' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockCompleted = {
  id: '2',
  title: 'Walk the dog',
  description: null,
  status: 'completed' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const baseProps = {
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  togglingId: null,
  deletingId: null,
};

describe('TodoList', () => {
  it('shows a spinner when loading', () => {
    render(
      <TodoList {...baseProps} listStatus="loading" pending={[]} completed={[]} isEmpty={true} />,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an error message when fetch fails', () => {
    render(
      <TodoList
        {...baseProps}
        listStatus="error"
        listError="Service unavailable"
        pending={[]}
        completed={[]}
        isEmpty={true}
      />,
    );
    expect(screen.getByText(/service unavailable/i)).toBeInTheDocument();
  });

  it('shows empty state when there are no todos', () => {
    render(
      <TodoList {...baseProps} listStatus="success" pending={[]} completed={[]} isEmpty={true} />,
    );
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('renders pending and completed todos', () => {
    render(
      <TodoList
        {...baseProps}
        listStatus="success"
        pending={[mockPending]}
        completed={[mockCompleted]}
        isEmpty={false}
      />,
    );
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
  });
});
