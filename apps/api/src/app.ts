import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { TodosService } from './modules/todos/todos.service.js';
import { todosRoute } from '@todo-app/api/src/modules/todos/todos.route.js';

export function buildApp(deps: { todosService: TodosService }) {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: 'http://localhost:5173',
  });

  app.register(todosRoute, {
    prefix: '/todos',
    service: deps.todosService,
  });

  return app;
}