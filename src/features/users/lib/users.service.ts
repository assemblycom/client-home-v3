import AssemblyClient from '@assembly/assembly-client'
import { MAX_FETCH_ASSEMBLY_RESOURCES } from '@assembly/constants'
import type { ClientResponse, CompanyResponse } from '@assembly/types'
import type { User } from '@auth/lib/user.entity'
import { type ClientsDto, type CompaniesDto, type UsersDto, UsersDtoSchema } from '@users/users.dto'
import { HttpStatusCode } from 'axios'
import APIError from '@/errors/api.error'
import BaseService from '@/lib/core/base.service'

export default class UsersService extends BaseService {
  constructor(
    readonly user: User,
    readonly assembly: AssemblyClient,
  ) {
    super(user, assembly)
  }

  static new(user: User) {
    const assembly = new AssemblyClient(user.token)
    return new UsersService(user, assembly)
  }

  async getClients(): Promise<UsersDto> {
    const [clients, companies] = await Promise.all([
      this.assembly.getClients({ limit: MAX_FETCH_ASSEMBLY_RESOURCES }),
      this.assembly.getCompanies({ limit: MAX_FETCH_ASSEMBLY_RESOURCES }),
    ])
    if (!clients || !clients.data)
      throw new APIError('Could not fetch clients list from assembly', HttpStatusCode.InternalServerError)

    // NOTE: Do not check for !companies || !companies.data since companies can be disabled in workspace

    const flattenedClients: ClientsDto[] = []
    for (const client of clients.data) {
      const companyCount = client.companyIds?.length || 0
      if (companyCount > 1) {
        // biome-ignore lint/style/noNonNullAssertion: companyIds must exist when companyCount > 1
        for (const companyId of client.companyIds!) {
          flattenedClients.push(this.getParsedClientData(client, companyId))
        }
      } else {
        const companyId = client.companyIds?.[0]
        flattenedClients.push(this.getParsedClientData(client, companyId))
      }
    }

    return UsersDtoSchema.parse({
      clients: flattenedClients.sort((a, b) => {
        const aName = `${a.firstName} ${a.lastName || ''}`
        const bName = `${b.firstName} ${b.lastName || ''}`
        return aName.localeCompare(bName)
      }),
      companies: companies.data?.map(this.getParsedCompaniesData) || [],
    })
  }

  private getParsedClientData(client: ClientResponse, companyId?: string): ClientsDto {
    return {
      id: client.id,
      firstName: client.givenName,
      lastName: client.familyName,
      email: client.email,
      customFields: client.customFields,
      companyId,
      avatarSrc: client.avatarImageUrl || undefined,
      avatarFallbackColor: client.fallbackColor || undefined,
    }
  }

  private getParsedCompaniesData(company: CompanyResponse): CompaniesDto {
    return {
      id: company.id,
      name: company.name,
      customFields: company.customFields || {},
    }
  }
}
