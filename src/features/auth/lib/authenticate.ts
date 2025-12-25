import AssemblyClient from '@assembly/assembly-client'
import { AssemblyInvalidTokenError, AssemblyNoTokenError } from '@assembly/errors'
import type { User } from '@auth/lib/user.entity'
import z from 'zod'

/**
 * Authenticates a Assembly user by token
 * @param token
 * @returns User instance modeled from the token payload
 * @throws AssemblyNoTokenError when no token is provided
 * @throws AssemblyInvalidTokenError when the token is invalid
 * @throws AssemblyConnectionError when unable to connect to Assembly API
 */
export const authenticateToken = async (token?: unknown) => {
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

export const authenticateHeaders = (headers: Headers): User => {
  const get = (headerName: string) => headers.get(headerName) || undefined

  const token = z.string().parse(get('x-custom-app-token'))
  const internalUserId = get('x-internal-user-id')
  const clientId = get('x-client-id')
  const companyId = get('x-company-id')
  const workspaceId = z.string().parse(get('x-workspace-id'))

  if (!internalUserId && !clientId) {
    throw new AssemblyNoTokenError()
  }

  return { token, internalUserId, clientId, companyId, workspaceId }
}
