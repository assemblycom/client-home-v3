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
