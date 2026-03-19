import '@assembly-js/design-system/dist/styles/main.css'
import { authenticateHeaders } from '@auth/lib/authenticate'
import { AuthProvider } from '@auth/providers/auth.provider'
import { AppProvider } from '@common/providers/app.provider'
import { SETTINGS_QUERY_KEY } from '@settings/constants'
import SettingsActionsService from '@settings/lib/settings-actions.service'
import { SettingsProvider } from '@settings/providers/settings.provider'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'
import { AuthenticatedAPIHeaders } from '@/app/types'
import { getQueryClient } from '@/lib/core/query.utils'

export default async function ProxyLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const requestHeaders = await headers()
  console.info('prios', requestHeaders.get(AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN))
  const user = authenticateHeaders(requestHeaders)

  const settingsService = SettingsActionsService.new(user)
  const settings = user.clientId ? await settingsService.getForClient() : await settingsService.getForWorkspace()

  const queryClient = getQueryClient()
  queryClient.setQueryData([SETTINGS_QUERY_KEY, null], settings)

  return (
    <AppProvider>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AuthProvider {...user}>
          <SettingsProvider settings={settings}>{children}</SettingsProvider>
        </AuthProvider>
      </HydrationBoundary>
    </AppProvider>
  )
}
