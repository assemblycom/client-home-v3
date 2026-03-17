import 'server-only'

import env from '@/config/env'
import logger from '@/lib/logger'

const REFRESH_URL = 'https://app-api.copilot.app/v1/session-tokens/refresh'

interface RefreshTokenResponse {
  token: string
  tokenId: string
  supportsExpiringTokens: boolean
}

export const refreshSessionToken = async (currentToken: string): Promise<RefreshTokenResponse> => {
  logger.info('refreshSessionToken | Requesting token refresh from Assembly API')

  const response = await fetch(REFRESH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appId: env.ASSEMBLY_APP_ID,
      token: currentToken,
    }),
  })

  if (!response.ok) {
    logger.error(`refreshSessionToken | Token refresh failed with status ${response.status}`)
    throw new Error(`Token refresh failed with status ${response.status}`)
  }

  const data: RefreshTokenResponse = await response.json()
  logger.info('refreshSessionToken | Token refresh successful')
  return data
}
