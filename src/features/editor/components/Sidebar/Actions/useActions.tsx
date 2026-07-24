import type { IconType } from '@assembly-js/design-system'
import { ActionDefinitions } from '@editor/components/Sidebar/Actions/constant'
import { useInstalledApps } from '@installed-apps/hooks/useInstalledApps'
import { isIconType } from '@installed-apps/lib/icon-names'
import { useSettingsStore } from '@settings/providers/settings.provider'

// Stands in when an install's `icon` is absent or not a design-system IconType.
const FALLBACK_ICON: IconType = 'CustomApps'

type ActionToggleItem = {
  key: string
  label: string
  icon: IconType
  checked: boolean
  onChange: () => void
}

export const useActions = () => {
  const actions = useSettingsStore((s) => s.actions)
  const setActions = useSettingsStore((s) => s.setActions)
  const { installedApps } = useInstalledApps()

  const order = actions?.order ?? []
  const hiddenAppIds = actions?.hiddenAppIds ?? []

  // Built-in actions are keyed by their ActionKey and toggled via named boolean fields.
  const builtInItems: ActionToggleItem[] = Object.values(ActionDefinitions).map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    checked: actions?.[item.key] ?? false,
    onChange: () => {
      setActions({ [item.key]: !actions[item.key] })
    },
  }))

  // Dynamic Studio-app actions are keyed by appId and toggled via the hiddenAppIds
  // deny-list (checked = not hidden = shown; default on). Tasks is filtered out
  // server-side so it never collides with the built-in Tasks row.
  const appItems: ActionToggleItem[] = installedApps.map((install) => ({
    key: install.appId,
    label: install.displayName,
    icon: isIconType(install.icon) ? install.icon : FALLBACK_ICON,
    checked: !hiddenAppIds.includes(install.appId),
    onChange: () => {
      const nextHidden = hiddenAppIds.includes(install.appId)
        ? hiddenAppIds.filter((id) => id !== install.appId)
        : [...hiddenAppIds, install.appId]
      setActions({ hiddenAppIds: nextHidden })
    },
  }))

  // Built-ins and Studio apps share a single drag-orderable list. `order` holds a mix
  // of ActionKeys and appIds; items absent from it (e.g. a freshly installed app) fall
  // to the end until the user positions them.
  const actionItems = [...builtInItems, ...appItems].sort((a, b) => {
    const aIndex = order.indexOf(a.key)
    const bIndex = order.indexOf(b.key)
    return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex)
  })

  const onReorder = (newOrder: string[]) => {
    setActions({ order: newOrder })
  }

  return { actionItems, onReorder }
}
