'use client'

import { useAxiosTokenRefresh } from '@app-bridge/hooks'

/**
 * Mounts the Axios 403 token refresh interceptor as early as possible in the component tree.
 * Place this inside AuthProvider so all API calls are covered.
 */
export const AxiosTokenRefreshSetup = () => {
  useAxiosTokenRefresh()
  return null
}
