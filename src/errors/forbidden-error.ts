/* eslint-disable prettier/prettier */
import { ApplicationError } from '@/protocols';

export function forbiddenError(message: string): ApplicationError {
  return {
    name: 'ForbiddenError',
    message,
  };
}
