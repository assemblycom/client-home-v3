import type AssemblyClient from '@assembly/assembly-client'
import BaseUser from '@assembly/models/base-user.model'
import { type InternalUserToken, InternalUserTokenSchema } from '@assembly/types'

export default class InternalUser extends BaseUser {
  internalUserId: string

  constructor(
    public readonly token: string,
    tokenPayload: InternalUserToken,
    assembly?: AssemblyClient,
  ) {
    super(token, tokenPayload, assembly)
    this.internalUserId = tokenPayload.internalUserId
  }

  /**
   * Authenticates an Assembly user by token
   * @param token
   * @returns User instance modeled from the token payload
   * @throws AssemblyNoTokenError when no token is provided
   * @throws AssemblyInvalidTokenError when the token is invalid
   * @throws AssemblyConnectionError when unable to connect to Assembly API
   */
  static async authenticate(token?: unknown): Promise<InternalUser> {
    const { token: tokenString, payload, assembly } = await BaseUser.authenticateBase(token, InternalUserTokenSchema)

    return new InternalUser(tokenString, payload, assembly)
  }
}
