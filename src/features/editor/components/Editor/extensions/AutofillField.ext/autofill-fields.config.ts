import type { IconType } from 'copilot-design-system'
import camelCase from 'lodash/camelCase'

export type FieldEntityType = 'client' | 'company' | 'workspace'

export type BuiltInField = {
  value: string // canonical handlebar: {{client.firstName}}
  name: string // human label: "First Name"
  icon: IconType // sidebar icon
  entityType: FieldEntityType
}

export type FieldItem = {
  value: string // canonical: {{client.firstName}}
  label: string // workspace-labelled: {{person.firstName}}
  name: string // human label: "First Name"
  icon: IconType
  entityType: FieldEntityType
}

export const BUILT_IN_FIELDS: BuiltInField[] = [
  { value: '{{client.firstName}}', name: 'First Name', icon: 'Profile', entityType: 'client' },
  { value: '{{client.lastName}}', name: 'Last Name', icon: 'Profile', entityType: 'client' },
  { value: '{{client.email}}', name: 'Email', icon: 'Email', entityType: 'client' },
  { value: '{{client.company}}', name: 'Company', icon: 'Building', entityType: 'client' },
  { value: '{{company.name}}', name: 'Name', icon: 'Profile', entityType: 'company' },
  { value: '{{company.address}}', name: 'Address', icon: 'Location', entityType: 'company' },
  { value: '{{company.email}}', name: 'Email', icon: 'Email', entityType: 'company' },
  { value: '{{workspace.brand}}', name: 'Company Name', icon: 'Customization', entityType: 'workspace' },
]

/**
 * Applies workspace label overrides to the canonical value prefix.
 * e.g. `{{client.firstName}}` → `{{person.firstName}}` when individualTerm is "Person".
 * Workspace fields are never remapped.
 */
export function getFieldDisplayContent(
  value: string,
  labels?: { individualTerm?: string; groupTerm?: string },
): string {
  if (!labels) return value
  const clientPrefix = camelCase(labels.individualTerm ?? 'client')
  const companyPrefix = camelCase(labels.groupTerm ?? 'company')
  return value.replace('{{client.', `{{${clientPrefix}.`).replace('{{company.', `{{${companyPrefix}.`)
}
