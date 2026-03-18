import { isAxiosError } from 'axios'
import { TokenRefreshRedirect } from '@/features/app-bridge/components/TokenRefreshRedirect'

/**
 * Wraps a server component fetcher with 403 retry logic.
 * On first 403, retries the fetch once (token may still be valid but the API call failed transiently).
 * Only renders TokenRefreshRedirect if the retry also fails with 403.
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
          return <TokenRefreshRedirect />
        }
        throw retryError
      }
    }
    throw error
  }
}
