import { ActionDefinitions } from '@editor/components/Sidebar/Actions/constant'
import { useSettingsStore } from '@settings/providers/settings.provider'

export const useActions = () => {
  const actions = useSettingsStore((s) => s.actions)
  const setActions = useSettingsStore((s) => s.setActions)

  const actionItems = Object.values(ActionDefinitions).map((item) => {
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
