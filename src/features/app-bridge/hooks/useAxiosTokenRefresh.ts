import { AssemblyBridge } from '@assembly-js/app-bridge'
import { useAuthStore } from '@auth/providers/auth.provider'
import { useEffect } from 'react'
import { api } from '@/lib/core/axios.instance'

let refreshPromise: Promise<string> | null = null

/**
 * Axios response interceptor that transparently handles 403 (expired token) errors.
 * On 403: refreshes the token via AssemblyBridge, updates the auth store,
 * and retries the original request with the new token. No re-renders or reloads.
 *
 * Uses a shared promise to prevent race conditions when multiple requests
 * receive 403 simultaneously — only the first triggers a refresh.
 */
export const useAxiosTokenRefresh = () => {
  const setToken = useAuthStore((s) => s.setToken)

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(undefined, async (error) => {
      const originalRequest = error.config

      if (error.response?.status !== 403 || originalRequest._hasRetried) {
        return Promise.reject(error)
      }

      originalRequest._hasRetried = true
      console.info('useAxiosTokenRefresh | Received 403, refreshing token via app-bridge')

      try {
        if (!refreshPromise) {
          refreshPromise = AssemblyBridge.sessionToken
            .refresh()
            .then((d) => d.token)
            .finally(() => {
              refreshPromise = null
            })
        }

        const token = await refreshPromise
        console.info('useAxiosTokenRefresh | Token refreshed, retrying request')
        setToken(token)

        const url = new URL(originalRequest.url, window.location.origin)
        url.searchParams.set('token', token)
        originalRequest.url = url.toString()

        return api(originalRequest)
      } catch (refreshError) {
        console.error('useAxiosTokenRefresh | Token refresh failed', refreshError)
        return Promise.reject(refreshError)
      }
    })

    return () => {
      api.interceptors.response.eject(interceptorId)
    }
  }, [setToken])
}
