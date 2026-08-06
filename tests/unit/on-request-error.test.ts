import { AssemblyInvalidTokenError, AssemblyMissingHeadersError, AssemblyTokenParseError } from '@assembly/errors'
import type { captureRequestError } from '@sentry/nextjs'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

// Mock @sentry/nextjs before importing instrumentation
const mockCaptureRequestError = vi.fn()
vi.mock('@sentry/nextjs', () => ({
  captureRequestError: mockCaptureRequestError,
}))

const { onRequestError } = await import('@/instrumentation')

type SentryRequestInfo = Parameters<typeof captureRequestError>[1]
type SentryErrorContext = Parameters<typeof captureRequestError>[2]

const fakeRequest: SentryRequestInfo = {
  path: '/',
  method: 'GET',
  headers: {},
}

const fakeContext: SentryErrorContext = {
  routerKind: 'App Router',
  routePath: '/',
  routeType: 'render',
}

beforeEach(() => {
  mockCaptureRequestError.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

it('does not call Sentry for AssemblyMissingHeadersError', () => {
  const error = new AssemblyMissingHeadersError()

  onRequestError(error, fakeRequest, fakeContext)

  expect(mockCaptureRequestError).not.toHaveBeenCalled()
})

it('does not call Sentry for AssemblyInvalidTokenError', () => {
  const error = new AssemblyInvalidTokenError()

  onRequestError(error, fakeRequest, fakeContext)

  expect(mockCaptureRequestError).not.toHaveBeenCalled()
})

it('does not call Sentry for AssemblyTokenParseError', () => {
  const error = new AssemblyTokenParseError()

  onRequestError(error, fakeRequest, fakeContext)

  expect(mockCaptureRequestError).not.toHaveBeenCalled()
})

it('calls Sentry for a generic Error', () => {
  const error = new Error('something unexpected')

  onRequestError(error, fakeRequest, fakeContext)

  expect(mockCaptureRequestError).toHaveBeenCalledWith(error, fakeRequest, fakeContext)
})

it('calls Sentry for a generic Error only once', () => {
  const error = new Error('something unexpected')

  onRequestError(error, fakeRequest, fakeContext)

  expect(mockCaptureRequestError).toHaveBeenCalledTimes(1)
})

it('calls Sentry for a non-Error thrown value', () => {
  const error = 'a thrown string'

  onRequestError(error, fakeRequest, fakeContext)

  expect(mockCaptureRequestError).toHaveBeenCalledWith(error, fakeRequest, fakeContext)
})
