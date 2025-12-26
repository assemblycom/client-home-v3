import type { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import type { HttpMethod, RouteRule } from '@/app/routes'
import { AuthenticatedAPIHeaders } from '@/app/types'

/**
 * Prevent authorization bypass by injecting custom headers to request
 * @param req - Raw request
 * @returns Sanitized headers
 */
export const getSanitizedHeaders = (req: NextRequest) => {
  const sanitizedHeaders = new Headers(req.headers)

  sanitizedHeaders.delete(AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN)
  sanitizedHeaders.delete(AuthenticatedAPIHeaders.INTERNAL_USER_ID)
  sanitizedHeaders.delete(AuthenticatedAPIHeaders.CLIENT_ID)
  sanitizedHeaders.delete(AuthenticatedAPIHeaders.COMPANY_ID)
  sanitizedHeaders.delete(AuthenticatedAPIHeaders.WORKSPACE_ID)

  // This is an idempotent request trace ID used to track the entire session req/resp cycles
  if (!sanitizedHeaders.get('x-req-trace-id')) {
    sanitizedHeaders.set('x-req-trace-id', uuidv4())
  }

  return sanitizedHeaders
}

function matches(rule: RouteRule, pathname: string, method: string) {
  if (typeof rule === 'string') return rule === pathname
  if (rule.path !== pathname) return false
  if (!rule.methods) return true
  return rule.methods.includes(method as HttpMethod)
}

export function isAuthorized(rules: RouteRule[], req: NextRequest) {
  return rules.some((r) => matches(r, req.nextUrl.pathname, req.method))
}
