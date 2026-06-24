import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodosView } from '../views/TodosView';

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
  onSubmit: vi.fn(),
  isSubmitting: false,
  submitError: null,
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  togglingId: null,
  deletingId: null,
};

describe('TodosView', () => {
  it('renders the form', () => {
    render(
      <TodosView {...baseProps} listStatus="success" pending={[]} completed={[]} isEmpty={true} />,
    );

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('shows spinner when list is loading', () => {
    render(
      <TodosView {...baseProps} listStatus="loading" pending={[]} completed={[]} isEmpty={true} />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error when list fails', () => {
    render(
      <TodosView
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

  it('shows empty state when no todos', () => {
    render(
      <TodosView {...baseProps} listStatus="success" pending={[]} completed={[]} isEmpty={true} />,
    );

    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('renders pending and completed todos', () => {
    render(
      <TodosView
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

  it('calls onSubmit when form is submitted with a title', async () => {
    const onSubmit = vi.fn();

    render(
      <TodosView
        {...baseProps}
        onSubmit={onSubmit}
        listStatus="success"
        pending={[]}
        completed={[]}
        isEmpty={true}
      />,
    );

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New todo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add todo/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ title: 'New todo', description: undefined });
    });
  });

  it('disables submit button while submitting', () => {
    render(
      <TodosView
        {...baseProps}
        isSubmitting={true}
        listStatus="success"
        pending={[]}
        completed={[]}
        isEmpty={true}
      />,
    );

    expect(screen.getByRole('button', { name: /adding/i })).toBeDisabled();
  });
});
