import AssemblyClient from '@assembly/assembly-client'
import { MAX_FETCH_ASSEMBLY_RESOURCES } from '@assembly/constants'
import type { ClientResponse } from '@assembly/types'
import { CustomFieldEntityType } from '@assembly/types'
import type { User } from '@auth/lib/user.entity'
import type { ConditionsRepository } from '@segments/lib/conditions/conditions.repository'
import ConditionsDrizzleRepository from '@segments/lib/conditions/conditions.repository'
import type { SegmentConfigsRepository } from '@segments/lib/segment-configs/segment-configs.repository'
import SegmentConfigsDrizzleRepository from '@segments/lib/segment-configs/segment-configs.repository'
import type { SegmentsRepository } from '@segments/lib/segments/segments.repository'
import SegmentsDrizzleRepository from '@segments/lib/segments/segments.repository'
import { CATEGORICAL_COLORS } from '@segments/lib/segments.colors'
import type {
  FormattedSegmentData,
  SegmentCreateDto,
  SegmentResponseDto,
  SegmentStatsResponseDto,
  SegmentStatsSettings,
  SegmentUpdateDto,
} from '@segments/lib/segments.dto'
import type { ActionsRepository } from '@settings/lib/actions/actions.repository'
import ActionsDrizzleRepository from '@settings/lib/actions/actions.repository'
import type { SettingsRepository } from '@settings/lib/settings/settings.repository'
import SettingsDrizzleRepository from '@settings/lib/settings/settings.repository'
import type { SegmentWithConditions, SettingsWithSegment } from '@settings/lib/types'
import httpStatus from 'http-status'
import db from '@/db'
import { workspaceId } from '@/db/helpers'
import APIError from '@/errors/api.error'
import BaseService from '@/lib/core/base.service'
import DBService from '@/lib/core/db.service'

const MAX_SEGMENTS_PER_WORKSPACE = 5

export default class SegmentsService extends BaseService {
  constructor(
    readonly user: User,
    readonly assembly: AssemblyClient,
    private readonly segmentsRepository: SegmentsRepository,
    private readonly conditionsRepository: ConditionsRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly actionsRepository: ActionsRepository,
    private readonly segmentConfigsRepository: SegmentConfigsRepository,
  ) {
    super(user, assembly)
  }

  static new(user: User) {
    const assembly = new AssemblyClient(user.token)
    const segmentsRepository = new SegmentsDrizzleRepository(db)
    const conditionsRepository = new ConditionsDrizzleRepository(db)
    const settingsRepository = new SettingsDrizzleRepository(db)
    const actionsRepository = new ActionsDrizzleRepository(db)
    const segmentConfigsRepository = new SegmentConfigsDrizzleRepository(db)

    return new SegmentsService(
      user,
      assembly,
      segmentsRepository,
      conditionsRepository,
      settingsRepository,
      actionsRepository,
      segmentConfigsRepository,
    )
  }

  private async validateCustomField(customField: string) {
    // TODO: PR 2 — use entityType from segment config instead of hardcoded CLIENT
    const { data: customFields } = await this.assembly.listCustomFields({
      entityType: CustomFieldEntityType.CLIENT,
    })
    const validKeys = customFields.map((cf) => cf.key)

    if (!validKeys.includes(customField)) {
      throw new APIError(
        `Invalid customField "${customField}". Must be one of: ${validKeys.join(', ')}`,
        httpStatus.UNPROCESSABLE_ENTITY,
      )
    }
  }

  async getAll(): Promise<FormattedSegmentData[]> {
    const allSettings = await this.settingsRepository.getSegments(this.user.workspaceId)
    return this.formatSegmentData(allSettings)
  }

  async update(segmentId: string, payload: SegmentUpdateDto) {
    const { name, conditions: conditionPayloads } = payload

    if (conditionPayloads) {
      const existingSegments = await this.segmentsRepository.getAll(this.user.workspaceId)
      this.validateUniqueCompareValues(
        existingSegments,
        conditionPayloads.map((c) => c.compareValue),
        segmentId,
      )
    }

    return await DBService.transaction(async (tx) => {
      this.segmentsRepository.setTx(tx)
      this.conditionsRepository.setTx(tx)

      try {
        if (name) {
          await this.segmentsRepository.updateOne(segmentId, { name })
        }

        if (conditionPayloads) {
          await this.conditionsRepository.deleteBySegmentId(segmentId)
          await this.conditionsRepository.createMany(segmentId, conditionPayloads)
        }

        const updated = await this.segmentsRepository.getOne(segmentId)

        if (!updated) {
          throw new APIError('Segment not found', httpStatus.NOT_FOUND)
        }

        return updated
      } finally {
        this.segmentsRepository.unsetTx()
        this.conditionsRepository.unsetTx()
      }
    })
  }

