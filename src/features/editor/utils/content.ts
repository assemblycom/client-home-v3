import { defaultContent } from '@settings/constants'

// True when the HTML has no visible content (autofill fields count as content).
export const isBlankContent = (html?: string): boolean => {
  if (!html) return true
  if (html.includes('autofill-field')) return false
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '').length === 0
}

// True when the body still matches the seeded default copy.
export const isDefaultContent = (html?: string): boolean => html === defaultContent

// True when the row was never saved (createdAt and updatedAt match on insert).
export const isNeverSaved = (createdAt?: string | Date | null, updatedAt?: string | Date | null): boolean => {
  if (!createdAt || !updatedAt) return false
  return new Date(createdAt).getTime() === new Date(updatedAt).getTime()
}

// True while the client home is still the untouched default.
export const isDefaultClientHome = (params: {
  content?: string
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}): boolean => isDefaultContent(params.content) || isNeverSaved(params.createdAt, params.updatedAt)
