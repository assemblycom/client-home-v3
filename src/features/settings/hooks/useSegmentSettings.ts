'use client'

import { useEditorStore } from '@editor/stores/editorStore'
import { useViewStore } from '@editor/stores/viewStore'
import { SETTINGS_QUERY_KEY } from '@settings/constants'
import type { SettingsResponseDto } from '@settings/lib/settings-actions.dto'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { ROUTES } from '@/app/routes'
import { api } from '@/lib/core/axios.instance'

export const useSegmentSettings = () => {
  const activeSegmentId = useViewStore((s) => s.activeSegmentId)
  const setSettings = useSettingsStore((s) => s.setSettings)
  const setInitialSettings = useSettingsStore((s) => s.setInitialSettings)
  const editor = useEditorStore((s) => s.editor)
  const editorRef = useRef(editor)
  editorRef.current = editor

  const { data } = useQuery({
    queryKey: [SETTINGS_QUERY_KEY, activeSegmentId ?? null],
    queryFn: async (): Promise<SettingsResponseDto> => {
      const params = new URLSearchParams()
      if (activeSegmentId) params.set('segmentId', activeSegmentId)

      const res = await api.get<{ data: SettingsResponseDto }>(`${ROUTES.api.settings}/?${params}`)
      return res.data.data
    },
    gcTime: 0,
  })

  useEffect(() => {
    if (!data) return

    const expectedSegmentId = activeSegmentId ?? null
    if (data.segmentId !== expectedSegmentId) return

    setSettings({ ...data })
    editorRef.current?.commands.setContent(data.content)

    // After TipTap normalizes the content, use the normalized version as the
    // baseline so switching segments doesn't trigger false change detection.
    const normalizedContent = editorRef.current?.getHTML() ?? data.content
    setInitialSettings({ ...data, content: normalizedContent })
  }, [activeSegmentId, data, setSettings, setInitialSettings])
}
