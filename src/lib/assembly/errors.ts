import status from 'http-status'
import { baseServerErrorFactory } from '@/errors/base-server-error'

/**
 * Raised when token provided to server component / action / API route cannot be decrypted / has invalid payload
 */
export const AssemblyInvalidTokenError = baseServerErrorFactory(
  'AssemblyInvalidTokenError',
  'Custom app token is invalid',
  status.UNAUTHORIZED,
)

/**
 * Raised when no token is provided for server component / action / API route
 */
export const AssemblyNoTokenError = baseServerErrorFactory(
  'AssemblyNoTokenError',
  'Custom app token is not provided',
  status.BAD_REQUEST,
)

/**
 * Raised when connection cannot be made to the Assembly API
 */
export const AssemblyConnectionError = baseServerErrorFactory(
  'AssemblyConnectionError',
  'Unable to connect to Assembly API',
  status.SERVICE_UNAVAILABLE,
)
