import { ActionDefinitions } from '@editor/components/Sidebar/Actions/constant'
import { useInstalledApps } from '@installed-apps/hooks/useInstalledApps'
import { isDynamicAction, type RenderableAction, toDynamicActionDefinition } from '@installed-apps/lib/dynamic-action'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useMemo } from 'react'

// Built-in rows are keyed by ActionKey, dynamic rows by appId — both live in the same
// `order` array, so ordering uses whichever identifies the row.
const orderKeyOf = (action: RenderableAction): string => (isDynamicAction(action) ? action.appId : action.key)

export function useEnabledActions() {
  const actions = useSettingsStore((s) => s.actions)
  const { installedApps } = useInstalledApps()

  const enabledActions = useMemo<RenderableAction[]>(() => {
    const order = actions.order ?? []
    // TODO:- remove type casting once files has been added in settings table
    const builtInActions = Object.values(ActionDefinitions).filter(
      (definition) => !!actions[definition.key as unknown as keyof typeof actions],
    )

    // Deny-list by appId; absence means shown. Stale entries are inert.
    const hiddenAppIds = actions.hiddenAppIds ?? []
    const dynamicActions = installedApps
      .filter((install) => !hiddenAppIds.includes(install.appId))
      .map(toDynamicActionDefinition)

    // Built-ins and dynamic Studio-app rows share one drag-orderable sequence.
    return [...builtInActions, ...dynamicActions].sort((a, b) => {
      const aIndex = order.indexOf(orderKeyOf(a))
      const bIndex = order.indexOf(orderKeyOf(b))
      return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex)
    })
  }, [actions, installedApps])

  return { enabledActions }
}
