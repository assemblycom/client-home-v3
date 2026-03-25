import type { WorkspaceResponse } from '@assembly/types'
import type { ClientsDto, CompaniesDto } from '@users/users.dto'
import type { CustomFieldOptionsMap } from '@/features/custom-fields/hooks/useCustomFields'

/**
 * Maps raw custom field values (option keys) to their display labels.
 * Uses the nested optionsMap keyed by entity type then field key to avoid
 * collisions when different entity types share field keys.
 * Falls back to the raw value when no label is found.
 */
const resolveCustomFieldValue = (
  entityType: string,
  fieldKey: string,
  raw: unknown,
  optionsMap: CustomFieldOptionsMap,
): string => {
  if (raw == null) return ''
  const fieldOptions = optionsMap[entityType]?.[fieldKey]
  if (Array.isArray(raw)) {
    return raw.map((v) => fieldOptions?.[String(v)] ?? String(v)).join(', ')
  }
  const str = String(raw)
  return fieldOptions?.[str] ?? str
}

/**
 * Resolves a canonical template string (e.g. `{{client.firstName}}`) against
 * the supplied preview data. Returns an empty string when data is unavailable.
 */
export function resolveTemplate(
  template: string,
  client: ClientsDto | null,
  company: CompaniesDto | null,
  workspace: WorkspaceResponse | null,
  optionsMap: CustomFieldOptionsMap = {},
): string {
  const match = template.match(/^\{\{(\w+)\.(.+)\}\}$/)
  if (!match) return ''

  const [, entity, field] = match

  switch (entity) {
    case 'client': {
      if (!client) return ''
      const builtIn: Record<string, string | undefined> = {
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        company: company?.name,
      }
      if (field in builtIn) return builtIn[field] ?? ''
      return resolveCustomFieldValue('client', field, client.customFields?.[field], optionsMap)
    }
    case 'company': {
      if (!company) return ''
      const builtIn: Record<string, string | undefined> = {
        name: company.name,
      }
      if (field in builtIn) return builtIn[field] ?? ''
      return resolveCustomFieldValue('company', field, company.customFields?.[field], optionsMap)
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
