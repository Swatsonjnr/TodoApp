import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { TodosFlow } from '@/modules/todos/flows/TodosFlow';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <TodosFlow />,
});
