export type TodoNotFoundError = {
  type: 'todo_not_found';
  id: string;
};

export type TodoValidationError = {
  type: 'todo_validation_error';
  message: string;
};

export type ServiceUnavailableError = {
  type: 'service_unavailable';
};


export type TodoServiceError =
  | TodoNotFoundError
  | TodoValidationError
  | ServiceUnavailableError;

export const todoErrors = {
  notFound: (id: string): TodoNotFoundError => ({ type: 'todo_not_found', id }),
  validation: (message: string): TodoValidationError => ({ type: 'todo_validation_error', message }),
  serviceUnavailable: (): ServiceUnavailableError => ({ type: 'service_unavailable' }),
};