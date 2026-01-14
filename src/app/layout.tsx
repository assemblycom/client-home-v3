import 'copilot-design-system/dist/styles/main.css'
import { authenticateHeaders } from '@auth/lib/authenticate'
import { AuthProvider } from '@auth/providers/auth.provider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import { AppProvider } from './app-provider'
import './globals.css'

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
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider {...user}>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
