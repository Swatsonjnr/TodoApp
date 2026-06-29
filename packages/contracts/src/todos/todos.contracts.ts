import { z } from 'zod';

export const TodoStatusSchema = z.enum(['pending', 'completed']);

export const CreateTodoRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});

export const UpdateTodoRequestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: TodoStatusSchema.optional(),
});

export const TodoResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: TodoStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TodoListResponseSchema = z.object({
  todos: z.array(TodoResponseSchema),
  total: z.number(),
});

export const TodoListQuerySchema = z.object({
  status: TodoStatusSchema.optional(),
});

export type TodoStatus = z.infer<typeof TodoStatusSchema>;
export type TodoListQuery = z.infer<typeof TodoListQuerySchema>;
export type CreateTodoRequest = z.infer<typeof CreateTodoRequestSchema>;
export type UpdateTodoRequest = z.infer<typeof UpdateTodoRequestSchema>;
export type TodoResponse = z.infer<typeof TodoResponseSchema>;
export type TodoListResponse = z.infer<typeof TodoListResponseSchema>;