import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { CreateTodoRequestSchema } from '@todo-app/contracts';
import type { CreateTodoRequest } from '@todo-app/contracts';

interface TodoFormProps {
  onSubmit: (data: CreateTodoRequest) => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export function TodoForm({ onSubmit, isSubmitting, submitError }: TodoFormProps) {
  const form = useForm({
    defaultValues: { title: '', description: '' },
    onSubmit: async ({ value }) => {
      const parsed = CreateTodoRequestSchema.safeParse({
        title: value.title,
        description: value.description || undefined,
      });
      if (!parsed.success) {
        return;
      }
      onSubmit(parsed.data);
      form.reset();
    },
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add a new todo</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="title"
          validators={{
            onChange: ({ value }) => {
              const result = z.string().min(1, 'Title is required').max(255).safeParse(value);
              return result.success ? undefined : result.error.issues[0]?.message;
            },
          }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-xs text-red-600">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Add more details..."
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          )}
        </form.Field>

        <div className="flex items-center justify-between">
          {submitError ? (
            <p className="text-sm text-red-600">{submitError}</p>
          ) : (
            <span />
          )}

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, formIsSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || formIsSubmitting || isSubmitting}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Adding...' : 'Add Todo'}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}