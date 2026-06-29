import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { ok, err } from 'neverthrow';
import * as todosApiModule from '../todos.api';
import { useTodosStatus } from './todo.hooks';

vi.mock('../todos.api');

const mockTodo = {
  id: '1',
  title: 'Test todo',
  description: null,
  status: 'pending' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useTodosStatus', () => {
  it('returns loading status while fetching', () => {
    vi.spyOn(todosApiModule.todosApi, 'getAll').mockReturnValue(
      new Promise(() => {}) as never,
    );

    const { result } = renderHook(() => useTodosStatus(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.status).toBe('loading');
  });

  it('returns success status with todos when fetch succeeds', async () => {
    vi.spyOn(todosApiModule.todosApi, 'getAll').mockReturnValue(
      ok({ todos: [mockTodo], total: 1 }) as never,
    );

    const { result } = renderHook(() => useTodosStatus(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('success'));

    if (result.current.status === 'success') {
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].title).toBe('Test todo');
    }
  });

  it('returns error status with message when fetch fails', async () => {
    vi.spyOn(todosApiModule.todosApi, 'getAll').mockReturnValue(
      err({ type: 'network_error', message: 'Service unavailable' }) as never,
    );

    const { result } = renderHook(() => useTodosStatus(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('error'));

    if (result.current.status === 'error') {
      expect(result.current.message).toBe('Service unavailable');
    }
  });
});
