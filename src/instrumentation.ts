import { AssemblyMissingHeadersError } from '@assembly/errors'
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
  // Only suppress expected 401 noise (OUT-4013); other auth errors may mask real SDK failures.
  if (err instanceof AssemblyMissingHeadersError) return
  return Sentry.captureRequestError(err, request, context)
}
