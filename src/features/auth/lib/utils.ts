import type { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

/**
 * Prevent authorization bypass by injecting custom headers to request
 * @param req - Raw request
 * @returns Sanitized headers
 */
export const getSanitizedHeaders = (req: NextRequest) => {
  const sanitizedHeaders = new Headers(req.headers)

  sanitizedHeaders.delete('x-custom-app-token')
  sanitizedHeaders.delete('x-internal-user-id')
  sanitizedHeaders.delete('x-client-id')
  sanitizedHeaders.delete('x-company-id')
  sanitizedHeaders.delete('x-workspace-id')

  // This is an idempotent request trace ID used to track the entire session req/resp cycles
  if (!sanitizedHeaders.get('x-req-trace-id')) {
    sanitizedHeaders.set('x-req-trace-id', uuidv4())
  }

  return sanitizedHeaders
}