  async delete(segmentId: string) {
    const deleted = await this.segmentsRepository.delete(segmentId)

    // If this was the last segment in the workspace, clean up the config
    const remainingSegments = await this.segmentsRepository.getAll(this.user.workspaceId)
    if (remainingSegments.length === 0) {
      await this.segmentConfigsRepository.deleteByWorkspaceId(this.user.workspaceId)
    }

    return deleted
  }

  static resolveSettingForClient({
    client,
    allSettings,
    customField,
  }: {
    client: ClientResponse
    allSettings: SettingsWithSegment[]
    customField: string | undefined
  }): SettingsWithSegment | null {
    if (!customField) return allSettings.at(0) ?? null

    const settings =
      allSettings.find((setting) => {
        if (!setting.segment) {
          return false
        }
        const segment = setting.segment
        const fieldValue = client.customFields?.[customField]
        if (fieldValue == null) return false

        const compareValues = segment.conditions.map((c) => c.compareValue)

        // Array: check if any element matches a compareValue
        if (Array.isArray(fieldValue)) {
          return fieldValue.some((v) => compareValues.includes(String(v)))
        }

        // Object: check if any value in the object matches a compareValue
        if (typeof fieldValue === 'object') {
          return Object.values(fieldValue).some((v) => compareValues.includes(String(v)))
        }

        // String / Number: direct comparison
        return compareValues.includes(String(fieldValue))
      }) || allSettings.at(0)

    return settings ?? null
  }

  async getStats(): Promise<SegmentStatsResponseDto> {
    const [allSettings, clientsResponse, segmentConfig] = await Promise.all([
      this.settingsRepository.getSegments(this.user.workspaceId),
      this.assembly.getClients({ limit: MAX_FETCH_ASSEMBLY_RESOURCES }),
      this.segmentConfigsRepository.getByWorkspaceId(this.user.workspaceId),
    ])

    const clients = clientsResponse.data ?? []
    const customField = segmentConfig?.customField

    const segmentStats = clients.reduce(
      (stats, client) => {
        const settings = SegmentsService.resolveSettingForClient({ client, allSettings, customField })

        if (!settings) {
          // this should not be happening at all. capture error
          console.error(
            `Some of the clients did match even the default segment for some reason: workspace id "{${workspaceId}, clientId "${client.id}"`,
          )
          return stats
        }
        stats[settings.id] = (stats[settings.id] ?? 0) + 1

        return stats
      },
      {} as Record<string, number>,
    )

    return {
      totalClients: clients.length,
      segmentConfig: segmentConfig
        ? {
            id: segmentConfig.id,
            workspaceId: segmentConfig.workspaceId,
            customField: segmentConfig.customField,
            customFieldId: segmentConfig.customFieldId,
            entityType: segmentConfig.entityType,
          }
        : null,
      segments: this.formatSegmentData(allSettings).map<SegmentStatsSettings>((settings) => {
        return {
          ...settings,
          clientsCount: segmentStats[settings.settingId],
        }
      }),
    }
  }

  formatSegmentData(allSettings: SettingsWithSegment[]): FormattedSegmentData[] {
    const defaultSetting = allSettings.find((setting) => !setting.segment)
    if (!defaultSetting) {
      console.error('No setting found while formatting segment.')
      return []
    }
    const segmentSettings = allSettings.flatMap((setting) => {
      if (!setting.segment) {
        return []
      }

      return [setting as typeof setting & { segment: SegmentWithConditions }]
    })

    const segmentData = segmentSettings.map<FormattedSegmentData>((settings, index) => {
      const segment = settings.segment
      return {
        id: segment?.id,
        workspaceId: segment.workspaceId,
        settingId: settings.id,
        name: segment.name || 'Default',
        color: CATEGORICAL_COLORS[index] || '#dfe1e4',
        conditions: segment.conditions.map((condition) => {
          return {
            id: condition.id,
            compareValue: condition.compareValue,
          }
        }),
      }
    })

    return [
      {
        settingId: defaultSetting.id,
        workspaceId: defaultSetting.workspaceId,
        name: 'Default',
        color: '#dfe1e4',
        conditions: [],
      },
      ...segmentData,
    ]
  }

