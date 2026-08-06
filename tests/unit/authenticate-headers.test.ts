import { beforeEach, describe, expect, it, vi } from 'vitest'

// authenticate.ts imports @assembly/assembly-client which has heavy SDK dependencies
// that don't resolve in vitest's ESM environment. Mock it since authenticateHeaders
// doesn't use AssemblyClient at all.
vi.mock('@assembly/assembly-client', () => ({
  default: class MockAssemblyClient {},
}))

// Silence the missing-header diagnostic and let us assert on it.
const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

beforeEach(() => {
  warnSpy.mockClear()
})

// Use dynamic import for modules that have vi.mock dependencies so vitest
// hoists the mock before resolution.
const { AssemblyInvalidTokenError, AssemblyMissingHeadersError } = await import('@assembly/errors')
const { AuthenticatedAPIHeaders } = await import('@/app/types')
const { authenticateHeaders } = await import('@auth/lib/authenticate')

const validInternalHeaders = {
  [AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN]: 'valid-token',
  [AuthenticatedAPIHeaders.INTERNAL_USER_ID]: 'user_123',
  [AuthenticatedAPIHeaders.WORKSPACE_ID]: 'ws_456',
}

const validClientHeaders = {
  [AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN]: 'valid-token',
  [AuthenticatedAPIHeaders.CLIENT_ID]: 'client_789',
  [AuthenticatedAPIHeaders.COMPANY_ID]: 'company_012',
  [AuthenticatedAPIHeaders.WORKSPACE_ID]: 'ws_456',
}

const buildHeaders = (init?: Record<string, string>): Headers => new Headers(init)

describe('authenticateHeaders', () => {
  it('throws AssemblyMissingHeadersError when CUSTOM_APP_TOKEN is missing', () => {
    const headers = buildHeaders({
      [AuthenticatedAPIHeaders.WORKSPACE_ID]: 'ws_456',
      [AuthenticatedAPIHeaders.INTERNAL_USER_ID]: 'user_123',
    })

    expect(() => authenticateHeaders(headers)).toThrow(AssemblyMissingHeadersError)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('token'))
  })

  it('throws AssemblyMissingHeadersError when WORKSPACE_ID is missing', () => {
    const headers = buildHeaders({
      [AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN]: 'valid-token',
      [AuthenticatedAPIHeaders.INTERNAL_USER_ID]: 'user_123',
    })

    expect(() => authenticateHeaders(headers)).toThrow(AssemblyMissingHeadersError)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('workspaceId'))
  })

  it('throws AssemblyMissingHeadersError when both CUSTOM_APP_TOKEN and WORKSPACE_ID are missing', () => {
    const headers = buildHeaders({
      [AuthenticatedAPIHeaders.INTERNAL_USER_ID]: 'user_123',
    })

    expect(() => authenticateHeaders(headers)).toThrow(AssemblyMissingHeadersError)
  })

  it('throws AssemblyMissingHeadersError with an empty headers object', () => {
    const headers = buildHeaders()

    expect(() => authenticateHeaders(headers)).toThrow(AssemblyMissingHeadersError)
  })

  it('throws AssemblyInvalidTokenError when both internalUserId and clientId are missing', () => {
    const headers = buildHeaders({
      [AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN]: 'valid-token',
      [AuthenticatedAPIHeaders.WORKSPACE_ID]: 'ws_456',
    })

    expect(() => authenticateHeaders(headers)).toThrow(AssemblyInvalidTokenError)
  })

  it('returns a User for valid internal-user headers', () => {
    const headers = buildHeaders(validInternalHeaders)

    const user = authenticateHeaders(headers)

    expect(user).toEqual({
      token: 'valid-token',
      internalUserId: 'user_123',
      clientId: undefined,
      companyId: undefined,
      workspaceId: 'ws_456',
    })
  })

  it('returns a User for valid client headers', () => {
    const headers = buildHeaders(validClientHeaders)

    const user = authenticateHeaders(headers)

    expect(user).toEqual({
      token: 'valid-token',
      internalUserId: undefined,
      clientId: 'client_789',
      companyId: 'company_012',
      workspaceId: 'ws_456',
    })
  })
})
