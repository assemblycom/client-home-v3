import { defaultContent } from '@settings/constants'

// True when the HTML has no visible content (autofill fields count as content).
export const isBlankContent = (html?: string): boolean => {
  if (!html) return true
  if (html.includes('autofill-field')) return false
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '').length === 0
}

// True when the body still matches the seeded default copy.
export const isDefaultContent = (html?: string): boolean => html === defaultContent