  async create(payload: SegmentCreateDto) {
    const { internalUserId } = this.user
    if (!internalUserId) {
      throw new APIError('Only internal users can create segments', httpStatus.FORBIDDEN)
    }

    const { conditions: conditionPayloads, ...segmentPayload } = payload

    const existingSegments = await this.segmentsRepository.getAll(this.user.workspaceId)
    if (existingSegments.length >= MAX_SEGMENTS_PER_WORKSPACE) {
      throw new APIError(
        `A workspace cannot have more than ${MAX_SEGMENTS_PER_WORKSPACE} segments`,
        httpStatus.UNPROCESSABLE_ENTITY,
      )
    }

    // TODO: PR 2 — validate against segment config's entityType
    await this.validateCustomField(segmentPayload.customField)
    this.validateUniqueCompareValues(
      existingSegments,
      conditionPayloads.map((c) => c.compareValue),
    )

    return await DBService.transaction(async (tx) => {
      this.segmentsRepository.setTx(tx)
      this.conditionsRepository.setTx(tx)
      this.settingsRepository.setTx(tx)
      this.actionsRepository.setTx(tx)
      this.segmentConfigsRepository.setTx(tx)

      try {
        // Create or reuse segment config for this workspace
        const existingConfig = await this.segmentConfigsRepository.getByWorkspaceId(this.user.workspaceId)
        if (!existingConfig) {
          await this.segmentConfigsRepository.create({
            workspaceId: this.user.workspaceId,
            customField: segmentPayload.customField,
            customFieldId: segmentPayload.customFieldId ?? '',
            entityType: segmentPayload.entityType ?? 'client',
          })
        }

        const segment = await this.segmentsRepository.createOne(this.user.workspaceId, internalUserId, {
          name: segmentPayload.name,
        })

        const conditions = await this.conditionsRepository.createMany(segment.id, conditionPayloads)

        await this.duplicateDefaultSettings(segment.id)

        return { ...segment, conditions }
      } finally {
        this.segmentsRepository.unsetTx()
        this.conditionsRepository.unsetTx()
        this.settingsRepository.unsetTx()
        this.actionsRepository.unsetTx()
        this.segmentConfigsRepository.unsetTx()
      }
    })
  }

  private validateUniqueCompareValues(
    existingSegments: SegmentResponseDto[],
    newCompareValues: string[],
    excludeSegmentId?: string,
  ) {
    const existingCompareValues = existingSegments
      .filter((s) => s.id !== excludeSegmentId)
      .flatMap((s) => s.conditions.map((c) => c.compareValue))

    const duplicates = newCompareValues.filter((v) => existingCompareValues.includes(v))

    if (duplicates.length > 0) {
      throw new APIError(
        `Compare values must be unique across segments. Duplicates: ${duplicates.join(', ')}`,
        httpStatus.UNPROCESSABLE_ENTITY,
      )
    }
  }

  private async duplicateDefaultSettings(segmentId: string) {
    const defaultSettings = await this.settingsRepository.getDefault(this.user.workspaceId)
    if (!defaultSettings) return

    const segmentSettings = await this.settingsRepository.createForSegment(this.user.workspaceId, {
      segmentId,
      subheading: defaultSettings.subheading,
      content: defaultSettings.content,
      backgroundColor: defaultSettings.backgroundColor,
      bannerImageId: defaultSettings.bannerImageId,
      bannerPositionX: defaultSettings.bannerPositionX,
      bannerPositionY: defaultSettings.bannerPositionY,
      createdById: this.user.internalUserId,
    })

    const defaultActions = await this.actionsRepository.getBySettingsId(defaultSettings.id)
    if (!defaultActions) return

    await this.actionsRepository.createForSettings(this.user.workspaceId, {
      settingsId: segmentSettings.id,
      invoices: defaultActions.invoices,
      contracts: defaultActions.contracts,
      tasks: defaultActions.tasks,
      forms: defaultActions.forms,
      order: defaultActions.order,
    })
  }
}
