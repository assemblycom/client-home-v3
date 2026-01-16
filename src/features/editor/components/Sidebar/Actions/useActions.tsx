import { ActionItemLabel } from '@editor/components/Sidebar/Actions/constant'
import type { ActionItemIcon, ActionItemLabelType } from '@editor/components/Sidebar/Actions/type'
import type { SettingsUpdateDto } from '@settings/lib/settings-actions.dto'
import { useSettingsStore } from '@settings/providers/settings.provider'

export const actionIcons: Record<ActionItemLabelType, ActionItemIcon> = {
  [ActionItemLabel.INVOICE]: 'Billing',
  [ActionItemLabel.MESSAGE]: 'Message',
  [ActionItemLabel.CONTRACT]: 'Contract',
  [ActionItemLabel.TASKS]: 'Tasks',
  [ActionItemLabel.FORMS]: 'Form',
}

type ActionKey = keyof NonNullable<SettingsUpdateDto['actions']>

export const actionKeys: Record<ActionItemLabelType, ActionKey> = {
  [ActionItemLabel.INVOICE]: 'invoices',
  [ActionItemLabel.MESSAGE]: 'messages',
  [ActionItemLabel.CONTRACT]: 'contracts',
  [ActionItemLabel.TASKS]: 'tasks',
  [ActionItemLabel.FORMS]: 'forms',
}

export const useActions = () => {
  const actions = useSettingsStore((s) => s.actions)
  const setActions = useSettingsStore((s) => s.setActions)

  const actionItems = Object.keys(actionIcons).map((k) => ({
    label: k,
    icon: actionIcons[k as ActionItemLabelType],
    checked: actions[actionKeys[k as ActionItemLabelType]] ?? false,
    onChange: () => {
      const key = actionKeys[k as ActionItemLabelType]
      setActions({ [key]: !actions[key] })
    },
  }))

  return { actionItems }
}
