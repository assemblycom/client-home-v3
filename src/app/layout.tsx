import 'copilot-design-system/dist/styles/main.css'
import { authenticateHeaders } from '@auth/lib/authenticate'
import { AuthProvider } from '@auth/providers/auth.provider'
import { AppProvider } from '@common/providers/app.provider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import { SETTINGS_QUERY_KEY } from '@settings/constants'
import SettingsActionsService from '@settings/lib/settings-actions.service'
import { SettingsProvider } from '@settings/providers/settings.provider'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/core/query.utils'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'Assembly Client Home',
  description: 'A modern and dynamic Homepage for your clients',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const requestHeaders = await headers()
  const user = authenticateHeaders(requestHeaders)

  // Needed for both IU & client
  const settingsService = SettingsActionsService.new(user)
  const settings = await settingsService.getForWorkspace()

  const queryClient = getQueryClient()
  queryClient.setQueryData([SETTINGS_QUERY_KEY], settings)

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AppProvider>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <AuthProvider {...user}>
              <SettingsProvider settings={settings}>{children}</SettingsProvider>
            </AuthProvider>
          </HydrationBoundary>
        </AppProvider>
      </body>
    </html>
  )
}
