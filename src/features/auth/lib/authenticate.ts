import AssemblyClient from '@assembly/assembly-client'
import { AssemblyInvalidTokenError, AssemblyNoTokenError } from '@assembly/errors'
import type { User } from '@auth/lib/user.entity'
import { getSanitizedHeaders, isAuthorized } from '@auth/lib/utils'
import { type NextRequest, NextResponse } from 'next/server'
import z from 'zod'
import { authorizedRoutes } from '@/app/routes'
import { AuthenticatedAPIHeaders } from '@/app/types'
import { NotFoundError } from '@/errors/not-found.error'
import type { Token } from '@/lib/assembly/types'

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
    throw new AssemblyNoTokenError()
  }

  const assembly = new AssemblyClient(tokenParsed.data)
  const tokenPayload = await assembly.getTokenPayload()
  if (!tokenPayload) {
    throw new AssemblyInvalidTokenError('Unable to decode Copilot token payload')
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
