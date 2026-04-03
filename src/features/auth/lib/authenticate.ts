import AssemblyClient from '@assembly/assembly-client'
import { AssemblyInvalidTokenError, AssemblyTokenParseError } from '@assembly/errors'
import type { User } from '@auth/lib/user.entity'
import { getSanitizedHeaders, isAuthorized } from '@auth/lib/utils'
import { HttpStatusCode } from 'axios'
import { type NextRequest, NextResponse } from 'next/server'
import z from 'zod'
import { authorizedRoutes, ROUTES } from '@/app/routes'
import { AuthenticatedAPIHeaders } from '@/app/types'
import { NotFoundError } from '@/errors/not-found.error'
import { UnauthorizedError } from '@/errors/unauthorized.error'
import type { Token } from '@/lib/assembly/types'

const MEDIA_TOKEN_COOKIE = '__assembly_media_token'

/**
 * Authenticates a Assembly user by token
 * @param token
 * @returns {Token} instance modeled from the token payload
 * @throws AssemblyNoTokenError when no token is provided
 * @throws AssemblyInvalidTokenError when the token is invalid
 * @throws AssemblyConnectionError when unable to connect to Assembly API
 */
const authenticateToken = async (token?: unknown): Promise<Token> => {
  const tokenParsed = z.string().min(1).safeParse(token)
  if (!tokenParsed.success) {
    console.error('AssemblyTokenParseError :: Token was present but failed validation', {
      tokenType: typeof token,
      tokenLength: typeof token === 'string' ? token.length : 0,
      isEmpty: token === '',
    })
    throw new AssemblyTokenParseError()
  }

  const assembly = new AssemblyClient(tokenParsed.data)
  const tokenPayload = await assembly.getTokenPayload()
  if (!tokenPayload) {
    throw new AssemblyInvalidTokenError()
  }

  return tokenPayload
}

export const authenticateProxy = async (req: NextRequest): Promise<NextResponse> => {
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

  // Read token from query param, falling back to cookie for image requests
  const token =
    req.nextUrl.searchParams.get('token') ??
    (req.nextUrl.pathname === ROUTES.api.image ? req.cookies.get(MEDIA_TOKEN_COOKIE)?.value : null) ??
    null

  if (!token) {
    console.warn('AssemblyNoTokenError :: No token query param found', {
      url: req.nextUrl.pathname,
      hasSearchParams: req.nextUrl.searchParams.toString().length > 0,
      searchParamKeys: [...req.nextUrl.searchParams.keys()],
    })
    return NextResponse.json(
      {
        message: 'Unauthorized',
      },
      { status: HttpStatusCode.Unauthorized },
    )
  }

  const tokenPayload = await authenticateToken(token)

  if ((tokenPayload.internalUserId && !isInternal) || (tokenPayload.clientId && !isClient)) {
    throw new UnauthorizedError()
  }

  const response = NextResponse.next({
    headers: {
      ...headers,
      ...Object.fromEntries(
        Object.entries({
          [AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN]: token,
          [AuthenticatedAPIHeaders.INTERNAL_USER_ID]: tokenPayload.internalUserId,
          [AuthenticatedAPIHeaders.CLIENT_ID]: tokenPayload.clientId,
          [AuthenticatedAPIHeaders.COMPANY_ID]: tokenPayload.companyId,
          [AuthenticatedAPIHeaders.WORKSPACE_ID]: tokenPayload.workspaceId,
        }).filter(([, v]) => v != null),
      ),
    },
  })

  // Set media auth cookie so image requests don't need the token in the URL.
  // This keeps image URLs stable and cacheable by CDN/browser.
  response.cookies.set(MEDIA_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: ROUTES.api.image,
  })

  return response
}

/**
 * Authenticates a Assembly user from request headers.
 * Uses: AuthenticatedAPIHeaders
 * @param headers containing required token payload header
 * @returns {User} instance modeled from the token payload headers
 * @throws AssemblyInvalidTokenError when the token payload headers are invalid
 */
export const authenticateHeaders = (headers: Headers): User => {
  const get = (headerName: string) => headers.get(headerName) || undefined

  const token = z.string().parse(get(AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN))
  const internalUserId = get(AuthenticatedAPIHeaders.INTERNAL_USER_ID)
  const clientId = get(AuthenticatedAPIHeaders.CLIENT_ID)
  const companyId = get(AuthenticatedAPIHeaders.COMPANY_ID)
  const workspaceId = z.string().parse(get(AuthenticatedAPIHeaders.WORKSPACE_ID))

  if (!internalUserId && !clientId) {
    throw new AssemblyInvalidTokenError()
  }

  return { token, internalUserId, clientId, companyId, workspaceId }
}
