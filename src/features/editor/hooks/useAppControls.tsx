import { usePrimaryCta, useSecondaryCta } from '@app-bridge/hooks'
import { useEditorStore } from '@editor/stores/editorStore'
import { useSettingsMutation } from '@settings/hooks/useSettingsMutation'
import type { SettingsUpdateDto } from '@settings/lib/settings-actions.dto'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useShallow } from 'zustand/shallow'
import { areObjKeysEqual } from '@/utils/objects'

export const useAppControls = () => {
  const editor = useEditorStore((s) => s.editor)

  const updateSettingsMutation = useSettingsMutation()

  const bannerImageId = useSettingsStore((s) => s.bannerImageId)
  const backgroundColor = useSettingsStore((s) => s.backgroundColor)
  const setSettings = useSettingsStore((s) => s.setSettings)

  const content = editor?.getHTML()
  const settings: SettingsUpdateDto = { content, bannerImageId, backgroundColor }

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
    !areObjKeysEqual(settings, initialSettings, ['content', 'bannerImageId', 'backgroundColor']) ||
    !areObjKeysEqual(actions, initialSettings.actions, ['tasks', 'invoices', 'messages', 'contracts', 'forms'])

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
