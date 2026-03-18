import { AssemblyBridge } from '@assembly-js/app-bridge'
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

export const createAxiosInstance = (config?: AxiosRequestConfig): AxiosInstance =>
  axios.create({
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
  })

export const api = createAxiosInstance({})

// Inject the freshest session token into every request at call time.
// This avoids stale-token bugs caused by React closures capturing an old token at render time.
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const current = AssemblyBridge.sessionToken.getCurrent()
    if (current?.token && config.url) {
      const url = new URL(config.url, window.location.origin)
      url.searchParams.set('token', current.token)
      config.url = `${url.pathname}?${url.searchParams.toString()}`
    }
    return config
  })
}
