'use client'

import { refreshToken } from '@app-bridge/lib/token-refresh'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const MAX_RETRIES = 1
const RETRY_KEY = '__fetcher_refresh_count'

const getRetryCount = (): number => {
  try {
    return Number.parseInt(sessionStorage.getItem(RETRY_KEY) ?? '0', 10)
  } catch {
    return 0
  }
}

const incrementRetryCount = () => {
  try {
    sessionStorage.setItem(RETRY_KEY, String(getRetryCount() + 1))
  } catch {
    // noop
  }
}

/**
 * Clear the retry count. Called on successful app load so future
 * stale tokens get a fresh retry budget.
 */
export const resetFetcherRetryCount = () => {
  try {
    sessionStorage.removeItem(RETRY_KEY)
  } catch {
    // noop
  }
}

/**
 * Rendered by server component fetchers when they receive a 403 after retry.
 * Refreshes the token via app-bridge and triggers a soft re-render via router.refresh()
 * so server components re-run with a valid token — without a full page reload.
 *
 * Uses sessionStorage to cap retries and prevent infinite loops when the
 * refreshed token is also invalid (e.g. wrong token, bridge misconfigured).
 */
export const TokenRefreshRedirect = () => {
  const router = useRouter()

  useEffect(() => {
    const retryCount = getRetryCount()
    if (retryCount >= MAX_RETRIES) {
      console.error('[TokenRefreshRedirect] Max retries exceeded, stopping to prevent loop')
      return
    }

    console.info('[TokenRefreshRedirect] Server-side 403 detected, refreshing token via app-bridge')
    incrementRetryCount()

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
