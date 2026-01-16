import { usePrimaryCta, useSecondaryCta } from '@app-bridge/hooks'
import { useSettingsMutation } from '@settings/hooks/useSettings'
import type { SettingsUpdateDto } from '@settings/lib/settings-actions.dto'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useShallow } from 'zustand/shallow'

export const useAppControls = () => {
  const updateSettingsMutation = useSettingsMutation()
  const settings: SettingsUpdateDto = useSettingsStore(
    // Ref: https://zustand.docs.pmnd.rs/hooks/use-shallow
    useShallow((s) => ({
      content: s.content,
      bannerImageId: s.bannerImageId,
      backgroundColor: s.backgroundColor,
    })),
  )
  const actions: SettingsUpdateDto['actions'] = useSettingsStore(
    useShallow((s) => ({
      tasks: s.actions.tasks,
      invoices: s.actions.invoices,
      messages: s.actions.messages,
      contracts: s.actions.contracts,
      forms: s.actions.forms,
    })),
  )
  const initialSettings = useSettingsStore((s) => s.initialSettings)
  const setSettings = useSettingsStore((s) => s.setSettings)

  useSecondaryCta({
    label: 'Cancel',
    onClick: () => setSettings({ ...initialSettings }),
  })

  usePrimaryCta({
    label: 'Save Changes',
    onClick: () => updateSettingsMutation.mutate({ ...settings, actions }),
  })
}
