'use client'

import { TabBtn } from '@editor/components/TopBar/TabBtn'
import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { useEffect, useMemo } from 'react'
import { debounce } from '@/utils/debounce'

export const TopBar = () => {
  const { viewMode, changeView } = useViewStore()

  const debouncedChangeView = useMemo(
    () => debounce((view: ViewMode) => changeView({ viewMode: view }), 150),
    [changeView],
  )

  useEffect(() => {
    return () => {
      debouncedChangeView.cancel()
    }
  }, [debouncedChangeView])

  const changeViewMode = (view: ViewMode) => {
    debouncedChangeView(view)
  }

  return (
    <nav className="flex min-h-8 cursor-default items-center justify-between border-border-gray border-b px-5 py-3">
      <div className="flex items-center gap-2 rounded-sm p-1 outline outline-border-gray">
        <TabBtn
          label="Editor"
          active={viewMode === ViewMode.EDITOR}
          handleClick={() => changeViewMode(ViewMode.EDITOR)}
        />
        <TabBtn
          label="Preview"
          active={viewMode === ViewMode.PREVIEW}
          handleClick={() => changeViewMode(ViewMode.PREVIEW)}
        />
      </div>
    </nav>
  )
}
