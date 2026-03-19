import status from 'http-status'
import { baseServerErrorFactory } from '@/errors/base-server.error'

/**
 * Raised when token provided to server component / action / API route cannot be decrypted / has invalid payload
 */
export const AssemblyInvalidTokenError = baseServerErrorFactory(
  'AssemblyInvalidTokenError',
  'Failed to authenticate Assembly with provided token',
  status.UNAUTHORIZED,
)

/**
 * Raised when no token is provided in the request query string
 */
export const AssemblyNoTokenError = baseServerErrorFactory(
  'AssemblyNoTokenError',
  'Custom app token is not provided',
  status.BAD_REQUEST,
)

/**
 * Raised when a token is present but cannot be parsed (empty string, wrong format, etc.)
 */
export const AssemblyTokenParseError = baseServerErrorFactory(
  'AssemblyTokenParseError',
  'Custom app token is present but could not be parsed',
  status.BAD_REQUEST,
)

/**
 * Raised when the proxy did not inject the expected auth headers for a server component
 */
export const AssemblyMissingHeadersError = baseServerErrorFactory(
  'AssemblyMissingHeadersError',
  'Authenticated headers were not set by the proxy',
  status.UNAUTHORIZED,
)

/**
 * Raised when connection cannot be made to the Assembly API
 */
export const AssemblyConnectionError = baseServerErrorFactory(
  'AssemblyConnectionError',
  'Unable to connect to Assembly API',
  status.SERVICE_UNAVAILABLE,
)
