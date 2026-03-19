'use client'

import { refreshToken } from '@app-bridge/lib/token-refresh'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Rendered by server component fetchers when they receive a 403 after retry.
 * Refreshes the token via app-bridge and triggers a soft re-render via router.refresh()
 * so server components re-run with a valid token — without a full page reload.
 *
 * Uses the shared refreshToken() to deduplicate: when multiple fetchers fail
 * simultaneously, only one bridge call is made.
 */
export const TokenRefreshRedirect = () => {
  const router = useRouter()

  useEffect(() => {
    console.info('[TokenRefreshRedirect] Server-side 403 detected, refreshing token via app-bridge')

    refreshToken()
      .then(() => {
        console.info('[TokenRefreshRedirect] Token refreshed, soft re-rendering route')
        router.refresh()
      })
      .catch((err) => {
        console.error('[TokenRefreshRedirect] Token refresh failed', err)
      })
  }, [router])

  return null
}
