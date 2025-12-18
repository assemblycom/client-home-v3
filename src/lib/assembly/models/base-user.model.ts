import AssemblyClient from '@assembly/assembly-client'
import { AssemblyConnectionError, AssemblyInvalidTokenError, AssemblyNoTokenError } from '@assembly/errors'
import { z } from 'zod'

export interface BaseUserToken {
  workspaceId: string
}

export default abstract class BaseUser {
  readonly workspaceId: string
  readonly assembly: AssemblyClient

  constructor(
    public readonly token: string,
    tokenPayload: BaseUserToken,
    assembly?: AssemblyClient,
  ) {
    this.workspaceId = tokenPayload.workspaceId
    this.assembly = assembly || new AssemblyClient(token)
  }

  /**
   * Shared authentication logic for Assembly users
   * @param token
   * @returns Object containing original token, decoded payload, and assembly client
   */
  protected static async authenticateBase<T>(
    token: unknown,
    schema: z.ZodType<T>,
  ): Promise<{
    token: string
    payload: T
    assembly: AssemblyClient
  }> {
    if (!token) {
      throw new AssemblyNoTokenError()
    }

    const tokenParsed = z.string().min(1).safeParse(token)

    if (!tokenParsed.success) {
      throw new AssemblyInvalidTokenError()
    }

    let assembly: AssemblyClient
    try {
      assembly = new AssemblyClient(tokenParsed.data)
    } catch (err) {
      if (err instanceof Error && err.message.toLowerCase().includes('unable to authorize')) {
        throw new AssemblyInvalidTokenError()
      }
      throw new AssemblyConnectionError()
    }

    const payload = schema.parse(await assembly.getTokenPayload())
    if (!payload) {
      throw new AssemblyInvalidTokenError()
    }

    return { token: tokenParsed.data, payload, assembly }
  }
}
