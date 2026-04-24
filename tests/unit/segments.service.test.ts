import { CustomFieldEntityType, CustomFieldType } from '@assembly/types'
import type { ConditionsRepository } from '@segments/lib/conditions/conditions.repository'
import type { SegmentConfigsRepository } from '@segments/lib/segment-config/segment-config.repository'
import type { SegmentsRepository } from '@segments/lib/segments/segments.repository'
import type { SegmentCreateDto } from '@segments/lib/segments.dto'
import SegmentsService from '@segments/lib/segments.service'
import type { ActionsRepository } from '@settings/lib/actions/actions.repository'
import type { SettingsRepository } from '@settings/lib/settings/settings.repository'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createClient,
  createClientUser,
  createInternalUser,
  createSegmentResponse,
  createSettingWithSegment,
} from '../factories'
import { mockAssembly, mockRepo, resetAssemblyMocks } from '../mocks'

vi.mock('server-only', () => ({}))
vi.mock('@assembly/assembly-client', () => ({ default: vi.fn() }))
vi.mock('@/db', () => ({ default: {} }))
vi.mock('@/lib/core/db.service', () => ({
  default: { transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({})) },
}))

const internalUser = createInternalUser()
const clientUser = createClientUser()

const buildService = (
  user = internalUser,
  o: {
    segments?: Partial<SegmentsRepository>
    conditions?: Partial<ConditionsRepository>
    settings?: Partial<SettingsRepository>
    actions?: Partial<ActionsRepository>
    segmentConfigs?: Partial<SegmentConfigsRepository>
  } = {},
) =>
  new SegmentsService(
    user,
    mockAssembly as never,
    mockRepo<SegmentsRepository>(o.segments),
    mockRepo<ConditionsRepository>(o.conditions),
    mockRepo<SettingsRepository>(o.settings),
    mockRepo<ActionsRepository>(o.actions),
    mockRepo<SegmentConfigsRepository>(o.segmentConfigs),
  )

