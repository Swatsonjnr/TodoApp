import { describe, it, expect, vi, beforeEach } from 'vitest';
import { todosApi } from './todos.api';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockTodo = {
  id: '1',
  title: 'Test todo',
  description: null,
  status: 'pending',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('todosApi.getAll', () => {
  it('returns parsed todo list on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ todos: [mockTodo], total: 1 }),
    });

    const result = await todosApi.getAll();

    result.match(
      (data) => {
        expect(data.todos).toHaveLength(1);
        expect(data.todos[0].title).toBe('Test todo');
        expect(data.total).toBe(1);
      },
      () => { throw new Error('Expected success'); },
    );
  });

  it('returns network_error when server returns error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Service unavailable' }),
    });

    const result = await todosApi.getAll();

    result.match(
      () => { throw new Error('Expected error'); },
      (error) => {
        expect(error.type).toBe('network_error');
        if (error.type === 'network_error') {
          expect(error.message).toBe('Service unavailable');
        }
      },
    );
  });

  it('returns invalid_response when response shape does not match schema', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unexpected: 'shape' }),
    });

    const result = await todosApi.getAll();

    result.match(
      () => { throw new Error('Expected error'); },
      (error) => { expect(error.type).toBe('invalid_response'); },
    );
  });
});

describe('todosApi.create', () => {
  it('returns created todo on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodo,
    });

    const result = await todosApi.create({ title: 'Test todo' });

    result.match(
      (todo) => {
        expect(todo.id).toBe('1');
        expect(todo.title).toBe('Test todo');
      },
      () => { throw new Error('Expected success'); },
    );
  });

  it('returns validation_error when request is invalid', async () => {
    const result = await todosApi.create({ title: '' });

    result.match(
      () => { throw new Error('Expected error'); },
      (error) => { expect(error.type).toBe('validation_error'); },
    );
  });
});

describe('todosApi.delete', () => {
  it('returns ok on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    const result = await todosApi.delete('1');

    expect(result.isOk()).toBe(true);
  });

  it('returns network_error when server returns error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Todo 1 not found' }),
    });

    const result = await todosApi.delete('1');

    result.match(
      () => { throw new Error('Expected error'); },
      (error) => {
        expect(error.type).toBe('network_error');
        if (error.type === 'network_error') {
          expect(error.message).toBe('Todo 1 not found');
        }
      },
    );
  });
});
