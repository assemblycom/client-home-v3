import type { WorkspaceResponse } from '@assembly/types'
import type { ClientsDto, CompaniesDto } from '@users/users.dto'
import type { ReactNode } from 'react'
import type { TemplateString } from '@/features/handlebar-template/types/hande-bar-template.type'
import { resolveTemplate } from './resolve-template'

export function getTemplateValue(
  template: TemplateString,
  fallbackValue?: ReactNode,
  data?: {
    client: ClientsDto | null
    company: CompaniesDto | null
    workspace: WorkspaceResponse | null
  },
): ReactNode | undefined | null {
  if (!data) return fallbackValue
  return resolveTemplate(template, data.client, data.company, data.workspace) || fallbackValue
}
