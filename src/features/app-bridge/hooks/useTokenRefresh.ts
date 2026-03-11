import { AssemblyBridge } from '@assembly-js/app-bridge'
import { useAuthStore } from '@auth/providers/auth.provider'
import { useEffect } from 'react'

/**
 * Subscribes to session token updates from the parent dashboard via app-bridge.
 * Updates the auth store token when the parent refreshes it.
 */
export const useTokenRefresh = (portalUrl?: string) => {
  const setToken = useAuthStore((s) => s.setToken)

  useEffect(() => {
    if (portalUrl) {
      AssemblyBridge.configure({ additionalOrigins: [portalUrl], debug: true })
    }
  }, [portalUrl])

  // DEBUG: log all postMessages from parent to see what's actually being sent
  useEffect(() => {
    const debugListener = (event: MessageEvent) => {
      if (event.data?.type) {
        console.info('[DEBUG] postMessage received:', event.origin, event.data.type, event.data)
      }
    }
    window.addEventListener('message', debugListener)
    return () => window.removeEventListener('message', debugListener)
  }, [])

  useEffect(() => {
    const unsubscribe = AssemblyBridge.sessionToken.onTokenUpdate((data) => {
      console.info('TOKEN UPDATE INVOCATION:', data)
      setToken(data.token)
    })

    return unsubscribe
  }, [setToken])
}
