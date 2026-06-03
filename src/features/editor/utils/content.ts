/**
 * Whether an editor HTML string has no visible content. An autofill field counts
 * as content even though it has no text. Used to hide empty heading/subheading
 * in read-only (client) views.
 */
export const isBlankContent = (html?: string): boolean => {
  if (!html) return true
  if (html.includes('autofill-field')) return false
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '').length === 0
}
