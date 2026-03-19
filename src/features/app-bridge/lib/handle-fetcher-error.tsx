import { TokenRefreshRedirect } from '@app-bridge/components/TokenRefreshRedirect'
import { isAxiosError } from 'axios'

/**
 * Tracks whether a token refresh redirect has already been triggered in this
 * server render cycle. Prevents infinite loops: if router.refresh() re-renders
 * the fetchers and they still 403, we throw instead of rendering another
 * TokenRefreshRedirect.
 *
 * This flag resets naturally on each new server request (new module evaluation
 * in serverless / edge, or same process but fresh render in dev).
 */
let hasRedirected = false

/**
 * Wraps a server component fetcher with 403 retry logic.
 * On first 403, retries the fetch once (handles transient failures).
 * If the retry also 403s and no redirect has been triggered yet,
 * renders TokenRefreshRedirect for a client-side token refresh.
 * If a redirect was already triggered, throws to avoid an infinite loop.
 */
export const withFetcherErrorHandler = async <T,>(fetchFn: () => Promise<T>): Promise<T | React.ReactElement> => {
  try {
    return await fetchFn()
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      try {
        return await fetchFn()
      } catch (retryError) {
        if (isAxiosError(retryError) && retryError.response?.status === 403) {
          if (hasRedirected) {
            throw retryError
          }
          hasRedirected = true
          return <TokenRefreshRedirect />
        }
        throw retryError
      }
    }
    throw error
  }
}
