import { AssemblyNoTokenError } from '@assembly/errors'
import { authenticateToken } from '@auth/lib/authenticate'
import { getSanitizedHeaders } from '@auth/lib/utils'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { authorizedRoutes } from '@/app/routes'
import { NotFoundError } from '@/errors/not-found.error'
import { withErrorHandler } from '@/lib/with-error-handler'
import { AuthenticatedAPIHeaders } from './app/types'

/**
 * Application proxy that handles authentication and authorization for internal and client users
 */
export const proxy = withErrorHandler(async (req: NextRequest) => {
  const pathname = req.nextUrl.pathname

  const headers = getSanitizedHeaders(req)

  // Handle public routes
  if (authorizedRoutes.public.includes(pathname)) {
    return NextResponse.next({ headers })
  }

  const isInternal = authorizedRoutes.internalUsers.includes(pathname)
  const isClient = authorizedRoutes.clientUsers.includes(pathname)

  if (!isInternal && !isClient) {
    throw new NotFoundError()
  }

  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    throw new AssemblyNoTokenError()
  }

  const tokenPayload = await authenticateToken(token)

  return NextResponse.next({
    headers: {
      ...headers,
      [AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN]: token,
      [AuthenticatedAPIHeaders.INTERNAL_USER_ID]: tokenPayload.internalUserId,
      [AuthenticatedAPIHeaders.CLIENT_ID]: tokenPayload.clientId,
      [AuthenticatedAPIHeaders.COMPANY_ID]: tokenPayload.companyId,
      [AuthenticatedAPIHeaders.WORKSPACE_ID]: tokenPayload.workspaceId,
    },
  })
})

export const config = {
  // Run middleware on all routes except Next internals and static files
  matcher: '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
}
