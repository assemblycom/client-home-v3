'use client'

import { ClientSelector } from '@editor/components/TopBar/ClientSelector'
import { DisplayModeTab } from '@editor/components/TopBar/DisplayModeTab'
import { TabBtn } from '@editor/components/TopBar/TabBtn'
import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { Activity, useEffect, useEffectEvent, useMemo } from 'react'
import { getActivityMode } from '@/utils/activity'
import { debounce } from '@/utils/debounce'

export const TopBar = () => {
  const viewMode = useViewStore((store) => store.viewMode)
  const changeView = useViewStore((store) => store.changeView)
  const changeViewInStore = useEffectEvent((viewMode: ViewMode) => changeView({ viewMode }))
  const changeViewModeDebounced = useMemo(() => debounce((view: ViewMode) => changeViewInStore(view), 100), [])

  useEffect(() => {
    return () => {
      changeViewModeDebounced.cancel()
    }
  }, [changeViewModeDebounced])

  return (
    <nav className="flex min-h-8 w-full shrink-0 cursor-default items-center justify-between border-border-gray border-b px-5 py-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-sm p-1 outline outline-border-gray">
          <TabBtn
            label="Editor"
            active={viewMode === ViewMode.EDITOR}
            handleClick={() => changeViewModeDebounced(ViewMode.EDITOR)}
          />
          <TabBtn
            label="Preview"
            active={viewMode === ViewMode.PREVIEW}
            handleClick={() => changeViewModeDebounced(ViewMode.PREVIEW)}
          />
        </div>
        <Activity mode={getActivityMode(viewMode === ViewMode.PREVIEW)}>
          <div className="h-5 w-px bg-border-gray" />
          <ClientSelector />
        </Activity>
      </div>

      <div>{viewMode === ViewMode.PREVIEW && <DisplayModeTab />}</div>
    </nav>
  )
}
