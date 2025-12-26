import { authenticateProxy } from '@auth/lib/authenticate'
import type { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/with-error-handler'

/**
 * Application proxy that handles authentication and authorization for internal and client users
 */
export const proxy = withErrorHandler(async (req: NextRequest) => {
  return await authenticateProxy(req)
})

export const config = {
  // Run middleware on all routes except Next internals and static files
  matcher: '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
}
