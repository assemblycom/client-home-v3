import { AssemblyBridge } from '@assembly-js/app-bridge'
import { useAuthStore } from '@auth/providers/auth.provider'
import { useEffect } from 'react'
import { api } from '@/lib/core/axios.instance'

/**
 * Axios response interceptor that transparently handles 403 (expired token) errors.
 * On 403: refreshes the token via AssemblyBridge, updates the auth store,
 * and retries the original request with the new token. No re-renders or reloads.
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
        const data = await AssemblyBridge.sessionToken.refresh()
        console.info('useAxiosTokenRefresh | Token refreshed, retrying request')
        setToken(data.token)

        originalRequest.url = originalRequest.url.replace(/token=[^&]+/, `token=${data.token}`)
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
