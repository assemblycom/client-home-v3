import { ensureHttps } from '@/utils/urls'

export type ValueLink = { href: string; kind: 'url' | 'email' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PROTOCOL_RE = /^https?:\/\//i
// Bare domain (optionally www.) with a letter-only TLD, optional path/query.
const DOMAIN_RE = /^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,24}([/?#]\S*)?$/i

/**
 * Detects whether a resolved autofill value should render as a clickable link.
 * Returns the href to use (mailto: for emails, https:// for URLs), or null when
 * the value is plain text.
 */
export const getValueLink = (value: string): ValueLink | null => {
  const v = value.trim()
  if (!v) return null

  if (EMAIL_RE.test(v)) return { href: `mailto:${v}`, kind: 'email' }

  if (PROTOCOL_RE.test(v)) return URL.canParse(v) ? { href: v, kind: 'url' } : null

  if (DOMAIN_RE.test(v)) {
    const href = ensureHttps(v)
    return URL.canParse(href) ? { href, kind: 'url' } : null
  }

  return null
}
