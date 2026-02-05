export enum NotificationEvent {
  FORMS = 'formResponse.requested',
  INVOICES = 'invoice.requested',
  CONTRACTS = 'contract.requested',
}
export type NotificationCounts = Record<NotificationEvent, number>
