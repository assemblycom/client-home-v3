import { usePrimaryCta, useSecondaryCta } from '@app-bridge/hooks'
import { useEditorStore } from '@editor/stores/editorStore'
import { useSettings } from '@settings/hooks/useSettings'

export const useAppBridge = () => {
  const editor = useEditorStore((s) => s.editor)
  // const { updateSettingsMutation } = useSettings()

  useSecondaryCta({
    label: 'Cancel',
    onClick: () => {
      // Implement later when we do API implementation
      console.info('Cancel')
    },
  })

  usePrimaryCta({
    label: 'Save Changes',
    onClick: () => {
      const content = editor?.getHTML()
      if (!content) {
        console.error('Could not parse content from editor')
        return
      }
      // updateSettingsMutation.mutate({ content })
    },
  })
}
