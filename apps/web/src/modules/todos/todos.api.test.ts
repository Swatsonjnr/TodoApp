import { describe, it, expect, vi, beforeEach } from 'vitest';
import { todosApi } from '../todos.api';

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

    expect(result.todos).toHaveLength(1);
    expect(result.todos[0].title).toBe('Test todo');
    expect(result.total).toBe(1);
  });

  it('throws with message when server returns error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Service unavailable' }),
    });

    await expect(todosApi.getAll()).rejects.toThrow('Service unavailable');
  });

  it('throws when response shape does not match schema', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unexpected: 'shape' }),
    });

    await expect(todosApi.getAll()).rejects.toThrow();
  });
});

describe('todosApi.create', () => {
  it('returns created todo on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodo,
    });

    const result = await todosApi.create({ title: 'Test todo' });

    expect(result.id).toBe('1');
    expect(result.title).toBe('Test todo');
  });

  it('throws when response shape is invalid', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1' }),
    });

    await expect(todosApi.create({ title: 'Test' })).rejects.toThrow();
  });
});

describe('todosApi.delete', () => {
  it('resolves void on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    await expect(todosApi.delete('1')).resolves.toBeUndefined();
  });

  it('throws when server returns error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Todo 1 not found' }),
    });

    await expect(todosApi.delete('1')).rejects.toThrow('Todo 1 not found');
  });
});