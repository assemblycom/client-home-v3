import { DASHBOARD_DOMAINS } from '@app-bridge/constants'
import { ensureHttps } from '@/utils/https'

/**
 * Attempts to send window.parent.postMessage to an array of possible domains
 * The valid dashboard domain will succeed while the others will fail
 * @param payload
 */
export const handleParentPostMessage = (payload: object, portalUrl?: string) => {
  if (portalUrl) {
    window.parent.postMessage(payload, ensureHttps(portalUrl))
    return
  }

  for (const domain of DASHBOARD_DOMAINS) {
    window.parent.postMessage(payload, domain)
  }
}
