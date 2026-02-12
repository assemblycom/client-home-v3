import { usePrimaryCta, useSecondaryCta } from '@app-bridge/hooks'
import { useSettingsMutation } from '@settings/hooks/useSettingsMutation'
import type { SettingsUpdateDto } from '@settings/lib/settings-actions.dto'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useShallow } from 'zustand/shallow'
import { areObjKeysEqual } from '@/utils/objects'

export const useAppControls = () => {
  const updateSettingsMutation = useSettingsMutation()

  const subheading = useSettingsStore((s) => s.subheading)
  const bannerImageId = useSettingsStore((s) => s.bannerImageId)
  const backgroundColor = useSettingsStore((s) => s.backgroundColor)
  const setSettings = useSettingsStore((s) => s.setSettings)

  const content = useSettingsStore((s) => s.content)
  const hasChanged = useSettingsStore((s) => s.hasChanged)
  const settings: SettingsUpdateDto = {
    content,
    subheading,
    bannerImageId,
    backgroundColor,
  }

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
  const show =
    !areObjKeysEqual(settings, initialSettings, ['content', 'subheading', 'bannerImageId', 'backgroundColor']) ||
    !areObjKeysEqual(actions, initialSettings.actions, ['tasks', 'invoices', 'messages', 'contracts', 'forms']) ||
    hasChanged

  useSecondaryCta(
    {
      label: 'Cancel',
      onClick: () => setSettings({ ...initialSettings }),
    },
    { show },
  )

  usePrimaryCta(
    {
      label: 'Save Changes',
      onClick: () => updateSettingsMutation.mutate({ ...settings, actions }),
    },
    { show },
  )
}
