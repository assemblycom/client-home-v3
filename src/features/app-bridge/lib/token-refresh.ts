import { AssemblyBridge } from '@assembly-js/app-bridge'

/**
 * Shared singleton for token refresh requests.
 * Multiple components (TokenRefreshRedirect, useAxiosTokenRefresh) may request
 * a refresh simultaneously — this deduplicates so only one bridge call is made.
 */
let pendingRefresh: Promise<string> | null = null

export const refreshToken = (): Promise<string> => {
  if (!pendingRefresh) {
    pendingRefresh = AssemblyBridge.sessionToken
      .refresh()
      .then((data) => {
        // Update the URL so middleware sees the fresh token on the next server request
        const url = new URL(window.location.href)
        url.searchParams.set('token', data.token)
        window.history.replaceState(window.history.state, '', url.toString())
        return data.token
      })
      .finally(() => {
        pendingRefresh = null
      })
  }
  return pendingRefresh
}
