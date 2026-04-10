/**
 * Shared test factories for creating entity fixtures.
 *
 * Use these across all test files to avoid duplicating fixture creation.
 * Each factory returns a minimal valid object with sensible defaults
 * that can be overridden via spread.
 */
import type { ClientResponse, CompanyResponse } from '@assembly/types'
import type { User } from '@auth/lib/user.entity'
import type { SegmentResponseDto } from '@segments/lib/segments.dto'
import type { SettingsWithSegment } from '@settings/lib/types'

// ── User fixtures ──────────────────────────────────────────────────────

export const createInternalUser = (overrides: Partial<User> = {}): User => ({
  token: 'tok-internal',
  internalUserId: 'iu-1',
  workspaceId: 'ws-1',
  ...overrides,
})

export const createClientUser = (overrides: Partial<User> = {}): User => ({
  token: 'tok-client',
  clientId: 'cl-1',
  companyId: 'co-1',
  workspaceId: 'ws-1',
  ...overrides,
})

// ── Entity factories ───────────────────────────────────────────────────

/** Creates a SegmentResponseDto with conditions built from compareValues */
export const createSegmentResponse = (
  id: string,
  compareValues: string[],
  overrides: Partial<SegmentResponseDto> = {},
): SegmentResponseDto => ({
  id,
  workspaceId: 'ws-1',
  createdById: 'iu-1',
  name: `Segment ${id}`,
  createdAt: new Date(),
  updatedAt: new Date(),
  conditions: compareValues.map((v, i) => ({
    id: `c-${id}-${i}`,
    segmentId: id,
    compareValue: v,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  })),
  ...overrides,
})

/** Creates a SettingsWithSegment — pass null segment for the "default" setting */
export const createSettingWithSegment = (
  settingId: string,
  segment: SettingsWithSegment['segment'] = null,
  overrides: Partial<SettingsWithSegment> = {},
): SettingsWithSegment => ({
  id: settingId,
  workspaceId: 'ws-1',
  segmentId: segment?.id ?? null,
  segment,
  ...overrides,
})

/** Creates a minimal client entity for resolveSetting / getStats tests */
export const createClient = (
  id: string,
  customFields: Record<string, unknown> = {},
  companyIds?: string[],
): ClientResponse => ({
  id,
  givenName: 'Test',
  familyName: 'User',
  email: `${id}@test.com`,
  avatarImageUrl: null,
  fallbackColor: null,
  customFields,
  companyIds,
  createdAt: new Date().toISOString(),
})

/** Creates a minimal company entity for getStats tests */
export const createCompany = (id: string, customFields: Record<string, unknown> = {}): CompanyResponse => ({
  id,
  name: `Company ${id}`,
  iconImageUrl: null,
  fallbackColor: null,
  isPlaceholder: false,
  customFields,
  createdAt: new Date().toISOString(),
})
