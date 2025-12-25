import 'server-only'

import {
  type AssemblyListArgs,
  type ClientCreateRequest,
  type ClientResponse,
  ClientResponseSchema,
  ClientsResponseSchema,
  type CompaniesResponse,
  CompaniesResponseSchema,
  type CompanyCreateRequest,
  type CompanyResponse,
  CompanyResponseSchema,
  type InternalUser,
  InternalUserResponseSchema,
  type InternalUsersResponse,
  InternalUsersResponseSchema,
  type Token,
  TokenSchema,
  type WorkspaceResponse,
  WorkspaceResponseSchema,
} from '@assembly/types'
import type { CopilotAPI as SDK } from 'copilot-node-sdk'
import { copilotApi } from 'copilot-node-sdk'
import env from '@/config/env'
import logger from '@/lib/logger'
import { withRetry } from '@/lib/with-retry'

export default class AssemblyClient {
  readonly assembly: SDK

  constructor(
    private readonly token: string,
    readonly customApiKey?: string,
  ) {
    this.assembly = copilotApi({
      apiKey: customApiKey ?? env.ASSEMBLY_API_KEY,
      token,
    })
  }

  // NOTE: Any method prefixed with _ is a API method that doesn't implement retry & delay
  // NOTE: Any normal API method name implements `withRetry` with default config

  // Get Token Payload from assembly request token
  async _getTokenPayload(): Promise<Token | null> {
    const getTokenPayload = this.assembly.getTokenPayload
    if (!getTokenPayload) {
      logger.error(`AssemblyClient#getTokenPayload | Could not parse token payload for token ${this.token}`)
      return null
    }

    const tokenPayload = await getTokenPayload()
    return TokenSchema.parse(tokenPayload)
  }

  async _getWorkspace(): Promise<WorkspaceResponse> {
    logger.info('AssemblyClient#_getWorkspace')
    return WorkspaceResponseSchema.parse(await this.assembly.retrieveWorkspace())
  }

  async _createClient(requestBody: ClientCreateRequest, sendInvite: boolean = false): Promise<ClientResponse> {
    logger.info('AssemblyClient#_createClient', requestBody, sendInvite)
    return ClientResponseSchema.parse(await this.assembly.createClient({ sendInvite, requestBody }))
  }

  async _getClient(id: string): Promise<ClientResponse> {
    logger.info('AssemblyClient#_getClient', id)
    return ClientResponseSchema.parse(await this.assembly.retrieveClient({ id }))
  }

  async _getClients(args: AssemblyListArgs & { companyId?: string } = {}) {
    logger.info('AssemblyClient#_getClients', args)
    return ClientsResponseSchema.parse(await this.assembly.listClients(args))
  }

  async _updateClient(id: string, requestBody: ClientCreateRequest): Promise<ClientResponse> {
    logger.info('AssemblyClient#_updateClient', id)
    return ClientResponseSchema.parse(await this.assembly.updateClient({ id, requestBody }))
  }

  async _deleteClient(id: string) {
    logger.info('AssemblyClient#_deleteClient', id)
    return await this.assembly.deleteClient({ id })
  }

  async _createCompany(requestBody: CompanyCreateRequest) {
    logger.info('AssemblyClient#_createCompany', requestBody)
    return CompanyResponseSchema.parse(await this.assembly.createCompany({ requestBody }))
  }

  async _getCompany(id: string): Promise<CompanyResponse> {
    logger.info('AssemblyClient#_getCompany', id)
    return CompanyResponseSchema.parse(await this.assembly.retrieveCompany({ id }))
  }

  async _getCompanies(args: AssemblyListArgs & { isPlaceholder?: boolean } = {}): Promise<CompaniesResponse> {
    logger.info('AssemblyClient#_getCompanies', args)
    return CompaniesResponseSchema.parse(await this.assembly.listCompanies(args))
  }

  async _getCompanyClients(companyId: string): Promise<ClientResponse[]> {
    logger.info('AssemblyClient#_getCompanyClients', companyId)
    return (await this.getClients({ limit: 10000, companyId })).data || []
  }

  async _getInternalUsers(args: AssemblyListArgs = {}): Promise<InternalUsersResponse> {
    logger.info('AssemblyClient#_getInternalUsers', args)
    return InternalUsersResponseSchema.parse(await this.assembly.listInternalUsers(args))
  }

  async _getInternalUser(id: string): Promise<InternalUser> {
    logger.info('AssemblyClient#_getInternalUser', id)
    return InternalUserResponseSchema.parse(await this.assembly.retrieveInternalUser({ id }))
  }

  private wrapWithRetry<Args extends unknown[], R>(fn: (...args: Args) => Promise<R>): (...args: Args) => Promise<R> {
    return (...args: Args): Promise<R> => withRetry(fn.bind(this), args)
  }

  // Methods wrapped with retry
  getTokenPayload = this.wrapWithRetry(this._getTokenPayload)
  getWorkspace = this.wrapWithRetry(this._getWorkspace)
  createClient = this.wrapWithRetry(this._createClient)
  getClient = this.wrapWithRetry(this._getClient)
  getClients = this.wrapWithRetry(this._getClients)
  updateClient = this.wrapWithRetry(this._updateClient)
  deleteClient = this.wrapWithRetry(this._deleteClient)
  createCompany = this.wrapWithRetry(this._createCompany)
  getCompany = this.wrapWithRetry(this._getCompany)
  getCompanies = this.wrapWithRetry(this._getCompanies)
  getCompanyClients = this.wrapWithRetry(this._getCompanyClients)
  getInternalUsers = this.wrapWithRetry(this._getInternalUsers)
  getInternalUser = this.wrapWithRetry(this._getInternalUser)
}
