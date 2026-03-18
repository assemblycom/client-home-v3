import { isAxiosError } from 'axios'
import { TokenRefreshRedirect } from '@/features/app-bridge/components/TokenRefreshRedirect'

/**
 * Shared error handler for server component fetchers.
 * Returns a TokenRefreshRedirect on 403, re-throws otherwise.
 */
export const handleFetcherError = (error: unknown) => {
  if (isAxiosError(error) && error.response?.status === 403) {
    return <TokenRefreshRedirect />
  }
  throw error
}
