import AssemblyClient from '@assembly/assembly-client'
import { CustomFieldEntityType } from '@assembly/types'
import type { User } from '@auth/lib/user.entity'
import type { ConditionsRepository } from '@segments/lib/conditions/conditions.repository'
import ConditionsDrizzleRepository from '@segments/lib/conditions/conditions.repository'
import type { SegmentsRepository } from '@segments/lib/segments/segments.repository'
import SegmentsDrizzleRepository from '@segments/lib/segments/segments.repository'
import type { SegmentCreateDto } from '@segments/lib/segments.dto'
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
