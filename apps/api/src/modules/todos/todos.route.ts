import type { FastifyInstance } from 'fastify';
import {
  CreateTodoRequestSchema,
  TodoResponseSchema,
  UpdateTodoRequestSchema,
} from '@todo-app/contracts/todos';
import type { TodosService } from '@todo-app/api/src/modules/todos/todos.service.js';
import type { TodoServiceError } from '@todo-app/api/src/modules/todos/todos.errors.js';
// import { assertUnreachable } from '@todo-app/api/src/lib/results.js';
// use validation from the contract to validate the data for all routes

function mapTodoError(error: TodoServiceError, id?: string) {
  switch (error.type) {
    case 'todo_not_found':
      return { status: 404, body: { error: `Todo ${id ?? error.id} not found` } };
    case 'todo_validation_error':
      return { status: 400, body: { error: error.message } };
    case 'service_unavailable':
      return { status: 503, body: { error: 'Service unavailable' } };
    default:
      const check: never = error;
      return check;
  }
}

export async function todosRoute(app: FastifyInstance, { service }: { service: TodosService }) {
  // get all
  app.get('/', async (_req, reply) => {
    const result = await service.listTodos();
    result.match(
      (data) => reply.status(200).send(data),
      () => reply.status(503).send({ error: 'Service unavailable' }),
    );
  });

  // get by Id
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const result = await service.getTodo(id);
    result.match(
      (todo) => {
        const parsed = TodoResponseSchema.safeParse(todo);
        if (!parsed.success) {
          return reply.status(500).send({ error: 'Invalid response shape' });
        }
        reply.status(200).send(todo);
      },
      (error) => {
        const { status, body } = mapTodoError(error);
        return reply.status(status).send(body);
      },
    );
  });

  // post
  app.post('/', async (req, reply) => {
    const parsed = CreateTodoRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0].message });
    }
    const result = await service.createTodo(parsed.data);
    result.match(
      (todo) => reply.status(201).send(todo),
      () => reply.status(503).send({ error: 'Service unavailable' }),
    );
  });

  // Update
  app.patch('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = UpdateTodoRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0].message });
    }
    const result = await service.updateTodo(id, parsed.data);
    result.match(
      (todo) => reply.status(200).send(todo),
      (error) => {
        const { status, body } = mapTodoError(error);
        return reply.status(status).send(body);
      },
    );
  });

  // Delete
  app.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const result = await service.deleteTodo(id);
    result.match(
      () => reply.status(204).send(),
      () => reply.status(503).send({ error: 'Service unavailable' }),
    );
  });
}
