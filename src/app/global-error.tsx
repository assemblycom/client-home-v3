'use client'

import { AssemblyBridge } from '@assembly-js/app-bridge'
import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'
import { useEffect, useRef, useState } from 'react'

const MAX_RETRIES = 2
const RETRY_COUNT_KEY = '__global_error_retry_count'

const getRetryCount = (): number => {
  try {
    return Number.parseInt(sessionStorage.getItem(RETRY_COUNT_KEY) ?? '0', 10)
  } catch {
    return 0
  }
}

const incrementRetryCount = (): number => {
  const count = getRetryCount() + 1
  try {
    sessionStorage.setItem(RETRY_COUNT_KEY, String(count))
  } catch {
    // noop
  }
  return count
}

const resetRetryCount = () => {
  try {
    sessionStorage.removeItem(RETRY_COUNT_KEY)
  } catch {
    // noop
  }
}

/**
 * Last-resort error boundary that catches layout-level failures.
 * When the proxy rejects a stale token, layout.tsx cannot read auth headers and throws.
 * Since the layout is gone, we must refresh the token client-side and do a full reload.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  const [isRefreshing, setIsRefreshing] = useState(true)
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current) return
    attempted.current = true

    const retryCount = getRetryCount()
    if (retryCount >= MAX_RETRIES) {
      resetRetryCount()
      setIsRefreshing(false)
      Sentry.captureException(error)
      return
    }

    incrementRetryCount()
    AssemblyBridge.configure({ debug: true })
    console.info('[GlobalError] Layout-level error, refreshing token via app-bridge')

    AssemblyBridge.sessionToken
      .refresh()
      .then((data) => {
        if (data?.token) {
          console.info('[GlobalError] Token refreshed, reloading with new token')
          resetRetryCount()
          const url = new URL(window.location.href)
          url.searchParams.set('token', data.token)
          window.location.href = url.toString()
        } else {
          setIsRefreshing(false)
          Sentry.captureException(error)
        }
      })
      .catch((refreshError) => {
        console.error('[GlobalError] Token refresh failed:', refreshError)
        setIsRefreshing(false)
        Sentry.captureException(error)
      })
  }, [error])

  if (isRefreshing) {
    return (
      <html lang="en">
        <body />
      </html>
    )
  }

  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
