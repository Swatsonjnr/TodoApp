import type { ResultAsync } from 'neverthrow';
import type { CreateTodoRequest, UpdateTodoRequest, TodoResponse } from '@todo-app/contracts/todos';
import type { TodosRepository } from './todos.repository.js';
import type { TodoServiceError } from './todos.errors.js';

export class TodosService {
  constructor(private readonly repository: TodosRepository) {}

  listTodos(filter?: { status?: 'pending' | 'completed' }): ResultAsync<{ todos: TodoResponse[]; total: number }, TodoServiceError> {
    return this.repository.findAll(filter).map((todos) => ({
      todos,
      total: todos.length,
    }));
  }

  getTodo(id: string): ResultAsync<TodoResponse, TodoServiceError> {
    return this.repository.findById(id);
  }

  createTodo(data: CreateTodoRequest): ResultAsync<TodoResponse, TodoServiceError> {
    return this.repository.create(data);
  }

  updateTodo(id: string, data: UpdateTodoRequest): ResultAsync<TodoResponse, TodoServiceError> {
    return this.repository.update(id, data);
  }

  deleteTodo(id: string): ResultAsync<unknown, TodoServiceError> {
    return this.repository.delete(id);
  }
}