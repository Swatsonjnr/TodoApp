import { eq } from 'drizzle-orm';
import { fromPromise, ok, err } from 'neverthrow';
import { z } from 'zod';
import { TodoStatusSchema } from '@todo-app/contracts/todos';
import type { Db } from '../../db/index.js';
import { todos } from '../../db/schema.js';

const DbTodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: TodoStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

type ServiceUnavailable = { type: 'service_unavailable' };

export class TodosRepository {
  constructor(private readonly db: Db) {}

  findAll() {
    return fromPromise(
      this.db
        .select({
          id: todos.id,
          title: todos.title,
          description: todos.description,
          status: todos.status,
          createdAt: todos.createdAt,
          updatedAt: todos.updatedAt,
        })
        .from(todos)
        .all(),
      (): ServiceUnavailable => ({ type: 'service_unavailable' }),
    ).map((rows) => DbTodoSchema.array().parse(rows));
  }

  findById(id: string) {
    return fromPromise(
      this.db.select().from(todos).where(eq(todos.id, id)).get(),
      (): ServiceUnavailable => ({ type: 'service_unavailable' }),
    ).andThen((row) => {
      if (!row) {
        return err({ type: 'todo_not_found' as const, id });
      }
      return ok(DbTodoSchema.parse(row));
    });
  }

  create(data: { title: string; description?: string }) {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    return fromPromise(
      this.db
        .insert(todos)
        .values({
          id,
          title: data.title,
          description: data.description ?? null,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        })
        .run(),

      (): ServiceUnavailable => ({ type: 'service_unavailable' }),
    ).andThen(() => this.findById(id));
  }

  update(
    id: string,
    data: { title?: string; description?: string; status?: 'pending' | 'completed' },
  ) {
    const now = new Date().toISOString();
    return fromPromise(
      this.db
        .update(todos)
        .set({ ...data, updatedAt: now })
        .where(eq(todos.id, id))
        .run(),

      (): ServiceUnavailable => ({ type: 'service_unavailable' }),
    ).andThen(() => this.findById(id));
  }

  delete(id: string) {
    return fromPromise(
      this.db.delete(todos).where(eq(todos.id, id)).run(),
      (): ServiceUnavailable => ({ type: 'service_unavailable' }),
    );
  }
}
