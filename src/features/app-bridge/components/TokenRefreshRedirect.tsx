'use client'

import { AssemblyBridge } from '@assembly-js/app-bridge'
import { useEffect } from 'react'

/**
 * Rendered by server component fetchers when they receive a 403.
 * Refreshes the token via app-bridge and reloads the page with the fresh token,
 * so server components re-run with a valid token.
 */
export const TokenRefreshRedirect = () => {
  useEffect(() => {
    console.info('TokenRefreshRedirect | Server-side 403 detected, refreshing token via app-bridge')

    AssemblyBridge.sessionToken
      .refresh()
      .then((data) => {
        console.info('TokenRefreshRedirect | Token refreshed, reloading with new token')
        const url = new URL(window.location.href)
        url.searchParams.set('token', data.token)
        window.location.replace(url.toString())
      })
      .catch((error) => {
        console.error('TokenRefreshRedirect | Token refresh failed', error)
      })
  }, [])

  return null
}
