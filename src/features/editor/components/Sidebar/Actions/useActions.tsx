import type { IconType } from '@assembly-js/design-system'
import { ActionDefinitions } from '@editor/components/Sidebar/Actions/constant'
import { useInstalledApps } from '@installed-apps/hooks/useInstalledApps'
import { isIconType } from '@installed-apps/lib/icon-names'
import { useSettingsStore } from '@settings/providers/settings.provider'

// Stands in when an install's `icon` is absent or not a design-system IconType.
const FALLBACK_ICON: IconType = 'CustomApps'

export const useActions = () => {
  const actions = useSettingsStore((s) => s.actions)
  const setActions = useSettingsStore((s) => s.setActions)
  const { installedApps } = useInstalledApps()

  const order = actions?.order ?? []

  const actionItems = Object.values(ActionDefinitions)
    .sort((a, b) => {
      const aIndex = order.indexOf(a.key)
      const bIndex = order.indexOf(b.key)
      return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex)
    })
    .map((item) => {
      return {
        key: item.key,
        label: item.label,
        icon: item.icon,
        checked: actions?.[item.key] ?? false,
        onChange: () => {
          setActions({ [item.key]: !actions[item.key] })
        },
      }
    })

  // Studio-app toggles: listed after built-ins, keyed by appId, and excluded from
  // drag-reorder for v1. Deny-list semantics — checked = not hidden (default on).
  const hiddenAppIds = actions?.hiddenAppIds ?? []
  const appItems = installedApps.map((install) => ({
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

  const onReorder = (newOrder: string[]) => {
    setActions({ order: newOrder })
  }

  return { actionItems, appItems, onReorder }
}
