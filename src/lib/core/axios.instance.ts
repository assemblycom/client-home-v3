import { AssemblyBridge } from '@assembly-js/app-bridge'
import { authStore } from '@auth/stores/authStore'
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const TOKEN_REFRESH_THRESHOLD_MS = 60 * 1000 // 1 minute

export const createAxiosInstance = (config?: AxiosRequestConfig): AxiosInstance =>
  axios.create({
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
  })

export const api = createAxiosInstance({})

if (typeof window !== 'undefined') {
  api.interceptors.request.use(async (config) => {
    const { tokenExpiresAt } = authStore.getState()
    const timeRemaining = tokenExpiresAt - Date.now()

    if (timeRemaining < TOKEN_REFRESH_THRESHOLD_MS) {
      try {
        const tokenData = await AssemblyBridge.sessionToken.refresh()
        if (tokenData?.token) {
          authStore.getState().setToken(tokenData.token)
          if (config.url) {
            const url = new URL(config.url, window.location.origin)
            url.searchParams.set('token', tokenData.token)
            config.url = `${url.pathname}?${url.searchParams.toString()}`
          }
        }
      } catch (err) {
        console.error('[Interceptor] Failed to refresh token:', err)
      }
    }

    return config
  })
}