describe('SegmentsService', () => {
  beforeEach(resetAssemblyMocks)

  describe('auth guards', () => {
    it('rejects client user from creating segments', async () => {
      const svc = buildService(clientUser)
      await expect(svc.create({ name: 'X', conditions: [{ compareValue: 'x' }] })).rejects.toThrow(
        'Only internal users can create segments',
      )
    })

    it('rejects client user from configuring segments', async () => {
      const svc = buildService(clientUser)
      await expect(
        svc.upsertSegmentConfig({ customField: 'x', customFieldId: 'x', entityType: CustomFieldEntityType.CLIENT }),
      ).rejects.toThrow('Only internal users can configure segments')
    })

    it('rejects client user from bulk-deleting segments', async () => {
      const svc = buildService(clientUser)
      await expect(svc.deleteAll()).rejects.toThrow('Only internal users can delete segments')
    })
  })

  describe('segment config locking', () => {
    it('prevents changing custom field when segments exist', async () => {
      mockAssembly.listCustomFields.mockResolvedValue({
        data: [{ key: 'status', type: CustomFieldType.TAGS }],
      })
      const svc = buildService(internalUser, {
        segments: { getAll: vi.fn().mockResolvedValue([createSegmentResponse('s-1', ['a'])]) },
        segmentConfigs: {
          getByWorkspaceId: vi.fn().mockResolvedValue({
            id: 'sc-1',
            workspaceId: 'ws-1',
            customField: 'tier',
            customFieldId: 'cf-other',
            entityType: CustomFieldEntityType.CLIENT,
          }),
          upsert: vi.fn(),
        },
      })
      await expect(
        svc.upsertSegmentConfig({
          customField: 'status',
          customFieldId: 'cf-1',
          entityType: CustomFieldEntityType.CLIENT,
        }),
      ).rejects.toThrow('Cannot change the segment configuration while segments exist')
    })

    // Complement to the lock test above: once all segments are gone the guard lifts
    // and the same upsert that used to throw is allowed through.
    it('allows changing custom field once all segments are deleted', async () => {
      mockAssembly.listCustomFields.mockResolvedValue({
        data: [{ key: 'status', type: CustomFieldType.TAGS }],
      })
      const upsertMock = vi.fn().mockResolvedValue({
        id: 'sc-1',
        workspaceId: 'ws-1',
        customField: 'status',
        customFieldId: 'cf-1',
        entityType: CustomFieldEntityType.CLIENT,
      })
      const svc = buildService(internalUser, {
        segments: { getAll: vi.fn().mockResolvedValue([]) },
        segmentConfigs: {
          getByWorkspaceId: vi.fn().mockResolvedValue({
            id: 'sc-1',
            workspaceId: 'ws-1',
            customField: 'tier',
            customFieldId: 'cf-other',
            entityType: CustomFieldEntityType.CLIENT,
          }),
          upsert: upsertMock,
        },
      })
      const result = await svc.upsertSegmentConfig({
        customField: 'status',
        customFieldId: 'cf-1',
        entityType: CustomFieldEntityType.CLIENT,
      })
      expect(result.customField).toBe('status')
      expect(upsertMock).toHaveBeenCalled()
    })

    it('rejects non-TAGS custom field type', async () => {
      mockAssembly.listCustomFields.mockResolvedValue({
        data: [{ key: 'status', type: CustomFieldType.TEXT }],
      })
      const svc = buildService()
      await expect(
        svc.upsertSegmentConfig({
          customField: 'status',
          customFieldId: 'cf-1',
          entityType: CustomFieldEntityType.CLIENT,
        }),
      ).rejects.toThrow('Only tag (multiSelect) custom fields are supported')
    })
  })

  describe('creation constraints', () => {
    const payload: SegmentCreateDto = { name: 'Premier', conditions: [{ compareValue: 'premier' }] }

    it('enforces max 5 segments per workspace', async () => {
      const five = Array.from({ length: 5 }, (_, i) => createSegmentResponse(`s-${i}`, [`v-${i}`]))
      const svc = buildService(internalUser, {
        segments: { getAll: vi.fn().mockResolvedValue(five) },
      })
      await expect(svc.create(payload)).rejects.toThrow('cannot have more than 5 segments')
    })

    it('requires config to exist before creating segments', async () => {
      const svc = buildService(internalUser, {
        segments: { getAll: vi.fn().mockResolvedValue([]) },
        segmentConfigs: { getByWorkspaceId: vi.fn().mockResolvedValue(undefined) },
      })
      await expect(svc.create(payload)).rejects.toThrow('Segment config must be created before adding segments')
    })

    it('rejects duplicate compareValues across segments', async () => {
      mockAssembly.listCustomFields.mockResolvedValue({
        data: [{ key: 'status', type: CustomFieldType.TAGS }],
      })
      const svc = buildService(internalUser, {
        segments: { getAll: vi.fn().mockResolvedValue([createSegmentResponse('s-1', ['premier'])]) },
        segmentConfigs: {
          getByWorkspaceId: vi
            .fn()
            .mockResolvedValue({ customField: 'status', entityType: CustomFieldEntityType.CLIENT }),
        },
      })
      await expect(svc.create(payload)).rejects.toThrow('Compare values must be unique across segments')
    })
  })

  describe('delete', () => {
    it('cleans up config when last segment is deleted', async () => {
      const deleteConfigMock = vi.fn().mockResolvedValue(undefined)
      const svc = buildService(internalUser, {
        segments: {
          delete: vi.fn().mockResolvedValue({ id: 's-1' }),
          getAll: vi.fn().mockResolvedValue([]),
        },
        segmentConfigs: { deleteByWorkspaceId: deleteConfigMock },
      })
      await svc.delete('s-1')
      expect(deleteConfigMock).toHaveBeenCalledWith('ws-1')
    })

    it('preserves config when other segments remain', async () => {
      const deleteConfigMock = vi.fn()
      const svc = buildService(internalUser, {
        segments: {
          delete: vi.fn().mockResolvedValue({ id: 's-1' }),
          getAll: vi.fn().mockResolvedValue([createSegmentResponse('s-2', ['b'])]),
        },
        segmentConfigs: { deleteByWorkspaceId: deleteConfigMock },
      })
      await svc.delete('s-1')
      expect(deleteConfigMock).not.toHaveBeenCalled()
    })
  })

  describe('resolveSetting', () => {
    const defaultSetting = createSettingWithSegment('set-default', null)
    const premierSetting = createSettingWithSegment('set-premier', {
      id: 's-premier',
      workspaceId: 'ws-1',
      createdById: 'iu-1',
      name: 'Premier',
      createdAt: new Date(),
      updatedAt: new Date(),
      conditions: [
        {
          id: 'c-1',
          segmentId: 's-premier',
          compareValue: 'premier',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
    })
    const allSettings = [defaultSetting, premierSetting]

    it('matches array custom field values', () => {
      const result = SegmentsService.resolveSetting({
        entity: createClient('cl-1', { status: ['premier', 'active'] }),
        allSettings,
        customField: 'status',
      })
      expect(result?.id).toBe('set-premier')
    })

    it('matches object custom field values', () => {
      const result = SegmentsService.resolveSetting({
        entity: createClient('cl-1', { status: { key1: 'premier' } }),
        allSettings,
        customField: 'status',
      })
      expect(result?.id).toBe('set-premier')
    })

    it('matches string custom field values', () => {
      const result = SegmentsService.resolveSetting({
        entity: createClient('cl-1', { status: 'premier' }),
        allSettings,
        customField: 'status',
      })
      expect(result?.id).toBe('set-premier')
    })

    it('falls back to default when no condition matches', () => {
      const result = SegmentsService.resolveSetting({
        entity: createClient('cl-1', { status: ['basic'] }),
        allSettings,
        customField: 'status',
      })
      expect(result?.id).toBe('set-default')
    })

    it('falls back to default when custom field value is null', () => {
      const result = SegmentsService.resolveSetting({
        entity: createClient('cl-1', { status: null }),
        allSettings,
        customField: 'status',
      })
      expect(result?.id).toBe('set-default')
    })
  })
})
