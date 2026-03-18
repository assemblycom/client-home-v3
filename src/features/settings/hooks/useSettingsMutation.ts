import { useEditorStore } from '@editor/stores/editorStore'
import { useViewStore } from '@editor/stores/viewStore'
import { SETTINGS_QUERY_KEY } from '@settings/constants'
import type { SettingsResponseDto, SettingsUpdateDto } from '@settings/lib/settings-actions.dto'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'
import { ROUTES } from '@/app/routes'
import { api } from '@/lib/core/axios.instance'
import { getQueryClient } from '@/lib/core/query.utils'

export const useSettingsMutation = () => {
  const activeSegmentId = useViewStore((s) => s.activeSegmentId)

  const editor = useEditorStore((s) => s.editor)
  const setSettings = useSettingsStore((s) => s.setSettings)
  const setInitialSettings = useSettingsStore((s) => s.setInitialSettings)

  const mutationCounter = useRef(0) //used to ignore stale mutations

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: SettingsUpdateDto) => {
      const params = new URLSearchParams()
      if (activeSegmentId) params.set('segmentId', activeSegmentId)

      return api
        .patch<{ data: SettingsResponseDto }>(`${ROUTES.api.settings}/?${params}`, settings)
        .then((res) => res.data)
    },
    onMutate: (variables) => {
      const id = ++mutationCounter.current
      setSettings(variables as Partial<SettingsResponseDto>)
      return { id }
    },
    onSuccess: (data, _variables, context) => {
      if (context?.id !== mutationCounter.current) return

      const queryClient = getQueryClient()
      queryClient.setQueryData([SETTINGS_QUERY_KEY, activeSegmentId ?? null], data.data)

      editor?.commands.setContent(data.data.content)
      setSettings({ ...data.data })
      setInitialSettings({ ...data.data })
    },
  })

  return updateSettingsMutation
}
