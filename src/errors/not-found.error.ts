import httpStatus from 'http-status'
import { baseServerErrorFactory } from '@/errors/base-server.error'

/**
 * Raised when no token is provided for server component / action / API route
 */
export const NotFoundError = baseServerErrorFactory(
  'NotFound',
  'The requested page was not found',
  httpStatus.NOT_FOUND,
)
