import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import { todos } from './schema.js';

export async function createDb(url: string) {
  const client = createClient({ url });
  const db = drizzle(client, { schema: { todos } });

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  return db;
}

export type Db = Awaited<ReturnType<typeof createDb>>;