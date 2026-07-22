import { ActionDefinitions } from '@editor/components/Sidebar/Actions/constant'
import { useInstalledApps } from '@installed-apps/hooks/useInstalledApps'
import { type RenderableAction, toDynamicActionDefinition } from '@installed-apps/lib/dynamic-action'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useMemo } from 'react'

export function useEnabledActions() {
  const actions = useSettingsStore((s) => s.actions)
  const { installedApps } = useInstalledApps()

  const enabledActions = useMemo<RenderableAction[]>(() => {
    const order = actions.order ?? []
    // TODO:- remove type casting once files has been added in settings table
    const builtInActions = Object.values(ActionDefinitions)
      .filter((definition) => !!actions[definition.key as unknown as keyof typeof actions])
      .sort((a, b) => {
        const aIndex = order.indexOf(a.key)
        const bIndex = order.indexOf(b.key)
        return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex)
      })

    // Deny-list by appId; absence means shown. Stale entries are inert.
    const hiddenAppIds = actions.hiddenAppIds ?? []
    const dynamicActions = installedApps
      .filter((install) => !hiddenAppIds.includes(install.appId))
      .map(toDynamicActionDefinition)

    // Dynamic Studio-app rows render after built-ins for v1 (no drag-order participation).
    return [...builtInActions, ...dynamicActions]
  }, [actions, installedApps])

  return { enabledActions }
}
