import type { ActionItemIcon, ActionItemLabelType } from '@editor/components/Sidebar/Actions/type'
import type { SettingsUpdateDto } from '@settings/lib/settings-actions.dto'
import type { TemplateString } from '@/features/handlebar-template/types/hande-bar-template.type'

export const ActionItemLabel = Object.freeze({
  INVOICE: 'Invoice',
  MESSAGE: 'Message',
  CONTRACT: 'Contract',
  TASKS: 'Tasks',
  FORMS: 'Forms',
})

/** TODO: fix for files */
type ActionKey = keyof NonNullable<SettingsUpdateDto['actions']>

export type ActionDefinition = {
  label: string
  icon: ActionItemIcon
  template: TemplateString
  key: ActionKey
  singularLabel?: string
  appUrlPath: string
}

export const ActionDefinitions = Object.freeze({
  [ActionItemLabel.INVOICE]: {
    label: 'Invoices',
    singularLabel: 'Invoice',
    icon: 'Billing',
    template: `{{invoices.count}}`,
    key: 'invoices',
    appUrlPath: 'invoices',
  },
  [ActionItemLabel.MESSAGE]: {
    label: 'Messages',
    singularLabel: 'Message',
    icon: 'Message',
    template: `{{messages.count}}`,
    key: 'messages',
    appUrlPath: 'messaging',
  },
  [ActionItemLabel.CONTRACT]: {
    label: 'Contracts',
    icon: 'Contract',
    singularLabel: 'Contract',
    template: `{{contracts.count}}`,
    key: 'contracts',
    appUrlPath: 'contracts',
  },
  [ActionItemLabel.TASKS]: {
    label: 'Tasks',
    singularLabel: 'Task',
    icon: 'Tasks',
    template: `{{tasks.count}}`,
    key: 'tasks',
    appUrlPath: 'apps?id=619c8d0f-3ff1-4507-b696-5e5c0d73a19d',
  },
  [ActionItemLabel.FORMS]: {
    label: 'Forms',
    singularLabel: 'Form',
    icon: 'Form',
    template: `{{forms.count}}`,
    key: 'forms',
    appUrlPath: 'forms',
  },
} satisfies Record<ActionItemLabelType, ActionDefinition>)
