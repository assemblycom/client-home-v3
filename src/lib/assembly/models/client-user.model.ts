import type AssemblyClient from '@assembly/assembly-client'
import BaseUser from '@assembly/models/base-user.model'
import { type ClientToken, ClientTokenSchema } from '@assembly/types'

export default class ClientUser extends BaseUser {
  clientId: string
  companyId: string

  constructor(
    public readonly token: string,
    tokenPayload: ClientToken,
    assembly?: AssemblyClient,
  ) {
    super(token, tokenPayload, assembly)
    this.clientId = tokenPayload.clientId
    this.companyId = tokenPayload.companyId
  }

  /**
   * Authenticates an Assembly user by token
   * @param token
   * @returns User instance modeled from the token payload
   * @throws AssemblyNoTokenError when no token is provided
   * @throws AssemblyInvalidTokenError when the token is invalid
   * @throws AssemblyConnectionError when unable to connect to Assembly API
   */
  static async authenticate(token?: unknown): Promise<ClientUser> {
    const { token: tokenString, payload, assembly } = await BaseUser.authenticateBase(token, ClientTokenSchema)

    return new ClientUser(tokenString, payload, assembly)
  }
}
