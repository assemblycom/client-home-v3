import { ASSEMBLY_MISSING_HEADERS_ERROR_NAME } from '@assembly/errors'
import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export const onRequestError: typeof Sentry.captureRequestError = (err, request, context) => {
  // Match by name: instrumentation is a separate bundle, so instanceof never matches.
  if (err instanceof Error && err.name === ASSEMBLY_MISSING_HEADERS_ERROR_NAME) return
  return Sentry.captureRequestError(err, request, context)
}
