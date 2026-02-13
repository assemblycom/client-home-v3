import { ActionDefinitions } from '@editor/components/Sidebar/Actions/constant'
import { useSettingsStore } from '@settings/providers/settings.provider'

export const useActions = () => {
  const actions = useSettingsStore((s) => s.actions)
  const setActions = useSettingsStore((s) => s.setActions)

  const order = actions?.order ?? []

  const actionItems = Object.values(ActionDefinitions)
    .sort((a, b) => {
      const aIndex = order.indexOf(a.key)
      const bIndex = order.indexOf(b.key)
      return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex)
    })
    .map((item) => {
      return {
        label: item.label,
        icon: item.icon,
        checked: actions?.[item.key] ?? false,
        onChange: () => {
          setActions({ [item.key]: !actions[item.key] })
        },
      }
    })

  return { actionItems }
}
