import { AssemblyBridge } from '@assembly-js/app-bridge'
import { useEffect } from 'react'

/**
 * Subscribes to session token updates from the parent dashboard via app-bridge.
 * Updates the page URL when the parent refreshes the token.
 *
 * Keeping the URL token fresh is critical: Next.js middleware reads `?token=` from
 * the page URL to authenticate server component renders. Without this, any SSR
 * re-render after the initial token expires (5 min) will fail with an auth error.
 *
 * Uses history.replaceState (not router.replace) to update the URL silently without
 * triggering a Next.js server-side re-render.
 */
export const useTokenRefresh = (portalUrl?: string) => {
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

      // Silently replace the URL token so the middleware sees a fresh token on
      // any subsequent server component render (Suspense retry, navigation, etc.)
      // Uses history.replaceState to avoid triggering a Next.js re-render.
      const url = new URL(window.location.href)
      url.searchParams.set('token', data.token)
      window.history.replaceState(window.history.state, '', url.toString())
    })

    return () => {
      window.removeEventListener('message', handleRawMessage)
      unsubscribe()
    }
  }, [portalUrl])
}
