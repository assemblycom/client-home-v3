import 'server-only'

// postgres.js connection error codes and node-level socket errnos that indicate
// a transient failure to reach the database (e.g. Supabase pooler restart or a
// momentary connection refusal) rather than a genuine query problem.
const TRANSIENT_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EPIPE',
  'CONNECTION_REFUSED',
  'CONNECTION_CLOSED',
  'CONNECTION_ENDED',
  'CONNECTION_DESTROYED',
  'CONNECT_TIMEOUT',
])

const TRANSIENT_ERROR_PATTERN =
  /econnrefused|failed to connect|connection (refused|closed|terminated|reset)|connect timeout/i

// Drizzle wraps the driver error in a DrizzleQueryError and exposes the original
// on `cause`, so we walk the cause chain to inspect the underlying failure.
const isTransientDbError = (error: unknown): boolean => {
  const seen = new Set<unknown>()
  let current: unknown = error

  while (current && typeof current === 'object' && !seen.has(current)) {
    seen.add(current)
    const err = current as { code?: unknown; message?: unknown; cause?: unknown }

    if (typeof err.code === 'string' && TRANSIENT_ERROR_CODES.has(err.code)) {
      return true
    }
    if (typeof err.message === 'string' && TRANSIENT_ERROR_PATTERN.test(err.message)) {
      return true
    }

    current = err.cause
  }

  return false
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type RetryOptions = {
  retries?: number
  baseDelayMs?: number
}

/**
 * Runs a database operation, retrying with exponential backoff only when it
 * fails with a transient connection error. Non-transient errors (and exhausted
 * retries) are rethrown so real failures still surface.
 */
export const retryOnTransientDbError = async <T>(
  operation: () => Promise<T>,
  { retries = 2, baseDelayMs = 100 }: RetryOptions = {},
): Promise<T> => {
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (!isTransientDbError(error) || attempt === retries) {
        throw error
      }
      await sleep(baseDelayMs * 2 ** attempt)
    }
  }

  throw lastError
}
