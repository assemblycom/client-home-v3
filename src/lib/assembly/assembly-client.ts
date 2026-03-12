import 'server-only'

import {
  AppInstallsResponseSchema,
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
  type CustomFieldEntityType,
  type InternalUser,
  InternalUserResponseSchema,
  type InternalUsersResponse,
  InternalUsersResponseSchema,
  ListCustomFieldResponseSchema,
  type NotificationsResponse,
  NotificationsResponseSchema,
  TasksResponseSchema,
  type Token,
  TokenSchema,
  type WorkspaceResponse,
  WorkspaceResponseSchema,
} from '@assembly/types'
import type { AssemblyAPI as SDK } from '@assembly-js/node-sdk'
import { assemblyApi } from '@assembly-js/node-sdk'
import type { z } from 'zod'
import env from '@/config/env'
import logger from '@/lib/logger'
import { withRetry } from '@/lib/with-retry'
import { encodePayload } from '@/utils/crypto'
import { MAX_FETCH_ASSEMBLY_RESOURCES } from './constants'
import { AssemblyInvalidTokenError } from './errors'

export default class AssemblyClient {
  readonly assembly: SDK

  constructor(
    private readonly token: string,
    readonly customApiKey?: string,
  ) {
    try {
      this.assembly = assemblyApi({
        apiKey: customApiKey ?? env.ASSEMBLY_API_KEY,
        token,
      })
    } catch {
      throw new AssemblyInvalidTokenError()
    }
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

  async _getAppId(appDeploymentId: string): Promise<string | null> {
    const installedApps = AppInstallsResponseSchema.parse(await this.assembly.listAppInstalls())
    return installedApps.find((app) => app.appId === appDeploymentId)?.id || null
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
    return ClientsResponseSchema.parse(
      await this.assembly.listClients(args).then((res) => {
        if (!res.data) {
          return {
            data: [],
          } as z.infer<typeof ClientsResponseSchema>
        }
        return res
      }),
    )
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

  async _getNotifications(
    { includeRead, recipientClientId }: Parameters<SDK['listNotifications']>[0] = { includeRead: false },
  ): Promise<NotificationsResponse> {
    logger.info('AssemblyClient#_getNotifications', { includeRead, recipientClientId })
    return NotificationsResponseSchema.parse(await this.assembly.listNotifications({ includeRead, recipientClientId }))
  }

  async _getTasks({ workspaceId, clientId, companyId }: { workspaceId: string; clientId: string; companyId?: string }) {
    // logger.info('AssemblyClient#_getTasks')
    // const limit = 100 // There is currently an issue that causes limit above 100 to throw error
    // return TasksResponseSchema.parse(await this.assembly.retrieveTasks({ clientId, companyId, status, limit }))
    // --- Keep this disabled for now, since assembly throws error saying Marketplace app not found
    try {
      const tasksToken = encodePayload(env.TASKS_ASSEMBLY_API_KEY, { clientId, companyId, workspaceId })
      const tasksResponse = await fetch(
        `https://tasks.assembly.com/api/tasks/public?token=${tasksToken}&limit=${MAX_FETCH_ASSEMBLY_RESOURCES}`,
      )
      const tasksParsed = TasksResponseSchema.safeParse(await tasksResponse.json())
      if (!tasksParsed.success) {
        console.warn('Failed to parse tasks', tasksParsed.error)
        return [] // Fail safely so we don't crash the entire app lol
      }
      return tasksParsed.data.data
    } catch (e) {
      console.warn('Failed to fetch tasks', e)
      return []
    }
  }

  private async _listCustomFields({ entityType }: { entityType: CustomFieldEntityType }) {
    logger.info('AssemblyClient#_listCustomFields')
    return ListCustomFieldResponseSchema.parse(
      await this.assembly.listCustomFields({ entityType }).then((res) => {
        if (!res.data) {
          return {
            data: [],
          } as z.infer<typeof ListCustomFieldResponseSchema>
        }

        return res
      }),
    )
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
  getNotifications = this.wrapWithRetry(this._getNotifications)
  getTasks = this.wrapWithRetry(this._getTasks)
  listCustomFields = this.wrapWithRetry(this._listCustomFields)
  getAppId = this.wrapWithRetry(this._getAppId)
}
