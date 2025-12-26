import { AssemblyNoTokenError } from '@assembly/errors'
import { authenticateToken } from '@auth/lib/authenticate'
import { getSanitizedHeaders } from '@auth/lib/utils'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { authorizedRoutes, type HttpMethod, type RouteRule } from '@/app/routes'
import { NotFoundError } from '@/errors/not-found.error'
import { withErrorHandler } from '@/lib/with-error-handler'
import { AuthenticatedAPIHeaders } from './app/types'

/**
 * Application proxy that handles authentication and authorization for internal and client users
 */
export const proxy = withErrorHandler(async (req: NextRequest) => {
  const headers = getSanitizedHeaders(req)

  // Handle public routes
  if (isAuthorized(authorizedRoutes.public, req)) {
    return NextResponse.next({ headers })
  }

  const isInternal = isAuthorized(authorizedRoutes.internalUsers, req)
  const isClient = isAuthorized(authorizedRoutes.clientUsers, req)

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

// --- Helpers ---

function matches(rule: RouteRule, pathname: string, method: string) {
  if (typeof rule === 'string') return rule === pathname
  if (rule.path !== pathname) return false
  if (!rule.methods) return true
  return rule.methods.includes(method as HttpMethod)
}

function isAuthorized(rules: RouteRule[], req: NextRequest) {
  return rules.some((r) => matches(r, req.nextUrl.pathname, req.method))
}
