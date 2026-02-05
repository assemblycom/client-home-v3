import AssemblyClient from '@assembly/assembly-client'
import type { User } from '@auth/lib/user.entity'
import type { NotificationCountsDto } from '@notification-counts/notification-counts.dto'
import { NotificationEvent } from '@notification-counts/types'
import { HttpStatusCode } from 'axios'
import APIError from '@/errors/api.error'
import BaseService from '@/lib/core/base.service'

export default class NotificationsCountService extends BaseService {
  private readonly eventMap: Partial<Record<NotificationEvent, keyof NotificationCountsDto>> = Object.freeze({
    [NotificationEvent.FORMS]: 'forms',
    [NotificationEvent.INVOICES]: 'invoices',
    [NotificationEvent.CONTRACTS]: 'contracts',
  } as const)

  constructor(
    readonly user: User,
    readonly assembly: AssemblyClient,
  ) {
    super(user, assembly)
  }

  static new(user: User) {
    const assembly = new AssemblyClient(user.token)
    return new NotificationsCountService(user, assembly)
  }

  async getNotificationCountsForClient(recipientClientId: string): Promise<NotificationCountsDto> {
    const notifications = await this.assembly.getNotifications({ recipientClientId })
    if (!notifications || !notifications.data)
      throw new APIError('Could not fetch notifications list from assembly', HttpStatusCode.InternalServerError)

    const notificationCounts: NotificationCountsDto = {
      forms: 0,
      invoices: 0,
      contracts: 0,
      tasks: 0,
      messages: 0,
    }

    this.eventMap['forms' as NotificationEvent] = 'invoices'

    notifications.data.forEach(({ event }) => {
      const key = this.eventMap[event as NotificationEvent]
      if (key) notificationCounts[key]++
    })

    return notificationCounts
  }
}
