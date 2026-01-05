import httpStatus from 'http-status'
import { baseServerErrorFactory } from '@/errors/base-server.error'

/**
 * Raised when the requested use has no authority to acess the resource. Can be used in server component / action / API route
 */
export const UnauthorizedError = baseServerErrorFactory(
  'Unauthorized',
  'You are not authorized to access this resource',
  httpStatus.UNAUTHORIZED,
)
