import { refreshToken } from '@app-bridge/lib/token-refresh'
import { useEffect } from 'react'
import { api } from '@/lib/core/axios.instance'

/**
 * Axios response interceptor that transparently handles 403 (expired token) errors.
 * On 403: refreshes the token via shared refreshToken() and retries the original
 * request with the new token. No re-renders or reloads.
 *
 * Uses the shared refreshToken() singleton to deduplicate — if a server-side
 * TokenRefreshRedirect is already refreshing, this piggybacks on it.
 */
export const useAxiosTokenRefresh = () => {
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(undefined, async (error) => {
      const originalRequest = error.config

      if (error.response?.status !== 403 || originalRequest._hasRetried) {
        return Promise.reject(error)
      }

      originalRequest._hasRetried = true
      console.info('[useAxiosTokenRefresh] Received 403, refreshing token via app-bridge')

      try {
        const token = await refreshToken()
        console.info('[useAxiosTokenRefresh] Token refreshed, retrying request')

        // Retry the original request with the fresh token
        const requestUrl = new URL(originalRequest.url, window.location.origin)
        requestUrl.searchParams.set('token', token)
        originalRequest.url = requestUrl.toString()

        return api(originalRequest)
      } catch (refreshError) {
        console.error('[useAxiosTokenRefresh] Token refresh failed', refreshError)
        return Promise.reject(refreshError)
      }
    })

    return () => {
      api.interceptors.response.eject(interceptorId)
    }
  }, [])
}
