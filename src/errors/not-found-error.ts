import { ApplicationError } from '@/protocols';

export function notFoundError(): ApplicationError {
  return {
    name: 'NotFoundError',
    message: 'No result for this search!',
  };
}
export function notFoundBookingError(): ApplicationError {
  return {
    name: 'NotFoundBookingError',
    message: 'Room not found!',
  };
}
