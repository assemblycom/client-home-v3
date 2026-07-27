import z from 'zod'

export const NotificationCountsDtoSchema = z.object({
  forms: z.number(),
  invoices: z.number(),
  contracts: z.number(),
  tasks: z.number(),
  // Per-app unread notification counts keyed by appId. Apps with zero unread
  // notifications are absent from the map.
  apps: z.record(z.string(), z.number()),
})
export type NotificationCountsDto = z.infer<typeof NotificationCountsDtoSchema>

export type NotificationCountKey = keyof Omit<NotificationCountsDto, 'apps'>
