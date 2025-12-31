type DynamicFieldData = {
  fieldContent: string
  name: string
}

export type DynamicField = {
  type: 'client' | 'company' | 'workspace'
  data: DynamicFieldData[]
}
