import { ActionDefinitions } from '@editor/components/Sidebar/Actions/constant'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useMemo } from 'react'

export function useEnabledActions() {
  const actions = useSettingsStore((s) => s.actions)

  const enabledActions = useMemo(() => {
    // TODO:- remove type casting once files has been added in settings table
    return Object.values(ActionDefinitions).filter(
      (definition) => !!actions[definition.key as unknown as keyof typeof actions],
    )
  }, [actions])

  return { enabledActions }
}
