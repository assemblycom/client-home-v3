/**
 * Standardize the response format returned by the API
 */
export type APIResponse = {
  message?: string
  data?: object
  page?: number
  pageSize?: number
}

export enum AuthenticatedAPIHeaders {
  CUSTOM_APP_TOKEN = 'x-custom-app-token',
  INTERNAL_USER_ID = 'x-internal-user-id',
  CLIENT_ID = 'x-client-id',
  COMPANY_ID = 'x-company-id',
  WORKSPACE_ID = 'x-workspace-id',
}
