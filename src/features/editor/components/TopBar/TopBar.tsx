'use client'

import { DisplayModeTab } from '@editor/components/TopBar/DisplayModeTab'
import { TabBtn } from '@editor/components/TopBar/TabBtn'
import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { useEffect, useEffectEvent, useMemo } from 'react'
import { debounce } from '@/utils/debounce'

export const TopBar = () => {
  const viewMode = useViewStore((store) => store.viewMode)
  const changeView = useViewStore((store) => store.changeView)

  const changeViewInStore = useEffectEvent((viewMode: ViewMode) => changeView({ viewMode }))

  const debouncedChangeView = useMemo(() => debounce((view: ViewMode) => changeViewInStore(view), 250), [])

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
      <div>{viewMode === ViewMode.PREVIEW && <DisplayModeTab />}</div>
    </nav>
  )
}
