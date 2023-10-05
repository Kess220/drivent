import { ApplicationError } from '@/protocols';

export function notFoundError(): ApplicationError {
  return {
    name: 'NotFoundError',
    message: 'No result for this search!',
  };
}
export function notFoundBookingError(message: string): ApplicationError {
  return {
    name: 'NotFoundBookingError',
    message,
  };
}
