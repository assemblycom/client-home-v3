import type { IconType } from 'copilot-design-system'

type DynamicFieldData = {
  fieldContent: string
  name: string
  icon: IconType
}

export type DynamicField = {
  type: 'client' | 'company' | 'workspace'
  data: DynamicFieldData[]
}
