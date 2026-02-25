import { ListCustomFieldResponseSchema } from '@assembly/types'
import { viewStore } from '@editor/stores/viewStore'
import { BUILT_IN_FIELDS, getFieldDisplayContent } from './autofill-fields.config'

export type AutofillItem = {
  label: string // workspace-labelled display: {{person.firstName}}
  value: string // canonical value stored in doc: {{client.firstName}}
}

type CachedFields = {
  client: { key: string; name: string }[]
  company: { key: string; name: string }[]
}

// Token-keyed cache so it refreshes on workspace switch
const cache = new Map<string, CachedFields>()

async function fetchFields(token: string): Promise<CachedFields> {
  if (cache.has(token)) return cache.get(token)!

  const [clientRes, companyRes] = await Promise.all([
    fetch(`/api/custom-fields/client?token=${token}`),
    fetch(`/api/custom-fields/company?token=${token}`),
  ])

  const [clientData, companyData] = await Promise.all([clientRes.json(), companyRes.json()])

  const clientFields = ListCustomFieldResponseSchema.parse(clientData)
    .data.sort((a, b) => a.order - b.order)
    .map(({ key, name }) => ({ key, name }))

  const companyFields = ListCustomFieldResponseSchema.parse(companyData)
    .data.sort((a, b) => a.order - b.order)
    .map(({ key, name }) => ({ key, name }))

  const result: CachedFields = { client: clientFields, company: companyFields }
  cache.set(token, result)
  return result
}

export async function fetchAutofillItems(token: string, query: string): Promise<AutofillItem[]> {
  const fields = await fetchFields(token)

  const labels = viewStore.getState().workspace?.labels

  const toItem = (value: string): AutofillItem => ({ value, label: getFieldDisplayContent(value, labels) })

  const allItems: AutofillItem[] = [
    ...BUILT_IN_FIELDS.filter((f) => f.entityType === 'client').map((f) => toItem(f.value)),
    ...fields.client.map(({ key }) => toItem(`{{client.${key}}}`)),
    ...BUILT_IN_FIELDS.filter((f) => f.entityType === 'company').map((f) => toItem(f.value)),
    ...fields.company.map(({ key }) => toItem(`{{company.${key}}}`)),
    ...BUILT_IN_FIELDS.filter((f) => f.entityType === 'workspace').map((f) => toItem(f.value)),
  ]

  const normalized = query.toLowerCase()
  const filtered = normalized ? allItems.filter((item) => item.label.toLowerCase().includes(normalized)) : allItems

  return filtered.slice(0, 10)
}
