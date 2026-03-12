import AssemblyClient from '@assembly/assembly-client'
import { MAX_FETCH_ASSEMBLY_RESOURCES } from '@assembly/constants'
import type { ClientResponse } from '@assembly/types'
import { CustomFieldEntityType } from '@assembly/types'
import type { User } from '@auth/lib/user.entity'
import type { ConditionsRepository } from '@segments/lib/conditions/conditions.repository'
import ConditionsDrizzleRepository from '@segments/lib/conditions/conditions.repository'
import type { SegmentsRepository } from '@segments/lib/segments/segments.repository'
import SegmentsDrizzleRepository from '@segments/lib/segments/segments.repository'
import { allocateSegmentColors } from '@segments/lib/segments.colors'
import type {
  SegmentCreateDto,
  SegmentResponseDto,
  SegmentStatsResponseDto,
  SegmentUpdateDto,
} from '@segments/lib/segments.dto'
import type { ActionsRepository } from '@settings/lib/actions/actions.repository'
import ActionsDrizzleRepository from '@settings/lib/actions/actions.repository'
import type { SettingsRepository } from '@settings/lib/settings/settings.repository'
import SettingsDrizzleRepository from '@settings/lib/settings/settings.repository'
import httpStatus from 'http-status'
import db from '@/db'
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
  ) {
    super(user, assembly)
  }

  static new(user: User) {
    const assembly = new AssemblyClient(user.token)
    const segmentsRepository = new SegmentsDrizzleRepository(db)
    const conditionsRepository = new ConditionsDrizzleRepository(db)
    const settingsRepository = new SettingsDrizzleRepository(db)
    const actionsRepository = new ActionsDrizzleRepository(db)

    return new SegmentsService(
      user,
      assembly,
      segmentsRepository,
      conditionsRepository,
      settingsRepository,
      actionsRepository,
    )
  }

  private async validateCustomField(customField: string) {
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

  async getAll() {
    return await this.segmentsRepository.getAll(this.user.workspaceId)
  }

  async update(segmentId: string, payload: SegmentUpdateDto) {
    const { name, conditions: conditionPayloads } = payload

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
    return await this.segmentsRepository.softDelete(segmentId)
  }

  static clientBelongsToSegment(client: ClientResponse, segment: SegmentResponseDto): boolean {
    const fieldValue = client.customFields?.[segment.customField]
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
  }

  async getStats(): Promise<SegmentStatsResponseDto> {
    const [segments, clientsResponse] = await Promise.all([
      this.segmentsRepository.getAll(this.user.workspaceId),
      this.assembly.getClients({ limit: MAX_FETCH_ASSEMBLY_RESOURCES }),
    ])

    const clients = clientsResponse.data ?? []
    const colors = allocateSegmentColors(segments.length)

    const segmentStats = segments.map((segment, index) => {
      const count = clients.filter((client) => SegmentsService.clientBelongsToSegment(client, segment)).length

      return {
        name: segment.name,
        color: colors[index],
        count,
      }
    })

    const segmentedCount = segmentStats.reduce((sum, s) => sum + s.count, 0)

    const stats = [{ name: 'Default', color: '#E5E7EB', count: clients.length - segmentedCount }, ...segmentStats]

    return {
      totalClients: clients.length,
      stats,
    }
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

    await this.validateCustomField(segmentPayload.customField)

    return await DBService.transaction(async (tx) => {
      this.segmentsRepository.setTx(tx)
      this.conditionsRepository.setTx(tx)
      this.settingsRepository.setTx(tx)
      this.actionsRepository.setTx(tx)

      try {
        const segment = await this.segmentsRepository.createOne(this.user.workspaceId, internalUserId, segmentPayload)

        const conditions = await this.conditionsRepository.createMany(segment.id, conditionPayloads)

        await this.duplicateDefaultSettings(segment.id)

        return { ...segment, conditions }
      } finally {
        this.segmentsRepository.unsetTx()
        this.conditionsRepository.unsetTx()
        this.settingsRepository.unsetTx()
        this.actionsRepository.unsetTx()
      }
    })
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
