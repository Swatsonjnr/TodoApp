import { createDb } from './db/index.js';
import { TodosRepository } from './modules/todos/todos.repository.js';
import { TodosService } from './modules/todos/todos.service.js';
import { buildApp } from './app.js';

const databaseUrl = process.env['DATABASE_URL'];
const port = Number(process.env['PORT'] ?? 3001);
const host = process.env['HOST'] ?? '0.0.0.0';

if (!databaseUrl) {
  console.error('Missing required env var: DATABASE_URL');
  process.exit(1);
}

const db = await createDb(databaseUrl);
const todosRepository = new TodosRepository(db);
const todosService = new TodosService(todosRepository);

const app = buildApp({ todosService });

app.listen({ port, host }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
