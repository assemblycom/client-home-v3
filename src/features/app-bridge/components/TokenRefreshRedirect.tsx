'use client'

import { AssemblyBridge } from '@assembly-js/app-bridge'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Rendered by server component fetchers when they receive a 403.
 * Refreshes the token via app-bridge and triggers a soft navigation with the fresh token,
 * so server components re-run with a valid token — without a full page reload.
 */
export const TokenRefreshRedirect = () => {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const refresh = async () => {
      try {
        console.info('TokenRefreshRedirect | Server-side 403 detected, refreshing token via app-bridge')
        const data = await AssemblyBridge.sessionToken.refresh()
        console.info('TokenRefreshRedirect | Token refreshed, navigating with new token')
        const url = new URL(window.location.href)
        url.searchParams.set('token', data.token)
        router.replace(`${url.pathname}${url.search}`)
      } catch (err) {
        console.error('TokenRefreshRedirect | Token refresh failed', err)
        setError('Your session has expired and could not be renewed. Please reload the page or contact support.')
      }
    }
    void refresh()
  }, [router])

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            type="button"
            className="mt-3 text-blue-600 text-sm underline hover:text-blue-800"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }

  return null
}
