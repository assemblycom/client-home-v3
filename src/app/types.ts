/**
 * Standardize the response format returned by the API
 */
export type APIResponse = {
  message?: string
  data?: object
  page?: number
  pageSize?: number
}
