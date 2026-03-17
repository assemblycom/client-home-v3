import * as Sentry from '@sentry/nextjs'

import pRetry from 'p-retry'
import type { StatusableError } from '@/errors/base-server.error'
import logger from '@/lib/logger'

interface WithRetryOptions {
  onForbidden?: () => Promise<void>
}

export const withRetry = async <Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  args: Args,
  options?: WithRetryOptions,
): Promise<R> => {
  let isEventProcessorRegistered = false
  let hasRefreshedToken = false

  return await pRetry(
    async () => {
      try {
        return await fn(...args)
      } catch (error) {
        Sentry.withScope((scope) => {
          if (isEventProcessorRegistered) return
          isEventProcessorRegistered = true
          scope.addEventProcessor((event) => {
            if (event.level === 'error' && event.message && event.message.includes('An error occurred during retry')) {
              return null // Discard the event as it occured during retry
            }
            return event
          })
        })
        // Rethrow the error so pRetry can retry
        throw error
      }
    },

    {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 5000,
      factor: 2, // Exponential factor for timeout delay. Tweak this if issues still persist

      onFailedAttempt: async (error: { error: unknown; attemptNumber: number; retriesLeft: number }) => {
        const status = (error.error as StatusableError).status

        if (status === 403 && !hasRefreshedToken && options?.onForbidden) {
          logger.warn(
            `withRetry | Attempt ${error.attemptNumber} failed with 403. Refreshing token before retry. ${error.retriesLeft} retries left.`,
          )
          await options.onForbidden()
          hasRefreshedToken = true
          return
        }

        if (status !== 429 && status !== 500) {
          return
        }
        logger.warn(
          `withRetry | Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left. Error:`,
          error,
        )
      },
      shouldRetry: (error: unknown) => {
        const err = error as StatusableError
        return err.status === 429 || err.status === 500 || (err.status === 403 && !hasRefreshedToken)
      },
    },
  )
}
