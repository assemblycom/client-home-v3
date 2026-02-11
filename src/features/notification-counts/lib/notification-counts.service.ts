import AssemblyClient from '@assembly/assembly-client'
import type { User } from '@auth/lib/user.entity'
import type { NotificationCountsDto } from '@notification-counts/notification-counts.dto'
import { NotificationEvent } from '@notification-counts/types'
import { HttpStatusCode } from 'axios'
import APIError from '@/errors/api.error'
import BaseService from '@/lib/core/base.service'

export default class NotificationsCountService extends BaseService {
  private readonly eventMap = Object.freeze({
    [NotificationEvent.FORMS]: 'forms',
    [NotificationEvent.INVOICES]: 'invoices',
    [NotificationEvent.CONTRACTS]: 'contracts',
  } as const satisfies Partial<Record<NotificationEvent, keyof NotificationCountsDto>>)

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

  async getNotificationCountsForClient(
    recipientClientId: string,
    recipientCompanyId: string | null,
  ): Promise<NotificationCountsDto> {
    const [notifications, todoTasks, inProgressTasks] = await Promise.all([
      this.assembly.getNotifications({ recipientClientId }),
      this.assembly.getTasks({
        clientId: recipientClientId,
        companyId: recipientCompanyId || undefined,
        status: 'todo',
      }),
      this.assembly.getTasks({
        clientId: recipientClientId,
        companyId: recipientCompanyId || undefined,
        status: 'inProgress',
      }),
    ])
    if (!notifications || !notifications.data)
      throw new APIError('Could not fetch notifications list from assembly', HttpStatusCode.InternalServerError)

    const notificationCounts: NotificationCountsDto = {
      forms: 0,
      invoices: 0,
      contracts: 0,
      tasks: todoTasks.data.length + inProgressTasks.data.length,
      messages: 0,
    }

    notifications.data.forEach(({ event, recipientCompanyId: notificationRecipientCompanyId }) => {
      if (recipientCompanyId && notificationRecipientCompanyId !== recipientCompanyId) return

      const key = this.eventMap[event as NotificationEvent]
      if (key) notificationCounts[key]++
    })

    return notificationCounts
  }
}
