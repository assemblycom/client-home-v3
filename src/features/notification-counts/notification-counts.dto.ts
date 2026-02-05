import z from 'zod'

export const NotificationCountsDtoSchema = z.object({
  forms: z.number(),
  invoices: z.number(),
  contracts: z.number(),
  tasks: z.number(),
  messages: z.number(),
})
export type NotificationCountsDto = z.infer<typeof NotificationCountsDtoSchema>
