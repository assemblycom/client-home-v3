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
    })

    return () => {
      window.removeEventListener('message', handleRawMessage)
      unsubscribe()
    }
  }, [portalUrl, setToken])
}
