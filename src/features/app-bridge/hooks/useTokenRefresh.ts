import { AssemblyBridge } from '@assembly-js/app-bridge'
import { useAuthStore } from '@auth/providers/auth.provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Subscribes to session token updates from the parent dashboard via app-bridge.
 * Updates the auth store token and the page URL when the parent refreshes it.
 *
 * Keeping the URL token fresh is critical: Next.js middleware reads `?token=` from
 * the page URL to authenticate server component renders. Without this, any SSR
 * re-render after the initial token expires (5 min) will fail with an auth error.
 */
export const useTokenRefresh = (portalUrl?: string) => {
  const setToken = useAuthStore((s) => s.setToken)
  const router = useRouter()

  useEffect(() => {
    AssemblyBridge.configure({ debug: true })

    if (portalUrl) {
      AssemblyBridge.configure({ additionalOrigins: [portalUrl] })
    }

    console.info('[Bridge] portalUrl:', portalUrl ?? '(none)')

    const handleRawMessage = (e: MessageEvent) => {
      if (typeof e.data?.type === 'string' && e.data.type.startsWith('sessionToken')) {
        console.info('[Bridge] raw message received', e.origin, e.data.type)
      }
    }
    window.addEventListener('message', handleRawMessage)

    const unsubscribe = AssemblyBridge.sessionToken.onTokenUpdate((data) => {
      console.info('[Bridge] token update received', data)
      setToken(data.token)

      // Replace the URL token so the middleware always sees a fresh token on
      // any subsequent server component render (Suspense retry, navigation, etc.)
      const url = new URL(window.location.href)
      url.searchParams.set('token', data.token)
      router.replace(url.toString())
    })

    return () => {
      window.removeEventListener('message', handleRawMessage)
      unsubscribe()
    }
  }, [portalUrl, setToken, router])
}
