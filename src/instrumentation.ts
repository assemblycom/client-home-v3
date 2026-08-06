import { AssemblyInvalidTokenError, AssemblyMissingHeadersError, AssemblyTokenParseError } from '@assembly/errors'
import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

// Expected 401-class auth failures, not bugs — skip Sentry noise (OUT-4013). Logged where thrown.
const isExpectedAuthError = (err: unknown) =>
  err instanceof AssemblyMissingHeadersError ||
  err instanceof AssemblyInvalidTokenError ||
  err instanceof AssemblyTokenParseError

export const onRequestError: typeof Sentry.captureRequestError = (err, request, context) => {
  if (isExpectedAuthError(err)) return
  return Sentry.captureRequestError(err, request, context)
}
