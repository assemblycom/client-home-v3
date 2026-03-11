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
      AssemblyBridge.configure({ additionalOrigins: [portalUrl] })
    }
    const unsubscribe = AssemblyBridge.sessionToken.onTokenUpdate((data) => {
      console.info('TOKEN UPDATE INVOCATION:', data)
      setToken(data.token)
    })

    return unsubscribe
  }, [portalUrl, setToken])
}
