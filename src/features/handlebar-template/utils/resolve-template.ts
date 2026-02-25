import type { WorkspaceResponse } from '@assembly/types'
import type { ClientsDto, CompaniesDto } from '@users/users.dto'

/**
 * Resolves a canonical template string (e.g. `{{client.firstName}}`) against
 * the supplied preview data. Returns an empty string when data is unavailable.
 */
export function resolveTemplate(
  template: string,
  client: ClientsDto | null,
  company: CompaniesDto | null,
  workspace: WorkspaceResponse | null,
): string {
  const match = template.match(/^\{\{(\w+)\.(.+)\}\}$/)
  if (!match) return ''

  const [, entity, field] = match

  switch (entity) {
    case 'client': {
      if (!client) return ''
      switch (field) {
        case 'firstName':
          return client.firstName ?? ''
        case 'lastName':
          return client.lastName ?? ''
        case 'email':
          return client.email ?? ''
        case 'company':
          return company?.name ?? ''
        default:
          return String(client.customFields?.[field] ?? '')
      }
    }
    case 'company': {
      if (!company) return ''
      return String(company.customFields?.[field] ?? '')
    }
    case 'workspace': {
      if (!workspace) return ''
      if (field === 'brand') return workspace.brandName ?? ''
      return ''
    }
    default:
      return ''
  }
}
