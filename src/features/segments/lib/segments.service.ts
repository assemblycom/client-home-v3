import AssemblyClient from '@assembly/assembly-client'
import { CustomFieldEntityType } from '@assembly/types'
import type { User } from '@auth/lib/user.entity'
import type { ConditionsRepository } from '@segments/lib/conditions/conditions.repository'
import ConditionsDrizzleRepository from '@segments/lib/conditions/conditions.repository'
import type { SegmentsRepository } from '@segments/lib/segments/segments.repository'
import SegmentsDrizzleRepository from '@segments/lib/segments/segments.repository'
import type { SegmentCreateDto, SegmentUpdateDto } from '@segments/lib/segments.dto'
import httpStatus from 'http-status'
import db from '@/db'
import APIError from '@/errors/api.error'
import BaseService from '@/lib/core/base.service'
import DBService from '@/lib/core/db.service'

export default class SegmentsService extends BaseService {
  constructor(
    readonly user: User,
    readonly assembly: AssemblyClient,
    private readonly segmentsRepository: SegmentsRepository,
    private readonly conditionsRepository: ConditionsRepository,
  ) {
    super(user, assembly)
  }

  static new(user: User) {
    const assembly = new AssemblyClient(user.token)
    const segmentsRepository = new SegmentsDrizzleRepository(db)
    const conditionsRepository = new ConditionsDrizzleRepository(db)

    return new SegmentsService(user, assembly, segmentsRepository, conditionsRepository)
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

  async create(payload: SegmentCreateDto) {
    const { internalUserId } = this.user
    if (!internalUserId) {
      throw new APIError('Only internal users can create segments', httpStatus.FORBIDDEN)
    }

    const { conditions: conditionPayloads, ...segmentPayload } = payload

    await this.validateCustomField(segmentPayload.customField)

    return await DBService.transaction(async (tx) => {
      this.segmentsRepository.setTx(tx)
      this.conditionsRepository.setTx(tx)

      try {
        const segment = await this.segmentsRepository.createOne(this.user.workspaceId, internalUserId, segmentPayload)

        const conditions = await this.conditionsRepository.createMany(segment.id, conditionPayloads)

        return { ...segment, conditions }
      } finally {
        this.segmentsRepository.unsetTx()
        this.conditionsRepository.unsetTx()
      }
    })
  }
}
